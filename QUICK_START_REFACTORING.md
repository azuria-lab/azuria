# 🎯 Quick Start - Guia Rápido de Refatoração

> **Para desenvolvedores que querem começar AGORA**

---

## ⚡ Começando em 5 Minutos

### 1️⃣ Executar Análises (2 min)

```bash
# Ver quais arquivos estão grandes
npm run refactor:find-large

# Ver código duplicado
npm run refactor:find-duplicates
```

### 2️⃣ Refatoração Rápida - console.log (3 min)

```bash
# Preview (seguro)
npm run refactor:replace-console:dry

# Aplicar mudanças
npm run refactor:replace-console

# Validar
npm run type-check
```

✅ **Pronto!** Você acabou de melhorar 27 arquivos!

---

## 📋 Checklist Diário

### Todo Dia de Desenvolvimento

```bash
# Antes de começar a trabalhar
□ npm run type-check     # 0 erros?
□ npm run lint          # 0 warnings?
□ npm run test          # Tudo verde?

# Ao criar/editar arquivo
□ Arquivo tem < 300 linhas?
□ Usando logger ao invés de console?
□ Sem uso de 'any'?
□ Imports usando @/ alias?

# Antes de fazer commit
□ npm run type-check    # Validar tipos
□ npm run lint:fix      # Corrigir lint
□ npm test              # Executar testes
```

---

## 🎯 Top 3 Prioridades AGORA

### 🔴 Prioridade 1: types.ts (2 horas)

```bash
# 1. Preview da divisão
npm run refactor:split-types:dry

# 2. Ler o output e confirmar

# 3. Aplicar
npm run refactor:split-types

# 4. Testar TUDO
npm run type-check && npm run test && npm run build
```

**Resultado:** Arquivo de 2.011 linhas → 5 arquivos menores

---

### 🟡 Prioridade 2: Remover console.log (30 min)

```bash
# Já está pronto para executar!
npm run refactor:replace-console
npm run type-check
```

**Resultado:** 27 console.log → logger service

---

### 🟢 Prioridade 3: Limpar arquivos (15 min)

```bash
# Mover documentação
mkdir -p docs/archived
mv src/*.md docs/archived/
mv src/architecture/*.md docs/architecture/

# Verificar se vendor.js é usado
grep -r "vendor.js" .
# Se não aparecer nada, remover:
rm vendor.js react-vendor.js
```

**Resultado:** Estrutura mais limpa e organizada

---

## 📊 Regras de Ouro

### 1. Tamanho Máximo de Arquivos

```
✅ Componentes:  < 300 linhas
✅ Hooks:        < 200 linhas  
✅ Services:     < 250 linhas
✅ Utils:        < 150 linhas
✅ Types:        < 500 linhas (ou dividir)
```

### 2. Nunca Use

```typescript
// ❌ NUNCA
console.log()
console.warn()
console.error()
any (sem motivo muito forte)
../../../ (deep imports)

// ✅ SEMPRE
logger.info()
logger.warn()
logger.error()
Record<string, unknown>
@/caminho/arquivo
```

### 3. Sempre Use

```typescript
// ✅ Type safety
function doSomething(data: MyInterface) { }

// ✅ Logger
import { logger } from '@/services/logger';
logger.info('Message', { data });

// ✅ Path alias
import { Button } from '@/components/ui/button';

// ✅ Async/await
const result = await fetchData();
```

---

## 🚨 Red Flags - Pare e Refatore

Se você ver qualquer um destes, PARE e refatore:

```typescript
// 🚨 RED FLAG 1: Arquivo muito grande
// Se arquivo tem > 300 linhas, dividir

// 🚨 RED FLAG 2: Uso de any
function process(data: any) { } // ← NUNCA!

// 🚨 RED FLAG 3: Console em código
console.log("debug"); // ← Use logger

// 🚨 RED FLAG 4: Deep imports
import { X } from '../../../utils/x'; // ← Use @/

// 🚨 RED FLAG 5: Código duplicado
// Duas funções idênticas? Centralizar!
```

---

## 🎓 Comandos Úteis

### Análise

```bash
npm run refactor:find-large       # Arquivos grandes
npm run refactor:find-duplicates  # Código duplicado
npm run type-check                # Erros TypeScript
npm run lint                      # Problemas de estilo
```

### Refatoração (com preview)

```bash
npm run refactor:replace-console:dry  # Preview console.log
npm run refactor:split-types:dry      # Preview types.ts
```

### Refatoração (aplicar)

```bash
npm run refactor:replace-console  # Substituir console.log
npm run refactor:split-types      # Dividir types.ts
```

### Validação

```bash
npm run type-check   # TypeScript
npm run lint:fix     # ESLint (auto-fix)
npm run test         # Unit tests
npm run build        # Production build
```

---

## 💡 Dicas Rápidas

### Antes de Criar Novo Componente

```typescript
// Pergunte-se:
1. Este componente vai ser > 300 linhas?
   → Se sim, planejar divisão ANTES

2. Preciso de estado complexo?
   → Criar hook separado

3. Tem lógica de negócio?
   → Criar service separado

4. É reutilizável?
   → Colocar em /shared ou /components/ui
```

### Ao Editar Arquivo Existente

```typescript
// Se arquivo está > 300 linhas:
1. Extrair componentes menores
2. Criar hooks customizados
3. Mover lógica para services
4. Dividir em sub-módulos
```

---

## 🏆 Metas Semanais

### Semana 1
- [ ] Refatorar types.ts
- [ ] Remover todos console.log
- [ ] Refatorar sidebar.tsx

### Semana 2
- [ ] Refatorar 3 services principais
- [ ] Limpar arquivos legacy
- [ ] Melhorar type safety (remover any)

### Semana 3
- [ ] Refatorar hooks grandes
- [ ] Aumentar cobertura de testes
- [ ] Documentar mudanças

---

## 🎯 Como Saber se Está Bom?

### Métricas de Qualidade

```yaml
✅ TypeScript Errors: 0
✅ ESLint Warnings: 0
✅ Arquivo Maior: < 300 linhas
✅ Usos de 'any': < 5
✅ Console.log: 0
✅ Build Time: < 6 segundos
✅ Test Coverage: > 70%
```

### Teste da "Leitura em 5 Minutos"

Se você não consegue entender um arquivo em 5 minutos:
→ **O arquivo está muito grande ou complexo**

---

## 🚀 Recursos

### Documentação Completa
- `CODIGO_ANALISE_REFACTORING.md` - Análise técnica detalhada
- `RELATORIO_EXECUTIVO.md` - Relatório executivo completo
- `analysis/` - Relatórios JSON das análises

### Scripts Criados
- `scripts/find-large-files.mjs`
- `scripts/replace-console-logs.mjs`
- `scripts/split-types.mjs`
- `scripts/find-duplicates.mjs`

### Comandos Adicionados ao package.json
```json
"refactor:find-large": "...",
"refactor:find-duplicates": "...",
"refactor:replace-console": "...",
"refactor:replace-console:dry": "...",
"refactor:split-types": "...",
"refactor:split-types:dry": "..."
```

---

## ❓ FAQ

### "Por que refatorar se está funcionando?"

**Motivos:**
- 🐛 Menos bugs (código menor = menos erros)
- ⚡ Mais rápido (compilação, HMR, build)
- 👥 Mais fácil de colaborar
- 🧪 Mais fácil de testar
- 📈 Mais fácil de evoluir

### "Quanto tempo vai demorar?"

**Timeline:**
- Prioridade 1 (types.ts): 2 horas
- Prioridade 2 (console.log): 30 min
- Prioridade 3 (cleanup): 15 min
- **Total para começar: ~3 horas**

### "E se eu quebrar algo?"

**Segurança:**
```bash
# Sempre tem preview (-:dry)
npm run refactor:XXX:dry

# Sempre tem backup
git status  # Ver mudanças
git diff    # Ver diferenças
git checkout -- file.ts  # Reverter se necessário

# Sempre tem validação
npm run type-check && npm run test
```

---

## 🎉 Conclusão

**Você está pronto para começar!**

1. Execute `npm run refactor:find-large`
2. Escolha 1 arquivo grande
3. Refatore seguindo as regras de ouro
4. Valide com `npm run type-check && npm test`
5. Commit e PR

**Cada pequena melhoria conta! 🚀**

---

*Guia criado em 19/10/2025 - Azuria Team*
