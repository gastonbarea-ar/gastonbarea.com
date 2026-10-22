import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Clock, 
  Send, 
  Copy, 
  Server, 
  Database, 
  Globe, 
  Compass,
  MessageSquare,
  Sliders,
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';
import { OSWindowFrame } from './common/OSWindowFrame';

interface ConfiguratorProps {
  onSendScopeToContact: (scopeData: {
    objective: string;
    startingPoint: string;
    timeline: string;
    recommendedStack: string[];
    summary: string;
  }) => void;
  onWhatsAppWithScope: (scopeMessage: string) => void;
}

export const ArchitectureConfigurator: React.FC<ConfiguratorProps> = ({
  onSendScopeToContact,
  onWhatsAppWithScope,
}) => {
  const [objective, setObjective] = useState<string>('infra');
  const [startingPoint, setStartingPoint] = useState<string>('legacy');
  const [timeline, setTimeline] = useState<string>('standard');
  const [copied, setCopied] = useState<boolean>(false);

  const objectives = [
    {
      id: 'infra',
      title: 'Infraestructura & Servidores',
      desc: 'Linux, Docker, caídas o lentitud',
      icon: Server,
    },
    {
      id: 'bi',
      title: 'Business Intelligence & BI',
      desc: 'Dashboards y unificación de datos',
      icon: Database,
    },
    {
      id: 'web',
      title: 'Software Web a Medida',
      desc: 'Next.js, ERP y portales internos',
      icon: Globe,
    },
    {
      id: 'cto',
      title: 'Dirección Técnica / CTO',
      desc: 'Consultoría y liderazgo estratégico',
      icon: Compass,
    },
  ];

  const startingPoints = [
    { id: 'zero', title: 'Desde Cero (Greenfield)', note: 'Sin sistemas previos' },
    { id: 'legacy', title: 'Sistemas Antiguos (Legacy)', note: 'Bases o software obsoleto' },
    { id: 'cloud', title: 'Migración On-Premises a Cloud', note: 'VPS, Docker o híbrido' },
    { id: 'audit', title: 'Auditoría de Proveedor Actual', note: 'Revisión independiente' },
  ];

  const timelines = [
    { id: 'fast', title: 'Urgente / Contingencia', range: '2 a 4 semanas' },
    { id: 'standard', title: 'Estándar Corporativo', range: '6 a 10 semanas' },
    { id: 'continuous', title: 'Continuo / Retainer', range: 'Acompañamiento mensual' },
  ];

  const recommendedSpec = useMemo(() => {
    let title = 'Arquitectura Cloud & Contenedores Linux';
    let summary = 'Aislamiento de servicios en Docker, proxy reverso Nginx y endurecimiento de Linux Ubuntu.';
    let estimatedTime = timeline === 'fast' ? '2 a 3 semanas' : timeline === 'continuous' ? 'Abono mensual' : '6 a 8 semanas';
    let stack = ['Ubuntu Server LTS', 'Docker & Docker Compose', 'Nginx Reverse Proxy', 'WireGuard VPN', 'PostgreSQL 16'];
    let phases = [
      'Auditoría y levantamiento de inventario de infraestructura',
      'Configuración de servidor base con hardening y firewall',
      'Dockerización y migración sin caída de servicio',
      'Protocolos de backup cifrado y monitoreo automatizado'
    ];

    if (objective === 'bi') {
      title = 'Data Warehouse & Tableros BI en Tiempo Real';
      summary = 'Ingesta automatizada de datos dispersos (Excel, ERPs antiguos) hacia PostgreSQL y visualización ejecutiva.';
      estimatedTime = timeline === 'fast' ? '3 a 4 semanas' : timeline === 'continuous' ? 'Evolutivo mensual' : '6 a 8 semanas';
      stack = ['PostgreSQL ACID', 'Pipelines ETL Python', 'Apache Superset / Metabase', 'Docker', 'Redis Cache'];
      phases = [
        'Mapeo de fuentes de datos y reglas de negocio',
        'Modelado relacional en estrella / copo de nieve',
        'Automatización de pipelines de sincronización nocturna',
        'Capacitación directiva y puesta en marcha de KPIs'
      ];
    } else if (objective === 'web') {
      title = 'Plataforma Web a Medida & Integración ERP';
      summary = 'Desarrollo frontend en Next.js integrado con Odoo ERP y bases de datos seguras.';
      estimatedTime = timeline === 'fast' ? '4 a 5 semanas (MVP)' : timeline === 'continuous' ? 'Evolutivo continuo' : '8 a 10 semanas';
      stack = ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Odoo ERP', 'Supabase / PostgreSQL'];
      phases = [
        'Diseño de flujos y prototipado UI/UX en Figma',
        'Desarrollo modular frontend y servicios backend',
        'Integración bidireccional con Odoo ERP o APIs',
        'Despliegue en producción con PWA y optimización SEO'
      ];
    } else if (objective === 'cto') {
      title = 'Dirección Tecnológica & Consultoría Estratégica (CTO Fraccional)';
      summary = 'Acompañamiento directivo continuo para selección de stacks, auditoría de proveedores y gobierno técnico.';
      estimatedTime = 'Abono mensual continuo (horas dedicadas)';
      stack = ['Arquitectura Hexagonal', 'Clean Code', 'Scrum / Agile', 'Auditoría de Deuda Técnica'];
      phases = [
        'Auditoría integral inicial de arquitectura y equipo',
        'Plan maestro tecnológico alineado al modelo de negocio',
        'Reuniones semanales de revisión técnica y selección de herramientas',
        'Acompañamiento en contrataciones clave y negociaciones de software'
      ];
    }

    return { title, summary, estimatedTime, stack, phases };
  }, [objective, startingPoint, timeline]);

  const activeObjectiveObj = objectives.find((o) => o.id === objective);
  const activeStartingObj = startingPoints.find((s) => s.id === startingPoint);

  const proposalText = `PROPUESTA DE ALCANCE - GASTÓN BAREA (gastonbarea.com.ar)
------------------------------------------------------
Objetivo: ${activeObjectiveObj?.title}
Punto de partida: ${activeStartingObj?.title}
Plazo estimado: ${recommendedSpec.estimatedTime}

Solución: ${recommendedSpec.title}
${recommendedSpec.summary}

Stack Recomendado:
${recommendedSpec.stack.join(', ')}

Fases de Trabajo:
${recommendedSpec.phases.map((p) => `- ${p}`).join('\n')}

Propuesta generada interactivamente desde el Configurador de Arquitectura.`;

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppClick = () => {
    onWhatsAppWithScope(proposalText);
  };

  const handleSendToContact = () => {
    onSendScopeToContact({
      objective: activeObjectiveObj?.title || '',
      startingPoint: activeStartingObj?.title || '',
      timeline: recommendedSpec.estimatedTime,
      recommendedStack: recommendedSpec.stack,
      summary: `${recommendedSpec.title}: ${recommendedSpec.summary}`,
    });
  };

  return (
    <section id="configurador" className="py-20 md:py-28 bg-[#F4F4F4] relative border-b border-blue-900/10">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-xs text-xs font-mono font-semibold">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>CONFIGURADOR DE ARQUITECTURA</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Calculá el alcance y la topología para tu empresa.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Elegí tus prioridades operativas para obtener una propuesta técnica con tecnologías recomendadas y plazos de ejecución estimados.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: ARCHITECTURE TOPOLOGY CALCULATOR */}
        <OSWindowFrame
          accentTheme="sky"
          processName="sys/configurator/topology-calculator.wasm"
          windowTitle="CONFIGURADOR DE ARQUITECTURA · CALCULADORA DE TOPOLOGÍA"
          securityBadge="CERO VENDOR LOCK-IN"
          statusBadge="CÁLCULO INTERACTIVO ACTIVO"
          portBadge="WASM RUNTIME · V8 KERNEL"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'OBJECTIVE', value: activeObjectiveObj?.title || 'Infraestructura', highlight: true },
            { label: 'ESTIMATE', value: recommendedSpec.estimatedTime },
            { label: 'CALCULATED', value: 'TIEMPO REAL' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Selectors Column (7 cols) */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Step 1 */}
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-sky-300 mb-3 font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600/30 text-sky-300 flex items-center justify-center text-[10px] font-bold border border-blue-400/30">1</span>
                    <span>¿Qué objetivo tecnológico prioriza tu organización?</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {objectives.map((obj) => {
                      const Icon = obj.icon;
                      const isSelected = objective === obj.id;

                      return (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => setObjective(obj.id)}
                          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-400 shadow-lg shadow-blue-500/10 ring-1 ring-blue-400'
                              : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                              {obj.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {obj.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 */}
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-sky-300 mb-3 font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600/30 text-sky-300 flex items-center justify-center text-[10px] font-bold border border-blue-400/30">2</span>
                    <span>¿Cuál es el punto de partida técnico?</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {startingPoints.map((sp) => {
                      const isSelected = startingPoint === sp.id;

                      return (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => setStartingPoint(sp.id)}
                          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-400 ring-1 ring-blue-400'
                              : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {sp.title}
                          </div>
                          <div className="text-[10px] text-sky-400 mt-1 font-mono">
                            {sp.note}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-sky-300 mb-3 font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600/30 text-sky-300 flex items-center justify-center text-[10px] font-bold border border-blue-400/30">3</span>
                    <span>Plazo estimado o prioridad de entrega:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {timelines.map((tl) => {
                      const isSelected = timeline === tl.id;

                      return (
                        <button
                          key={tl.id}
                          type="button"
                          onClick={() => setTimeline(tl.id)}
                          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-400 ring-1 ring-blue-400'
                              : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className={`text-xs font-semibold mb-1 ${isSelected ? 'text-white font-bold' : 'text-slate-300'}`}>
                            {tl.title}
                          </div>
                          <div className="text-xs font-mono font-bold text-sky-300">
                            {tl.range}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Output OS Card (5 cols) */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Especificación Recomendada</span>
                    </div>
                    <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{recommendedSpec.estimatedTime}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug tracking-tight">
                      {recommendedSpec.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed font-normal">
                      {recommendedSpec.summary}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                      Stack Aconsejado:
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {recommendedSpec.stack.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono text-sky-300 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-400/30 font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                      Fases de Trabajo:
                    </div>
                    <ul className="space-y-2">
                      {recommendedSpec.phases.map((ph, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{ph}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-2.5">
                    <button
                      onClick={handleSendToContact}
                      type="button"
                      className="w-full py-3 px-5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] rounded-full transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Consulta con este Alcance</span>
                    </button>

                    <button
                      onClick={handleWhatsAppClick}
                      type="button"
                      className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Hablar por WhatsApp con esta Especificación</span>
                    </button>

                    <button
                      onClick={handleCopyProposal}
                      type="button"
                      className="w-full py-2 px-3 text-[11px] font-mono text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Propuesta copiada al portapapeles</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar resumen técnico de propuesta</span>
                        </>
                      )}
                    </button>
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
