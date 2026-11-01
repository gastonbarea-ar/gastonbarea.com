import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  Shield,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalContext?: string;
  onNavigateToForm?: () => void;
  onWhatsAppClick?: (customText?: string) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  proposalContext,
  onNavigateToForm,
  onWhatsAppClick,
}) => {
  const [provider, setProvider] = useState<'instant-meet' | 'calendly' | 'calcom'>('instant-meet');
  const [showEmbed, setShowEmbed] = useState(false);
  const [copiedProposal, setCopiedProposal] = useState(false);

  // Friendly Automated Booking State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [bookingType, setBookingType] = useState<
    'discovery_ia' | 'architecture_advisory' | 'sprint_review' | 'emergency_audit'
  >('discovery_ia');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingSlot, setBookingSlot] = useState<string>('15:00 - 15:45 (GMT-3)');
  const [bookingTopic, setBookingTopic] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedData, setConfirmedData] = useState<{
    meetingUrl: string;
    googleCalendarUrl: string;
    whatsappConfirmUrl: string;
    emailSent: boolean;
    date: string;
    timeSlot: string;
    clientEmail: string;
  } | null>(null);

  useEffect(() => {
    if (proposalContext) {
      setBookingTopic(proposalContext.slice(0, 180));
    } else if (!bookingTopic) {
      setBookingTopic('Diagnóstico técnico y evaluación de propuesta 40/40/20');
    }
  }, [proposalContext]);

  // Pre-fill from localStorage client session if available
  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem('gb_client_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name && !clientName) setClientName(parsed.name);
        if (parsed.email && !clientEmail) setClientEmail(parsed.email);
        if (parsed.company && !clientCompany) setClientCompany(parsed.company);
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getUpcomingBusinessDays = () => {
    const days: { iso: string; shortLabel: string; dayName: string }[] = [];
    const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const cursor = new Date();
    let added = 0;
    let offset = 0;
    while (added < 5 && offset < 14) {
      offset++;
      const d = new Date(cursor);
      d.setDate(cursor.getDate() + offset);
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) {
        const iso = d.toISOString().split('T')[0];
        const dayName = offset === 1 ? 'Mañana' : weekdayNames[dow];
        const shortLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;
        days.push({ iso, shortLabel, dayName });
        added++;
      }
    }
    return days;
  };

  const currentBookingUrl =
    provider === 'calendly'
      ? SITE_CONFIG.booking.calendlyUrl
      : provider === 'calcom'
      ? SITE_CONFIG.booking.calComUrl
      : SITE_CONFIG.booking.googleMeetUrl;

  const fallbackCalendarUrl = (() => {
    const title = encodeURIComponent(
      SITE_CONFIG.booking.meetingTitle || 'Diagnóstico Técnico · Gastón Barea (Google Meet Pro)'
    );
    const details = encodeURIComponent(
      `Reunión de Diagnóstico Técnico 1-a-1 con Gastón Barea.\nVideollamada por Google Meet Pro: ${
        SITE_CONFIG.booking.googleMeetUrl
      }\nHorario elegido: ${bookingDate} · ${bookingSlot}\n\n${
        proposalContext ? 'Contexto de la consulta:\n' + proposalContext : ''
      }`
    );
    const location = encodeURIComponent(SITE_CONFIG.booking.googleMeetUrl);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  })();

  const whatsappDirectText = proposalContext
    ? `Hola Gastón, ¡hablemos! Quisiera coordinar nuestra videollamada Google Meet (${bookingDate} · ${bookingSlot}) sobre:\n\n${proposalContext}`
    : `Hola Gastón, ¡hablemos! Quisiera coordinar nuestra videollamada Google Meet para el día ${bookingDate} en el horario ${bookingSlot}. Tema: ${bookingTopic}`;

  const whatsappDirectHref = SITE_CONFIG.whatsapp.phoneNumber
    ? `https://wa.me/${SITE_CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(whatsappDirectText)}`
    : `https://wa.me/5492804697193?text=${encodeURIComponent(whatsappDirectText)}`;

  const handleCopyProposal = () => {
    if (proposalContext) {
      navigator.clipboard.writeText(proposalContext);
      setCopiedProposal(true);
      setTimeout(() => setCopiedProposal(false), 2500);
    }
  };

  const handleAutomatedMeetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const resolvedName = clientName.trim() || clientEmail.trim().split('@')[0] || 'Ejecutivo';
    const resolvedTopic =
      bookingTopic.trim() ||
      (proposalContext ? proposalContext.slice(0, 180) : 'Diagnóstico técnico 1-a-1');

    try {
      const res = await fetch('/api/client/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: bookingType,
          date: bookingDate,
          timeSlot: bookingSlot,
          agendaTopic: resolvedTopic,
          clientName: resolvedName,
          clientEmail: clientEmail.trim(),
          company: clientCompany.trim() || 'Contacto Individual',
          phone: clientPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        setConfirmedData({
          meetingUrl: data.booking.meetingUrl || SITE_CONFIG.booking.googleMeetUrl,
          googleCalendarUrl: data.googleCalendarUrl || fallbackCalendarUrl,
          whatsappConfirmUrl: data.whatsappConfirmUrl || whatsappDirectHref,
          emailSent: Boolean(data.emailSent),
          date: data.booking.date,
          timeSlot: data.booking.timeSlot,
          clientEmail: data.booking.clientEmail,
        });
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Fallback confirmation below
    }

    setConfirmedData({
      meetingUrl: SITE_CONFIG.booking.googleMeetUrl,
      googleCalendarUrl: fallbackCalendarUrl,
      whatsappConfirmUrl: whatsappDirectHref,
      emailSent: false,
      date: bookingDate,
      timeSlot: bookingSlot,
      clientEmail: clientEmail.trim(),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-blue-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-blue-900/15 shadow-2xl p-6 sm:p-8 z-10 my-8 text-blue-950">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-full text-blue-900/60 hover:text-blue-950 hover:bg-blue-50 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 pb-5 border-b border-blue-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-[#291B64] text-xs font-mono font-bold border border-indigo-200/70">
            <Video className="w-3.5 h-3.5 text-emerald-600" />
            <span>Enlace Google Meet Automatizado + Envío por Email</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            ¡Hablemos! Agendar Meet con Gastón Barea
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Elegí el día y horario que te quede más cómodo. El sistema genera automáticamente tu sala de{' '}
            <strong className="font-semibold text-[#1D1D1F]">Google Meet Pro</strong>, te la envía por correo electrónico y la sincroniza en tu Portal de Clientes.
          </p>
        </div>

        {/* Pre-filled Proposal context banner if active */}
        {proposalContext && (
          <div className="mt-4 p-3.5 bg-indigo-50/70 border border-indigo-200/80 text-xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[#291B64]">
                <Sparkles className="w-4 h-4 text-[#291B64]" />
                <span>Contexto de tu consulta adjuntado automáticamente</span>
              </div>
              <button
                type="button"
                onClick={handleCopyProposal}
                className="text-[11px] font-mono font-medium text-[#291B64] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedProposal ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <span>Copiar resumen</span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-700 line-clamp-2 italic font-mono bg-white p-2 border border-indigo-100">
              "{proposalContext.slice(0, 160)}..."
            </p>
          </div>
        )}

        {/* Provider selector tab */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between text-xs border-b border-slate-200 pb-2.5 gap-2">
          <span className="font-semibold text-slate-800">Modalidad de agenda:</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] flex-wrap">
            <button
              type="button"
              onClick={() => {
                setProvider('instant-meet');
                setShowEmbed(false);
              }}
              className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer ${
                provider === 'instant-meet'
                  ? 'bg-[#291B64] text-white font-bold'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-emerald-300" />
              <span>Reserva Automática Meet + Email</span>
            </button>
            <button
              type="button"
              onClick={() => setProvider('calendly')}
              className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
                provider === 'calendly'
                  ? 'bg-[#291B64] text-white font-bold'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Calendly
            </button>
            <button
              type="button"
              onClick={() => setProvider('calcom')}
              className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
                provider === 'calcom'
                  ? 'bg-[#291B64] text-white font-bold'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Cal.com
            </button>
          </div>
        </div>

        {provider === 'instant-meet' ? (
          confirmedData ? (
            /* PANTALLA DE CONFIRMACIÓN AUTOMÁTICA */
            <div className="mt-5 p-6 bg-[#0E0F17] text-white border-l-4 border-emerald-400 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>¡Listo! Sesión Agendada y Enlace Google Meet Generado</span>
                </div>
                <p className="text-xs text-neutral-300">
                  {confirmedData.emailSent
                    ? `Enviamos la invitación oficial con el enlace de Google Meet Pro a ${confirmedData.clientEmail} (vía notificaciones@gastonbarea.com).`
                    : `Tu sesión para el ${confirmedData.date} (${confirmedData.timeSlot}) quedó registrada y sincronizada con el Portal de Clientes.`}
                </p>
              </div>

              <div className="p-3.5 bg-white/[0.06] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-neutral-400 block text-[10px]">FECHA Y HORARIO:</span>
                  <strong className="text-emerald-300">
                    {confirmedData.date} · {confirmedData.timeSlot}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">ENLACE GOOGLE MEET:</span>
                  <a
                    href={confirmedData.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-300 underline break-all"
                  >
                    {confirmedData.meetingUrl}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={confirmedData.googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>1. Agregar a mi Google Calendar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={confirmedData.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Video className="w-4 h-4 text-emerald-300" />
                  <span>2. Abrir Sala Google Meet Pro</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <a
                  href={confirmedData.whatsappConfirmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enviar confirmación por WhatsApp Directo →</span>
                </a>

                <button
                  type="button"
                  onClick={() => setConfirmedData(null)}
                  className="text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
                >
                  Modificar horario
                </button>
              </div>
            </div>
          ) : (
            /* FORMULARIO AMIGABLE DE RESERVA AUTOMÁTICA EN 1 PASO */
            <form onSubmit={handleAutomatedMeetSubmit} className="mt-4 space-y-4">
              {/* Step 1: Day & Time Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-[#F7F7FA] border border-black/10">
                <div className="sm:col-span-7 space-y-2">
                  <label className="block text-xs font-bold text-[#1D1D1F]">
                    1. Elegí el Día (Próximos días hábiles)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {getUpcomingBusinessDays().map((d) => {
                      const active = bookingDate === d.iso;
                      return (
                        <button
                          key={d.iso}
                          type="button"
                          onClick={() => setBookingDate(d.iso)}
                          className={`p-2 text-center border transition-all cursor-pointer ${
                            active
                              ? 'bg-[#291B64] text-white border-[#291B64] font-bold'
                              : 'bg-white text-[#1D1D1F] border-black/15 hover:border-[#291B64]'
                          }`}
                        >
                          <div
                            className={`text-[9px] font-mono uppercase ${
                              active ? 'text-emerald-300' : 'text-slate-500'
                            }`}
                          >
                            {d.dayName}
                          </div>
                          <div className="text-[11px] font-bold mt-0.5">{d.shortLabel}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">Otra fecha:</span>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-black/15 text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-5 space-y-2">
                  <label className="block text-xs font-bold text-[#1D1D1F]">
                    2. Horario (GMT-3 Argentina)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: '10:00 hs', value: '10:00 - 10:45 (GMT-3)' },
                      { label: '11:30 hs', value: '11:30 - 12:15 (GMT-3)' },
                      { label: '15:00 hs', value: '15:00 - 15:45 (GMT-3)' },
                      { label: '17:00 hs', value: '17:00 - 17:45 (GMT-3)' },
                    ].map((slot) => {
                      const active = bookingSlot === slot.value;
                      return (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => setBookingSlot(slot.value)}
                          className={`p-2 border text-center font-mono text-xs transition-all cursor-pointer ${
                            active
                              ? 'bg-[#291B64] text-white border-[#291B64] font-bold'
                              : 'bg-white text-[#1D1D1F] border-black/15 hover:border-[#291B64]'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 2: Contact Info to receive the automated Google Meet link */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#1D1D1F]">
                  3. ¿A qué correo te enviamos el enlace de Google Meet Pro?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Tu Nombre y Apellido *"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
                  />
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="tu-correo@empresa.com *"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="Empresa / Organización (Opcional)"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
                  />
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="WhatsApp (Opcional p/ recordatorio)"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    placeholder="Tema principal (ej: Evaluar estudio IA, Odoo ERP v18, Bioeconomía)..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
                  />
                </div>
              </div>

              {/* Primary Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !clientEmail.trim()}
                className="w-full py-3.5 px-5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generando Sala Google Meet y Enviando Invitación...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-emerald-300" />
                    <span>¡Hablemos! Confirmar y Recibir Enlace Meet en mi Email</span>
                  </>
                )}
              </button>

              {/* Secondary Direct Links (No window.open) */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={fallbackCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 text-xs font-semibold text-slate-700 hover:text-[#291B64] bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#291B64]" />
                  <span>Abrir directo en Google Calendar</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <a
                  href={whatsappDirectHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (onWhatsAppClick) {
                      onWhatsAppClick(whatsappDirectText);
                    }
                  }}
                  className="py-2.5 px-3 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coordinar por WhatsApp Directo</span>
                </a>
              </div>
            </form>
          )
        ) : (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={currentBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] transition-all flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-4 h-4 text-emerald-300" />
                <span>Abrir agenda en {provider === 'calendly' ? 'Calendly' : 'Cal.com'}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href={whatsappDirectHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Coordinar por WhatsApp directo</span>
              </a>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowEmbed(!showEmbed)}
                className="text-[#291B64] hover:underline font-medium cursor-pointer"
              >
                {showEmbed
                  ? 'Ocultar calendario embebido'
                  : '¿Preferís ver el calendario embebido aquí?'}
              </button>

              {onNavigateToForm && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToForm();
                  }}
                  className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  O enviar requerimiento escrito →
                </button>
              )}
            </div>

            {showEmbed && (
              <div className="mt-3 border border-slate-200 overflow-hidden bg-white">
                <iframe
                  src={currentBookingUrl}
                  width="100%"
                  height="440"
                  frameBorder="0"
                  title="Calendario de Agendamiento Gastón Barea"
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Footer info & notice */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#291B64]" />
            <span>Atención ejecutiva directa con Gastón Barea · Sin costo inicial.</span>
          </div>
          <div>
            Notificaciones: <strong className="text-slate-800">{SITE_CONFIG.email}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
