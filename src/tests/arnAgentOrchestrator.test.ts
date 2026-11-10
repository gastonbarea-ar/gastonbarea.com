import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runArnAutonomousAgent } from '../services/arnAgentOrchestrator.ts';
import {
  INITIAL_ARN_SERVICE_STOCK,
  INITIAL_CRM_COMPANIES,
  INITIAL_CRM_CONTACTS,
  INITIAL_CRM_OPPORTUNITIES,
  INITIAL_CRM_QUOTES,
} from '../data/crmTemplates.ts';
import {
  INITIAL_CLIENT_PROJECTS,
  INITIAL_CONSULTING_BOOKINGS,
  INITIAL_CONSULTING_INQUIRIES,
  INITIAL_SUPPORT_TICKETS,
} from '../data/clientPortalData.ts';

function createMockStore() {
  return {
    opportunities: [...INITIAL_CRM_OPPORTUNITIES],
    companies: [...INITIAL_CRM_COMPANIES],
    contacts: [...INITIAL_CRM_CONTACTS],
    quotes: [...INITIAL_CRM_QUOTES],
    projects: [...INITIAL_CLIENT_PROJECTS],
    inquiries: [...INITIAL_CONSULTING_INQUIRIES],
    tickets: [...INITIAL_SUPPORT_TICKETS],
    bookings: [...INITIAL_CONSULTING_BOOKINGS],
    serviceStock: [...INITIAL_ARN_SERVICE_STOCK],
  };
}

describe('10. Motor de Agentes IA Autónomos ARN (Ciclo StateGraph de 4 Fases)', () => {
  it('debe bloquear la exposición de precios y emisión de presupuestos 40/40/20 a visitantes públicos sin sesión en #portal', async () => {
    const store = createMockStore();
    const initialQuoteCount = store.quotes.length;

    const result = await runArnAutonomousAgent({
      prompt: 'Quiero cotizar Odoo v18 para 25 empleados y que me mandes el presupuesto por mail',
      callerRole: 'public_visitor',
      store,
    });

    assert.equal(result.success, true);
    assert.equal(result.agentTrace.step1_evaluateObjective.callerRole, 'public_visitor');
    assert.equal(result.agentTrace.step3_toolsExecuted.length, 0);
    assert.equal(store.quotes.length, initialQuoteCount);
    assert.ok(result.finalResponse.includes('Portal de Clientes (#portal)'));
  });

  it('debe ejecutar las 4 fases del Ciclo Agéntico (Evaluar -> Memoria -> Herramientas -> Verificar) ante un pedido compuesto de Admin ARN', async () => {
    const store = createMockStore();

    const result = await runArnAutonomousAgent({
      prompt:
        'Hablé con Valeria de Bodega Austral, correo valeria@bodegaaustral.com, somos 20 empleados, necesitan Odoo v18 ERP e inventario, armar propuesta 40/40/20 y agendar reunión Meet',
      callerRole: 'admin_arn',
      store,
    });

    assert.equal(result.success, true);
    assert.ok(result.agentTrace.step1_evaluateObjective.subtasks.length >= 4);
    assert.equal(result.agentTrace.step2_contextAndMemory.detectedEmployeeCount, 20);
    assert.ok(result.agentTrace.step2_contextAndMemory.companyScaleLabel.includes('PyME'));

    const toolNames = result.agentTrace.step3_toolsExecuted.map((t) => t.toolName);
    assert.ok(toolNames.includes('consultar_memoria_cliente_crm'));
    assert.ok(toolNames.includes('consultar_stock_y_reglas_arn'));
    assert.ok(toolNames.includes('emitir_o_actualizar_presupuesto_404020'));
    assert.ok(toolNames.includes('verificar_o_agendar_sesion_meet'));

    assert.equal(result.agentTrace.step4_resultVerification.goalResolved, true);
    assert.equal(result.agentTrace.step4_resultVerification.math404020Verified, true);

    const quote = result.artifacts.quote;
    assert.ok(quote);
    assert.equal(quote.employeeCount, 20);
    assert.equal(quote.companyScale, 'pyme');
    const sumMilestones =
      quote.milestones[0].amount + quote.milestones[1].amount + quote.milestones[2].amount;
    assert.equal(sumMilestones, quote.total);
  });

  it('debe aislar al cliente autenticado en #portal a su propia cuenta y ejecutar auditoría de hitos y apertura de ticket SLA', async () => {
    const store = createMockStore();

    const result = await runArnAutonomousAgent({
      prompt:
        'Auditá el estado de mis hitos de pago 40/40/20, actualizá mi presupuesto para 15 empleados y abrí un ticket de soporte urgente por servidor',
      callerRole: 'authenticated_client',
      authenticatedClient: {
        email: 'martin@distribuidorasur.com.ar',
        name: 'Martín Arismendi',
        company: 'Distribuidora Sur S.A.',
      },
      store,
    });

    assert.equal(result.success, true);
    assert.equal(
      result.agentTrace.step2_contextAndMemory.matchedClientEmail,
      'martin@distribuidorasur.com.ar'
    );
    const toolNames = result.agentTrace.step3_toolsExecuted.map((t) => t.toolName);
    assert.ok(toolNames.includes('auditar_estado_hitos_y_pagos'));
    assert.ok(toolNames.includes('gestionar_ticket_soporte_sla'));
    assert.ok(result.artifacts.ticket);
    assert.equal(result.artifacts.ticket.clientEmail, 'martin@distribuidorasur.com.ar');
  });
});
