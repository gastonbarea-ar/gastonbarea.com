import React, { useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  X, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Lock,
  Shield,
  Layers,
  FileCheck,
  CheckCircle2,
  ShoppingCart
} from 'lucide-react';
import { SERVICES_DATA, ServiceItem } from '../data/content';
import { OSWindowFrame } from './common/OSWindowFrame';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
  onRequestAudit: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  onRequestAudit,
}) => {
  const [selectedServiceModal, setSelectedServiceModal] = useState<ServiceItem | null>(null);

  return (
    <section id="servicios" className="py-20 md:py-28 bg-[#F4F4F4] relative border-b border-blue-900/10">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-xs text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>CAPACIDADES, SERVICIOS & CONFIDENCIALIDAD</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Arquitectura de software diseñada para resistir el crecimiento del negocio.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Sin plantillas prefabricadas ni dependencias artificiales. Soluciones concebidas para optimizar el rendimiento, proteger los datos y garantizar continuidad operativa bajo secreto profesional.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: SERVICES & SECURITY SUITE */}
        <OSWindowFrame
          accentTheme="indigo"
          processName="sys/security/services-and-nda.conf"
          windowTitle="CAPACIDADES, SERVICIOS & PROTOCOLO DE CONFIDENCIALIDAD"
          securityBadge="NDA CONTRACTUAL VINCULANTE"
          statusBadge="SLAs 99.9% UPTIME"
          portBadge="PORT 443 · TLS 1.3"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'NDA', value: 'ESTRICTO VINCULANTE', highlight: true },
            { label: 'PROPIEDAD', value: '100% CLIENTE' },
            { label: 'SLA', value: '99.9% UPTIME' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 space-y-8 text-left">
            
            {/* OS Bento Cards (2x2 grid + Full Width B2B2C Flagship Layer) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SERVICES_DATA.map((service) => {
                const isEcommerce = service.id === 'ecommerce-b2b2c';
                return (
                  <div
                    key={service.id}
                    id={isEcommerce ? 'ecommerce-b2b2c-card' : undefined}
                    className={`rounded-3xl p-6 sm:p-9 flex flex-col justify-between group transition-all shadow-xl ${
                      isEcommerce
                        ? 'md:col-span-2 bg-gradient-to-br from-slate-900/95 via-indigo-950/40 to-slate-900/95 border-2 border-indigo-500/50 hover:border-indigo-400/80 scroll-mt-28 shadow-indigo-950/40'
                        : 'bg-slate-900/80 border border-white/10 hover:border-blue-400/40 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-5 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-mono font-bold text-sky-400 group-hover:text-sky-300 transition-colors">
                            {service.number}
                          </span>
                          {isEcommerce && (
                            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/40 flex items-center gap-1.5">
                              <ShoppingCart className="w-3 h-3 text-indigo-400" />
                              <span>NUEVA CAPA TRANSACCIONAL B2B2C</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>NDA & Zero-Trust</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-5">
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {service.title}
                        </h3>
                        <p className="text-xs font-mono text-sky-300 font-semibold mt-1">
                          {service.subtitle}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed font-normal">
                          {service.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-5 border-t border-white/10">
                        <div className="text-xs font-mono text-sky-300 uppercase tracking-wider mb-2.5 font-semibold">
                          Entregables Principales:
                        </div>
                        <ul className={isEcommerce ? 'grid grid-cols-1 md:grid-cols-3 gap-3' : 'space-y-2'}>
                          {service.deliverables.map((item, idx) => (
                            <li
                              key={idx}
                              className={`flex items-start gap-2.5 text-xs text-slate-200 font-medium ${
                                isEcommerce ? 'p-3 rounded-xl bg-slate-950/70 border border-indigo-500/20' : ''
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 pt-4 border-t border-white/10">
                        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                          Tecnologías:
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {service.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-mono text-sky-300 bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-400/30 font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Confidentiality Commitment Pill */}
                      <div className="mt-5 p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                        <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>Código 100% de tu empresa. Cero dependencia. Servidores aislados y datos bajo estricta confidencialidad.</span>
                      </div>
                    </div>

                  <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setSelectedServiceModal(service)}
                        type="button"
                        className="text-xs font-semibold text-sky-300 hover:text-white transition-colors inline-flex items-center gap-1 group/btn cursor-pointer font-mono"
                      >
                        <span>Ver alcance completo</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>

                      {isEcommerce && (
                        <a
                          href="#ecommerce-b2b2c"
                          className="text-[11px] font-semibold text-indigo-300 hover:text-white transition-colors inline-flex items-center gap-1.5 font-mono px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40"
                        >
                          <ShoppingCart className="w-3 h-3 text-indigo-400" />
                          <span>Ir al Simulador & Arquitectura B2B2C</span>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectService(service.title)}
                      type="button"
                      className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] rounded-full transition-all inline-flex items-center gap-1.5 shadow-md shadow-blue-600/25 cursor-pointer"
                    >
                      <span>Solicitar Servicio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            </div>

            {/* ENTORNO DE SEGURIDAD BLINDADA & CONFIDENCIALIDAD EXTREMA (ZERO-TRUST & NDA) */}
            <div className="mt-8 rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-10 shadow-xl">
              <div className="max-w-3xl mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-mono font-bold uppercase mb-2 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>PROTOCOLO DE CONFIDENCIALIDAD & PROTECCIÓN DE ACTIVOS</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Seguridad de Nivel Financiero & Secreto Profesional en Cada Proyecto.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-normal">
                  La protección de tu propiedad intelectual, datos de clientes y secretos comerciales es innegociable. Todo proyecto opera bajo estándares de confidencialidad rigurosos desde el primer contacto.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase text-sky-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>NDA Contractual Estricto</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Firma de Acuerdo de No Divulgación (NDA) vinculante previo a revisar cualquier repositorio, base de datos o lógica de negocio.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase text-sky-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Zero Vendor Lock-In</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    El 100% del código fuente, licencias y accesos a servidores quedan a nombre de tu empresa. Cero dependencia artificial.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase text-sky-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Aislamiento de Redes (VPC/VPN)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Bases de datos privadas accesibles solo por túneles VPN cifrados (WireGuard), con políticas de Row Level Security (RLS).
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase text-sky-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Trazabilidad & Pentesting</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Auditorías periódicas de vulnerabilidades, escaneo estático de dependencias y registros de auditoría inviolables.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Diagnostic Callout */}
            <div className="mt-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 text-white p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="text-[11px] font-mono text-amber-300 uppercase tracking-widest flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                    <span>AUDITORÍA & CONTINGENCIA CRÍTICA</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    ¿Tenés una infraestructura crítica con fallas recurrentes o lentitud?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    Realizo diagnósticos técnicos de emergencia para servidores caídos, cuellos de botella en bases de datos PostgreSQL o planes de migración sin interrupción operativa.
                  </p>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <button
                    onClick={onRequestAudit}
                    type="button"
                    className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-full transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-md cursor-pointer active:scale-95"
                  >
                    <span>Solicitar Diagnóstico</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </OSWindowFrame>

      </div>

      {/* Scope Modal */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto text-left text-white">
            
            <button
              onClick={() => setSelectedServiceModal(null)}
              type="button"
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono text-sky-400 uppercase tracking-widest font-semibold">
                  Servicio {selectedServiceModal.number}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">
                  {selectedServiceModal.title}
                </h3>
                <p className="text-sm font-mono text-sky-300 mt-1 font-medium">
                  {selectedServiceModal.subtitle}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedServiceModal.fullScope.overview}
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-sky-300 mb-3 font-semibold">
                  Objetivos Principales:
                </h4>
                <ul className="space-y-2">
                  {selectedServiceModal.fullScope.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                  <div className="text-[10px] font-mono uppercase text-sky-400 font-semibold">
                    Plazo Típico Estimado:
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    {selectedServiceModal.fullScope.typicalTimeline}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                  <div className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                    Garantía Técnica:
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    Código documentado + acompañamiento
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedServiceModal(null)}
                  type="button"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-full cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    const title = selectedServiceModal.title;
                    setSelectedServiceModal(null);
                    onSelectService(title);
                  }}
                  type="button"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full inline-flex items-center gap-1.5 shadow-md shadow-blue-600/25 cursor-pointer"
                >
                  <span>Solicitar este Servicio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </section>
  );
};
