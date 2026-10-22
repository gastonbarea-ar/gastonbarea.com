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
  const [provider, setProvider] = useState<'calendly' | 'calcom'>('calendly');
  const [showEmbed, setShowEmbed] = useState(false);
  const [copiedProposal, setCopiedProposal] = useState(false);

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

  const currentBookingUrl =
    provider === 'calendly'
      ? SITE_CONFIG.booking.calendlyUrl
      : SITE_CONFIG.booking.calComUrl;

  const handleOpenSchedulerWindow = () => {
    window.open(currentBookingUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyProposal = () => {
    if (proposalContext) {
      navigator.clipboard.writeText(proposalContext);
      setCopiedProposal(true);
      setTimeout(() => setCopiedProposal(false), 2500);
    }
  };

  const handleWhatsAppBooking = () => {
    const text = proposalContext
      ? `Hola Gastón, quisiera coordinar una llamada de diagnóstico técnico (30 min) sobre la siguiente propuesta:\n\n${proposalContext}`
      : `Hola Gastón, quisiera coordinar una reunión de diagnóstico técnico de 30 minutos sobre arquitectura de software e infraestructura.`;
    if (onWhatsAppClick) {
      onWhatsAppClick(text);
    } else {
      const phone = SITE_CONFIG.whatsapp.phoneNumber;
      const url = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-blue-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-blue-900/10 shadow-2xl p-6 sm:p-8 z-10 my-8 text-blue-950 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-full text-blue-900/60 hover:text-blue-950 hover:bg-blue-50 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 pb-6 border-b border-blue-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-medium border border-blue-200/60">
            <Calendar className="w-3.5 h-3.5" />
            <span>Agenda Técnica Directa · 30 Minutos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-950">
            Reunión de Diagnóstico Técnico
          </h2>
          <p className="text-xs sm:text-sm text-blue-900/75 leading-relaxed font-normal">
            Coordiná una sesión 1-a-1 directa con <strong className="font-semibold text-blue-950">Gastón Barea</strong> para evaluar arquitectura, cuellos de botella de infraestructura o viabilidad de nuevos sistemas.
          </p>
        </div>

        {/* Meeting Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-blue-100/80">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-blue-600 font-medium">DURACIÓN</div>
              <div className="text-xs font-bold text-blue-950">30 minutos</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-blue-100/80">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-blue-600 font-medium">MODALIDAD</div>
              <div className="text-xs font-bold text-blue-950">Google Meet / Zoom</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-blue-100/80">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-emerald-700 font-medium">GARANTÍA</div>
              <div className="text-xs font-bold text-blue-950">Sin costo inicial</div>
            </div>
          </div>
        </div>

        {/* Pre-filled Proposal context banner if active */}
        {proposalContext && (
          <div className="mb-5 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 font-semibold text-blue-950">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Contexto generado con IA listo para adjuntar</span>
              </div>
              <button
                type="button"
                onClick={handleCopyProposal}
                className="text-[11px] font-mono font-medium text-blue-700 hover:text-blue-950 flex items-center gap-1 transition-colors"
              >
                {copiedProposal ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <span>Copiar nota</span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-blue-900/80 line-clamp-2 italic font-mono bg-white/70 p-2 rounded-lg border border-blue-100">
              "{proposalContext.slice(0, 160)}..."
            </p>
          </div>
        )}

        {/* Primary Scheduling Options */}
        <div className="space-y-4">
          {/* Provider selector tab */}
          <div className="flex items-center justify-between text-xs border-b border-blue-100 pb-2">
            <span className="font-semibold text-blue-900">Elegí tu canal de agenda preferido:</span>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setProvider('calendly')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  provider === 'calendly'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                Calendly
              </button>
              <button
                type="button"
                onClick={() => setProvider('calcom')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  provider === 'calcom'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                Cal.com
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Direct Calendly / Cal.com link button */}
            <button
              onClick={handleOpenSchedulerWindow}
              type="button"
              className="w-full py-3.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-2xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 group"
            >
              <CalendarCheck className="w-4 h-4 text-blue-200" />
              <span>Abrir agenda en {provider === 'calendly' ? 'Calendly' : 'Cal.com'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {/* Direct WhatsApp booking */}
            <button
              onClick={handleWhatsAppBooking}
              type="button"
              className="w-full py-3.5 px-4 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 active:scale-[0.98] rounded-2xl border border-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Coordinar por WhatsApp directo</span>
            </button>
          </div>

          {/* Option to toggle embedded view */}
          <div className="pt-2 flex items-center justify-between text-xs text-blue-800">
            <button
              type="button"
              onClick={() => setShowEmbed(!showEmbed)}
              className="text-blue-600 hover:text-blue-800 underline underline-offset-4 font-medium"
            >
              {showEmbed ? 'Ocultar calendario embebido' : '¿Preferís ver el calendario embebido aquí?'}
            </button>

            {onNavigateToForm && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToForm();
                }}
                className="text-blue-700 hover:text-blue-950 font-medium"
              >
                O enviar requerimiento escrito →
              </button>
            )}
          </div>

          {/* Embedded iFrame if toggled */}
          {showEmbed && (
            <div className="mt-4 rounded-2xl border border-blue-200 overflow-hidden bg-white shadow-inner">
              <iframe
                src={currentBookingUrl}
                width="100%"
                height="460"
                frameBorder="0"
                title="Calendario de Agendamiento Gastón Barea"
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Footer info & notice */}
        <div className="mt-6 pt-5 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-blue-800/70 font-mono">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Atención técnica directa sin intermediarios comerciales.</span>
          </div>
          <div>
            Email: <strong className="text-blue-950 font-semibold">{SITE_CONFIG.email}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
