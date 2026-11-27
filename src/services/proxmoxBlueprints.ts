export interface ProxmoxBlueprintBundle {
  dockerComposeYaml: string;
  envTemplate: string;
  cloudflareZeroTrustChecklist: string[];
  n8nWorkflows: Array<{
    id: string;
    filename: string;
    title: string;
    trigger: string;
    description: string;
    json: Record<string, any>;
  }>;
}

/**
 * Generates ready-to-deploy Proxmox Docker Compose + Cloudflare Tunnel Zero-Trust setup
 * and 4 importable n8n v1 JSON workflows wired directly to gastonbarea.com.
 */
export function generateProxmoxAndN8nBlueprints(options?: {
  siteUrl?: string;
  n8nSubdomain?: string;
  whatsappSubdomain?: string;
  statusSubdomain?: string;
}): ProxmoxBlueprintBundle {
  const siteUrl = (options?.siteUrl || 'https://www.gastonbarea.com').replace(/\/$/, '');
  const n8nHost = options?.n8nSubdomain || 'n8n.gastonbarea.com';
  const waHost = options?.whatsappSubdomain || 'wa.gastonbarea.com';
  const statusHost = options?.statusSubdomain || 'status.gastonbarea.com';

  const dockerComposeYaml = `# ==============================================================================
# PROXMOX + CLOUDFLARE TUNNEL ZERO-TRUST STACK · AGENTE AUTÓNOMO ARN 24/7
# Recursos sugeridos: 1 VM Ubuntu Server / LXC Docker (4 vCPU · 6-8 GB RAM · 40 GB SSD)
# Puertos abiertos en router: 0 (Todo entra cifrado por cloudflared)
# Nota: Si ya tenés n8n en otro LXC de Proxmox, podés comentar el bloque "n8n" de abajo.
# ==============================================================================
services:
  # 1. Túnel Zero-Trust Cloudflare (Publica Evolution API, Uptime Kuma y n8n sin abrir puertos)
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: arn-cloudflared
    restart: unless-stopped
    command: tunnel --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=\${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - arn_net

  # 2. PostgreSQL 16 (Requerido por Evolution API v2 para persistencia de sesiones y mensajes)
  evolution-postgres:
    image: postgres:16-alpine
    container_name: arn-evolution-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=evolution_db
      - POSTGRES_USER=evolution_user
      - POSTGRES_PASSWORD=\${EVOLUTION_DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U evolution_user -d evolution_db"]
      interval: 5s
      timeout: 5s
      retries: 10
    volumes:
      - evolution_pg_data:/var/lib/postgresql/data
    networks:
      - arn_net

  # 3. Redis ligero para caché y estabilidad de sesiones WhatsApp
  redis:
    image: redis:7-alpine
    container_name: arn-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - arn_net

  # 4. Evolution API v2 (WhatsApp Business QR · Texto + Audios Base64 + PDFs · Costo $0/msg)
  evolution-api:
    image: evoapicloud/evolution-api:v2.3.8
    container_name: arn-evolution
    restart: unless-stopped
    depends_on:
      evolution-postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      - SERVER_PORT=8080
      - SERVER_URL=https://${waHost}
      - AUTHENTICATION_API_KEY=\${EVOLUTION_API_KEY}
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://evolution_user:\${EVOLUTION_DB_PASSWORD}@evolution-postgres:5432/evolution_db?schema=public
      - DATABASE_SAVE_DATA_INSTANCE=true
      - DATABASE_SAVE_DATA_CHATS=true
      - DATABASE_SAVE_DATA_CONTACTS=true
      - DATABASE_SAVE_DATA_NEW_MESSAGE=true
      - CACHE_LOCAL_ENABLED=false
      - CACHE_REDIS_ENABLED=true
      - CACHE_REDIS_URI=redis://:\${REDIS_PASSWORD}@redis:6379/1
      - CACHE_REDIS_PREFIX_KEY=arn_evolution
      - CACHE_REDIS_SAVE_INSTANCES=true
      - WEBHOOK_GLOBAL_ENABLED=true
      - WEBHOOK_GLOBAL_URL=${siteUrl}/api/webhooks/whatsapp
      - WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false
      - WEBHOOK_EVENTS_MESSAGES_UPSERT=true
      - WEBHOOK_BASE64=true
      - CONFIG_SESSION_PHONE_CLIENT=ARN Autopilot 24/7
      - TZ=America/Argentina/Buenos_Aires
    volumes:
      - evolution_instances:/evolution/instances
    networks:
      - arn_net

  # 5. Gotenberg (Renderizador interno HTML -> PDF Ejecutivo 40/40/20 · NO expuesto a internet)
  gotenberg:
    image: gotenberg/gotenberg:8
    container_name: arn-gotenberg
    restart: unless-stopped
    networks:
      - arn_net

  # 6. Uptime Kuma (Monitor silencioso -> dispara webhook a n8n, nunca a tu teléfono directo)
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: arn-uptime-kuma
    restart: unless-stopped
    volumes:
      - uptime_kuma_data:/app/data
    networks:
      - arn_net

  # 7. Orquestador n8n (Opcional: comentá este bloque si ya usás tu n8n existente en otro LXC)
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    container_name: arn-n8n
    restart: unless-stopped
    environment:
      - N8N_HOST=${n8nHost}
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${n8nHost}/
      - GENERIC_TIMEZONE=America/Argentina/Buenos_Aires
      - TZ=America/Argentina/Buenos_Aires
      - N8N_ENCRYPTION_KEY=\${N8N_ENCRYPTION_KEY}
      - ARN_API_BASE_URL=${siteUrl}
      - ARN_WEBHOOK_SECRET=\${ARN_WEBHOOK_SECRET}
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - arn_net

volumes:
  evolution_pg_data:
  redis_data:
  evolution_instances:
  uptime_kuma_data:
  n8n_data:

networks:
  arn_net:
    driver: bridge
`;

  const envTemplate = `# Guardar como .env junto al docker-compose.yml en tu VM/LXC de Proxmox
# Generar claves seguras con: openssl rand -hex 24

CLOUDFLARE_TUNNEL_TOKEN=REEMPLAZAR_CON_TOKEN_DE_CLOUDFLARE_ZERO_TRUST
EVOLUTION_DB_PASSWORD=REEMPLAZAR_CON_CLAVE_POSTGRES_SEGURA
REDIS_PASSWORD=REEMPLAZAR_CON_CLAVE_REDIS_SEGURA
EVOLUTION_API_KEY=REEMPLAZAR_CON_API_KEY_EVOLUTION
N8N_ENCRYPTION_KEY=REEMPLAZAR_CON_CLAVE_ALEATORIA_64_HEX
ARN_WEBHOOK_SECRET=DEBE_COINCIDIR_CON_WEBHOOK_SECRET_EN_VERCEL
`;

  const cloudflareZeroTrustChecklist = [
    `En Cloudflare Zero Trust -> Networks -> Tunnels, creá el túnel "proxmox-arn-prod" y copiá el token en CLOUDFLARE_TUNNEL_TOKEN.`,
    `Publicá ${n8nHost} -> http://n8n:5678 (protegé / con Cloudflare Access OTP, dejando /webhook/* público con validación de secreto).`,
    `Publicá ${waHost} -> http://evolution-api:8080 (autenticado por header apikey = EVOLUTION_API_KEY).`,
    `Publicá ${statusHost} -> http://uptime-kuma:3001 (protegido 100% con Cloudflare Access OTP).`,
    `En Vercel -> Environment Variables, definí WEBHOOK_SECRET (igual a ARN_WEBHOOK_SECRET), WHATSAPP_PROVIDER=evolution_api, EVOLUTION_API_URL=https://${waHost}, EVOLUTION_API_KEY y EVOLUTION_INSTANCE_NAME=arn_prod.`,
  ];

  const wf1 = {
    name: '01 · ARN WhatsApp + Audio -> Agente Autónomo 24/7',
    nodes: [
      {
        id: 'node-wa-webhook',
        name: 'Evolution Webhook Entrante',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [240, 300],
        parameters: {
          httpMethod: 'POST',
          path: 'arn-whatsapp-inbound',
          responseMode: 'onReceived',
        },
      },
      {
        id: 'node-call-arn',
        name: 'Enviar a Cerebro ARN (gastonbarea.com)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [520, 300],
        parameters: {
          method: 'POST',
          url: `${siteUrl}/api/webhooks/whatsapp`,
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: 'x-webhook-secret', value: '={{ $env.ARN_WEBHOOK_SECRET }}' },
              { name: 'Content-Type', value: 'application/json' },
            ],
          },
          sendBody: true,
          specifyBody: 'json',
          jsonBody: '={{ $json.body }}',
        },
      },
    ],
    connections: {
      'Evolution Webhook Entrante': {
        main: [[{ node: 'Enviar a Cerebro ARN (gastonbarea.com)', type: 'main', index: 0 }]],
      },
    },
    settings: { timezone: 'America/Argentina/Buenos_Aires' },
  };

  const wf2 = {
    name: '02 · ARN Follow-Up Comercial (48h / 7d) + Anti No-Show Meet',
    nodes: [
      {
        id: 'node-cron-2h',
        name: 'Cron Cada 2 Horas (08:00 a 20:00)',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [240, 300],
        parameters: {
          rule: {
            interval: [{ field: 'cronExpression', expression: '0 8-20/2 * * 1-6' }],
          },
        },
      },
      {
        id: 'node-run-followups',
        name: 'Ejecutar Motor de Follow-Ups ARN',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [520, 300],
        parameters: {
          method: 'POST',
          url: `${siteUrl}/api/autopilot/n8n/followups`,
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: 'x-webhook-secret', value: '={{ $env.ARN_WEBHOOK_SECRET }}' },
            ],
          },
          sendBody: true,
          specifyBody: 'json',
          jsonBody: '{"dispatch": true}',
        },
      },
    ],
    connections: {
      'Cron Cada 2 Horas (08:00 a 20:00)': {
        main: [[{ node: 'Ejecutar Motor de Follow-Ups ARN', type: 'main', index: 0 }]],
      },
    },
    settings: { timezone: 'America/Argentina/Buenos_Aires' },
  };

  const wf3 = {
    name: '03 · ARN Auto-Sanación Uptime Kuma (Filtro Anti-Ruido)',
    nodes: [
      {
        id: 'node-kuma-hook',
        name: 'Webhook Uptime Kuma',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [200, 300],
        parameters: {
          httpMethod: 'POST',
          path: 'arn-uptime-kuma',
          responseMode: 'onReceived',
        },
      },
      {
        id: 'node-wait-30s',
        name: 'Esperar 30s (Descartar Microcorte)',
        type: 'n8n-nodes-base.wait',
        typeVersion: 1.1,
        position: [440, 300],
        parameters: { amount: 30, unit: 'seconds' },
      },
      {
        id: 'node-eval-self-heal',
        name: 'Evaluar Auto-Sanación en ARN',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [700, 300],
        parameters: {
          method: 'POST',
          url: `${siteUrl}/api/autopilot/n8n/self-healing`,
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: 'x-webhook-secret', value: '={{ $env.ARN_WEBHOOK_SECRET }}' },
            ],
          },
          sendBody: true,
          specifyBody: 'json',
          jsonBody:
            '={"serviceName": "{{ $json.body.monitor?.name || \'Servicio Proxmox\' }}", "status": "{{ $json.body.heartbeat?.status === 1 ? \'up\' : \'down\' }}", "downMinutes": {{ $json.body.downMinutes || 1 }}, "errorDetail": "{{ $json.body.msg || \'\' }}"}',
        },
      },
    ],
    connections: {
      'Webhook Uptime Kuma': {
        main: [[{ node: 'Esperar 30s (Descartar Microcorte)', type: 'main', index: 0 }]],
      },
      'Esperar 30s (Descartar Microcorte)': {
        main: [[{ node: 'Evaluar Auto-Sanación en ARN', type: 'main', index: 0 }]],
      },
    },
    settings: { timezone: 'America/Argentina/Buenos_Aires' },
  };

  const wf4 = {
    name: '04 · ARN Resumen Ejecutivo Diario (08:30 GMT-3)',
    nodes: [
      {
        id: 'node-cron-digest',
        name: 'Cron Diario 08:30 GMT-3',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [240, 300],
        parameters: {
          rule: {
            interval: [{ field: 'cronExpression', expression: '30 8 * * *' }],
          },
        },
      },
      {
        id: 'node-send-digest',
        name: 'Compilar y Enviar Digest Diario',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [520, 300],
        parameters: {
          method: 'POST',
          url: `${siteUrl}/api/autopilot/n8n/daily-digest`,
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: 'x-webhook-secret', value: '={{ $env.ARN_WEBHOOK_SECRET }}' },
            ],
          },
          sendBody: true,
          specifyBody: 'json',
          jsonBody: '{"sendEmail": true}',
        },
      },
    ],
    connections: {
      'Cron Diario 08:30 GMT-3': {
        main: [[{ node: 'Compilar y Enviar Digest Diario', type: 'main', index: 0 }]],
      },
    },
    settings: { timezone: 'America/Argentina/Buenos_Aires' },
  };

  return {
    dockerComposeYaml,
    envTemplate,
    cloudflareZeroTrustChecklist,
    n8nWorkflows: [
      {
        id: 'wf-whatsapp-agent',
        filename: '01_arn_whatsapp_audio_agent.json',
        title: 'Puente WhatsApp + Audio → Agente ARN',
        trigger: 'Webhook Evolution API v2',
        description:
          'Recibe texto y notas de voz desde WhatsApp Business, transcribe con Gemini y ejecuta la respuesta comercial o soporte Nivel 1.',
        json: wf1,
      },
      {
        id: 'wf-followup-noshow',
        filename: '02_arn_followup_48h_7d_and_meet.json',
        title: 'Seguimiento 48h/7d y Anti No-Show Meet',
        trigger: 'Cron cada 2h (Lun–Sáb 08–20hs)',
        description:
          'Hace seguimiento automático de presupuestos enviados sin respuesta y recuerda turnos de Google Meet 24h y 2h antes.',
        json: wf2,
      },
      {
        id: 'wf-uptime-self-heal',
        filename: '03_arn_uptime_kuma_self_healing.json',
        title: 'Auto-Sanación Uptime Kuma (Anti-Ruido)',
        trigger: 'Webhook Uptime Kuma',
        description:
          'Filtra microcortes de 30s, ejecuta intentos de auto-sanación en Proxmox y solo te escala si supera 15 min caído.',
        json: wf3,
      },
      {
        id: 'wf-daily-digest',
        filename: '04_arn_daily_executive_digest_0830.json',
        title: 'Resumen Ejecutivo Diario (08:30 GMT-3)',
        trigger: 'Cron diario 08:30 hs',
        description:
          'Envía un único reporte consolidado diario de conversaciones resueltas, alertas auto-sanadas y agenda Meet del día.',
        json: wf4,
      },
    ],
  };
}
