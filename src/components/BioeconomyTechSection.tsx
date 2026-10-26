import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface BioeconomyTechSectionProps {
  onAskDigitalTwin: (prompt: string) => void;
  onSelectCase: (caseTitle: string) => void;
}

export const BioeconomyTechSection: React.FC<BioeconomyTechSectionProps> = ({
  onAskDigitalTwin,
  onSelectCase,
}) => {
  const bioPillars = [
    {
      code: 'BIO · 01',
      metric: '100% Lotes Auditables',
      title: 'Pasaportes Digitales & Trazabilidad de Origen a Destino',
      detail:
        'Registro inmutable en PostgreSQL de cada lote biológico, forestal, pesquero o agroindustrial desde la captura en campo hasta el despacho mayorista y exportación.',
    },
    {
      code: 'BIO · 02',
      metric: '-35% Mermas y Energía',
      title: 'Telemetría IoT en Planta & Bioprocesos',
      detail:
        'Integración de sensores industriales, balanzas en línea y variables de proceso con tableros operativos para optimizar conversión de biomasa y huella hídrica.',
    },
    {
      code: 'BIO · 03',
      metric: 'ISO / ESG Ready',
      title: 'Economía Circular & Certificación de Sostenibilidad',
      detail:
        'Modelado digital de subproductos y valorización de residuos orgánicos con reportes listos para auditorías internacionales y financiamiento verde.',
    },
  ];

  const caseStudies = [
    {
      sector: 'Bioeconomía · Agroindustria Patagónica',
      timeframe: 'Ejecución en 14 semanas',
      metric: '-42% mermas operativas · 100% trazabilidad de lote',
      title: 'Plataforma de Trazabilidad Bioindustrial y Control de Procesos en Planta',
      challenge:
        'Planta procesadora regional operaba con registros en papel y planillas desconectadas, impidiendo auditar el rendimiento de transformación de materia prima biológica y demorando certificaciones de exportación.',
      outcome:
        'Se diseñó e implementó una arquitectura sobre PostgreSQL y Odoo MRP conectada a puntos de control en línea. Hoy cada lote cuenta con trazabilidad completa desde el ingreso de biomasa hasta el despacho mayorista.',
      attribution: 'Dirección de Proyecto & Arquitectura: Gastón Barea',
    },
    {
      sector: 'Industria & Distribución Mayorista B2B2C',
      timeframe: 'Ejecución en 8 semanas',
      metric: '+165% pedidos B2B autogestionados · USD 0 en licencias',
      title: 'Implementación Integral de Odoo Community ERP v18 & Portal Mayorista',
      challenge:
        'Distribuidora con más de 4.200 referencias sufría quiebres de stock y cuellos de botella tomando pedidos por teléfono y WhatsApp, con altos costos proyectados en licencias de ERPs privativos.',
      outcome:
        'Despliegue contenerizado en Docker sobre Linux Ubuntu con Odoo v18 y portal B2B2C integrado. Los clientes mayoristas operan con listas de precios personalizadas y sincronización de stock en tiempo real.',
      attribution: 'Dirección de Proyecto & Arquitectura: Gastón Barea',
    },
    {
      sector: 'Base Tecnológica · Servicios & Energía',
      timeframe: 'Ejecución en 10 semanas',
      metric: '99.98% disponibilidad continua · -65% tiempo de reporte',
      title: 'Modernización de Infraestructura Crítica, Data Warehouse & Inteligencia Operativa',
      challenge:
        'Organización de servicios con caídas recurrentes en picos de facturación y demoras de hasta 12 días para consolidar indicadores financieros y operativos para el directorio.',
      outcome:
        'Reingeniería hacia contenedores Docker aislados, blindaje de seguridad con VPN WireGuard y pipeline analítico en tiempo real que automatizó el 80% de los reportes ejecutivos.',
      attribution: 'Dirección de Proyecto & Arquitectura: Gastón Barea',
    },
  ];

  return (
    <section id="bioeconomia" className="w-full bg-white scroll-mt-16">
      {/* Top Organic Banner Block (Frameless) */}
      <div className="w-full py-16 md:py-20 bg-[#0D261E] text-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-left">
          <div className="space-y-4 max-w-3xl">
            <div className="text-xs font-mono text-emerald-400 font-semibold">
              INGENIERÍA APLICADA A LA BIOECONOMÍA & PRODUCCIÓN SOSTENIBLE
            </div>
            <h1
              className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Digitalización de bioprocesos, valorización de biomasa y evidencia de impacto real.
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed max-w-2xl">
              Convergencia entre recursos biológicos, telemetría IoT y software de gestión para certificar valor de origen a destino.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onAskDigitalTwin(
                'Tenemos un proyecto basado en bioeconomía, valorización de biomasa y trazabilidad agroindustrial con IoT.'
              )
            }
            className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer self-start lg:self-auto shrink-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Estructurar Proyecto de Bioeconomía</span>
          </button>
        </div>
      </div>

      {/* Main Content Area (No Heavy Borders) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 md:py-20 space-y-20 text-left">
        {/* Part 1: 3 Bioeconomy Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {bioPillars.map((pillar) => (
            <div key={pillar.code} className="p-8 bg-[#F3F6F4] space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs font-mono">
                <span className="text-[#515154] font-semibold">{pillar.code}</span>
                <span className="text-[#291B64] font-bold">{pillar.metric}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#1D1D1F] leading-snug">
                {pillar.title}
              </h3>
              <p className="text-sm text-[#515154] leading-relaxed">{pillar.detail}</p>
            </div>
          ))}
        </div>

        {/* Part 2: Quantified Case Studies */}
        <div className="space-y-10">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono text-[#291B64] font-semibold">
              EVIDENCIA EMPÍRICA · RESULTADOS AUDITABLES EN PRODUCCIÓN
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]">
              Casos de impacto en bioeconomía, industria y plataformas B2B2C.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {caseStudies.map((cs, idx) => (
              <div
                key={idx}
                className="pt-6 border-t border-black/[0.1] flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#515154]">
                    <span>{cs.sector}</span>
                    <span aria-hidden="true">·</span>
                    <span>{cs.timeframe}</span>
                  </div>

                  <div className="text-xs font-mono font-bold text-[#291B64]">
                    {cs.metric}
                  </div>

                  <h4 className="font-display text-xl font-bold text-[#1D1D1F] leading-snug">
                    {cs.title}
                  </h4>

                  <div className="space-y-3 text-xs sm:text-sm text-[#515154] leading-relaxed pt-2">
                    <p>
                      <strong className="text-[#1D1D1F] font-semibold">Desafío: </strong>
                      {cs.challenge}
                    </p>
                    <p>
                      <strong className="text-[#1D1D1F] font-semibold">Solución y Resultado: </strong>
                      {cs.outcome}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[#515154]">{cs.attribution}</span>
                  <button
                    type="button"
                    onClick={() => onSelectCase(cs.title)}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Consultar caso similar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
