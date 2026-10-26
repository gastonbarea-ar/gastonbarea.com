import React from 'react';
import { ArrowRight, Linkedin, Github, Video, UserCheck } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

interface AboutProfileSectionProps {
  onScheduleClick: () => void;
  onClientPortalClick?: () => void;
}

export const AboutProfileSection: React.FC<AboutProfileSectionProps> = ({
  onScheduleClick,
  onClientPortalClick,
}) => {
  const milestones = [
    {
      period: '1996 – 2012',
      title: 'Cimientos en el Sector Tecnológico-Productivo e Infraestructura',
      description:
        'Inicio y consolidación en ingeniería de sistemas, redes industriales, servidores Linux y automatización de procesos operativos para empresas productivas, cooperativas y organismos regionales.',
    },
    {
      period: '2012 – 2021',
      title: 'Dirección Ejecutiva de Proyectos con Clientes & Sistemas ERP',
      description:
        'Liderazgo directo de proyectos de transformación digital (PMO), implementaciones de software de gestión empresarial (ERP), bases de datos PostgreSQL de misión crítica y comercio electrónico.',
    },
    {
      period: '2021 – 2026',
      title: 'Convergencia de Base Tecnológica, Inteligencia Artificial & Bioeconomía',
      description:
        'Desarrollo de Empresas de Base Tecnológica (EBTs), proyectos basados en bioeconomía y economía circular, plataformas B2B2C con Odoo v18 y despliegue de Gemelos Digitales corporativos.',
    },
  ];

  return (
    <section id="trayectoria" className="w-full bg-white scroll-mt-16">
      {/* Top Banner Block */}
      <div className="w-full py-16 md:py-20 bg-[#F6F6F9]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-3 text-left">
          <div className="text-xs font-mono text-[#291B64] font-semibold">
            TRAYECTORIA PROFESIONAL · GASTÓN BAREA · PATAGONIA & GLOBAL
          </div>
          <h1
            className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-[1.08] max-w-4xl"
            style={{ textWrap: 'balance' }}
          >
            30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes.
          </h1>
        </div>
      </div>

      {/* Main Content Split (Frameless) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 md:py-20 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (7 cols): Trajectory & Chronology */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
              <p>
                Soy <strong className="font-semibold text-slate-900">Gastón Barea</strong>, consultor y desarrollador de proyectos de base tecnológica y de bioeconomía. Durante tres décadas he trabajado en la intersección donde la ingeniería de software y la tecnología se encuentran con la economía real y la producción sostenible.
              </p>
              <p>
                A lo largo de los últimos <strong className="font-semibold text-slate-900">14 años dedicados a la dirección de proyectos con clientes</strong>, he comprobado que el éxito de una iniciativa tecnológica o bioeconómica depende tanto de la solidez arquitectónica como de una dirección ejecutiva rigurosa que cuide el presupuesto, los tiempos y la adopción real por parte de los equipos.
              </p>
              <p>
                Por eso diseñé <strong className="font-semibold text-slate-900">gastonbarea.com</strong> como mi <strong className="font-semibold text-slate-900">Gemelo Digital</strong>: para que cada cliente pueda interactuar en cualquier momento con mi criterio técnico, estructurar su proyecto y dar seguimiento transparente a cada hito.
              </p>
            </div>

            {/* 3-Decade Timeline (Open Hairlines, Zero Nested Boxes) */}
            <div className="space-y-4">
              <div className="text-xs font-mono text-[#291B64] font-semibold">
                EVOLUCIÓN Y RESPALDO EJECUTIVO (1996–2026)
              </div>
              <div className="divide-y divide-black/[0.08] border-t border-b border-black/[0.08]">
                {milestones.map((item, idx) => (
                  <div key={idx} className="py-6 space-y-1.5">
                    <div className="text-xs font-mono font-bold text-[#291B64] tabular-nums">
                      {item.period}
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Clean Obsidian Executive Card */}
          <div className="lg:col-span-5">
            <div className="rounded-none bg-[#0D0D12] text-white p-8 sm:p-10 space-y-6">
              <div className="pb-5 border-b border-white/10 space-y-1">
                <div className="text-xs font-mono text-emerald-400">
                  FICHA EJECUTIVA DEL CONSULTOR
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  {SITE_CONFIG.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  {SITE_CONFIG.role}
                </p>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                  <span className="text-slate-400">Experiencia Sectorial:</span>
                  <span className="text-white font-semibold tabular-nums">30 Años (1996–2026)</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                  <span className="text-slate-400">Dirección de Proyectos:</span>
                  <span className="text-white font-semibold tabular-nums">14 Años (PMO Clientes)</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                  <span className="text-slate-400">Verticales Clave:</span>
                  <span className="text-emerald-400 font-semibold">Base Tecnológica & Bioeconomía</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                  <span className="text-slate-400">Stack de Ingeniería:</span>
                  <span className="text-white font-semibold">Odoo · React · Linux · IA · IoT</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Base Operativa:</span>
                  <span className="text-white font-semibold">Chubut, Patagonia · Global</span>
                </div>
              </div>

              <div className="p-5 bg-white/[0.05] space-y-2">
                <div className="text-xs font-mono text-emerald-400">
                  Metodología de Dirección por Hitos
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Todos los proyectos se estructuran bajo tres etapas auditables en el Portal de Clientes: <strong className="text-white">40% Inicio & Arquitectura</strong>, <strong className="text-white">40% Entrega en Servidor Staging</strong> para pruebas reales y <strong className="text-white">20% Salida a Producción</strong>.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={onScheduleClick}
                  className="w-full py-3.5 px-4 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-emerald-300" />
                  <span>Agendar Sesión Google Meet Pro (30m)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {onClientPortalClick && (
                  <button
                    type="button"
                    onClick={onClientPortalClick}
                    className="w-full py-3 px-4 text-xs font-semibold text-white bg-white/[0.07] hover:bg-white/[0.12] rounded-none transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Ingresar al Portal de Clientes</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href={SITE_CONFIG.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 text-xs font-semibold text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-none transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={SITE_CONFIG.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 text-xs font-semibold text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-none transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
