import React, { useState, useEffect } from 'react';
import {
  ArrowUp,
  Mail,
  MessageSquare,
  Linkedin,
  Github,
  Lock,
  UserCheck,
  Video,
  Youtube,
  Instagram,
  Twitter,
} from 'lucide-react';
import { SITE_CONFIG, SiteConfig } from '../data/siteConfig';

interface FooterProps {
  onNavigate?: (href: string) => void;
  onWhatsAppClick: () => void;
  onScheduleClick?: () => void;
  onAdminClick?: () => void;
  onClientPortalClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onWhatsAppClick,
  onScheduleClick,
  onAdminClick,
  onClientPortalClick,
}) => {
  const [liveConfig, setLiveConfig] = useState<SiteConfig>(SITE_CONFIG);

  useEffect(() => {
    fetch('/api/site-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.social) {
          setLiveConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <footer className="bg-white border-t border-black/[0.06] text-slate-600 text-xs">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-black/[0.06] text-left">
          {/* Brand & Identity (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <a
              href="#inicio"
              onClick={(e) => handleLinkClick(e, '#inicio')}
              className="inline-block font-display text-lg font-extrabold text-slate-900 tracking-wider hover:text-[#291B64] transition-colors"
            >
              GASTONBAREA.COM
            </a>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              Consultor y Desarrollador de Proyectos de Base Tecnológica, IA Services y Bioeconomía. 30 años de experiencia en el sector tecnológico-productivo y 14 años dirigiendo proyectos estratégicos con clientes.
            </p>
            <div className="text-xs font-mono text-slate-500">
              {liveConfig.location}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              {liveConfig.social.linkedin && (
                <a
                  href={liveConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#291B64] font-medium transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {liveConfig.social.github && (
                <>
                  <span aria-hidden="true">·</span>
                  <a
                    href={liveConfig.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#291B64] font-medium transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                </>
              )}
              {liveConfig.social.youtube && (
                <>
                  <span aria-hidden="true">·</span>
                  <a
                    href={liveConfig.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#291B64] font-medium transition-colors"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube</span>
                  </a>
                </>
              )}
              {liveConfig.social.twitter && (
                <>
                  <span aria-hidden="true">·</span>
                  <a
                    href={liveConfig.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#291B64] font-medium transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>X</span>
                  </a>
                </>
              )}
              {liveConfig.social.instagram && (
                <>
                  <span aria-hidden="true">·</span>
                  <a
                    href={liveConfig.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#291B64] font-medium transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Navigation Mirror: Multi-Page Section Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-mono font-semibold text-slate-900">
              Secciones & Soluciones
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a
                  href="#inicio"
                  onClick={(e) => handleLinkClick(e, '#inicio')}
                  className="hover:text-[#291B64] transition-colors"
                >
                  01. Inicio · Gemelo Digital & Bloques
                </a>
              </li>
              <li>
                <a
                  href="#servicios"
                  onClick={(e) => handleLinkClick(e, '#servicios')}
                  className="hover:text-[#291B64] transition-colors"
                >
                  02. Soluciones (IA Services, Bioeconomía & ERP)
                </a>
              </li>
              <li>
                <a
                  href="#ia-services"
                  onClick={(e) => handleLinkClick(e, '#ia-services')}
                  className="hover:text-[#291B64] transition-colors pl-3 text-slate-500"
                >
                  ↳ IA Services & Estructurador en Vivo
                </a>
              </li>
              <li>
                <a
                  href="#bioeconomia"
                  onClick={(e) => handleLinkClick(e, '#bioeconomia')}
                  className="hover:text-[#291B64] transition-colors pl-3 text-slate-500"
                >
                  ↳ Bioeconomía & Trazabilidad IoT
                </a>
              </li>
              <li>
                <a
                  href="#proyectos"
                  onClick={(e) => handleLinkClick(e, '#proyectos')}
                  className="hover:text-[#291B64] font-semibold text-slate-800 transition-colors"
                >
                  03. Proyectos (Realizados & En Producción)
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  onClick={(e) => handleLinkClick(e, '#experience')}
                  className="hover:text-[#291B64] transition-colors"
                >
                  04. Experience (30 Años Tech · 14 PMO)
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  onClick={(e) => handleLinkClick(e, '#blog')}
                  className="hover:text-[#291B64] font-semibold text-[#291B64] transition-colors"
                >
                  05. Blog & Publicaciones
                </a>
              </li>
              <li>
                <a
                  href="#contacto"
                  onClick={(e) => handleLinkClick(e, '#contacto')}
                  className="hover:text-[#291B64] transition-colors"
                >
                  06. Contacto Ejecutivo & NDA
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Action & Portals (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-mono font-semibold text-slate-900">
              Interacción & Gestión de Proyectos
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Acceso directo para agendar sesiones de diagnóstico, ingresar al Portal de Clientes o administrar la plataforma.
            </p>
            <div className="space-y-2.5 pt-1 font-mono text-xs">
              {onScheduleClick && (
                <button
                  type="button"
                  onClick={onScheduleClick}
                  className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white rounded-none font-semibold inline-flex items-center gap-2 text-left cursor-pointer transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Agendar Google Meet Pro (30 min)</span>
                </button>
              )}

              <a
                href={`mailto:${liveConfig.email}`}
                className="flex items-center gap-2 text-slate-700 hover:text-[#291B64] transition-colors pt-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{liveConfig.email}</span>
              </a>

              <button
                type="button"
                onClick={onWhatsAppClick}
                className="flex items-center gap-2 text-slate-700 hover:text-[#291B64] font-medium text-left cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Ejecutivo Directo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Bottom Copyright & Portal Access Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            © 2026 {liveConfig.name} · <strong className="text-slate-800">{liveConfig.domain}</strong> · Todos los derechos reservados.
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {onClientPortalClick && (
              <button
                type="button"
                onClick={onClientPortalClick}
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-950 font-semibold transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Portal Clientes</span>
              </button>
            )}

            {onAdminClick && (
              <button
                type="button"
                onClick={onAdminClick}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-950 font-semibold transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Panel de Control / CRM</span>
              </button>
            )}

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
            >
              <span>Subir</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
