import {
  PROJECTS_CATALOG,
  type ProductionProject,
  type ProjectStatus,
  type ProjectCategory,
} from '../data/projectsData.ts';

export type PageSectionId =
  | 'inicio'
  | 'servicios'
  | 'ia-services'
  | 'bioeconomia'
  | 'proyectos'
  | 'trayectoria'
  | 'blog'
  | 'contacto'
  | 'portal-clientes'
  | 'admin'
  | 'solucion-ia';

export interface MatchedSolution {
  serviceCode: string;
  serviceTitle: string;
  sectionId: string;
  timeline: string;
  summary: string;
  ctaLabel: string;
}

export interface RuleBasedProposalInput {
  organizationType: string;
  primaryChallenge: string;
  currentStack: string[];
  urgency: string;
  description?: string;
}

export interface RuleBasedProposalOutput {
  architectureTitle: string;
  diagnosticSummary: string;
  estimatedTimeline: string;
  recommendedStack: string[];
  keyComponents: { name: string; detail: string }[];
  workPhases: { phase: string; duration: string; deliverable: string }[];
  tangibleBenefits: string[];
  executiveMessage: string;
  isAiGenerated: boolean;
}

export interface CustomAiTailoredService {
  code: string;
  title: string;
  problemSolved: string;
  technicalApproach: string;
  deliverable: string;
  impactMetric: string;
}

export interface CustomAiRoadmapPhase {
  phaseCode: string;
  percentage: string;
  title: string;
  duration: string;
  deliverable: string;
  verificationCriteria: string;
}

export interface CustomAiSolutionBlueprint {
  id: string;
  query: string;
  createdAt: string;
  solutionTitle: string;
  executiveDiagnosis: string;
  primaryVertical: string;
  estimatedTimeline: string;
  recommendedStack: string[];
  tailoredServices: CustomAiTailoredService[];
  roadmapPhases: CustomAiRoadmapPhase[];
  recommendedProjectIds: string[];
  matchedSolution: MatchedSolution;
  isAiGenerated?: boolean;
}

/**
 * Resolves any URL hash or section identifier into a valid PageSectionId
 */
export function resolvePageFromHash(rawHash: string): PageSectionId {
  const cleanId = (rawHash || '').replace(/^#/, '').split('/')[0].toLowerCase().trim();
  const targetMap: Record<string, PageSectionId> = {
    inicio: 'inicio',
    home: 'inicio',
    servicios: 'servicios',
    soluciones: 'servicios',
    innovacion: 'servicios',
    ebts: 'servicios',
    'pmo-clientes': 'servicios',
    'odoo-v18': 'servicios',
    'linux-docker': 'servicios',
    odoo: 'servicios',
    'ecommerce-b2b2c': 'servicios',
    'ia-services': 'ia-services',
    'diagnostico-ia': 'ia-services',
    'gemelo-digital': 'ia-services',
    bioeconomia: 'bioeconomia',
    casos: 'bioeconomia',
    proyectos: 'proyectos',
    portfolio: 'proyectos',
    portafolio: 'proyectos',
    produccion: 'proyectos',
    experience: 'trayectoria',
    experiencia: 'trayectoria',
    trayectoria: 'trayectoria',
    'project-manager': 'trayectoria',
    perfil: 'trayectoria',
    blog: 'blog',
    publicaciones: 'blog',
    contacto: 'contacto',
    portal: 'portal-clientes',
    clientes: 'portal-clientes',
    cliente: 'portal-clientes',
    'portal-clientes': 'portal-clientes',
    admin: 'admin',
    dashboard: 'admin',
    crm: 'admin',
    panel: 'admin',
    'solucion-ia': 'solucion-ia',
    'solucion-personalizada': 'solucion-ia',
    'propuesta-ia': 'solucion-ia',
  };
  return targetMap[cleanId] || 'inicio';
}

/**
 * Resolves specific solution sub-hashes to their service card code (01..06)
 */
export function resolveServiceCodeFromHash(rawHash: string): string | undefined {
  const cleanId = (rawHash || '').replace(/^#/, '').split('/')[0].toLowerCase().trim();
  const codeMap: Record<string, string> = {
    ebts: '01',
    'ia-services': '02',
    bioeconomia: '03',
    'pmo-clientes': '04',
    'odoo-v18': '05',
    odoo: '05',
    'ecommerce-b2b2c': '05',
    'linux-docker': '06',
  };
  return codeMap[cleanId];
}

/**
 * Maps any user natural-language query to the concrete solution and section inside gastonbarea.com
 */
export function matchWebSolution(text: string): MatchedSolution {
  const lower = (text || '').toLowerCase();

  if (
    lower.includes('bio') ||
    lower.includes('agro') ||
    lower.includes('circular') ||
    lower.includes('biomasa') ||
    lower.includes('iot') ||
    lower.includes('trazabilidad') ||
    lower.includes('forestal')
  ) {
    return {
      serviceCode: '03',
      serviceTitle: '03. Proyectos Basados en Bioeconomía & Trazabilidad IoT',
      sectionId: '#bioeconomia',
      timeline: '6 a 10 semanas',
      summary:
        'Trazabilidad digital de lotes biológicos, telemetría IoT en planta/campo y valorización de biomasa con indicadores en tiempo real.',
      ctaLabel: 'Explorar Solución de Bioeconomía',
    };
  }

  if (
    lower.includes('ia') ||
    lower.includes('inteligencia') ||
    lower.includes('gemelo') ||
    lower.includes('agent') ||
    lower.includes('rag') ||
    lower.includes('automatiz') ||
    lower.includes('bi')
  ) {
    return {
      serviceCode: '02',
      serviceTitle: '02. IA Services, Gemelos Digitales & Business Intelligence',
      sectionId: '#ia-services',
      timeline: '3 a 6 semanas',
      summary:
        'Despliegue de arquitecturas web interactivas con IA, Gemelos Digitales corporativos, agentes RAG y estructurador en vivo.',
      ctaLabel: 'Abrir IA Services & Estructurador',
    };
  }

  if (
    lower.includes('odoo') ||
    lower.includes('erp') ||
    lower.includes('ecommerce') ||
    lower.includes('b2b') ||
    lower.includes('mayorista') ||
    lower.includes('stock') ||
    lower.includes('factur')
  ) {
    return {
      serviceCode: '05',
      serviceTitle: '05. Odoo Community ERP v18 & E-Commerce B2B2C',
      sectionId: '#odoo-v18',
      timeline: '5 a 7 semanas',
      summary:
        'Unificación de inventario, producción MRP, facturación fiscal y portales B2B/B2C sin costo de licencias por usuario.',
      ctaLabel: 'Ver Solución Odoo & B2B2C',
    };
  }

  if (
    lower.includes('portafolio') ||
    lower.includes('portfolio') ||
    lower.includes('producción') ||
    lower.includes('produccion') ||
    lower.includes('realizados')
  ) {
    return {
      serviceCode: '01',
      serviceTitle: 'Portfolio de Proyectos Realizados & En Producción',
      sectionId: '#proyectos',
      timeline: 'Activos 24/7',
      summary:
        'Sistemas en producción continua y arquitecturas entregadas en IA Services, Bioeconomía IoT, Odoo ERP v18 e Infraestructura Linux.',
      ctaLabel: 'Ver Proyectos en Producción',
    };
  }

  if (
    lower.includes('pmo') ||
    lower.includes('dirección') ||
    lower.includes('direccion') ||
    lower.includes('experience') ||
    lower.includes('trayectoria') ||
    lower.includes('lider') ||
    lower.includes('equipo') ||
    lower.includes('plazo')
  ) {
    return {
      serviceCode: '04',
      serviceTitle: '04. Dirección Ejecutiva de Proyectos (14 Años PMO)',
      sectionId: '#experience',
      timeline: 'Ciclos por Hitos 40 · 40 · 20%',
      summary:
        '30 años en el sector tecnológico-productivo y 14 años liderando proyectos con clientes. Gobernanza técnica, Staging verificable y Portal de Clientes.',
      ctaLabel: 'Ver Experience & Metodología PMO',
    };
  }

  if (
    lower.includes('linux') ||
    lower.includes('docker') ||
    lower.includes('servidor') ||
    lower.includes('seguridad') ||
    lower.includes('vpn') ||
    lower.includes('cloud')
  ) {
    return {
      serviceCode: '06',
      serviceTitle: '06. Infraestructura Crítica Linux, Docker & Soberanía',
      sectionId: '#linux-docker',
      timeline: '2 a 4 semanas',
      summary:
        'Contenerización con Docker Compose, servidores Ubuntu blindados, VPN WireGuard y continuidad operativa 24/7.',
      ctaLabel: 'Ver Infraestructura Crítica',
    };
  }

  return {
    serviceCode: '01',
    serviceTitle: '01. Consultoría y Desarrollo de Proyectos de Base Tecnológica',
    sectionId: '#ebts',
    timeline: '4 a 8 semanas',
    summary:
      'Estructuración técnica, económica y de software para Empresas de Base Tecnológica (EBTs) y sistemas productivos.',
    ctaLabel: 'Ver Proyectos de Base Tecnológica',
  };
}

/**
 * Generates a structured architecture & PMO proposal when AI API key is absent or in fallback mode
 */
export function generateRuleBasedProposal(
  payload: RuleBasedProposalInput
): RuleBasedProposalOutput {
  const { organizationType = '', primaryChallenge = '', urgency = 'Media' } = payload;
  const challengeLower = primaryChallenge.toLowerCase();
  const orgLower = organizationType.toLowerCase();

  let title = 'Arquitectura Integral: Proyecto de Base Tecnológica & Gestión Productiva';
  let stack = [
    'Odoo Community ERP v18',
    'PostgreSQL 16 + Supabase',
    'React 19 + TypeScript',
    'Docker Compose & Linux',
    'Sensores IoT & BI',
  ];
  let time = '4 a 8 semanas';
  let diag = `A partir de mis 30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes, identifico la necesidad de articular la operación física y comercial en una arquitectura unificada, trazable y escalable.`;

  if (
    challengeLower.includes('ia services') ||
    challengeLower.includes('gemelo') ||
    challengeLower.includes('rag')
  ) {
    title = 'Arquitectura IA Services: Gemelo Digital Corporativo, Agentes RAG & Business Intelligence';
    stack = [
      'Gemini AI / LLMs',
      'React 19 + TypeScript',
      'PostgreSQL + pgvector (RAG)',
      'Node.js / Express API',
      'Docker & Linux Cloud',
    ];
    time = '3 a 6 semanas';
    diag = `Convertimos la presencia web y los repositorios documentales de su organización en un Gemelo Digital interactivo capaz de diagnosticar requerimientos, asistir a clientes 24/7 y conectar datos operativos con tableros ejecutivos.`;
  } else if (
    challengeLower.includes('bio') ||
    challengeLower.includes('agro') ||
    challengeLower.includes('circular') ||
    orgLower.includes('bio')
  ) {
    title =
      'Plataforma de Bioeconomía: Trazabilidad Productiva, Valorización de Biomasa & Telemetría IoT';
    stack = [
      'Sensores IoT & Telemetría MQTT',
      'PostgreSQL + TimescaleDB',
      'Odoo MRP & Trazabilidad Lotes',
      'Dashboards BI en Tiempo Real',
      'Linux Docker Edge',
    ];
    time = '6 a 10 semanas';
    diag = `En los proyectos de bioeconomía y producción sostenible, la rentabilidad depende de medir en tiempo real la conversión de biomasa, la huella hídrica/de carbono y la trazabilidad de punta a punta para certificar valor en mercados exigentes.`;
  } else if (
    challengeLower.includes('dirección') ||
    challengeLower.includes('direccion') ||
    challengeLower.includes('pmo') ||
    challengeLower.includes('liderazgo') ||
    challengeLower.includes('rescate')
  ) {
    title = 'Dirección Ejecutiva de Proyecto (PMO Externa) & Reingeniería de Procesos';
    stack = [
      'Metodología Híbrida Ágil / Etapa-Puerta',
      'Matriz de Hitos 40·40·20% & SLA Auditables',
      'Arquitectura Desacoplada Docker',
      'Tablero Ejecutivo de Avance',
      'Repositorio & CI/CD',
    ];
    time = '4 a 6 semanas (Ciclo Inicial)';
    diag = `Con 14 años dirigiendo proyectos complejos junto a clientes, estructuramos la gobernanza técnica, alineamos proveedores y equipos de desarrollo, eliminamos sobrecostos y aseguramos entregables auditables por hito.`;
  } else if (
    challengeLower.includes('erp') ||
    challengeLower.includes('odoo') ||
    challengeLower.includes('ecommerce') ||
    challengeLower.includes('b2b')
  ) {
    title = 'Ecosistema Productivo: Odoo Community ERP v18 + Portal E-Commerce B2B2C';
    stack = [
      'Odoo Community v18 (Sin Licencias)',
      'Storefront React 19 B2B/B2C',
      'PostgreSQL 16 Optimizado',
      'Pasarelas Mercado Pago & Stripe',
      'Ubuntu Server + Docker',
    ];
    time = '5 a 7 semanas';
    diag = `Unificamos inventario, producción, facturación fiscal y canales mayoristas/minoristas en una arquitectura abierta sin costos de licencias por usuario, garantizando soberanía de datos y escalabilidad.`;
  } else if (urgency.includes('Crítica') || challengeLower.includes('servidor') || challengeLower.includes('linux')) {
    title = 'Blindaje de Infraestructura Crítica, Contenerización Docker & Continuidad 24/7';
    stack = [
      'Ubuntu Server 24.04 LTS',
      'Docker Compose & Aislamiento',
      'PostgreSQL 16 Replicado',
      'WireGuard VPN & Firewall UFW',
      'Backups S3 Automatizados',
    ];
    time = '2 a 4 semanas';
    diag = `Eliminamos los puntos únicos de fallo aislando servicios críticos en contenedores Linux con monitoreo proactivo y políticas de recuperación ante desastres probadas.`;
  }

  return {
    architectureTitle: title,
    diagnosticSummary: diag,
    estimatedTimeline: time,
    recommendedStack: stack,
    keyComponents: [
      {
        name: 'Dirección Ejecutiva & Gobernanza (PMO)',
        detail:
          'Planificación por hitos validables basada en 14 años liderando implementaciones reales con clientes.',
      },
      {
        name: 'Núcleo Tecnológico & Productivo',
        detail:
          'Integración de procesos físicos, industriales o bioeconómicos con sistemas digitales de misión crítica.',
      },
      {
        name: 'Inteligencia de Datos & Trazabilidad',
        detail:
          'Base de datos PostgreSQL auditada con indicadores clave de rendimiento (KPIs), costos y márgenes en vivo.',
      },
      {
        name: 'Soberanía Tecnológica & Escalabilidad',
        detail:
          'Infraestructura abierta sobre Linux y Docker sin ataduras de licencias perpetuas ni costos ocultos.',
      },
    ],
    workPhases: [
      {
        phase: 'Fase 1 (40%): Relevamiento Ejecutivo & Arquitectura Base',
        duration: 'Semana 1',
        deliverable:
          'Diagnóstico integral de procesos, matriz de riesgos y hoja de ruta con presupuesto cerrado por hitos.',
      },
      {
        phase: 'Fase 2 (40%): Prototipado Funcional & Validación en Servidor Staging',
        duration: 'Semanas 2 a 4',
        deliverable:
          'Despliegue del entorno de pruebas funcional con datos reales e integración de módulos clave.',
      },
      {
        phase: 'Fase 3 (20%): Homologación & Puesta en Producción',
        duration: 'Semanas 5 a 6',
        deliverable:
          'Salida en vivo sin interrupción operativa, capacitación a equipos y transferencia de control.',
      },
      {
        phase: 'Fase 4: Seguimiento Continuo en Portal de Clientes',
        duration: 'Acompañamiento Post Go-Live',
        deliverable:
          'Monitoreo de métricas de retorno (ROI), soporte SLA y evolución continua del proyecto.',
      },
    ],
    tangibleBenefits: [
      'Respaldo directo de 30 años de experiencia en el sector tecnológico-productivo',
      'Dirección de proyecto senior (14 años PMO) que evita desvíos de alcance y presupuesto',
      'Trazabilidad completa desde el insumo biológico/industrial hasta la facturación B2B2C',
      'Propiedad total del código e infraestructura sin costos de licencias por usuario',
    ],
    executiveMessage: `Soy el Gemelo Digital de Gastón Barea. He estructurado esta hoja de ruta preliminar para ${
      organizationType || 'su organización'
    } combinando ingeniería de base tecnológica y visión productiva. Podemos validar cada etapa en una sesión directa de 30 minutos por Google Meet Pro.`,
    isAiGenerated: false,
  };
}

/**
 * Masks an email address for secure display (e.g. gastonbarea.com@gmail.com -> ga***m@gmail.com)
 */
export function maskEmail(email: string): string {
  const parts = (email || '').split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return '***@***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName =
    name.length > 3 ? name.slice(0, 2) + '***' + name.slice(-1) : name[0] + '***';
  return `${maskedName}@${domain}`;
}

/**
 * Extracts a clean 11-character YouTube Video ID from any YouTube URL or raw ID
 */
export function extractYoutubeId(input: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  return trimmed;
}

/**
 * Filters the production projects catalog by status and category
 */
export function filterProjectsCatalog(
  projects: ProductionProject[] = PROJECTS_CATALOG,
  statusFilter: 'todos' | ProjectStatus = 'todos',
  categoryFilter: 'Todas' | ProjectCategory = 'Todas'
): ProductionProject[] {
  return projects.filter((proj) => {
    const matchesStatus = statusFilter === 'todos' || proj.status === statusFilter;
    const matchesCategory = categoryFilter === 'Todas' || proj.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });
}

/**
 * Validates executive contact form inputs
 */
export function validateContactForm(fields: {
  name: string;
  email: string;
  company: string;
  requirements: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!fields.name || !fields.name.trim()) {
    errors.name = 'El nombre es obligatorio';
  }
  if (!fields.email || !fields.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (!/^\S+@\S+\.\S+$/.test(fields.email.trim())) {
    errors.email = 'Ingresá un formato de correo electrónico válido';
  }
  if (!fields.company || !fields.company.trim()) {
    errors.company = 'La empresa u organización es obligatoria';
  }
  if (!fields.requirements || !fields.requirements.trim()) {
    errors.requirements = 'Por favor describí brevemente el proyecto o consulta';
  }
  return errors;
}

/**
 * Synthesizes a bespoke CustomAiSolutionBlueprint dynamically from any natural language query
 * Reorganizes services, builds 3 tailored modules, defines the 40/40/20 roadmap, and reorders production projects.
 */
export function buildCustomSolutionBlueprint(rawQuery: string): CustomAiSolutionBlueprint {
  const cleanQuery = (rawQuery || '').trim() || 'Arquitectura tecnológica y dirección ejecutiva de proyecto';
  const lower = cleanQuery.toLowerCase();
  const matchedSolution = matchWebSolution(cleanQuery);

  const isBio =
    lower.includes('bio') ||
    lower.includes('agro') ||
    lower.includes('cultivo') ||
    lower.includes('biomasa') ||
    lower.includes('circular') ||
    lower.includes('trazabilidad') ||
    lower.includes('forestal') ||
    lower.includes('campo');

  const isIndustry40 =
    lower.includes('industria') ||
    lower.includes('4.0') ||
    lower.includes('planta') ||
    lower.includes('iot') ||
    lower.includes('sensor') ||
    lower.includes('telemetr') ||
    lower.includes('mantenimiento') ||
    lower.includes('scada') ||
    lower.includes('producción') ||
    lower.includes('produccion');

  const isOdooErp =
    lower.includes('odoo') ||
    lower.includes('erp') ||
    lower.includes('b2b') ||
    lower.includes('ecommerce') ||
    lower.includes('stock') ||
    lower.includes('inventario') ||
    lower.includes('mayorista') ||
    lower.includes('factur');

  const isAiTwin =
    lower.includes('ia') ||
    lower.includes('inteligencia') ||
    lower.includes('gemelo') ||
    lower.includes('agent') ||
    lower.includes('rag') ||
    lower.includes('chatbot') ||
    lower.includes('automatiz') ||
    lower.includes('bi');

  const isInfra =
    lower.includes('linux') ||
    lower.includes('docker') ||
    lower.includes('servidor') ||
    lower.includes('vpn') ||
    lower.includes('seguridad') ||
    lower.includes('cloud');

  if (isBio) {
    return {
      id: `sol-bio-${Date.now()}`,
      query: cleanQuery,
      createdAt: new Date().toISOString(),
      solutionTitle: `Arquitectura de Bioeconomía & Trazabilidad IoT para: "${cleanQuery}"`,
      executiveDiagnosis: `A partir de mis 30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes, he reorganizado nuestros módulos de ingeniería para abordar "${cleanQuery}".\n\nLa solución articula captura de datos en campo/planta mediante telemetría IoT, pasaporte digital de lote biológico para auditorías ESG/exportación y control de costos productivos en tiempo real sobre una infraestructura soberana sin licencias por usuario.`,
      primaryVertical: '03. Proyectos Basados en Bioeconomía & Trazabilidad IoT',
      estimatedTimeline: '6 a 9 semanas (Esquema 40 · 40 · 20%)',
      recommendedStack: [
        'Sensores IoT & Telemetría MQTT',
        'PostgreSQL 16 + TimescaleDB',
        'Odoo MRP Trazabilidad de Lotes',
        'Pasaporte Digital QR / ESG',
        'Docker Compose sobre Ubuntu LTS',
      ],
      tailoredServices: [
        {
          code: '01',
          title: 'Telemetría IoT de Campo/Planta & Ingesta en Tiempo Real',
          problemSolved: `Elimina los registros manuales dispersos y puntos ciegos operativos asociados a "${cleanQuery}".`,
          technicalApproach:
            'Nodos de captura MQTT conectados a sensores de humedad, temperatura, caudal o pesaje continuo con buffer offline-first.',
          deliverable:
            'Pipeline de datos auditado en vivo con alertas tempranas y panel operativo por lote.',
          impactMetric: '-42% Mermas Operativas',
        },
        {
          code: '02',
          title: 'Pasaporte Digital de Lote Biológico & Certificación de Origen',
          problemSolved:
            'Permite demostrar trazabilidad completa de punta a punta y huella ambiental ante compradores B2B y organismos certificadores.',
          technicalApproach:
            'Motor de trazabilidad por lote con genealogía de transformación de biomasa/cultivos y emisión automática de certificados QR.',
          deliverable:
            'Módulo de Pasaporte Digital verificable para cada lote de producción o exportación.',
          impactMetric: '100% Lotes Trazados',
        },
        {
          code: '03',
          title: 'Control de Costos Bioindustriales & BI Ejecutivo',
          problemSolved:
            'Conecta los rendimientos físicos de campo y planta con la rentabilidad económica real por lote.',
          technicalApproach:
            'Integración con Odoo Community v18 MRP y tableros predictivos de rendimiento energético e insumos.',
          deliverable:
            'Tablero gerencial de costos por unidad biológica producida y seguimiento en Portal Clientes.',
          impactMetric: '+28% Visibilidad de Margen',
        },
      ],
      roadmapPhases: [
        {
          phaseCode: 'FASE 01',
          percentage: '40%',
          title: 'Relevamiento Bioindustrial, Matriz de Sensores & Arquitectura de Datos',
          duration: 'Semanas 1 a 2',
          deliverable:
            'Blueprint técnico de puntos de captura IoT, modelo de datos de lotes biológicos y despliegue del repositorio base.',
          verificationCriteria:
            'Aprobación del diagrama de arquitectura y diccionario de variables críticas en el Portal de Clientes.',
        },
        {
          phaseCode: 'FASE 02',
          percentage: '40%',
          title: 'Prototipo Funcional & Validación en Servidor Staging con Datos de Lote',
          duration: 'Semanas 3 a 6',
          deliverable:
            'Entorno Staging operativo procesando lecturas de telemetría, trazabilidad de lotes y emisión de certificados QR.',
          verificationCriteria:
            'Pruebas de aceptación (UAT) exitosas con lotes reales del cliente antes de pasar a producción.',
        },
        {
          phaseCode: 'FASE 03',
          percentage: '20%',
          title: 'Puesta en Producción en Planta/Campo & Transferencia PMO',
          duration: 'Semanas 7 a 8',
          deliverable:
            'Sistema en producción 24/7 sobre contenedores Docker, capacitación a operadores y monitoreo SLA.',
          verificationCriteria:
            'Operación continua validada y entrega de credenciales soberanas.',
        },
      ],
      recommendedProjectIds: [
        'trazabilidad-bioeconomia-iot',
        'ebt-plataforma-analitica-productiva',
        'odoo-v18-b2b2c-multideposito',
      ],
      matchedSolution,
      isAiGenerated: false,
    };
  }

  if (isIndustry40) {
    return {
      id: `sol-ind40-${Date.now()}`,
      query: cleanQuery,
      createdAt: new Date().toISOString(),
      solutionTitle: `Arquitectura Industria 4.0, Telemetría & Control Operativo para: "${cleanQuery}"`,
      executiveDiagnosis: `Para resolver "${cleanQuery}" con estándar industrial, he diseñado una solución que integra la planta física con inteligencia operativa en tiempo real. Con 30 años en el sector tecnológico-productivo y 14 años como Project Manager (PMO), estructuramos la digitalización industrial evitando costosas licencias propietarias y garantizando disponibilidad 24/7.`,
      primaryVertical: '01. Consultoría y Desarrollo de Proyectos de Base Tecnológica (Industria 4.0)',
      estimatedTimeline: '5 a 8 semanas (Esquema 40 · 40 · 20%)',
      recommendedStack: [
        'Edge Computing Linux & Docker',
        'Protocolos Industriales MQTT / OPC-UA',
        'PostgreSQL 16 + Series Temporales',
        'Odoo MRP v18 Producción',
        'Agentes IA de Diagnóstico Operativo',
      ],
      tailoredServices: [
        {
          code: '01',
          title: 'Digitalización de Planta & Monitoreo OEE en Tiempo Real',
          problemSolved: `Resuelve la falta de visibilidad instantánea sobre paradas de línea, cuellos de botella y eficiencia en "${cleanQuery}".`,
          technicalApproach:
            'Captura de eventos de máquinas, líneas de producción y consumo energético hacia una base de datos centralizada de baja latencia.',
          deliverable:
            'Tablero de comando industrial en vivo (Disponibilidad, Rendimiento y Calidad OEE).',
          impactMetric: '+24% Eficiencia OEE',
        },
        {
          code: '02',
          title: 'Integración MRP de Órdenes de Fabricación, Stock e Insumos',
          problemSolved:
            'Elimina el desfase entre lo que ocurre en el piso de planta y el sistema administrativo/comercial.',
          technicalApproach:
            'Sincronización bidireccional de órdenes de trabajo, consumos de materia prima y costos industriales con Odoo v18.',
          deliverable:
            'Módulo de planificación y control de producción sin licencias por operador.',
          impactMetric: '100% Sincronización Planta-ERP',
        },
        {
          code: '03',
          title: 'Asistente IA de Mantenimiento & Procedimientos Técnicos (RAG)',
          problemSolved:
            'Reduce el tiempo de resolución de fallas críticas asistiendo a técnicos e ingenieros con manuales e historial.',
          technicalApproach:
            'Agente IA entrenado con manuales de equipos, bitácoras de mantenimiento y órdenes de trabajo históricas.',
          deliverable:
            'Copiloto técnico consultable desde cualquier terminal de planta o móvil.',
          impactMetric: '-35% Tiempo de Parada No Planificada',
        },
      ],
      roadmapPhases: [
        {
          phaseCode: 'FASE 01',
          percentage: '40%',
          title: 'Auditoría de Piso de Planta & Arquitectura de Integración 4.0',
          duration: 'Semanas 1 a 2',
          deliverable:
            'Mapa de conectividad industrial, arquitectura de contenedores Edge/Cloud y definición de KPIs OEE.',
          verificationCriteria:
            'Validación ejecutiva del alcance técnico y entorno base aprovisionado.',
        },
        {
          phaseCode: 'FASE 02',
          percentage: '40%',
          title: 'Despliegue en Servidor Staging & Simulación de Flujos Productivos',
          duration: 'Semanas 3 a 5',
          deliverable:
            'Tableros industriales, reglas de alertas y flujo MRP funcionando en servidor Staging con datos reales.',
          verificationCriteria:
            'Homologación junto a jefes de planta y dirección técnica en Portal Clientes.',
        },
        {
          phaseCode: 'FASE 03',
          percentage: '20%',
          title: 'Puesta en Marcha Industrial & Blindaje de Continuidad 24/7',
          duration: 'Semanas 6 a 7',
          deliverable:
            'Salida en vivo sin detener la operación, túneles VPN WireGuard y esquema de backups automatizados.',
          verificationCriteria:
            'Auditoría de rendimiento superada y transferencia completa al equipo.',
        },
      ],
      recommendedProjectIds: [
        'trazabilidad-bioeconomia-iot',
        'infraestructura-critica-linux-cluster',
        'agente-rag-operaciones-b2b',
      ],
      matchedSolution,
      isAiGenerated: false,
    };
  }

  if (isOdooErp) {
    return {
      id: `sol-odoo-${Date.now()}`,
      query: cleanQuery,
      createdAt: new Date().toISOString(),
      solutionTitle: `Ecosistema Odoo Community ERP v18 & Comercio B2B2C para: "${cleanQuery}"`,
      executiveDiagnosis: `Analizando tu necesidad ("${cleanQuery}"), hemos estructurado una arquitectura transaccional unificada sobre Odoo Community v18 y contenedores Docker en Linux. Esto te permite escalar usuarios, depósitos, producción y canales B2B/B2C con $0 en costos de licencias anuales y soberanía total sobre tu base de datos PostgreSQL.`,
      primaryVertical: '05. Odoo Community ERP v18 & E-Commerce B2B2C',
      estimatedTimeline: '5 a 7 semanas (Esquema 40 · 40 · 20%)',
      recommendedStack: [
        'Odoo Community ERP v18',
        'PostgreSQL 16 Optimizado',
        'Portal Mayorista B2B & E-Commerce B2C',
        'Docker Compose & Nginx',
        'Ubuntu Server 24.04 LTS',
      ],
      tailoredServices: [
        {
          code: '01',
          title: 'Núcleo ERP Unificado (Inventario Multidepósito, Compras, MRP y Facturación)',
          problemSolved: `Elimina las planillas aisladas, doble carga de datos y quiebres de stock planteados en "${cleanQuery}".`,
          technicalApproach:
            'Parametrización de Odoo Community v18 adaptada a los circuitos fiscales, logísticos y productivos de tu organización.',
          deliverable:
            'ERP central en producción sin límite de usuarios ni costos de licencias perpetuas.',
          impactMetric: '$0 Costo en Licencias por Usuario',
        },
        {
          code: '02',
          title: 'Portal de Autogestión Mayorista B2B & Tienda Minorista B2C',
          problemSolved:
            'Automatiza la toma de pedidos corporativos con listas de precios diferenciadas, límites de crédito y stock real.',
          technicalApproach:
            'Catálogo transaccional conectado en tiempo real al inventario central y cuentas corrientes de clientes.',
          deliverable:
            'Canal digital B2B2C activo 24/7 integrado directamente a logística y facturación.',
          impactMetric: '+165% Agilidad en Pedidos B2B',
        },
        {
          code: '03',
          title: 'Migración Limpia de Datos & Gobernanza PMO (14 Años de Experiencia)',
          problemSolved:
            'Previene el fracaso habitual en implementaciones ERP por falta de liderazgo técnico o migraciones defectuosas.',
          technicalApproach:
            'Scripts de saneamiento e importación de maestros de artículos, clientes y saldos en entorno Staging verificable.',
          deliverable:
            'Migración auditada y capacitación por rol operativo antes del corte en vivo.',
          impactMetric: '100% Continuidad Operativa en Go-Live',
        },
      ],
      roadmapPhases: [
        {
          phaseCode: 'FASE 01',
          percentage: '40%',
          title: 'Ingeniería de Procesos, Mapa de Módulos & Servidor Base',
          duration: 'Semanas 1 a 2',
          deliverable:
            'Definición de circuitos comerciales/productivos, plan de cuentas y aprovisionamiento de Odoo v18 en Docker.',
          verificationCriteria:
            'Aprobación de matriz de procesos y acceso al entorno inicial desde el Portal Clientes.',
        },
        {
          phaseCode: 'FASE 02',
          percentage: '40%',
          title: 'Parametrización, Migración de Datos & Pruebas en Staging',
          duration: 'Semanas 3 a 5',
          deliverable:
            'Catálogo, listas de precios, flujos B2B2C y facturación operando con datos reales de prueba en Staging.',
          verificationCriteria:
            'Simulación completa de ciclo compra-producción-venta aprobada por tu equipo.',
        },
        {
          phaseCode: 'FASE 03',
          percentage: '20%',
          title: 'Corte a Producción, Capacitación por Roles & Soporte SLA',
          duration: 'Semanas 6 a 7',
          deliverable:
            'Puesta en vivo definitiva, backups S3 automatizados y acompañamiento asistido.',
          verificationCriteria:
            'Primer ciclo operativo y fiscal cerrado con éxito en producción.',
        },
      ],
      recommendedProjectIds: [
        'odoo-v18-b2b2c-multideposito',
        'agente-rag-operaciones-b2b',
        'infraestructura-critica-linux-cluster',
      ],
      matchedSolution,
      isAiGenerated: false,
    };
  }

  if (isInfra) {
    return {
      id: `sol-infra-${Date.now()}`,
      query: cleanQuery,
      createdAt: new Date().toISOString(),
      solutionTitle: `Blindaje de Infraestructura Linux, Contenedores Docker & Soberanía para: "${cleanQuery}"`,
      executiveDiagnosis: `Para abordar "${cleanQuery}", diseñamos una arquitectura de infraestructura crítica orientada a continuidad operativa 24/7, aislamiento en contenedores Docker y soberanía total de datos. Eliminamos dependencias frágiles y aseguramos comunicaciones encriptadas entre sedes y equipos remotos.`,
      primaryVertical: '06. Infraestructura Crítica Linux, Docker & Soberanía',
      estimatedTimeline: '2 a 4 semanas (Esquema 40 · 40 · 20%)',
      recommendedStack: [
        'Ubuntu Server 24.04 LTS',
        'Docker Compose & Orquestación',
        'WireGuard VPN Industrial',
        'PostgreSQL 16 Replicado',
        'Nginx Reverse Proxy & Backups Inmutables',
      ],
      tailoredServices: [
        {
          code: '01',
          title: 'Contenerización de Aplicaciones Críticas & Alta Disponibilidad',
          problemSolved: `Elimina caídas imprevistas y conflictos de dependencias en los servidores vinculados a "${cleanQuery}".`,
          technicalApproach:
            'Empaquetado de servicios web, ERP y bases de datos en contenedores Docker aislados con reinicio automático y límites de recursos.',
          deliverable:
            'Infraestructura declarativa reproducible en minutos ante cualquier contingencia.',
          impactMetric: '99.95% Uptime Operativo',
        },
        {
          code: '02',
          title: 'Red Privada WireGuard VPN & Hardening de Seguridad Linux',
          problemSolved:
            'Protege bases de datos y sistemas internos frente a accesos no autorizados o exposición pública innecesaria.',
          technicalApproach:
            'Túneles encriptados de baja latencia entre plantas/oficinas, firewall UFW estricto y auditoría de accesos SSH.',
          deliverable:
            'Anillo de seguridad perimetral y acceso remoto seguro para directivos y operadores.',
          impactMetric: '100% Tráfico Interno Encriptado',
        },
        {
          code: '03',
          title: 'Política de Backups Inmutables 3-2-1 & Recuperación ante Desastres',
          problemSolved:
            'Garantiza que el negocio nunca pierda información transaccional ante fallos de hardware o incidentes.',
          technicalApproach:
            'Snapshots automáticos diarios/horarios con verificación de restauración en entorno aislado.',
          deliverable:
            'Protocolo DRP probado y monitoreo proactivo de salud de servidores.',
          impactMetric: 'RPO < 15 Minutos',
        },
      ],
      roadmapPhases: [
        {
          phaseCode: 'FASE 01',
          percentage: '40%',
          title: 'Auditoría de Servidores, Topología de Red & Matriz de Riesgos',
          duration: 'Semana 1',
          deliverable:
            'Diagnóstico de vulnerabilidades, cuellos de botella y diseño de la nueva arquitectura Docker/Linux.',
          verificationCriteria:
            'Hoja de ruta de migración sin tiempo de inactividad aprobada.',
        },
        {
          phaseCode: 'FASE 02',
          percentage: '40%',
          title: 'Construcción de Clúster Staging, VPN & Pruebas de Estrés',
          duration: 'Semanas 2 a 3',
          deliverable:
            'Entorno espejo contenerizado con pruebas de carga y simulacro completo de restauración de backups.',
          verificationCriteria:
            'Verificación de rendimiento y seguridad en el Portal de Clientes.',
        },
        {
          phaseCode: 'FASE 03',
          percentage: '20%',
          title: 'Switchover Transparente a Producción & Monitoreo Activo',
          duration: 'Semana 4',
          deliverable:
            'Migración final en ventana programada, documentación completa de llaves y monitoreo 24/7.',
          verificationCriteria:
            'Infraestructura en producción auditada y entregada.',
        },
      ],
      recommendedProjectIds: [
        'infraestructura-critica-linux-cluster',
        'odoo-v18-b2b2c-multideposito',
        'gemelo-digital-gastonbarea',
      ],
      matchedSolution,
      isAiGenerated: false,
    };
  }

  if (isAiTwin) {
    return {
      id: `sol-ia-${Date.now()}`,
      query: cleanQuery,
      createdAt: new Date().toISOString(),
      solutionTitle: `Arquitectura IA Services, Gemelo Digital & Agentes RAG para: "${cleanQuery}"`,
      executiveDiagnosis: `Tu consulta ("${cleanQuery}") apunta al corazón de nuestra unidad IA Services. Así como esta misma plataforma opera como mi Gemelo Digital, diseñamos para tu organización una arquitectura de Inteligencia Artificial conectada a tus documentos, catálogos, bases de datos y procesos reales para automatizar pre-ingeniería, atención consultiva B2B y toma de decisiones.`,
      primaryVertical: '02. IA Services, Gemelos Digitales & Business Intelligence',
      estimatedTimeline: '3 a 6 semanas (Esquema 40 · 40 · 20%)',
      recommendedStack: [
        'Google Gemini AI / LLMs',
        'React 19 + TypeScript Full-Stack',
        'PostgreSQL 16 + pgvector (RAG)',
        'Node.js / Express API',
        'Docker & Linux Cloud',
      ],
      tailoredServices: [
        {
          code: '01',
          title: 'Gemelo Digital Interactivo & Reorganizador Dinámico de Servicios',
          problemSolved: `Transforma la experiencia estática en una plataforma viva que interpreta requerimientos complejos como "${cleanQuery}" y construye propuestas en el acto.`,
          technicalApproach:
            'Motor semántico full-stack que analiza la intención del usuario, cruza capacidades de la empresa y genera hojas de ruta personalizadas.',
          deliverable:
            'Plataforma web interactiva con estructurador de soluciones en vivo y captura calificada en CRM.',
          impactMetric: '100% Pre-Ingeniería Automatizada 24/7',
        },
        {
          code: '02',
          title: 'Agente Corporativo RAG Entrenado con Documentación y Datos Propios',
          problemSolved:
            'Evita respuestas genéricas conectando la IA directamente a tus manuales técnicos, listas de precios, normativas e historial.',
          technicalApproach:
            'Indexación vectorial segura (PostgreSQL + pgvector) con control de alucinaciones y citas a fuentes internas.',
          deliverable:
            'Asistente experto para clientes o equipos internos operativo 24/7.',
          impactMetric: '-68% Tiempo de Respuesta Técnica-Comercial',
        },
        {
          code: '03',
          title: 'Integración con Pipeline CRM, Portal Clientes & Tableros BI',
          problemSolved:
            'Conecta cada interacción generada por la IA directamente con el flujo comercial y el seguimiento de proyectos.',
          technicalApproach:
            'Sincronización automática de diagnósticos IA hacia la Agenda Corporativa/Individual del CRM y Portal de Clientes.',
          deliverable:
            'Ecosistema comercial y operativo integrado de punta a punta.',
          impactMetric: '+3.2x Conversión de Consultas Complejas',
        },
      ],
      roadmapPhases: [
        {
          phaseCode: 'FASE 01',
          percentage: '40%',
          title: 'Curaduría de Conocimiento, Prompts de Dominio & Arquitectura RAG',
          duration: 'Semanas 1 a 2',
          deliverable:
            'Estructuración de la base de conocimiento corporativa, diseño de flujos conversacionales y contratos de API.',
          verificationCriteria:
            'Validación del modelo de conocimiento y criterios de respuesta ejecutiva.',
        },
        {
          phaseCode: 'FASE 02',
          percentage: '40%',
          title: 'Entrenamiento Vectorial & Validación Funcional en Servidor Staging',
          duration: 'Semanas 3 a 4',
          deliverable:
            'Gemelo Digital y agentes IA desplegados en entorno Staging procesando consultas reales de tu negocio.',
          verificationCriteria:
            'Pruebas de precisión técnica y homologación desde el Portal de Clientes.',
        },
        {
          phaseCode: 'FASE 03',
          percentage: '20%',
          title: 'Despliegue en Producción, Conexión CRM & Métricas de Conversión',
          duration: 'Semanas 5 a 6',
          deliverable:
            'Salida en vivo en tu dominio principal, integración con WhatsApp/Google Meet y panel de analítica.',
          verificationCriteria:
            'Operación 24/7 verificada y transferencia al equipo.',
        },
      ],
      recommendedProjectIds: [
        'gemelo-digital-gastonbarea',
        'agente-rag-operaciones-b2b',
        'ebt-plataforma-analitica-productiva',
      ],
      matchedSolution,
      isAiGenerated: false,
    };
  }

  // General EBT / PMO / Custom Technological Solution
  return {
    id: `sol-ebt-${Date.now()}`,
    query: cleanQuery,
    createdAt: new Date().toISOString(),
    solutionTitle: `Soluciones Tecnológicas y Dirección PMO Diseñadas para: "${cleanQuery}"`,
    executiveDiagnosis: `He analizado tu requerimiento ("${cleanQuery}") aplicando mis 30 años de trayectoria en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes. En lugar de ofrecerte un enlatado rígido, reorganizamos nuestra ingeniería en 3 servicios a medida bajo gobernanza PMO (40% Arquitectura · 40% Staging · 20% Producción) para garantizar retorno de inversión y propiedad total del código.`,
    primaryVertical: matchedSolution.serviceTitle,
    estimatedTimeline: matchedSolution.timeline || '4 a 8 semanas (Esquema 40 · 40 · 20%)',
    recommendedStack: [
      'React 19 + TypeScript Full-Stack',
      'Node.js / Python & PostgreSQL 16',
      'Odoo Community v18 / Integración API',
      'IA Generativa & Automatización',
      'Contenedores Docker sobre Linux LTS',
    ],
    tailoredServices: [
      {
        code: '01',
        title: 'Ingeniería de Software & Arquitectura de Plataforma a Medida',
        problemSolved: `Estructura una solución robusta, escalable y adaptada exactamente al desafío planteado en "${cleanQuery}".`,
        technicalApproach:
          'Diseño modular full-stack con base de datos transaccional auditada, APIs limpias y experiencia de usuario ejecutiva.',
        deliverable:
          'Plataforma digital funcional desplegada en servidor Staging y Producción sin costos de licencias ocultos.',
        impactMetric: '100% Propiedad del Código e Infraestructura',
      },
      {
        code: '02',
        title: 'Automatización Inteligente de Procesos & Tableros de Control',
        problemSolved:
          'Elimina cuellos de botella operativos e integra fuentes de datos dispersas en un único centro de control.',
        technicalApproach:
          'Conectores en tiempo real entre operación física/comercial, asistentes de IA y reportes gerenciales automatizados.',
        deliverable:
          'Dashboard de KPIs en vivo y flujos de trabajo automatizados.',
        impactMetric: '-45% Carga Operativa Manual',
      },
      {
        code: '03',
        title: 'Dirección Ejecutiva de Proyecto (PMO Externa · 14 Años de Experiencia)',
        problemSolved:
          'Asegura que el proyecto cumpla plazos, presupuesto y calidad técnica mediante hitos verificables.',
        technicalApproach:
          'Gobernanza etapa-puerta con entregas quincenales en Servidor Staging y seguimiento transparente en el Portal de Clientes.',
        deliverable:
          'Gestión integral de ingeniería, pruebas UAT y puesta en marcha sin desvíos.',
        impactMetric: 'Esquema Auditable 40 · 40 · 20%',
      },
    ],
    roadmapPhases: [
      {
        phaseCode: 'FASE 01',
        percentage: '40%',
        title: 'Relevamiento Ejecutivo, Alcance Cerrado & Arquitectura Base',
        duration: 'Semanas 1 a 2',
        deliverable:
          'Especificación técnica detallada, modelo de datos, diseño de interfaz y entorno base configurado.',
        verificationCriteria:
          'Aprobación formal del blueprint de ingeniería en el Portal de Clientes.',
      },
      {
        phaseCode: 'FASE 02',
        percentage: '40%',
        title: 'Desarrollo de Módulos & Validación en Servidor Staging',
        duration: 'Semanas 3 a 5',
        deliverable:
          'Sistema funcional en entorno de pruebas con tus datos reales para revisión interactiva junto a tu equipo.',
        verificationCriteria:
          'Validación funcional UAT de todos los flujos críticos antes de salir en vivo.',
      },
      {
        phaseCode: 'FASE 03',
        percentage: '20%',
        title: 'Despliegue en Producción, Capacitación & Acompañamiento SLA',
        duration: 'Semanas 6 a 7',
        deliverable:
          'Puesta en marcha en producción, entrega de documentación/código y soporte post-lanzamiento.',
        verificationCriteria:
          'Sistema operando 24/7 con métricas de impacto verificadas.',
      },
    ],
    recommendedProjectIds: [
      'ebt-plataforma-analitica-productiva',
      'gemelo-digital-gastonbarea',
      'odoo-v18-b2b2c-multideposito',
    ],
    matchedSolution,
    isAiGenerated: false,
  };
}

