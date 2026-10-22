import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Layers,
  FileText,
  DollarSign,
  Calendar,
  Sparkles,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Quote, QuoteItem, PaymentMilestone, ServiceCategory } from '../../../types/crm';
import { DEFAULT_QUOTE_TEMPLATES } from '../../../data/crmTemplates';

interface QuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuote: (quote: Quote) => void;
  initialQuote?: Quote | null;
  linkedOpportunity?: {
    id: string;
    title: string;
    clientName: string;
    clientEmail: string;
    company?: string;
    serviceCategory: ServiceCategory;
  } | null;
}

export const QuoteBuilderModal: React.FC<QuoteBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveQuote,
  initialQuote,
  linkedOpportunity,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientCompany, setClientCompany] = useState<string>('');
  const [clientTaxId, setClientTaxId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('odoo_erp');
  const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');
  const [timeline, setTimeline] = useState<string>('4 a 6 semanas');
  const [validUntil, setValidUntil] = useState<string>('');
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [status, setStatus] = useState<Quote['status']>('draft');
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<Quote['preferredPaymentMethod']>('transfer');
  const [paymentLink, setPaymentLink] = useState<string>('');

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const [terms, setTerms] = useState<string[]>([]);

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (initialQuote) {
      setClientName(initialQuote.clientName || '');
      setClientEmail(initialQuote.clientEmail || '');
      setClientCompany(initialQuote.clientCompany || '');
      setClientTaxId(initialQuote.clientTaxId || '');
      setTitle(initialQuote.title || '');
      setServiceCategory(initialQuote.serviceCategory || 'odoo_erp');
      setCurrency(initialQuote.currency || 'USD');
      setTimeline(initialQuote.timeline || '4 semanas');
      setValidUntil(initialQuote.validUntil || '');
      setTaxPercent(initialQuote.taxPercent || 0);
      setStatus(initialQuote.status || 'draft');
      setPreferredPaymentMethod(initialQuote.preferredPaymentMethod || 'transfer');
      setPaymentLink(initialQuote.paymentLink || '');
      setItems(initialQuote.items || []);
      setMilestones(initialQuote.milestones || []);
      setTerms(initialQuote.termsAndConditions || []);
      setSelectedTemplateId('');
    } else if (linkedOpportunity) {
      setClientName(linkedOpportunity.clientName || '');
      setClientEmail(linkedOpportunity.clientEmail || '');
      setClientCompany(linkedOpportunity.company || '');
      setServiceCategory(linkedOpportunity.serviceCategory || 'odoo_erp');
      setTitle(`Presupuesto: ${linkedOpportunity.title}`);
      
      // Auto-load template for this service category
      const matchedTmpl = DEFAULT_QUOTE_TEMPLATES.find(
        (t) => t.serviceCategory === linkedOpportunity.serviceCategory
      ) || DEFAULT_QUOTE_TEMPLATES[0];
      
      loadTemplate(matchedTmpl);
    } else {
      // Default to first template
      loadTemplate(DEFAULT_QUOTE_TEMPLATES[0]);
    }

    if (!validUntil && !initialQuote?.validUntil) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 15);
      setValidUntil(defaultDate.toISOString().split('T')[0]);
    }
  }, [isOpen, initialQuote, linkedOpportunity]);

  const loadTemplate = (tmpl: (typeof DEFAULT_QUOTE_TEMPLATES)[0]) => {
    setSelectedTemplateId(tmpl.id);
    setServiceCategory(tmpl.serviceCategory);
    if (!initialQuote) {
      setTitle(tmpl.suggestedTitle);
      setCurrency(tmpl.defaultCurrency);
      setTimeline(tmpl.suggestedTimeline);
    }

    const newItems: QuoteItem[] = tmpl.items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      description: item.description,
      deliverable: item.deliverable,
      hours: item.hours,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      total: item.unitPrice * item.quantity,
    }));
    setItems(newItems);

    const subtotal = newItems.reduce((acc, curr) => acc + curr.total, 0);
    const newMilestones: PaymentMilestone[] = tmpl.milestones.map((ms, idx) => ({
      id: `ms-${Date.now()}-${idx}`,
      name: ms.name,
      percentage: ms.percentage,
      amount: Math.round(subtotal * (ms.percentage / 100)),
      condition: ms.condition,
      status: 'pending',
    }));
    setMilestones(newMilestones);
    setTerms([...tmpl.terms]);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tmplId = e.target.value;
    const tmpl = DEFAULT_QUOTE_TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) {
      loadTemplate(tmpl);
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const taxAmount = Math.round(subtotal * (taxPercent / 100));
  const total = subtotal + taxAmount;

  // Item management
  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    if (field === 'unitPrice' || field === 'quantity') {
      current.total = Number(current.unitPrice || 0) * Number(current.quantity || 1);
    }
    updated[index] = current;
    setItems(updated);

    // Update milestones amounts proportionally
    const newSubtotal = updated.reduce((acc, curr) => acc + curr.total, 0);
    const newMilestones = milestones.map((ms) => ({
      ...ms,
      amount: Math.round(newSubtotal * (ms.percentage / 100)),
    }));
    setMilestones(newMilestones);
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      description: 'Nuevo entregable o módulo técnico',
      deliverable: 'Detalle de la especificación técnica',
      hours: 10,
      unitPrice: 500,
      quantity: 1,
      total: 500,
    };
    const updated = [...items, newItem];
    setItems(updated);

    const newSubtotal = updated.reduce((acc, curr) => acc + curr.total, 0);
    setMilestones(
      milestones.map((ms) => ({
        ...ms,
        amount: Math.round(newSubtotal * (ms.percentage / 100)),
      }))
    );
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return;

    const savedQuote: Quote = {
      id: initialQuote?.id || `quote-${Date.now()}`,
      quoteNumber:
        initialQuote?.quoteNumber ||
        `GB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      opportunityId: linkedOpportunity?.id || initialQuote?.opportunityId,
      clientName,
      clientEmail,
      clientCompany,
      clientTaxId,
      serviceCategory,
      title,
      currency,
      items,
      subtotal,
      taxPercent,
      total,
      timeline,
      milestones,
      termsAndConditions: terms,
      status,
      validUntil,
      createdAt: initialQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferredPaymentMethod,
      paymentLink,
    };

    onSaveQuote(savedQuote);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {initialQuote ? 'Editar Presupuesto Formal' : 'Generador de Presupuestos & Cotizaciones'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Gastón Barea · CRM & Operaciones Comerciales
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Preset Selector */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Cargar Plantilla Preconfigurada por Servicio:</span>
            </div>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              className="w-full sm:w-auto px-3 py-1.5 bg-white border border-blue-300 rounded-xl text-xs font-semibold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" disabled>Seleccionar Servicio...</option>
              {DEFAULT_QUOTE_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Client & General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Cliente / Contacto *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Empresa / Razón Social
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Ej: Distribuidora Sur S.A."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cliente@empresa.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                CUIT / Identificación Fiscal
              </label>
              <input
                type="text"
                value={clientTaxId}
                onChange={(e) => setClientTaxId(e.target.value)}
                placeholder="30-..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Proposal Title & Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Título del Presupuesto *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Categoría de Servicio
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="odoo_erp">Odoo Community ERP v18</option>
                <option value="ecommerce_b2b2c">E-Commerce B2B2C</option>
                <option value="software_architecture">Arquitectura & Resiliencia</option>
                <option value="fractional_cto">Project Management / Fractional CTO</option>
                <option value="linux_docker">Infraestructura Linux / Docker</option>
                <option value="bi_analytics">Business Intelligence & BI</option>
                <option value="custom">Consultoría Personalizada</option>
              </select>
            </div>
          </div>

          {/* Currency, Timeline, Validity, Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'USD' | 'ARS')}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="USD">USD (Dólares)</option>
                <option value="ARS">ARS (Pesos Arg)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Plazo Estimado
              </label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="Ej: 4 a 6 semanas"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Válido Hasta
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="draft">Borrador</option>
                <option value="sent">Enviado al Cliente</option>
                <option value="accepted">Aceptado</option>
                <option value="declined">Rechazado</option>
                <option value="invoiced">Facturado</option>
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                Ítems & Entregables de la Propuesta ({items.length})
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Ítem</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono font-bold text-slate-400 text-xs pt-1">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Descripción del entregable"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                      <textarea
                        rows={2}
                        value={item.deliverable}
                        onChange={(e) => handleItemChange(idx, 'deliverable', e.target.value)}
                        placeholder="Detalle técnico y criterios de aceptación"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-2 w-36">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-mono">PU:</span>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-right"
                        />
                      </div>
                      <div className="font-mono text-xs font-extrabold text-blue-900">
                        {currency} ${item.total.toLocaleString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Eliminar ítem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxPercent > 0}
                  onChange={(e) => setTaxPercent(e.target.checked ? 21 : 0)}
                  className="rounded text-blue-600"
                />
                <span className="text-xs text-slate-700 font-medium">Aplicar IVA (21%)</span>
              </label>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Subtotal</span>
                <span className="text-xs font-bold text-slate-700">
                  {currency} ${subtotal.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Total Final</span>
                <span className="text-base font-extrabold text-blue-900">
                  {currency} ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Checkout Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Medio de Pago Principal
              </label>
              <select
                value={preferredPaymentMethod}
                onChange={(e) => setPreferredPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
              >
                <option value="transfer">Transferencia Bancaria (CBU / Alias / Factura A o B)</option>
                <option value="mercadopago">Mercado Pago (Link / QR / Débito / Tarjetas ARS)</option>
                <option value="stripe">Stripe (Tarjetas Internacionales USD/EUR)</option>
                <option value="crypto">Criptoactivos (USDT TRC20 / USDC ERC20)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Link de Cobro Directo (Opcional)
              </label>
              <input
                type="url"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="https://mpago.la/... o https://buy.stripe.com/..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Presupuesto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
