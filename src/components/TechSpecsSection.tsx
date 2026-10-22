import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import { TECH_SPECS_DATA } from '../data/content';
import { OSWindowFrame } from './common/OSWindowFrame';

interface TechSpecsSectionProps {
  onAuditStackClick: () => void;
}

export const TechSpecsSection: React.FC<TechSpecsSectionProps> = ({ onAuditStackClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { label: 'Todos (20)', value: 'Todos' },
    { label: 'Frontend & UI', value: 'Frontend & UI' },
    { label: 'Backend & DB', value: 'Backend & DB' },
    { label: 'Infraestructura & OS', value: 'Infraestructura & OS' },
    { label: 'Data & AI', value: 'Data & AI' },
  ];

  const filteredSpecs = useMemo(() => {
    return TECH_SPECS_DATA.filter((tech) => {
      const matchesCategory = selectedCategory === 'Todos' || tech.category === selectedCategory;
      const matchesQuery =
        searchQuery === '' ||
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="tech-specs" className="py-20 md:py-28 bg-[#F4F4F4] relative border-b border-blue-900/10">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-xs text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>ESPECIFICACIONES TÉCNICAS & HERRAMIENTAS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Tecnologías probadas en producción. Cero ataduras.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Priorizamos software de código abierto y estándares de la industria que garantizan autonomía técnica, bajo costo de licenciamiento y longevidad a 10 años.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: TECH STACK SPECS */}
        <OSWindowFrame
          accentTheme="sky"
          processName="sys/stack/modern-tech-specs.sys"
          windowTitle="MODERN TECH STACK · ESPECIFICACIONES TÉCNICAS & HERRAMIENTAS"
          securityBadge="ZERO VENDOR LOCK-IN"
          statusBadge="20 MÓDULOS ACTIVOS"
          portBadge="KERNEL 6.x · DOCKER V26"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'SPECS_COUNT', value: `${filteredSpecs.length} Tecnologías`, highlight: true },
            { label: 'CODE_AUDIT', value: '100% CÓDIGO PROPIO' },
            { label: 'LATENCY', value: '<45ms EDGE' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 space-y-8 text-left">

            {/* Filter Bar & Search (OS Toolbar) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Segmented Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/90 border border-white/10 rounded-2xl shadow-sm">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat.value
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative min-w-[280px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tecnología o comando..."
                  className="w-full bg-slate-900/90 border border-white/10 text-white pl-11 pr-4 py-2.5 text-xs rounded-2xl placeholder:text-slate-500 focus:outline-none focus:border-blue-400 shadow-sm transition-colors font-mono"
                />
              </div>
            </div>

            {/* Tech Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredSpecs.map((tech) => (
                <div
                  key={tech.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-indigo-400/50 hover:bg-slate-900 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                        {tech.name}
                      </h3>
                      <span className="text-[10px] font-mono text-sky-300 bg-blue-900/40 px-2 py-0.5 rounded-md border border-blue-400/30 font-semibold">
                        {tech.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-2 font-normal">
                      {tech.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 font-medium">Nivel de Dominio:</span>
                    <span className="text-emerald-400 font-bold">
                      {tech.level}
                    </span>
                  </div>
                </div>
              ))}

              {filteredSpecs.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 text-sm font-mono">
                  No se encontraron tecnologías que coincidan con &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>

            {/* Architecture Philosophy OS Card */}
            <div className="mt-8 rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-10 shadow-xl">
              <div className="max-w-3xl space-y-4">
                <div className="text-[11px] font-mono tracking-widest uppercase text-sky-400 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>FILOSOFÍA DE ARQUITECTURA TECNOLÓGICA</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  ¿Por qué elegimos Linux, PostgreSQL, Docker y Odoo?
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Porque tu empresa debe tener el control total de sus datos y su código. Plataformas propietarias costosas aumentan la deuda técnica y limitan la innovación. Diseñamos con cimientos abiertos que permiten migrar entre servidores propios o cualquier proveedor en cuestión de minutos.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onAuditStackClick}
                    type="button"
                    className="px-6 py-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] rounded-full inline-flex items-center gap-2 transition-all shadow-md shadow-blue-600/25 cursor-pointer"
                  >
                    <span>Auditar tu stack actual</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </OSWindowFrame>

      </div>
    </section>
  );
};
