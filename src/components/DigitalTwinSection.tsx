import React, { useState, useEffect } from 'react';
import {
  Video,
  MessageSquare,
  RefreshCw,
  Check,
  Copy,
  UserCheck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { saveProposalLead } from '../lib/supabase';

interface ArchitectureProposal {
  architectureTitle: string;
  diagnosticSummary: string;
  estimatedTimeline: string;
  recommendedStack: string[];
  keyComponents: { name: string; detail: string }[];
  workPhases: { phase: string; duration: string; deliverable: string }[];
  tangibleBenefits: string[];
  executiveMessage: string;
  isAiGenerated?: boolean;
}

interface DigitalTwinSectionProps {
  onScheduleWithProposal: (proposalSummary: string, serviceTitle: string) => void;
  onWhatsAppWithProposal: (proposalSummary: string) => void;
  onClientPortalClick?: () => void;
  onNavigateToSolution?: (sectionId: string, serviceCode?: string) => void;
  initialPrompt?: string;
}

export const DigitalTwinSection: React.FC<DigitalTwinSectionProps> = ({
  onScheduleWithProposal,
  onWhatsAppWithProposal,
  onClientPortalClick,
  initialPrompt,
}) => {
  const [organizationType, setOrganizationType] = useState<string>(
    'Empresa de Base Tecnológica (EBT) / IA Services'
  );
  const [primaryChallenge, setPrimaryChallenge] = useState<string>(
    'IA Services: Gemelo Digital Interactivo, Agentes RAG & Business Intelligence'
  );
  const [currentStack, setCurrentStack] = useState<string[]>([
    'Inteligencia Artificial',
    'PostgreSQL / Datos',
    'React / Next.js Web',
  ]);
  const [urgency, setUrgency] = useState<string>('Alta (Próximos 30 días)');
  const [customContext, setCustomContext] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState<boolean>(false);
  const [proposal, setProposal] = useState<ArchitectureProposal | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const orgOptions = [
    'Empresa de Base Tecnológica (EBT) / IA Services',
    'Bioeconomía, Agroindustria & Economía Circular',
    'Industria Manufacturera, Energía & Producción',
    'Distribución Mayorista / E-Commerce B2B2C',
    'Cooperativa de Servicios / Institución',
  ];

  const challengeOptions = [
    'IA Services: Gemelo Digital Interactivo, Agentes RAG & Business Intelligence',
    'Desarrollo de Proyecto de Base Tecnológica / Plataforma Digital',
    'Formulación y desarrollo de proyecto de Bioeconomía / Trazabilidad IoT',
    'Dirección Ejecutiva de Proyecto (PMO Externa - 14 años exp.)',
    'Implementación Odoo Community ERP v18 + Portal E-Commerce B2B2C',
    'Modernización de Servidores Linux, Contenedores Docker & Soberanía de Datos',
  ];

  const stackTags = [
    'Inteligencia Artificial',
    'Odoo ERP v18',
    'PostgreSQL / Datos',
    'Sensores IoT / Planta',
    'Linux Ubuntu & Docker',
    'React / Next.js Web',
    'Planillas Dispersas',
    'Facturación AFIP / B2B',
  ];

  useEffect(() => {
    if (!initialPrompt || !initialPrompt.trim()) return;
    const lower = initialPrompt.toLowerCase();

    if (lower.includes('bioeconom') || lower.includes('biomasa') || lower.includes('trazabilidad')) {
      setOrganizationType('Bioeconomía, Agroindustria & Economía Circular');
      setPrimaryChallenge('Formulación y desarrollo de proyecto de Bioeconomía / Trazabilidad IoT');
      setCurrentStack(['Sensores IoT / Planta', 'PostgreSQL / Datos', 'Odoo ERP v18']);
    } else if (lower.includes('odoo') || lower.includes('b2b2c') || lower.includes('erp')) {
      setOrganizationType('Distribución Mayorista / E-Commerce B2B2C');
      setPrimaryChallenge('Implementación Odoo Community ERP v18 + Portal E-Commerce B2B2C');
      setCurrentStack(['Odoo ERP v18', 'PostgreSQL / Datos', 'Facturación AFIP / B2B']);
    } else if (lower.includes('pmo') || lower.includes('dirección ejecutiva')) {
      setOrganizationType('Industria Manufacturera, Energía & Producción');
      setPrimaryChallenge('Dirección Ejecutiva de Proyecto (PMO Externa - 14 años exp.)');
    } else if (lower.includes('linux') || lower.includes('docker') || lower.includes('infraestructura')) {
      setOrganizationType('Industria Manufacturera, Energía & Producción');
      setPrimaryChallenge('Modernización de Servidores Linux, Contenedores Docker & Soberanía de Datos');
      setCurrentStack(['Linux Ubuntu & Docker', 'PostgreSQL / Datos']);
    } else if (lower.includes('ia services') || lower.includes('gemelo')) {
      setOrganizationType('Empresa de Base Tecnológica (EBT) / IA Services');
      setPrimaryChallenge('IA Services: Gemelo Digital Interactivo, Agentes RAG & Business Intelligence');
      setCurrentStack(['Inteligencia Artificial', 'PostgreSQL / Datos', 'React / Next.js Web']);
    } else {
      setOrganizationType('Empresa de Base Tecnológica (EBT) / IA Services');
      setPrimaryChallenge('Desarrollo de Proyecto de Base Tecnológica / Plataforma Digital');
    }

    setCustomContext(initialPrompt);
  }, [initialPrompt]);

  const toggleStackTag = (tag: string) => {
    setCurrentStack((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleGenerateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingBlueprint(true);
    try {
      const response = await fetch('/api/architecture-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationType,
          primaryChallenge,
          currentStack,
          urgency,
          customContext,
          contactName: companyName,
        }),
      });
      const data = await response.json();
      setProposal(data);

      saveProposalLead({
        organizationType,
        companyName,
        primaryChallenge,
        currentStack,
        urgency,
        architectureTitle: data.architectureTitle,
        diagnosticSummary: data.diagnosticSummary,
        estimatedTimeline: data.estimatedTimeline,
        recommendedStack: data.recommendedStack,
        executiveMessage: data.executiveMessage,
      }).catch(() => {});
    } catch {
      // Fallback handled gracefully
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const getBlueprintSummary = () => {
    if (!proposal) return '';
    return `HOJA DE RUTA EJECUTIVA - GASTÓN BAREA (gastonbarea.com)
Organización: ${companyName ? `${companyName} (${organizationType})` : organizationType}
Eje del Proyecto: ${primaryChallenge}
Propuesta: ${proposal.architectureTitle}
Plazo Estimado: ${proposal.estimatedTimeline}
Tecnologías: ${proposal.recommendedStack.join(', ')}

Diagnóstico:
${proposal.diagnosticSummary}

Fases:
${proposal.workPhases.map((p) => `- ${p.phase} (${p.duration}): ${p.deliverable}`).join('\n')}`;
  };

  const handleCopyBlueprint = () => {
    const text = getBlueprintSummary();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="ia-services" className="w-full bg-white scroll-mt-16">
      <div id="gemelo-digital" className="sr-only" />

      {/* Top Deep-Violet IA Services Banner Block (Frameless) */}
      <div className="w-full py-16 md:py-20 bg-[#160E3B] text-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-left">
          <div className="space-y-4 max-w-3xl">
            <div className="text-xs font-mono text-emerald-400 font-semibold">
              IA SERVICES & ESTRUCTURADOR DE PROYECTOS · METODOLOGÍA 40 · 40 · 20%
            </div>
            <h1
              className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Genere la hoja de ruta técnica y los entregables de su proyecto en tiempo real.
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
              Configure el perfil de su organización para que el Gemelo Digital de Gastón Barea calcule arquitectura recomendada, etapas de ejecución y plazos estimados.
            </p>
          </div>

          {onClientPortalClick && (
            <button
              type="button"
              onClick={onClientPortalClick}
              className="px-5 py-3 text-xs font-mono font-bold text-white bg-white/10 hover:bg-white/20 rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer self-start lg:self-auto shrink-0"
            >
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>Seguimiento en Portal Clientes</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Structurer Area (Clean Tonal Surfaces, No Heavy Boxes) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start text-left">
          {/* Form Column (5 cols) */}
          <form
            onSubmit={handleGenerateBlueprint}
            className="lg:col-span-5 p-7 sm:p-9 rounded-none bg-[#F6F6F9] space-y-5"
          >
            <div className="space-y-1 pb-3 border-b border-black/[0.08]">
              <h3 className="font-display text-lg font-bold text-[#1D1D1F]">
                Parámetros del Proyecto
              </h3>
              <p className="text-xs text-[#515154]">
                Complete los datos clave para simular el plan de ingeniería y gobernanza PMO.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                1. Sector o Vertical Productiva
              </label>
              <select
                value={organizationType}
                onChange={(e) => setOrganizationType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white rounded-none border border-black/[0.1] text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
              >
                {orgOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                2. Solución Principal Requerida
              </label>
              <select
                value={primaryChallenge}
                onChange={(e) => setPrimaryChallenge(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white rounded-none border border-black/[0.1] text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
              >
                {challengeOptions.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                3. Recursos / Tecnologías Involucradas
              </label>
              <div className="flex flex-wrap gap-1.5">
                {stackTags.map((tag) => {
                  const active = currentStack.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleStackTag(tag)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-none transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#291B64] text-white'
                          : 'bg-white text-[#515154] hover:text-[#1D1D1F]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Empresa / Organización
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej: BioPatagonia S.A."
                  className="w-full px-3 py-2.5 text-xs bg-white rounded-none border border-black/[0.1] text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Horizonte de Inicio
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white rounded-none border border-black/[0.1] text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
                >
                  <option value="Crítica (Inmediata)">Inmediato (Esta semana)</option>
                  <option value="Alta (Próximos 30 días)">Próximos 30 días</option>
                  <option value="Media (Trimestre actual)">Trimestre actual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Contexto adicional o alcance buscado (Opcional)
              </label>
              <textarea
                rows={2}
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Describí brevemente el desafío técnico, de IA Services o bioeconomía..."
                className="w-full px-3 py-2.5 text-xs bg-white rounded-none border border-black/[0.1] text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
              />
            </div>

            <button
              type="submit"
              disabled={isGeneratingBlueprint}
              className="w-full py-4 px-5 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingBlueprint ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Estructurando Hoja de Ruta con IA...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generar Hoja de Ruta del Proyecto</span>
                </>
              )}
            </button>
          </form>

          {/* Blueprint Output Column (7 cols - Open Layout without Outer Frame) */}
          <div className="lg:col-span-7 space-y-8">
            {!proposal ? (
              <div className="space-y-8">
                <div className="space-y-3 pb-6 border-b border-black/[0.08]">
                  <div className="text-xs font-mono text-[#291B64] font-semibold">
                    ARQUITECTURA DE EJECUCIÓN · HITOS VERIFICABLES
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1D1D1F]">
                    ¿Cómo estructuramos y dirigimos cada proyecto?
                  </h3>
                  <p className="text-sm text-[#515154] leading-relaxed">
                    Seleccione los parámetros a la izquierda y presione{' '}
                    <strong className="text-[#1D1D1F]">Generar Hoja de Ruta del Proyecto</strong> para obtener un diagnóstico personalizado en vivo, o revise el esquema estándar de gobernanza PMO:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 bg-[#F6F6F9] space-y-2">
                    <div className="text-xs font-mono font-bold text-[#291B64]">HITO 01 · 40%</div>
                    <div className="text-base font-bold text-[#1D1D1F]">Arquitectura & Kick-off</div>
                    <p className="text-xs text-[#515154] leading-relaxed">
                      Definición de alcance cerrado, modelo de datos PostgreSQL, contenedores Docker y entorno base.
                    </p>
                  </div>
                  <div className="p-6 bg-[#F6F6F9] space-y-2">
                    <div className="text-xs font-mono font-bold text-[#291B64]">HITO 02 · 40%</div>
                    <div className="text-base font-bold text-[#1D1D1F]">Validación en Staging</div>
                    <p className="text-xs text-[#515154] leading-relaxed">
                      Despliegue funcional en servidor espejo para pruebas reales con su equipo antes de salir en vivo.
                    </p>
                  </div>
                  <div className="p-6 bg-[#F6F6F9] space-y-2">
                    <div className="text-xs font-mono font-bold text-[#291B64]">HITO 03 · 20%</div>
                    <div className="text-base font-bold text-[#1D1D1F]">Puesta en Producción</div>
                    <p className="text-xs text-[#515154] leading-relaxed">
                      Lanzamiento auditado, capacitación operativa, transferencia de código y soporte SLA en Portal Clientes.
                    </p>
                  </div>
                </div>

                <div className="p-7 bg-[#160E3B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-emerald-400">
                      IA SERVICES · GEMELOS DIGITALES CORPORATIVOS
                    </div>
                    <p className="text-sm text-neutral-200">
                      ¿Quiere replicar una arquitectura interactiva con IA como esta web en su propia empresa?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onScheduleWithProposal(
                        'Consulta directa sobre implementación de IA Services / Gemelo Digital Corporativo.',
                        '02. IA Services: Gemelos Digitales & Agentes RAG'
                      )
                    }
                    className="px-5 py-3 text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Coordinar Reunión IA Services</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-black/[0.08]">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-[#291B64] font-semibold">
                      Plazo estimado: {proposal.estimatedTimeline} · Dirección Ejecutiva Gastón Barea
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1D1D1F]">
                      {proposal.architectureTitle}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyBlueprint}
                    className="px-4 py-2 text-xs font-medium text-[#1D1D1F] bg-[#F6F6F9] hover:bg-black/[0.06] rounded-none inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar Resumen'}</span>
                  </button>
                </div>

                <div className="p-6 bg-[#F6F6F9] space-y-2">
                  <div className="text-xs font-mono text-[#291B64] font-semibold">Diagnóstico Ejecutivo</div>
                  <p className="text-sm sm:text-base text-[#1D1D1F] leading-relaxed">
                    {proposal.diagnosticSummary}
                  </p>
                </div>

                {/* Work Phases */}
                <div className="space-y-4">
                  <div className="text-xs font-mono text-[#515154]">
                    Etapas de Implementación y Entregables
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {proposal.workPhases.map((phase, idx) => (
                      <div key={idx} className="p-5 bg-[#F6F6F9] space-y-1.5">
                        <div className="text-xs font-mono text-[#291B64] font-semibold">
                          {phase.duration}
                        </div>
                        <div className="text-sm font-bold text-[#1D1D1F]">{phase.phase}</div>
                        <p className="text-xs text-[#515154] leading-relaxed">
                          {phase.deliverable}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stack */}
                <div className="pt-3 border-t border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-[#515154]">
                    <span className="font-semibold text-[#1D1D1F]">Stack recomendado: </span>
                    {proposal.recommendedStack.join(' · ')}
                  </div>
                </div>

                {/* Direct Conversion CTA */}
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onScheduleWithProposal(getBlueprintSummary(), proposal.architectureTitle)
                    }
                    className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Validar Hoja de Ruta en Google Meet Pro (30m)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onWhatsAppWithProposal(getBlueprintSummary())}
                    className="px-5 py-3.5 text-xs sm:text-sm font-semibold text-[#1D1D1F] bg-[#F6F6F9] hover:bg-black/[0.06] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Enviar a Gastón por WhatsApp</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
