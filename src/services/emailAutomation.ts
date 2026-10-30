import { Resend } from 'resend';
import { SITE_CONFIG } from '../data/siteConfig.ts';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const notificationEmail = process.env.NOTIFICATION_EMAIL || SITE_CONFIG.email || 'gastonbarea.com@gmail.com';
const fromEmail = process.env.FROM_EMAIL || 'Gastón Barea <onboarding@resend.dev>';

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

/**
 * Generates an executive, Apple/Vercel-inspired responsive HTML email
 */
function buildProposalHtml(data: ProposalPayload): string {
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
                <a href="mailto:${notificationEmail}" style="color:#2563eb;text-decoration:none;">${notificationEmail}</a>
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
 * Dispatches automated emails for new proposals:
 * 1. To the client (if email was provided)
 * 2. To Gastón Barea (immediate notification alert)
 */
export async function sendProposalAutomation(payload: ProposalPayload) {
  if (!resend) {
    console.info('[Worker Automation] RESEND_API_KEY no configurado aún. Correo simulado exitosamente:');
    console.info(`- Notificación a: ${notificationEmail}`);
    if (payload.clientEmail) {
      console.info(`- Confirmación a cliente: ${payload.clientEmail}`);
    }
    return { success: true, mocked: true };
  }

  try {
    const htmlContent = buildProposalHtml(payload);
    const emailPromises: Promise<any>[] = [];

    // 1. Send confirmation to client if provided
    if (payload.clientEmail && /\S+@\S+\.\S+/.test(payload.clientEmail)) {
      emailPromises.push(
        resend.emails.send({
          from: fromEmail,
          to: payload.clientEmail,
          subject: `Especificación de Arquitectura: ${payload.architectureTitle} [Gastón Barea]`,
          html: htmlContent,
        })
      );
    }

    // 2. Send instant briefing alert to Gastón
    emailPromises.push(
      resend.emails.send({
        from: fromEmail,
        to: notificationEmail,
        subject: `[NUEVO PROSPECTO] ${payload.companyName || payload.organizationType} - Urgencia: ${payload.urgency || 'Media'}`,
        html: `
          <div style="font-family:sans-serif;padding:16px;">
            <h2 style="color:#1e3a8a;">Nuevo Diagnóstico Generado</h2>
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
    return { success: true, results };
  } catch (error: any) {
    console.error('[Worker Automation] Error enviando correos automatizados:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Dispatches automated notifications for contact form inquiries
 */
export async function sendContactAutomation(payload: ContactPayload) {
  if (!resend) {
    console.info('[Worker Automation] RESEND_API_KEY no configurado aún. Consulta simulada exitosamente:');
    console.info(`- Alerta para Gastón: ${notificationEmail}`);
    console.info(`- Agradecimiento para: ${payload.email}`);
    return { success: true, mocked: true };
  }

  try {
    const emailPromises: Promise<any>[] = [
      // Alert to Gastón
      resend.emails.send({
        from: fromEmail,
        to: notificationEmail,
        subject: `[CONTACTO WEB] Consulta de ${payload.name} (${payload.company || 'Particular'})`,
        html: `
          <div style="font-family:sans-serif;padding:16px;">
            <h2 style="color:#1e3a8a;">Nueva Consulta de Contacto Directo</h2>
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
      resend.emails.send({
        from: fromEmail,
        to: payload.email,
        subject: `Hemos recibido tu consulta técnica [Gastón Barea]`,
        html: `
          <div style="font-family:sans-serif;padding:20px;max-width:550px;margin:0 auto;color:#334155;">
            <h3 style="color:#0f172a;">Hola ${payload.name},</h3>
            <p>Muchas gracias por ponerte en contacto. He recibido tu mensaje respecto al área de <strong>${payload.serviceArea}</strong>.</p>
            <p>Revisaré los requerimientos técnicos y te responderé en el transcurso del día para evaluar la viabilidad o coordinar una llamada de diagnóstico.</p>
            <p style="margin-top:24px;">Atentamente,<br><strong>Gastón Barea</strong><br><span style="font-size:12px;color:#64748b;">Arquitecto de Software & Consultor Tecnológico</span></p>
          </div>
        `,
      }),
    ];

    const results = await Promise.all(emailPromises);
    return { success: true, results };
  } catch (error: any) {
    console.error('[Worker Automation] Error en envío de consulta:', error);
    return { success: false, error: error.message };
  }
}
