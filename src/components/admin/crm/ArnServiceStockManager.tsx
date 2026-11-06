import React, { useState, useMemo } from 'react';
import {
  Layers,
  Users,
  Save,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { ArnServiceStockItem, ServiceCategory } from '../../../types/crm';
import {
  calculateEmployeeTierPricing,
  EMPLOYEE_SCALE_OPTIONS,
} from '../../../utils/arnEngine';

interface ArnServiceStockManagerProps {
  serviceStock: ArnServiceStockItem[];
  passkey: string;
  onUpdateStock: (nextStock: ArnServiceStockItem[]) => void;
  onEmitSimulatedQuote?: (params: {
    stockServiceId: string;
    employeeCount: number;
    clientName: string;
    clientEmail: string;
    companyName: string;
  }) => Promise<void>;
}

const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: 'odoo_erp', label: 'Odoo v18 ERP & Automatización' },
  { value: 'ecommerce_b2b2c', label: 'E-Commerce B2B2C & Pasarelas' },
  { value: 'software_architecture', label: 'Arquitectura de Software & IA (RAG)' },
  { value: 'bi_analytics', label: 'Bioeconomía, Trazabilidad IoT & BI' },
  { value: 'linux_docker', label: 'Infraestructura Linux, Docker & Cloud' },
  { value: 'fractional_cto', label: 'Dirección Ejecutiva PMO / Fractional CTO' },
];

export const ArnServiceStockManager: React.FC<ArnServiceStockManagerProps> = ({
  serviceStock,
  passkey,
  onUpdateStock,
  onEmitSimulatedQuote,
}) => {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isNewFormOpen, setIsNewFormOpen] = useState<boolean>(false);

  // Simulator state
  const [simStockId, setSimStockId] = useState<string>(serviceStock[0]?.id || 'stk-odoo-erp');
  const [simEmployees, setSimEmployees] = useState<number>(10);
  const [simClientName, setSimClientName] = useState<string>('');
  const [simCompanyName, setSimCompanyName] = useState<string>('');
  const [simClientEmail, setSimClientEmail] = useState<string>('');
  const [isEmittingSim, setIsEmittingSim] = useState<boolean>(false);

  // New Stock Service Form state
  const [newName, setNewName] = useState<string>('');
  const [newCode, setNewCode] = useState<string>(`ARN-STK-0${serviceStock.length + 1}`);
  const [newCategory, setNewCategory] = useState<ServiceCategory>('software_architecture');
  const [newValueProp, setNewValueProp] = useState<string>('');
  const [newDeliverablesText, setNewDeliverablesText] = useState<string>('');
  const [newKeywordsText, setNewKeywordsText] = useState<string>('');
  const [newMicroBase, setNewMicroBase] = useState<number>(2400);
  const [newMicroMonthly, setNewMicroMonthly] = useState<number>(250);
  const [newPymeBase, setNewPymeBase] = useState<number>(4100);
  const [newPymeMonthly, setNewPymeMonthly] = useState<number>(420);
  const [newGrandeBase, setNewGrandeBase] = useState<number>(7500);
  const [newGrandeMonthly, setNewGrandeMonthly] = useState<number>(780);
  const [newBlockPrice, setNewBlockPrice] = useState<number>(450);
  const [newBlockMonthly, setNewBlockMonthly] = useState<number>(70);

  const simPreview = useMemo(() => {
    const chosen =
      serviceStock.find((s) => s.id === simStockId) || serviceStock[0];
    return calculateEmployeeTierPricing({
      employeeCount: simEmployees,
      serviceCategory: chosen?.serviceCategory || 'odoo_erp',
      currency: chosen?.currency || 'USD',
      preferredStockId: chosen?.id,
      serviceStock,
    });
  }, [simStockId, simEmployees, serviceStock]);

  const handleFieldChange = (
    id: string,
    updater: (item: ArnServiceStockItem) => ArnServiceStockItem
  ) => {
    const next = serviceStock.map((item) => (item.id === id ? updater(item) : item));
    onUpdateStock(next);
  };

  const handleSaveStockItem = async (item: ArnServiceStockItem) => {
    setSavingId(item.id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/arn/service-stock/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.serviceStock)) {
        onUpdateStock(data.serviceStock);
        setFeedback(
          `✓ Servicio [${item.code}] "${item.name}" actualizado en el Stock ARN (Escalas Micro, PyME y Grande sincronizadas).`
        );
      } else {
        setFeedback(`✓ Valores de [${item.code}] actualizados localmente.`);
      }
    } catch {
      setFeedback(`✓ Valores de [${item.code}] guardados en sesión activa.`);
    } finally {
      setSavingId(null);
      setTimeout(() => setFeedback(null), 4500);
    }
  };

  const handleCreateNewStockItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const payload: ArnServiceStockItem = {
      id: `stk-${Date.now()}`,
      code: newCode.trim() || `ARN-STK-0${serviceStock.length + 1}`,
      serviceCategory: newCategory,
      name: newName.trim(),
      valueProposition:
        newValueProp.trim() ||
        'Solución integral estructurada en esquema de hitos verificables 40% / 40% / 20% con soporte SLA incluido.',
      deliverables: newDeliverablesText
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean),
      keywords: newKeywordsText
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean),
      currency: 'USD',
      active: true,
      scales: {
        micro: {
          tier: 'micro',
          label: 'Escala Micro (1 a 10 empleados)',
          minEmployees: 1,
          maxEmployees: 10,
          includedEmployees: 5,
          baseImplementationPrice: Number(newMicroBase) || 2400,
          monthlySupportPrice: Number(newMicroMonthly) || 250,
          estimatedTimeline: '3 a 5 semanas (Sprints Ágiles)',
        },
        pyme: {
          tier: 'pyme',
          label: 'Escala PyME (11 a 50 empleados)',
          minEmployees: 11,
          maxEmployees: 50,
          includedEmployees: 15,
          baseImplementationPrice: Number(newPymeBase) || 4100,
          monthlySupportPrice: Number(newPymeMonthly) || 420,
          estimatedTimeline: '5 a 8 semanas (Sprints Ágiles)',
        },
        grande: {
          tier: 'grande',
          label: 'Escala Grande / Corporativa (+50 empleados)',
          minEmployees: 51,
          maxEmployees: 9999,
          includedEmployees: 50,
          baseImplementationPrice: Number(newGrandeBase) || 7500,
          monthlySupportPrice: Number(newGrandeMonthly) || 780,
          estimatedTimeline: '8 a 12 semanas (Sprints Ágiles)',
        },
      },
      employeeBlockSize: 5,
      pricePerEmployeeBlock: Number(newBlockPrice) || 450,
      monthlySupportPerEmployeeBlock: Number(newBlockMonthly) || 70,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/arn/service-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.serviceStock)) {
        onUpdateStock(data.serviceStock);
      } else {
        onUpdateStock([payload, ...serviceStock]);
      }
    } catch {
      onUpdateStock([payload, ...serviceStock]);
    }

    setIsNewFormOpen(false);
    setNewName('');
    setNewValueProp('');
    setNewDeliverablesText('');
    setNewKeywordsText('');
    setFeedback(`✓ Nuevo servicio [${payload.code}] incorporado al Stock ARN.`);
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleDeleteStockItem = async (id: string, code: string) => {
    const next = serviceStock.filter((s) => s.id !== id);
    onUpdateStock(next);
    try {
      await fetch(`/api/arn/service-stock/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });
    } catch {
      // ignore
    }
    setFeedback(`Servicio [${code}] removido del Stock ARN.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] text-white p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Layers className="w-4 h-4 shrink-0" />
            <span>STOCK DE SERVICIOS ARN · CONTROL DE ESCALAS (MICRO · PYME · GRANDE)</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Catálogo Maestro de Servicios, Valores Base por Escala e Ítem de Dotación de Empleados
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl">
            Controlá desde acá el precio base de cada servicio para empresas <strong>Micro (1–10 emp.)</strong>,{' '}
            <strong>PyME (11–50 emp.)</strong> y <strong>Grande (+50 emp.)</strong>, junto con el valor por bloque
            de empleados y el abono mensual con soporte SLA incluido. El motor ARN consulta este Stock en tiempo
            real para entregar propuestas de valor ágiles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewFormOpen(!isNewFormOpen)}
          className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 self-start lg:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isNewFormOpen ? 'Cerrar Formulario' : 'Agregar Servicio al Stock ARN'}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* New Service Modal/Collapsible Form */}
      {isNewFormOpen && (
        <form
          onSubmit={handleCreateNewStockItem}
          className="bg-white p-5 border-2 border-[#291B64] space-y-4"
        >
          <div className="text-xs font-mono font-bold uppercase text-[#291B64]">
            Nuevo Servicio para el Stock ARN (con 3 Escalas Base: Micro, PyME y Grande)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono text-slate-600 mb-1">Código</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 text-xs font-mono"
              />
            </div>
            <div className="md:col-span-6">
              <label className="block text-[11px] font-mono text-slate-600 mb-1">
                Nombre del Servicio
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Auditoría Ciberseguridad & Pentesting Industrial"
                className="w-full px-3 py-2 border border-slate-300 text-xs"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-[11px] font-mono text-slate-600 mb-1">Categoría</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 border border-slate-300 text-xs bg-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-600 mb-1">
                Propuesta de Valor (entregada por el ARN al cliente)
              </label>
              <textarea
                rows={2}
                value={newValueProp}
                onChange={(e) => setNewValueProp(e.target.value)}
                placeholder="Describí el impacto directo y beneficio medible para el cliente..."
                className="w-full px-3 py-2 border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-600 mb-1">
                Entregables Auditables (1 por línea)
              </label>
              <textarea
                rows={2}
                value={newDeliverablesText}
                onChange={(e) => setNewDeliverablesText(e.target.value)}
                placeholder="Entregable 1&#10;Entregable 2&#10;Entregable 3"
                className="w-full px-3 py-2 border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
            <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[11px] font-mono font-bold text-slate-800">
                1. ESCALA MICRO (1–10 emp.)
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-500">Base USD</label>
                <input
                  type="number"
                  value={newMicroBase}
                  onChange={(e) => setNewMicroBase(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-500">
                  Soporte Mensual SLA USD
                </label>
                <input
                  type="number"
                  value={newMicroMonthly}
                  onChange={(e) => setNewMicroMonthly(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-200 space-y-2">
              <div className="text-[11px] font-mono font-bold text-indigo-950">
                2. ESCALA PyME (11–50 emp.)
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-500">Base USD</label>
                <input
                  type="number"
                  value={newPymeBase}
                  onChange={(e) => setNewPymeBase(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-500">
                  Soporte Mensual SLA USD
                </label>
                <input
                  type="number"
                  value={newPymeMonthly}
                  onChange={(e) => setNewPymeMonthly(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="text-[11px] font-mono font-bold text-emerald-950">
                3. ESCALA GRANDE (+50 emp.)
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-500">Base USD</label>
                <input
                  type="number"
                  value={newGrandeBase}
                  onChange={(e) => setNewGrandeBase(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-500">
                  Soporte Mensual SLA USD
                </label>
                <input
                  type="number"
                  value={newGrandeMonthly}
                  onChange={(e) => setNewGrandeMonthly(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-200 space-y-2">
              <div className="text-[11px] font-mono font-bold text-amber-950">
                ÍTEM BLOQUE +5 EMPLEADOS
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-500">
                  Adicional Impl. c/5 emp.
                </label>
                <input
                  type="number"
                  value={newBlockPrice}
                  onChange={(e) => setNewBlockPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-500">
                  Adicional Mensual c/5 emp.
                </label>
                <input
                  type="number"
                  value={newBlockMonthly}
                  onChange={(e) => setNewBlockMonthly(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewFormOpen(false)}
              className="px-4 py-2 border border-slate-300 text-xs font-mono cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#291B64] text-white text-xs font-mono font-bold cursor-pointer"
            >
              Guardar Nuevo Servicio en Stock ARN
            </button>
          </div>
        </form>
      )}

      {/* SIMULADOR ÁGIL DEL MOTOR ARN CONSULTANDO EL STOCK EN TIEMPO REAL */}
      <div className="bg-white border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <div className="text-xs font-mono font-bold uppercase text-[#291B64] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Simulador & Emisor Ágil de Propuesta de Valor (Consulta en Vivo al Stock ARN)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Probá cómo la cantidad de empleados determina el tamaño (Micro, PyME o Grande) y cómo el ARN arma los ítems del presupuesto desde el Stock.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900">
            Tamaño Detectado: {simPreview.companyScaleLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Servicio del Stock ARN:
              </label>
              <select
                value={simStockId}
                onChange={(e) => setSimStockId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 text-xs font-semibold bg-slate-50"
              >
                {serviceStock.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.code}] {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Cantidad de Empleados de la Empresa (Determina Tamaño Micro / PyME / Grande):
              </label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {EMPLOYEE_SCALE_OPTIONS.map((opt) => (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() => setSimEmployees(opt.count)}
                    className={`p-2 text-left border text-[11px] font-mono cursor-pointer ${
                      simEmployees === opt.count
                        ? 'bg-[#291B64] text-white border-[#291B64] font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    <div>{opt.shortLabel}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">O ingresá dotación exacta:</span>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={simEmployees}
                  onChange={(e) => setSimEmployees(Math.max(1, Number(e.target.value) || 5))}
                  className="w-24 px-2.5 py-1 border border-slate-300 text-xs font-mono font-bold"
                />
                <span className="text-xs font-mono text-slate-500">empleados</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 text-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div className="text-xs font-mono font-bold text-emerald-400">
                PROPUESTA DE VALOR ÁGIL GENERADA POR ARN [{simPreview.stockService.code}]
              </div>
              <div className="text-xs font-mono text-slate-300">
                Plazo: {simPreview.estimatedTimeline}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {simPreview.stockService.valueProposition}
            </p>

            {/* Explicit Items Breakdown */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-2.5 bg-white/5 border border-white/10 flex items-center justify-between">
                <span>
                  Ítem 1 · Servicio Base [{simPreview.stockService.code}] ({simPreview.companyScaleLabel})
                </span>
                <span className="font-bold text-white">
                  {simPreview.currency} ${simPreview.baseImplementationCost.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/10 flex items-center justify-between">
                <span>
                  Ítem 2 · Dotación de Empleados ({simPreview.employeeCount} emp. · Base escala:{' '}
                  {simPreview.includedEmployeesInScale} emp.)
                </span>
                <span className="font-bold text-emerald-400">
                  +{simPreview.currency} ${simPreview.scaleIncrementCost.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-400/40 flex items-center justify-between">
                <span className="font-bold text-emerald-300">
                  TOTAL IMPLEMENTACIÓN (40/40/20) + ABONO MENSUAL SOPORTE SLA
                </span>
                <span className="font-bold text-emerald-400 text-sm">
                  {simPreview.currency} ${simPreview.totalImplementationCost.toLocaleString()} + $
                  {simPreview.monthlySupportFee.toLocaleString()}/mes
                </span>
              </div>
            </div>

            {/* Optional 1-Click Direct Dispatch from Simulator */}
            {onEmitSimulatedQuote && (
              <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={simClientName}
                  onChange={(e) => setSimClientName(e.target.value)}
                  placeholder="Nombre cliente..."
                  className="px-2.5 py-1.5 bg-black/50 border border-white/20 text-xs text-white"
                />
                <input
                  type="text"
                  value={simCompanyName}
                  onChange={(e) => setSimCompanyName(e.target.value)}
                  placeholder="Empresa..."
                  className="px-2.5 py-1.5 bg-black/50 border border-white/20 text-xs text-white"
                />
                <input
                  type="email"
                  value={simClientEmail}
                  onChange={(e) => setSimClientEmail(e.target.value)}
                  placeholder="Email cliente..."
                  className="px-2.5 py-1.5 bg-black/50 border border-white/20 text-xs text-white"
                />
                <button
                  type="button"
                  disabled={isEmittingSim || !simClientEmail.trim()}
                  onClick={async () => {
                    if (!onEmitSimulatedQuote || !simClientEmail.trim()) return;
                    setIsEmittingSim(true);
                    try {
                      await onEmitSimulatedQuote({
                        stockServiceId: simPreview.stockService.id,
                        employeeCount: simEmployees,
                        clientName: simClientName.trim() || 'Ejecutivo',
                        companyName: simCompanyName.trim() || 'Empresa',
                        clientEmail: simClientEmail.trim(),
                      });
                      setSimClientName('');
                      setSimCompanyName('');
                      setSimClientEmail('');
                    } finally {
                      setIsEmittingSim(false);
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-mono text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isEmittingSim ? 'Emitiendo...' : 'Emitir Propuesta 1-Clic'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARDS DE CONTROL DE CADA SERVICIO DEL STOCK ARN */}
      <div className="space-y-4">
        {serviceStock.map((item) => {
          const isSaving = savingId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 p-5 space-y-4 shadow-2xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#291B64] text-white font-mono text-xs font-bold">
                      {item.code}
                    </span>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleFieldChange(item.id, (prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="font-bold text-slate-900 text-sm sm:text-base border-b border-transparent hover:border-slate-300 focus:border-[#291B64] focus:outline-none px-1 flex-1 min-w-[260px]"
                    />
                  </div>
                  <input
                    type="text"
                    value={item.valueProposition}
                    onChange={(e) =>
                      handleFieldChange(item.id, (prev) => ({
                        ...prev,
                        valueProposition: e.target.value,
                      }))
                    }
                    className="w-full text-xs text-slate-600 border-b border-transparent hover:border-slate-300 focus:border-[#291B64] focus:outline-none px-1 py-0.5"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSaveStockItem(item)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSaving ? 'Guardando...' : 'Guardar Valores'}</span>
                  </button>

                  {serviceStock.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStockItem(item.id, item.code)}
                      title="Eliminar servicio del Stock"
                      className="p-2 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 3 ESCALAS BASE (MICRO, PYME, GRANDE) + CONTROL DE BLOQUE DE EMPLEADOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. MICRO */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      1. ESCALA MICRO
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">1 a 10 empleados</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                        Valor Base ({item.currency})
                      </label>
                      <input
                        type="number"
                        value={item.scales.micro.baseImplementationPrice}
                        onChange={(e) =>
                          handleFieldChange(item.id, (prev) => ({
                            ...prev,
                            scales: {
                              ...prev.scales,
                              micro: {
                                ...prev.scales.micro,
                                baseImplementationPrice: Math.max(0, Number(e.target.value) || 0),
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-mono text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-0.5">
                        Soporte SLA / mes
                      </label>
                      <input
                        type="number"
                        value={item.scales.micro.monthlySupportPrice}
                        onChange={(e) =>
                          handleFieldChange(item.id, (prev) => ({
                            ...prev,
                            scales: {
                              ...prev.scales,
                              micro: {
                                ...prev.scales.micro,
                                monthlySupportPrice: Math.max(0, Number(e.target.value) || 0),
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-mono text-xs font-bold text-emerald-700"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200">
                    <span>Empleados en Base Micro:</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={item.scales.micro.includedEmployees}
                      onChange={(e) =>
                        handleFieldChange(item.id, (prev) => ({
                          ...prev,
                          scales: {
                            ...prev.scales,
                            micro: {
                              ...prev.scales.micro,
                              includedEmployees: Math.max(1, Number(e.target.value) || 5),
                            },
                          },
                        }))
                      }
                      className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 text-center font-bold"
                    />
                  </div>
                </div>

                {/* 2. PYME */}
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-950">
                      2. ESCALA PyME
                    </span>
                    <span className="text-[11px] font-mono text-indigo-700">11 a 50 empleados</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-600 mb-0.5">
                        Valor Base ({item.currency})
                      </label>
                      <input
                        type="number"
                        value={item.scales.pyme.baseImplementationPrice}
                        onChange={(e) =>
                          handleFieldChange(item.id, (prev) => ({
                            ...prev,
                            scales: {
                              ...prev.scales,
                              pyme: {
                                ...prev.scales.pyme,
                                baseImplementationPrice: Math.max(0, Number(e.target.value) || 0),
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-indigo-300 font-mono text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-600 mb-0.5">
                        Soporte SLA / mes
                      </label>
                      <input
                        type="number"
                        value={item.scales.pyme.monthlySupportPrice}
                        onChange={(e) =>
                          handleFieldChange(item.id, (prev) => ({
                            ...prev,
                            scales: {
                              ...prev.scales,
                              pyme: {
                                ...prev.scales.pyme,
                                monthlySupportPrice: Math.max(0, Number(e.target.value) || 0),
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-indigo-300 font-mono text-xs font-bold text-emerald-700"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-1 border-t border-indigo-200/60">
                    <span>Empleados en Base PyME:</span>
                    <input
                      type="number"
                      min={11}
                      max={50}
                      value={item.scales.pyme.includedEmployees}
                      onChange={(e) =>
                        handleFieldChange(item.id, (prev) => ({
                          ...prev,
                          scales: {
                            ...prev.scales,
                            pyme: {
                              ...prev.scales.pyme,
                              includedEmployees: Math.max(5, Number(e.target.value) || 15),
                            },
                          },
                        }))
                      }
                      className="w-14 px-1.5 py-0.5 bg-white border border-indigo-300 text-center font-bold"
                    />
                  </div>
                </div>

                {/* 3. GRANDE */}
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-950">
                      3. ESCALA GRANDE
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800">+50 empleados</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-600 mb-0.5">
                        Valor Base ({item.currency})
                      </label>
                      <input
                        type="number"
                        value={item.scales.grande.baseImplementationPrice}
                        onChange={(e) =>
                          handleFieldChange(item.id, (prev) => ({
                            ...prev,
                            scales: {
                              ...prev.scales,
                              grande: {
                                ...prev.scales.grande,
                                baseImplementationPrice: Math.max(0, Number(e.target.value) || 0),
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 font-mono text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-600 mb-0.5">
                        Soporte SLA / mes
                      </label>
                      <input
                        type="number"
                        value={item.scales.grande.monthlySupportPrice}
                        onChange={(e) =>
                          handleFieldChange(item.id, (prev) => ({
                            ...prev,
                            scales: {
                              ...prev.scales,
                              grande: {
                                ...prev.scales.grande,
                                monthlySupportPrice: Math.max(0, Number(e.target.value) || 0),
                              },
                            },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 font-mono text-xs font-bold text-emerald-700"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-1 border-t border-emerald-200/60">
                    <span>Empleados en Base Grande:</span>
                    <input
                      type="number"
                      min={50}
                      max={1000}
                      value={item.scales.grande.includedEmployees}
                      onChange={(e) =>
                        handleFieldChange(item.id, (prev) => ({
                          ...prev,
                          scales: {
                            ...prev.scales,
                            grande: {
                              ...prev.scales.grande,
                              includedEmployees: Math.max(25, Number(e.target.value) || 50),
                            },
                          },
                        }))
                      }
                      className="w-14 px-1.5 py-0.5 bg-white border border-emerald-300 text-center font-bold"
                    />
                  </div>
                </div>

                {/* 4. ITEM DOTACIÓN DE EMPLEADOS (INCREMENTO CADA N EMPLEADOS) */}
                <div className="p-3.5 bg-amber-50/50 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-950 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>ÍTEM DOTACIÓN</span>
                    </span>
                    <span className="text-[11px] font-mono text-amber-800">
                      Cada {item.employeeBlockSize} emp. extra
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-600 mb-0.5">
                        +Impl. c/{item.employeeBlockSize} emp.
                      </label>
                      <input
                        type="number"
                        value={item.pricePerEmployeeBlock}
                        onChange={(e) =>
                          handleFieldChange(item.id, (prev) => ({
                            ...prev,
                            pricePerEmployeeBlock: Math.max(0, Number(e.target.value) || 0),
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-300 font-mono text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-600 mb-0.5">
                        +Soporte c/{item.employeeBlockSize} emp.
                      </label>
                      <input
                        type="number"
                        value={item.monthlySupportPerEmployeeBlock}
                        onChange={(e) =>
                          handleFieldChange(item.id, (prev) => ({
                            ...prev,
                            monthlySupportPerEmployeeBlock: Math.max(
                              0,
                              Number(e.target.value) || 0
                            ),
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-300 font-mono text-xs font-bold text-emerald-700"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-1 border-t border-amber-200/60">
                    <span>Tamaño bloque (emp.):</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={item.employeeBlockSize}
                      onChange={(e) =>
                        handleFieldChange(item.id, (prev) => ({
                          ...prev,
                          employeeBlockSize: Math.max(1, Number(e.target.value) || 5),
                        }))
                      }
                      className="w-14 px-1.5 py-0.5 bg-white border border-amber-300 text-center font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
