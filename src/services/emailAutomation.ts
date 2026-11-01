import { SITE_CONFIG } from '../data/siteConfig.ts';

function resolveEmailConfig() {
  const rawResendKey = process.env.RESEND_API_KEY?.trim() || '';
  const rawSenderKey = process.env.SENDER_API_KEY?.trim() || '';

  const isPlaceholder = (val: string) =>
    !val ||
    val === 'your_sender_api_token' ||
    val === 're_your_resend_api_key' ||
    val === 'MY_RESEND_API_KEY';

  const activeApiKey = !isPlaceholder(rawResendKey)
    ? rawResendKey
    : !isPlaceholder(rawSenderKey)
    ? rawSenderKey
    : '';

  // Use Resend.com by default (or whenever RESEND_API_KEY is set or key starts with re_)
  const useSenderNet =
    process.env.EMAIL_PROVIDER?.toLowerCase() === 'sender' &&
    !rawResendKey &&
    !activeApiKey.startsWith('re_');

  const fromEmail = process.env.FROM_EMAIL?.trim() || 'notificaciones@gastonbarea.com';
  const fromName = process.env.FROM_NAME?.trim() || 'Gastón Barea';
  const notificationEmail =
    process.env.NOTIFICATION_EMAIL?.trim() || 'notificaciones@gastonbarea.com';
  const backupNotificationEmail =
    process.env.BACKUP_NOTIFICATION_EMAIL?.trim() ||
    SITE_CONFIG.email ||
    'gastonbarea.com@gmail.com';

  return {
    activeApiKey,
    configured: Boolean(activeApiKey),
    provider: useSenderNet ? 'sender.net' : 'resend.com',
    keySource: !isPlaceholder(rawResendKey)
      ? 'RESEND_API_KEY'
      : !isPlaceholder(rawSenderKey)
      ? 'SENDER_API_KEY'
      : 'none',
    fromEmail,
    fromName,
    notificationEmail,
    backupNotificationEmail,
    cyberpanelServerIp: '138.219.41.106',
    domain: 'gastonbarea.com',
  };
}

export function getEmailConfigStatus() {
  const cfg = resolveEmailConfig();
  return {
    configured: cfg.configured,
    provider: cfg.provider,
    keySource: cfg.keySource,
    fromEmail: cfg.fromEmail,
    fromName: cfg.fromName,
    notificationEmail: cfg.notificationEmail,
    backupNotificationEmail: cfg.backupNotificationEmail,
    cyberpanelServerIp: cfg.cyberpanelServerIp,
    domain: cfg.domain,
  };
}

export interface ProposalPayload {
  organizationType: string;
  companyName?: string;
  primaryChallenge: string;
  currentStack?: string[];
  urgency?: string;
  architectureTitle: string;
  diagnosticSummary: string;
  estimatedTimeline: string;
  recommendedStack?: string[];
  executiveMessage: string;
  clientEmail?: string;
  clientName?: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  serviceArea: string;
  requirements: string;
}

interface OutboundEmailMessage {
  to: { email: string; name?: string } | { email: string; name?: string }[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Dispatches transactional email via Resend.com API (https://api.resend.com/emails)
 * with automatic compatibility fallback for Sender.net if explicitly configured.
 */
async function dispatchTransactionalEmail(message: OutboundEmailMessage) {
  const cfg = resolveEmailConfig();
  const recipients = Array.isArray(message.to) ? message.to : [message.to];
  const uniqueEmails = Array.from(
    new Set(recipients.map((r) => r.email.trim()).filter((e) => /\S+@\S+\.\S+/.test(e)))
  );

  if (uniqueEmails.length === 0) {
    throw new Error('No se especificó ningún destinatario válido.');
  }

  if (cfg.provider === 'resend.com') {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.activeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${cfg.fromName} <${cfg.fromEmail}>`,
        to: uniqueEmails,
        reply_to: message.replyTo || cfg.notificationEmail,
        subject: message.subject,
        html: message.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Resend API HTTP ${response.status}: ${errorText}`);
    }

    return response.json().catch(() => ({ status: 'sent', provider: 'resend.com' }));
  }

  // Fallback to Sender.net if explicitly chosen
  const primaryRecipient = recipients[0];
  const response = await fetch('https://api.sender.net/v2/message/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.activeApiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      from: {
        email: cfg.fromEmail,
        name: cfg.fromName,
      },
      to: {
        email: primaryRecipient.email,
        name: primaryRecipient.name || primaryRecipient.email.split('@')[0],
      },
      subject: message.subject,
      html: message.html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Sender API HTTP ${response.status}: ${errorText}`);
  }

  return response.json().catch(() => ({ status: 'sent', provider: 'sender.net' }));
}

/**
 * Generates an executive responsive HTML email
 */
function buildProposalHtml(data: ProposalPayload): string {
  const cfg = resolveEmailConfig();
  const calendlyUrl = process.env.VITE_CALENDLY_URL || SITE_CONFIG.booking.calendlyUrl;
  const stackItems = (data.recommendedStack || [])
    .map(
      (tech) =>
        `<span style="display:inline-block;background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;padding:4px 10px;border-radius:12px;font-size:12px;font-family:monospace;margin:2px 4px 4px 0;">${tech}</span>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Especificación de Arquitectura de Software</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" style="max-width:600px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.04);">
          
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#091428 0%,#172554 100%);color:#ffffff;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-family:monospace;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#38bdf8;background:rgba(56,189,248,0.15);padding:3px 8px;border-radius:6px;border:1px solid rgba(56,189,248,0.25);">
                      DIAGNÓSTICO TÉCNICO & ARQUITECTURA
                    </span>
                    <h1 style="margin:12px 0 4px 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.2;">
                      ${data.architectureTitle}
                    </h1>
                    <p style="margin:0;font-size:13px;color:#93c5fd;">
                      Gastón Barea · Software Architect & Business Innovation
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="font-size:14px;color:#475569;margin-top:0;">
                Hola <strong>${data.clientName || 'Colega'}</strong>,
              </p>
              <p style="font-size:14px;line-height:1.6;color:#334155;">
                Hemos registrado y procesado tu solicitud de diagnóstico técnico para <strong>${data.companyName || data.organizationType}</strong>. A continuación, te compartimos el resumen ejecutivo de la solución diseñada:
              </p>

              <!-- Diagnostic Callout -->
              <div style="background:#f1f5f9;border-left:4px solid #2563eb;padding:16px;border-radius:8px;margin:20px 0;">
                <div style="font-size:11px;font-family:monospace;font-weight:700;color:#2563eb;text-transform:uppercase;margin-bottom:4px;">
                  Diagnóstico Preliminar
                </div>
                <div style="font-size:13px;line-height:1.6;color:#1e293b;">
                  ${data.diagnosticSummary}
                </div>
              </div>

              <!-- Specs Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;">
                <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc;">
                  <td style="padding:10px 14px;font-weight:600;color:#64748b;width:35%;">Plazo Estimado</td>
                  <td style="padding:10px 14px;font-weight:600;color:#0f172a;">${data.estimatedTimeline}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 14px;font-weight:600;color:#64748b;">Nivel de Urgencia</td>
                  <td style="padding:10px 14px;font-weight:600;color:#0f172a;">${data.urgency || 'Media'}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;font-weight:600;color:#64748b;vertical-align:top;">Stack Aconsejado</td>
                  <td style="padding:10px 14px;">${stackItems}</td>
                </tr>
              </table>

              <!-- Executive Message -->
              <div style="margin:24px 0;padding:18px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
                <div style="font-size:11px;font-family:monospace;font-weight:700;color:#16a34a;text-transform:uppercase;margin-bottom:4px;">
                  Mensaje Estratégico de Gastón
                </div>
                <div style="font-size:13px;line-height:1.6;color:#14532d;font-style:italic;">
                  "${data.executiveMessage}"
                </div>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin:32px 0 16px 0;">
                <a href="${calendlyUrl}" target="_blank" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;box-shadow:0 2px 6px rgba(37,99,235,0.3);">
                  Coordinar Reunión Técnica (30 min) &rarr;
                </a>
                <div style="font-size:11px;color:#94a3b8;margin-top:8px;">
                  Sin costo de evaluación inicial · Análisis de factibilidad directa
                </div>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">
              <div><strong>Gastón Barea</strong> · Arquitectura de Software & Business Innovación</div>
              <div style="margin-top:4px;">Chubut, Patagonia Argentina · Proyectos Remotos Globales</div>
              <div style="margin-top:4px;font-size:11px;color:#94a3b8;">
                <a href="https://gastonbarea.com" style="color:#2563eb;text-decoration:none;">gastonbarea.com</a> · 
                <a href="mailto:${cfg.fromEmail}" style="color:#2563eb;text-decoration:none;">${cfg.fromEmail}</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Dispatches automated emails via Resend.com for new proposals:
 * 1. To the client (if email was provided)
 * 2. To Gastón Barea (notificaciones@gastonbarea.com + backup email)
 */
export async function sendProposalAutomation(payload: ProposalPayload) {
  const cfg = resolveEmailConfig();

  if (!cfg.configured) {
    console.info(
      '[Email Notification - Resend] RESEND_API_KEY / SENDER_API_KEY pendiente de configurar. Correo registrado en modo local:'
    );
    console.info(`- Notificación a: ${cfg.notificationEmail}`);
    if (payload.clientEmail) {
      console.info(`- Confirmación a cliente: ${payload.clientEmail}`);
    }
    return { success: true, mocked: true, provider: cfg.provider };
  }

  try {
    const htmlContent = buildProposalHtml(payload);
    const emailPromises: Promise<any>[] = [];

    // 1. Send confirmation to client if provided
    if (payload.clientEmail && /\S+@\S+\.\S+/.test(payload.clientEmail)) {
      emailPromises.push(
        dispatchTransactionalEmail({
          to: { email: payload.clientEmail, name: payload.clientName },
          replyTo: cfg.notificationEmail,
          subject: `Especificación de Arquitectura: ${payload.architectureTitle} [Gastón Barea]`,
          html: htmlContent,
        })
      );
    }

    // 2. Send instant briefing alert to Gastón (notificaciones@gastonbarea.com + backup)
    const internalRecipients = [
      { email: cfg.notificationEmail, name: 'Gastón Barea' },
      ...(cfg.backupNotificationEmail && cfg.backupNotificationEmail !== cfg.notificationEmail
        ? [{ email: cfg.backupNotificationEmail, name: 'Gastón Barea' }]
        : []),
    ];

    emailPromises.push(
      dispatchTransactionalEmail({
        to: internalRecipients,
        replyTo: payload.clientEmail || cfg.notificationEmail,
        subject: `[NUEVO PROSPECTO] ${payload.companyName || payload.organizationType} - Urgencia: ${payload.urgency || 'Media'}`,
        html: `
          <div style="font-family:sans-serif;padding:16px;">
            <h2 style="color:#1e3a8a;">Nuevo Diagnóstico Generado en gastonbarea.com</h2>
            <p><strong>Organización:</strong> ${payload.organizationType} (${payload.companyName || 'No indicado'})</p>
            <p><strong>Desafío Principal:</strong> ${payload.primaryChallenge}</p>
            <p><strong>Stack Actual:</strong> ${(payload.currentStack || []).join(', ') || 'Sin especificar'}</p>
            <p><strong>Urgencia:</strong> ${payload.urgency || 'Media'}</p>
            <p><strong>Email Cliente:</strong> ${payload.clientEmail || 'No provisto en este paso'}</p>
            <hr />
            <h3>Solución Propuesta:</h3>
            <p><strong>Título:</strong> ${payload.architectureTitle}</p>
            <p><strong>Plazo:</strong> ${payload.estimatedTimeline}</p>
            <p><strong>Diagnóstico:</strong> ${payload.diagnosticSummary}</p>
            <p><strong>Stack Recomendado:</strong> ${(payload.recommendedStack || []).join(', ')}</p>
          </div>
        `,
      })
    );

    const results = await Promise.all(emailPromises);
    return { success: true, provider: cfg.provider, results };
  } catch (error: any) {
    console.error('[Email Automation] Error enviando correos automatizados:', error);
    return { success: false, provider: cfg.provider, error: error.message };
  }
}

/**
 * Dispatches automated notifications via Resend.com for contact form inquiries
 */
export async function sendContactAutomation(payload: ContactPayload) {
  const cfg = resolveEmailConfig();

  if (!cfg.configured) {
    console.info(
      '[Email Notification - Resend] RESEND_API_KEY / SENDER_API_KEY pendiente de configurar. Consulta registrada en modo local:'
    );
    console.info(`- Alerta para Gastón: ${cfg.notificationEmail}`);
    console.info(`- Agradecimiento para: ${payload.email}`);
    return { success: true, mocked: true, provider: cfg.provider };
  }

  try {
    const internalRecipients = [
      { email: cfg.notificationEmail, name: 'Gastón Barea' },
      ...(cfg.backupNotificationEmail && cfg.backupNotificationEmail !== cfg.notificationEmail
        ? [{ email: cfg.backupNotificationEmail, name: 'Gastón Barea' }]
        : []),
    ];

    const emailPromises: Promise<any>[] = [
      // Alert to Gastón
      dispatchTransactionalEmail({
        to: internalRecipients,
        replyTo: payload.email,
        subject: `[CONTACTO WEB] Consulta de ${payload.name} (${payload.company || 'Particular'})`,
        html: `
          <div style="font-family:sans-serif;padding:16px;">
            <h2 style="color:#1e3a8a;">Nueva Consulta de Contacto Directo en gastonbarea.com</h2>
            <p><strong>Nombre:</strong> ${payload.name}</p>
            <p><strong>Email:</strong> ${payload.email}</p>
            <p><strong>Empresa:</strong> ${payload.company || 'N/A'}</p>
            <p><strong>Área de Servicio:</strong> ${payload.serviceArea}</p>
            <hr />
            <p><strong>Requerimientos:</strong></p>
            <div style="background:#f1f5f9;padding:12px;border-radius:6px;white-space:pre-wrap;">${payload.requirements}</div>
          </div>
        `,
      }),
      // Auto-reply to client with Portal de Clientes access credentials
      dispatchTransactionalEmail({
        to: { email: payload.email, name: payload.name },
        replyTo: cfg.notificationEmail,
        subject: `Hemos recibido tu consulta técnica · Acceso a Portal de Clientes [Gastón Barea]`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:24px;max-width:580px;margin:0 auto;color:#334155;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;">
            <h3 style="color:#0f172a;margin-top:0;">Hola ${payload.name},</h3>
            <p>Muchas gracias por ponerte en contacto. He recibido tu consulta respecto al área de <strong>${payload.serviceArea}</strong> y ya quedó ingresada en nuestro Pipeline Ejecutivo.</p>
            <p>Además, habilitamos automáticamente tu acceso privado al <strong>Portal de Clientes de gastonbarea.com</strong> para que puedas hacer seguimiento de propuestas, agendar sesiones Google Meet Pro y consultar avances:</p>
            <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:14px 16px;margin:16px 0;font-family:monospace;font-size:12px;">
              <div><strong>Portal de Clientes:</strong> <a href="https://www.gastonbarea.com/#portal" style="color:#2563eb;">https://www.gastonbarea.com/#portal</a></div>
              <div style="margin-top:4px;"><strong>Usuario / Email:</strong> ${payload.email}</div>
              <div style="margin-top:4px;"><strong>Clave de acceso inicial:</strong> cliente2026</div>
            </div>
            <p>Revisaré los requerimientos técnicos y te responderé a la brevedad.</p>
            <p style="margin-top:24px;margin-bottom:0;">Atentamente,<br><strong>Gastón Barea</strong><br><span style="font-size:12px;color:#64748b;">Consultor & Director de Proyectos · www.gastonbarea.com</span></p>
          </div>
        `,
      }),
    ];

    const results = await Promise.all(emailPromises);
    return { success: true, provider: cfg.provider, results };
  } catch (error: any) {
    console.error('[Email Automation] Error en envío de consulta:', error);
    return { success: false, provider: cfg.provider, error: error.message };
  }
}

/**
 * Dispatches an Official Formal Quote (Presupuesto) via Resend.com to the client + copy to Gastón
 */
export async function sendOfficialQuoteEmail(params: {
  quote: any;
  paymentConfig?: any;
  customSubject?: string;
  customIntroMessage?: string;
}) {
  const cfg = resolveEmailConfig();
  const { quote, paymentConfig, customSubject, customIntroMessage } = params;

  if (!quote || !quote.clientEmail) {
    return {
      success: false,
      configured: cfg.configured,
      error: 'El presupuesto no tiene un correo electrónico de cliente asignado.',
    };
  }

  if (!cfg.configured) {
    return {
      success: true,
      mocked: true,
      configured: false,
      provider: cfg.provider,
      fromEmail: cfg.fromEmail,
      targetEmail: quote.clientEmail,
      message: 'Modo simulación local (configurar RESEND_API_KEY en producción para envío real).',
    };
  }

  const itemsRows = (quote.items || [])
    .map(
      (item: any, idx: number) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 12px;font-family:monospace;font-size:12px;color:#64748b;">${idx + 1}</td>
        <td style="padding:10px 12px;">
          <div style="font-weight:700;color:#0f172a;font-size:13px;">${item.description}</div>
          <div style="font-size:11px;color:#64748b;margin-top:2px;">${item.deliverable || ''}</div>
        </td>
        <td style="padding:10px 12px;text-align:right;font-family:monospace;font-size:12px;font-weight:700;color:#0f172a;white-space:nowrap;">
          ${quote.currency} $${Number(item.total || 0).toLocaleString()}
        </td>
      </tr>`
    )
    .join('');

  const milestonesRows = (quote.milestones || [])
    .map(
      (ms: any) => `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
        <div style="font-family:monospace;font-size:12px;font-weight:700;color:#1e40af;">
          ${ms.percentage}% — ${quote.currency} $${Number(ms.amount || 0).toLocaleString()} · ${ms.name}
        </div>
        <div style="font-size:11px;color:#475569;margin-top:2px;">Condición: ${ms.condition}</div>
      </div>`
    )
    .join('');

  const cbuInfo = paymentConfig?.bankTransfer
    ? `<div style="font-size:12px;color:#334155;margin-top:8px;">
        <strong>Transferencia / Mercado Pago:</strong> CBU <code>${paymentConfig.bankTransfer.cbu}</code> · Alias: <code>${paymentConfig.bankTransfer.alias}</code> (${paymentConfig.bankTransfer.titular})
       </div>`
    : '';

  const subject =
    customSubject ||
    `Presupuesto Formal #${quote.quoteNumber}: ${quote.title} [Gastón Barea]`;

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:24px 12px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:24px 28px;background:linear-gradient(135deg,#091428 0%,#1e1b4b 100%);color:#ffffff;">
          <div style="font-family:monospace;font-size:11px;color:#34d399;font-weight:700;text-transform:uppercase;">
            PRESUPUESTO OFICIAL #${quote.quoteNumber}
          </div>
          <h2 style="margin:8px 0 4px 0;font-size:19px;color:#ffffff;">${quote.title}</h2>
          <div style="font-size:12px;color:#cbd5e1;">Preparado para ${quote.clientName} ${quote.clientCompany ? `· ${quote.clientCompany}` : ''}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          ${
            customIntroMessage
              ? `<p style="font-size:13px;line-height:1.6;color:#334155;white-space:pre-line;background:#f8fafc;padding:14px;border-radius:10px;border:1px solid #e2e8f0;">${customIntroMessage}</p>`
              : `<p style="font-size:14px;line-height:1.6;color:#334155;">Estimado/a <strong>${quote.clientName}</strong>, te comparto el detalle formal de alcance técnico, entregables y esquema de inversión para <strong>${quote.title}</strong>.</p>`
          }
          <h4 style="font-family:monospace;font-size:11px;text-transform:uppercase;color:#475569;margin:20px 0 8px 0;">Desglose de Entregables</h4>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
            <thead>
              <tr style="background:#f1f5f9;font-family:monospace;font-size:11px;color:#475569;text-align:left;">
                <th style="padding:8px 12px;">#</th>
                <th style="padding:8px 12px;">Módulo / Entregable</th>
                <th style="padding:8px 12px;text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
            <tfoot>
              <tr style="background:#eff6ff;font-family:monospace;font-size:14px;font-weight:700;color:#1e3a8a;">
                <td colspan="2" style="padding:12px;text-align:right;">INVERSIÓN TOTAL (${quote.timeline || 'A convenir'}):</td>
                <td style="padding:12px;text-align:right;">${quote.currency} $${Number(quote.total || 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <h4 style="font-family:monospace;font-size:11px;text-transform:uppercase;color:#475569;margin:22px 0 8px 0;">Esquema de Hitos Auditables (40 · 40 · 20%)</h4>
          ${milestonesRows}
          ${cbuInfo}

          <div style="text-align:center;margin:28px 0 12px 0;">
            <a href="https://www.gastonbarea.com/#portal" style="display:inline-block;background:#291B64;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 24px;border-radius:10px;">
              Ver y Aprobar en el Portal de Clientes &rarr;
            </a>
          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

  try {
    const internalRecipients = [
      { email: quote.clientEmail, name: quote.clientName },
      { email: cfg.notificationEmail, name: 'Gastón Barea' },
    ];
    const result = await dispatchTransactionalEmail({
      to: internalRecipients,
      replyTo: cfg.notificationEmail,
      subject,
      html,
    });
    return {
      success: true,
      configured: true,
      provider: cfg.provider,
      fromEmail: cfg.fromEmail,
      targetEmail: quote.clientEmail,
      result,
    };
  } catch (err: any) {
    return {
      success: false,
      configured: true,
      provider: cfg.provider,
      error: err?.message || 'Error al despachar presupuesto por correo.',
    };
  }
}

/**
 * Dispatches an automated Project Kick-off Email when an opportunity is Won or Hito 1 (40%) payment is confirmed
 */
export async function sendProjectKickoffEmail(params: {
  clientName: string;
  clientEmail: string;
  companyName?: string;
  projectTitle: string;
  projectId: string;
}) {
  const cfg = resolveEmailConfig();
  if (!cfg.configured || !params.clientEmail || !/\S+@\S+\.\S+/.test(params.clientEmail)) {
    return { success: true, mocked: true };
  }

  try {
    await dispatchTransactionalEmail({
      to: [
        { email: params.clientEmail, name: params.clientName },
        { email: cfg.notificationEmail, name: 'Gastón Barea' },
      ],
      replyTo: cfg.notificationEmail,
      subject: `🚀 Kick-off Confirmado: ${params.projectTitle} · Portal de Clientes Activo`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:24px;max-width:580px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;color:#0f172a;">
          <div style="font-family:monospace;font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;">
            PROYECTO EN EJECUCIÓN · HITOS 40 · 40 · 20%
          </div>
          <h2 style="margin:8px 0 12px 0;font-size:19px;color:#0f172a;">
            ¡Bienvenido/a al Kick-off de ${params.projectTitle}!
          </h2>
          <p style="font-size:14px;line-height:1.6;color:#334155;">
            Hola <strong>${params.clientName}</strong>, confirmamos el inicio formal del proyecto para <strong>${params.companyName || 'tu organización'}</strong>.
          </p>
          <p style="font-size:14px;line-height:1.6;color:#334155;">
            Ya se encuentra habilitado tu tablero de seguimiento en tiempo real en el <strong>Portal de Clientes</strong> con el cronograma de hitos auditables (40% Inicio · 40% Staging UAT · 20% Go-Live):
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin:16px 0;font-family:monospace;font-size:12px;color:#14532d;">
            <div><strong>Acceso al Portal:</strong> <a href="https://www.gastonbarea.com/#portal" style="color:#059669;">https://www.gastonbarea.com/#portal</a></div>
            <div style="margin-top:4px;"><strong>Usuario:</strong> ${params.clientEmail}</div>
            <div style="margin-top:4px;"><strong>Clave inicial:</strong> cliente2026</div>
            <div style="margin-top:4px;"><strong>ID de Proyecto:</strong> ${params.projectId}</div>
          </div>
          <p style="font-size:12px;color:#64748b;margin-bottom:0;">
            Gastón Barea · Dirección Ejecutiva de Proyectos & Arquitectura Tecnológica
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (err: any) {
    console.error('[Kickoff Email Error]:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Sends a live diagnostic test email via Resend.com to verify CyberPanel + Resend + Vercel stack
 */
export async function sendTestTransactionalEmail(recipientOverride?: string) {
  const cfg = resolveEmailConfig();
  const targetEmail = (recipientOverride || cfg.notificationEmail).trim();

  if (!cfg.configured) {
    return {
      success: false,
      configured: false,
      provider: cfg.provider,
      fromEmail: cfg.fromEmail,
      targetEmail,
      error:
        'Aún no se detectó RESEND_API_KEY (o SENDER_API_KEY) en las variables de entorno de Vercel. Agregala en Vercel → Project Settings → Environment Variables y hacé Redeploy.',
    };
  }

  try {
    const result = await dispatchTransactionalEmail({
      to: { email: targetEmail, name: 'Gastón Barea' },
      replyTo: cfg.notificationEmail,
      subject: `✓ Prueba de Correo Transaccional Activa · gastonbarea.com`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:24px;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;color:#0f172a;">
          <div style="font-family:monospace;font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;">
            INFRAESTRUCTURA VERIFICADA · GASTONBAREA.COM
          </div>
          <h2 style="margin:8px 0 12px 0;color:#0f172a;font-size:18px;">
            ¡Conexión Resend.com + CyberPanel (138.219.41.106) Operativa!
          </h2>
          <p style="font-size:14px;line-height:1.6;color:#334155;">
            Este correo confirma que el motor de notificaciones de <strong>gastonbarea.com</strong> está autenticado y despachando desde <strong>${cfg.fromEmail}</strong>.
          </p>
          <table width="100%" cellpadding="8" cellspacing="0" style="margin:16px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;font-family:monospace;">
            <tr>
              <td style="color:#64748b;">Remitente (From):</td>
              <td style="font-weight:700;color:#0f172a;">${cfg.fromName} &lt;${cfg.fromEmail}&gt;</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Destinatario (To):</td>
              <td style="font-weight:700;color:#0f172a;">${targetEmail}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Servidor Correo Entrante:</td>
              <td style="font-weight:700;color:#0f172a;">CyberPanel (${cfg.cyberpanelServerIp})</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Proveedor Saliente API:</td>
              <td style="font-weight:700;color:#16a34a;">${cfg.provider} (${cfg.keySource})</td>
            </tr>
          </table>
          <p style="font-size:12px;color:#64748b;margin-bottom:0;">
            Fecha de verificación: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    return {
      success: true,
      configured: true,
      provider: cfg.provider,
      fromEmail: cfg.fromEmail,
      targetEmail,
      result,
    };
  } catch (err: any) {
    return {
      success: false,
      configured: true,
      provider: cfg.provider,
      fromEmail: cfg.fromEmail,
      targetEmail,
      error: err?.message || 'Error al despachar el correo de prueba.',
    };
  }
}

/**
 * Dispatches the Executive AI Consultation Study (Dossier de Viabilidad & Arquitectura 40/40/20)
 * to the client via Resend (notificaciones@gastonbarea.com) + copy to Gastón.
 */
export async function sendAiStudyEmail(params: {
  clientName: string;
  clientEmail: string;
  companyName?: string;
  phone?: string;
  blueprint: {
    query: string;
    solutionTitle: string;
    primaryVertical: string;
    estimatedTimeline: string;
    executiveDiagnosis: string;
    recommendedStack: string[];
    tailoredServices: Array<{
      code: string;
      title: string;
      problemSolved: string;
      technicalApproach: string;
      deliverable: string;
      impactMetric: string;
    }>;
    roadmapPhases: Array<{
      phaseCode: string;
      percentage: string;
      title: string;
      duration: string;
      deliverable: string;
      verificationCriteria: string;
    }>;
  };
  portalCredentials?: {
    username: string;
    password?: string;
  };
}) {
  const cfg = resolveEmailConfig();
  const { clientName, clientEmail, companyName, phone, blueprint, portalCredentials } = params;

  if (!clientEmail || !/\S+@\S+\.\S+/.test(clientEmail)) {
    return {
      success: false,
      configured: cfg.configured,
      error: 'Ingresá un correo electrónico válido para recibir el estudio técnico.',
    };
  }

  if (!cfg.configured) {
    return {
      success: true,
      mocked: true,
      configured: false,
      provider: cfg.provider,
      targetEmail: clientEmail,
      message: 'Modo simulación local activo. En producción se despacha vía Resend.',
    };
  }

  const stackBadges = (blueprint.recommendedStack || [])
    .map(
      (tech, idx) =>
        `<span style="display:inline-block;background:#f1f5f9;border:1px solid #cbd5e1;color:#0f172a;padding:4px 10px;border-radius:6px;font-family:monospace;font-size:11px;margin:0 6px 6px 0;">0${idx + 1}. ${tech}</span>`
    )
    .join('');

  const modulesHtml = (blueprint.tailoredServices || [])
    .map(
      (srv) => `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #291B64;border-radius:8px;padding:14px 16px;margin-bottom:12px;">
        <div style="font-family:monospace;font-size:11px;font-weight:700;color:#291B64;text-transform:uppercase;">
          MÓDULO ${srv.code} · ${srv.impactMetric}
        </div>
        <div style="font-size:15px;font-weight:700;color:#0f172a;margin:4px 0 8px 0;">${srv.title}</div>
        <div style="font-size:12px;color:#334155;line-height:1.5;margin-bottom:6px;">
          <strong>Desafío que resuelve:</strong> ${srv.problemSolved}
        </div>
        <div style="font-size:12px;color:#334155;line-height:1.5;margin-bottom:6px;">
          <strong>Ingeniería & Arquitectura:</strong> ${srv.technicalApproach}
        </div>
        <div style="font-family:monospace;font-size:11px;color:#047857;font-weight:700;">
          Entregable auditable: ${srv.deliverable}
        </div>
      </div>`
    )
    .join('');

  const roadmapHtml = (blueprint.roadmapPhases || [])
    .map(
      (ph) => `
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:8px;">
        <div style="font-family:monospace;font-size:11px;font-weight:700;color:#059669;">
          ${ph.phaseCode} · HITO ${ph.percentage} (${ph.duration})
        </div>
        <div style="font-size:14px;font-weight:700;color:#0f172a;margin:3px 0;">${ph.title}</div>
        <div style="font-size:12px;color:#475569;line-height:1.5;">${ph.deliverable}</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px;font-family:monospace;">
          Validación PMO: ${ph.verificationCriteria}
        </div>
      </div>`
    )
    .join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:660px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:28px;background:#0B0B10;color:#ffffff;">
          <div style="font-family:monospace;font-size:11px;color:#34d399;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
            ESTUDIO TÉCNICO PRELIMINAR DE VIABILIDAD & ARQUITECTURA · GASTONBAREA.COM
          </div>
          <h1 style="margin:10px 0 6px 0;font-size:21px;line-height:1.25;color:#ffffff;">
            ${blueprint.solutionTitle}
          </h1>
          <div style="font-family:monospace;font-size:12px;color:#94a3b8;">
            Preparado para: <strong style="color:#ffffff;">${clientName}</strong> ${companyName ? `· ${companyName}` : ''} | Plazo Estimado: <strong style="color:#34d399;">${blueprint.estimatedTimeline}</strong>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          <p style="font-size:14px;line-height:1.6;color:#334155;margin-top:0;">
            Hola <strong>${clientName}</strong>, adjuntamos el estudio preliminar generado por el Gemelo Digital de <strong>Gastón Barea</strong> (30 años en el sector tecnológico-productivo y 14 años en dirección ejecutiva PMO) en base a tu consulta:
          </p>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px 16px;border-radius:8px;font-family:monospace;font-size:12px;color:#1e293b;margin-bottom:18px;">
            <strong>Consulta Analizada:</strong> "${blueprint.query}"<br/>
            <strong>Vertical Estratégica:</strong> ${blueprint.primaryVertical}
          </div>

          <h3 style="font-family:monospace;font-size:12px;text-transform:uppercase;color:#291B64;margin:20px 0 8px 0;">
            1. Diagnóstico Ejecutivo de Arquitectura
          </h3>
          <p style="font-size:13px;line-height:1.65;color:#1e293b;white-space:pre-line;background:#f8fafc;padding:14px 16px;border-radius:8px;border:1px solid #e2e8f0;">
            ${blueprint.executiveDiagnosis}
          </p>

          <h3 style="font-family:monospace;font-size:12px;text-transform:uppercase;color:#291B64;margin:20px 0 8px 0;">
            2. Stack Tecnológico Seleccionado
          </h3>
          <div style="margin-bottom:18px;">${stackBadges}</div>

          <h3 style="font-family:monospace;font-size:12px;text-transform:uppercase;color:#291B64;margin:20px 0 10px 0;">
            3. Módulos y Servicios Creados a Medida
          </h3>
          ${modulesHtml}

          <h3 style="font-family:monospace;font-size:12px;text-transform:uppercase;color:#291B64;margin:22px 0 10px 0;">
            4. Hoja de Ruta PMO Auditable (Esquema 40% · 40% · 20%)
          </h3>
          ${roadmapHtml}

          <div style="background:#0f172a;color:#ffffff;border-radius:10px;padding:18px 20px;margin:24px 0;">
            <div style="font-family:monospace;font-size:11px;color:#34d399;font-weight:700;text-transform:uppercase;">
              ACCESO A TU PORTAL DE CLIENTES & CANALES DIRECTOS
            </div>
            <p style="font-size:12px;color:#cbd5e1;line-height:1.5;margin:6px 0 12px 0;">
              Este estudio ya quedó vinculado a tu cuenta en el Portal de Clientes para seguimiento de hitos, cotización formal y soporte SLA:
            </p>
            <div style="font-family:monospace;font-size:12px;background:rgba(255,255,255,0.08);padding:10px 12px;border-radius:6px;margin-bottom:14px;">
              <div>Portal: <a href="https://www.gastonbarea.com/#portal" style="color:#34d399;">https://www.gastonbarea.com/#portal</a></div>
              <div>Usuario: <strong>${portalCredentials?.username || clientEmail}</strong> · Clave inicial: <strong>${portalCredentials?.password || 'cliente2026'}</strong></div>
            </div>
            <div style="font-size:12px;color:#e2e8f0;">
              Podés responder directamente a este correo (<strong>${cfg.notificationEmail}</strong>) o continuar por WhatsApp Directo para ajustar el alcance.
            </div>
          </div>

          <p style="font-size:12px;color:#64748b;margin-bottom:0;">
            Atentamente,<br/>
            <strong>Gastón Barea</strong> · Consultor y Desarrollador de Proyectos de Base Tecnológica & Bioeconomía<br/>
            <a href="https://www.gastonbarea.com" style="color:#291B64;">https://www.gastonbarea.com</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

  try {
    const internalRecipients = [
      { email: cfg.notificationEmail, name: 'Gastón Barea' },
      ...(cfg.backupNotificationEmail && cfg.backupNotificationEmail !== cfg.notificationEmail
        ? [{ email: cfg.backupNotificationEmail, name: 'Gastón Barea' }]
        : []),
    ];

    const [clientRes, internalRes] = await Promise.allSettled([
      dispatchTransactionalEmail({
        to: { email: clientEmail, name: clientName },
        replyTo: cfg.notificationEmail,
        subject: `📄 Estudio Técnico IA: ${blueprint.solutionTitle} [Gastón Barea]`,
        html,
      }),
      dispatchTransactionalEmail({
        to: internalRecipients,
        replyTo: clientEmail,
        subject: `[NUEVO ESTUDIO IA REGISTRADO] ${clientName} (${companyName || 'Particular'}) · ${blueprint.solutionTitle}`,
        html,
      }),
    ]);

    return {
      success: clientRes.status === 'fulfilled' || internalRes.status === 'fulfilled',
      configured: true,
      provider: cfg.provider,
      fromEmail: cfg.fromEmail,
      targetEmail: clientEmail,
      phone,
      result: {
        client: clientRes.status === 'fulfilled' ? clientRes.value : clientRes.reason?.message,
        internal: internalRes.status === 'fulfilled' ? internalRes.value : internalRes.reason?.message,
      },
    };
  } catch (err: any) {
    console.error('[sendAiStudyEmail Error]:', err);
    return {
      success: false,
      configured: true,
      provider: cfg.provider,
      error: err?.message || 'No se pudo enviar el estudio técnico por correo.',
    };
  }
}


