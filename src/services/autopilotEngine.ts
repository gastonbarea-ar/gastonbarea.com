import { GoogleGenAI, Type } from '@google/genai';
import {
  AgentActivityLog,
  AgentConversation,
  AutopilotChannel,
  AutopilotConfig,
  AutopilotOverviewMetrics,
  ConversationStage,
  FollowUpCandidate,
  VipEscalationItem,
  VipEscalationReason,
} from '../types/autopilot.ts';
import {
  ArnServiceStockItem,
  CrmContact,
  Opportunity,
  Quote,
} from '../types/crm.ts';
import {
  ClientProject,
  ConsultingBooking,
  SupportTicket,
} from '../types/clientPortal.ts';
import {
  buildAutonomous404020Quote,
  calculateEmployeeTierPricing,
  matchServiceFromStock,
} from '../utils/arnEngine.ts';
import { INITIAL_ARN_SERVICE_STOCK } from '../data/crmTemplates.ts';

export interface AutopilotStoreSnapshot {
  opportunities: Opportunity[];
  contacts: CrmContact[];
  quotes: Quote[];
  projects: ClientProject[];
  bookings: ConsultingBooking[];
  tickets: SupportTicket[];
  serviceStock: ArnServiceStockItem[];
}

export interface InboundAutonomousInput {
  channel: 'whatsapp' | 'portal' | 'web';
  externalId: string;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  messageText?: string;
  audioBase64?: string;
  audioMimeType?: string;
  config: AutopilotConfig;
  existingConversation?: AgentConversation;
  store: AutopilotStoreSnapshot;
  aiClient?: GoogleGenAI | null;
  groqApiKey?: string;
}

export interface InboundAutonomousDecision {
  replyText: string;
  shouldDispatchReply: boolean;
  transcript?: string;
  nextStage: ConversationStage;
  detectedEmployeeCount?: number;
  matchedStock?: ArnServiceStockItem;
  autoQuote?: Quote | null;
  vipEscalation?: Omit<VipEscalationItem, 'id' | 'createdAt' | 'status'> | null;
  activityLog: Omit<AgentActivityLog, 'id' | 'createdAt'>;
  llmProviderUsed: 'gemini-4-hydrogen' | 'groq-llama-3.3' | 'deterministic-arn';
}

interface StructuredLlmDecision {
  intent:
    | 'sales_qualify'
    | 'sales_quote_request'
    | 'meet_booking_request'
    | 'kickoff_payment_confirm'
    | 'support_status_l1'
    | 'support_critical_incident'
    | 'custom_enterprise_scope';
  replyText: string;
  extractedCompanyName?: string;
  extractedEmployeeCount?: number;
  extractedServiceQuery?: string;
  requiresVipEscalation: boolean;
  vipSummary?: string;
  suggestedAdminAction?: string;
}

/**
 * Transcribes inbound WhatsApp voice notes using Gemini's dedicated audio model.
 */
export async function transcribeWhatsAppAudio(params: {
  audioBase64: string;
  mimeType?: string;
  aiClient?: GoogleGenAI | null;
}): Promise<string | null> {
  if (!params.audioBase64 || !params.aiClient) return null;
  try {
    const cleanBase64 = params.audioBase64.replace(/^data:[^;]+;base64,/, '');
    const response = await params.aiClient.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          inlineData: {
            mimeType: params.mimeType || 'audio/ogg',
            data: cleanBase64,
          },
        },
        {
          text: 'Transcribí fielmente este audio de WhatsApp en español rioplatense/latinoamericano. Devolvé únicamente la transcripción textual limpia, sin comentarios adicionales.',
        },
      ],
    });
    const text = (response.text || '').trim();
    return text || null;
  } catch (err) {
    console.warn('[Autopilot Audio Transcribe] fallback:', (err as any)?.message || err);
    return null;
  }
}

function detectEmployeeCountFromText(text: string): number | undefined {
  const lower = text.toLowerCase();
  const explicitMatch = lower.match(
    /(\d{1,4})\s*(empleados|personas|usuarios|operarios|colaboradores|puestos|integrantes|sillas)/i
  );
  if (explicitMatch) {
    const parsed = parseInt(explicitMatch[1], 10);
    if (Number.isFinite(parsed) && parsed > 0 && parsed < 50000) return parsed;
  }
  if (/\b(corporaci[oó]n|multinacional|empresa grande|enterprise|\+50|mas de 50)\b/i.test(lower)) {
    return 80;
  }
  if (/\b(pyme|mediana|equipo mediano)\b/i.test(lower)) {
    return 25;
  }
  if (/\b(micro|emprendimiento|estudio chico|somos pocos|solo yo)\b/i.test(lower)) {
    return 5;
  }
  return undefined;
}

function findActiveClientContext(
  store: AutopilotStoreSnapshot,
  senderPhone?: string,
  senderEmail?: string
): {
  contact?: CrmContact;
  project?: ClientProject;
  latestQuote?: Quote;
  upcomingBooking?: ConsultingBooking;
} {
  const normEmail = (senderEmail || '').trim().toLowerCase();
  const normPhone = (senderPhone || '').replace(/\D/g, '');

  const contact = store.contacts.find((c) => {
    if (normEmail && c.email.toLowerCase() === normEmail) return true;
    const cPhone = (c.phone || '').replace(/\D/g, '');
    if (normPhone && cPhone && (cPhone.endsWith(normPhone.slice(-8)) || normPhone.endsWith(cPhone.slice(-8)))) {
      return true;
    }
    return false;
  });

  const emailKey = (contact?.email || normEmail).toLowerCase();

  const project = emailKey
    ? store.projects.find((p) => p.clientEmail.toLowerCase() === emailKey)
    : undefined;

  const latestQuote = emailKey
    ? store.quotes.find((q) => q.clientEmail.toLowerCase() === emailKey)
    : undefined;

  const upcomingBooking = emailKey
    ? store.bookings.find(
        (b) => b.clientEmail.toLowerCase() === emailKey && b.status === 'confirmed'
      )
    : undefined;

  return { contact, project, latestQuote, upcomingBooking };
}

function buildDeterministicDecision(params: {
  text: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  existingConversation?: AgentConversation;
  activeContext: ReturnType<typeof findActiveClientContext>;
  serviceStock: ArnServiceStockItem[];
  config: AutopilotConfig;
}): {
  structured: StructuredLlmDecision;
  matchedStock: ArnServiceStockItem;
  employeeCount?: number;
} {
  const lower = params.text.toLowerCase();
  const stockPool =
    params.serviceStock.length > 0 ? params.serviceStock : INITIAL_ARN_SERVICE_STOCK;
  const matchedStock = matchServiceFromStock({
    query: params.text,
    serviceStock: stockPool,
  });
  const detectedEmp =
    detectEmployeeCountFromText(params.text) || params.existingConversation?.employeeCount;

  // 1. Kickoff / 40% payment confirmation -> VIP immediate
  if (
    /\b(transfer[ií]|pagu[eé]|se[ñn]a|comprobante|apruebo el presupuesto|arrancamos|confirm[oó] el 40%|adelanto)\b/i.test(
      lower
    )
  ) {
    return {
      matchedStock,
      employeeCount: detectedEmp,
      structured: {
        intent: 'kickoff_payment_confirm',
        replyText: `Excelente ${params.senderName}, recibimos tu confirmación para iniciar el Kickoff (Hito 1 - 40%). Ya notifiqué de forma prioritaria a Gastón para validar la acreditación y habilitar tu entorno en el Portal de Clientes hoy mismo.`,
        requiresVipEscalation: true,
        vipSummary: `${params.senderName} confirmó intención/comprobante de pago del 40% de kickoff.`,
        suggestedAdminAction: 'Verificar acreditación del 40% y activar proyecto en Portal Clientes.',
      },
    };
  }

  // 2. Critical production outage / SLA incident reported by active client -> VIP
  if (
    params.activeContext.project &&
    /\b(ca[ií]do|no anda producci[oó]n|error cr[ií]tico|urgente|emergencia|servidor ca[ií]do|base de datos bloqueada)\b/i.test(
      lower
    )
  ) {
    return {
      matchedStock,
      employeeCount: detectedEmp,
      structured: {
        intent: 'support_critical_incident',
        replyText: `Recibido ${params.senderName}. Detectamos que es un incidente crítico sobre "${params.activeContext.project.projectName}". Abrimos ticket prioritario SLA, iniciamos diagnóstico automático y escalamos el contexto directo a Gastón.`,
        requiresVipEscalation: true,
        vipSummary: `Cliente activo (${params.activeContext.project.company}) reporta incidente crítico en ${params.activeContext.project.projectName}.`,
        suggestedAdminAction: 'Revisar ticket crítico y activar protocolo de contingencia SLA.',
      },
    };
  }

  // 3. Active client Level-1 status/milestone inquiry -> Resolve silently (NO interrupt!)
  if (
    params.activeContext.project &&
    /\b(estado|avance|sprint|hito|staging|portal|entrega|como va|c[oó]mo va|factura|presupuesto|link)\b/i.test(
      lower
    )
  ) {
    const p = params.activeContext.project;
    const pendingMilestones = (p.milestones || [])
      .filter((m) => m.status !== 'completed')
      .map((m) => `${m.title} (${m.percentage}%)`)
      .join(', ');
    return {
      matchedStock,
      employeeCount: detectedEmp,
      structured: {
        intent: 'support_status_l1',
        replyText:
          `Hola ${params.senderName}. Te comparto el estado actualizado de "${p.projectName}":\n` +
          `• Avance general: ${p.progressPercent}% (${p.status})\n` +
          `• Sprint activo: ${p.activeSprint || 'En ejecución'}\n` +
          (p.stagingUrl ? `• Entorno Staging: ${p.stagingUrl}\n` : '') +
          (pendingMilestones ? `• Próximos hitos: ${pendingMilestones}\n` : '') +
          `Podés ver todo el detalle y descargables ingresando a https://www.gastonbarea.com/#portal.`,
        requiresVipEscalation: false,
      },
    };
  }

  // 4. Google Meet consulting booking request
  if (/\b(reuni[oó]n|meet|agendar|llamada|charlar|turno|consultor[ií]a|horario|disponibilidad)\b/i.test(lower)) {
    const qualifies = Boolean(detectedEmp) || Boolean(params.existingConversation?.quoteId);
    if (qualifies) {
      return {
        matchedStock,
        employeeCount: detectedEmp,
        structured: {
          intent: 'meet_booking_request',
          replyText:
            `Perfecto ${params.senderName}. Para que Gastón llegue a la sesión de Arquitectura IA con el diagnóstico listo, podés elegir tu horario directo en https://www.gastonbarea.com/#portal (o indicarme qué día y franja horaria GMT-3 preferís). Ya dejé marcado tu expediente como prioritario.`,
          requiresVipEscalation: true,
          vipSummary: `Lead calificado (${params.senderName}${detectedEmp ? `, ~${detectedEmp} personas` : ''}) solicita sesión Google Meet de Consultoría IA sobre ${matchedStock.name}.`,
          suggestedAdminAction: 'Confirmar slot de Consultoría & Arquitectura IA en Google Meet.',
        },
      };
    }
    return {
      matchedStock,
      employeeCount: detectedEmp,
      structured: {
        intent: 'sales_qualify',
        replyText:
          `¡Hola ${params.senderName}! Con gusto coordinamos una sesión de Consultoría y Arquitectura IA con Gastón. Antes de bloquearte un horario, contame en 2 líneas:\n` +
          `1) ¿Cuántas personas integran tu empresa/equipo?\n` +
          `2) ¿Cuál es el cuello de botella principal que querés automatizar o integrar?\n` +
          `Con eso te preparo primero una estimación 40/40/20 de referencia para aprovechar la reunión al máximo.`,
      requiresVipEscalation: false,
      },
    };
  }

  // 5. Quote / pricing request with employee count -> Deterministic Stock ARN 40/40/20 Quote
  const wantsPrice = /\b(precio|presupuesto|cotiz|cuanto sale|cu[aá]nto sale|valor|inversi[oó]n|costo|odoo|ia|agente|automatiz|web|docker|servidor|bioeconom)/i.test(
    lower
  );

  if (wantsPrice && detectedEmp) {
    const pricing = calculateEmployeeTierPricing({
      employeeCount: detectedEmp,
      serviceCategory: matchedStock.serviceCategory,
      currency: 'USD',
      preferredStockId: matchedStock.id,
      serviceStock: stockPool,
    });
    const exceedsCap = pricing.totalImplementationCost > params.config.maxAutoQuoteAmountUsd;

    if (exceedsCap) {
      return {
        matchedStock,
        employeeCount: detectedEmp,
        structured: {
          intent: 'custom_enterprise_scope',
          extractedEmployeeCount: detectedEmp,
          replyText:
            `Gracias ${params.senderName}. Por la escala de tu organización (~${detectedEmp} personas) y el alcance de "${matchedStock.name}", este proyecto requiere un diseño de arquitectura a medida por parte de Gastón.\n` +
            `Como referencia inicial de nuestro catálogo corporativo, el esquema arranca en USD ${pricing.totalImplementationCost.toLocaleString('es-AR')} (40% Kickoff / 40% Staging / 20% Go-Live). Ya elevé tu requerimiento a la bandeja VIP de Gastón para coordinar la arquitectura.`,
          requiresVipEscalation: true,
          vipSummary: `Oportunidad Enterprise (~${detectedEmp} empleados, ref. USD ${pricing.totalImplementationCost.toLocaleString('es-AR')}) supera tope de autocotización.`,
          suggestedAdminAction: 'Revisar alcance Enterprise y liderar propuesta arquitectónica.',
        },
      };
    }

    const h40 = Math.round(pricing.totalImplementationCost * 0.4);
    const h20 = pricing.totalImplementationCost - h40 * 2;
    return {
      matchedStock,
      employeeCount: detectedEmp,
      structured: {
        intent: 'sales_quote_request',
        extractedEmployeeCount: detectedEmp,
        replyText:
          `¡Excelente ${params.senderName}! Según tu equipo (~${detectedEmp} personas, ${pricing.companyScaleLabel}), el módulo recomendado del catálogo oficial es **${matchedStock.name}**:\n` +
          `• Inversión llave en mano: USD ${pricing.totalImplementationCost.toLocaleString('es-AR')}\n` +
          `• Esquema de pagos 40/40/20: USD ${h40.toLocaleString('es-AR')} al Kickoff · USD ${h40.toLocaleString('es-AR')} en Staging · USD ${h20.toLocaleString('es-AR')} en Go-Live\n` +
          `• Soporte SLA mensual opcional: USD ${pricing.monthlySupportFee.toLocaleString('es-AR')}/mes\n` +
          `• Plazo estimado: ${pricing.estimatedTimeline}\n\n` +
          `¿Querés que te envíe el presupuesto formal en PDF a tu correo y te agende una sesión de arquitectura en Google Meet con Gastón?`,
        requiresVipEscalation: false,
      },
    };
  }

  // 6. Default consultative qualification (no interruption to Gastón)
  return {
    matchedStock,
    employeeCount: detectedEmp,
    structured: {
      intent: 'sales_qualify',
      replyText:
        `¡Hola ${params.senderName}! Soy el Asistente Autónomo de Arquitectura de Gastón Barea.\n` +
        `Para orientarte con precisión y pasarte una estimación oficial 40/40/20 al instante, contame:\n` +
        `1) ¿Qué proceso o sistema querés implementar (Odoo ERP, Agentes IA, Automatización n8n, Infraestructura)?\n` +
        `2) ¿Cuántas personas forman tu empresa o equipo?`,
      requiresVipEscalation: false,
    },
  };
}

async function runLlmConsultativeReasoning(params: {
  text: string;
  senderName: string;
  existingConversation?: AgentConversation;
  activeContext: ReturnType<typeof findActiveClientContext>;
  serviceStock: ArnServiceStockItem[];
  config: AutopilotConfig;
  aiClient?: GoogleGenAI | null;
  groqApiKey?: string;
}): Promise<{
  decision: StructuredLlmDecision;
  provider: 'gemini-4-hydrogen' | 'groq-llama-3.3';
} | null> {
  const stockCatalogSummary = (
    params.serviceStock.length > 0 ? params.serviceStock : INITIAL_ARN_SERVICE_STOCK
  )
    .filter((s) => s.active !== false)
    .slice(0, 8)
    .map(
      (s) =>
        `- [${s.code}] ${s.name}: Micro(1-10)=USD ${s.scales.micro.baseImplementationPrice}, PyME(11-50)=USD ${s.scales.pyme.baseImplementationPrice}, Grande(+50)=USD ${s.scales.grande.baseImplementationPrice} (${s.scales.pyme.estimatedTimeline})`
    )
    .join('\n');

  const historySnippet = (params.existingConversation?.messages || [])
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'Cliente' : 'Agente'}: ${m.content}`)
    .join('\n');

  const projectContext = params.activeContext.project
    ? `CLIENTE ACTIVO DETECTADO: Proyecto "${params.activeContext.project.projectName}" (${params.activeContext.project.company}), avance ${params.activeContext.project.progressPercent}%, sprint "${params.activeContext.project.activeSprint || 'En curso'}", staging: ${params.activeContext.project.stagingUrl || 'Pendiente'}.`
    : 'Prospecto comercial nuevo o sin proyecto activo confirmado.';

  const systemInstruction = `Sos el Agente Comercial y de Operaciones Autónomo de Gastón Barea (Arquitecto de Software, Odoo ERP, Automatización n8n e IA Corporativa en Argentina/LATAM).
TU MANDATO PRINCIPAL: Resolver el 90% de las consultas comerciales, cotizaciones y soporte Nivel 1 de punta a punta SIN molestar ni interrumpir a Gastón. Gastón SOLO interviene en consultoría y arquitectura IA confirmada, pagos del 40% o incidentes críticos reales.

REGLAS ESTRICTAS (GUARDRAILS):
1. Hablá en español rioplatense profesional y ejecutivo ("vos", directo, claro, sin relleno ni emojis excesivos).
2. NUNCA inventes precios ni ofrezcas descuentos no autorizados. Usá EXCLUSIVAMENTE el Catálogo Oficial de abajo y el esquema 40% Kickoff / 40% Staging / 20% Go-Live.
3. Si el prospecto todavía no dijo cuántas personas son en su empresa, pedile cantidad de empleados y desafío principal antes de cotizar o agendar Meet.
4. Si supera USD ${params.config.maxAutoQuoteAmountUsd} de inversión o pide arquitectura enterprise muy compleja, marcá requiresVipEscalation=true y reason custom_enterprise_scope.
5. Si confirma pago/seña del 40%, pide Meet estando ya calificado, o es un cliente activo con producción caída, marcá requiresVipEscalation=true.
6. Para soporte de estado de proyecto de cliente activo, respondé usando el contexto real del proyecto con requiresVipEscalation=false.

CONTEXTO DEL CLIENTE:
${projectContext}

CATÁLOGO OFICIAL ARN:
${stockCatalogSummary}

HISTORIAL RECIENTE:
${historySnippet || '(Sin historial previo)'}`;

  const userPrompt = `Mensaje entrante de ${params.senderName}: "${params.text}"\nRespondé estrictamente en JSON válido con las claves: intent, replyText, extractedCompanyName, extractedEmployeeCount, extractedServiceQuery, requiresVipEscalation, vipSummary, suggestedAdminAction.`;

  // 1. Primary: Gemini 4 Hydrogen (structured JSON)
  if (params.aiClient) {
    try {
      const response = await params.aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.25,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: {
                type: Type.STRING,
                enum: [
                  'sales_qualify',
                  'sales_quote_request',
                  'meet_booking_request',
                  'kickoff_payment_confirm',
                  'support_status_l1',
                  'support_critical_incident',
                  'custom_enterprise_scope',
                ],
              },
              replyText: { type: Type.STRING },
              extractedCompanyName: { type: Type.STRING },
              extractedEmployeeCount: { type: Type.NUMBER },
              extractedServiceQuery: { type: Type.STRING },
              requiresVipEscalation: { type: Type.BOOLEAN },
              vipSummary: { type: Type.STRING },
              suggestedAdminAction: { type: Type.STRING },
            },
            required: ['intent', 'replyText', 'requiresVipEscalation'],
          },
        },
      });
      const raw = (response.text || '').trim();
      if (raw) {
        const parsed = JSON.parse(raw) as StructuredLlmDecision;
        if (parsed.replyText && parsed.intent) {
          return { decision: parsed, provider: 'gemini-4-hydrogen' };
        }
      }
    } catch (err) {
      console.warn('[Autopilot Gemini] Failover to Groq:', (err as any)?.message || err);
    }
  }

  // 2. Failover: Groq LPU (llama-3.3-70b-versatile)
  if (params.groqApiKey) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
        }),
      });
      if (groqRes.ok) {
        const data: any = await groqRes.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content) as StructuredLlmDecision;
          if (parsed.replyText && parsed.intent) {
            return { decision: parsed, provider: 'groq-llama-3.3' };
          }
        }
      }
    } catch (err) {
      console.warn('[Autopilot Groq] Failover to Deterministic ARN:', (err as any)?.message || err);
    }
  }

  return null;
}

/**
 * Core Autonomous Orchestrator for WhatsApp, Web & Portal Inbound Messages.
 * Applies channel kill-switch, multimodal voice transcription, deterministic stock guardrails,
 * and anti-noise VIP escalation filtering.
 */
export async function processInboundAutonomousMessage(
  input: InboundAutonomousInput
): Promise<InboundAutonomousDecision> {
  const channelKey: AutopilotChannel =
    input.channel === 'portal' ? 'portal_support' : 'whatsapp';
  const mode = input.config.channels[channelKey] || 'autonomous';

  // 1. Optional Voice Note Transcription
  let transcript: string | undefined;
  let effectiveText = (input.messageText || '').trim();
  if (!effectiveText && input.audioBase64 && input.config.autoTranscribeWhatsAppAudio) {
    const transcribed = await transcribeWhatsAppAudio({
      audioBase64: input.audioBase64,
      mimeType: input.audioMimeType,
      aiClient: input.aiClient,
    });
    if (transcribed) {
      transcript = transcribed;
      effectiveText = transcribed;
    } else {
      effectiveText = '[Audio recibido sin transcripción disponible]';
    }
  }

  // 2. If channel is PAUSED, log quietly and do nothing
  if (mode === 'paused') {
    return {
      replyText: '',
      shouldDispatchReply: false,
      transcript,
      nextStage: input.existingConversation?.stage || 'new',
      autoQuote: null,
      vipEscalation: null,
      llmProviderUsed: 'deterministic-arn',
      activityLog: {
        channel: channelKey,
        actionType: 'inbound_logged_paused',
        targetLabel: input.senderName,
        outcome: 'paused_noop',
        noiseSuppressed: true,
        estimatedMinutesSaved: 0,
        detail: `Canal ${channelKey} en pausa. Mensaje registrado sin envío automático.`,
      },
    };
  }

  const activeContext = findActiveClientContext(
    input.store,
    input.senderPhone,
    input.senderEmail
  );

  // 3. Deterministic baseline + LLM consultative upgrade
  const deterministic = buildDeterministicDecision({
    text: effectiveText,
    senderName: input.senderName,
    senderEmail: input.senderEmail,
    senderPhone: input.senderPhone,
    existingConversation: input.existingConversation,
    activeContext,
    serviceStock: input.store.serviceStock,
    config: input.config,
  });

  const llmAttempt = await runLlmConsultativeReasoning({
    text: effectiveText,
    senderName: input.senderName,
    existingConversation: input.existingConversation,
    activeContext,
    serviceStock: input.store.serviceStock,
    config: input.config,
    aiClient: input.aiClient,
    groqApiKey: input.groqApiKey,
  });

  const finalStructured = llmAttempt?.decision || deterministic.structured;
  const providerUsed = llmAttempt?.provider || 'deterministic-arn';

  const stockPool =
    input.store.serviceStock.length > 0 ? input.store.serviceStock : INITIAL_ARN_SERVICE_STOCK;
  const matchedStock = matchServiceFromStock({
    query: finalStructured.extractedServiceQuery || effectiveText,
    serviceStock: stockPool,
  });
  const employeeCount =
    finalStructured.extractedEmployeeCount ||
    deterministic.employeeCount ||
    input.existingConversation?.employeeCount;

  // 4. Deterministic 40/40/20 Quote Issuance Guardrail
  let autoQuote: Quote | null = null;
  let exceedsCap = false;
  if (finalStructured.intent === 'sales_quote_request' && employeeCount) {
    const pricing = calculateEmployeeTierPricing({
      employeeCount,
      serviceCategory: matchedStock.serviceCategory,
      currency: 'USD',
      preferredStockId: matchedStock.id,
      serviceStock: stockPool,
    });
    exceedsCap = pricing.totalImplementationCost > input.config.maxAutoQuoteAmountUsd;
    if (!exceedsCap) {
      autoQuote = buildAutonomous404020Quote({
        opportunityId: `opp-auto-${Date.now()}`,
        clientName: input.senderName,
        clientEmail:
          input.senderEmail ||
          (input.senderPhone
            ? `${input.senderPhone.replace(/\D/g, '')}@whatsapp.gastonbarea.com`
            : 'prospecto@gastonbarea.com'),
        companyName:
          finalStructured.extractedCompanyName ||
          input.existingConversation?.companyName ||
          input.senderName,
        serviceCategory: matchedStock.serviceCategory,
        title: `${matchedStock.name} (${pricing.companyScaleLabel})`,
        currency: 'USD',
        employeeCount,
        preferredStockId: matchedStock.id,
        serviceStock: stockPool,
        notes: `Cotización autónoma 40/40/20 emitida vía ${input.channel}.`,
      });
    }
  }

  // 5. Map Stage & VIP Escalation Filter
  let nextStage: ConversationStage = 'qualifying';
  let vipReason: VipEscalationReason | null = null;

  if (finalStructured.intent === 'kickoff_payment_confirm') {
    nextStage = 'vip_escalated';
    vipReason = 'kickoff_payment_40';
  } else if (finalStructured.intent === 'support_critical_incident') {
    nextStage = 'vip_escalated';
    vipReason = 'critical_sla_unresolved';
  } else if (finalStructured.intent === 'custom_enterprise_scope' || exceedsCap) {
    nextStage = 'vip_escalated';
    vipReason = 'custom_enterprise_scope';
  } else if (finalStructured.intent === 'meet_booking_request' && finalStructured.requiresVipEscalation) {
    nextStage = 'booked';
    vipReason = 'meet_confirmed';
  } else if (finalStructured.intent === 'sales_quote_request' && autoQuote) {
    nextStage = 'quoted';
  } else if (finalStructured.intent === 'support_status_l1') {
    nextStage = 'support_l1';
  }

  // 6. Mode Enforcement: Draft-Only vs Autonomous
  if (mode === 'draft_only') {
    return {
      replyText: finalStructured.replyText,
      shouldDispatchReply: false,
      transcript,
      nextStage,
      detectedEmployeeCount: employeeCount,
      matchedStock,
      autoQuote,
      llmProviderUsed: providerUsed,
      vipEscalation: {
        severity: 'draft',
        reason: 'draft_approval_needed',
        channel: channelKey,
        title: `Borrador listo para ${input.senderName}`,
        summary: `Mensaje recibido (${input.channel}): "${effectiveText.slice(0, 120)}"`,
        suggestedAction: 'Revisar y aprobar envío automático con 1 clic.',
        draftReply: finalStructured.replyText,
        clientName: input.senderName,
        clientPhone: input.senderPhone,
        clientEmail: input.senderEmail,
        conversationId: input.existingConversation?.id,
      },
      activityLog: {
        channel: channelKey,
        actionType: `draft_prepared_${finalStructured.intent}`,
        targetLabel: input.senderName,
        outcome: 'draft_queued',
        noiseSuppressed: true,
        estimatedMinutesSaved: 6,
        detail: `Borrador generado (${providerUsed}) esperando aprobación en Bandeja VIP.`,
      },
    };
  }

  const vipEscalation: Omit<VipEscalationItem, 'id' | 'createdAt' | 'status'> | null =
    vipReason
      ? {
          severity: vipReason === 'critical_sla_unresolved' ? 'critical' : 'vip',
          reason: vipReason,
          channel: channelKey,
          title:
            vipReason === 'kickoff_payment_40'
              ? `Confirmación Kickoff 40% · ${input.senderName}`
              : vipReason === 'meet_confirmed'
                ? `Consultoría Meet Calificada · ${input.senderName}`
                : vipReason === 'critical_sla_unresolved'
                  ? `Incidente Crítico SLA · ${input.senderName}`
                  : `Alcance Enterprise · ${input.senderName}`,
          summary:
            finalStructured.vipSummary ||
            `Evento VIP (${vipReason}) detectado en conversación con ${input.senderName}.`,
          suggestedAction:
            finalStructured.suggestedAdminAction ||
            'Tomar contacto consultivo o confirmar hito en CRM.',
          clientName: input.senderName,
          clientPhone: input.senderPhone,
          clientEmail: input.senderEmail,
          conversationId: input.existingConversation?.id,
        }
      : null;

  return {
    replyText: finalStructured.replyText,
    shouldDispatchReply: true,
    transcript,
    nextStage,
    detectedEmployeeCount: employeeCount,
    matchedStock,
    autoQuote,
    vipEscalation,
    llmProviderUsed: providerUsed,
    activityLog: {
      channel: channelKey,
      actionType: `autonomous_${finalStructured.intent}`,
      targetLabel: input.senderName,
      outcome: vipEscalation ? 'vip_escalated' : 'resolved_silently',
      noiseSuppressed: !vipEscalation,
      estimatedMinutesSaved: autoQuote ? 20 : 10,
      detail: vipEscalation
        ? `Atendido automáticamente (${providerUsed}) y escalado a Bandeja VIP (${vipEscalation.reason}).`
        : `Resuelto 100% en silencio (${providerUsed}) sin interrumpir a Gastón.`,
    },
  };
}

/**
 * Pure deterministic evaluator invoked by n8n Cron every 2 hours.
 * Finds 48h/7d quote follow-ups, 24h/2h Meet anti-no-show reminders, and 21d stalled leads.
 */
export function evaluateFollowUpCandidates(params: {
  opportunities: Opportunity[];
  quotes: Quote[];
  bookings: ConsultingBooking[];
  now?: Date;
}): FollowUpCandidate[] {
  const nowMs = (params.now || new Date()).getTime();
  const candidates: FollowUpCandidate[] = [];

  // 1. Quotes sent without approval/rejection -> 48h & 7d follow-ups
  for (const quote of params.quotes) {
    if (quote.status !== 'sent' && quote.status !== 'draft') continue;
    const createdMs = Date.parse(quote.updatedAt || quote.createdAt || '');
    if (!Number.isFinite(createdMs)) continue;
    const ageHours = Math.round((nowMs - createdMs) / (1000 * 60 * 60));

    const opp = params.opportunities.find(
      (o) =>
        o.id === quote.opportunityId ||
        o.linkedQuoteId === quote.quoteNumber ||
        o.clientEmail.toLowerCase() === quote.clientEmail.toLowerCase()
    );

    if (ageHours >= 48 && ageHours < 168) {
      candidates.push({
        type: 'quote_followup_48h',
        targetId: quote.id,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientPhone: opp?.clientPhone,
        company: quote.clientCompany,
        referenceCode: quote.quoteNumber,
        dueSinceHours: ageHours,
        suggestedMessage: `Hola ${quote.clientName}, te consulto si pudiste revisar el presupuesto ${quote.quoteNumber} (${quote.title}, esquema 40/40/20). Si querés ajustar el alcance del primer hito o despejar alguna duda técnica, avisame por acá y lo resolvemos en el día.`,
      });
    } else if (ageHours >= 168 && ageHours < 504) {
      candidates.push({
        type: 'quote_followup_7d',
        targetId: quote.id,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientPhone: opp?.clientPhone,
        company: quote.clientCompany,
        referenceCode: quote.quoteNumber,
        dueSinceHours: ageHours,
        suggestedMessage: `Hola ${quote.clientName}, paso a chequear si seguís evaluando avanzar con "${quote.title}" (${quote.quoteNumber}) este mes o preferís que pausemos la propuesta hasta nuevo aviso. Sin compromiso, así ordenamos agenda.`,
      });
    } else if (ageHours >= 504) {
      candidates.push({
        type: 'mark_cold_21d',
        targetId: quote.id,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientPhone: opp?.clientPhone,
        company: quote.clientCompany,
        referenceCode: quote.quoteNumber,
        dueSinceHours: ageHours,
        suggestedMessage: `Archivar silenciosamente propuesta ${quote.quoteNumber} (>21 días sin actividad).`,
      });
    }
  }

  // 2. Anti No-Show Reminders for Confirmed Google Meet Sessions
  for (const booking of params.bookings) {
    if (booking.status !== 'confirmed') continue;
    const slotTime = (booking.timeSlot || '10:00').split(' ')[0];
    const meetingMs = Date.parse(`${booking.date}T${slotTime}:00-03:00`);
    if (!Number.isFinite(meetingMs)) continue;
    const hoursUntil = Math.round((meetingMs - nowMs) / (1000 * 60 * 60));

    if (hoursUntil >= 20 && hoursUntil <= 26) {
      candidates.push({
        type: 'meet_reminder_24h',
        targetId: booking.id,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        company: booking.company,
        referenceCode: booking.id,
        dueSinceHours: hoursUntil,
        suggestedMessage: `Hola ${booking.clientName}, te recuerdo nuestra sesión de Consultoría y Arquitectura IA con Gastón mañana ${booking.date} a las ${booking.timeSlot} hs (GMT-3). Link Meet: ${booking.meetingUrl}. ¿Me confirmás asistencia respondiendo OK?`,
      });
    } else if (hoursUntil >= 1 && hoursUntil <= 3) {
      candidates.push({
        type: 'meet_reminder_2h',
        targetId: booking.id,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        company: booking.company,
        referenceCode: booking.id,
        dueSinceHours: hoursUntil,
        suggestedMessage: `Hola ${booking.clientName}, en 2 horas arrancamos la sesión con Gastón (${booking.timeSlot} hs). Te dejo el acceso directo a Google Meet: ${booking.meetingUrl}.`,
      });
    }
  }

  return candidates;
}

/**
 * Anti-Noise Self-Healing Evaluator for Uptime Kuma -> n8n alerts.
 * Suppresses transient glitches and instructs n8n to run auto-recovery before waking Gastón.
 */
export function evaluateSelfHealingAlert(params: {
  serviceName: string;
  status: 'down' | 'up' | 'degraded';
  downMinutes: number;
  errorDetail?: string;
  config: AutopilotConfig;
}): {
  action: 'mark_recovered' | 'self_heal_retry' | 'escalate_vip_critical' | 'paused_noop';
  escalateVip: boolean;
  runbookSteps: string[];
  activityLog: Omit<AgentActivityLog, 'id' | 'createdAt'>;
  vipEscalation: Omit<VipEscalationItem, 'id' | 'createdAt' | 'status'> | null;
} {
  const mode = params.config.channels.self_healing;
  if (mode === 'paused') {
    return {
      action: 'paused_noop',
      escalateVip: false,
      runbookSteps: [],
      vipEscalation: null,
      activityLog: {
        channel: 'self_healing',
        actionType: 'alert_ignored_paused',
        targetLabel: params.serviceName,
        outcome: 'paused_noop',
        noiseSuppressed: true,
        estimatedMinutesSaved: 0,
        detail: `Auto-sanación en pausa para ${params.serviceName}.`,
      },
    };
  }

  if (params.status === 'up') {
    return {
      action: 'mark_recovered',
      escalateVip: false,
      runbookSteps: ['Registrar recuperación nominal en bitácora sin notificar al teléfono.'],
      vipEscalation: null,
      activityLog: {
        channel: 'self_healing',
        actionType: 'service_recovered',
        targetLabel: params.serviceName,
        outcome: 'self_healed',
        noiseSuppressed: true,
        estimatedMinutesSaved: 5,
        detail: `${params.serviceName} volvió a estado UP automáticamente.`,
      },
    };
  }

  const grace = Math.max(1, params.config.selfHealingGraceMinutes || 15);
  if (params.downMinutes < grace) {
    return {
      action: 'self_heal_retry',
      escalateVip: false,
      runbookSteps: [
        `Esperar 30s y re-verificar endpoint de ${params.serviceName} (descartar microcorte).`,
        `Si sigue caído, ejecutar reinicio controlado del contenedor en Proxmox.`,
        `Volver a evaluar; solo escalar a Gastón si persiste >= ${grace} min.`,
      ],
      vipEscalation: null,
      activityLog: {
        channel: 'self_healing',
        actionType: 'silent_self_heal_attempt',
        targetLabel: params.serviceName,
        outcome: 'self_healed',
        noiseSuppressed: true,
        estimatedMinutesSaved: 15,
        detail: `Caída de ${params.downMinutes} min (< ${grace} min umbral). Auto-sanación en curso sin interrumpir a Gastón.`,
      },
    };
  }

  return {
    action: 'escalate_vip_critical',
    escalateVip: true,
    runbookSteps: [
      `Superó ventana de auto-sanación (${params.downMinutes} min >= ${grace} min).`,
      'Enviar alerta crítica prioritaria a Bandeja VIP.',
    ],
    vipEscalation: {
      severity: 'critical',
      reason: 'critical_sla_unresolved',
      channel: 'self_healing',
      title: `SLA Crítico sin auto-sanar · ${params.serviceName}`,
      summary: `El servicio ${params.serviceName} acumula ${params.downMinutes} min caído tras intentos automáticos. Detalle: ${params.errorDetail || 'Sin respuesta HTTP 200'}.`,
      suggestedAction: 'Ingresar por Cloudflare Access a Proxmox/Vercel y revisar logs del contenedor.',
    },
    activityLog: {
      channel: 'self_healing',
      actionType: 'critical_sla_escalated',
      targetLabel: params.serviceName,
      outcome: 'vip_escalated',
      noiseSuppressed: false,
      estimatedMinutesSaved: 0,
      detail: `Auto-sanación agotada tras ${params.downMinutes} min. Escalado a VIP.`,
    },
  };
}

/**
 * Computes real, non-hallucinated executive metrics strictly from persisted state.
 */
export function computeAutopilotMetrics(params: {
  conversations: AgentConversation[];
  escalations: VipEscalationItem[];
  logs: AgentActivityLog[];
}): AutopilotOverviewMetrics {
  const resolvedSilentlyCount = params.logs.filter(
    (l) => l.outcome === 'resolved_silently'
  ).length;
  const selfHealedAlertsCount = params.logs.filter(
    (l) => l.outcome === 'self_healed'
  ).length;
  const openVipEscalationsCount = params.escalations.filter(
    (e) => e.status === 'open' && e.severity !== 'draft'
  ).length;
  const openDraftsCount = params.escalations.filter(
    (e) => e.status === 'open' && e.severity === 'draft'
  ).length;
  const quotesIssuedAutonomously = params.conversations.filter((c) => Boolean(c.quoteId)).length;

  const totalMinutesSaved = params.logs.reduce(
    (acc, item) => acc + (Number(item.estimatedMinutesSaved) || 0),
    0
  );
  const totalNoiseEvents = params.logs.filter((l) => l.outcome !== 'paused_noop').length;
  const suppressedEvents = params.logs.filter(
    (l) => l.outcome !== 'paused_noop' && l.noiseSuppressed
  ).length;

  const noiseSuppressionRate =
    totalNoiseEvents > 0 ? Math.round((suppressedEvents / totalNoiseEvents) * 100) : 100;

  return {
    totalConversations: params.conversations.length,
    resolvedSilentlyCount,
    selfHealedAlertsCount,
    openVipEscalationsCount,
    openDraftsCount,
    quotesIssuedAutonomously,
    estimatedHoursSaved: Math.round((totalMinutesSaved / 60) * 10) / 10,
    noiseSuppressionRate,
  };
}

/**
 * Compiles the 08:30 GMT-3 single executive digest so Gastón reads everything asynchronously in 2 minutes.
 */
export function compileDailyExecutiveDigest(params: {
  conversations: AgentConversation[];
  escalations: VipEscalationItem[];
  logs: AgentActivityLog[];
  bookings: ConsultingBooking[];
}): { subject: string; plainText: string; html: string } {
  const metrics = computeAutopilotMetrics({
    conversations: params.conversations,
    escalations: params.escalations,
    logs: params.logs,
  });

  const openVips = params.escalations.filter((e) => e.status === 'open');
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysMeetings = params.bookings.filter(
    (b) => b.status === 'confirmed' && b.date >= todayStr
  );

  const subject = `[Piloto Automático ARN] Resumen Diario · ${metrics.resolvedSilentlyCount} resueltos en silencio · ${openVips.length} VIP`;

  const vipLines =
    openVips.length > 0
      ? openVips
          .slice(0, 8)
          .map((v) => `• [${v.severity.toUpperCase()}] ${v.title}: ${v.summary}`)
          .join('\n')
      : '• Sin escalaciones pendientes. Todo operó de forma autónoma.';

  const meetLines =
    todaysMeetings.length > 0
      ? todaysMeetings
          .slice(0, 5)
          .map((m) => `• ${m.date} ${m.timeSlot} hs — ${m.clientName} (${m.company}) · ${m.meetingUrl}`)
          .join('\n')
      : '• Sin sesiones Meet confirmadas para hoy.';

  const plainText =
    `RESUMEN EJECUTIVO DIARIO · AGENTE AUTÓNOMO ARN 24/7\n` +
    `--------------------------------------------------\n` +
    `• Consultas resueltas en silencio: ${metrics.resolvedSilentlyCount}\n` +
    `• Alertas técnicas auto-sanadas: ${metrics.selfHealedAlertsCount}\n` +
    `• Presupuestos 40/40/20 emitidos: ${metrics.quotesIssuedAutonomously}\n` +
    `• Tasa de supresión de ruido: ${metrics.noiseSuppressionRate}%\n` +
    `• Tiempo operativo ahorrado estimado: ${metrics.estimatedHoursSaved} hs\n\n` +
    `BANDEJA VIP (${openVips.length}):\n${vipLines}\n\n` +
    `PRÓXIMAS CONSULTORÍAS MEET:\n${meetLines}\n\n` +
    `Panel Ejecutivo: https://www.gastonbarea.com/#admin`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a; border: 1px solid #e2e8f0; padding: 24px;">
      <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a;">Resumen Ejecutivo Diario · Piloto Automático ARN</h2>
      <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569;">Lectura asincrónica de 2 minutos. Tu foco queda reservado para Consultoría y Arquitectura IA.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Resueltos en silencio</strong><br/><span style="font-size: 20px; font-family: monospace;">${metrics.resolvedSilentlyCount}</span></td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Alertas auto-sanadas</strong><br/><span style="font-size: 20px; font-family: monospace;">${metrics.selfHealedAlertsCount}</span></td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Supresión de ruido</strong><br/><span style="font-size: 20px; font-family: monospace;">${metrics.noiseSuppressionRate}%</span></td>
        </tr>
      </table>
      <h3 style="font-size: 14px; margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Bandeja VIP (${openVips.length})</h3>
      <pre style="white-space: pre-wrap; font-family: inherit; font-size: 13px; color: #334155; margin: 0 0 18px 0;">${vipLines}</pre>
      <h3 style="font-size: 14px; margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Próximas Consultorías Meet</h3>
      <pre style="white-space: pre-wrap; font-family: inherit; font-size: 13px; color: #334155; margin: 0 0 20px 0;">${meetLines}</pre>
      <a href="https://www.gastonbarea.com/#admin" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 16px; font-size: 13px; font-weight: 600;">Abrir Consola Piloto Automático</a>
    </div>
  `;

  return { subject, plainText, html };
}
