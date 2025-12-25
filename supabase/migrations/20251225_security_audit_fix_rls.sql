-- ============================================================================
-- AZURIA - AUDITORIA DE SEGURANÇA E CORREÇÃO RLS
-- ============================================================================
-- Data: 24/12/2024
-- Descrição: Correção de todas as vulnerabilidades de segurança identificadas
--            pelo Security Advisor do Supabase
-- 
-- PROBLEMAS CORRIGIDOS:
-- 1. RLS Disabled em tabelas de Dynamic Pricing
-- 2. RLS Disabled em tabelas de RAG/Licitações  
-- 3. Security Definer View (v_price_monitoring_summary)
-- 4. Políticas RLS faltantes
-- ============================================================================

-- ============================================================================
-- PARTE 1: TABELAS DE DYNAMIC PRICING (CRÍTICO)
-- ============================================================================
-- Estas tabelas contêm dados sensíveis de precificação dos usuários
-- e estavam completamente expostas!

-- 1.1 pricing_rules - Regras de precificação automática
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing_rules_select" ON pricing_rules;
DROP POLICY IF EXISTS "pricing_rules_insert" ON pricing_rules;
DROP POLICY IF EXISTS "pricing_rules_update" ON pricing_rules;
DROP POLICY IF EXISTS "pricing_rules_delete" ON pricing_rules;

CREATE POLICY "pricing_rules_select" 
ON pricing_rules FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "pricing_rules_insert" 
ON pricing_rules FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "pricing_rules_update" 
ON pricing_rules FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "pricing_rules_delete" 
ON pricing_rules FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- 1.2 pricing_rule_executions - Histórico de execuções de regras
ALTER TABLE pricing_rule_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing_rule_executions_select" ON pricing_rule_executions;
DROP POLICY IF EXISTS "pricing_rule_executions_insert" ON pricing_rule_executions;
DROP POLICY IF EXISTS "pricing_rule_executions_update" ON pricing_rule_executions;
DROP POLICY IF EXISTS "pricing_rule_executions_delete" ON pricing_rule_executions;

CREATE POLICY "pricing_rule_executions_select" 
ON pricing_rule_executions FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "pricing_rule_executions_insert" 
ON pricing_rule_executions FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "pricing_rule_executions_update" 
ON pricing_rule_executions FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "pricing_rule_executions_delete" 
ON pricing_rule_executions FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- 1.3 price_adjustments - Ajustes de preço aplicados
ALTER TABLE price_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "price_adjustments_select" ON price_adjustments;
DROP POLICY IF EXISTS "price_adjustments_insert" ON price_adjustments;
DROP POLICY IF EXISTS "price_adjustments_update" ON price_adjustments;
DROP POLICY IF EXISTS "price_adjustments_delete" ON price_adjustments;

CREATE POLICY "price_adjustments_select" 
ON price_adjustments FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "price_adjustments_insert" 
ON price_adjustments FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "price_adjustments_update" 
ON price_adjustments FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "price_adjustments_delete" 
ON price_adjustments FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- 1.4 pricing_strategies - Estratégias de precificação
ALTER TABLE pricing_strategies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing_strategies_select" ON pricing_strategies;
DROP POLICY IF EXISTS "pricing_strategies_insert" ON pricing_strategies;
DROP POLICY IF EXISTS "pricing_strategies_update" ON pricing_strategies;
DROP POLICY IF EXISTS "pricing_strategies_delete" ON pricing_strategies;

CREATE POLICY "pricing_strategies_select" 
ON pricing_strategies FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "pricing_strategies_insert" 
ON pricing_strategies FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "pricing_strategies_update" 
ON pricing_strategies FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "pricing_strategies_delete" 
ON pricing_strategies FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- 1.5 price_history - Histórico de mudanças de preço
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "price_history_select" ON price_history;
DROP POLICY IF EXISTS "price_history_insert" ON price_history;
DROP POLICY IF EXISTS "price_history_update" ON price_history;
DROP POLICY IF EXISTS "price_history_delete" ON price_history;

CREATE POLICY "price_history_select" 
ON price_history FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "price_history_insert" 
ON price_history FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "price_history_update" 
ON price_history FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "price_history_delete" 
ON price_history FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- 1.6 pricing_performance_metrics - Métricas de performance
ALTER TABLE pricing_performance_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing_performance_metrics_select" ON pricing_performance_metrics;
DROP POLICY IF EXISTS "pricing_performance_metrics_insert" ON pricing_performance_metrics;
DROP POLICY IF EXISTS "pricing_performance_metrics_update" ON pricing_performance_metrics;
DROP POLICY IF EXISTS "pricing_performance_metrics_delete" ON pricing_performance_metrics;

CREATE POLICY "pricing_performance_metrics_select" 
ON pricing_performance_metrics FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "pricing_performance_metrics_insert" 
ON pricing_performance_metrics FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "pricing_performance_metrics_update" 
ON pricing_performance_metrics FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "pricing_performance_metrics_delete" 
ON pricing_performance_metrics FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- 1.7 price_simulations - Simulações de preço
ALTER TABLE price_simulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "price_simulations_select" ON price_simulations;
DROP POLICY IF EXISTS "price_simulations_insert" ON price_simulations;
DROP POLICY IF EXISTS "price_simulations_update" ON price_simulations;
DROP POLICY IF EXISTS "price_simulations_delete" ON price_simulations;

CREATE POLICY "price_simulations_select" 
ON price_simulations FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "price_simulations_insert" 
ON price_simulations FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "price_simulations_update" 
ON price_simulations FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "price_simulations_delete" 
ON price_simulations FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- PARTE 2: TABELAS DE RAG E LICITAÇÕES
-- ============================================================================
-- Algumas dessas tabelas são compartilhadas (sistema) e outras são por usuário

-- 2.1 rag_documents - Documentos indexados para RAG
-- Esta tabela é usada para armazenar embeddings de documentos de legislação
-- Como não tem user_id, pode ser considerada tabela de sistema compartilhada
-- Mas para segurança, vamos permitir apenas SELECT para usuários autenticados
-- e INSERT/UPDATE/DELETE apenas via service_role

ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rag_documents_select" ON rag_documents;
DROP POLICY IF EXISTS "rag_documents_system_all" ON rag_documents;

-- Usuários autenticados podem LER documentos de legislação (são públicos)
CREATE POLICY "rag_documents_select" 
ON rag_documents FOR SELECT 
TO authenticated
USING (true); -- Documentos de legislação são públicos para consulta

-- Service role (backend) pode fazer tudo
-- Nota: service_role bypassa RLS automaticamente

-- 2.2 portals - Portais de licitação monitorados
-- Esta tabela é de configuração do sistema (não tem user_id)
-- Usuários podem VER os portais disponíveis, mas não modificar

ALTER TABLE portals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portals_select" ON portals;

-- Usuários autenticados podem ver os portais disponíveis
CREATE POLICY "portals_select" 
ON portals FOR SELECT 
TO authenticated
USING (true);

-- Apenas service_role pode inserir/atualizar/deletar portais

-- 2.3 detected_editais - Editais detectados
-- Esta tabela não tem user_id direto, mas está vinculada a portals
-- Usuários podem ver todos os editais (são informações públicas de licitação)

ALTER TABLE detected_editais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "detected_editais_select" ON detected_editais;

-- Usuários autenticados podem ver editais (são públicos)
CREATE POLICY "detected_editais_select" 
ON detected_editais FOR SELECT 
TO authenticated
USING (true);

-- Apenas service_role pode inserir/atualizar (via scraping automático)

-- ============================================================================
-- PARTE 3: CORRIGIR VIEW COM SECURITY DEFINER
-- ============================================================================
-- A view v_price_monitoring_summary foi criada sem SECURITY INVOKER
-- o que significa que usa as permissões do criador da view (DEFINER)
-- Isso pode permitir acesso não autorizado a dados

-- Recriar a view com SECURITY INVOKER
DROP VIEW IF EXISTS v_price_monitoring_summary;

CREATE VIEW v_price_monitoring_summary 
WITH (security_invoker = true) -- CRÍTICO: usar permissões do usuário que consulta
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
    
    -- Estatísticas de concorrentes
    COUNT(DISTINCT cp.id) as competitors_count,
    AVG(cp.total_price) as avg_competitor_price,
    MIN(cp.total_price) as lowest_competitor_price,
    MAX(cp.total_price) as highest_competitor_price,
    
    -- Posição no mercado
    calculate_price_position(
        mp.current_price,
        AVG(cp.total_price),
        MIN(cp.total_price),
        MAX(cp.total_price)
    ) as price_position,
    
    -- Alertas pendentes
    COUNT(DISTINCT pa.id) FILTER (WHERE pa.is_read = false) as unread_alerts,
    
    -- Sugestões pendentes
    COUNT(DISTINCT ps.id) FILTER (WHERE ps.status = 'pending') as pending_suggestions
    
FROM monitored_products mp
LEFT JOIN competitor_prices cp ON cp.monitored_product_id = mp.id 
    AND cp.scraped_at > NOW() - INTERVAL '7 days'
    AND cp.is_valid = true
LEFT JOIN price_alerts pa ON pa.monitored_product_id = mp.id
LEFT JOIN price_suggestions ps ON ps.monitored_product_id = mp.id
GROUP BY mp.id;

-- Comentário explicativo
COMMENT ON VIEW v_price_monitoring_summary IS 
'View com resumo de monitoramento de preços por produto. 
SECURITY INVOKER garante que usuários só vejam seus próprios dados 
(via RLS de monitored_products).';

-- ============================================================================
-- PARTE 4: VERIFICAÇÃO E AUDITORIA
-- ============================================================================

-- Query para verificar todas as tabelas e seu status de RLS
-- Execute isso separadamente para verificar o resultado:
/*
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
*/

-- Query para verificar todas as políticas criadas:
/*
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/

-- ============================================================================
-- RESUMO DAS CORREÇÕES
-- ============================================================================
-- 
-- ✅ pricing_rules - RLS habilitado + 4 políticas (SELECT, INSERT, UPDATE, DELETE)
-- ✅ pricing_rule_executions - RLS habilitado + 4 políticas
-- ✅ price_adjustments - RLS habilitado + 4 políticas
-- ✅ pricing_strategies - RLS habilitado + 4 políticas
-- ✅ price_history - RLS habilitado + 4 políticas
-- ✅ pricing_performance_metrics - RLS habilitado + 4 políticas
-- ✅ price_simulations - RLS habilitado + 4 políticas
-- ✅ rag_documents - RLS habilitado + política SELECT (docs públicos)
-- ✅ portals - RLS habilitado + política SELECT (config pública)
-- ✅ detected_editais - RLS habilitado + política SELECT (licitações públicas)
-- ✅ v_price_monitoring_summary - Recriada com SECURITY INVOKER
--
-- RESULTADO: Cada usuário agora só pode ver e modificar SEUS PRÓPRIOS dados!
-- ============================================================================

-- ============================================================================
-- FIM DA MIGRAÇÃO DE SEGURANÇA
-- ============================================================================

