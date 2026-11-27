import React, { useState, useEffect } from 'react';
import {
  Compass,
  Send,
  X,
  ArrowRight,
  RefreshCw,
  Video,
  Zap,
  UserCheck,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { PageSectionId } from './Header';

interface MatchedSolution {
  serviceCode: string;
  serviceTitle: string;
  sectionId: string;
  timeline: string;
  summary: string;
  ctaLabel: string;
}

interface AiWebNavigatorDockProps {
  activePage?: PageSectionId;
  onNavigateToSolution: (sectionId: string, serviceCode?: string) => void;
  onScheduleClick: (context?: string) => void;
  onClientPortalClick?: () => void;
  onWhatsAppClick?: (customText?: string) => void;
}

const WhatsAppGlyph: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const AiWebNavigatorDock: React.FC<AiWebNavigatorDockProps> = ({
  activePage = 'inicio',
  onNavigateToSolution,
  onScheduleClick,
  onClientPortalClick,
  onWhatsAppClick,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reply, setReply] = useState<string>('');
  const [matched, setMatched] = useState<MatchedSolution | null>(null);
  const [isVisibleByScroll, setIsVisibleByScroll] = useState<boolean>(false);

  const openPortalGate = () => {
    setIsOpen(false);
    if (onClientPortalClick) {
      onClientPortalClick();
    } else {
      window.location.hash = '#portal';
    }
  };

  // Show dock immediately on inner pages; on Home reveal smoothly once user scrolls past Hero video
  useEffect(() => {
    const checkVisibility = () => {
      if (activePage !== 'inicio') {
        setIsVisibleByScroll(true);
        return;
      }
      setIsVisibleByScroll(window.scrollY > 280);
    };
    checkVisibility();
    window.addEventListener('scroll', checkVisibility, { passive: true });
    return () => window.removeEventListener('scroll', checkVisibility);
  }, [activePage]);

  const handleSearchSolution = async (customText?: string) => {
    const text = (customText ?? query).trim();
    if (!text || isLoading) return;
    if (!customText) setQuery('');
    setIsLoading(true);
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

  const handleWhatsAppAction = (customMessage?: string) => {
    setIsOpen(false);
    if (onWhatsAppClick) {
      onWhatsAppClick(customMessage);
    }
  };

  // Before scrolling past Hero on Home, show a single restrained architectural WhatsApp Business button (zero overlap)
  if (!isVisibleByScroll && !isOpen) {
    if (!onWhatsAppClick) return null;
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => handleWhatsAppAction()}
          aria-label="Escribir por WhatsApp Business (+54 9 11 7108-1874)"
          className="min-h-[44px] px-4 py-2.5 bg-[#0F111A]/95 hover:bg-[#15803D] text-white border border-white/15 rounded-none shadow-xl backdrop-blur-xl transition-colors duration-200 inline-flex items-center gap-2.5 text-xs font-mono font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <WhatsAppGlyph className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>WhatsApp 24/7</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-0 sm:bottom-4 inset-x-0 z-40 sm:px-4 pointer-events-none flex flex-col items-center"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto w-full max-w-3xl sm:mb-2.5 max-h-[82vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#0F111A]/96 backdrop-blur-2xl text-white border-t sm:border border-emerald-400/30 p-4 sm:p-5 shadow-2xl space-y-4 text-left"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#291B64] text-white inline-flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Guía IA Web</span>
                </span>

                <button
                  type="button"
                  onClick={openPortalGate}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-400/15 hover:bg-emerald-400 text-emerald-300 hover:text-emerald-950 border border-emerald-400/30 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3" />
                  <span>Cotizador ARN en Mi Portal</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Cerrar consola"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
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
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white hover:text-[#0A0A0C] transition-colors cursor-pointer whitespace-nowrap"
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
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
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
                          className="p-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                          title="Agendar Google Meet Pro"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                        {onWhatsAppClick && (
                          <button
                            type="button"
                            onClick={() =>
                              handleWhatsAppAction(
                                `Hola Gastón, la Guía IA de gastonbarea.com me sugirió "${matched.serviceTitle}" y quiero consultarte por WhatsApp.`
                              )
                            }
                            className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            title="Consultar por WhatsApp Business"
                          >
                            <WhatsAppGlyph className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-400">
                  Escribí abajo qué problema tecnológico, de IA o de bioeconomía buscás resolver y la web te llevará directo a la solución. Para cotizar con ARN, ingresá o registrate en tu Portal de Clientes.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE STICKY BOTTOM BAR (< 640px) */}
      <div className="sm:hidden pointer-events-auto w-full bg-[#0B0D14]/96 backdrop-blur-xl text-white border-t border-white/15 grid grid-cols-4 divide-x divide-white/10 shadow-2xl">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[52px] px-1.5 py-2 flex flex-col items-center justify-center gap-0.5 hover:bg-white/10 text-white font-mono font-semibold text-[10px] cursor-pointer whitespace-nowrap"
        >
          <Compass className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Guía IA</span>
        </button>

        <button
          type="button"
          onClick={openPortalGate}
          className="min-h-[52px] px-1.5 py-2 flex flex-col items-center justify-center gap-0.5 bg-emerald-400 text-emerald-950 font-mono font-bold text-[10px] cursor-pointer whitespace-nowrap"
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Portal ARN</span>
        </button>

        {onWhatsAppClick ? (
          <button
            type="button"
            onClick={() => handleWhatsAppAction()}
            aria-label="Consultar por WhatsApp Business"
            className="min-h-[52px] px-1.5 py-2 flex flex-col items-center justify-center gap-0.5 bg-[#15803D] hover:bg-[#166534] text-white font-mono font-semibold text-[10px] cursor-pointer whitespace-nowrap"
          >
            <WhatsAppGlyph className="w-4 h-4 shrink-0" />
            <span>WhatsApp</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openPortalGate}
            className="min-h-[52px] px-1.5 py-2 flex flex-col items-center justify-center gap-0.5 hover:bg-white/10 text-white font-mono font-semibold text-[10px] cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Cotizar</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            onScheduleClick('Sesión Google Meet Pro agendada desde Barra Móvil');
          }}
          className="min-h-[52px] px-1.5 py-2 flex flex-col items-center justify-center gap-0.5 bg-[#291B64] text-white font-mono font-semibold text-[10px] cursor-pointer whitespace-nowrap"
        >
          <Video className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Meet</span>
        </button>
      </div>

      {/* DESKTOP FLOATING COMMAND BAR (>= 640px) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) {
            handleSearchSolution();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="hidden sm:flex pointer-events-auto w-full max-w-3xl rounded-2xl bg-[#11131D]/92 backdrop-blur-2xl text-white border border-white/15 px-3.5 py-2 shadow-2xl items-center gap-2.5"
      >
        <button
          type="button"
          onClick={openPortalGate}
          className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs font-mono font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>ARN Portal</span>
        </button>

        <span className="text-white/20" aria-hidden="true">
          |
        </span>

        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Preguntale a la Guía IA qué solución necesitás..."
          className="flex-1 text-xs sm:text-[13px] bg-transparent text-white placeholder:text-neutral-400 focus:outline-none min-w-0"
        />

        <button
          type="submit"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Ir</span>
          <Send className="w-3 h-3" />
        </button>

        {onWhatsAppClick && (
          <button
            type="button"
            onClick={() => handleWhatsAppAction()}
            aria-label="Escribir por WhatsApp Business (+54 9 11 7108-1874)"
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold text-white bg-[#15803D] hover:bg-[#166534] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <WhatsAppGlyph className="w-3.5 h-3.5 shrink-0" />
            <span>WhatsApp</span>
          </button>
        )}
      </form>
    </motion.div>
  );
};
