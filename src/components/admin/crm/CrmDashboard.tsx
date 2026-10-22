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
} from '../../../types/crm';
import {
  DEFAULT_PAYMENT_CONFIG,
  INITIAL_CRM_OPPORTUNITIES,
  INITIAL_CRM_QUOTES,
  INITIAL_CRM_PAYMENTS,
  DEFAULT_QUOTE_TEMPLATES,
} from '../../../data/crmTemplates';
import { OpportunityModal } from './OpportunityModal';
import { QuoteBuilderModal } from './QuoteBuilderModal';
import { QuotePreviewModal } from './QuotePreviewModal';
import { FastReplyModal } from './FastReplyModal';
import { PaymentConfigModal } from './PaymentConfigModal';
import { PaymentRecordModal } from './PaymentRecordModal';

interface CrmDashboardProps {
  passkey?: string;
  onClose?: () => void;
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

export const CrmDashboard: React.FC<CrmDashboardProps> = ({ passkey = 'gaston2026', onClose }) => {
  // Navigation tabs: 'kanban' | 'opportunities' | 'quotes' | 'payments' | 'leads'
  const [activeTab, setActiveTab] = useState<'kanban' | 'opportunities' | 'quotes' | 'payments' | 'leads'>('kanban');

  // Main data states
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_CRM_OPPORTUNITIES);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_CRM_QUOTES);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_CRM_PAYMENTS);
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig>(DEFAULT_PAYMENT_CONFIG);
  const [webLeads, setWebLeads] = useState<{ proposals: any[]; contactInquiries: any[] }>({
    proposals: [],
    contactInquiries: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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
          if (json.data.quotes) setQuotes(json.data.quotes);
          if (json.data.payments) setPayments(json.data.payments);
          if (json.data.paymentConfig) setPaymentConfig(json.data.paymentConfig);
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
    } catch (err) {
      console.warn('Using local fallback for CRM data:', err);
    } finally {
      setIsLoading(false);
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
      await fetch(isNew ? '/api/crm/opportunities' : `/api/crm/opportunities/${opp.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(opp),
      });
    } catch (e) {
      console.error(e);
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
    if (!confirm('¿Deseas eliminar esta oportunidad del pipeline?')) return;
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
    if (!confirm('¿Deseas eliminar este presupuesto?')) return;
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

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800">
      
      {/* Top Banner Notification */}
      {copiedNotification && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* KPI Metrics Ribbon */}
      <div className="p-4 sm:p-6 border-b border-slate-200/90 bg-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase tracking-wider">
                Operaciones Comerciales
              </span>
              <span className="text-[11px] font-mono text-slate-400">Stack: Render + Vercel + Supabase</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              CRM Operativo & Gestión de Servicios
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

        {/* 5-Card Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
      </div>

      {/* Main CRM Navigation Tabs */}
      <div className="px-6 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('kanban')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'kanban'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Embudo Kanban ({opportunities.length})</span>
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

      {/* Main Work Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        
        {/* ============================================================
            TAB 1: KANBAN PIPELINE FUNNEL
        ============================================================ */}
        {activeTab === 'kanban' && (
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
      </div>

      {/* MODALS */}
      <OpportunityModal
        isOpen={isOppModalOpen}
        onClose={() => setIsOppModalOpen(false)}
        onSaveOpportunity={handleSaveOpportunity}
        initialOpportunity={selectedOpp}
        initialStage={targetOppStage}
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
