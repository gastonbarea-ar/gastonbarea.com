import React, { useState } from 'react';
import { X, MessageSquare, Mail, Copy, Check, ExternalLink, Sparkles, Send } from 'lucide-react';
import { Quote } from '../../../types/crm';
import { DEFAULT_QUOTE_TEMPLATES } from '../../../data/crmTemplates';

interface FastReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  onQuoteDispatched?: (updatedQuote: Quote) => void;
}

export const FastReplyModal: React.FC<FastReplyModalProps> = ({
  isOpen,
  onClose,
  quote,
  onQuoteDispatched,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp');
  const [copiedText, setCopiedText] = useState<'whatsapp' | 'emailSubject' | 'emailBody' | null>(null);
  const [clientPhone, setClientPhone] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchFeedback, setDispatchFeedback] = useState<{
    ok: boolean;
    msg: string;
    waUrl?: string;
  } | null>(null);

  if (!isOpen || !quote) return null;

  // Find matching template fast reply copy or generate smart fallback
  const template = DEFAULT_QUOTE_TEMPLATES.find((t) => t.serviceCategory === quote.serviceCategory);

  const clientName = quote.clientName || 'Estimado/a';
  const companyName = quote.clientCompany || 'su empresa';
  const totalPriceFormatted = `${quote.currency} $${quote.total.toLocaleString()}`;
  const timeline = quote.timeline || '3 a 5 semanas';
  const quoteNumber = quote.quoteNumber;
  const quoteLink = quote.paymentLink || `https://www.gastonbarea.com/#portal`;

  const replaceTokens = (rawText: string) => {
    return rawText
      .replace(/{CLIENT_NAME}/g, clientName)
      .replace(/{COMPANY_NAME}/g, companyName)
      .replace(/{TOTAL_PRICE}/g, totalPriceFormatted)
      .replace(/{TIMELINE}/g, timeline)
      .replace(/{QUOTE_NUMBER}/g, quoteNumber)
      .replace(/{QUOTE_LINK}/g, quoteLink);
  };

  const defaultWhatsappText = template?.fastReplyTemplates?.whatsapp
    ? replaceTokens(template.fastReplyTemplates.whatsapp)
    : `Hola ${clientName}, te comparto el presupuesto para *${quote.title}* de ${companyName}.\n\n💰 Inversión: ${totalPriceFormatted}\n⏱️ Plazo: ${timeline}\n\nPresupuesto formal en tu Portal de Clientes: ${quoteLink}\nQuedo a tu disposición para coordinar una llamada y avanzar.`;

  const defaultEmailSubject = template?.fastReplyTemplates?.emailSubject
    ? replaceTokens(template.fastReplyTemplates.emailSubject)
    : `Propuesta Técnica & Presupuesto #${quote.quoteNumber}: ${quote.title} - Gastón Barea`;

  const defaultEmailBody = template?.fastReplyTemplates?.emailBody
    ? replaceTokens(template.fastReplyTemplates.emailBody)
    : `Estimado/a ${clientName},

Comparto la propuesta formal para ${quote.title} de ${companyName}.

- Inversión total: ${totalPriceFormatted}
- Tiempo de ejecución: ${timeline}
- Presupuesto formal número: ${quoteNumber}

Quedo atento a tus comentarios para coordinar el inicio.

Saludos cordiales,
Gastón Barea
www.gastonbarea.com`;

  const [whatsappText, setWhatsappText] = useState(defaultWhatsappText);
  const [emailSubject, setEmailSubject] = useState(defaultEmailSubject);
  const [emailBody, setEmailBody] = useState(defaultEmailBody);

  const handleCopy = (text: string, type: 'whatsapp' | 'emailSubject' | 'emailBody') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleDispatchOfficial = async (channels: ('email' | 'whatsapp')[]) => {
    setIsDispatching(true);
    setDispatchFeedback(null);
    const passkey = localStorage.getItem('gb_master_passkey') || 'gaston2026';
    const token = localStorage.getItem('gb_admin_token') || '';

    try {
      const res = await fetch(`/api/crm/quotes/${quote.id}/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
          'x-admin-token': token,
        },
        body: JSON.stringify({
          channels,
          customSubject: emailSubject,
          customIntroMessage: channels.includes('whatsapp') ? whatsappText : emailBody,
          clientPhone: clientPhone.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.quote && onQuoteDispatched) {
          onQuoteDispatched(data.quote);
        }
        if (channels.includes('email') && data.emailResult?.success) {
          setDispatchFeedback({
            ok: true,
            msg: `¡Presupuesto #${quote.quoteNumber} enviado por Resend desde notificaciones@gastonbarea.com hacia ${quote.clientEmail}! Estado actualizado a 'Enviado'.`,
          });
        } else if (channels.includes('whatsapp')) {
          if (data.whatsappResult?.success) {
            setDispatchFeedback({
              ok: true,
              msg: `¡Mensaje despachado por WhatsApp Business API (${data.whatsappResult.provider}) al +${data.whatsappResult.toPhone}!`,
            });
          } else {
            setDispatchFeedback({
              ok: true,
              msg: `Presupuesto marcado como Enviado. Podés abrir WhatsApp directo con 1 clic en el botón verde.`,
              waUrl: data.whatsappResult?.waMeFallbackUrl,
            });
          }
        }
      } else {
        setDispatchFeedback({
          ok: false,
          msg: data.error || 'No se pudo completar el despacho automático.',
        });
      }
    } catch (err: any) {
      setDispatchFeedback({
        ok: false,
        msg: err?.message || 'Error de red al despachar el presupuesto.',
      });
    } finally {
      setIsDispatching(false);
    }
  };

  const cleanWaDigits = clientPhone.replace(/\D+/g, '');
  const waDirectUrl = cleanWaDigits
    ? `https://wa.me/${cleanWaDigits}?text=${encodeURIComponent(whatsappText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Despacho Automático: WhatsApp Business & Email Oficial Resend
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Presupuesto #{quote.quoteNumber} · {quote.clientName} ({quote.clientEmail || 'Sin email'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1.5 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('whatsapp');
              setDispatchFeedback(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Business (API & Enlace Directo)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setDispatchFeedback(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Email Oficial Resend (notificaciones@gastonbarea.com)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {dispatchFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${
                dispatchFeedback.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {dispatchFeedback.msg}
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                  Teléfono WhatsApp del Cliente (Formato Internacional, ej: 5492804XXXXXX):
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej: 5491155554444 (opcional para enlace directo, requerido para envío API)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Mensaje ejecutivo de WhatsApp Business:</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {whatsappText.length} caracteres
                </span>
              </div>

              <textarea
                rows={8}
                value={whatsappText}
                onChange={(e) => setWhatsappText(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopy(whatsappText, 'whatsapp')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedText === 'whatsapp' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedText === 'whatsapp' ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isDispatching}
                    onClick={() => handleDispatchOfficial(['whatsapp'])}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isDispatching ? 'Despachando...' : 'Despachar vía WhatsApp API'}</span>
                  </button>

                  <a
                    href={waDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Abrir en WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                  Asunto del Correo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(emailSubject, 'emailSubject')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                    title="Copiar asunto"
                  >
                    {copiedText === 'emailSubject' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1">
                  Mensaje Introductorio (Se adjuntan automáticamente la tabla de ítems y los hitos 40·40·20%):
                </label>
                <textarea
                  rows={7}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopy(emailBody, 'emailBody')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedText === 'emailBody' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedText === 'emailBody' ? '¡Copiado!' : 'Copiar Cuerpo'}</span>
                </button>

                <button
                  type="button"
                  disabled={isDispatching || !quote.clientEmail}
                  onClick={() => handleDispatchOfficial(['email'])}
                  className="px-4 py-2.5 rounded-xl bg-[#291B64] hover:bg-[#382586] disabled:opacity-60 text-white font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isDispatching
                      ? 'Enviando por Resend...'
                      : `Enviar Ahora por Resend a ${quote.clientEmail || 'Cliente'}`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
