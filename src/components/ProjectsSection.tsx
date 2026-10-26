import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Video,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import {
  PROJECTS_CATALOG,
  ProductionProject,
  ProjectStatus,
  ProjectCategory,
} from '../data/projectsData';

interface ProjectsSectionProps {
  onSelectProjectForContact: (projectTitle: string, solutionRef: string) => void;
  onAskDigitalTwin: (prompt: string) => void;
  onScheduleClick: (context?: string) => void;
  onClientPortalClick?: () => void;
}

const CATEGORIES: ('Todas' | ProjectCategory)[] = [
  'Todas',
  'IA Services & Gemelos Digitales',
  'Bioeconomía & Trazabilidad IoT',
  'Base Tecnológica (EBTs)',
  'Odoo ERP v18 & B2B2C',
  'Infraestructura Linux & Docker',
];

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProjectForContact,
  onAskDigitalTwin,
  onScheduleClick,
  onClientPortalClick,
}) => {
  const [statusFilter, setStatusFilter] = useState<'todos' | ProjectStatus>('todos');
  const [categoryFilter, setCategoryFilter] = useState<'Todas' | ProjectCategory>('Todas');

  const filteredProjects = useMemo(() => {
    return PROJECTS_CATALOG.filter((proj) => {
      const matchesStatus = statusFilter === 'todos' || proj.status === statusFilter;
      const matchesCategory = categoryFilter === 'Todas' || proj.category === categoryFilter;
      return matchesStatus && matchesCategory;
    });
  }, [statusFilter, categoryFilter]);

  const inProductionCount = useMemo(
    () => PROJECTS_CATALOG.filter((p) => p.status === 'en-produccion').length,
    []
  );
  const completedCount = useMemo(
    () => PROJECTS_CATALOG.filter((p) => p.status === 'realizado').length,
    []
  );

  return (
    <section id="proyectos" className="w-full bg-white text-[#1D1D1F] scroll-mt-16">
      {/* Top Executive Header Block */}
      <div className="w-full py-16 md:py-20 bg-[#0D0D12] text-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 max-w-4xl">
              <div className="text-xs font-mono text-emerald-400 font-semibold">
                PROYECTOS REALIZADOS & EN PRODUCCIÓN · PORTFOLIO EJECUTIVO
              </div>
              <h1
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Sistemas en producción real, plataformas tecnológicas y despliegues ejecutados.
              </h1>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl">
                Cada proyecto combina arquitectura de ingeniería auditable, dirección ejecutiva PMO por hitos verificables (40% Inicio · 40% Staging · 20% Producción) y soberanía tecnológica para el cliente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() =>
                  onScheduleClick('Evaluación de Proyecto desde Portfolio de Proyectos en Producción')
                }
                className="px-5 py-3.5 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4 text-emerald-300" />
                <span>Agendar Revisión de Proyecto</span>
              </button>

              {onClientPortalClick && (
                <button
                  type="button"
                  onClick={onClientPortalClick}
                  className="px-5 py-3.5 text-xs font-mono font-semibold text-white bg-white/10 hover:bg-white/15 rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Portal de Clientes (Staging / Prod)</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Portfolio Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10">
            <div className="space-y-1">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
                {inProductionCount} Activos
              </div>
              <div className="text-xs font-mono text-neutral-300">
                PROYECTOS EN PRODUCCIÓN CONTINUA (24/7)
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {completedCount} Entregados
              </div>
              <div className="text-xs font-mono text-neutral-300">
                ARQUITECTURAS EJECUTADAS Y TRANSFERIDAS
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
                40 · 40 · 20%
              </div>
              <div className="text-xs font-mono text-neutral-300">
                GOBERNANZA PMO CON VALIDACIÓN EN SERVIDOR STAGING
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filter Bar (Status + Solution Vertical) */}
      <div className="w-full bg-[#F6F6F9] border-b border-black/[0.08] px-4 sm:px-8 lg:px-12 xl:px-16 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left">
          {/* Status Filter Tabs */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-[#515154]">
              ESTADO OPERATIVO:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('todos')}
                className={`px-4 py-2 text-xs font-mono font-bold transition-colors cursor-pointer ${
                  statusFilter === 'todos'
                    ? 'bg-[#291B64] text-white'
                    : 'bg-white text-[#1D1D1F] hover:bg-black/[0.05]'
                }`}
              >
                Todos ({PROJECTS_CATALOG.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('en-produccion')}
                className={`px-4 py-2 text-xs font-mono font-bold transition-colors cursor-pointer ${
                  statusFilter === 'en-produccion'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white text-[#1D1D1F] hover:bg-black/[0.05]'
                }`}
              >
                En Producción ({inProductionCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('realizado')}
                className={`px-4 py-2 text-xs font-mono font-bold transition-colors cursor-pointer ${
                  statusFilter === 'realizado'
                    ? 'bg-[#291B64] text-white'
                    : 'bg-white text-[#1D1D1F] hover:bg-black/[0.05]'
                }`}
              >
                Proyectos Realizados ({completedCount})
              </button>
            </div>
          </div>

          {/* Vertical Filter Tabs */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-[#515154]">
              FILTRAR POR SOLUCIÓN / VERTICAL:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-2 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-white text-[#515154] hover:text-[#1D1D1F] hover:bg-black/[0.05]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Projects Ledger (Frameless Open Architectural Rows) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 md:py-20 text-left">
        <div className="divide-y divide-black/[0.1] border-t border-b border-black/[0.1]">
          {filteredProjects.map((project: ProductionProject) => {
            const isProd = project.status === 'en-produccion';
            return (
              <article
                key={project.id}
                className="py-12 first:pt-8 last:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
              >
                {/* Left Column (4 cols): Project Metadata, Status & Impact */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-[#291B64] tabular-nums">{project.code}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-bold ${
                        isProd ? 'text-emerald-800' : 'text-[#291B64]'
                      }`}
                    >
                      {project.statusLabel}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-mono text-[#515154]">{project.category}</div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1D1D1F] leading-tight">
                      {project.title}
                    </h2>
                  </div>

                  <div className="text-xs font-mono text-[#515154] space-y-1 pt-1">
                    <div>
                      <strong className="text-[#1D1D1F]">Sector / Cliente:</strong>{' '}
                      {project.clientOrSector}
                    </div>
                    <div>
                      <strong className="text-[#1D1D1F]">Período & Base:</strong> {project.year} ·{' '}
                      {project.location}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/[0.08]">
                    <div className="text-[11px] font-mono text-[#515154]">
                      IMPACTO & MÉTRICA AUDITABLE
                    </div>
                    <div className="font-mono text-sm font-bold text-[#291B64] pt-0.5">
                      {project.impactMetrics}
                    </div>
                  </div>
                </div>

                {/* Center Column (5 cols): Executive Summary & Technical Architecture */}
                <div className="lg:col-span-5 space-y-5">
                  <p className="text-sm sm:text-base text-[#1D1D1F] leading-relaxed">
                    {project.summary}
                  </p>

                  <div className="space-y-2.5">
                    <div className="text-xs font-mono font-bold text-[#515154]">
                      INGENIERÍA Y ENTREGABLES EN PRODUCCIÓN:
                    </div>
                    <ul className="space-y-2">
                      {project.architectureHighlights.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-xs sm:text-sm text-[#515154] flex items-start gap-2.5"
                        >
                          <span className="font-mono text-[#291B64] font-bold shrink-0">
                            0{idx + 1}.
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-mono text-[#515154]">
                    <span className="font-bold text-[#1D1D1F]">Stack:</span>
                    {project.stack.map((tech, idx) => (
                      <React.Fragment key={tech}>
                        <span>{tech}</span>
                        {idx < project.stack.length - 1 && <span aria-hidden="true">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Right Column (3 cols): Direct Actions */}
                <div className="lg:col-span-3 flex flex-col justify-between space-y-3 bg-[#F6F6F9] p-6">
                  <div className="text-xs font-mono text-[#515154]">
                    ¿Busca replicar o escalar una arquitectura similar en su organización?
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectProjectForContact(project.title, project.solutionRef)
                      }
                      className="w-full px-4 py-3 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span>Cotizar Proyecto Similar</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onAskDigitalTwin(
                          `Quiero estructurar un proyecto similar a "${project.title}" (${project.category}). ¿Cómo serían las 3 etapas (40-40-20) y el stack recomendado?`
                        )
                      }
                      className="w-full px-4 py-3 text-xs font-mono font-semibold text-[#1D1D1F] bg-white hover:bg-black/[0.05] rounded-none transition-colors flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#291B64]" />
                        <span>Simular con IA Services</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                    </button>

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-2.5 text-xs font-mono font-semibold text-emerald-900 hover:underline inline-flex items-center justify-between gap-2"
                      >
                        <span>Ver despliegue en vivo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
