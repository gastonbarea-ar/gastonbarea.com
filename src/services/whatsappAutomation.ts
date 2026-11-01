import { SITE_CONFIG } from '../data/siteConfig.ts';

export interface WhatsAppBusinessConfig {
  enabled: boolean;
  provider: 'meta_cloud_api' | 'evolution_api' | 'webhook_n8n';
  businessPhone: string;
  adminNotifyPhone: string;
  // Meta WhatsApp Cloud API
  metaPhoneNumberId: string;
  metaAccessToken: string;
  metaBusinessAccountId: string;
  metaVerifyToken: string;
  // Evolution API / Self-Hosted Docker on CyberPanel VPS (138.219.41.106)
  evolutionApiUrl: string;
  evolutionInstanceName: string;
  evolutionApiKey: string;
  // n8n / Custom Outbound Webhook
  webhookUrl: string;
  autoNotifyOnLead: boolean;
  autoNotifyOnQuote: boolean;
  autoNotifyOnKickoff: boolean;
}

let runtimeWhatsAppConfig: Partial<WhatsAppBusinessConfig> = {};

export function setRuntimeWhatsAppConfig(partial: Partial<WhatsAppBusinessConfig>) {
  runtimeWhatsAppConfig = { ...runtimeWhatsAppConfig, ...partial };
}

export function normalizePhoneE164(rawPhone: string): string {
  let digits = (rawPhone || '').replace(/\D+/g, '');
  if (!digits) return '';

  // Strip leading 00 or 0 (e.g. 0299 15-5137574 -> 299155137574)
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Handle Argentine local number with '15' after 2, 3, or 4 digit area code (total 12 digits without 54)
  if (digits.length === 12 && !digits.startsWith('54')) {
    const match15 = digits.match(/^(\d{2,4})15(\d{6,8})$/);
    if (match15 && match15[1].length + match15[2].length === 10) {
      digits = `${match15[1]}${match15[2]}`;
    }
  }

  // Default Argentina prefix normalization if 10 digits provided
  if (digits.length === 10 && !digits.startsWith('54')) {
    return `549${digits}`;
  }

  // If 12 digits starting with 54 (missing the mobile '9'), insert '9'
  if (digits.length === 12 && digits.startsWith('54') && !digits.startsWith('549')) {
    return `549${digits.slice(2)}`;
  }

  return digits;
}

export function getWhatsAppConfig(): WhatsAppBusinessConfig {
  const metaPhoneNumberId =
    runtimeWhatsAppConfig.metaPhoneNumberId ??
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ??
    '';
  const metaAccessToken =
    runtimeWhatsAppConfig.metaAccessToken ??
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() ??
    '';
  const metaBusinessAccountId =
    runtimeWhatsAppConfig.metaBusinessAccountId ??
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim() ??
    '';
  const metaVerifyToken =
    runtimeWhatsAppConfig.metaVerifyToken ??
    process.env.WHATSAPP_VERIFY_TOKEN?.trim() ??
    'gastonbarea_wa_verify_2026';

  const evolutionApiUrl =
    runtimeWhatsAppConfig.evolutionApiUrl ??
    process.env.EVOLUTION_API_URL?.trim() ??
    '';
  const evolutionInstanceName =
    runtimeWhatsAppConfig.evolutionInstanceName ??
    process.env.EVOLUTION_INSTANCE_NAME?.trim() ??
    'gastonbarea';
  const evolutionApiKey =
    runtimeWhatsAppConfig.evolutionApiKey ??
    process.env.EVOLUTION_API_KEY?.trim() ??
    '';

  const webhookUrl =
    runtimeWhatsAppConfig.webhookUrl ??
    process.env.WHATSAPP_WEBHOOK_URL?.trim() ??
    '';

  const businessPhone = normalizePhoneE164(
    runtimeWhatsAppConfig.businessPhone ??
      process.env.WHATSAPP_BUSINESS_PHONE ??
      process.env.VITE_WHATSAPP_PHONE ??
      SITE_CONFIG.whatsapp.phoneNumber ??
      ''
  );

  const adminNotifyPhone = normalizePhoneE164(
    runtimeWhatsAppConfig.adminNotifyPhone ??
      process.env.WHATSAPP_ADMIN_PHONE ??
      businessPhone
  );

  let provider: WhatsAppBusinessConfig['provider'] =
    runtimeWhatsAppConfig.provider || 'meta_cloud_api';

  if (!runtimeWhatsAppConfig.provider) {
    if (metaPhoneNumberId && metaAccessToken) {
      provider = 'meta_cloud_api';
    } else if (evolutionApiUrl && evolutionApiKey) {
      provider = 'evolution_api';
    } else if (webhookUrl) {
      provider = 'webhook_n8n';
    }
  }

  const hasValidCredentials =
    Boolean(metaPhoneNumberId && metaAccessToken) ||
    Boolean(evolutionApiUrl && evolutionApiKey) ||
    Boolean(webhookUrl);

  return {
    enabled: runtimeWhatsAppConfig.enabled ?? hasValidCredentials,
    provider,
    businessPhone,
    adminNotifyPhone,
    metaPhoneNumberId,
    metaAccessToken,
    metaBusinessAccountId,
    metaVerifyToken,
    evolutionApiUrl,
    evolutionInstanceName,
    evolutionApiKey,
    webhookUrl,
    autoNotifyOnLead: runtimeWhatsAppConfig.autoNotifyOnLead ?? true,
    autoNotifyOnQuote: runtimeWhatsAppConfig.autoNotifyOnQuote ?? true,
    autoNotifyOnKickoff: runtimeWhatsAppConfig.autoNotifyOnKickoff ?? true,
  };
}

export function getWhatsAppPublicStatus() {
  const cfg = getWhatsAppConfig();
  const isConfigured =
    (cfg.provider === 'meta_cloud_api' && Boolean(cfg.metaPhoneNumberId && cfg.metaAccessToken)) ||
    (cfg.provider === 'evolution_api' && Boolean(cfg.evolutionApiUrl && cfg.evolutionApiKey)) ||
    (cfg.provider === 'webhook_n8n' && Boolean(cfg.webhookUrl));

  return {
    configured: isConfigured,
    enabled: cfg.enabled,
    provider: cfg.provider,
    businessPhone: cfg.businessPhone,
    adminNotifyPhone: cfg.adminNotifyPhone,
    metaPhoneNumberId: cfg.metaPhoneNumberId,
    metaBusinessAccountId: cfg.metaBusinessAccountId,
    metaVerifyToken: cfg.metaVerifyToken,
    hasMetaToken: Boolean(cfg.metaAccessToken),
    evolutionApiUrl: cfg.evolutionApiUrl,
    evolutionInstanceName: cfg.evolutionInstanceName,
    hasEvolutionKey: Boolean(cfg.evolutionApiKey),
    webhookUrl: cfg.webhookUrl,
    autoNotifyOnLead: cfg.autoNotifyOnLead,
    autoNotifyOnQuote: cfg.autoNotifyOnQuote,
    autoNotifyOnKickoff: cfg.autoNotifyOnKickoff,
    inboundWebhookPath: '/api/webhooks/whatsapp',
  };
}

export interface WhatsAppDispatchInput {
  toPhone: string;
  message: string;
  contextType?: 'lead_alert' | 'quote_dispatch' | 'kickoff_welcome' | 'test_message';
  metadata?: Record<string, any>;
}

export async function dispatchWhatsAppMessage(input: WhatsAppDispatchInput): Promise<{
  success: boolean;
  provider: string;
  configured: boolean;
  toPhone: string;
  waMeFallbackUrl: string;
  response?: any;
  error?: string;
}> {
  const cfg = getWhatsAppConfig();
  const cleanPhone = normalizePhoneE164(input.toPhone || cfg.adminNotifyPhone || cfg.businessPhone);
  const encodedMsg = encodeURIComponent(input.message);
  const waMeFallbackUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
    : `https://wa.me/?text=${encodedMsg}`;

  if (!cleanPhone) {
    return {
      success: false,
      provider: cfg.provider,
      configured: false,
      toPhone: '',
      waMeFallbackUrl,
      error: 'No se especificó un número de teléfono destino en formato internacional (ej: 5492804XXXXXX).',
    };
  }

  try {
    // 1. Meta Official WhatsApp Business Cloud API
    if (cfg.provider === 'meta_cloud_api' && cfg.metaPhoneNumberId && cfg.metaAccessToken) {
      const url = `https://graph.facebook.com/v21.0/${cfg.metaPhoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.metaAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: input.message,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error?.message || `Meta Cloud API HTTP ${res.status}: ${JSON.stringify(data)}`
        );
      }

      return {
        success: true,
        provider: 'meta_cloud_api',
        configured: true,
        toPhone: cleanPhone,
        waMeFallbackUrl,
        response: data,
      };
    }

    // 2. Evolution API v2 (Self-hosted on Docker / CyberPanel VPS 138.219.41.106)
    if (cfg.provider === 'evolution_api' && cfg.evolutionApiUrl && cfg.evolutionApiKey) {
      const baseUrl = cfg.evolutionApiUrl.replace(/\/+$/, '');
      const url = `${baseUrl}/message/sendText/${encodeURIComponent(cfg.evolutionInstanceName || 'gastonbarea')}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: cfg.evolutionApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: input.message,
          linkPreview: true,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(`Evolution API HTTP ${res.status}: ${JSON.stringify(data)}`);
      }

      return {
        success: true,
        provider: 'evolution_api',
        configured: true,
        toPhone: cleanPhone,
        waMeFallbackUrl,
        response: data,
      };
    }

    // 3. n8n / Custom Webhook Automation Bridge
    if (cfg.provider === 'webhook_n8n' && cfg.webhookUrl) {
      const res = await fetch(cfg.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'gastonbarea.com',
          toPhone: cleanPhone,
          message: input.message,
          contextType: input.contextType || 'general',
          metadata: input.metadata || {},
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json().catch(() => ({ status: 'dispatched' }));
      if (!res.ok) {
        throw new Error(`Webhook HTTP ${res.status}`);
      }

      return {
        success: true,
        provider: 'webhook_n8n',
        configured: true,
        toPhone: cleanPhone,
        waMeFallbackUrl,
        response: data,
      };
    }

    // Not yet configured with API credentials -> return clean fallback with wa.me link
    return {
      success: false,
      provider: cfg.provider,
      configured: false,
      toPhone: cleanPhone,
      waMeFallbackUrl,
      error:
        'Credenciales API de WhatsApp Business pendientes de activar. Podés usar el enlace directo wa.me generado o cargar Meta Cloud API / Evolution API en el panel.',
    };
  } catch (err: any) {
    console.error('[WhatsApp Business Automation] Error:', err);
    return {
      success: false,
      provider: cfg.provider,
      configured: true,
      toPhone: cleanPhone,
      waMeFallbackUrl,
      error: err?.message || 'Error al despachar mensaje por WhatsApp Business API.',
    };
  }
}
