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
} from '../lib/domainLogic.ts';
import { PROJECTS_CATALOG } from '../data/projectsData.ts';
import { SITE_CONFIG } from '../data/siteConfig.ts';
import { INITIAL_BLOG_POSTS } from '../data/blogData.ts';
import {
  INITIAL_CRM_OPPORTUNITIES,
  INITIAL_CRM_QUOTES,
} from '../data/crmTemplates.ts';
import { INITIAL_CLIENT_PROJECTS } from '../data/clientPortalData.ts';

describe('1. Enrutamiento y Navegación de Secciones (resolvePageFromHash & resolveServiceCodeFromHash)', () => {
  it('debe resolver correctamente las páginas principales del menú superior', () => {
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
});
