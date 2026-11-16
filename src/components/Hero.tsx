import React, { useState, useEffect } from 'react';
import {
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
  ChevronDown,
  ChevronUp,
  Settings2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG, SiteConfig } from '../data/siteConfig';
import {
  extractYoutubeId,
  CustomAiSolutionBlueprint,
  buildCustomSolutionBlueprint,
  downloadAiStudyDossier,
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

const EASE_EXECUTIVE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const Hero: React.FC<HeroProps> = ({
  onScheduleClick,
  onWhatsAppClick,
  onClientPortalClick,
  onOpenCustomSolution,
}) => {
  const [liveConfig, setLiveConfig] = useState<SiteConfig>(SITE_CONFIG);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [customYoutubeInput, setCustomYoutubeInput] = useState<string>('');
  const [showVideoSelector, setShowVideoSelector] = useState<boolean>(false);
  const [showViewSettings, setShowViewSettings] = useState<boolean>(false);
  const [overrideYoutubeId, setOverrideYoutubeId] = useState<string>('');
  const [overrideDirectVideoUrl, setOverrideDirectVideoUrl] = useState<string>('');
  const [directVideoError, setDirectVideoError] = useState<string>('');
  const [directVideoLoadFailed, setDirectVideoLoadFailed] = useState<boolean>(false);
  const [videoFitMode, setVideoFitMode] = useState<'cover' | 'contain'>('cover');
  const [isCinemaExpanded, setIsCinemaExpanded] = useState<boolean>(false);

  const [isClientLoggedIn, setIsClientLoggedIn] = useState<boolean>(() => {
    try {
      return Boolean(
        localStorage.getItem('gb_client_token') && localStorage.getItem('gb_client_user')
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const syncAuthSession = () => {
      try {
        setIsClientLoggedIn(
          Boolean(localStorage.getItem('gb_client_token') && localStorage.getItem('gb_client_user'))
        );
      } catch {
        setIsClientLoggedIn(false);
      }
    };
    syncAuthSession();
    window.addEventListener('storage', syncAuthSession);
    window.addEventListener('gb-client-auth-change', syncAuthSession);
    window.addEventListener('focus', syncAuthSession);
    window.addEventListener('hashchange', syncAuthSession);
    return () => {
      window.removeEventListener('storage', syncAuthSession);
      window.removeEventListener('gb-client-auth-change', syncAuthSession);
      window.removeEventListener('focus', syncAuthSession);
      window.removeEventListener('hashchange', syncAuthSession);
    };
  }, []);

  // Interactive Web AI Solution Finder State
  const [aiQuery, setAiQuery] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isAiDrawerExpanded, setIsAiDrawerExpanded] = useState<boolean>(false);
  const [lastBlueprint, setLastBlueprint] = useState<CustomAiSolutionBlueprint>(() =>
    buildCustomSolutionBlueprint(
      'Integrar Inteligencia Artificial, Gemelo Digital interactivo y trazabilidad operativa'
    )
  );
  const [aiResponseText, setAiResponseText] = useState<string>(
    'Toda esta plataforma opera como un Gemelo Digital entrenado con 30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes. Escribí qué desafío querés resolver para diseñar tu estudio técnico a medida.'
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

  const handleApplyCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customYoutubeInput.trim();
    if (!trimmed) return;

    if (isPrivateR2S3Endpoint(trimmed)) {
      setDirectVideoError(
        'La URL *.r2.cloudflarestorage.com es el endpoint privado de la API S3 del bucket (no reproduce en navegadores). En Cloudflare R2 copiá la Public URL r2.dev terminada en /tu-video.mp4.'
      );
      return;
    }

    if (
      (trimmed.includes('r2.dev') || trimmed.includes('cloudflare') || trimmed.startsWith('http')) &&
      !extractYoutubeId(trimmed) &&
      !hasPlayableVideoPath(trimmed)
    ) {
      setDirectVideoError(
        'A la URL le falta el nombre del archivo .mp4 o .webm al final (ej: https://pub-xxxx.r2.dev/presentacion.mp4).'
      );
      return;
    }

    if (hasPlayableVideoPath(trimmed)) {
      setDirectVideoError('');
      setDirectVideoLoadFailed(false);
      setOverrideDirectVideoUrl(trimmed);
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
    setIsAiDrawerExpanded(true);

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
      {/* =====================================================================
          FASE 1 · ESCENARIO AUDIOVISUAL CINEMATOGRÁFICO (AMBIENT GLOW + VIDEO PURO)
          Sin marcos de colores sobre el video, alineación horizontal simétrica.
         ===================================================================== */}
      <div className="relative w-full pt-16 sm:pt-[68px] bg-[#07080D] text-white overflow-hidden">
        {/* Atmospheric Lighting Mesh behind Stage (GPU radial gradients, zero clutter) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-24 w-[560px] h-[560px] rounded-full bg-[#382586]/30 blur-[140px] animate-pulse-glow"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-0 w-[480px] h-[480px] rounded-full bg-emerald-500/15 blur-[130px] animate-pulse-glow"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-arch-grid-dark opacity-45"
        />

        {/* Optional Custom R2 / YouTube Video Loader Bar */}
        <AnimatePresence>
          {showVideoSelector && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: EASE_EXECUTIVE }}
              className="relative z-20 w-full px-4 sm:px-8 lg:px-12 py-3.5 bg-[#0F111A]/95 backdrop-blur-xl border-b border-white/10 space-y-2.5"
            >
              <form
                onSubmit={handleApplyCustomVideo}
                className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
              >
                <div className="text-xs font-mono text-neutral-300">
                  URL pública{' '}
                  <strong className="text-emerald-400">
                    Cloudflare R2 (pub-xxx.r2.dev/archivo.mp4)
                  </strong>{' '}
                  o ID/URL de <strong className="text-white">YouTube</strong>:
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
                    className="px-3.5 py-2 rounded-lg text-xs font-mono bg-black/60 text-white border border-white/15 focus:outline-none focus:border-emerald-400 sm:min-w-[340px]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Cargar Stream
                  </button>
                </div>
              </form>
              {directVideoError && (
                <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-mono leading-relaxed">
                  {directVideoError}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Cinema Split — Same Horizontal Distance on Both Sides, Clean Frameless Video */}
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* LEFT STAGE: VIDEO PLAYER + CLEAN AUDIO/CHAPTER HUD */}
          <div
            className={`${
              isCinemaExpanded ? 'lg:col-span-12' : 'lg:col-span-8'
            } relative bg-black flex flex-col justify-between transition-all duration-200`}
          >
            {/* Video Frame — Strictly Frameless, Zero Colored Borders */}
            <div
              className={`relative w-full aspect-video ${
                videoFitMode === 'cover' && !isCinemaExpanded
                  ? 'lg:aspect-auto lg:flex-1 lg:min-h-[500px]'
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
                      'No se pudo cargar el archivo de video directo desde esa URL. Se activó el respaldo de YouTube automáticamente.'
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

              {/* Discreet Top-Right Stage Settings Toggle inside Video Frame (Hover / Tap) */}
              <div className="hidden sm:flex absolute top-3.5 right-3.5 z-20 items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowViewSettings((prev) => !prev)}
                    className="px-3 py-2 rounded-lg text-xs font-mono font-medium text-white/90 hover:text-white bg-black/55 hover:bg-black/80 backdrop-blur-md border border-white/15 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    title="Configuración de reproducción y pantalla"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vista</span>
                  </button>

                  {showViewSettings && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#0D0F18]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-2 space-y-1 text-left">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFitMode(videoFitMode === 'cover' ? 'contain' : 'cover');
                          setShowViewSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono text-neutral-200 hover:bg-white/10 flex items-center justify-between cursor-pointer"
                      >
                        <span>{videoFitMode === 'cover' ? 'Ajuste: Cover 100%' : 'Ajuste: 16:9 Nativo'}</span>
                        <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsCinemaExpanded(!isCinemaExpanded);
                          setShowViewSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono text-neutral-200 hover:bg-white/10 flex items-center justify-between cursor-pointer"
                      >
                        <span>{isCinemaExpanded ? 'Volver a Vista Split' : 'Expandir Escenario'}</span>
                        {isCinemaExpanded ? (
                          <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowVideoSelector(!showVideoSelector);
                          setShowViewSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono text-neutral-200 hover:bg-white/10 flex items-center justify-between cursor-pointer"
                      >
                        <span>Cambiar URL de Video</span>
                        <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                      </button>

                      <a
                        href={youtubeChannelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono text-neutral-200 hover:bg-white/10 flex items-center justify-between"
                      >
                        <span>Canal @gastonbarea</span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Clean Streamlined Video HUD Below Player */}
            <div className="relative z-10 w-full bg-[#0A0B10]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 border-t border-white/10 flex flex-col gap-3.5 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-emerald-400/90">
                    <span>{activeDirectVideoUrl ? 'Stream Directo R2' : 'Canal YouTube'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-neutral-400">{activeVideo.focusArea}</span>
                  </div>
                  <h2 className="font-display text-sm sm:text-base font-semibold text-white truncate">
                    {activeVideo.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="min-h-[40px] px-4 py-2 rounded-lg text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] transition-colors inline-flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
                  >
                    {isMuted ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Activar Audio</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-end gap-0.5 h-3" aria-hidden="true">
                          <span className="w-0.5 h-full bg-emerald-400 eq-bar-1" />
                          <span className="w-0.5 h-full bg-emerald-400 eq-bar-2" />
                          <span className="w-0.5 h-full bg-emerald-400 eq-bar-3" />
                        </span>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Silenciar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVideoSelector(!showVideoSelector)}
                    className="sm:hidden min-h-[40px] px-3 py-2 rounded-lg text-xs font-mono text-neutral-300 bg-white/[0.06] hover:bg-white/[0.12] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </button>
                </div>
              </div>

              {/* Clean Chapter Switcher */}
              <div className="pt-2.5 border-t border-white/[0.08] flex sm:grid sm:grid-cols-3 gap-2 overflow-x-auto pb-1 sm:pb-0 snap-x">
                {channelPlaylist.map((vid, idx) => {
                  const active = selectedVideoIndex === idx;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setSelectedVideoIndex(idx)}
                      className={`snap-start shrink-0 min-w-[200px] sm:min-w-0 px-3.5 py-2.5 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                        active
                          ? 'bg-[#291B64]/90 text-white border-[#6344F5]/50 shadow-sm'
                          : 'bg-white/[0.03] text-neutral-400 border-white/[0.05] hover:text-white hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="truncate">
                        <span className="text-[11px] font-mono text-emerald-400 mr-1.5 font-bold tabular-nums">
                          {vid.code}.
                        </span>
                        <span className="text-xs font-medium">{vid.label}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-75 shrink-0 tabular-nums">
                        {vid.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT EXECUTIVE COLUMN: CLEAN, BREATHABLE & HIGH-CONTRAST */}
          {!isCinemaExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_EXECUTIVE }}
              className="lg:col-span-4 p-5 sm:p-8 lg:p-9 flex flex-col justify-between gap-6 text-left bg-[#0B0C14]/90 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10"
            >
              {/* Top: Brand Lockup (Human Innovation right-aligned) + Kinetic Headline */}
              <div className="space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="inline-flex flex-col items-end leading-none">
                    <span className="font-display text-sm font-bold tracking-wider text-white">
                      GASTONBAREA.COM
                    </span>
                    <span className="self-end text-right text-[9.5px] font-mono font-semibold uppercase tracking-[0.16em] text-emerald-400 mt-1">
                      Human Innovation
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 tabular-nums">
                    <span>30 Años Tech</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-semibold">14 Años PMO</span>
                  </div>
                </div>

                <h1
                  className="font-display text-2xl sm:text-[1.75rem] xl:text-[2rem] font-bold tracking-[-0.025em] text-white leading-[1.12]"
                  style={{ textWrap: 'balance' }}
                >
                  Arquitecturas de{' '}
                  <span className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                    base tecnológica, IA Services
                  </span>{' '}
                  y bioeconomía en producción.
                </h1>

                <p className="text-xs sm:text-[13.5px] text-neutral-300 leading-relaxed">
                  De la visión ejecutiva al despliegue verificable bajo metodología{' '}
                  <strong className="text-white font-semibold">40% · 40% · 20%</strong>. Operamos con la red autónoma{' '}
                  <strong className="text-emerald-400 font-semibold">ARN</strong> con motor dual Gemini + Groq.
                </p>
              </div>

              {/* Center: Single Focused Portal-Gated ARN Action Card */}
              <div className="rounded-xl p-4 sm:p-5 studio-card-dark space-y-3.5">
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-emerald-400 font-semibold">
                    {isClientLoggedIn ? 'Sesión Verificada' : 'Acceso por Registro'}
                  </span>
                  <span className="text-neutral-400">
                    {isClientLoggedIn ? 'Portal Activo' : 'Escala 40 · 40 · 20'}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {isClientLoggedIn
                    ? 'Tu cuenta está activa. Abrí tu Portal de Clientes (#portal) para seleccionar servicios del Stock ARN y gestionar tu presupuesto 40/40/20.'
                    : 'Registrate con tu correo electrónico en el Portal de Clientes para iniciar tu diagnóstico ARN y calcular tu presupuesto en escala Micro, PyME o Grande.'}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (onClientPortalClick) onClientPortalClick();
                  }}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-mono font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-sm"
                >
                  <span>
                    {isClientLoggedIn
                      ? 'Abrir Mi Portal de Clientes'
                      : 'Registrarme en Portal Clientes'}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>

              {/* Bottom: Direct Contact Pair + Clean Email */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      onScheduleClick('Sesión Ejecutiva Google Meet Pro desde Portada')
                    }
                    className="w-full min-h-[42px] px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>Agendar Meet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onWhatsAppClick(
                        'Hola Gastón, estuve viendo tu presentación en gastonbarea.com y quiero consultarte por un proyecto.'
                      )
                    }
                    className="w-full min-h-[42px] px-3 py-2 rounded-lg text-xs font-semibold text-white bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400 pt-1">
                  <span>notificaciones@gastonbarea.com</span>
                  {onClientPortalClick && (
                    <button
                      type="button"
                      onClick={onClientPortalClick}
                      className="text-emerald-400 hover:text-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Portal (#portal)</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Preserved Hidden Marker: Home Intake Remains Exclusively Inside #portal */}
      <div id="arn-home-client-intake" className="hidden" aria-hidden="true" />

      {/* =====================================================================
          FASE 2A · BUSCADOR IA EJECUTIVO ESTILO SPOTLIGHT (COLAPSABLE Y LIMPIO)
         ===================================================================== */}
      <div className="relative w-full px-4 sm:px-8 lg:px-12 py-12 md:py-16 bg-[#F7F8FC] border-b border-slate-200/80 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-arch-grid-light opacity-70"
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto space-y-6 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="text-xs font-mono font-semibold text-[#291B64]">
                01. Estudio técnico interactivo con IA en vivo
              </div>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]"
                style={{ textWrap: 'balance' }}
              >
                ¿Qué desafío tecnológico querés estructurar hoy?
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsAiDrawerExpanded((prev) => !prev)}
              className="self-start lg:self-auto px-3.5 py-2 rounded-lg bg-white border border-slate-200/90 text-xs font-mono font-semibold text-[#291B64] hover:border-[#291B64]/40 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isAiDrawerExpanded ? 'Ocultar vista previa' : 'Ver último estudio preliminar'}</span>
              {isAiDrawerExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Spotlight Command Bar */}
          <div className="space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskWebAi(undefined, true);
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2 rounded-2xl bg-white border border-slate-200/90 shadow-[0_12px_36px_-18px_rgba(41,27,100,0.28)] focus-within:border-[#291B64]/50 transition-colors"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-2">
                <Compass className="w-5 h-5 text-[#291B64] shrink-0" />
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Describí tu necesidad (ej: 'Automatizar planta industrial con IoT', 'Trazabilidad bioeconómica', 'Odoo B2B2C')..."
                  className="w-full text-sm bg-transparent text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isAiThinking || !aiQuery.trim()}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {isAiThinking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Diseñando Estudio...</span>
                  </>
                ) : (
                  <>
                    <span>Generar Estudio Técnico</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Intent Chips (Interactive Filter Buttons) */}
            <div className="flex flex-wrap items-center gap-2">
              {quickIntents.map((intent) => {
                const isSelected = matchedSolution.serviceCode === intent.code && isAiDrawerExpanded;
                return (
                  <button
                    key={intent.code}
                    type="button"
                    onClick={() => handleAskWebAi(intent.query, true)}
                    disabled={isAiThinking}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                      isSelected
                        ? 'bg-[#291B64] text-white border-[#291B64] shadow-sm'
                        : 'bg-white text-[#1D1D1F] border-slate-200/80 hover:border-[#291B64]/40 hover:bg-[#291B64]/[0.04]'
                    }`}
                  >
                    <span className="font-mono opacity-75 mr-1.5 tabular-nums">{intent.code}.</span>
                    <span>{intent.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Preliminary Study Drawer (Opens smoothly on demand, zero dead initial scroll) */}
          <AnimatePresence>
            {isAiDrawerExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE_EXECUTIVE }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2"
              >
                <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl studio-card-light flex flex-col justify-between space-y-5">
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
                      <span className="text-[#291B64] font-semibold">
                        Estudio Preliminar · {lastBlueprint.query}
                      </span>
                      <span className="tabular-nums">30 Años Tech · 14 Años PMO</span>
                    </div>

                    <h3 className="font-display text-lg sm:text-xl font-bold text-[#1D1D1F]">
                      {lastBlueprint.solutionTitle}
                    </h3>

                    <p className="text-sm text-[#515154] leading-relaxed whitespace-pre-line">
                      {aiResponseText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {lastBlueprint.tailoredServices.map((srv) => (
                        <div
                          key={srv.code}
                          className="p-3.5 rounded-xl bg-[#F7F8FC] border border-slate-200/80 space-y-1"
                        >
                          <div className="text-[11px] font-mono font-bold text-[#291B64] tabular-nums">
                            Módulo {srv.code} · {srv.impactMetric}
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
                      <span>Descargar Dossier (.HTML / PDF)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenCustomSolution) onOpenCustomSolution(lastBlueprint);
                      }}
                      className="font-semibold text-[#291B64] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Abrir Estudio Completo (#solucion-ia)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-[#140D33] text-white border border-white/10 flex flex-col justify-between space-y-5 shadow-xl">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-400">
                      <span>Ejecución Directa</span>
                      <span className="tabular-nums">Plazo: {lastBlueprint.estimatedTimeline}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white leading-snug">
                      Recibí este estudio en tu correo o conversemos ahora
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      Podés enviarte el dossier técnico a tu Email con acceso al Portal de Clientes o continuar directo por WhatsApp.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        onWhatsAppClick(
                          `Hola Gastón, acabo de analizar con tu IA en gastonbarea.com la solución "${lastBlueprint.solutionTitle}" (Consulta: "${lastBlueprint.query}"). Quiero avanzar con este estudio.`
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span>Continuar por WhatsApp</span>
                      </span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenCustomSolution) onOpenCustomSolution(lastBlueprint);
                      }}
                      className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] transition-colors inline-flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
                        <span>Recibir por Email & Abrir #solucion-ia</span>
                      </span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => downloadAiStudyDossier(lastBlueprint)}
                        className="px-3 py-2.5 rounded-lg text-xs font-mono font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Descargar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onScheduleClick(
                            `Revisión de Estudio IA: ${lastBlueprint.solutionTitle} (${lastBlueprint.query})`
                          )
                        }
                        className="px-3 py-2.5 rounded-lg text-xs font-mono font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Agendar Meet</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
