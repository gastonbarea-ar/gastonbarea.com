import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function generateRuleBasedProposal(payload: any) {
  const { organizationType, primaryChallenge, currentStack = [], urgency = 'Media', customContext = '' } = payload;
  let title = 'Topología de Servidores Blindada & Contenedorización con Docker';
  let stack = ['Linux Ubuntu LTS', 'Docker Compose', 'PostgreSQL 16', 'Nginx Reverse Proxy', 'WireGuard VPN'];
  let time = '4 a 6 semanas';
  let diag = `Se detecta riesgo de sobrecarga por falta de aislamiento de procesos en la infraestructura actual. La solución requiere contenedorización con Docker y optimización de base de datos PostgreSQL.`;

  if (primaryChallenge?.includes('BI') || primaryChallenge?.includes('Excel') || primaryChallenge?.includes('Datos')) {
    title = 'Data Warehouse Centralizado & Pipeline ETL para Business Intelligence';
    stack = ['PostgreSQL Data Warehouse', 'Python ETL', 'Metabase / Power BI', 'Docker Compose', 'Backups Automáticos'];
    time = '4 a 5 semanas';
    diag = `La dispersión de información en hojas de cálculo y silos desconectados genera reportes desactualizados y pérdida de horas hombre. El diseño implementará un repositorio único con ingesta automatizada.`;
  } else if (primaryChallenge?.includes('Odoo') || primaryChallenge?.includes('ERP')) {
    title = 'Despliegue & Optimización de Odoo ERP Corporativo en Linux';
    stack = ['Odoo ERP Community/Enterprise', 'PostgreSQL Tuning', 'Docker Compose', 'Nginx con SSL', 'Backups Cifrados Diarios'];
    time = '6 a 8 semanas';
    diag = `La integración de módulos de ventas, inventario, facturación y compras requiere una base relacional optimizada con pooling de conexiones y entornos de staging.`;
  }

  return {
    architectureTitle: title,
    diagnosticSummary: diag,
    estimatedTimeline: time,
    recommendedStack: stack,
    keyComponents: [
      { name: 'Capa de Seguridad & Red', detail: 'Firewall UFW, túnel WireGuard VPN y certificados SSL TLS 1.3 automáticos.' },
      { name: 'Capa de Ejecución (Contenedores)', detail: 'Servicios aislados mediante Docker Compose con límites de memoria y reinicio supervisado.' },
      { name: 'Capa de Persistencia & Datos', detail: 'PostgreSQL con esquemas normalizados y esquema de volcado cifrado diario fuera de sitio.' },
    ],
    workPhases: [
      { phase: 'Fase 1: Diagnóstico & Relevamiento', duration: 'Semana 1', deliverable: 'Informe de auditoría técnica y diagrama de topología.' },
      { phase: 'Fase 2: Aprovisionamiento Staging', duration: 'Semanas 2-3', deliverable: 'Entorno de pruebas y scripts de migración.' },
      { phase: 'Fase 3: Puesta en Producción', duration: 'Semana 4', deliverable: 'Puesta en marcha con cero tiempo de inactividad.' },
    ],
    tangibleBenefits: [
      'Disponibilidad del 99.9% asegurada mediante contenedores aislados',
      'Cero dependencia de proveedores externos con costos en dólares impredecibles',
      'Copias de seguridad automáticas cifradas con restauración probada',
    ],
    executiveMessage: `Estimado equipo de ${organizationType || 'la organización'}: este esquema preliminar ataca de raíz el problema de ${primaryChallenge || 'continuidad operativa'}. Podemos revisar los detalles en una llamada técnica de 25 minutos.`,
    isAiGenerated: false,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      organizationType = 'Empresa Privada',
      primaryChallenge = 'Caídas o lentitud de infraestructura',
      currentStack = [],
      urgency = 'Media',
      customContext = '',
      contactName = '',
    } = req.body || {};

    if (ai) {
      const prompt = `
Actúa como Gastón Barea, Consultor Tecnológico Senior y Arquitecto de Software (gastonbarea.com.ar).
Un potencial cliente ha completado el formulario de diagnóstico con los siguientes datos:
- Organización: ${organizationType}
- Desafío: ${primaryChallenge}
- Stack actual: ${currentStack.join(', ') || 'No especificado'}
- Urgencia: ${urgency}
- Contexto adicional: "${customContext || 'Sin detalles'}"
- Contacto: ${contactName || 'Gerencia'}

Genera una propuesta técnica pragmática en formato JSON con arquitectura, diagnóstico, stack, fases, beneficios y mensaje ejecutivo.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'Eres el Arquitecto de Software Gastón Barea. Responde siempre en español formal y pragmático en JSON.',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              architectureTitle: { type: Type.STRING },
              diagnosticSummary: { type: Type.STRING },
              estimatedTimeline: { type: Type.STRING },
              recommendedStack: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyComponents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    detail: { type: Type.STRING },
                  },
                  required: ['name', 'detail'],
                },
              },
              workPhases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    deliverable: { type: Type.STRING },
                  },
                  required: ['phase', 'duration', 'deliverable'],
                },
              },
              tangibleBenefits: { type: Type.ARRAY, items: { type: Type.STRING } },
              executiveMessage: { type: Type.STRING },
            },
            required: [
              'architectureTitle',
              'diagnosticSummary',
              'estimatedTimeline',
              'recommendedStack',
              'keyComponents',
              'workPhases',
              'tangibleBenefits',
              'executiveMessage',
            ],
          },
        },
      });

      if (response.text) {
        return res.status(200).json({
          ...JSON.parse(response.text),
          isAiGenerated: true,
        });
      }
    }

    const fallback = generateRuleBasedProposal(req.body || {});
    return res.status(200).json(fallback);
  } catch (error) {
    console.error('Error Vercel handler:', error);
    const fallback = generateRuleBasedProposal(req.body || {});
    return res.status(200).json(fallback);
  }
}
