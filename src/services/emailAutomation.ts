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
      // Auto-reply to client
      dispatchTransactionalEmail({
        to: { email: payload.email, name: payload.name },
        replyTo: cfg.notificationEmail,
        subject: `Hemos recibido tu consulta técnica [Gastón Barea]`,
        html: `
          <div style="font-family:sans-serif;padding:20px;max-width:550px;margin:0 auto;color:#334155;">
            <h3 style="color:#0f172a;">Hola ${payload.name},</h3>
            <p>Muchas gracias por ponerte en contacto. He recibido tu mensaje respecto al área de <strong>${payload.serviceArea}</strong>.</p>
            <p>Revisaré los requerimientos técnicos y te responderé en el transcurso del día para evaluar la viabilidad o coordinar una llamada de diagnóstico.</p>
            <p style="margin-top:24px;">Atentamente,<br><strong>Gastón Barea</strong><br><span style="font-size:12px;color:#64748b;">Arquitecto de Software & Consultor Tecnológico · gastonbarea.com</span></p>
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
