import React, { useState } from 'react';
import { Compass, Send, X, ArrowRight, RefreshCw, Video } from 'lucide-react';

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
}

export const AiWebNavigatorDock: React.FC<AiWebNavigatorDockProps> = ({
  onNavigateToSolution,
  onScheduleClick,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reply, setReply] = useState<string>('');
  const [matched, setMatched] = useState<MatchedSolution | null>(null);

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

  return (
    <div className="fixed bottom-4 inset-x-0 z-30 px-4 pointer-events-none flex flex-col items-center">
      {/* Expanded Interactive Solution Card (Only when user opens it) */}
      {isOpen && (
        <div className="pointer-events-auto w-full max-w-2xl mb-2.5 rounded-none bg-[#121216]/95 backdrop-blur-2xl text-white border border-white/15 p-5 shadow-2xl space-y-4 text-left">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="text-xs font-mono text-emerald-400">
              Guía IA de la Web · Encontrá tu Solución en gastonbarea.com
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-neutral-400 hover:text-white rounded-none cursor-pointer"
              aria-label="Cerrar guía IA"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

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
                className="px-2.5 py-1 text-xs font-medium bg-white/10 hover:bg-white hover:text-[#0A0A0C] rounded-none transition-colors cursor-pointer whitespace-nowrap"
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

      {/* Sleek Apple Spotlight Command Bar (Single-Row, <48px tall) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) {
            handleSearchSolution();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="pointer-events-auto w-full max-w-xl rounded-none bg-[#1D1D1F]/95 backdrop-blur-xl text-white border border-white/15 px-3.5 py-2 shadow-lg flex items-center gap-2.5"
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer whitespace-nowrap shrink-0 pl-1"
        >
          <Compass className="w-4 h-4" />
          <span className="hidden sm:inline">Guía IA Web</span>
        </button>

        <span className="text-white/20 hidden sm:inline" aria-hidden="true">
          |
        </span>

        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Preguntale a la web qué solución necesitás..."
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
