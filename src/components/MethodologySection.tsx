import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, FileText, Workflow, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { METHODOLOGY_PHASES } from '../data/content';
import { OSWindowFrame } from './common/OSWindowFrame';

export const MethodologySection: React.FC = () => {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const currentPhase = METHODOLOGY_PHASES[activePhaseIndex];

  const handlePrev = () => {
    setActivePhaseIndex((prev) => (prev > 0 ? prev - 1 : METHODOLOGY_PHASES.length - 1));
  };

  const handleNext = () => {
    setActivePhaseIndex((prev) => (prev < METHODOLOGY_PHASES.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="metodologia" className="py-20 md:py-28 bg-[#F4F4F4] relative border-b border-blue-900/10">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs text-xs font-mono font-semibold">
            <Workflow className="w-3.5 h-3.5 text-emerald-400" />
            <span>METODOLOGÍA DE INGENIERÍA</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Un proceso riguroso que transforma requerimientos en producción.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Eliminamos la improvisación mediante cuatro fases secuenciales con entregables documentados, validaciones de arquitectura y soporte continuo.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: ENGINEERING PIPELINE */}
        <OSWindowFrame
          accentTheme="emerald"
          processName="sys/methodology/engineering-pipeline.workflow"
          windowTitle="PIPELINE DE INGENIERÍA · 4 FASES DE PRODUCCIÓN"
          securityBadge="ENTREGABLES DOCUMENTADOS"
          statusBadge={`FASE ${currentPhase.number}/4 ACTIVA`}
          portBadge="CI/CD · STAGING · PROD"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'STAGE', value: `Fase ${currentPhase.number}: ${currentPhase.phaseName}`, highlight: true },
            { label: 'QA_CHECK', value: '100% VALIDADO' },
            { label: 'SLA', value: 'CONTINUO' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 space-y-8 text-left">
            
            {/* 4 Stage Pills (OS Task Bar) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {METHODOLOGY_PHASES.map((phase, idx) => {
                const isSelected = activePhaseIndex === idx;

                return (
                  <button
                    key={phase.number}
                    type="button"
                    onClick={() => setActivePhaseIndex(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-400 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400'
                        : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}>
                        FASE {phase.number}
                      </span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>
                    <div className={`text-xs sm:text-sm font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {phase.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      {phase.phaseName}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Spotlight OS Card */}
            <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-10 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
                <div>
                  <div className="text-xs font-mono text-sky-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Fase {currentPhase.number} · {currentPhase.phaseName}
                  </div>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight">
                    {currentPhase.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer border border-white/10"
                    aria-label="Fase anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer border border-white/10"
                    aria-label="Siguiente fase"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {currentPhase.summary}
                </p>

                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-sky-300 mb-3 font-semibold flex items-center gap-2">
                    <span>Actividades Técnicas Ejecutadas en esta Fase:</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentPhase.activities.map((act, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 leading-relaxed font-medium">
                          {act}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formal Deliverable */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 flex items-start gap-3.5">
                  <FileText className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-mono text-sky-300 uppercase tracking-widest font-semibold">
                      Entregable Formal de la Etapa:
                    </div>
                    <div className="text-sm font-bold text-white mt-1">
                      {currentPhase.formalDeliverable}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </OSWindowFrame>

      </div>
    </section>
  );
};
