import React, { useState } from 'react';
import {
  ShoppingCart,
  Building2,
  Users,
  Layers,
  Database,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  RefreshCw,
  CreditCard,
  Truck,
  FileText,
  BarChart3,
  Sliders,
  DollarSign,
  TrendingUp,
  Package,
  Boxes,
  FileCheck,
  Smartphone,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { OSWindowFrame } from './common/OSWindowFrame';

interface EcommerceB2B2CSectionProps {
  onScheduleClick: (customTopic?: string) => void;
  onWhatsAppClick: (customText?: string) => void;
  onSelectService: (serviceName: string) => void;
}

export const EcommerceB2B2CSection: React.FC<EcommerceB2B2CSectionProps> = ({
  onScheduleClick,
  onWhatsAppClick,
  onSelectService,
}) => {
  // Active Tab state
  const [activeTab, setActiveTab] = useState<'b2b' | 'b2c' | 'sync' | 'simulator'>('b2b');

  // Interactive Simulator state
  const [buyerType, setBuyerType] = useState<'mayorista' | 'distribuidor' | 'minorista'>('mayorista');
  const [orderQuantity, setOrderQuantity] = useState<number>(250);
  const [paymentTerm, setPaymentTerm] = useState<'contado' | 'cuenta_corriente_30' | 'tarjeta'>('cuenta_corriente_30');

  // Calculations for simulator
  const basePriceB2C = 100; // USD 100 PVP
  let discountPercentage = 0;
  if (buyerType === 'minorista') {
    discountPercentage = orderQuantity >= 50 ? 8 : 0;
  } else if (buyerType === 'mayorista') {
    if (orderQuantity < 100) discountPercentage = 25;
    else if (orderQuantity < 500) discountPercentage = 35;
    else discountPercentage = 42;
  } else if (buyerType === 'distribuidor') {
    if (orderQuantity < 500) discountPercentage = 45;
    else if (orderQuantity < 1000) discountPercentage = 50;
    else discountPercentage = 55;
  }

  const unitPrice = basePriceB2C * (1 - discountPercentage / 100);
  const subtotal = unitPrice * orderQuantity;
  const taxEstimated = subtotal * 0.21;
  const totalAmount = subtotal + taxEstimated;
  const standardCommissionSaved = subtotal * 0.055; // 5.5% typical SaaS fee avoided

  const tabs = [
    {
      id: 'b2b',
      label: 'Portal Mayorista B2B',
      badge: 'Cuentas & Crédito',
      icon: Building2,
      tagline: 'Gestión corporativa, listas de precios por volumen y cuenta corriente'
    },
    {
      id: 'b2c',
      label: 'Storefront Minorista B2C',
      badge: 'Headless 1-Click',
      icon: ShoppingCart,
      tagline: 'Checkout ultra-rápido, omnicanalidad y experiencia móvil nativa'
    },
    {
      id: 'sync',
      label: 'Núcleo ERP & Stock Redis',
      badge: 'Cero Sobrevendidos',
      icon: RefreshCw,
      tagline: 'Sincronización atómica multi-depósito en tiempo real con Odoo'
    },
    {
      id: 'simulator',
      label: 'Simulador Transaccional',
      badge: 'Interactivo',
      icon: Sliders,
      tagline: 'Prueba cómo escala el motor de precios, crédito y fiscalidad en vivo'
    },
  ];

  const handleConsultProposal = () => {
    const summary = `Hola Gastón, nos interesa implementar la Capa de E-Commerce B2B2C. Vimos el simulador (${buyerType.toUpperCase()}, ${orderQuantity} unidades, plazo ${paymentTerm}) y queremos evaluar la arquitectura para nuestra empresa.`;
    onWhatsAppClick(summary);
  };

  return (
    <section id="ecommerce-b2b2c" className="py-20 md:py-28 bg-[#F4F4F4] relative border-b border-blue-900/10 scroll-mt-20">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-indigo-300 border border-indigo-500/30 shadow-xs text-xs font-mono font-semibold">
            <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" />
            <span>ARQUITECTURA TRANSACCIONAL B2B2C INTEGRADA</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
            Capa de E-Commerce B2B2C & Omnicanalidad Empresarial.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Conectamos canales mayoristas corporativos y venta minorista directa en una infraestructura unificada, sincronizada en tiempo real con inventarios multi-almacén, pasarelas de pago y ERP (Odoo), con propiedad total del código y cero comisiones recurrentes.
          </p>
        </div>

        {/* FUNCTIONAL OS WINDOW: B2B2C COMMERCE WORKSPACE */}
        <OSWindowFrame
          id="ecommerce-b2b2c-window"
          accentTheme="indigo"
          processName="sys/commerce/b2b2c-omnichannel.service"
          windowTitle="MOTOR TRANSACCIONAL B2B2C · CATÁLOGOS, CRÉDITO Y CHECKOUT UNIFICADO"
          securityBadge="PCI-DSS & RLS ENCRIPTADO"
          statusBadge="LATENCIA < 45ms · 10K REQ/SEC"
          portBadge="PORT 443 · REDIS + POSTGRESQL"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'MOTOR TRANSACCIONAL', value: 'B2B + B2C DUAL', highlight: true },
            { label: 'SINCRONIZACIÓN ERP', value: '< 1.1s (Odoo / SQL)' },
            { label: 'COMISIÓN POR VENTA', value: '0% (CERO COSTOS SAAS)' },
            { label: 'OVERSELLING', value: '0.00% (RESERVA ATÓMICA)' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 space-y-8 text-left text-slate-100">
            
            {/* Top Workspace Tab Selector */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50'
                        : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-300'
                    }`}>
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: PORTAL MAYORISTA B2B */}
            {activeTab === 'b2b' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-indigo-400" />
                      <span>Portal B2B para Distribuidores, Franquicias y Cuentas Corporativas</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Elimina el intercambio manual de planillas Excel y pedidos por WhatsApp. Permite a tus clientes mayoristas autogestionar compras con sus condiciones comerciales exactas.
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>-80% Errores de Carga</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-white">Listas de Precios Segmentadas</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Cada cliente visualiza únicamente sus precios acordados, descuentos por volumen acumulado, promociones de canal y monedas específicas (ARS / USD / EUR).
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-indigo-300">
                      Tiering dinámico: Mayorista A, B, VIP & Distribuidor
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-white">Cuenta Corriente & Crédito</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Límites de crédito parametrizables por cliente con validación en tiempo real. Bloqueo automático de pedidos ante vencimientos impagos y descarga de extractos de cuenta.
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-blue-300">
                      Sincronizado con balance contable de Odoo
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-white">Carga Rápida & Workflow</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Carga masiva por SKU, importador de pedidos CSV, repetición de órdenes frecuentes con un clic y flujos de aprobación multinivel (comprador → gerente de finanzas).
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-purple-300">
                      Órdenes recurrentes automatizadas
                    </div>
                  </div>
                </div>

                {/* Workflow Architecture Diagram */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                  <div className="text-xs font-mono font-bold uppercase text-indigo-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Flujo Transaccional Corporativo B2B Automatizado</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-1.5">
                      <span className="text-[10px] text-indigo-400 font-bold">PASO 01</span>
                      <div className="font-bold text-white">Ingreso & Autenticación B2B</div>
                      <p className="text-[11px] text-slate-400">Validación de CUIT, rol asignado, sucursales habilitadas y cupo de crédito disponible.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-1.5">
                      <span className="text-[10px] text-indigo-400 font-bold">PASO 02</span>
                      <div className="font-bold text-white">Selección por Escala de Volumen</div>
                      <p className="text-[11px] text-slate-400">Descuento matricial en tiempo real, verificación de stock físico y reserva atómica.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-1.5">
                      <span className="text-[10px] text-indigo-400 font-bold">PASO 03</span>
                      <div className="font-bold text-white">Generación de Orden / Remito</div>
                      <p className="text-[11px] text-slate-400">Impacto automático en Odoo ERP: orden de venta (SO), reserva de depósito y log de auditoría.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1.5">
                      <span className="text-[10px] text-emerald-400 font-bold">PASO 04</span>
                      <div className="font-bold text-white">Facturación Fiscal Electrónica</div>
                      <p className="text-[11px] text-slate-400">Factura A o B emitida con CAE fiscal, percepción tributaria y remisión automática a logística.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: STOREFRONT MINORISTA B2C */}
            {activeTab === 'b2c' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <ShoppingCart className="w-6 h-6 text-sky-400" />
                      <span>Storefront Headless Minorista B2C de Máxima Conversión</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Arquitectura Next.js & React desacoplada. Tiempos de carga inferiores a 0.8 segundos en telefonía móvil para maximizar el retorno de inversión publicitaria (ROAS).
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    <span>Velocidad de Carga &lt; 0.8s</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-white">Checkout 1-Click & Mobile First</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Embudo de compra optimizado sin formularios eternos. Autocompletado de dirección, validación de código postal y cálculo instantáneo de flete.
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-sky-300">
                      Reducción drástica de carritos abandonados
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-white">Pasarelas Omnicanal</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Integración nativa con Mercado Pago (checkout transparente), Stripe para cobros internacionales, tarjetas bancarias en cuotas sin interés y transferencias con alias/CBU.
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-emerald-300">
                      Acreditación inmediata y webhook seguro
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-white">WhatsApp & Alertas Automatizadas</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Envío instantáneo de comprobante, link de seguimiento de paquete y factura vía WhatsApp al comprador en cuanto se aprueba el pago en la pasarela.
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-amber-300">
                      Notificaciones transaccionales automáticas
                    </div>
                  </div>
                </div>

                {/* Highlights Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                    <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-400">99.98%</div>
                    <div className="text-[11px] text-slate-400 uppercase font-mono mt-0.5">Uptime Garantizado</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                    <div className="text-lg sm:text-2xl font-bold font-mono text-sky-400">0% Comisiones</div>
                    <div className="text-[11px] text-slate-400 uppercase font-mono mt-0.5">Sin canon por venta</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                    <div className="text-lg sm:text-2xl font-bold font-mono text-indigo-400">100% SEO</div>
                    <div className="text-[11px] text-slate-400 uppercase font-mono mt-0.5">Server-Side Rendered</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
                    <div className="text-lg sm:text-2xl font-bold font-mono text-purple-400">&lt; 0.8s</div>
                    <div className="text-[11px] text-slate-400 uppercase font-mono mt-0.5">Velocidad Móvil</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: NÚCLEO ERP & STOCK REDIS */}
            {activeTab === 'sync' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <RefreshCw className="w-6 h-6 text-emerald-400" />
                      <span>Sincronización Bidireccional Multi-Depósito con ERP Odoo</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Un catálogo centralizado. Cualquier modificación de precio, descripción o ingreso de mercadería en Odoo se refleja instantáneamente en la web y los puntos de venta.
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cero Overselling</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Technical Features */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                      <div className="text-xs font-mono font-bold uppercase text-indigo-300 flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-indigo-400" />
                        <span>Reserva Atómica de Stock con Redis In-Memory</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Durante fechas de alta demanda (Hot Sale, CyberMonday), las compras concurrentes reservan unidades en microsegundos dentro de memoria RAM (Redis), impidiendo ventas duplicadas de un mismo ítem.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                      <div className="text-xs font-mono font-bold uppercase text-sky-300 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-sky-400" />
                        <span>Ruteo Logístico Inteligente & Multi-Almacén</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        El sistema asigna la preparación de pedidos al depósito o sucursal más cercana geográficamente al cliente, o permite retiro en sucursal con control de stock local.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                      <div className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Facturación Electrónica Automática</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Conexión con el servidor fiscal oficial. Cada orden aprobada emite comprobante fiscal electrónico con CAE sin requerir intervención de personal administrativo.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Architectural Matrix */}
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4 font-mono text-xs">
                    <div className="text-xs font-bold text-white border-b border-white/10 pb-2 flex items-center justify-between">
                      <span className="text-indigo-300 uppercase">Matriz de Sincronización ERP</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVO 24/7</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-white/5">
                        <span className="text-slate-300">Catálogo & Precios Odoo → Web</span>
                        <span className="text-indigo-400 font-bold">Tiempo Real (Webhooks)</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-white/5">
                        <span className="text-slate-300">Reserva de Stock Web → Depósitos</span>
                        <span className="text-sky-400 font-bold">&lt; 50 milisegundos (Redis)</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-white/5">
                        <span className="text-slate-300">Orden de Venta Web → Odoo Sales</span>
                        <span className="text-emerald-400 font-bold">Instantáneo (API REST/XML-RPC)</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-white/5">
                        <span className="text-slate-300">Estado de Envíos Transportista → Cliente</span>
                        <span className="text-amber-400 font-bold">Webhook / WhatsApp Push</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-white/5">
                        <span className="text-slate-300">Asientos Contables & Libro IVA</span>
                        <span className="text-purple-400 font-bold">Consolidación Automática</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-slate-300">
                      💡 <strong>Aislamiento Garantizado:</strong> Las operaciones de la tienda web corren en microservicios independientes, garantizando que el ERP interno de tu empresa no sufra saturación por visitas web.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: SIMULADOR INTERACTIVO */}
            {activeTab === 'simulator' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <Sliders className="w-6 h-6 text-indigo-400" />
                      <span>Simulador Interactivo de Lógica Transaccional B2B2C</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Ajusta los parámetros para ver cómo la arquitectura calcula automáticamente listas de precios mayoristas, descuentos por escala, validación fiscal y ahorros frente a comisiones de terceros.
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Cálculo Reactivo en Vivo</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Controls (5 cols) */}
                  <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-5">
                    
                    {/* Buyer Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center justify-between">
                        <span>Perfil del Comprador</span>
                        <span className="text-indigo-400 text-[11px]">{buyerType.toUpperCase()}</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'minorista', label: 'B2C Minorista' },
                          { id: 'mayorista', label: 'B2B Mayorista' },
                          { id: 'distribuidor', label: 'Distribuidor VIP' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setBuyerType(item.id as any)}
                            className={`p-2.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                              buyerType === item.id
                                ? 'bg-indigo-600 text-white border-indigo-400'
                                : 'bg-slate-950/80 text-slate-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-300 uppercase">Volumen de la Orden:</span>
                        <span className="text-sky-400 font-bold text-sm">{orderQuantity.toLocaleString()} unidades</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="1500"
                        step="10"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Number(e.target.value))}
                        className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>1 un (Muestras)</span>
                        <span>500 un (Mayorista)</span>
                        <span>1500 un (Master Box)</span>
                      </div>
                    </div>

                    {/* Payment Term */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold uppercase text-slate-300">
                        Condición de Pago & Crédito
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'contado', label: 'Contado / MP' },
                          { id: 'cuenta_corriente_30', label: 'Cta. Cte. 30d' },
                          { id: 'tarjeta', label: 'Cuotas Sin Interés' },
                        ].map((term) => (
                          <button
                            key={term.id}
                            type="button"
                            onClick={() => setPaymentTerm(term.id as any)}
                            className={`p-2 rounded-xl text-[11px] font-mono font-bold transition-all border cursor-pointer ${
                              paymentTerm === term.id
                                ? 'bg-indigo-600 text-white border-indigo-400'
                                : 'bg-slate-950/80 text-slate-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {term.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 text-[11px] text-slate-400 font-mono space-y-1">
                      <div className="text-indigo-300 font-bold">Regla de Negocio Aplicada:</div>
                      <div>
                        {buyerType === 'distribuidor' && 'Distribuidor VIP: Descuento matricial de hasta 55% por compra de escala master.'}
                        {buyerType === 'mayorista' && 'Mayorista Estándar: Descuento escalonado según tramos de 100, 500 y 1000 unidades.'}
                        {buyerType === 'minorista' && 'Consumidor Final B2C: Precio sugerido al público con checkout rápido.'}
                      </div>
                    </div>
                  </div>

                  {/* Right Realtime Output Telemetry (7 cols) */}
                  <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900/95 via-indigo-950/40 to-slate-900/95 border-2 border-indigo-500/40 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="text-xs font-mono font-bold uppercase text-indigo-300">
                        Liquidación & Auditoría Simulada
                      </span>
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cotización Aprobada
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10">
                        <div className="text-[10px] font-mono uppercase text-slate-400">Precio Unitario</div>
                        <div className="text-lg font-bold font-mono text-white mt-1">
                          ${unitPrice.toFixed(2)} USD
                        </div>
                        <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                          -{discountPercentage}% sobre PVP
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10">
                        <div className="text-[10px] font-mono uppercase text-slate-400">Subtotal Neto</div>
                        <div className="text-lg font-bold font-mono text-indigo-300 mt-1">
                          ${subtotal.toLocaleString('es-AR', { maximumFractionDigits: 0 })} USD
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {orderQuantity} unidades
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 col-span-2 sm:col-span-1">
                        <div className="text-[10px] font-mono uppercase text-slate-400">Total con Impuestos</div>
                        <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                          ${totalAmount.toLocaleString('es-AR', { maximumFractionDigits: 0 })} USD
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          IVA 21% discriminado
                        </div>
                      </div>
                    </div>

                    {/* Operational Diagnostics Checklist */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2 text-xs font-mono">
                      <div className="text-[11px] font-bold text-slate-300 uppercase">
                        Diagnóstico de Ejecución en Servidor:
                      </div>
                      <div className="space-y-1.5 text-slate-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Stock Físico: {orderQuantity} unidades reservadas en Depósito Central via Redis.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Condición: {paymentTerm === 'cuenta_corriente_30' ? 'Cta Cte autorizada. Cupo de crédito restante: $45,000 USD.' : 'Pago inmediato validado sin fricción.'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Facturación: Factura A electrónica con CAE generada automáticamente en Odoo.</span>
                        </div>
                      </div>
                    </div>

                    {/* Avoided Commission Banner */}
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                      <div className="text-xs">
                        <div className="font-bold text-emerald-300 font-mono">
                          Ahorro en comisiones de plataformas SaaS cerradas:
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Con tu propia infraestructura, no pagas el 3% al 6% por cada transacción procesada.
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                          +${standardCommissionSaved.toLocaleString('es-AR', { maximumFractionDigits: 0 })} USD
                        </span>
                        <div className="text-[9px] font-mono text-slate-400">en esta orden</div>
                      </div>
                    </div>

                    <button
                      onClick={handleConsultProposal}
                      type="button"
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer font-mono"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Consultar por WhatsApp con esta Configuración Simulada</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom 4 Bento Pillars for E-commerce B2B2C */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="text-xs font-mono font-bold uppercase text-sky-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Headless Desacoplado</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Frontend ultra-rápido en Next.js aislado del backend para que las visitas de tráfico masivo nunca comprometan tu base de datos central.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="text-xs font-mono font-bold uppercase text-sky-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Propiedad 100% de Datos</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tus clientes, historial de pedidos, listas de precios y márgenes quedan en servidores propios encriptados bajo acuerdo estricto de confidencialidad (NDA).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="text-xs font-mono font-bold uppercase text-sky-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cero Comisiones SaaS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sin costos ocultos por volumen de facturación ni mensualidades dolarizadas por usuario. El código fuente es tuyo desde el primer día.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="text-xs font-mono font-bold uppercase text-sky-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Integración Odoo ERP</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sincronización nativa con los módulos de Facturación, Inventarios Multi-Almacén, Compras y CRM sin necesidad de intermediarios manuales.
                </p>
              </div>
            </div>

            {/* Action Bar Footer */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-mono text-center sm:text-left">
                ¿Querés migrar tu canal mayorista o minorista sin perder clientes ni detener tus operaciones?
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => onWhatsAppClick('Hola Gastón, nos interesa una propuesta para desarrollar la Capa de E-Commerce B2B2C integrada con ERP.')}
                  type="button"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 rounded-full transition-all flex items-center gap-1.5 shadow-sm shadow-[#25D366]/30 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>Consultar por WhatsApp</span>
                </button>

                <button
                  onClick={() => onScheduleClick('Capa de E-Commerce B2B2C & Omnicanal')}
                  type="button"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar Diagnóstico (30m)</span>
                </button>

                <button
                  onClick={() => onSelectService('Capa de E-Commerce B2B2C & Omnicanalidad')}
                  type="button"
                  className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 hover:text-white border border-white/20 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Solicitar Propuesta Formal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </OSWindowFrame>

      </div>
    </section>
  );
};
