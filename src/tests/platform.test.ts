import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePageFromHash,
  resolveServiceCodeFromHash,
  matchWebSolution,
  generateRuleBasedProposal,
  maskEmail,
  extractYoutubeId,
  filterProjectsCatalog,
  validateContactForm,
  buildCustomSolutionBlueprint,
} from '../lib/domainLogic.ts';
import { PROJECTS_CATALOG } from '../data/projectsData.ts';
import { SITE_CONFIG } from '../data/siteConfig.ts';
import { INITIAL_BLOG_POSTS } from '../data/blogData.ts';
import {
  INITIAL_CRM_COMPANIES,
  INITIAL_CRM_CONTACTS,
  INITIAL_CRM_OPPORTUNITIES,
  INITIAL_CRM_QUOTES,
} from '../data/crmTemplates.ts';
import { INITIAL_CLIENT_PROJECTS, CLIENT_ACCOUNTS } from '../data/clientPortalData.ts';

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

describe('5. Utilidades de Seguridad, Validación y Video (maskEmail, extractYoutubeId, validateContactForm)', () => {
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
  it('debe mantener la configuración principal de GASTONBAREA.COM coherente', () => {
    assert.equal(SITE_CONFIG.domain, 'gastonbarea.com');
    assert.equal(SITE_CONFIG.presentationVideo.youtubeId, 'XVYUP8Pz-hE');
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
});


