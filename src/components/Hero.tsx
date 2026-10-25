import React, { useState, useEffect, useRef } from 'react';
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
}) => {
  const [liveConfig, setLiveConfig] = useState<SiteConfig>(SITE_CONFIG);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [customYoutubeInput, setCustomYoutubeInput] = useState<string>('');
  const [showVideoSelector, setShowVideoSelector] = useState<boolean>(false);
  const [overrideYoutubeId, setOverrideYoutubeId] = useState<string>('');

  // aengel.io Inspired Full-Bleed Interactive Video Stage State
  const [isImmersionActive, setIsImmersionActive] = useState<boolean>(false);
  const [isCinemaExpanded, setIsCinemaExpanded] = useState<boolean>(false);
  const [pointerCoords, setPointerCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const stageRef = useRef<HTMLDivElement>(null);

  // Interactive Web AI Solution Finder State (The Whole Web as a Digital Twin)
  const [aiQuery, setAiQuery] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [aiResponseText, setAiResponseText] = useState<string>(
    'Toda esta plataforma opera como una arquitectura viva entrenada con mis 30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes. Escribí qué desafío querés resolver o elegí un área para que la IA te guíe a la solución exacta dentro de la web.'
  );
  const [matchedSolution, setMatchedSolution] = useState<MatchedSolution>({
    serviceCode: '02',
    serviceTitle: '02. IA Services, Gemelos Digitales & Business Intelligence',
    sectionId: '#servicios',
    timeline: '3 a 6 semanas',
    summary:
      'Integración de arquitecturas web inteligentes, Gemelos Digitales corporativos, agentes entrenados con datos propios (RAG) y tableros predictivos.',
    ctaLabel: 'Explorar IA Services en la Web',
  });

  // Sync with backend CRM configuration if customized
  useEffect(() => {
    fetch('/api/site-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.presentationVideo) {
          setLiveConfig(data);
        }
      })
      .catch(() => {
        // Retain default SITE_CONFIG
      });
  }, []);

  const videoConfig = liveConfig.presentationVideo || SITE_CONFIG.presentationVideo;
  const resolvedConfigId =
    videoConfig.youtubeId && videoConfig.youtubeId !== 'L_LUpnjgPso'
      ? videoConfig.youtubeId
      : 'XVYUP8Pz-hE';
  const primaryYoutubeId = overrideYoutubeId || resolvedConfigId;
  const youtubeChannelUrl = liveConfig.social?.youtube || 'https://www.youtube.com/@gastonbarea';

  const channelPlaylist: ChannelVideoItem[] = [
    {
      id: 'ep-01',
      youtubeId: primaryYoutubeId,
      code: 'REEL 01',
      label: 'Presentación Canal',
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
      code: 'REEL 02',
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
      code: 'REEL 03',
      label: 'Bioeconomía & Odoo ERP',
      title: 'Trazabilidad en Bioeconomía, Odoo ERP v18 y Dirección Ejecutiva PMO',
      subtitle:
        'Unificación de campo, planta industrial y canales B2B2C con metodología auditada por hitos 40 · 40 · 20%.',
      duration: '05:10',
      focusArea: 'Bioeconomía · Odoo v18 · B2B2C',
    },
  ];

  const activeVideo = channelPlaylist[selectedVideoIndex] || channelPlaylist[0];

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const relY = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setPointerCoords({ x: relX, y: relY });
  };

  const handleEnterExperience = () => {
    setIsImmersionActive(true);
    setIsMuted(false);
  };

  const extractYoutubeId = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = trimmed.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    if (trimmed.length === 11) return trimmed;
    return trimmed;
  };

  const handleApplyCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const extracted = extractYoutubeId(customYoutubeInput);
    if (extracted) {
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
      label: 'Proyecto de Base Tecnológica',
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

  const handleAskWebAi = async (customPrompt?: string) => {
    const promptToSend = (customPrompt ?? aiQuery).trim();
    if (!promptToSend || isAiThinking) return;

    if (!customPrompt) setAiQuery('');
    setIsAiThinking(true);

    try {
      const response = await fetch('/api/digital-twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptToSend,
          history: [],
        }),
      });
      const data = await response.json();
      if (data.reply) {
        setAiResponseText(data.reply);
      }
      if (data.matchedSolution) {
        setMatchedSolution(data.matchedSolution);
      }
    } catch {
      setAiResponseText(
        'Desde mis 30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes, estructuramos esta solución en 3 hitos verificables (40% arquitectura, 40% validación en Staging y 20% producción). Podés saltar directamente al módulo recomendado abajo.'
      );
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <section id="inicio" className="relative w-full bg-white border-b border-black/[0.14]">
      {/* STEP 1: 100% FULL-BLEED VIDEO STAGE WITH INTEGRATED TOP MENU (aengel.io + thefwa.com) */}
      <div
        ref={stageRef}
        onMouseMove={handleStageMouseMove}
        className="w-full pt-16 bg-[#060608] text-white border-b border-black/[0.2] overflow-hidden"
      >
        {/* Top Sub-Header Telemetry & Episode Strip (Directly under the fixed 64px Header) */}
        <div className="w-full px-4 sm:px-8 lg:px-12 py-3 bg-[#0C0C10] border-b border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono">
            <span className="font-bold text-white tracking-wider">
              CANAL YOUTUBE · GASTÓN BAREA
            </span>
            <span aria-hidden="true" className="text-white/30">
              /
            </span>
            <span className="text-emerald-400 tabular-nums">
              {activeVideo.code} · {activeVideo.duration}
            </span>
            <span aria-hidden="true" className="text-white/30 hidden md:inline">
              /
            </span>
            <span className="text-neutral-400 tabular-nums hidden md:inline">
              RETÍCULA X:{pointerCoords.x}% Y:{pointerCoords.y}%
            </span>
          </div>

          {/* Right Controls: Chapter Tabs + Expand Stage + Channel Link */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden xl:flex items-center border border-white/15 bg-black">
              {channelPlaylist.map((vid, idx) => (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => setSelectedVideoIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap border-r last:border-r-0 border-white/15 ${
                    selectedVideoIndex === idx
                      ? 'bg-[#291B64] text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {vid.code} · {vid.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCinemaExpanded(!isCinemaExpanded)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-none border border-white/15 transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Alternar modo pantalla completa de escenario"
            >
              {isCinemaExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Vista Split</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ancho Completo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowVideoSelector(!showVideoSelector)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-none border border-white/15 transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Cambiar Video</span>
            </button>

            <a
              href={youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-none border border-white/15 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>@gastonbarea</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Optional YouTube URL/ID Loader Bar */}
        {showVideoSelector && (
          <form
            onSubmit={handleApplyCustomVideo}
            className="w-full px-4 sm:px-8 lg:px-12 py-3 bg-[#14141A] border-b border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
          >
            <div className="text-xs font-mono text-neutral-300">
              Pegá la URL o ID de cualquier video de tu canal de YouTube para transmitirlo a ancho completo:
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={customYoutubeInput}
                onChange={(e) => setCustomYoutubeInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... o ID"
                className="px-3 py-2 text-xs font-mono bg-black text-white rounded-none border border-white/20 focus:outline-none focus:border-white sm:min-w-[260px]"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors cursor-pointer whitespace-nowrap"
              >
                Cargar en Escenario
              </button>
            </div>
          </form>
        )}

        {/* Main Full-Bleed Interactive Stage: Responsive Mobile / Tablet / Desktop */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* LEFT / FULL STAGE: YOUTUBE SHOWREEL WITH AENGEL.IO WIREFRAME GRID OVERLAY */}
          <div
            className={`${
              isCinemaExpanded
                ? 'lg:col-span-12 min-h-[460px] sm:min-h-[600px] lg:min-h-[76vh]'
                : 'lg:col-span-8 min-h-[420px] sm:min-h-[540px] lg:min-h-[72vh]'
            } relative bg-black overflow-hidden flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/15 transition-all duration-150`}
          >
            {/* Live YouTube Embed Stream */}
            <iframe
              key={`${activeVideo.youtubeId}-${isMuted ? 'muted' : 'sound'}-${selectedVideoIndex}`}
              src={
                isMuted
                  ? `https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&mute=1&controls=1&loop=1&playlist=${activeVideo.youtubeId}&rel=0&modestbranding=1&playsinline=1`
                  : `https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1`
              }
              title={activeVideo.title}
              className="absolute inset-0 w-full h-full object-cover"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* aengel.io Inspired Interactive Spatial Wireframe Grid Overlay */}
            <div
              className={`relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-10 transition-opacity duration-200 ${
                isImmersionActive && !isMuted
                  ? 'bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none'
                  : 'bg-gradient-to-t from-black/90 via-black/45 to-black/40'
              }`}
            >
              {/* Top Wireframe Crosshairs & Area Metadata */}
              <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-3.5">
                <div className="space-y-1 text-left">
                  <div className="text-[11px] font-mono text-emerald-400 tracking-wider">
                    {activeVideo.focusArea}
                  </div>
                  <div className="text-xs font-mono text-white/85 line-clamp-1">
                    {activeVideo.title}
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-white/60 tabular-nums hidden sm:block shrink-0">
                  <div>FULL-WIDTH STREAM</div>
                  <div>CHUBUT · PATAGONIA</div>
                </div>
              </div>

              {/* Center Interactive Entrance Trigger (aengel.io "ENTER THE EXPERIENCE" style) */}
              {(!isImmersionActive || isMuted) && (
                <div className="my-auto py-6 sm:py-10 flex flex-col items-start sm:items-center text-left sm:text-center max-w-2xl mx-auto space-y-4 sm:space-y-5 pointer-events-auto">
                  <div className="text-[11px] sm:text-xs font-mono tracking-widest text-emerald-400">
                    EXPERIENCIA AUDIOVISUAL INTERACTIVA · GEMELO DIGITAL
                  </div>
                  <h2
                    className="font-display text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    {activeVideo.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                    {activeVideo.subtitle}
                  </p>
                  <div className="flex flex-wrap items-center justify-start sm:justify-center gap-3 pt-1 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleEnterExperience}
                      className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-mono font-bold tracking-wider text-white bg-[#291B64] hover:bg-[#382586] border border-white/25 rounded-none transition-colors inline-flex items-center justify-center gap-3 cursor-pointer shadow-lg"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>ENTRAR A LA EXPERIENCIA CON SONIDO</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCinemaExpanded(!isCinemaExpanded)}
                      className="w-full sm:w-auto px-4 py-3.5 text-xs font-mono font-semibold text-white bg-black/75 hover:bg-black border border-white/20 rounded-none transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{isCinemaExpanded ? 'Vista Split' : 'Expandir Video 100%'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Interactive Timeline Scrubber & Sound Toggle */}
              <div className="pt-4 border-t border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-3 pointer-events-auto">
                {/* 3 Interactive Reel Chapters (Responsive Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-2xl">
                  {channelPlaylist.map((vid, idx) => {
                    const active = selectedVideoIndex === idx;
                    return (
                      <button
                        key={vid.id}
                        type="button"
                        onClick={() => setSelectedVideoIndex(idx)}
                        className={`p-2.5 text-left border transition-colors cursor-pointer rounded-none ${
                          active
                            ? 'bg-[#291B64] border-white/35 text-white'
                            : 'bg-black/75 border-white/15 text-neutral-400 hover:text-white hover:bg-black/90'
                        }`}
                      >
                        <div className="text-[10px] font-mono font-bold text-emerald-400">
                          {vid.code} · {vid.duration}
                        </div>
                        <div className="text-xs font-semibold truncate">{vid.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Audio / Mute Control */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImmersionActive(true);
                      setIsMuted(!isMuted);
                    }}
                    className="w-full md:w-auto px-4 py-2.5 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] border border-white/20 rounded-none transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    {isMuted ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Activar Audio</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Silenciar Audio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT ARCHITECTURAL COMMAND COLUMN (4 Cols on Desktop when not expanded) */}
          {!isCinemaExpanded && (
            <div className="lg:col-span-4 p-5 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 text-left bg-[#0B0B0F]">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400 border-b border-white/15 pb-3">
                  <span>GASTÓN BAREA</span>
                  <span aria-hidden="true">·</span>
                  <span>30 AÑOS TECH</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">14 AÑOS PMO</span>
                </div>

                <h1
                  className="font-display font-bold tracking-tight text-white leading-[1.08]"
                  style={{
                    fontSize: 'clamp(1.6rem, 2.2vw, 2.4rem)',
                    textWrap: 'balance',
                  }}
                >
                  Consultor y desarrollador de proyectos de base tecnológica, IA Services y bioeconomía.
                </h1>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Toda esta web funciona como mi{' '}
                  <strong className="text-white font-semibold">Gemelo Digital</strong>. Interactuá con el video de presentación a ancho completo o utilizá el motor de Inteligencia Artificial inferior para encontrar la solución exacta y estructurar tu proyecto.
                </p>
              </div>

              {/* Executive Action Matrix */}
              <div className="pt-4 border-t border-white/15 space-y-3">
                <button
                  type="button"
                  onClick={() => onScheduleClick('Sesión Ejecutiva Google Meet Pro desde Portada')}
                  className="w-full px-5 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] border border-white/20 rounded-none transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-300" />
                    <span>Agendar Google Meet Pro (30m)</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onDiagnosticoClick}
                  className="w-full px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-white/5 hover:bg-[#291B64] border border-white/15 rounded-none transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Abrir Estructurador de Proyectos IA</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
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

      {/* STEP 2: FULL-WIDTH AI SOLUTION FINDER (THE ENTIRE WEB AS DIGITAL TWIN) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16 space-y-10 bg-white">
        <div className="rounded-none bg-white border border-black/[0.14] p-5 sm:p-8 lg:p-10 space-y-7 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-mono text-[#291B64] font-semibold">
                Navegación Asistida por IA · Encontrá tu Solución en la Web
              </div>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]"
                style={{ textWrap: 'balance' }}
              >
                ¿Qué proyecto o desafío querés resolver hoy?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#515154] max-w-md leading-relaxed">
              Consultá en lenguaje natural o seleccioná un eje. La IA integrada evaluará tu caso con el criterio de Gastón Barea y te llevará directamente a la solución correspondiente dentro de la web.
            </p>
          </div>

          {/* Interactive Intent Selector Bar + Natural Language Input */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {quickIntents.map((intent) => {
                const isSelected = matchedSolution.serviceCode === intent.code;
                return (
                  <button
                    key={intent.code}
                    type="button"
                    onClick={() => handleAskWebAi(intent.query)}
                    disabled={isAiThinking}
                    className={`px-3 sm:px-3.5 py-2 text-xs font-semibold rounded-none border transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#291B64] text-white border-[#291B64]'
                        : 'bg-[#F5F5F7] text-[#1D1D1F] border-black/[0.1] hover:bg-[#291B64]/10 hover:border-[#291B64]/30'
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
                handleAskWebAi();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2 rounded-none bg-[#F5F5F7] border border-black/[0.1]"
            >
              <div className="flex-1 flex items-center gap-3 px-3 py-2">
                <Compass className="w-5 h-5 text-[#291B64] shrink-0" />
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Escribí tu necesidad (ej: 'Integrar IA en nuestra empresa', 'Trazabilidad en bioeconomía', 'Implementar Odoo B2B2C')..."
                  className="w-full text-sm bg-transparent text-[#1D1D1F] placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isAiThinking || !aiQuery.trim()}
                className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {isAiThinking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Buscando solución...</span>
                  </>
                ) : (
                  <>
                    <span>Encontrar Solución con IA</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live AI Diagnosis + Matched Web Solution Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
            {/* Left (7 cols): Gastón's AI Synthesis */}
            <div className="lg:col-span-7 p-5 sm:p-6 rounded-none bg-[#F5F5F7] border border-black/[0.1] flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-600">
                  <span>Respuesta del Ecosistema IA · Gastón Barea</span>
                  <span>Criterio 30 Años Tech · 14 Años PMO</span>
                </div>
                <p className="text-sm sm:text-[15px] text-[#1D1D1F] leading-relaxed whitespace-pre-line">
                  {aiResponseText}
                </p>
              </div>

              <div className="pt-3 border-t border-black/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <span>Metodología de ejecución: 40% Arquitectura · 40% Staging · 20% Producción</span>
                <button
                  type="button"
                  onClick={() =>
                    onScheduleClick(
                      `[DIAGNÓSTICO IA EN PORTADA]\nSolución: ${matchedSolution.serviceTitle}\nSíntesis: ${aiResponseText}`
                    )
                  }
                  className="font-semibold text-[#291B64] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Validar en Google Meet Pro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right (5 cols): Highlighted Solution Found Inside the Web */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-none bg-[#0A0A0C] text-white flex flex-col justify-between space-y-5 border border-white/10">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-400">
                  <span>Solución Recomendada en la Web</span>
                  <span>Plazo: {matchedSolution.timeline}</span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
                  {matchedSolution.serviceTitle}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {matchedSolution.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5">
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
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>{matchedSolution.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onDiagnosticoClick}
                  className="px-3.5 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-none transition-colors cursor-pointer whitespace-nowrap"
                >
                  Estructurar Hoja de Ruta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
