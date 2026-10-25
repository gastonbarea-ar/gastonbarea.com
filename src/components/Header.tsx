import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  Video,
  UserCheck,
  MessageSquare,
  Youtube,
  Compass,
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

interface HeaderProps {
  onScheduleClick: () => void;
  onWhatsAppClick: (customText?: string) => void;
  onNavigate?: (href: string) => void;
  onAdminClick?: () => void;
  onClientPortalClick?: () => void;
}

interface FwaMenuItem {
  index: string;
  label: string;
  href: string;
  category: string;
  description: string;
  metrics: string;
  featuredItems: string[];
}

const FWA_MENU_SECTIONS: FwaMenuItem[] = [
  {
    index: '01',
    label: 'Portada & Reel Interactivo',
    href: '#inicio',
    category: 'Experiencia en Video Full-Width · Canal YouTube & Buscador IA',
    description:
      'Escenario audiovisual a ancho completo desde el canal de Gastón Barea integrado con el menú superior y el buscador de soluciones asistido por Inteligencia Artificial.',
    metrics: 'Canal @gastonbarea · IA en Vivo',
    featuredItems: [
      'Showreel interactivo full-width de proyectos tecnológicos y bioeconomía',
      'Selector de episodios del canal de YouTube en primer plano',
      'Buscador inteligente que enruta cada consulta a su solución web',
    ],
  },
  {
    index: '02',
    label: 'Soluciones & Arquitectura',
    href: '#servicios',
    category: 'Matriz de 6 Verticales de Ingeniería & Negocios',
    description:
      'Desarrollo de proyectos de base tecnológica, IA Services, trazabilidad bioeconómica, dirección PMO, Odoo ERP v18 y servidores Linux/Docker.',
    metrics: '6 Ejes Productivos · Hitos 40·40·20',
    featuredItems: [
      '01. Proyectos de Base Tecnológica & Plataformas Digitales',
      '02. IA Services: Gemelos Digitales, Agentes RAG & BI',
      '03. Proyectos Basados en Bioeconomía & Telemetría IoT',
      '04. Dirección Ejecutiva de Proyectos con Clientes (14 Años PMO)',
      '05. Odoo Community ERP v18 & E-Commerce B2B2C',
      '06. Infraestructura Crítica Linux, Docker & Ciberseguridad',
    ],
  },
  {
    index: '03',
    label: 'IA Services & Estructurador',
    href: '#ia-services',
    category: 'Gemelos Digitales Corporativos & Blueprint Técnico',
    description:
      'Convertimos portales corporativos y operaciones industriales en Gemelos Digitales interactivos. Probá en vivo el estructurador de proyectos en 3 fases.',
    metrics: '3 a 6 Semanas · Arquitectura Viva',
    featuredItems: [
      'Diseño de Gemelos Digitales para atención, ventas B2B y operaciones',
      'Generador instantáneo de hoja de ruta (40% Inicio · 40% Staging · 20% Producción)',
      'Simulación de stack técnico, plazos y entregables auditables por vertical',
    ],
  },
  {
    index: '04',
    label: 'Bioeconomía & Casos Reales',
    href: '#bioeconomia',
    category: 'Convergencia Tecnológica-Productiva & Evidencia',
    description:
      'Digitalización de bioprocesos, valorización de biomasa, economía circular y casos de impacto auditables en agroindustria, distribución y energía.',
    metrics: '-42% Mermas · 100% Trazabilidad',
    featuredItems: [
      'Pasaportes digitales de lote y monitoreo IoT en planta y campo',
      'Estructuración técnica de Empresas de Base Tecnológica (EBTs)',
      'Casos de éxito documentados con métricas reales de retorno',
    ],
  },
  {
    index: '05',
    label: 'Trayectoria (30 Años)',
    href: '#trayectoria',
    category: '30 Años Sector Tecnológico · 14 Años Dirección PMO',
    description:
      'Tres décadas desarrollando tecnología aplicada a la producción real (1996–2026) y 14 años liderando proyectos estratégicos directamente junto a clientes.',
    metrics: '1996–2026 · Patagonia & Global',
    featuredItems: [
      '1996–2012: Ingeniería de sistemas, redes industriales y Linux',
      '2012–2021: Dirección ejecutiva PMO, bases PostgreSQL y sistemas ERP',
      '2021–2026: Base tecnológica, IA Services, Bioeconomía y Odoo v18',
    ],
  },
  {
    index: '06',
    label: 'Publicaciones & Contacto',
    href: '#contacto',
    category: 'Notas Ejecutivas, Canal Directo & Protocolo NDA',
    description:
      'Artículos de análisis técnico e inicio inmediato de evaluación de proyectos bajo acuerdo de confidencialidad o sesión en Google Meet Pro.',
    metrics: 'Respuesta < 24h · NDA Garantizado',
    featuredItems: [
      'Formulario ejecutivo de relevamiento de proyectos',
      'Agenda directa de videollamada en Google Meet Pro (30 min)',
      'Acceso a publicaciones sobre IA, Bioeconomía y Modern Tech Stack',
    ],
  },
];

export const Header: React.FC<HeaderProps> = ({
  onScheduleClick,
  onWhatsAppClick,
  onNavigate,
  onClientPortalClick,
}) => {
  const [fwaMenuOpen, setFwaMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [isScrolledPastVideo, setIsScrolledPastVideo] = useState(false);

  // Detect scroll to transition header from integrated video overlay to crisp white bar
  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.65;
      setIsScrolledPastVideo(window.scrollY > threshold);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fwaMenuOpen) {
        setFwaMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fwaMenuOpen]);

  // Lock body scroll when full-screen FWA menu is open
  useEffect(() => {
    if (fwaMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [fwaMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setFwaMenuOpen(false);
    if (href === '#inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (onNavigate) {
      onNavigate(href);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const activePreview = FWA_MENU_SECTIONS[hoveredIndex] || FWA_MENU_SECTIONS[0];

  // When on top of the Hero video (or when FWA menu is open), use dark glass integrated into the video stage
  const isOverDarkStage = !isScrolledPastVideo || fwaMenuOpen;

  return (
    <>
      {/* FULL-WIDTH INTEGRATED FWA TOP BAR (Sits directly inside the video stage at top=0) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-200 border-b ${
          isOverDarkStage
            ? 'bg-black/65 backdrop-blur-md text-white border-white/15'
            : 'bg-white/95 backdrop-blur-md text-[#1D1D1F] border-black/[0.14]'
        }`}
      >
        <div className="w-full flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8 lg:px-12 h-16">
          {/* Zone 1: FWA Menu Trigger + Brand Wordmark */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <button
              type="button"
              onClick={() => setFwaMenuOpen(!fwaMenuOpen)}
              className={`px-3 sm:px-4 py-2 text-xs font-mono font-bold tracking-wider border transition-colors inline-flex items-center gap-2 cursor-pointer rounded-none whitespace-nowrap ${
                fwaMenuOpen
                  ? 'bg-[#291B64] text-white border-white/30'
                  : isOverDarkStage
                  ? 'bg-white/10 text-white border-white/25 hover:bg-[#291B64] hover:border-white/40'
                  : 'bg-white text-[#1D1D1F] border-black/[0.18] hover:bg-[#0A0A0C] hover:text-white'
              }`}
              aria-expanded={fwaMenuOpen}
              aria-label="Alternar menú principal estilo FWA"
            >
              {fwaMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>{fwaMenuOpen ? 'CERRAR' : 'MENÚ'}</span>
            </button>

            <a
              href="#inicio"
              onClick={(e) => handleNavClick(e, '#inicio')}
              className={`font-display text-base sm:text-xl font-bold tracking-tight whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity ${
                isOverDarkStage ? 'text-white' : 'text-[#1D1D1F]'
              }`}
            >
              Gastón Barea
            </a>
          </div>

          {/* Zone 2: 5 Clean Single-Line Architectural Links */}
          <nav
            className={`hidden xl:flex items-center gap-7 text-xs font-mono font-semibold ${
              isOverDarkStage ? 'text-neutral-300' : 'text-[#515154]'
            }`}
          >
            <a
              href="#servicios"
              onClick={(e) => handleNavClick(e, '#servicios')}
              className={`underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0 ${
                isOverDarkStage ? 'hover:text-white' : 'hover:text-[#291B64]'
              }`}
            >
              01. Soluciones
            </a>
            <a
              href="#ia-services"
              onClick={(e) => handleNavClick(e, '#ia-services')}
              className={`underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0 ${
                isOverDarkStage ? 'hover:text-white' : 'hover:text-[#291B64]'
              }`}
            >
              02. IA Services
            </a>
            <a
              href="#bioeconomia"
              onClick={(e) => handleNavClick(e, '#bioeconomia')}
              className={`underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0 ${
                isOverDarkStage ? 'hover:text-white' : 'hover:text-[#291B64]'
              }`}
            >
              03. Bioeconomía & Tech
            </a>
            <a
              href="#trayectoria"
              onClick={(e) => handleNavClick(e, '#trayectoria')}
              className={`underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0 ${
                isOverDarkStage ? 'hover:text-white' : 'hover:text-[#291B64]'
              }`}
            >
              04. Trayectoria
            </a>
            <button
              type="button"
              onClick={() => {
                setFwaMenuOpen(false);
                if (onClientPortalClick) onClientPortalClick();
              }}
              className={`underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isOverDarkStage ? 'hover:text-white' : 'hover:text-[#291B64]'
              }`}
            >
              05. Portal Clientes
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setFwaMenuOpen(false);
                onScheduleClick();
              }}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-mono font-bold text-white bg-[#291B64] border border-white/20 rounded-none hover:bg-[#382586] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="hidden sm:inline">Agendar Google Meet Pro</span>
              <span className="sm:hidden">Meet Pro</span>
            </button>
          </div>
        </div>
      </header>

      {/* THE FWA FULL-SCREEN ARCHITECTURAL MEGA-MENU OVERLAY (100% FULL WIDTH) */}
      {fwaMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 w-full bg-[#0A0A0C] text-white overflow-y-auto border-t border-white/15">
          <div className="w-full min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/15">
            {/* LEFT COLUMN (7 COLS): FWA OVERSIZED EDITORIAL INDEX */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="divide-y divide-white/15">
                {FWA_MENU_SECTIONS.map((item, idx) => {
                  const isActive = hoveredIndex === idx;
                  return (
                    <a
                      key={item.index}
                      href={item.href}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onFocus={() => setHoveredIndex(idx)}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`group px-4 sm:px-8 lg:px-12 py-5 sm:py-7 flex items-center justify-between gap-4 sm:gap-6 transition-colors ${
                        isActive ? 'bg-[#291B64] text-white' : 'bg-[#0A0A0C] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-baseline gap-4 sm:gap-7 text-left min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-mono font-bold tabular-nums shrink-0 ${
                            isActive ? 'text-emerald-300' : 'text-neutral-500'
                          }`}
                        >
                          {item.index}
                        </span>
                        <div className="space-y-1 min-w-0">
                          <div className="font-display text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white truncate">
                            {item.label}
                          </div>
                          <div
                            className={`text-xs font-mono line-clamp-1 ${
                              isActive ? 'text-white/85' : 'text-neutral-400'
                            }`}
                          >
                            {item.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden md:inline text-xs font-mono text-white/70">
                          {item.metrics}
                        </span>
                        <ArrowUpRight
                          className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-150 ${
                            isActive ? 'translate-x-0.5 -translate-y-0.5 text-white' : 'text-neutral-500'
                          }`}
                        />
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Bottom Quick Index Strip */}
              <div className="px-4 sm:px-8 lg:px-12 py-5 bg-[#111115] border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400">
                <div>
                  <span>GASTÓN BAREA · GEMELO DIGITAL INTERACTIVO</span>
                </div>
                <div className="flex flex-wrap items-center gap-5">
                  <a
                    href={SITE_CONFIG.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white inline-flex items-center gap-1.5"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    <span>YouTube @gastonbarea</span>
                  </a>
                  <a
                    href={SITE_CONFIG.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={SITE_CONFIG.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (5 COLS): DYNAMIC INTERACTIVE PREVIEW & DIRECT ACTIONS */}
            <div className="lg:col-span-5 p-5 sm:p-8 lg:p-12 bg-[#101014] flex flex-col justify-between space-y-8 text-left">
              {/* Dynamic Section Inspector */}
              <div className="space-y-6">
                <div className="pb-4 border-b border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-emerald-400">
                    SECCIÓN {activePreview.index} · VISTA PREVIA
                  </span>
                  <span className="text-neutral-400">{activePreview.metrics}</span>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-xl sm:text-3xl font-bold text-white leading-tight">
                    {activePreview.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {activePreview.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono text-neutral-400">
                    Contenido y capacidades en esta sección:
                  </div>
                  <div className="space-y-2">
                    {activePreview.featuredItems.map((feat, i) => (
                      <div
                        key={i}
                        className="p-3 bg-black/50 border border-white/10 text-xs text-neutral-200 flex items-start gap-2.5"
                      >
                        <span className="font-mono text-emerald-400 font-bold">
                          0{i + 1}
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={activePreview.href}
                    onClick={(e) => handleNavClick(e, activePreview.href)}
                    className="px-5 py-3 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] border border-white/15 rounded-none inline-flex items-center gap-2 transition-colors"
                  >
                    <span>Ir a {activePreview.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Direct Platform Utilities Box */}
              <div className="pt-6 border-t border-white/15 space-y-4">
                <div className="text-xs font-mono text-neutral-400">
                  Accesos Ejecutivos Directos · 30 Años Tech · 14 Años PMO
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFwaMenuOpen(false);
                      onScheduleClick();
                    }}
                    className="p-3.5 bg-[#291B64] hover:bg-[#382586] text-white border border-white/15 text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Video className="w-4 h-4 text-emerald-300" />
                      <span>Google Meet Pro</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {onClientPortalClick && (
                    <button
                      type="button"
                      onClick={() => {
                        setFwaMenuOpen(false);
                        onClientPortalClick();
                      }}
                      className="p-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                    >
                      <span className="inline-flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Portal Clientes</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setFwaMenuOpen(false);
                      onWhatsAppClick();
                    }}
                    className="p-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp Directo</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href="#ia-services"
                    onClick={(e) => handleNavClick(e, '#ia-services')}
                    className="p-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-semibold flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span>Estructurador IA</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
