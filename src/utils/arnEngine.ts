import {
  ArnServiceStockItem,
  CompanyScaleTier,
  CrmCompany,
  CrmContact,
  Opportunity,
  Quote,
  ServiceCategory,
} from '../types/crm.ts';
import { INITIAL_ARN_SERVICE_STOCK } from '../data/crmTemplates.ts';

export interface EmployeePricingBreakdown {
  employeeCount: number;
  companyScale: CompanyScaleTier;
  companyScaleLabel: string;
  employeeRangeLabel: string;
  includedEmployeesInScale: number;
  extraBlocksOf5: number;
  baseImplementationCost: number;
  scaleIncrementCost: number;
  totalImplementationCost: number;
  monthlySupportFee: number;
  monthlySupportDetails: string;
  estimatedTimeline: string;
  stockService: ArnServiceStockItem;
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
  companyScale: CompanyScaleTier;
  employeeRangeLabel: string;
  stockServiceId: string;
  stockServiceCode: string;
  valueProposition: string;
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
  companyScale?: CompanyScaleTier;
  employeeRangeLabel?: string;
  stockServiceCode?: string;
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
    scale: 'micro' as CompanyScaleTier,
    shortLabel: 'Hasta 5 emp. (Micro Base)',
    rangeLabel: 'Tamaño MICRO · 1 a 5 empleados',
  },
  {
    count: 10,
    scale: 'micro' as CompanyScaleTier,
    shortLabel: '6 a 10 emp. (Micro +5)',
    rangeLabel: 'Tamaño MICRO · 6 a 10 empleados',
  },
  {
    count: 15,
    scale: 'pyme' as CompanyScaleTier,
    shortLabel: '11 a 15 emp. (PyME Base)',
    rangeLabel: 'Tamaño PyME · 11 a 15 empleados',
  },
  {
    count: 25,
    scale: 'pyme' as CompanyScaleTier,
    shortLabel: '16 a 25 emp. (PyME +10)',
    rangeLabel: 'Tamaño PyME · 16 a 25 empleados',
  },
  {
    count: 50,
    scale: 'pyme' as CompanyScaleTier,
    shortLabel: '26 a 50 emp. (PyME Corp)',
    rangeLabel: 'Tamaño PyME · 26 a 50 empleados',
  },
  {
    count: 100,
    scale: 'grande' as CompanyScaleTier,
    shortLabel: '+50 emp. (Escala Grande)',
    rangeLabel: 'Tamaño GRANDE · +50 empleados',
  },
];

export function resolveCompanyScaleTier(employeeCount: number): CompanyScaleTier {
  if (employeeCount <= 10) return 'micro';
  if (employeeCount <= 50) return 'pyme';
  return 'grande';
}

export function resolveCompanyScaleLabel(scale: CompanyScaleTier): string {
  switch (scale) {
    case 'micro':
      return 'Escala MICRO (1 a 10 empleados)';
    case 'pyme':
      return 'Escala PyME (11 a 50 empleados)';
    case 'grande':
      return 'Escala GRANDE (+50 empleados)';
  }
}

export function resolveEmployeeRangeLabel(employeeCount: number): string {
  const scale = resolveCompanyScaleTier(employeeCount);
  if (scale === 'micro') {
    if (employeeCount <= 5) {
      return `Tamaño MICRO · Base hasta 5 empleados (${employeeCount} pers.)`;
    }
    return `Tamaño MICRO · Tramo 6 a 10 empleados (${employeeCount} pers.)`;
  }
  if (scale === 'pyme') {
    if (employeeCount <= 15) {
      return `Tamaño PyME · Base 11 a 15 empleados (${employeeCount} pers.)`;
    }
    if (employeeCount <= 25) {
      return `Tamaño PyME · Tramo 16 a 25 empleados (${employeeCount} pers.)`;
    }
    return `Tamaño PyME · Tramo 26 a 50 empleados (${employeeCount} pers.)`;
  }
  return `Tamaño GRANDE / Corporativa · +50 empleados (${employeeCount} pers.)`;
}

/**
 * Matches a service from the controllable ARN Service Stock by ID, category, or natural language query
 */
export function matchServiceFromStock(params: {
  query?: string;
  serviceCategory?: ServiceCategory;
  preferredStockId?: string;
  serviceStock?: ArnServiceStockItem[];
}): ArnServiceStockItem {
  const catalog =
    params.serviceStock && params.serviceStock.length > 0
      ? params.serviceStock
      : INITIAL_ARN_SERVICE_STOCK;
  const activeCatalog = catalog.filter((s) => s.active !== false);
  const pool = activeCatalog.length > 0 ? activeCatalog : catalog;

  if (params.preferredStockId) {
    const byId = pool.find(
      (s) => s.id === params.preferredStockId || s.code === params.preferredStockId
    );
    if (byId) return byId;
  }

  if (params.query) {
    const lower = params.query.toLowerCase();
    let bestItem: ArnServiceStockItem | null = null;
    let bestScore = 0;

    for (const item of pool) {
      let score = 0;
      for (const kw of item.keywords || []) {
        if (lower.includes(kw.toLowerCase())) {
          score += 3;
        }
      }
      if (lower.includes(item.code.toLowerCase())) score += 10;
      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }
    if (bestItem && bestScore > 0) {
      return bestItem;
    }
  }

  if (params.serviceCategory) {
    const byCategory = pool.find((s) => s.serviceCategory === params.serviceCategory);
    if (byCategory) return byCategory;
  }

  return pool[0] || INITIAL_ARN_SERVICE_STOCK[0];
}

/**
 * Queries the ARN Service Stock to calculate the exact pricing for the company's scale (Micro, PyME, Grande)
 * and employee headcount (base + 5-employee block increments + monthly SLA support).
 */
export function calculateEmployeeTierPricing(params: {
  employeeCount?: number;
  serviceCategory: ServiceCategory;
  currency?: 'USD' | 'ARS';
  explicitTotalOverride?: number;
  preferredStockId?: string;
  serviceStock?: ArnServiceStockItem[];
}): EmployeePricingBreakdown {
  const currency: 'USD' | 'ARS' = params.currency === 'ARS' ? 'ARS' : 'USD';
  const fx = currency === 'ARS' ? 1100 : 1;
  const rawCount = Math.max(1, Math.round(Number(params.employeeCount) || 5));

  const stockService = matchServiceFromStock({
    serviceCategory: params.serviceCategory,
    preferredStockId: params.preferredStockId,
    serviceStock: params.serviceStock,
  });

  const companyScale = resolveCompanyScaleTier(rawCount);
  const scaleConfig = stockService.scales[companyScale] || stockService.scales.micro;

  const blockSize = Math.max(1, stockService.employeeBlockSize || 5);
  const includedInScale = Math.max(5, scaleConfig.includedEmployees || 5);
  const extraStaffAboveScaleBase = Math.max(0, rawCount - includedInScale);
  const extraBlocksOf5 = Math.ceil(extraStaffAboveScaleBase / blockSize);

  const rawBaseCost = Math.round(scaleConfig.baseImplementationPrice * fx);
  const rawScaleIncrement = Math.round(
    extraBlocksOf5 * (stockService.pricePerEmployeeBlock || 450) * fx
  );
  const computedTotal = rawBaseCost + rawScaleIncrement;

  const totalImplementationCost =
    params.explicitTotalOverride && params.explicitTotalOverride >= 100
      ? Math.round(params.explicitTotalOverride)
      : computedTotal;

  const baseImplementationCost =
    params.explicitTotalOverride && params.explicitTotalOverride >= 100
      ? extraBlocksOf5 > 0
        ? Math.round(totalImplementationCost * (rawBaseCost / computedTotal))
        : totalImplementationCost
      : rawBaseCost;
  const scaleIncrementCost = Math.max(0, totalImplementationCost - baseImplementationCost);

  // Monthly Service + Included Support SLA from the Stock scale + extra blocks
  const monthlySupportRaw =
    scaleConfig.monthlySupportPrice +
    extraBlocksOf5 * (stockService.monthlySupportPerEmployeeBlock || 70);
  const monthlySupportFee = Math.round(monthlySupportRaw * fx);
  const employeeRangeLabel = resolveEmployeeRangeLabel(rawCount);
  const companyScaleLabel = resolveCompanyScaleLabel(companyScale);

  const monthlySupportDetails = `Servicio Mensual Operativo + Soporte Técnico SLA Incluido [${stockService.code} · ${companyScaleLabel} · ${rawCount} empleados]: incluye mesa de ayuda para hasta ${Math.max(
    5,
    rawCount
  )} usuarios, monitoreo Cloud/Docker 24/7, copias de seguridad automatizadas y mantenimiento evolutivo.`;

  return {
    employeeCount: rawCount,
    companyScale,
    companyScaleLabel,
    employeeRangeLabel,
    includedEmployeesInScale: includedInScale,
    extraBlocksOf5,
    baseImplementationCost,
    scaleIncrementCost,
    totalImplementationCost,
    monthlySupportFee,
    monthlySupportDetails,
    estimatedTimeline: scaleConfig.estimatedTimeline || '4 a 6 semanas (Sprints Ágiles)',
    stockService,
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
  overrideEmployeeCount?: number,
  serviceStock?: ArnServiceStockItem[],
  preferredStockId?: string
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

  // 5. Extract Company Name
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

  // 7. Match Service from ARN Stock
  const inferredCategory = inferServiceCategoryFromText(clean);
  const matchedStock = matchServiceFromStock({
    query: clean,
    serviceCategory: inferredCategory,
    preferredStockId,
    serviceStock,
  });
  const serviceCategory = matchedStock.serviceCategory || inferredCategory;

  // 8. Calculate Stock-driven pricing (Micro / PyME / Grande + employee headcount blocks)
  const pricing = calculateEmployeeTierPricing({
    employeeCount: detectedEmployees,
    serviceCategory,
    currency,
    explicitTotalOverride: explicitAmountOverride,
    preferredStockId: matchedStock.id,
    serviceStock,
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

  const suffix = companyName && companyName !== 'Contacto Individual' ? ` · ${companyName}` : '';
  const summaryTitle = `${matchedStock.name}${suffix}`;

  return {
    intent,
    clientName,
    clientEmail,
    companyName,
    phone,
    employeeCount: pricing.employeeCount,
    companyScale: pricing.companyScale,
    employeeRangeLabel: pricing.employeeRangeLabel,
    stockServiceId: matchedStock.id,
    stockServiceCode: matchedStock.code,
    valueProposition: matchedStock.valueProposition,
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
  preferredStockId?: string;
  serviceStock?: ArnServiceStockItem[];
}): Quote {
  const pricing = calculateEmployeeTierPricing({
    employeeCount: params.employeeCount || 5,
    serviceCategory: params.serviceCategory,
    currency: params.currency,
    explicitTotalOverride: params.totalAmount,
    preferredStockId: params.preferredStockId,
    serviceStock: params.serviceStock,
  });

  const stock = pricing.stockService;
  const total = pricing.totalImplementationCost;
  const m1 = Math.round(total * 0.4);
  const m2 = Math.round(total * 0.4);
  const m3 = total - m1 - m2;

  const validDate = new Date();
  validDate.setDate(validDate.getDate() + 15);

  const quoteNum = `COT-ARN-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 899))}`;

  // Item 1: Base Service from ARN Service Stock according to Company Scale (Micro / PyME / Grande)
  // Item 2: Explicit Employee Headcount Sizing Item (determines company size & scale)
  const items: Quote['items'] = [
    {
      id: `item-stock-base-${Date.now()}`,
      description: `1. [${stock.code}] ${stock.name} — Valor Base ${pricing.companyScaleLabel.toUpperCase()}`,
      deliverable: `${stock.valueProposition} Entregables incluidos: ${(stock.deliverables || []).join(' · ')}`,
      hours: pricing.companyScale === 'grande' ? 95 : pricing.companyScale === 'pyme' ? 65 : 45,
      unitPrice: pricing.baseImplementationCost,
      quantity: 1,
      total: pricing.baseImplementationCost,
    },
    {
      id: `item-employee-scale-${Date.now() + 1}`,
      description: `2. Condición de Dotación Relevada: ${pricing.employeeCount} Empleados (Determina ${pricing.companyScaleLabel})`,
      deliverable:
        pricing.scaleIncrementCost > 0
          ? `Dimensionamiento operativo para ${pricing.employeeCount} empleados: incluye base de ${pricing.includedEmployeesInScale} usuarios de ${pricing.companyScaleLabel} + ${pricing.extraBlocksOf5} bloque(s) adicional(es) de ${stock.employeeBlockSize} empleados (roles, licencias operativas, permisos y capacitación).`
          : `Dotación de ${pricing.employeeCount} empleados cubierta íntegramente dentro del tramo base de ${pricing.companyScaleLabel} (hasta ${pricing.includedEmployeesInScale} empleados incluidos sin recargo adicional).`,
      hours: pricing.extraBlocksOf5 > 0 ? pricing.extraBlocksOf5 * 10 : 0,
      unitPrice: pricing.scaleIncrementCost,
      quantity: 1,
      total: pricing.scaleIncrementCost,
    },
  ];

  return {
    id: `qt-arn-${Date.now()}`,
    quoteNumber: quoteNum,
    opportunityId: params.opportunityId,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    clientCompany: params.companyName,
    employeeCount: pricing.employeeCount,
    companyScale: pricing.companyScale,
    employeeRangeLabel: pricing.employeeRangeLabel,
    stockServiceId: stock.id,
    stockServiceCode: stock.code,
    valueProposition: stock.valueProposition,
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
    timeline: pricing.estimatedTimeline,
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
        condition: `Contra entrega funcional en servidor Staging UAT para ${pricing.employeeCount} usuarios (${pricing.companyScaleLabel})`,
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
      `Servicio del Stock ARN: [${stock.code}] ${stock.name} — ${stock.valueProposition}`,
      `Tamaño de Empresa determinado por Dotación: ${pricing.employeeCount} empleados → ${pricing.companyScaleLabel} (${pricing.employeeRangeLabel}).`,
      `Servicio Mensual con Soporte SLA Incluido (post Go-Live): ${pricing.currency} $${pricing.monthlySupportFee.toLocaleString()} / mes (${pricing.monthlySupportDetails}).`,
      'Esquema de inversión de implementación por hitos verificables 40% / 40% / 20%.',
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
        description: 'Consulta el Stock ARN y publica presupuesto formal 40/40/20 en el Portal del cliente.',
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
      const empCount = opp.employeeCount || linkedQuote?.employeeCount || 5;
      const compScale = opp.companyScale || linkedQuote?.companyScale || resolveCompanyScaleTier(empCount);
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
        employeeCount: empCount,
        companyScale: compScale,
        employeeRangeLabel:
          opp.employeeRangeLabel ||
          linkedQuote?.employeeRangeLabel ||
          resolveEmployeeRangeLabel(empCount),
        stockServiceCode: opp.stockServiceCode || linkedQuote?.stockServiceCode,
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
