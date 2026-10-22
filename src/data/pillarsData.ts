export interface PillarFeature {
  title: string;
  description: string;
  impactMetric: string;
  badge: string;
}

export interface StrategicPillar {
  id: 'business-innovation' | 'smart-business' | 'tech-stack';
  number: string;
  title: string;
  subtitle: string;
  tagline: string;
  colorScheme: {
    primary: string;
    light: string;
    glow: string;
    accent: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  };
  overview: string;
  keyDrivers: string[];
  features: PillarFeature[];
  kpis: {
    value: string;
    label: string;
    description: string;
  }[];
  realWorldScenario: {
    before: string;
    transformation: string;
    after: string;
  };
  technologiesOrMethodologies: string[];
}

export const STRATEGIC_PILLARS: StrategicPillar[] = [
  {
    id: 'business-innovation',
    number: '01',
    title: 'Business Innovación & Nuevos Modelos Digitales',
    subtitle: 'Reinvención de Propuestas de Valor, Plataformas B2B y Monetización Recurrente',
    tagline: 'De servicios transaccionales a ecosistemas digitales de alto margen y escalabilidad exponencial.',
    colorScheme: {
      primary: '#2563eb', // Blue
      light: '#eff6ff',
      glow: 'rgba(37, 99, 235, 0.25)',
      accent: 'from-blue-600 via-indigo-600 to-sky-500',
      border: 'border-blue-200/80',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
    },
    overview:
      'Ayudo a organizaciones y líderes a romper la trampa de la consultoría tradicional y el trabajo manual repetitivo. Diseñamos, validamos e implementamos modelos de negocio digitales basados en plataformas, productización de servicios, suscripciones recurrentes y ecosistemas multi-lado.',
    keyDrivers: [
      'Productización de Servicios: Transformar horas hombre en productos de software con márgenes >80%.',
      'Modelos de Ingresos Recurrentes (MRR/ARR): Arquitectura comercial y técnica para monetización continua.',
      'Plataformas B2B & Portales de Autoservicio: Descentralización del valor para que el cliente opere 24/7 sin intermediarios.',
      'Estrategias de Datos como Activo (Data Monetization): Creación de capas de inteligencia comercial de pago.',
    ],
    features: [
      {
        title: 'Productización de Know-How',
        description: 'Empaquetado de la experiencia corporativa en herramientas digitales y software proprietario.',
        impactMetric: 'Margen +65%',
        badge: 'High Margin',
      },
      {
        title: 'Nuevos Flujos de Monetización B2B',
        description: 'Diseño de planes escalonados, cobro por uso/API y esquemas de valor compartido.',
        impactMetric: 'MRR Predecible',
        badge: 'Recurring Revenue',
      },
      {
        title: 'Ecosistemas de Plataforma',
        description: 'Conexión de clientes, proveedores y partners en un único núcleo transaccional.',
        impactMetric: 'Efecto de Red',
        badge: 'Network Effect',
      },
      {
        title: 'Time-to-Market de Hipótesis',
        description: 'Ciclos de validación ágil de nuevos negocios en semanas en lugar de semestres.',
        impactMetric: '3x Más Veloz',
        badge: 'Speed Execution',
      },
    ],
    kpis: [
      { value: '3.4x', label: 'Multiplicador de LTV', description: 'Incremento en el valor de vida del cliente digital' },
      { value: '-48%', label: 'Costo de Adquisición', description: 'Reducción de fricción comercial vía autoservicio' },
      { value: '82%', label: 'Margen Bruto Promedio', description: 'En líneas de negocio digitalizadas y SaaS' },
    ],
    realWorldScenario: {
      before: 'Empresa tradicional vendiendo horas de consultoría y reportes estáticos en PDF que requerían 40 horas semanales por cliente.',
      transformation: 'Lanzamiento de plataforma analítica de autoservicio con diagnóstico continuo y recomendaciones automatizadas.',
      after: 'Suscripción mensual recurrente con onboarding en 5 minutos, atendiendo 12x más clientes con el mismo equipo.',
    },
    technologiesOrMethodologies: [
      'Value Proposition Canvas',
      'SaaS Unit Economics (CAC/LTV/Churn)',
      'Pricing Strategy B2B',
      'API-as-a-Product',
      'Stripe / Lemonsqueezy Workflows',
      'Self-serve Onboarding',
    ],
  },
  {
    id: 'smart-business',
    number: '02',
    title: 'Negocios Inteligentes & Operaciones Autónomas',
    subtitle: 'Decisiones en Tiempo Real con IA Generativa, Agentes y Business Intelligence',
    tagline: 'Fusión de inteligencia humana con sistemas autónomos para operar con precisión quirúrgica.',
    colorScheme: {
      primary: '#7c3aed', // Purple/Violet
      light: '#f5f3ff',
      glow: 'rgba(124, 58, 237, 0.25)',
      accent: 'from-purple-600 via-indigo-600 to-blue-600',
      border: 'border-purple-200/80',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
    },
    overview:
      'Un negocio inteligente no se limita a mirar gráficos del mes pasado; predice, recomienda y ejecuta acciones automáticamente. Diseñamos pipelines de datos vivos y agentes de IA autónomos que operan flujos de venta, atención, análisis de riesgo y optimización de márgenes.',
    keyDrivers: [
      'Agentes de IA Autónomos: Sistemas multi-rol que ejecutan flujos complejos de soporte, cotización y auditoría técnica.',
      'Business Intelligence Predictivo: Tableros dinámicos en tiempo real con alertas tempranas y forecasting financiero.',
      'Eliminación de Trabajo Manual: Reemplazo de planillas Excel dispersas por pipelines de datos centralizados y auditables.',
      'Hiper-Personalización Operacional: Modelos de lenguaje que adaptan respuestas y propuestas a cada cliente en segundos.',
    ],
    features: [
      {
        title: 'Agentes de Decisión Autónomos',
        description: 'Orquestación de LLMs multimodales con acceso a bases de datos y herramientas de ejecución.',
        impactMetric: '24/7 Sin Latencia',
        badge: 'Agentic AI',
      },
      {
        title: 'Data Observability & Live BI',
        description: 'Monitoreo de KPIs neurálgicos de negocio en tiempo real con alertas preventivas por desvío.',
        impactMetric: 'Decisiones en <3s',
        badge: 'Real-Time Insights',
      },
      {
        title: 'Flujos Automatizados Cero-Fricción',
        description: 'Conexión bidireccional entre CRM, ERP, pasarelas de pago y sistemas de entrega.',
        impactMetric: '-75% Tareas Manuales',
        badge: 'Zero Friction',
      },
      {
        title: 'Motor de Inteligencia de Clientes',
        description: 'Segmentación conductual y detección proactiva de riesgo de abandono (churn prevention).',
        impactMetric: '+32% Retención',
        badge: 'Retention Lift',
      },
    ],
    kpis: [
      { value: '72%', label: 'Ahorro Operativo', description: 'Reducción de horas dedicadas a tareas manuales y rutinarias' },
      { value: '< 2s', label: 'Latencia de Decisión', description: 'Tiempo promedio de procesamiento inteligente de datos' },
      { value: '99.2%', label: 'Precisión de Agentes', description: 'Tasa de resolución autónoma con validación de seguridad' },
    ],
    realWorldScenario: {
      before: 'Equipo comercial perdiendo 4 horas por prospecto armando presupuestos a mano y cruzando 3 sistemas distintos.',
      transformation: 'Implementación de agente inteligente conectado a inventario y base de precios que genera la propuesta técnica y contrato en 30 segundos.',
      after: 'Tasa de cierre duplicada por inmediatez de respuesta y equipo enfocado 100% en relaciones de alto valor.',
    },
    technologiesOrMethodologies: [
      'Google Gemini AI API (Multimodal)',
      'LangChain / LlamaIndex / Agentic Workflows',
      'Vector Search & RAG (Retrieval Augmented Gen)',
      'PostgreSQL pgvector',
      'Real-time WebSockets & Streaming',
      'Event-Driven Architectures',
    ],
  },
  {
    id: 'tech-stack',
    number: '03',
    title: 'Stack Técnico de Próxima Generación',
    subtitle: 'Arquitectura Cloud Serverless, Edge Computing, React 19 y Bases de Datos Resilientes',
    tagline: 'La columna vertebral de ingeniería que hace viable la escala masiva con máxima seguridad y velocidad.',
    colorScheme: {
      primary: '#0ea5e9', // Cyan/Sky
      light: '#f0f9ff',
      glow: 'rgba(14, 165, 233, 0.25)',
      accent: 'from-sky-600 via-blue-600 to-indigo-700',
      border: 'border-sky-200/80',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-700',
    },
    overview:
      'Un gran modelo de negocio y la mejor IA fracasan si la infraestructura es lenta, frágil o costosa de mantener. Implemento un stack moderno de producción probado: React 19, TypeScript estricto, Vercel Edge, Supabase/PostgreSQL con RLS, Linux robusto y Docker contenerizado.',
    keyDrivers: [
      'Edge Computing & Serverless: Despliegues globales ultra-rápidos sin costos fijos de servidores ociosos.',
      'Supabase & PostgreSQL Enterprise: Autenticación segura, Row Level Security (RLS) y almacenamiento reactivo.',
      'Frontend Reactivo & Fluido: React 19, Vite, Tailwind CSS v4 con animaciones a 60fps y accesibilidad.',
      'Seguridad & Resiliencia por Diseño: Zero Trust, cifrado end-to-end, copias de seguridad automáticas y CI/CD continuo.',
    ],
    features: [
      {
        title: 'Edge Architecture & Vercel',
        description: 'Distribución global con tiempos de carga inferiores a 50 milisegundos en cualquier región.',
        impactMetric: '<45ms Latencia',
        badge: 'Edge Global',
      },
      {
        title: 'Supabase & Postgres RLS',
        description: 'Control de acceso granular por fila a nivel de base de datos para máxima seguridad.',
        impactMetric: 'Zero Trust Data',
        badge: 'Bank-Grade Security',
      },
      {
        title: 'React 19 & TypeScript Estricto',
        description: 'Tipado de extremo a extremo que previene el 98% de los errores en tiempo de ejecución.',
        impactMetric: 'Cero Fails de Tipo',
        badge: 'Robust UI/UX',
      },
      {
        title: 'Contenedores Docker & Linux',
        description: 'Empaquetado inmutable y entornos de producción reproducibles sin vendor lock-in.',
        impactMetric: '99.98% Uptime',
        badge: 'High Availability',
      },
    ],
    kpis: [
      { value: '99.98%', label: 'Disponibilidad SLA', description: 'Uptime garantizado mediante topologías distribuidas' },
      { value: '< 50ms', label: 'Latencia Edge Global', description: 'Tiempo de respuesta a peticiones en nodos perimetrales' },
      { value: '100/100', label: 'Lighthouse Performance', description: 'Optimización de Core Web Vitals en producción' },
    ],
    realWorldScenario: {
      before: 'Monolito heredado con caídas de base de datos ante picos de tráfico y costos de infraestructura de miles de dólares.',
      transformation: 'Migración a stack desacoplado: Frontend en Vercel Edge, backend serverless y PostgreSQL gestionado en Supabase.',
      after: 'Costo mensual de infraestructura reducido un 80% y estabilidad perfecta soportando 10x más usuarios concurrentes.',
    },
    technologiesOrMethodologies: [
      'React 19 + TypeScript + Vite 6',
      'Tailwind CSS v4 + Fluid Animations',
      'Vercel Edge Network',
      'Supabase + PostgreSQL 16',
      'Drizzle ORM / Prisma',
      'Docker & Linux Debian/Ubuntu',
    ],
  },
];
