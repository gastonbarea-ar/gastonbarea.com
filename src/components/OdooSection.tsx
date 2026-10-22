import React, { useState } from 'react';
import {
  Layers,
  Database,
  Shield,
  Lock,
  CheckCircle2,
  TrendingDown,
  Server,
  Zap,
  ArrowRight,
  MessageSquare,
  Calendar,
  Check,
  FileSpreadsheet,
  Users,
  ShoppingCart,
  Factory,
  Building2,
  ExternalLink,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { OSWindowFrame } from './common/OSWindowFrame';

interface OdooSectionProps {
  onScheduleClick: () => void;
  onWhatsAppClick: (customText?: string) => void;
}

export const OdooSection: React.FC<OdooSectionProps> = ({
  onScheduleClick,
  onWhatsAppClick,
}) => {
  const [userCount, setUserCount] = useState<number>(15);

  // Estimación de ahorro anual frente a Odoo Enterprise ($30 USD/usuario/mes)
  const enterpriseYearlyCost = userCount * 30 * 12;
  const communityCost = 0; // Cero costo en licencias
  const estimatedSavings = enterpriseYearlyCost;

  const modules = [
    {
      icon: FileSpreadsheet,
      title: 'Facturación Electrónica & Contabilidad',
      badge: 'Fiscal Adaptado',
      desc: 'Emisión de facturas electrónicas (AFIP / fiscal), retenciones, libro IVA digital, conciliación bancaria y balance de sumas y saldos en tiempo real.',
    },
    {
      icon: Users,
      title: 'CRM & Pipeline de Ventas',
      badge: 'Conversión B2B',
      desc: 'Gestión omnicanal de prospectos, cotizaciones en PDF en 1 clic, métricas de rendimiento por ejecutivo comercial y firma digital.',
    },
    {
      icon: ShoppingCart,
      title: 'Inventario, Stock & Logística',
      badge: 'Multi-Almacén',
      desc: 'Trazabilidad por lotes y números de serie, reglas de reabastecimiento automático, código de barras y transferencias internas.',
    },
    {
      icon: Factory,
      title: 'Producción & Manufactura (MRP)',
      badge: 'Industria & Ensamblaje',
      desc: 'Listas de materiales (BOM), órdenes de trabajo por centro de producción, costeo de mano de obra y cálculo de margen real por lote.',
    },
    {
      icon: Building2,
      title: 'Punto de Venta (POS / TPV)',
      badge: 'Offline-First',
      desc: 'Cajas registradoras para retail y locales que siguen cobrando e imprimiendo tickets incluso si se interrumpe la conexión a internet.',
    },
    {
      icon: Zap,
      title: 'Conexión con IA & WhatsApp',
      badge: 'Exclusivo Gastón Barea',
      desc: 'Agentes inteligentes que responden consultas de clientes, envían estados de pedidos por WhatsApp y permiten a tu equipo consultar stock por audio.',
    },
  ];

  const securityFeatures = [
    {
      title: 'Aislamiento en Servidor Propio',
      desc: 'Despliegue dockerizado en Linux dedicado. Tus datos jamás se comparten en nubes multi-tenant públicas.',
    },
    {
      title: 'Backups Cifrados Cada 24 Horas',
      desc: 'Copias automáticas en caliente con cifrado AES-256 enviadas a storage externo seguro para contingencias.',
    },
    {
      title: 'Propiedad Total del Código y BD',
      desc: 'Cero vendor lock-in. Eres dueño del 100% de la base de datos PostgreSQL y las personalizaciones.',
    },
    {
      title: 'Red Segura con VPN & SSL',
      desc: 'Acceso administrativo protegido por WireGuard VPN y certificados TLS/SSL de alta seguridad.',
    },
  ];

  return (
    <section id="odoo" className="py-20 md:py-28 bg-[#F4F4F4] relative border-b border-blue-900/10">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-indigo-300 border border-indigo-500/30 shadow-xs text-xs font-mono font-semibold">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>ERP DE CLASE MUNDIAL SIN LICENCIAS EN DÓLARES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Implementación & Migración a Odoo Community ERP.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Digitaliza la contabilidad, ventas, almacenes y producción de tu empresa con el software empresarial de código abierto más potente del mundo, adaptado a tu operativa local y con tus datos bajo estricta confidencialidad.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: ODOO COMMUNITY WORKSPACE */}
        <OSWindowFrame
          accentTheme="indigo"
          processName="sys/erp/odoo-community-v18.app"
          windowTitle="ODOO COMMUNITY ERP · WORKSPACE EMPRESARIAL ($0 USD LICENCIAS)"
          securityBadge="DOCKER DEDICADO & VPN"
          statusBadge="POSTGRESQL MULTI-TIER"
          portBadge="PORT 8069 · TLS/SSL"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'MODULES', value: 'FACTURACIÓN, CRM, MRP, POS' },
            { label: 'SAVINGS', value: `$${estimatedSavings.toLocaleString()} USD/año`, highlight: true },
            { label: 'LICENSE', value: 'OPEN SOURCE LGPL' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 space-y-8 text-left">
            
            {/* 6 Grid Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 shadow-lg hover:shadow-2xl hover:border-indigo-400/50 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-400/30">
                          {mod.badge}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculadora de Ahorro para Captar Clientes (OS Widget) */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-indigo-500/30 relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>CALCULADORA DE COSTOS & RETORNO DE INVERSIÓN</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    ¿Cuánto dinero se ahorra tu empresa con Odoo Community?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    Los ERPs tradicionales y las suscripciones Enterprise cobran en dólares mensuales por cada usuario conectado. Con Odoo Community desplegado en tu servidor, el costo por usuario es <strong className="text-emerald-400 font-bold">$0 USD</strong>.
                  </p>

                  {/* Slider de Usuarios */}
                  <div className="pt-3 space-y-2 max-w-md">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300">Cantidad de usuarios activos:</span>
                      <span className="text-lg font-bold text-sky-400">{userCount} usuarios</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={userCount}
                      onChange={(e) => setUserCount(parseInt(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
                    />
                  </div>
                </div>

                {/* Resultado de Ahorro */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10 text-center space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Ahorro anual estimado en licencias:
                  </span>
                  <div className="text-3xl sm:text-5xl font-extrabold text-emerald-400 font-mono tracking-tight">
                    ${estimatedSavings.toLocaleString()} USD
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Basado en licencias estándar de ~$30 USD/mes/usuario que tu empresa deja de pagar año tras año.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onWhatsAppClick(
                          `Hola Gastón, vi tu sección de Odoo Community. Tenemos un equipo de aproximadamente ${userCount} usuarios y nos gustaría evaluar una implementación para reducir costos.`
                        )
                      }
                      className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/30 cursor-pointer transition-all active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4 fill-white" />
                      <span>Consultar por WhatsApp con {userCount} Usuarios</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Sección de Seguridad & Confidencialidad en Odoo (OS Block) */}
            <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-10 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-blue-500/20 text-sky-400 flex items-center justify-center border border-blue-400/30">
                    <ShieldCheck className="w-6 h-6" />
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      Entorno de Seguridad Blindada & Confidencialidad Absoluta
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Garantías contractuales y técnicas en cada implementación de ERP
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1 border border-emerald-500/30">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>NDA Previo Firmado</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {securityFeatures.map((sec, i) => (
                  <div key={i} className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                    <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{sec.title}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {sec.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-300 max-w-xl">
                  ¿Tienes un sistema legado (Tango, Bejerman, Excel o un Odoo desactualizado)? Realizo la migración integral de catálogos, clientes y saldos históricos sin frenar tus ventas.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onScheduleClick}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/25 cursor-pointer active:scale-95"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar Reunión Técnica (30m)</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </OSWindowFrame>

      </div>
    </section>
  );
};
