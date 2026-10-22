import React, { useState } from 'react';
import { X, Save, CheckCircle2, DollarSign, Calendar, FileText } from 'lucide-react';
import { PaymentRecord, Quote } from '../../../types/crm';

interface PaymentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePayment: (payment: PaymentRecord) => void;
  quotes: Quote[];
  preselectedQuoteId?: string;
}

export const PaymentRecordModal: React.FC<PaymentRecordModalProps> = ({
  isOpen,
  onClose,
  onSavePayment,
  quotes,
  preselectedQuoteId,
}) => {
  const selectedQuote = quotes.find((q) => q.id === preselectedQuoteId || q.quoteNumber === preselectedQuoteId);

  const [quoteId, setQuoteId] = useState<string>(preselectedQuoteId || '');
  const [clientName, setClientName] = useState<string>(selectedQuote?.clientName || '');
  const [amount, setAmount] = useState<number>(selectedQuote ? Math.round(selectedQuote.total * 0.5) : 1500);
  const [currency, setCurrency] = useState<'USD' | 'ARS'>(selectedQuote?.currency || 'USD');
  const [method, setMethod] = useState<PaymentRecord['method']>('transfer');
  const [status, setStatus] = useState<PaymentRecord['status']>('confirmed');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleQuoteChange = (selectedId: string) => {
    setQuoteId(selectedId);
    const q = quotes.find((x) => x.id === selectedId || x.quoteNumber === selectedId);
    if (q) {
      setClientName(q.clientName + (q.clientCompany ? ` (${q.clientCompany})` : ''));
      setAmount(Math.round(q.total * 0.4)); // default 40% anticipo
      setCurrency(q.currency);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !amount) return;

    const payment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      quoteId: quoteId || undefined,
      clientName,
      amount: Number(amount),
      currency,
      method,
      status,
      transactionRef: transactionRef || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      confirmedAt: status === 'confirmed' ? new Date().toISOString() : undefined,
    };

    onSavePayment(payment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Registrar Cobro / Comprobante
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Control de Ingresos de Servicios Gastón Barea
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Quote association */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
              Vincular a Presupuesto (Opcional)
            </label>
            <select
              value={quoteId}
              onChange={(e) => handleQuoteChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white cursor-pointer"
            >
              <option value="">Sin vincular (Cobro directo / Retainer)</option>
              {quotes.map((q) => (
                <option key={q.id} value={q.quoteNumber}>
                  {q.quoteNumber} - {q.clientName} ({q.title}) - {q.currency} ${q.total.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
              Cliente / Razón Social *
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Monto Cobrado *
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900"
              >
                <option value="USD">USD (Dólares)</option>
                <option value="ARS">ARS (Pesos Arg)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Canal / Medio de Pago
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              >
                <option value="transfer">Transferencia Bancaria (CBU)</option>
                <option value="mercadopago">Mercado Pago</option>
                <option value="stripe">Stripe (Tarjeta)</option>
                <option value="crypto">Cripto (USDT/USDC)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                Estado del Cobro
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-800"
              >
                <option value="confirmed">Acreditado / Confirmado</option>
                <option value="pending">Pendiente de Acreditación</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
              Referencia / Comprobante / TxHash
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="Ej: TRANS-BCO-884920 o 0x8823..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
              Observaciones / Hito Cubierto
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Anticipo 50% por inicio de Sprint 1"
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Registrar Cobro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
