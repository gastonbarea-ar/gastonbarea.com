import { PageSectionId } from '../components/Header.ts';
import {
  PROJECTS_CATALOG,
  ProductionProject,
  ProjectStatus,
  ProjectCategory,
} from '../data/projectsData.ts';

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
