import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Edit3,
  Check,
  RotateCcw,
  Clock,
  Layers,
  ShieldCheck,
  Video,
  X,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  ArrowRight,
  Sliders,
  ExternalLink,
  TrendingUp,
  FolderGit2,
  BookOpen,
  Cpu,
  ChevronDown,
  Brain,
  Server,
  MessageSquare,
  Calendar,
  Linkedin,
  Github,
  Menu,
  ShoppingCart
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

interface PresentationVideoProps {
  onScheduleClick?: () => void;
  onDiagnosticoClick?: () => void;
  onWhatsAppClick?: (customText?: string) => void;
}

interface Frame2Config {
  type: 'image' | 'video';
  mediaUrl: string;
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonAction: 'schedule' | 'diagnostico';
}

export const PresentationVideo: React.FC<PresentationVideoProps> = ({
  onScheduleClick,
  onDiagnosticoClick,
  onWhatsAppClick,
}) => {
  // Navigation & Dropdown States inside the Frame
  const [technicalDropdownOpen, setTechnicalDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active Frame: 0 = Video de Fondo, 1 = Segundo Frame (Foto o Video con Texto)
  const [activeFrame, setActiveFrame] = useState<number>(0);

  // Frame 1: Video de Fondo State
  const defaultVideoId = SITE_CONFIG.presentationVideo?.youtubeId || 'L_LUpnjgPso';
  const [currentVideoId, setCurrentVideoId] = useState<string>(() => {
    return localStorage.getItem('gb_presentation_video_id') || defaultVideoId;
  });
  const [isForegroundVideoPlaying, setIsForegroundVideoPlaying] = useState<boolean>(false);

  // Frame 2: Carrusel Banner State (Foto o Video con Texto)
  const defaultFrame2: Frame2Config = {
    type: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    badge: 'FRAME 02 · ECOSISTEMA & ARQUITECTURA',
    title: 'Topología Desacoplada: Edge Computing + Supabase + Agentes de IA',
    description:
      'Diseñamos infraestructuras resilientes donde el frontend carga en menos de 50ms a nivel global, y los procesos pesados de IA se orquestan en workers dedicados sin afectar la experiencia del cliente.',
    buttonText: 'Evaluar mi Arquitectura (30 min)',
    buttonAction: 'schedule',
  };

  const [frame2Config, setFrame2Config] = useState<Frame2Config>(() => {
    try {
      const saved = localStorage.getItem('gb_frame2_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return defaultFrame2;
  });

  // Editor Modal / Drawer State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempVideoId, setTempVideoId] = useState<string>(currentVideoId);
  const [tempFrame2, setTempFrame2] = useState<Frame2Config>(frame2Config);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTechnicalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setTechnicalDropdownOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const extractYouTubeId = (input: string): string => {
    const trimmed = (input || '').trim();
    if (!trimmed) return defaultVideoId;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
    const match = trimmed.match(regExp);
    if (match && match[1]) return match[1];
    if (trimmed.length === 11 && !trimmed.includes('/')) return trimmed;
    return trimmed;
  };

  const handleSaveConfig = () => {
    const parsedId = extractYouTubeId(tempVideoId);
    setCurrentVideoId(parsedId);
    setFrame2Config(tempFrame2);
    localStorage.setItem('gb_presentation_video_id', parsedId);
    localStorage.setItem('gb_frame2_config', JSON.stringify(tempFrame2));
    setIsEditing(false);
  };

  const handleResetDefaults = () => {
    setCurrentVideoId(defaultVideoId);
    setFrame2Config(defaultFrame2);
    setTempVideoId(defaultVideoId);
    setTempFrame2(defaultFrame2);
    localStorage.removeItem('gb_presentation_video_id');
    localStorage.removeItem('gb_frame2_config');
    setIsEditing(false);
  };

  const serviceDropdownItems = [
    {
      label: 'Capa de E-Commerce B2B2C & Omnicanal',
      desc: 'Portales mayoristas B2B, checkout 1-click B2C y sincronización ERP',
      href: '#ecommerce-b2b2c',
      icon: ShoppingCart,
      isFeatured: true,
    },
    {
      label: 'Odoo Community ERP (Implementación & Migración)',
      desc: 'Gestión empresarial completa sin costos de licencias por usuario',
      href: '#odoo',
      icon: Layers,
      isFeatured: true,
    },
    {
      label: 'Capacidades de Software & Resiliencia',
      desc: 'Sistemas que resisten el crecimiento del negocio sin caídas',
      href: '#servicios',
      icon: ShieldCheck,
    },
    {
      label: 'Modern Tech Stack',
      desc: 'Vercel Edge, Supabase & React 19',
      href: '#tech-specs',
      icon: Cpu,
    },
    {
      label: 'Diagnóstico Interactivo con IA',
      desc: 'Simulador de soluciones personalizadas',
      href: '#diagnostico-ia',
      icon: Brain,
    },
    {
      label: 'Topología de Servidores Linux & Docker',
      desc: 'Infraestructura dedicada, VPN & Redes seguras',
      href: '#topologia',
      icon: Server,
    },
    {
      label: 'Configurador de Arquitectura & Tiempos',
      desc: 'Estimador de stack y presupuesto óptimo',
      href: '#configurador',
      icon: Sliders,
    },
  ];

  return (
    <section className="relative w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 my-2 sm:my-4">
      
      {/* Ambient background glow */}
      <div
        className="absolute -inset-2 bg-gradient-to-r from-blue-600/25 via-indigo-600/25 to-sky-500/25 rounded-3xl md:rounded-[2.5rem] blur-2xl -z-10 opacity-70"
        aria-hidden="true"
      />

      {/* MASTER EXECUTIVE FRAME: FULL SCREEN (100dvh) + RESPONSIVE MÓVIL Y TABLETAS */}
      <div className="relative w-full min-h-[88dvh] sm:min-h-[92dvh] md:min-h-[94dvh] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] bg-slate-950 border border-blue-800/40 shadow-2xl overflow-hidden text-white flex flex-col justify-between">
        
        {/* 1. CABECERA: MENÚ ESTRICTAMENTE CENTRADO + MARCA GASTÓN BAREA */}
        <div className="relative z-30 w-full px-4 sm:px-6 md:px-8 py-3.5 bg-slate-950/85 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between">
          
          {/* LADO IZQUIERDO: Marca / Nombre de Gastón Barea */}
          <div className="flex items-center z-10 shrink-0">
            <a
              href="#"
              className="flex items-center gap-2.5 sm:gap-3 text-sm font-semibold tracking-tight text-white whitespace-nowrap group"
            >
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center font-mono font-bold text-xs sm:text-sm text-white shadow-md shadow-blue-500/30 group-hover:scale-105 transition-all">
                GB
              </span>
              <div className="flex flex-col text-left">
                <span className="text-white font-bold group-hover:text-sky-300 transition-colors leading-tight text-xs sm:text-sm md:text-base">
                  Gastón Barea
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-sky-400 font-medium tracking-wide">
                  Business & Tech Architecture
                </span>
              </div>
            </a>
          </div>

          {/* CENTRO ABSOLUTO HORIZONTAL: Menú de Navegación Estrictamente Centrado */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 absolute left-1/2 -translate-x-1/2 z-20 text-[13px] font-medium text-slate-200">
            
            {/* BOTÓN INNOVACIÓN DESTACADO (3 Pilares) */}
            <a
              href="#innovacion"
              onClick={(e) => handleNavClick(e, '#innovacion')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-sky-300 bg-sky-500/20 hover:bg-sky-500 hover:text-white border border-sky-400/30 shadow-2xs transition-all active:scale-95"
            >
              <TrendingUp className="w-3.5 h-3.5 text-sky-400 group-hover:text-white" />
              <span>INNOVACIÓN</span>
            </a>

            {/* PROJECT MANAGER */}
            <a
              href="#project-manager"
              onClick={(e) => handleNavClick(e, '#project-manager')}
              className="px-3 py-1.5 rounded-full hover:text-sky-400 hover:bg-white/10 font-semibold tracking-wide transition-all inline-flex items-center gap-1.5"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
              <span>PROJECT MANAGER</span>
            </a>

            {/* SERVICIOS (Dropdown) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setTechnicalDropdownOpen(!technicalDropdownOpen)}
                className={`px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5 font-semibold hover:text-sky-400 hover:bg-white/10 cursor-pointer ${
                  technicalDropdownOpen ? 'bg-white/15 text-sky-300' : ''
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>SERVICIOS</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-sky-400 transition-transform duration-200 ${
                    technicalDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Submenu Dropdown */}
              {technicalDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-88 bg-slate-900/98 backdrop-blur-2xl rounded-2xl border border-blue-500/30 shadow-2xl shadow-black/80 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                      Servicios & Arquitectura Técnica
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> NDA & Seguridad
                    </span>
                  </div>
                  <div className="space-y-1">
                    {serviceDropdownItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group ${
                            (item as any).isFeatured ? 'bg-indigo-950/60 border border-indigo-500/30' : ''
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            (item as any).isFeatured
                              ? 'bg-indigo-500 text-white'
                              : 'bg-blue-500/20 text-sky-400 group-hover:bg-blue-600 group-hover:text-white'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                              <span>{item.label}</span>
                              {(item as any).isFeatured && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-indigo-500/40 text-indigo-200 rounded-md">
                                  Destacado
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">
                              {item.desc}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN ODOO COMMUNITY ERP DIRECTA */}
            <a
              href="#odoo"
              onClick={(e) => handleNavClick(e, '#odoo')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-600/30 border border-indigo-400/30 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>ODOO ERP</span>
            </a>

            {/* BLOG */}
            <a
              href="#blog"
              onClick={(e) => handleNavClick(e, '#blog')}
              className="px-3 py-1.5 rounded-full hover:text-sky-400 hover:bg-white/10 font-semibold tracking-wide transition-all inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>BLOG</span>
            </a>

            {/* CONTACTO */}
            <a
              href="#contacto"
              onClick={(e) => handleNavClick(e, '#contacto')}
              className="px-3 py-1.5 rounded-full hover:text-sky-400 hover:bg-white/10 transition-all text-slate-300"
            >
              Contacto
            </a>

          </nav>

          {/* LADO DERECHO: Botones de Acción (LinkedIn destacado, WhatsApp verde oficial y Agendar) */}
          <div className="flex items-center gap-2 sm:gap-2.5 z-10 shrink-0">
            {/* BOTÓN LINKEDIN DESTACADO */}
            <a
              href={SITE_CONFIG.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] active:scale-95 rounded-full transition-all flex items-center gap-1.5 shadow-sm shadow-[#0A66C2]/30 cursor-pointer"
              title="LinkedIn Profesional de Gastón Barea"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>

            {/* GitHub */}
            <a
              href={SITE_CONFIG.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex p-1.5 text-slate-400 hover:text-sky-300 hover:bg-white/10 rounded-full transition-colors"
              title="GitHub de Gastón Barea"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* BOTÓN WHATSAPP VERDE OFICIAL (#25D366) */}
            <button
              onClick={() => (onWhatsAppClick ? onWhatsAppClick() : null)}
              type="button"
              className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 rounded-full transition-all whitespace-nowrap shadow-md shadow-[#25D366]/35 flex items-center gap-1.5 cursor-pointer"
              title="Contactar directamente por WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* BOTÓN AGENDAR (Visible en tabletas y desktop) */}
            {onScheduleClick && (
              <button
                onClick={onScheduleClick}
                type="button"
                className="hidden sm:flex px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-full transition-all whitespace-nowrap shadow-md shadow-blue-600/30 items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Agendar (30m)</span>
              </button>
            )}

            {/* Mobile / Tablet Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile & Tablet Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden relative z-30 bg-slate-900/98 backdrop-blur-2xl border-b border-white/10 p-5 space-y-3 text-left animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="#innovacion"
                onClick={(e) => handleNavClick(e, '#innovacion')}
                className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-blue-600/25 text-sky-300 font-bold text-xs border border-blue-500/30"
              >
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>INNOVACIÓN (3 Pilares)</span>
              </a>
              <a
                href="#odoo"
                onClick={(e) => handleNavClick(e, '#odoo')}
                className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-indigo-600/25 text-indigo-300 font-bold text-xs border border-indigo-500/30"
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>ODOO COMMUNITY ERP</span>
              </a>
              <a
                href="#ecommerce-b2b2c"
                onClick={(e) => handleNavClick(e, '#ecommerce-b2b2c')}
                className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-purple-600/25 text-purple-300 font-bold text-xs border border-purple-500/30"
              >
                <ShoppingCart className="w-4 h-4 text-purple-400" />
                <span>E-COMMERCE B2B2C</span>
              </a>
              <a
                href="#project-manager"
                onClick={(e) => handleNavClick(e, '#project-manager')}
                className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/5"
              >
                <FolderGit2 className="w-4 h-4 text-sky-400" />
                <span>PROJECT MANAGER</span>
              </a>
              <a
                href="#servicios"
                onClick={(e) => handleNavClick(e, '#servicios')}
                className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SERVICIOS</span>
              </a>
              <a
                href="#blog"
                onClick={(e) => handleNavClick(e, '#blog')}
                className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/5"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>BLOG & ARTÍCULOS</span>
              </a>
              <a
                href="#tech-specs"
                onClick={(e) => handleNavClick(e, '#tech-specs')}
                className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/5"
              >
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>MODERN TECH STACK</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <a
                href={SITE_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0A66C2] flex items-center gap-1.5"
              >
                <Linkedin className="w-3.5 h-3.5 fill-white" />
                <span>LinkedIn</span>
              </a>

              <a
                href="#contacto"
                onClick={(e) => handleNavClick(e, '#contacto')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10"
              >
                Contacto Directo
              </a>

              {onScheduleClick && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onScheduleClick();
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Agendar (30m)
                </button>
              )}
            </div>
          </div>
        )}


        {/* 2. SUB-BARRA DE CONTROL DEL CARRUSEL (Pestañas y Controles de Frames) */}
        <div className="relative z-20 px-4 sm:px-6 md:px-8 py-2.5 bg-slate-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Frame Tabs Selector */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveFrame(0)}
              className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeFrame === 0
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-sky-400" />
              <span>01. Presentación (Video de Fondo)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFrame(1)}
              className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeFrame === 1
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-300" />
              <span>02. Ecosistema & Arquitectura</span>
            </button>
          </div>

          {/* Right Controls: Carousel arrows & Config trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Arrows */}
            <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveFrame(activeFrame === 0 ? 1 : 0)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title="Frame anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 font-bold text-sky-300">
                {activeFrame + 1}/2
              </span>
              <button
                type="button"
                onClick={() => setActiveFrame(activeFrame === 1 ? 0 : 1)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title="Siguiente frame"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Config Button (Control total en vivo de fotos, videos y textos) */}
            <button
              type="button"
              onClick={() => {
                setTempVideoId(currentVideoId);
                setTempFrame2(frame2Config);
                setIsEditing(!isEditing);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              title="Personalizar frames del carrusel banner"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-300" />
              <span>{isEditing ? 'Cerrar' : 'Configurar Showcase'}</span>
            </button>
          </div>

        </div>

        {/* Drawer de Configuración en Vivo */}
        {isEditing && (
          <div className="relative z-20 bg-slate-900/98 border-b border-blue-800/40 p-5 text-slate-200 text-xs animate-in fade-in duration-150 text-left">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">
                  Control Total de Contenido (Frames 1 y 2)
                </span>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="text-slate-400 hover:text-white flex items-center gap-1 underline text-[11px] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar predeterminados
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frame 1 settings */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="font-mono text-sky-400 font-bold">FRAME 1 · Video de Fondo (YouTube)</div>
                  <label className="block text-[11px] text-slate-300">URL o ID de YouTube:</label>
                  <input
                    type="text"
                    value={tempVideoId}
                    onChange={(e) => setTempVideoId(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... o L_LUpnjgPso"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-600 rounded-lg text-xs font-mono text-white"
                  />
                  <p className="text-[10px] text-slate-400">
                    Se reproducirá como fondo inmersivo de la tarjeta ejecutiva.
                  </p>
                </div>

                {/* Frame 2 settings */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="font-mono text-indigo-400 font-bold">FRAME 2 · Banner / Carrusel</div>
                  <div className="flex gap-4 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="f2type"
                        checked={tempFrame2.type === 'image'}
                        onChange={() => setTempFrame2({ ...tempFrame2, type: 'image' })}
                      />
                      <span>Foto / Diagrama</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="f2type"
                        checked={tempFrame2.type === 'video'}
                        onChange={() => setTempFrame2({ ...tempFrame2, type: 'video' })}
                      />
                      <span>Segundo Video</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={tempFrame2.mediaUrl}
                    onChange={(e) => setTempFrame2({ ...tempFrame2, mediaUrl: e.target.value })}
                    placeholder={tempFrame2.type === 'image' ? 'URL de imagen (https://...)' : 'URL/ID de YouTube'}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-600 rounded-lg text-xs font-mono text-white"
                  />
                  <input
                    type="text"
                    value={tempFrame2.title}
                    onChange={(e) => setTempFrame2({ ...tempFrame2, title: e.target.value })}
                    placeholder="Título del frame 2"
                    className="w-full px-2.5 py-1 bg-slate-950 border border-slate-600 rounded-lg text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    value={tempFrame2.description}
                    onChange={(e) => setTempFrame2({ ...tempFrame2, description: e.target.value })}
                    placeholder="Descripción o texto explicativo..."
                    className="w-full px-2.5 py-1 bg-slate-950 border border-slate-600 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar Cambios</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. CONTENIDO: FRAME 1 (VIDEO DE FONDO CINEMÁTICO - FULL SCREEN FLEX) --- */}
        {activeFrame === 0 && (
          <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between p-5 sm:p-8 md:p-12 text-left">
            
            {/* Background Video Layer */}
            {isForegroundVideoPlaying ? (
              <div className="absolute inset-0 z-0 bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1`}
                  title="Presentación de Arquitectura de Gastón Barea"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <>
                {/* Embedded Video as Ambient Background Loop */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentVideoId}&showinfo=0&rel=0&modestbranding=1&disablekb=1`}
                    title="Background Video"
                    className="w-full h-full scale-125 opacity-35 object-cover pointer-events-none mix-blend-screen"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-blue-950/70" />
                </div>
              </>
            )}

            {/* Content Floating on Top of Video */}
            {!isForegroundVideoPlaying && (
              <>
                {/* Top Strip */}
                <div className="relative z-10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-sky-300 font-bold bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-sky-400/20">
                      PRESENTACIÓN EJECUTIVA · GASTÓN BAREA
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-slate-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>04:20 min · Full HD</span>
                  </div>
                </div>

                {/* Middle Narrative */}
                <div className="relative z-10 max-w-3xl my-auto py-6 sm:py-8 space-y-4">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08] [text-wrap:balance] drop-shadow-md">
                    Nuevos Modelos de Negocio Digitales impulsados por{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                      Inteligencia y Stack Moderno.
                    </span>
                  </h1>
                  <p className="text-sm sm:text-lg md:text-xl text-slate-200 leading-relaxed drop-shadow-sm font-normal max-w-2xl">
                    No construimos software estático. Diseñamos plataformas escalables, agentes autónomos y arquitecturas resilientes que transforman organizaciones tradicionales en negocios ágiles de alto margen.
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono text-sky-200">
                      ⚡ Vercel Edge + Supabase
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono text-indigo-200">
                      🧠 Agentes de IA en Producción
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono text-emerald-300">
                      🛡️ Uptime 99.9%
                    </span>
                  </div>
                </div>

                {/* Bottom Actions Floating Over Video */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsForegroundVideoPlaying(true)}
                      className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Ver Video con Sonido</span>
                    </button>

                    {onDiagnosticoClick && (
                      <button
                        type="button"
                        onClick={onDiagnosticoClick}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors backdrop-blur-md flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30 active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                        <span>Simular Solución con IA</span>
                      </button>
                    )}

                    {onScheduleClick && (
                      <button
                        type="button"
                        onClick={onScheduleClick}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Agendar (30m)</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>Gastón Barea</span>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setActiveFrame(1)}
                      className="text-sky-400 hover:text-sky-300 underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver Frame 02 (Arquitectura)</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Close button if full player is playing */}
            {isForegroundVideoPlaying && (
              <button
                type="button"
                onClick={() => setIsForegroundVideoPlaying(false)}
                className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-mono flex items-center gap-1 cursor-pointer border border-white/20"
              >
                <X className="w-3.5 h-3.5" />
                <span>Volver al Modo Fondo</span>
              </button>
            )}

          </div>
        )}

        {/* --- 4. CONTENIDO: FRAME 2 (CARRUSEL BANNER - FOTO O VIDEO CON TEXTO - FULL SCREEN FLEX) --- */}
        {activeFrame === 1 && (
          <div className="relative flex-1 w-full p-5 sm:p-8 md:p-12 flex flex-col justify-between animate-in fade-in duration-200 text-left">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center my-auto">
              
              {/* Left Column: Visual Media (Foto o Segundo Video) */}
              <div className="md:col-span-6 relative rounded-2xl overflow-hidden border border-blue-800/40 bg-slate-900 shadow-xl group">
                {frame2Config.type === 'video' ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(
                        frame2Config.mediaUrl
                      )}?rel=0&modestbranding=1`}
                      title={frame2Config.title}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img
                      src={frame2Config.mediaUrl}
                      alt={frame2Config.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-[10px] font-mono text-sky-300 bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                      Diagrama Técnico de Arquitectura
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Text & Context */}
              <div className="md:col-span-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-300 font-bold bg-indigo-500/15 px-2.5 py-0.5 rounded-full border border-indigo-400/20">
                    {frame2Config.badge || 'FRAME 02 · BANNER DE ARQUITECTURA'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {frame2Config.title}
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {frame2Config.description}
                </p>

                {/* Call to action button */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (frame2Config.buttonAction === 'diagnostico' && onDiagnosticoClick) {
                        onDiagnosticoClick();
                      } else if (onScheduleClick) {
                        onScheduleClick();
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <span>{frame2Config.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFrame(0)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                  >
                    &larr; Volver a Video 1
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Strip */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10 mt-6">
              <span className="font-mono text-[11px]">
                Control editable desde el botón "Configurar Showcase"
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
