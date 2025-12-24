-- ============================================================================
-- AZURIA - CORREÇÃO DE WARNINGS DE SEGURANÇA
-- ============================================================================
-- Data: 24/12/2024
-- Descrição: Corrige warnings do Security Advisor:
--   - 17 funções com search_path mutável
-- ============================================================================

-- ============================================================================
-- CORRIGIR SEARCH_PATH DAS FUNÇÕES
-- ============================================================================
-- Adiciona search_path = '' para evitar ataques de search_path injection

DO $$
BEGIN
    -- 1. search_users_by_location
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'search_users_by_location') THEN
        ALTER FUNCTION public.search_users_by_location SET search_path = '';
    END IF;

    -- 2. search_users_by_skill
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'search_users_by_skill') THEN
        ALTER FUNCTION public.search_users_by_skill SET search_path = '';
    END IF;

    -- 3. calculate_price_position
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_price_position') THEN
        ALTER FUNCTION public.calculate_price_position SET search_path = '';
    END IF;

    -- 4. mark_messages_as_read
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'mark_messages_as_read') THEN
        ALTER FUNCTION public.mark_messages_as_read SET search_path = '';
    END IF;

    -- 5. update_skill_metrics_updated_at
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_skill_metrics_updated_at') THEN
        ALTER FUNCTION public.update_skill_metrics_updated_at SET search_path = '';
    END IF;

    -- 6. update_updated_at_column
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        ALTER FUNCTION public.update_updated_at_column SET search_path = '';
    END IF;

    -- 7. search_documents
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'search_documents') THEN
        ALTER FUNCTION public.search_documents SET search_path = '';
    END IF;

    -- 8. set_message_delivered
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_message_delivered') THEN
        ALTER FUNCTION public.set_message_delivered SET search_path = '';
    END IF;

    -- 9. update_chat_room_last_message
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_chat_room_last_message') THEN
        ALTER FUNCTION public.update_chat_room_last_message SET search_path = '';
    END IF;

    -- 10. get_unread_alerts
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_unread_alerts') THEN
        ALTER FUNCTION public.get_unread_alerts SET search_path = '';
    END IF;

    -- 11. get_unread_count
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_unread_count') THEN
        ALTER FUNCTION public.get_unread_count SET search_path = '';
    END IF;

    -- 12. expire_old_suggestions
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'expire_old_suggestions') THEN
        ALTER FUNCTION public.expire_old_suggestions SET search_path = '';
    END IF;

    -- 13. update_tutorial_progress_updated_at
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_tutorial_progress_updated_at') THEN
        ALTER FUNCTION public.update_tutorial_progress_updated_at SET search_path = '';
    END IF;

    -- 14. update_personalization_updated_at
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_personalization_updated_at') THEN
        ALTER FUNCTION public.update_personalization_updated_at SET search_path = '';
    END IF;

    -- 15. update_copilot_preferences_updated_at
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_copilot_preferences_updated_at') THEN
        ALTER FUNCTION public.update_copilot_preferences_updated_at SET search_path = '';
    END IF;

    -- 16. mark_alert_read
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'mark_alert_read') THEN
        ALTER FUNCTION public.mark_alert_read SET search_path = '';
    END IF;

    -- 17. get_monitoring_stats
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_monitoring_stats') THEN
        ALTER FUNCTION public.get_monitoring_stats SET search_path = '';
    END IF;

    RAISE NOTICE 'Search path corrigido para todas as funções!';
END $$;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
