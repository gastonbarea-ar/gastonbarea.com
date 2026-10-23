import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Layers,
  ShieldCheck,
  Video,
  X,
  Image as ImageIcon,
  ArrowRight,
  TrendingUp,
  FolderGit2,
  BookOpen,
  Cpu,
  ChevronDown,
  Brain,
  Server,
  MessageSquare,
  Linkedin,
  Github,
  Menu,
  ShoppingCart,
  UserCheck,
} from 'lucide-react';
import { SITE_CONFIG, Frame2Settings } from '../data/siteConfig';

interface PresentationVideoProps {
  onScheduleClick?: () => void;
  onDiagnosticoClick?: () => void;
  onWhatsAppClick?: (customText?: string) => void;
  onClientPortalClick?: () => void;
}

export const PresentationVideo: React.FC<PresentationVideoProps> = ({
  onScheduleClick,
  onDiagnosticoClick,
  onWhatsAppClick,
  onClientPortalClick,
}) => {
  // Navigation & Dropdown States inside the Frame
  const [technicalDropdownOpen, setTechnicalDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active Frame: 0 = Video de Fondo, 1 = Segundo Frame (Ecosistema & Arquitectura)
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const [isForegroundVideoPlaying, setIsForegroundVideoPlaying] = useState<boolean>(false);
  const [hasAutoAdvanced, setHasAutoAdvanced] = useState<boolean>(false);

  // Configuration loaded from SITE_CONFIG (administrable from Backend / CRM)
  const currentVideoId = SITE_CONFIG.presentationVideo?.youtubeId || 'L_LUpnjgPso';
  const autoAdvanceSecs = SITE_CONFIG.presentationVideo?.autoAdvanceSeconds || 15;
  const frame2Config: Frame2Settings = SITE_CONFIG.presentationVideo?.frame2 || {
    type: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    badge: 'FRAME 02 · ECOSISTEMA & ARQUITECTURA',
    title: 'Topología Desacoplada: Edge Computing + Supabase + Agentes de IA',
    description:
      'Diseñamos infraestructuras resilientes donde el frontend carga en menos de 50ms a nivel global, y los procesos pesados de IA se orquestan en workers dedicados sin afectar la experiencia del cliente.',
    buttonText: 'Agendar Google Meet Pro (30 min)',
    buttonAction: 'schedule',
  };

  // Autoplay video on entrance and automatically advance to Frame 2 after configured seconds
  useEffect(() => {
    if (hasAutoAdvanced) return;

    const timer = setTimeout(() => {
      // Advance to next frame automatically if foreground full player is not open
      if (!isForegroundVideoPlaying) {
        setActiveFrame(1);
        setHasAutoAdvanced(true);
      }
    }, autoAdvanceSecs * 1000);

    return () => clearTimeout(timer);
  }, [hasAutoAdvanced, isForegroundVideoPlaying, autoAdvanceSecs]);

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
    if (!trimmed) return currentVideoId;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
    const match = trimmed.match(regExp);
    if (match && match[1]) return match[1];
    if (trimmed.length === 11 && !trimmed.includes('/')) return trimmed;
    return trimmed;
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
  ];

  return (
    <section className="relative w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 my-2 sm:my-4">
      
      {/* Ambient background glow */}
      <div
        className="absolute -inset-2 bg-gradient-to-r from-blue-600/25 via-indigo-600/25 to-sky-500/25 rounded-3xl md:rounded-[2.5rem] blur-2xl -z-10 opacity-70"
        aria-hidden="true"
      />

      {/* MASTER EXECUTIVE FRAME: FULL SCREEN (100dvh) + RESPONSIVE */}
      <div className="relative w-full min-h-[88dvh] sm:min-h-[92dvh] md:min-h-[94dvh] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] bg-slate-950 border border-blue-800/40 shadow-2xl overflow-hidden text-white flex flex-col justify-between">
        
        {/* 1. CABECERA: MENÚ INTEGRADO + PORTAL CLIENTES + MARCA GASTÓN BAREA */}
        {/* 1. CABECERA: MENÚ INTEGRADO + PORTAL CLIENTES + MARCA GASTÓN BAREA */}
        <div className="relative z-30 w-full px-3 sm:px-5 lg:px-6 py-2.5 bg-slate-950/90 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between gap-2 lg:gap-4">
          
          {/* LADO IZQUIERDO: Marca / Nombre de Gastón Barea */}
          <div className="flex items-center z-10 shrink-0">
            <a
              href="#"
              className="flex items-center gap-2 sm:gap-2.5 text-sm font-semibold tracking-tight text-white whitespace-nowrap group"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center font-mono font-bold text-xs text-white shadow-md shadow-blue-500/30 group-hover:scale-105 transition-all">
                GB
              </span>
              <div className="flex flex-col text-left">
                <span className="text-white font-bold group-hover:text-sky-300 transition-colors leading-tight text-xs sm:text-sm">
                  Gastón Barea
                </span>
                <span className="text-[9px] font-mono text-sky-400 font-medium tracking-wide hidden sm:inline">
                  Business & Tech Architecture
                </span>
              </div>
            </a>
          </div>

          {/* CENTRO: Menú de Navegación con Portal Clientes Integrado (Flex natural sin absolute overlap) */}
          <nav className="hidden xl:flex items-center justify-center gap-1 2xl:gap-1.5 flex-1 min-w-0 text-xs font-medium text-slate-200">
            
            {/* BOTÓN INNOVACIÓN (3 Pilares) */}
            <a
              href="#innovacion"
              onClick={(e) => handleNavClick(e, '#innovacion')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-sky-300 bg-sky-500/20 hover:bg-sky-500 hover:text-white border border-sky-400/30 shadow-2xs transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <TrendingUp className="w-3.5 h-3.5 text-sky-400 group-hover:text-white" />
              <span>INNOVACIÓN</span>
            </a>

            {/* PROJECT MANAGER */}
            <a
              href="#project-manager"
              onClick={(e) => handleNavClick(e, '#project-manager')}
              className="px-2.5 py-1 rounded-full hover:text-sky-400 hover:bg-white/10 font-semibold tracking-wide transition-all inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
              <span>PROJECT MANAGER</span>
            </a>

            {/* SERVICIOS (Dropdown) */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setTechnicalDropdownOpen(!technicalDropdownOpen)}
                className={`px-2.5 py-1 rounded-full transition-all inline-flex items-center gap-1 font-semibold hover:text-sky-400 hover:bg-white/10 cursor-pointer whitespace-nowrap ${
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

            {/* SECCIÓN ODOO COMMUNITY ERP */}
            <a
              href="#odoo"
              onClick={(e) => handleNavClick(e, '#odoo')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-600/30 border border-indigo-400/30 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>ODOO ERP</span>
            </a>

            {/* PORTAL CLIENTES (Acceso Destacado en Menú) */}
            {onClientPortalClick && (
              <button
                type="button"
                onClick={onClientPortalClick}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-sky-300 hover:text-white bg-blue-900/60 hover:bg-blue-800 border border-sky-400/40 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                title="Acceso al Portal del Cliente Verificado (Proyectos, Consultas & SLA)"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>PORTAL CLIENTES</span>
              </button>
            )}

            {/* BLOG */}
            <a
              href="#blog"
              onClick={(e) => handleNavClick(e, '#blog')}
              className="px-2.5 py-1 rounded-full hover:text-sky-400 hover:bg-white/10 font-semibold tracking-wide transition-all inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>BLOG</span>
            </a>

            {/* CONTACTO */}
            <a
              href="#contacto"
              onClick={(e) => handleNavClick(e, '#contacto')}
              className="px-2.5 py-1 rounded-full hover:text-sky-400 hover:bg-white/10 transition-all text-slate-300 whitespace-nowrap shrink-0"
            >
              Contacto
            </a>

          </nav>

          {/* LADO DERECHO: Botones de Acción (LinkedIn, WhatsApp y Google Meet Pro) */}
          <div className="flex items-center gap-1.5 sm:gap-2 z-10 shrink-0">
            {/* LINKEDIN */}
            <a
              href={SITE_CONFIG.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] active:scale-95 rounded-full transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              title="LinkedIn Profesional de Gastón Barea"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5 fill-white" />
              <span className="hidden 2xl:inline">LinkedIn</span>
            </a>

            {/* GITHUB */}
            <a
              href={SITE_CONFIG.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden 2xl:flex p-1.5 text-slate-400 hover:text-sky-300 hover:bg-white/10 rounded-full transition-colors"
              title="GitHub de Gastón Barea"
              aria-label="GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>

            {/* WHATSAPP */}
            <button
              onClick={() => (onWhatsAppClick ? onWhatsAppClick() : null)}
              type="button"
              className="px-2.5 sm:px-3 py-1 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 rounded-full transition-all whitespace-nowrap shadow-sm shadow-[#25D366]/35 flex items-center gap-1 cursor-pointer"
              title="Contactar directamente por WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* GOOGLE MEET PRO */}
            {onScheduleClick && (
              <button
                onClick={onScheduleClick}
                type="button"
                className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 active:scale-95 rounded-full transition-all whitespace-nowrap shadow-sm shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                title="Agendar videollamada por Google Meet Pro"
              >
                <Video className="w-3.5 h-3.5 text-sky-200" />
                <span className="hidden xs:inline">Google Meet Pro</span>
                <span className="xs:hidden">Meet</span>
              </button>
            )}

            {/* Mobile / Tablet Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="xl:hidden p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile & Tablet Drawer Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden relative z-30 bg-slate-900/98 backdrop-blur-2xl border-b border-white/10 p-4 sm:p-5 space-y-3 text-left animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {onClientPortalClick && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onClientPortalClick();
                  }}
                  className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-blue-800/50 text-white font-bold text-xs border border-sky-400/40 text-left"
                >
                  <UserCheck className="w-4 h-4 text-sky-400" />
                  <span>PORTAL CLIENTES (Proyectos & SLA)</span>
                </button>
              )}
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

              {onScheduleClick && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onScheduleClick();
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5 text-sky-200" />
                  <span>Google Meet Pro</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. SUB-BARRA DE INDICADORES DE FRAMES (Limpia, sin botones de edición en el front) */}
        <div className="relative z-20 px-4 sm:px-6 md:px-8 py-2 bg-slate-900/80 border-b border-white/10 flex items-center justify-between text-xs">
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
              <span>01. Video de Inicio (Autoplay)</span>
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

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveFrame(activeFrame === 0 ? 1 : 0)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              title="Frame anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 font-bold text-sky-300">
              {activeFrame + 1} / 2
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
        </div>

        {/* 3. CONTENIDO: FRAME 1 (VIDEO AUTOPLAY AL ENTRAR) */}
        {activeFrame === 0 && (
          <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between p-5 sm:p-8 md:p-12 text-left">
            
            {/* Background Video Layer with YouTube Embed */}
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
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentVideoId}&showinfo=0&rel=0&modestbranding=1&disablekb=1`}
                  title="Background Video"
                  className="w-full h-full scale-125 opacity-40 object-cover pointer-events-none mix-blend-screen"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-blue-950/70" />
              </div>
            )}

            {/* Content Floating on Top of Video */}
            {!isForegroundVideoPlaying && (
              <>
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
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-sky-300" />
                        <span>Google Meet Pro</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <button
                      type="button"
                      onClick={() => setActiveFrame(1)}
                      className="text-sky-400 hover:text-sky-300 underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver Siguiente Frame (Arquitectura)</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </>
            )}

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

        {/* 4. CONTENIDO: FRAME 2 (ECOSISTEMA & ARQUITECTURA) */}
        {activeFrame === 1 && (
          <div className="relative flex-1 w-full p-5 sm:p-8 md:p-12 flex flex-col justify-between animate-in fade-in duration-200 text-left">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center my-auto">
              
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

            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10 mt-6">
              <span className="font-mono text-[11px]">
                Administrado centralizadamente desde el Panel de Control / CRM
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
