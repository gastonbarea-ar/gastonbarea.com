import React, { useState, useEffect } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  ArrowRight,
  Video,
  UserCheck,
  MessageSquare,
  Send,
  RefreshCw,
  Compass,
  ExternalLink,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { SITE_CONFIG, SiteConfig } from '../data/siteConfig';
import {
  extractYoutubeId,
  CustomAiSolutionBlueprint,
  buildCustomSolutionBlueprint,
} from '../lib/domainLogic';

interface MatchedSolution {
  serviceCode: string;
  serviceTitle: string;
  sectionId: string;
  timeline: string;
  summary: string;
  ctaLabel: string;
}

interface HeroProps {
  onExploreServices: () => void;
  onScheduleClick: (context?: string) => void;
  onWhatsAppClick: (customText?: string) => void;
  onDiagnosticoClick: () => void;
  onClientPortalClick?: () => void;
  onNavigateToSolution?: (sectionId: string, serviceCode?: string, promptContext?: string) => void;
  onOpenCustomSolution?: (blueprint: CustomAiSolutionBlueprint) => void;
}

interface ChannelVideoItem {
  id: string;
  youtubeId: string;
  code: string;
  label: string;
  title: string;
  subtitle: string;
  duration: string;
  focusArea: string;
}

export const Hero: React.FC<HeroProps> = ({
  onScheduleClick,
  onWhatsAppClick,
  onDiagnosticoClick,
  onClientPortalClick,
  onNavigateToSolution,
  onOpenCustomSolution,
}) => {
  const [liveConfig, setLiveConfig] = useState<SiteConfig>(SITE_CONFIG);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [customYoutubeInput, setCustomYoutubeInput] = useState<string>('');
  const [showVideoSelector, setShowVideoSelector] = useState<boolean>(false);
  const [overrideYoutubeId, setOverrideYoutubeId] = useState<string>('');
  const [overrideDirectVideoUrl, setOverrideDirectVideoUrl] = useState<string>('');
  const [videoFitMode, setVideoFitMode] = useState<'cover' | 'contain'>('cover');

  const [isImmersionActive, setIsImmersionActive] = useState<boolean>(false);
  const [isCinemaExpanded, setIsCinemaExpanded] = useState<boolean>(false);

  // Interactive Web AI Solution Finder State
  const [aiQuery, setAiQuery] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [lastBlueprint, setLastBlueprint] = useState<CustomAiSolutionBlueprint>(() =>
    buildCustomSolutionBlueprint(
      'Integrar Inteligencia Artificial, Gemelo Digital interactivo y trazabilidad operativa'
    )
  );
  const [aiResponseText, setAiResponseText] = useState<string>(
    'Toda esta plataforma opera como mi Gemelo Digital entrenado con 30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes. Escribí qué desafío querés resolver en la barra: la IA reorganizará todo el contenido y creará una página de solución con servicios a medida para tu necesidad.'
  );
  const [matchedSolution, setMatchedSolution] = useState<MatchedSolution>({
    serviceCode: '02',
    serviceTitle: '02. IA Services, Gemelos Digitales & Business Intelligence',
    sectionId: '#ia-services',
    timeline: '3 a 6 semanas',
    summary:
      'Integración de arquitecturas web inteligentes, Gemelos Digitales corporativos, agentes entrenados con datos propios (RAG) y tableros predictivos.',
    ctaLabel: 'Abrir página de IA Services',
  });

  useEffect(() => {
    fetch('/api/site-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const cfg = data?.config || data;
        if (cfg && cfg.presentationVideo) {
          setLiveConfig(cfg);
          if (cfg.presentationVideo.videoFitMode) {
            setVideoFitMode(cfg.presentationVideo.videoFitMode);
          }
        }
      })
      .catch(() => {});
  }, []);

  const videoConfig = liveConfig.presentationVideo || SITE_CONFIG.presentationVideo;
  const resolvedConfigId =
    videoConfig.youtubeId && videoConfig.youtubeId !== 'L_LUpnjgPso'
      ? videoConfig.youtubeId
      : 'XVYUP8Pz-hE';
  const primaryYoutubeId = overrideYoutubeId || resolvedConfigId;
  const activeDirectVideoUrl =
    overrideDirectVideoUrl || videoConfig.directVideoUrl?.trim() || '';
  const youtubeChannelUrl = liveConfig.social?.youtube || 'https://www.youtube.com/@gastonbarea';

  const channelPlaylist: ChannelVideoItem[] = [
    {
      id: 'ep-01',
      youtubeId: primaryYoutubeId,
      code: '01',
      label: 'Presentación General',
      title:
        videoConfig.title ||
        'Proyectos de Base Tecnológica y Bioeconomía: De la Visión a la Producción',
      subtitle:
        videoConfig.subtitle ||
        '30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos estratégicos con clientes.',
      duration: videoConfig.duration || '04:20',
      focusArea: 'Arquitectura · PMO · Producción',
    },
    {
      id: 'ep-02',
      youtubeId: primaryYoutubeId,
      code: '02',
      label: 'IA Services & Gemelos',
      title: 'IA Services: Cómo transformar una Web o Empresa en un Gemelo Digital Interactivo',
      subtitle:
        'Agentes de Inteligencia Artificial conectados a tus procesos, catálogos y bases de datos productivas en tiempo real.',
      duration: '03:45',
      focusArea: 'IA Services · Agentes RAG · BI',
    },
    {
      id: 'ep-03',
      youtubeId: primaryYoutubeId,
      code: '03',
      label: 'Bioeconomía & Odoo ERP',
      title: 'Trazabilidad en Bioeconomía, Odoo ERP v18 y Dirección Ejecutiva PMO',
      subtitle:
        'Unificación de campo, planta industrial y canales B2B2C con metodología auditada por hitos 40 · 40 · 20%.',
      duration: '05:10',
      focusArea: 'Bioeconomía · Odoo v18 · B2B2C',
    },
  ];

  const activeVideo = channelPlaylist[selectedVideoIndex] || channelPlaylist[0];

  const handleEnterExperience = () => {
    setIsImmersionActive(true);
    setIsMuted(false);
  };

  const handleApplyCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customYoutubeInput.trim();
    if (!trimmed) return;

    // Detect if user pasted a direct MP4/WebM/HLS URL (e.g. Cloudflare R2 / CDN)
    if (
      /\.(mp4|webm|m3u8)(\?.*)?$/i.test(trimmed) ||
      trimmed.includes('r2.dev/') ||
      trimmed.includes('cloudflare')
    ) {
      setOverrideDirectVideoUrl(trimmed);
      setIsImmersionActive(true);
      setIsMuted(false);
      setShowVideoSelector(false);
      setCustomYoutubeInput('');
      return;
    }

    const extracted = extractYoutubeId(trimmed);
    if (extracted) {
      setOverrideDirectVideoUrl('');
      setOverrideYoutubeId(extracted);
      setIsImmersionActive(true);
      setIsMuted(false);
      setShowVideoSelector(false);
      setCustomYoutubeInput('');
    }
  };

  const quickIntents = [
    {
      code: '01',
      label: 'Base Tecnológica',
      query:
        'Queremos desarrollar y escalar un proyecto de base tecnológica o plataforma digital productiva.',
    },
    {
      code: '02',
      label: 'IA Services & Gemelo Digital',
      query:
        'Nos interesa el ítem IA Services para integrar Inteligencia Artificial o un Gemelo Digital interactivo en nuestra empresa.',
    },
    {
      code: '03',
      label: 'Bioeconomía & Trazabilidad',
      query:
        'Tenemos un proyecto basado en bioeconomía / agroindustria y necesitamos trazabilidad digital y telemetría IoT.',
    },
    {
      code: '04',
      label: 'Dirección PMO (14 Años)',
      query:
        'Buscamos dirección ejecutiva de proyectos (PMO) con experiencia liderando equipos y clientes.',
    },
    {
      code: '05',
      label: 'Odoo ERP v18 & B2B2C',
      query:
        'Queremos implementar Odoo Community ERP sin costo de licencias integrado con E-Commerce B2B2C.',
    },
  ];

  const handleAskWebAi = async (customPrompt?: string, openDedicatedPage = true) => {
    const promptToSend = (customPrompt ?? aiQuery).trim();
    if (!promptToSend || isAiThinking) return;

    if (!customPrompt) setAiQuery('');
    setIsAiThinking(true);

    try {
      const response = await fetch('/api/ai-custom-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: promptToSend,
        }),
      });
      const data = await response.json();
      const blueprint: CustomAiSolutionBlueprint =
        data?.blueprint || buildCustomSolutionBlueprint(promptToSend);

      setLastBlueprint(blueprint);
      setAiResponseText(blueprint.executiveDiagnosis);
      setMatchedSolution(blueprint.matchedSolution);

      if (openDedicatedPage && onOpenCustomSolution) {
        onOpenCustomSolution(blueprint);
      }
    } catch {
      const fallbackBlueprint = buildCustomSolutionBlueprint(promptToSend);
      setLastBlueprint(fallbackBlueprint);
      setAiResponseText(fallbackBlueprint.executiveDiagnosis);
      setMatchedSolution(fallbackBlueprint.matchedSolution);

      if (openDedicatedPage && onOpenCustomSolution) {
        onOpenCustomSolution(fallbackBlueprint);
      }
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <section id="inicio" className="relative w-full bg-white">
      {/* BLOQUE 1: ESCENARIO AUDIOVISUAL FULL-WIDTH (Sin marcos recargados) */}
      <div className="w-full pt-16 bg-[#08080C] text-white overflow-hidden">
        {/* Optional YouTube or Cloudflare R2 Direct MP4 URL Loader Bar */}
        {showVideoSelector && (
          <form
            onSubmit={handleApplyCustomVideo}
            className="w-full px-4 sm:px-8 lg:px-12 py-3.5 bg-[#12121A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10"
          >
            <div className="text-xs font-mono text-neutral-300">
              Pegá una URL directa <strong className="text-emerald-400">.mp4 / Cloudflare R2</strong> o el ID/URL de <strong className="text-white">YouTube</strong>:
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={customYoutubeInput}
                onChange={(e) => setCustomYoutubeInput(e.target.value)}
                placeholder="https://pub-xxx.r2.dev/video.mp4 o https://youtu.be/XVYUP8Pz-hE"
                className="px-3.5 py-2 text-xs font-mono bg-black/60 text-white rounded-none border border-white/15 focus:outline-none focus:border-white sm:min-w-[340px]"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors cursor-pointer whitespace-nowrap"
              >
                Cargar Stream
              </button>
            </div>
          </form>
        )}

        {/* Main Full-Bleed Cinema Split (Zero Overlap on Mobile & Desktop) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* LEFT / FULL STAGE: HYBRID VIDEO STREAM (CDN MP4 OR YOUTUBE) + NON-OVERLAPPING CONTROL BAR */}
          <div
            className={`${
              isCinemaExpanded ? 'lg:col-span-12' : 'lg:col-span-8'
            } relative bg-black overflow-hidden flex flex-col justify-between transition-all duration-150`}
          >
            {/* Video Frame Container — Strictly fitted to frame without black letterbox bars */}
            <div
              className={`relative w-full aspect-video ${
                videoFitMode === 'cover' && !isCinemaExpanded
                  ? 'lg:aspect-auto lg:flex-1 lg:min-h-[480px]'
                  : 'lg:aspect-video'
              } bg-black overflow-hidden`}
            >
              {activeDirectVideoUrl ? (
                <video
                  key={`${activeDirectVideoUrl}-${isMuted ? 'muted' : 'sound'}`}
                  src={activeDirectVideoUrl}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  className={`w-full h-full ${
                    videoFitMode === 'cover' ? 'object-cover' : 'object-contain'
                  }`}
                />
              ) : (
                <div
                  className={`w-full h-full ${
                    videoFitMode === 'cover' && !isCinemaExpanded
                      ? 'lg:scale-[1.18] lg:origin-center transition-transform duration-300'
                      : ''
                  }`}
                >
                  <iframe
                    key={`${activeVideo.youtubeId}-${isMuted ? 'muted' : 'sound'}-${selectedVideoIndex}`}
                    src={
                      isMuted
                        ? `https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&mute=1&controls=1&loop=1&playlist=${activeVideo.youtubeId}&rel=0&modestbranding=1&playsinline=1`
                        : `https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1`
                    }
                    title={activeVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Clean Non-Overlapping Video Control & Episode Bar Below Player (Selector 1) */}
            <div className="relative z-10 w-full bg-[#0B0B10] px-4 sm:px-6 lg:px-8 py-4 border-t border-white/10 flex flex-col gap-3.5 text-left">
              {/* Row 1: Active Episode Title + Sound & Stage Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-emerald-400">
                    <span className="font-semibold">
                      {activeDirectVideoUrl ? 'STREAM DIRECTO CDN' : 'CANAL YOUTUBE'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeVideo.focusArea}</span>
                  </div>
                  <h2 className="font-display text-sm sm:text-base font-bold text-white truncate">
                    {activeVideo.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImmersionActive(true);
                      setIsMuted(!isMuted);
                    }}
                    className="px-3.5 py-2 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {isMuted ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Activar Audio</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Silenciar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setVideoFitMode(videoFitMode === 'cover' ? 'contain' : 'cover')
                    }
                    className="px-3 py-2 text-xs font-mono text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    title="Alternar entre Llenar Frame (Cover) o Proporción 16:9 Completa"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {videoFitMode === 'cover' ? 'Ajuste: Cover 100%' : 'Ajuste: 16:9 Nativo'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVideoSelector(!showVideoSelector)}
                    className="px-3 py-2 text-xs font-mono text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Cambiar Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCinemaExpanded(!isCinemaExpanded)}
                    className="hidden lg:inline-flex px-3 py-2 text-xs font-mono text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors items-center gap-1.5 cursor-pointer"
                  >
                    {isCinemaExpanded ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Vista Split</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Expandir</span>
                      </>
                    )}
                  </button>

                  <a
                    href={youtubeChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-mono text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>@gastonbarea</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Row 2: Episode Selector Tabs (Clean grid on mobile, inline on desktop) */}
              <div className="pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {channelPlaylist.map((vid, idx) => {
                  const active = selectedVideoIndex === idx;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setSelectedVideoIndex(idx)}
                      className={`px-3 py-2 text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        active
                          ? 'bg-[#291B64] text-white'
                          : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="truncate">
                        <span className="text-[11px] font-mono text-emerald-400 mr-1.5 font-bold">
                          {vid.code}.
                        </span>
                        <span className="text-xs font-semibold">{vid.label}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-75 shrink-0">
                        {vid.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT EXECUTIVE BIO & DIRECT ACCESS COLUMN (Selector 2: Clean responsive stack) */}
          {!isCinemaExpanded && (
            <div className="lg:col-span-4 p-5 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 text-left bg-[#0E0E14] border-t lg:border-t-0 lg:border-l border-white/10">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400">
                  <span className="text-white font-bold tracking-wider">GASTONBAREA.COM</span>
                  <span aria-hidden="true">·</span>
                  <span>30 AÑOS TECH</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">14 AÑOS PMO</span>
                </div>

                <h1
                  className="font-display text-2xl sm:text-3xl lg:text-[2rem] font-bold tracking-tight text-white leading-[1.15]"
                  style={{ textWrap: 'balance' }}
                >
                  Consultor y desarrollador de proyectos de base tecnológica, IA Services y bioeconomía.
                </h1>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Toda esta web funciona como mi{' '}
                  <strong className="text-white font-semibold">Gemelo Digital</strong>. Explorá los bloques temáticos del inicio o navegá a cada página dedicada para estructurar tu proyecto e interactuar con mi experiencia.
                </p>
              </div>

              {/* Clean Executive Actions */}
              <div className="space-y-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => onScheduleClick('Sesión Ejecutiva Google Meet Pro desde Portada')}
                  className="w-full px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Agendar Google Meet Pro (30m)</span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={onDiagnosticoClick}
                  className="w-full px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold text-white bg-white/[0.07] hover:bg-[#291B64] rounded-none transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Ir a IA Services & Estructurador</span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 pt-2">
                  <button
                    type="button"
                    onClick={() => onWhatsAppClick()}
                    className="hover:text-white underline underline-offset-4 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Directo</span>
                  </button>

                  {onClientPortalClick && (
                    <button
                      type="button"
                      onClick={onClientPortalClick}
                      className="hover:text-white underline underline-offset-4 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-neutral-300" />
                      <span>Portal Clientes</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BLOQUE 2: BUSCADOR Y ESTRUCTURADOR DE SOLUCIONES CON IA */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 md:py-20 bg-[#F7F7FA]">
        <div className="w-full space-y-10 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-mono text-[#291B64] font-semibold">
                BLOQUE INTERACTIVO · REORGANIZADOR DE SOLUCIONES CON IA EN VIVO
              </div>
              <h2
                className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]"
                style={{ textWrap: 'balance' }}
              >
                ¿Qué proyecto o desafío querés resolver hoy?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#515154] max-w-md leading-relaxed">
              Escribí tu consulta en la barra o elegí un eje estratégico. La IA reorganizará todo el contenido creando una página de solución con servicios a medida, hoja de ruta 40·40·20 y proyectos en producción afines.
            </p>
          </div>

          {/* Interactive Intent Selector + Sleek Unboxed Input */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {quickIntents.map((intent) => {
                const isSelected = matchedSolution.serviceCode === intent.code;
                return (
                  <button
                    key={intent.code}
                    type="button"
                    onClick={() => handleAskWebAi(intent.query, true)}
                    disabled={isAiThinking}
                    className={`px-4 py-2 text-xs font-semibold rounded-none transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#291B64] text-white'
                        : 'bg-white text-[#1D1D1F] hover:bg-[#291B64]/10'
                    }`}
                  >
                    {intent.code}. {intent.label}
                  </button>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskWebAi(undefined, true);
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2 rounded-none bg-white shadow-xs"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-2.5">
                <Compass className="w-5 h-5 text-[#291B64] shrink-0" />
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Describí tu necesidad (ej: 'Automatizar planta industrial con IoT', 'Trazabilidad en bioeconomía', 'Implementar Odoo B2B2C')..."
                  className="w-full text-sm bg-transparent text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isAiThinking || !aiQuery.trim()}
                className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {isAiThinking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Diseñando Solución a Medida...</span>
                  </>
                ) : (
                  <>
                    <span>Generar Solución a Medida con IA</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Open Two-Column AI Result (Tonal surfaces, zero heavy borders) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
            {/* Left (7 cols): Gastón's AI Synthesis + Preview of Tailored Services */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-white flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
                  <span className="text-[#291B64] font-semibold">
                    ARQUITECTURA SINTETIZADA · {lastBlueprint.query.toUpperCase()}
                  </span>
                  <span>30 Años Tech · 14 Años PMO</span>
                </div>

                <h3 className="font-display text-lg sm:text-xl font-bold text-[#1D1D1F]">
                  {lastBlueprint.solutionTitle}
                </h3>

                <p className="text-sm text-[#515154] leading-relaxed whitespace-pre-line">
                  {aiResponseText}
                </p>

                {/* Preview of the 3 bespoke services created */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {lastBlueprint.tailoredServices.map((srv) => (
                    <div
                      key={srv.code}
                      className="p-3.5 bg-[#F7F7FA] border-l-2 border-[#291B64] space-y-1"
                    >
                      <div className="text-[11px] font-mono font-bold text-[#291B64]">
                        MÓDULO {srv.code} · {srv.impactMetric}
                      </div>
                      <div className="text-xs font-semibold text-[#1D1D1F] leading-snug">
                        {srv.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>Ejecución auditada: 40% Arquitectura · 40% Staging · 20% Producción</span>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCustomSolution) {
                      onOpenCustomSolution(lastBlueprint);
                    }
                  }}
                  className="font-semibold text-[#291B64] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir Página Completa de esta Solución (#solucion-ia)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right (5 cols): Dedicated Personalized Solution Action Card */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#18103C] text-white flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-400">
                  <span>PÁGINA DE SOLUCIÓN A MEDIDA</span>
                  <span>Plazo: {lastBlueprint.estimatedTimeline}</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                  {matchedSolution.serviceTitle}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {matchedSolution.summary}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCustomSolution) {
                      onOpenCustomSolution(lastBlueprint);
                    }
                  }}
                  className="px-5 py-3.5 text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Ver Solución Diseñada a Medida</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToSolution) {
                      onNavigateToSolution(
                        matchedSolution.sectionId,
                        matchedSolution.serviceCode,
                        aiResponseText
                      );
                    }
                  }}
                  className="px-4 py-3.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-none transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  {matchedSolution.ctaLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
