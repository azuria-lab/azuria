-- ============================================================================
-- AZURIA - CORREÇÃO DE WARNINGS DE PERFORMANCE
-- ============================================================================
-- Data: 24/12/2024
-- Descrição: Corrige 164 warnings de performance do Security Advisor
--   - auth_rls_initplan: Usar (select auth.uid()) ao invés de auth.uid()
--   - multiple_permissive_policies: Remover políticas duplicadas
-- ============================================================================

-- ============================================================================
-- PARTE 1: REMOVER POLÍTICAS DUPLICADAS (multiple_permissive_policies)
-- ============================================================================
-- Mantemos apenas UMA política por tabela/role/action

-- suggestion_feedback: remover duplicatas
DROP POLICY IF EXISTS "suggestion_feedback_fail_safe" ON public.suggestion_feedback;
DROP POLICY IF EXISTS "suggestion_feedback_policy" ON public.suggestion_feedback;

-- user_achievements: remover duplicatas
DROP POLICY IF EXISTS "user_achievements_policy" ON public.user_achievements;

-- user_behavior_patterns: remover duplicatas
DROP POLICY IF EXISTS "user_behavior_patterns_fail_safe" ON public.user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_policy" ON public.user_behavior_patterns;

-- user_copilot_preferences: remover duplicatas
DROP POLICY IF EXISTS "user_copilot_preferences_policy" ON public.user_copilot_preferences;

-- user_personalization: remover duplicatas
DROP POLICY IF EXISTS "user_personalization_fail_safe" ON public.user_personalization;
DROP POLICY IF EXISTS "user_personalization_policy" ON public.user_personalization;

-- user_skill_metrics: remover duplicatas
DROP POLICY IF EXISTS "user_skill_metrics_fail_safe" ON public.user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_policy" ON public.user_skill_metrics;

-- user_suggestion_feedback: remover duplicatas (manter "Users can...")
DROP POLICY IF EXISTS "Service role full access feedback" ON public.user_suggestion_feedback;

-- user_suggestions: remover duplicatas (manter "Users can...")
DROP POLICY IF EXISTS "Service role full access suggestions" ON public.user_suggestions;

-- user_tutorial_progress: remover duplicatas
DROP POLICY IF EXISTS "user_tutorial_progress_policy" ON public.user_tutorial_progress;

-- ============================================================================
-- PARTE 2: RECRIAR POLÍTICAS COM (select auth.uid()) - GAMIFICAÇÃO
-- ============================================================================

-- user_personalization
DROP POLICY IF EXISTS "user_personalization_select_policy" ON public.user_personalization;
DROP POLICY IF EXISTS "user_personalization_insert_policy" ON public.user_personalization;
DROP POLICY IF EXISTS "user_personalization_update_policy" ON public.user_personalization;
DROP POLICY IF EXISTS "user_personalization_delete_policy" ON public.user_personalization;

CREATE POLICY "user_personalization_select_policy" ON public.user_personalization
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "user_personalization_insert_policy" ON public.user_personalization
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_personalization_update_policy" ON public.user_personalization
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "user_personalization_delete_policy" ON public.user_personalization
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- user_skill_metrics
DROP POLICY IF EXISTS "user_skill_metrics_select_policy" ON public.user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_insert_policy" ON public.user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_update_policy" ON public.user_skill_metrics;
DROP POLICY IF EXISTS "user_skill_metrics_delete_policy" ON public.user_skill_metrics;

CREATE POLICY "user_skill_metrics_select_policy" ON public.user_skill_metrics
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "user_skill_metrics_insert_policy" ON public.user_skill_metrics
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_skill_metrics_update_policy" ON public.user_skill_metrics
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "user_skill_metrics_delete_policy" ON public.user_skill_metrics
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- user_behavior_patterns
DROP POLICY IF EXISTS "user_behavior_patterns_select_policy" ON public.user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_insert_policy" ON public.user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_update_policy" ON public.user_behavior_patterns;
DROP POLICY IF EXISTS "user_behavior_patterns_delete_policy" ON public.user_behavior_patterns;

CREATE POLICY "user_behavior_patterns_select_policy" ON public.user_behavior_patterns
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "user_behavior_patterns_insert_policy" ON public.user_behavior_patterns
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_behavior_patterns_update_policy" ON public.user_behavior_patterns
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "user_behavior_patterns_delete_policy" ON public.user_behavior_patterns
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- user_copilot_preferences
DROP POLICY IF EXISTS "Allow copilot preferences access" ON public.user_copilot_preferences;

CREATE POLICY "user_copilot_preferences_access" ON public.user_copilot_preferences
    FOR ALL TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- suggestion_feedback
DROP POLICY IF EXISTS "suggestion_feedback_select_policy" ON public.suggestion_feedback;
DROP POLICY IF EXISTS "suggestion_feedback_insert_policy" ON public.suggestion_feedback;
DROP POLICY IF EXISTS "suggestion_feedback_update_policy" ON public.suggestion_feedback;
DROP POLICY IF EXISTS "suggestion_feedback_delete_policy" ON public.suggestion_feedback;

CREATE POLICY "suggestion_feedback_select_policy" ON public.suggestion_feedback
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "suggestion_feedback_insert_policy" ON public.suggestion_feedback
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "suggestion_feedback_update_policy" ON public.suggestion_feedback
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "suggestion_feedback_delete_policy" ON public.suggestion_feedback
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- user_tutorial_progress
DROP POLICY IF EXISTS "Allow tutorial progress access" ON public.user_tutorial_progress;

CREATE POLICY "user_tutorial_progress_access" ON public.user_tutorial_progress
    FOR ALL TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- user_achievements
DROP POLICY IF EXISTS "Allow achievements access" ON public.user_achievements;

CREATE POLICY "user_achievements_access" ON public.user_achievements
    FOR ALL TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- PARTE 3: RECRIAR POLÍTICAS - PRESETS E HISTÓRICO
-- ============================================================================

-- maquininha_presets
DROP POLICY IF EXISTS "Users can view own maquininha presets" ON public.maquininha_presets;
DROP POLICY IF EXISTS "Users can insert own maquininha presets" ON public.maquininha_presets;
DROP POLICY IF EXISTS "Users can update own maquininha presets" ON public.maquininha_presets;
DROP POLICY IF EXISTS "Users can delete own maquininha presets" ON public.maquininha_presets;

CREATE POLICY "maquininha_presets_select" ON public.maquininha_presets
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "maquininha_presets_insert" ON public.maquininha_presets
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "maquininha_presets_update" ON public.maquininha_presets
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "maquininha_presets_delete" ON public.maquininha_presets
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- impostos_presets
DROP POLICY IF EXISTS "Users can view own impostos presets" ON public.impostos_presets;
DROP POLICY IF EXISTS "Users can insert own impostos presets" ON public.impostos_presets;
DROP POLICY IF EXISTS "Users can update own impostos presets" ON public.impostos_presets;
DROP POLICY IF EXISTS "Users can delete own impostos presets" ON public.impostos_presets;

CREATE POLICY "impostos_presets_select" ON public.impostos_presets
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "impostos_presets_insert" ON public.impostos_presets
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "impostos_presets_update" ON public.impostos_presets
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "impostos_presets_delete" ON public.impostos_presets
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- taxas_historico
DROP POLICY IF EXISTS "Users can view own taxas historico" ON public.taxas_historico;
DROP POLICY IF EXISTS "Users can insert own taxas historico" ON public.taxas_historico;
DROP POLICY IF EXISTS "Users can delete own taxas historico" ON public.taxas_historico;

CREATE POLICY "taxas_historico_select" ON public.taxas_historico
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "taxas_historico_insert" ON public.taxas_historico
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "taxas_historico_delete" ON public.taxas_historico
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- ============================================================================
-- PARTE 4: RECRIAR POLÍTICAS - COMPANY DATA E CHAT
-- ============================================================================

-- company_data
DROP POLICY IF EXISTS "Users can view their own company data" ON public.company_data;
DROP POLICY IF EXISTS "Users can insert their own company data" ON public.company_data;
DROP POLICY IF EXISTS "Users can update their own company data" ON public.company_data;
DROP POLICY IF EXISTS "Users can delete their own company data" ON public.company_data;

CREATE POLICY "company_data_select" ON public.company_data
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "company_data_insert" ON public.company_data
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "company_data_update" ON public.company_data
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "company_data_delete" ON public.company_data
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- chat_rooms (membros estão na tabela chat_room_members)
DROP POLICY IF EXISTS "Users can view rooms they are members of" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can update rooms they created or are admin" ON public.chat_rooms;

CREATE POLICY "chat_rooms_select" ON public.chat_rooms
    FOR SELECT TO authenticated
    USING (
        created_by = (select auth.uid()) 
        OR EXISTS (
            SELECT 1 FROM public.chat_room_members crm 
            WHERE crm.room_id = id 
            AND crm.user_id = (select auth.uid())
        )
    );

CREATE POLICY "chat_rooms_insert" ON public.chat_rooms
    FOR INSERT TO authenticated
    WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "chat_rooms_update" ON public.chat_rooms
    FOR UPDATE TO authenticated
    USING (created_by = (select auth.uid()));

-- chat_room_members
DROP POLICY IF EXISTS "Users can view members of rooms they belong to" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can add members to rooms they created or are admin" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can update their own member status" ON public.chat_room_members;

CREATE POLICY "chat_room_members_select" ON public.chat_room_members
    FOR SELECT TO authenticated
    USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.chat_room_members crm 
            WHERE crm.room_id = chat_room_members.room_id 
            AND crm.user_id = (select auth.uid())
        )
    );

CREATE POLICY "chat_room_members_insert" ON public.chat_room_members
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_rooms cr 
            WHERE cr.id = room_id 
            AND cr.created_by = (select auth.uid())
        )
    );

CREATE POLICY "chat_room_members_update" ON public.chat_room_members
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

-- chat_messages
DROP POLICY IF EXISTS "Users can view messages from rooms they belong to" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in rooms they belong to" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;

CREATE POLICY "chat_messages_select" ON public.chat_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_room_members crm 
            WHERE crm.room_id = chat_messages.room_id 
            AND crm.user_id = (select auth.uid())
        )
    );

CREATE POLICY "chat_messages_insert" ON public.chat_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = (select auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.chat_room_members crm 
            WHERE crm.room_id = room_id 
            AND crm.user_id = (select auth.uid())
        )
    );

CREATE POLICY "chat_messages_update" ON public.chat_messages
    FOR UPDATE TO authenticated
    USING (sender_id = (select auth.uid()));

-- chat_message_reads
DROP POLICY IF EXISTS "Users can view reads from rooms they belong to" ON public.chat_message_reads;
DROP POLICY IF EXISTS "Users can create reads for messages in rooms they belong to" ON public.chat_message_reads;

CREATE POLICY "chat_message_reads_select" ON public.chat_message_reads
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "chat_message_reads_insert" ON public.chat_message_reads
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- PARTE 5: RECRIAR POLÍTICAS - USER STATUS E PROFILES
-- ============================================================================

-- user_status
DROP POLICY IF EXISTS "Users can update their own status" ON public.user_status;
DROP POLICY IF EXISTS "Users can insert their own status" ON public.user_status;

CREATE POLICY "user_status_select" ON public.user_status
    FOR SELECT TO authenticated
    USING (true); -- Status é público para permitir ver quem está online

CREATE POLICY "user_status_insert" ON public.user_status
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_status_update" ON public.user_status
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

-- user_interest_profiles
DROP POLICY IF EXISTS "user_interest_profiles_policy" ON public.user_interest_profiles;

CREATE POLICY "user_interest_profiles_access" ON public.user_interest_profiles
    FOR ALL TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- alerts
DROP POLICY IF EXISTS "alerts_policy" ON public.alerts;

CREATE POLICY "alerts_access" ON public.alerts
    FOR ALL TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- processed_documents
DROP POLICY IF EXISTS "processed_documents_policy" ON public.processed_documents;

CREATE POLICY "processed_documents_access" ON public.processed_documents
    FOR ALL TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- xai_explanations
DROP POLICY IF EXISTS "xai_explanations_policy" ON public.xai_explanations;

CREATE POLICY "xai_explanations_access" ON public.xai_explanations
    FOR ALL TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- PARTE 6: RECRIAR POLÍTICAS - DYNAMIC PRICING
-- ============================================================================

-- monitored_products
DROP POLICY IF EXISTS "Users can view own monitored products" ON public.monitored_products;
DROP POLICY IF EXISTS "Users can insert own monitored products" ON public.monitored_products;
DROP POLICY IF EXISTS "Users can update own monitored products" ON public.monitored_products;
DROP POLICY IF EXISTS "Users can delete own monitored products" ON public.monitored_products;

CREATE POLICY "monitored_products_select" ON public.monitored_products
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "monitored_products_insert" ON public.monitored_products
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "monitored_products_update" ON public.monitored_products
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "monitored_products_delete" ON public.monitored_products
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- competitor_prices (usa monitored_product_id, não product_id)
DROP POLICY IF EXISTS "Users can view competitor prices for own products" ON public.competitor_prices;

CREATE POLICY "competitor_prices_select" ON public.competitor_prices
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.monitored_products mp 
            WHERE mp.id = monitored_product_id 
            AND mp.user_id = (select auth.uid())
        )
    );

-- price_suggestions
DROP POLICY IF EXISTS "Users can view own price suggestions" ON public.price_suggestions;
DROP POLICY IF EXISTS "Users can update own price suggestions" ON public.price_suggestions;

CREATE POLICY "price_suggestions_select" ON public.price_suggestions
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "price_suggestions_update" ON public.price_suggestions
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

-- price_alerts
DROP POLICY IF EXISTS "Users can view own price alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Users can update own price alerts" ON public.price_alerts;

CREATE POLICY "price_alerts_select" ON public.price_alerts
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "price_alerts_update" ON public.price_alerts
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

-- price_monitoring_history (não tem user_id direto, usa monitored_product_id)
DROP POLICY IF EXISTS "Users can view own monitoring history" ON public.price_monitoring_history;

CREATE POLICY "price_monitoring_history_select" ON public.price_monitoring_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.monitored_products mp 
            WHERE mp.id = monitored_product_id 
            AND mp.user_id = (select auth.uid())
        )
    );

-- price_monitoring_settings
DROP POLICY IF EXISTS "Users can view own settings" ON public.price_monitoring_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.price_monitoring_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.price_monitoring_settings;

CREATE POLICY "price_monitoring_settings_select" ON public.price_monitoring_settings
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "price_monitoring_settings_insert" ON public.price_monitoring_settings
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "price_monitoring_settings_update" ON public.price_monitoring_settings
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

-- ============================================================================
-- PARTE 7: RECRIAR POLÍTICAS - PRICING RULES E STRATEGIES
-- ============================================================================

-- pricing_rules
DROP POLICY IF EXISTS "pricing_rules_select" ON public.pricing_rules;
DROP POLICY IF EXISTS "pricing_rules_insert" ON public.pricing_rules;
DROP POLICY IF EXISTS "pricing_rules_update" ON public.pricing_rules;
DROP POLICY IF EXISTS "pricing_rules_delete" ON public.pricing_rules;

CREATE POLICY "pricing_rules_select" ON public.pricing_rules
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "pricing_rules_insert" ON public.pricing_rules
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "pricing_rules_update" ON public.pricing_rules
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "pricing_rules_delete" ON public.pricing_rules
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- pricing_rule_executions
DROP POLICY IF EXISTS "pricing_rule_executions_select" ON public.pricing_rule_executions;
DROP POLICY IF EXISTS "pricing_rule_executions_insert" ON public.pricing_rule_executions;
DROP POLICY IF EXISTS "pricing_rule_executions_update" ON public.pricing_rule_executions;
DROP POLICY IF EXISTS "pricing_rule_executions_delete" ON public.pricing_rule_executions;

CREATE POLICY "pricing_rule_executions_select" ON public.pricing_rule_executions
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "pricing_rule_executions_insert" ON public.pricing_rule_executions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "pricing_rule_executions_update" ON public.pricing_rule_executions
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "pricing_rule_executions_delete" ON public.pricing_rule_executions
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- price_adjustments
DROP POLICY IF EXISTS "price_adjustments_select" ON public.price_adjustments;
DROP POLICY IF EXISTS "price_adjustments_insert" ON public.price_adjustments;
DROP POLICY IF EXISTS "price_adjustments_update" ON public.price_adjustments;
DROP POLICY IF EXISTS "price_adjustments_delete" ON public.price_adjustments;

CREATE POLICY "price_adjustments_select" ON public.price_adjustments
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "price_adjustments_insert" ON public.price_adjustments
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "price_adjustments_update" ON public.price_adjustments
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "price_adjustments_delete" ON public.price_adjustments
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- pricing_strategies
DROP POLICY IF EXISTS "pricing_strategies_select" ON public.pricing_strategies;
DROP POLICY IF EXISTS "pricing_strategies_insert" ON public.pricing_strategies;
DROP POLICY IF EXISTS "pricing_strategies_update" ON public.pricing_strategies;
DROP POLICY IF EXISTS "pricing_strategies_delete" ON public.pricing_strategies;

CREATE POLICY "pricing_strategies_select" ON public.pricing_strategies
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "pricing_strategies_insert" ON public.pricing_strategies
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "pricing_strategies_update" ON public.pricing_strategies
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "pricing_strategies_delete" ON public.pricing_strategies
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- price_history
DROP POLICY IF EXISTS "price_history_select" ON public.price_history;
DROP POLICY IF EXISTS "price_history_insert" ON public.price_history;
DROP POLICY IF EXISTS "price_history_update" ON public.price_history;
DROP POLICY IF EXISTS "price_history_delete" ON public.price_history;

CREATE POLICY "price_history_select" ON public.price_history
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "price_history_insert" ON public.price_history
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "price_history_update" ON public.price_history
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "price_history_delete" ON public.price_history
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- pricing_performance_metrics
DROP POLICY IF EXISTS "pricing_performance_metrics_select" ON public.pricing_performance_metrics;
DROP POLICY IF EXISTS "pricing_performance_metrics_insert" ON public.pricing_performance_metrics;
DROP POLICY IF EXISTS "pricing_performance_metrics_update" ON public.pricing_performance_metrics;
DROP POLICY IF EXISTS "pricing_performance_metrics_delete" ON public.pricing_performance_metrics;

CREATE POLICY "pricing_performance_metrics_select" ON public.pricing_performance_metrics
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "pricing_performance_metrics_insert" ON public.pricing_performance_metrics
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "pricing_performance_metrics_update" ON public.pricing_performance_metrics
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "pricing_performance_metrics_delete" ON public.pricing_performance_metrics
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- price_simulations
DROP POLICY IF EXISTS "price_simulations_select" ON public.price_simulations;
DROP POLICY IF EXISTS "price_simulations_insert" ON public.price_simulations;
DROP POLICY IF EXISTS "price_simulations_update" ON public.price_simulations;
DROP POLICY IF EXISTS "price_simulations_delete" ON public.price_simulations;

CREATE POLICY "price_simulations_select" ON public.price_simulations
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "price_simulations_insert" ON public.price_simulations
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "price_simulations_update" ON public.price_simulations
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "price_simulations_delete" ON public.price_simulations
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- ============================================================================
-- PARTE 8: RECRIAR POLÍTICAS - USER SUGGESTIONS
-- ============================================================================

-- user_suggestions
DROP POLICY IF EXISTS "Users can view own suggestions" ON public.user_suggestions;
DROP POLICY IF EXISTS "Users can insert own suggestions" ON public.user_suggestions;
DROP POLICY IF EXISTS "Users can update own suggestions" ON public.user_suggestions;

CREATE POLICY "user_suggestions_select" ON public.user_suggestions
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "user_suggestions_insert" ON public.user_suggestions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_suggestions_update" ON public.user_suggestions
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()));

-- user_suggestion_feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON public.user_suggestion_feedback;
DROP POLICY IF EXISTS "Users can insert feedback" ON public.user_suggestion_feedback;

CREATE POLICY "user_suggestion_feedback_select" ON public.user_suggestion_feedback
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

CREATE POLICY "user_suggestion_feedback_insert" ON public.user_suggestion_feedback
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

