import React from 'react';
import { X, Printer, Share2, Check, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { Quote, PaymentGatewayConfig, QuoteItem, PaymentMilestone } from '../../../types/crm';
import { SITE_CONFIG } from '../../../data/siteConfig';

interface QuotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  paymentConfig: PaymentGatewayConfig;
}

export const QuotePreviewModal: React.FC<QuotePreviewModalProps> = ({
  isOpen,
  onClose,
  quote,
  paymentConfig,
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!isOpen || !quote) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `Presupuesto Oficial ${quote.quoteNumber} - ${quote.title}\nCliente: ${quote.clientName} (${quote.clientCompany || ''})\nTotal: ${quote.currency} $${quote.total.toLocaleString()}\nPlazo: ${quote.timeline}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold">
              {quote.quoteNumber}
            </span>
            <span className="text-sm font-semibold truncate max-w-md text-slate-200">
              Vista Formal de Presupuesto
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? '¡Copiado!' : 'Compartir'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 text-slate-800 space-y-8 bg-white print:p-0 print:m-0 print:overflow-visible">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-900 flex items-center justify-center font-mono font-bold text-white text-sm shadow-xs">
                  GB
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-950">
                    {SITE_CONFIG.name}
                  </h1>
                  <p className="text-xs text-slate-500 font-mono">
                    Consultoría Tecnológica & Arquitectura de Software
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 font-mono space-y-0.5 pt-1">
                <div>Email: {SITE_CONFIG.email}</div>
                <div>Web: {SITE_CONFIG.domain}</div>
                <div>Ubicación: {SITE_CONFIG.location}</div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 font-mono text-xs">
              <div className="text-lg font-bold text-blue-900">{quote.quoteNumber}</div>
              <div className="text-slate-600">
                Fecha de Emisión: <strong>{quote.createdAt.split('T')[0]}</strong>
              </div>
              <div className="text-slate-600">
                Válido hasta: <strong className="text-amber-800">{quote.validUntil}</strong>
              </div>
              <div className="pt-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  quote.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                  quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  quote.status === 'invoiced' ? 'bg-purple-100 text-purple-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  Estado: {quote.status}
                </span>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Preparado para:
              </span>
              <div className="font-bold text-slate-900 text-sm">{quote.clientName}</div>
              {quote.clientCompany && (
                <div className="text-slate-700 font-medium">{quote.clientCompany}</div>
              )}
              {quote.clientTaxId && (
                <div className="text-slate-500 font-mono text-[11px]">CUIT/Tax ID: {quote.clientTaxId}</div>
              )}
              <div className="text-slate-600 font-mono text-[11px]">{quote.clientEmail}</div>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Especificación del Servicio:
              </span>
              <div className="font-bold text-blue-950 text-sm">{quote.title}</div>
              <div className="text-slate-600 mt-1">
                Plazo Estimado de Ejecución: <strong className="text-slate-900">{quote.timeline}</strong>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Desglose de Alcances & Entregables
            </h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Descripción & Entregable</th>
                    <th className="py-3 px-3 text-right">Cant.</th>
                    <th className="py-3 px-4 text-right">Precio Unit.</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {quote.items.map((item: QuoteItem, idx: number) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.description}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{item.deliverable}</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium">
                        {quote.currency} ${item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {quote.currency} ${item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-mono text-xs border-t border-slate-200">
                    <td colSpan={3} className="py-3 px-4 text-right font-medium text-slate-600">Subtotal:</td>
                    <td colSpan={2} className="py-3 px-4 text-right font-bold text-slate-900">
                      {quote.currency} ${quote.subtotal.toLocaleString()}
                    </td>
                  </tr>
                  {quote.taxPercent > 0 && (
                    <tr className="bg-slate-50 font-mono text-xs">
                      <td colSpan={3} className="py-1 px-4 text-right font-medium text-slate-600">IVA ({quote.taxPercent}%):</td>
                      <td colSpan={2} className="py-1 px-4 text-right font-bold text-slate-900">
                        {quote.currency} ${Math.round(quote.subtotal * (quote.taxPercent / 100)).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-blue-50/80 font-mono text-sm border-t border-blue-200 text-blue-950">
                    <td colSpan={3} className="py-3.5 px-4 text-right font-bold uppercase tracking-wider">Inversión Total:</td>
                    <td colSpan={2} className="py-3.5 px-4 text-right font-extrabold text-blue-900 text-base">
                      {quote.currency} ${quote.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Milestones */}
          {quote.milestones && quote.milestones.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                Cronograma de Pagos por Hitos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {quote.milestones.map((ms: PaymentMilestone, idx: number) => (
                  <div key={ms.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-blue-900">{ms.percentage}%</span>
                      <span className="text-[11px] font-bold text-slate-900">
                        {quote.currency} ${ms.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 leading-snug">{ms.name}</div>
                    <div className="text-[11px] text-slate-500 leading-tight">{ms.condition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Gateways & Options */}
          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-blue-950 font-bold font-mono uppercase text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Instrucciones & Medios de Pago Habilitados</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-700">
              <div className="space-y-1 bg-white p-3.5 rounded-xl border border-blue-100">
                <strong className="text-blue-900 block font-mono text-xs">1. Mercado Pago & Transferencia Bancaria (Argentina)</strong>
                <div>CBU: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-900">{paymentConfig.bankTransfer.cbu}</code></div>
                <div>Alias: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-blue-700">{paymentConfig.bankTransfer.alias}</code></div>
                <div>Titular: {paymentConfig.bankTransfer.titular} (CUIT: {paymentConfig.bankTransfer.cuit})</div>
                <div>Facturación: Emisión de Factura Fiscal {paymentConfig.bankTransfer.facturaTipo}.</div>
              </div>
              <div className="space-y-1 bg-white p-3.5 rounded-xl border border-blue-100">
                <strong className="text-blue-900 block font-mono text-xs">2. Pagos Internacionales (Stripe / Crypto)</strong>
                <div>Stripe (Tarjetas USD/EUR): <span className="font-mono text-slate-800">{paymentConfig.stripe.paymentLinkUrl}</span></div>
                <div>USDT (TRC-20): <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px] text-slate-900 break-all">{paymentConfig.crypto.usdtTrc20Address}</code></div>
                <div>Código SWIFT bancario para giros al exterior disponible a solicitud.</div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {quote.termsAndConditions && quote.termsAndConditions.length > 0 && (
            <div className="space-y-2 text-[11px] text-slate-500 border-t border-slate-200 pt-5">
              <span className="font-mono font-bold uppercase tracking-wider text-slate-700 block text-xs">
                Condiciones Comerciales & Validez
              </span>
              <ul className="list-disc pl-4 space-y-1">
                {quote.termsAndConditions.map((t: string, idx: number) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Signature Block */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-600">
            <div>
              <div className="font-bold text-slate-900">{SITE_CONFIG.name}</div>
              <div className="font-mono text-[11px]">Consultoría Tecnológica & Arquitectura de Software</div>
              <div className="font-mono text-[10px] text-slate-400">Documento digital verificado</div>
            </div>
            <div className="text-right sm:w-64 pt-6 border-t border-slate-300">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Aprobación del Cliente
              </span>
              <div className="text-slate-400 italic text-[11px]">Firma / Aceptación Digital</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
