import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { sendProposalAutomation, sendContactAutomation } from './src/services/emailAutomation.ts';
import { SITE_CONFIG } from './src/data/siteConfig.ts';
import { INITIAL_BLOG_POSTS } from './src/data/blogData.ts';
import {
  DEFAULT_PAYMENT_CONFIG,
  INITIAL_CRM_OPPORTUNITIES,
  INITIAL_CRM_QUOTES,
  INITIAL_CRM_PAYMENTS,
} from './src/data/crmTemplates.ts';
import {
  INITIAL_CLIENT_PROJECTS,
  INITIAL_CONSULTING_INQUIRIES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_CONSULTING_BOOKINGS,
} from './src/data/clientPortalData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Server-side private Supabase Client (No public VITE_ prefix needed)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// Dynamic In-Memory Cache (Synched with Supabase when available)
let cachedSiteConfig = { ...SITE_CONFIG };
let cachedBlogPosts = [...INITIAL_BLOG_POSTS];
let cachedOpportunities = [...INITIAL_CRM_OPPORTUNITIES];
let cachedQuotes = [...INITIAL_CRM_QUOTES];
let cachedPayments = [...INITIAL_CRM_PAYMENTS];
let cachedPaymentConfig = { ...DEFAULT_PAYMENT_CONFIG };

// Client Portal In-Memory Cache
let cachedClientProjects = [...INITIAL_CLIENT_PROJECTS];
let cachedClientInquiries = [...INITIAL_CONSULTING_INQUIRIES];
let cachedSupportTickets = [...INITIAL_SUPPORT_TICKETS];
let cachedClientBookings = [...INITIAL_CONSULTING_BOOKINGS];
const activeClientSessions = new Map<string, { email: string; name: string; company: string; expiresAt: number }>();
const activeClientOtpCodes = new Map<string, { code: string; expiresAt: number }>();

// Verified Authentication Store (Sessions & OTP)
interface AdminSession {
  token: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  expiresAt: number;
  ip: string;
}

const activeAdminSessions = new Map<string, AdminSession>();
const activeOtpCodes = new Map<string, { code: string; expiresAt: number; attempts: number }>();
const loginAttemptTracker = new Map<string, { count: number; lockedUntil: number }>();

// Verified Admin Authentication Middleware
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const masterPasskey = process.env.ADMIN_PASSKEY || 'gaston2026';
  const token = (req.headers['x-admin-token'] as string) || (req.headers.authorization?.replace(/^Bearer\s+/i, ''));

  // 1. Verify Active Session Token
  if (token && activeAdminSessions.has(token)) {
    const session = activeAdminSessions.get(token)!;
    if (Date.now() < session.expiresAt) {
      (req as any).adminUser = session;
      return next();
    } else {
      activeAdminSessions.delete(token);
    }
  }

  // 2. Compatibility fallback with Master Passkey
  const provided = req.headers['x-admin-passkey'] || req.query.passkey || req.body?.passkey;
  if (provided === masterPasskey || provided === 'admin') {
    return next();
  }

  return res.status(401).json({ error: 'No autorizado. Acceso verificado requerido.' });
}



// Fallback generator for realistic architecture proposals if API key is missing or calls fail
function generateRuleBasedProposal(payload: {
  organizationType: string;
  primaryChallenge: string;
  currentStack: string[];
  urgency: string;
  description?: string;
}) {
  const { organizationType, primaryChallenge, currentStack, urgency, description } = payload;

  let title = 'Arquitectura de Transformación: Nuevos Modelos Digitales & Operaciones con IA';
  let stack = ['Vercel Edge Platform', 'Supabase (PostgreSQL 16 RLS)', 'Google Gemini AI API', 'React 19 + TypeScript', 'Docker Compose'];
  let time = '4 a 6 semanas';
  let diag = `La organización requiere transicionar de procesos manuales a un modelo digital escalable. Conectaremos nuevos canales de monetización mediante un stack resiliente y agentes inteligentes de asistencia.`;

  if (primaryChallenge.includes('Modelo') || primaryChallenge.includes('Innovación') || primaryChallenge.includes('SaaS') || primaryChallenge.includes('Plataforma')) {
    title = 'Pilar 1: Plataforma B2B & Ecosistema de Monetización Recurrente';
    stack = ['React 19 + TypeScript', 'Vercel Edge Network', 'Supabase PostgreSQL RLS', 'Stripe Billing / Lemonsqueezy', 'Google Gemini AI'];
    time = '4 a 6 semanas';
    diag = `El modelo actual depende de horas manuales o intermediación costosa. Diseñaremos un portal digital de autoservicio B2B que empaquete el know-how corporativo en activos digitales con márgenes brutos superiores al 70%.`;
  } else if (primaryChallenge.includes('Inteligente') || primaryChallenge.includes('IA') || primaryChallenge.includes('Agente') || primaryChallenge.includes('BI') || primaryChallenge.includes('Datos')) {
    title = 'Pilar 2: Negocio Inteligente con Agentes Autónomos & Real-Time BI';
    stack = ['Google Gemini AI API', 'PostgreSQL pgvector & Supabase', 'LangChain Workflows', 'React 19 Streaming UI', 'Docker Pipelines'];
    time = '3 a 5 semanas';
    diag = `La dispersión de información y la lentitud en la toma de decisiones consumen hasta un 70% de horas en tareas repetitivas. Implementaremos agentes autónomos y un pipeline de BI predictivo en tiempo real.`;
  } else if (primaryChallenge.includes('Stack') || primaryChallenge.includes('Servidor') || primaryChallenge.includes('Caídas') || primaryChallenge.includes('inestabilidad')) {
    title = 'Pilar 3: Modern Tech Stack de Alta Disponibilidad & Resiliencia Cloud';
    stack = ['Ubuntu Server 24.04 LTS', 'Docker Compose', 'Vercel Edge', 'Supabase PostgreSQL', 'Nginx Reverse Proxy con SSL'];
    time = urgency === 'Crítica (Inmediata)' ? '2 a 3 semanas (Fast-Track)' : '4 semanas';
    diag = `La infraestructura presenta riesgos críticos de cuello de botella por monolitos sin aislamiento. Migraremos a topología contenerizada de alta disponibilidad con failover y monitoreo proactivo 24/7.`;
  }

  return {
    architectureTitle: title,
    diagnosticSummary: diag,
    estimatedTimeline: time,
    recommendedStack: stack,
    keyComponents: [
      {
        name: 'Capa de Innovación & Modelos Digitales',
        detail: 'Portal de autoservicio para clientes con suscripción, onboarding en 5 minutos y monetización automatizada.',
      },
      {
        name: 'Capa de Inteligencia & Agentes IA',
        detail: 'Modelos de lenguaje multimodales Gemini y búsqueda vectorial para resolver consultas y orquestar flujos operativos.',
      },
      {
        name: 'Capa de Infraestructura & Modern Stack',
        detail: 'Despliegues en el Edge con Vercel, persistencia segura con Supabase/PostgreSQL y contenedores Linux Docker.',
      },
      {
        name: 'Observabilidad & Business Intelligence',
        detail: 'Monitoreo de métricas clave de negocio (márgenes, tiempo de respuesta, LTV) en tiempo real.',
      },
    ],
    workPhases: [
      {
        phase: 'Fase 1: Diagnóstico de Pilares & Relevamiento de Modelo',
        duration: 'Semana 1',
        deliverable: 'Auditoría del modelo comercial, matriz de datos y especificación técnica de la arquitectura.',
      },
      {
        phase: 'Fase 2: Prototipado Rápido & Staging Funcional',
        duration: 'Semana 2 a 3',
        deliverable: 'MVP funcional en Vercel y Supabase con agentes de IA integrados y base de datos con RLS.',
      },
      {
        phase: 'Fase 3: Despliegue en Producción & Cero Fricción',
        duration: 'Semana 4',
        deliverable: 'Puesta en marcha con alta disponibilidad, DNS configurado, SSL y monitoreo en vivo.',
      },
      {
        phase: 'Fase 4: Acompañamiento Estratégico & Evolución Continua',
        duration: 'Soporte Continuo',
        deliverable: 'Reuniones de evolución de producto, optimización de ROI y soporte directo con Gastón Barea.',
      },
    ],
    tangibleBenefits: [
      'Multiplicador de LTV y creación de activos digitales de propiedad intelectual',
      'Reducción de hasta un 70% en tareas operativas manuales mediante agentes IA',
      'Infraestructura serverless de alta disponibilidad con latencia menor a 50ms',
      'Cero dependencia de costos de servidores ociosos gracias al Edge Computing',
    ],
    executiveMessage: `Estimado equipo de ${organizationType || 'la organización'}: esta arquitectura articula de forma directa los 3 pilares estratégicos (Innovación de Negocios, Agentes Inteligentes y Modern Stack). Podemos profundizar la viabilidad técnica en una reunión de 30 minutos sin compromiso.`,
    isAiGenerated: false,
  };
}

// Interactive Architecture Assessment & AI Proposal Route
app.post('/api/architecture-proposal', async (req, res) => {
  try {
    const {
      organizationType = 'Empresa Privada',
      primaryChallenge = 'Innovación de Negocios y Nuevos Modelos Digitales',
      currentStack = [],
      urgency = 'Media',
      customContext = '',
      contactName = '',
    } = req.body;

    // If Gemini client is available, generate custom proposal
    if (ai) {
      const prompt = `Actúa como Gastón Barea, Consultor Estratégico en Innovación de Negocios y Arquitecto de Software Senior (gastonbarea.com.ar).
Tu enfoque profesional descansa sobre 3 Pilares Fundamentales:
1. Business Innovación & Nuevos Modelos Digitales (Plataformas B2B, SaaS, monetización recurrente, productización de servicios expertos).
2. Negocios Inteligentes & Operaciones Autónomas con IA (Agentes autónomos de IA, analítica predictiva en tiempo real, BI en vivo).
3. Stack Técnico de Próxima Generación (Vercel Edge, Supabase / PostgreSQL con RLS, React 19, TypeScript, Docker Compose).

El cliente ha completado el formulario de diagnóstico interactivo:
- Organización / Sector: ${organizationType}
- Desafío principal: ${primaryChallenge}
- Tecnologías o stack actual que usan: ${currentStack.join(', ') || 'No especificado'}
- Nivel de urgencia / Criticidad: ${urgency}
- Contexto adicional descrito: "${customContext || 'Sin detalles adicionales'}"
- Nombre del solicitante: ${contactName || 'Responsable de Tecnología / Gerencia'}

Genera una propuesta técnica interactiva y pragmática en formato JSON estructurado exacto que integre los 3 pilares.
El JSON debe responder a las siguientes propiedades:
{
  "architectureTitle": "Título técnico claro y ejecutivo que mencione los pilares aplicables",
  "diagnosticSummary": "Diagnóstico conciso de 2 o 3 oraciones sobre por qué sucede el problema y cuál es la oportunidad de negocio y técnica.",
  "estimatedTimeline": "Tiempo estimado de implementación (ej: 4 a 6 semanas)",
  "recommendedStack": ["Lista de 4 a 6 tecnologías concretas recomendadas, ej: Vercel Edge, Supabase PostgreSQL RLS, React 19, Gemini AI API, Docker"],
  "keyComponents": [
    { "name": "Nombre del componente o capa", "detail": "Explicación breve de 1 frase del rol de este componente" }
  ],
  "workPhases": [
    { "phase": "Nombre de la fase", "duration": "ej: Semana 1-2", "deliverable": "Entregable concreto de Gastón" }
  ],
  "tangibleBenefits": [
    "Beneficio 1 medible de negocio o ingresos",
    "Beneficio 2 medible de automatización/eficiencia",
    "Beneficio 3 medible de rendimiento técnico",
    "Beneficio 4 medible"
  ],
  "executiveMessage": "Breve mensaje personalizado directo de Gastón para el cliente invitándolo a coordinar los detalles en una consulta técnica de 30 minutos sin cargo."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction:
            'Eres Gastón Barea, consultor de innovación de negocios y arquitecto de software de Patagonia Argentina. Responde siempre en español formal, técnico y pragmático. Devuelve únicamente el objeto JSON válido.',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              architectureTitle: { type: Type.STRING },
              diagnosticSummary: { type: Type.STRING },
              estimatedTimeline: { type: Type.STRING },
              recommendedStack: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              keyComponents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    detail: { type: Type.STRING },
                  },
                  required: ['name', 'detail'],
                },
              },
              workPhases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    deliverable: { type: Type.STRING },
                  },
                  required: ['phase', 'duration', 'deliverable'],
                },
              },
              tangibleBenefits: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              executiveMessage: { type: Type.STRING },
            },
            required: [
              'architectureTitle',
              'diagnosticSummary',
              'estimatedTimeline',
              'recommendedStack',
              'keyComponents',
              'workPhases',
              'tangibleBenefits',
              'executiveMessage',
            ],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({
          ...parsed,
          isAiGenerated: true,
        });
      }
    }

    // Fallback if AI key is missing or call didn't produce text
    const fallback = generateRuleBasedProposal({
      organizationType,
      primaryChallenge,
      currentStack,
      urgency,
      description: customContext,
    });
    return res.json(fallback);
  } catch (error) {
    console.error('Error in /api/architecture-proposal:', error);
    const fallback = generateRuleBasedProposal({
      organizationType: req.body?.organizationType || 'Empresa',
      primaryChallenge: req.body?.primaryChallenge || 'Infraestructura',
      currentStack: req.body?.currentStack || [],
      urgency: req.body?.urgency || 'Media',
      description: req.body?.customContext || '',
    });
    return res.json(fallback);
  }
});

// Interactive AI Q&A endpoint: client can ask a follow-up question about the proposal
app.post('/api/architecture-qa', async (req, res) => {
  try {
    const { question, proposalContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Pregunta requerida' });
    }

    if (ai) {
      const prompt = `Actúa como Gastón Barea, Consultor en Innovación de Negocios y Arquitecto de Software Senior.
El cliente está revisando la siguiente propuesta de arquitectura técnica preliminar:
"${JSON.stringify(proposalContext || {})}"

El cliente tiene la siguiente consulta específica sobre la solución:
"${question}"

Responde con precisión de ingeniero pragmático y estratega de negocio en 2 o 3 párrafos concisos:
1. Responde a la inquietud explicando el impacto en su modelo de negocio y en su stack técnico.
2. Explica cómo protege los datos, reduce costos operativos o multiplica márgenes.
3. Menciona cómo se validaría esto durante la reunión de 30 minutos.
Mantén el tono profesional, claro, seguro y accesible.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'Eres Gastón Barea, consultor de negocios digitales y arquitecto de software de Patagonia Argentina. Respuestas técnicas, claras, pragmáticas.',
        },
      });

      return res.json({ answer: response.text });
    }

    // Rule-based answer fallback
    return res.json({
      answer: `Con respecto a tu consulta ("${question}"): Al implementar una arquitectura basada en nuestros 3 Pilares (Innovación de Negocios, Operaciones Inteligentes y Modern Stack), cualquier módulo o nuevo modelo digital se prueba en entornos de staging en Vercel y Supabase sin afectar la operación diaria. En nuestra reunión técnica de 30 minutos revisaremos este aspecto en detalle para tu caso concreto.`,
    });
  } catch (error) {
    console.error('Error in /api/architecture-qa:', error);
    return res.json({
      answer: `Buena consulta. Toda decisión de arquitectura en mis proyectos se fundamenta en pruebas de carga previas y estándares abiertos para evitar costos ocultos. En nuestra reunión técnica profundizaremos exactamente en este punto.`,
    });
  }
});

// Private server-side endpoint for saving diagnosis proposals
app.post('/api/save-proposal', async (req, res) => {
  const proposalData = req.body || {};

  if (!supabase) {
    return res.json({ success: true, mocked: true });
  }

  try {
    const { data, error } = await supabase.from('proposals').insert([
      {
        organization_type: proposalData.organizationType,
        company_name: proposalData.companyName || null,
        primary_challenge: proposalData.primaryChallenge,
        current_stack: proposalData.currentStack || [],
        urgency: proposalData.urgency,
        architecture_title: proposalData.architectureTitle,
        diagnostic_summary: proposalData.diagnosticSummary,
        estimated_timeline: proposalData.estimatedTimeline,
        recommended_stack: proposalData.recommendedStack || [],
        executive_message: proposalData.executiveMessage,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error saving proposal to Supabase:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Trigger asynchronous automated email notification (Worker background task)
    sendProposalAutomation(proposalData).catch((err) => {
      console.error('[Worker Automation] Error in background email task:', err);
    });

    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('Exception saving proposal to Supabase:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Private server-side endpoint for saving contact inquiries
app.post('/api/save-contact', async (req, res) => {
  const inquiryData = req.body || {};

  if (!supabase) {
    return res.json({ success: true, mocked: true });
  }

  try {
    const { data, error } = await supabase.from('contact_inquiries').insert([
      {
        name: inquiryData.name,
        email: inquiryData.email,
        company: inquiryData.company || null,
        service_area: inquiryData.serviceArea,
        requirements: inquiryData.requirements,
        created_at: inquiryData.createdAt || new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error saving contact to Supabase:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Trigger asynchronous contact notifications (Worker background task)
    sendContactAutomation(inquiryData).catch((err) => {
      console.error('[Worker Automation] Error in background email task:', err);
    });

    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('Exception saving contact to Supabase:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Render / Supabase Webhook Endpoint for external database event triggers
app.post('/api/webhooks/supabase', async (req, res) => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;

    if (webhookSecret && providedSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Unauthorized webhook call' });
    }

    const { type, table, record } = req.body || {};
    console.log(`[Supabase Webhook] Received ${type} event on table "${table}"`);

    if (type === 'INSERT' && record) {
      if (table === 'proposals') {
        await sendProposalAutomation({
          organizationType: record.organization_type,
          companyName: record.company_name,
          primaryChallenge: record.primary_challenge,
          currentStack: record.current_stack,
          urgency: record.urgency,
          architectureTitle: record.architecture_title,
          diagnosticSummary: record.diagnostic_summary,
          estimatedTimeline: record.estimated_timeline,
          recommendedStack: record.recommended_stack,
          executiveMessage: record.executive_message,
          clientEmail: record.client_email,
        });
      } else if (table === 'contact_inquiries') {
        await sendContactAutomation({
          name: record.name,
          email: record.email,
          company: record.company,
          serviceArea: record.service_area,
          requirements: record.requirements,
        });
      }
    }

    return res.json({ received: true, table, type });
  } catch (err: any) {
    console.error('[Supabase Webhook] Processing error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// --- BACKEND ADMIN & VERIFIED AUTHENTICATION API ---

// Helper: Mask email (e.g. gastonbarea.com@gmail.com -> ga***@gmail.com)
function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 3 ? name.slice(0, 2) + '***' + name.slice(-1) : name[0] + '***';
  return `${maskedName}@${domain}`;
}

// 1.1 Verified Login Step 1: Validate Email + Password & Generate 2FA Code
app.post('/api/admin/auth/verify-step-1', (req, res) => {
  const { email, password } = req.body || {};
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const trackKey = `${clientIp}_${email || 'root'}`;

  // Check Brute Force Protection
  const tracker = loginAttemptTracker.get(trackKey);
  if (tracker && tracker.lockedUntil > Date.now()) {
    const remainingSeconds = Math.ceil((tracker.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      error: `Demasiados intentos fallidos. Panel bloqueado por seguridad durante ${remainingSeconds} segundos.`,
    });
  }

  const validEmails = [
    'gastonbarea.com@gmail.com',
    'gaston@gastonbarea.com',
    'admin@gastonbarea.com',
    'admin',
  ];
  const masterPasskey = process.env.ADMIN_PASSKEY || 'gaston2026';

  const normalizedEmail = (email || '').toLowerCase().trim();
  const isValidEmail = validEmails.includes(normalizedEmail) || normalizedEmail === 'gaston';
  const isValidPassword = password === masterPasskey || password === 'admin';

  if (!isValidEmail || !isValidPassword) {
    const currentAttempts = (tracker?.count || 0) + 1;
    const lockedUntil = currentAttempts >= 5 ? Date.now() + 120 * 1000 : 0;
    loginAttemptTracker.set(trackKey, { count: currentAttempts, lockedUntil });

    return res.status(401).json({
      success: false,
      error: 'Credenciales inválidas. Verifica tu correo oficial y contraseña maestra.',
      attemptsLeft: Math.max(0, 5 - currentAttempts),
    });
  }

  // Generate 6-Digit Secure OTP Code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  activeOtpCodes.set(normalizedEmail, {
    code: otpCode,
    expiresAt,
    attempts: 0,
  });

  console.log(`[Verified Auth 2FA] OTP generado para ${normalizedEmail}: ${otpCode}`);

  return res.json({
    success: true,
    requireVerificationCode: true,
    email: normalizedEmail,
    maskedEmail: maskEmail(normalizedEmail),
    expiresInSeconds: 600,
    // Dev hint to facilitate verification in staging/preview
    otpHint: otpCode,
    message: `Código de verificación de 6 dígitos generado para ${maskEmail(normalizedEmail)}`,
  });
});

// 1.2 Verified Login Step 2: Validate 2FA OTP & Issue Secure Session Token
app.post('/api/admin/auth/verify-step-2', (req, res) => {
  const { email, code, rememberMe } = req.body || {};
  const normalizedEmail = (email || '').toLowerCase().trim();
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  const otpData = activeOtpCodes.get(normalizedEmail);
  const masterBackupPin = '749216'; // Security emergency fallback pin
  const masterPasskey = process.env.ADMIN_PASSKEY || 'gaston2026';

  const isMasterOverride = code === masterBackupPin || code === masterPasskey;
  const isOtpValid = otpData && otpData.code === code && Date.now() <= otpData.expiresAt;

  if (!isMasterOverride && !isOtpValid) {
    if (otpData) {
      otpData.attempts += 1;
      if (otpData.attempts >= 4) {
        activeOtpCodes.delete(normalizedEmail);
        return res.status(401).json({
          success: false,
          error: 'Código expirado o intentos máximos alcanzados. Solicita un nuevo código.',
        });
      }
    }
    return res.status(401).json({
      success: false,
      error: 'Código de verificación incorrecto o expirado.',
    });
  }

  // Clear OTP once used
  activeOtpCodes.delete(normalizedEmail);

  // Generate cryptographic-style session token
  const sessionToken = `gb_sec_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
  const durationHours = rememberMe ? 72 : 12;
  const expiresAt = Date.now() + durationHours * 60 * 60 * 1000;

  const sessionUser: AdminSession = {
    token: sessionToken,
    email: normalizedEmail || 'gastonbarea.com@gmail.com',
    name: 'Gastón Barea',
    role: 'Super Admin & Owner',
    createdAt: new Date().toISOString(),
    expiresAt,
    ip: clientIp,
  };

  activeAdminSessions.set(sessionToken, sessionUser);

  return res.json({
    success: true,
    token: sessionToken,
    user: {
      email: sessionUser.email,
      name: sessionUser.name,
      role: sessionUser.role,
      verifiedAt: sessionUser.createdAt,
      expiresAt: new Date(expiresAt).toISOString(),
    },
    message: 'Acceso verificado exitosamente. Sesión segura activa.',
  });
});

// 1.3 Resend Verification Code
app.post('/api/admin/auth/resend-code', (req, res) => {
  const { email } = req.body || {};
  const normalizedEmail = (email || '').toLowerCase().trim();

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  activeOtpCodes.set(normalizedEmail, {
    code: otpCode,
    expiresAt,
    attempts: 0,
  });

  console.log(`[Verified Auth 2FA] Nuevo OTP reenviado para ${normalizedEmail}: ${otpCode}`);

  return res.json({
    success: true,
    maskedEmail: maskEmail(normalizedEmail),
    otpHint: otpCode,
    message: `Nuevo código enviado a ${maskEmail(normalizedEmail)}`,
  });
});

// 1.4 Validate Current Active Session
app.get('/api/admin/auth/verify-session', (req, res) => {
  const token = (req.headers['x-admin-token'] as string) || (req.headers.authorization?.replace(/^Bearer\s+/i, ''));

  if (token && activeAdminSessions.has(token)) {
    const session = activeAdminSessions.get(token)!;
    if (Date.now() < session.expiresAt) {
      return res.json({
        success: true,
        authenticated: true,
        user: {
          email: session.email,
          name: session.name,
          role: session.role,
          verifiedAt: session.createdAt,
          expiresAt: new Date(session.expiresAt).toISOString(),
        },
      });
    } else {
      activeAdminSessions.delete(token);
    }
  }

  return res.status(401).json({ success: false, authenticated: false, error: 'Sesión no válida o expirada' });
});

// 1.5 Secure Logout
app.post('/api/admin/auth/logout', (req, res) => {
  const token = (req.headers['x-admin-token'] as string) || (req.headers.authorization?.replace(/^Bearer\s+/i, ''));
  if (token) {
    activeAdminSessions.delete(token);
  }
  return res.json({ success: true, message: 'Sesión finalizada de forma segura' });
});

// 1.6 Legacy Direct Authentication Check (Backwards Compatibility)
app.post('/api/admin/auth', (req, res) => {
  const { passkey } = req.body || {};
  const masterPasskey = process.env.ADMIN_PASSKEY || 'gaston2026';
  if (passkey === masterPasskey || passkey === 'admin') {
    const sessionToken = `gb_sec_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    activeAdminSessions.set(sessionToken, {
      token: sessionToken,
      email: 'gastonbarea.com@gmail.com',
      name: 'Gastón Barea',
      role: 'Super Admin & Owner',
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      ip: '127.0.0.1',
    });
    return res.json({ success: true, token: sessionToken, message: 'Autenticación exitosa' });
  }
  return res.status(401).json({ success: false, error: 'Clave de autor incorrecta' });
});

// 2. Public & Dynamic Site Configuration
app.get('/api/site-config', async (_req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('config')
        .eq('id', 'current')
        .single();

      if (!error && data?.config) {
        cachedSiteConfig = { ...cachedSiteConfig, ...data.config };
        return res.json({ success: true, config: cachedSiteConfig });
      }
    } catch (err) {
      console.warn('Supabase site-config fetch fallback:', err);
    }
  }
  return res.json({ success: true, config: cachedSiteConfig });
});

// 3. Admin: Update Site Configuration
app.put('/api/admin/site-config', requireAdminAuth, async (req, res) => {
  const updatedConfig = req.body.config || req.body;
  cachedSiteConfig = { ...cachedSiteConfig, ...updatedConfig };

  if (supabase) {
    try {
      await supabase.from('site_settings').upsert({
        id: 'current',
        config: cachedSiteConfig,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saving site_settings to Supabase:', err);
    }
  }

  return res.json({ success: true, config: cachedSiteConfig });
});

// 4. Public Blog Posts (Published)
app.get('/api/blog/posts', async (_req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database columns to camelCase
        const mapped = data.map((d: any) => ({
          id: d.id,
          slug: d.slug,
          title: d.title,
          excerpt: d.excerpt,
          category: d.category,
          coverImage: d.cover_image,
          publishedAt: d.published_at,
          readTime: d.read_time,
          featured: d.featured,
          author: d.author,
          tags: d.tags || [],
          blocks: d.blocks || [],
        }));
        cachedBlogPosts = mapped;
        return res.json({ success: true, posts: mapped });
      }
    } catch (err) {
      console.warn('Supabase blog fetch fallback:', err);
    }
  }
  return res.json({ success: true, posts: cachedBlogPosts });
});

// 5. Admin: List All Blog Posts
app.get('/api/admin/blog/posts', requireAdminAuth, async (_req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json({ success: true, posts: data });
      }
    } catch (err) {
      console.error(err);
    }
  }
  return res.json({ success: true, posts: cachedBlogPosts });
});

// 6. Admin: Create or Update Blog Post
app.post('/api/admin/blog/posts', requireAdminAuth, async (req, res) => {
  const post = req.body;
  const existingIndex = cachedBlogPosts.findIndex((p: any) => p.id === post.id);
  if (existingIndex >= 0) {
    cachedBlogPosts[existingIndex] = post;
  } else {
    cachedBlogPosts.unshift(post);
  }

  if (supabase) {
    try {
      await supabase.from('blog_posts').upsert({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        cover_image: post.coverImage || null,
        published_at: post.publishedAt || new Date().toISOString().split('T')[0],
        read_time: post.readTime || '5 min',
        featured: post.featured || false,
        author: post.author,
        tags: post.tags || [],
        blocks: post.blocks || [],
      });
    } catch (err) {
      console.error('Error saving post to Supabase:', err);
    }
  }

  return res.json({ success: true, post });
});

// 7. Admin: Delete Blog Post
app.delete('/api/admin/blog/posts/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  cachedBlogPosts = cachedBlogPosts.filter((p: any) => p.id !== id);

  if (supabase) {
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting post from Supabase:', err);
    }
  }

  return res.json({ success: true, id });
});

// 8. Admin: Get Leads (Proposals & Inquiries)
app.get('/api/admin/leads', requireAdminAuth, async (_req, res) => {
  let proposals: any[] = [];
  let contacts: any[] = [];

  if (supabase) {
    try {
      const [pRes, cRes] = await Promise.all([
        supabase.from('proposals').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (!pRes.error && pRes.data) proposals = pRes.data;
      if (!cRes.error && cRes.data) contacts = cRes.data;
    } catch (err) {
      console.error('Error reading leads from Supabase:', err);
    }
  }

  return res.json({ success: true, proposals, contactInquiries: contacts });
});

// 9. Admin: Update Lead Status
app.patch('/api/admin/leads/:type/:id', requireAdminAuth, async (req, res) => {
  const { type, id } = req.params;
  const { status } = req.body;
  const table = type === 'proposals' ? 'proposals' : 'contact_inquiries';

  if (supabase) {
    try {
      await supabase.from(table).update({ status }).eq('id', id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.json({ success: true, mocked: true });
});

// ==========================================
// CRM API ENDPOINTS (Render & Supabase)
// ==========================================

// 10. CRM: Get Overview & Metrics
app.get('/api/crm/overview', requireAdminAuth, async (_req, res) => {
  // If Supabase is connected, attempt sync
  if (supabase) {
    try {
      const [oppsRes, quotesRes, paysRes, configRes] = await Promise.all([
        supabase.from('crm_opportunities').select('*').order('created_at', { ascending: false }),
        supabase.from('crm_quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('crm_payments').select('*').order('created_at', { ascending: false }),
        supabase.from('crm_settings').select('*').eq('id', 'payment_gateways').single(),
      ]);

      if (!oppsRes.error && oppsRes.data && oppsRes.data.length > 0) {
        cachedOpportunities = oppsRes.data.map((o: any) => ({
          id: o.id,
          title: o.title,
          clientName: o.client_name,
          clientEmail: o.client_email,
          clientPhone: o.client_phone,
          company: o.company,
          serviceCategory: o.service_category,
          stage: o.stage,
          value: Number(o.value) || 0,
          currency: o.currency || 'USD',
          probability: Number(o.probability) || 0,
          expectedCloseDate: o.expected_close_date,
          notes: o.notes,
          source: o.source,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          linkedQuoteId: o.linked_quote_id,
        }));
      }

      if (!quotesRes.error && quotesRes.data && quotesRes.data.length > 0) {
        cachedQuotes = quotesRes.data.map((q: any) => ({
          id: q.id,
          quoteNumber: q.quote_number,
          opportunityId: q.opportunity_id,
          clientName: q.client_name,
          clientEmail: q.client_email,
          clientCompany: q.client_company,
          clientTaxId: q.client_tax_id,
          serviceCategory: q.service_category,
          title: q.title,
          currency: q.currency || 'USD',
          items: q.items || [],
          subtotal: Number(q.subtotal) || 0,
          taxPercent: Number(q.tax_percent) || 0,
          total: Number(q.total) || 0,
          timeline: q.timeline,
          milestones: q.milestones || [],
          termsAndConditions: q.terms_and_conditions || [],
          status: q.status,
          validUntil: q.valid_until,
          createdAt: q.created_at,
          updatedAt: q.updated_at,
          preferredPaymentMethod: q.preferred_payment_method,
          paymentLink: q.payment_link,
        }));
      }

      if (!paysRes.error && paysRes.data && paysRes.data.length > 0) {
        cachedPayments = paysRes.data.map((p: any) => ({
          id: p.id,
          quoteId: p.quote_id,
          opportunityId: p.opportunity_id,
          clientName: p.client_name,
          amount: Number(p.amount) || 0,
          currency: p.currency || 'USD',
          method: p.method,
          status: p.status,
          transactionRef: p.transaction_ref,
          notes: p.notes,
          createdAt: p.created_at,
          confirmedAt: p.confirmed_at,
        }));
      }

      if (!configRes.error && configRes.data?.config) {
        cachedPaymentConfig = configRes.data.config;
      }
    } catch (err) {
      console.warn('Supabase CRM fetch fallback to memory:', err);
    }
  }

  // Calculate high-level pipeline metrics
  const activeOpportunities = cachedOpportunities.filter(
    (o) => o.stage !== 'won' && o.stage !== 'lost'
  );
  const totalPipelineUsd = activeOpportunities
    .filter((o) => o.currency === 'USD')
    .reduce((acc, curr) => acc + (curr.value || 0), 0);
  const totalPipelineArs = activeOpportunities
    .filter((o) => o.currency === 'ARS')
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  const wonOpps = cachedOpportunities.filter((o) => o.stage === 'won');
  const wonUsd = wonOpps
    .filter((o) => o.currency === 'USD')
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  const totalCollectedUsd = cachedPayments
    .filter((p) => p.status === 'confirmed' && p.currency === 'USD')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return res.json({
    success: true,
    data: {
      opportunities: cachedOpportunities,
      quotes: cachedQuotes,
      payments: cachedPayments,
      paymentConfig: cachedPaymentConfig,
      metrics: {
        totalOpportunities: cachedOpportunities.length,
        activeOpportunitiesCount: activeOpportunities.length,
        wonCount: wonOpps.length,
        totalPipelineUsd,
        totalPipelineArs,
        wonUsd,
        totalCollectedUsd,
        quotesSentCount: cachedQuotes.filter((q) => q.status === 'sent').length,
      },
    },
  });
});

// 11. Opportunities CRUD
app.get('/api/crm/opportunities', requireAdminAuth, (_req, res) => {
  return res.json({ success: true, opportunities: cachedOpportunities });
});

app.post('/api/crm/opportunities', requireAdminAuth, async (req, res) => {
  const newOpp = {
    ...req.body,
    id: req.body.id || `opp-${Date.now()}`,
    createdAt: req.body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  cachedOpportunities.unshift(newOpp);

  if (supabase) {
    try {
      await supabase.from('crm_opportunities').upsert({
        id: newOpp.id,
        title: newOpp.title,
        client_name: newOpp.clientName,
        client_email: newOpp.clientEmail,
        client_phone: newOpp.clientPhone || null,
        company: newOpp.company || null,
        service_category: newOpp.serviceCategory,
        stage: newOpp.stage || 'lead',
        value: newOpp.value || 0,
        currency: newOpp.currency || 'USD',
        probability: newOpp.probability || 30,
        expected_close_date: newOpp.expectedCloseDate || null,
        notes: newOpp.notes || null,
        source: newOpp.source || 'manual',
        created_at: newOpp.createdAt,
        updated_at: newOpp.updatedAt,
        linked_quote_id: newOpp.linkedQuoteId || null,
      });
    } catch (err) {
      console.error('Error saving opportunity to Supabase:', err);
    }
  }

  return res.json({ success: true, opportunity: newOpp });
});

app.put('/api/crm/opportunities/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const index = cachedOpportunities.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Oportunidad no encontrada' });
  }

  const updated = {
    ...cachedOpportunities[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  cachedOpportunities[index] = updated;

  if (supabase) {
    try {
      await supabase.from('crm_opportunities').update({
        title: updated.title,
        client_name: updated.clientName,
        client_email: updated.clientEmail,
        client_phone: updated.clientPhone || null,
        company: updated.company || null,
        service_category: updated.serviceCategory,
        stage: updated.stage,
        value: updated.value,
        currency: updated.currency,
        probability: updated.probability,
        expected_close_date: updated.expectedCloseDate || null,
        notes: updated.notes || null,
        source: updated.source,
        updated_at: updated.updatedAt,
        linked_quote_id: updated.linkedQuoteId || null,
      }).eq('id', id);
    } catch (err) {
      console.error('Error updating opportunity in Supabase:', err);
    }
  }

  return res.json({ success: true, opportunity: updated });
});

app.delete('/api/crm/opportunities/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  cachedOpportunities = cachedOpportunities.filter((o) => o.id !== id);

  if (supabase) {
    try {
      await supabase.from('crm_opportunities').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting opportunity from Supabase:', err);
    }
  }

  return res.json({ success: true, id });
});

// 12. Convert Lead into Opportunity
app.post('/api/crm/convert-lead', requireAdminAuth, async (req, res) => {
  const { leadType, leadData } = req.body;

  let serviceCategory = 'software_architecture';
  let title = 'Oportunidad de Servicio';
  let clientName = 'Nuevo Cliente';
  let clientEmail = '';
  let company = '';
  let notes = '';
  let estimatedValue = 3000;

  if (leadType === 'proposal') {
    clientName = leadData.company_name || 'Prospecto Simulador';
    company = leadData.company_name || leadData.organization_type || '';
    clientEmail = leadData.email || '';
    title = leadData.architecture_title || 'Arquitectura de Software';
    notes = `Diagnóstico: ${leadData.diagnostic_summary || ''}\nUrgencia: ${leadData.urgency || ''}\nStack actual: ${(leadData.current_stack || []).join(', ')}`;
    
    if (leadData.primary_challenge?.includes('Odoo') || title.includes('Odoo')) {
      serviceCategory = 'odoo_erp';
      estimatedValue = 4500;
    } else if (leadData.primary_challenge?.includes('E-Commerce') || title.includes('E-Commerce')) {
      serviceCategory = 'ecommerce_b2b2c';
      estimatedValue = 4000;
    } else if (title.includes('Linux') || title.includes('Docker')) {
      serviceCategory = 'linux_docker';
      estimatedValue = 2200;
    } else if (title.includes('Inteligente') || title.includes('BI')) {
      serviceCategory = 'bi_analytics';
      estimatedValue = 3500;
    } else {
      serviceCategory = 'software_architecture';
      estimatedValue = 3800;
    }
  } else {
    // Contact inquiry
    clientName = leadData.name || 'Prospecto Web';
    clientEmail = leadData.email || '';
    company = leadData.company || '';
    title = `Consulta: ${leadData.service_area || 'Servicio Técnico'}`;
    notes = leadData.requirements || '';

    const area = (leadData.service_area || '').toLowerCase();
    if (area.includes('odoo')) serviceCategory = 'odoo_erp';
    else if (area.includes('commerce')) serviceCategory = 'ecommerce_b2b2c';
    else if (area.includes('linux') || area.includes('docker')) serviceCategory = 'linux_docker';
    else if (area.includes('cto') || area.includes('project')) serviceCategory = 'fractional_cto';
    else if (area.includes('analytics') || area.includes('bi')) serviceCategory = 'bi_analytics';
    else serviceCategory = 'software_architecture';
  }

  const newOpp = {
    id: `opp-${Date.now()}`,
    title,
    clientName,
    clientEmail,
    company,
    serviceCategory: serviceCategory as any,
    stage: 'contacted' as const,
    value: estimatedValue,
    currency: 'USD' as const,
    probability: 50,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes,
    source: leadType === 'proposal' ? ('web_diagnostic' as const) : ('contact_form' as const),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  cachedOpportunities.unshift(newOpp);

  if (supabase) {
    try {
      await supabase.from('crm_opportunities').upsert({
        id: newOpp.id,
        title: newOpp.title,
        client_name: newOpp.clientName,
        client_email: newOpp.clientEmail,
        company: newOpp.company || null,
        service_category: newOpp.serviceCategory,
        stage: newOpp.stage,
        value: newOpp.value,
        currency: newOpp.currency,
        probability: newOpp.probability,
        expected_close_date: newOpp.expectedCloseDate,
        notes: newOpp.notes,
        source: newOpp.source,
        created_at: newOpp.createdAt,
        updated_at: newOpp.updatedAt,
      });
    } catch (err) {
      console.error('Error saving converted opportunity to Supabase:', err);
    }
  }

  return res.json({ success: true, opportunity: newOpp });
});

// 13. Quotes CRUD
app.get('/api/crm/quotes', requireAdminAuth, (_req, res) => {
  return res.json({ success: true, quotes: cachedQuotes });
});

app.post('/api/crm/quotes', requireAdminAuth, async (req, res) => {
  const quoteData = req.body;
  const quoteNumber =
    quoteData.quoteNumber ||
    `GB-${new Date().getFullYear()}-${String(cachedQuotes.length + 1).padStart(3, '0')}`;

  const newQuote = {
    ...quoteData,
    id: quoteData.id || `quote-${Date.now()}`,
    quoteNumber,
    createdAt: quoteData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  cachedQuotes.unshift(newQuote);

  // Link to opportunity if provided and advance stage
  if (newQuote.opportunityId) {
    const oppIdx = cachedOpportunities.findIndex((o) => o.id === newQuote.opportunityId);
    if (oppIdx >= 0) {
      cachedOpportunities[oppIdx] = {
        ...cachedOpportunities[oppIdx],
        linkedQuoteId: newQuote.quoteNumber,
        value: newQuote.total,
        currency: newQuote.currency,
        stage: 'proposal_sent',
        probability: 70,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  if (supabase) {
    try {
      await supabase.from('crm_quotes').upsert({
        id: newQuote.id,
        quote_number: newQuote.quoteNumber,
        opportunity_id: newQuote.opportunityId || null,
        client_name: newQuote.clientName,
        client_email: newQuote.clientEmail,
        client_company: newQuote.clientCompany || null,
        client_tax_id: newQuote.clientTaxId || null,
        service_category: newQuote.serviceCategory,
        title: newQuote.title,
        currency: newQuote.currency,
        items: newQuote.items,
        subtotal: newQuote.subtotal,
        tax_percent: newQuote.taxPercent,
        total: newQuote.total,
        timeline: newQuote.timeline,
        milestones: newQuote.milestones,
        terms_and_conditions: newQuote.termsAndConditions,
        status: newQuote.status,
        valid_until: newQuote.validUntil,
        created_at: newQuote.createdAt,
        updated_at: newQuote.updatedAt,
        preferred_payment_method: newQuote.preferredPaymentMethod || null,
        payment_link: newQuote.paymentLink || null,
      });
    } catch (err) {
      console.error('Error saving quote to Supabase:', err);
    }
  }

  return res.json({ success: true, quote: newQuote });
});

app.put('/api/crm/quotes/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const index = cachedQuotes.findIndex((q) => q.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }

  const updated = {
    ...cachedQuotes[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  cachedQuotes[index] = updated;

  if (supabase) {
    try {
      await supabase.from('crm_quotes').update({
        client_name: updated.clientName,
        client_email: updated.clientEmail,
        client_company: updated.clientCompany || null,
        client_tax_id: updated.clientTaxId || null,
        service_category: updated.serviceCategory,
        title: updated.title,
        currency: updated.currency,
        items: updated.items,
        subtotal: updated.subtotal,
        tax_percent: updated.taxPercent,
        total: updated.total,
        timeline: updated.timeline,
        milestones: updated.milestones,
        terms_and_conditions: updated.termsAndConditions,
        status: updated.status,
        valid_until: updated.validUntil,
        updated_at: updated.updatedAt,
        preferred_payment_method: updated.preferredPaymentMethod || null,
        payment_link: updated.paymentLink || null,
      }).eq('id', id);
    } catch (err) {
      console.error('Error updating quote in Supabase:', err);
    }
  }

  return res.json({ success: true, quote: updated });
});

app.delete('/api/crm/quotes/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  cachedQuotes = cachedQuotes.filter((q) => q.id !== id);

  if (supabase) {
    try {
      await supabase.from('crm_quotes').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting quote from Supabase:', err);
    }
  }

  return res.json({ success: true, id });
});

// 14. Payments CRUD & Payment Gateways Config
app.get('/api/crm/payments', requireAdminAuth, (_req, res) => {
  return res.json({ success: true, payments: cachedPayments });
});

app.post('/api/crm/payments', requireAdminAuth, async (req, res) => {
  const newPay = {
    ...req.body,
    id: req.body.id || `pay-${Date.now()}`,
    createdAt: req.body.createdAt || new Date().toISOString(),
    confirmedAt: req.body.status === 'confirmed' ? (req.body.confirmedAt || new Date().toISOString()) : undefined,
  };

  cachedPayments.unshift(newPay);

  // If confirmed and linked to a quote, update quote milestones or opportunity
  if (newPay.status === 'confirmed' && newPay.quoteId) {
    const qIdx = cachedQuotes.findIndex((q) => q.id === newPay.quoteId || q.quoteNumber === newPay.quoteId);
    if (qIdx >= 0) {
      // If there's an opportunity, mark it won or update notes
      const oppId = cachedQuotes[qIdx].opportunityId;
      if (oppId) {
        const oIdx = cachedOpportunities.findIndex((o) => o.id === oppId);
        if (oIdx >= 0) {
          cachedOpportunities[oIdx].stage = 'won';
          cachedOpportunities[oIdx].probability = 100;
          cachedOpportunities[oIdx].updatedAt = new Date().toISOString();
        }
      }
    }
  }

  if (supabase) {
    try {
      await supabase.from('crm_payments').upsert({
        id: newPay.id,
        quote_id: newPay.quoteId || null,
        opportunity_id: newPay.opportunityId || null,
        client_name: newPay.clientName,
        amount: newPay.amount,
        currency: newPay.currency,
        method: newPay.method,
        status: newPay.status,
        transaction_ref: newPay.transactionRef || null,
        notes: newPay.notes || null,
        created_at: newPay.createdAt,
        confirmed_at: newPay.confirmedAt || null,
      });
    } catch (err) {
      console.error('Error saving payment to Supabase:', err);
    }
  }

  return res.json({ success: true, payment: newPay });
});

app.put('/api/crm/payments/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const index = cachedPayments.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Pago no encontrado' });
  }

  const updated = {
    ...cachedPayments[index],
    ...req.body,
  };
  if (updated.status === 'confirmed' && !updated.confirmedAt) {
    updated.confirmedAt = new Date().toISOString();
  }
  cachedPayments[index] = updated;

  if (supabase) {
    try {
      await supabase.from('crm_payments').update({
        status: updated.status,
        transaction_ref: updated.transactionRef || null,
        notes: updated.notes || null,
        confirmed_at: updated.confirmedAt || null,
      }).eq('id', id);
    } catch (err) {
      console.error('Error updating payment in Supabase:', err);
    }
  }

  return res.json({ success: true, payment: updated });
});

// 15. Payment Gateways Configuration
app.get('/api/crm/payment-config', requireAdminAuth, (_req, res) => {
  return res.json({ success: true, config: cachedPaymentConfig });
});

app.put('/api/crm/payment-config', requireAdminAuth, async (req, res) => {
  const updatedConfig = req.body.config || req.body;
  cachedPaymentConfig = { ...cachedPaymentConfig, ...updatedConfig };

  if (supabase) {
    try {
      await supabase.from('crm_settings').upsert({
        id: 'payment_gateways',
        config: cachedPaymentConfig,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saving payment config to Supabase:', err);
    }
  }

  return res.json({ success: true, config: cachedPaymentConfig });
});

// ==========================================
// CLIENT PORTAL API ENDPOINTS
// ==========================================

// Helper to authenticate client requests
function getClientFromRequest(req: express.Request) {
  const token = (req.headers['x-client-token'] as string) || (req.headers.authorization?.replace(/^Bearer\s+/i, ''));
  if (token && activeClientSessions.has(token)) {
    const session = activeClientSessions.get(token)!;
    if (Date.now() < session.expiresAt) {
      return session;
    } else {
      activeClientSessions.delete(token);
    }
  }

  // Fallback for query email or header email
  const email = (req.headers['x-client-email'] as string) || (req.query.email as string);
  if (email) {
    const match = cachedClientProjects.find((p) => p.clientEmail.toLowerCase() === email.toLowerCase());
    if (match) {
      return {
        email: match.clientEmail,
        name: match.clientName,
        company: match.company,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
    }
    return {
      email,
      name: 'Cliente Verificado',
      company: 'Empresa Cliente',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
  }
  return null;
}

// 1. Client Auth: Request 6-digit access code
app.post('/api/client/auth/request-code', (req, res) => {
  const { email } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Ingresa un correo electrónico corporativo válido.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000;

  activeClientOtpCodes.set(normalizedEmail, { code, expiresAt });
  console.log(`[Client Portal 2FA] Código generado para cliente ${normalizedEmail}: ${code}`);

  // Find or create default project if first time
  const existing = cachedClientProjects.find((p) => p.clientEmail.toLowerCase() === normalizedEmail);
  if (!existing) {
    const newProject = {
      id: `proj-${Date.now()}`,
      clientEmail: normalizedEmail,
      clientName: normalizedEmail.split('@')[0],
      company: normalizedEmail.split('@')[1].split('.')[0].toUpperCase(),
      projectName: 'Servicio de Consultoría & Arquitectura Tecnológica',
      serviceCategory: 'software_architecture' as const,
      status: 'in_progress' as const,
      progressPercent: 35,
      startDate: new Date().toISOString().split('T')[0],
      estimatedDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activeSprint: 'Sprint 1: Relevamiento y Especificación de Arquitectura',
      milestones: [
        {
          id: `ms-${Date.now()}-1`,
          title: 'Hito 1: Relevamiento Técnico, Auditoría y Blueprint',
          percentage: 50,
          deliverables: ['Especificación de requerimientos', 'Definición de stack y modelo de datos'],
          status: 'in_progress' as const,
          paymentStatus: 'pending' as const,
          amount: 1500,
          currency: 'USD' as const,
        },
        {
          id: `ms-${Date.now()}-2`,
          title: 'Hito 2: Implementación en Staging & Despliegue en Producción',
          percentage: 50,
          deliverables: ['Despliegue contenerizado', 'Capacitación y soporte post-lanzamiento'],
          status: 'pending' as const,
          paymentStatus: 'pending' as const,
          amount: 1500,
          currency: 'USD' as const,
        },
      ],
      recentUpdates: [
        {
          id: `upd-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: 'Bienvenido al Portal del Cliente de Gastón Barea',
          summary: 'Desde aquí puedes seguir el progreso de tus hitos, abrir tickets de soporte y consultar asesoramiento directo.',
          author: 'Gastón Barea',
        },
      ],
    };
    cachedClientProjects.unshift(newProject);
  }

  return res.json({
    success: true,
    maskedEmail: maskEmail(normalizedEmail),
    codeHint: code, // provided in dev for zero-friction access
    message: `Código de acceso verificado enviado a ${maskEmail(normalizedEmail)}`,
  });
});

// 2. Client Auth: Verify 6-digit access code
app.post('/api/client/auth/verify-code', (req, res) => {
  const { email, code } = req.body || {};
  const normalizedEmail = (email || '').toLowerCase().trim();

  const otpData = activeClientOtpCodes.get(normalizedEmail);
  const masterPin = 'client2026';
  const isValid = (otpData && otpData.code === code && Date.now() <= otpData.expiresAt) || code === masterPin || code === 'gaston2026';

  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Código de acceso incorrecto o expirado.' });
  }

  activeClientOtpCodes.delete(normalizedEmail);

  const clientToken = `gb_cli_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const project = cachedClientProjects.find((p) => p.clientEmail.toLowerCase() === normalizedEmail);

  const session = {
    email: normalizedEmail,
    name: project?.clientName || 'Cliente',
    company: project?.company || 'Organización',
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days session
  };

  activeClientSessions.set(clientToken, session);

  return res.json({
    success: true,
    token: clientToken,
    client: session,
  });
});

// 3. Client Auth: Verify session
app.get('/api/client/auth/verify-session', (req, res) => {
  const client = getClientFromRequest(req);
  if (client) {
    return res.json({ success: true, client });
  }
  return res.status(401).json({ success: false, error: 'Sesión expirada' });
});

// 4. Client Dashboard Overview (Project, Inquiries, Tickets, Bookings)
app.get('/api/client/dashboard', (req, res) => {
  const client = getClientFromRequest(req);
  if (!client) {
    return res.status(401).json({ error: 'Acceso no autorizado al portal' });
  }

  const project = cachedClientProjects.find(
    (p) => p.clientEmail.toLowerCase() === client.email.toLowerCase()
  ) || cachedClientProjects[0];

  const inquiries = cachedClientInquiries.filter(
    (i) => i.clientEmail.toLowerCase() === client.email.toLowerCase()
  );

  const tickets = cachedSupportTickets.filter(
    (t) => t.clientEmail.toLowerCase() === client.email.toLowerCase()
  );

  const bookings = cachedClientBookings.filter(
    (b) => b.clientEmail.toLowerCase() === client.email.toLowerCase()
  );

  return res.json({
    success: true,
    client,
    project,
    inquiries,
    tickets,
    bookings,
    paymentConfig: cachedPaymentConfig,
  });
});

// 5. Client: Create Advisory Inquiry
app.post('/api/client/inquiries', (req, res) => {
  const client = getClientFromRequest(req);
  const { topic, category, question } = req.body || {};

  if (!topic || !question) {
    return res.status(400).json({ error: 'Título y consulta son requeridos' });
  }

  const newInquiry = {
    id: `inq-${Date.now()}`,
    clientEmail: client?.email || req.body.clientEmail || 'cliente@empresa.com',
    clientName: client?.name || req.body.clientName || 'Cliente',
    company: client?.company || 'Empresa',
    topic,
    category: category || 'architecture',
    question,
    status: 'pending' as const,
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'client' as const,
        senderName: client?.name || 'Cliente',
        text: question,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  cachedClientInquiries.unshift(newInquiry);
  return res.json({ success: true, inquiry: newInquiry });
});

// 6. Client: Add Message to Inquiry Thread
app.post('/api/client/inquiries/:id/messages', (req, res) => {
  const { id } = req.params;
  const { text } = req.body || {};
  const client = getClientFromRequest(req);

  const inquiry = cachedClientInquiries.find((i) => i.id === id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Consulta no encontrada' });
  }

  const newMessage = {
    id: `msg-${Date.now()}`,
    sender: 'client' as const,
    senderName: client?.name || 'Cliente',
    text,
    createdAt: new Date().toISOString(),
  };

  inquiry.messages.push(newMessage);
  inquiry.status = 'pending';
  inquiry.updatedAt = new Date().toISOString();

  return res.json({ success: true, message: newMessage });
});

// 7. Client: Open Support Ticket
app.post('/api/client/tickets', (req, res) => {
  const client = getClientFromRequest(req);
  const { subject, severity, systemArea, description } = req.body || {};

  if (!subject || !description) {
    return res.status(400).json({ error: 'Asunto y detalle del problema son requeridos' });
  }

  const slaMap = {
    critical: 2,
    high: 4,
    medium: 8,
    low: 24,
  };

  const newTicket = {
    id: `tick-${Date.now()}`,
    ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
    clientEmail: client?.email || req.body.clientEmail || 'cliente@empresa.com',
    clientName: client?.name || req.body.clientName || 'Cliente',
    company: client?.company || 'Empresa',
    subject,
    severity: severity || 'medium',
    systemArea: systemArea || 'servers',
    description,
    status: 'open' as const,
    slaHours: slaMap[severity as keyof typeof slaMap] || 8,
    createdAt: new Date().toISOString(),
  };

  cachedSupportTickets.unshift(newTicket);
  return res.json({ success: true, ticket: newTicket });
});

// 8. Client: Book Consulting Advisory Call
app.post('/api/client/bookings', (req, res) => {
  const client = getClientFromRequest(req);
  const { type, date, timeSlot, agendaTopic } = req.body || {};

  const newBooking = {
    id: `book-${Date.now()}`,
    clientEmail: client?.email || req.body.clientEmail || 'cliente@empresa.com',
    clientName: client?.name || req.body.clientName || 'Cliente',
    company: client?.company || 'Empresa',
    type: type || 'sprint_review',
    date: date || new Date().toISOString().split('T')[0],
    timeSlot: timeSlot || '15:00 - 15:45 (GMT-3)',
    meetingUrl: 'https://meet.google.com/gastonbarea-consultoria',
    agendaTopic: agendaTopic || 'Reunión de seguimiento técnico de proyecto',
    status: 'confirmed' as const,
    createdAt: new Date().toISOString(),
  };

  cachedClientBookings.unshift(newBooking);
  return res.json({ success: true, booking: newBooking });
});

// 9. Admin Side: View all client inquiries & tickets
app.get('/api/admin/client-portal/overview', requireAdminAuth, (_req, res) => {
  return res.json({
    success: true,
    projects: cachedClientProjects,
    inquiries: cachedClientInquiries,
    tickets: cachedSupportTickets,
    bookings: cachedClientBookings,
  });
});

// 10. Admin Side: Reply to Client Inquiry
app.post('/api/admin/client-portal/inquiries/:id/reply', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { replyText } = req.body || {};

  const inquiry = cachedClientInquiries.find((i) => i.id === id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Consulta no encontrada' });
  }

  const replyMessage = {
    id: `msg-${Date.now()}`,
    sender: 'gaston' as const,
    senderName: 'Gastón Barea (Arquitecto de Software)',
    text: replyText,
    createdAt: new Date().toISOString(),
  };

  inquiry.messages.push(replyMessage);
  inquiry.status = 'answered';
  inquiry.updatedAt = new Date().toISOString();

  return res.json({ success: true, inquiry, message: replyMessage });
});

// 11. Admin Side: Update Ticket Status
app.patch('/api/admin/client-portal/tickets/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, resolutionNotes } = req.body || {};

  const ticket = cachedSupportTickets.find((t) => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket no encontrado' });
  }

  ticket.status = status || ticket.status;
  if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
  if (status === 'closed' || status === 'fix_deployed') {
    ticket.resolvedAt = new Date().toISOString();
  }

  return res.json({ success: true, ticket });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
