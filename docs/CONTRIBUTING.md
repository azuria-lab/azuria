
# 🤝 Guia de Contribuição - Precifica+

Obrigado por seu interesse em contribuir com o Precifica+! Este guia detalha como contribuir efetivamente para o projeto.

## 📋 Índice

- [Code of Conduct](#code-of-conduct)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Standards de Código](#standards-de-código)
- [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
- [Testes](#testes)
- [Documentação](#documentação)
- [Pull Requests](#pull-requests)
- [Issues](#issues)

## 🤝 Code of Conduct

### Nossos Compromissos

Como membros, contribuidores e líderes, nos comprometemos a tornar a participação em nossa comunidade uma experiência livre de assédio para todos, independentemente de idade, tamanho corporal, deficiência visível ou invisível, etnia, características sexuais, identidade e expressão de gênero, nível de experiência, educação, status socioeconômico, nacionalidade, aparência pessoal, raça, religião ou identidade e orientação sexual.

### Comportamentos Esperados

- Use linguagem acolhedora e inclusiva
- Respeite pontos de vista e experiências diferentes
- Aceite críticas construtivas com elegância
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## 🚀 Como Contribuir

### Tipos de Contribuição

1. **🐛 Bug Reports**: Relate problemas encontrados
2. **✨ Feature Requests**: Sugira novas funcionalidades
3. **📖 Documentação**: Melhore ou crie documentação
4. **🧪 Testes**: Adicione ou melhore testes
5. **🔧 Code**: Implemente features ou correções
6. **🎨 Design**: Melhore UI/UX
7. **🌐 Tradução**: Ajude com internacionalização

### Primeiros Passos

1. **Explore o projeto**: Familiarize-se com a codebase
2. **Leia a documentação**: Entenda a arquitetura e padrões
3. **Procure issues**: Veja issues marcadas como `good first issue`
4. **Configure o ambiente**: Siga o guia de setup
5. **Faça sua primeira contribuição**: Comece pequeno!

## ⚙️ Configuração do Ambiente

### Pré-requisitos

```bash
# Versões mínimas requeridas
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.30.0
```

### Setup Completo

```bash
# 1. Fork o repositório no GitHub
# 2. Clone seu fork
git clone https://github.com/SEU_USERNAME/precifica-plus.git
cd precifica-plus

# 3. Configure o upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/precifica-plus.git

# 4. Instale dependências
npm install

# 5. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# 6. Execute o projeto
npm run dev

# 7. Execute os testes
npm run test
```

### Configuração do Supabase (Desenvolvimento)

```bash
# 1. Instale o Supabase CLI
npm install -g @supabase/cli

# 2. Inicie o Supabase local
supabase start

# 3. Configure as variáveis no .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

## 📝 Standards de Código

### Estrutura de Arquivos

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── feature/         # Componentes específicos de feature
│   └── shared/          # Componentes compartilhados
├── hooks/               # Custom hooks
├── services/            # Serviços e APIs
├── utils/               # Funções utilitárias
├── types/               # Definições TypeScript
├── styles/              # Estilos globais
└── __tests__/           # Testes
```

### Convenções de Nomenclatura

#### Arquivos e Diretórios

```bash
# Componentes - PascalCase
UserProfile.tsx
CalculatorForm.tsx

# Hooks - camelCase com prefixo 'use'
useCalculator.ts
useAuthStatus.ts

# Utilitários - camelCase
formatCurrency.ts
validateInput.ts

# Tipos - PascalCase
UserTypes.ts
CalculatorTypes.ts

# Diretórios - kebab-case
user-profile/
calculator-forms/
```

#### Código TypeScript

```typescript
// Interfaces - PascalCase com prefixo 'I' opcional
interface User {
  id: string;
  name: string;
}

// Types - PascalCase
type UserRole = 'admin' | 'user' | 'guest';

// Enums - PascalCase
enum CalculatorMode {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  PRO = 'pro'
}

// Constantes - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.precifica.app';
const DEFAULT_MARGIN = 30;

// Variáveis e funções - camelCase
const userData = await fetchUser();
const calculatePrice = (cost: number) => cost * 1.3;
```

### Estrutura de Componentes

```typescript
// Template para componentes
import React from 'react';
import { cn } from '@/lib/utils';

// Props interface sempre no topo
interface ComponentProps {
  data: DataType;
  onAction?: (id: string) => void;
  className?: string;
  children?: React.ReactNode;
}

// Componente principal
export default function Component({ 
  data, 
  onAction, 
  className,
  children 
}: ComponentProps) {
  // 1. Hooks sempre no topo
  const [state, setState] = useState<StateType>();
  const { query } = useQuery({...});
  
  // 2. Handlers definidos com useCallback quando necessário
  const handleAction = useCallback((id: string) => {
    onAction?.(id);
  }, [onAction]);
  
  // 3. Effects após handlers
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 4. Early returns para loading/error states
  if (!data) return <LoadingSkeleton />;
  
  // 5. Render principal
  return (
    <div className={cn("base-classes", className)}>
      {children}
      {/* Component content */}
    </div>
  );
}

// 6. Componentes auxiliares fora do componente principal
const LoadingSkeleton = () => (
  <div className="animate-pulse bg-gray-200 h-4 w-full rounded" />
);
```

### Hooks Customizados

```typescript
// Template para hooks
interface UseCustomHookParams {
  initialValue?: string;
  onSuccess?: (data: DataType) => void;
}

interface UseCustomHookReturn {
  data: DataType | null;
  loading: boolean;
  error: Error | null;
  execute: (params: ExecuteParams) => Promise<DataType>;
  reset: () => void;
}

export const useCustomHook = ({
  initialValue,
  onSuccess
}: UseCustomHookParams = {}): UseCustomHookReturn => {
  // Estado interno
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Função principal
  const execute = useCallback(async (params: ExecuteParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await api.call(params);
      setData(result);
      onSuccess?.(result);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Hook error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);
  
  // Reset function
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);
  
  return { data, loading, error, execute, reset };
};
```

### Styling Guidelines

#### Tailwind CSS

```typescript
// Use cn() para combinar classes condicionalmente
import { cn } from '@/lib/utils';

const buttonClass = cn(
  // Base classes
  "px-4 py-2 rounded-lg font-medium transition-colors",
  // Conditional classes
  variant === 'primary' && "bg-blue-600 text-white hover:bg-blue-700",
  variant === 'secondary' && "bg-gray-200 text-gray-900 hover:bg-gray-300",
  // State classes
  disabled && "opacity-50 cursor-not-allowed",
  loading && "animate-pulse"
);
```

#### Responsive Design

```typescript
// Mobile-first approach
const containerClass = cn(
  // Mobile (default)
  "p-4 space-y-4",
  // Tablet
  "md:p-6 md:space-y-6",
  // Desktop
  "lg:p-8 lg:space-y-8 lg:grid lg:grid-cols-2 lg:gap-8"
);
```

## 🔄 Workflow de Desenvolvimento

### Git Flow

```bash
# 1. Sempre trabalhe em uma branch feature
git checkout -b feature/nome-da-feature

# 2. Faça commits pequenos e descritivos
git add .
git commit -m "feat: adiciona calculadora avançada"

# 3. Push regular para seu fork
git push origin feature/nome-da-feature

# 4. Mantenha sua branch atualizada
git fetch upstream
git rebase upstream/main

# 5. Quando pronto, abra um PR
```

### Convenção de Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Tipos de commit
feat:     # Nova funcionalidade
fix:      # Correção de bug
docs:     # Documentação
style:    # Formatação (não afeta lógica)
refactor: # Refatoração
test:     # Testes
chore:    # Tarefas de manutenção
perf:     # Melhorias de performance
ci:       # CI/CD

# Exemplos
feat: adiciona calculadora de margem dinâmica
fix: corrige cálculo de impostos para MEI
docs: atualiza README com instruções de setup
style: ajusta formatação do componente Header
refactor: move lógica de cálculo para hook customizado
test: adiciona testes para useCalculator hook
chore: atualiza dependências do projeto
```

### Branch Naming

```bash
# Padrões de nomenclatura
feature/nome-da-feature       # Nova funcionalidade
fix/nome-do-bug              # Correção de bug
docs/nome-da-documentacao    # Documentação
refactor/nome-da-refatoracao # Refatoração
test/nome-do-teste           # Testes

# Exemplos
feature/advanced-calculator
fix/margin-calculation-bug
docs/api-reference-update
refactor/hooks-structure
test/calculator-component-tests
```

## 🧪 Testes

### Estrutura de Testes

```
src/
├── components/
│   ├── Calculator.tsx
│   └── __tests__/
│       └── Calculator.test.tsx
├── hooks/
│   ├── useCalculator.ts
│   └── __tests__/
│       └── useCalculator.test.ts
└── utils/
    ├── formatCurrency.ts
    └── __tests__/
        └── formatCurrency.test.ts
```

### Exemplo de Teste de Componente

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Calculator from '../Calculator';

describe('Calculator Component', () => {
  it('should render with initial state', () => {
    render(<Calculator />);
    
    expect(screen.getByPlaceholderText('Custo do produto')).toBeInTheDocument();
    expect(screen.getByText('Calcular')).toBeInTheDocument();
  });
  
  it('should calculate selling price correctly', async () => {
    const onResult = vi.fn();
    render(<Calculator onResult={onResult} />);
    
    // Simular entrada do usuário
    fireEvent.change(screen.getByPlaceholderText('Custo do produto'), {
      target: { value: '100' }
    });
    fireEvent.change(screen.getByPlaceholderText('Margem (%)'), {
      target: { value: '30' }
    });
    
    // Simular cálculo
    fireEvent.click(screen.getByText('Calcular'));
    
    // Verificar resultado
    await screen.findByText('R$ 142,85');
    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({
      sellingPrice: 142.85
    }));
  });
});
```

### Exemplo de Teste de Hook

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCalculator } from '../useCalculator';

describe('useCalculator Hook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCalculator());
    
    expect(result.current.inputs.cost).toBe(0);
    expect(result.current.inputs.margin).toBe(30);
    expect(result.current.result).toBeNull();
  });
  
  it('should calculate selling price correctly', async () => {
    const { result } = renderHook(() => useCalculator());
    
    act(() => {
      result.current.setInput('cost', 100);
      result.current.setInput('margin', 30);
    });
    
    await act(async () => {
      await result.current.calculate();
    });
    
    expect(result.current.result?.sellingPrice).toBe(142.85);
  });
});
```

### Executando Testes

```bash
# Todos os testes
npm run test

# Testes em modo watch
npm run test:watch

# Testes com coverage
npm run test:coverage

# Testes específicos
npm run test Calculator

# Interface visual dos testes
npm run test:ui
```

## 📖 Documentação

### Documentando Componentes

```typescript
/**
 * Calculadora de preços avançada com suporte a múltiplos cenários
 * 
 * @example
 * ```tsx
 * <AdvancedCalculator
 *   onResult={(result) => console.log(result)}
 *   defaultInputs={{ cost: 100, margin: 30 }}
 * />
 * ```
 */
interface AdvancedCalculatorProps {
  /** Callback executado quando um cálculo é concluído */
  onResult?: (result: CalculationResult) => void;
  /** Valores iniciais para os inputs */
  defaultInputs?: Partial<CalculatorInputs>;
  /** Classe CSS adicional */
  className?: string;
}

export default function AdvancedCalculator({
  onResult,
  defaultInputs,
  className
}: AdvancedCalculatorProps) {
  // Implementação
}
```

### Documentando Hooks

```typescript
/**
 * Hook para gerenciar cálculos de precificação
 * 
 * @param options - Opções de configuração
 * @returns Objeto com estado e métodos do calculador
 * 
 * @example
 * ```tsx
 * const { inputs, result, calculate } = useCalculator({
 *   autoCalculate: true,
 *   onResult: (result) => console.log(result)
 * });
 * ```
 */
export const useCalculator = (options: CalculatorOptions = {}) => {
  // Implementação
};
```

## 🔍 Pull Requests

### Checklist do PR

Antes de abrir um PR, verifique:

- [ ] **Código**: Segue os padrões de código do projeto
- [ ] **Testes**: Todos os testes passam
- [ ] **Novos Testes**: Funcionalidades novas têm testes
- [ ] **Documentação**: Código está documentado
- [ ] **Performance**: Não há regressões de performance
- [ ] **Acessibilidade**: Componentes são acessíveis
- [ ] **Mobile**: Interface funciona em dispositivos móveis
- [ ] **TypeScript**: Não há erros de tipo
- [ ] **Commits**: Commits seguem a convenção
- [ ] **Conflitos**: Branch não tem conflitos com main

### Template de PR

```markdown
## 📝 Descrição

Breve descrição das mudanças realizadas.

## 🎯 Tipo de Mudança

- [ ] 🐛 Bug fix
- [ ] ✨ Nova funcionalidade
- [ ] 💥 Breaking change
- [ ] 📖 Documentação
- [ ] 🎨 UI/UX
- [ ] ⚡ Performance
- [ ] 🧪 Testes

## 🧪 Como Testar

1. Faça checkout da branch
2. Execute `npm install`
3. Execute `npm run dev`
4. Navegue para [página específica]
5. Teste [funcionalidade específica]

## 📸 Screenshots

[Se aplicável, adicione screenshots]

## ✅ Checklist

- [ ] Código segue os padrões do projeto
- [ ] Testes passam localmente
- [ ] Adicionei testes para novas funcionalidades
- [ ] Documentação foi atualizada
- [ ] Interface é responsiva
- [ ] Acessibilidade foi considerada
```

### Processo de Review

1. **Automated Checks**: CI/CD verifica testes e build
2. **Code Review**: Pelo menos 1 reviewer aprova
3. **QA Testing**: Funcionalidade é testada em staging
4. **Merge**: PR é merged após aprovação

## 🐛 Issues

### Reportando Bugs

Use o template de bug report:

```markdown
## 🐛 Bug Report

### Descrição
Descrição clara e concisa do bug.

### Reprodução
Passos para reproduzir:
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

### Comportamento Esperado
O que deveria acontecer.

### Screenshots
Se aplicável, adicione screenshots.

### Ambiente
- OS: [ex: iOS 16, Windows 11]
- Browser: [ex: Chrome 91, Safari 14]
- Versão: [ex: 1.2.3]

### Contexto Adicional
Qualquer informação adicional relevante.
```

### Solicitando Features

Use o template de feature request:

```markdown
## ✨ Feature Request

### Problema
Qual problema esta feature resolveria?

### Solução Proposta
Descrição da solução desejada.

### Alternativas Consideradas
Outras soluções que você considerou.

### Contexto Adicional
Informações adicionais sobre a feature.
```

## 🏷️ Labels

### Labels para Issues

- `bug` - Algo não está funcionando
- `enhancement` - Nova funcionalidade ou solicitação
- `documentation` - Melhorias na documentação
- `good first issue` - Boa para novos contribuidores
- `help wanted` - Ajuda extra é bem-vinda
- `question` - Informação adicional é solicitada
- `wontfix` - Não será trabalhado

### Labels para PRs

- `feature` - Nova funcionalidade
- `bugfix` - Correção de bug
- `documentation` - Apenas documentação
- `refactor` - Refatoração de código
- `performance` - Melhorias de performance
- `breaking` - Mudança que quebra compatibilidade

## 🎉 Reconhecimento

Contribuidores são reconhecidos de várias formas:

- **Contributors Hall**: Lista no README
- **Releases Notes**: Menção em notas de release
- **Social Media**: Destaque nas redes sociais
- **Swag**: Brindes para contribuidores frequentes

## 📞 Ajuda e Suporte

Precisa de ajuda? Entre em contato:

- **Discord**: [Comunidade Precifica+](#)
- **GitHub Discussions**: Para discussões técnicas
- **Email**: dev@precifica.app
- **Issues**: Para bugs e features

---

**Obrigado por contribuir com o Precifica+! 🚀**

Sua contribuição ajuda a construir uma ferramenta melhor para empreendedores brasileiros. Juntos, estamos revolucionando a precificação no Brasil!
