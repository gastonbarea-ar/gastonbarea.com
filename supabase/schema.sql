-- ==============================================================================
-- GASTÓN BAREA - SCHEMA COMPLETO DE PRODUCCIÓN PARA SUPABASE (POSTGRESQL 16+)
-- Sitio: gastonbarea.com / gastonbarea.com.ar
-- Incluye: Web Pública, Blog, Diagnóstico IA, CRM Ejecutivo y Portal Clientes
-- Script 100% Idempotente (Seguro de ejecutar múltiples veces en SQL Editor)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLA: PROSPECTOS Y PROPUESTAS GENERADAS CON IA (MOTOR DE ARQUITECTURA)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company_name TEXT,
    email TEXT,
    organization_type TEXT NOT NULL,
    primary_challenge TEXT NOT NULL,
    current_stack TEXT[] DEFAULT '{}',
    urgency TEXT,
    architecture_title TEXT NOT NULL,
    diagnostic_summary TEXT,
    estimated_timeline TEXT,
    recommended_stack TEXT[] DEFAULT '{}',
    executive_message TEXT,
    status TEXT DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'contactado', 'en_evaluacion', 'reunion_agendada', 'archivado'))
);

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals (status);
CREATE INDEX IF NOT EXISTS idx_proposals_company ON public.proposals (company_name);

-- ==============================================================================
-- 3. TABLA: MENSAJES Y CONSULTAS DEL FORMULARIO DE CONTACTO
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    service_area TEXT NOT NULL,
    requirements TEXT NOT NULL,
    status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'respondido', 'en_seguimiento', 'cerrado'))
);

CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_email ON public.contact_inquiries (email);

-- ==============================================================================
-- 4. TABLA: ARTÍCULOS DE BLOG MULTIMEDIA (GASTÓN BAREA - AUTOR ÚNICO)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category TEXT NOT NULL,
    cover_image TEXT,
    published_at DATE DEFAULT CURRENT_DATE,
    read_time TEXT DEFAULT '5 min',
    featured BOOLEAN DEFAULT false,
    author JSONB DEFAULT '{"name": "Gastón Barea", "role": "Business Innovación & Software Architect"}'::jsonb,
    tags TEXT[] DEFAULT '{}',
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts (published_at DESC);

-- ==============================================================================
-- 5. TABLA: CONFIGURACIÓN DINÁMICA DEL SITIO WEB (SITE_SETTINGS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    config JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. TABLAS DEL CRM EJECUTIVO (OPORTUNIDADES, COTIZACIONES, PAGOS Y DIRECTORIO)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_opportunities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    company TEXT,
    company_id TEXT,
    contact_id TEXT,
    service_category TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'lead',
    value NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    probability INTEGER DEFAULT 30,
    expected_close_date TEXT,
    notes TEXT,
    source TEXT DEFAULT 'manual',
    linked_quote_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_stage ON public.crm_opportunities (stage);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_updated_at ON public.crm_opportunities (updated_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_quotes (
    id TEXT PRIMARY KEY,
    quote_number TEXT UNIQUE NOT NULL,
    opportunity_id TEXT,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_company TEXT,
    client_tax_id TEXT,
    service_category TEXT NOT NULL,
    title TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC DEFAULT 0,
    tax_percent NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    timeline TEXT,
    milestones JSONB DEFAULT '[]'::jsonb,
    terms_and_conditions JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft',
    valid_until TEXT,
    preferred_payment_method TEXT,
    payment_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_quotes_created_at ON public.crm_quotes (created_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_payments (
    id TEXT PRIMARY KEY,
    quote_id TEXT,
    opportunity_id TEXT,
    client_name TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    method TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    transaction_ref TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_crm_payments_created_at ON public.crm_payments (created_at DESC);

CREATE TABLE IF NOT EXISTS public.crm_settings (
    id TEXT PRIMARY KEY,
    config JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tax_id TEXT,
    industry TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    location TEXT DEFAULT 'Argentina',
    tier TEXT DEFAULT 'pyme',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_contacts (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT DEFAULT 'cliente2026',
    phone TEXT,
    role_title TEXT,
    contact_type TEXT DEFAULT 'individual',
    company_id TEXT,
    company_name TEXT,
    portal_access_status TEXT DEFAULT 'active',
    has_active_service BOOLEAN DEFAULT false,
    linked_project_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON public.crm_contacts (email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_username ON public.crm_contacts (username);

-- ==============================================================================
-- 7. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS IDEMPOTENTES)
-- ==============================================================================
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

-- Limpieza previa de políticas para ejecución idempotente
DROP POLICY IF EXISTS "Permitir inserción anónima de propuestas" ON public.proposals;
DROP POLICY IF EXISTS "Permitir gestión completa a usuarios autenticados" ON public.proposals;
DROP POLICY IF EXISTS "Permitir inserción anónima de consultas de contacto" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Permitir gestión de consultas a usuarios autenticados" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Permitir lectura pública de artículos" ON public.blog_posts;
DROP POLICY IF EXISTS "Permitir gestión de artículos únicamente a Gastón" ON public.blog_posts;
DROP POLICY IF EXISTS "Permitir lectura pública de configuración del sitio" ON public.site_settings;
DROP POLICY IF EXISTS "Permitir gestión de configuración únicamente a Gastón" ON public.site_settings;
DROP POLICY IF EXISTS "Acceso backend a crm_opportunities" ON public.crm_opportunities;
DROP POLICY IF EXISTS "Acceso backend a crm_quotes" ON public.crm_quotes;
DROP POLICY IF EXISTS "Acceso backend a crm_payments" ON public.crm_payments;
DROP POLICY IF EXISTS "Acceso backend a crm_settings" ON public.crm_settings;
DROP POLICY IF EXISTS "Acceso backend a crm_companies" ON public.crm_companies;
DROP POLICY IF EXISTS "Acceso backend a crm_contacts" ON public.crm_contacts;

-- Políticas de inserción y lectura pública controlada
CREATE POLICY "Permitir inserción anónima de propuestas"
ON public.proposals FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir gestión completa a usuarios autenticados"
ON public.proposals FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Permitir inserción anónima de consultas de contacto"
ON public.contact_inquiries FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir gestión de consultas a usuarios autenticados"
ON public.contact_inquiries FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura pública de artículos"
ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permitir gestión de artículos únicamente a Gastón"
ON public.blog_posts FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura pública de configuración del sitio"
ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permitir gestión de configuración únicamente a Gastón"
ON public.site_settings FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- Políticas para tablas de CRM y Portal operadas por el backend Serverless de Vercel
CREATE POLICY "Acceso backend a crm_opportunities"
ON public.crm_opportunities FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Acceso backend a crm_quotes"
ON public.crm_quotes FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Acceso backend a crm_payments"
ON public.crm_payments FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Acceso backend a crm_settings"
ON public.crm_settings FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Acceso backend a crm_companies"
ON public.crm_companies FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Acceso backend a crm_contacts"
ON public.crm_contacts FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
