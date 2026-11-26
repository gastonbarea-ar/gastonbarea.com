import React, { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Check,
  Copy,
  Download,
  Play,
  RefreshCw,
  Search,
  Send,
  Server,
  ShieldAlert,
  Sliders,
  Terminal,
} from 'lucide-react';
import {
  AgentActivityLog,
  AgentConversation,
  AutonomyMode,
  AutopilotChannel,
  AutopilotConfig,
  AutopilotOverviewMetrics,
  DEFAULT_AUTOPILOT_CONFIG,
  VipEscalationItem,
} from '../../types/autopilot';
import type { ProxmoxBlueprintBundle } from '../../services/proxmoxBlueprints';

interface AutopilotConsoleProps {
  sessionToken: string;
}

type ConsoleSubView = 'control' | 'simulator' | 'activity' | 'proxmox_n8n';

const CHANNEL_META: Array<{
  key: AutopilotChannel;
  label: string;
  scope: string;
}> = [
  {
    key: 'whatsapp',
    label: 'WhatsApp Comercial & Audios',
    scope: 'Transcribe audios, califica leads, emite cotización 40/40/20 y agenda Meet.',
  },
  {
    key: 'portal_support',
    label: 'Soporte Portal Clientes (Nivel 1)',
    scope: 'Responde avance de proyectos, sprints y tickets comunes con datos reales.',
  },
  {
    key: 'followup_n8n',
    label: 'Seguimiento Comercial n8n',
    scope: 'Follow-up 48h / 7 días de presupuestos y recordatorios anti no-show Meet.',
  },
  {
    key: 'self_healing',
    label: 'Auto-Sanación Proxmox (Uptime Kuma)',
    scope: 'Filtra microcortes y reintenta servicios antes de emitir alerta crítica.',
  },
];

const MODE_LABELS: Record<AutonomyMode, string> = {
  autonomous: 'Autónomo',
  draft_only: 'Solo Borrador',
  paused: 'Pausado',
};

function formatShortTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const AutopilotConsole: React.FC<AutopilotConsoleProps> = ({ sessionToken }) => {
  const [subView, setSubView] = useState<ConsoleSubView>('control');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [config, setConfig] = useState<AutopilotConfig>(DEFAULT_AUTOPILOT_CONFIG);
  const [metrics, setMetrics] = useState<AutopilotOverviewMetrics>({
    totalConversations: 0,
    resolvedSilentlyCount: 0,
    selfHealedAlertsCount: 0,
    openVipEscalationsCount: 0,
    openDraftsCount: 0,
    quotesIssuedAutonomously: 0,
    estimatedHoursSaved: 0,
    noiseSuppressionRate: 100,
  });
  const [escalations, setEscalations] = useState<VipEscalationItem[]>([]);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [logs, setLogs] = useState<AgentActivityLog[]>([]);
  const [pendingFollowUpsCount, setPendingFollowUpsCount] = useState<number>(0);

  // Filters for VIP Escalations & Activity
  const [vipSearch, setVipSearch] = useState<string>('');
  const [vipFilter, setVipFilter] = useState<'open' | 'all'>('open');
  const [busyEscalationId, setBusyEscalationId] = useState<string | null>(null);
  const [isSendingDigest, setIsSendingDigest] = useState<boolean>(false);

  // Live Calibration Simulator
  const [simChannel, setSimChannel] = useState<'whatsapp' | 'portal'>('whatsapp');
  const [simSenderName, setSimSenderName] = useState<string>('Martín Gómez');
  const [simMessage, setSimMessage] = useState<string>(
    'Hola, somos una empresa de logística de 28 personas y queremos implementar Odoo ERP con automatización IA. ¿Cuánto sale?'
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Proxmox & n8n Blueprints
  const [blueprints, setBlueprints] = useState<ProxmoxBlueprintBundle | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('gb_admin_token') || sessionToken;
    const passkey = localStorage.getItem('gb_master_passkey') || '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['x-admin-token'] = token;
    if (passkey) headers['x-admin-passkey'] = passkey;
    return headers;
  };

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/autopilot/overview', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config || DEFAULT_AUTOPILOT_CONFIG);
        if (data.metrics) setMetrics(data.metrics);
        setEscalations(Array.isArray(data.escalations) ? data.escalations : []);
        setConversations(Array.isArray(data.conversations) ? data.conversations : []);
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setPendingFollowUpsCount(Number(data.pendingFollowUpsCount || 0));
      } else {
        setFeedback({ ok: false, msg: data.error || 'No se pudo cargar el estado del Piloto Automático.' });
      }
    } catch (err: any) {
      setFeedback({ ok: false, msg: err?.message || 'Error de conexión al cargar Piloto Automático.' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBlueprints = async () => {
    if (blueprints) return;
    try {
      const res = await fetch('/api/admin/autopilot/blueprints', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && data.bundle) {
        setBlueprints(data.bundle);
      }
    } catch (err) {
      console.warn('Error loading blueprints:', err);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (subView === 'proxmox_n8n') {
      loadBlueprints();
    }
  }, [subView]);

  const handleChannelModeChange = async (channel: AutopilotChannel, nextMode: AutonomyMode) => {
    const nextConfig: AutopilotConfig = {
      ...config,
      channels: {
        ...config.channels,
        [channel]: nextMode,
      },
    };
    setConfig(nextConfig);
    setIsSavingConfig(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/autopilot/config', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ channels: nextConfig.channels }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        setFeedback({ ok: true, msg: `Canal actualizado a modo "${MODE_LABELS[nextMode]}".` });
      } else {
        setFeedback({ ok: false, msg: data.error || 'Error al guardar configuración.' });
      }
    } catch (err: any) {
      setFeedback({ ok: false, msg: err?.message || 'Error de red al guardar.' });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSaveGuardrails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/autopilot/config', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        setFeedback({ ok: true, msg: 'Guardrails y protocolo anti-ruido guardados en Supabase.' });
      } else {
        setFeedback({ ok: false, msg: data.error || 'No se pudieron guardar los guardrails.' });
      }
    } catch (err: any) {
      setFeedback({ ok: false, msg: err?.message || 'Error de red al guardar guardrails.' });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleEscalationAction = async (
    id: string,
    action: 'approve_send' | 'resolve' | 'dismiss'
  ) => {
    setBusyEscalationId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/autopilot/escalations/${encodeURIComponent(id)}/action`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEscalations((prev) =>
          prev.map((item) => (item.id === id ? data.escalation : item))
        );
        setFeedback({
          ok: true,
          msg:
            action === 'approve_send'
              ? 'Borrador aprobado y despachado al cliente.'
              : action === 'resolve'
                ? 'Escalación VIP marcada como resuelta.'
                : 'Registro descartado de la bandeja.',
        });
      } else {
        setFeedback({ ok: false, msg: data.error || 'Error al procesar acción VIP.' });
      }
    } catch (err: any) {
      setFeedback({ ok: false, msg: err?.message || 'Error de red al actualizar escalación.' });
    } finally {
      setBusyEscalationId(null);
    }
  };

  const handleSendDailyDigestNow = async () => {
    setIsSendingDigest(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/autopilot/n8n/daily-digest', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sendEmail: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          ok: true,
          msg: data.emailResult?.success
            ? `Resumen Ejecutivo Diario enviado a ${config.dailyDigestEmail}.`
            : `Resumen compilado (${data.emailResult?.error || 'sin proveedor de correo activo'}).`,
        });
      } else {
        setFeedback({ ok: false, msg: data.error || 'No se pudo compilar el resumen diario.' });
      }
    } catch (err: any) {
      setFeedback({ ok: false, msg: err?.message || 'Error al ejecutar digest diario.' });
    } finally {
      setIsSendingDigest(false);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;
    setIsSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/admin/autopilot/simulate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          channel: simChannel,
          senderName: simSenderName,
          messageText: simMessage,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSimResult(data.simulation);
      } else {
        setFeedback({ ok: false, msg: data.error || 'Error al ejecutar simulación.' });
      }
    } catch (err: any) {
      setFeedback({ ok: false, msg: err?.message || 'Error de red en simulación.' });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {
      setFeedback({ ok: false, msg: 'No se pudo copiar al portapapeles.' });
    }
  };

  const filteredEscalations = useMemo(() => {
    const q = vipSearch.trim().toLowerCase();
    return escalations.filter((item) => {
      if (vipFilter === 'open' && item.status !== 'open') return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        (item.clientName || '').toLowerCase().includes(q)
      );
    });
  }, [escalations, vipSearch, vipFilter]);

  return (
    <div className="flex flex-col h-full bg-white text-slate-900">
      {/* Top Bar Contract: Breadcrumb on left, max 2 compact actions on right */}
      <div className="px-6 py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
            Panel Ejecutivo / Piloto Automático ARN 24/7
          </div>
          <h2 className="text-lg font-display font-bold text-slate-900 tracking-tight mt-0.5">
            Agente Comercial, Soporte Nivel 1 y Auto-Sanación Proxmox
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSendDailyDigestNow}
            disabled={isSendingDigest}
            className="px-3 py-2 text-xs font-semibold border border-neutral-300 text-slate-800 hover:bg-neutral-50 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingDigest ? 'Enviando...' : 'Probar Digest 08:30'}</span>
          </button>
          <button
            type="button"
            onClick={loadOverview}
            disabled={isLoading}
            className="px-3 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div className="px-6 border-b border-neutral-200 flex items-center gap-6 overflow-x-auto bg-neutral-50/60">
        {(
          [
            { id: 'control', label: 'Control & Bandeja VIP', icon: Sliders },
            { id: 'simulator', label: 'Simulador de Calibración', icon: Bot },
            { id: 'activity', label: 'Bitácora Autónoma', icon: Terminal },
            { id: 'proxmox_n8n', label: 'Proxmox & Blueprints n8n', icon: Server },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = subView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubView(tab.id)}
              className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 cursor-pointer ${
                active
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-neutral-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.id === 'control' && metrics.openVipEscalationsCount + metrics.openDraftsCount > 0 && (
                <span className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200">
                  {metrics.openVipEscalationsCount + metrics.openDraftsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`mx-6 mt-4 px-4 py-2.5 text-xs font-medium border flex items-center justify-between ${
            feedback.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <span>{feedback.msg}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[11px] underline ml-4 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Main Viewport */}
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {subView === 'control' && (
          <>
            {/* Real Computed Metrics Strip (Single-Elevation, Tabular Figures) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-neutral-200 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              <div className="p-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  Resueltos en Silencio
                </div>
                <div className="mt-1.5 text-2xl font-mono font-bold tabular-nums text-slate-900">
                  {isLoading ? '—' : metrics.resolvedSilentlyCount}
                </div>
                <div className="mt-1 text-[11px] text-emerald-700 font-medium">
                  Sin interrumpir tu foco
                </div>
              </div>

              <div className="p-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  Supresión de Ruido
                </div>
                <div className="mt-1.5 text-2xl font-mono font-bold tabular-nums text-slate-900">
                  {isLoading ? '—' : `${metrics.noiseSuppressionRate}%`}
                </div>
                <div className="mt-1 text-[11px] text-neutral-500 font-mono tabular-nums">
                  {metrics.selfHealedAlertsCount} alertas auto-sanadas
                </div>
              </div>

              <div className="p-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  Bandeja VIP Abierta
                </div>
                <div className="mt-1.5 text-2xl font-mono font-bold tabular-nums text-slate-900">
                  {isLoading ? '—' : metrics.openVipEscalationsCount}
                </div>
                <div className="mt-1 text-[11px] text-amber-700 font-mono tabular-nums">
                  {metrics.openDraftsCount} borrador(es) · {pendingFollowUpsCount} follow-up(s)
                </div>
              </div>

              <div className="p-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  Tiempo Operativo Ahorrado
                </div>
                <div className="mt-1.5 text-2xl font-mono font-bold tabular-nums text-slate-900">
                  {isLoading ? '—' : `${metrics.estimatedHoursSaved} hs`}
                </div>
                <div className="mt-1 text-[11px] text-neutral-500 font-mono tabular-nums">
                  {metrics.quotesIssuedAutonomously} presupuestos 40/40/20
                </div>
              </div>
            </div>

            {/* Kill-Switch & Guardrails Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Channel Autonomy Kill-Switch */}
              <div className="xl:col-span-7 border border-neutral-200">
                <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                    Kill-Switch de Autonomía por Canal
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {isSavingConfig ? 'Guardando...' : 'Sincronizado Supabase'}
                  </span>
                </div>
                <div className="divide-y divide-neutral-200">
                  {CHANNEL_META.map((ch) => {
                    const current = config.channels[ch.key];
                    return (
                      <div
                        key={ch.key}
                        className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900">{ch.label}</div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">{ch.scope}</div>
                        </div>
                        <div className="inline-flex border border-neutral-300 shrink-0">
                          {(['autonomous', 'draft_only', 'paused'] as AutonomyMode[]).map((mode) => {
                            const selected = current === mode;
                            const activeStyle =
                              mode === 'autonomous'
                                ? 'bg-emerald-600 text-white'
                                : mode === 'draft_only'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-rose-600 text-white';
                            return (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => handleChannelModeChange(ch.key, mode)}
                                className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                                  selected
                                    ? activeStyle
                                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                                }`}
                              >
                                {MODE_LABELS[mode]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Protocol Guardrails Form */}
              <form onSubmit={handleSaveGuardrails} className="xl:col-span-5 border border-neutral-200 flex flex-col">
                <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                    Reglas Anti-Esclavitud y Límites
                  </span>
                </div>
                <div className="p-4 space-y-3 flex-1 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-[11px] font-medium text-neutral-600">
                        Tope Autocotización (USD)
                      </span>
                      <input
                        type="number"
                        min={500}
                        step={500}
                        value={config.maxAutoQuoteAmountUsd}
                        onChange={(e) =>
                          setConfig({ ...config, maxAutoQuoteAmountUsd: Number(e.target.value) })
                        }
                        className="mt-1 w-full px-2.5 py-1.5 border border-neutral-300 font-mono tabular-nums text-slate-900"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-medium text-neutral-600">
                        Gracia Auto-Sanación (min)
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={config.selfHealingGraceMinutes}
                        onChange={(e) =>
                          setConfig({ ...config, selfHealingGraceMinutes: Number(e.target.value) })
                        }
                        className="mt-1 w-full px-2.5 py-1.5 border border-neutral-300 font-mono tabular-nums text-slate-900"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-[11px] font-medium text-neutral-600">
                        Email Resumen Diario
                      </span>
                      <input
                        type="email"
                        value={config.dailyDigestEmail}
                        onChange={(e) =>
                          setConfig({ ...config, dailyDigestEmail: e.target.value })
                        }
                        className="mt-1 w-full px-2.5 py-1.5 border border-neutral-300 text-slate-900"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-medium text-neutral-600">
                        Hora Digest (GMT-3)
                      </span>
                      <input
                        type="time"
                        value={config.dailyDigestTime}
                        onChange={(e) =>
                          setConfig({ ...config, dailyDigestTime: e.target.value })
                        }
                        className="mt-1 w-full px-2.5 py-1.5 border border-neutral-300 font-mono tabular-nums text-slate-900"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-[11px] font-medium text-neutral-600">
                      Teléfono WhatsApp VIP (solo emergencias críticas / 40% kickoff)
                    </span>
                    <input
                      type="text"
                      placeholder="Ej. 5491155554444 (vacío = solo panel y digest)"
                      value={config.vipNotificationPhone}
                      onChange={(e) =>
                        setConfig({ ...config, vipNotificationPhone: e.target.value })
                      }
                      className="mt-1 w-full px-2.5 py-1.5 border border-neutral-300 font-mono text-slate-900"
                    />
                  </label>

                  <div className="pt-1 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoTranscribeWhatsAppAudio}
                        onChange={(e) =>
                          setConfig({ ...config, autoTranscribeWhatsAppAudio: e.target.checked })
                        }
                      />
                      <span className="text-neutral-700">
                        Transcribir notas de voz de WhatsApp automáticamente
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.antiNoShowRemindersEnabled}
                        onChange={(e) =>
                          setConfig({ ...config, antiNoShowRemindersEnabled: e.target.checked })
                        }
                      />
                      <span className="text-neutral-700">
                        Activar recordatorios Meet Anti No-Show (24h / 2h)
                      </span>
                    </label>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingConfig ? 'Guardando...' : 'Guardar Guardrails'}
                  </button>
                </div>
              </form>
            </div>

            {/* High-Density VIP Escalation Queue Table */}
            <div className="border border-neutral-200">
              <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                    Bandeja de Escalación VIP (&lt;10% que requiere tu criterio)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={vipSearch}
                      onChange={(e) => setVipSearch(e.target.value)}
                      placeholder="Filtrar cliente o evento..."
                      className="pl-8 pr-3 py-1.5 text-xs border border-neutral-300 bg-white w-48"
                    />
                  </div>
                  <div className="inline-flex border border-neutral-300">
                    <button
                      type="button"
                      onClick={() => setVipFilter('open')}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer ${
                        vipFilter === 'open' ? 'bg-slate-900 text-white' : 'bg-white text-neutral-600'
                      }`}
                    >
                      Abiertas
                    </button>
                    <button
                      type="button"
                      onClick={() => setVipFilter('all')}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer ${
                        vipFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-neutral-600'
                      }`}
                    >
                      Todas
                    </button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="divide-y divide-neutral-200">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="px-4 py-3 flex items-center justify-between animate-pulse">
                      <div className="h-4 bg-neutral-200 w-1/3" />
                      <div className="h-4 bg-neutral-100 w-1/4" />
                    </div>
                  ))}
                </div>
              ) : filteredEscalations.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="text-sm font-semibold text-slate-800">
                    Bandeja VIP despejada — 0 interrupciones pendientes
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                    Aquí aparecerán únicamente reuniones de consultoría confirmadas, comprobantes del 40% de kickoff, propuestas Enterprise por encima del tope o alertas críticas no auto-sanadas.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubView('simulator')}
                    className="mt-4 px-3.5 py-2 text-xs font-semibold border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                  >
                    Probar el Agente en el Simulador
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] uppercase tracking-wider text-neutral-500">
                        <th className="py-2.5 px-4 font-semibold">Tipo</th>
                        <th className="py-2.5 px-4 font-semibold">Evento / Contexto</th>
                        <th className="py-2.5 px-4 font-semibold">Acción Sugerida</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Fecha</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {filteredEscalations.map((item) => {
                        const sevColor =
                          item.severity === 'critical'
                            ? 'text-rose-700 border-rose-200 bg-rose-50'
                            : item.severity === 'vip'
                              ? 'text-amber-800 border-amber-200 bg-amber-50'
                              : 'text-slate-700 border-neutral-300 bg-neutral-100';
                        return (
                          <tr key={item.id} className="hover:bg-neutral-50/80">
                            <td className="py-2.5 px-4 align-top whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase border ${sevColor}`}>
                                {item.severity}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 align-top max-w-md">
                              <div className="font-semibold text-slate-900">{item.title}</div>
                              <div className="text-neutral-600 mt-0.5">{item.summary}</div>
                              {item.draftReply && (
                                <div className="mt-1.5 p-2 bg-neutral-50 border border-neutral-200 text-[11px] text-slate-700 whitespace-pre-wrap">
                                  <strong>Borrador:</strong> {item.draftReply}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-4 align-top text-neutral-600 max-w-xs">
                              {item.suggestedAction}
                            </td>
                            <td className="py-2.5 px-4 align-top text-right font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                              {formatShortTime(item.createdAt)}
                            </td>
                            <td className="py-2.5 px-4 align-top text-right whitespace-nowrap">
                              {item.status === 'open' ? (
                                <div className="inline-flex items-center gap-1.5">
                                  {item.draftReply && (
                                    <button
                                      type="button"
                                      disabled={busyEscalationId === item.id}
                                      onClick={() => handleEscalationAction(item.id, 'approve_send')}
                                      className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                    >
                                      Aprobar y Enviar
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    disabled={busyEscalationId === item.id}
                                    onClick={() => handleEscalationAction(item.id, 'resolve')}
                                    className="px-2.5 py-1 text-[11px] font-semibold border border-neutral-300 text-slate-800 hover:bg-neutral-100 cursor-pointer"
                                  >
                                    Resolver
                                  </button>
                                </div>
                              ) : (
                                <span className="font-mono text-[11px] uppercase text-neutral-400">
                                  {item.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {subView === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={handleRunSimulation} className="lg:col-span-5 border border-neutral-200 flex flex-col">
              <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Calibración en Vivo (Sin Enviar WhatsApp Real)
                </span>
              </div>
              <div className="p-4 space-y-3 text-xs flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[11px] font-medium text-neutral-600">Canal</span>
                    <select
                      value={simChannel}
                      onChange={(e) => setSimChannel(e.target.value as 'whatsapp' | 'portal')}
                      className="mt-1 w-full px-2.5 py-1.5 border border-neutral-300 bg-white"
                    >
                      <option value="whatsapp">WhatsApp Comercial</option>
                      <option value="portal">Portal Clientes L1</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium text-neutral-600">Nombre Remitente</span>
                    <input
                      type="text"
                      value={simSenderName}
                      onChange={(e) => setSimSenderName(e.target.value)}
                      className="mt-1 w-full px-2.5 py-1.5 border border-neutral-300"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-[11px] font-medium text-neutral-600">Mensaje Simulado</span>
                  <textarea
                    rows={4}
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-neutral-300 text-xs"
                  />
                </label>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-medium text-neutral-500">Escenarios rápidos:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Somos 28 personas, queremos Odoo ERP + IA. ¿Cuánto sale?',
                      'Ya transferí el 40% del kickoff, te paso el comprobante.',
                      'Somos 120 empleados y queremos arquitectura IA a medida en Proxmox.',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSimMessage(preset)}
                        className="px-2 py-1 text-[11px] border border-neutral-300 hover:bg-neutral-50 text-left cursor-pointer"
                      >
                        {preset.slice(0, 44)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isSimulating ? 'Evaluando...' : 'Ejecutar Simulación'}</span>
                </button>
              </div>
            </form>

            <div className="lg:col-span-7 border border-neutral-200 flex flex-col">
              <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Decisión del Orquestador ARN
                </span>
                {simResult && (
                  <span className="text-[11px] font-mono text-neutral-500">
                    Motor: {simResult.llmProviderUsed}
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 text-xs space-y-4">
                {!simResult ? (
                  <div className="py-12 text-center text-neutral-500">
                    Ejecutá un escenario para inspeccionar la respuesta comercial, cotización 40/40/20 determinística y si el protocolo anti-ruido te interrumpiría o resolvería en silencio.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 border border-neutral-200 divide-x divide-neutral-200">
                      <div className="p-3">
                        <div className="text-[10px] font-mono uppercase text-neutral-500">Etapa</div>
                        <div className="mt-1 font-mono font-semibold text-slate-900">
                          {simResult.nextStage}
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] font-mono uppercase text-neutral-500">¿Te interrumpe?</div>
                        <div
                          className={`mt-1 font-mono font-semibold ${
                            simResult.vipEscalation ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {simResult.vipEscalation ? `SÍ (${simResult.vipEscalation.reason})` : 'NO (Silencio Total)'}
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] font-mono uppercase text-neutral-500">Cotización ARN</div>
                        <div className="mt-1 font-mono font-semibold tabular-nums text-slate-900">
                          {simResult.autoQuote
                            ? `${simResult.autoQuote.quoteNumber} · USD ${Number(simResult.autoQuote.total).toLocaleString('es-AR')}`
                            : 'Sin emisión'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Respuesta Generada para el Cliente
                      </div>
                      <div className="p-3.5 border border-neutral-200 bg-neutral-50 whitespace-pre-wrap text-slate-800 leading-relaxed">
                        {simResult.replyText || '(Canal en pausa: sin respuesta automática)'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {subView === 'activity' && (
          <div className="space-y-6">
            {/* Autonomous Activity Log Table */}
            <div className="border border-neutral-200">
              <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Bitácora de Ejecuciones Autónomas ({logs.length})
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  Conversaciones activas: {conversations.length}
                </span>
              </div>
              {logs.length === 0 ? (
                <div className="px-6 py-10 text-center text-xs text-neutral-500">
                  Todavía no se registraron acciones automáticas. A medida que entren mensajes por WhatsApp, consultas en el Portal o cronogramas de n8n, cada decisión quedará auditada acá.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] uppercase tracking-wider text-neutral-500">
                        <th className="py-2.5 px-4 font-semibold">Fecha</th>
                        <th className="py-2.5 px-4 font-semibold">Canal</th>
                        <th className="py-2.5 px-4 font-semibold">Destinatario</th>
                        <th className="py-2.5 px-4 font-semibold">Resultado</th>
                        <th className="py-2.5 px-4 font-semibold">Detalle</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Ahorro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-50">
                          <td className="py-2.5 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                            {formatShortTime(log.createdAt)}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                            {log.channel}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-900">
                            {log.targetLabel}
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span
                              className={`font-mono text-[11px] ${
                                log.outcome === 'resolved_silently' || log.outcome === 'self_healed'
                                  ? 'text-emerald-700'
                                  : log.outcome === 'vip_escalated'
                                    ? 'text-amber-700'
                                    : 'text-neutral-600'
                              }`}
                            >
                              {log.outcome}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-neutral-600">{log.detail}</td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                            {log.estimatedMinutesSaved} min
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {subView === 'proxmox_n8n' && (
          <div className="space-y-6">
            {!blueprints ? (
              <div className="p-8 border border-neutral-200 text-center text-xs text-neutral-500">
                Generando paquete Proxmox + Cloudflare Tunnel + 4 Blueprints n8n...
              </div>
            ) : (
              <>
                {/* Checklist Cloudflare Zero-Trust */}
                <div className="border border-neutral-200">
                  <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                      Checklist Zero-Trust: Proxmox + Cloudflare Tunnel (0 Puertos Abiertos)
                    </span>
                  </div>
                  <ol className="p-4 space-y-2 text-xs text-slate-700 list-decimal list-inside">
                    {blueprints.cloudflareZeroTrustChecklist.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* 4 Importable n8n Workflows */}
                <div className="border border-neutral-200">
                  <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                      4 Workflows JSON Importables en tu n8n
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      Importar vía n8n → Workflows → Import from File
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-200">
                    {blueprints.n8nWorkflows.map((wf) => {
                      const serialized = JSON.stringify(wf.json, null, 2);
                      return (
                        <div
                          key={wf.id}
                          className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900">{wf.title}</div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              <span className="font-mono text-slate-700">{wf.trigger}</span> · {wf.description}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyText(wf.id, serialized)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold border border-neutral-300 hover:bg-neutral-50 inline-flex items-center gap-1 cursor-pointer"
                            >
                              {copiedId === wf.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedId === wf.id ? 'Copiado' : 'Copiar JSON'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                downloadTextFile(wf.filename, serialized, 'application/json')
                              }
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Descargar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Docker Compose & .env Templates for Proxmox */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 border border-neutral-200">
                    <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                      <span className="text-xs font-semibold font-mono text-slate-800">
                        docker-compose.yml (Proxmox VM / LXC Docker)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyText('compose', blueprints.dockerComposeYaml)}
                          className="px-2.5 py-1 text-[11px] font-semibold border border-neutral-300 bg-white hover:bg-neutral-50 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === 'compose' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === 'compose' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadTextFile('docker-compose.yml', blueprints.dockerComposeYaml)
                          }
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Descargar</span>
                        </button>
                      </div>
                    </div>
                    <pre className="p-4 text-[11px] font-mono bg-slate-950 text-slate-100 overflow-x-auto max-h-96 leading-relaxed">
                      {blueprints.dockerComposeYaml}
                    </pre>
                  </div>

                  <div className="lg:col-span-4 border border-neutral-200 flex flex-col">
                    <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                      <span className="text-xs font-semibold font-mono text-slate-800">
                        .env.proxmox
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          downloadTextFile('.env.proxmox', blueprints.envTemplate)
                        }
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descargar</span>
                      </button>
                    </div>
                    <pre className="p-4 text-[11px] font-mono bg-slate-950 text-slate-100 overflow-x-auto flex-1 leading-relaxed">
                      {blueprints.envTemplate}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
