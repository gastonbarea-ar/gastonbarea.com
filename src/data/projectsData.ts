export type ProjectStatus = 'en-produccion' | 'realizado';

export type ProjectCategory =
  | 'IA Services & Gemelos Digitales'
  | 'Bioeconomía & Trazabilidad IoT'
  | 'Base Tecnológica (EBTs)'
  | 'Odoo ERP v18 & B2B2C'
  | 'Infraestructura Linux & Docker';

export interface ProductionProject {
  id: string;
  code: string;
  title: string;
  clientOrSector: string;
  status: ProjectStatus;
  statusLabel: string;
  category: ProjectCategory;
  year: string;
  location: string;
  summary: string;
  architectureHighlights: string[];
  stack: string[];
  impactMetrics: string;
  liveUrl?: string;
  solutionRef: string;
}

export const PROJECTS_CATALOG: ProductionProject[] = [
  {
    id: 'gemelo-digital-gastonbarea',
    code: 'PRJ-01',
    title: 'Plataforma Gemelo Digital Ejecutivo & Estructurador IA en Vivo',
    clientOrSector: 'gastonbarea.com · Consultoría Tecnológica & PMO',
    status: 'en-produccion',
    statusLabel: 'EN PRODUCCIÓN · ACTIVO 24/7',
    category: 'IA Services & Gemelos Digitales',
    year: '2025–2026',
    location: 'Patagonia · Global',
    summary:
      'Arquitectura full-stack con buscador semántico de soluciones, estructurador interactivo de hojas de ruta en 3 hitos (40·40·20%), Portal de Clientes y CRM ejecutivo.',
    architectureHighlights: [
      'Asistente y buscador IA de enrutamiento hacia verticales de ingeniería',
      'Generador dinámico de alcance técnico y presupuesto por fases verificables',
      'Portal de Clientes integrado con seguimiento de hitos y servidores Staging',
    ],
    stack: ['React 19', 'TypeScript', 'Node.js / Express', 'Gemini AI', 'Tailwind CSS', 'Render Cloud'],
    impactMetrics: '100% Automatización de Pre-Ingeniería · Operativo 24/7',
    liveUrl: 'https://gastonbarea.com',
    solutionRef: '02. IA Services: Gemelos Digitales, Agentes Inteligentes & BI',
  },
  {
    id: 'trazabilidad-bioeconomia-iot',
    code: 'PRJ-02',
    title: 'Sistema de Trazabilidad Bioeconómica & Pasaporte Digital de Lote',
    clientOrSector: 'Complejo Agroindustrial & Valorización de Biomasa',
    status: 'en-produccion',
    statusLabel: 'EN PRODUCCIÓN · PLANTA & CAMPO',
    category: 'Bioeconomía & Trazabilidad IoT',
    year: '2024–2026',
    location: 'Patagonia Argentina',
    summary:
      'Plataforma de captura de telemetría IoT en línea, control de rendimiento de transformación biológica y emisión de certificados auditables de origen a exportación.',
    architectureHighlights: [
      'Ingesta de datos de sensores de humedad, temperatura y pesaje continuo en planta',
      'Cálculo en tiempo real de huella operativa y mermas de proceso',
      'Generación de código QR con pasaporte digital por lote para auditorías ESG',
    ],
    stack: ['PostgreSQL', 'Python', 'MQTT / IoT', 'Odoo MRP', 'Docker', 'Ubuntu Server'],
    impactMetrics: '-42% Mermas en Planta · 100% Lotes Trazados',
    solutionRef: '03. Proyectos Basados en Bioeconomía & Trazabilidad IoT',
  },
  {
    id: 'odoo-v18-b2b2c-multideposito',
    code: 'PRJ-03',
    title: 'Arquitectura Unificada Odoo Community ERP v18 & E-Commerce B2B2C',
    clientOrSector: 'Red de Distribución Mayorista y Minorista Regional',
    status: 'en-produccion',
    statusLabel: 'EN PRODUCCIÓN · TRANSACCIONAL',
    category: 'Odoo ERP v18 & B2B2C',
    year: '2024–2026',
    location: 'Argentina',
    summary:
      'Implementación integral sin costos de licencias por usuario integrando inventario multidepósito, listas de precios diferenciadas, facturación electrónica y portal de autogestión B2B.',
    architectureHighlights: [
      'Sincronización bidireccional de catálogo y stock real entre sucursales y tienda online',
      'Reglas automáticas de crédito y descuentos por volumen para clientes corporativos',
      'Despliegue en contenedores Docker de alta disponibilidad sobre Linux',
    ],
    stack: ['Odoo Community v18', 'PostgreSQL 16', 'Python', 'Nginx', 'Docker Compose', 'Linux'],
    impactMetrics: '+165% Pedidos B2B Autogestionados · $0 Licencias Anuales',
    solutionRef: '05. Odoo Community ERP v18 & E-Commerce B2B2C',
  },
  {
    id: 'ebt-plataforma-analitica-productiva',
    code: 'PRJ-04',
    title: 'Plataforma SaaS para Empresa de Base Tecnológica (EBT)',
    clientOrSector: 'Consorcio de Innovación Científica-Productiva',
    status: 'realizado',
    statusLabel: 'PROYECTO REALIZADO · ENTREGADO',
    category: 'Base Tecnológica (EBTs)',
    year: '2024',
    location: 'Chubut · Patagonia',
    summary:
      'Estructuración técnica, diseño de producto mínimo viable (MVP) y escalamiento a arquitectura en producción para transferir propiedad intelectual científica al mercado B2B.',
    architectureHighlights: [
      'Diseño de base de datos multi-tenant con aislamiento de seguridad por organización',
      'Tableros ejecutivos de indicadores productivos y exportación de reportes técnicos',
      'Gobernanza PMO bajo esquema 40% inicio, 40% validación Staging y 20% producción',
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'WireGuard VPN'],
    impactMetrics: 'Salida a Producción en 6 Semanas · 100% Hitos Cumplidos',
    solutionRef: '01. Proyectos de Base Tecnológica & Plataformas Digitales',
  },
  {
    id: 'agente-rag-operaciones-b2b',
    code: 'PRJ-05',
    title: 'Agente Corporativo RAG & Automatización de Cotizaciones Técnicas',
    clientOrSector: 'Ingeniería & Suministros Industriales',
    status: 'en-produccion',
    statusLabel: 'EN PRODUCCIÓN · IA OPERATIVA',
    category: 'IA Services & Gemelos Digitales',
    year: '2025–2026',
    location: 'Remoto · Cono Sur',
    summary:
      'Motor de inteligencia artificial conectado a manuales técnicos, matrices de costos e historial de proyectos para asistir a ingenieros comerciales y clientes en tiempo real.',
    architectureHighlights: [
      'Indexación vectorial de especificaciones técnicas y normativas operativas',
      'Consulta en lenguaje natural con citas verificables a documentación interna',
      'Pre-armado automático de propuestas técnicas para revisión del equipo PMO',
    ],
    stack: ['Gemini API', 'TypeScript', 'PostgreSQL / pgvector', 'Node.js', 'Docker'],
    impactMetrics: '-68% Tiempo de Respuesta Comercial · Precisión Auditable',
    solutionRef: '02. IA Services: Gemelos Digitales, Agentes Inteligentes & BI',
  },
  {
    id: 'infraestructura-critica-linux-cluster',
    code: 'PRJ-06',
    title: 'Blindaje de Infraestructura Crítica Linux, VPN Industrial & Backups',
    clientOrSector: 'Operación Multi-Planta & Administración Central',
    status: 'realizado',
    statusLabel: 'PROYECTO REALIZADO · EN OPERACIÓN',
    category: 'Infraestructura Linux & Docker',
    year: '2023–2025',
    location: 'Patagonia Argentina',
    summary:
      'Consolidación de servidores dispersos en una arquitectura de contenedores Docker sobre Ubuntu LTS, interconexión segura entre plantas vía WireGuard VPN y recuperación ante desastres.',
    architectureHighlights: [
      'Segmentación de red y túneles encriptados de baja latencia entre sedes remotas',
      'Backups inmutables automatizados locales y en nube con pruebas de restauración',
      'Monitoreo proactivo de servicios críticos y bases de datos transaccionales',
    ],
    stack: ['Ubuntu LTS', 'Docker', 'WireGuard VPN', 'PostgreSQL', 'Nginx Reverse Proxy', 'Bash'],
    impactMetrics: '99.95% Uptime Anual · Soberanía Total de Datos',
    solutionRef: '06. Infraestructura Crítica Linux, Docker & Ciberseguridad',
  },
];
