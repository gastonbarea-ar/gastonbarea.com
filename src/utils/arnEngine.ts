import {
  CrmCompany,
  CrmContact,
  Opportunity,
  Quote,
  ServiceCategory,
} from '../types/crm.ts';

export interface EmployeePricingBreakdown {
  employeeCount: number;
  employeeRangeLabel: string;
  extraBlocksOf5: number;
  baseImplementationCost: number;
  scaleIncrementCost: number;
  totalImplementationCost: number;
  monthlySupportFee: number;
  monthlySupportDetails: string;
  currency: 'USD' | 'ARS';
}

export interface ParsedArnCommand {
  intent:
    | 'create_or_update_node'
    | 'generate_quote_40_40_20'
    | 'schedule_meet'
    | 'activate_kickoff';
  clientName: string;
  clientEmail: string;
  companyName: string;
  phone?: string;
  employeeCount: number;
  employeeRangeLabel: string;
  baseImplementationCost: number;
  scaleIncrementCost: number;
  monthlySupportFee: number;
  monthlySupportDetails: string;
  serviceCategory: ServiceCategory;
  estimatedValue: number;
  currency: 'USD' | 'ARS';
  shouldGenerateQuote: boolean;
  shouldScheduleMeet: boolean;
  shouldActivateKickoff: boolean;
  preferredMeetDate?: string;
  preferredMeetSlot?: string;
  summaryTitle: string;
  extractedNotes: string;
}

export interface ArnAutonomousAction {
  actionType: 'auto_quote_40_40_20' | 'auto_kickoff_project' | 'auto_followup_dispatch';
  buttonLabel: string;
  description: string;
  quoteId?: string;
}

export interface ArnRelationshipNode {
  id: string;
  opportunityId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName: string;
  employeeCount?: number;
  employeeRangeLabel?: string;
  monthlySupportFee?: number;
  serviceCategory: ServiceCategory;
  stage: Opportunity['stage'];
  value: number;
  currency: 'USD' | 'ARS';
  momentumScore: number;
  statusLabel: string;
  statusTone: 'emerald' | 'amber' | 'indigo' | 'rose';
  lastDetectedSignal: string;
  linkedQuoteId?: string;
  hasActiveProject: boolean;
  autonomousAction: ArnAutonomousAction;
  whatsappQuickUrl: string;
}

export const EMPLOYEE_SCALE_OPTIONS = [
  {
    count: 5,
    shortLabel: 'Hasta 5 empleados (Base)',
    rangeLabel: 'Implementación Base · 1 a 5 empleados',
  },
  {
    count: 10,
    shortLabel: '6 a 10 empleados (+5)',
    rangeLabel: 'Escala Tramo 2 · 6 a 10 empleados',
  },
  {
    count: 15,
    shortLabel: '11 a 15 empleados (+10)',
    rangeLabel: 'Escala Tramo 3 · 11 a 15 empleados',
  },
  {
    count: 25,
    shortLabel: '16 a 25 empleados (PyME)',
    rangeLabel: 'Escala PyME · 16 a 25 empleados',
  },
  {
    count: 50,
    shortLabel: '26 a 50 empleados (Corp)',
    rangeLabel: 'Escala Corporativa · 26 a 50 empleados',
  },
  {
    count: 100,
    shortLabel: '+50 empleados (Industrial)',
    rangeLabel: 'Escala Industrial · +50 empleados',
  },
];

export function resolveEmployeeRangeLabel(employeeCount: number): string {
  if (employeeCount <= 5) return 'Implementación Base · Hasta 5 empleados';
  if (employeeCount <= 10) return `Escala Tramo 2 · 6 a 10 empleados (${employeeCount} pers.)`;
  if (employeeCount <= 15) return `Escala Tramo 3 · 11 a 15 empleados (${employeeCount} pers.)`;
  if (employeeCount <= 25) return `Escala PyME · 16 a 25 empleados (${employeeCount} pers.)`;
  if (employeeCount <= 50) return `Escala Corporativa · 26 a 50 empleados (${employeeCount} pers.)`;
  return `Escala Industrial · +50 empleados (${employeeCount} pers.)`;
}

/**
 * Calculates Base Implementation Cost (up to 5 staff) + Incremental Scaling in blocks of 5 staff (5 -> 10 -> 15 -> 25 -> 50+)
 * + Monthly Service with Support Included (Abono Mensual + SLA).
 */
export function calculateEmployeeTierPricing(params: {
  employeeCount?: number;
  serviceCategory: ServiceCategory;
  currency?: 'USD' | 'ARS';
  explicitTotalOverride?: number;
}): EmployeePricingBreakdown {
  const currency: 'USD' | 'ARS' = params.currency === 'ARS' ? 'ARS' : 'USD';
  const fx = currency === 'ARS' ? 1100 : 1;
  const rawCount = Math.max(1, Math.round(Number(params.employeeCount) || 5));

  // Base cost for up to 5 employees by vertical (in USD)
  let baseUsd = 2400;
  switch (params.serviceCategory) {
    case 'odoo_erp':
      baseUsd = 2500;
      break;
    case 'ecommerce_b2b2c':
      baseUsd = 2300;
      break;
    case 'bi_analytics':
      baseUsd = 2600;
      break;
    case 'linux_docker':
      baseUsd = 1900;
      break;
    case 'fractional_cto':
      baseUsd = 2200;
      break;
    default:
      baseUsd = 2500;
      break;
  }

  // Incremental blocks of 5 employees above the base 5 (e.g. 6..10 = +1 block, 11..15 = +2 blocks, etc.)
  const extraStaff = Math.max(0, rawCount - 5);
  const extraBlocksOf5 = Math.ceil(extraStaff / 5);

  // Each additional block of 5 employees adds USD $450 for role setup, permissions, training & concurrent load
  const incrementPerBlockUsd = 450;
  const rawBaseCost = Math.round(baseUsd * fx);
  const rawScaleIncrement = Math.round(extraBlocksOf5 * incrementPerBlockUsd * fx);
  const computedTotal = rawBaseCost + rawScaleIncrement;

  const totalImplementationCost =
    params.explicitTotalOverride && params.explicitTotalOverride >= 100
      ? Math.round(params.explicitTotalOverride)
      : computedTotal;

  // If explicitTotalOverride was passed, keep base + increment consistent with total
  const baseImplementationCost =
    params.explicitTotalOverride && params.explicitTotalOverride >= 100
      ? extraBlocksOf5 > 0
        ? Math.round(totalImplementationCost * (rawBaseCost / computedTotal))
        : totalImplementationCost
      : rawBaseCost;
  const scaleIncrementCost = Math.max(0, totalImplementationCost - baseImplementationCost);

  // Monthly Service + Included Support SLA scaled by employee headcount
  // Base (up to 5 staff): USD $250/mo + USD $70/mo per additional block of 5 employees
  const monthlySupportUsd = 250 + extraBlocksOf5 * 70;
  const monthlySupportFee = Math.round(monthlySupportUsd * fx);
  const employeeRangeLabel = resolveEmployeeRangeLabel(rawCount);

  const monthlySupportDetails = `Servicio Mensual Operativo + Soporte Técnico SLA Incluido (${employeeRangeLabel}): incluye mesa de ayuda para hasta ${Math.max(
    5,
    rawCount
  )} usuarios, monitoreo de servidor Cloud/Docker 24/7, copias de seguridad automatizadas y mantenimiento evolutivo.`;

  return {
    employeeCount: rawCount,
    employeeRangeLabel,
    extraBlocksOf5,
    baseImplementationCost,
    scaleIncrementCost,
    totalImplementationCost,
    monthlySupportFee,
    monthlySupportDetails,
    currency,
  };
}

export function inferServiceCategoryFromText(text: string): ServiceCategory {
  const lower = (text || '').toLowerCase();
  if (lower.includes('odoo') || lower.includes('erp') || lower.includes('inventario') || lower.includes('facturaci')) {
    return 'odoo_erp';
  }
  if (lower.includes('ecommerce') || lower.includes('e-commerce') || lower.includes('b2b') || lower.includes('tienda') || lower.includes('mayorista')) {
    return 'ecommerce_b2b2c';
  }
  if (lower.includes('linux') || lower.includes('docker') || lower.includes('servidor') || lower.includes('vps') || lower.includes('cyberpanel') || lower.includes('cloud')) {
    return 'linux_docker';
  }
  if (lower.includes('bio') || lower.includes('iot') || lower.includes('trazabilidad') || lower.includes('tablero') || lower.includes('bi ') || lower.includes('analytics')) {
    return 'bi_analytics';
  }
  if (lower.includes('pmo') || lower.includes('cto') || lower.includes('direcci') || lower.includes('auditor')) {
    return 'fractional_cto';
  }
  return 'software_architecture';
}

export function getServiceCategoryDefaultTitle(category: ServiceCategory, companyName?: string): string {
  const suffix = companyName && companyName !== 'Contacto Individual' ? ` · ${companyName}` : '';
  switch (category) {
    case 'odoo_erp':
      return `Implementación Odoo Community ERP v18 & Automatización${suffix}`;
    case 'ecommerce_b2b2c':
      return `Plataforma E-Commerce B2B2C & Pasarelas de Pago${suffix}`;
    case 'linux_docker':
      return `Infraestructura Cloud Linux, Docker & Alta Disponibilidad${suffix}`;
    case 'bi_analytics':
      return `Trazabilidad IoT, Bioeconomía & Tableros Ejecutivos${suffix}`;
    case 'fractional_cto':
      return `Dirección Tecnológica (Fractional CTO / PMO)${suffix}`;
    default:
      return `Arquitectura de Software & Solución IA a Medida${suffix}`;
  }
}

export function parseNaturalArnCommand(
  rawInput: string,
  overrideContactChannel?: string,
  overrideEmployeeCount?: number
): ParsedArnCommand {
  const clean = (rawInput || '').trim();
  const combined = `${clean} ${overrideContactChannel || ''}`.trim();
  const lower = combined.toLowerCase();

  // 1. Extract Email
  const emailMatch = combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  let clientEmail = emailMatch ? emailMatch[0].toLowerCase() : '';

  // 2. Extract Phone / WhatsApp
  const phoneMatch = combined.match(/(?:\+?\d[\d\s-]{7,15}\d)/);
  const phone = phoneMatch ? phoneMatch[0].replace(/[^\d+]/g, '') : undefined;

  // 3. Extract Employee Count (e.g., "somos 10 empleados", "15 personas", "empresa de 8 usuarios")
  let detectedEmployees = overrideEmployeeCount && overrideEmployeeCount > 0 ? overrideEmployeeCount : 5;
  const empRegex = /(?:somos|tenemos|con|para|dotaci[oó]n de|equipo de|empresa de)?\s*\b([1-9][0-9]{0,3})\s*(?:empleados|personas|usuarios|colaboradores|operarios|puestos|personal)\b/i;
  const empMatch = clean.match(empRegex);
  if (empMatch && empMatch[1]) {
    const parsedEmp = Number(empMatch[1]);
    if (!Number.isNaN(parsedEmp) && parsedEmp >= 1 && parsedEmp <= 5000) {
      detectedEmployees = parsedEmp;
    }
  }

  // 4. Extract Currency & Explicit Amount (if specified in command)
  const isArs = /\b(ars|pesos)\b/i.test(combined) && !/\b(usd|d[oó]lares)\b/i.test(combined);
  const currency: 'USD' | 'ARS' = isArs ? 'ARS' : 'USD';

  let explicitAmountOverride: number | undefined;
  const amountRegex = /(?:usd|u\$s|ars|\$|por)\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{3,8})/i;
  const amountMatch = combined.match(amountRegex);
  if (amountMatch && amountMatch[1]) {
    const normalizedNum = Number(amountMatch[1].replace(/[.,]/g, ''));
    if (!Number.isNaN(normalizedNum) && normalizedNum >= 100) {
      explicitAmountOverride = normalizedNum;
    }
  }

  // 5. Extract Company Name (e.g., "de Bodega Austral", "de AgroSur", "empresa X")
  let companyName = 'Contacto Individual';
  const companyPatterns = [
    /\bde\s+([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ0-9&.\s]{2,28}?)(?:,|;|\.|\s+somos|\s+tenemos|\s+con|\s+necesita|\s+quiere|\s+buscan|\s+por|\s+correo|\s+mail|\s+usd|\s+\$|$)/,
    /(?:empresa|corporaci[oó]n|compa[ñn][ií]a)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ0-9&.\s]{2,28}?)(?:,|;|\.|\s+somos|\s+tenemos|\s+por|\s+necesita|\s+correo|\s+mail|\s+tel|\s+usd|\s+\$|$)/i,
    /((?:grupo|bodega|distribuidora|frigor[ií]fico|cooperativa|estudio|laboratorio)\s+[A-ZÁÉÍÓÚÑa-záéíóúñ0-9&.\s]{2,24}?)(?:,|;|\.|\s+somos|\s+tenemos|\s+por|\s+necesita|\s+correo|\s+mail|\s+tel|\s+usd|\s+\$|$)/i,
  ];
  for (const pattern of companyPatterns) {
    const m = clean.match(pattern);
    if (m && m[1]) {
      const candidate = m[1].trim();
      if (
        candidate.length >= 2 &&
        !['la', 'el', 'los', 'las', 'un', 'una', 'mi', 'tu', 'su', 'hoy', 'ayer'].includes(
          candidate.toLowerCase()
        )
      ) {
        companyName = candidate;
        break;
      }
    }
  }

  // 6. Extract Client Name
  let clientName = '';
  const namePatterns = [
    /(?:con|cliente|contacto|soy|mi nombre es|para)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)?)(?:\s+de\s+|\s+empresa|,|\.|\s+correo|\s+mail|\s+necesita|$)/i,
  ];
  for (const pattern of namePatterns) {
    const m = clean.match(pattern);
    if (m && m[1]) {
      const candidate = m[1].trim();
      if (
        candidate.length >= 3 &&
        !['propuesta', 'cotizacion', 'cotización', 'presupuesto', 'proyecto', 'reunion', 'reunión'].includes(
          candidate.toLowerCase()
        )
      ) {
        clientName = candidate
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        break;
      }
    }
  }

  if (!clientName && clientEmail) {
    const prefix = clientEmail.split('@')[0].replace(/[._-]+/g, ' ');
    clientName = prefix
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  if (!clientName) {
    clientName = companyName !== 'Contacto Individual' ? `Dirección ${companyName}` : 'Ejecutivo ARN';
  }

  if (!clientEmail) {
    const slug = (companyName !== 'Contacto Individual' ? companyName : clientName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 16);
    clientEmail = `${slug || 'contacto'}@portal-arn.com`;
  }

  if (companyName === 'Contacto Individual' && clientEmail && !clientEmail.match(/@(gmail|hotmail|outlook|yahoo|icloud|live|portal-arn)\./i)) {
    const domainPart = clientEmail.split('@')[1]?.split('.')[0] || '';
    if (domainPart.length >= 3) {
      companyName = domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
    }
  }

  const serviceCategory = inferServiceCategoryFromText(clean);

  // Calculate employee-tiered implementation + monthly support pricing
  const pricing = calculateEmployeeTierPricing({
    employeeCount: detectedEmployees,
    serviceCategory,
    currency,
    explicitTotalOverride: explicitAmountOverride,
  });

  const shouldActivateKickoff =
    lower.includes('kickoff') ||
    lower.includes('iniciar proyecto') ||
    lower.includes('aprobar') ||
    lower.includes('ganad');
  const shouldScheduleMeet =
    lower.includes('meet') ||
    lower.includes('reuni') ||
    lower.includes('agend') ||
    lower.includes('videollamada');
  const shouldGenerateQuote =
    lower.includes('cotiza') ||
    lower.includes('presupuesto') ||
    lower.includes('propuesta') ||
    lower.includes('40/40/20') ||
    Boolean(amountMatch) ||
    !shouldScheduleMeet;

  let intent: ParsedArnCommand['intent'] = 'create_or_update_node';
  if (shouldActivateKickoff) {
    intent = 'activate_kickoff';
  } else if (shouldGenerateQuote) {
    intent = 'generate_quote_40_40_20';
  } else if (shouldScheduleMeet) {
    intent = 'schedule_meet';
  }

  const summaryTitle = getServiceCategoryDefaultTitle(serviceCategory, companyName);

  return {
    intent,
    clientName,
    clientEmail,
    companyName,
    phone,
    employeeCount: pricing.employeeCount,
    employeeRangeLabel: pricing.employeeRangeLabel,
    baseImplementationCost: pricing.baseImplementationCost,
    scaleIncrementCost: pricing.scaleIncrementCost,
    monthlySupportFee: pricing.monthlySupportFee,
    monthlySupportDetails: pricing.monthlySupportDetails,
    serviceCategory,
    estimatedValue: pricing.totalImplementationCost,
    currency,
    shouldGenerateQuote,
    shouldScheduleMeet,
    shouldActivateKickoff,
    summaryTitle,
    extractedNotes: clean,
  };
}

export function buildAutonomous404020Quote(params: {
  opportunityId: string;
  clientName: string;
  clientEmail: string;
  companyName?: string;
  employeeCount?: number;
  serviceCategory: ServiceCategory;
  title: string;
  totalAmount?: number;
  currency: 'USD' | 'ARS';
  notes?: string;
}): Quote {
  const pricing = calculateEmployeeTierPricing({
    employeeCount: params.employeeCount || 5,
    serviceCategory: params.serviceCategory,
    currency: params.currency,
    explicitTotalOverride: params.totalAmount,
  });

  const total = pricing.totalImplementationCost;
  const m1 = Math.round(total * 0.4);
  const m2 = Math.round(total * 0.4);
  const m3 = total - m1 - m2;

  const validDate = new Date();
  validDate.setDate(validDate.getDate() + 15);

  const quoteNum = `COT-ARN-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 899))}`;

  const items: Quote['items'] = [
    {
      id: `item-base-${Date.now()}`,
      description: `1. Implementación Base (Dotación inicial hasta 5 empleados) — ${params.title}`,
      deliverable:
        'Arquitectura Base, Aprovisionamiento Cloud/Docker, Configuración Core, Staging UAT y Puesta en Producción para hasta 5 usuarios',
      hours: 45,
      unitPrice: pricing.baseImplementationCost,
      quantity: 1,
      total: pricing.baseImplementationCost,
    },
  ];

  if (pricing.scaleIncrementCost > 0) {
    items.push({
      id: `item-scale-${Date.now() + 1}`,
      description: `2. Escalamiento por Dotación de Personal (${pricing.employeeRangeLabel})`,
      deliverable: `Parametrización de roles adicionales, permisos multi-área, licenciamiento operativo y capacitación para ${pricing.employeeCount} empleados (+${pricing.extraBlocksOf5} bloque(s) de 5 personas)`,
      hours: pricing.extraBlocksOf5 * 10,
      unitPrice: pricing.scaleIncrementCost,
      quantity: 1,
      total: pricing.scaleIncrementCost,
    });
  }

  return {
    id: `qt-arn-${Date.now()}`,
    quoteNumber: quoteNum,
    opportunityId: params.opportunityId,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    clientCompany: params.companyName,
    employeeCount: pricing.employeeCount,
    employeeRangeLabel: pricing.employeeRangeLabel,
    baseImplementationCost: pricing.baseImplementationCost,
    scaleIncrementCost: pricing.scaleIncrementCost,
    monthlySupportFee: pricing.monthlySupportFee,
    monthlySupportDetails: pricing.monthlySupportDetails,
    serviceCategory: params.serviceCategory,
    title: params.title,
    currency: params.currency,
    items,
    subtotal: total,
    taxPercent: 0,
    total,
    timeline: pricing.employeeCount > 15 ? '5 a 8 semanas (Sprints Ágiles)' : '4 a 6 semanas (Sprints Ágiles)',
    milestones: [
      {
        id: `ms-1-${Date.now()}`,
        name: 'Hito 1 · Anticipo & Kickoff Técnico (40%)',
        percentage: 40,
        amount: m1,
        condition: 'Contra aprobación en 1 clic del presupuesto para inicio inmediato',
        status: 'pending',
      },
      {
        id: `ms-2-${Date.now()}`,
        name: 'Hito 2 · Entrega en Staging UAT & Homologación (40%)',
        percentage: 40,
        amount: m2,
        condition: `Contra entrega funcional en servidor Staging UAT para ${pricing.employeeCount} usuarios`,
        status: 'pending',
      },
      {
        id: `ms-3-${Date.now()}`,
        name: 'Hito 3 · Go-Live en Producción & Cierre (20%)',
        percentage: 20,
        amount: m3,
        condition: 'Contra puesta en producción definitiva y conformidad técnica',
        status: 'pending',
      },
    ],
    termsAndConditions: [
      `Condición de Dotación Relevada: ${pricing.employeeRangeLabel} (Base 5 empleados incrementándose en tramos de 5).`,
      `Servicio Mensual con Soporte SLA Incluido (post Go-Live): ${pricing.currency} $${pricing.monthlySupportFee.toLocaleString()} / mes (${pricing.monthlySupportDetails}).`,
      'Esquema de inversión de implementación por hitos verificables 40% / 40% / 20%.',
      'Aprobación instantánea en 1 clic desde el Portal Clientes ARN (#portal).',
    ],
    status: 'sent',
    validUntil: validDate.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function computeArnRelationshipNodes(params: {
  opportunities: Opportunity[];
  companies: CrmCompany[];
  contacts: CrmContact[];
  quotes: Quote[];
  projects?: any[];
  bookings?: any[];
}): ArnRelationshipNode[] {
  const { opportunities, quotes, projects = [], bookings = [] } = params;

  return opportunities
    .filter((o) => o.stage !== 'lost')
    .map((opp) => {
      const emailLower = (opp.clientEmail || '').toLowerCase();
      const linkedQuote = quotes.find(
        (q) =>
          q.opportunityId === opp.id ||
          q.quoteNumber === opp.linkedQuoteId ||
          (q.clientEmail && q.clientEmail.toLowerCase() === emailLower)
      );
      const activeProject = projects.find(
        (p) =>
          (p.clientEmail && p.clientEmail.toLowerCase() === emailLower) ||
          (opp.company && p.company && p.company.toLowerCase() === opp.company.toLowerCase())
      );
      const upcomingBooking = bookings.find(
        (b) => b.clientEmail && b.clientEmail.toLowerCase() === emailLower && b.status !== 'cancelled'
      );

      let momentumScore = opp.probability || 45;
      let statusLabel = 'Diagnóstico Inicial ARN';
      let statusTone: ArnRelationshipNode['statusTone'] = 'indigo';
      let lastDetectedSignal = opp.notes
        ? opp.notes.slice(0, 95)
        : 'Ingresado en la Red ARN · Listo para cotizar';

      let autonomousAction: ArnAutonomousAction = {
        actionType: 'auto_quote_40_40_20',
        buttonLabel: 'Auto-Generar Propuesta 40/40/20 (1-Clic)',
        description: 'Estructura presupuesto formal 40/40/20 y lo publica en el Portal del cliente.',
      };

      if (activeProject || opp.stage === 'won') {
        momentumScore = 98;
        statusLabel = `Proyecto 40/40/20 Activo (${activeProject?.progressPercent ?? 20}%)`;
        statusTone = 'emerald';
        lastDetectedSignal = activeProject?.activeSprint
          ? `Sprint en curso: ${activeProject.activeSprint}`
          : 'Proyecto aprovisionado y sincronizado en Portal Clientes';
        autonomousAction = {
          actionType: 'auto_followup_dispatch',
          buttonLabel: 'Despachar Reporte de Sprint',
          description: 'Envía resumen ejecutivo de avance al cliente por correo y WhatsApp.',
          quoteId: linkedQuote?.id,
        };
      } else if (linkedQuote && linkedQuote.status !== 'accepted') {
        momentumScore = 82;
        statusLabel = `Cotización ${linkedQuote.quoteNumber} en Evaluación`;
        statusTone = 'amber';
        lastDetectedSignal = upcomingBooking
          ? `Meet agendado: ${upcomingBooking.date} · ${upcomingBooking.timeSlot}`
          : `Propuesta ${linkedQuote.quoteNumber} (${linkedQuote.currency} $${linkedQuote.total.toLocaleString()}) disponible en Portal`;
        autonomousAction = {
          actionType: 'auto_kickoff_project',
          buttonLabel: 'Aprobar y Activar Proyecto 40/40/20',
          description: 'Aprueba la cotización y aprovisiona el proyecto 40/40/20 en el acto.',
          quoteId: linkedQuote.id,
        };
      } else if (upcomingBooking) {
        momentumScore = 75;
        statusLabel = `Sesión Meet Confirmada (${upcomingBooking.date})`;
        statusTone = 'indigo';
        lastDetectedSignal = `Videollamada 1-on-1 programada: ${upcomingBooking.timeSlot}`;
      }

      const cleanPhone = (opp.clientPhone || '').replace(/[^\d]/g, '') || '5492804697193';
      const waText = linkedQuote
        ? `Hola ${opp.clientName}, te escribo desde gastonbarea.com. Ya dejé disponible en tu Portal ARN la propuesta formal ${linkedQuote.quoteNumber} con esquema 40/40/20 para "${opp.title}". Podés aprobarla en 1 clic desde https://www.gastonbarea.com/#portal`
        : `Hola ${opp.clientName}, te escribo desde gastonbarea.com por la iniciativa "${opp.title}". Ya habilitamos tu nodo en nuestro Portal ARN.`;

      return {
        id: `arn-node-${opp.id}`,
        opportunityId: opp.id,
        clientName: opp.clientName,
        clientEmail: opp.clientEmail,
        clientPhone: opp.clientPhone,
        companyName: opp.company || 'Contacto Individual',
        employeeCount: opp.employeeCount || linkedQuote?.employeeCount || 5,
        employeeRangeLabel:
          opp.employeeRangeLabel ||
          linkedQuote?.employeeRangeLabel ||
          'Implementación Base · Hasta 5 empleados',
        monthlySupportFee: opp.monthlySupportFee || linkedQuote?.monthlySupportFee || 250,
        serviceCategory: opp.serviceCategory,
        stage: opp.stage,
        value: opp.value || linkedQuote?.total || 2500,
        currency: opp.currency || linkedQuote?.currency || 'USD',
        momentumScore,
        statusLabel,
        statusTone,
        lastDetectedSignal,
        linkedQuoteId: linkedQuote?.quoteNumber,
        hasActiveProject: Boolean(activeProject),
        autonomousAction,
        whatsappQuickUrl: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`,
      };
    })
    .sort((a, b) => b.momentumScore - a.momentumScore);
}
