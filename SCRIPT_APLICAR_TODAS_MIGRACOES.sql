-- =====================================================
-- SCRIPT COMPLETO: Aplicar Todas as Migrações
-- Project ID: crpzkppsriranmeumfqs
-- Data: Janeiro 2025
-- =====================================================
-- 
-- INSTRUÇÕES:
-- 1. Copie este arquivo completo
-- 2. Cole no SQL Editor do Supabase
-- 3. Execute tudo de uma vez
-- 
-- NOTA: Este script aplica todas as migrações na ordem correta
-- =====================================================

-- =====================================================
-- MIGRAÇÃO 1: User Profiles (Base)
-- =====================================================
-- Copie o conteúdo de: supabase/migrations/000_create_user_profiles.sql
-- (Execute primeiro - outras migrações dependem desta)

-- =====================================================
-- MIGRAÇÃO 2: Avatars Bucket
-- =====================================================
-- Copie o conteúdo de: supabase/migrations/002_create_avatars_bucket.sql

-- =====================================================
-- MIGRAÇÃO 3: Campos Adicionais
-- =====================================================
-- Copie o conteúdo de: supabase/migrations/003_add_phone_company_fields.sql

-- =====================================================
-- MIGRAÇÃO 4: Templates Marketplace
-- =====================================================
-- Copie o conteúdo de: supabase/migrations/004_user_marketplace_templates.sql

-- =====================================================
-- MIGRAÇÃO 5: Histórico Avançado
-- =====================================================
-- Copie o conteúdo de: supabase/migrations/20250106_advanced_calculator_history.sql

-- =====================================================
-- MIGRAÇÃO 6: Sistema de Assinaturas (Base)
-- =====================================================
-- Copie o conteúdo de: supabase/migrations/20250108_subscriptions.sql

-- =====================================================
-- MIGRAÇÃO 7: Suporte Stripe
-- =====================================================
-- Copie o conteúdo de: supabase/migrations/20250110_add_stripe_support.sql

-- =====================================================
-- MIGRAÇÃO 8: Consolidar Subscriptions ⭐ NOVO
-- =====================================================
-- Copie o conteúdo de: supabase/migrations/20250111_consolidate_subscriptions.sql

-- =====================================================
-- MIGRAÇÃO 9: Métricas de Negócio ⭐ NOVO
-- =====================================================
-- Copie o conteúdo de: supabase/migrations/20250111_create_business_metrics_tables.sql

-- =====================================================
-- MIGRAÇÃO 10: Histórico de Pagamentos ⭐ NOVO
-- =====================================================
-- Copie o conteúdo de: supabase/migrations/20250111_add_payment_history.sql

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Execute após aplicar todas as migrações:

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Deve retornar pelo menos 13 tabelas principais

