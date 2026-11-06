import React, { useState } from 'react';
import {
  Compass,
  Send,
  X,
  ArrowRight,
  RefreshCw,
  Video,
  Zap,
  UserCheck,
} from 'lucide-react';
import { ArnClientIntakeWidget } from './ArnClientIntakeWidget';

interface MatchedSolution {
  serviceCode: string;
  serviceTitle: string;
  sectionId: string;
  timeline: string;
  summary: string;
  ctaLabel: string;
}

interface AiWebNavigatorDockProps {
  onNavigateToSolution: (sectionId: string, serviceCode?: string) => void;
  onScheduleClick: (context?: string) => void;
  onClientPortalClick?: () => void;
  onWhatsAppClick?: (customText?: string) => void;
}

export const AiWebNavigatorDock: React.FC<AiWebNavigatorDockProps> = ({
  onNavigateToSolution,
  onScheduleClick,
  onClientPortalClick,
  onWhatsAppClick,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeDockMode, setActiveDockMode] = useState<'arn' | 'guide'>('arn');
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reply, setReply] = useState<string>('');
  const [matched, setMatched] = useState<MatchedSolution | null>(null);

  const handleSearchSolution = async (customText?: string) => {
    const text = (customText ?? query).trim();
    if (!text || isLoading) return;
    if (!customText) setQuery('');
    setIsLoading(true);
    setActiveDockMode('guide');
    setIsOpen(true);

    try {
      const response = await fetch('/api/digital-twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: [] }),
      });
      const data = await response.json();
      setReply(
        data.reply ||
          'Hemos identificado la solución dentro de gastonbarea.com que mejor se adapta a tu proyecto.'
      );
      if (data.matchedSolution) {
        setMatched(data.matchedSolution);
      }
    } catch {
      setReply(
        'Desde mis 30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes, te recomiendo explorar el bloque de Soluciones o agendar una sesión de 30 minutos en Google Meet Pro.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 sm:bottom-4 inset-x-0 z-40 sm:px-4 pointer-events-none flex flex-col items-center">
      {/* Expanded Interactive Sheet (ARN Zero-Form Intake OR AI Solution Guide) */}
      {isOpen && (
        <div className="pointer-events-auto w-full max-w-3xl sm:mb-2.5 max-h-[82vh] overflow-y-auto rounded-none bg-[#10121A]/98 backdrop-blur-2xl text-white border-t sm:border border-emerald-400/30 p-4 sm:p-5 shadow-2xl space-y-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveDockMode('arn')}
                className={`px-3 py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  activeDockMode === 'arn'
                    ? 'bg-emerald-400 text-emerald-950'
                    : 'bg-white/10 text-neutral-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>ARN · Cotizar en 1-Clic (Cero Formularios)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDockMode('guide')}
                className={`px-3 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  activeDockMode === 'guide'
                    ? 'bg-[#291B64] text-white'
                    : 'bg-white/10 text-neutral-300 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Guía IA Web</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-none cursor-pointer"
              aria-label="Cerrar consola"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {activeDockMode === 'arn' ? (
            <ArnClientIntakeWidget
              variant="portal-compact"
              onOpenPortalWithSession={() => {
                setIsOpen(false);
                if (onClientPortalClick) {
                  onClientPortalClick();
                } else {
                  window.location.hash = '#portal';
                }
              }}
              onScheduleClick={(ctx) => {
                setIsOpen(false);
                onScheduleClick(ctx);
              }}
              onWhatsAppClick={(txt) => {
                setIsOpen(false);
                if (onWhatsAppClick) onWhatsAppClick(txt);
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Quick Filters inside Dock */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'IA Services & Gemelo Digital', q: 'Integrar IA Services o Gemelo Digital en mi empresa' },
                  { label: 'Bioeconomía & IoT', q: 'Proyecto de bioeconomía y trazabilidad productiva' },
                  { label: 'Odoo ERP & B2B2C', q: 'Implementar Odoo ERP v18 y E-Commerce B2B2C' },
                  { label: 'Dirección PMO 14 Años', q: 'Dirección ejecutiva de proyectos con clientes PMO' },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSearchSolution(item.q)}
                    className="px-2.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white hover:text-[#0A0A0C] rounded-none transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="py-4 flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Analizando tu consulta para ubicarte en la solución exacta...</span>
                </div>
              ) : reply ? (
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                    {reply}
                  </p>
                  {matched && (
                    <div className="p-3.5 rounded-none bg-white/10 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-mono text-emerald-400">
                          {matched.serviceTitle} ({matched.timeline})
                        </div>
                        <div className="text-xs text-neutral-300 mt-0.5 line-clamp-1">
                          {matched.summary}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            onNavigateToSolution(matched.sectionId, matched.serviceCode);
                          }}
                          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <span>{matched.ctaLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            onScheduleClick(`Consulta guiada por IA: ${matched.serviceTitle}`);
                          }}
                          className="p-2 text-white bg-white/10 hover:bg-white/20 rounded-none transition-colors cursor-pointer"
                          title="Agendar Google Meet Pro"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-400">
                  Escribí abajo qué problema tecnológico, de IA o de bioeconomía buscás resolver y la web te llevará directo a la solución.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* MOBILE STICKY BOTTOM BAR (< 640px) — Ergonomic Thumb Bar with 48px Touch Targets */}
      <div className="sm:hidden pointer-events-auto w-full bg-[#0B0D14]/98 backdrop-blur-xl text-white border-t border-white/15 grid grid-cols-3 divide-x divide-white/10 shadow-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveDockMode('arn');
            setIsOpen(!isOpen || activeDockMode !== 'arn');
          }}
          className="min-h-[52px] px-2 py-2 flex flex-col items-center justify-center gap-0.5 bg-emerald-400 text-emerald-950 font-mono font-bold text-[11px] cursor-pointer"
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span>ARN 1-Clic</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            if (onClientPortalClick) {
              onClientPortalClick();
            } else {
              window.location.hash = '#portal';
            }
          }}
          className="min-h-[52px] px-2 py-2 flex flex-col items-center justify-center gap-0.5 hover:bg-white/10 text-white font-mono font-semibold text-[11px] cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Mi Portal</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            onScheduleClick('Sesión Google Meet Pro agendada desde Barra Móvil');
          }}
          className="min-h-[52px] px-2 py-2 flex flex-col items-center justify-center gap-0.5 bg-[#291B64] text-white font-mono font-semibold text-[11px] cursor-pointer"
        >
          <Video className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Agendar Meet</span>
        </button>
      </div>

      {/* DESKTOP COMMAND BAR (>= 640px) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) {
            handleSearchSolution();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="hidden sm:flex pointer-events-auto w-full max-w-2xl rounded-none bg-[#1D1D1F]/95 backdrop-blur-xl text-white border border-white/15 px-3.5 py-2 shadow-lg items-center gap-2.5"
      >
        <button
          type="button"
          onClick={() => {
            setActiveDockMode('arn');
            setIsOpen(!isOpen || activeDockMode !== 'arn');
          }}
          className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs font-mono font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>ARN 1-Clic (Cero Formularios)</span>
        </button>

        <span className="text-white/20" aria-hidden="true">
          |
        </span>

        <input
          type="text"
          value={query}
          onFocus={() => {
            setActiveDockMode('guide');
            setIsOpen(true);
          }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O preguntale a la Guía IA qué solución necesitás..."
          className="flex-1 text-xs sm:text-[13px] bg-transparent text-white placeholder:text-neutral-400 focus:outline-none min-w-0"
        />

        <button
          type="submit"
          className="px-3.5 py-1 text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Ir</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
