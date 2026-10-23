/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ThreePillarsSection } from './components/ThreePillarsSection';
import { InteractiveDiagnosticSection } from './components/InteractiveDiagnosticSection';
import { TopologySection } from './components/TopologySection';
import { ServicesSection } from './components/ServicesSection';
import { EcommerceB2B2CSection } from './components/EcommerceB2B2CSection';
import { OdooSection } from './components/OdooSection';
import { TechSpecsSection } from './components/TechSpecsSection';
import { MethodologySection } from './components/MethodologySection';
import { CaseStudiesSection } from './components/CaseStudiesSection';
import { ArchitectureConfigurator } from './components/ArchitectureConfigurator';
import { SectorSolutionsSection } from './components/SectorSolutionsSection';
import { BlogSection } from './components/BlogSection';
import { AboutProfileSection } from './components/AboutProfileSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ScheduleModal } from './components/ScheduleModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { ClientPortalModal } from './components/client/ClientPortalModal';
import { WorkspaceHubNav, WorkspaceTab } from './components/WorkspaceHubNav';
import { SITE_CONFIG } from './data/siteConfig';

export default function App() {
  const [selectedServiceForContact, setSelectedServiceForContact] = useState<string>('');
  const [customMessageForContact, setCustomMessageForContact] = useState<string>('');
  
  // State for dynamic workspace hub (Option 1: Zero Scroll Fatigue)
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceTab>('solutions');

  // State for Calendly / Cal.com scheduling modal
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [scheduleContext, setScheduleContext] = useState<string>('');

  // State for Admin Dashboard Modal (Backend Control Panel)
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // State for Client Portal Modal (Project Status, Inquiries, SLA Support & Bookings)
  const [isClientPortalOpen, setIsClientPortalOpen] = useState<boolean>(false);

  // Smart Navigation Handler: switches workspace and scrolls to target element
  const handleNavigate = (href: string) => {
    const cleanId = href.replace(/^#/, '');

    // Auto-switch workspace tab if needed
    if (['soluciones-sectoriales', 'sectores', 'ecommerce-b2b2c', 'ecommerce-b2b2c-card', 'odoo', 'servicios'].includes(cleanId)) {
      if (activeWorkspace !== 'all') setActiveWorkspace('solutions');
    } else if (['innovacion', 'tres-pilares', 'diagnostico-ia', 'topologia', 'tech-specs', 'configurador'].includes(cleanId)) {
      if (activeWorkspace !== 'all') setActiveWorkspace('engineering');
    } else if (['project-manager', 'proyectos', 'casos', 'metodologia', 'perfil'].includes(cleanId)) {
      if (activeWorkspace !== 'all') setActiveWorkspace('cases');
    } else if (['blog'].includes(cleanId)) {
      if (activeWorkspace !== 'all') setActiveWorkspace('blog');
    } else if (['contacto'].includes(cleanId)) {
      if (activeWorkspace !== 'all') setActiveWorkspace('contact');
    }

    setTimeout(() => {
      const el = document.getElementById(cleanId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        const hub = document.getElementById('workspace-hub');
        if (hub) hub.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  // Check URL hash for direct admin, CRM or client portal access (#admin, #crm, #portal, #cliente)
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || hash === '#crm') {
        setIsAdminOpen(true);
      } else if (hash === '#portal' || hash === '#cliente' || hash === '#clientes') {
        setIsClientPortalOpen(true);
      } else if (hash) {
        handleNavigate(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const scrollToSection = (sectionId: string) => {
    handleNavigate(`#${sectionId}`);
  };

  const openScheduleModal = (context?: string) => {
    setScheduleContext(context || '');
    setIsScheduleOpen(true);
  };

  const handleOpenWhatsApp = (customText?: string) => {
    const defaultText = SITE_CONFIG.whatsapp.defaultMessage;
    const textToSend = customText || defaultText;
    const phone = SITE_CONFIG.whatsapp.phoneNumber;
    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(textToSend)}`
      : `https://wa.me/?text=${encodeURIComponent(textToSend)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSelectService = (serviceName: string) => {
    setSelectedServiceForContact(serviceName);
    setCustomMessageForContact(
      `Hola Gastón, me pongo en contacto para consultar sobre el servicio "${serviceName}". Buscamos evaluar los alcances para nuestra organización.`
    );
    scrollToSection('contacto');
  };

  const handleRequestEmergencyAudit = () => {
    setSelectedServiceForContact('Auditoría Crítica & Contingencia');
    setCustomMessageForContact(
      'DIAGNÓSTICO CRÍTICO DE EMERGENCIA: Tenemos una infraestructura con caídas recurrentes / lentitud extrema y necesitamos un diagnóstico y plan de acción inmediato.'
    );
    scrollToSection('contacto');
  };

  const handleSelectSector = (sectorTitle: string) => {
    setSelectedServiceForContact('Consultoría en Innovación de Negocios & Arquitectura');
    setCustomMessageForContact(
      `Hola Gastón, nos interesa una solución enfocada en "${sectorTitle}". Queremos coordinar una reunión técnica para relevar necesidades.`
    );
    scrollToSection('contacto');
  };

  const handleSimilarCaseClick = (caseTitle: string) => {
    setSelectedServiceForContact('Consultoría en Innovación de Negocios & Arquitectura');
    setCustomMessageForContact(
      `Hola Gastón, leí el caso de estudio "${caseTitle}" en tu sitio web y nuestra organización tiene un desafío estratégico y técnico muy similar.`
    );
    scrollToSection('contacto');
  };

  const handleSendScopeFromConfigurator = (scopeData: {
    objective: string;
    startingPoint: string;
    timeline: string;
    recommendedStack: string[];
    summary: string;
  }) => {
    const detail = `[ESPECIFICACIÓN CALCULADA DESDE CONFIGURADOR]
Objetivo: ${scopeData.objective}
Punto de partida: ${scopeData.startingPoint}
Plazo estimado: ${scopeData.timeline}
Stack aconsejado: ${scopeData.recommendedStack.join(', ')}
Detalle: ${scopeData.summary}
Quisiéramos coordinar una llamada de diagnóstico técnico para evaluar la viabilidad y presupuesto.`;

    setSelectedServiceForContact('Consultoría en Innovación de Negocios & Arquitectura');
    setCustomMessageForContact(detail);
    scrollToSection('contacto');
  };

  const handleScheduleWithAiProposal = (proposalSummary: string, serviceTitle: string) => {
    const contextText = `[PROPUESTA GENERADA CON EL MOTOR DE IA]\nServicio: ${serviceTitle}\n${proposalSummary}`;
    setSelectedServiceForContact(serviceTitle || 'Consultoría en Innovación de Negocios & Arquitectura');
    setCustomMessageForContact(contextText);
    openScheduleModal(contextText);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-[#0f2442] flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-950 antialiased">
      {/* Top Navigation with Social & Schedule Modal Trigger */}
      <Header
        onScheduleClick={() => openScheduleModal()}
        onWhatsAppClick={handleOpenWhatsApp}
        onNavigate={handleNavigate}
        onAdminClick={() => setIsAdminOpen(true)}
        onClientPortalClick={() => setIsClientPortalOpen(true)}
      />

      <main className="flex-1">
        {/* 1. Hero Section & Identity Badge (Fluid motion, ambient video, menu & Wall Street live stock ticker) */}
        <Hero
          onExploreServices={() => handleNavigate('#servicios')}
          onScheduleClick={() => openScheduleModal()}
          onWhatsAppClick={() => handleOpenWhatsApp()}
          onDiagnosticoClick={() => handleNavigate('#diagnostico-ia')}
          onExplorePillars={() => handleNavigate('#innovacion')}
          onClientPortalClick={() => setIsClientPortalOpen(true)}
        />

        {/* 2. DYNAMIC WORKSPACE HUB (Opción 1: Selector de Espacios de Trabajo sin fatiga de scroll) */}
        <WorkspaceHubNav
          activeTab={activeWorkspace}
          onTabChange={(tab) => {
            setActiveWorkspace(tab);
            const hub = document.getElementById('workspace-hub');
            if (hub) hub.scrollIntoView({ behavior: 'smooth' });
          }}
          onSubSectionClick={(id) => {
            const el = document.getElementById(id);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* WORKSPACE VIEW 1: SOLUCIONES & NEGOCIO */}
        {(activeWorkspace === 'solutions' || activeWorkspace === 'all') && (
          <div className="space-y-0 animate-in fade-in duration-300">
            {/* Propuesta de Valor Sectorial */}
            <SectorSolutionsSection onSectorSelect={handleSelectSector} />

            {/* Capa de E-Commerce B2B2C & Omnicanalidad Empresarial */}
            <EcommerceB2B2CSection
              onScheduleClick={(topic) => openScheduleModal(topic || 'Capa de E-Commerce B2B2C')}
              onWhatsAppClick={handleOpenWhatsApp}
              onSelectService={handleSelectService}
            />

            {/* Soluciones Especializadas: Odoo Community ERP (Implementación & Migración) */}
            <OdooSection
              onScheduleClick={() => openScheduleModal('Implementación / Migración a Odoo Community')}
              onWhatsAppClick={handleOpenWhatsApp}
            />

            {/* Capacidades y Servicios (01 - 04) + Protocolo de Confidencialidad & Auditoría */}
            <ServicesSection
              onSelectService={handleSelectService}
              onRequestAudit={handleRequestEmergencyAudit}
            />
          </div>
        )}

        {/* WORKSPACE VIEW 2: INGENIERÍA & DIAGNÓSTICO */}
        {(activeWorkspace === 'engineering' || activeWorkspace === 'all') && (
          <div className="space-y-0 animate-in fade-in duration-300">
            {/* LOS 3 PILARES ESTRATÉGICOS: Innovación de Negocios, Negocios Inteligentes & Modern Stack */}
            <ThreePillarsSection
              onScheduleClick={openScheduleModal}
              onDiagnosticoClick={() => handleNavigate('#diagnostico-ia')}
            />

            {/* Motor Interactivo de Diagnóstico & Solución de Arquitectura con IA */}
            <InteractiveDiagnosticSection
              onScheduleWithProposal={handleScheduleWithAiProposal}
              onWhatsAppWithProposal={handleOpenWhatsApp}
            />

            {/* Topología de Sistemas Multicapa Linux & Docker */}
            <TopologySection />

            {/* Especificaciones Técnicas (Modern Stack + Filtro + Búsqueda) */}
            <TechSpecsSection
              onAuditStackClick={() => {
                setSelectedServiceForContact('Auditoría Crítica & Contingencia');
                setCustomMessageForContact(
                  'Hola Gastón, quisiera solicitar una auditoría técnica de nuestro stack tecnológico actual para detectar cuellos de botella y vulnerabilidades.'
                );
                handleNavigate('#contacto');
              }}
            />

            {/* Configurador Interactivo de Arquitectura & Tiempos */}
            <ArchitectureConfigurator
              onSendScopeToContact={handleSendScopeFromConfigurator}
              onWhatsAppWithScope={handleOpenWhatsApp}
            />
          </div>
        )}

        {/* WORKSPACE VIEW 3: TRAYECTORIA & CASOS */}
        {(activeWorkspace === 'cases' || activeWorkspace === 'all') && (
          <div className="space-y-0 animate-in fade-in duration-300">
            {/* Project Management, Arquitectura & Casos de Estudio */}
            <CaseStudiesSection
              onSimilarCaseClick={handleSimilarCaseClick}
              onScheduleClick={() => openScheduleModal('Project Management & Dirección Técnica')}
              onWhatsAppClick={handleOpenWhatsApp}
            />

            {/* Metodología de Ingeniería (4 Fases con Stepper) */}
            <MethodologySection />

            {/* Perfil Profesional & Trayectoria Gastón Barea */}
            <AboutProfileSection onScheduleClick={() => openScheduleModal()} />
          </div>
        )}

        {/* WORKSPACE VIEW 4: BLOG & MULTIMEDIA */}
        {(activeWorkspace === 'blog' || activeWorkspace === 'all') && (
          <div className="space-y-0 animate-in fade-in duration-300">
            {/* Blog Técnico Multimedia (Texto, YouTube, Spotify, Audio & Fotos) */}
            <BlogSection
              onScheduleClick={() => openScheduleModal()}
              onWhatsAppClick={handleOpenWhatsApp}
            />
          </div>
        )}

        {/* WORKSPACE VIEW 5: CONTACTO & ASESORÍA */}
        {(activeWorkspace === 'contact' || activeWorkspace === 'all') && (
          <div className="space-y-0 animate-in fade-in duration-300">
            {/* Contacto Directo, Formulario, Calendly & FAQs */}
            <ContactSection
              initialService={selectedServiceForContact}
              initialMessage={customMessageForContact}
              onWhatsAppClick={handleOpenWhatsApp}
              onScheduleClick={() => openScheduleModal()}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer 
        onWhatsAppClick={() => handleOpenWhatsApp()} 
        onScheduleClick={() => openScheduleModal()} 
        onAdminClick={() => setIsAdminOpen(true)}
        onClientPortalClick={() => setIsClientPortalOpen(true)}
      />

      {/* Interactive 30-min Technical Meeting Scheduling Modal (Calendly / Cal.com / WhatsApp) */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        proposalContext={scheduleContext}
        onNavigateToForm={() => scrollToSection('contacto')}
        onWhatsAppClick={handleOpenWhatsApp}
      />

      {/* Backend Central Administration Dashboard (Blog, Site Config, CRM & Leads) */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Client Portal Modal (Project Status, Inquiries, SLA Support, Consultations) */}
      <ClientPortalModal
        isOpen={isClientPortalOpen}
        onClose={() => setIsClientPortalOpen(false)}
      />
    </div>
  );
}
