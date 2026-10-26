import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ServicesBentoSectionProps {
  onSelectService: (serviceName: string) => void;
  onAskDigitalTwin: (prompt: string) => void;
  onScheduleClick: (context?: string) => void;
  highlightedServiceCode?: string;
}

export const ServicesBentoSection: React.FC<ServicesBentoSectionProps> = ({
  onSelectService,
  onAskDigitalTwin,
  highlightedServiceCode,
}) => {
  const services = [
    {
      index: '01',
      span: 'lg:col-span-6',
      kicker: 'Ingeniería de Producto · Escalabilidad · Propiedad Intelectual',
      title: '01. Consultoría y Desarrollo de Proyectos de Base Tecnológica',
      description:
        'Estructuración técnica, económica y arquitectónica de Empresas de Base Tecnológica (EBTs), plataformas digitales B2B y software de misión crítica. Transformamos conocimiento científico, industrial o comercial en activos tecnológicos escalables con retorno medible.',
      deliverables: [
        'Arquitectura full-stack moderna (React 19, TypeScript, Node.js, PostgreSQL / Supabase)',
        'Formulación técnica de proyectos de innovación, validación de MVP y escalado productivo',
        'Integración nativa de APIs, pasarelas de pago multimoneda y portales de autoservicio',
      ],
      twinPrompt:
        'Queremos estructurar y desarrollar un proyecto de base tecnológica. ¿Cómo trabajamos desde la arquitectura hasta la puesta en producción?',
      theme: 'light',
    },
    {
      index: '02',
      span: 'lg:col-span-6',
      kicker: 'IA Services · Gemelos Digitales Corporativos · Agentes RAG & BI',
      title: '02. IA Services: Gemelos Digitales, Agentes Inteligentes & BI',
      description:
        'Transformamos la presencia digital y la operación de su empresa integrando Inteligencia Artificial aplicada. Desarrollamos Gemelos Digitales interactivos (como esta misma plataforma web), agentes entrenados con sus propios documentos y catálogos (RAG), y tableros predictivos de Business Intelligence.',
      deliverables: [
        'Gemelos Digitales web y corporativos que asesoran clientes, diagnostican necesidades y califican oportunidades 24/7',
        'Agentes de IA conectados a su ERP, inventario, manuales técnicos y bases de datos PostgreSQL',
        'Pipelines ETL y tableros ejecutivos en tiempo real para análisis de márgenes, costos y rotación',
      ],
      twinPrompt:
        'Nos interesa el ítem IA Services para implementar un Gemelo Digital interactivo, agentes de IA con datos propios y Business Intelligence en nuestra empresa.',
      theme: 'dark',
    },
    {
      index: '03',
      span: 'lg:col-span-5',
      kicker: 'Biotecnología Productiva · Trazabilidad · Economía Circular',
      title: '03. Proyectos Basados en Bioeconomía',
      description:
        'Articulación entre recursos biológicos, agroindustria y tecnología digital. Desarrollamos sistemas para valorización de biomasa, trazabilidad de origen a destino, monitoreo IoT de bioprocesos y certificación de huella ambiental.',
      deliverables: [
        'Trazabilidad digital de lotes biológicos, forestales, pesqueros y agroindustriales',
        'Telemetría IoT en planta y campo para eficiencia energética e hídrica',
        'Modelado de economía circular y tableros de impacto productivo en tiempo real',
      ],
      twinPrompt:
        'Tenemos una iniciativa basada en bioeconomía / producción sostenible y necesitamos integrar tecnología, trazabilidad y gestión del proyecto.',
      theme: 'emerald',
    },
    {
      index: '04',
      span: 'lg:col-span-7',
      kicker: '14 Años Liderando Proyectos con Clientes · PMO Externa',
      title: '04. Dirección Ejecutiva de Proyectos (PMO)',
      description:
        '14 años de experiencia específica dirigiendo proyectos complejos junto a clientes corporativos, pymes industriales e instituciones. Asumo la dirección técnica y operativa para alinear equipos, controlar presupuestos y asegurar entregas en tiempo y forma.',
      deliverables: [
        'Gobernanza por hitos verificables: 40% inicio, 40% validación en Staging y 20% producción',
        'Coordinación de equipos de ingeniería propios o tercerizados y rescate de proyectos críticos',
        'Acceso al Portal de Clientes con seguimiento transparente de avances, SLA y entregables',
      ],
      twinPrompt:
        'Buscamos dirección ejecutiva de proyecto (PMO) con experiencia real liderando clientes e implementaciones complejas.',
      theme: 'light',
    },
    {
      index: '05',
      span: 'lg:col-span-7',
      kicker: 'Gestión Industrial & Comercial · Cero Costo de Licencias',
      title: '05. Odoo Community ERP v18 & Plataformas E-Commerce B2B2C',
      description:
        'Unificación integral de la operación productiva y comercial. Desplegamos Odoo Community ERP contenedorizado en Docker —sin costos perpetuos de licencias por usuario— sincronizado en tiempo real con portales mayoristas B2B y tiendas minoristas B2C.',
      deliverables: [
        'Módulos de Producción (MRP), Inventario Multidepósito, Compras, Ventas y Facturación Fiscal',
        'Portal mayorista B2B con listas de precios diferenciadas, cuenta corriente y pedidos rápidos',
        'Migración limpia de catálogos, clientes y saldos desde sistemas heredados o planillas',
      ],
      twinPrompt:
        'Nos interesa implementar Odoo Community ERP v18 integrado con E-Commerce B2B2C para nuestra operación.',
      theme: 'light',
    },
    {
      index: '06',
      span: 'lg:col-span-5',
      kicker: '30 Años de Rigor Técnico · Continuidad Operativa 24/7',
      title: '06. Infraestructura Crítica Linux, Docker & Soberanía de Datos',
      description:
        'Diseño, blindaje (hardening) y administración de servidores Linux Ubuntu y arquitecturas contenerizadas con Docker Compose. Garantizamos que sus sistemas operen con máxima velocidad, copias de seguridad automatizadas y cero ataduras a proveedores.',
      deliverables: [
        'Aislamiento de servicios en contenedores Docker con proxy inverso Nginx y SSL',
        'Redes privadas WireGuard VPN, firewalls perimetrales y backups cifrados offsite',
        'Auditorías de rendimiento y planes de contingencia ante caídas o cuellos de botella',
      ],
      twinPrompt:
        'Necesitamos auditar y modernizar nuestra infraestructura de servidores Linux, bases de datos PostgreSQL y contenedores Docker.',
      theme: 'light',
    },
  ];

  return (
    <section id="servicios" className="w-full bg-white scroll-mt-16">
      {/* Top Section Banner (Frameless Tonal Header) */}
      <div className="w-full py-16 md:py-20 bg-[#F6F6F9]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-mono text-[#291B64] font-semibold">
              ARQUITECTURA DE SOLUCIONES · 30 AÑOS SECTOR TECNOLÓGICO-PRODUCTIVO
            </div>
            <h1
              className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Seis verticales de ingeniería para transformar su operación.
            </h1>
          </div>
          <p className="text-sm text-[#515154] max-w-md leading-relaxed">
            Seleccione cualquier solución para simular su implementación con el Estructurador de Proyectos IA o solicitar una cotización ejecutiva bajo acuerdo de confidencialidad (NDA).
          </p>
        </div>
      </div>

      {/* Frameless Asymmetric Bento Grid (Tonal Surfaces, Zero Heavy Borders) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {services.map((srv) => {
            const isDark = srv.theme === 'dark';
            const isEmerald = srv.theme === 'emerald';
            const isHighlighted = highlightedServiceCode === srv.index;

            return (
              <div
                key={srv.index}
                id={`service-card-${srv.index}`}
                className={`${srv.span} rounded-none p-8 sm:p-10 flex flex-col justify-between transition-all ${
                  isDark
                    ? 'bg-[#130D33] text-white'
                    : isEmerald
                    ? 'bg-[#0C2920] text-white'
                    : 'bg-[#F7F7FA] text-[#1D1D1F]'
                } ${isHighlighted ? 'ring-2 ring-[#291B64]' : ''}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`text-xs font-mono ${
                        isDark
                          ? 'text-emerald-400 font-semibold'
                          : isEmerald
                          ? 'text-emerald-300'
                          : 'text-[#291B64] font-semibold'
                      }`}
                    >
                      {srv.kicker}
                    </div>
                    {isHighlighted && (
                      <span className="text-xs font-mono text-emerald-500 font-semibold">
                        Solución seleccionada
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-display text-xl sm:text-2xl font-bold tracking-tight ${
                      isDark || isEmerald ? 'text-white' : 'text-[#1D1D1F]'
                    }`}
                  >
                    {srv.title}
                  </h3>

                  <p
                    className={`text-sm leading-relaxed ${
                      isDark
                        ? 'text-neutral-300'
                        : isEmerald
                        ? 'text-emerald-100/90'
                        : 'text-[#515154]'
                    }`}
                  >
                    {srv.description}
                  </p>

                  {/* Deliverables List */}
                  <div
                    className={`pt-5 border-t space-y-2.5 ${
                      isDark
                        ? 'border-white/10'
                        : isEmerald
                        ? 'border-emerald-800/60'
                        : 'border-black/[0.06]'
                    }`}
                  >
                    <div
                      className={`text-xs font-mono ${
                        isDark || isEmerald ? 'text-neutral-400' : 'text-slate-500'
                      }`}
                    >
                      Alcance y entregables:
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm">
                      {srv.deliverables.map((deliv, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-2.5 ${
                            isDark
                              ? 'text-neutral-200'
                              : isEmerald
                              ? 'text-emerald-50'
                              : 'text-slate-700'
                          }`}
                        >
                          <span
                            className={`font-mono text-xs mt-0.5 ${
                              isDark || isEmerald ? 'text-emerald-400' : 'text-[#291B64]'
                            }`}
                          >
                            —
                          </span>
                          <span>{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Actions */}
                <div
                  className={`pt-6 mt-8 border-t flex flex-wrap items-center justify-between gap-3 ${
                    isDark
                      ? 'border-white/10'
                      : isEmerald
                      ? 'border-emerald-800/60'
                      : 'border-black/[0.06]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onAskDigitalTwin(srv.twinPrompt)}
                    className="px-5 py-3 text-xs font-semibold rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap bg-[#291B64] text-white hover:bg-[#382586]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Estructurar Proyecto con IA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectService(srv.title)}
                    className={`text-xs font-semibold underline-offset-4 hover:underline inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isDark || isEmerald
                        ? 'text-neutral-200 hover:text-white'
                        : 'text-[#291B64] hover:text-[#382586]'
                    }`}
                  >
                    <span>Solicitar presupuesto</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
