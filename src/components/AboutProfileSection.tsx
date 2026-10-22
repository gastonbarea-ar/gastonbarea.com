import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Check, 
  ArrowRight,
  Linkedin,
  Github,
  CalendarCheck,
  User,
  CheckCircle2
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';
import { OSWindowFrame } from './common/OSWindowFrame';

interface AboutProfileSectionProps {
  onScheduleClick: () => void;
}

export const AboutProfileSection: React.FC<AboutProfileSectionProps> = ({ onScheduleClick }) => {
  return (
    <section id="perfil" className="py-20 md:py-28 bg-[#F4F4F4] relative border-b border-blue-900/10 scroll-mt-20">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs text-xs font-mono font-semibold">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>PERFIL PROFESIONAL</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Ingeniería pragmática orientada a la economía real.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            La tecnología no debe ser un laberinto de costos ni una fuente de fragilidad operativa. Más de una década diseñando arquitecturas sólidas con retorno medible.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: PROFILE CONSOLE */}
        <OSWindowFrame
          accentTheme="emerald"
          processName="sys/identity/gaston-barea-profile.id"
          windowTitle="PERFIL PROFESIONAL · GASTÓN BAREA (LEAD ARCHITECT & CONSULTANT)"
          securityBadge="IDENTIDAD VERIFICADA"
          statusBadge="DISPONIBILIDAD INMEDIATA Q4"
          portBadge="TLS 1.3 · GPG SIGNED"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'ARCHITECT', value: 'GASTÓN BAREA', highlight: true },
            { label: 'EXPERIENCE', value: '10+ AÑOS' },
            { label: 'LOCATION', value: 'PATAGONIA & GLOBAL' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Bio (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  <p>
                    Soy <strong className="text-white font-bold">Gastón Barea</strong>, consultor tecnológico y arquitecto de sistemas. A lo largo de más de diez años de trayectoria profesional, he diseñado soluciones de software, modernizado centros de datos con Linux y desplegado sistemas de Business Intelligence para empresas corporativas, cooperativas de servicios públicos y organizaciones en constante evolución.
                  </p>
                  <p>
                    Mi premisa es simple: la tecnología no debe ser un laberinto de costos ni una fuente de fragilidad operativa. Hablo tanto el lenguaje de la estrategia directiva como el de la terminal de servidores, garantizando arquitecturas sólidas, escalables y con un retorno tangible sobre la inversión.
                  </p>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-sm">
                    <div className="text-sm font-bold text-white mb-1">
                      Infraestructura & Contenedores
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      Servidores Linux Ubuntu, Docker Compose, hardening y continuidad operativa 24/7.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-sm">
                    <div className="text-sm font-bold text-white mb-1">
                      Business Intelligence & BI
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      Data Warehouses en PostgreSQL y dashboards ejecutivos en tiempo real.
                    </p>
                  </div>
                </div>

                {/* Principles */}
                <div className="pt-5 border-t border-white/10 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-sky-300 font-semibold">
                    Principios Rectores:
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white font-bold">Visión Sistémica:</strong> Entendimiento del modelo de negocio detrás de cada línea de código.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white font-bold">Enfoque Pragmático:</strong> Soluciones robustas y directas al grano, sin modas pasajeras.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white font-bold">Soberanía de Datos:</strong> Código abierto y estándares auditables sin vendor lock-in.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Identity Card (5 cols) */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-8 shadow-xl relative space-y-6">
                  
                  <div className="flex items-center gap-4 pb-5 border-b border-white/10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center font-mono font-bold text-lg shadow-md border border-white/20">
                      GB
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{SITE_CONFIG.name}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs font-mono text-sky-300 font-semibold">{SITE_CONFIG.domain}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium font-mono">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>Chubut, Argentina</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300 font-mono">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-slate-400">Rol Principal:</span>
                      <span className="text-white font-bold">{SITE_CONFIG.role}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-slate-400">Especialidad:</span>
                      <span className="text-white font-bold">Linux, Docker, PostgreSQL, BI</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-slate-400">Modalidad:</span>
                      <span className="text-white font-bold">Remota Global</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Disponibilidad:</span>
                      <span className="text-emerald-400 font-bold">● Abierto a proyectos</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <button
                      onClick={onScheduleClick}
                      type="button"
                      className="w-full py-3 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] rounded-full transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer font-mono"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>Agendar Consulta Técnica (30 min)</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={SITE_CONFIG.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 text-xs font-semibold text-white bg-[#0077b5] hover:bg-[#006396] rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-blue-900/30"
                      >
                        <Linkedin className="w-3.5 h-3.5 fill-current" />
                        <span>LinkedIn</span>
                      </a>

                      <a
                        href={SITE_CONFIG.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub</span>
                      </a>
                    </div>

                    <div className="text-center pt-1">
                      <a
                        href={`mailto:${SITE_CONFIG.email}`}
                        className="text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors font-medium"
                      >
                        {SITE_CONFIG.email}
                      </a>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </OSWindowFrame>

      </div>
    </section>
  );
};
