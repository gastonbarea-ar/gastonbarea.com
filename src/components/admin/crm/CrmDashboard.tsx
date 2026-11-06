import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  FileText,
  CreditCard,
  Users,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Mail,
  Printer,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Edit,
  Trash2,
  Building,
  Building2,
  UserPlus,
  KeyRound,
  User,
  Phone,
  Globe,
  Coins,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Layers,
} from 'lucide-react';
import {
  Opportunity,
  OpportunityStage,
  Quote,
  PaymentRecord,
  PaymentGatewayConfig,
  ServiceCategory,
  CrmCompany,
  CrmContact,
  ArnServiceStockItem,
} from '../../../types/crm';
import {
  DEFAULT_PAYMENT_CONFIG,
  INITIAL_CRM_OPPORTUNITIES,
  INITIAL_CRM_QUOTES,
  INITIAL_CRM_PAYMENTS,
  INITIAL_CRM_COMPANIES,
  INITIAL_CRM_CONTACTS,
  INITIAL_ARN_SERVICE_STOCK,
  DEFAULT_QUOTE_TEMPLATES,
} from '../../../data/crmTemplates';
import { OpportunityModal } from './OpportunityModal';
import { QuoteBuilderModal } from './QuoteBuilderModal';
import { QuotePreviewModal } from './QuotePreviewModal';
import { FastReplyModal } from './FastReplyModal';
import { PaymentConfigModal } from './PaymentConfigModal';
import { PaymentRecordModal } from './PaymentRecordModal';
import { ArnServiceStockManager } from './ArnServiceStockManager';
import {
  DEFAULT_BOOKING_AVAILABILITY,
  BookingAvailabilityConfig,
} from '../../../data/siteConfig';
import { computeArnRelationshipNodes } from '../../../utils/arnEngine';

interface CrmDashboardProps {
  passkey?: string;
  onClose?: () => void;
  initialTab?: 'kanban' | 'service_stock' | 'directory' | 'quotes' | 'payments' | 'leads' | 'whatsapp_automations';
  onTabChange?: (tab: 'kanban' | 'service_stock' | 'directory' | 'quotes' | 'payments' | 'leads' | 'whatsapp_automations') => void;
}

const STAGES: { id: OpportunityStage; label: string; color: string; border: string; bg: string }[] = [
  { id: 'lead', label: '1. Nuevo Prospecto', color: 'text-slate-700', border: 'border-slate-300', bg: 'bg-slate-100' },
  { id: 'contacted', label: '2. Contactado', color: 'text-blue-800', border: 'border-blue-300', bg: 'bg-blue-50' },
  { id: 'proposal_draft', label: '3. En Elaboración', color: 'text-indigo-800', border: 'border-indigo-300', bg: 'bg-indigo-50' },
  { id: 'proposal_sent', label: '4. Presupuesto Enviado', color: 'text-amber-800', border: 'border-amber-300', bg: 'bg-amber-50' },
  { id: 'negotiation', label: '5. Negociación', color: 'text-purple-800', border: 'border-purple-300', bg: 'bg-purple-50' },
  { id: 'won', label: '6. Ganado / Ejecución', color: 'text-emerald-800', border: 'border-emerald-300', bg: 'bg-emerald-50' },
  { id: 'lost', label: '7. Descartado', color: 'text-rose-800', border: 'border-rose-300', bg: 'bg-rose-50' },
];

const SERVICE_LABELS: Record<ServiceCategory, { label: string; badge: string }> = {
  odoo_erp: { label: 'Odoo v18 ERP', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  ecommerce_b2b2c: { label: 'E-Commerce B2B2C', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  software_architecture: { label: 'Arquitectura & Resiliencia', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  fractional_cto: { label: 'Fractional CTO', badge: 'bg-amber-100 text-amber-900 border-amber-200' },
  linux_docker: { label: 'Linux & Docker', badge: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  bi_analytics: { label: 'Business Intelligence', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  custom: { label: 'Consultoría Especial', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export const CrmDashboard: React.FC<CrmDashboardProps> = ({
  passkey = 'gaston2026',
  onClose,
  initialTab = 'kanban',
  onTabChange,
}) => {
  // Navigation tabs: 'kanban' | 'service_stock' | 'directory' | 'quotes' | 'payments' | 'leads' | 'whatsapp_automations'
  const [activeTab, setActiveTabState] = useState<
    'kanban' | 'service_stock' | 'directory' | 'quotes' | 'payments' | 'leads' | 'whatsapp_automations'
  >(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);

  const setActiveTab = (
    tab: 'kanban' | 'service_stock' | 'directory' | 'quotes' | 'payments' | 'leads' | 'whatsapp_automations'
  ) => {
    setActiveTabState(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Main data states
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_CRM_OPPORTUNITIES);
  const [companies, setCompanies] = useState<CrmCompany[]>(INITIAL_CRM_COMPANIES);
  const [contacts, setContacts] = useState<CrmContact[]>(INITIAL_CRM_CONTACTS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_CRM_QUOTES);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_CRM_PAYMENTS);
  const [serviceStock, setServiceStock] = useState<ArnServiceStockItem[]>(INITIAL_ARN_SERVICE_STOCK);
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig>(DEFAULT_PAYMENT_CONFIG);
  const [webLeads, setWebLeads] = useState<{ proposals: any[]; contactInquiries: any[] }>({
    proposals: [],
    contactInquiries: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Directory (Agenda Corporativa & Contactos Individuales) states
  const [directorySubView, setDirectorySubView] = useState<'companies' | 'contacts'>('companies');
  const [contactFilterType, setContactFilterType] = useState<'all' | 'corporate_member' | 'individual' | 'active_service' | 'registered_only'>('all');
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<CrmCompany | null>(null);
  const [compName, setCompName] = useState<string>('');
  const [compTaxId, setCompTaxId] = useState<string>('');
  const [compIndustry, setCompIndustry] = useState<string>('');
  const [compPhone, setCompPhone] = useState<string>('');
  const [compEmail, setCompEmail] = useState<string>('');
  const [compWebsite, setCompWebsite] = useState<string>('');
  const [compLocation, setCompLocation] = useState<string>('Argentina');
  const [compTier, setCompTier] = useState<CrmCompany['tier']>('pyme');
  const [compNotes, setCompNotes] = useState<string>('');

  const [isContactFormOpen, setIsContactFormOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<CrmContact | null>(null);
  const [cntFullName, setCntFullName] = useState<string>('');
  const [cntEmail, setCntEmail] = useState<string>('');
  const [cntUsername, setCntUsername] = useState<string>('');
  const [cntPassword, setCntPassword] = useState<string>('cliente2026');
  const [cntPhone, setCntPhone] = useState<string>('');
  const [cntRoleTitle, setCntRoleTitle] = useState<string>('');
  const [cntType, setCntType] = useState<'corporate_member' | 'individual'>('corporate_member');
  const [cntCompanyId, setCntCompanyId] = useState<string>('');
  const [cntHasActiveService, setCntHasActiveService] = useState<boolean>(false);
  const [cntNotes, setCntNotes] = useState<string>('');

  // Modal control states
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [targetOppStage, setTargetOppStage] = useState<OpportunityStage>('lead');

  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [quoteOpportunityContext, setQuoteOpportunityContext] = useState<any | null>(null);

  const [isQuotePreviewOpen, setIsQuotePreviewOpen] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);

  const [isFastReplyOpen, setIsFastReplyOpen] = useState(false);
  const [fastReplyQuote, setFastReplyQuote] = useState<Quote | null>(null);

  const [isPaymentConfigOpen, setIsPaymentConfigOpen] = useState(false);
  const [isPaymentRecordOpen, setIsPaymentRecordOpen] = useState(false);
  const [paymentRecordQuoteId, setPaymentRecordQuoteId] = useState<string | undefined>(undefined);

  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // WhatsApp Business & CRM Automations State
  const [waConfig, setWaConfig] = useState<any>({
    enabled: true,
    provider: 'evolution_api',
    businessPhone: '5492804000000',
    adminNotifyPhone: '5492804000000',
    metaPhoneNumberId: '',
    metaAccessToken: '',
    metaBusinessAccountId: '',
    metaVerifyToken: 'gastonbarea_wa_verify_2026',
    evolutionApiUrl: 'http://138.219.41.106:8080',
    evolutionInstanceName: 'gastonbarea',
    evolutionApiKey: '',
    webhookUrl: '',
    autoNotifyOnLead: true,
    autoNotifyOnQuote: true,
    autoNotifyOnKickoff: true,
  });
  const [waStatus, setWaStatus] = useState<any>(null);
  const [waTestPhone, setWaTestPhone] = useState<string>('');
  const [waTestMessage, setWaTestMessage] = useState<string>(
    '✅ Prueba WhatsApp Business · gastonbarea.com (CRM & Automatización Ejecutiva Operativa).'
  );
  const [isSavingWa, setIsSavingWa] = useState<boolean>(false);
  const [isSendingWaTest, setIsSendingWaTest] = useState<boolean>(false);
  const [waFeedback, setWaFeedback] = useState<{ ok: boolean; msg: string; waUrl?: string } | null>(null);

  // Booking & Calendar Availability Configurator State (notificaciones@gastonbarea.com)
  const [bookingAvailability, setBookingAvailability] = useState<BookingAvailabilityConfig>(
    DEFAULT_BOOKING_AVAILABILITY
  );
  const [occupiedSlotsByDate, setOccupiedSlotsByDate] = useState<Record<string, string[]>>({});
  const [newBlockedDateInput, setNewBlockedDateInput] = useState<string>('');
  const [isSavingAvailability, setIsSavingAvailability] = useState<boolean>(false);
  const [availabilityFeedback, setAvailabilityFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // ARN (Automated Relationship Network) Zero-Form Copiloto & Autonomous Radar State
  const [arnCommandInput, setArnCommandInput] = useState<string>('');
  const [isExecutingArnCommand, setIsExecutingArnCommand] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [isExecutingAutopilotId, setIsExecutingAutopilotId] = useState<string | null>(null);
  const [arnViewMode, setArnViewMode] = useState<'radar' | 'kanban'>('radar');
  const [arnExecutionLog, setArnExecutionLog] = useState<{
    actionsExecuted: string[];
    quote?: Quote | null;
    opportunity?: Opportunity | null;
  } | null>(null);

  // Load CRM data from backend
  const loadCrmData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/crm/overview', {
        headers: { 'x-admin-passkey': passkey },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (json.data.opportunities) setOpportunities(json.data.opportunities);
          if (json.data.companies) setCompanies(json.data.companies);
          if (json.data.contacts) setContacts(json.data.contacts);
          if (json.data.quotes) setQuotes(json.data.quotes);
          if (json.data.payments) setPayments(json.data.payments);
          if (json.data.paymentConfig) setPaymentConfig(json.data.paymentConfig);
          if (Array.isArray(json.data.serviceStock) && json.data.serviceStock.length > 0) {
            setServiceStock(json.data.serviceStock);
          }
        }
      }

      // Also load leads
      const leadsRes = await fetch('/api/admin/leads', {
        headers: { 'x-admin-passkey': passkey },
      });
      if (leadsRes.ok) {
        const leadsJson = await leadsRes.json();
        setWebLeads({
          proposals: leadsJson.proposals || [],
          contactInquiries: leadsJson.contactInquiries || [],
        });
      }

      // Load WhatsApp Business Config
      const waRes = await fetch('/api/admin/whatsapp/config', {
        headers: { 'x-admin-passkey': passkey },
      });
      if (waRes.ok) {
        const waJson = await waRes.json();
        if (waJson.config) setWaConfig((prev: any) => ({ ...prev, ...waJson.config }));
        if (waJson.status) setWaStatus(waJson.status);
      }

      // Load Booking Availability & Occupied Slots
      const availRes = await fetch('/api/bookings/availability');
      if (availRes.ok) {
        const availJson = await availRes.json();
        if (availJson.config) setBookingAvailability(availJson.config);
        if (availJson.occupiedSlotsByDate) setOccupiedSlotsByDate(availJson.occupiedSlotsByDate);
      }
    } catch (err) {
      console.warn('Using local fallback for CRM data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBookingAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAvailability(true);
    setAvailabilityFeedback(null);
    try {
      const res = await fetch('/api/admin/bookings/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ config: bookingAvailability }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.config) setBookingAvailability(data.config);
        if (data.occupiedSlotsByDate) setOccupiedSlotsByDate(data.occupiedSlotsByDate);
        setAvailabilityFeedback({
          ok: true,
          msg: `¡Disponibilidad de Agenda y correo organizador (${
            data.config?.notificationEmail || 'notificaciones@gastonbarea.com'
          }) actualizados!`,
        });
      } else {
        setAvailabilityFeedback({
          ok: false,
          msg: data.error || 'Error al actualizar la disponibilidad.',
        });
      }
    } catch (err: any) {
      setAvailabilityFeedback({
        ok: false,
        msg: err?.message || 'Error de red al guardar disponibilidad.',
      });
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const handleToggleWeekday = (dayNumber: number) => {
    setBookingAvailability((prev) => {
      const exists = prev.enabledWeekdays.includes(dayNumber);
      const next = exists
        ? prev.enabledWeekdays.filter((d) => d !== dayNumber)
        : [...prev.enabledWeekdays, dayNumber].sort();
      return {
        ...prev,
        enabledWeekdays: next.length > 0 ? next : [1],
      };
    });
  };

  const handleToggleSlot = (slotValue: string) => {
    setBookingAvailability((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.value === slotValue ? { ...s, enabled: !s.enabled } : s)),
    }));
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDateInput) return;
    setBookingAvailability((prev) => {
      if (prev.blockedDates.includes(newBlockedDateInput)) return prev;
      return {
        ...prev,
        blockedDates: [...prev.blockedDates, newBlockedDateInput].sort(),
      };
    });
    setNewBlockedDateInput('');
  };

  const handleRemoveBlockedDate = (isoDate: string) => {
    setBookingAvailability((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((d) => d !== isoDate),
    }));
  };

  const handleSaveWhatsAppConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWa(true);
    setWaFeedback(null);
    try {
      const res = await fetch('/api/admin/whatsapp/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ config: waConfig }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaStatus(data.status);
        setWaFeedback({
          ok: true,
          msg: '¡Configuración de WhatsApp Business guardada y sincronizada en Supabase!',
        });
      }
    } catch (err: any) {
      setWaFeedback({ ok: false, msg: err?.message || 'Error al guardar configuración.' });
    } finally {
      setIsSavingWa(false);
    }
  };

  const handleSendWhatsAppTest = async () => {
    setIsSendingWaTest(true);
    setWaFeedback(null);
    try {
      const res = await fetch('/api/admin/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({
          toPhone: waTestPhone || waConfig.adminNotifyPhone || waConfig.businessPhone,
          message: waTestMessage,
          contextType: 'test_message',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWaFeedback({
          ok: true,
          msg: `¡Mensaje enviado con éxito vía ${data.provider} al +${data.toPhone}!`,
        });
      } else {
        setWaFeedback({
          ok: false,
          msg: data.error || 'Credenciales API pendientes. Podés probar el enlace directo abajo.',
          waUrl: data.waMeFallbackUrl,
        });
      }
    } catch (err: any) {
      setWaFeedback({ ok: false, msg: err?.message || 'Error de red.' });
    } finally {
      setIsSendingWaTest(false);
    }
  };

  useEffect(() => {
    loadCrmData();
  }, []);

  // Filtered opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.company && opp.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || opp.serviceCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate high-level pipeline metrics
  const activeOpps = opportunities.filter((o) => o.stage !== 'won' && o.stage !== 'lost');
  const pipelineValueUsd = activeOpps
    .filter((o) => o.currency === 'USD')
    .reduce((sum, o) => sum + (o.value || 0), 0);
  const pipelineValueArs = activeOpps
    .filter((o) => o.currency === 'ARS')
    .reduce((sum, o) => sum + (o.value || 0), 0);

  const wonOpps = opportunities.filter((o) => o.stage === 'won');
  const wonValueUsd = wonOpps
    .filter((o) => o.currency === 'USD')
    .reduce((sum, o) => sum + (o.value || 0), 0);

  const totalCollectedUsd = payments
    .filter((p) => p.status === 'confirmed' && p.currency === 'USD')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Opportunity Handlers
  const handleSaveOpportunity = async (opp: Opportunity) => {
    const isNew = !opportunities.some((o) => o.id === opp.id);
    const updatedList = isNew
      ? [opp, ...opportunities]
      : opportunities.map((o) => (o.id === opp.id ? opp : o));
    setOpportunities(updatedList);

    try {
      const res = await fetch(isNew ? '/api/crm/opportunities' : `/api/crm/opportunities/${opp.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(opp),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.companies) setCompanies(json.companies);
        if (json.contacts) setContacts(json.contacts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Company & Contact Agenda Handlers
  const handleOpenNewCompanyForm = (companyToEdit?: CrmCompany) => {
    if (companyToEdit) {
      setEditingCompany(companyToEdit);
      setCompName(companyToEdit.name);
      setCompTaxId(companyToEdit.taxId || '');
      setCompIndustry(companyToEdit.industry || '');
      setCompPhone(companyToEdit.phone || '');
      setCompEmail(companyToEdit.email || '');
      setCompWebsite(companyToEdit.website || '');
      setCompLocation(companyToEdit.location || 'Argentina');
      setCompTier(companyToEdit.tier);
      setCompNotes(companyToEdit.notes || '');
    } else {
      setEditingCompany(null);
      setCompName('');
      setCompTaxId('');
      setCompIndustry('');
      setCompPhone('');
      setCompEmail('');
      setCompWebsite('');
      setCompLocation('Argentina');
      setCompTier('pyme');
      setCompNotes('');
    }
    setIsCompanyFormOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;

    const payload: CrmCompany = {
      id: editingCompany?.id || `cmp-${Date.now()}`,
      name: compName.trim(),
      taxId: compTaxId.trim(),
      industry: compIndustry.trim() || 'Tecnología & Operaciones',
      phone: compPhone.trim(),
      email: compEmail.trim(),
      website: compWebsite.trim(),
      location: compLocation.trim() || 'Argentina',
      tier: compTier,
      notes: compNotes.trim(),
      createdAt: editingCompany?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const isNew = !editingCompany;
    if (isNew) {
      setCompanies([payload, ...companies]);
    } else {
      setCompanies(companies.map((c) => (c.id === payload.id ? payload : c)));
      setContacts(
        contacts.map((cnt) =>
          cnt.companyId === payload.id ? { ...cnt, companyName: payload.name } : cnt
        )
      );
    }

    try {
      await fetch(isNew ? '/api/crm/companies' : `/api/crm/companies/${payload.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Error saving company:', err);
    }

    setIsCompanyFormOpen(false);
    setEditingCompany(null);
    setCopiedNotification(
      isNew
        ? `Corporación "${payload.name}" registrada en la Agenda CRM.`
        : `Corporación "${payload.name}" actualizada.`
    );
    setTimeout(() => setCopiedNotification(null), 3500);
  };

  const handleDeleteCompany = async (id: string) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      setCopiedNotification('Hacé clic nuevamente en Eliminar para confirmar la baja de la corporación.');
      setTimeout(() => setPendingDeleteId((prev) => (prev === id ? null : prev)), 4000);
      return;
    }
    setPendingDeleteId(null);
    setCompanies(companies.filter((c) => c.id !== id));
    setContacts(
      contacts.map((cnt) =>
        cnt.companyId === id ? { ...cnt, companyId: undefined, contactType: 'individual' } : cnt
      )
    );
    try {
      await fetch(`/api/crm/companies/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenNewContactForm = (preselectedCompanyId?: string, contactToEdit?: CrmContact) => {
    if (contactToEdit) {
      setEditingContact(contactToEdit);
      setCntFullName(contactToEdit.fullName);
      setCntEmail(contactToEdit.email);
      setCntUsername(contactToEdit.username);
      setCntPassword(contactToEdit.password || 'cliente2026');
      setCntPhone(contactToEdit.phone || '');
      setCntRoleTitle(contactToEdit.roleTitle);
      setCntType(contactToEdit.contactType);
      setCntCompanyId(contactToEdit.companyId || '');
      setCntHasActiveService(contactToEdit.hasActiveService);
      setCntNotes(contactToEdit.notes || '');
    } else {
      setEditingContact(null);
      setCntFullName('');
      setCntEmail('');
      setCntUsername('');
      setCntPassword('cliente2026');
      setCntPhone('');
      setCntRoleTitle(preselectedCompanyId ? 'Representante Corporativo' : 'Consultor / Contacto Individual');
      setCntType(preselectedCompanyId ? 'corporate_member' : 'individual');
      setCntCompanyId(preselectedCompanyId || '');
      setCntHasActiveService(false);
      setCntNotes('');
    }
    setIsContactFormOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cntFullName.trim() || !cntEmail.trim()) return;

    const cleanEmail = cntEmail.trim().toLowerCase();
    const cleanUsername =
      (cntUsername.trim() || cleanEmail.split('@')[0]).toLowerCase().replace(/[^a-z0-9._-]/g, '') ||
      `usuario.${Date.now().toString().slice(-4)}`;

    const parentComp =
      cntType === 'corporate_member' && cntCompanyId
        ? companies.find((c) => c.id === cntCompanyId)
        : undefined;

    const payload: CrmContact = {
      id: editingContact?.id || `cnt-${Date.now()}`,
      fullName: cntFullName.trim(),
      email: cleanEmail,
      username: cleanUsername,
      password: cntPassword.trim() || 'cliente2026',
      phone: cntPhone.trim(),
      roleTitle:
        cntRoleTitle.trim() ||
        (parentComp ? 'Miembro de Corporación' : 'Contacto Individual'),
      contactType: parentComp ? 'corporate_member' : 'individual',
      companyId: parentComp ? parentComp.id : undefined,
      companyName: parentComp ? parentComp.name : undefined,
      portalAccessStatus: 'active',
      hasActiveService: cntHasActiveService,
      linkedProjectId: editingContact?.linkedProjectId,
      notes: cntNotes.trim(),
      createdAt: editingContact?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const isNew = !editingContact;
    if (isNew) {
      setContacts([payload, ...contacts]);
    } else {
      setContacts(contacts.map((c) => (c.id === payload.id ? payload : c)));
    }

    try {
      await fetch(isNew ? '/api/crm/contacts' : `/api/crm/contacts/${payload.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Error saving contact:', err);
    }

    setIsContactFormOpen(false);
    setEditingContact(null);
    setCopiedNotification(
      isNew
        ? `Contacto "${payload.fullName}" agendado y habilitado como usuario del Portal Clientes (Usuario: ${payload.username}).`
        : `Contacto "${payload.fullName}" actualizado.`
    );
    setTimeout(() => setCopiedNotification(null), 4000);
  };

  const handleDeleteContact = async (id: string) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      setCopiedNotification('Hacé clic nuevamente en Eliminar para confirmar la baja del contacto.');
      setTimeout(() => setPendingDeleteId((prev) => (prev === id ? null : prev)), 4000);
      return;
    }
    setPendingDeleteId(null);
    setContacts(contacts.filter((c) => c.id !== id));
    try {
      await fetch(`/api/crm/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStageChange = async (oppId: string, newStage: OpportunityStage) => {
    const updated = opportunities.map((o) => {
      if (o.id === oppId) {
        return {
          ...o,
          stage: newStage,
          probability: newStage === 'won' ? 100 : newStage === 'lost' ? 0 : o.probability,
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    setOpportunities(updated);

    try {
      await fetch(`/api/crm/opportunities/${oppId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ stage: newStage }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      setCopiedNotification('Hacé clic nuevamente en Eliminar para confirmar la baja de la oportunidad.');
      setTimeout(() => setPendingDeleteId((prev) => (prev === id ? null : prev)), 4000);
      return;
    }
    setPendingDeleteId(null);
    setOpportunities(opportunities.filter((o) => o.id !== id));
    try {
      await fetch(`/api/crm/opportunities/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Convert Web Lead into CRM Opportunity
  const handleConvertLead = async (leadType: 'proposal' | 'contact', leadData: any) => {
    try {
      const res = await fetch('/api/crm/convert-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ leadType, leadData }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.opportunity) {
          setOpportunities([json.opportunity, ...opportunities]);
          setActiveTab('kanban');
          setCopiedNotification(`¡Lead convertido exitosamente en Oportunidad "${json.opportunity.title}"!`);
          setTimeout(() => setCopiedNotification(null), 3500);
        }
      }
    } catch (err) {
      console.error('Error converting lead:', err);
    }
  };

  // Quote Handlers
  const handleSaveQuote = async (quote: Quote) => {
    const isNew = !quotes.some((q) => q.id === quote.id);
    const updatedList = isNew ? [quote, ...quotes] : quotes.map((q) => (q.id === quote.id ? quote : q));
    setQuotes(updatedList);

    // If linked to opportunity, auto-advance opportunity stage
    if (quote.opportunityId) {
      setOpportunities(
        opportunities.map((o) => {
          if (o.id === quote.opportunityId) {
            return {
              ...o,
              stage: 'proposal_sent',
              value: quote.total,
              currency: quote.currency,
              linkedQuoteId: quote.quoteNumber,
              probability: 70,
              updatedAt: new Date().toISOString(),
            };
          }
          return o;
        })
      );
    }

    try {
      await fetch(isNew ? '/api/crm/quotes' : `/api/crm/quotes/${quote.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(quote),
      });
    } catch (e) {
      console.error(e);
    }

    // Auto prompt fast reply
    setFastReplyQuote(quote);
    setIsFastReplyOpen(true);
  };

  const handleDeleteQuote = async (id: string) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      setCopiedNotification('Hacé clic nuevamente en Eliminar para confirmar la baja del presupuesto.');
      setTimeout(() => setPendingDeleteId((prev) => (prev === id ? null : prev)), 4000);
      return;
    }
    setPendingDeleteId(null);
    setQuotes(quotes.filter((q) => q.id !== id));
    try {
      await fetch(`/api/crm/quotes/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Payment Handlers
  const handleSavePayment = async (payment: PaymentRecord) => {
    setPayments([payment, ...payments]);
    try {
      await fetch('/api/crm/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(payment),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePaymentConfig = async (newConfig: PaymentGatewayConfig) => {
    setPaymentConfig(newConfig);
    try {
      await fetch('/api/crm/payment-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ config: newConfig }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ARN Copiloto: Execute Natural Language / Voice / Pasted WhatsApp Command
  const handleExecuteArnCommand = async (e?: React.FormEvent, presetCommand?: string) => {
    if (e) e.preventDefault();
    const textToRun = (presetCommand ?? arnCommandInput).trim();
    if (!textToRun || isExecutingArnCommand) return;

    setIsExecutingArnCommand(true);
    setArnExecutionLog(null);

    try {
      const res = await fetch('/api/arn/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ commandText: textToRun }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.data) {
          if (json.data.opportunities) setOpportunities(json.data.opportunities);
          if (json.data.companies) setCompanies(json.data.companies);
          if (json.data.contacts) setContacts(json.data.contacts);
          if (json.data.quotes) setQuotes(json.data.quotes);
          if (json.data.payments) setPayments(json.data.payments);
        }
        setArnExecutionLog({
          actionsExecuted: json.actionsExecuted || [],
          quote: json.quote || null,
          opportunity: json.opportunity || null,
        });
        setArnCommandInput('');
        setCopiedNotification('¡Comando ARN ejecutado! Nodos, propuesta 40/40/20 y Portal Clientes sincronizados sin formularios.');
        setTimeout(() => setCopiedNotification(null), 4500);
      }
    } catch (err) {
      console.error('Error executing ARN command:', err);
    } finally {
      setIsExecutingArnCommand(false);
    }
  };

  // ARN Voice Dictation (Browser SpeechRecognition)
  const handleToggleVoiceDictation = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setArnCommandInput(
        'Hablé con Martín de AgroSur, correo martin@agrosur.com.ar, necesitan trazabilidad IoT y Odoo v18 por USD 5800, armar propuesta 40/40/20'
      );
      setCopiedNotification(
        'Cargamos una nota rápida de ejemplo lista para ejecutar en 1 clic (tu navegador actual no expone micrófono WebSpeech).'
      );
      setTimeout(() => setCopiedNotification(null), 4000);
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'es-AR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setIsListeningVoice(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setArnCommandInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListeningVoice(false);
      };
      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onend = () => setIsListeningVoice(false);
      recognition.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  // ARN 1-Click Autonomous Action on any Relationship Node
  const handleExecuteNodeAutopilot = async (opportunityId: string, actionType: string) => {
    setIsExecutingAutopilotId(opportunityId);
    try {
      const res = await fetch('/api/arn/autopilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ opportunityId, actionType }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.data) {
          if (json.data.opportunities) setOpportunities(json.data.opportunities);
          if (json.data.companies) setCompanies(json.data.companies);
          if (json.data.contacts) setContacts(json.data.contacts);
          if (json.data.quotes) setQuotes(json.data.quotes);
          if (json.data.payments) setPayments(json.data.payments);
        }
        setArnExecutionLog({
          actionsExecuted: json.actionsExecuted || [],
          quote: json.quote || null,
          opportunity: json.opportunity || null,
        });
        setCopiedNotification(
          json.actionsExecuted?.[0] || 'Acción autónoma ARN ejecutada en 1 clic.'
        );
        setTimeout(() => setCopiedNotification(null), 4000);
      }
    } catch (err) {
      console.error('Error running ARN autopilot:', err);
    } finally {
      setIsExecutingAutopilotId(null);
    }
  };

  const arnNodes = computeArnRelationshipNodes({
    opportunities: filteredOpportunities,
    companies,
    contacts,
    quotes,
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800">
      
      {/* Top Banner Notification */}
      {copiedNotification && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Header & Top-Level ARN Navigation Tabs */}
      <div className="p-4 sm:p-6 border-b border-slate-200/90 bg-white space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="font-bold text-[#291B64] uppercase tracking-wider">
                Red ARN · Automated Relationship Network
              </span>
              <span aria-hidden="true">·</span>
              <span>Cero Formularios · Supabase + Resend + Gemini AI</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Centro Autónomo ARN & Flujo de Relaciones 40/40/20
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('service_stock')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'service_stock'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Stock de Servicios ARN (Micro / PyME / Grande)</span>
            </button>
            <button
              type="button"
              onClick={loadCrmData}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sincronizar</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPaymentConfigOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Medios de Pago</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedQuote(null);
                setQuoteOpportunityContext(null);
                setIsQuoteBuilderOpen(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Crear Presupuesto</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedOpp(null);
                setTargetOppStage('lead');
                setIsOppModalOpen(true);
              }}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Oportunidad</span>
            </button>
          </div>
        </div>

        {/* Main ARN Navigation Tabs (Always at the top for instant visibility) */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('kanban')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'kanban'
                  ? 'bg-[#291B64] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Radar ARN & Pipeline ({opportunities.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('service_stock')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'service_stock'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Stock de Servicios ARN · Micro / PyME / Grande ({serviceStock.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'directory'
                  ? 'bg-[#291B64] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Red de Nodos: Empresas ({companies.length}) & Contactos ({contacts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quotes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === 'quotes'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Presupuestos & Plantillas ({quotes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === 'payments'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Medios de Pago & Cobranzas ({payments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === 'leads'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Leads Web ({webLeads.proposals.length + webLeads.contactInquiries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('whatsapp_automations')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === 'whatsapp_automations'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Business & Automatizaciones</span>
            </button>
          </div>

          {/* Global Filter & Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente o proyecto..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 cursor-pointer"
            >
              <option value="all">Todos los Servicios</option>
              <option value="odoo_erp">Odoo v18 ERP</option>
              <option value="ecommerce_b2b2c">E-Commerce B2B2C</option>
              <option value="software_architecture">Arquitectura & Resiliencia</option>
              <option value="fractional_cto">Fractional CTO</option>
              <option value="linux_docker">Linux & Docker</option>
              <option value="bi_analytics">Business Intelligence</option>
            </select>
          </div>
        </div>

        {activeTab === 'kanban' && (
          <>
            {/* 5-Card Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Pipeline Activo (USD)
                </span>
                <div className="text-lg font-bold text-blue-900 font-mono">
                  USD ${pipelineValueUsd.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">{activeOpps.length} tratativas en curso</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Pipeline Local (ARS)
                </span>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  ARS ${pipelineValueArs.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">Mercado Pago / Factura A</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 block">
                  Proyectos Ganados (Won)
                </span>
                <div className="text-lg font-bold text-emerald-700 font-mono">
                  USD ${wonValueUsd.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-600">{wonOpps.length} contratos cerrados</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-800 block">
                  Presupuestos Emitidos
                </span>
                <div className="text-lg font-bold text-indigo-700 font-mono">
                  {quotes.length} Cotizaciones
                </div>
                <div className="text-[11px] text-indigo-600">
                  {quotes.filter((q) => q.status === 'sent').length} en evaluación
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Cobranzas Acreditadas
                </span>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  USD ${totalCollectedUsd.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-300">
                  {payments.filter((p) => p.status === 'confirmed').length} pagos confirmados
                </div>
              </div>
            </div>

            {/* OMNIBARRA COPILOTO ARN: VOZ, TEXTO NATURAL & INGESTA WHATSAPP SIN FORMULARIOS */}
            <div className="p-4 sm:p-5 bg-[#0F172A] text-white border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-white">
                    Omnibarra Copiloto ARN (Cero Formularios)
                  </span>
                  <span className="text-slate-400 hidden md:inline">
                    · Escribí, dictá por voz o pegá un mensaje de WhatsApp para crear/actualizar empresa, contacto, propuesta 40/40/20 y proyecto automáticamente
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() =>
                      handleExecuteArnCommand(
                        undefined,
                        'Hablé con Valeria de Bodega Austral, correo valeria@bodegaaustral.com, necesitan Odoo v18 ERP e inventario por USD 5400, armar propuesta 40/40/20'
                      )
                    }
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Ej. 1: Cotizar Odoo 40/40/20
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleExecuteArnCommand(
                        undefined,
                        'Hablé con Lucas de Frigorífico Patagonia, correo lucas@frigopatagonia.com.ar, aprobar e iniciar proyecto kickoff de trazabilidad IoT por USD 6800'
                      )
                    }
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Ej. 2: Kickoff Directo 40/40/20
                  </button>
                </div>
              </div>

              <form onSubmit={handleExecuteArnCommand} className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="text"
                  value={arnCommandInput}
                  onChange={(e) => setArnCommandInput(e.target.value)}
                  placeholder='Ej: "Hablé con Martín de AgroSur (martin@agrosur.com), quieren trazabilidad IoT y Odoo por USD 6200, armale propuesta 40/40/20"...'
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleVoiceDictation}
                    className={`px-3.5 py-2.5 text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isListeningVoice
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title="Dictar instrucción por voz"
                  >
                    <span>{isListeningVoice ? 'Escuchando Voz...' : 'Dictar por Voz'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isExecutingArnCommand || !arnCommandInput.trim()}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    {isExecutingArnCommand ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Ejecutar en ARN</span>
                  </button>
                </div>
              </form>

              {arnExecutionLog && (
                <div className="p-3.5 bg-slate-900 border border-emerald-500/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400 uppercase text-[11px]">
                      ✓ Ejecución Autónoma ARN Completada (Cero Formularios)
                    </span>
                    <button
                      type="button"
                      onClick={() => setArnExecutionLog(null)}
                      className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
                    >
                      Ocultar ×
                    </button>
                  </div>
                  <div className="space-y-1 text-slate-200">
                    {arnExecutionLog.actionsExecuted.map((act, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                  {arnExecutionLog.quote && (
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-slate-300">
                        Propuesta lista en Portal Cliente (#portal):{' '}
                        <strong className="text-white">{arnExecutionLog.quote.quoteNumber}</strong> (
                        {arnExecutionLog.quote.currency} $
                        {arnExecutionLog.quote.total.toLocaleString()})
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewQuote(arnExecutionLog.quote!);
                            setIsQuotePreviewOpen(true);
                          }}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] cursor-pointer"
                        >
                          Ver / PDF 40/40/20
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFastReplyQuote(arnExecutionLog.quote!);
                            setIsFastReplyOpen(true);
                          }}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] cursor-pointer"
                        >
                          Enviar por WhatsApp / Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Work Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        
        {/* ============================================================
            TAB 1: RADAR AUTÓNOMO DE NODOS ARN + PIPELINE KANBAN
        ============================================================ */}
        {activeTab === 'kanban' && (
          <div className="space-y-6">
            {/* Switcher: Radar Autónomo ARN (1-Clic sin formularios) vs Vista Kanban */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {arnViewMode === 'radar'
                    ? 'Radar Autónomo de Relaciones ARN (Acciones 1-Clic sin Carga Manual)'
                    : 'Tablero Kanban por Etapas'}
                </h3>
                <p className="text-xs text-slate-500">
                  Cada nodo se ordena automáticamente según las señales e interacciones reales detectadas en el Portal y correo.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 self-start">
                <button
                  type="button"
                  onClick={() => setArnViewMode('radar')}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    arnViewMode === 'radar'
                      ? 'bg-[#291B64] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Radar Autónomo ARN ({arnNodes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setArnViewMode('kanban')}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    arnViewMode === 'kanban'
                      ? 'bg-[#291B64] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vista Kanban Clásica
                </button>
              </div>
            </div>

            {arnViewMode === 'radar' ? (
              <div className="border border-slate-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
                        <th className="py-3 px-4">Nodo ARN (Cliente · Corporación · Dotación)</th>
                        <th className="py-3 px-4">Iniciativa & Vertical</th>
                        <th className="py-3 px-4">Estado & Última Señal Detectada</th>
                        <th className="py-3 px-4 text-right">Implementación + Soporte Mensual</th>
                        <th className="py-3 px-4 text-right">Acción Autónoma (1-Clic)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {arnNodes.map((node) => {
                        const srv =
                          SERVICE_LABELS[node.serviceCategory] || SERVICE_LABELS.custom;
                        const isRunning = isExecutingAutopilotId === node.opportunityId;

                        return (
                          <tr key={node.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 align-top">
                              <div className="font-bold text-slate-900 text-xs">
                                {node.clientName}
                              </div>
                              <div className="text-slate-600 text-[11px]">
                                {node.companyName} ·{' '}
                                <span className="font-mono">{node.clientEmail}</span>
                              </div>
                              <div className="mt-1 inline-block px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[10px] font-bold">
                                {node.employeeRangeLabel}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <div className="font-bold text-slate-900">{node.statusLabel || srv.label}</div>
                              <div className="text-slate-500 text-[11px]">
                                {srv.label}
                                {node.linkedQuoteId ? ` · Ref: ${node.linkedQuoteId}` : ''}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 align-top max-w-sm">
                              <div className="flex items-center gap-2 font-semibold text-slate-900">
                                <span
                                  className={
                                    node.statusTone === 'emerald'
                                      ? 'text-emerald-700'
                                      : node.statusTone === 'amber'
                                      ? 'text-amber-700'
                                      : 'text-[#291B64]'
                                  }
                                >
                                  {node.statusLabel}
                                </span>
                                <span className="text-slate-400">·</span>
                                <span className="font-mono tabular-nums text-[11px] text-slate-600">
                                  Impulso {node.momentumScore}%
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">
                                {node.lastDetectedSignal}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 align-top text-right font-mono tabular-nums whitespace-nowrap">
                              <div className="font-bold text-slate-900">
                                {node.currency} ${node.value.toLocaleString()}
                              </div>
                              <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                                + {node.currency} ${Number(node.monthlySupportFee || 250).toLocaleString()}/mes (Soporte SLA)
                              </div>
                            </td>

                            <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isRunning}
                                  onClick={() =>
                                    handleExecuteNodeAutopilot(
                                      node.opportunityId,
                                      node.autonomousAction.actionType
                                    )
                                  }
                                  className={`px-3 py-1.5 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                                    node.autonomousAction.actionType === 'auto_kickoff_project'
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                      : node.autonomousAction.actionType === 'auto_quote_40_40_20'
                                      ? 'bg-[#291B64] hover:bg-[#382586] text-white'
                                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                                  }`}
                                  title={node.autonomousAction.description}
                                >
                                  {isRunning ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                  <span>{node.autonomousAction.buttonLabel}</span>
                                </button>

                                <a
                                  href={node.whatsappQuickUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs inline-flex items-center gap-1"
                                  title="Abrir WhatsApp con mensaje contextualizado"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WA</span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-6 min-h-[550px]">
                {STAGES.map((stg) => {
                  const stageOpps = filteredOpportunities.filter((o) => o.stage === stg.id);
                  const stageTotal = stageOpps.reduce((acc, curr) => acc + (curr.value || 0), 0);

                  return (
                    <div
                      key={stg.id}
                      className="w-72 sm:w-80 shrink-0 flex flex-col bg-slate-100/80 rounded-2xl border border-slate-200/90 overflow-hidden"
                    >
                  {/* Column Header */}
                  <div className={`p-3.5 border-b ${stg.border} ${stg.bg} flex items-center justify-between`}>
                    <div>
                      <h4 className={`text-xs font-bold ${stg.color}`}>{stg.label}</h4>
                      <div className="text-[10px] font-mono text-slate-500">
                        {stageOpps.length} op. · USD ${stageTotal.toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOpp(null);
                        setTargetOppStage(stg.id);
                        setIsOppModalOpen(true);
                      }}
                      className="p-1 rounded-lg hover:bg-white/80 text-slate-500 hover:text-slate-800 transition-colors"
                      title="Agregar oportunidad en esta etapa"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cards Area */}
                  <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5">
                    {stageOpps.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs italic">
                        Sin oportunidades en esta etapa
                      </div>
                    ) : (
                      stageOpps.map((opp) => {
                        const serviceInfo = SERVICE_LABELS[opp.serviceCategory] || SERVICE_LABELS.custom;

                        return (
                          <div
                            key={opp.id}
                            className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${serviceInfo.badge}`}
                              >
                                {serviceInfo.label}
                              </span>
                              <div className="font-mono text-xs font-bold text-slate-900">
                                {opp.currency} ${opp.value.toLocaleString()}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                                {opp.title}
                              </h5>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                <span className="font-semibold">{opp.clientName}</span>
                                {opp.company && <span> · {opp.company}</span>}
                              </div>
                            </div>

                            {opp.notes && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                "{opp.notes}"
                              </p>
                            )}

                            {/* Probability progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                <span>Probabilidad</span>
                                <span>{opp.probability}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    opp.probability >= 70
                                      ? 'bg-emerald-500'
                                      : opp.probability >= 40
                                      ? 'bg-blue-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${opp.probability}%` }}
                                />
                              </div>
                            </div>

                            {/* Action Buttons & Stage Mover */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <select
                                value={opp.stage}
                                onChange={(e) => handleStageChange(opp.id, e.target.value as OpportunityStage)}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
                              >
                                {STAGES.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuoteOpportunityContext(opp);
                                    setSelectedQuote(null);
                                    setIsQuoteBuilderOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                                  title="Elaborar Presupuesto Formal"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOpp(opp);
                                    setIsOppModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                                  title="Editar oportunidad"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOpportunity(opp.id)}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 1B: AGENDA DE EMPRESAS (CORPORACIONES) & CONTACTOS INDIVIDUALES
        ============================================================ */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            {/* Header & Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                    Agenda Integrada CRM + Portal Clientes
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                    ✓ Todos los contactos tienen usuario de acceso activo en #portal
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Directorio de Empresas (Corporaciones) & Contactos Individuales
                </h3>
                <p className="text-xs text-slate-500">
                  Las empresas agrupan los contactos de su corporación. Cada contacto (corporativo o individual) es usuario registrado del Portal Clientes sin necesidad de contar con un producto o servicio contratado.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenNewCompanyForm()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ Nueva Empresa / Corporación</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenNewContactForm()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Nuevo Contacto / Usuario Portal</span>
                </button>
              </div>
            </div>

            {/* Inline Modal / Drawer: Nueva Empresa / Corporación */}
            {isCompanyFormOpen && (
              <form
                onSubmit={handleSaveCompany}
                className="p-5 rounded-2xl bg-white border-2 border-slate-900 shadow-lg space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <h4 className="font-bold text-sm text-slate-900">
                      {editingCompany ? `Editar Corporación: ${editingCompany.name}` : 'Registrar Nueva Empresa / Corporación'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCompanyFormOpen(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Cerrar ×
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Razón Social / Corporación *
                    </label>
                    <input
                      type="text"
                      required
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      placeholder="Ej: BioPatagonia Industrial S.A."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      CUIT / RUT / Tax ID
                    </label>
                    <input
                      type="text"
                      value={compTaxId}
                      onChange={(e) => setCompTaxId(e.target.value)}
                      placeholder="30-71000000-1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Segmento / Tier
                    </label>
                    <select
                      value={compTier}
                      onChange={(e) => setCompTier(e.target.value as CrmCompany['tier'])}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    >
                      <option value="enterprise">Corporación / Enterprise</option>
                      <option value="pyme">PyME Productiva / Comercial</option>
                      <option value="startup">Startup / EBT Tecnológica</option>
                      <option value="institution">Institución / Salud / Cooperativa</option>
                      <option value="prospect">Prospecto en Evaluación</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Industria / Vertical
                    </label>
                    <input
                      type="text"
                      value={compIndustry}
                      onChange={(e) => setCompIndustry(e.target.value)}
                      placeholder="Ej: Distribución B2B2C / Fintech"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Email Institucional
                    </label>
                    <input
                      type="email"
                      value={compEmail}
                      onChange={(e) => setCompEmail(e.target.value)}
                      placeholder="contacto@corporacion.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Teléfono Central
                    </label>
                    <input
                      type="text"
                      value={compPhone}
                      onChange={(e) => setCompPhone(e.target.value)}
                      placeholder="+54 9 11 ..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Ubicación / Sede
                    </label>
                    <input
                      type="text"
                      value={compLocation}
                      onChange={(e) => setCompLocation(e.target.value)}
                      placeholder="CABA / Patagonia / Remoto"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Notas de la Corporación
                  </label>
                  <input
                    type="text"
                    value={compNotes}
                    onChange={(e) => setCompNotes(e.target.value)}
                    placeholder="Detalle de áreas, sucursales o acuerdos..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCompanyFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                  >
                    Guardar Corporación
                  </button>
                </div>
              </form>
            )}

            {/* Inline Modal / Drawer: Nuevo Contacto (Corporativo o Individual) + Portal Clientes */}
            {isContactFormOpen && (
              <form
                onSubmit={handleSaveContact}
                className="p-5 rounded-2xl bg-white border-2 border-blue-600 shadow-lg space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {editingContact ? `Editar Contacto: ${editingContact.fullName}` : 'Nuevo Contacto & Usuario del Portal Clientes'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Se habilita automáticamente como usuario registrado del Portal Clientes (con o sin servicio activo contratado).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsContactFormOpen(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Cerrar ×
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Tipo de Contacto *
                    </label>
                    <select
                      value={cntType}
                      onChange={(e) => setCntType(e.target.value as 'corporate_member' | 'individual')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-900"
                    >
                      <option value="corporate_member">Miembro de Empresa / Corporación</option>
                      <option value="individual">Contacto Individual / Independiente</option>
                    </select>
                  </div>

                  {cntType === 'corporate_member' ? (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                        Agrupar en Empresa / Corporación *
                      </label>
                      <select
                        value={cntCompanyId}
                        onChange={(e) => setCntCompanyId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      >
                        <option value="">-- Seleccionar Empresa de la Agenda --</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.taxId ? `(CUIT: ${c.taxId})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="sm:col-span-2 flex items-center p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                      <span>
                        <strong>Contacto Individual:</strong> Tendrá acceso personal e independiente al Portal Clientes para consultas, agenda y presupuestos sin depender de una corporación.
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={cntFullName}
                      onChange={(e) => setCntFullName(e.target.value)}
                      placeholder="Ej: Ing. Mariana Silva"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Cargo / Rol Profesional
                    </label>
                    <input
                      type="text"
                      value={cntRoleTitle}
                      onChange={(e) => setCntRoleTitle(e.target.value)}
                      placeholder="Ej: Gerente de Operaciones / Consultora"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={cntPhone}
                      onChange={(e) => setCntPhone(e.target.value)}
                      placeholder="+54 9 11 ..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>

                {/* Portal Credentials Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                      <span>Credenciales de Acceso al Portal Clientes (#portal)</span>
                    </span>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cntHasActiveService}
                        onChange={(e) => setCntHasActiveService(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span>¿Tiene Producto / Servicio Contratado Activo?</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                        Email de Login *
                      </label>
                      <input
                        type="email"
                        required
                        value={cntEmail}
                        onChange={(e) => {
                          setCntEmail(e.target.value);
                          if (!editingContact && !cntUsername) {
                            setCntUsername(e.target.value.split('@')[0].toLowerCase());
                          }
                        }}
                        placeholder="nombre@empresa.com"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                        Usuario del Portal
                      </label>
                      <input
                        type="text"
                        value={cntUsername}
                        onChange={(e) => setCntUsername(e.target.value)}
                        placeholder="nombre.apellido"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                        Contraseña Asignada
                      </label>
                      <input
                        type="text"
                        value={cntPassword}
                        onChange={(e) => setCntPassword(e.target.value)}
                        placeholder="cliente2026"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsContactFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Guardar Contacto y Habilitar Portal
                  </button>
                </div>
              </form>
            )}

            {/* Sub-View Switcher: Empresas (con Contactos Agrupados) vs Contactos Individuales & Todos los Usuarios */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/80">
                <button
                  type="button"
                  onClick={() => setDirectorySubView('companies')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    directorySubView === 'companies'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>1. Empresas & Contactos de su Corporación ({companies.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirectorySubView('contacts')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    directorySubView === 'contacts'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>2. Agenda de Contactos Individuales & Usuarios Portal ({contacts.length})</span>
                </button>
              </div>

              {directorySubView === 'contacts' && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {(
                    [
                      { id: 'all', label: `Todos (${contacts.length})` },
                      {
                        id: 'corporate_member',
                        label: `Corporativos (${contacts.filter((c) => c.contactType === 'corporate_member').length})`,
                      },
                      {
                        id: 'individual',
                        label: `Individuales (${contacts.filter((c) => c.contactType === 'individual').length})`,
                      },
                      {
                        id: 'active_service',
                        label: `Con Servicio Activo (${contacts.filter((c) => c.hasActiveService).length})`,
                      },
                      {
                        id: 'registered_only',
                        label: `Registrados sin Servicio (${contacts.filter((c) => !c.hasActiveService).length})`,
                      },
                    ] as const
                  ).map((flt) => (
                    <button
                      key={flt.id}
                      type="button"
                      onClick={() => setContactFilterType(flt.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                        contactFilterType === flt.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {flt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SUB-VIEW 1: EMPRESAS Y CONTACTOS AGRUPADOS DE LA CORPORACIÓN */}
            {directorySubView === 'companies' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {companies
                  .filter(
                    (comp) =>
                      !searchQuery ||
                      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (comp.industry && comp.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (comp.taxId && comp.taxId.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((comp) => {
                    const groupedContacts = contacts.filter(
                      (cnt) =>
                        cnt.companyId === comp.id ||
                        (cnt.companyName && cnt.companyName.toLowerCase() === comp.name.toLowerCase())
                    );
                    const compOpps = opportunities.filter(
                      (o) =>
                        o.companyId === comp.id ||
                        (o.company && o.company.toLowerCase() === comp.name.toLowerCase())
                    );
                    const totalPipelineComp = compOpps.reduce((sum, o) => sum + (o.value || 0), 0);

                    return (
                      <div
                        key={comp.id}
                        className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          {/* Company Header */}
                          <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-slate-900 text-white">
                                  {comp.tier}
                                </span>
                                {comp.taxId && (
                                  <span className="text-[11px] font-mono text-slate-500">
                                    CUIT: {comp.taxId}
                                  </span>
                                )}
                                <span className="text-[11px] font-mono text-blue-700 font-bold">
                                  · {groupedContacts.length} contacto(s) agrupado(s)
                                </span>
                              </div>
                              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>{comp.name}</span>
                              </h4>
                              <p className="text-xs text-slate-600">
                                {comp.industry || 'Corporación'} · {comp.location || 'Argentina'}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenNewCompanyForm(comp)}
                                className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 cursor-pointer"
                                title="Editar corporación"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCompany(comp.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Eliminar corporación"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Grouped Corporate Contacts List */}
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono font-bold uppercase text-slate-500">
                                Contactos de la Corporación (Usuarios del Portal)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenNewContactForm(comp.id)}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>+ Agrupar Contacto</span>
                              </button>
                            </div>

                            {groupedContacts.length === 0 ? (
                              <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 text-center">
                                Sin contactos vinculados aún a esta corporación.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {groupedContacts.map((member) => (
                                  <div
                                    key={member.id}
                                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                  >
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{member.fullName}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-900 font-semibold">
                                          {member.roleTitle}
                                        </span>
                                        <span
                                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                            member.hasActiveService
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : 'bg-amber-100 text-amber-800'
                                          }`}
                                        >
                                          {member.hasActiveService
                                            ? 'Servicio Activo'
                                            : 'Usuario Portal (Sin Servicio Activo)'}
                                        </span>
                                      </div>
                                      <div className="text-[11px] font-mono text-slate-500">
                                        {member.email} · Usuario Portal: <strong className="text-slate-800">{member.username}</strong>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenNewContactForm(comp.id, member)}
                                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
                                        title="Editar contacto"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteContact(member.id)}
                                        className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer"
                                        title="Eliminar contacto"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Company Pipeline Footer */}
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="font-mono text-[11px] text-slate-600">
                            Pipeline vinculado: <strong>{compOpps.length} op.</strong> (USD ${totalPipelineComp.toLocaleString()})
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const primary = groupedContacts[0];
                              setSelectedOpp({
                                id: `opp-${Date.now()}`,
                                title: `Proyecto Tecnológico - ${comp.name}`,
                                clientName: primary ? primary.fullName : comp.name,
                                clientEmail: primary ? primary.email : comp.email || '',
                                clientPhone: primary ? primary.phone : comp.phone || '',
                                company: comp.name,
                                companyId: comp.id,
                                contactId: primary?.id,
                                serviceCategory: 'odoo_erp',
                                stage: 'lead',
                                value: 3500,
                                currency: 'USD',
                                probability: 50,
                                source: 'manual',
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              });
                              setIsOppModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+ Oportunidad en Pipeline</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* SUB-VIEW 2: CONTACTOS INDIVIDUALES Y TODOS LOS USUARIOS DEL PORTAL */}
            {directorySubView === 'contacts' && (
              <div className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Contacto / Rol</th>
                      <th className="py-3 px-4">Modalidad / Corporación</th>
                      <th className="py-3 px-4">Credenciales Portal Clientes</th>
                      <th className="py-3 px-4 text-center">Estado de Servicio</th>
                      <th className="py-3 px-4 text-right">Acciones CRM & Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {contacts
                      .filter((cnt) => {
                        const matchesSearch =
                          !searchQuery ||
                          cnt.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cnt.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cnt.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (cnt.companyName && cnt.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

                        const matchesType =
                          contactFilterType === 'all' ||
                          (contactFilterType === 'corporate_member' && cnt.contactType === 'corporate_member') ||
                          (contactFilterType === 'individual' && cnt.contactType === 'individual') ||
                          (contactFilterType === 'active_service' && cnt.hasActiveService) ||
                          (contactFilterType === 'registered_only' && !cnt.hasActiveService);

                        return matchesSearch && matchesType;
                      })
                      .map((cnt) => (
                        <tr key={cnt.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{cnt.fullName}</div>
                            <div className="text-[11px] text-slate-500">
                              {cnt.roleTitle} {cnt.phone ? `· ${cnt.phone}` : ''}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {cnt.contactType === 'corporate_member' && cnt.companyName ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 font-semibold text-[11px] border border-indigo-200/70">
                                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{cnt.companyName}</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-[11px]">
                                <User className="w-3.5 h-3.5 text-slate-600" />
                                <span>Contacto Individual</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <div className="text-slate-900">
                              Usuario: <strong className="text-blue-800">{cnt.username}</strong> · Clave:{' '}
                              <span className="text-slate-600">{cnt.password}</span>
                            </div>
                            <div className="text-slate-400">{cnt.email}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                cnt.hasActiveService
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {cnt.hasActiveService
                                ? 'Cliente c/ Servicio Activo'
                                : 'Usuario Portal (Sin Servicio)'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOpp({
                                  id: `opp-${Date.now()}`,
                                  title: `Propuesta Técnica - ${cnt.companyName || cnt.fullName}`,
                                  clientName: cnt.fullName,
                                  clientEmail: cnt.email,
                                  clientPhone: cnt.phone || '',
                                  company: cnt.companyName || '',
                                  companyId: cnt.companyId,
                                  contactId: cnt.id,
                                  serviceCategory: 'software_architecture',
                                  stage: 'lead',
                                  value: 3000,
                                  currency: 'USD',
                                  probability: 45,
                                  source: 'manual',
                                  createdAt: new Date().toISOString(),
                                  updatedAt: new Date().toISOString(),
                                });
                                setIsOppModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              title="Crear Oportunidad en Pipeline para este contacto"
                            >
                              <TrendingUp className="w-3 h-3" />
                              <span>+ Pipeline</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenNewContactForm(cnt.companyId, cnt)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                              title="Editar contacto"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(cnt.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Eliminar contacto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 2: QUOTES & TEMPLATES (PRESUPUESTOS)
        ============================================================ */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Presupuestos Formales & Cotizaciones
                </h3>
                <p className="text-xs text-slate-500">
                  Generación de propuestas con plantillas para los 6 servicios, desglose de hitos de pago y respuestas automáticas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuote(null);
                  setQuoteOpportunityContext(null);
                  setIsQuoteBuilderOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Presupuesto</span>
              </button>
            </div>

            {/* Preconfigured Services Templates Quick Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Plantillas Maestras Disponibles (1-Click para Presupuestar)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {DEFAULT_QUOTE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedQuote(null);
                      setQuoteOpportunityContext({
                        id: `opp-${Date.now()}`,
                        title: tmpl.suggestedTitle,
                        clientName: '',
                        clientEmail: '',
                        serviceCategory: tmpl.serviceCategory,
                      });
                      setIsQuoteBuilderOpen(true);
                    }}
                    className="p-3 text-left rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-900">
                      {tmpl.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-mono">
                      <span>Plazo: {tmpl.suggestedTimeline}</span>
                      <span className="text-blue-700 font-bold group-hover:underline">Usar plantilla →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quotes Table */}
            <div className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4"># Presupuesto</th>
                    <th className="py-3 px-4">Cliente / Empresa</th>
                    <th className="py-3 px-4">Título del Servicio</th>
                    <th className="py-3 px-4 text-right">Inversión Total</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Validez</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">
                        {q.quoteNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{q.clientName}</div>
                        {q.clientCompany && (
                          <div className="text-slate-500 text-[11px]">{q.clientCompany}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-medium">
                        {q.title}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                        {q.currency} ${q.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            q.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.status === 'sent'
                              ? 'bg-blue-100 text-blue-800'
                              : q.status === 'invoiced'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">
                        {q.validUntil}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setFastReplyQuote(q);
                            setIsFastReplyOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="Plantilla WhatsApp / Email"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Resp. Rápida</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewQuote(q);
                            setIsQuotePreviewOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="Ver / Imprimir / PDF"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Ver / PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentRecordQuoteId(q.quoteNumber);
                            setIsPaymentRecordOpen(true);
                          }}
                          className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700"
                          title="Registrar cobro"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedQuote(q);
                            setIsQuoteBuilderOpen(true);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuote(q.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: MEDIOS DE PAGO & COBRANZAS (PAYMENTS)
        ============================================================ */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pasarelas, Medios de Pago & Conciliación
                </h3>
                <p className="text-xs text-slate-500">
                  Mercado Pago (Argentina), Stripe (Internacional), Transferencias CBU/Alias y Criptoactivos USDT/USDC.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentConfigOpen(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Configurar Pasarelas</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentRecordQuoteId(undefined);
                    setIsPaymentRecordOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Cobro</span>
                </button>
              </div>
            </div>

            {/* Quick Cards of Active Payment Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mercado Pago */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-800 uppercase">Mercado Pago</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Activo
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-700 font-mono">
                  <div>Alias/CVU: <strong>{paymentConfig.mercadopago.aliasOrCvu}</strong></div>
                  <div>Titular: {paymentConfig.mercadopago.titular}</div>
                  <div className="text-[10px] text-slate-400">Checkout 1-click & QR</div>
                </div>
              </div>

              {/* Stripe */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700 uppercase">Stripe</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Activo
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-700 font-mono">
                  <div>Monedas: USD / EUR</div>
                  <div>Tarjetas Internacionales</div>
                  <div className="text-[10px] text-slate-400">Apple Pay & Google Pay</div>
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-800 uppercase">Transferencia</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Factura {paymentConfig.bankTransfer.facturaTipo}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-700 font-mono">
                  <div>Alias: <strong>{paymentConfig.bankTransfer.alias}</strong></div>
                  <div>CBU: ...{paymentConfig.bankTransfer.cbu.slice(-6)}</div>
                  <div className="text-[10px] text-slate-400">CUIT: {paymentConfig.bankTransfer.cuit}</div>
                </div>
              </div>

              {/* Crypto */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-700 uppercase">Cripto (USDT/USDC)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    TRC-20
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-700 font-mono">
                  <div>Red: Tron / Arbitrum</div>
                  <div className="truncate text-[11px]">{paymentConfig.crypto.usdtTrc20Address.slice(0, 14)}...</div>
                  <div className="text-[10px] text-slate-400">Comisiones mínimas</div>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                Historial de Cobros & Conciliación ({payments.length})
              </h4>
              <div className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Cliente / Proyecto</th>
                      <th className="py-3 px-4">Presupuesto</th>
                      <th className="py-3 px-4">Canal / Medio</th>
                      <th className="py-3 px-4">Referencia / Comprobante</th>
                      <th className="py-3 px-4 text-right">Monto</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {p.createdAt.split('T')[0]}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {p.clientName}
                        </td>
                        <td className="py-3 px-4 font-mono text-blue-900 font-semibold">
                          {p.quoteId || 'Directo'}
                        </td>
                        <td className="py-3 px-4 capitalize font-medium">
                          {p.method === 'transfer' ? 'Transferencia Bancaria' : p.method}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {p.transactionRef || 'Sin referencia'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-700">
                          {p.currency} ${p.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status === 'confirmed' ? 'Acreditado' : p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: BANDEJA DE LEADS WEB (PROPOSALS & CONTACT)
        ============================================================ */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bandeja de Prospectos & Conversión a CRM
                </h3>
                <p className="text-xs text-slate-500">
                  Solicitudes generadas desde el simulador de arquitectura y formulario de contacto del sitio web.
                </p>
              </div>
            </div>

            {/* Architecture Proposals */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-blue-800">
                1. Propuestas Generadas por el Simulador IA ({webLeads.proposals.length})
              </h4>
              {webLeads.proposals.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-400 text-xs italic">
                  No hay propuestas pendientes en la base de datos de producción.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {webLeads.proposals.map((lead: any) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {lead.company_name || lead.organization_type}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {lead.created_at?.split('T')[0]}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleConvertLead('proposal', lead)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Convertir a CRM</span>
                        </button>
                      </div>

                      <div className="font-semibold text-slate-800 text-xs">{lead.architecture_title}</div>
                      <p className="text-[11px] text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {lead.diagnostic_summary}
                      </p>
                      <div className="text-[10px] font-mono text-slate-400">
                        Stack actual: {(lead.current_stack || []).join(', ')} · Urgencia: {lead.urgency}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Inquiries */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-blue-800">
                2. Consultas Directas desde Formulario Web ({webLeads.contactInquiries.length})
              </h4>
              {webLeads.contactInquiries.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-400 text-xs italic">
                  Sin mensajes pendientes en la bandeja de contacto.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {webLeads.contactInquiries.map((inq: any) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{inq.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {inq.email} · {inq.created_at?.split('T')[0]}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleConvertLead('contact', inq)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Convertir a CRM</span>
                        </button>
                      </div>

                      <div className="text-blue-900 font-semibold text-xs">Área: {inq.service_area}</div>
                      <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                        {inq.requirements}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: WHATSAPP BUSINESS & AUTOMATIZACIONES CRM */}
        {activeTab === 'whatsapp_automations' && (
          <div className="space-y-6">
            {/* Active CRM Automations Status Grid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    4 Motores de Automatización del CRM Operativos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Flujo punta a punta desde la captura web hasta el Kick-off en el Portal de Clientes.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 4/4 ACTIVOS EN SERVIDOR
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-mono text-[10px] font-bold text-emerald-700 uppercase">
                    Automatización 01 · Activa
                  </div>
                  <div className="font-bold text-slate-900">
                    Captura Web &rarr; Kanban + Portal Clientes
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Cada Diagnóstico IA o Contacto crea automáticamente la Empresa, el Contacto con clave <code>cliente2026</code> en el Portal y la Oportunidad en el Kanban, enviando sus accesos por Resend.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-mono text-[10px] font-bold text-blue-700 uppercase">
                    Automatización 02 · Activa
                  </div>
                  <div className="font-bold text-slate-900">
                    Despacho 1-Clic Resend + WhatsApp Business
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Desde cualquier Presupuesto podés despachar el correo HTML formal vía <code>notificaciones@gastonbarea.com</code> y el mensaje por WhatsApp API, pasando la oportunidad a <em>Presupuesto Enviado</em>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-mono text-[10px] font-bold text-purple-700 uppercase">
                    Automatización 03 · Activa
                  </div>
                  <div className="font-bold text-slate-900">
                    Cobro Confirmado / Ganado &rarr; Kick-off 40·40·20%
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Al confirmar un pago o pasar una oportunidad a <em>Ganado</em>, se crea el Proyecto en el Portal de Clientes con los 3 hitos 40·40·20% y se envía el email de Kick-off.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-mono text-[10px] font-bold text-amber-700 uppercase">
                    Automatización 04 · Activa
                  </div>
                  <div className="font-bold text-slate-900">
                    Redactor de Alcances e Ítems con IA (Gemini)
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Dentro de <em>Crear Presupuesto</em>, el asistente IA genera los módulos técnicos, entregables, horas y precios a medida según el desafío del cliente.
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Business Configuration & Live Test Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleSaveWhatsAppConfig}
                className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Configuración de WhatsApp Business API & Webhooks</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Soporta Meta WhatsApp Cloud API Oficial, Evolution API en tu servidor Docker (138.219.41.106) o n8n Webhook.
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      waStatus?.configured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {waStatus?.configured ? 'API CONECTADA' : 'MODO ENLACE DIRECTO / PENDIENTE API'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">
                      Proveedor Activo
                    </label>
                    <select
                      value={waConfig.provider}
                      onChange={(e) => setWaConfig({ ...waConfig, provider: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    >
                      <option value="evolution_api">Evolution API (Docker VPS 138.219.41.106)</option>
                      <option value="meta_cloud_api">Meta WhatsApp Cloud API Oficial</option>
                      <option value="webhook_n8n">n8n / Webhook Externo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">
                      Tu Número WhatsApp Business
                    </label>
                    <input
                      type="text"
                      value={waConfig.businessPhone || ''}
                      onChange={(e) => setWaConfig({ ...waConfig, businessPhone: e.target.value })}
                      placeholder="5492804XXXXXX"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">
                      Teléfono para Recibir Alertas CRM
                    </label>
                    <input
                      type="text"
                      value={waConfig.adminNotifyPhone || ''}
                      onChange={(e) => setWaConfig({ ...waConfig, adminNotifyPhone: e.target.value })}
                      placeholder="5492804XXXXXX"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {waConfig.provider === 'evolution_api' && (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                    <div className="font-mono text-[11px] font-bold text-emerald-900">
                      Parámetros Evolution API v2 (Ideal para correr en Docker sobre tu VPS 138.219.41.106)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-mono text-slate-600 mb-1">
                          URL del Servidor Evolution API
                        </label>
                        <input
                          type="text"
                          value={waConfig.evolutionApiUrl || ''}
                          onChange={(e) =>
                            setWaConfig({ ...waConfig, evolutionApiUrl: e.target.value })
                          }
                          placeholder="https://wa.gastonbarea.com o http://138.219.41.106:8080"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-600 mb-1">
                          Nombre de Instancia
                        </label>
                        <input
                          type="text"
                          value={waConfig.evolutionInstanceName || ''}
                          onChange={(e) =>
                            setWaConfig({ ...waConfig, evolutionInstanceName: e.target.value })
                          }
                          placeholder="gastonbarea"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-600 mb-1">
                        Global API Key (AUTHENTICATION_API_KEY)
                      </label>
                      <input
                        type="password"
                        value={waConfig.evolutionApiKey || ''}
                        onChange={(e) =>
                          setWaConfig({ ...waConfig, evolutionApiKey: e.target.value })
                        }
                        placeholder="Pegá la API Key de tu instancia Evolution API..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {waConfig.provider === 'meta_cloud_api' && (
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                    <div className="font-mono text-[11px] font-bold text-blue-900">
                      Parámetros Meta WhatsApp Cloud API Oficial (developers.facebook.com)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-600 mb-1">
                          Phone Number ID (Identificador de número)
                        </label>
                        <input
                          type="text"
                          value={waConfig.metaPhoneNumberId || ''}
                          onChange={(e) =>
                            setWaConfig({ ...waConfig, metaPhoneNumberId: e.target.value })
                          }
                          placeholder="Ej: 109283746512345"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-600 mb-1">
                          WhatsApp Business Account ID (WABA ID)
                        </label>
                        <input
                          type="text"
                          value={waConfig.metaBusinessAccountId || ''}
                          onChange={(e) =>
                            setWaConfig({ ...waConfig, metaBusinessAccountId: e.target.value })
                          }
                          placeholder="Ej: 102938475610293"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-600 mb-1">
                        Permanent Access Token (EAAG...)
                      </label>
                      <input
                        type="password"
                        value={waConfig.metaAccessToken || ''}
                        onChange={(e) =>
                          setWaConfig({ ...waConfig, metaAccessToken: e.target.value })
                        }
                        placeholder="EAAG..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {waConfig.provider === 'webhook_n8n' && (
                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
                    <label className="block text-[10px] font-mono font-bold text-purple-900">
                      URL del Webhook Saliente (n8n / Make / Zapier)
                    </label>
                    <input
                      type="url"
                      value={waConfig.webhookUrl || ''}
                      onChange={(e) => setWaConfig({ ...waConfig, webhookUrl: e.target.value })}
                      placeholder="https://n8n.gastonbarea.com/webhook/whatsapp-crm"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] font-mono text-slate-500">
                    Webhook Entrante listo en: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">https://www.gastonbarea.com/api/webhooks/whatsapp</code>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingWa}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                  >
                    {isSavingWa ? 'Guardando...' : 'Guardar Configuración WhatsApp'}
                  </button>
                </div>
              </form>

              {/* Right Column: Live Test & Webhook Info */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Consola de Prueba en Vivo · WhatsApp Business
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Probá el despacho hacia cualquier número internacional. Si aún no cargaste las claves de la API, genera el enlace directo verificado.
                  </p>

                  {waFeedback && (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        waFeedback.ok
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div>{waFeedback.msg}</div>
                      {waFeedback.waUrl && (
                        <a
                          href={waFeedback.waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Abrir Mensaje en WhatsApp Directo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-600 mb-1">
                      Número Destino de Prueba (Ej: 5492804XXXXXX)
                    </label>
                    <input
                      type="text"
                      value={waTestPhone}
                      onChange={(e) => setWaTestPhone(e.target.value)}
                      placeholder="549..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-600 mb-1">
                      Mensaje de Prueba
                    </label>
                    <textarea
                      rows={3}
                      value={waTestMessage}
                      onChange={(e) => setWaTestMessage(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSendingWaTest}
                  onClick={handleSendWhatsAppTest}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isSendingWaTest ? 'Despachando...' : 'Probar Envío WhatsApp Business'}</span>
                </button>
              </div>
            </div>

            {/* Agenda Google Meet, Horarios GMT-3 & Invitación .ics (notificaciones@gastonbarea.com) */}
            <form
              onSubmit={handleSaveBookingAvailability}
              className="bg-white p-5 rounded-2xl border border-slate-200 space-y-5 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>
                      Configuración de Agenda Google Meet, Horarios GMT-3 & Invitación Nativa .ics
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sin requerir OAuth de Google Cloud en Vercel: cada turno confirmado bloquea automáticamente esa franja horaria y envía el archivo <code>invitacion-meet-gastonbarea.ics</code> vía Resend desde <code>notificaciones@gastonbarea.com</code>.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono font-bold">
                  <Mail className="w-3.5 h-3.5" /> {bookingAvailability.notificationEmail}
                </span>
              </div>

              {availabilityFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium ${
                    availabilityFeedback.ok
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {availabilityFeedback.msg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">
                    Correo Organizador & Receptor de Invitaciones (.ics)
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingAvailability.notificationEmail}
                    onChange={(e) =>
                      setBookingAvailability({
                        ...bookingAvailability,
                        notificationEmail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">
                    Enlace Sala Google Meet Pro por Defecto
                  </label>
                  <input
                    type="url"
                    required
                    value={bookingAvailability.googleMeetUrl}
                    onChange={(e) =>
                      setBookingAvailability({
                        ...bookingAvailability,
                        googleMeetUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Días Hábiles Activos */}
                <div className="lg:col-span-5 space-y-2">
                  <label className="block text-[11px] font-mono font-bold text-slate-600">
                    1. Días Hábiles Habilitados en el Selector
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { day: 1, label: 'Lun' },
                      { day: 2, label: 'Mar' },
                      { day: 3, label: 'Mié' },
                      { day: 4, label: 'Jue' },
                      { day: 5, label: 'Vie' },
                      { day: 6, label: 'Sáb' },
                    ].map((d) => {
                      const active = bookingAvailability.enabledWeekdays.includes(d.day);
                      return (
                        <button
                          key={d.day}
                          type="button"
                          onClick={() => handleToggleWeekday(d.day)}
                          className={`py-2 px-2 rounded-xl border text-center font-mono text-xs font-bold cursor-pointer transition-colors ${
                            active
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Fechas Bloqueadas (Feriados / Vacaciones) */}
                  <div className="pt-2 space-y-2">
                    <label className="block text-[11px] font-mono font-bold text-slate-600">
                      Bloquear Fecha Específica (Feriado / Viaje)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={newBlockedDateInput}
                        onChange={(e) => setNewBlockedDateInput(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddBlockedDate}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                      >
                        + Bloquear Día
                      </button>
                    </div>
                    {bookingAvailability.blockedDates.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {bookingAvailability.blockedDates.map((iso) => (
                          <span
                            key={iso}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[11px]"
                          >
                            <span>{iso}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBlockedDate(iso)}
                              className="text-rose-600 hover:text-rose-900 font-bold cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Franjas Horarias Activas */}
                <div className="lg:col-span-7 space-y-2">
                  <label className="block text-[11px] font-mono font-bold text-slate-600">
                    2. Franjas Horarias Disponibles (Hora Argentina GMT-3)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {bookingAvailability.slots.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => handleToggleSlot(slot.value)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          slot.enabled
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div>
                          <div className="font-mono text-xs">{slot.label}</div>
                          <div className="text-[10px] opacity-75">{slot.tag}</div>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                            slot.enabled
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {slot.enabled ? 'Activo' : 'Oculto'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Resumen de Turnos Ya Reservados (Auto-bloqueados) */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 mt-2">
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-600">
                      Turnos Reservados (Bloqueados Automáticamente para Evitar Superposición):
                    </div>
                    {Object.keys(occupiedSlotsByDate).length === 0 ? (
                      <div className="text-[11px] text-slate-500">
                        No hay turnos ocupados actualmente.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(occupiedSlotsByDate).map(([dateIso, slots]) =>
                          slots.map((s) => (
                            <span
                              key={`${dateIso}-${s}`}
                              className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-semibold"
                            >
                              {dateIso} · {s.split(' ')[0]} hs
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Los cambios impactan en vivo tanto en el botón <strong>¡Hablemos! Agendar Meet</strong> como en el <strong>Portal de Clientes</strong>.
                </span>
                <button
                  type="submit"
                  disabled={isSavingAvailability}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                >
                  {isSavingAvailability
                    ? 'Guardando Disponibilidad...'
                    : 'Guardar Disponibilidad de Agenda'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================
            TAB 7: STOCK DE SERVICIOS ARN & ESCALAS (MICRO · PYME · GRANDE)
        ============================================================ */}
        {activeTab === 'service_stock' && (
          <ArnServiceStockManager
            serviceStock={serviceStock}
            passkey={passkey}
            onUpdateStock={(next) => setServiceStock(next)}
            onEmitSimulatedQuote={async ({
              stockServiceId,
              employeeCount,
              clientName,
              companyName,
              clientEmail,
            }) => {
              const stk = serviceStock.find((s) => s.id === stockServiceId);
              await handleExecuteArnCommand(
                undefined,
                `Hablé con ${clientName} de ${companyName}, correo ${clientEmail}, somos ${employeeCount} empleados y necesitan ${
                  stk?.name || 'implementación ARN'
                }, armar propuesta 40/40/20`
              );
            }}
          />
        )}
      </div>

      {/* MODALS */}
      <OpportunityModal
        isOpen={isOppModalOpen}
        onClose={() => setIsOppModalOpen(false)}
        onSaveOpportunity={handleSaveOpportunity}
        initialOpportunity={selectedOpp}
        initialStage={targetOppStage}
        companies={companies}
        contacts={contacts}
      />

      <QuoteBuilderModal
        isOpen={isQuoteBuilderOpen}
        onClose={() => setIsQuoteBuilderOpen(false)}
        onSaveQuote={handleSaveQuote}
        initialQuote={selectedQuote}
        linkedOpportunity={quoteOpportunityContext}
      />

      <QuotePreviewModal
        isOpen={isQuotePreviewOpen}
        onClose={() => setIsQuotePreviewOpen(false)}
        quote={previewQuote}
        paymentConfig={paymentConfig}
      />

      <FastReplyModal
        isOpen={isFastReplyOpen}
        onClose={() => setIsFastReplyOpen(false)}
        quote={fastReplyQuote}
        onQuoteDispatched={(updatedQuote) => {
          setQuotes((prev) => prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q)));
          if (updatedQuote.opportunityId) {
            setOpportunities((prev) =>
              prev.map((o) =>
                o.id === updatedQuote.opportunityId && o.stage !== 'won'
                  ? { ...o, stage: 'proposal_sent', probability: 70, linkedQuoteId: updatedQuote.quoteNumber }
                  : o
              )
            );
          }
        }}
      />

      <PaymentConfigModal
        isOpen={isPaymentConfigOpen}
        onClose={() => setIsPaymentConfigOpen(false)}
        config={paymentConfig}
        onSaveConfig={handleSavePaymentConfig}
      />

      <PaymentRecordModal
        isOpen={isPaymentRecordOpen}
        onClose={() => setIsPaymentRecordOpen(false)}
        onSavePayment={handleSavePayment}
        quotes={quotes}
        preselectedQuoteId={paymentRecordQuoteId}
      />
    </div>
  );
};
