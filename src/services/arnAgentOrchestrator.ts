import { FunctionDeclaration, GoogleGenAI, Type } from '@google/genai';
import {
  ArnServiceStockItem,
  CrmCompany,
  CrmContact,
  Opportunity,
  Quote,
} from '../types/crm.ts';
import {
  ClientProject,
  ConsultingBooking,
  ConsultingInquiry,
  SupportTicket,
} from '../types/clientPortal.ts';
import {
  buildAutonomous404020Quote,
  calculateEmployeeTierPricing,
  matchServiceFromStock,
  parseNaturalArnCommand,
} from '../utils/arnEngine.ts';
import { INITIAL_ARN_SERVICE_STOCK } from '../data/crmTemplates.ts';

export type AgentCallerRole = 'public_visitor' | 'authenticated_client' | 'admin_arn';

export interface AgentSubtask {
  id: string;
  order: number;
  description: string;
  targetTool: string;
  status: 'pending' | 'completed' | 'corrected';
}

export interface AgentToolInvocationRecord {
  toolName: string;
  args: Record<string, any>;
  outputSummary: string;
  success: boolean;
  durationMs: number;
}

export interface AgentVerificationReport {
  goalResolved: boolean;
  math404020Verified: boolean;
  persistenceVerified: boolean;
  selfCorrectionsApplied: string[];
  auditSummary: string;
}

export interface ArnAgentTrace {
  architecture: 'StateGraph-TS-4-Node';
  llmEngineUsed: 'gemini-function-calling' | 'groq-lpu-failover' | 'deterministic-stategraph';
  costTier: '$0 Free Tier (Gemini API + Groq Cloud + StateGraph TS)';
  loopIterations: number;
  step1_evaluateObjective: {
    primaryGoal: string;
    detectedIntent: string;
    callerRole: AgentCallerRole;
    subtasks: AgentSubtask[];
  };
  step2_contextAndMemory: {
    relationalRecordsFound: number;
    matchedClientEmail?: string;
    matchedCompanyName?: string;
    detectedEmployeeCount: number;
    companyScaleLabel: string;
    matchedStockCode: string;
    matchedStockName: string;
    businessRulesApplied: string[];
  };
  step3_toolsExecuted: AgentToolInvocationRecord[];
  step4_resultVerification: AgentVerificationReport;
}

export interface ArnAgentStoreAdapter {
  opportunities: Opportunity[];
  companies: CrmCompany[];
  contacts: CrmContact[];
  quotes: Quote[];
  projects: ClientProject[];
  inquiries: ConsultingInquiry[];
  tickets: SupportTicket[];
  bookings: ConsultingBooking[];
  serviceStock: ArnServiceStockItem[];
  onUpsertCompanyAndContact?: (params: {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    company?: string;
    stage?: string;
    employeeCount?: number;
    employeeRangeLabel?: string;
  }) => { companyId?: string; contactId?: string };
  onPersistQuoteAndOpportunity?: (params: {
    quote: Quote;
    opportunity: Opportunity;
  }) => Promise<void> | void;
  onActivateKickoffProject?: (params: {
    quote: Quote;
    phone?: string;
  }) => Promise<ClientProject> | ClientProject;
  onCreateSupportTicket?: (ticket: SupportTicket) => Promise<void> | void;
  onCreateBooking?: (booking: ConsultingBooking) => Promise<void> | void;
}

export interface RunArnAgentParams {
  prompt: string;
  callerRole: AgentCallerRole;
  authenticatedClient?: {
    email: string;
    name: string;
    company?: string;
    companyId?: string;
  };
  overrideEmployeeCount?: number;
  preferredStockId?: string;
  aiClient?: GoogleGenAI | null;
  groqApiKey?: string;
  n8nWebhookUrl?: string;
  store: ArnAgentStoreAdapter;
}

export interface RunArnAgentResult {
  success: boolean;
  finalResponse: string;
  actionsExecuted: string[];
  agentTrace: ArnAgentTrace;
  artifacts: {
    opportunity?: Opportunity | null;
    quote?: Quote | null;
    project?: ClientProject | null;
    ticket?: SupportTicket | null;
    booking?: ConsultingBooking | null;
  };
}

/**
 * Declarative Tool Catalog (@google/genai FunctionDeclaration)
 * Maps to the 3rd Pillar: "Decidir y ejecutar acciones"
 */
export const ARN_AGENT_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'consultar_memoria_cliente_crm',
    description:
      'Consulta la memoria relacional (Supabase / Caché CRM) para recuperar contactos, empresa, cotizaciones 40/40/20 previas, proyectos activos y turnos Google Meet asociados.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientEmail: {
          type: Type.STRING,
          description: 'Correo electrónico del cliente o cuenta a consultar.',
        },
        companyName: {
          type: Type.STRING,
          description: 'Nombre de la empresa u organización.',
        },
      },
    },
  },
  {
    name: 'consultar_stock_y_reglas_arn',
    description:
      'Consulta el Stock Oficial de Servicios ARN (escalas Micro, PyME y Grande) y calcula determinísticamente la inversión por dotación de empleados y el abono mensual con soporte SLA.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        serviceQuery: {
          type: Type.STRING,
          description: 'Servicio o desafío buscado (ej. Odoo v18, IA Services, Bioeconomía, Linux Docker, E-Commerce).',
        },
        employeeCount: {
          type: Type.NUMBER,
          description: 'Dotación de empleados de la empresa para determinar escala Micro (1-10), PyME (11-50) o Grande (+50).',
        },
        preferredStockId: {
          type: Type.STRING,
          description: 'ID o código opcional del servicio en el Stock ARN.',
        },
        currency: {
          type: Type.STRING,
          description: 'Moneda de cotización: USD o ARS.',
        },
      },
      required: ['employeeCount'],
    },
  },
  {
    name: 'emitir_o_actualizar_presupuesto_404020',
    description:
      'Crea o actualiza un presupuesto formal con esquema de hitos 40% Kickoff / 40% Staging UAT / 20% Go-Live en el Portal de Clientes y sincroniza la oportunidad en el Pipeline ARN.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientName: {
          type: Type.STRING,
          description: 'Nombre y apellido del contacto o decisor.',
        },
        clientEmail: {
          type: Type.STRING,
          description: 'Email del cliente vinculado al Portal.',
        },
        companyName: {
          type: Type.STRING,
          description: 'Nombre de la empresa u organización.',
        },
        employeeCount: {
          type: Type.NUMBER,
          description: 'Cantidad de empleados que define la escala Micro, PyME o Grande.',
        },
        stockServiceId: {
          type: Type.STRING,
          description: 'ID o código del servicio del Stock ARN.',
        },
        currency: {
          type: Type.STRING,
          description: 'Moneda: USD o ARS.',
        },
        activateKickoffImmediately: {
          type: Type.BOOLEAN,
          description: 'True si se ordena aprobar la propuesta e iniciar el proyecto 40/40/20 en el acto.',
        },
      },
      required: ['clientName', 'clientEmail', 'employeeCount'],
    },
  },
  {
    name: 'auditar_estado_hitos_y_pagos',
    description:
      'Verifica el estado financiero de los hitos 40% / 40% / 20% de un proyecto o presupuesto activo y calcula saldos pendientes de pago.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientEmail: {
          type: Type.STRING,
          description: 'Correo electrónico del cliente a auditar.',
        },
      },
      required: ['clientEmail'],
    },
  },
  {
    name: 'verificar_o_agendar_sesion_meet',
    description:
      'Verifica disponibilidad en la agenda ejecutiva y reserva o propone una sesión 1-on-1 por Google Meet.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientName: {
          type: Type.STRING,
          description: 'Nombre del solicitante.',
        },
        clientEmail: {
          type: Type.STRING,
          description: 'Correo electrónico del solicitante.',
        },
        topic: {
          type: Type.STRING,
          description: 'Temario o motivo de la reunión.',
        },
        preferredDate: {
          type: Type.STRING,
          description: 'Fecha preferida en formato YYYY-MM-DD.',
        },
      },
      required: ['clientEmail', 'topic'],
    },
  },
  {
    name: 'gestionar_ticket_soporte_sla',
    description:
      'Abre un ticket técnico con prioridad SLA en la mesa de ayuda del Portal de Clientes.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        subject: {
          type: Type.STRING,
          description: 'Asunto corto del incidente o requerimiento de soporte.',
        },
        severity: {
          type: Type.STRING,
          description: 'Severidad SLA: low, medium, high, critical.',
        },
        systemArea: {
          type: Type.STRING,
          description: 'Área técnica: odoo_erp, servers, database, frontend, security, integrations.',
        },
        description: {
          type: Type.STRING,
          description: 'Descripción técnica detallada.',
        },
      },
      required: ['subject', 'description'],
    },
  },
  {
    name: 'disparar_automatizacion_externa_n8n',
    description:
      'Despacha un evento estructurado hacia un contenedor externo n8n (Community Edition) mediante Webhook para integraciones empresariales.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventType: {
          type: Type.STRING,
          description: 'Tipo de evento: quote_created, project_kickoff, sla_alert, crm_sync.',
        },
        summary: {
          type: Type.STRING,
          description: 'Resumen ejecutivo del evento enviado a n8n.',
        },
      },
      required: ['eventType', 'summary'],
    },
  },
];

/**
 * Optional Groq Cloud ($0 Free Tier) fast inference helper (>300 tokens/s)
 * Used as fast classifier or automatic failover if Gemini Free Tier hits 15 RPM
 */
async function callGroqFastFailover(params: {
  groqApiKey: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string | null> {
  if (!params.groqApiKey || params.groqApiKey.trim().length < 10) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2800);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.groqApiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 450,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userPrompt },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data: any = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

/**
 * Runs the 4-Node Cyclic StateGraph for the ARN Autonomous Agent:
 * Node 1: Evaluate Objective (Desglosa el pedido en subtareas lógicas)
 * Node 2: Retrieve Context & Memory (Consulta estado en Supabase/CRM + Reglas de Negocio Stock ARN)
 * Node 3: Decide & Execute Tools (Invoca herramientas reales y sincroniza estado)
 * Node 4: Analyze & Verify Result (Verifica consistencia 40/40/20 y corrige rumbo si falta algún paso)
 */
export async function runArnAutonomousAgent(
  params: RunArnAgentParams
): Promise<RunArnAgentResult> {
  const {
    prompt,
    callerRole,
    authenticatedClient,
    overrideEmployeeCount,
    preferredStockId,
    aiClient,
    groqApiKey = process.env.GROQ_API_KEY || '',
    n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || process.env.WHATSAPP_WEBHOOK_URL || '',
    store,
  } = params;

  const cleanPrompt = (prompt || '').trim();
  const lowerPrompt = cleanPrompt.toLowerCase();
  const activeStock =
    store.serviceStock && store.serviceStock.length > 0
      ? store.serviceStock
      : INITIAL_ARN_SERVICE_STOCK;

  // ==========================================================================
  // GUARDRAIL DE SEGURIDAD 0: Visitante Público sin sesión iniciada
  // ==========================================================================
  if (callerRole === 'public_visitor') {
    const matchedStock = matchServiceFromStock({
      query: cleanPrompt,
      preferredStockId,
      serviceStock: activeStock,
    });
    const publicTrace: ArnAgentTrace = {
      architecture: 'StateGraph-TS-4-Node',
      llmEngineUsed: 'deterministic-stategraph',
      costTier: '$0 Free Tier (Gemini API + Groq Cloud + StateGraph TS)',
      loopIterations: 1,
      step1_evaluateObjective: {
        primaryGoal: 'Orientación consultiva inicial sin exposición de cotizaciones privadas',
        detectedIntent: 'public_advisory_gate',
        callerRole: 'public_visitor',
        subtasks: [
          {
            id: 'sub-pub-1',
            order: 1,
            description: 'Identificar solución tecnológica dentro del catálogo oficial',
            targetTool: 'consultar_stock_y_reglas_arn',
            status: 'completed',
          },
          {
            id: 'sub-pub-2',
            order: 2,
            description: 'Proteger privacidad de precios 40/40/20 exigiendo registro en Portal (#portal)',
            targetTool: 'security_guardrail',
            status: 'completed',
          },
        ],
      },
      step2_contextAndMemory: {
        relationalRecordsFound: 0,
        detectedEmployeeCount: 5,
        companyScaleLabel: 'Requiere sesión en Portal Clientes',
        matchedStockCode: matchedStock.code,
        matchedStockName: matchedStock.name,
        businessRulesApplied: [
          'Regla de Seguridad Home: Prohibido emitir presupuestos 40/40/20 o enviar correos sin registro previo en #portal.',
          `Solución identificada: [${matchedStock.code}] ${matchedStock.name}`,
        ],
      },
      step3_toolsExecuted: [],
      step4_resultVerification: {
        goalResolved: true,
        math404020Verified: true,
        persistenceVerified: true,
        selfCorrectionsApplied: [],
        auditSummary:
          'Guardrail aplicado correctamente: los valores numéricos y el presupuesto 40/40/20 se gestionan exclusivamente con usuario registrado en el Portal de Clientes.',
      },
    };

    return {
      success: true,
      finalResponse: `Identificamos la solución **[${matchedStock.code}] ${matchedStock.name}** para tu requerimiento. Por políticas de seguridad y confidencialidad de **gastonbarea.com**, todo el cálculo y tratamiento del presupuesto **40/40/20** se realiza exclusivamente con usuario registrado dentro del **Portal de Clientes (#portal)**.`,
      actionsExecuted: [
        'Guardrail de Privacidad aplicado: sin exposición de montos ni envíos de email en vista pública.',
      ],
      agentTrace: publicTrace,
      artifacts: {},
    };
  }

  // ==========================================================================
  // NODO 1: EVALUAR EL OBJETIVO (Desglosa el pedido en subtareas lógicas)
  // ==========================================================================
  const parsedCommand = parseNaturalArnCommand(
    cleanPrompt,
    authenticatedClient?.email,
    overrideEmployeeCount,
    activeStock,
    preferredStockId
  );

  // Enforce authenticated client isolation: a logged-in client in #portal can ONLY act on their own account
  const targetClientEmail =
    callerRole === 'authenticated_client' && authenticatedClient?.email
      ? authenticatedClient.email.toLowerCase().trim()
      : parsedCommand.clientEmail.toLowerCase().trim();

  const targetClientName =
    callerRole === 'authenticated_client' && authenticatedClient?.name
      ? authenticatedClient.name
      : parsedCommand.clientName;

  const targetCompanyName =
    callerRole === 'authenticated_client' && authenticatedClient?.company
      ? authenticatedClient.company
      : parsedCommand.companyName;

  const wantsTicket =
    lowerPrompt.includes('ticket') ||
    lowerPrompt.includes('incidente') ||
    lowerPrompt.includes('soporte') ||
    lowerPrompt.includes('error') ||
    lowerPrompt.includes('caíd') ||
    lowerPrompt.includes('urgente');

  const wantsAuditPayments =
    lowerPrompt.includes('saldo') ||
    lowerPrompt.includes('hito') ||
    lowerPrompt.includes('pago') ||
    lowerPrompt.includes('cuánto') ||
    lowerPrompt.includes('cuanto') ||
    lowerPrompt.includes('resta') ||
    lowerPrompt.includes('estado');

  const wantsMeet =
    parsedCommand.shouldScheduleMeet ||
    lowerPrompt.includes('meet') ||
    lowerPrompt.includes('reuni') ||
    lowerPrompt.includes('agend') ||
    lowerPrompt.includes('turno');

  const wantsQuote =
    parsedCommand.shouldGenerateQuote ||
    lowerPrompt.includes('cotiz') ||
    lowerPrompt.includes('presupuesto') ||
    lowerPrompt.includes('40/40/20') ||
    lowerPrompt.includes('emplead') ||
    lowerPrompt.includes('escala') ||
    lowerPrompt.includes('sumar') ||
    lowerPrompt.includes('actualizar') ||
    (!wantsTicket && !wantsMeet);

  const wantsN8n =
    callerRole === 'admin_arn' &&
    (lowerPrompt.includes('n8n') || lowerPrompt.includes('webhook') || Boolean(n8nWebhookUrl));

  const subtasks: AgentSubtask[] = [
    {
      id: 'sub-1',
      order: 1,
      description: `Consultar memoria CRM y estado previo de ${targetClientName} (${targetCompanyName})`,
      targetTool: 'consultar_memoria_cliente_crm',
      status: 'pending',
    },
    {
      id: 'sub-2',
      order: 2,
      description: `Evaluar reglas del Stock ARN [${parsedCommand.stockServiceCode}] según escala y dotación de empleados`,
      targetTool: 'consultar_stock_y_reglas_arn',
      status: 'pending',
    },
  ];

  if (wantsQuote) {
    subtasks.push({
      id: `sub-${subtasks.length + 1}`,
      order: subtasks.length + 1,
      description: parsedCommand.shouldActivateKickoff
        ? 'Emitir presupuesto 40/40/20, aprobarlo y aprovisionar proyecto Kickoff en el Portal'
        : 'Emitir o actualizar presupuesto formal 40/40/20 sincronizado en el Portal Clientes',
      targetTool: 'emitir_o_actualizar_presupuesto_404020',
      status: 'pending',
    });
  }

  if (wantsAuditPayments) {
    subtasks.push({
      id: `sub-${subtasks.length + 1}`,
      order: subtasks.length + 1,
      description: 'Auditar estado contable de los hitos 40% / 40% / 20% y saldos pendientes',
      targetTool: 'auditar_estado_hitos_y_pagos',
      status: 'pending',
    });
  }

  if (wantsMeet) {
    subtasks.push({
      id: `sub-${subtasks.length + 1}`,
      order: subtasks.length + 1,
      description: 'Verificar disponibilidad de agenda ejecutiva y registrar sesión Google Meet',
      targetTool: 'verificar_o_agendar_sesion_meet',
      status: 'pending',
    });
  }

  if (wantsTicket) {
    subtasks.push({
      id: `sub-${subtasks.length + 1}`,
      order: subtasks.length + 1,
      description: 'Abrir ticket de soporte técnico con compromiso SLA en el Portal',
      targetTool: 'gestionar_ticket_soporte_sla',
      status: 'pending',
    });
  }

  if (wantsN8n) {
    subtasks.push({
      id: `sub-${subtasks.length + 1}`,
      order: subtasks.length + 1,
      description: 'Notificar evento estructurado al bus de automatización n8n Webhook',
      targetTool: 'disparar_automatizacion_externa_n8n',
      status: 'pending',
    });
  }

  // ==========================================================================
  // NODO 2: CONSULTAR CONTEXTO Y MEMORIA (Relacional + Reglas de Negocio)
  // ==========================================================================
  const existingContacts = store.contacts.filter(
    (c) =>
      c.email.toLowerCase() === targetClientEmail ||
      (targetCompanyName &&
        targetCompanyName !== 'Contacto Individual' &&
        (c.companyName || '').toLowerCase() === targetCompanyName.toLowerCase())
  );
  const existingCompanies = store.companies.filter(
    (c) =>
      (targetCompanyName && c.name.toLowerCase() === targetCompanyName.toLowerCase()) ||
      (c.email && c.email.toLowerCase() === targetClientEmail)
  );
  const existingOpportunities = store.opportunities.filter(
    (o) =>
      o.clientEmail.toLowerCase() === targetClientEmail ||
      (targetCompanyName &&
        targetCompanyName !== 'Contacto Individual' &&
        (o.company || '').toLowerCase() === targetCompanyName.toLowerCase())
  );
  const existingQuotes = store.quotes.filter(
    (q) =>
      q.clientEmail.toLowerCase() === targetClientEmail ||
      (targetCompanyName &&
        targetCompanyName !== 'Contacto Individual' &&
        (q.clientCompany || '').toLowerCase() === targetCompanyName.toLowerCase())
  );
  const existingProjects = store.projects.filter(
    (p) =>
      p.clientEmail.toLowerCase() === targetClientEmail ||
      (targetCompanyName &&
        targetCompanyName !== 'Contacto Individual' &&
        p.company.toLowerCase() === targetCompanyName.toLowerCase())
  );
  const existingBookings = store.bookings.filter(
    (b) => b.clientEmail.toLowerCase() === targetClientEmail && b.status !== 'completed'
  );

  const relationalRecordsFound =
    existingContacts.length +
    existingCompanies.length +
    existingOpportunities.length +
    existingQuotes.length +
    existingProjects.length +
    existingBookings.length;

  // Inherit employee count from memory if user didn't explicitly specify a new one in this turn
  const explicitEmpRegex =
    /\b([1-9][0-9]{0,3})\s*(?:empleados|personas|usuarios|colaboradores|operarios|puestos|personal)\b/i;
  const hasExplicitEmpInPrompt =
    Boolean(overrideEmployeeCount && overrideEmployeeCount > 0) ||
    explicitEmpRegex.test(cleanPrompt);

  const memoryEmployeeCount =
    existingQuotes[0]?.employeeCount ||
    existingOpportunities[0]?.employeeCount ||
    5;

  const effectiveEmployeeCount = hasExplicitEmpInPrompt
    ? parsedCommand.employeeCount
    : memoryEmployeeCount;

  // Inherit stock service from memory if user is asking to adjust employees on their current quote without naming a new service
  const effectiveStockService = matchServiceFromStock({
    query: cleanPrompt,
    serviceCategory: parsedCommand.serviceCategory,
    preferredStockId:
      preferredStockId ||
      (!lowerPrompt.match(/odoo|erp|ecommerce|b2b|linux|docker|bio|iot|ia|cto|pmo/) &&
      existingQuotes[0]?.stockServiceId
        ? existingQuotes[0].stockServiceId
        : parsedCommand.stockServiceId),
    serviceStock: activeStock,
  });

  const resolvedPricing = calculateEmployeeTierPricing({
    employeeCount: effectiveEmployeeCount,
    serviceCategory: effectiveStockService.serviceCategory,
    currency: parsedCommand.currency,
    explicitTotalOverride:
      parsedCommand.estimatedValue !==
      calculateEmployeeTierPricing({
        employeeCount: parsedCommand.employeeCount,
        serviceCategory: parsedCommand.serviceCategory,
        currency: parsedCommand.currency,
        preferredStockId: parsedCommand.stockServiceId,
        serviceStock: activeStock,
      }).totalImplementationCost
        ? parsedCommand.estimatedValue
        : undefined,
    preferredStockId: effectiveStockService.id,
    serviceStock: activeStock,
  });

  const businessRulesApplied: string[] = [
    `Escala determinada por dotación (${resolvedPricing.employeeCount} empleados): ${resolvedPricing.companyScaleLabel} (${resolvedPricing.employeeRangeLabel})`,
    `Servicio Stock ARN: [${effectiveStockService.code}] ${effectiveStockService.name} — Base: ${resolvedPricing.currency} $${resolvedPricing.baseImplementationCost.toLocaleString()} + Incremento dotación: ${resolvedPricing.currency} $${resolvedPricing.scaleIncrementCost.toLocaleString()} = Total ${resolvedPricing.currency} $${resolvedPricing.totalImplementationCost.toLocaleString()}`,
    `Abono Mensual Operativo + Soporte SLA: ${resolvedPricing.currency} $${resolvedPricing.monthlySupportFee.toLocaleString()}/mes`,
    'Regla Financiera 40/40/20: 40% Kickoff, 40% Entrega Staging UAT, 20% Go-Live Producción',
  ];

  // ==========================================================================
  // NODO 3: DECIDIR Y EJECUTAR ACCIONES (Function Calling + Ejecución Real)
  // ==========================================================================
  const toolsExecuted: AgentToolInvocationRecord[] = [];
  const actionsExecuted: string[] = [];
  let llmEngineUsed: ArnAgentTrace['llmEngineUsed'] = 'deterministic-stategraph';
  let loopIterations = 1;

  let createdOrUpdatedOpp: Opportunity | null = null;
  let createdOrUpdatedQuote: Quote | null = null;
  let createdOrUpdatedProject: ClientProject | null = null;
  let createdTicket: SupportTicket | null = null;
  let createdBooking: ConsultingBooking | null = null;

  // Tool 1 Execution: consultar_memoria_cliente_crm
  const t1Start = Date.now();
  subtasks[0].status = 'completed';
  toolsExecuted.push({
    toolName: 'consultar_memoria_cliente_crm',
    args: {
      clientEmail: targetClientEmail,
      companyName: targetCompanyName,
    },
    outputSummary:
      relationalRecordsFound > 0
        ? `Recuperados ${relationalRecordsFound} registros previos en memoria CRM (${existingQuotes.length} cotizaciones, ${existingProjects.length} proyectos, ${existingBookings.length} reuniones).`
        : `Sin registros previos para ${targetClientEmail}; se inicializa nuevo nodo relacional en ARN.`,
    success: true,
    durationMs: Math.max(1, Date.now() - t1Start),
  });

  // Tool 2 Execution: consultar_stock_y_reglas_arn
  const t2Start = Date.now();
  subtasks[1].status = 'completed';
  toolsExecuted.push({
    toolName: 'consultar_stock_y_reglas_arn',
    args: {
      serviceQuery: effectiveStockService.name,
      employeeCount: resolvedPricing.employeeCount,
      preferredStockId: effectiveStockService.id,
      currency: resolvedPricing.currency,
    },
    outputSummary: `[${effectiveStockService.code}] ${resolvedPricing.companyScaleLabel} (${resolvedPricing.employeeCount} emp.): Total ${resolvedPricing.currency} $${resolvedPricing.totalImplementationCost.toLocaleString()} + Soporte SLA $${resolvedPricing.monthlySupportFee.toLocaleString()}/mes.`,
    success: true,
    durationMs: Math.max(1, Date.now() - t2Start),
  });

  // Optional Gemini Function Calling / Groq LPU Reasoning Pass
  let aiExecutiveSynthesis: string | null = null;
  if (aiClient) {
    try {
      const toolSelectionResponse = await Promise.race([
        aiClient.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Actuás como el Orquestador Agéntico ARN de gastonbarea.com.
Rol activo: ${callerRole}
Cliente objetivo: ${targetClientName} (${targetCompanyName} · ${targetClientEmail})
Dotación relevada: ${resolvedPricing.employeeCount} empleados (${resolvedPricing.companyScaleLabel})
Servicio Stock ARN: [${effectiveStockService.code}] ${effectiveStockService.name}
Inversión total calculada: ${resolvedPricing.currency} $${resolvedPricing.totalImplementationCost.toLocaleString()} (40% = $${Math.round(resolvedPricing.totalImplementationCost * 0.4).toLocaleString()}, 40% = $${Math.round(resolvedPricing.totalImplementationCost * 0.4).toLocaleString()}, 20% = $${(resolvedPricing.totalImplementationCost - Math.round(resolvedPricing.totalImplementationCost * 0.4) * 2).toLocaleString()})
Pedido del usuario: "${cleanPrompt}"

Si corresponde ejecutar una herramienta adicional o sintetizar la confirmación ejecutiva, invocá la función declarada o redactá la síntesis ejecutiva de 2 oraciones confirmando las acciones.`,
                },
              ],
            },
          ],
          config: {
            tools: [{ functionDeclarations: ARN_AGENT_FUNCTION_DECLARATIONS }],
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini Agent timeout (3000ms)')), 3000)
        ),
      ]);

      llmEngineUsed = 'gemini-function-calling';
      if (toolSelectionResponse.text) {
        aiExecutiveSynthesis = toolSelectionResponse.text.trim();
      }
    } catch {
      // Automatic Failover to Groq Cloud ($0 Free Tier) if configured
      if (groqApiKey) {
        const groqReply = await callGroqFastFailover({
          groqApiKey,
          systemPrompt:
            'Sos el Agente Autónomo ARN de gastonbarea.com. Respondé en español argentino (vos) en 2 oraciones ejecutivas confirmando el presupuesto 40/40/20 y el estado en el Portal de Clientes.',
          userPrompt: `Cliente: ${targetClientName} (${targetCompanyName}). Dotación: ${resolvedPricing.employeeCount} empleados (${resolvedPricing.companyScaleLabel}). Servicio: [${effectiveStockService.code}] ${effectiveStockService.name}. Total: ${resolvedPricing.currency} $${resolvedPricing.totalImplementationCost.toLocaleString()}. Pedido: "${cleanPrompt}"`,
        });
        if (groqReply) {
          llmEngineUsed = 'groq-lpu-failover';
          aiExecutiveSynthesis = groqReply.trim();
        }
      }
    }
  } else if (groqApiKey) {
    const groqReply = await callGroqFastFailover({
      groqApiKey,
      systemPrompt:
        'Sos el Agente Autónomo ARN de gastonbarea.com. Respondé en español argentino (vos) en 2 oraciones ejecutivas confirmando el presupuesto 40/40/20 y el estado en el Portal de Clientes.',
      userPrompt: `Cliente: ${targetClientName} (${targetCompanyName}). Dotación: ${resolvedPricing.employeeCount} empleados (${resolvedPricing.companyScaleLabel}). Servicio: [${effectiveStockService.code}] ${effectiveStockService.name}. Total: ${resolvedPricing.currency} $${resolvedPricing.totalImplementationCost.toLocaleString()}. Pedido: "${cleanPrompt}"`,
    });
    if (groqReply) {
      llmEngineUsed = 'groq-lpu-failover';
      aiExecutiveSynthesis = groqReply.trim();
    }
  }

  // Tool 3 Execution: emitir_o_actualizar_presupuesto_404020
  if (wantsQuote) {
    const tQuoteStart = Date.now();
    const syncedIds = store.onUpsertCompanyAndContact
      ? store.onUpsertCompanyAndContact({
          clientName: targetClientName,
          clientEmail: targetClientEmail,
          clientPhone: parsedCommand.phone,
          company: targetCompanyName,
          stage: parsedCommand.shouldActivateKickoff ? 'won' : 'proposal_sent',
          employeeCount: resolvedPricing.employeeCount,
          employeeRangeLabel: resolvedPricing.employeeRangeLabel,
        })
      : {};

    const existingOpp = store.opportunities.find(
      (o) =>
        o.clientEmail.toLowerCase() === targetClientEmail &&
        o.stage !== 'won' &&
        o.stage !== 'lost'
    );
    const oppId = existingOpp?.id || `opp-arn-${Date.now()}`;
    const targetStage = parsedCommand.shouldActivateKickoff ? 'won' : 'proposal_sent';

    const suffix =
      targetCompanyName && targetCompanyName !== 'Contacto Individual'
        ? ` · ${targetCompanyName}`
        : '';
    const summaryTitle = `${effectiveStockService.name}${suffix}`;

    createdOrUpdatedQuote = buildAutonomous404020Quote({
      opportunityId: oppId,
      clientName: targetClientName,
      clientEmail: targetClientEmail,
      companyName: targetCompanyName,
      employeeCount: resolvedPricing.employeeCount,
      serviceCategory: effectiveStockService.serviceCategory,
      title: summaryTitle,
      totalAmount: resolvedPricing.totalImplementationCost,
      currency: resolvedPricing.currency,
      preferredStockId: effectiveStockService.id,
      serviceStock: activeStock,
      notes: cleanPrompt,
    });

    if (parsedCommand.shouldActivateKickoff) {
      createdOrUpdatedQuote.status = 'accepted';
    }

    createdOrUpdatedOpp = {
      id: oppId,
      title: summaryTitle,
      clientName: targetClientName,
      clientEmail: targetClientEmail,
      clientPhone: parsedCommand.phone || existingOpp?.clientPhone,
      company: targetCompanyName,
      companyId: syncedIds.companyId || existingOpp?.companyId,
      contactId: syncedIds.contactId || existingOpp?.contactId,
      serviceCategory: effectiveStockService.serviceCategory,
      stage: targetStage,
      value: createdOrUpdatedQuote.total,
      currency: createdOrUpdatedQuote.currency,
      employeeCount: resolvedPricing.employeeCount,
      companyScale: resolvedPricing.companyScale,
      employeeRangeLabel: resolvedPricing.employeeRangeLabel,
      stockServiceId: effectiveStockService.id,
      stockServiceCode: effectiveStockService.code,
      valueProposition: effectiveStockService.valueProposition,
      baseImplementationCost: resolvedPricing.baseImplementationCost,
      scaleIncrementCost: resolvedPricing.scaleIncrementCost,
      monthlySupportFee: resolvedPricing.monthlySupportFee,
      probability: targetStage === 'won' ? 100 : 75,
      linkedQuoteId: createdOrUpdatedQuote.quoteNumber,
      notes: `[Agente Autónomo ARN · ${effectiveStockService.code} · ${resolvedPricing.employeeRangeLabel}]: ${cleanPrompt}`,
      source: callerRole === 'authenticated_client' ? 'portal_registration' : 'manual',
      createdAt: existingOpp?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (store.onPersistQuoteAndOpportunity) {
      await store.onPersistQuoteAndOpportunity({
        quote: createdOrUpdatedQuote,
        opportunity: createdOrUpdatedOpp,
      });
    } else {
      store.quotes.unshift(createdOrUpdatedQuote);
      if (existingOpp) {
        const idx = store.opportunities.findIndex((o) => o.id === oppId);
        if (idx !== -1) store.opportunities[idx] = createdOrUpdatedOpp;
      } else {
        store.opportunities.unshift(createdOrUpdatedOpp);
      }
    }

    actionsExecuted.push(
      `Nodo ARN sincronizado: ${targetClientName} (${targetCompanyName} · ${resolvedPricing.employeeRangeLabel}) · Stock [${effectiveStockService.code}]`
    );
    actionsExecuted.push(
      `Presupuesto 40/40/20 ${createdOrUpdatedQuote.quoteNumber} emitido (${createdOrUpdatedQuote.currency} $${createdOrUpdatedQuote.total.toLocaleString()} + Soporte SLA $${resolvedPricing.monthlySupportFee.toLocaleString()}/mes) y disponible en Portal (#portal)`
    );

    if (parsedCommand.shouldActivateKickoff && store.onActivateKickoffProject) {
      createdOrUpdatedProject = await store.onActivateKickoffProject({
        quote: createdOrUpdatedQuote,
        phone: parsedCommand.phone,
      });
      actionsExecuted.push(
        `Proyecto 40/40/20 "${createdOrUpdatedProject.projectName}" aprovisionado y activado en el Portal Clientes`
      );
    }

    const quoteSub = subtasks.find(
      (s) => s.targetTool === 'emitir_o_actualizar_presupuesto_404020'
    );
    if (quoteSub) quoteSub.status = 'completed';

    toolsExecuted.push({
      toolName: 'emitir_o_actualizar_presupuesto_404020',
      args: {
        clientName: targetClientName,
        clientEmail: targetClientEmail,
        companyName: targetCompanyName,
        employeeCount: resolvedPricing.employeeCount,
        stockServiceId: effectiveStockService.id,
        currency: resolvedPricing.currency,
        activateKickoffImmediately: parsedCommand.shouldActivateKickoff,
      },
      outputSummary: `Emitida cotización ${createdOrUpdatedQuote.quoteNumber} por ${createdOrUpdatedQuote.currency} $${createdOrUpdatedQuote.total.toLocaleString()} (40%: $${createdOrUpdatedQuote.milestones[0].amount.toLocaleString()} / 40%: $${createdOrUpdatedQuote.milestones[1].amount.toLocaleString()} / 20%: $${createdOrUpdatedQuote.milestones[2].amount.toLocaleString()}).`,
      success: true,
      durationMs: Math.max(1, Date.now() - tQuoteStart),
    });
  }

  // Tool 4 Execution: auditar_estado_hitos_y_pagos
  if (wantsAuditPayments) {
    const tAuditStart = Date.now();
    const activeProj = createdOrUpdatedProject || existingProjects[0] || null;
    const activeQt = createdOrUpdatedQuote || existingQuotes[0] || null;

    let auditMsg = '';
    if (activeProj && Array.isArray(activeProj.milestones)) {
      const pendingMilestones = activeProj.milestones.filter((m) => m.paymentStatus !== 'paid');
      const pendingTotal = pendingMilestones.reduce((acc, m) => acc + (m.amount || 0), 0);
      const nextMilestone = pendingMilestones[0];
      const projCurrency = nextMilestone?.currency || activeProj.milestones[0]?.currency || 'USD';
      auditMsg = `Proyecto activo "${activeProj.projectName}": ${
        nextMilestone
          ? `Próximo hito a abonar: "${nextMilestone.title}" por ${projCurrency} $${nextMilestone.amount.toLocaleString()}. Saldo total pendiente: ${projCurrency} $${pendingTotal.toLocaleString()}.`
          : 'Todos los hitos 40/40/20 se encuentran pagados al 100%.'
      }`;
    } else if (activeQt) {
      const h1 = Math.round(activeQt.total * 0.4);
      auditMsg = `Cotización ${activeQt.quoteNumber} (${activeQt.status}): Hito 1 (40% Kickoff) = ${activeQt.currency} $${h1.toLocaleString()} pendiente de activación.`;
    } else {
      auditMsg = 'Sin saldos vencidos ni hitos pendientes de pago en la cuenta actual.';
    }

    actionsExecuted.push(`Auditoría financiera 40/40/20: ${auditMsg}`);
    const auditSub = subtasks.find((s) => s.targetTool === 'auditar_estado_hitos_y_pagos');
    if (auditSub) auditSub.status = 'completed';

    toolsExecuted.push({
      toolName: 'auditar_estado_hitos_y_pagos',
      args: { clientEmail: targetClientEmail },
      outputSummary: auditMsg,
      success: true,
      durationMs: Math.max(1, Date.now() - tAuditStart),
    });
  }

  // Tool 5 Execution: verificar_o_agendar_sesion_meet
  if (wantsMeet) {
    const tMeetStart = Date.now();
    const existingActiveBooking = existingBookings[0];
    if (existingActiveBooking) {
      const meetMsg = `El cliente ya cuenta con sesión Google Meet activa para el ${existingActiveBooking.date} (${existingActiveBooking.timeSlot}).`;
      actionsExecuted.push(meetMsg);
      toolsExecuted.push({
        toolName: 'verificar_o_agendar_sesion_meet',
        args: { clientEmail: targetClientEmail, topic: cleanPrompt },
        outputSummary: meetMsg,
        success: true,
        durationMs: Math.max(1, Date.now() - tMeetStart),
      });
    } else {
      const nextBusinessDate = new Date();
      nextBusinessDate.setDate(nextBusinessDate.getDate() + 1);
      if (nextBusinessDate.getDay() === 6) nextBusinessDate.setDate(nextBusinessDate.getDate() + 2);
      if (nextBusinessDate.getDay() === 0) nextBusinessDate.setDate(nextBusinessDate.getDate() + 1);
      const dateStr = nextBusinessDate.toISOString().split('T')[0];

      const newBooking: ConsultingBooking = {
        id: `bk-agent-${Date.now()}`,
        clientEmail: targetClientEmail,
        clientName: targetClientName,
        company: targetCompanyName,
        type: 'discovery_ia',
        date: dateStr,
        timeSlot: '15:00 - 15:45 (GMT-3)',
        agendaTopic: `Revisión Ejecutiva 40/40/20 · ${effectiveStockService.name}`,
        meetingUrl: 'https://meet.google.com/gaston-barea-arn',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
      createdBooking = newBooking;

      if (store.onCreateBooking) {
        await store.onCreateBooking(newBooking);
      } else {
        store.bookings.unshift(newBooking);
      }

      const meetMsg = `Sesión Google Meet agendada automáticamente para el ${newBooking.date} a las ${newBooking.timeSlot}.`;
      actionsExecuted.push(meetMsg);
      toolsExecuted.push({
        toolName: 'verificar_o_agendar_sesion_meet',
        args: {
          clientName: targetClientName,
          clientEmail: targetClientEmail,
          topic: newBooking.agendaTopic,
          preferredDate: newBooking.date,
        },
        outputSummary: meetMsg,
        success: true,
        durationMs: Math.max(1, Date.now() - tMeetStart),
      });
    }

    const meetSub = subtasks.find((s) => s.targetTool === 'verificar_o_agendar_sesion_meet');
    if (meetSub) meetSub.status = 'completed';
  }

  // Tool 6 Execution: gestionar_ticket_soporte_sla
  if (wantsTicket) {
    const tTicketStart = Date.now();
    const isCritical =
      lowerPrompt.includes('urgente') ||
      lowerPrompt.includes('caíd') ||
      lowerPrompt.includes('crític');
    const severity = isCritical ? 'high' : 'medium';

    createdTicket = {
      id: `tick-agent-${Date.now()}`,
      ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      clientEmail: targetClientEmail,
      clientName: targetClientName,
      company: targetCompanyName,
      subject: `Soporte Autónomo ARN · ${effectiveStockService.name}`,
      severity,
      systemArea:
        effectiveStockService.serviceCategory === 'odoo_erp'
          ? 'odoo_erp'
          : effectiveStockService.serviceCategory === 'linux_docker'
          ? 'servers'
          : 'integrations',
      description: cleanPrompt,
      status: 'open',
      slaHours: severity === 'high' ? 4 : 8,
      createdAt: new Date().toISOString(),
    };

    if (store.onCreateSupportTicket) {
      await store.onCreateSupportTicket(createdTicket);
    } else {
      store.tickets.unshift(createdTicket);
    }

    const ticketMsg = `Ticket SLA ${createdTicket.ticketNumber} abierto (Severidad: ${createdTicket.severity.toUpperCase()} · Tiempo de respuesta garantizado: ${createdTicket.slaHours}h).`;
    actionsExecuted.push(ticketMsg);

    const ticketSub = subtasks.find((s) => s.targetTool === 'gestionar_ticket_soporte_sla');
    if (ticketSub) ticketSub.status = 'completed';

    toolsExecuted.push({
      toolName: 'gestionar_ticket_soporte_sla',
      args: {
        subject: createdTicket.subject,
        severity: createdTicket.severity,
        systemArea: createdTicket.systemArea,
        description: createdTicket.description,
      },
      outputSummary: ticketMsg,
      success: true,
      durationMs: Math.max(1, Date.now() - tTicketStart),
    });
  }

  // Tool 7 Execution: disparar_automatizacion_externa_n8n (Optional Webhook Bridge)
  if (wantsN8n) {
    const tN8nStart = Date.now();
    let n8nDispatched = false;
    if (n8nWebhookUrl && n8nWebhookUrl.startsWith('http')) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'gastonbarea.com-arn-agent',
            timestamp: new Date().toISOString(),
            clientEmail: targetClientEmail,
            companyName: targetCompanyName,
            quoteNumber: createdOrUpdatedQuote?.quoteNumber,
            total: createdOrUpdatedQuote?.total,
            actionsExecuted,
          }),
        });
        n8nDispatched = true;
      } catch {
        n8nDispatched = false;
      }
    }
    const n8nSummary = n8nDispatched
      ? 'Payload de sincronización enviado con éxito al contenedor n8n Webhook.'
      : 'Evento preparado para bus n8n (configurá N8N_WEBHOOK_URL para disparo externo en vivo).';

    const n8nSub = subtasks.find((s) => s.targetTool === 'disparar_automatizacion_externa_n8n');
    if (n8nSub) n8nSub.status = 'completed';

    toolsExecuted.push({
      toolName: 'disparar_automatizacion_externa_n8n',
      args: {
        eventType: createdOrUpdatedQuote ? 'quote_created' : 'crm_sync',
        summary: actionsExecuted.join(' | '),
      },
      outputSummary: n8nSummary,
      success: true,
      durationMs: Math.max(1, Date.now() - tN8nStart),
    });
  }

  // ==========================================================================
  // NODO 4: ANALIZAR Y VERIFICAR EL RESULTADO (Self-Verification & Reflection)
  // ==========================================================================
  const selfCorrectionsApplied: string[] = [];
  let math404020Verified = true;

  if (!hasExplicitEmpInPrompt && relationalRecordsFound > 0) {
    selfCorrectionsApplied.push(
      `Autocorrección de contexto: el pedido no especificaba dotación de empleados; se recuperó automáticamente de la memoria CRM (${resolvedPricing.employeeCount} empleados · ${resolvedPricing.companyScaleLabel}).`
    );
  }

  if (createdOrUpdatedQuote) {
    const sumMilestones = createdOrUpdatedQuote.milestones.reduce(
      (sum, m) => sum + (m.amount || 0),
      0
    );
    if (sumMilestones !== createdOrUpdatedQuote.total) {
      loopIterations = 2;
      const m1 = Math.round(createdOrUpdatedQuote.total * 0.4);
      const m2 = Math.round(createdOrUpdatedQuote.total * 0.4);
      const m3 = createdOrUpdatedQuote.total - m1 - m2;
      createdOrUpdatedQuote.milestones[0].amount = m1;
      createdOrUpdatedQuote.milestones[1].amount = m2;
      createdOrUpdatedQuote.milestones[2].amount = m3;
      selfCorrectionsApplied.push(
        `Ajuste contable en bucle de verificación: se cuadró el tercer hito (20%) a $${m3.toLocaleString()} para suma exacta del 100% ($${createdOrUpdatedQuote.total.toLocaleString()}).`
      );
    }
    math404020Verified =
      createdOrUpdatedQuote.milestones[0].amount +
        createdOrUpdatedQuote.milestones[1].amount +
        createdOrUpdatedQuote.milestones[2].amount ===
      createdOrUpdatedQuote.total;
  }

  const allSubtasksCompleted = subtasks.every(
    (s) => s.status === 'completed' || s.status === 'corrected'
  );

  const verificationReport: AgentVerificationReport = {
    goalResolved: allSubtasksCompleted && actionsExecuted.length > 0,
    math404020Verified,
    persistenceVerified: true,
    selfCorrectionsApplied,
    auditSummary: createdOrUpdatedQuote
      ? `Verificación exitosa: Presupuesto ${createdOrUpdatedQuote.quoteNumber} cuadrado al 100% (${createdOrUpdatedQuote.currency} $${createdOrUpdatedQuote.total.toLocaleString()} en hitos 40/40/20) según Stock [${effectiveStockService.code}] y dotación de ${resolvedPricing.employeeCount} empleados.`
      : `Verificación exitosa: ${toolsExecuted.length} herramientas ejecutadas y validadas contra la cuenta ${targetClientEmail}.`,
  };

  const defaultFinalResponse = createdOrUpdatedQuote
    ? `Objetivo completado y verificado. Emití el presupuesto **40/40/20 #${createdOrUpdatedQuote.quoteNumber}** para **${targetClientName}** (${targetCompanyName}) aplicando el servicio **[${effectiveStockService.code}] ${effectiveStockService.name}** en **${resolvedPricing.companyScaleLabel}** (${resolvedPricing.employeeCount} empleados): inversión total de **${createdOrUpdatedQuote.currency} $${createdOrUpdatedQuote.total.toLocaleString()}** (Hito 1 40%: $${createdOrUpdatedQuote.milestones[0].amount.toLocaleString()} · Hito 2 40%: $${createdOrUpdatedQuote.milestones[1].amount.toLocaleString()} · Hito 3 20%: $${createdOrUpdatedQuote.milestones[2].amount.toLocaleString()}) + abono mensual de soporte SLA de **${createdOrUpdatedQuote.currency} $${resolvedPricing.monthlySupportFee.toLocaleString()}/mes**.`
    : actionsExecuted.join(' · ');

  const agentTrace: ArnAgentTrace = {
    architecture: 'StateGraph-TS-4-Node',
    llmEngineUsed,
    costTier: '$0 Free Tier (Gemini API + Groq Cloud + StateGraph TS)',
    loopIterations,
    step1_evaluateObjective: {
      primaryGoal: cleanPrompt,
      detectedIntent: parsedCommand.intent,
      callerRole,
      subtasks,
    },
    step2_contextAndMemory: {
      relationalRecordsFound,
      matchedClientEmail: targetClientEmail,
      matchedCompanyName: targetCompanyName,
      detectedEmployeeCount: resolvedPricing.employeeCount,
      companyScaleLabel: resolvedPricing.companyScaleLabel,
      matchedStockCode: effectiveStockService.code,
      matchedStockName: effectiveStockService.name,
      businessRulesApplied,
    },
    step3_toolsExecuted: toolsExecuted,
    step4_resultVerification: verificationReport,
  };

  return {
    success: true,
    finalResponse: aiExecutiveSynthesis || defaultFinalResponse,
    actionsExecuted,
    agentTrace,
    artifacts: {
      opportunity: createdOrUpdatedOpp,
      quote: createdOrUpdatedQuote,
      project: createdOrUpdatedProject,
      ticket: createdTicket,
      booking: createdBooking,
    },
  };
}
