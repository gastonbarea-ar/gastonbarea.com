import React from 'react';
import {
  Briefcase,
  Cpu,
  FolderGit2,
  BookOpen,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LayoutGrid,
  ScrollText,
  Activity,
  Maximize2
} from 'lucide-react';

export type WorkspaceTab = 'solutions' | 'engineering' | 'cases' | 'blog' | 'contact' | 'all';

interface WorkspaceHubNavProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onSubSectionClick: (sectionId: string) => void;
}

export const WorkspaceHubNav: React.FC<WorkspaceHubNavProps> = ({
  activeTab,
  onTabChange,
  onSubSectionClick,
}) => {
  const tabs = [
    {
      id: 'solutions' as WorkspaceTab,
      title: 'Soluciones & Negocio',
      shortTitle: 'Soluciones',
      tag: 'B2B2C · ERP · SECTORES',
      badge: '4 Módulos',
      icon: Briefcase,
      color: 'from-blue-600 to-indigo-600',
      activeBorder: 'border-indigo-400',
      subSections: [
        { id: 'soluciones-sectoriales', label: 'Verticales Sectoriales' },
        { id: 'ecommerce-b2b2c', label: 'E-Commerce B2B2C' },
        { id: 'odoo', label: 'Odoo Community ERP' },
        { id: 'servicios', label: 'Capacidades & NDA' },
      ],
    },
    {
      id: 'engineering' as WorkspaceTab,
      title: 'Ingeniería & Diagnóstico',
      shortTitle: 'Ingeniería',
      tag: 'IA · TOPOLOGÍA · STACK',
      badge: '5 Módulos',
      icon: Cpu,
      color: 'from-indigo-600 to-sky-600',
      activeBorder: 'border-sky-400',
      subSections: [
        { id: 'innovacion', label: '3 Pilares Estratégicos' },
        { id: 'diagnostico-ia', label: 'Diagnóstico IA' },
        { id: 'topologia', label: 'Topología Servidores' },
        { id: 'tech-specs', label: 'Tech Specs' },
        { id: 'configurador', label: 'Configurador' },
      ],
    },
    {
      id: 'cases' as WorkspaceTab,
      title: 'Project Manager & Dirección',
      shortTitle: 'PM & Dirección',
      tag: 'ARQUITECTURA · DELIVERY · CASOS',
      badge: 'Dirección & Casos',
      icon: FolderGit2,
      color: 'from-emerald-600 to-teal-600',
      activeBorder: 'border-emerald-400',
      subSections: [
        { id: 'project-manager', label: 'Project Management & Arquitectura' },
        { id: 'metodologia', label: 'Metodología 4 Fases' },
        { id: 'perfil', label: 'Gastón Barea Profile' },
      ],
    },
    {
      id: 'blog' as WorkspaceTab,
      title: 'Knowledge & Blog',
      shortTitle: 'Blog',
      tag: 'YOUTUBE · PODCAST · POSTS',
      badge: 'Multimedia',
      icon: BookOpen,
      color: 'from-amber-600 to-orange-600',
      activeBorder: 'border-amber-400',
      subSections: [
        { id: 'blog', label: 'Artículos & Multimedia' },
      ],
    },
    {
      id: 'contact' as WorkspaceTab,
      title: 'Contacto & Asesoría',
      shortTitle: 'Contacto',
      tag: 'AGENDA 30M · COTIZACIÓN',
      badge: 'Directo',
      icon: MessageSquare,
      color: 'from-blue-600 to-purple-600',
      activeBorder: 'border-purple-400',
      subSections: [
        { id: 'contacto', label: 'Formulario & Calendly' },
      ],
    },
  ];

  const currentTabObject = tabs.find((t) => t.id === activeTab);

  return (
    <div id="workspace-hub" className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 pt-6 pb-2 scroll-mt-20">
      {/* Workstation Hub Frame */}
      <div className="relative rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-white/15 p-4 sm:p-6 shadow-2xl shadow-blue-950/20 text-white space-y-5">
        
        {/* Top Control Bar: Title, Telemetry & View Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-white shadow-md shadow-blue-600/30">
              <LayoutGrid className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Espacios de Trabajo Dinámicos
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cero Scroll Fatigue</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono">
                Navega ordenadamente por áreas de especialidad o activa la vista continua
              </p>
            </div>
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => onTabChange(activeTab === 'all' ? 'solutions' : 'all')}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-white/15'
              }`}
              title="Alternar entre navegación por pestañas y lectura continua completa"
            >
              {activeTab === 'all' ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Modo Pestañas</span>
                </>
              ) : (
                <>
                  <ScrollText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ver Todo (Scroll Continuo)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5 Main Workstation Tabs (Responsive Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                type="button"
                className={`group relative p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between text-left transition-all cursor-pointer border ${
                  isActive
                    ? `bg-slate-900 text-white ${tab.activeBorder} shadow-lg shadow-blue-950/40 ring-1 ring-white/20`
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-900 hover:text-white border-white/10 hover:border-white/20'
                }`}
              >
                {/* Active Indicator Top Light */}
                {isActive && (
                  <div className={`absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r ${tab.color} rounded-full`} />
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? `bg-gradient-to-tr ${tab.color} text-white shadow-xs`
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/15 text-white font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug">
                      <span className="hidden sm:inline">{tab.title}</span>
                      <span className="sm:hidden">{tab.shortTitle}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                      {tab.tag}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sub-section Fast Jumper (Breadcrumb strip within active workspace) */}
        {activeTab !== 'all' && currentTabObject && currentTabObject.subSections.length > 1 && (
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span className="text-slate-400">Ir directo a:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {currentTabObject.subSections.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onSubSectionClick(sub.id)}
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-indigo-400/50 transition-colors cursor-pointer text-[11px]"
                  >
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transición Instantánea · 0ms Latencia</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
