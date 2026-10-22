import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Linkedin,
  Github,
  Calendar,
  Sparkles,
  TrendingUp,
  FolderGit2,
  Cpu,
  ChevronDown,
  Layers,
  Brain,
  Sliders,
  Server,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Check,
  ShoppingCart,
  UserCheck
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

interface HeaderProps {
  onScheduleClick: () => void;
  onWhatsAppClick: (customText?: string) => void;
  onNavigate?: (href: string) => void;
  onAdminClick?: () => void;
  onClientPortalClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onScheduleClick, 
  onWhatsAppClick, 
  onNavigate, 
  onAdminClick,
  onClientPortalClick
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    if (onNavigate) {
      onNavigate(href);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const serviceAndTechItems = [
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
    <header
      className={`fixed top-2.5 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none transition-all duration-300 ${
        isScrolled
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4'
      }`}
    >
      {/* Floating Island / Floating Pill Container */}
      <div
        className="relative max-w-6xl mx-auto pointer-events-auto rounded-full transition-all duration-300 px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-2xl shadow-xl shadow-blue-950/10 border border-white/80"
      >
        {/* Left Brand Identity */}
        <div className="flex items-center shrink-0 z-10">
          <a
            href="#"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-blue-950 hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-900 flex items-center justify-center font-mono font-bold text-xs text-white shadow-xs">
              GB
            </span>
            <div className="flex flex-col text-left">
              <span className="text-blue-950 font-bold leading-tight text-xs sm:text-sm">
                Gastón Barea
              </span>
              <span className="text-[9px] font-mono text-blue-600 font-medium tracking-wide hidden sm:inline">
                Tech Architecture
              </span>
            </div>
          </a>
        </div>

        {/* Floating Desktop Navigation Links (Strictly Centered) */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 absolute left-1/2 -translate-x-1/2 z-20 text-[13px] font-medium text-blue-900/85">
          {/* BOTÓN INNOVACIÓN DESTACADO (3 Pilares) */}
          <a
            href="#innovacion"
            onClick={(e) => handleNavClick(e, '#innovacion')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-700 bg-blue-100/90 hover:bg-blue-600 hover:text-white border border-blue-200/80 shadow-2xs transition-all active:scale-95"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" />
            <span>INNOVACIÓN</span>
          </a>

          {/* PROJECT MANAGER */}
          <a
            href="#project-manager"
            onClick={(e) => handleNavClick(e, '#project-manager')}
            className="px-3 py-1.5 rounded-full text-blue-950 hover:text-indigo-600 hover:bg-indigo-50/80 font-semibold tracking-wide transition-all inline-flex items-center gap-1.5"
            title="Project Management, Arquitectura & Dirección de Proyectos"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>PROJECT MANAGER</span>
          </a>

          {/* SERVICIOS & PARTE TÉCNICA UNIFICADOS (Dropdown) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              className={`px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5 font-semibold text-blue-950 hover:text-blue-600 hover:bg-blue-50/80 cursor-pointer ${
                servicesDropdownOpen ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>SERVICIOS</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-blue-500 transition-transform duration-200 ${
                  servicesDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Submenu Dropdown Card */}
            {servicesDropdownOpen && (
              <div className="absolute top-full left-0 mt-3 w-88 bg-white/98 backdrop-blur-2xl rounded-2xl border border-blue-900/15 shadow-2xl shadow-blue-950/15 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold">
                    Servicios & Arquitectura Técnica
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3 h-3" /> NDA & Seguridad
                  </span>
                </div>
                <div className="space-y-1">
                  {serviceAndTechItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/80 transition-colors group ${
                          (item as any).isFeatured ? 'bg-indigo-50/60 border border-indigo-200/60' : ''
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          (item as any).isFeatured
                            ? 'bg-indigo-600 text-white'
                            : 'bg-blue-100/70 text-blue-700 group-hover:bg-blue-600 group-hover:text-white'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            <span>{item.label}</span>
                            {(item as any).isFeatured && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-md">
                                Destacado
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
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

          {/* E-COMMERCE B2B2C DIRECTO */}
          <a
            href="#ecommerce-b2b2c"
            onClick={(e) => handleNavClick(e, '#ecommerce-b2b2c')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 hover:text-indigo-950 hover:bg-indigo-50 border border-indigo-200/80 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
            <span>E-COMMERCE B2B2C</span>
          </a>

          {/* ODOO DIRECTO */}
          <a
            href="#odoo"
            onClick={(e) => handleNavClick(e, '#odoo')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 border border-indigo-200/80 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>ODOO ERP</span>
          </a>

          {/* BLOG */}
          <a
            href="#blog"
            onClick={(e) => handleNavClick(e, '#blog')}
            className="px-3 py-1.5 rounded-full text-blue-950 hover:text-blue-600 hover:bg-blue-50/80 font-semibold tracking-wide transition-all inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>BLOG</span>
          </a>

          {/* CONTACTO */}
          <a
            href="#contacto"
            onClick={(e) => handleNavClick(e, '#contacto')}
            className="px-3 py-1.5 rounded-full text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 transition-all"
          >
            Contacto
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {/* BOTÓN LINKEDIN DESTACADO OFICIAL (#0A66C2) */}
          <a
            href={SITE_CONFIG.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] active:scale-95 rounded-full transition-all flex items-center gap-1.5 shadow-xs shadow-[#0A66C2]/25 cursor-pointer"
            title="LinkedIn Profesional de Gastón Barea"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-3.5 h-3.5 fill-white" />
            <span className="hidden md:inline">LinkedIn</span>
          </a>

          {/* GitHub */}
          <a
            href={SITE_CONFIG.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors hidden xl:flex"
            title="GitHub de Gastón Barea (@xpatagonia)"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* CRM Operativo Shortcut */}
          {onAdminClick && (
            <button
              onClick={onAdminClick}
              type="button"
              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 rounded-full transition-colors hidden xl:flex cursor-pointer"
              title="CRM Operativo & Presupuestos"
              aria-label="CRM Operativo"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </button>
          )}

          {/* Portal Clientes Verificado */}
          {onClientPortalClick && (
            <button
              onClick={onClientPortalClick}
              type="button"
              className="px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 hover:text-blue-950 border border-blue-200/80 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Acceso al Portal de Clientes (Proyectos, Consultas & Soporte)"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Portal Clientes</span>
            </button>
          )}

          {/* BOTÓN WHATSAPP VERDE CARACTERÍSTICO */}
          <button
            onClick={() => onWhatsAppClick()}
            type="button"
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 rounded-full transition-all whitespace-nowrap shadow-sm shadow-[#25D366]/35 flex items-center gap-1.5 cursor-pointer"
            title="Abrir WhatsApp directo"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* AGENDAR */}
          <button
            onClick={onScheduleClick}
            type="button"
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-full transition-all whitespace-nowrap shadow-sm shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agendar (30m)</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Mobile LinkedIn icon */}
          <a
            href={SITE_CONFIG.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-white bg-[#0A66C2] rounded-full flex items-center justify-center cursor-pointer shadow-xs"
            title="LinkedIn"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-3.5 h-3.5 fill-white" />
          </a>

          <button
            onClick={() => onWhatsAppClick()}
            type="button"
            className="px-2.5 py-1 text-xs font-bold text-white bg-[#25D366] rounded-full flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-3 h-3 fill-white" />
            <span>WA</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="p-1.5 text-blue-950 hover:bg-blue-100/60 rounded-full transition-colors cursor-pointer"
            aria-label="Menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-6xl mx-auto bg-white/98 backdrop-blur-2xl rounded-3xl border border-blue-900/15 shadow-2xl p-5 space-y-3 text-left animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
          <div className="space-y-1">
            <a
              href="#innovacion"
              onClick={(e) => handleNavClick(e, '#innovacion')}
              className="flex items-center gap-2 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm"
            >
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>INNOVACIÓN (3 Pilares)</span>
            </a>

            <a
              href="#project-manager"
              onClick={(e) => handleNavClick(e, '#project-manager')}
              className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-indigo-50 text-blue-950 font-bold text-sm"
            >
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              <span>PROJECT MANAGER & DIRECCIÓN</span>
            </a>

            <a
              href="#odoo"
              onClick={(e) => handleNavClick(e, '#odoo')}
              className="flex items-center gap-2 py-2 px-3 rounded-xl bg-indigo-50/80 text-indigo-900 font-bold text-sm border border-indigo-200/60"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>ODOO COMMUNITY ERP</span>
            </a>

            <a
              href="#ecommerce-b2b2c"
              onClick={(e) => handleNavClick(e, '#ecommerce-b2b2c')}
              className="flex items-center gap-2 py-2 px-3 rounded-xl bg-purple-50 text-purple-900 font-bold text-sm border border-purple-200/60"
            >
              <ShoppingCart className="w-4 h-4 text-purple-600" />
              <span>E-COMMERCE B2B2C</span>
            </a>

            <a
              href="#blog"
              onClick={(e) => handleNavClick(e, '#blog')}
              className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-blue-50 text-blue-950 font-bold text-sm"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>BLOG & ARTÍCULOS</span>
            </a>

            {/* Mobile SERVICIOS & PARTE TÉCNICA */}
            <div className="pt-2 pb-1">
              <span className="text-[10px] font-mono tracking-wider uppercase text-blue-600 font-bold px-3 flex items-center justify-between">
                <span>SERVICIOS</span>
                <span className="text-emerald-600 text-[9px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> NDA
                </span>
              </span>
              <div className="mt-1 space-y-1 pl-2">
                {serviceAndTechItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-800 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="pt-1 space-y-1 border-t border-slate-100">
              <a
                href="#contacto"
                onClick={(e) => handleNavClick(e, '#contacto')}
                className="block py-1.5 px-3 text-sm font-semibold text-slate-800 hover:text-blue-600"
              >
                Contacto Directo
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-col gap-2">
              <a
                href={SITE_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Linkedin className="w-3.5 h-3.5 fill-white" />
                <span>Ver Perfil en LinkedIn</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onWhatsAppClick();
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-[#25D366]/30 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp Directo</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onScheduleClick();
                }}
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/20"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Agendar Consulta Técnica (30 min)</span>
              </button>

              {onClientPortalClick && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onClientPortalClick();
                  }}
                  className="w-full py-2.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-blue-200"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Portal Clientes (Proyectos & Soporte)</span>
                </button>
              )}

              {onAdminClick && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onAdminClick();
                  }}
                  className="w-full py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CRM Operativo & Presupuestos</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
