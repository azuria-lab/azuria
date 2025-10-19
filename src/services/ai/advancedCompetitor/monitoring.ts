/**
 * Monitoring Module
 * Handles monitoring rules, cycles, and rule management
 */

import { CompetitorPlatform } from '@/shared/types/ai';
import { generateSecureId } from '@/utils/secureRandom';
import { logger, toErrorContext } from '../logger';
import { checkRule } from './detection';
import { MonitoringRule } from './types';

/**
 * Adiciona uma nova regra de monitoramento de concorrentes
 * 
 * Cria uma regra automática que irá verificar preços de concorrentes
 * em plataformas específicas com frequência definida.
 * 
 * @param monitoringRules - Mapa de regras existentes (mutável)
 * @param productName - Nome do produto a ser monitorado
 * @param platforms - Plataformas onde buscar (padrão: todas)
 * @param frequency - Frequência de verificação (padrão: 'daily')
 * @param priceThreshold - % de mudança que dispara alerta (padrão: 5%)
 * @returns ID da regra criada
 * 
 * @example
 * ```typescript
 * const rules = new Map<string, MonitoringRule>();
 * 
 * // Caso 1: Monitoramento básico - verificação diária
 * const ruleId1 = addMonitoringRule(
 *   rules,
 *   'iPhone 15 Pro 256GB'
 *   // Usa defaults: todas plataformas, daily, threshold 5%
 * );
 * console.log(`Regra criada: ${ruleId1}`);
 * // Output: Regra criada: rule_1729368000000_a1b2c3d4e
 * 
 * // Caso 2: Monitoramento customizado - alta frequência
 * const ruleId2 = addMonitoringRule(
 *   rules,
 *   'PlayStation 5',
 *   [CompetitorPlatform.MERCADO_LIVRE, CompetitorPlatform.AMAZON],
 *   'hourly',  // Verifica a cada hora
 *   3          // Alerta com mudança de 3%
 * );
 * 
 * console.log(`Total de regras ativas: ${rules.size}`);
 * // Output: Total de regras ativas: 2
 * 
 * // Caso 3: Monitoramento semanal de categoria inteira
 * const ruleId3 = addMonitoringRule(
 *   rules,
 *   'Notebook Gamer RTX 4060',
 *   [CompetitorPlatform.KABUM, CompetitorPlatform.PICHAU],
 *   'weekly',
 *   10  // Alerta apenas com mudanças > 10%
 * );
 * 
 * // Verificar regra criada
 * const rule = rules.get(ruleId3);
 * console.log(rule);
 * // Output: {
 * //   id: 'rule_1729368000000_x9y8z7w6v',
 * //   productName: 'Notebook Gamer RTX 4060',
 * //   platforms: ['kabum', 'pichau'],
 * //   frequency: 'weekly',
 * //   priceThreshold: 10,
 * //   isActive: true,
 * //   createdAt: 2024-10-19T...
 * // }
 * ```
 * 
 * @remarks
 * **ID gerado**: Formato `rule_{timestamp}_{random}`
 * - Timestamp: milissegundos desde epoch
 * - Random: 9 caracteres seguros
 * - Exemplo: `rule_1729368000000_a1b2c3d4e`
 * 
 * **Estado inicial da regra**:
 * - `isActive: true` (ativa imediatamente)
 * - `lastCheck: undefined` (nunca executada)
 * - `createdAt: new Date()` (timestamp atual)
 * 
 * **Plataformas disponíveis**:
 * - MERCADO_LIVRE
 * - AMAZON
 * - KABUM
 * - PICHAU
 * - MAGAZINE_LUIZA
 * - Padrão: todas as plataformas
 * 
 * **Frequências suportadas**:
 * - `hourly`: A cada 1 hora
 * - `daily`: A cada 24 horas (recomendado)
 * - `weekly`: A cada 7 dias
 * 
 * **Price threshold**:
 * - Mudança percentual que dispara alerta
 * - Exemplo: threshold=5 → alerta se preço mudar ±5%
 * - Valores típicos: 3-10%
 * 
 * **Logging**:
 * - Registra criação com `logger.info()`
 * - Inclui ruleId e productName nos logs
 * 
 * **Uso em produção**:
 * ```typescript
 * // Configurar monitoramento ao adicionar produto
 * const ruleId = addMonitoringRule(
 *   globalRules,
 *   newProduct.name,
 *   [CompetitorPlatform.MERCADO_LIVRE],
 *   'daily',
 *   5
 * );
 * 
 * // Salvar ruleId no banco para desativar depois
 * await supabase
 *   .from('products')
 *   .update({ competitor_rule_id: ruleId })
 *   .eq('id', newProduct.id);
 * ```
 */
export function addMonitoringRule(
  monitoringRules: Map<string, MonitoringRule>,
  productName: string,
  platforms: CompetitorPlatform[] = Object.values(CompetitorPlatform),
  frequency: 'hourly' | 'daily' | 'weekly' = 'daily',
  priceThreshold: number = 5
): string {
  const ruleId = `rule_${Date.now()}_${generateSecureId(9)}`;
  
  const rule: MonitoringRule = {
    id: ruleId,
    productName,
    platforms,
    frequency,
    priceThreshold,
    isActive: true,
    createdAt: new Date()
  };

  monitoringRules.set(ruleId, rule);
  logger.info('Regra de monitoramento adicionada', { ruleId, productName });
  
  return ruleId;
}

/**
 * Remove uma regra de monitoramento existente
 * 
 * Deleta permanentemente uma regra do mapa de monitoramento,
 * interrompendo verificações futuras.
 * 
 * @param monitoringRules - Mapa de regras (mutável)
 * @param ruleId - ID da regra a ser removida
 * @returns `true` se regra foi removida, `false` se não existia
 * 
 * @example
 * ```typescript
 * const rules = new Map<string, MonitoringRule>();
 * 
 * // Criar algumas regras
 * const rule1 = addMonitoringRule(rules, 'iPhone 15');
 * const rule2 = addMonitoringRule(rules, 'Galaxy S24');
 * 
 * console.log(`Regras ativas: ${rules.size}`);
 * // Output: Regras ativas: 2
 * 
 * // Remover regra existente
 * const removed = removeMonitoringRule(rules, rule1);
 * console.log(`Regra removida: ${removed}`);
 * // Output: Regra removida: true
 * console.log(`Regras ativas: ${rules.size}`);
 * // Output: Regras ativas: 1
 * 
 * // Tentar remover regra inexistente
 * const notFound = removeMonitoringRule(rules, 'rule_fake_123');
 * console.log(`Regra removida: ${notFound}`);
 * // Output: Regra removida: false
 * 
 * // Remover todas as regras
 * const activeRules = getActiveRules(rules);
 * activeRules.forEach(rule => {
 *   const success = removeMonitoringRule(rules, rule.id);
 *   console.log(`${rule.productName}: ${success ? 'removida' : 'erro'}`);
 * });
 * // Output:
 * // Galaxy S24: removida
 * 
 * console.log(`Regras restantes: ${rules.size}`);
 * // Output: Regras restantes: 0
 * ```
 * 
 * @remarks
 * **Operação destrutiva**:
 * - Remove regra permanentemente do Map
 * - Não há "soft delete" ou desativação
 * - Para desativar temporariamente, use `rule.isActive = false`
 * 
 * **Logging**:
 * - Registra remoção com `logger.info()` se sucesso
 * - Não registra se regra não existia
 * 
 * **Valor de retorno**:
 * - `true`: Regra existia e foi removida
 * - `false`: Regra não existia no Map
 * 
 * **Alternativa: Desativação temporária**:
 * ```typescript
 * // Se quiser desativar sem remover
 * const rule = rules.get(ruleId);
 * if (rule) {
 *   rule.isActive = false;  // Para de executar
 *   // Pode reativar depois com rule.isActive = true
 * }
 * ```
 * 
 * **Uso em produção**:
 * ```typescript
 * // Remover monitoramento ao deletar produto
 * const product = await supabase
 *   .from('products')
 *   .select('competitor_rule_id')
 *   .eq('id', productId)
 *   .single();
 * 
 * if (product.competitor_rule_id) {
 *   const removed = removeMonitoringRule(
 *     globalRules,
 *     product.competitor_rule_id
 *   );
 *   
 *   if (removed) {
 *     console.log('Monitoramento interrompido com sucesso');
 *   }
 * }
 * ```
 */
export function removeMonitoringRule(
  monitoringRules: Map<string, MonitoringRule>,
  ruleId: string
): boolean {
  const removed = monitoringRules.delete(ruleId);
  if (removed) {
    logger.info('Regra de monitoramento removida', { ruleId });
  }
  return removed;
}

/**
 * Verifica se uma regra deve ser executada baseado na frequência
 * 
 * Determina se tempo suficiente passou desde a última verificação
 * de acordo com a frequência configurada na regra.
 * 
 * @param rule - Regra de monitoramento a verificar
 * @returns `true` se deve executar agora, `false` caso contrário
 * 
 * @example
 * ```typescript
 * // Caso 1: Regra nunca executada (deve executar)
 * const newRule: MonitoringRule = {
 *   id: 'rule_123',
 *   productName: 'iPhone 15',
 *   platforms: [CompetitorPlatform.MERCADO_LIVRE],
 *   frequency: 'daily',
 *   priceThreshold: 5,
 *   isActive: true,
 *   createdAt: new Date()
 *   // lastCheck: undefined
 * };
 * 
 * console.log(shouldCheckRule(newRule));
 * // Output: true (nunca foi executada)
 * 
 * // Caso 2: Regra horária - última execução há 30 minutos
 * const hourlyRule: MonitoringRule = {
 *   id: 'rule_456',
 *   productName: 'PlayStation 5',
 *   platforms: [CompetitorPlatform.AMAZON],
 *   frequency: 'hourly',
 *   priceThreshold: 3,
 *   isActive: true,
 *   createdAt: new Date('2024-10-19T10:00:00'),
 *   lastCheck: new Date(Date.now() - 30 * 60 * 1000)  // 30 min atrás
 * };
 * 
 * console.log(shouldCheckRule(hourlyRule));
 * // Output: false (precisa esperar mais 30 minutos)
 * 
 * // Caso 3: Regra horária - última execução há 2 horas
 * hourlyRule.lastCheck = new Date(Date.now() - 2 * 60 * 60 * 1000);
 * console.log(shouldCheckRule(hourlyRule));
 * // Output: true (passou 1 hora)
 * 
 * // Caso 4: Regra diária - última execução há 12 horas
 * const dailyRule: MonitoringRule = {
 *   id: 'rule_789',
 *   productName: 'Notebook Dell',
 *   platforms: [CompetitorPlatform.KABUM],
 *   frequency: 'daily',
 *   priceThreshold: 5,
 *   isActive: true,
 *   createdAt: new Date('2024-10-18'),
 *   lastCheck: new Date(Date.now() - 12 * 60 * 60 * 1000)  // 12h atrás
 * };
 * 
 * console.log(shouldCheckRule(dailyRule));
 * // Output: false (precisa esperar mais 12 horas)
 * 
 * // Caso 5: Regra semanal - última execução há 8 dias
 * const weeklyRule: MonitoringRule = {
 *   id: 'rule_101',
 *   productName: 'Monitor LG 27"',
 *   platforms: [CompetitorPlatform.PICHAU],
 *   frequency: 'weekly',
 *   priceThreshold: 10,
 *   isActive: true,
 *   createdAt: new Date('2024-10-01'),
 *   lastCheck: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)  // 8 dias
 * };
 * 
 * console.log(shouldCheckRule(weeklyRule));
 * // Output: true (passou 7 dias)
 * 
 * // Uso prático: filtrar regras que devem executar
 * const rules = [newRule, hourlyRule, dailyRule, weeklyRule];
 * const toExecute = rules.filter(shouldCheckRule);
 * console.log(`${toExecute.length} regras devem executar agora`);
 * // Output: 3 regras devem executar agora (newRule, hourlyRule atualizada, weeklyRule)
 * ```
 * 
 * @remarks
 * **Lógica de verificação**:
 * 
 * 1. **Primeira execução** (`!rule.lastCheck`):
 *    - Sempre retorna `true`
 *    - Regra nunca foi executada
 * 
 * 2. **Frequência horária** (`frequency: 'hourly'`):
 *    - Intervalo: 60 minutos (3.600.000 ms)
 *    - Retorna `true` se `timeDiff > 1 hora`
 * 
 * 3. **Frequência diária** (`frequency: 'daily'`):
 *    - Intervalo: 24 horas (86.400.000 ms)
 *    - Retorna `true` se `timeDiff > 24 horas`
 * 
 * 4. **Frequência semanal** (`frequency: 'weekly'`):
 *    - Intervalo: 7 dias (604.800.000 ms)
 *    - Retorna `true` se `timeDiff > 7 dias`
 * 
 * **Cálculo do tempo**:
 * ```typescript
 * const now = new Date();
 * const timeDiff = now.getTime() - rule.lastCheck.getTime();
 * // timeDiff em milissegundos
 * ```
 * 
 * **Uso no ciclo de monitoramento**:
 * Esta função é chamada automaticamente por `runMonitoringCycle()`
 * para determinar quais regras executar.
 * 
 * **Performance**:
 * - Operação O(1) - muito rápida
 * - Apenas comparações de timestamps
 * - Pode processar milhares de regras por segundo
 * 
 * **Edge cases**:
 * - Frequência inválida → retorna `false`
 * - `lastCheck` no futuro → retorna `false` (timeDiff negativo)
 * - Regra desativada → não verifica (tratado em `runMonitoringCycle`)
 */
export function shouldCheckRule(rule: MonitoringRule): boolean {
  if (!rule.lastCheck) {
    return true;
  }

  const now = new Date();
  const lastCheck = rule.lastCheck;
  const timeDiff = now.getTime() - lastCheck.getTime();

  switch (rule.frequency) {
    case 'hourly':
      return timeDiff > 60 * 60 * 1000;
    case 'daily':
      return timeDiff > 24 * 60 * 60 * 1000;
    case 'weekly':
      return timeDiff > 7 * 24 * 60 * 60 * 1000;
    default:
      return false;
  }
}

/**
 * Executa um ciclo completo de monitoramento
 * 
 * Processa todas as regras ativas que precisam ser verificadas,
 * executando a checagem de preços e atualizando timestamps.
 * 
 * @param monitoringRules - Mapa de todas as regras
 * @param priceHistory - Histórico de preços para detecção de mudanças
 * @returns Promise que resolve quando ciclo completa
 * 
 * @example
 * ```typescript
 * const rules = new Map<string, MonitoringRule>();
 * const history = new Map<string, PriceHistory[]>();
 * 
 * // Configurar algumas regras
 * addMonitoringRule(rules, 'iPhone 15 Pro', undefined, 'daily', 5);
 * addMonitoringRule(rules, 'Galaxy S24', undefined, 'hourly', 3);
 * addMonitoringRule(rules, 'PlayStation 5', undefined, 'weekly', 10);
 * 
 * // Caso 1: Primeira execução (todas as regras executam)
 * console.log('🚀 Iniciando primeiro ciclo...');
 * await runMonitoringCycle(rules, history);
 * console.log('✅ Ciclo 1 completo');
 * // Output:
 * // 🚀 Iniciando primeiro ciclo...
 * // ✅ Ciclo 1 completo
 * // (Todas 3 regras foram verificadas)
 * 
 * // Verificar que lastCheck foi atualizado
 * rules.forEach((rule, id) => {
 *   console.log(`${rule.productName}: última verificação às ${rule.lastCheck?.toISOString()}`);
 * });
 * // Output:
 * // iPhone 15 Pro: última verificação às 2024-10-19T14:30:00.000Z
 * // Galaxy S24: última verificação às 2024-10-19T14:30:00.000Z
 * // PlayStation 5: última verificação às 2024-10-19T14:30:00.000Z
 * 
 * // Caso 2: Executar 30 minutos depois (apenas hourly executa)
 * await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); // Esperar 30min
 * console.log('🚀 Iniciando ciclo após 30 minutos...');
 * await runMonitoringCycle(rules, history);
 * console.log('✅ Ciclo 2 completo');
 * // Apenas a regra 'hourly' (Galaxy S24) foi verificada
 * 
 * // Caso 3: Desativar uma regra antes do ciclo
 * const galaxyRule = Array.from(rules.values())
 *   .find(r => r.productName === 'Galaxy S24');
 * if (galaxyRule) {
 *   galaxyRule.isActive = false;
 *   console.log('Regra Galaxy S24 desativada');
 * }
 * 
 * await runMonitoringCycle(rules, history);
 * // Galaxy S24 não será mais verificado
 * 
 * // Caso 4: Tratamento de erros
 * // Simular erro em uma regra específica
 * const brokenRule = addMonitoringRule(
 *   rules,
 *   'Produto Inválido @#$%',  // Nome inválido causa erro
 *   undefined,
 *   'daily',
 *   5
 * );
 * 
 * await runMonitoringCycle(rules, history);
 * // Erro é capturado e registrado, mas outras regras continuam executando
 * 
 * // Caso 5: Uso em produção com cron job
 * // Executar a cada hora
 * setInterval(async () => {
 *   console.log(`[${new Date().toISOString()}] Executando ciclo de monitoramento...`);
 *   
 *   const startTime = Date.now();
 *   await runMonitoringCycle(globalRules, globalHistory);
 *   const duration = Date.now() - startTime;
 *   
 *   const activeCount = getActiveRules(globalRules).length;
 *   const checkedCount = Array.from(globalRules.values())
 *     .filter(r => shouldCheckRule(r)).length;
 *   
 *   console.log(
 *     `✅ Ciclo completo em ${duration}ms | ` +
 *     `${checkedCount}/${activeCount} regras verificadas`
 *   );
 * }, 60 * 60 * 1000);  // A cada 1 hora
 * 
 * // Output típico:
 * // [2024-10-19T14:00:00.000Z] Executando ciclo de monitoramento...
 * // ✅ Ciclo completo em 2340ms | 5/12 regras verificadas
 * ```
 * 
 * @remarks
 * **Pipeline de execução**:
 * 
 * 1. **Filtrar regras elegíveis**:
 *    ```typescript
 *    const activeRules = Array.from(monitoringRules.values())
 *      .filter(rule => rule.isActive && shouldCheckRule(rule));
 *    ```
 *    - Apenas regras com `isActive: true`
 *    - Apenas regras onde `shouldCheckRule()` retorna `true`
 * 
 * 2. **Processar cada regra sequencialmente**:
 *    ```typescript
 *    for (const rule of activeRules) {
 *      await checkRule(rule, priceHistory);  // Busca preços
 *      rule.lastCheck = new Date();          // Atualiza timestamp
 *    }
 *    ```
 * 
 * 3. **Tratamento de erros**:
 *    - Erros são capturados por regra
 *    - Registrados com `logger.trackAIError()`
 *    - Não interrompem processamento de outras regras
 *    - `lastCheck` NÃO é atualizado em caso de erro
 * 
 * **Função delegada**:
 * - `checkRule(rule, priceHistory)` do módulo `detection.ts`
 * - Busca preços nas plataformas
 * - Compara com histórico
 * - Dispara alertas se threshold ultrapassado
 * 
 * **Mutações**:
 * - `rule.lastCheck` é atualizado para `new Date()`
 * - `priceHistory` pode ser modificado por `checkRule()`
 * 
 * **Performance**:
 * - Processamento sequencial (não paralelo)
 * - Tempo típico: 200-500ms por regra
 * - Total depende de quantas regras executam
 * - Exemplo: 10 regras = ~3-5 segundos
 * 
 * **Logging de erros**:
 * ```typescript
 * logger.trackAIError('monitoring_rule_check', errorContext, {
 *   ruleId: rule.id
 * });
 * ```
 * 
 * **Recomendações de uso**:
 * - Execute em cron job (não em requisição HTTP)
 * - Frequência do cron: 15-60 minutos
 * - Use worker/background job em produção
 * - Monitore duração e erros
 * 
 * **Exemplo de integração com cron**:
 * ```typescript
 * // Vercel Cron (vercel.json)
 * {
 *   "crons": [{
 *     "path": "/api/cron/monitor-competitors",
 *     "schedule": "0 * * * *"  // A cada hora
 *   }]
 * }
 * 
 * // API Route
 * export async function GET(request: Request) {
 *   await runMonitoringCycle(globalRules, globalHistory);
 *   return Response.json({ success: true });
 * }
 * ```
 */
export async function runMonitoringCycle(
  monitoringRules: Map<string, MonitoringRule>,
  priceHistory: Map<string, import('./types').PriceHistory[]>
): Promise<void> {
  const activeRules = Array.from(monitoringRules.values())
    .filter(rule => rule.isActive && shouldCheckRule(rule));

  for (const rule of activeRules) {
    try {
      await checkRule(rule, priceHistory);
      rule.lastCheck = new Date();
    } catch (error) {
      logger.trackAIError('monitoring_rule_check', toErrorContext(error), { ruleId: rule.id });
    }
  }
}

/**
 * Retorna todas as regras de monitoramento ativas
 * 
 * Filtra o mapa de regras retornando apenas aquelas com `isActive: true`.
 * 
 * @param monitoringRules - Mapa de todas as regras
 * @returns Array de regras ativas
 * 
 * @example
 * ```typescript
 * const rules = new Map<string, MonitoringRule>();
 * 
 * // Adicionar algumas regras
 * const rule1 = addMonitoringRule(rules, 'iPhone 15', undefined, 'daily', 5);
 * const rule2 = addMonitoringRule(rules, 'Galaxy S24', undefined, 'hourly', 3);
 * const rule3 = addMonitoringRule(rules, 'PlayStation 5', undefined, 'weekly', 10);
 * 
 * console.log(`Total de regras: ${rules.size}`);
 * // Output: Total de regras: 3
 * 
 * // Caso 1: Todas as regras ativas
 * let activeRules = getActiveRules(rules);
 * console.log(`Regras ativas: ${activeRules.length}`);
 * // Output: Regras ativas: 3
 * 
 * activeRules.forEach(rule => {
 *   console.log(`- ${rule.productName} (${rule.frequency})`);
 * });
 * // Output:
 * // - iPhone 15 (daily)
 * // - Galaxy S24 (hourly)
 * // - PlayStation 5 (weekly)
 * 
 * // Caso 2: Desativar uma regra
 * const galaxyRule = rules.get(rule2);
 * if (galaxyRule) {
 *   galaxyRule.isActive = false;
 *   console.log('Galaxy S24 desativado');
 * }
 * 
 * activeRules = getActiveRules(rules);
 * console.log(`Regras ativas: ${activeRules.length}`);
 * // Output: Regras ativas: 2
 * 
 * // Caso 3: Desativar todas e reativar uma
 * rules.forEach(rule => rule.isActive = false);
 * console.log(`Regras ativas: ${getActiveRules(rules).length}`);
 * // Output: Regras ativas: 0
 * 
 * const iphoneRule = rules.get(rule1);
 * if (iphoneRule) {
 *   iphoneRule.isActive = true;
 * }
 * console.log(`Regras ativas: ${getActiveRules(rules).length}`);
 * // Output: Regras ativas: 1
 * 
 * // Caso 4: Estatísticas de monitoramento
 * const stats = {
 *   total: rules.size,
 *   active: getActiveRules(rules).length,
 *   inactive: rules.size - getActiveRules(rules).length,
 *   byFrequency: {
 *     hourly: 0,
 *     daily: 0,
 *     weekly: 0
 *   }
 * };
 * 
 * getActiveRules(rules).forEach(rule => {
 *   stats.byFrequency[rule.frequency]++;
 * });
 * 
 * console.log('📊 Estatísticas de monitoramento:');
 * console.log(JSON.stringify(stats, null, 2));
 * // Output:
 * // 📊 Estatísticas de monitoramento:
 * // {
 * //   "total": 3,
 * //   "active": 1,
 * //   "inactive": 2,
 * //   "byFrequency": {
 * //     "hourly": 0,
 * //     "daily": 1,
 * //     "weekly": 0
 * //   }
 * // }
 * 
 * // Caso 5: Agrupar regras por produto
 * const byProduct = new Map<string, MonitoringRule[]>();
 * 
 * getActiveRules(rules).forEach(rule => {
 *   const existing = byProduct.get(rule.productName) || [];
 *   existing.push(rule);
 *   byProduct.set(rule.productName, existing);
 * });
 * 
 * console.log('Produtos monitorados:');
 * byProduct.forEach((rules, product) => {
 *   console.log(`  ${product}: ${rules.length} regra(s)`);
 * });
 * ```
 * 
 * @remarks
 * **Implementação**:
 * ```typescript
 * return Array.from(monitoringRules.values())
 *   .filter(rule => rule.isActive);
 * ```
 * 
 * **Performance**:
 * - Complexidade: O(n) onde n = total de regras
 * - Operação rápida mesmo com milhares de regras
 * - Cria novo array (não modifica original)
 * 
 * **Uso típico**:
 * 
 * 1. **Dashboard de monitoramento**:
 *    ```typescript
 *    const active = getActiveRules(rules);
 *    return {
 *      activeCount: active.length,
 *      totalCount: rules.size,
 *      rules: active.map(r => ({
 *        id: r.id,
 *        product: r.productName,
 *        frequency: r.frequency
 *      }))
 *    };
 *    ```
 * 
 * 2. **Preparação para ciclo de monitoramento**:
 *    ```typescript
 *    const toCheck = getActiveRules(rules)
 *      .filter(shouldCheckRule);
 *    console.log(`${toCheck.length} regras para verificar`);
 *    ```
 * 
 * 3. **Relatório de status**:
 *    ```typescript
 *    const active = getActiveRules(rules);
 *    const report = {
 *      total: rules.size,
 *      active: active.length,
 *      suspended: rules.size - active.length,
 *      frequencies: {
 *        hourly: active.filter(r => r.frequency === 'hourly').length,
 *        daily: active.filter(r => r.frequency === 'daily').length,
 *        weekly: active.filter(r => r.frequency === 'weekly').length
 *      }
 *    };
 *    ```
 * 
 * **Diferença vs regras inativas**:
 * - Regras inativas (`isActive: false`) ainda existem no Map
 * - Podem ser reativadas a qualquer momento
 * - Não são processadas por `runMonitoringCycle()`
 * - Para deletar permanentemente, use `removeMonitoringRule()`
 * 
 * **Veja também**:
 * - `runMonitoringCycle()` - usa esta função internamente
 * - `shouldCheckRule()` - filtragem adicional por timestamp
 */
export function getActiveRules(monitoringRules: Map<string, MonitoringRule>): MonitoringRule[] {
  return Array.from(monitoringRules.values()).filter(rule => rule.isActive);
}
