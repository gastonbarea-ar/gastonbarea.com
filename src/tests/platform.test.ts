import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePageFromHash,
  resolveServiceCodeFromHash,
  matchWebSolution,
  generateRuleBasedProposal,
  maskEmail,
  extractYoutubeId,
  isValidPublicDirectVideoUrl,
  filterProjectsCatalog,
  validateContactForm,
  buildCustomSolutionBlueprint,
  buildAiStudyDossierHtml,
} from '../lib/domainLogic.ts';
import { PROJECTS_CATALOG } from '../data/projectsData.ts';
import { SITE_CONFIG, DEFAULT_BOOKING_AVAILABILITY } from '../data/siteConfig.ts';
import { INITIAL_BLOG_POSTS } from '../data/blogData.ts';
import {
  INITIAL_CRM_COMPANIES,
  INITIAL_CRM_CONTACTS,
  INITIAL_CRM_OPPORTUNITIES,
  INITIAL_CRM_QUOTES,
} from '../data/crmTemplates.ts';
import { INITIAL_CLIENT_PROJECTS, CLIENT_ACCOUNTS } from '../data/clientPortalData.ts';
import {
  normalizePhoneE164,
  getWhatsAppPublicStatus,
  setRuntimeWhatsAppConfig,
  dispatchWhatsAppMessage,
} from '../services/whatsappAutomation.ts';
import {
  buildGoogleCalendarInviteUrl,
  buildBookingIcsInvite,
  getBookingTypeLabel,
} from '../services/emailAutomation.ts';

describe('1. Enrutamiento y Navegación de Secciones (resolvePageFromHash & resolveServiceCodeFromHash)', () => {
  it('debe resolver correctamente las páginas principales del menú superior y los workspaces dedicados', () => {
    assert.equal(resolvePageFromHash('#inicio'), 'inicio');
    assert.equal(resolvePageFromHash('#servicios'), 'servicios');
    assert.equal(resolvePageFromHash('#soluciones'), 'servicios');
    assert.equal(resolvePageFromHash('#ia-services'), 'ia-services');
    assert.equal(resolvePageFromHash('#bioeconomia'), 'bioeconomia');
    assert.equal(resolvePageFromHash('#proyectos'), 'proyectos');
    assert.equal(resolvePageFromHash('#experience'), 'trayectoria');
    assert.equal(resolvePageFromHash('#trayectoria'), 'trayectoria');
    assert.equal(resolvePageFromHash('#blog'), 'blog');
    assert.equal(resolvePageFromHash('#contacto'), 'contacto');
    assert.equal(resolvePageFromHash('#portal'), 'portal-clientes');
    assert.equal(resolvePageFromHash('#clientes'), 'portal-clientes');
    assert.equal(resolvePageFromHash('#portal-clientes'), 'portal-clientes');
    assert.equal(resolvePageFromHash('#admin'), 'admin');
    assert.equal(resolvePageFromHash('#dashboard'), 'admin');
    assert.equal(resolvePageFromHash('#crm'), 'admin');
    assert.equal(resolvePageFromHash('#solucion-ia'), 'solucion-ia');
    assert.equal(resolvePageFromHash('#solucion-personalizada'), 'solucion-ia');
    assert.ok(CLIENT_ACCOUNTS.length >= 6);
    assert.equal(CLIENT_ACCOUNTS[0].username, 'martin.arismendi');
  });

  it('debe mapear los sub-enlaces del menú Soluciones a su página y código de servicio exacto', () => {
    assert.equal(resolvePageFromHash('#ebts'), 'servicios');
    assert.equal(resolveServiceCodeFromHash('#ebts'), '01');

    assert.equal(resolvePageFromHash('#ia-services'), 'ia-services');
    assert.equal(resolveServiceCodeFromHash('#ia-services'), '02');

    assert.equal(resolvePageFromHash('#bioeconomia'), 'bioeconomia');
    assert.equal(resolveServiceCodeFromHash('#bioeconomia'), '03');

    assert.equal(resolvePageFromHash('#pmo-clientes'), 'servicios');
    assert.equal(resolveServiceCodeFromHash('#pmo-clientes'), '04');

    assert.equal(resolvePageFromHash('#odoo-v18'), 'servicios');
    assert.equal(resolveServiceCodeFromHash('#odoo-v18'), '05');

    assert.equal(resolvePageFromHash('#linux-docker'), 'servicios');
    assert.equal(resolveServiceCodeFromHash('#linux-docker'), '06');
  });

  it('debe redirigir hashes desconocidos o vacíos a inicio por defecto', () => {
    assert.equal(resolvePageFromHash(''), 'inicio');
    assert.equal(resolvePageFromHash('#no-existe'), 'inicio');
  });
});

describe('2. Motor de Enrutamiento Inteligente IA (matchWebSolution)', () => {
  it('debe enrutar consultas de IA Services y Gemelos Digitales a #ia-services', () => {
    const res = matchWebSolution('Queremos implementar un Gemelo Digital con agentes RAG e IA');
    assert.equal(res.serviceCode, '02');
    assert.equal(res.sectionId, '#ia-services');
  });

  it('debe enrutar consultas de Bioeconomía e IoT a #bioeconomia', () => {
    const res = matchWebSolution('Necesitamos trazabilidad de biomasa y sensores IoT en agroindustria');
    assert.equal(res.serviceCode, '03');
    assert.equal(res.sectionId, '#bioeconomia');
  });

  it('debe enrutar consultas de Odoo ERP y E-Commerce B2B2C a #odoo-v18', () => {
    const res = matchWebSolution('Implementar Odoo v18 con portal mayorista B2B y stock');
    assert.equal(res.serviceCode, '05');
    assert.equal(res.sectionId, '#odoo-v18');
  });

  it('debe enrutar consultas sobre Proyectos en Producción o Portfolio a #proyectos', () => {
    const res = matchWebSolution('Quiero ver el portfolio de proyectos en producción y realizados');
    assert.equal(res.sectionId, '#proyectos');
  });

  it('debe enrutar consultas sobre Experience y Dirección PMO a #experience', () => {
    const res = matchWebSolution('Buscamos dirección ejecutiva PMO y conocer tu experience');
    assert.equal(res.serviceCode, '04');
    assert.equal(res.sectionId, '#experience');
  });

  it('debe enrutar consultas sobre Linux, Docker y Servidores a #linux-docker', () => {
    const res = matchWebSolution('Auditar servidor Linux con contenedores Docker y seguridad');
    assert.equal(res.serviceCode, '06');
    assert.equal(res.sectionId, '#linux-docker');
  });
});

describe('3. Estructurador de Propuestas Técnicas (generateRuleBasedProposal)', () => {
  it('debe generar una propuesta de IA Services con 4 fases y stack de IA/RAG', () => {
    const prop = generateRuleBasedProposal({
      organizationType: 'Empresa de Base Tecnológica (EBT) / IA Services',
      primaryChallenge: 'IA Services: Gemelo Digital Interactivo, Agentes RAG & Business Intelligence',
      currentStack: ['PostgreSQL / Datos'],
      urgency: 'Alta',
    });
    assert.ok(prop.architectureTitle.includes('IA Services'));
    assert.equal(prop.workPhases.length, 4);
    assert.ok(prop.workPhases[0].phase.includes('40%'));
    assert.ok(prop.workPhases[1].phase.includes('40%'));
    assert.ok(prop.workPhases[2].phase.includes('20%'));
  });

  it('debe generar una propuesta de Bioeconomía cuando el desafío incluye trazabilidad o biomasa', () => {
    const prop = generateRuleBasedProposal({
      organizationType: 'Bioeconomía, Agroindustria & Economía Circular',
      primaryChallenge: 'Formulación y desarrollo de proyecto de Bioeconomía / Trazabilidad IoT',
      currentStack: ['Sensores IoT / Planta'],
      urgency: 'Media',
    });
    assert.ok(prop.architectureTitle.includes('Bioeconomía'));
    assert.equal(prop.estimatedTimeline, '6 a 10 semanas');
  });
});

describe('4. Catálogo y Filtrado de Proyectos Realizados & En Producción', () => {
  it('debe contar con proyectos válidos tanto en producción como realizados', () => {
    assert.ok(PROJECTS_CATALOG.length >= 6);
    const inProd = filterProjectsCatalog(PROJECTS_CATALOG, 'en-produccion', 'Todas');
    const completed = filterProjectsCatalog(PROJECTS_CATALOG, 'realizado', 'Todas');
    assert.ok(inProd.length > 0);
    assert.ok(completed.length > 0);
    assert.equal(inProd.length + completed.length, PROJECTS_CATALOG.length);
  });

  it('debe filtrar proyectos por vertical tecnológica correctamente', () => {
    const iaProjects = filterProjectsCatalog(
      PROJECTS_CATALOG,
      'todos',
      'IA Services & Gemelos Digitales'
    );
    assert.ok(iaProjects.length >= 2);
    assert.ok(iaProjects.every((p) => p.category === 'IA Services & Gemelos Digitales'));
  });
});

describe('5. Utilidades de Seguridad, Validación y Video (maskEmail, extractYoutubeId, isValidPublicDirectVideoUrl, validateContactForm)', () => {
  it('debe enmascarar correos electrónicos preservando privacidad', () => {
    assert.equal(maskEmail('gastonbarea.com@gmail.com'), 'ga***m@gmail.com');
    assert.equal(maskEmail('invalido'), '***@***');
  });

  it('debe extraer el ID de 11 caracteres de distintas variantes de URLs de YouTube', () => {
    assert.equal(extractYoutubeId('https://youtu.be/XVYUP8Pz-hE'), 'XVYUP8Pz-hE');
    assert.equal(
      extractYoutubeId('https://www.youtube.com/watch?v=XVYUP8Pz-hE&feature=share'),
      'XVYUP8Pz-hE'
    );
    assert.equal(extractYoutubeId('XVYUP8Pz-hE'), 'XVYUP8Pz-hE');
  });

  it('debe validar URLs públicas de video Cloudflare R2 (.mp4/.webm) y rechazar endpoints privados S3 (*.r2.cloudflarestorage.com)', () => {
    assert.equal(
      isValidPublicDirectVideoUrl(
        'https://pub-eae6e588df744c44ab3e62f36cc7875d.r2.dev/gemini_generated_video_05630b9d.mp4'
      ),
      true
    );
    assert.equal(
      isValidPublicDirectVideoUrl(
        'https://9b32f0a2e23de4ef4eb71f41ca9ee3f6.r2.cloudflarestorage.com/media-gaston'
      ),
      false
    );
    assert.equal(
      isValidPublicDirectVideoUrl(
        'https://9b32f0a2e23de4ef4eb71f41ca9ee3f6.r2.cloudflarestorage.com/media-gaston/video.mp4'
      ),
      false
    );
    assert.equal(isValidPublicDirectVideoUrl('https://pub-eae6e588df744c44ab3e62f36cc7875d.r2.dev/'), false);
  });

  it('debe validar correctamente el formulario ejecutivo de contacto', () => {
    const invalidErrors = validateContactForm({
      name: '',
      email: 'correo-invalido',
      company: '',
      requirements: '',
    });
    assert.ok(invalidErrors.name);
    assert.ok(invalidErrors.email);
    assert.ok(invalidErrors.company);
    assert.ok(invalidErrors.requirements);

    const validErrors = validateContactForm({
      name: 'Martín Rodríguez',
      email: 'martin@empresa.com',
      company: 'BioSur S.A.',
      requirements: 'Necesitamos implementar trazabilidad IoT y Odoo v18.',
    });
    assert.equal(Object.keys(validErrors).length, 0);
  });
});

describe('6. Integridad de Datos de Configuración, Blog, CRM y Portal de Clientes', () => {
  it('debe mantener la configuración principal de GASTONBAREA.COM coherente con stream directo Cloudflare R2', () => {
    assert.equal(SITE_CONFIG.domain, 'gastonbarea.com');
    assert.equal(SITE_CONFIG.presentationVideo.youtubeId, 'XVYUP8Pz-hE');
    assert.equal(
      isValidPublicDirectVideoUrl(SITE_CONFIG.presentationVideo.directVideoUrl || ''),
      true
    );
    assert.ok(INITIAL_BLOG_POSTS.length > 0);
    assert.ok(INITIAL_CRM_OPPORTUNITIES.length > 0);
    assert.ok(INITIAL_CRM_QUOTES.length > 0);
    assert.ok(INITIAL_CLIENT_PROJECTS.length > 0);
  });

  it('debe agrupar contactos corporativos por empresa, permitir contactos individuales y habilitar a todos en el Portal Clientes con o sin servicio activo', () => {
    assert.ok(INITIAL_CRM_COMPANIES.length >= 4);
    assert.ok(INITIAL_CRM_CONTACTS.length >= 8);

    // Verificar agrupación corporativa (ej. Distribuidora del Sur S.A. tiene múltiples contactos agrupados)
    const distSurContacts = INITIAL_CRM_CONTACTS.filter((c) => c.companyId === 'cmp-001');
    assert.ok(distSurContacts.length >= 3);
    assert.ok(distSurContacts.every((c) => c.contactType === 'corporate_member'));

    // Verificar contactos individuales independientes
    const individualContacts = INITIAL_CRM_CONTACTS.filter((c) => c.contactType === 'individual');
    assert.ok(individualContacts.length >= 2);

    // Verificar que todos los contactos pasan a ser usuarios registrados del Portal Clientes, incluso sin servicio contratado activo
    assert.ok(
      INITIAL_CRM_CONTACTS.every(
        (c) => c.portalAccessStatus === 'active' && c.username && c.password
      )
    );
    const registeredWithoutService = CLIENT_ACCOUNTS.filter((acc) => acc.hasActiveService === false);
    assert.ok(registeredWithoutService.length >= 3);
  });
});

describe('7. Motor de Reorganización Estratégica y Soluciones a Medida con IA (buildCustomSolutionBlueprint)', () => {
  it('debe construir 3 servicios a medida, 3 fases 40/40/20 y priorizar proyectos de bioeconomía ante consultas agro/bio', () => {
    const bp = buildCustomSolutionBlueprint('Trazabilidad de cultivos y valorización de biomasa en planta');
    assert.equal(bp.tailoredServices.length, 3);
    assert.equal(bp.roadmapPhases.length, 3);
    assert.equal(bp.roadmapPhases[0].percentage, '40%');
    assert.equal(bp.roadmapPhases[1].percentage, '40%');
    assert.equal(bp.roadmapPhases[2].percentage, '20%');
    assert.equal(bp.recommendedProjectIds[0], 'trazabilidad-bioeconomia-iot');
    assert.ok(bp.solutionTitle.includes('Bioeconomía'));
  });

  it('debe reorganizar módulos hacia Industria 4.0 y OEE cuando se consulta sobre planta industrial o sensores', () => {
    const bp = buildCustomSolutionBlueprint('Automatización de planta Industria 4.0 y monitoreo OEE');
    assert.equal(bp.tailoredServices.length, 3);
    assert.ok(bp.solutionTitle.includes('Industria 4.0'));
    assert.ok(bp.recommendedProjectIds.includes('infraestructura-critica-linux-cluster'));
  });

  it('debe reorganizar módulos hacia Odoo Community ERP v18 y B2B2C ante consultas de inventario o e-commerce mayorista', () => {
    const bp = buildCustomSolutionBlueprint('Implementar Odoo ERP v18 con tienda B2B mayorista y stock');
    assert.equal(bp.tailoredServices.length, 3);
    assert.equal(bp.recommendedProjectIds[0], 'odoo-v18-b2b2c-multideposito');
    assert.ok(bp.solutionTitle.includes('Odoo'));
  });

  it('debe generar un dossier HTML descargable e imprimible del estudio técnico con IA', () => {
    const bp = buildCustomSolutionBlueprint('Trazabilidad en bioeconomía e IA');
    const html = buildAiStudyDossierHtml(bp, 'Ing. Martín Rodríguez', 'BioSur S.A.');
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes(bp.solutionTitle));
    assert.ok(html.includes('Ing. Martín Rodríguez'));
    assert.ok(html.includes('BioSur S.A.'));
    assert.ok(html.includes('window.print()'));
    assert.ok(html.includes('notificaciones@gastonbarea.com'));
  });
});

describe('8. Integración WhatsApp Business API & Automatizaciones CRM (whatsappAutomation)', () => {
  it('debe normalizar números telefónicos argentinos e internacionales a formato E.164 limpio', () => {
    assert.equal(normalizePhoneE164('2995137574'), '5492995137574');
    assert.equal(normalizePhoneE164('0299 15-5137574'), '5492995137574');
    assert.equal(normalizePhoneE164('+54 9 299 513-7574'), '5492995137574');
    assert.equal(normalizePhoneE164('542995137574'), '5492995137574');
    assert.equal(normalizePhoneE164(''), '');
  });

  it('debe exponer el estado público del conector WhatsApp Business y generar waMeFallbackUrl seguro', async () => {
    setRuntimeWhatsAppConfig({
      businessPhone: '0299 15-5137574',
      adminNotifyPhone: '+54 9 299 513-7574',
      provider: 'evolution_api',
    });
    const status = getWhatsAppPublicStatus();
    assert.equal(status.businessPhone, '5492995137574');
    assert.equal(status.adminNotifyPhone, '5492995137574');
    assert.equal(status.provider, 'evolution_api');
    assert.equal(status.inboundWebhookPath, '/api/webhooks/whatsapp');

    const dispatchRes = await dispatchWhatsAppMessage({
      toPhone: '2995137574',
      message: 'Prueba unitaria de automatización CRM Gastón Barea',
    });
    assert.equal(dispatchRes.toPhone, '5492995137574');
    assert.ok(dispatchRes.waMeFallbackUrl.startsWith('https://wa.me/5492995137574?text='));
  });

  it('debe generar enlaces automáticos de Google Calendar con horarios GMT-3 convertidos a UTC y enlace Google Meet Pro', () => {
    assert.equal(getBookingTypeLabel('discovery_ia'), 'Diagnóstico & Propuesta IA (30 min)');
    const calUrl = buildGoogleCalendarInviteUrl({
      clientName: 'Gastón Prueba',
      company: 'XGaston',
      type: 'discovery_ia',
      date: '2026-11-12',
      timeSlot: '15:00 - 15:45 (GMT-3)',
      meetingUrl: 'https://meet.google.com/gastonbarea-consultoria',
      agendaTopic: 'Evaluar estudio preliminar IA',
    });
    assert.ok(calUrl.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE'));
    assert.ok(calUrl.includes('dates=20261112T180000Z/20261112T184500Z'));
    assert.ok(calUrl.includes(encodeURIComponent('https://meet.google.com/gastonbarea-consultoria')));
  });

  it('debe usar notificaciones@gastonbarea.com y generar invitación nativa .ics (RFC 5545) adjuntable por Resend', () => {
    assert.equal(SITE_CONFIG.email, 'notificaciones@gastonbarea.com');
    assert.equal(DEFAULT_BOOKING_AVAILABILITY.notificationEmail, 'notificaciones@gastonbarea.com');
    assert.ok(DEFAULT_BOOKING_AVAILABILITY.slots.filter((s) => s.enabled).length >= 4);

    const ics = buildBookingIcsInvite({
      bookingId: 'book-test-2026',
      clientName: 'Gastón Prueba',
      clientEmail: 'xpatagonia.com@gmail.com',
      company: 'XGaston',
      type: 'discovery_ia',
      date: '2026-11-12',
      timeSlot: '15:00 - 15:45 (GMT-3)',
      meetingUrl: 'https://meet.google.com/gastonbarea-consultoria',
      agendaTopic: 'Evaluar estudio preliminar IA',
    });

    assert.ok(ics.includes('BEGIN:VCALENDAR'));
    assert.ok(ics.includes('METHOD:REQUEST'));
    assert.ok(ics.includes('ORGANIZER;CN="Gastón Barea":mailto:notificaciones@gastonbarea.com'));
    assert.ok(ics.includes('mailto:xpatagonia.com@gmail.com'));
    assert.ok(ics.includes('DTSTART:20261112T180000Z'));
    assert.ok(ics.includes('DTEND:20261112T184500Z'));
    assert.ok(ics.includes('END:VCALENDAR'));
  });
});

// ============================================================================
// 9. MOTOR ARN & STOCK DE SERVICIOS (MICRO · PYME · GRANDE + ÍTEM DE EMPLEADOS)
// ============================================================================
import {
  parseNaturalArnCommand,
  buildAutonomous404020Quote,
  computeArnRelationshipNodes,
  calculateEmployeeTierPricing,
  resolveCompanyScaleTier,
  matchServiceFromStock,
} from '../utils/arnEngine.ts';
import { INITIAL_ARN_SERVICE_STOCK } from '../data/crmTemplates.ts';

describe('9. Motor ARN & Stock de Servicios (Escalas Micro, PyME, Grande + Ítem de Dotación de Empleados)', () => {
  it('debe mantener el Stock de Servicios ARN con 3 valores base en escala (Micro, PyME, Grande) y clasificar empresas por dotación', () => {
    assert.ok(INITIAL_ARN_SERVICE_STOCK.length >= 6);
    for (const item of INITIAL_ARN_SERVICE_STOCK) {
      assert.ok(item.code.startsWith('ARN-STK-'));
      assert.ok(item.scales.micro.baseImplementationPrice > 0);
      assert.ok(item.scales.pyme.baseImplementationPrice > item.scales.micro.baseImplementationPrice);
      assert.ok(item.scales.grande.baseImplementationPrice > item.scales.pyme.baseImplementationPrice);
      assert.ok(item.deliverables.length >= 3);
      assert.ok(item.valueProposition.length > 20);
    }

    assert.equal(resolveCompanyScaleTier(5), 'micro');
    assert.equal(resolveCompanyScaleTier(10), 'micro');
    assert.equal(resolveCompanyScaleTier(15), 'pyme');
    assert.equal(resolveCompanyScaleTier(50), 'pyme');
    assert.equal(resolveCompanyScaleTier(60), 'grande');
  });

  it('debe extraer cliente, empresa, email, servicio del stock, escala y dotación desde una instrucción natural sin formularios', () => {
    const parsed = parseNaturalArnCommand(
      'Hablé con Valeria de Bodega Austral, correo valeria@bodegaaustral.com, somos 10 empleados y necesitan Odoo v18 ERP e inventario por USD 5400, armar propuesta 40/40/20',
      undefined,
      undefined,
      INITIAL_ARN_SERVICE_STOCK
    );
    assert.equal(parsed.clientName, 'Valeria');
    assert.equal(parsed.clientEmail, 'valeria@bodegaaustral.com');
    assert.equal(parsed.companyName, 'Bodega Austral');
    assert.equal(parsed.serviceCategory, 'odoo_erp');
    assert.equal(parsed.stockServiceCode, 'ARN-STK-01');
    assert.equal(parsed.employeeCount, 10);
    assert.equal(parsed.companyScale, 'micro');
    assert.equal(parsed.estimatedValue, 5400);
    assert.equal(parsed.currency, 'USD');
    assert.equal(parsed.shouldGenerateQuote, true);
    assert.ok(parsed.monthlySupportFee >= 250);
    assert.ok(parsed.valueProposition.length > 20);
  });

  it('debe consultar el Stock de Servicios ARN en escalas Micro (5 y 10 emp.), PyME (15 y 25 emp.) y Grande (60 emp.), permitiendo controlar valores', () => {
    const micro5 = calculateEmployeeTierPricing({
      employeeCount: 5,
      serviceCategory: 'odoo_erp',
      currency: 'USD',
      serviceStock: INITIAL_ARN_SERVICE_STOCK,
    });
    const micro10 = calculateEmployeeTierPricing({
      employeeCount: 10,
      serviceCategory: 'odoo_erp',
      currency: 'USD',
      serviceStock: INITIAL_ARN_SERVICE_STOCK,
    });
    const pyme15 = calculateEmployeeTierPricing({
      employeeCount: 15,
      serviceCategory: 'odoo_erp',
      currency: 'USD',
      serviceStock: INITIAL_ARN_SERVICE_STOCK,
    });
    const pyme25 = calculateEmployeeTierPricing({
      employeeCount: 25,
      serviceCategory: 'odoo_erp',
      currency: 'USD',
      serviceStock: INITIAL_ARN_SERVICE_STOCK,
    });
    const grande60 = calculateEmployeeTierPricing({
      employeeCount: 60,
      serviceCategory: 'odoo_erp',
      currency: 'USD',
      serviceStock: INITIAL_ARN_SERVICE_STOCK,
    });

    // Escala Micro: 5 empleados incluidos en base (USD 2500), a 10 empleados suma +1 tramo de 5
    assert.equal(micro5.companyScale, 'micro');
    assert.equal(micro5.baseImplementationCost, 2500);
    assert.equal(micro5.scaleIncrementCost, 0);
    assert.equal(micro5.totalImplementationCost, 2500);

    assert.equal(micro10.companyScale, 'micro');
    assert.ok(micro10.scaleIncrementCost > 0);
    assert.equal(micro10.totalImplementationCost, micro10.baseImplementationCost + micro10.scaleIncrementCost);

    // Escala PyME: 15 empleados incluidos en base PyME (USD 4200), a 25 empleados suma +2 tramos de 5
    assert.equal(pyme15.companyScale, 'pyme');
    assert.equal(pyme15.baseImplementationCost, 4200);
    assert.equal(pyme15.scaleIncrementCost, 0);

    assert.equal(pyme25.companyScale, 'pyme');
    assert.equal(pyme25.baseImplementationCost, 4200);
    assert.equal(pyme25.extraBlocksOf5, 2);
    assert.ok(pyme25.scaleIncrementCost > 0);

    // Escala Grande: +50 empleados (base USD 7800 con 50 incluidos; a 60 suma +2 tramos)
    assert.equal(grande60.companyScale, 'grande');
    assert.equal(grande60.baseImplementationCost, 7800);
    assert.equal(grande60.extraBlocksOf5, 2);

    // Control de valores del Stock: si el administrador ajusta el valor base Micro a USD 3100, el motor ARN refleja el cambio
    const customStock = INITIAL_ARN_SERVICE_STOCK.map((s) =>
      s.code === 'ARN-STK-01'
        ? {
            ...s,
            scales: {
              ...s.scales,
              micro: { ...s.scales.micro, baseImplementationPrice: 3100 },
            },
          }
        : s
    );
    const customMicro5 = calculateEmployeeTierPricing({
      employeeCount: 5,
      serviceCategory: 'odoo_erp',
      currency: 'USD',
      serviceStock: customStock,
    });
    assert.equal(customMicro5.baseImplementationCost, 3100);
    assert.equal(customMicro5.totalImplementationCost, 3100);
  });

  it('debe generar una cotización formal 40/40/20 consultando el Stock e incluyendo como 2do ítem explícito la cantidad de empleados que determina el tamaño', () => {
    const matched = matchServiceFromStock({
      serviceCategory: 'odoo_erp',
      serviceStock: INITIAL_ARN_SERVICE_STOCK,
    });
    assert.equal(matched.code, 'ARN-STK-01');

    const quote = buildAutonomous404020Quote({
      opportunityId: 'opp-test-arn',
      clientName: 'Valeria',
      clientEmail: 'valeria@bodegaaustral.com',
      companyName: 'Bodega Austral',
      serviceCategory: 'odoo_erp',
      title: 'Implementación Odoo v18 · Bodega Austral',
      employeeCount: 10,
      currency: 'USD',
      serviceStock: INITIAL_ARN_SERVICE_STOCK,
    });
    assert.equal(quote.employeeCount, 10);
    assert.equal(quote.companyScale, 'micro');
    assert.equal(quote.stockServiceCode, 'ARN-STK-01');
    assert.ok((quote.valueProposition || '').length > 20);
    assert.equal(quote.items.length, 2);
    assert.ok(quote.items[0].description.includes('[ARN-STK-01]'));
    assert.ok(quote.items[1].description.includes('Condición de Dotación Relevada: 10 Empleados'));
    assert.equal(quote.items[0].total + quote.items[1].total, quote.total);
    assert.equal(quote.milestones.length, 3);
    assert.equal(
      quote.milestones[0].amount + quote.milestones[1].amount + quote.milestones[2].amount,
      quote.total
    );
  });

  it('debe calcular nodos de relación ARN ordenados por impulso con condición de empleados y soporte mensual', () => {
    const nodes = computeArnRelationshipNodes({
      opportunities: INITIAL_CRM_OPPORTUNITIES,
      companies: INITIAL_CRM_COMPANIES,
      contacts: INITIAL_CRM_CONTACTS,
      quotes: INITIAL_CRM_QUOTES,
      projects: INITIAL_CLIENT_PROJECTS,
    });
    assert.ok(nodes.length > 0);
    assert.ok(nodes[0].momentumScore >= nodes[nodes.length - 1].momentumScore);
    assert.ok(nodes[0].autonomousAction.buttonLabel.length > 5);
    assert.ok((nodes[0].employeeCount || 0) >= 1);
    assert.ok((nodes[0].monthlySupportFee || 0) >= 250);
  });
});





