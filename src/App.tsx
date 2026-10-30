/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Header, PageSectionId } from './components/Header';
import { Hero } from './components/Hero';
import { HomeBlocksView } from './components/HomeBlocksView';
import { DigitalTwinSection } from './components/DigitalTwinSection';
import { ServicesBentoSection } from './components/ServicesBentoSection';
import { BioeconomyTechSection } from './components/BioeconomyTechSection';
import { ProjectsSection } from './components/ProjectsSection';
import { AboutProfileSection } from './components/AboutProfileSection';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AiWebNavigatorDock } from './components/AiWebNavigatorDock';
import { ScheduleModal } from './components/ScheduleModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { ClientPortalModal } from './components/client/ClientPortalModal';
import { SITE_CONFIG } from './data/siteConfig';
import {
  resolvePageFromHash,
  resolveServiceCodeFromHash,
} from './lib/domainLogic';

const PAGE_LABELS: Record<PageSectionId, string> = {
  inicio: 'Inicio · Gemelo Digital',
  servicios: 'Soluciones · Arquitectura & Verticales',
  'ia-services': 'Soluciones · IA Services & Estructurador',
  bioeconomia: 'Soluciones · Bioeconomía & Trazabilidad IoT',
  proyectos: 'Proyectos Realizados & En Producción',
  trayectoria: 'Experience (30 Años Tech · 14 PMO)',
  blog: 'Blog & Publicaciones',
  contacto: 'Contacto Ejecutivo & NDA',
  'portal-clientes': 'Portal Clientes · Seguimiento & Soporte SLA',
  admin: 'Panel de Control & CRM Operativo',
};

const PAGE_ORDER: PageSectionId[] = [
  'inicio',
  'servicios',
  'ia-services',
  'bioeconomia',
  'proyectos',
  'trayectoria',
  'blog',
  'contacto',
];

export default function App() {
  const [activePage, setActivePage] = useState<PageSectionId>('inicio');
  const [selectedServiceForContact, setSelectedServiceForContact] = useState<string>('');
  const [customMessageForContact, setCustomMessageForContact] = useState<string>('');
  const [digitalTwinPrompt, setDigitalTwinPrompt] = useState<string>('');
  const [highlightedServiceCode, setHighlightedServiceCode] = useState<string>('');

  // Schedule Modal state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [scheduleContext, setScheduleContext] = useState<string>('');

  const handleNavigatePage = (page: PageSectionId, serviceCode?: string) => {
    if (serviceCode) {
      setHighlightedServiceCode(serviceCode);
    }
    setActivePage(page);
    const urlHash =
      page === 'trayectoria'
        ? '#experience'
        : page === 'portal-clientes'
        ? '#portal'
        : `#${page}`;
    window.history.pushState(null, '', urlHash);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (serviceCode && page === 'servicios') {
      setTimeout(() => {
        const cardEl = document.getElementById(`service-card-${serviceCode}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  };

  const handleNavigate = (href: string) => {
    const clean = href.replace(/^#/, '');
    const targetPage = resolvePageFromHash(clean);
    const serviceCode = resolveServiceCodeFromHash(clean);
    handleNavigatePage(targetPage, serviceCode);
  };

  const handleNavigateToSolution = (
    sectionId: string,
    serviceCode?: string,
    promptContext?: string
  ) => {
    if (serviceCode) {
      setHighlightedServiceCode(serviceCode);
    }
    if (promptContext) {
      setCustomMessageForContact(promptContext);
    }
    const targetPage = resolvePageFromHash(sectionId);
    handleNavigatePage(targetPage, serviceCode);
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const page = resolvePageFromHash(hash);
        const code = resolveServiceCodeFromHash(hash);
        if (code) {
          setHighlightedServiceCode(code);
        }
        setActivePage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    handleNavigatePage('contacto');
  };

  const handleSelectProjectForContact = (projectTitle: string, solutionRef: string) => {
    setSelectedServiceForContact(solutionRef);
    setCustomMessageForContact(
      `Hola Gastón, estuve viendo en tu portfolio el proyecto "${projectTitle}" y nos interesa evaluar un desarrollo o arquitectura de características similares para nuestra organización.`
    );
    handleNavigatePage('contacto');
  };

  const handleAskDigitalTwin = (prompt: string) => {
    setDigitalTwinPrompt(prompt + ' [' + new Date().toLocaleTimeString() + ']');
    handleNavigatePage('ia-services');
  };

  const handleSelectCase = (caseTitle: string) => {
    setSelectedServiceForContact('Proyectos de Base Tecnológica & Bioeconomía');
    setCustomMessageForContact(
      `Hola Gastón, revisé el caso de impacto "${caseTitle}" en tu plataforma y nuestra organización tiene un proyecto con desafíos similares.`
    );
    handleNavigatePage('contacto');
  };

  const handleScheduleWithAiProposal = (proposalSummary: string, serviceTitle: string) => {
    const contextText = `[SÍNTESIS GENERADA CON LA IA DE LA WEB]\nProyecto: ${serviceTitle}\n${proposalSummary}`;
    setSelectedServiceForContact(
      serviceTitle || 'Proyectos de Base Tecnológica, IA Services & Bioeconomía'
    );
    setCustomMessageForContact(contextText);
    openScheduleModal(contextText);
  };

  const currentIndex = PAGE_ORDER.indexOf(activePage);
  const nextPage: PageSectionId =
    PAGE_ORDER[(currentIndex + 1) % PAGE_ORDER.length] || 'servicios';

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] flex flex-col font-sans selection:bg-[#291B64]/15 selection:text-[#291B64] antialiased pb-16">
      {/* 1. Full-Width Top Navigation Bar (Inicio | Soluciones ▾ | Proyectos | Experience | Blog | Contacto + Portal Clientes + Dashboard) */}
      <Header
        activePage={activePage}
        onScheduleClick={() => openScheduleModal()}
        onWhatsAppClick={handleOpenWhatsApp}
        onNavigate={handleNavigate}
        onAdminClick={() => handleNavigatePage('admin')}
        onClientPortalClick={() => handleNavigatePage('portal-clientes')}
      />

      <main className="flex-1">
        {activePage === 'inicio' ? (
          <>
            {/* HOME BLOCK 1 & 2: Full-Width YouTube Showreel Stage + Frameless AI Solution Finder */}
            <Hero
              onExploreServices={() => handleNavigatePage('servicios')}
              onScheduleClick={openScheduleModal}
              onWhatsAppClick={handleOpenWhatsApp}
              onDiagnosticoClick={() => handleNavigatePage('ia-services')}
              onClientPortalClick={() => handleNavigatePage('portal-clientes')}
              onNavigateToSolution={handleNavigateToSolution}
            />

            {/* HOME BLOCKS: Customized Architectural Blocks (Soluciones + IA Services + Proyectos + Experience + Blog + Contacto) */}
            <HomeBlocksView
              onNavigatePage={handleNavigatePage}
              onSelectService={handleSelectService}
              onAskDigitalTwin={handleAskDigitalTwin}
              onScheduleClick={openScheduleModal}
              onWhatsAppClick={handleOpenWhatsApp}
              onClientPortalClick={() => handleNavigatePage('portal-clientes')}
            />
          </>
        ) : activePage === 'portal-clientes' ? (
          <div className="pt-16">
            <ClientPortalModal onClose={() => handleNavigatePage('inicio')} />
          </div>
        ) : activePage === 'admin' ? (
          <div className="pt-16">
            <AdminDashboardModal onClose={() => handleNavigatePage('inicio')} />
          </div>
        ) : (
          <div className="pt-16">
            {/* Inner Page Sub-Header Bar (Return to Home + Section Switcher) */}
            <div className="w-full bg-white border-b border-black/[0.06] px-4 sm:px-8 lg:px-12 xl:px-16 py-3.5 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => handleNavigatePage('inicio')}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#291B64] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Inicio (Bloques)</span>
              </button>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
                <span>Sección activa:</span>
                <strong className="text-[#1D1D1F]">{PAGE_LABELS[activePage]}</strong>
              </div>
            </div>

            {/* Render Selected Dedicated Section Page */}
            {activePage === 'servicios' && (
              <ServicesBentoSection
                onSelectService={handleSelectService}
                onAskDigitalTwin={handleAskDigitalTwin}
                onScheduleClick={openScheduleModal}
                highlightedServiceCode={highlightedServiceCode}
              />
            )}

            {activePage === 'ia-services' && (
              <DigitalTwinSection
                onScheduleWithProposal={handleScheduleWithAiProposal}
                onWhatsAppWithProposal={handleOpenWhatsApp}
                onClientPortalClick={() => handleNavigatePage('portal-clientes')}
                onNavigateToSolution={handleNavigateToSolution}
                initialPrompt={digitalTwinPrompt.replace(/\s*\[[^\]]*\]$/, '')}
              />
            )}

            {activePage === 'bioeconomia' && (
              <BioeconomyTechSection
                onAskDigitalTwin={handleAskDigitalTwin}
                onSelectCase={handleSelectCase}
              />
            )}

            {activePage === 'proyectos' && (
              <ProjectsSection
                onSelectProjectForContact={handleSelectProjectForContact}
                onAskDigitalTwin={handleAskDigitalTwin}
                onScheduleClick={openScheduleModal}
                onClientPortalClick={() => handleNavigatePage('portal-clientes')}
              />
            )}

            {activePage === 'trayectoria' && (
              <AboutProfileSection
                onScheduleClick={() => openScheduleModal()}
                onClientPortalClick={() => handleNavigatePage('portal-clientes')}
              />
            )}

            {activePage === 'blog' && (
              <BlogSection
                onScheduleClick={() => openScheduleModal()}
                onWhatsAppClick={handleOpenWhatsApp}
              />
            )}

            {activePage === 'contacto' && (
              <ContactSection
                initialService={selectedServiceForContact}
                initialMessage={customMessageForContact}
                onWhatsAppClick={handleOpenWhatsApp}
                onScheduleClick={() => openScheduleModal()}
              />
            )}

            {/* Clean Bottom Page-to-Page Navigation Strip */}
            <div className="w-full bg-[#F6F6F9] px-4 sm:px-8 lg:px-12 xl:px-16 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => handleNavigatePage('inicio')}
                className="px-5 py-3 text-xs font-mono font-bold text-[#1D1D1F] bg-white hover:bg-black/[0.05] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Inicio por Bloques</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigatePage(nextPage)}
                className="px-6 py-3.5 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Siguiente Página: {PAGE_LABELS[nextPage]}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Quiet Architectural Footer with Multi-Page Links, Portal & CRM Access */}
      <Footer
        onNavigate={handleNavigate}
        onWhatsAppClick={() => handleOpenWhatsApp()}
        onScheduleClick={() => openScheduleModal()}
        onAdminClick={() => handleNavigatePage('admin')}
        onClientPortalClick={() => handleNavigatePage('portal-clientes')}
      />

      {/* Persistent AI Solution Guide Dock */}
      <AiWebNavigatorDock
        onNavigateToSolution={handleNavigateToSolution}
        onScheduleClick={openScheduleModal}
      />

      {/* Interactive Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        proposalContext={scheduleContext}
        onNavigateToForm={() => {
          setIsScheduleOpen(false);
          handleNavigatePage('contacto');
        }}
        onWhatsAppClick={handleOpenWhatsApp}
      />
    </div>
  );
}

