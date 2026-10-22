import React from 'react';
import { ArrowRight, Check, Briefcase, Building, Layers, CheckCircle2 } from 'lucide-react';
import { SECTOR_SOLUTIONS } from '../data/content';
import { OSWindowFrame } from './common/OSWindowFrame';

interface SectorSolutionsSectionProps {
  onSectorSelect: (sectorName: string) => void;
}

export const SectorSolutionsSection: React.FC<SectorSolutionsSectionProps> = ({ onSectorSelect }) => {
  return (
    <section id="soluciones-sectoriales" className="py-16 md:py-24 bg-[#F4F4F4] relative border-b border-blue-900/10 scroll-mt-20">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-xs text-xs font-mono font-semibold">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>PROPUESTA DE VALOR SECTORIAL</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Innovación que escala para organizaciones reales.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            La tecnología no es un departamento de soporte aislado: es el núcleo del modelo operativo. Soluciones arquitectónicas diseñadas para tres verticales estratégicos.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: SECTOR VERTICALS */}
        <OSWindowFrame
          accentTheme="indigo"
          processName="sys/verticals/sector-solutions.spec"
          windowTitle="PROPUESTA DE VALOR SECTORIAL · VERTICALES DE NEGOCIO"
          securityBadge="VERTICALES CORPORATIVOS"
          statusBadge="3 SECTORES EN PRODUCCIÓN"
          portBadge="TLS 1.3 · SECTOR MATRIX"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'VERTICALS', value: 'PyMEs, Cooperativas, Agroindustria', highlight: true },
            { label: 'COMPLIANCE', value: '100% REGULATORIO' },
            { label: 'GOVERNANCE', value: 'CONTINUO' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 text-left">
            {/* 3 OS Bento Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {SECTOR_SOLUTIONS.map((sector) => (
                <div
                  key={sector.number}
                  className="rounded-3xl bg-slate-900/80 border border-indigo-500/20 p-6 sm:p-8 flex flex-col justify-between group hover:border-indigo-400/60 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-950/20"
                >
                  <div>
                    <div className="flex items-center justify-between pb-5 border-b border-white/10">
                      <span className="text-2xl font-mono font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                        {sector.number}
                      </span>
                      <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-widest font-semibold bg-indigo-500/15 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                        Vertical
                      </span>
                    </div>

                    <div className="mt-5">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {sector.title}
                      </h3>
                      <p className="text-xs font-mono text-sky-300 font-medium mt-1">
                        {sector.subtitle}
                      </p>
                    </div>

                    <div className="mt-6 space-y-4">
                      {sector.pillars.map((pillar, pIdx) => (
                        <div key={pIdx} className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{pillar.title}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed pl-5 font-normal">
                            {pillar.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/10">
                    <button
                      onClick={() => onSectorSelect(sector.title)}
                      type="button"
                      className="w-full py-2.5 px-4 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-blue-600 rounded-full border border-white/10 hover:border-blue-500 transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                    >
                      <span>Consultar para este sector</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </OSWindowFrame>

      </div>
    </section>
  );
};
