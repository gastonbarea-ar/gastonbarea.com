import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building,
  Coins,
  ShieldCheck,
  Save,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import { PaymentGatewayConfig } from '../../../types/crm';

interface PaymentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PaymentGatewayConfig;
  onSaveConfig: (newConfig: PaymentGatewayConfig) => void;
}

export const PaymentConfigModal: React.FC<PaymentConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<PaymentGatewayConfig>(config);
  const [activeTab, setActiveTab] = useState<'mercadopago' | 'stripe' | 'transfer' | 'crypto' | 'sheet'>(
    'mercadopago'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const fullPaymentSheetText = `*MEDIOS DE PAGO HABILITADOS - GASTÓN BAREA*

1️⃣ *TRANSFERENCIA BANCARIA (Argentina - ARS / USD)*
- Banco: ${formData.bankTransfer.banco}
- Titular: ${formData.bankTransfer.titular}
- CUIT: ${formData.bankTransfer.cuit}
- CBU: ${formData.bankTransfer.cbu}
- Alias: ${formData.bankTransfer.alias}
- Emisión de Factura Fiscal: Factura ${formData.bankTransfer.facturaTipo}

2️⃣ *MERCADO PAGO (Argentina - Tarjetas & Saldo)*
- Alias / CVU: ${formData.mercadopago.aliasOrCvu}
- Titular: ${formData.mercadopago.titular}
- Link de Cobro: ${formData.mercadopago.defaultCheckoutUrl}

3️⃣ *STRIPE (Pagos Internacionales con Tarjeta USD/EUR)*
- Link Seguro: ${formData.stripe.paymentLinkUrl}
- Monedas Aceptadas: ${formData.stripe.acceptedCurrencies.join(', ')}

4️⃣ *CRIPTOACTIVOS (USDT / USDC)*
- USDT (Red TRC-20): ${formData.crypto.usdtTrc20Address}
- USDC (Red Arbitrum/ERC20): ${formData.crypto.usdcErc20Address}
${formData.crypto.binancePayId ? `- Binance Pay ID: ${formData.crypto.binancePayId}` : ''}

Por favor, una vez cursado el pago, enviar el comprobante para emitir la factura y dar inicio al hito de trabajo.`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Configuración de Medios de Pago & Pasarelas
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Mercado Pago · Stripe · Transferencia Bancaria · Criptoactivos
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('mercadopago')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'mercadopago'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
            <span>Mercado Pago (ARS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stripe')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'stripe'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Stripe (USD/Global)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transfer')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'transfer'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transferencia Bancaria</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crypto')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'crypto'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>Criptoactivos (USDT/USDC)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'sheet'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Ficha para Cliente (1-Click)</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configuración de pasarelas guardada con éxito en backend y Supabase.</span>
            </div>
          )}

          {activeTab === 'mercadopago' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold uppercase tracking-wider text-slate-500">
                  Pasarela Mercado Pago (Argentina)
                </span>
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mercadopago.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mercadopago: { ...formData.mercadopago, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-blue-600"
                  />
                  <span>Habilitado</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    CVU o Alias de Mercado Pago
                  </label>
                  <input
                    type="text"
                    value={formData.mercadopago.aliasOrCvu}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mercadopago: { ...formData.mercadopago, aliasOrCvu: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Titular de la Cuenta
                  </label>
                  <input
                    type="text"
                    value={formData.mercadopago.titular}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mercadopago: { ...formData.mercadopago, titular: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    CUIT del Titular
                  </label>
                  <input
                    type="text"
                    value={formData.mercadopago.cuit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mercadopago: { ...formData.mercadopago, cuit: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Link de Checkout Base / Botón
                  </label>
                  <input
                    type="url"
                    value={formData.mercadopago.defaultCheckoutUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mercadopago: { ...formData.mercadopago, defaultCheckoutUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                  Instrucciones o Notas para el Cliente
                </label>
                <textarea
                  rows={2}
                  value={formData.mercadopago.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mercadopago: { ...formData.mercadopago, notes: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>
          )}

          {activeTab === 'stripe' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold uppercase tracking-wider text-slate-500">
                  Pasarela Stripe (Cobros Internacionales USD/EUR)
                </span>
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.stripe.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stripe: { ...formData.stripe, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>Habilitado</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                  Stripe Payment Link URL
                </label>
                <input
                  type="url"
                  value={formData.stripe.paymentLinkUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stripe: { ...formData.stripe, paymentLinkUrl: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Email de la Cuenta Stripe
                  </label>
                  <input
                    type="email"
                    value={formData.stripe.accountEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stripe: { ...formData.stripe, accountEmail: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Monedas Aceptadas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.stripe.acceptedCurrencies.join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stripe: {
                          ...formData.stripe,
                          acceptedCurrencies: e.target.value.split(',').map((s) => s.trim()),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                  Notas de Pago
                </label>
                <textarea
                  rows={2}
                  value={formData.stripe.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stripe: { ...formData.stripe, notes: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold uppercase tracking-wider text-slate-500">
                  Transferencia Bancaria Tradicional (Argentina & Exterior)
                </span>
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bankTransfer.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankTransfer: { ...formData.bankTransfer, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-emerald-600"
                  />
                  <span>Habilitado</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Entidad Bancaria
                  </label>
                  <input
                    type="text"
                    value={formData.bankTransfer.banco}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankTransfer: { ...formData.bankTransfer, banco: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Titular de la Cuenta
                  </label>
                  <input
                    type="text"
                    value={formData.bankTransfer.titular}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankTransfer: { ...formData.bankTransfer, titular: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    CBU (22 Dígitos)
                  </label>
                  <input
                    type="text"
                    value={formData.bankTransfer.cbu}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankTransfer: { ...formData.bankTransfer, cbu: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Alias Bancario
                  </label>
                  <input
                    type="text"
                    value={formData.bankTransfer.alias}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankTransfer: { ...formData.bankTransfer, alias: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-blue-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    CUIT del Titular
                  </label>
                  <input
                    type="text"
                    value={formData.bankTransfer.cuit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankTransfer: { ...formData.bankTransfer, cuit: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Tipo de Cuenta
                  </label>
                  <input
                    type="text"
                    value={formData.bankTransfer.tipoCuenta}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankTransfer: { ...formData.bankTransfer, tipoCuenta: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Código SWIFT (Internacional)
                  </label>
                  <input
                    type="text"
                    value={formData.bankTransfer.swift || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankTransfer: { ...formData.bankTransfer, swift: e.target.value },
                      })
                    }
                    placeholder="BSANARBAXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Factura Fiscal Predeterminada
                  </label>
                  <select
                    value={formData.bankTransfer.facturaTipo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankTransfer: {
                          ...formData.bankTransfer,
                          facturaTipo: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    <option value="A">Factura A (Discrimina IVA / Responsable Inscripto)</option>
                    <option value="B">Factura B (Consumidor Final / Exento)</option>
                    <option value="E">Factura E (Exportación de Servicios al Exterior)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crypto' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold uppercase tracking-wider text-slate-500">
                  Criptoactivos & Stablecoins (USDT / USDC)
                </span>
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.crypto.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        crypto: { ...formData.crypto, enabled: e.target.checked },
                      })
                    }
                    className="rounded text-amber-600"
                  />
                  <span>Habilitado</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                  USDT Address (Red TRC-20 Tron)
                </label>
                <input
                  type="text"
                  value={formData.crypto.usdtTrc20Address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      crypto: { ...formData.crypto, usdtTrc20Address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                  USDC / Multi-chain Address (Arbitrum / Polygon / ERC-20)
                </label>
                <input
                  type="text"
                  value={formData.crypto.usdcErc20Address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      crypto: { ...formData.crypto, usdcErc20Address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                  Binance Pay ID (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.crypto.binancePayId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      crypto: { ...formData.crypto, binancePayId: e.target.value },
                    })
                  }
                  placeholder="Ej: 492810432"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {activeTab === 'sheet' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold uppercase tracking-wider text-slate-600">
                  Ficha Unificada de Cobro (Copia en 1-click para WhatsApp o Email)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(fullPaymentSheetText, 'sheet')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedKey === 'sheet' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'sheet' ? '¡Ficha Copiada!' : 'Copiar Ficha Completa'}</span>
                </button>
              </div>

              <textarea
                rows={12}
                readOnly
                value={fullPaymentSheetText}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed"
              />
            </div>
          )}

          {/* Save Button */}
          {activeTab !== 'sheet' && (
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Parámetros de Pasarelas</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
