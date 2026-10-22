import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Mail, 
  MessageSquare,
  Calendar,
  Linkedin,
  Github,
  ExternalLink,
  Terminal,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { FAQS_DATA } from '../data/content';
import { SITE_CONFIG } from '../data/siteConfig';
import { saveContactInquiry } from '../lib/supabase';
import { OSWindowFrame } from './common/OSWindowFrame';

interface ContactSectionProps {
  initialService?: string;
  initialMessage?: string;
  onWhatsAppClick: (customMessage?: string) => void;
  onScheduleClick?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  initialService,
  initialMessage,
  onWhatsAppClick,
  onScheduleClick,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [serviceArea, setServiceArea] = useState(initialService || 'Consultoría en Arquitectura de Software');
  const [requirements, setRequirements] = useState(initialMessage || '');
  
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialService) {
      setServiceArea(initialService);
    }
    if (initialMessage) {
      setRequirements(initialMessage);
    }
  }, [initialService, initialMessage]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'El nombre es obligatorio';
    if (!email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Formato de correo electrónico no válido';
    }
    if (!company.trim()) errors.company = 'La organización o empresa es obligatoria';
    if (!requirements.trim()) errors.requirements = 'Por favor detallá el requerimiento técnico';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Send to Supabase if configured, otherwise persist smoothly
    await saveContactInquiry({
      name,
      email,
      company,
      serviceArea,
      requirements,
      createdAt: new Date().toISOString(),
    });

    setSubmitted(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section id="contacto" className="py-20 md:py-28 bg-[#F4F4F4] relative border-b border-blue-900/10 scroll-mt-20">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-xs text-xs font-mono font-semibold">
            <Mail className="w-3.5 h-3.5 text-purple-400" />
            <span>CONTACTO & AGENDAMIENTO TÉCNICO</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Iniciemos una conversación directa de ingeniería.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Elegí coordinar una llamada de 30 minutos vía Calendly, enviar un requerimiento detallado por formulario o conectar por WhatsApp y LinkedIn.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: DIRECT COMMUNICATIONS TERMINAL */}
        <OSWindowFrame
          accentTheme="purple"
          processName="sys/comms/direct-messaging-channel.ipc"
          windowTitle="TERMINAL DE COMUNICACIONES · CANAL DIRECTO DE INGENIERÍA"
          securityBadge="CANAL CIFRADO END-TO-END"
          statusBadge="RESPUESTA < 24H"
          portBadge="TLS 1.3 · SMTP/IPC SECURE"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'CHANNEL', value: 'DIRECTO GASTÓN BAREA', highlight: true },
            { label: 'SLA', value: '<24H HÁBILES' },
            { label: 'CONFIDENTIALITY', value: '100% GARANTIZADA' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Main Form (7 cols) */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-10 shadow-xl space-y-6">
                  
                  <div className="flex items-center justify-between pb-5 border-b border-white/10">
                    <div>
                      <h3 className="text-lg font-bold text-white">Formulario de Requerimiento Técnico</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Respuesta técnica garantizada en menos de 24 horas hábiles.</p>
                    </div>
                    {onScheduleClick && (
                      <button
                        type="button"
                        onClick={onScheduleClick}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>¿Preferís agendar?</span>
                      </button>
                    )}
                  </div>

                  {submitted ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
                        <Check className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold text-white">¡Requerimiento Recibido con Éxito!</h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                        Gastón Barea revisará los detalles técnicos de tu solicitud y te responderá a <strong className="text-sky-300 font-mono">{email}</strong> a la brevedad.
                      </p>
                      
                      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {onScheduleClick && (
                          <button
                            onClick={onScheduleClick}
                            type="button"
                            className="py-2.5 px-5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Agendar también llamada (30 min)</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSubmitted(false)}
                          type="button"
                          className="text-xs font-mono text-sky-400 hover:text-sky-300 underline py-2 cursor-pointer"
                        >
                          Enviar otra consulta
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 font-semibold">
                            Tu Nombre Completo <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej. Ing. Martín Rodríguez"
                            className={`w-full bg-slate-950/70 border text-white px-4 py-3 text-xs rounded-xl focus:outline-none transition-colors ${
                              formErrors.name ? 'border-rose-500' : 'border-white/10 focus:border-blue-400'
                            }`}
                          />
                          {formErrors.name && (
                            <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 font-semibold">
                            Correo Corporativo <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nombre@empresa.com"
                            className={`w-full bg-slate-950/70 border text-white px-4 py-3 text-xs rounded-xl focus:outline-none transition-colors ${
                              formErrors.email ? 'border-rose-500' : 'border-white/10 focus:border-blue-400'
                            }`}
                          />
                          {formErrors.email && (
                            <p className="text-[11px] text-rose-400 mt-1">{formErrors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 font-semibold">
                            Empresa u Organización <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Ej. Cooperativa / Fintech / Salud"
                            className={`w-full bg-slate-950/70 border text-white px-4 py-3 text-xs rounded-xl focus:outline-none transition-colors ${
                              formErrors.company ? 'border-rose-500' : 'border-white/10 focus:border-blue-400'
                            }`}
                          />
                          {formErrors.company && (
                            <p className="text-[11px] text-rose-400 mt-1">{formErrors.company}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 font-semibold">
                            Área de Interés
                          </label>
                          <select
                            value={serviceArea}
                            onChange={(e) => setServiceArea(e.target.value)}
                            className="w-full bg-slate-950/70 border border-white/10 text-white px-4 py-3 text-xs rounded-xl focus:outline-none focus:border-purple-400 transition-colors font-medium cursor-pointer"
                          >
                            <option value="Consultoría en Arquitectura de Software" className="bg-slate-900">
                              Consultoría en Arquitectura de Software
                            </option>
                            <option value="Implementación / Migración a Odoo Community ERP" className="bg-slate-900">
                              Implementación / Migración a Odoo Community ERP
                            </option>
                            <option value="Business Intelligence & Data Analytics" className="bg-slate-900">
                              Business Intelligence & Data Analytics
                            </option>
                            <option value="Infraestructura Linux & Docker" className="bg-slate-900">
                              Infraestructura Linux & Docker
                            </option>
                            <option value="Desarrollo Web & Integración ERP" className="bg-slate-900">
                              Desarrollo Web & Integración ERP
                            </option>
                            <option value="Auditoría Crítica & Contingencia" className="bg-slate-900">
                              Auditoría Crítica & Contingencia
                            </option>
                            <option value="Dirección Tecnológica (CTO Fraccional)" className="bg-slate-900">
                              Dirección Tecnológica (CTO Fraccional)
                            </option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 font-semibold">
                          Detalle del Requerimiento <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                          rows={5}
                          value={requirements}
                          onChange={(e) => setRequirements(e.target.value)}
                          placeholder="Describí brevemente los desafíos técnicos, la infraestructura actual o el objetivo del proyecto..."
                          className={`w-full bg-slate-950/70 border text-white p-4 text-xs rounded-xl focus:outline-none transition-colors leading-relaxed ${
                            formErrors.requirements ? 'border-rose-500' : 'border-white/10 focus:border-purple-400'
                          }`}
                        />
                        {formErrors.requirements && (
                          <p className="text-[11px] text-rose-400 mt-1">{formErrors.requirements}</p>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-3.5 px-6 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] rounded-full transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer font-mono"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Mensaje a Gastón Barea</span>
                        </button>
                        <p className="text-[11px] text-slate-400 text-center mt-3 font-mono flex items-center justify-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Garantía estricta de confidencialidad y respuesta directa de ingeniería.</span>
                        </p>
                      </div>
                    </form>
                  )}

                </div>
              </div>

              {/* Direct channels & FAQ (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-7 space-y-4 shadow-xl">
                  <div className="text-xs font-mono uppercase tracking-widest text-purple-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <span>Canales Directos & Agenda</span>
                  </div>

                  {/* Calendly / Cal.com Quick Booking Card */}
                  {onScheduleClick && (
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Agendar Llamada de 30 min</div>
                          <div className="text-[11px] text-purple-200/80 font-mono">Calendly en tiempo real</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onScheduleClick}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-full transition-colors shrink-0 shadow-xs cursor-pointer active:scale-95 font-mono"
                      >
                        Agendar
                      </button>
                    </div>
                  )}

                  {/* WhatsApp */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Canal de WhatsApp</div>
                        <div className="text-[11px] text-slate-400 font-mono">Coordinación ágil directa</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onWhatsAppClick()}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] rounded-full transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-white" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* Email */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-blue-400/30">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Correo Electrónico</div>
                        <div className="text-[11px] font-mono text-sky-300">{SITE_CONFIG.email}</div>
                      </div>
                    </div>
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-full transition-colors cursor-pointer"
                    >
                      Escribir
                    </a>
                  </div>

                  {/* LinkedIn & GitHub Direct */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={SITE_CONFIG.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-[#0077b5]/15 border border-[#0077b5]/40 hover:bg-[#0077b5]/25 transition-all flex items-center gap-2 group"
                    >
                      <Linkedin className="w-4 h-4 text-[#0077b5] fill-current group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-white">LinkedIn</div>
                        <div className="text-[10px] text-sky-300 flex items-center gap-0.5 font-mono">
                          <span>Ver perfil</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </a>

                    <a
                      href={SITE_CONFIG.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 group"
                    >
                      <Github className="w-4 h-4 text-slate-300 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-white">GitHub</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-0.5 font-mono">
                          <span>@xpatagonia</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Base */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-blue-400/30">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Base Operativa</div>
                      <div className="text-[11px] text-slate-400 font-mono">{SITE_CONFIG.location}</div>
                    </div>
                  </div>
                </div>

                {/* FAQs Accordion */}
                <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-7 space-y-3 shadow-xl">
                  <div className="text-xs font-mono uppercase tracking-widest text-sky-400 mb-2 font-semibold">
                    Preguntas Frecuentes
                  </div>
                  <div className="space-y-2">
                    {FAQS_DATA.map((faq, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggleFaq(idx)}
                            className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-white hover:text-sky-300 transition-colors cursor-pointer"
                          >
                            <span>{faq.question}</span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-sky-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed font-normal border-t border-white/10 pt-3">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
