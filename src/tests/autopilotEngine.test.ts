import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  compileDailyExecutiveDigest,
  computeAutopilotMetrics,
  evaluateFollowUpCandidates,
  evaluateSelfHealingAlert,
  processInboundAutonomousMessage,
} from '../services/autopilotEngine.ts';
import { generateProxmoxAndN8nBlueprints } from '../services/proxmoxBlueprints.ts';
import { DEFAULT_AUTOPILOT_CONFIG } from '../types/autopilot.ts';
import {
  INITIAL_ARN_SERVICE_STOCK,
  INITIAL_CRM_CONTACTS,
  INITIAL_CRM_OPPORTUNITIES,
  INITIAL_CRM_QUOTES,
} from '../data/crmTemplates.ts';
import {
  INITIAL_CLIENT_PROJECTS,
  INITIAL_CONSULTING_BOOKINGS,
  INITIAL_SUPPORT_TICKETS,
} from '../data/clientPortalData.ts';

function buildStore() {
  return {
    opportunities: [...INITIAL_CRM_OPPORTUNITIES],
    contacts: [...INITIAL_CRM_CONTACTS],
    quotes: [...INITIAL_CRM_QUOTES],
    projects: [...INITIAL_CLIENT_PROJECTS],
    bookings: [...INITIAL_CONSULTING_BOOKINGS],
    tickets: [...INITIAL_SUPPORT_TICKETS],
    serviceStock: [...INITIAL_ARN_SERVICE_STOCK],
  };
}

describe('11. Agente Autónomo ARN 24/7 (Ventas, Soporte L1, Auto-Sanación y Blueprints)', () => {
  it('cotiza determinísticamente 40/40/20 desde Stock ARN y resuelve en silencio sin interrumpir a Gastón', async () => {
    const decision = await processInboundAutonomousMessage({
      channel: 'whatsapp',
      externalId: '5491144445555',
      senderName: 'Laura Méndez',
      senderPhone: '5491144445555',
      messageText: 'Hola, somos 25 empleados y necesitamos precio de Odoo ERP con automatización.',
      config: { ...DEFAULT_AUTOPILOT_CONFIG, maxAutoQuoteAmountUsd: 50000 },
      store: buildStore(),
    });

    assert.equal(decision.shouldDispatchReply, true);
    assert.equal(decision.nextStage, 'quoted');
    assert.ok(decision.autoQuote, 'Debe emitir presupuesto determinístico 40/40/20');
    assert.equal(decision.vipEscalation, null, 'No debe interrumpir a Gastón en cotización estándar');
    assert.equal(decision.activityLog.noiseSuppressed, true);
  });

  it('escala inmediatamente a Bandeja VIP cuando el cliente confirma pago/seña del 40%', async () => {
    const decision = await processInboundAutonomousMessage({
      channel: 'whatsapp',
      externalId: '5491133332222',
      senderName: 'Carlos Pérez',
      senderPhone: '5491133332222',
      messageText: 'Ya transferí el 40% de la seña para arrancar el kickoff, ahí te mando el comprobante.',
      config: DEFAULT_AUTOPILOT_CONFIG,
      store: buildStore(),
    });

    assert.equal(decision.shouldDispatchReply, true);
    assert.equal(decision.nextStage, 'vip_escalated');
    assert.ok(decision.vipEscalation);
    assert.equal(decision.vipEscalation?.reason, 'kickoff_payment_40');
    assert.equal(decision.activityLog.noiseSuppressed, false);
  });

  it('respeta el Kill-Switch en modo Solo Borrador (draft_only) y no despacha automáticamente', async () => {
    const decision = await processInboundAutonomousMessage({
      channel: 'whatsapp',
      externalId: '5491199998888',
      senderName: 'Sofía Ruiz',
      senderPhone: '5491199998888',
      messageText: 'Hola, somos 18 personas y queremos implementar automatización IA.',
      config: {
        ...DEFAULT_AUTOPILOT_CONFIG,
        channels: { ...DEFAULT_AUTOPILOT_CONFIG.channels, whatsapp: 'draft_only' },
      },
      store: buildStore(),
    });

    assert.equal(decision.shouldDispatchReply, false);
    assert.equal(decision.vipEscalation?.severity, 'draft');
    assert.equal(decision.vipEscalation?.reason, 'draft_approval_needed');
    assert.ok((decision.vipEscalation?.draftReply || '').length > 20);
  });

  it('respeta el Kill-Switch en modo Pausado (paused) sin responder ni escalar', async () => {
    const decision = await processInboundAutonomousMessage({
      channel: 'whatsapp',
      externalId: '5491177776666',
      senderName: 'Diego Torres',
      senderPhone: '5491177776666',
      messageText: 'Hola, ¿hacen desarrollos con IA?',
      config: {
        ...DEFAULT_AUTOPILOT_CONFIG,
        channels: { ...DEFAULT_AUTOPILOT_CONFIG.channels, whatsapp: 'paused' },
      },
      store: buildStore(),
    });

    assert.equal(decision.shouldDispatchReply, false);
    assert.equal(decision.replyText, '');
    assert.equal(decision.vipEscalation, null);
    assert.equal(decision.activityLog.outcome, 'paused_noop');
  });

  it('responde consultas Nivel 1 de un cliente activo usando el estado real de su proyecto en silencio', async () => {
    const store = buildStore();
    const firstProject = store.projects[0];
    assert.ok(firstProject, 'Debe existir al menos un proyecto semilla para el test');

    const decision = await processInboundAutonomousMessage({
      channel: 'portal',
      externalId: firstProject.clientEmail,
      senderName: firstProject.clientName,
      senderEmail: firstProject.clientEmail,
      messageText: 'Hola, ¿cómo va el estado y avance del sprint actual del proyecto?',
      config: DEFAULT_AUTOPILOT_CONFIG,
      store,
    });

    assert.equal(decision.shouldDispatchReply, true);
    assert.equal(decision.nextStage, 'support_l1');
    assert.equal(decision.vipEscalation, null);
    assert.ok(decision.replyText.includes(String(firstProject.progressPercent)));
  });

  it('evalúa correctamente alertas Uptime Kuma: auto-sana caídas <15 min y escala solo >=15 min', () => {
    const transient = evaluateSelfHealingAlert({
      serviceName: 'arn-evolution',
      status: 'down',
      downMinutes: 3,
      errorDetail: 'HTTP 502 Bad Gateway',
      config: DEFAULT_AUTOPILOT_CONFIG,
    });
    assert.equal(transient.action, 'self_heal_retry');
    assert.equal(transient.escalateVip, false);
    assert.equal(transient.vipEscalation, null);
    assert.equal(transient.activityLog.noiseSuppressed, true);

    const critical = evaluateSelfHealingAlert({
      serviceName: 'arn-evolution',
      status: 'down',
      downMinutes: 18,
      errorDetail: 'Container OOMKilled',
      config: DEFAULT_AUTOPILOT_CONFIG,
    });
    assert.equal(critical.action, 'escalate_vip_critical');
    assert.equal(critical.escalateVip, true);
    assert.equal(critical.vipEscalation?.severity, 'critical');
  });

  it('detecta candidatos de seguimiento comercial 48h/7d y recordatorios Meet 24h/2h para n8n', () => {
    const now = new Date('2026-11-26T15:00:00-03:00');
    const quote48h = {
      ...INITIAL_CRM_QUOTES[0],
      id: 'q-48h',
      quoteNumber: 'QT-48H',
      status: 'sent' as const,
      updatedAt: new Date(now.getTime() - 60 * 60 * 60 * 1000).toISOString(),
    };
    const upcomingBooking = {
      ...INITIAL_CONSULTING_BOOKINGS[0],
      id: 'bk-2h',
      status: 'confirmed' as const,
      date: '2026-11-26',
      timeSlot: '17:00',
    };

    const candidates = evaluateFollowUpCandidates({
      opportunities: INITIAL_CRM_OPPORTUNITIES,
      quotes: [quote48h],
      bookings: [upcomingBooking],
      now,
    });

    assert.ok(candidates.some((c) => c.type === 'quote_followup_48h' && c.targetId === 'q-48h'));
    assert.ok(candidates.some((c) => c.type === 'meet_reminder_2h' && c.targetId === 'bk-2h'));
  });

  it('genera métricas reales, Digest Ejecutivo Diario y Blueprints Proxmox/n8n válidos', () => {
    const metrics = computeAutopilotMetrics({
      conversations: [],
      escalations: [],
      logs: [
        {
          id: 'l1',
          channel: 'whatsapp',
          actionType: 'autonomous_sales_quote_request',
          targetLabel: 'Cliente Test',
          outcome: 'resolved_silently',
          noiseSuppressed: true,
          estimatedMinutesSaved: 20,
          detail: 'OK',
          createdAt: new Date().toISOString(),
        },
      ],
    });
    assert.equal(metrics.resolvedSilentlyCount, 1);
    assert.equal(metrics.noiseSuppressionRate, 100);

    const digest = compileDailyExecutiveDigest({
      conversations: [],
      escalations: [],
      logs: [],
      bookings: [],
    });
    assert.ok(digest.subject.includes('Resumen Diario'));
    assert.ok(digest.html.includes('Piloto Automático ARN'));

    const bundle = generateProxmoxAndN8nBlueprints({ siteUrl: 'https://www.gastonbarea.com' });
    assert.ok(bundle.dockerComposeYaml.includes('cloudflared'));
    assert.ok(bundle.dockerComposeYaml.includes('evolution-api'));
    assert.ok(bundle.dockerComposeYaml.includes('gotenberg'));
    assert.ok(bundle.dockerComposeYaml.includes('uptime-kuma'));
    assert.equal(bundle.n8nWorkflows.length, 4);
  });
});
