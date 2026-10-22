import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  FolderGit2,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Check,
  Calendar,
  MessageSquare,
  Users,
  Target,
  FileCheck,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
  Briefcase,
  GitBranch
} from 'lucide-react';
import { CASE_STUDIES_DATA } from '../data/content';
import { OSWindowFrame } from './common/OSWindowFrame';

interface CaseStudiesSectionProps {
  onSimilarCaseClick: (caseTitle: string) => void;
  onScheduleClick?: (context?: string) => void;
  onWhatsAppClick?: (customText?: string) => void;
}

export const CaseStudiesSection: React.FC<CaseStudiesSectionProps> = ({
  onSimilarCaseClick,
  onScheduleClick,
  onWhatsAppClick,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(CASE_STUDIES_DATA[0].id);
  const [activeModalidad, setActiveModalidad] = useState<'llave-en-mano' | 'fractional-cto' | 'rescate'>('llave-en-mano');

  const activeCase = CASE_STUDIES_DATA.find((c) => c.id === selectedCaseId) || CASE_STUDIES_DATA[0];

  const coreManagementServices = [
    {
      step: '01',
      title: 'Dirección & Project Management Tecnológico',
      subtitle: 'Planificación, liderazgo de equipos y control presupuestario',
      icon: Users,
      badge: 'Liderazgo & Sprints',
      color: 'from-blue-600 to-indigo-600',
      description: 'Conducción integral del ciclo de desarrollo. Conexión fluida entre los objetivos comerciales de la Dirección y el trabajo técnico de los desarrolladores.',
      deliverables: [
        'Estructuración de Roadmaps, Sprints y backlog priorizado por valor de negocio',
        'Coordinación de equipos internos y proveedores externos (Backend, Frontend, DevOps)',
        'Monitoreo estricto de presupuesto, estimaciones realistas y control de plazos'
      ]
    },
    {
      step: '02',
      title: 'Arquitectura de Software & Solución Técnica',
      subtitle: 'Diseño de sistemas robustos, seguros y escalables',
      icon: Cpu,
      badge: 'C4 Model & Clean Code',
      color: 'from-indigo-600 to-sky-600',
      description: 'Definición de las bases técnicas del proyecto antes de escribir código. Selección del stack adecuado para evitar licencias infladas o sobreingeniería.',
      deliverables: [
        'Diagramas de arquitectura C4 (Sistemas, Contenedores, Componentes)',
        'Diseño de bases de datos relacionales optimizadas (PostgreSQL) y capas de caché',
        'Políticas de seguridad Zero-Trust, encriptación TLS 1.3 y aislamiento en servidores'
      ]
    },
    {
      step: '03',
      title: 'Implementación, Delivery & Despliegue',
      subtitle: 'Puesta en marcha en producción con cero tiempo de inactividad',
      icon: Zap,
      badge: 'Zero-Downtime & CI/CD',
      color: 'from-emerald-600 to-teal-600',
      description: 'Acompañamiento hands-on en el código fuente, revisión de calidad (Code Reviews) y configuración de pipelines automatizados de despliegue continuo.',
      deliverables: [
        'Pipelines de CI/CD automatizados para despliegues sin interrupción del servicio',
        'Contenedorización en Docker y aprovisionamiento en servidores dedicados Linux',
        'Documentación técnica viva, pruebas de carga y transferencia total al cliente'
      ]
    }
  ];

  const modalidadesData = {
    'llave-en-mano': {
      title: 'Dirección Integral Llave en Mano (End-to-End Delivery)',
      tagline: 'Desde el relevamiento y arquitectura hasta la puesta en marcha en producción.',
      bestFor: 'Empresas que necesitan lanzar o modernizar un software sin desviar a su personal de las operaciones diarias.',
      features: [
        'Relevamiento exhaustivo y documento de especificación funcional aprobado',
        'Diseño de arquitectura de software, bases de datos y seguridad',
        'Dirección del equipo de desarrollo, code reviews y aseguramiento de calidad (QA)',
        'Despliegue en producción, capacitación a usuarios y garantía post-lanzamiento'
      ],
      timeline: '8 a 16 semanas según escala',
      involvement: 'Reuniones de avance quincenales ejecutivas'
    },
    'fractional-cto': {
      title: 'Fractional CTO / Dirección Técnica Advisory',
      tagline: 'Liderazgo técnico estratégico continuo sin el costo de un CTO full-time.',
      bestFor: 'Compañías consolidadas, cooperativas o startups con equipo de desarrollo propio que necesitan gobierno técnico sénior.',
      features: [
        'Participación en comités directivos para toma de decisiones tecnológicas',
        'Auditoría continua de repositorios, deuda técnica y cuellos de botella',
        'Mentoring y dirección a los líderes de desarrollo del cliente',
        'Negociación técnica con proveedores de software y auditoría de contratos'
      ],
      timeline: 'Abono mensual fraccional (retainer flexible)',
      involvement: 'Acompañamiento semanal continuo'
    },
    'rescate': {
      title: 'Rescate & Reestructuración de Proyectos Críticos',
      tagline: 'Intervención de emergencia en proyectos atrasados, con sobrecostos o fallas.',
      bestFor: 'Proyectos estancados con proveedores anteriores, código de baja calidad o servidores inestables.',
      features: [
        'Auditoría de código forense y diagnóstico de viabilidad en 72 horas',
        'Plan de rescate técnico priorizado (reparación de fallas críticas primero)',
        'Reestructuración del stack y migración a servidores seguros y aislados',
        'Estabilización de base de datos y recuperación de cronograma'
      ],
      timeline: '2 a 6 semanas de intervención intensiva',
      involvement: 'Soporte prioritario diario'
    }
  };

  const currentModalidad = modalidadesData[activeModalidad];

  return (
    <section id="project-manager" className="py-20 md:py-28 bg-[#F4F4F4] relative border-b border-blue-900/10 scroll-mt-20">
      {/* Target anchor compatibility for #proyectos and #casos */}
      <div id="proyectos" className="absolute -top-24 pointer-events-none" />
      <div id="casos" className="absolute -top-24 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs text-xs font-mono font-semibold">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span>PROJECT MANAGEMENT, ARQUITECTURA & DIRECCIÓN</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Project Manager & Dirección Técnica de Software.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Liderazgo de proyectos tecnológicos complejos: desde el diseño de la arquitectura y la selección del stack hasta la coordinación de equipos, control presupuestario y puesta en marcha en producción sin desvíos.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: PROJECT MANAGEMENT WORKSPACE */}
        <OSWindowFrame
          id="project-management-window"
          accentTheme="emerald"
          themeMode="light"
          processName="sys/management/tech-project-management.sh"
          windowTitle="PROJECT MANAGEMENT & ARQUITECTURA DE SOLUCIÓN · DIRECCIÓN INTEGRAL"
          securityBadge="NDA & GOBERNANZA VINCULANTE"
          statusBadge="METODOLOGÍA ÁGIL & C4 MODEL"
          portBadge="SLA 100% ENTREGABLES EN TÉRMINO"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'ROL', value: 'TECHNICAL PM & FRACTIONAL CTO', highlight: true },
            { label: 'METODOLOGÍA', value: 'SCRUM / KANBAN / C4' },
            { label: 'ENTREGABLES', value: 'CÓDIGO 100% AUDITADO' },
            { label: 'PROPIEDAD', value: '100% REPOSITORIO CLIENTE' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-[#F4F4F4] space-y-10 text-left text-slate-900">
            
            {/* 3 CORE PILLARS OF PROJECT MANAGEMENT & ARCHITECTURE */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-300 gap-2 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 font-mono">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <span>Los 3 Servicios Esenciales de la Dirección Técnica</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-mono">
                    Garantizamos que la visión de negocio se traduzca en código eficiente, dentro del presupuesto y sin ataduras
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 self-start sm:self-auto shadow-xs">
                  CICLO DE VIDA COMPLETO
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {coreManagementServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.step}
                      className="rounded-2xl p-6 bg-white border border-slate-300/80 hover:border-emerald-500/80 hover:shadow-xl transition-all flex flex-col justify-between space-y-5 shadow-sm group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${service.color} flex items-center justify-center font-bold text-white shadow-md`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-emerald-700 transition-colors">
                              PASO {service.step}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {service.badge}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                            {service.title}
                          </h4>
                          <div className="text-xs font-mono text-emerald-700 mt-1 font-semibold">
                            {service.subtitle}
                          </div>
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 space-y-2">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                          Entregables Formales:
                        </div>
                        <ul className="space-y-1.5">
                          {service.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MODALIDADES DE CONTRATACIÓN Y ACOMPAÑAMIENTO (INTERACTIVE TABS) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-300/80 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>MODALIDADES DE INTERVENCIÓN</span>
                  </span>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">
                    ¿Cómo podemos trabajar juntos en tu proyecto?
                  </h3>
                </div>

                {/* Tab Switcher */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  {[
                    { id: 'llave-en-mano', label: 'Llave en Mano' },
                    { id: 'fractional-cto', label: 'Fractional CTO' },
                    { id: 'rescate', label: 'Rescate de Proyecto' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveModalidad(tab.id as any)}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        activeModalidad === tab.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Modalidad Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{currentModalidad.title}</h4>
                    <p className="text-xs font-mono text-emerald-700 mt-1 font-semibold">{currentModalidad.tagline}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      <strong>Ideal para:</strong> {currentModalidad.bestFor}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentModalidad.features.map((feat, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-800">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 p-5 rounded-2xl bg-emerald-50/60 border border-emerald-300/80 flex flex-col justify-between space-y-4 shadow-xs">
                  <div className="space-y-3 font-mono text-xs">
                    <div className="border-b border-emerald-200 pb-2 text-emerald-800 font-bold uppercase">
                      Parámetros de Ejecución
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Plazo Estimado:</span>
                      <div className="text-slate-900 font-bold">{currentModalidad.timeline}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase">Dedicación:</span>
                      <div className="text-emerald-800 font-bold">{currentModalidad.involvement}</div>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      🔒 Acuerdo vinculante de Confidencialidad (NDA) firmado previo a recibir documentación.
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onScheduleClick) {
                        onScheduleClick(`Project Management (${currentModalidad.title})`);
                      } else if (onWhatsAppClick) {
                        onWhatsAppClick(`Hola Gastón, nos interesa evaluar la modalidad de "${currentModalidad.title}" para un proyecto.`);
                      }
                    }}
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 cursor-pointer font-mono"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Relevar Viabilidad (30 min)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CASE STUDIES BENCHMARKS (PROYECTOS DIRIGIDOS CON ÉXITO) */}
            <div className="pt-8 border-t border-slate-300 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>CASOS REALES & PROYECTOS DIRIGIDOS</span>
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    Resultados Cuantificables en Producción
                  </h3>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    Impacto real medido en cooperativas, industrias y empresas de distribución
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 self-start sm:self-auto flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Producción Real</span>
                </span>
              </div>

              {/* Case Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {CASE_STUDIES_DATA.map((item) => {
                  const isSelected = selectedCaseId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedCaseId(item.id)}
                      className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                          : 'bg-white border-slate-300/80 hover:border-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-mono font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {item.category}
                        </span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      </div>
                      <div className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5 font-medium font-mono">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate text-slate-700">{item.organization}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Case Spotlight Detail Card */}
              <div className="rounded-3xl bg-white border border-slate-300/80 p-6 sm:p-9 shadow-sm space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-200 gap-6">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {activeCase.category}
                    </div>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
                      {activeCase.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 font-mono">
                      Organización: <strong className="text-slate-900 font-bold">{activeCase.organization}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => onSimilarCaseClick(activeCase.title)}
                    type="button"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-full inline-flex items-center gap-2 transition-all self-start lg:self-auto shadow-md shadow-emerald-600/25 cursor-pointer active:scale-95 font-mono"
                  >
                    <span>Plantear un proyecto similar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Challenge & Solution (7 cols) */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                      <div className="text-xs font-mono uppercase tracking-wider text-amber-800 mb-2 font-bold">
                        EL DESAFÍO TÉCNICO INICIAL:
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                        {activeCase.challenge}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80">
                      <div className="text-xs font-mono uppercase tracking-wider text-emerald-800 mb-2 font-bold">
                        ARQUITECTURA & SOLUCIÓN IMPLEMENTADA:
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                        {activeCase.solution}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 font-semibold">
                        Tecnologías Desplegadas en el Caso:
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {activeCase.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-mono text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-300 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Metrics (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>IMPACTO CUANTIFICABLE EN PRODUCCIÓN</span>
                    </div>

                    <div className="space-y-3">
                      {activeCase.metrics.map((metric, i) => (
                        <div key={i} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
                            {metric.value}
                          </div>
                          <div className="text-xs font-bold text-emerald-700 mt-1">
                            {metric.label}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {metric.detail}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-mono flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{activeCase.verificationNote}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600 font-mono text-center sm:text-left">
                ¿Tenés una iniciativa de software estratégica y necesitás dirección técnica con experiencia real?
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                {onWhatsAppClick && (
                  <button
                    onClick={() => onWhatsAppClick('Hola Gastón, me pongo en contacto para consultar sobre servicios de Project Management, Arquitectura y Dirección Técnica de proyectos.')}
                    type="button"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 rounded-full transition-all flex items-center gap-1.5 shadow-sm shadow-[#25D366]/30 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp Directo</span>
                  </button>
                )}

                {onScheduleClick && (
                  <button
                    onClick={() => onScheduleClick('Project Management & Dirección Técnica')}
                    type="button"
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer font-mono"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Relevamiento (30m)</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </OSWindowFrame>

      </div>
    </section>
  );
};
