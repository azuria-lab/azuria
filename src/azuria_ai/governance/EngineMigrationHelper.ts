/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ENGINE MIGRATION HELPER - Migração Automática de Engines
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo fornece utilitários para:
 * 1. Detectar engines que usam emitEvent diretamente
 * 2. Gerar código de migração para BaseEngine
 * 3. Criar adaptadores de compatibilidade
 *
 * @module azuria_ai/governance/EngineMigrationHelper
 */

import { type EventType } from '../core/eventBus';
import { type EngineCategory } from './EngineGovernance';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Informação de um engine detectado */
export interface DetectedEngine {
  /** Nome do arquivo */
  filename: string;
  /** ID inferido do engine */
  inferredId: string;
  /** Categoria inferida */
  inferredCategory: EngineCategory;
  /** Eventos que emite (detectados via regex) */
  emittedEvents: EventType[];
  /** Se usa classe ou funções */
  isClassBased: boolean;
  /** Linhas que usam emitEvent */
  emitEventLines: number[];
  /** Nível de esforço de migração (1-5) */
  migrationEffort: MigrationEffort;
}

/** Nível de esforço para migração */
export type MigrationEffort = 1 | 2 | 3 | 4 | 5;

/** Resultado da análise */
export interface AnalysisResult {
  /** Total de engines detectados */
  totalEngines: number;
  /** Engines baseados em classe */
  classBasedEngines: number;
  /** Engines baseados em funções */
  functionBasedEngines: number;
  /** Total de usos de emitEvent */
  totalEmitEventUsages: number;
  /** Engines por categoria */
  byCategory: Record<EngineCategory, number>;
  /** Engines detectados */
  engines: DetectedEngine[];
  /** Esforço total estimado (horas) */
  estimatedHours: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAPEAMENTO DE CATEGORIAS
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_KEYWORDS: Record<EngineCategory, string[]> = {
  cognitive: ['cognitive', 'think', 'reason', 'analyze', 'pattern', 'learning'],
  emotional: ['emotion', 'affective', 'sentiment', 'mood', 'feeling'],
  behavioral: ['behavior', 'action', 'user', 'intent', 'context'],
  governance: ['governance', 'policy', 'ethics', 'audit', 'safety', 'limit'],
  communication: ['brand', 'voice', 'tone', 'persona', 'story', 'explanation'],
  market: ['market', 'price', 'pricing', 'bidding', 'revenue', 'competitive'],
  evolution: ['evolution', 'improvement', 'feedback', 'adaptive', 'tuning'],
  system: ['system', 'orchestr', 'core', 'engine', 'mind'],
  utility: ['util', 'helper', 'tool', 'ocr', 'import'],
  other: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE ANÁLISE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Infere a categoria do engine pelo nome do arquivo
 */
export function inferCategory(filename: string): EngineCategory {
  const lowerName = filename.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords && keywords.some((kw) => lowerName.includes(kw))) {
      return category as EngineCategory;
    }
  }

  return 'utility'; // Default para utility ao invés de 'other'
}

/**
 * Gera ID do engine a partir do nome do arquivo
 */
export function inferEngineId(filename: string): string {
  // Remove extensão e converte para camelCase
  const baseName = filename.replace(/\.ts$/, '');
  return baseName.charAt(0).toLowerCase() + baseName.slice(1);
}

/**
 * Calcula esforço de migração (1-5)
 */
export function calculateMigrationEffort(engine: Partial<DetectedEngine>): 1 | 2 | 3 | 4 | 5 {
  let score = 1;

  // Mais emitEvents = mais esforço
  const emitCount = engine.emitEventLines?.length ?? 0;
  if (emitCount > 10) {score += 2;}
  else if (emitCount > 5) {score += 1;}

  // Função-based é mais complexo migrar
  if (!engine.isClassBased) {score += 1;}

  // Mais eventos diferentes = mais esforço
  const uniqueEvents = new Set(engine.emittedEvents ?? []).size;
  if (uniqueEvents > 5) {score += 1;}

  return Math.min(5, Math.max(1, score)) as 1 | 2 | 3 | 4 | 5;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GERAÇÃO DE CÓDIGO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gera código de wrapper para engine function-based
 */
export function generateFunctionWrapper(engine: DetectedEngine): string {
  const className = engine.inferredId.charAt(0).toUpperCase() + engine.inferredId.slice(1);

  return `
/**
 * Wrapper governado para ${engine.filename}
 * Gerado automaticamente pelo EngineMigrationHelper
 */
import { BaseEngine } from '../governance/BaseEngine';
import { type EventType } from '../core/eventBus';

// Importar funções originais
import * as original from './${engine.filename.replace('.ts', '')}';

class ${className}Wrapper extends BaseEngine {
  constructor() {
    super({
      id: '${engine.inferredId}',
      name: '${className}',
      category: '${engine.inferredCategory}',
      allowedEvents: [${engine.emittedEvents.map((e) => `'${e}'`).join(', ')}] as EventType[],
    });
  }

  protected async onInit(): Promise<void> {
    // Inicialização do engine original (se necessário)
  }

  // Re-exportar funções originais com emissão governada
  ${engine.emittedEvents
    .map(
      (event) => `
  async emit${event.replaceAll(/[:-]/g, '_')}(payload: unknown): Promise<void> {
    await this.emit('${event}' as EventType, payload);
  }`
    )
    .join('\n')}
}

// Singleton
export const ${engine.inferredId}Wrapper = new ${className}Wrapper();

// Re-exportar para compatibilidade
export * from './${engine.filename.replace('.ts', '')}';
`;
}

/**
 * Gera código para migrar engine class-based
 */
export function generateClassMigration(engine: DetectedEngine): string {
  return `
// ═══════════════════════════════════════════════════════════════════════════
// MIGRAÇÃO PARA ${engine.filename}
// ═══════════════════════════════════════════════════════════════════════════
// 
// 1. Substituir import do emitEvent:
//    - import { emitEvent } from '../core/eventBus';
//    + import { BaseEngine } from '../governance/BaseEngine';
//
// 2. Estender BaseEngine:
//    - class MyEngine { ... }
//    + class MyEngine extends BaseEngine { ... }
//
// 3. Adicionar construtor com configuração:
//    constructor() {
//      super({
//        id: '${engine.inferredId}',
//        name: '${engine.inferredId}',
//        category: '${engine.inferredCategory}',
//        allowedEvents: [${engine.emittedEvents.map((e) => `'${e}'`).join(', ')}],
//      });
//    }
//
// 4. Substituir emitEvent por this.emit:
${engine.emitEventLines.map((line) => `//    Linha ${line}: emitEvent(...) → await this.emit(...)`).join('\n')}
//
// ═══════════════════════════════════════════════════════════════════════════
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTADOR DE COMPATIBILIDADE GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cria um adaptador que intercepta emitEvent e redireciona para governança
 * Pode ser usado temporariamente enquanto engines não são migrados
 */
export function createCompatibilityAdapter(): string {
  return `
/**
 * COMPATIBILITY ADAPTER
 * 
 * Este adaptador intercepta todas as chamadas de emitEvent e
 * redireciona através do sistema de governança.
 * 
 * COMO USAR:
 * 
 * No início da aplicação (antes de inicializar engines):
 * 
 * \`\`\`typescript
 * import { installCompatibilityAdapter } from '@/azuria_ai/governance/EngineMigrationHelper';
 * 
 * // Instalar adaptador
 * installCompatibilityAdapter();
 * \`\`\`
 * 
 * Isso fará com que todos os emitEvent() passem pelo sistema governado
 * sem precisar modificar os engines.
 */

import { governedEmit } from '../core/GovernedEmitter';
import * as eventBus from '../core/eventBus';

let originalEmitEvent: typeof eventBus.emitEvent | null = null;
let isAdapterInstalled = false;

export function installCompatibilityAdapter(): void {
  if (isAdapterInstalled) {
    console.warn('[CompatibilityAdapter] Already installed');
    return;
  }

  // Salvar referência original
  originalEmitEvent = eventBus.emitEvent;

  // Sobrescrever emitEvent
  (eventBus as { emitEvent: typeof eventBus.emitEvent }).emitEvent = (
    eventType: eventBus.EventType,
    payload: unknown,
    options?: { source?: string; priority?: number }
  ) => {
    // Redirecionar para governedEmit
    governedEmit(eventType, payload, {
      source: options?.source ?? 'legacy-engine',
      priority: options?.priority,
    });
  };

  isAdapterInstalled = true;
  console.log('[CompatibilityAdapter] ✓ Installed - all emitEvent calls now governed');
}

export function uninstallCompatibilityAdapter(): void {
  if (!isAdapterInstalled || !originalEmitEvent) {
    return;
  }

  // Restaurar original
  (eventBus as { emitEvent: typeof eventBus.emitEvent }).emitEvent = originalEmitEvent;
  originalEmitEvent = null;
  isAdapterInstalled = false;

  console.log('[CompatibilityAdapter] Uninstalled');
}

export function isCompatibilityAdapterInstalled(): boolean {
  return isAdapterInstalled;
}
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTATÍSTICAS E RELATÓRIO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gera relatório de migração em markdown
 */
export function generateMigrationReport(analysis: AnalysisResult): string {
  const byEffort = {
    easy: analysis.engines.filter((e) => e.migrationEffort <= 2),
    medium: analysis.engines.filter((e) => e.migrationEffort === 3),
    hard: analysis.engines.filter((e) => e.migrationEffort >= 4),
  };

  return `# 📊 Relatório de Migração de Engines

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de Engines | ${analysis.totalEngines} |
| Baseados em Classe | ${analysis.classBasedEngines} |
| Baseados em Funções | ${analysis.functionBasedEngines} |
| Total de emitEvent() | ${analysis.totalEmitEventUsages} |
| Tempo Estimado | ${analysis.estimatedHours}h |

## Por Categoria

| Categoria | Quantidade |
|-----------|------------|
${Object.entries(analysis.byCategory)
  .filter(([, count]) => count > 0)
  .map(([cat, count]) => `| ${cat} | ${count} |`)
  .join('\n')}

## Por Dificuldade

### ✅ Fácil (${byEffort.easy.length} engines)
${byEffort.easy.map((e) => `- ${e.filename} (${e.emitEventLines.length} emits)`).join('\n')}

### ⚠️ Médio (${byEffort.medium.length} engines)
${byEffort.medium.map((e) => `- ${e.filename} (${e.emitEventLines.length} emits)`).join('\n')}

### 🔴 Difícil (${byEffort.hard.length} engines)
${byEffort.hard.map((e) => `- ${e.filename} (${e.emitEventLines.length} emits)`).join('\n')}

## Estratégia Recomendada

1. **Instalar CompatibilityAdapter** para cobertura imediata
2. **Migrar engines fáceis** primeiro (${byEffort.easy.length})
3. **Criar wrappers** para engines baseados em funções
4. **Refatorar gradualmente** engines difíceis

## Próximos Passos

\`\`\`typescript
// 1. Instalar adaptador de compatibilidade
import { installCompatibilityAdapter } from '@/azuria_ai/governance/EngineMigrationHelper';
installCompatibilityAdapter();

// 2. Todos os emitEvent() agora passam pela governança!
\`\`\`
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  inferCategory,
  inferEngineId,
  calculateMigrationEffort,
  generateFunctionWrapper,
  generateClassMigration,
  createCompatibilityAdapter,
  generateMigrationReport,
};
