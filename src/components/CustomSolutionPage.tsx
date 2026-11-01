import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  RefreshCw,
  Send,
  Video,
  CheckCircle2,
  UserCheck,
  ExternalLink,
  FolderKanban,
  Layers,
  ShieldCheck,
  MessageSquare,
  Download,
  Mail,
} from 'lucide-react';
import {
  CustomAiSolutionBlueprint,
  buildCustomSolutionBlueprint,
  downloadAiStudyDossier,
} from '../lib/domainLogic';
import { PROJECTS_CATALOG, ProductionProject } from '../data/projectsData';

interface CustomSolutionPageProps {
  blueprint: CustomAiSolutionBlueprint;
  onUpdateBlueprint: (nextBlueprint: CustomAiSolutionBlueprint) => void;
  onScheduleClick: (context?: string) => void;
  onWhatsAppClick: (customText?: string) => void;
  onClientPortalClick: () => void;
  onNavigateToSection: (sectionHref: string, serviceCode?: string) => void;
  onSelectProjectForContact: (projectTitle: string, solutionRef: string) => void;
}

export const CustomSolutionPage: React.FC<CustomSolutionPageProps> = ({
  blueprint,
  onUpdateBlueprint,
  onScheduleClick,
  onWhatsAppClick,
  onClientPortalClick,
  onNavigateToSection,
  onSelectProjectForContact,
}) => {
  const [refineQuery, setRefineQuery] = useState<string>(blueprint.query || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Follow-up interactive question on this tailored page
  const [followUpInput, setFollowUpInput] = useState<string>('');
  const [followUpAnswer, setFollowUpAnswer] = useState<string>('');
  const [isAskingFollowUp, setIsAskingFollowUp] = useState<boolean>(false);

  // Direct CRM & Client Portal Registration State
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactCompany, setContactCompany] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [isSavingToPortal, setIsSavingToPortal] = useState<boolean>(false);
  const [portalSaveFeedback, setPortalSaveFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    credentials?: { username: string; password?: string };
  }>({ status: 'idle', message: '' });

  // Reorder production projects based on AI recommendation
  const recommendedProjects: ProductionProject[] = React.useMemo(() => {
    const idOrder = blueprint.recommendedProjectIds || [];
    const matched: ProductionProject[] = [];
    idOrder.forEach((id) => {
      const found = PROJECTS_CATALOG.find((p) => p.id === id);
      if (found && !matched.some((m) => m.id === found.id)) {
        matched.push(found);
      }
    });
    PROJECTS_CATALOG.forEach((p) => {
      if (!matched.some((m) => m.id === p.id)) {
        matched.push(p);
      }
    });
    return matched.slice(0, 3);
  }, [blueprint.recommendedProjectIds]);

  const handleRefineSolution = async (customPrompt?: string) => {
    const targetQuery = (customPrompt ?? refineQuery).trim();
    if (!targetQuery || isGenerating) return;
    setIsGenerating(true);
    setFollowUpAnswer('');

    try {
      const res = await fetch('/api/ai-custom-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.blueprint) {
          onUpdateBlueprint(data.blueprint);
          setRefineQuery(data.blueprint.query);
          setIsGenerating(false);
          return;
        }
      }
    } catch {
      // Fallback below
    }

    const synthesized = buildCustomSolutionBlueprint(targetQuery);
    onUpdateBlueprint(synthesized);
    setRefineQuery(synthesized.query);
    setIsGenerating(false);
  };

  const handleAskFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = followUpInput.trim();
    if (!question || isAskingFollowUp) return;
    setIsAskingFollowUp(true);

    try {
      const res = await fetch('/api/architecture-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          proposalContext: {
            query: blueprint.query,
            solutionTitle: blueprint.solutionTitle,
            primaryVertical: blueprint.primaryVertical,
            tailoredServices: blueprint.tailoredServices,
            roadmapPhases: blueprint.roadmapPhases,
          },
        }),
      });
      const data = await res.json();
      if (data?.answer) {
        setFollowUpAnswer(data.answer);
      }
    } catch {
      setFollowUpAnswer(
        `Respecto a "${question}": estructuramos este alcance dentro del Hito 1 (40% Arquitectura) y lo validamos con pruebas reales en el Servidor Staging (Hito 2 - 40%) antes de salir a producción.`
      );
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  const handleSaveToCrmAndPortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || isSavingToPortal) return;

    const resolvedName =
      contactName.trim() || contactEmail.trim().split('@')[0] || 'Ejecutivo';

    setIsSavingToPortal(true);
    setPortalSaveFeedback({ status: 'idle', message: '' });

    try {
      const response = await fetch('/api/send-ai-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: resolvedName,
          clientEmail: contactEmail.trim(),
          companyName: contactCompany.trim() || 'Cuenta Individual / En Evaluación',
          phone: contactPhone.trim() || '',
          blueprint,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPortalSaveFeedback({
          status: 'success',
          message:
            '¡Listo! Enviamos el Estudio Técnico completo a tu correo electrónico (vía notificaciones@gastonbarea.com) y vinculamos la arquitectura a tu cuenta del Portal de Clientes.',
          credentials: data.portalAccount
            ? {
                username: data.portalAccount.username,
                password: data.portalAccount.password,
              }
            : undefined,
        });
      } else {
        throw new Error(data?.error || 'Error al enviar el estudio por email');
      }
    } catch {
      setPortalSaveFeedback({
        status: 'error',
        message:
          'No se pudo enviar automáticamente en este instante. Podés descargar el estudio directamente con el botón de descarga o continuar por WhatsApp Directo.',
      });
    } finally {
      setIsSavingToPortal(false);
    }
  };

  const scheduleSummaryContext = `[ARQUITECTURA PERSONALIZADA IA]\nConsulta Original: "${blueprint.query}"\nSolución Diseñada: ${blueprint.solutionTitle}\nVertical Principal: ${blueprint.primaryVertical}\nPlazo Estimado: ${blueprint.estimatedTimeline}\nServicios Creados:\n${blueprint.tailoredServices
    .map((s) => `- ${s.code}. ${s.title}: ${s.deliverable} (${s.impactMetric})`)
    .join('\n')}`;

  return (
    <div className="w-full bg-white text-[#1D1D1F]">
      {/* 1. CABECERA EJECUTIVA DE LA SOLUCIÓN PERSONALIZADA + BARRA DE REFINAMIENTO IA */}
      <section className="w-full bg-[#0B0B10] text-white border-b border-white/10">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 lg:py-16 space-y-10">
          {/* Interactive Refinement Bar at the Top */}
          <div className="p-4 sm:p-6 bg-[#13141C] border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400">
              <span className="text-emerald-400 font-semibold">
                ESTUDIO TÉCNICO PERSONALIZADO CON IA · GEMELO DIGITAL EN VIVO
              </span>
              <span>30 AÑOS TECH · 14 AÑOS DIRECCIÓN PMO</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRefineSolution();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#0B0B10] border border-white/15">
                <Compass className="w-5 h-5 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={refineQuery}
                  onChange={(e) => setRefineQuery(e.target.value)}
                  placeholder="Refiná tu requerimiento o describí otro desafío empresarial para recalcular el estudio en tiempo real..."
                  className="w-full text-sm bg-transparent text-white placeholder:text-neutral-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating || !refineQuery.trim()}
                className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Recalculando Estudio...</span>
                  </>
                ) : (
                  <>
                    <span>Actualizar Estudio con IA</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick preset refinement triggers */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-neutral-400 mr-1">
                Adaptar enfoque hacia:
              </span>
              {[
                'Industria 4.0, telemetría IoT de planta y mantenimiento predictivo',
                'Bioeconomía, trazabilidad de cultivos/biomasa y certificación ESG',
                'Agentes de IA (RAG), Gemelo Digital corporativo y automatización B2B',
                'Implementación Odoo ERP v18 sin licencias + E-Commerce B2B2C',
              ].map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRefineSolution(sample)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 text-xs text-neutral-300 bg-white/[0.05] hover:bg-[#291B64] hover:text-white transition-colors cursor-pointer text-left"
                >
                  0{idx + 1}. {sample.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Main Strategic Diagnosis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-emerald-400">
                <span>CONSULTA ANALIZADA: &ldquo;{blueprint.query}&rdquo;</span>
                <span aria-hidden="true">·</span>
                <span className="text-neutral-300">{blueprint.primaryVertical}</span>
              </div>

              <h1
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                {blueprint.solutionTitle}
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed whitespace-pre-line max-w-3xl">
                {blueprint.executiveDiagnosis}
              </p>

              {/* Recommended Tech Stack Row */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="text-xs font-mono text-neutral-400">
                  STACK TECNOLÓGICO SELECCIONADO PARA TU ARQUITECTURA:
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-mono text-emerald-300">
                  {blueprint.recommendedStack.map((tech, i) => (
                    <span key={i}>
                      0{i + 1}. {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Study Download + Direct Channels Bar below diagnosis */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    downloadAiStudyDossier(
                      blueprint,
                      contactName.trim() || undefined,
                      contactCompany.trim() || undefined
                    )
                  }
                  className="px-4 py-2.5 text-xs font-mono font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Descargar Estudio como Documento (.HTML / PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onScheduleClick(scheduleSummaryContext)}
                  className="px-4 py-2.5 text-xs font-mono font-bold text-emerald-300 bg-[#291B64]/60 hover:bg-[#291B64] border border-emerald-400/30 inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span>¡Hablemos! Agendar Meet</span>
                </button>
              </div>
            </div>

            {/* Right Executive Box: PRIORITIZED EMAIL DISPATCH, WHATSAPP DIRECT & DOWNLOAD */}
            <div className="lg:col-span-5 p-6 sm:p-7 bg-[#13141C] border border-emerald-400/30 space-y-5 text-left">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-emerald-400 font-bold">
                  <span>ACCIONES PRIORITARIAS DEL ESTUDIO</span>
                  <span>{blueprint.estimatedTimeline}</span>
                </div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                  Recibí este Estudio en tu Email o continuá por WhatsApp
                </h2>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Enviate ahora mismo el dossier técnico completo a tu correo (incluye acceso automático al Portal de Clientes) o conversemos directo por WhatsApp.
                </p>
              </div>

              {/* Priority #1: WhatsApp Directo */}
              <button
                type="button"
                onClick={() =>
                  onWhatsAppClick(
                    `Hola Gastón, acabo de generar en gastonbarea.com/#solucion-ia el estudio técnico "${blueprint.solutionTitle}" para nuestra consulta: "${blueprint.query}". Me gustaría avanzar con vos.`
                  )
                }
                className="w-full px-5 py-3.5 text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-none transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-md"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>1. Enviar Consulta por WhatsApp Directo</span>
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              {/* Priority #2: Instant Email Study Dispatch Form */}
              <form
                onSubmit={handleSaveToCrmAndPortal}
                className="p-4 bg-[#0B0B10] border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-emerald-300 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>2. ENVIAR ESTUDIO COMPLETO A MI EMAIL</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">Vía Resend</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Tu Nombre y Apellido"
                    className="w-full px-3 py-2 text-xs bg-[#141622] border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                  />
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="tu-correo@empresa.com *"
                    className="w-full px-3 py-2 text-xs bg-[#141622] border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    placeholder="Empresa (Opcional)"
                    className="w-full px-3 py-2 text-xs bg-[#141622] border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                  />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="WhatsApp (Opcional)"
                    className="w-full px-3 py-2 text-xs bg-[#141622] border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingToPortal || !contactEmail.trim()}
                  className="w-full px-4 py-3 text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isSavingToPortal
                      ? 'Enviando Estudio a tu Correo...'
                      : 'Recibir Estudio en mi Email + Activar Portal'}
                  </span>
                </button>

                {portalSaveFeedback.status !== 'idle' && (
                  <div
                    className={`p-3 border text-xs space-y-1.5 ${
                      portalSaveFeedback.status === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                        : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{portalSaveFeedback.message}</span>
                    </div>
                    {portalSaveFeedback.credentials && (
                      <div className="pt-1.5 border-t border-white/10 font-mono text-[11px] text-white flex flex-wrap items-center justify-between gap-2">
                        <span>
                          Usuario: <strong>{portalSaveFeedback.credentials.username}</strong> · Clave:{' '}
                          <strong>{portalSaveFeedback.credentials.password || 'cliente2026'}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={onClientPortalClick}
                          className="underline text-emerald-300 cursor-pointer"
                        >
                          Abrir Portal →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>

              {/* Priority #3: Download Dossier + Schedule Call */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    downloadAiStudyDossier(
                      blueprint,
                      contactName.trim() || undefined,
                      contactCompany.trim() || undefined
                    )
                  }
                  className="px-4 py-2.5 text-xs font-mono font-semibold text-white bg-white/[0.08] hover:bg-white/[0.15] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Descargar Estudio</span>
                </button>

                <button
                  type="button"
                  onClick={() => onScheduleClick(scheduleSummaryContext)}
                  className="px-4 py-2.5 text-xs font-mono font-semibold text-white bg-white/[0.08] hover:bg-white/[0.15] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-300" />
                  <span>¡Hablemos! Agendar Meet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BLOQUE 01: SERVICIOS Y MÓDULOS DISEÑADOS A MEDIDA PARA TU CONSULTA */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 lg:py-20 bg-white border-b border-black/[0.08]">
        <div className="w-full space-y-10 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="text-xs font-mono font-bold text-[#291B64] uppercase tracking-wider">
                01. SERVICIOS CREADOS A MEDIDA PARA TU REQUERIMIENTO
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]">
                Arquitectura modular reorganizada según tus necesidades operativas.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#515154] max-w-md leading-relaxed">
              Cada servicio combina desarrollo de ingeniería, integración de datos y dirección ejecutiva PMO para resolver el desafío planteado sin costos de licencias ocultos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {blueprint.tailoredServices.map((srv) => (
              <article
                key={srv.code}
                className="p-6 sm:p-8 bg-[#F7F7FA] border border-black/[0.08] flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-black/[0.08] pb-3">
                    <span className="font-mono text-sm font-bold text-[#291B64]">
                      MÓDULO {srv.code}
                    </span>
                    <span className="font-mono text-xs text-emerald-700 font-semibold">
                      {srv.impactMetric}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#1D1D1F] leading-snug">
                    {srv.title}
                  </h3>

                  <div className="space-y-3 text-xs sm:text-sm text-[#515154] leading-relaxed">
                    <div>
                      <strong className="text-[#1D1D1F] block font-mono text-xs uppercase tracking-wider mb-1">
                        Problema que resuelve:
                      </strong>
                      {srv.problemSolved}
                    </div>
                    <div>
                      <strong className="text-[#1D1D1F] block font-mono text-xs uppercase tracking-wider mb-1">
                        Arquitectura e Ingeniería:
                      </strong>
                      {srv.technicalApproach}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.08] space-y-3">
                  <div className="text-xs text-[#1D1D1F]">
                    <span className="font-mono font-bold text-[#291B64] block mb-0.5">
                      ENTREGABLE AUDITABLE:
                    </span>
                    {srv.deliverable}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BLOQUE 02: HOJA DE RUTA TÉCNICA & GOBERNANZA PMO (ESQUEMA 40 / 40 / 20) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 lg:py-20 bg-[#F7F7FA] border-b border-black/[0.08]">
        <div className="w-full space-y-10 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="text-xs font-mono font-bold text-[#291B64] uppercase tracking-wider">
                02. PLAN DE EJECUCIÓN PMO · ESQUEMA 40% · 40% · 20%
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]">
                Hoja de ruta por hitos verificables en Servidor Staging.
              </h2>
            </div>
            <div className="text-xs font-mono text-[#515154]">
              PLAZO TOTAL ESTIMADO:{' '}
              <strong className="text-[#1D1D1F]">{blueprint.estimatedTimeline}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {blueprint.roadmapPhases.map((phase) => (
              <div
                key={phase.phaseCode}
                className="p-6 sm:p-8 bg-white border border-black/[0.08] flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#291B64] uppercase">
                      {phase.phaseCode} · HITO {phase.percentage}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {phase.duration}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#1D1D1F]">
                    {phase.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                    {phase.deliverable}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/[0.06] text-xs text-slate-600">
                  <strong className="font-mono text-[#1D1D1F] block mb-1">
                    CRITERIO DE VALIDACIÓN PMO:
                  </strong>
                  {phase.verificationCriteria}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Q&A Box to refine technical doubts on this solution */}
          <div className="p-6 sm:p-8 bg-white border border-black/[0.08] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-mono font-bold text-[#291B64]">
                CONSULTA TÉCNICA EN VIVO SOBRE ESTA HOJA DE RUTA
              </div>
              <span className="text-xs text-slate-500">
                Respondido por el Gemelo Digital de Gastón Barea
              </span>
            </div>

            <form
              onSubmit={handleAskFollowUp}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="¿Tenés alguna duda específica sobre integraciones, costos de servidores, migración de datos o plazos de esta solución?"
                className="flex-1 px-4 py-3 text-sm bg-[#F7F7FA] border border-black/[0.08] text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
              />
              <button
                type="submit"
                disabled={isAskingFollowUp || !followUpInput.trim()}
                className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {isAskingFollowUp ? 'Consultando...' : 'Preguntar sobre esta Arquitectura'}
              </button>
            </form>

            {followUpAnswer && (
              <div className="p-5 bg-[#F7F7FA] border-l-4 border-[#291B64] text-sm text-[#1D1D1F] leading-relaxed whitespace-pre-line">
                {followUpAnswer}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. BLOQUE 03: PROYECTOS EN PRODUCCIÓN Y EVIDENCIA REORGANIZADA */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 lg:py-20 bg-white border-b border-black/[0.08]">
        <div className="w-full space-y-10 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="text-xs font-mono font-bold text-[#291B64] uppercase tracking-wider">
                03. EVIDENCIA EN PRODUCCIÓN SELECCIONADA PARA TU CASO
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]">
                Sistemas reales desarrollados y en operación vinculados a tu consulta.
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigateToSection(
                  blueprint.matchedSolution.sectionId,
                  blueprint.matchedSolution.serviceCode
                )
              }
              className="px-5 py-3 text-xs font-mono font-bold text-[#291B64] bg-[#F7F7FA] hover:bg-[#291B64] hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer self-start"
            >
              <Layers className="w-4 h-4" />
              <span>{blueprint.matchedSolution.ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recommendedProjects.map((proj, index) => (
              <article
                key={proj.id}
                className="p-6 sm:p-8 bg-[#F7F7FA] border border-black/[0.08] flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="font-bold text-[#291B64]">
                      PRIORIDAD #{index + 1} · {proj.code}
                    </span>
                    <span className="text-emerald-700 font-semibold">
                      {proj.statusLabel}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#1D1D1F] leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                    {proj.summary}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    {proj.architectureHighlights.map((hl, i) => (
                      <div key={i} className="text-xs text-[#1D1D1F] flex items-start gap-2">
                        <span className="font-mono text-[#291B64] font-bold">0{i + 1}.</span>
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.08] space-y-3">
                  <div className="text-xs font-mono text-emerald-800 font-semibold">
                    IMPACTO: {proj.impactMetrics}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectProjectForContact(proj.title, proj.solutionRef)}
                      className="text-xs font-semibold text-[#291B64] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Solicitar arquitectura similar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-slate-600 hover:text-[#1D1D1F] inline-flex items-center gap-1"
                      >
                        <span>Ver en vivo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BLOQUE 04: ENVIAR ESTUDIO POR EMAIL, DESCARGAR DOSSIER & VINCULAR AL PORTAL CLIENTES */}
      <section
        id="guardar-solucion-portal"
        className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 lg:py-20 bg-[#12131A] text-white"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start text-left">
          <div className="lg:col-span-6 space-y-5">
            <div className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
              04. ENVÍO POR EMAIL, DESCARGA DE ESTUDIO & PORTAL CLIENTES
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
              Recibí este estudio en tu correo, descargalo como dossier o avanzá por WhatsApp.
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Al enviarte este estudio por correo electrónico, el sistema despacha el documento completo desde{' '}
              <strong className="text-white">notificaciones@gastonbarea.com</strong>, crea tu ficha en el CRM y habilita tu usuario en el{' '}
              <strong className="text-white">Portal de Clientes (#portal)</strong>.
            </p>

            <div className="space-y-3 pt-2 text-xs sm:text-sm text-neutral-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Dossier completo en tu bandeja de entrada con diagnóstico, stack y hoja de ruta 40/40/20.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <FolderKanban className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Credenciales inmediatas para seguimiento en el Portal de Clientes y canal directo de WhatsApp.
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onWhatsAppClick(
                    `Hola Gastón, estuve analizando el estudio "${blueprint.solutionTitle}" en gastonbarea.com/#solucion-ia y quiero avanzar.`
                  )
                }
                className="px-5 py-3 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Continuar por WhatsApp Directo</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadAiStudyDossier(
                    blueprint,
                    contactName.trim() || undefined,
                    contactCompany.trim() || undefined
                  )
                }
                className="px-5 py-3 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Descargar Estudio (.HTML / PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClientPortalClick}
                className="px-4 py-3 text-xs font-semibold text-white bg-white/5 hover:bg-white/15 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Portal Clientes</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#191B24] border border-white/10 space-y-5">
            <div className="text-xs font-mono text-emerald-400 font-semibold">
              ENVIAR ESTUDIO TÉCNICO A MI CORREO & HABILITAR PORTAL CLIENTES
            </div>

            <form onSubmit={handleSaveToCrmAndPortal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ej: Ing. Martín Rodríguez"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0E0F14] border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="nombre@empresa.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0E0F14] border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">
                    Empresa / Corporación (Opcional)
                  </label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    placeholder="Nombre de la empresa o Independiente"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0E0F14] border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">
                    WhatsApp / Teléfono
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+54 9 ..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0E0F14] border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingToPortal}
                className="w-full px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Mail className="w-4 h-4 text-emerald-300" />
                <span>
                  {isSavingToPortal
                    ? 'Enviando Estudio por Email y Vinculando al Portal...'
                    : 'Recibir Estudio Técnico en mi Email + Guardar en Portal'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {portalSaveFeedback.status !== 'idle' && (
              <div
                className={`p-4 border text-xs sm:text-sm space-y-2 ${
                  portalSaveFeedback.status === 'success'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{portalSaveFeedback.message}</span>
                </div>
                {portalSaveFeedback.credentials && (
                  <div className="pt-2 border-t border-white/10 font-mono text-xs text-white flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Usuario Portal: <strong>{portalSaveFeedback.credentials.username}</strong>
                      {portalSaveFeedback.credentials.password
                        ? ` · Clave: ${portalSaveFeedback.credentials.password}`
                        : ''}
                    </span>
                    <button
                      type="button"
                      onClick={onClientPortalClick}
                      className="underline text-emerald-300 cursor-pointer"
                    >
                      Ingresar al Portal →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
