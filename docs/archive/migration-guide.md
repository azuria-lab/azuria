# Guia de Migração - Reorganização por Domínios

## ✅ Concluído: Fase 3 - Reorganização por Domínios

A estrutura do projeto foi reorganizada seguindo uma arquitetura orientada a domínios:

### Nova Estrutura:

```
src/
├── domains/
│   ├── calculator/          # Domínio da calculadora
│   │   ├── components/      # Componentes específicos da calculadora
│   │   ├── hooks/          # Hooks da calculadora
│   │   ├── services/       # Serviços de negócio
│   │   ├── types/          # Tipos específicos
│   │   ├── utils/          # Utilitários da calculadora
│   │   └── index.ts        # Exports do domínio
│   ├── auth/               # Domínio de autenticação (estrutura criada)
│   └── shared/             # Funcionalidades compartilhadas (estrutura criada)
├── components/             # Componentes globais/UI
├── hooks/                  # Hooks globais
└── legacy-mappings.ts      # Mapeamentos temporários para compatibilidade
```

### Migração Realizada:

#### Componentes Movidos:
- `src/components/calculators/SimpleCalculator.tsx` → `src/domains/calculator/components/`
- `src/components/calculators/CalculationResult.tsx` → `src/domains/calculator/components/`
- `src/components/calculators/CalculatorContent.tsx` → `src/domains/calculator/components/`
- `src/components/calculators/ActionButtons.tsx` → `src/domains/calculator/components/`
- `src/components/calculators/CostSection.tsx` → `src/domains/calculator/components/`
- `src/components/calculators/AdvancedExportOptions.tsx` → `src/domains/calculator/components/`
- `src/components/calculators/CompetitorAnalysisDisplay.tsx` → `src/domains/calculator/components/`
- `src/components/calculators/AdvancedCalculatorResult.tsx` → `src/domains/calculator/components/`

#### Hooks Movidos:
- `src/hooks/calculator/*` → `src/domains/calculator/hooks/`
- `src/hooks/useSimpleCalculator.ts` → `src/domains/calculator/hooks/legacy/`

#### Types Movidos:
- `src/types/simpleCalculator.ts` → `src/domains/calculator/types/calculator.ts`

#### Utils Movidos:
- `src/utils/calculator/*` → `src/domains/calculator/utils/`

#### Services Criados:
- `src/domains/calculator/services/CalculationService.ts`
- `src/domains/calculator/services/HistoryService.ts`
- `src/domains/calculator/services/OfflineService.ts`
- `src/domains/calculator/services/ValidationService.ts`

### Compatibilidade:

Foi criado um sistema de aliases no `vite.config.ts` para manter compatibilidade com imports antigos durante a migração gradual.

### Próximos Passos:

1. **Fase 4**: Implementar Clean Architecture nos services
2. **Fase 5**: Migrar componentes restantes
3. **Fase 6**: Atualizar imports em todos os arquivos
4. **Fase 7**: Remover aliases e migração legacy

### Como Usar a Nova Estrutura:

```typescript
// Import do domínio completo
import { SimpleCalculator, useCalculatorInputs, CalculationService } from '@/domains/calculator';

// Import específico
import { SimpleCalculator } from '@/domains/calculator/components';
import { useCalculatorInputs } from '@/domains/calculator/hooks';
import { CalculationService } from '@/domains/calculator/services';
```

Esta reorganização fornece:
- **Separação clara de responsabilidades**
- **Escalabilidade** para novos domínios
- **Manutenibilidade** melhorada
- **Testabilidade** por domínio
- **Reutilização** de código entre domínios