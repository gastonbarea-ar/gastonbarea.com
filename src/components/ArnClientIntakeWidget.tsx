import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  FileText,
  MessageSquare,
  Video,
  RefreshCw,
  Zap,
  Building2,
} from 'lucide-react';
import {
  parseNaturalArnCommand,
  buildAutonomous404020Quote,
} from '../utils/arnEngine';
import { Quote } from '../types/crm';

interface ArnClientIntakeWidgetProps {
  variant?: 'hero-dark' | 'home-light' | 'portal-compact';
  initialMessage?: string;
  onOpenPortalWithSession?: () => void;
  onScheduleClick?: (context?: string) => void;
  onWhatsAppClick?: (customText?: string) => void;
}

interface ArnIntakeResult {
  clientName: string;
  clientEmail: string;
  companyName: string;
  serviceCategory: string;
  quote: Quote;
  token?: string;
  kickoffActivated?: boolean;
}

const QUICK_ARN_CLIENT_EXAMPLES = [
  {
    label: 'Odoo ERP v18 & Inventario',
    text: 'Soy Martín de Distribuidora Austral, necesitamos implementar Odoo ERP v18 e inventario B2B',
    channel: 'martin@distribuidoraaustral.com',
  },
  {
    label: 'IA Services & Gemelo Digital',
    text: 'Soy Carolina de Grupo BioPatagonia, queremos integrar un Gemelo Digital con IA y agentes RAG',
    channel: 'carolina@biopatagonia.com',
  },
  {
    label: 'Bioeconomía & Trazabilidad IoT',
    text: 'Soy Federico de Bodega Andina, buscamos trazabilidad IoT de lotes y pasaporte digital',
    channel: 'federico@bodegaandina.com',
  },
  {
    label: 'Dirección PMO / Arquitectura',
    text: 'Soy Lucía de TechSur, necesitamos dirección ejecutiva PMO y arquitectura cloud en Linux/Docker',
    channel: 'lucia@techsur.io',
  },
];

export const ArnClientIntakeWidget: React.FC<ArnClientIntakeWidgetProps> = ({
  variant = 'hero-dark',
  initialMessage = '',
  onOpenPortalWithSession,
  onScheduleClick,
  onWhatsAppClick,
}) => {
  const [message, setMessage] = useState<string>(initialMessage);
  const [contactChannel, setContactChannel] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [isApprovingQuote, setIsApprovingQuote] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [intakeResult, setIntakeResult] = useState<ArnIntakeResult | null>(null);
  const recognitionRef = useRef<any>(null);

  const toggleVoiceDictation = () => {
    if (isListeningVoice) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListeningVoice(false);
      return;
    }

    const SpeechRecognitionApi =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionApi) {
      setErrorMsg(
        'Tu navegador móvil o de escritorio no soporta dictado directo. Escribí en una línea o tocá un ejemplo rápido arriba.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionApi();
      recognition.lang = 'es-AR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setErrorMsg('');
        setIsListeningVoice(true);
      };
      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setMessage((prev) => (prev ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()));
        }
      };
      recognition.onerror = () => {
        setIsListeningVoice(false);
      };
      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  const handleExecuteArnIntake = async (e?: React.FormEvent, customMsg?: string, customChan?: string) => {
    if (e) e.preventDefault();
    const rawMsg = (customMsg ?? message).trim();
    const rawChan = (customChan ?? contactChannel).trim();

    if (!rawMsg) {
      setErrorMsg('Contanos en una línea qué proyecto o solución buscás evaluar.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/arn/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawMsg,
          contactChannel: rawChan,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.quote && data.client) {
        // Persist instant Client Portal session so #portal opens logged in with the new quote
        if (data.token) {
          localStorage.setItem('gb_client_token', data.token);
        }
        localStorage.setItem('gb_client_user', JSON.stringify(data.client));
        try {
          const savedQuotesRaw = localStorage.getItem('gb_arn_client_quotes_v1');
          const savedQuotes: Quote[] = savedQuotesRaw ? JSON.parse(savedQuotesRaw) : [];
          localStorage.setItem(
            'gb_arn_client_quotes_v1',
            JSON.stringify([data.quote, ...savedQuotes.filter((q) => q.id !== data.quote.id)])
          );
        } catch {
          // ignore storage quota
        }

        setIntakeResult({
          clientName: data.client.name || data.parsed?.clientName || 'Ejecutivo ARN',
          clientEmail: data.client.email || data.parsed?.clientEmail || 'contacto@portal-arn.com',
          companyName: data.client.company || data.parsed?.companyName || 'Organización',
          serviceCategory: data.parsed?.serviceCategory || 'software_architecture',
          quote: data.quote,
          token: data.token,
        });
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Deterministic client-side fallback if offline
    }

    const fallbackParsed = parseNaturalArnCommand(rawMsg, rawChan);
    const fallbackQuote = buildAutonomous404020Quote({
      opportunityId: `opp-arn-local-${Date.now()}`,
      clientName: fallbackParsed.clientName,
      clientEmail: fallbackParsed.clientEmail,
      companyName: fallbackParsed.companyName,
      serviceCategory: fallbackParsed.serviceCategory,
      title: fallbackParsed.summaryTitle,
      totalAmount: fallbackParsed.estimatedValue,
      currency: fallbackParsed.currency,
      notes: fallbackParsed.extractedNotes,
    });
    const fallbackToken = `gb_cli_arn_${Date.now()}`;
    const fallbackClient = {
      id: `cnt-arn-${Date.now()}`,
      email: fallbackParsed.clientEmail,
      username: fallbackParsed.clientEmail.split('@')[0],
      name: fallbackParsed.clientName,
      company: fallbackParsed.companyName,
      role: 'Miembro Red ARN',
      contactType:
        fallbackParsed.companyName !== 'Contacto Individual' ? 'corporate_member' : 'individual',
      hasActiveService: false,
    };

    localStorage.setItem('gb_client_token', fallbackToken);
    localStorage.setItem('gb_client_user', JSON.stringify(fallbackClient));

    setIntakeResult({
      clientName: fallbackParsed.clientName,
      clientEmail: fallbackParsed.clientEmail,
      companyName: fallbackParsed.companyName,
      serviceCategory: fallbackParsed.serviceCategory,
      quote: fallbackQuote,
      token: fallbackToken,
    });
    setIsSubmitting(false);
  };

  const handleInstantApproveQuote = async () => {
    if (!intakeResult || isApprovingQuote) return;
    setIsApprovingQuote(true);
    try {
      const res = await fetch(`/api/client/quotes/${intakeResult.quote.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setIntakeResult((prev) =>
          prev
            ? {
                ...prev,
                kickoffActivated: true,
                quote: { ...prev.quote, status: 'accepted' },
              }
            : null
        );
        setIsApprovingQuote(false);
        return;
      }
    } catch {
      // fallback
    }
    setIntakeResult((prev) =>
      prev
        ? {
            ...prev,
            kickoffActivated: true,
            quote: { ...prev.quote, status: 'accepted' },
          }
        : null
    );
    setIsApprovingQuote(false);
  };

  const isDark = variant === 'hero-dark';

  return (
    <div
      className={`w-full text-left transition-all ${
        isDark
          ? 'bg-gradient-to-br from-[#130E2B] via-[#0F1221] to-[#0B1F1B] text-white border border-emerald-400/30 shadow-2xl p-4 sm:p-6 lg:p-7'
          : variant === 'portal-compact'
          ? 'bg-[#0F172A] text-white border border-emerald-500/30 p-4 sm:p-5'
          : 'bg-white text-[#1D1D1F] border-2 border-[#291B64] shadow-xl p-4 sm:p-6 lg:p-8'
      }`}
    >
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 mb-4 border-b border-current/10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-400 text-emerald-950">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>ARN · Cero Formularios</span>
          </span>
          <span
            className={`text-xs font-mono font-semibold ${
              isDark || variant === 'portal-compact' ? 'text-emerald-300' : 'text-[#291B64]'
            }`}
          >
            Auto-Perfilado IA + Propuesta 40/40/20 + Acceso Instantáneo al Portal
          </span>
        </div>

        <div
          className={`text-[11px] font-mono ${
            isDark || variant === 'portal-compact' ? 'text-neutral-300' : 'text-slate-500'
          }`}
        >
          1 línea de texto o voz · Sin formularios largos
        </div>
      </div>

      {!intakeResult ? (
        <form onSubmit={(e) => handleExecuteArnIntake(e)} className="space-y-4">
          {/* Quick-Tap Mobile/Desktop Example Pills */}
          <div className="space-y-1.5">
            <div
              className={`text-[11px] font-mono ${
                isDark || variant === 'portal-compact' ? 'text-neutral-300' : 'text-slate-600'
              }`}
            >
              Tocá un ejemplo rápido para probar cómo interactúa el cliente o escribí/dictá tu caso:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 snap-x">
              {QUICK_ARN_CLIENT_EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMessage(ex.text);
                    setContactChannel(ex.channel);
                    setErrorMsg('');
                  }}
                  className={`snap-start shrink-0 px-3 py-2 min-h-[38px] text-xs font-semibold transition-colors cursor-pointer border ${
                    isDark || variant === 'portal-compact'
                      ? 'bg-white/[0.07] hover:bg-emerald-400 hover:text-emerald-950 text-white border-white/15'
                      : 'bg-[#F5F5F8] hover:bg-[#291B64] hover:text-white text-[#1D1D1F] border-black/10'
                  }`}
                >
                  + {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 1: Natural Language / Voice Input (text-base on mobile prevents iOS auto-zoom) */}
          <div className="space-y-2">
            <label
              className={`block text-xs sm:text-sm font-semibold ${
                isDark || variant === 'portal-compact' ? 'text-white' : 'text-slate-900'
              }`}
            >
              1. Contanos en una frase quién sos, tu empresa y qué necesitás resolver:
            </label>
            <div className="relative flex items-stretch gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Ej: Soy Martín de AgroSur, necesitamos Odoo v18 o trazabilidad IoT..."
                className={`flex-1 px-3.5 py-3 min-h-[48px] text-base sm:text-sm rounded-none border focus:outline-none ${
                  isDark || variant === 'portal-compact'
                    ? 'bg-black/50 text-white placeholder:text-neutral-400 border-white/20 focus:border-emerald-400'
                    : 'bg-[#F7F7FA] text-slate-900 placeholder:text-slate-400 border-slate-300 focus:border-[#291B64]'
                }`}
              />
              <button
                type="button"
                onClick={toggleVoiceDictation}
                title="Dictar por voz (Español)"
                className={`px-3.5 min-h-[48px] shrink-0 inline-flex items-center justify-center gap-1.5 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  isListeningVoice
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : isDark || variant === 'portal-compact'
                    ? 'bg-white/10 hover:bg-white/20 text-emerald-300 border-white/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#291B64] border-slate-300'
                }`}
              >
                {isListeningVoice ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Escuchando...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span className="hidden sm:inline">Dictar Voz</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Single Contact Channel + 1-Click Action Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
            <div className="md:col-span-5">
              <input
                type="text"
                value={contactChannel}
                onChange={(e) => setContactChannel(e.target.value)}
                placeholder="2. Tu Email o WhatsApp (ej: martin@empresa.com)"
                className={`w-full h-full min-h-[48px] px-3.5 py-3 text-base sm:text-sm rounded-none border focus:outline-none ${
                  isDark || variant === 'portal-compact'
                    ? 'bg-black/50 text-white placeholder:text-neutral-400 border-white/20 focus:border-emerald-400'
                    : 'bg-[#F7F7FA] text-slate-900 placeholder:text-slate-400 border-slate-300 focus:border-[#291B64]'
                }`}
              />
            </div>

            <div className="md:col-span-7">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-full min-h-[48px] px-5 py-3.5 text-xs sm:text-sm font-mono font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>Perfilando Nodo ARN y Cotización 40/40/20...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Generar Propuesta 40/40/20 & Entrar a Mi Portal (1-Clic)</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-400/40 text-xs font-mono text-rose-200">
              {errorMsg}
            </div>
          )}
        </form>
      ) : (
        /* INSTANT ARN NODE & 40/40/20 QUOTE RESULT ON THE HOME PAGE */
        <div className="space-y-5 animate-fadeIn">
          <div
            className={`p-4 sm:p-5 border ${
              isDark || variant === 'portal-compact'
                ? 'bg-emerald-950/40 border-emerald-400/40 text-white'
                : 'bg-emerald-50 border-emerald-600/30 text-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-current/10">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-emerald-400">
                    NODO DE RELACIÓN ARN CREADO Y SESIÓN DE PORTAL ACTIVA
                  </div>
                  <div className="text-sm sm:text-base font-bold">
                    {intakeResult.clientName} · {intakeResult.companyName} ({intakeResult.clientEmail})
                  </div>
                </div>
              </div>

              <span className="self-start sm:self-auto px-3 py-1 text-xs font-mono font-bold bg-emerald-400 text-emerald-950">
                {intakeResult.quote.quoteNumber}
              </span>
            </div>

            <div className="pt-3 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-7 space-y-1.5">
                <div className="text-xs font-mono opacity-80">
                  PROPUESTA TÉCNICA Y ECONÓMICA ESTRUCTURADA AUTOMÁTICAMENTE:
                </div>
                <div className="font-display text-lg sm:text-xl font-bold">
                  {intakeResult.quote.title}
                </div>
                <div className="text-xs opacity-85">
                  Plazo estimado: <strong>{intakeResult.quote.timeline}</strong> · Validez:{' '}
                  <strong>{intakeResult.quote.validUntil}</strong>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col sm:items-end justify-center">
                <div className="text-xs font-mono opacity-75">INVERSIÓN ESTIMADA (ESQUEMA 40/40/20)</div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400">
                  {intakeResult.quote.currency} ${Number(intakeResult.quote.total || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* 3 Milestones 40 / 40 / 20 Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 mt-3 border-t border-current/10">
              {intakeResult.quote.milestones.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`p-3 border ${
                    isDark || variant === 'portal-compact'
                      ? 'bg-black/40 border-white/10'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                    <span>HITO 0{i + 1} ({m.percentage}%)</span>
                    <span>
                      {intakeResult.quote.currency} ${Number(m.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs font-semibold mt-1 line-clamp-1">
                    {(m as any).title || (m as any).name || (m as any).label}
                  </div>
                  <div className="text-[11px] opacity-75 mt-0.5 line-clamp-2">
                    {(m as any).description || (m as any).deliverable || (m as any).triggerCondition}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Client Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {onOpenPortalWithSession && (
              <button
                type="button"
                onClick={onOpenPortalWithSession}
                className="min-h-[48px] px-4 py-3 text-xs font-mono font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Abrir Mi Portal Clientes (Ya Conectado)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleInstantApproveQuote}
              disabled={isApprovingQuote || intakeResult.kickoffActivated}
              className={`min-h-[48px] px-4 py-3 text-xs font-mono font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer ${
                intakeResult.kickoffActivated
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#291B64] hover:bg-[#382586] text-white'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0 text-emerald-300" />
              <span>
                {intakeResult.kickoffActivated
                  ? '¡Kick-off 40/40/20 Activado!'
                  : isApprovingQuote
                  ? 'Activando Kick-off...'
                  : 'Aprobar Propuesta & Iniciar Kick-off (1-Clic)'}
              </span>
            </button>

            {onWhatsAppClick && (
              <button
                type="button"
                onClick={() =>
                  onWhatsAppClick(
                    `Hola Gastón, acabo de generar mi Nodo ARN y la propuesta ${intakeResult.quote.quoteNumber} (${intakeResult.quote.title} - ${intakeResult.quote.currency} $${intakeResult.quote.total.toLocaleString()}) para ${intakeResult.companyName}.`
                  )
                }
                className={`min-h-[48px] px-4 py-3 text-xs font-mono font-semibold border transition-colors inline-flex items-center justify-center gap-2 cursor-pointer ${
                  isDark || variant === 'portal-compact'
                    ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Validar por WhatsApp</span>
              </button>
            )}

            {onScheduleClick && (
              <button
                type="button"
                onClick={() =>
                  onScheduleClick(
                    `Revisión de Propuesta ARN ${intakeResult.quote.quoteNumber} (${intakeResult.companyName} - ${intakeResult.quote.title})`
                  )
                }
                className={`min-h-[48px] px-4 py-3 text-xs font-mono font-semibold border transition-colors inline-flex items-center justify-center gap-2 cursor-pointer ${
                  isDark || variant === 'portal-compact'
                    ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                }`}
              >
                <Video className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Agendar Meet (30m)</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono opacity-80">
            <span>
              Tus credenciales automáticas de Portal: <strong>{intakeResult.clientEmail}</strong> / Clave:{' '}
              <strong>cliente2026</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setIntakeResult(null);
                setMessage('');
              }}
              className="underline hover:text-emerald-400 cursor-pointer"
            >
              Cotizar otra necesidad con ARN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
