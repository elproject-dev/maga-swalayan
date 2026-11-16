-- ========================================================
-- FIX RLS PERMISSIONS: PROMO WHATSAPP TEMPLATES & SENT LOGS
-- Project: MAGA SWALAYAN
-- ========================================================

-- 1. Pastikan tabel promo_templates ada
CREATE TABLE IF NOT EXISTS public.promo_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    owner_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hapus policy lama yang membatasi / memblokir
DROP POLICY IF EXISTS "Users can view their own promo templates" ON public.promo_templates;
DROP POLICY IF EXISTS "Users can insert their own promo templates" ON public.promo_templates;
DROP POLICY IF EXISTS "Users can update their own promo templates" ON public.promo_templates;
DROP POLICY IF EXISTS "Users can delete their own promo templates" ON public.promo_templates;
DROP POLICY IF EXISTS "Allow all for promo_templates" ON public.promo_templates;
DROP POLICY IF EXISTS "Enable all for promo_templates" ON public.promo_templates;

-- 3. Aktifkan Policy Terbuka (Permissive) untuk promo_templates
-- Mengizinkan SELECT, INSERT, UPDATE, DELETE untuk publik, anon, dan authenticated
ALTER TABLE public.promo_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for promo_templates" ON public.promo_templates
    FOR ALL
    TO public, anon, authenticated
    USING (true)
    WITH CHECK (true);

GRANT ALL ON TABLE public.promo_templates TO anon, authenticated, postgres, service_role, PUBLIC;
GRANT ALL ON SEQUENCE public.promo_templates_id_seq TO anon, authenticated, postgres, service_role, PUBLIC;


-- 4. Pastikan tabel promo_sent_logs ada
CREATE TABLE IF NOT EXISTS public.promo_sent_logs (
    id SERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    template_id INT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    owner_id TEXT
);

-- 5. Hapus policy lama untuk promo_sent_logs
DROP POLICY IF EXISTS "Users can view their own promo sent logs" ON public.promo_sent_logs;
DROP POLICY IF EXISTS "Users can insert their own promo sent logs" ON public.promo_sent_logs;
DROP POLICY IF EXISTS "Allow all for promo_sent_logs" ON public.promo_sent_logs;
DROP POLICY IF EXISTS "Enable all for promo_sent_logs" ON public.promo_sent_logs;

-- 6. Aktifkan Policy Terbuka (Permissive) untuk promo_sent_logs
ALTER TABLE public.promo_sent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for promo_sent_logs" ON public.promo_sent_logs
    FOR ALL
    TO public, anon, authenticated
    USING (true)
    WITH CHECK (true);

GRANT ALL ON TABLE public.promo_sent_logs TO anon, authenticated, postgres, service_role, PUBLIC;
GRANT ALL ON SEQUENCE public.promo_sent_logs_id_seq TO anon, authenticated, postgres, service_role, PUBLIC;


-- 7. Muat ulang cache schema PostgREST Supabase
NOTIFY pgrst, 'reload schema';
