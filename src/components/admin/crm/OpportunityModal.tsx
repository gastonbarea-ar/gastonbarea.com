import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp, DollarSign, Building2, User, Mail, Phone, Calendar, Tag } from 'lucide-react';
import { Opportunity, OpportunityStage, ServiceCategory } from '../../../types/crm';

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOpportunity: (opp: Opportunity) => void;
  initialOpportunity?: Opportunity | null;
  initialStage?: OpportunityStage;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  isOpen,
  onClose,
  onSaveOpportunity,
  initialOpportunity,
  initialStage = 'lead',
}) => {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [company, setCompany] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('odoo_erp');
  const [stage, setStage] = useState<OpportunityStage>(initialStage);
  const [value, setValue] = useState<number>(3500);
  const [currency, setCurrency] = useState<'USD' | 'ARS'>('USD');
  const [probability, setProbability] = useState<number>(50);
  const [expectedCloseDate, setExpectedCloseDate] = useState<string>('');
  const [source, setSource] = useState<Opportunity['source']>('manual');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    if (initialOpportunity) {
      setTitle(initialOpportunity.title);
      setClientName(initialOpportunity.clientName);
      setClientEmail(initialOpportunity.clientEmail);
      setClientPhone(initialOpportunity.clientPhone || '');
      setCompany(initialOpportunity.company || '');
      setServiceCategory(initialOpportunity.serviceCategory);
      setStage(initialOpportunity.stage);
      setValue(initialOpportunity.value);
      setCurrency(initialOpportunity.currency);
      setProbability(initialOpportunity.probability);
      setExpectedCloseDate(initialOpportunity.expectedCloseDate || '');
      setSource(initialOpportunity.source);
      setNotes(initialOpportunity.notes || '');
    } else {
      setTitle('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setCompany('');
      setServiceCategory('odoo_erp');
      setStage(initialStage);
      setValue(3500);
      setCurrency('USD');
      setProbability(stage === 'won' ? 100 : stage === 'lost' ? 0 : 40);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);
      setExpectedCloseDate(targetDate.toISOString().split('T')[0]);
      setSource('manual');
      setNotes('');
    }
  }, [isOpen, initialOpportunity, initialStage]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return;

    const opp: Opportunity = {
      id: initialOpportunity?.id || `opp-${Date.now()}`,
      title,
      clientName,
      clientEmail,
      clientPhone,
      company,
      serviceCategory,
      stage,
      value: Number(value) || 0,
      currency,
      probability: Number(probability) || 0,
      expectedCloseDate,
      source,
      notes,
      createdAt: initialOpportunity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      linkedQuoteId: initialOpportunity?.linkedQuoteId,
    };

    onSaveOpportunity(opp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {initialOpportunity ? 'Editar Oportunidad' : 'Nueva Oportunidad de Negocio'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Pipeline de Servicios Gastón Barea
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
              Nombre de la Oportunidad / Proyecto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementación Odoo ERP + E-Commerce B2B"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Contacto Principal *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre y Apellido"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Empresa / Organización
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej: Distribuidora Central S.A."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="contacto@empresa.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+54 9 11 ..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Servicio / Categoría
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
              >
                <option value="odoo_erp">Odoo Community ERP v18</option>
                <option value="ecommerce_b2b2c">Capa E-Commerce B2B2C</option>
                <option value="software_architecture">Arquitectura & Resiliencia Cloud</option>
                <option value="fractional_cto">Project Management / Fractional CTO</option>
                <option value="linux_docker">Infraestructura Linux / Docker</option>
                <option value="bi_analytics">Business Intelligence & BI</option>
                <option value="custom">Consultoría Personalizada</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Etapa del Embudo (Pipeline)
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as OpportunityStage)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-900 focus:bg-white"
              >
                <option value="lead">1. Lead (Nuevo Prospecto)</option>
                <option value="contacted">2. Contactado / Relevamiento</option>
                <option value="proposal_draft">3. En Elaboración de Propuesta</option>
                <option value="proposal_sent">4. Presupuesto Enviado</option>
                <option value="negotiation">5. Negociación / Ajustes</option>
                <option value="won">6. Cerrado Ganado (Won)</option>
                <option value="lost">7. Perdido / Descartado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Valor Estimado
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'USD' | 'ARS')}
                  className="px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Probabilidad ({probability}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={probability}
                onChange={(e) => setProbability(parseInt(e.target.value, 10))}
                className="w-full mt-2 accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Cierre Estimado
              </label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
              Notas, Requerimientos & Seguimiento
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles de la reunión técnica, dolores identificados, expectativas del cliente..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
            />
          </div>

          {/* Action buttons */}
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
              <span>Guardar Oportunidad</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
