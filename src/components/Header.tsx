import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  Video,
  UserCheck,
  MessageSquare,
  Youtube,
  BookOpen,
  ChevronDown,
  Sparkles,
  FolderKanban,
  LayoutDashboard,
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';
import type { PageSectionId } from '../lib/domainLogic';

export type { PageSectionId };

interface HeaderProps {
  activePage?: PageSectionId;
  onScheduleClick: () => void;
  onWhatsAppClick: (customText?: string) => void;
  onNavigate?: (href: string) => void;
  onAdminClick?: () => void;
  onClientPortalClick?: () => void;
}

interface SubSolutionItem {
  code: string;
  label: string;
  sublabel: string;
  href: string;
  badge?: string;
}

export const SOLUCIONES_SUBMENU: SubSolutionItem[] = [
  {
    code: '01',
    label: 'IA Services & Gemelos Digitales',
    sublabel: 'Agentes RAG, BI y Estructurador de Proyectos en Vivo',
    href: '#ia-services',
    badge: 'IA EN VIVO',
  },
  {
    code: '02',
    label: 'Proyectos de Base Tecnológica (EBTs)',
    sublabel: 'Ingeniería de producto full-stack y plataformas escalables',
    href: '#ebts',
  },
  {
    code: '03',
    label: 'Bioeconomía & Trazabilidad IoT',
    sublabel: 'Pasaportes digitales de lote, telemetría y casos reales',
    href: '#bioeconomia',
  },
  {
    code: '04',
    label: 'Dirección Ejecutiva de Proyectos (PMO)',
    sublabel: '14 años liderando proyectos con clientes · Hitos 40·40·20%',
    href: '#pmo-clientes',
  },
  {
    code: '05',
    label: 'Odoo Community ERP v18 & B2B2C',
    sublabel: ' Producción MRP, inventario multidepósito y comercio mayorista',
    href: '#odoo-v18',
  },
  {
    code: '06',
    label: 'Infraestructura Crítica Linux & Docker',
    sublabel: 'Soberanía de datos, redes WireGuard VPN y continuidad 24/7',
    href: '#linux-docker',
  },
];

interface FwaMenuItem {
  index: string;
  id: PageSectionId;
  label: string;
  href: string;
  category: string;
  description: string;
  metrics: string;
  featuredItems: string[];
  subLinks?: { label: string; href: string }[];
}

const FWA_MENU_SECTIONS: FwaMenuItem[] = [
  {
    index: '01',
    id: 'inicio',
    label: 'Inicio · Gemelo Digital',
    href: '#inicio',
    category: 'Experiencia en Video Full-Width · Bloques Personalizados & Buscador IA',
    description:
      'Portada principal diseñada por bloques personalizados: escenario audiovisual desde el canal de YouTube de Gastón Barea, buscador de soluciones con IA y recorrido ejecutivo.',
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
    label: 'Soluciones (IA Services & Verticales)',
    href: '#servicios',
    category: 'IA Services · Base Tecnológica · Bioeconomía · PMO · Odoo v18 · Linux',
    description:
      'Hub integral de soluciones de ingeniería y negocios: incluye IA Services y Estructurador de Proyectos en vivo, Bioeconomía con IoT, desarrollo de EBTs, dirección PMO, Odoo ERP v18 e infraestructura Linux.',
    metrics: '6 Verticales · Hitos 40·40·20',
    featuredItems: [
      '01. IA Services: Gemelos Digitales, Agentes RAG & Estructurador en Vivo',
      '02. Proyectos de Base Tecnológica (EBTs) & Plataformas Digitales',
      '03. Bioeconomía, Trazabilidad Digital de Lote & Telemetría IoT',
      '04. Dirección Ejecutiva de Proyectos con Clientes (PMO Externa)',
      '05. Odoo Community ERP v18 & E-Commerce B2B2C sin costo de licencias',
      '06. Infraestructura Crítica Linux, Docker & Ciberseguridad Industrial',
    ],
    subLinks: [
      { label: 'Ir a IA Services & Estructurador', href: '#ia-services' },
      { label: 'Ir a Bioeconomía & Casos IoT', href: '#bioeconomia' },
      { label: 'Ver las 6 Soluciones', href: '#servicios' },
    ],
  },
  {
    index: '03',
    id: 'proyectos',
    label: 'Proyectos (Realizados & En Producción)',
    href: '#proyectos',
    category: 'Portfolio Ejecutivo · Sistemas Activos 24/7 & Arquitecturas Entregadas',
    description:
      'Catálogo de proyectos realizados y sistemas actualmente en producción en IA Services, trazabilidad bioeconómica, plataformas de base tecnológica, Odoo ERP v18 e infraestructura crítica.',
    metrics: 'En Producción · Impacto Auditable',
    featuredItems: [
      'Sistemas en producción activa 24/7 con métricas reales de operación',
      'Proyectos realizados y transferidos bajo metodología 40·40·20%',
      'Filtro interactivo por estado operativo y vertical tecnológica',
    ],
  },
  {
    index: '04',
    id: 'trayectoria',
    label: 'Experience (30 Años Tech · 14 PMO)',
    href: '#experience',
    category: 'Respaldo Ejecutivo · 30 Años Sector Tecnológico · 14 Años Dirección PMO',
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
    index: '05',
    id: 'blog',
    label: 'Blog & Publicaciones',
    href: '#blog',
    category: 'Artículos Técnicos, Videos & Análisis Ejecutivo',
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
    index: '06',
    id: 'contacto',
    label: 'Contacto Ejecutivo',
    href: '#contacto',
    category: 'Canal Directo, Google Meet Pro & Protocolo NDA',
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
  onAdminClick,
  onClientPortalClick,
}) => {
  const [fwaMenuOpen, setFwaMenuOpen] = useState(false);
  const [solucionesDropdownOpen, setSolucionesDropdownOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [isScrolledPastVideo, setIsScrolledPastVideo] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close menus on ESC key or outside click for dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFwaMenuOpen(false);
        setSolucionesDropdownOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolucionesDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    setSolucionesDropdownOpen(false);
    if (onNavigate) {
      onNavigate(href);
    }
  };

  const activePreview = FWA_MENU_SECTIONS[hoveredIndex] || FWA_MENU_SECTIONS[0];

  // Dark glass header when on Inicio above the video stage or when FWA menu is open
  const isOverDarkStage = (activePage === 'inicio' && !isScrolledPastVideo) || fwaMenuOpen;

  const isSolucionesActive =
    activePage === 'servicios' || activePage === 'ia-services' || activePage === 'bioeconomia';

  return (
    <>
      {/* FULL-WIDTH TOP BAR (3-Zone Contract, frameless clean aesthetic) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-200 border-b ${
          isOverDarkStage
            ? 'bg-[#08080C]/85 backdrop-blur-xl text-white border-white/10'
            : 'bg-white/95 backdrop-blur-xl text-[#1D1D1F] border-black/[0.07]'
        }`}
      >
        <div className="w-full flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-8 lg:px-12 h-16 sm:h-[68px]">
          {/* Zone 1: Menu Trigger + Brand Wordmark */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSolucionesDropdownOpen(false);
                setFwaMenuOpen(!fwaMenuOpen);
              }}
              className={`px-3 sm:px-3.5 py-2 text-[13px] font-sans font-medium tracking-[-0.01em] transition-all inline-flex items-center gap-2 cursor-pointer border whitespace-nowrap shrink-0 ${
                fwaMenuOpen
                  ? 'bg-[#291B64] text-white border-[#291B64]'
                  : isOverDarkStage
                  ? 'bg-white/[0.06] text-white border-white/15 hover:bg-white/[0.12] hover:border-white/25'
                  : 'bg-[#F5F5F7] text-[#1D1D1F] border-black/[0.08] hover:bg-[#291B64] hover:text-white hover:border-[#291B64]'
              }`}
              aria-expanded={fwaMenuOpen}
              aria-label="Alternar menú principal de secciones"
            >
              {fwaMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>{fwaMenuOpen ? 'Cerrar' : 'Menú'}</span>
            </button>

            <a
              href="#inicio"
              onClick={(e) => handleNavClick(e, '#inicio')}
              className={`font-display text-[15px] sm:text-[17px] font-bold tracking-[-0.02em] whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity ${
                isOverDarkStage ? 'text-white' : 'text-[#1D1D1F]'
              }`}
            >
              GASTONBAREA.COM
            </a>
          </div>

          {/* Zone 2: Direct Multi-Page Section Navigation (Inicio | Soluciones ▾ | Proyectos | Experience | Blog | Contacto) */}
          <nav
            aria-label="Navegación principal"
            className={`hidden lg:flex items-center gap-5 xl:gap-8 text-[13.5px] xl:text-[14px] font-sans font-medium tracking-[-0.01em] ${
              isOverDarkStage ? 'text-neutral-300' : 'text-[#515154]'
            }`}
          >
            {/* 1. Inicio */}
            <a
              href="#inicio"
              onClick={(e) => handleNavClick(e, '#inicio')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activePage === 'inicio'
                  ? isOverDarkStage
                    ? 'text-white border-emerald-400 font-semibold'
                    : 'text-[#1D1D1F] border-[#291B64] font-semibold'
                  : isOverDarkStage
                  ? 'border-transparent hover:text-white'
                  : 'border-transparent hover:text-[#1D1D1F]'
              }`}
            >
              Inicio
            </a>

            {/* 2. Soluciones (with nested IA Services & all related engineering services) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setSolucionesDropdownOpen(true)}
              onMouseLeave={() => setSolucionesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setSolucionesDropdownOpen((prev) => !prev)}
                className={`py-1.5 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                  isSolucionesActive
                    ? isOverDarkStage
                      ? 'text-white border-emerald-400 font-semibold'
                      : 'text-[#1D1D1F] border-[#291B64] font-semibold'
                    : isOverDarkStage
                    ? 'border-transparent hover:text-white'
                    : 'border-transparent hover:text-[#1D1D1F]'
                }`}
                aria-expanded={solucionesDropdownOpen}
              >
                <span>Soluciones</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-75 transition-transform duration-150 ${
                    solucionesDropdownOpen ? 'rotate-180 opacity-100' : ''
                  }`}
                />
              </button>

              {solucionesDropdownOpen && (
                <div className="absolute left-0 top-full pt-3 w-[440px] z-50">
                  <div className="bg-[#0D0D12] text-white border border-white/15 shadow-2xl p-5 space-y-4 text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="text-xs font-sans font-semibold tracking-tight text-emerald-400">
                        Soluciones · IA Services & Ingeniería
                      </span>
                      <a
                        href="#servicios"
                        onClick={(e) => handleNavClick(e, '#servicios')}
                        className="text-xs font-sans font-medium text-neutral-300 hover:text-white inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Ver todas</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="divide-y divide-white/[0.08]">
                      {SOLUCIONES_SUBMENU.map((sub) => (
                        <a
                          key={sub.code}
                          href={sub.href}
                          onClick={(e) => handleNavClick(e, sub.href)}
                          className="group py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 hover:bg-white/[0.04] px-2.5 -mx-2.5 transition-colors"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-sans font-semibold text-emerald-400 tabular-nums">
                                {sub.code}.
                              </span>
                              <span className="font-display text-[14px] font-semibold tracking-[-0.01em] text-white group-hover:text-emerald-300 transition-colors truncate">
                                {sub.label}
                              </span>
                              {sub.badge && (
                                <span className="text-[10px] font-sans font-semibold px-2 py-0.5 bg-[#291B64] text-emerald-300">
                                  {sub.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-sans text-neutral-400 line-clamp-1 pl-5">
                              {sub.sublabel}
                            </p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white shrink-0 mt-0.5" />
                        </a>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <a
                        href="#ia-services"
                        onClick={(e) => handleNavClick(e, '#ia-services')}
                        className="px-3.5 py-2 bg-[#291B64] hover:bg-[#382586] text-white text-xs font-sans font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Abrir Estructurador IA</span>
                      </a>
                      <a
                        href="#servicios"
                        onClick={(e) => handleNavClick(e, '#servicios')}
                        className="text-xs font-sans font-medium text-neutral-300 hover:text-white inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Matriz de Soluciones</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Proyectos */}
            <a
              href="#proyectos"
              onClick={(e) => handleNavClick(e, '#proyectos')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activePage === 'proyectos'
                  ? isOverDarkStage
                    ? 'text-white border-emerald-400 font-semibold'
                    : 'text-[#1D1D1F] border-[#291B64] font-semibold'
                  : isOverDarkStage
                  ? 'border-transparent hover:text-white'
                  : 'border-transparent hover:text-[#1D1D1F]'
              }`}
            >
              Proyectos
            </a>

            {/* 4. Experience */}
            <a
              href="#experience"
              onClick={(e) => handleNavClick(e, '#experience')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activePage === 'trayectoria'
                  ? isOverDarkStage
                    ? 'text-white border-emerald-400 font-semibold'
                    : 'text-[#1D1D1F] border-[#291B64] font-semibold'
                  : isOverDarkStage
                  ? 'border-transparent hover:text-white'
                  : 'border-transparent hover:text-[#1D1D1F]'
              }`}
            >
              Experience
            </a>

            {/* 5. Blog */}
            <a
              href="#blog"
              onClick={(e) => handleNavClick(e, '#blog')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activePage === 'blog'
                  ? isOverDarkStage
                    ? 'text-white border-emerald-400 font-semibold'
                    : 'text-[#1D1D1F] border-[#291B64] font-semibold'
                  : isOverDarkStage
                  ? 'border-transparent hover:text-white'
                  : 'border-transparent hover:text-[#1D1D1F]'
              }`}
            >
              Blog
            </a>

            {/* 6. Contacto */}
            <a
              href="#contacto"
              onClick={(e) => handleNavClick(e, '#contacto')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activePage === 'contacto'
                  ? isOverDarkStage
                    ? 'text-white border-emerald-400 font-semibold'
                    : 'text-[#1D1D1F] border-[#291B64] font-semibold'
                  : isOverDarkStage
                  ? 'border-transparent hover:text-white'
                  : 'border-transparent hover:text-[#1D1D1F]'
              }`}
            >
              Contacto
            </a>
          </nav>

          {/* Zone 3: Client Portal + Admin Dashboard + Primary Action */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {onClientPortalClick && (
              <button
                type="button"
                onClick={() => {
                  setFwaMenuOpen(false);
                  setSolucionesDropdownOpen(false);
                  onClientPortalClick();
                }}
                className={`px-3 sm:px-3.5 py-2 text-[12.5px] sm:text-[13px] font-sans font-semibold tracking-[-0.01em] transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer border ${
                  activePage === 'portal-clientes'
                    ? 'bg-[#291B64] text-white border-[#291B64]'
                    : isOverDarkStage
                    ? 'bg-white/[0.06] text-white border-white/15 hover:bg-white/[0.14] hover:border-white/30'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] border-black/10 hover:border-[#291B64]/40 hover:text-[#291B64] hover:bg-[#291B64]/[0.05]'
                }`}
                aria-label="Ir al Portal Clientes"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden md:inline">Portal Clientes</span>
                <span className="md:hidden">Clientes</span>
              </button>
            )}

            {onAdminClick && (
              <button
                type="button"
                onClick={() => {
                  setFwaMenuOpen(false);
                  setSolucionesDropdownOpen(false);
                  onAdminClick();
                }}
                className={`px-2.5 sm:px-3 py-2 text-[12.5px] sm:text-[13px] font-sans font-semibold tracking-[-0.01em] transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer border ${
                  activePage === 'admin'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : isOverDarkStage
                    ? 'bg-white/[0.04] text-neutral-300 border-white/10 hover:text-white hover:bg-white/[0.12]'
                    : 'bg-white text-[#515154] border-black/10 hover:text-[#1D1D1F] hover:border-black/25'
                }`}
                title="Panel de Control & Dashboard CRM"
                aria-label="Ir al Panel de Control y Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden xl:inline">Dashboard</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setFwaMenuOpen(false);
                setSolucionesDropdownOpen(false);
                onScheduleClick();
              }}
              className="px-3.5 sm:px-4 py-2 text-[12.5px] sm:text-[13px] font-sans font-semibold tracking-[-0.01em] text-white bg-[#291B64] hover:bg-[#382586] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer border border-[#291B64]"
            >
              <Video className="w-3.5 h-3.5 hidden sm:inline shrink-0" />
              <span className="hidden sm:inline">Agendar Meet Pro</span>
              <span className="sm:hidden">Meet Pro</span>
            </button>
          </div>
        </div>
      </header>

      {/* THE FWA FULL-SCREEN ARCHITECTURAL MEGA-MENU OVERLAY */}
      {fwaMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 w-full bg-[#0A0A0C] text-white overflow-y-auto border-t border-white/10">
          <div className="w-full min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT COLUMN (7 COLS): FWA OVERSIZED EDITORIAL INDEX */}
            <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="divide-y divide-white/[0.07]">
                {FWA_MENU_SECTIONS.map((item, idx) => {
                  const isActive = hoveredIndex === idx;
                  const isCurrentPage =
                    activePage === item.id ||
                    (item.id === 'servicios' && isSolucionesActive);
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
                                · ACTIVO
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

              {/* Quick Sub-Navigation for Soluciones inside Mobile / FWA View */}
              <div className="px-4 sm:px-8 lg:px-12 py-5 bg-[#0D0D12] border-t border-white/10 space-y-3">
                <div className="text-[11px] font-mono text-emerald-400 font-bold">
                  ACCESO DIRECTO A SOLUCIONES & IA SERVICES:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {SOLUCIONES_SUBMENU.map((sub) => (
                    <a
                      key={sub.code}
                      href={sub.href}
                      onClick={(e) => handleNavClick(e, sub.href)}
                      className="px-3 py-1.5 bg-white/[0.06] hover:bg-[#291B64] text-xs font-mono text-neutral-200 hover:text-white transition-colors"
                    >
                      {sub.code}. {sub.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Index Strip */}
              <div className="px-4 sm:px-8 lg:px-12 py-5 bg-[#0E0E12] border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400">
                <div>
                  <span className="text-white font-bold">GASTONBAREA.COM</span>
                  <span> · GEMELO DIGITAL INTERACTIVO</span>
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

            {/* RIGHT COLUMN (5 COLS): CLEAN TYPOGRAPHIC PREVIEW */}
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
                    Contenido e ingeniería de esta sección:
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

                {activePreview.subLinks && activePreview.subLinks.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {activePreview.subLinks.map((sub) => (
                      <a
                        key={sub.href}
                        href={sub.href}
                        onClick={(e) => handleNavClick(e, sub.href)}
                        className="px-3.5 py-2 text-xs font-mono font-semibold text-emerald-300 bg-white/[0.06] hover:bg-white/[0.12] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <span>{sub.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="pt-4">
                  <a
                    href={activePreview.href}
                    onClick={(e) => handleNavClick(e, activePreview.href)}
                    className="px-6 py-3.5 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none inline-flex items-center gap-2 transition-colors"
                  >
                    <span>Abrir: {activePreview.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Direct Platform Utilities */}
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
                    href="#proyectos"
                    onClick={(e) => handleNavClick(e, '#proyectos')}
                    className="p-3.5 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-emerald-400" />
                      <span>Ver Proyectos</span>
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
                        <span>Portal Clientes (Login)</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {onAdminClick && (
                    <button
                      type="button"
                      onClick={() => {
                        setFwaMenuOpen(false);
                        onAdminClick();
                      }}
                      className="p-3.5 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                        <span>Panel de Control & CRM</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
