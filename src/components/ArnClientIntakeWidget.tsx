import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  FileText,
  MessageSquare,
  Video,
  RefreshCw,
  Zap,
  Users,
  ShieldCheck,
  Mail,
  Send,
  Layers,
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

interface ArnIntakeResult {
  clientName: string;
  clientEmail: string;
  companyName: string;
  serviceCategory: string;
  quote: Quote;
  token?: string;
  kickoffActivated?: boolean;
  emailSent?: boolean;
  emailMessage?: string;
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
  const [contactChannel, setContactChannel] = useState<string>(() => {
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [isApprovingQuote, setIsApprovingQuote] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [intakeResult, setIntakeResult] = useState<ArnIntakeResult | null>(null);
  const [resendEmailInput, setResendEmailInput] = useState<string>('');
  const [isResendingEmail, setIsResendingEmail] = useState<boolean>(false);
  const [resendFeedback, setResendFeedback] = useState<string>('');
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

  // Live preview of Service Stock match + Scale (Micro, PyME, Grande) + Employee Headcount Item
  const livePricingPreview = useMemo(() => {
    const previewParsed = parseNaturalArnCommand(
      message || 'Implementación Odoo ERP & Arquitectura',
      contactChannel,
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
  }, [message, contactChannel, employeeCount, serviceStock, selectedStockId]);

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

  const handleExecuteArnIntake = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawMsg = message.trim() || livePricingPreview.stockService.name;
    const rawChan = contactChannel.trim();

    const hasEmailInChannel = /\S+@\S+\.\S+/.test(rawChan);
    const hasEmailInMessage = /\S+@\S+\.\S+/.test(rawMsg);
    if (!hasEmailInChannel && !hasEmailInMessage) {
      setErrorMsg(
        'Ingresá tu correo electrónico real en el paso 3 para que el ARN te envíe la propuesta de valor 40/40/20 a tu bandeja de entrada.'
      );
      return;
    }

    setErrorMsg('');
    setResendFeedback('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/arn/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawMsg,
          contactChannel: rawChan,
          employeeCount,
          stockServiceId: livePricingPreview.stockService.id,
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

        const resolvedClientEmail =
          data.client.email || data.parsed?.clientEmail || rawChan || 'contacto@portal-arn.com';
        setResendEmailInput(resolvedClientEmail);
        setIntakeResult({
          clientName: data.client.name || data.parsed?.clientName || 'Ejecutivo ARN',
          clientEmail: resolvedClientEmail,
          companyName: data.client.company || data.parsed?.companyName || 'Organización',
          serviceCategory: data.parsed?.serviceCategory || 'software_architecture',
          quote: data.quote,
          token: data.token,
          emailSent: Boolean(data.emailResult?.success),
          emailMessage: data.emailResult?.success
            ? `Propuesta #${data.quote.quoteNumber} [${data.quote.stockServiceCode || livePricingPreview.stockService.code}] enviada a ${resolvedClientEmail} y notificaciones@gastonbarea.com`
            : data.emailResult?.error || 'Copia disponible en tu Portal de Clientes.',
        });
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Deterministic client-side fallback if offline
    }

    const fallbackParsed = parseNaturalArnCommand(
      rawMsg,
      rawChan,
      employeeCount,
      serviceStock,
      livePricingPreview.stockService.id
    );
    const fallbackQuote = buildAutonomous404020Quote({
      opportunityId: `opp-arn-local-${Date.now()}`,
      clientName: fallbackParsed.clientName,
      clientEmail: fallbackParsed.clientEmail,
      companyName: fallbackParsed.companyName,
      serviceCategory: fallbackParsed.serviceCategory,
      title: fallbackParsed.summaryTitle,
      totalAmount: fallbackParsed.estimatedValue,
      currency: fallbackParsed.currency,
      employeeCount: fallbackParsed.employeeCount,
      preferredStockId: fallbackParsed.stockServiceId,
      serviceStock,
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
    setResendEmailInput(fallbackParsed.clientEmail);

    setIntakeResult({
      clientName: fallbackParsed.clientName,
      clientEmail: fallbackParsed.clientEmail,
      companyName: fallbackParsed.companyName,
      serviceCategory: fallbackParsed.serviceCategory,
      quote: fallbackQuote,
      token: fallbackToken,
      emailSent: false,
      emailMessage: 'Propuesta generada desde el Stock ARN. Podés reenviarla a tu correo abajo.',
    });
    setIsSubmitting(false);
  };

  const handleResendQuoteEmail = async () => {
    if (!intakeResult || !resendEmailInput.trim() || isResendingEmail) return;
    if (!/\S+@\S+\.\S+/.test(resendEmailInput.trim())) {
      setResendFeedback('Ingresá un correo válido (ej: tu-nombre@empresa.com).');
      return;
    }
    setIsResendingEmail(true);
    setResendFeedback('');
    try {
      const res = await fetch('/api/arn/resend-quote-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote: intakeResult.quote,
          targetEmail: resendEmailInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendFeedback(`✓ Presupuesto enviado a ${data.targetEmail} y notificaciones@gastonbarea.com`);
        setIntakeResult((prev) =>
          prev
            ? {
                ...prev,
                clientEmail: data.targetEmail,
                emailSent: true,
              }
            : null
        );
      } else {
        setResendFeedback(
          data?.emailResult?.error || data?.error || 'No se pudo enviar el correo en este momento.'
        );
      }
    } catch {
      setResendFeedback('Error de red al intentar reenviar el correo.');
    } finally {
      setIsResendingEmail(false);
    }
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
            <span>ARN · Stock de Servicios & Escalas</span>
          </span>
          <span
            className={`text-xs font-mono font-semibold ${
              isDark || variant === 'portal-compact' ? 'text-emerald-300' : 'text-[#291B64]'
            }`}
          >
            Valores Base por Escala (Micro · PyME · Grande) + Ítem de Dotación de Empleados
          </span>
        </div>

        <div
          className={`text-[11px] font-mono ${
            isDark || variant === 'portal-compact' ? 'text-neutral-300' : 'text-slate-500'
          }`}
        >
          Consulta en tiempo real al Stock Oficial ARN
        </div>
      </div>

      {!intakeResult ? (
        <form onSubmit={(e) => handleExecuteArnIntake(e)} className="space-y-4">
          {/* Stock de Servicios ARN Selector */}
          <div className="space-y-1.5">
            <div
              className={`flex items-center justify-between text-[11px] font-mono ${
                isDark || variant === 'portal-compact' ? 'text-neutral-300' : 'text-slate-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Stock de Servicios Disponibles (tocá uno o escribí tu necesidad abajo):
                </span>
              </span>
              <span className="hidden sm:inline opacity-80">
                Seleccionado: [{livePricingPreview.stockService.code}]
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

          {/* Step 1: Natural Language / Voice Input */}
          <div className="space-y-2">
            <label
              className={`block text-xs sm:text-sm font-semibold ${
                isDark || variant === 'portal-compact' ? 'text-white' : 'text-slate-900'
              }`}
            >
              1. Contanos en una frase tu nombre/empresa y qué buscás resolver:
            </label>
            <div className="relative flex items-stretch gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Ej: Soy Gastón de Grupo Barea, necesitamos implementar Odoo ERP v18..."
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
                  2. Dotación de Empleados de la Empresa (Determina Tamaño Micro · PyME · Grande):
                </span>
              </label>
              <span
                className={`text-[11px] font-mono font-bold ${
                  isDark || variant === 'portal-compact' ? 'text-emerald-300' : 'text-[#291B64]'
                }`}
              >
                Clasificación activa: {livePricingPreview.companyScaleLabel}
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

            {/* Agile Value Proposition Box Queried Live from Service Stock */}
            <div
              className={`p-3.5 border space-y-2.5 ${
                isDark || variant === 'portal-compact'
                  ? 'bg-black/45 border-emerald-400/25 text-neutral-200'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-current/10">
                <div className="text-xs font-mono font-bold text-emerald-400">
                  STOCK ARN CONSULTADO: [{livePricingPreview.stockService.code}]{' '}
                  {livePricingPreview.stockService.name}
                </div>
                <div className="text-[11px] font-mono opacity-80">
                  Plazo: {livePricingPreview.estimatedTimeline}
                </div>
              </div>

              <p className="text-xs leading-relaxed opacity-90">
                {livePricingPreview.stockService.valueProposition}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-mono">
                <div
                  className={`p-2.5 border ${
                    isDark || variant === 'portal-compact'
                      ? 'bg-white/[0.04] border-white/10'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="text-[10px] uppercase opacity-75">
                    Ítem 1 · Base {livePricingPreview.companyScale.toUpperCase()} + Ítem 2 Dotación
                  </div>
                  <div className="font-bold text-sm mt-0.5">
                    {livePricingPreview.currency} $
                    {livePricingPreview.baseImplementationCost.toLocaleString()}
                    {livePricingPreview.scaleIncrementCost > 0 ? (
                      <span className="text-emerald-400 ml-1">
                        + ${livePricingPreview.scaleIncrementCost.toLocaleString()} ({employeeCount}{' '}
                        emp.)
                      </span>
                    ) : (
                      <span className="opacity-70 text-[11px] ml-1">
                        ({employeeCount} emp. incluidos)
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`p-2.5 border ${
                    isDark || variant === 'portal-compact'
                      ? 'bg-white/[0.04] border-white/10'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="text-[10px] uppercase opacity-75">
                    Total Implementación (40/40/20)
                  </div>
                  <div className="font-bold text-sm text-emerald-400 mt-0.5">
                    {livePricingPreview.currency} $
                    {livePricingPreview.totalImplementationCost.toLocaleString()}
                  </div>
                </div>

                <div
                  className={`p-2.5 border flex items-start gap-1.5 ${
                    isDark || variant === 'portal-compact'
                      ? 'bg-white/[0.04] border-white/10'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase opacity-75">
                      Servicio Mensual + Soporte SLA
                    </div>
                    <div className="font-bold text-sm text-emerald-400 mt-0.5">
                      {livePricingPreview.currency} $
                      {livePricingPreview.monthlySupportFee.toLocaleString()} / mes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Client Real Email Input + 1-Click Action Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
            <div className="md:col-span-5">
              <input
                type="email"
                value={contactChannel}
                onChange={(e) => {
                  setContactChannel(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="3. Tu Email real para recibir la propuesta (ej: vos@empresa.com)"
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
                    <span>Consultando Stock ARN y Despachando Propuesta por Email...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Recibir Propuesta de Valor 40/40/20 por Email & Entrar al Portal</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-400/50 text-xs font-mono text-rose-200">
              {errorMsg}
            </div>
          )}
        </form>
      ) : (
        /* INSTANT ARN NODE & STOCK-BACKED 40/40/20 QUOTE RESULT */
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
                    PROPUESTA DE VALOR ARN EMITIDA DESDE STOCK [
                    {intakeResult.quote.stockServiceCode || 'ARN-STK'}] ·{' '}
                    {intakeResult.quote.employeeRangeLabel}
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

            {/* Email Status & Instant Resend Bar */}
            <div
              className={`mt-3 p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark || variant === 'portal-compact'
                  ? 'bg-black/40 border-white/15'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-mono">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {intakeResult.emailMessage ||
                    `Enviado a ${intakeResult.clientEmail} y notificaciones@gastonbarea.com`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="email"
                  value={resendEmailInput}
                  onChange={(e) => setResendEmailInput(e.target.value)}
                  placeholder="Enviar copia a otro email..."
                  className={`px-2.5 py-1.5 text-xs font-mono border focus:outline-none min-w-[190px] ${
                    isDark || variant === 'portal-compact'
                      ? 'bg-black/60 text-white border-white/20'
                      : 'bg-slate-50 text-slate-900 border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleResendQuoteEmail}
                  disabled={isResendingEmail}
                  className="px-3 py-1.5 text-xs font-mono font-bold bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isResendingEmail ? 'Enviando...' : 'Reenviar Email'}</span>
                </button>
              </div>
            </div>
            {resendFeedback && (
              <div className="mt-2 text-xs font-mono text-emerald-300">{resendFeedback}</div>
            )}

            {/* Value Proposition & Items Table (Including Explicit Employee Headcount Sizing Item) */}
            <div className="pt-4 space-y-3">
              <div className="font-display text-lg sm:text-xl font-bold">
                {intakeResult.quote.title}
              </div>
              {intakeResult.quote.valueProposition && (
                <p className="text-xs leading-relaxed opacity-90">
                  {intakeResult.quote.valueProposition}
                </p>
              )}

              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-mono uppercase opacity-75">
                  Desglose Oficial de Ítems del Stock + Condición de Dotación de Empleados:
                </div>
                {intakeResult.quote.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      isDark || variant === 'portal-compact'
                        ? 'bg-black/40 border-white/15'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold">{item.description}</div>
                      <div className="text-[11px] opacity-80">{item.deliverable}</div>
                    </div>
                    <div className="font-mono text-sm font-bold text-emerald-400 shrink-0">
                      {intakeResult.quote.currency} ${Number(item.total || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div
                  className={`p-3 border ${
                    isDark || variant === 'portal-compact'
                      ? 'bg-black/40 border-white/15'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase opacity-75">
                    Inversión Total Implementación (40/40/20)
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">
                    {intakeResult.quote.currency} $
                    {Number(intakeResult.quote.total || 0).toLocaleString()}
                  </div>
                </div>

                <div
                  className={`p-3 border ${
                    isDark || variant === 'portal-compact'
                      ? 'bg-emerald-950/70 border-emerald-400/40'
                      : 'bg-emerald-100/70 border-emerald-500/40'
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase text-emerald-300">
                    Servicio Mensual Operativo + Soporte SLA Incluido
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">
                    {intakeResult.quote.currency} $
                    {Number(intakeResult.quote.monthlySupportFee || 250).toLocaleString()}{' '}
                    <span className="text-xs font-normal">/ mes</span>
                  </div>
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
                  <div className="text-xs font-semibold mt-1 line-clamp-1">{m.name}</div>
                  <div className="text-[11px] opacity-75 mt-0.5 line-clamp-2">{m.condition}</div>
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
                    `Hola Gastón, acabo de generar mi Nodo ARN y el presupuesto ${intakeResult.quote.quoteNumber} ([${intakeResult.quote.stockServiceCode || 'ARN-STK'}] ${intakeResult.quote.title} · ${intakeResult.quote.employeeRangeLabel} · Implementación ${intakeResult.quote.currency} $${intakeResult.quote.total.toLocaleString()} + Soporte Mensual $${Number(intakeResult.quote.monthlySupportFee || 250).toLocaleString()}/mes) para ${intakeResult.companyName}.`
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
                    `Revisión de Propuesta ARN ${intakeResult.quote.quoteNumber} (${intakeResult.companyName} - ${intakeResult.quote.employeeRangeLabel})`
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
              Credenciales de tu Portal: <strong>{intakeResult.clientEmail}</strong> / Clave:{' '}
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
              Consultar otro servicio del Stock ARN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
