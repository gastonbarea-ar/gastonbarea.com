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

  const proposalData = req.body || {};

  if (!supabase) {
    return res.status(200).json({ success: true, mocked: true });
  }

  try {
    const { data, error } = await supabase.from('proposals').insert([
      {
        organization_type: proposalData.organizationType,
        company_name: proposalData.companyName || null,
        primary_challenge: proposalData.primaryChallenge,
        current_stack: proposalData.currentStack || [],
        urgency: proposalData.urgency,
        architecture_title: proposalData.architectureTitle,
        diagnostic_summary: proposalData.diagnosticSummary,
        estimated_timeline: proposalData.estimatedTimeline,
        recommended_stack: proposalData.recommendedStack || [],
        executive_message: proposalData.executiveMessage,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error al guardar propuesta en Supabase:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Trigger automated email in background
    try {
      const { sendProposalAutomation } = await import('../src/services/emailAutomation.ts');
      sendProposalAutomation(proposalData).catch((e) => console.error('Email automation error:', e));
    } catch (e) {
      // Non-blocking
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error('Excepción al conectar con Supabase:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
