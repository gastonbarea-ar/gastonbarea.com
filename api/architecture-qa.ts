import { GoogleGenAI } from '@google/genai';

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

  const { question, proposalContext } = req.body || {};
  if (!question) {
    return res.status(400).json({ error: 'Pregunta requerida' });
  }

  try {
    if (ai) {
      const prompt = `
Actúa como Gastón Barea, Arquitecto de Software Senior y Consultor Tecnológico.
El cliente está revisando esta propuesta preliminar:
"${JSON.stringify(proposalContext || {})}"

Consulta específica del cliente:
"${question}"

Responde con precisión de ingeniero pragmático en 2 párrafos concisos y claros para gerentes.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Eres Gastón Barea. Respuestas técnicas, claras, pragmáticas sin rodeos.',
        },
      });

      return res.status(200).json({ answer: response.text });
    }

    return res.status(200).json({
      answer: `Con respecto a tu consulta ("${question}"): Toda arquitectura que diseño para producción se despliega de manera desacoplada en contenedores Docker y con persistencia validada en PostgreSQL. Esto permite probar cambios en un entorno espejo de staging sin riesgo para la operación diaria.`,
    });
  } catch (error) {
    console.error('Error Vercel QA handler:', error);
    return res.status(200).json({
      answer: `Buena consulta. Toda decisión de arquitectura en mis proyectos se valida con pruebas de carga previas y estándares abiertos para evitar costos ocultos. Lo revisaremos a fondo en nuestra reunión de diagnóstico.`,
    });
  }
}
