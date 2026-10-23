import React from 'react';
import { ArrowUp, Mail, MessageSquare, Linkedin, Github, Calendar, Lock, UserCheck, Video, Youtube, Instagram, Twitter } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

interface FooterProps {
  onWhatsAppClick: () => void;
  onScheduleClick?: () => void;
  onAdminClick?: () => void;
  onClientPortalClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onWhatsAppClick, 
  onScheduleClick, 
  onAdminClick,
  onClientPortalClick
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#F4F4F4] border-t border-blue-900/10 text-blue-900/80 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-blue-900/10">
          
          {/* Brand info (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center font-mono font-medium text-xs text-white shadow-xs">
                GB
              </div>
              <span className="text-sm font-semibold text-blue-950 tracking-tight">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="text-xs text-blue-900/75 leading-relaxed max-w-sm font-normal">
              Consultoría tecnológica, arquitectura de software, Business Intelligence (BI) y administración de infraestructura Linux/Docker para organizaciones con altos requerimientos operativos.
            </p>
            <div className="text-[11px] font-mono text-blue-600 font-medium pt-1">
              {SITE_CONFIG.location}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <a
                href={SITE_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-900/80 hover:text-blue-600 font-medium transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn</span>
              </a>
              <span className="text-blue-300">·</span>
              <a
                href={SITE_CONFIG.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-900/80 hover:text-blue-600 font-medium transition-colors"
                title="GitHub"
              >
                <Github className="w-3.5 h-3.5 text-blue-800" />
                <span>GitHub</span>
              </a>
              {SITE_CONFIG.social.youtube && (
                <>
                  <span className="text-blue-300">·</span>
                  <a
                    href={SITE_CONFIG.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-900/80 hover:text-rose-600 font-medium transition-colors"
                    title="Canal de YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5 text-rose-600" />
                    <span>YouTube</span>
                  </a>
                </>
              )}
              {SITE_CONFIG.social.twitter && (
                <>
                  <span className="text-blue-300">·</span>
                  <a
                    href={SITE_CONFIG.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-900/80 hover:text-slate-900 font-medium transition-colors"
                    title="Twitter / X"
                  >
                    <Twitter className="w-3.5 h-3.5 text-slate-700" />
                    <span>X</span>
                  </a>
                </>
              )}
              {SITE_CONFIG.social.instagram && (
                <>
                  <span className="text-blue-300">·</span>
                  <a
                    href={SITE_CONFIG.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-900/80 hover:text-pink-600 font-medium transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    <span>Instagram</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-blue-950 font-bold">
              Navegación
            </div>
            <ul className="space-y-2 text-xs font-medium text-blue-900/80">
              <li>
                <a href="#diagnostico-ia" className="hover:text-blue-600 transition-colors">Diagnóstico IA</a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-blue-600 transition-colors">Servicios</a>
              </li>
              <li>
                <a href="#topologia" className="hover:text-blue-600 transition-colors">Topología</a>
              </li>
              <li>
                <a href="#tech-specs" className="hover:text-blue-600 transition-colors">Tech Specs</a>
              </li>
              <li>
                <a href="#metodologia" className="hover:text-blue-600 transition-colors">Metodología</a>
              </li>
              <li>
                <a href="#casos" className="hover:text-blue-600 transition-colors">Casos de Estudio</a>
              </li>
              <li>
                <a href="#configurador" className="hover:text-blue-600 transition-colors">Configurador</a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-blue-600 transition-colors">Contacto</a>
              </li>
            </ul>
          </div>

          {/* Contact & Booking (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-blue-950 font-bold">
              Agenda & Contacto Directo
            </div>
            <p className="text-xs text-blue-900/75 leading-relaxed font-normal">
              Atención técnica directa para directores, gerentes de sistemas y líderes de proyectos.
            </p>

            <div className="space-y-2.5 pt-1 font-mono text-xs">
              {onScheduleClick && (
                <button
                  type="button"
                  onClick={onScheduleClick}
                  className="flex items-center gap-2 text-blue-700 hover:text-blue-950 transition-colors font-medium text-left cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  <span className="underline underline-offset-2">Agendar Google Meet Pro (30 min)</span>
                </button>
              )}

              <a 
                href={`mailto:${SITE_CONFIG.email}`} 
                className="flex items-center gap-2 text-blue-900/80 hover:text-blue-600 transition-colors font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>{SITE_CONFIG.email}</span>
              </a>

              <button
                type="button"
                onClick={onWhatsAppClick}
                className="flex items-center gap-2 text-[#25D366] hover:text-[#20ba59] transition-colors font-semibold text-left cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-[#25D366]" />
                <span>Canal de WhatsApp</span>
              </button>

              <a
                href={SITE_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-900/80 hover:text-blue-600 transition-colors font-medium"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                <span>LinkedIn Profesional</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-blue-900/60 font-mono">
          <div>
            © 2026 {SITE_CONFIG.name}. Dominio registrado: <strong className="text-blue-950 font-semibold">{SITE_CONFIG.domain}</strong>
          </div>

          <div className="flex items-center gap-4">
            {onClientPortalClick && (
              <button
                type="button"
                onClick={onClientPortalClick}
                className="flex items-center gap-1.5 text-blue-900/80 hover:text-blue-950 font-semibold transition-colors py-1 cursor-pointer"
                title="Acceso al Portal del Cliente Verificado"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Portal del Cliente</span>
              </button>
            )}

            {onAdminClick && (
              <button
                type="button"
                onClick={onAdminClick}
                className="flex items-center gap-1.5 text-slate-600 hover:text-blue-700 font-semibold transition-colors py-1 cursor-pointer"
                title="Acceso al CRM Operativo & Backend de Control"
              >
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>CRM Operativo & Control</span>
              </button>
            )}

            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-blue-900/70 hover:text-blue-950 transition-colors py-1 font-medium cursor-pointer"
            >
              <span>Volver arriba</span>
              <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
