import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Workflow,
  BarChart3,
  Layers,
  Database,
  Rocket,
  Activity,
  Globe,
  Sliders,
  Check,
  ChevronRight
} from 'lucide-react';
import { STRATEGIC_PILLARS } from '../data/pillarsData';
import { OSWindowFrame } from './common/OSWindowFrame';

interface ThreePillarsSectionProps {
  onScheduleClick: (context?: string) => void;
  onDiagnosticoClick: () => void;
  onSelectPillarTopic?: (topic: string) => void;
}

export const ThreePillarsSection: React.FC<ThreePillarsSectionProps> = ({
  onScheduleClick,
  onDiagnosticoClick,
  onSelectPillarTopic,
}) => {
  const [activePillarId, setActivePillarId] = useState<string>('business-innovation');
  
  // Synergy simulator state
  const [businessMaturity, setBusinessMaturity] = useState<number>(65);
  const [aiIntelligence, setAiIntelligence] = useState<number>(75);
  const [stackModernity, setStackModernity] = useState<number>(85);

  const activePillar = STRATEGIC_PILLARS.find((p) => p.id === activePillarId) || STRATEGIC_PILLARS[0];

  // Dynamic calculated scores from the 3 pillars synergy
  const synergyScore = Math.round((businessMaturity * 0.35) + (aiIntelligence * 0.35) + (stackModernity * 0.30));
  const estimatedMargin = Math.round(40 + (synergyScore * 0.45));
  const timeToMarketWeeks = Math.max(2, Math.round(18 - (synergyScore * 0.14)));
  const scaleMultiplier = (1 + (synergyScore / 25)).toFixed(1);

  const getPillarIcon = (id: string, className = 'w-5 h-5') => {
    switch (id) {
      case 'business-innovation':
        return <TrendingUp className={className} />;
      case 'smart-business':
        return <Brain className={className} />;
      case 'tech-stack':
        return <Cpu className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  return (
    <section id="innovacion" className="relative py-20 md:py-28 overflow-hidden bg-[#F4F4F4] border-b border-blue-900/10">
      <div id="tres-pilares" className="absolute -top-24 pointer-events-none" />
      
      {/* Dynamic Background Grid & Subtle Ambient Glow (Grounded, No Floating Motion) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Subtle Static Ambient Lights */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-300/15 via-indigo-200/10 to-transparent blur-3xl"
        />

        {/* Dynamic Vector Data Flow Lines */}
        <svg className="absolute w-full h-full opacity-25" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M-100 250 C 300 150, 600 450, 1000 200 C 1200 80, 1400 350, 1600 220" 
            stroke="url(#lineGradient1)" 
            strokeWidth="2" 
            strokeDasharray="8 8"
            className="animate-flow-line"
          />
          <path 
            d="M-50 600 C 350 750, 700 500, 1100 700 C 1300 800, 1500 650, 1650 720" 
            stroke="url(#lineGradient2)" 
            strokeWidth="2" 
            strokeDasharray="6 6"
            className="animate-flow-line"
          />
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-xs text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>NUEVA ARQUITECTURA DE VALOR</span>
            <span className="text-sky-500/60">·</span>
            <span className="text-sky-400">3 PILARES ESTRATÉGICOS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-[1.12] [text-wrap:balance]">
            Innovación de Negocios, Inteligencia Autónoma y{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600">
              el Stack Técnico de Alto Rendimiento.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal [text-wrap:balance]">
            Una arquitectura integral donde cada pilar potencia al siguiente. Integramos nuevos modelos de monetización digital, agentes de IA autónomos y una infraestructura cloud moderna lista para escalar.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: 3 PILLARS WORKBENCH & SYNERGY SIMULATOR */}
        <OSWindowFrame
          accentTheme="sky"
          processName="sys/processes/01-three-pillars.sh"
          windowTitle="SUITE ESTRATÉGICA · 3 PILARES DE NEGOCIO & TECNOLOGÍA"
          securityBadge="ZERO-TRUST & CONFIDENCIAL"
          statusBadge="SIMULADOR ACTIVO"
          portBadge="PORT 8080 · IPC-STREAM"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'SYNERGY_SCORE', value: `${synergyScore}/100`, highlight: true },
            { label: 'MARGIN', value: `+${estimatedMargin}%` },
            { label: 'TTM', value: `${timeToMarketWeeks} sem` },
            { label: 'MULTIPLIER', value: `${scaleMultiplier}x` },
          ]}
        >
          {/* MASTER INTEGRATED SUITE: Tab Control + Deep-Dive + Simulator in ONE Cohesive Unit */}
          <div className="bg-slate-950/98 border-0 overflow-hidden text-left">
          
          {/* Integrated Segmented Tab Control Bar (Seamless Top Rail) */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/10 bg-slate-900/90 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {STRATEGIC_PILLARS.map((pillar) => {
              const isActive = activePillarId === pillar.id;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActivePillarId(pillar.id)}
                  className={`p-4 sm:p-5 text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 font-bold text-white shadow-xs'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-800 text-sky-400'
                      }`}
                    >
                      {getPillarIcon(pillar.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold tracking-wider ${isActive ? 'text-sky-300' : 'text-slate-500'}`}>
                          PILAR {pillar.number}
                        </span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-sm font-bold text-white leading-snug">
                        {pillar.title.split('&')[0].trim()}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90 text-sky-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Deep-Dive Content (Seamless Integration inside the Card) */}
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Pillar Manifesto & Real Impact (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-blue-900/30 text-sky-300 border border-blue-400/30">
                    Pilar {activePillar.number} · {activePillar.title}
                  </span>
                  <span className="text-xs font-medium text-slate-400 font-mono">
                    {activePillar.subtitle}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                  {activePillar.tagline}
                </h3>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {activePillar.overview}
                </p>

                {/* Real World Transformation Story (Antes vs Después) */}
                <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>Caso Real de Transformación</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30 space-y-1">
                      <span className="font-bold text-rose-400 flex items-center gap-1 font-mono">
                        <span>✕</span> Modelo Anterior
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {activePillar.realWorldScenario.before}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
                      <span className="font-bold text-emerald-400 flex items-center gap-1 font-mono">
                        <span>✓</span> Con los 3 Pilares
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {activePillar.realWorldScenario.after}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Drivers List */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono uppercase tracking-wider text-sky-300 font-bold">
                    Vectores Clave de Ejecución:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activePillar.keyDrivers.map((driver, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{driver}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies / Methodologies Tags */}
                <div className="pt-2">
                  <div className="text-[11px] font-mono text-slate-400 mb-2">
                    Herramientas y Metodologías aplicadas en este pilar:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activePillar.technologiesOrMethodologies.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-blue-900/30 text-sky-300 border border-blue-400/30"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: KPIs & Deliverables Dock (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Quantifiable KPIs in Motion */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-white/10 text-white p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono tracking-wider text-sky-300 uppercase font-semibold">
                      Métricas de Impacto Medible
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {activePillar.kpis.map((kpi, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10"
                      >
                        <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-white font-mono">
                          {kpi.value}
                        </div>
                        <div className="text-xs font-bold text-white mt-0.5">
                          {kpi.label}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          {kpi.description}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Direct Action inside KPI card */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onScheduleClick(`Consulta Técnica sobre Pilar ${activePillar.number}: ${activePillar.title}`)}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 cursor-pointer active:scale-[0.99]"
                    >
                      <span>Agendar Llamada de 30 min sobre este Pilar</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Pillar Specific Deliverable Cards */}
                <div className="space-y-2.5">
                  {activePillar.features.slice(0, 3).map((feat, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {feat.title}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 font-semibold border border-white/10">
                            {feat.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400 shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                        {feat.impactMetric}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Integrated Synergy Simulator Section (Docked to the bottom of the Suite) */}
          <div className="border-t border-slate-200 bg-white p-6 sm:p-10 text-slate-900 rounded-b-2xl sm:rounded-b-3xl">
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-mono font-semibold border border-blue-200">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>SIMULADOR DE SINERGIA EN TIEMPO REAL</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
                ¿Cómo interactúan los 3 Pilares en tu Organización?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
                Ajustá las palancas según el estado actual de tu empresa para simular el impacto en márgenes operativos, velocidad de salida al mercado y escala sin fricciones.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Sliders (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                
                {/* Slider 1: Business Innovation */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
                        1
                      </div>
                      <span>Innovación de Negocios & Modelos Digitales</span>
                    </div>
                    <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                      {businessMaturity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={businessMaturity}
                    onChange={(e) => setBusinessMaturity(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Servicios Tradicionales</span>
                    <span>Plataformas B2B & SaaS</span>
                  </div>
                </div>

                {/* Slider 2: Smart Business / AI */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold border border-purple-200">
                        2
                      </div>
                      <span>Negocios Inteligentes & Operaciones con IA</span>
                    </div>
                    <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-semibold">
                      {aiIntelligence}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={aiIntelligence}
                    onChange={(e) => setAiIntelligence(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Reportes en Excel / Manual</span>
                    <span>Agentes Autónomos & Live BI</span>
                  </div>
                </div>

                {/* Slider 3: Tech Stack */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold border border-sky-200">
                        3
                      </div>
                      <span>Modernidad del Stack Técnico & Resiliencia</span>
                    </div>
                    <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-semibold">
                      {stackModernity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={stackModernity}
                    onChange={(e) => setStackModernity(parseInt(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Monolito Lento / On-premise</span>
                    <span>Edge + Supabase + React 19</span>
                  </div>
                </div>

              </div>

              {/* Results & Visual Projection Gauge (6 cols) */}
              <div className="lg:col-span-6">
                <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl space-y-6 border border-slate-800">
                  
                  {/* Visual synergy score pill */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono font-bold uppercase text-slate-300">
                      Índice de Aceleración Estratégica
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-sky-400 font-mono">
                        {synergyScore}/100
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-sky-300 border border-blue-400/30 font-mono">
                        {synergyScore > 75 ? 'Óptimo' : synergyScore > 50 ? 'Acelerado' : 'Básico'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 transition-all duration-300"
                      style={{ width: `${synergyScore}%` }}
                    />
                  </div>

                  {/* 4 Projected Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                      <div className="text-[11px] text-slate-400 font-medium">Margen Operativo Estimado</div>
                      <div className="text-2xl font-extrabold text-white font-mono">
                        {estimatedMargin}%
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold font-mono">
                        +{Math.round(estimatedMargin * 0.4)}% vs tradicional
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                      <div className="text-[11px] text-slate-400 font-medium">Time-to-Market</div>
                      <div className="text-2xl font-extrabold text-white font-mono">
                        {timeToMarketWeeks} sem
                      </div>
                      <div className="text-[10px] text-sky-400 font-bold font-mono">
                        Despliegue ágil continuo
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                      <div className="text-[11px] text-slate-400 font-medium">Multiplicador de Escala</div>
                      <div className="text-2xl font-extrabold text-white font-mono">
                        {scaleMultiplier}x
                      </div>
                      <div className="text-[10px] text-indigo-400 font-bold font-mono">
                        Capacidad sin fricción manual
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                      <div className="text-[11px] text-slate-400 font-medium">Carga Operativa Manual</div>
                      <div className="text-2xl font-extrabold text-rose-400 font-mono">
                        -{Math.round(synergyScore * 0.7)}%
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold font-mono">
                        Automatizado por Agentes & Stack
                      </div>
                    </div>
                  </div>

                  {/* CTAs from the Simulator */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => onScheduleClick(`Evaluación de Sinergia 3 Pilares: Score ${synergyScore}/100 (Negocio: ${businessMaturity}%, IA: ${aiIntelligence}%, Stack: ${stackModernity}%)`)}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 cursor-pointer"
                    >
                      <span>Validar esta Proyección con Gastón</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={onDiagnosticoClick}
                      className="py-3 px-4 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Diagnóstico con IA</span>
                    </button>
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
