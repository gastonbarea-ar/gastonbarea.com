/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DigitalTwinSection } from './components/DigitalTwinSection';
import { ServicesBentoSection } from './components/ServicesBentoSection';
import { BioeconomyTechSection } from './components/BioeconomyTechSection';
import { AboutProfileSection } from './components/AboutProfileSection';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AiWebNavigatorDock } from './components/AiWebNavigatorDock';
import { ScheduleModal } from './components/ScheduleModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { ClientPortalModal } from './components/client/ClientPortalModal';
import { SITE_CONFIG } from './data/siteConfig';

export default function App() {
  const [selectedServiceForContact, setSelectedServiceForContact] = useState<string>('');
  const [customMessageForContact, setCustomMessageForContact] = useState<string>('');
  const [digitalTwinPrompt, setDigitalTwinPrompt] = useState<string>('');
  const [highlightedServiceCode, setHighlightedServiceCode] = useState<string>('');

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [scheduleContext, setScheduleContext] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState<boolean>(false);

  const handleNavigate = (href: string) => {
    const cleanId = href.replace(/^#/, '');
    const targetMap: Record<string, string> = {
      'diagnostico-ia': 'ia-services',
      'gemelo-digital': 'ia-services',
      'innovacion': 'servicios',
      'odoo': 'servicios',
      'ecommerce-b2b2c': 'servicios',
      'project-manager': 'trayectoria',
      'perfil': 'trayectoria',
      'casos': 'bioeconomia',
    };
    const finalId = targetMap[cleanId] || cleanId;
    const el = document.getElementById(finalId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToSolution = (
    sectionId: string,
    serviceCode?: string,
    promptContext?: string
  ) => {
    if (serviceCode) {
      setHighlightedServiceCode(serviceCode);
      const cardEl = document.getElementById(`service-card-${serviceCode}`);
      if (cardEl && sectionId === '#servicios') {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    if (promptContext) {
      setCustomMessageForContact(promptContext);
    }
    handleNavigate(sectionId);
  };

  useEffect(() => {
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
      `Hola Gastón, me contacto desde gastonbarea.com para evaluar la solución "${serviceName}". Buscamos coordinar una reunión técnica para relevar objetivos y alcances.`
    );
    handleNavigate('#contacto');
  };

  const handleAskDigitalTwin = (prompt: string) => {
    setDigitalTwinPrompt(prompt + ' [' + new Date().toLocaleTimeString() + ']');
    handleNavigate('#ia-services');
  };

  const handleSelectCase = (caseTitle: string) => {
    setSelectedServiceForContact('Proyectos de Base Tecnológica & Bioeconomía');
    setCustomMessageForContact(
      `Hola Gastón, revisé el caso de impacto "${caseTitle}" en tu plataforma y nuestra organización tiene un proyecto con desafíos similares.`
    );
    handleNavigate('#contacto');
  };

  const handleScheduleWithAiProposal = (proposalSummary: string, serviceTitle: string) => {
    const contextText = `[SÍNTESIS GENERADA CON LA IA DE LA WEB]\nProyecto: ${serviceTitle}\n${proposalSummary}`;
    setSelectedServiceForContact(serviceTitle || 'Proyectos de Base Tecnológica, IA Services & Bioeconomía');
    setCustomMessageForContact(contextText);
    openScheduleModal(contextText);
  };

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] flex flex-col font-sans selection:bg-[#291B64]/15 selection:text-[#291B64] antialiased pb-16">
      {/* 1. Apple Cupertino 3-Zone Top Bar */}
      <Header
        onScheduleClick={() => openScheduleModal()}
        onWhatsAppClick={handleOpenWhatsApp}
        onNavigate={handleNavigate}
        onAdminClick={() => setIsAdminOpen(true)}
        onClientPortalClick={() => setIsClientPortalOpen(true)}
      />

      <main className="flex-1">
        {/* 2. Apple Keynote YouTube Channel Stage + Integrated AI Solution Finder */}
        <Hero
          onExploreServices={() => handleNavigate('#servicios')}
          onScheduleClick={openScheduleModal}
          onWhatsAppClick={handleOpenWhatsApp}
          onDiagnosticoClick={() => handleNavigate('#ia-services')}
          onClientPortalClick={() => setIsClientPortalOpen(true)}
          onNavigateToSolution={handleNavigateToSolution}
        />

        {/* 3. Core Solutions Bento Grid (01-06: Tech, IA Services & Digital Twins, Bioeconomy, 14-Year PMO, Odoo/B2B2C, Linux/Docker) */}
        <ServicesBentoSection
          onSelectService={handleSelectService}
          onAskDigitalTwin={handleAskDigitalTwin}
          onScheduleClick={openScheduleModal}
          highlightedServiceCode={highlightedServiceCode}
        />

        {/* 4. IA Services & Interactive Project Structurer (#ia-services) */}
        <DigitalTwinSection
          onScheduleWithProposal={handleScheduleWithAiProposal}
          onWhatsAppWithProposal={handleOpenWhatsApp}
          onClientPortalClick={() => setIsClientPortalOpen(true)}
          onNavigateToSolution={handleNavigateToSolution}
          initialPrompt={digitalTwinPrompt.replace(/\s*\[[^\]]*\]$/, '')}
        />

        {/* 5. Bioeconomy + Productive Technology Convergence & Quantified Case Studies */}
        <BioeconomyTechSection
          onAskDigitalTwin={handleAskDigitalTwin}
          onSelectCase={handleSelectCase}
        />

        {/* 6. Professional Trajectory (30 Years Productive Tech / 14 Years Client Project Direction) */}
        <AboutProfileSection
          onScheduleClick={() => openScheduleModal()}
          onClientPortalClick={() => setIsClientPortalOpen(true)}
        />

        {/* 7. Technical & Bioeconomic Publications */}
        <BlogSection
          onScheduleClick={() => openScheduleModal()}
          onWhatsAppClick={handleOpenWhatsApp}
        />

        {/* 8. Direct Executive Contact & NDA Inquiry Form */}
        <ContactSection
          initialService={selectedServiceForContact}
          initialMessage={customMessageForContact}
          onWhatsAppClick={handleOpenWhatsApp}
          onScheduleClick={() => openScheduleModal()}
        />
      </main>

      {/* 9. Quiet Architectural Footer with Portal & CRM Access */}
      <Footer
        onWhatsAppClick={() => handleOpenWhatsApp()}
        onScheduleClick={() => openScheduleModal()}
        onAdminClick={() => setIsAdminOpen(true)}
        onClientPortalClick={() => setIsClientPortalOpen(true)}
      />

      {/* 10. Persistent Apple-Spotlight AI Solution Guide Dock */}
      <AiWebNavigatorDock
        onNavigateToSolution={handleNavigateToSolution}
        onScheduleClick={openScheduleModal}
      />

      {/* Interactive Modals: Google Meet Pro Scheduling, Client Portal & Backend CRM */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        proposalContext={scheduleContext}
        onNavigateToForm={() => {
          setIsScheduleOpen(false);
          handleNavigate('#contacto');
        }}
        onWhatsAppClick={handleOpenWhatsApp}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <ClientPortalModal
        isOpen={isClientPortalOpen}
        onClose={() => setIsClientPortalOpen(false)}
      />
    </div>
  );
}
