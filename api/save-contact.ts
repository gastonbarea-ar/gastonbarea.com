import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const inquiryData = req.body || {};

  if (!supabase) {
    return res.status(200).json({ success: true, mocked: true });
  }

  try {
    const { data, error } = await supabase.from('contact_inquiries').insert([
      {
        name: inquiryData.name,
        email: inquiryData.email,
        company: inquiryData.company || null,
        service_area: inquiryData.serviceArea,
        requirements: inquiryData.requirements,
        created_at: inquiryData.createdAt || new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error al guardar consulta en Supabase:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Trigger automated contact notification in background
    try {
      const { sendContactAutomation } = await import('../src/services/emailAutomation.ts');
      sendContactAutomation(inquiryData).catch((e) => console.error('Contact email error:', e));
    } catch (e) {
      // Non-blocking
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error('Excepción en Supabase:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
