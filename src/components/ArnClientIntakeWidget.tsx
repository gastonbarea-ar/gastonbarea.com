import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  MessageSquare,
  Video,
  RefreshCw,
  Zap,
  Users,
  ShieldCheck,
  Layers,
  Lock,
  UserPlus,
  Building2,
  KeyRound,
} from 'lucide-react';
import {
  parseNaturalArnCommand,
  buildAutonomous404020Quote,
  EMPLOYEE_SCALE_OPTIONS,
  calculateEmployeeTierPricing,
} from '../utils/arnEngine';
import { INITIAL_ARN_SERVICE_STOCK } from '../data/crmTemplates';
import { ArnServiceStockItem, Quote } from '../types/crm';

interface ArnClientIntakeWidgetProps {
  variant?: 'hero-dark' | 'home-light' | 'portal-compact';
  initialMessage?: string;
  onOpenPortalWithSession?: () => void;
  onScheduleClick?: (context?: string) => void;
  onWhatsAppClick?: (customText?: string) => void;
}

interface ArnRegistrationResult {
  clientName: string;
  clientEmail: string;
  companyName: string;
  username: string;
  quote: Quote;
  token?: string;
}

export const ArnClientIntakeWidget: React.FC<ArnClientIntakeWidgetProps> = ({
  variant = 'hero-dark',
  initialMessage = '',
  onOpenPortalWithSession,
  onScheduleClick,
  onWhatsAppClick,
}) => {
  const [serviceStock, setServiceStock] = useState<ArnServiceStockItem[]>(INITIAL_ARN_SERVICE_STOCK);
  const [selectedStockId, setSelectedStockId] = useState<string>('');
  const [message, setMessage] = useState<string>(initialMessage);
  const [employeeCount, setEmployeeCount] = useState<number>(5);

  // Registration fields required to access & treat the budget in the Client Portal
  const [fullName, setFullName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('gb_client_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.name || '';
      }
    } catch {
      // ignore
    }
    return '';
  });
  const [companyName, setCompanyName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('gb_client_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.company || '';
      }
    } catch {
      // ignore
    }
    return '';
  });
  const [email, setEmail] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('gb_client_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email && !String(parsed.email).endsWith('@portal-arn.com')) {
          return parsed.email;
        }
      }
    } catch {
      // ignore
    }
    return '';
  });
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('cliente2026');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [registrationResult, setRegistrationResult] = useState<ArnRegistrationResult | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load real-time ARN Service Stock controlled by Admin
  useEffect(() => {
    let active = true;
    fetch('/api/arn/service-stock')
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data?.serviceStock) && data.serviceStock.length > 0) {
          setServiceStock(data.serviceStock);
        }
      })
      .catch(() => {
        // fallback to INITIAL_ARN_SERVICE_STOCK
      });
    return () => {
      active = false;
    };
  }, []);

  // Qualitative preview of Service Stock match + Scale (Micro, PyME, Grande)
  const livePricingPreview = useMemo(() => {
    const previewParsed = parseNaturalArnCommand(
      message || 'Implementación Odoo ERP & Arquitectura',
      email,
      employeeCount,
      serviceStock,
      selectedStockId || undefined
    );
    return calculateEmployeeTierPricing({
      employeeCount,
      serviceCategory: previewParsed.serviceCategory,
      currency: previewParsed.currency,
      preferredStockId: selectedStockId || previewParsed.stockServiceId,
      serviceStock,
    });
  }, [message, email, employeeCount, serviceStock, selectedStockId]);

  const activeStockItems = useMemo(
    () => serviceStock.filter((s) => s.active !== false),
    [serviceStock]
  );

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
        'Tu navegador no soporta dictado directo. Escribí en una línea o seleccioná un servicio del Stock arriba.'
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

  const handleRegisterAndOpenPortalQuote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = fullName.trim();
    const cleanCompany = companyName.trim() || 'Contacto Individual';
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim() || 'cliente2026';
    const rawMsg = message.trim() || `Implementación ${livePricingPreview.stockService.name}`;

    if (!cleanName) {
      setErrorMsg('Ingresá tu Nombre y Apellido para registrar tu cuenta en el Portal de Clientes.');
      return;
    }
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setErrorMsg('Ingresá tu Correo Electrónico válido para vincular el presupuesto a tu usuario del Portal.');
      return;
    }
    if (cleanPassword.length < 4) {
      setErrorMsg('Definí una contraseña de al menos 4 caracteres para tu acceso al Portal.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/arn/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          companyName: cleanCompany,
          email: cleanEmail,
          phone: cleanPhone,
          password: cleanPassword,
          message: rawMsg,
          contactChannel: cleanEmail,
          employeeCount,
          stockServiceId: livePricingPreview.stockService.id,
          sendEmail: false, // Never send automatic emails from public Home intake
        }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.quote && data.client) {
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

        setRegistrationResult({
          clientName: data.client.name || cleanName,
          clientEmail: data.client.email || cleanEmail,
          companyName: data.client.company || cleanCompany,
          username: data.client.username || cleanEmail.split('@')[0],
          quote: data.quote,
          token: data.token,
        });
        setIsSubmitting(false);

        // Immediately redirect registered user to the Client Portal (#portal) for budget treatment
        if (onOpenPortalWithSession) {
          onOpenPortalWithSession();
        }
        return;
      }
    } catch {
      // Deterministic client-side fallback if offline
    }

    const fallbackQuote = buildAutonomous404020Quote({
      opportunityId: `opp-arn-local-${Date.now()}`,
      clientName: cleanName,
      clientEmail: cleanEmail,
      companyName: cleanCompany,
      serviceCategory: livePricingPreview.stockService.serviceCategory,
      title: `${livePricingPreview.stockService.name} · ${cleanCompany}`,
      totalAmount: livePricingPreview.totalImplementationCost,
      currency: livePricingPreview.currency,
      employeeCount,
      preferredStockId: livePricingPreview.stockService.id,
      serviceStock,
      notes: rawMsg,
    });
    const fallbackToken = `gb_cli_arn_${Date.now()}`;
    const fallbackUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9._-]/g, '');
    const fallbackClient = {
      id: `cnt-arn-${Date.now()}`,
      email: cleanEmail,
      username: fallbackUsername,
      name: cleanName,
      company: cleanCompany,
      role: 'Ejecutivo Registrado ARN',
      contactType: cleanCompany !== 'Contacto Individual' ? 'corporate_member' : 'individual',
      hasActiveService: false,
    };

    localStorage.setItem('gb_client_token', fallbackToken);
    localStorage.setItem('gb_client_user', JSON.stringify(fallbackClient));
    try {
      const savedQuotesRaw = localStorage.getItem('gb_arn_client_quotes_v1');
      const savedQuotes: Quote[] = savedQuotesRaw ? JSON.parse(savedQuotesRaw) : [];
      localStorage.setItem(
        'gb_arn_client_quotes_v1',
        JSON.stringify([fallbackQuote, ...savedQuotes.filter((q) => q.id !== fallbackQuote.id)])
      );
    } catch {
      // ignore
    }

    setRegistrationResult({
      clientName: cleanName,
      clientEmail: cleanEmail,
      companyName: cleanCompany,
      username: fallbackUsername,
      quote: fallbackQuote,
      token: fallbackToken,
    });
    setIsSubmitting(false);

    if (onOpenPortalWithSession) {
      onOpenPortalWithSession();
    }
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
            <span>ARN · Tratamiento de Presupuesto mediante Registro</span>
          </span>
          <span
            className={`text-xs font-mono font-semibold ${
              isDark || variant === 'portal-compact' ? 'text-emerald-300' : 'text-[#291B64]'
            }`}
          >
            Escalas (Micro · PyME · Grande) + Ítem de Dotación en Portal Clientes
          </span>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 text-[11px] font-mono ${
            isDark || variant === 'portal-compact' ? 'text-emerald-300' : 'text-slate-600'
          }`}
        >
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Sin envíos de mail automáticos desde el Home</span>
        </div>
      </div>

      {!registrationResult ? (
        <form onSubmit={(e) => handleRegisterAndOpenPortalQuote(e)} className="space-y-4">
          {/* Step 1: Stock de Servicios ARN Selector */}
          <div className="space-y-1.5">
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                isDark || variant === 'portal-compact' ? 'text-white' : 'text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  1. Elegí el Servicio del Stock ARN que querés presupuestar:
                </span>
              </span>
              <span className="hidden sm:inline text-[11px] font-mono text-emerald-400">
                [{livePricingPreview.stockService.code}] {livePricingPreview.stockService.name}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 snap-x">
              {activeStockItems.map((stk) => {
                const isSelected = livePricingPreview.stockService.id === stk.id;
                return (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() => {
                      setSelectedStockId(stk.id);
                      if (!message.trim()) {
                        setMessage(`Necesitamos implementar ${stk.name}`);
                      }
                      setErrorMsg('');
                    }}
                    className={`snap-start shrink-0 px-3 py-2 min-h-[40px] text-xs font-semibold transition-colors cursor-pointer border text-left ${
                      isSelected
                        ? isDark || variant === 'portal-compact'
                          ? 'bg-emerald-400 text-emerald-950 border-emerald-300 font-bold'
                          : 'bg-[#291B64] text-white border-[#291B64] font-bold'
                        : isDark || variant === 'portal-compact'
                        ? 'bg-white/[0.07] hover:bg-white/15 text-white border-white/15'
                        : 'bg-[#F5F5F8] hover:bg-slate-200 text-[#1D1D1F] border-black/10'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-75 mr-1.5">[{stk.code}]</span>
                    <span>{stk.name.split('&')[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Mandatory Employee Headcount Condition -> Determines Scale (Micro / PyME / Grande) */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold ${
                  isDark || variant === 'portal-compact' ? 'text-white' : 'text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  2. Cantidad de Empleados de tu Empresa (Ítem que determina Escala Micro · PyME · Grande):
                </span>
              </label>
              <span
                className={`text-[11px] font-mono font-bold ${
                  isDark || variant === 'portal-compact' ? 'text-emerald-300' : 'text-[#291B64]'
                }`}
              >
                Escala detectada: {livePricingPreview.companyScaleLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {EMPLOYEE_SCALE_OPTIONS.map((opt) => {
                const isSelected = employeeCount === opt.count;
                return (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() => setEmployeeCount(opt.count)}
                    className={`p-2.5 text-left border transition-all cursor-pointer min-h-[54px] flex flex-col justify-between ${
                      isSelected
                        ? isDark || variant === 'portal-compact'
                          ? 'bg-emerald-400 text-emerald-950 border-emerald-300 font-bold shadow-md'
                          : 'bg-[#291B64] text-white border-[#291B64] font-bold shadow-md'
                        : isDark || variant === 'portal-compact'
                        ? 'bg-black/40 hover:bg-white/10 text-neutral-200 border-white/15'
                        : 'bg-[#F7F7FA] hover:bg-slate-200/70 text-slate-800 border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold leading-tight">{opt.shortLabel}</div>
                    <div
                      className={`text-[10px] font-mono mt-1 ${
                        isSelected
                          ? isDark || variant === 'portal-compact'
                            ? 'text-emerald-900'
                            : 'text-emerald-300'
                          : 'opacity-70'
                      }`}
                    >
                      {opt.rangeLabel}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Qualitative Value Proposition Preview (Confidential Pricing inside Registered Portal) */}
            <div
              className={`p-3.5 border space-y-2.5 ${
                isDark || variant === 'portal-compact'
                  ? 'bg-black/45 border-emerald-400/25 text-neutral-200'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-current/10">
                <div className="text-xs font-mono font-bold text-emerald-400">
                  PROPUESTA DE VALOR DEL STOCK: [{livePricingPreview.stockService.code}]{' '}
                  {livePricingPreview.stockService.name}
                </div>
                <div className="text-[11px] font-mono opacity-80">
                  Plazo estimado: {livePricingPreview.estimatedTimeline}
                </div>
              </div>

              <p className="text-xs leading-relaxed opacity-90">
                {livePricingPreview.stockService.valueProposition}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {livePricingPreview.stockService.deliverables.map((deliv, i) => (
                  <span
                    key={i}
                    className={`text-[11px] font-mono px-2 py-0.5 border ${
                      isDark || variant === 'portal-compact'
                        ? 'bg-white/[0.04] border-white/10 text-neutral-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    ✓ {deliv}
                  </span>
                ))}
              </div>

              <div
                className={`p-3 border space-y-2 text-xs font-mono ${
                  isDark || variant === 'portal-compact'
                    ? 'bg-emerald-950/40 border-emerald-400/30 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-current/15 font-bold">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      VALORES DEL STOCK HABILITADOS EN TU SESIÓN ACTIVA ({livePricingPreview.companyScale.toUpperCase()}):
                    </span>
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-400 text-emerald-950 font-bold">
                    Total: {livePricingPreview.currency} $
                    {livePricingPreview.totalImplementationCost.toLocaleString()} + SLA{' '}
                    {livePricingPreview.currency} $
                    {livePricingPreview.monthlySupportFee.toLocaleString()}/mes
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center justify-between gap-2 p-1.5 bg-black/20">
                    <span>1. Base {livePricingPreview.companyScaleLabel}</span>
                    <span className="font-bold">
                      {livePricingPreview.currency} $
                      {livePricingPreview.baseImplementationCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-1.5 bg-black/20">
                    <span>2. Dotación: {livePricingPreview.employeeRangeLabel}</span>
                    <span className="font-bold">
                      {livePricingPreview.currency} $
                      {livePricingPreview.scaleIncrementCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Active Session Confirmation to Open & Treat Quote in Portal Clientes */}
          <div
            className={`p-4 border space-y-3 ${
              isDark || variant === 'portal-compact'
                ? 'bg-black/40 border-white/15'
                : 'bg-[#F7F7FA] border-slate-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {variant === 'portal-compact' && email
                    ? `3. Cuenta registrada activa (${email}) · Iniciá el proceso 40/40/20 para tu empresa:`
                    : '3. Confirmá los datos de tu cuenta registrada para iniciar el proceso 40/40/20 en el Portal:'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                Usuario registrado · Proceso vinculado a {email || 'tu correo'}
              </span>
            </div>

            {variant === 'portal-compact' && email && fullName ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                <div className="md:col-span-4 p-2.5 bg-emerald-400/10 border border-emerald-400/30 text-xs font-mono text-emerald-200 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="font-bold text-white">{fullName}</span> · {email}
                  </div>
                  <span className="px-1.5 py-0.5 text-[10px] bg-emerald-400 text-emerald-950 font-bold shrink-0">
                    VERIFICADO
                  </span>
                </div>
                <div className="md:col-span-4 relative">
                  <Building2 className="w-3.5 h-3.5 opacity-50 absolute left-3 top-1/2 -translate-y-1/2 text-white" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Empresa / Razón Social *"
                    className="w-full pl-8 pr-3 py-2.5 min-h-[44px] text-xs border bg-black/60 text-white placeholder:text-neutral-400 border-white/20 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-4 flex items-stretch gap-1.5">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Alcance específico o nota (opcional)..."
                    className="flex-1 min-h-[44px] px-3 py-2.5 text-xs border bg-black/60 text-white placeholder:text-neutral-400 border-white/20 focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    title="Dictar requerimiento por voz"
                    className={`px-3 min-h-[44px] shrink-0 inline-flex items-center justify-center border transition-colors cursor-pointer ${
                      isListeningVoice
                        ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                        : 'bg-white/10 hover:bg-white/20 text-emerald-300 border-white/20'
                    }`}
                  >
                    {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <div className="md:col-span-12 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[46px] px-5 py-3 text-xs sm:text-sm font-mono font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span>Generando Presupuesto 40/40/20 en tu Cuenta...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>Iniciar Proceso y Emitir Presupuesto 40/40/20 en Mi Cuenta ({email})</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-mono uppercase opacity-75 mb-1">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Ej: Martín Rodríguez"
                      className={`w-full px-3 py-2.5 min-h-[44px] text-xs border focus:outline-none ${
                        isDark || variant === 'portal-compact'
                          ? 'bg-black/60 text-white placeholder:text-neutral-400 border-white/20 focus:border-emerald-400'
                          : 'bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 focus:border-[#291B64]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase opacity-75 mb-1">
                      Empresa / Razón Social *
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="Ej: Bodega Austral S.A."
                        className={`w-full pl-8 pr-3 py-2.5 min-h-[44px] text-xs border focus:outline-none ${
                          isDark || variant === 'portal-compact'
                            ? 'bg-black/60 text-white placeholder:text-neutral-400 border-white/20 focus:border-emerald-400'
                            : 'bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 focus:border-[#291B64]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase opacity-75 mb-1">
                      Email Corporativo (Usuario) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="tu-nombre@empresa.com"
                      className={`w-full px-3 py-2.5 min-h-[44px] text-xs font-mono border focus:outline-none ${
                        isDark || variant === 'portal-compact'
                          ? 'bg-black/60 text-white placeholder:text-neutral-400 border-white/20 focus:border-emerald-400'
                          : 'bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 focus:border-[#291B64]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase opacity-75 mb-1">
                      Clave de Acceso al Portal *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Creá tu clave"
                        className={`w-full pl-8 pr-3 py-2.5 min-h-[44px] text-xs font-mono border focus:outline-none ${
                          isDark || variant === 'portal-compact'
                            ? 'bg-black/60 text-white placeholder:text-neutral-400 border-white/20 focus:border-emerald-400'
                            : 'bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 focus:border-[#291B64]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Context / WhatsApp + Submit */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-stretch pt-1">
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="WhatsApp (opcional: +54 9...)"
                      className={`w-full h-full min-h-[46px] px-3 py-2.5 text-xs font-mono border focus:outline-none ${
                        isDark || variant === 'portal-compact'
                          ? 'bg-black/60 text-white placeholder:text-neutral-400 border-white/20 focus:border-emerald-400'
                          : 'bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 focus:border-[#291B64]'
                      }`}
                    />
                  </div>

                  <div className="md:col-span-4 flex items-stretch gap-1.5">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Nota adicional o requerimiento específico (opcional)..."
                      className={`flex-1 min-h-[46px] px-3 py-2.5 text-xs border focus:outline-none ${
                        isDark || variant === 'portal-compact'
                          ? 'bg-black/60 text-white placeholder:text-neutral-400 border-white/20 focus:border-emerald-400'
                          : 'bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 focus:border-[#291B64]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={toggleVoiceDictation}
                      title="Dictar requerimiento por voz"
                      className={`px-3 min-h-[46px] shrink-0 inline-flex items-center justify-center border transition-colors cursor-pointer ${
                        isListeningVoice
                          ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                          : isDark || variant === 'portal-compact'
                          ? 'bg-white/10 hover:bg-white/20 text-emerald-300 border-white/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-[#291B64] border-slate-300'
                      }`}
                    >
                      {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="md:col-span-5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-full min-h-[46px] px-5 py-3 text-xs sm:text-sm font-mono font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                          <span>Registrando Cuenta y Abriendo Portal...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span>Registrarme y Tratar Presupuesto 40/40/20 en Mi Portal</span>
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-400/50 text-xs font-mono text-rose-200">
              {errorMsg}
            </div>
          )}
        </form>
      ) : (
        /* REGISTRATION COMPLETED -> DIRECT ACCESS TO PORTAL CLIENTES */
        <div className="space-y-4 animate-fadeIn">
          <div
            className={`p-5 border space-y-3 ${
              isDark || variant === 'portal-compact'
                ? 'bg-emerald-950/40 border-emerald-400/40 text-white'
                : 'bg-emerald-50 border-emerald-600/30 text-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-emerald-400">
                    CUENTA REGISTRADA Y PRESUPUESTO VINCULADO EN PORTAL CLIENTES
                  </div>
                  <div className="text-base font-bold">
                    {registrationResult.clientName} · {registrationResult.companyName} (
                    {registrationResult.clientEmail})
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-mono font-bold bg-emerald-400 text-emerald-950">
                {registrationResult.quote.quoteNumber}
              </span>
            </div>

            <p className="text-xs leading-relaxed opacity-90">
              Tu presupuesto <strong>{registrationResult.quote.quoteNumber}</strong> (
              <strong>[{registrationResult.quote.stockServiceCode}]</strong> ·{' '}
              {registrationResult.quote.employeeRangeLabel}) ya se encuentra disponible dentro de tu{' '}
              <strong>Portal de Clientes</strong> con el desglose de los 2 ítems (Escala Base +
              Condición de Dotación de Empleados) y los 3 hitos 40/40/20.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              {onOpenPortalWithSession && (
                <button
                  type="button"
                  onClick={onOpenPortalWithSession}
                  className="min-h-[48px] px-4 py-3 text-xs font-mono font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Ir a Mi Portal Clientes a Tratar el Presupuesto</span>
                </button>
              )}

              {onWhatsAppClick && (
                <button
                  type="button"
                  onClick={() =>
                    onWhatsAppClick(
                      `Hola Gastón, me acabo de registrar en el Portal Clientes (${registrationResult.clientEmail}) para evaluar el presupuesto ${registrationResult.quote.quoteNumber} ([${registrationResult.quote.stockServiceCode}] · ${registrationResult.quote.employeeRangeLabel}) de ${registrationResult.companyName}.`
                    )
                  }
                  className="min-h-[48px] px-4 py-3 text-xs font-mono font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Consultar por WhatsApp</span>
                </button>
              )}

              {onScheduleClick && (
                <button
                  type="button"
                  onClick={() =>
                    onScheduleClick(
                      `Revisión de Presupuesto en Portal ${registrationResult.quote.quoteNumber} (${registrationResult.companyName})`
                    )
                  }
                  className="min-h-[48px] px-4 py-3 text-xs font-mono font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Agendar Google Meet (30m)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
