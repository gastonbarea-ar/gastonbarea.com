import { GoogleGenAI, Type } from '@google/genai';
import { buildCustomSolutionBlueprint } from '../src/lib/domainLogic.ts';

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rawQuery = (req.body?.query || '').trim();
  if (!rawQuery) {
    return res.status(400).json({ error: 'Consulta requerida para diseñar la solución' });
  }

  const baseBlueprint = buildCustomSolutionBlueprint(rawQuery);

  if (ai) {
    try {
      const prompt = `El usuario realizó la siguiente consulta en la barra estratégica de gastonbarea.com:
"${rawQuery}"

Diseña una solución tecnológica y de dirección ejecutiva PMO reorganizando el contenido y creando 3 servicios/módulos a medida para sus necesidades.
Ids válidos de proyectos en catálogo para reordenar según relevancia (recommendedProjectIds):
- "gemelo-digital-gastonbarea"
- "trazabilidad-bioeconomia-iot"
- "odoo-v18-b2b2c-multideposito"
- "ebt-plataforma-analitica-productiva"
- "agente-rag-operaciones-b2b"
- "infraestructura-critica-linux-cluster"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'Eres el Gemelo Digital de Gastón Barea (30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes PMO). Responde siempre en español rioplatense profesional y ejecutivo en JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              solutionTitle: { type: Type.STRING },
              executiveDiagnosis: { type: Type.STRING },
              primaryVertical: { type: Type.STRING },
              estimatedTimeline: { type: Type.STRING },
              recommendedStack: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              tailoredServices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    code: { type: Type.STRING },
                    title: { type: Type.STRING },
                    problemSolved: { type: Type.STRING },
                    technicalApproach: { type: Type.STRING },
                    deliverable: { type: Type.STRING },
                    impactMetric: { type: Type.STRING },
                  },
                  required: [
                    'code',
                    'title',
                    'problemSolved',
                    'technicalApproach',
                    'deliverable',
                    'impactMetric',
                  ],
                },
              },
              roadmapPhases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseCode: { type: Type.STRING },
                    percentage: { type: Type.STRING },
                    title: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    deliverable: { type: Type.STRING },
                    verificationCriteria: { type: Type.STRING },
                  },
                  required: [
                    'phaseCode',
                    'percentage',
                    'title',
                    'duration',
                    'deliverable',
                    'verificationCriteria',
                  ],
                },
              },
              recommendedProjectIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'solutionTitle',
              'executiveDiagnosis',
              'primaryVertical',
              'estimatedTimeline',
              'recommendedStack',
              'tailoredServices',
              'roadmapPhases',
              'recommendedProjectIds',
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.status(200).json({
          blueprint: {
            ...baseBlueprint,
            ...parsed,
            id: `sol-ai-${Date.now()}`,
            query: rawQuery,
            createdAt: new Date().toISOString(),
            matchedSolution: baseBlueprint.matchedSolution,
            isAiGenerated: true,
          },
        });
      }
    } catch (err) {
      console.error('Vercel /api/ai-custom-solution fallback:', err);
    }
  }

  return res.status(200).json({ blueprint: baseBlueprint });
}
