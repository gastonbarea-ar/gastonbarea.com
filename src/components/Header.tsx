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
  BookOpen,
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';
import { BrandLogo } from './BrandLogo';

export type PageSectionId =
  | 'inicio'
  | 'servicios'
  | 'ia-services'
  | 'bioeconomia'
  | 'trayectoria'
  | 'blog'
  | 'contacto';

interface HeaderProps {
  activePage?: PageSectionId;
  onScheduleClick: () => void;
  onWhatsAppClick: (customText?: string) => void;
  onNavigate?: (href: string) => void;
  onAdminClick?: () => void;
  onClientPortalClick?: () => void;
}

interface FwaMenuItem {
  index: string;
  id: PageSectionId;
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
    id: 'inicio',
    label: 'Inicio · Gemelo Digital',
    href: '#inicio',
    category: 'Experiencia en Video Full-Width · Bloques Personalizados & Buscador IA',
    description:
      'Portada principal diseñada por bloques personalizados: escenario audiovisual desde el canal de YouTube de Gastón Barea, buscador de soluciones con IA y resumen interactivo de cada área.',
    metrics: 'Canal @gastonbarea · IA en Vivo',
    featuredItems: [
      'Showreel interactivo full-width de proyectos tecnológicos y bioeconomía',
      'Buscador inteligente que enruta cada consulta a su solución web',
      'Recorrido por bloques personalizados sin recarga visual',
    ],
  },
  {
    index: '02',
    id: 'servicios',
    label: 'Soluciones & Arquitectura',
    href: '#servicios',
    category: 'Página Dedicada · 6 Verticales de Ingeniería & Negocios',
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
    id: 'ia-services',
    label: 'IA Services & Estructurador',
    href: '#ia-services',
    category: 'Página Dedicada · Gemelos Digitales Corporativos & Blueprint Técnico',
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
    id: 'bioeconomia',
    label: 'Bioeconomía & Casos Reales',
    href: '#bioeconomia',
    category: 'Página Dedicada · Convergencia Tecnológica-Productiva & Evidencia',
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
    id: 'trayectoria',
    label: 'Trayectoria (30 Años)',
    href: '#trayectoria',
    category: 'Página Dedicada · 30 Años Sector Tecnológico · 14 Años Dirección PMO',
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
    id: 'blog',
    label: 'Blog & Publicaciones',
    href: '#blog',
    category: 'Página Dedicada · Artículos Técnicos, Videos & Análisis Ejecutivo',
    description:
      'Publicaciones de Gastón Barea sobre bioeconomía, trazabilidad digital, dirección de proyectos PMO, Gemelos Digitales con IA y arquitectura Odoo/Linux.',
    metrics: 'Lectura Interactiva · Editor Integrado',
    featuredItems: [
      'Artículos completos con bloques multimedia y videos de YouTube integrados',
      'Filtro por categorías: Innovación, Operaciones con IA, Modern Tech Stack y Linux',
      'Editor de publicaciones integrado para crear y actualizar artículos',
    ],
  },
  {
    index: '07',
    id: 'contacto',
    label: 'Contacto Ejecutivo',
    href: '#contacto',
    category: 'Página Dedicada · Canal Directo, Google Meet Pro & Protocolo NDA',
    description:
      'Inicio inmediato de evaluación de proyectos bajo acuerdo de confidencialidad (NDA), formulario de requerimiento técnico y preguntas frecuentes.',
    metrics: 'Respuesta < 24h · NDA Garantizado',
    featuredItems: [
      'Formulario ejecutivo de relevamiento de proyectos',
      'Agenda directa de videollamada en Google Meet Pro (30 min)',
      'Preguntas frecuentes sobre metodología 40·40·20 y Portal de Clientes',
    ],
  },
];

export const Header: React.FC<HeaderProps> = ({
  activePage = 'inicio',
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
      const threshold = window.innerHeight * 0.55;
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
    if (onNavigate) {
      onNavigate(href);
    }
  };

  const activePreview = FWA_MENU_SECTIONS[hoveredIndex] || FWA_MENU_SECTIONS[0];

  // Dark glass header when on Inicio above the video stage or when FWA menu is open
  const isOverDarkStage = (activePage === 'inicio' && !isScrolledPastVideo) || fwaMenuOpen;

  const topNavItems: { id: PageSectionId; label: string; href: string }[] = [
    { id: 'inicio', label: 'Inicio', href: '#inicio' },
    { id: 'servicios', label: 'Soluciones', href: '#servicios' },
    { id: 'ia-services', label: 'IA Services', href: '#ia-services' },
    { id: 'bioeconomia', label: 'Bioeconomía', href: '#bioeconomia' },
    { id: 'trayectoria', label: 'Trayectoria', href: '#trayectoria' },
    { id: 'blog', label: 'Blog', href: '#blog' },
    { id: 'contacto', label: 'Contacto', href: '#contacto' },
  ];

  return (
    <>
      {/* FULL-WIDTH TOP BAR (3-Zone Contract, frameless clean aesthetic) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-200 border-b ${
          isOverDarkStage
            ? 'bg-[#08080C]/80 backdrop-blur-md text-white border-white/10'
            : 'bg-white/95 backdrop-blur-md text-[#1D1D1F] border-black/[0.06]'
        }`}
      >
        <div className="w-full flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8 lg:px-12 h-16">
          {/* Zone 1: FWA Menu Trigger + Brand Wordmark */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <button
              type="button"
              onClick={() => setFwaMenuOpen(!fwaMenuOpen)}
              className={`px-3.5 py-2 text-xs font-mono font-bold tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer rounded-none whitespace-nowrap ${
                fwaMenuOpen
                  ? 'bg-[#291B64] text-white'
                  : isOverDarkStage
                  ? 'bg-white/10 text-white hover:bg-[#291B64]'
                  : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#291B64] hover:text-white'
              }`}
              aria-expanded={fwaMenuOpen}
              aria-label="Alternar menú principal de secciones"
            >
              {fwaMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>{fwaMenuOpen ? 'CERRAR' : 'SECCIONES'}</span>
            </button>

            <a
              href="#inicio"
              onClick={(e) => handleNavClick(e, '#inicio')}
              className="inline-flex items-center gap-2.5 shrink-0 hover:opacity-85 transition-opacity"
              aria-label="Gastón Barea – Inicio"
            >
              <BrandLogo
                theme={isOverDarkStage ? 'on-dark' : 'on-light'}
                size="nav"
              />
            </a>
          </div>

          {/* Zone 2: Direct Multi-Page Section Navigation (Includes Blog prominently) */}
          <nav
            className={`hidden xl:flex items-center gap-6 text-xs font-mono font-semibold ${
              isOverDarkStage ? 'text-neutral-300' : 'text-[#515154]'
            }`}
          >
            {topNavItems.map((nav) => {
              const isCurrent = activePage === nav.id;
              return (
                <a
                  key={nav.id}
                  href={nav.href}
                  onClick={(e) => handleNavClick(e, nav.href)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isCurrent
                      ? isOverDarkStage
                        ? 'text-white border-emerald-400 font-bold'
                        : 'text-[#291B64] border-[#291B64] font-bold'
                      : isOverDarkStage
                      ? 'border-transparent hover:text-white'
                      : 'border-transparent hover:text-[#291B64]'
                  }`}
                >
                  {nav.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setFwaMenuOpen(false);
                onScheduleClick();
              }}
              className="px-4 sm:px-5 py-2.5 text-xs font-mono font-bold text-white bg-[#291B64] rounded-none hover:bg-[#382586] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="hidden sm:inline">Agendar Google Meet Pro</span>
              <span className="sm:hidden">Meet Pro</span>
            </button>
          </div>
        </div>
      </header>

      {/* THE FWA FULL-SCREEN ARCHITECTURAL MEGA-MENU OVERLAY (Clean, no nested boxes) */}
      {fwaMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 w-full bg-[#0A0A0C] text-white overflow-y-auto border-t border-white/10">
          <div className="w-full min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT COLUMN (7 COLS): FWA OVERSIZED EDITORIAL INDEX */}
            <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="divide-y divide-white/[0.07]">
                {FWA_MENU_SECTIONS.map((item, idx) => {
                  const isActive = hoveredIndex === idx;
                  const isCurrentPage = activePage === item.id;
                  return (
                    <a
                      key={item.index}
                      href={item.href}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onFocus={() => setHoveredIndex(idx)}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`group px-4 sm:px-8 lg:px-12 py-4 sm:py-6 flex items-center justify-between gap-4 sm:gap-6 transition-colors ${
                        isActive ? 'bg-[#291B64] text-white' : 'bg-[#0A0A0C] hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-baseline gap-4 sm:gap-6 text-left min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-mono font-bold tabular-nums shrink-0 ${
                            isActive ? 'text-emerald-300' : 'text-neutral-500'
                          }`}
                        >
                          {item.index}
                        </span>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white truncate">
                              {item.label}
                            </span>
                            {isCurrentPage && (
                              <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                                · PÁGINA ACTUAL
                              </span>
                            )}
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
                          className={`w-5 h-5 transition-transform duration-150 ${
                            isActive ? 'translate-x-0.5 -translate-y-0.5 text-white' : 'text-neutral-500'
                          }`}
                        />
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Bottom Quick Index Strip */}
              <div className="px-4 sm:px-8 lg:px-12 py-4 bg-[#0E0E12] border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-3">
                  <BrandLogo theme="on-dark" size="sm" />
                  <span className="hidden sm:inline">· GEMELO DIGITAL INTERACTIVO</span>
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

            {/* RIGHT COLUMN (5 COLS): CLEAN TYPOGRAPHIC PREVIEW WITHOUT HEAVY FRAMES */}
            <div className="lg:col-span-5 p-6 sm:p-10 lg:p-14 bg-[#101015] flex flex-col justify-between space-y-10 text-left">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-400">
                  <span>SECCIÓN {activePreview.index} · PÁGINA DEDICADA</span>
                  <span className="text-neutral-400">{activePreview.metrics}</span>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {activePreview.label}
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {activePreview.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="text-xs font-mono text-neutral-400">
                    Contenido de esta página:
                  </div>
                  <ul className="space-y-2.5">
                    {activePreview.featuredItems.map((feat, i) => (
                      <li
                        key={i}
                        className="text-xs sm:text-sm text-neutral-200 flex items-start gap-3"
                      >
                        <span className="font-mono text-emerald-400 font-bold shrink-0">
                          0{i + 1}.
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <a
                    href={activePreview.href}
                    onClick={(e) => handleNavClick(e, activePreview.href)}
                    className="px-6 py-3.5 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none inline-flex items-center gap-2 transition-colors"
                  >
                    <span>Abrir página: {activePreview.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Direct Platform Utilities (Frameless clean buttons) */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="text-xs font-mono text-neutral-400">
                  Accesos Directos · 30 Años Tech · 14 Años PMO
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFwaMenuOpen(false);
                      onScheduleClick();
                    }}
                    className="p-3.5 bg-[#291B64] hover:bg-[#382586] text-white text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Video className="w-4 h-4 text-emerald-300" />
                      <span>Google Meet Pro</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href="#blog"
                    onClick={(e) => handleNavClick(e, '#blog')}
                    className="p-3.5 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>Ir al Blog</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  {onClientPortalClick && (
                    <button
                      type="button"
                      onClick={() => {
                        setFwaMenuOpen(false);
                        onClientPortalClick();
                      }}
                      className="p-3.5 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors"
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
                    className="p-3.5 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp Directo</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
