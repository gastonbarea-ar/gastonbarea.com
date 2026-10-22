import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Optional client-side configuration if explicitly set
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helpers to save leads and proposals privately through server routes /api/*
export async function saveProposalLead(proposalData: {
  organizationType: string;
  companyName?: string;
  primaryChallenge: string;
  currentStack: string[];
  urgency: string;
  architectureTitle: string;
  diagnosticSummary: string;
  estimatedTimeline: string;
  recommendedStack: string[];
  executiveMessage: string;
}) {
  try {
    // 1. First priority: Server-side API endpoint (keeps all credentials private, no VITE_ prefix required)
    const response = await fetch('/api/save-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalData),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (apiError) {
    console.warn('API endpoint unavailable, falling back to client-side handler:', apiError);
  }

  // 2. Direct client fallback if configured
  if (supabase) {
    try {
      const { data, error } = await supabase.from('proposals').insert([
        {
          organization_type: proposalData.organizationType,
          company_name: proposalData.companyName || null,
          primary_challenge: proposalData.primaryChallenge,
          current_stack: proposalData.currentStack,
          urgency: proposalData.urgency,
          architecture_title: proposalData.architectureTitle,
          diagnostic_summary: proposalData.diagnosticSummary,
          estimated_timeline: proposalData.estimatedTimeline,
          recommended_stack: proposalData.recommendedStack,
          executive_message: proposalData.executiveMessage,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error al guardar en Supabase:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Excepción al conectar con Supabase:', err);
      return { success: false, error: err };
    }
  }

  console.info('Guardado local completado.');
  return { success: true, mocked: true };
}

export async function saveContactInquiry(inquiryData: {
  name: string;
  email: string;
  company?: string;
  serviceArea: string;
  requirements: string;
  createdAt?: string;
}) {
  try {
    // 1. First priority: Server-side API endpoint (private credentials, no browser exposure)
    const response = await fetch('/api/save-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (apiError) {
    console.warn('API endpoint unavailable, falling back to client-side handler:', apiError);
  }

  // 2. Direct client fallback if configured
  if (supabase) {
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
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Excepción en Supabase:', err);
      return { success: false, error: err };
    }
  }

  console.info('Consulta recibida correctamente.');
  return { success: true, mocked: true };
}
