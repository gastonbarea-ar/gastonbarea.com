import React, { useState, useEffect } from 'react';
import {
  Send,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Video,
  Linkedin,
  Github,
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';
import { saveContactInquiry } from '../lib/supabase';

interface ContactSectionProps {
  initialService?: string;
  initialMessage?: string;
  onWhatsAppClick: (customMessage?: string) => void;
  onScheduleClick?: () => void;
}

const EXECUTIVE_FAQS = [
  {
    q: '¿Cómo es la metodología de trabajo en la dirección de un proyecto?',
    a: 'A partir de 14 años dirigiendo proyectos con clientes, trabajo bajo un esquema de 3 hitos verificables: Hito 1 (40%) definición de arquitectura, infraestructura y kick-off; Hito 2 (40%) entrega funcional en entorno Staging para pruebas con datos reales; Hito 3 (20%) salida en producción y transferencia operativa.',
  },
  {
    q: '¿Qué tipo de proyectos de Bioeconomía y Base Tecnológica acompañás?',
    a: 'Acompaño desde la estructuración técnica y formulación de Empresas de Base Tecnológica (EBTs), trazabilidad agroindustrial y forestal, valorización de biomasa con telemetría IoT, hasta implementaciones integrales de Odoo Community ERP v18 y plataformas B2B2C.',
  },
  {
    q: '¿Cómo funciona el seguimiento a través del Portal de Clientes?',
    a: 'Cada cliente activo dispone de una clave de acceso verificada al Portal de Clientes en gastonbarea.com, donde puede consultar el porcentaje de avance del sprint, acceder al servidor de Staging, gestionar tickets con SLA y agendar revisiones por Google Meet Pro.',
  },
  {
    q: '¿Se firman acuerdos de confidencialidad (NDA) para proyectos de I+D o industriales?',
    a: 'Sí. Toda evaluación técnica, modelo de negocio, formulación bioeconómica o base de datos se trabaja bajo estricto Acuerdo de Confidencialidad (NDA) desde la primera reunión.',
  },
];

export const ContactSection: React.FC<ContactSectionProps> = ({
  initialService,
  initialMessage,
  onWhatsAppClick,
  onScheduleClick,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [serviceArea, setServiceArea] = useState(
    initialService || 'Proyectos de Base Tecnológica & Arquitectura'
  );
  const [requirements, setRequirements] = useState(initialMessage || '');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialService) setServiceArea(initialService);
    if (initialMessage) setRequirements(initialMessage);
  }, [initialService, initialMessage]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'El nombre es obligatorio';
    if (!email.trim()) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Ingresá un formato de correo electrónico válido';
    }
    if (!company.trim()) errors.company = 'La empresa u organización es obligatoria';
    if (!requirements.trim()) errors.requirements = 'Por favor describí brevemente el proyecto o consulta';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

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

  return (
    <section id="contacto" className="w-full bg-white scroll-mt-16">
      {/* Top Banner Block */}
      <div className="w-full py-16 md:py-20 bg-[#0D0D12] text-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-3 text-left">
          <div className="text-xs font-mono text-emerald-400 font-semibold">
            CONTACTO EJECUTIVO · RESPUESTA DIRECTA &lt; 24H · PROTOCOLO NDA
          </div>
          <h1
            className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08] max-w-3xl"
            style={{ textWrap: 'balance' }}
          >
            Iniciemos la evaluación de su proyecto tecnológico o bioeconómico.
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
            Envíe los detalles de su iniciativa para recibir una devolución ejecutiva o coordine directamente una videollamada de 30 minutos por Google Meet Pro.
          </p>
        </div>
      </div>

      {/* Main Content Split (Frameless Tonal Surfaces) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 md:py-20 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column (7 cols): Validated Lead Capture Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-none bg-[#F6F6F9]">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-none bg-[#291B64] text-white mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  Requerimiento recibido correctamente
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Gastón Barea analizará su solicitud sobre <strong className="text-slate-900">{serviceArea}</strong> y responderá a <strong className="font-mono text-slate-900">{email}</strong> dentro de las próximas 24 horas hábiles.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  {onScheduleClick && (
                    <button
                      type="button"
                      onClick={onScheduleClick}
                      className="px-5 py-3 text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Agendar llamada en Google Meet Pro (30m)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 underline cursor-pointer"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="pb-4 border-b border-black/[0.08] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      Formulario de Requerimiento y Consultoría
                    </h3>
                    <p className="text-xs text-slate-500">
                      Protegido por protocolo de confidencialidad (NDA).
                    </p>
                  </div>
                  {onScheduleClick && (
                    <button
                      type="button"
                      onClick={onScheduleClick}
                      className="text-xs font-semibold text-[#291B64] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>¿Preferís agendar Google Meet Pro?</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Ing. Martín Rodríguez"
                      className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-none border text-slate-900 focus:outline-none ${
                        formErrors.name
                          ? 'border-rose-600'
                          : 'border-black/[0.1] focus:border-[#291B64]'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Correo Electrónico Corporativo *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-none border text-slate-900 focus:outline-none ${
                        formErrors.email
                          ? 'border-rose-600'
                          : 'border-black/[0.1] focus:border-[#291B64]'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-rose-600 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Empresa / Organización *
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Ej. AgroBio Sur S.A."
                      className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-none border text-slate-900 focus:outline-none ${
                        formErrors.company
                          ? 'border-rose-600'
                          : 'border-black/[0.1] focus:border-[#291B64]'
                      }`}
                    />
                    {formErrors.company && (
                      <p className="text-xs text-rose-600 mt-1">{formErrors.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Eje de Consultoría o Desarrollo
                    </label>
                    <select
                      value={serviceArea}
                      onChange={(e) => setServiceArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white rounded-none border border-black/[0.1] text-slate-900 focus:outline-none focus:border-[#291B64]"
                    >
                      <option value="Proyectos de Base Tecnológica & Arquitectura">
                        01. Proyectos de Base Tecnológica & Arquitectura
                      </option>
                      <option value="IA Services, Gemelos Digitales & Business Intelligence">
                        02. IA Services, Gemelos Digitales & Business Intelligence
                      </option>
                      <option value="Proyectos Basados en Bioeconomía & Trazabilidad">
                        03. Proyectos Basados en Bioeconomía & Trazabilidad
                      </option>
                      <option value="Dirección Ejecutiva de Proyectos (PMO - 14 años)">
                        04. Dirección Ejecutiva de Proyectos (PMO - 14 años)
                      </option>
                      <option value="Odoo Community ERP v18 & E-Commerce B2B2C">
                        05. Odoo Community ERP v18 & E-Commerce B2B2C
                      </option>
                      <option value="Infraestructura Crítica Linux & Docker">
                        06. Infraestructura Crítica Linux & Docker
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Detalle del Proyecto, Alcance o Necesidad *
                  </label>
                  <textarea
                    rows={4}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Describí brevemente los objetivos del proyecto, situación actual y plazos estimados..."
                    className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-none border text-slate-900 focus:outline-none ${
                      formErrors.requirements
                        ? 'border-rose-600'
                        : 'border-black/[0.1] focus:border-[#291B64]'
                    }`}
                  />
                  {formErrors.requirements && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.requirements}</p>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    className="px-6 py-4 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Requerimiento a Gastón Barea</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onWhatsAppClick(
                        requirements
                          ? `Hola Gastón, soy ${name || 'cliente'} de ${company || 'mi empresa'}. Consulta sobre ${serviceArea}: ${requirements}`
                          : undefined
                      )
                    }
                    className="px-4 py-3 text-xs font-semibold text-slate-700 hover:text-slate-900 underline-offset-4 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Enviar directo por WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column (5 cols): Direct Channels & Unboxed FAQs */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-7 bg-[#F6F6F9] space-y-4">
              <div className="text-xs font-mono text-[#291B64] font-semibold">
                CANALES EJECUTIVOS DIRECTOS
              </div>
              <div className="space-y-3 text-xs sm:text-sm">
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center justify-between p-3.5 bg-white hover:bg-[#291B64] hover:text-white transition-colors group"
                >
                  <span className="font-semibold">Correo Electrónico</span>
                  <span className="font-mono text-xs text-slate-500 group-hover:text-white">
                    {SITE_CONFIG.email}
                  </span>
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={SITE_CONFIG.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-white hover:bg-[#291B64] hover:text-white transition-colors flex items-center justify-center gap-2 font-semibold text-slate-800 text-xs"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={SITE_CONFIG.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-white hover:bg-[#291B64] hover:text-white transition-colors flex items-center justify-center gap-2 font-semibold text-slate-800 text-xs"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Accordion FAQs (Divided by hairlines, no heavy frames) */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-[#291B64] font-semibold">
                PREGUNTAS FRECUENTES SOBRE DIRECCIÓN Y PROYECTOS
              </div>
              <div className="divide-y divide-black/[0.08] border-t border-b border-black/[0.08]">
                {EXECUTIVE_FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="py-4">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left text-xs sm:text-sm font-semibold text-slate-900 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 shrink-0 text-[#291B64]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="pt-3 text-xs text-slate-600 leading-relaxed">
                          {faq.a}
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
    </section>
  );
};
