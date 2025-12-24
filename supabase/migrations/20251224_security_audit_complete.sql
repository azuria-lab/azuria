-- ============================================================================
-- AZURIA - AUDITORIA DE SEGURANÇA COMPLETA - TODAS AS TABELAS
-- ============================================================================
-- Data: 24/12/2024
-- Descrição: Script completo para garantir RLS em TODAS as tabelas com user_id
-- 
-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase Cloud
-- 2. Execute também no Supabase Local (se aplicável)
-- 3. Use o script de verificação para confirmar
-- ============================================================================

-- ============================================================================
-- PARTE 1: TABELAS DE DYNAMIC PRICING (CRÍTICO)
-- ============================================================================

-- pricing_rules
ALTER TABLE IF EXISTS pricing_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pricing_rules_select" ON pricing_rules;
DROP POLICY IF EXISTS "pricing_rules_insert" ON pricing_rules;
DROP POLICY IF EXISTS "pricing_rules_update" ON pricing_rules;
DROP POLICY IF EXISTS "pricing_rules_delete" ON pricing_rules;
CREATE POLICY "pricing_rules_select" ON pricing_rules FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pricing_rules_insert" ON pricing_rules FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "pricing_rules_update" ON pricing_rules FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "pricing_rules_delete" ON pricing_rules FOR DELETE TO authenticated USING (user_id = auth.uid());

-- pricing_rule_executions
ALTER TABLE IF EXISTS pricing_rule_executions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pricing_rule_executions_select" ON pricing_rule_executions;
DROP POLICY IF EXISTS "pricing_rule_executions_insert" ON pricing_rule_executions;
DROP POLICY IF EXISTS "pricing_rule_executions_update" ON pricing_rule_executions;
DROP POLICY IF EXISTS "pricing_rule_executions_delete" ON pricing_rule_executions;
CREATE POLICY "pricing_rule_executions_select" ON pricing_rule_executions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pricing_rule_executions_insert" ON pricing_rule_executions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "pricing_rule_executions_update" ON pricing_rule_executions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "pricing_rule_executions_delete" ON pricing_rule_executions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- price_adjustments
ALTER TABLE IF EXISTS price_adjustments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "price_adjustments_select" ON price_adjustments;
DROP POLICY IF EXISTS "price_adjustments_insert" ON price_adjustments;
DROP POLICY IF EXISTS "price_adjustments_update" ON price_adjustments;
DROP POLICY IF EXISTS "price_adjustments_delete" ON price_adjustments;
CREATE POLICY "price_adjustments_select" ON price_adjustments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "price_adjustments_insert" ON price_adjustments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "price_adjustments_update" ON price_adjustments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "price_adjustments_delete" ON price_adjustments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- pricing_strategies
ALTER TABLE IF EXISTS pricing_strategies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pricing_strategies_select" ON pricing_strategies;
DROP POLICY IF EXISTS "pricing_strategies_insert" ON pricing_strategies;
DROP POLICY IF EXISTS "pricing_strategies_update" ON pricing_strategies;
DROP POLICY IF EXISTS "pricing_strategies_delete" ON pricing_strategies;
CREATE POLICY "pricing_strategies_select" ON pricing_strategies FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pricing_strategies_insert" ON pricing_strategies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "pricing_strategies_update" ON pricing_strategies FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "pricing_strategies_delete" ON pricing_strategies FOR DELETE TO authenticated USING (user_id = auth.uid());

-- price_history
ALTER TABLE IF EXISTS price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "price_history_select" ON price_history;
DROP POLICY IF EXISTS "price_history_insert" ON price_history;
DROP POLICY IF EXISTS "price_history_update" ON price_history;
DROP POLICY IF EXISTS "price_history_delete" ON price_history;
CREATE POLICY "price_history_select" ON price_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "price_history_insert" ON price_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "price_history_update" ON price_history FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "price_history_delete" ON price_history FOR DELETE TO authenticated USING (user_id = auth.uid());

-- pricing_performance_metrics
ALTER TABLE IF EXISTS pricing_performance_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pricing_performance_metrics_select" ON pricing_performance_metrics;
DROP POLICY IF EXISTS "pricing_performance_metrics_insert" ON pricing_performance_metrics;
DROP POLICY IF EXISTS "pricing_performance_metrics_update" ON pricing_performance_metrics;
DROP POLICY IF EXISTS "pricing_performance_metrics_delete" ON pricing_performance_metrics;
CREATE POLICY "pricing_performance_metrics_select" ON pricing_performance_metrics FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pricing_performance_metrics_insert" ON pricing_performance_metrics FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "pricing_performance_metrics_update" ON pricing_performance_metrics FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "pricing_performance_metrics_delete" ON pricing_performance_metrics FOR DELETE TO authenticated USING (user_id = auth.uid());

-- price_simulations
ALTER TABLE IF EXISTS price_simulations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "price_simulations_select" ON price_simulations;
DROP POLICY IF EXISTS "price_simulations_insert" ON price_simulations;
DROP POLICY IF EXISTS "price_simulations_update" ON price_simulations;
DROP POLICY IF EXISTS "price_simulations_delete" ON price_simulations;
CREATE POLICY "price_simulations_select" ON price_simulations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "price_simulations_insert" ON price_simulations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "price_simulations_update" ON price_simulations FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "price_simulations_delete" ON price_simulations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- PARTE 2: TABELAS DE RAG/LICITAÇÕES (DADOS PÚBLICOS DE LEITURA)
-- ============================================================================

-- rag_documents (documentos de legislação - público para leitura)
ALTER TABLE IF EXISTS rag_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rag_documents_select" ON rag_documents;
CREATE POLICY "rag_documents_select" ON rag_documents FOR SELECT TO authenticated USING (true);

-- portals (portais de licitação - configuração pública)
ALTER TABLE IF EXISTS portals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portals_select" ON portals;
CREATE POLICY "portals_select" ON portals FOR SELECT TO authenticated USING (true);

-- detected_editais (editais públicos de licitação)
ALTER TABLE IF EXISTS detected_editais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "detected_editais_select" ON detected_editais;
CREATE POLICY "detected_editais_select" ON detected_editais FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- PARTE 3: TABELAS DE PAGAMENTO E ASSINATURA
-- ============================================================================

-- abacatepay_billings
ALTER TABLE IF EXISTS abacatepay_billings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "abacatepay_billings_select" ON abacatepay_billings;
DROP POLICY IF EXISTS "abacatepay_billings_insert" ON abacatepay_billings;
DROP POLICY IF EXISTS "abacatepay_billings_update" ON abacatepay_billings;
CREATE POLICY "abacatepay_billings_select" ON abacatepay_billings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "abacatepay_billings_insert" ON abacatepay_billings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "abacatepay_billings_update" ON abacatepay_billings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- subscriptions
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscriptions_select" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update" ON subscriptions;
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "subscriptions_update" ON subscriptions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- usage_tracking
ALTER TABLE IF EXISTS usage_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usage_tracking_select" ON usage_tracking;
DROP POLICY IF EXISTS "usage_tracking_insert" ON usage_tracking;
DROP POLICY IF EXISTS "usage_tracking_update" ON usage_tracking;
CREATE POLICY "usage_tracking_select" ON usage_tracking FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "usage_tracking_insert" ON usage_tracking FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "usage_tracking_update" ON usage_tracking FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- payment_history
ALTER TABLE IF EXISTS payment_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_history_select" ON payment_history;
CREATE POLICY "payment_history_select" ON payment_history FOR SELECT TO authenticated USING (user_id = auth.uid());

-- plan_change_history
ALTER TABLE IF EXISTS plan_change_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plan_change_history_select" ON plan_change_history;
CREATE POLICY "plan_change_history_select" ON plan_change_history FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- PARTE 4: TABELAS DE PRESETS E HISTÓRICO
-- ============================================================================

-- maquininha_presets
ALTER TABLE IF EXISTS maquininha_presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "maquininha_presets_select" ON maquininha_presets;
DROP POLICY IF EXISTS "maquininha_presets_insert" ON maquininha_presets;
DROP POLICY IF EXISTS "maquininha_presets_update" ON maquininha_presets;
DROP POLICY IF EXISTS "maquininha_presets_delete" ON maquininha_presets;
CREATE POLICY "maquininha_presets_select" ON maquininha_presets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "maquininha_presets_insert" ON maquininha_presets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "maquininha_presets_update" ON maquininha_presets FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "maquininha_presets_delete" ON maquininha_presets FOR DELETE TO authenticated USING (user_id = auth.uid());

-- impostos_presets
ALTER TABLE IF EXISTS impostos_presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "impostos_presets_select" ON impostos_presets;
DROP POLICY IF EXISTS "impostos_presets_insert" ON impostos_presets;
DROP POLICY IF EXISTS "impostos_presets_update" ON impostos_presets;
DROP POLICY IF EXISTS "impostos_presets_delete" ON impostos_presets;
CREATE POLICY "impostos_presets_select" ON impostos_presets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "impostos_presets_insert" ON impostos_presets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "impostos_presets_update" ON impostos_presets FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "impostos_presets_delete" ON impostos_presets FOR DELETE TO authenticated USING (user_id = auth.uid());

-- taxas_historico
ALTER TABLE IF EXISTS taxas_historico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "taxas_historico_select" ON taxas_historico;
DROP POLICY IF EXISTS "taxas_historico_insert" ON taxas_historico;
DROP POLICY IF EXISTS "taxas_historico_delete" ON taxas_historico;
CREATE POLICY "taxas_historico_select" ON taxas_historico FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "taxas_historico_insert" ON taxas_historico FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "taxas_historico_delete" ON taxas_historico FOR DELETE TO authenticated USING (user_id = auth.uid());

-- advanced_calculation_history
ALTER TABLE IF EXISTS advanced_calculation_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "advanced_calculation_history_select" ON advanced_calculation_history;
DROP POLICY IF EXISTS "advanced_calculation_history_insert" ON advanced_calculation_history;
DROP POLICY IF EXISTS "advanced_calculation_history_update" ON advanced_calculation_history;
DROP POLICY IF EXISTS "advanced_calculation_history_delete" ON advanced_calculation_history;
CREATE POLICY "advanced_calculation_history_select" ON advanced_calculation_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "advanced_calculation_history_insert" ON advanced_calculation_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "advanced_calculation_history_update" ON advanced_calculation_history FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "advanced_calculation_history_delete" ON advanced_calculation_history FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- PARTE 5: TABELAS DE MÉTRICAS DE NEGÓCIO
-- ============================================================================

-- business_metrics
ALTER TABLE IF EXISTS business_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "business_metrics_select" ON business_metrics;
DROP POLICY IF EXISTS "business_metrics_insert" ON business_metrics;
DROP POLICY IF EXISTS "business_metrics_update" ON business_metrics;
DROP POLICY IF EXISTS "business_metrics_delete" ON business_metrics;
CREATE POLICY "business_metrics_select" ON business_metrics FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "business_metrics_insert" ON business_metrics FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "business_metrics_update" ON business_metrics FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "business_metrics_delete" ON business_metrics FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- PARTE 6: TABELAS DE APRENDIZADO E IA (verificar se já tem RLS)
-- ============================================================================

-- user_suggestions
ALTER TABLE IF EXISTS user_suggestions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_suggestions_policy" ON user_suggestions;
DROP POLICY IF EXISTS "Allow suggestions access" ON user_suggestions;
CREATE POLICY "user_suggestions_policy" ON user_suggestions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- suggestion_feedback
ALTER TABLE IF EXISTS suggestion_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "suggestion_feedback_policy" ON suggestion_feedback;
DROP POLICY IF EXISTS "Allow suggestion feedback access" ON suggestion_feedback;
CREATE POLICY "suggestion_feedback_policy" ON suggestion_feedback FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_copilot_preferences
ALTER TABLE IF EXISTS user_copilot_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_copilot_preferences_policy" ON user_copilot_preferences;
DROP POLICY IF EXISTS "Allow copilot preferences access" ON user_copilot_preferences;
CREATE POLICY "user_copilot_preferences_policy" ON user_copilot_preferences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_behavior_patterns
ALTER TABLE IF EXISTS user_behavior_patterns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_behavior_patterns_policy" ON user_behavior_patterns;
DROP POLICY IF EXISTS "Allow user behavior patterns access" ON user_behavior_patterns;
CREATE POLICY "user_behavior_patterns_policy" ON user_behavior_patterns FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_skill_metrics
ALTER TABLE IF EXISTS user_skill_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_skill_metrics_policy" ON user_skill_metrics;
DROP POLICY IF EXISTS "Allow user skill metrics access" ON user_skill_metrics;
CREATE POLICY "user_skill_metrics_policy" ON user_skill_metrics FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_tutorial_progress
ALTER TABLE IF EXISTS user_tutorial_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_tutorial_progress_policy" ON user_tutorial_progress;
DROP POLICY IF EXISTS "Allow tutorial progress access" ON user_tutorial_progress;
CREATE POLICY "user_tutorial_progress_policy" ON user_tutorial_progress FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_achievements
ALTER TABLE IF EXISTS user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_achievements_policy" ON user_achievements;
DROP POLICY IF EXISTS "Allow achievements access" ON user_achievements;
CREATE POLICY "user_achievements_policy" ON user_achievements FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_personalization
ALTER TABLE IF EXISTS user_personalization ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_personalization_policy" ON user_personalization;
DROP POLICY IF EXISTS "Allow user personalization access" ON user_personalization;
CREATE POLICY "user_personalization_policy" ON user_personalization FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PARTE 7: CORRIGIR VIEW COM SECURITY INVOKER
-- ============================================================================

-- Recriar a view com SECURITY INVOKER
DROP VIEW IF EXISTS v_price_monitoring_summary;

CREATE OR REPLACE VIEW v_price_monitoring_summary 
WITH (security_invoker = true)
AS
SELECT 
    mp.id,
    mp.user_id,
    mp.product_name,
    mp.current_price,
    mp.cost_price,
    mp.target_margin,
    mp.monitor_enabled,
    mp.last_checked_at,
    COUNT(DISTINCT cp.id) as competitors_count,
    AVG(cp.total_price) as avg_competitor_price,
    MIN(cp.total_price) as lowest_competitor_price,
    MAX(cp.total_price) as highest_competitor_price,
    calculate_price_position(
        mp.current_price,
        AVG(cp.total_price),
        MIN(cp.total_price),
        MAX(cp.total_price)
    ) as price_position,
    COUNT(DISTINCT pa.id) FILTER (WHERE pa.is_read = false) as unread_alerts,
    COUNT(DISTINCT ps.id) FILTER (WHERE ps.status = 'pending') as pending_suggestions
FROM monitored_products mp
LEFT JOIN competitor_prices cp ON cp.monitored_product_id = mp.id 
    AND cp.scraped_at > NOW() - INTERVAL '7 days'
    AND cp.is_valid = true
LEFT JOIN price_alerts pa ON pa.monitored_product_id = mp.id
LEFT JOIN price_suggestions ps ON ps.monitored_product_id = mp.id
GROUP BY mp.id;

-- ============================================================================
-- PARTE 8: TABELAS DE MARKETPLACE TEMPLATES
-- ============================================================================

-- user_marketplace_templates
ALTER TABLE IF EXISTS user_marketplace_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_marketplace_templates_select" ON user_marketplace_templates;
DROP POLICY IF EXISTS "user_marketplace_templates_insert" ON user_marketplace_templates;
DROP POLICY IF EXISTS "user_marketplace_templates_update" ON user_marketplace_templates;
DROP POLICY IF EXISTS "user_marketplace_templates_delete" ON user_marketplace_templates;
CREATE POLICY "user_marketplace_templates_select" ON user_marketplace_templates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_marketplace_templates_insert" ON user_marketplace_templates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_marketplace_templates_update" ON user_marketplace_templates FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_marketplace_templates_delete" ON user_marketplace_templates FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- PARTE 9: TABELAS DE DOCUMENTOS
-- ============================================================================

-- documentos
ALTER TABLE IF EXISTS documentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "documentos_select" ON documentos;
DROP POLICY IF EXISTS "documentos_insert" ON documentos;
DROP POLICY IF EXISTS "documentos_update" ON documentos;
DROP POLICY IF EXISTS "documentos_delete" ON documentos;
CREATE POLICY "documentos_select" ON documentos FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "documentos_insert" ON documentos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "documentos_update" ON documentos FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "documentos_delete" ON documentos FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Execute esta query para verificar o resultado:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- ============================================================================
-- FIM DO SCRIPT DE AUDITORIA COMPLETA
-- ============================================================================

