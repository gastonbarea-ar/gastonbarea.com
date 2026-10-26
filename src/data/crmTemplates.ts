import type { QuoteTemplate, PaymentGatewayConfig, Opportunity, Quote, PaymentRecord } from '../types/crm.ts';

export const DEFAULT_QUOTE_TEMPLATES: QuoteTemplate[] = [
  {
    id: 'tmpl-odoo-erp',
    serviceCategory: 'odoo_erp',
    name: 'Implementación & Migración a Odoo Community ERP v18',
    suggestedTitle: 'Implementación Integral de Odoo Community ERP v18 (Contenerizado Docker)',
    defaultCurrency: 'USD',
    suggestedTimeline: '4 a 6 semanas',
    items: [
      {
        description: 'Despliegue de Infraestructura Odoo v18 + PostgreSQL 16 en Docker Compose con SSL Nginx',
        deliverable: 'Instancia productiva y ambiente de staging aislados con políticas de backup diario automatizado a almacenamiento externo',
        hours: 24,
        unitPrice: 1200,
        quantity: 1,
      },
      {
        description: 'Configuración de Módulos Base: CRM, Ventas, Compras, Inventario Multidepósito y Facturación Electrónica',
        deliverable: 'Parametrización contable, tipos de comprobantes fiscales (AFIP o internacional), listas de precios y flujos de aprobación',
        hours: 36,
        unitPrice: 1800,
        quantity: 1,
      },
      {
        description: 'Migración y Homologación de Datos Maestros (Clientes, Proveedores, Catálogo de Productos y Saldos Iniciales)',
        deliverable: 'Scripts de extracción, transformación y carga (ETL) limpios desde planillas Excel o ERP heredado',
        hours: 20,
        unitPrice: 900,
        quantity: 1,
      },
      {
        description: 'Capacitación Ejecutiva a Equipos Clave y Acompañamiento en Salida a Producción (Go-Live)',
        deliverable: 'Manuales operativos breves, videos paso a paso de procesos críticos y 15 días de soporte intensivo post go-live',
        hours: 16,
        unitPrice: 600,
        quantity: 1,
      },
    ],
    milestones: [
      {
        name: 'Hito 1: Anticipo de Inicio & Puesta en Marcha de Servidor/Docker',
        percentage: 40,
        condition: 'Firma de acuerdo y entrega de accesos al servidor',
      },
      {
        name: 'Hito 2: Entrega en Staging con Datos Migrados y Pruebas UAT',
        percentage: 40,
        condition: 'Validación de flujos de venta y balance inicial de inventario',
      },
      {
        name: 'Hito 3: Salida a Producción Definitiva (Go-Live)',
        percentage: 20,
        condition: 'Cierre de ciclo operativo y capacitación de usuarios clave',
      },
    ],
    terms: [
      'Validez de la oferta: 15 días corridos a partir de la fecha de emisión.',
      'Modalidad de soporte técnico post go-live: 30 días de corrección de bugs o ajustes operativos sin cargo adicional.',
      'Infraestructura cloud o VPS corre por cuenta del cliente (se entrega asesoramiento para selección con costo optimizado).',
      'Confidencialidad absoluta (NDA estándar de protección de datos comerciales y contables).',
    ],
    fastReplyTemplates: {
      whatsapp: `Hola {CLIENT_NAME}, un gusto saludarte. Te comparto la propuesta ejecutiva para la *Implementación de Odoo Community ERP v18* para {COMPANY_NAME}.\n\n📌 *Alcance:* Despliegue en Docker, módulos de Ventas/Compras/Inventario/Facturación, migración limpia de datos y capacitación.\n⏱️ *Plazo estimado:* 4 a 6 semanas.\n💰 *Inversión:* {TOTAL_PRICE} (40% anticipo, 40% validación en staging, 20% go-live).\n\nQuedo a tu disposición para coordinar una llamada de 20 min y repasar dudas técnicas. Podés ver el presupuesto formal aquí: {QUOTE_LINK}`,
      emailSubject: 'Propuesta Técnica & Presupuesto: Implementación Odoo Community ERP - Gastón Barea',
      emailBody: `Estimado/a {CLIENT_NAME},

Es un placer presentarte la propuesta formal para la implementación y migración a Odoo Community ERP v18 para {COMPANY_NAME}.

A continuación te detallo un resumen ejecutivo:
- Infraestructura: Despliegue contenerizado en Docker sobre Linux con PostgreSQL optimizado y backups automáticos.
- Cobertura funcional: Ventas, Compras, Inventario multidepósito, CRM y Facturación fiscal.
- Migración: Limpieza y carga de clientes, proveedores y catálogo de productos.
- Plazo de ejecución: {TIMELINE}.
- Inversión total: {TOTAL_PRICE}.

Adjunto el presupuesto formal #{QUOTE_NUMBER} con el cronograma de hitos de pago (40% anticipo / 40% staging / 20% go-live).

Si estás de acuerdo con el alcance, coordinamos una videollamada para definir la fecha de kick-off.

Atentamente,
Gastón Barea
Consultoría Tecnológica & Arquitectura de Software
www.gastonbarea.com`,
    },
  },
  {
    id: 'tmpl-ecommerce-b2b2c',
    serviceCategory: 'ecommerce_b2b2c',
    name: 'Capa E-Commerce B2B2C & Omnicanalidad Integrada',
    suggestedTitle: 'Plataforma E-Commerce B2B (Distribuidores) & B2C (Consumo Masivo) con Sincronización ERP',
    defaultCurrency: 'USD',
    suggestedTimeline: '4 a 5 semanas',
    items: [
      {
        description: 'Arquitectura Headless E-Commerce Frontend en React 19 / Next.js sobre Vercel Edge',
        deliverable: 'Storefront ultra veloz (<100ms de carga), experiencia móvil fluida, optimización SEO y catálogo modular',
        hours: 32,
        unitPrice: 1500,
        quantity: 1,
      },
      {
        description: 'Portal Privado Mayorista B2B (Listas de Precios Diferenciadas, Cuenta Corriente y Pedidos Mínimos)',
        deliverable: 'Acceso exclusivo por roles con autenticación Supabase, descuentos escalonados y descarga de facturas',
        hours: 28,
        unitPrice: 1300,
        quantity: 1,
      },
      {
        description: 'Integración de Pasarelas de Pago Multimoneda (Mercado Pago Argentina & Stripe USD)',
        deliverable: 'Checkout 1-click, procesamiento seguro de tarjetas, transferencias con validación automática y webhooks de acreditación',
        hours: 18,
        unitPrice: 850,
        quantity: 1,
      },
      {
        description: 'Sincronización Bidireccional de Stock, Precios y Pedidos con ERP / Backend',
        deliverable: 'API REST / Webhooks para actualización de stock en tiempo real y generación automática de órdenes de despacho',
        hours: 20,
        unitPrice: 950,
        quantity: 1,
      },
    ],
    milestones: [
      {
        name: 'Hito 1: Kick-off, Wireframes de UI y Esquema de Base de Datos',
        percentage: 35,
        condition: 'Aprobación del diseño del flujo de compra y arquitectura técnica',
      },
      {
        name: 'Hito 2: Staging Funcional con Checkout y Portal B2B Activo',
        percentage: 45,
        condition: 'Pruebas de cobro en sandbox y sincronización de catálogo',
      },
      {
        name: 'Hito 3: Publicación en Dominio de Producción y Monitoreo Inicial',
        percentage: 20,
        condition: 'Despliegue final con SSL y primera transacción real',
      },
    ],
    terms: [
      'Validez de la oferta: 15 días corridos.',
      'Las comisiones por cobro de Mercado Pago o Stripe son directas del proveedor de pagos a la cuenta del cliente.',
      'Garantía técnica de 30 días post-lanzamiento.',
    ],
    fastReplyTemplates: {
      whatsapp: `Hola {CLIENT_NAME}, te comparto el presupuesto para la plataforma *E-Commerce B2B2C* de {COMPANY_NAME}.\n\n🚀 *Aspectos clave:* Storefront de alta velocidad en React 19/Vercel, portal privado para distribuidores mayoristas, checkout con Mercado Pago/Stripe y sincronización de stock en tiempo real.\n⏱️ *Tiempo:* 4 a 5 semanas.\n💰 *Total:* {TOTAL_PRICE}.\n\nRevisalo en este link: {QUOTE_LINK}`,
      emailSubject: 'Propuesta de Plataforma E-Commerce B2B2C Omnicanal - Gastón Barea',
      emailBody: `Estimado/a {CLIENT_NAME},

Comparto la propuesta técnica y económica para la plataforma E-Commerce B2B2C de {COMPANY_NAME}.

Diseñamos una arquitectura que resuelve tanto la venta directa al público (B2C con checkout rápido) como la comercialización mayorista (portal B2B con listas de precios personalizadas y cuentas corrientes).

Resumen:
- Inversión: {TOTAL_PRICE}
- Plazo: {TIMELINE}
- Esquema de hitos: 35% inicio / 45% staging / 20% puesta en línea.

Quedo a tu disposición para avanzar cuando lo consideres oportuno.

Saludos cordiales,
Gastón Barea`,
    },
  },
  {
    id: 'tmpl-software-arch',
    serviceCategory: 'software_architecture',
    name: 'Arquitectura de Software & Resiliencia Cloud',
    suggestedTitle: 'Auditoría Técnica, Desacople de Monolito y Arquitectura de Alta Disponibilidad',
    defaultCurrency: 'USD',
    suggestedTimeline: '3 a 5 semanas',
    items: [
      {
        description: 'Auditoría Exhaustiva de Código, Base de Datos y Detección de Cuellos de Botella',
        deliverable: 'Informe técnico con matriz de riesgos críticos, queries lentas, memory leaks y plan de mitigación priorizado',
        hours: 20,
        unitPrice: 1100,
        quantity: 1,
      },
      {
        description: 'Rediseño de Capa de Datos y Políticas de Seguridad Row-Level Security (RLS) en PostgreSQL / Supabase',
        deliverable: 'Esquema normalizado, índices optimizados y particionamiento de tablas de alta concurrencia',
        hours: 24,
        unitPrice: 1300,
        quantity: 1,
      },
      {
        description: 'Contenerización Docker, Pipeline CI/CD Automatizado y Estrategia de Failover con Cero Downtime',
        deliverable: 'Configuraciones de Docker Compose, scripts de despliegue blue/green y monitoreo de estado en vivo',
        hours: 26,
        unitPrice: 1400,
        quantity: 1,
      },
    ],
    milestones: [
      {
        name: 'Hito 1: Entrega del Diagnóstico Crítico y Blueprint de Arquitectura',
        percentage: 50,
        condition: 'Relevamiento de repositorios y base de datos',
      },
      {
        name: 'Hito 2: Refactorización y Pruebas de Carga en Staging',
        percentage: 30,
        condition: 'Superación de tests de concurrencia y respuesta <150ms',
      },
      {
        name: 'Hito 3: Migración a Producción sin Pérdida de Datos',
        percentage: 20,
        condition: 'Ventana de mantenimiento completada exitosamente',
      },
    ],
    terms: [
      'Validez: 20 días.',
      'Acuerdo de confidencialidad y preservación íntegra de la base de datos.',
      'Soporte directo de nivel Tier 3 ante cualquier contingencia.',
    ],
    fastReplyTemplates: {
      whatsapp: `Hola {CLIENT_NAME}, preparé el plan de *Arquitectura & Resiliencia* para mitigar los problemas de caídas y lentitud en {COMPANY_NAME}.\n\n🛠️ *Enfoque:* Optimización de PostgreSQL, desacople de procesos pesados, contenedores Docker con cero caídas y monitoreo 24/7.\n⏱️ *Duración:* {TIMELINE}.\n💰 *Presupuesto:* {TOTAL_PRICE}.\n\nPodés ver la propuesta completa acá: {QUOTE_LINK}`,
      emailSubject: 'Plan de Arquitectura de Software y Resiliencia de Infraestructura - Gastón Barea',
      emailBody: `Estimado/a {CLIENT_NAME},

Te presento la propuesta técnica para blindar la arquitectura tecnológica de {COMPANY_NAME}.

Objetivo principal: Eliminar interrupciones de servicio, reducir los tiempos de respuesta y asegurar que la plataforma pueda absorber picos de tráfico sin degradación.

Presupuesto de referencia: {TOTAL_PRICE}
Cronograma propuesto: {TIMELINE}

Detalles en el presupuesto #{QUOTE_NUMBER}. Quedo atento a tus comentarios.

Gastón Barea`,
    },
  },
  {
    id: 'tmpl-fractional-cto',
    serviceCategory: 'fractional_cto',
    name: 'Project Management & Dirección Técnica (Fractional CTO)',
    suggestedTitle: 'Acompañamiento Estratégico como Fractional CTO & Liderazgo de Sprints Ágiles',
    defaultCurrency: 'USD',
    suggestedTimeline: 'Mensual / Retainer (3 meses recomendados)',
    items: [
      {
        description: 'Dirección de Squads de Ingeniería: Planificación de Sprints, Priorización de Backlog y Code Reviews',
        deliverable: 'Rituales de sprint quincenales, asignación técnica clara a desarrolladores y estándares de calidad de código',
        hours: 20,
        unitPrice: 1500,
        quantity: 1,
      },
      {
        description: 'Estrategia de Producto, Selección de Proveedores Cloud y Reducción de Costos Operativos',
        deliverable: 'Auditoría mensual de gastos de infraestructura (AWS/Vercel/Render/Supabase) y roadmap tecnológico trimestral',
        hours: 15,
        unitPrice: 1000,
        quantity: 1,
      },
    ],
    milestones: [
      {
        name: 'Mes 1: Auditoría de Equipo, Procesos y Kick-off del Roadmap',
        percentage: 33.33,
        condition: 'Pago al inicio de cada mes de servicio',
      },
      {
        name: 'Mes 2: Ejecución de Sprints y Consolidación de Buenas Prácticas',
        percentage: 33.33,
        condition: 'Al inicio del segundo período',
      },
      {
        name: 'Mes 3: Evaluación de Indicadores de Velocidad y Estabilidad',
        percentage: 33.34,
        condition: 'Al inicio del tercer período',
      },
    ],
    terms: [
      'Modalidad retainer mensual con dedicación de horas acordada.',
      'Cancelable con preaviso de 15 días antes de iniciar el siguiente ciclo.',
    ],
    fastReplyTemplates: {
      whatsapp: `Hola {CLIENT_NAME}, acá tenés la propuesta de *Dirección Técnica / Fractional CTO* para liderar la evolución técnica de {COMPANY_NAME}.\n\n🎯 *Valor:* Dirección de ingeniería sin el costo de un CTO full-time corporativo, control de calidad, aceleración de entregas y optimización de infraestructura.\n💰 *Honorarios mensuales:* {TOTAL_PRICE}.\n\nEnlace con los alcances detallados: {QUOTE_LINK}`,
      emailSubject: 'Propuesta de Dirección Técnica & Fractional CTO - Gastón Barea',
      emailBody: `Estimado/a {CLIENT_NAME},

Te acerco la propuesta para integrarme como Fractional CTO y Director de Proyecto en {COMPANY_NAME}.

Aportaré experiencia senior en la conducción del equipo de desarrollo, selección de arquitectura y aseguramiento de plazos de entrega sin generar costos fijos desmedidos.

El detalle de la propuesta se encuentra en el presupuesto #{QUOTE_NUMBER}.

Un saludo cordial,
Gastón Barea`,
    },
  },
  {
    id: 'tmpl-linux-docker',
    serviceCategory: 'linux_docker',
    name: 'Infraestructura Linux, Docker & Redes Seguras',
    suggestedTitle: 'Hardening de Servidores Linux Ubuntu 24.04 LTS, Redes Docker y Backups Automatizados',
    defaultCurrency: 'USD',
    suggestedTimeline: '2 a 3 semanas',
    items: [
      {
        description: 'Auditoría y Hardening del Sistema Operativo Linux (SSH keys, UFW Firewall, Fail2ban y puertos aislados)',
        deliverable: 'Servidor blindado contra ataques de fuerza bruta y escaneos de puertos no autorizados',
        hours: 12,
        unitPrice: 650,
        quantity: 1,
      },
      {
        description: 'Configuración de Nginx Reverse Proxy con SSL Let’s Encrypt y Túnel VPN WireGuard',
        deliverable: 'Acceso seguro a servicios internos sin exponer bases de datos a internet público',
        hours: 16,
        unitPrice: 850,
        quantity: 1,
      },
      {
        description: 'Estrategia de Backup Cifrado Offsite hacia AWS S3 / Cloudflare R2 con Verificación Semanal',
        deliverable: 'Scripts automatizados de dump de bases de datos y rotación de snapshots',
        hours: 14,
        unitPrice: 700,
        quantity: 1,
      },
    ],
    milestones: [
      {
        name: 'Hito 1: Aprovisionamiento y Configuración de Seguridad Base',
        percentage: 50,
        condition: 'Entrega de accesos seguros y hardening',
      },
      {
        name: 'Hito 2: Despliegue de Redes Docker y Pruebas de Restauración de Backup',
        percentage: 50,
        condition: 'Simulación de disaster recovery exitosa',
      },
    ],
    terms: [
      'Validez de la oferta: 15 días.',
      'Soporte técnico de mantenimiento mensual opcional disponible.',
    ],
    fastReplyTemplates: {
      whatsapp: `Hola {CLIENT_NAME}, te dejo la cotización para el blindaje de la *Infraestructura Linux y Docker* de {COMPANY_NAME}.\n\n🔒 *Qué incluye:* Hardening de Ubuntu, firewall, proxy Nginx SSL, VPN WireGuard y backups cifrados off-site.\n⏱️ *Plazo:* 2 semanas.\n💰 *Inversión:* {TOTAL_PRICE}.\n\nRevisalo acá: {QUOTE_LINK}`,
      emailSubject: 'Propuesta de Seguridad e Infraestructura Linux/Docker - Gastón Barea',
      emailBody: `Estimado/a {CLIENT_NAME},

Adjunto la propuesta técnica para el aseguramiento y optimización de servidores en {COMPANY_NAME}.

Garantizamos una topología estable, contenida en Docker, con copias de respaldo automatizadas y accesos restringidos vía VPN.

Inversión: {TOTAL_PRICE}
Hitos: 50% inicio / 50% validación de restore.

Saludos,
Gastón Barea`,
    },
  },
  {
    id: 'tmpl-bi-analytics',
    serviceCategory: 'bi_analytics',
    name: 'Business Intelligence & Data Analytics (BI)',
    suggestedTitle: 'Diseño de Pipeline de Datos, Métricas de Negocio en Tiempo Real y Dashboards Ejecutivos',
    defaultCurrency: 'USD',
    suggestedTimeline: '3 a 4 semanas',
    items: [
      {
        description: 'Modelado Dimensional de Base de Datos y Pipeline ETL desde ERP / E-Commerce',
        deliverable: 'Vistas analíticas materializadas y data warehouse ligero optimizado para consultas analíticas veloces',
        hours: 22,
        unitPrice: 1100,
        quantity: 1,
      },
      {
        description: 'Implementación de Dashboards Interactivos en Metabase / Superset / PowerBI',
        deliverable: 'Paneles de control ejecutivos con márgenes brutos, CAC, LTV, rotación de inventario y filtros por período',
        hours: 24,
        unitPrice: 1250,
        quantity: 1,
      },
      {
        description: 'Alertas Automatizadas a Telegram / Email ante Desviaciones Críticas de Negocio',
        deliverable: 'Disparadores programados para avisar stock crítico, caída abrupta de ventas o anomalías en pagos',
        hours: 12,
        unitPrice: 650,
        quantity: 1,
      },
    ],
    milestones: [
      {
        name: 'Hito 1: Relevamiento de Indicadores Clave (KPIs) y Conexión de Fuentes',
        percentage: 45,
        condition: 'Validación de fórmulas de cálculo de márgenes con dirección',
      },
      {
        name: 'Hito 2: Presentación de Dashboards Funcionales y Capacitación',
        percentage: 55,
        condition: 'Tableros operativos y accesibles por la gerencia',
      },
    ],
    terms: [
      'Validez: 15 días.',
      'Propiedad intelectual de todas las consultas SQL y reportes transferida al cliente.',
    ],
    fastReplyTemplates: {
      whatsapp: `Hola {CLIENT_NAME}, armé la propuesta de *Business Intelligence & Tableros de Control* para {COMPANY_NAME}.\n\n📊 *Objetivo:* Ver en tiempo real márgenes, ventas por canal y rotación de stock sin tener que perder horas armando Excels.\n⏱️ *Plazo:* 3 a 4 semanas.\n💰 *Inversión:* {TOTAL_PRICE}.\n\nDetalle completo: {QUOTE_LINK}`,
      emailSubject: 'Propuesta de Business Intelligence & Dashboards de Datos - Gastón Barea',
      emailBody: `Estimado/a {CLIENT_NAME},

Te presento la propuesta para la implementación del sistema de Business Intelligence en {COMPANY_NAME}.

Permitirá que la toma de decisiones esté respaldada por tableros visuales automáticos conectados directamente a sus bases de datos operativas.

Presupuesto de referencia: {TOTAL_PRICE}
Presupuesto detallado #{QUOTE_NUMBER}.

Atentamente,
Gastón Barea`,
    },
  },
];

export const DEFAULT_PAYMENT_CONFIG: PaymentGatewayConfig = {
  mercadopago: {
    enabled: true,
    aliasOrCvu: 'gastonbarea.mp',
    titular: 'Gastón Barea',
    cuit: '20-33458921-9',
    defaultCheckoutUrl: 'https://mpago.la/pos/gastonbarea',
    notes: 'Acreditación instantánea en Pesos Argentinos (ARS). Acepta tarjetas de crédito, débito y dinero en cuenta.',
  },
  stripe: {
    enabled: true,
    paymentLinkUrl: 'https://buy.stripe.com/gastonbarea_consultoria',
    accountEmail: 'pagos@gastonbarea.com',
    acceptedCurrencies: ['USD', 'EUR'],
    notes: 'Pagos internacionales con tarjeta de crédito o débito (Visa, Mastercard, Amex), Apple Pay y Google Pay.',
  },
  bankTransfer: {
    enabled: true,
    banco: 'Banco Santander Argentina / Banco Galicia',
    titular: 'Gastón Barea',
    cuit: '20-33458921-9',
    cbu: '0720000788000036481234',
    alias: 'GASTON.BAREA.DEV',
    tipoCuenta: 'Caja de Ahorro / Cuenta Corriente en Pesos y Dólares',
    swift: 'BSANARBAXXX',
    facturaTipo: 'A',
    notes: 'Transferencias bancarias locales inmediatas con emisión de Factura Fiscal A, B o comprobante de exportación E.',
  },
  crypto: {
    enabled: true,
    usdtTrc20Address: 'TPLq3vXx5aW9mNkR8s8z1mQhU1kE8y5F7j',
    usdcErc20Address: '0x71C...a29B (Red Arbitrum / Ethereum / Polygon)',
    binancePayId: '492810432',
    notes: 'Liquidación en stablecoins USDT / USDC con comisiones de red mínimas.',
  },
};

export const INITIAL_CRM_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-101',
    title: 'Migración Odoo ERP + Ecommerce B2B',
    clientName: 'Martín Arismendi',
    clientEmail: 'martin@distribuidorasur.com.ar',
    clientPhone: '+54 9 11 4829-1122',
    company: 'Distribuidora del Sur S.A.',
    serviceCategory: 'odoo_erp',
    stage: 'proposal_sent',
    value: 4500,
    currency: 'USD',
    probability: 70,
    expectedCloseDate: '2026-04-15',
    notes: 'Tienen 12 sucursales y necesitan unificar stock con Odoo v18 y portal mayorista B2B.',
    source: 'web_diagnostic',
    createdAt: '2026-03-20T14:30:00Z',
    updatedAt: '2026-03-22T10:15:00Z',
    linkedQuoteId: 'GB-2026-001',
  },
  {
    id: 'opp-102',
    title: 'Auditoría de Monolito & Resiliencia Cloud',
    clientName: 'Lic. Carolina Valenzuela',
    clientEmail: 'cvalenzuela@novafintech.io',
    clientPhone: '+54 9 351 555-8900',
    company: 'Nova Fintech Hub',
    serviceCategory: 'software_architecture',
    stage: 'negotiation',
    value: 3800,
    currency: 'USD',
    probability: 85,
    expectedCloseDate: '2026-04-05',
    notes: 'Caídas en días de pago de nómina. Requieren separar base de datos y migrar a Docker con zero downtime.',
    source: 'contact_form',
    createdAt: '2026-03-18T09:00:00Z',
    updatedAt: '2026-03-24T16:20:00Z',
    linkedQuoteId: 'GB-2026-002',
  },
  {
    id: 'opp-103',
    title: 'Fractional CTO para Squad de Producto',
    clientName: 'Ignacio Rossi',
    clientEmail: 'ignacio@logistix.com',
    clientPhone: '+54 9 11 6789-4321',
    company: 'LogistiX Plataforma',
    serviceCategory: 'fractional_cto',
    stage: 'contacted',
    value: 2500,
    currency: 'USD',
    probability: 50,
    expectedCloseDate: '2026-04-20',
    notes: 'Quieren ordenar sprints de 6 desarrolladores y armar CI/CD automatizado.',
    source: 'whatsapp',
    createdAt: '2026-03-22T11:45:00Z',
    updatedAt: '2026-03-23T18:00:00Z',
  },
  {
    id: 'opp-104',
    title: 'Tablero BI para Control de Márgenes',
    clientName: 'Ing. Federico Ramos',
    clientEmail: 'framos@agroinsumos.com.ar',
    company: 'Agro Insumos del Centro',
    serviceCategory: 'bi_analytics',
    stage: 'lead',
    value: 3000,
    currency: 'USD',
    probability: 30,
    expectedCloseDate: '2026-04-30',
    notes: 'Consultó por simulador de IA para conectar PostgreSQL con tableros ejecutivos.',
    source: 'web_diagnostic',
    createdAt: '2026-03-25T08:10:00Z',
    updatedAt: '2026-03-25T08:10:00Z',
  },
  {
    id: 'opp-105',
    title: 'Hardening Servidores Linux & VPN WireGuard',
    clientName: 'Daniel Gómez',
    clientEmail: 'daniel@clinicamedica.org',
    company: 'Clínica Integral San Juan',
    serviceCategory: 'linux_docker',
    stage: 'won',
    value: 2200,
    currency: 'USD',
    probability: 100,
    expectedCloseDate: '2026-03-15',
    notes: 'Anticipo cobrado. Entregada primera etapa de blindaje de servidores y VPN.',
    source: 'referral',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-15T12:00:00Z',
    linkedQuoteId: 'GB-2026-003',
  },
];

export const INITIAL_CRM_QUOTES: Quote[] = [
  {
    id: 'quote-001',
    quoteNumber: 'GB-2026-001',
    opportunityId: 'opp-101',
    clientName: 'Martín Arismendi',
    clientEmail: 'martin@distribuidorasur.com.ar',
    clientCompany: 'Distribuidora del Sur S.A.',
    clientTaxId: '30-71482911-4',
    serviceCategory: 'odoo_erp',
    title: 'Implementación Integral de Odoo Community ERP v18 (Contenerizado Docker)',
    currency: 'USD',
    subtotal: 4500,
    taxPercent: 0,
    total: 4500,
    timeline: '4 a 6 semanas',
    items: [
      {
        id: 'item-1',
        description: 'Despliegue Odoo v18 + PostgreSQL en Docker Compose con SSL Nginx',
        deliverable: 'Instancia productiva y staging aislados con backup diario a R2/S3',
        hours: 24,
        unitPrice: 1200,
        quantity: 1,
        total: 1200,
      },
      {
        id: 'item-2',
        description: 'Módulos CRM, Ventas, Compras, Inventario Multidepósito y Facturación AFIP',
        deliverable: 'Parametrización completa y flujos de aprobación contable',
        hours: 36,
        unitPrice: 1800,
        quantity: 1,
        total: 1800,
      },
      {
        id: 'item-3',
        description: 'Migración y Homologación de Datos Maestros (Clientes y Catálogo)',
        deliverable: 'Scripts ETL limpios desde planillas anteriores',
        hours: 20,
        unitPrice: 900,
        quantity: 1,
        total: 900,
      },
      {
        id: 'item-4',
        description: 'Capacitación Ejecutiva y Acompañamiento en Go-Live',
        deliverable: 'Videos de procesos críticos y 15 días de soporte intensivo',
        hours: 16,
        unitPrice: 600,
        quantity: 1,
        total: 600,
      },
    ],
    milestones: [
      {
        id: 'ms-1',
        name: 'Hito 1: Anticipo de Inicio & Servidor/Docker',
        percentage: 40,
        amount: 1800,
        condition: 'Firma y accesos a infraestructura',
        status: 'pending',
      },
      {
        id: 'ms-2',
        name: 'Hito 2: Staging Funcional con Datos Migrados',
        percentage: 40,
        amount: 1800,
        condition: 'Validación de flujos de venta e inventario',
        status: 'pending',
      },
      {
        id: 'ms-3',
        name: 'Hito 3: Salida a Producción (Go-Live)',
        percentage: 20,
        amount: 900,
        condition: 'Puesta en marcha y capacitación final',
        status: 'pending',
      },
    ],
    termsAndConditions: [
      'Validez de la oferta: 15 días.',
      'Soporte post go-live: 30 días sin cargo para ajustes operativos.',
      'Confidencialidad absoluta NDA.',
    ],
    status: 'sent',
    validUntil: '2026-04-10',
    createdAt: '2026-03-22T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z',
    preferredPaymentMethod: 'stripe',
    paymentLink: 'https://buy.stripe.com/gastonbarea_consultoria?client=distribuidorasur',
  },
  {
    id: 'quote-002',
    quoteNumber: 'GB-2026-002',
    opportunityId: 'opp-102',
    clientName: 'Lic. Carolina Valenzuela',
    clientEmail: 'cvalenzuela@novafintech.io',
    clientCompany: 'Nova Fintech Hub',
    clientTaxId: '30-71889901-2',
    serviceCategory: 'software_architecture',
    title: 'Auditoría Técnica, Desacople de Monolito y Resiliencia Cloud',
    currency: 'USD',
    subtotal: 3800,
    taxPercent: 0,
    total: 3800,
    timeline: '3 a 5 semanas',
    items: [
      {
        id: 'item-201',
        description: 'Auditoría Exhaustiva de Código, Base de Datos y Bottlenecks',
        deliverable: 'Informe técnico con matriz de criticidad y plan de acción',
        hours: 20,
        unitPrice: 1100,
        quantity: 1,
        total: 1100,
      },
      {
        id: 'item-202',
        description: 'Rediseño de Capa de Datos y Políticas Row-Level Security',
        deliverable: 'Optimización de queries PostgreSQL y aislamiento de datos',
        hours: 24,
        unitPrice: 1300,
        quantity: 1,
        total: 1300,
      },
      {
        id: 'item-203',
        description: 'Contenerización Docker, Pipeline CI/CD y Failover',
        deliverable: 'Despliegues automatizados con cero caídas de servicio',
        hours: 26,
        unitPrice: 1400,
        quantity: 1,
        total: 1400,
      },
    ],
    milestones: [
      {
        id: 'ms-201',
        name: 'Hito 1: Diagnóstico Crítico y Blueprint',
        percentage: 50,
        amount: 1900,
        condition: 'Entrega del reporte de arquitectura',
        status: 'pending',
      },
      {
        id: 'ms-202',
        name: 'Hito 2: Refactorización en Staging',
        percentage: 30,
        amount: 1140,
        condition: 'Pruebas de concurrencia aprobadas',
        status: 'pending',
      },
      {
        id: 'ms-203',
        name: 'Hito 3: Puesta en Producción Definitiva',
        percentage: 20,
        amount: 760,
        condition: 'Zero downtime verificado en vivo',
        status: 'pending',
      },
    ],
    termsAndConditions: [
      'Validez de la oferta: 20 días.',
      'Soporte directo nivel Tier 3.',
    ],
    status: 'sent',
    validUntil: '2026-04-12',
    createdAt: '2026-03-24T15:00:00Z',
    updatedAt: '2026-03-24T15:00:00Z',
    preferredPaymentMethod: 'transfer',
  },
];

export const INITIAL_CRM_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    quoteId: 'quote-003',
    opportunityId: 'opp-105',
    clientName: 'Daniel Gómez (Clínica Integral San Juan)',
    amount: 1100,
    currency: 'USD',
    method: 'transfer',
    status: 'confirmed',
    transactionRef: 'TRANS-BCO-94821',
    notes: 'Anticipo 50% por infraestructura Linux y VPN',
    createdAt: '2026-03-05T14:20:00Z',
    confirmedAt: '2026-03-05T16:00:00Z',
  },
  {
    id: 'pay-002',
    quoteId: 'quote-003',
    opportunityId: 'opp-105',
    clientName: 'Daniel Gómez (Clínica Integral San Juan)',
    amount: 1100,
    currency: 'USD',
    method: 'transfer',
    status: 'confirmed',
    transactionRef: 'TRANS-BCO-99823',
    notes: 'Pago final Hito 2: Blindaje de servidores y backups completados',
    createdAt: '2026-03-15T11:00:00Z',
    confirmedAt: '2026-03-15T11:45:00Z',
  },
];
