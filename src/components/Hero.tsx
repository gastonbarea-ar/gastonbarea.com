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
  Download,
  Mail,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { SITE_CONFIG, SiteConfig } from '../data/siteConfig';
import {
  extractYoutubeId,
  CustomAiSolutionBlueprint,
  buildCustomSolutionBlueprint,
  downloadAiStudyDossier,
} from '../lib/domainLogic';
import { ArnClientIntakeWidget } from './ArnClientIntakeWidget';

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
  const [directVideoError, setDirectVideoError] = useState<string>('');
  const [directVideoLoadFailed, setDirectVideoLoadFailed] = useState<boolean>(false);
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

  const rawDirectVideoUrl =
    overrideDirectVideoUrl || videoConfig.directVideoUrl?.trim() || '';

  const isPrivateR2S3Endpoint = (url: string) =>
    url.toLowerCase().includes('r2.cloudflarestorage.com');

  const hasPlayableVideoPath = (url: string) => {
    if (!url) return false;
    if (isPrivateR2S3Endpoint(url)) return false;
    try {
      const parsed = new URL(url);
      // Must have a path beyond "/" (e.g. /video.mp4)
      return parsed.pathname.length > 1 && /\.(mp4|webm|m3u8|mov)(\?.*)?$/i.test(parsed.pathname);
    } catch {
      return /\.(mp4|webm|m3u8|mov)(\?.*)?$/i.test(url);
    }
  };

  const activeDirectVideoUrl =
    rawDirectVideoUrl &&
    !isPrivateR2S3Endpoint(rawDirectVideoUrl) &&
    hasPlayableVideoPath(rawDirectVideoUrl) &&
    !directVideoLoadFailed
      ? rawDirectVideoUrl
      : '';

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

    if (isPrivateR2S3Endpoint(trimmed)) {
      setDirectVideoError(
        'La URL *.r2.cloudflarestorage.com es el endpoint privado de la API S3 del bucket (no reproduce en navegadores) y además falta el nombre del archivo .mp4. En Cloudflare R2 entrá a tu bucket "media-gaston" → pestaña "Settings" → habilitá "Public Development URL (r2.dev)" o "Custom Domains" y copiá el link público terminado en /tu-video.mp4.'
      );
      return;
    }

    if (
      (trimmed.includes('r2.dev') || trimmed.includes('cloudflare') || trimmed.startsWith('http')) &&
      !extractYoutubeId(trimmed) &&
      !hasPlayableVideoPath(trimmed)
    ) {
      setDirectVideoError(
        'A la URL le falta el nombre del archivo de video al final (por ejemplo: https://pub-xxxx.r2.dev/presentacion.mp4). Entrá al objeto dentro del bucket "media-gaston" y copiá su Public URL completa con extensión .mp4 o .webm.'
      );
      return;
    }

    // Detect if user pasted a valid direct MP4/WebM/HLS URL (e.g. Cloudflare R2 pub-*.r2.dev / CDN)
    if (hasPlayableVideoPath(trimmed)) {
      setDirectVideoError('');
      setDirectVideoLoadFailed(false);
      setOverrideDirectVideoUrl(trimmed);
      setIsImmersionActive(true);
      setIsMuted(false);
      setShowVideoSelector(false);
      setCustomYoutubeInput('');
      return;
    }

    const extracted = extractYoutubeId(trimmed);
    if (extracted) {
      setDirectVideoError('');
      setDirectVideoLoadFailed(false);
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
          <div className="w-full px-4 sm:px-8 lg:px-12 py-3.5 bg-[#12121A] border-b border-white/10 space-y-2.5">
            <form
              onSubmit={handleApplyCustomVideo}
              className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
            >
              <div className="text-xs font-mono text-neutral-300">
                Pegá una URL pública <strong className="text-emerald-400">Cloudflare R2 (pub-xxx.r2.dev/archivo.mp4)</strong> o el ID/URL de <strong className="text-white">YouTube</strong>:
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={customYoutubeInput}
                  onChange={(e) => {
                    setCustomYoutubeInput(e.target.value);
                    if (directVideoError) setDirectVideoError('');
                  }}
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
            {directVideoError && (
              <div className="p-2.5 bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-mono leading-relaxed">
                ⚠️ {directVideoError}
              </div>
            )}
          </div>
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
              } bg-black overflow-hidden group`}
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
                  onError={() => {
                    setDirectVideoLoadFailed(true);
                    setDirectVideoError(
                      'No se pudo cargar el archivo de video directo desde esa URL (verificá que el bucket tenga acceso público r2.dev o dominio propio y que el nombre del archivo .mp4 sea exacto). Se activó el respaldo de YouTube automáticamente.'
                    );
                  }}
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

              {/* Floating Action Overlay Inside Video Frame (Hidden on small mobile screens to prevent covering video controls) */}
              <div className="hidden sm:flex absolute top-3.5 right-3.5 z-20 flex-wrap items-center justify-end gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() =>
                    onScheduleClick('Videollamada Google Meet Pro agendada desde el Frame de Video Principal')
                  }
                  className="px-3.5 sm:px-4 py-2.5 text-xs font-mono font-bold text-white bg-[#291B64]/95 hover:bg-[#382586] backdrop-blur-md border border-emerald-400/50 shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <Video className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>¡Hablemos! Agendar Meet</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onWhatsAppClick(
                      'Hola Gastón, estoy viendo tu video de presentación en gastonbarea.com y me gustaría hacerte una consulta directa.'
                    )
                  }
                  className="px-3 py-2.5 text-xs font-mono font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  title="Escribir por WhatsApp Directo"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Clean Non-Overlapping Video Control & Episode Bar Below Player */}
            <div className="relative z-10 w-full bg-[#0B0B10] px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-t border-white/10 flex flex-col gap-3 text-left">
              {/* Row 1: Active Episode Title + Sound & Stage Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
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

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImmersionActive(true);
                      setIsMuted(!isMuted);
                    }}
                    className="min-h-[38px] px-3.5 py-2 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
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
                    className="hidden sm:inline-flex min-h-[38px] px-3 py-2 text-xs font-mono text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors items-center gap-1.5 cursor-pointer shrink-0"
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
                    className="min-h-[38px] px-3 py-2 text-xs font-mono text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Cambiar Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCinemaExpanded(!isCinemaExpanded)}
                    className="hidden lg:inline-flex min-h-[38px] px-3 py-2 text-xs font-mono text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors items-center gap-1.5 cursor-pointer shrink-0"
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
                    className="min-h-[38px] px-3 py-2 text-xs font-mono text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>@gastonbarea</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Row 2: Episode Selector Tabs (Horizontal swipe on mobile, 3-col grid on desktop) */}
              <div className="pt-2.5 border-t border-white/10 flex sm:grid sm:grid-cols-3 gap-2 overflow-x-auto pb-1 sm:pb-0 snap-x">
                {channelPlaylist.map((vid, idx) => {
                  const active = selectedVideoIndex === idx;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setSelectedVideoIndex(idx)}
                      className={`snap-start shrink-0 min-w-[210px] sm:min-w-0 px-3 py-2.5 text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
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

          {/* RIGHT EXECUTIVE BIO & DIRECT ACCESS COLUMN */}
          {!isCinemaExpanded && (
            <div className="lg:col-span-4 p-4 sm:p-7 lg:p-8 flex flex-col justify-between gap-5 text-left bg-[#0E0E14] border-t lg:border-t-0 lg:border-l border-white/10">
              {/* Top: Identity Badge + Executive Title */}
              <div className="space-y-3">
                <div className="inline-flex flex-wrap items-center gap-2 px-2.5 py-1 bg-white/[0.05] border border-white/10 text-[11px] font-mono text-neutral-300">
                  <span className="text-white font-bold tracking-wider">GASTONBAREA.COM</span>
                  <span aria-hidden="true">·</span>
                  <span>30 AÑOS TECH</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-bold">14 AÑOS PMO</span>
                </div>

                <h1
                  className="font-display text-xl sm:text-2xl lg:text-[1.65rem] font-bold tracking-tight text-white leading-[1.18]"
                  style={{ textWrap: 'balance' }}
                >
                  Consultor y desarrollador de proyectos de base tecnológica, IA Services y bioeconomía.
                </h1>

                <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                  Operamos con <strong className="text-emerald-400">ARN (Automated Relationship Network)</strong>: escribí o dictá en una línea qué necesitás abajo y recibí al instante tu propuesta <strong className="text-white">40% · 40% · 20%</strong> con acceso directo a tu Portal de Clientes sin llenar formularios.
                </p>
              </div>

              {/* Primary Highlight: Jump to ARN Zero-Form Client Console */}
              <div className="p-3.5 bg-emerald-400/10 border border-emerald-400/40 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-emerald-300 font-bold">
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>NUEVO · EXPERIENCIA CLIENTE ARN</span>
                  </span>
                  <span>CERO FORMULARIOS</span>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  Cotizá tu proyecto en 1 clic con lenguaje natural o voz y entrá directo a tu Portal de Clientes (#portal).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('arn-home-client-intake');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="w-full min-h-[44px] px-4 py-2.5 text-xs font-mono font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span>Probar Interacción Cliente ARN (1-Clic)</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>

              {/* Middle: Vertical Pillars */}
              <div className="space-y-2 py-2 border-y border-white/10">
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  EJES ESTRATÉGICOS DE EJECUCIÓN DIRECTA:
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAskWebAi(quickIntents[1].query, true)}
                    className="w-full p-2.5 bg-white/[0.03] hover:bg-white/[0.08] border-l-2 border-emerald-400 text-left transition-colors flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">
                        01. IA Services, Gemelos Digitales & RAG
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Agentes conectados a datos propios y BI predictivo
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAskWebAi(quickIntents[2].query, true)}
                    className="w-full p-2.5 bg-white/[0.03] hover:bg-white/[0.08] border-l-2 border-[#6344F5] text-left transition-colors flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">
                        02. Bioeconomía, Agroindustria & IoT
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Trazabilidad de lotes, telemetría y pasaporte ESG
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAskWebAi(quickIntents[4].query, true)}
                    className="w-full p-2.5 bg-white/[0.03] hover:bg-white/[0.08] border-l-2 border-sky-400 text-left transition-colors flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">
                        03. Odoo ERP v18, B2B2C & Dirección PMO
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Sin costo de licencias · Entregas en Servidor Staging
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Bottom: Direct Contact & Action Priorities */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onWhatsAppClick(
                        'Hola Gastón, estuve viendo tu presentación en gastonbarea.com y quiero consultarte por un proyecto.'
                      )
                    }
                    className="w-full min-h-[44px] px-3 py-2.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onScheduleClick('Sesión Ejecutiva Google Meet Pro desde Portada')}
                    className="w-full min-h-[44px] px-3 py-2.5 text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Agendar Meet</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400 pt-1">
                  <span>notificaciones@gastonbarea.com</span>

                  {onClientPortalClick && (
                    <button
                      type="button"
                      onClick={onClientPortalClick}
                      className="text-emerald-400 hover:text-white underline underline-offset-4 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Portal Clientes</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          BLOQUE 1.5 (NUEVO EN HOME): INTERACCIÓN DIRECTA DEL CLIENTE CON ARN
          Cero Formularios · Voz o Texto Natural · Propuesta 40/40/20 + Portal en 1 Clic
         ===================================================================== */}
      <div
        id="arn-home-client-intake"
        className="w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-14 bg-[#0B0D17] border-b border-white/10 scroll-mt-20"
      >
        <div className="w-full space-y-5 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                TRATAMIENTO DE PRESUPUESTOS MEDIANTE REGISTRO · RED AUTÓNOMA ARN
              </div>
              <h2
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white"
                style={{ textWrap: 'balance' }}
              >
                Registrate en 1 paso y gestioná tu presupuesto 40/40/20 directamente en tu Portal.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md leading-relaxed">
              Elegí el servicio del Stock ARN y la cantidad de empleados de tu empresa. Para proteger tu confidencialidad y evitar correos automáticos desde la portada, todo el tratamiento del presupuesto se realiza dentro de tu Portal de Clientes registrado.
            </p>
          </div>

          <ArnClientIntakeWidget
            variant="hero-dark"
            onOpenPortalWithSession={onClientPortalClick}
            onScheduleClick={onScheduleClick}
            onWhatsAppClick={onWhatsAppClick}
          />
        </div>
      </div>

      {/* BLOQUE 2: BUSCADOR Y ESTRUCTURADOR DE SOLUCIONES CON IA */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-12 py-14 md:py-20 bg-[#F7F7FA]">
        <div className="w-full space-y-8 sm:space-y-10 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-mono text-[#291B64] font-semibold">
                BLOQUE INTERACTIVO · ESTUDIO TÉCNICO Y ARQUITECTURA CON IA EN VIVO
              </div>
              <h2
                className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]"
                style={{ textWrap: 'balance' }}
              >
                ¿Querés explorar un estudio técnico profundo por vertical?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#515154] max-w-md leading-relaxed">
              Elegí un eje estratégico o escribí tu consulta técnica para descargar un dossier de arquitectura (.HTML / PDF).
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
                    <span>Diseñando Estudio Técnico...</span>
                  </>
                ) : (
                  <>
                    <span>Generar Estudio Técnico con IA</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Open Two-Column AI Result (Prioritizing Email, WhatsApp & Downloadable Dossier) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
            {/* Left (7 cols): Gastón's AI Synthesis + Preview of Tailored Services */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-white flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
                  <span className="text-[#291B64] font-semibold">
                    ESTUDIO PRELIMINAR IA · {lastBlueprint.query.toUpperCase()}
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
                <button
                  type="button"
                  onClick={() => downloadAiStudyDossier(lastBlueprint)}
                  className="font-mono font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Estudio Técnico (.HTML / PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCustomSolution) {
                      onOpenCustomSolution(lastBlueprint);
                    }
                  }}
                  className="font-semibold text-[#291B64] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir Estudio Completo y Recibir por Email (#solucion-ia)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right (5 cols): Prioritized WhatsApp, Email Study & Download CTAs */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#18103C] text-white flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-400">
                  <span>CANALES PRIORITARIOS DE EJECUCIÓN</span>
                  <span>Plazo: {lastBlueprint.estimatedTimeline}</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                  Recibí este estudio en tu correo o conversemos por WhatsApp
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Podés enviarte el dossier técnico completo a tu Email (con acceso automático al Portal de Clientes), descargarlo como documento de estudio o iniciar contacto directo por WhatsApp.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    onWhatsAppClick(
                      `Hola Gastón, acabo de analizar con tu IA en gastonbarea.com la solución "${lastBlueprint.solutionTitle}" (Consulta: "${lastBlueprint.query}"). Quiero avanzar con este estudio.`
                    )
                  }
                  className="w-full px-5 py-3.5 text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-none transition-colors inline-flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>1. Continuar Consulta por WhatsApp Directo</span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCustomSolution) {
                      onOpenCustomSolution(lastBlueprint);
                    }
                  }}
                  className="w-full px-5 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>2. Recibir Estudio Completo por Email & Abrir #solucion-ia</span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => downloadAiStudyDossier(lastBlueprint)}
                    className="px-4 py-2.5 text-xs font-mono font-semibold text-white bg-white/10 hover:bg-white/20 rounded-none transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Descargar Estudio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onScheduleClick(
                        `Revisión de Estudio IA: ${lastBlueprint.solutionTitle} (${lastBlueprint.query})`
                      )
                    }
                    className="px-4 py-2.5 text-xs font-mono font-semibold text-white bg-white/10 hover:bg-white/20 rounded-none transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-emerald-300" />
                    <span>¡Hablemos! Agendar Meet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

