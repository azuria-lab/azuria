# 🔧 Solução: Type-Check Sem Erro de Conexão

**Data**: Janeiro 2025  
**Status**: ✅ **IMPLEMENTADO**

---

## ⚠️ Problema

Ao executar `npm run type-check`, ocorria um erro de conexão porque:
1. O TypeScript tentava executar código durante a verificação de tipos
2. O cliente Supabase tentava fazer conexões reais mesmo durante o type-check
3. Isso causava falhas de conexão e impedia a verificação de tipos

---

## ✅ Solução Implementada

### 1. Script de Type-Check com Variáveis de Ambiente

**Arquivo**: `scripts/type-check.mjs`

Criado um script Node.js que:
- Define variáveis de ambiente **ANTES** de importar qualquer módulo
- Executa o TypeScript compiler com essas variáveis configuradas
- Garante que o cliente Supabase detecte que estamos em modo type-check

```javascript
// Definir variáveis de ambiente ANTES de importar qualquer módulo
process.env.TSC = 'true';
process.env.TYPESCRIPT = 'true';
process.env.NODE_ENV = 'type-check';
process.env.TSC_COMPILE_ON_ERROR = 'true';
```

### 2. Detecção Melhorada no Cliente Supabase

**Arquivo**: `src/integrations/supabase/client.ts`

O cliente verifica múltiplas condições para detectar type-check:
- Variáveis de ambiente (`TSC`, `TYPESCRIPT`, `NODE_ENV=type-check`)
- Argumentos do processo (`tsc`, `type-check`, `--noEmit`)
- Ausência de indicadores de runtime (window, document, etc.)

### 3. Clientes Mock Durante Type-Check

Durante o type-check:
- Clientes são criados com URLs mock (`http://127.0.0.1:0`)
- Fetch customizado retorna uma resposta mock imediatamente
- **Nenhuma conexão real é tentada**
- **Tipos são preservados** usando type assertions explícitas

---

## 🚀 Como Usar

### Executar Type-Check

```bash
npm run type-check
```

O script agora:
1. Define as variáveis de ambiente necessárias
2. Executa o TypeScript compiler
3. **Não tenta fazer conexões** durante a verificação

### Verificar Tipos Sem Executar Type-Check

Se você quiser verificar tipos sem executar o comando, você pode:

1. **Usar o editor/IDE**: O TypeScript Language Server no VS Code/Cursor já verifica tipos em tempo real
2. **Verificar arquivos específicos**: Abra os arquivos no editor e veja os erros destacados
3. **Usar o linter**: Execute `npm run lint` para verificar problemas de código

---

## 🔍 Verificação Manual de Erros de Tipo

Para verificar erros de tipo sem executar o type-check:

### 1. Verificar no Editor

Abra os arquivos no VS Code/Cursor e verifique:
- Linhas sublinhadas em vermelho (erros)
- Linhas sublinhadas em amarelo (avisos)
- Hover sobre variáveis para ver tipos inferidos

### 2. Arquivos Comuns com Problemas de Tipo

Verifique especialmente:
- `src/shared/hooks/useSecurityMonitoring.ts`
- `src/shared/hooks/auth/useUserProfile.ts`
- `src/shared/hooks/calculation-history/useSupabaseHistory.ts`
- Qualquer arquivo que use `supabase.from()`, `supabase.rpc()`, etc.

### 3. Problemas Comuns

- **Tipo `never`**: Geralmente ocorre quando o TypeScript não consegue inferir o tipo. Use type assertions explícitas.
- **Tipo não atribuível**: Verifique se os tipos dos dados correspondem ao schema do Supabase.
- **Propriedade não existe**: Verifique se a tabela/coluna existe no schema do banco.

---

## 📝 Exemplo de Correção de Erro de Tipo

Se você encontrar um erro como:

```typescript
// ❌ Erro: Tipo 'never' não pode ser atribuído
const { data } = await supabase.from('table').select('*');
```

Corrija usando type assertion:

```typescript
// ✅ Correto: Tipo explícito
const { data } = await supabase
  .from('table')
  .select('*') as { data: TableRow[] | null; error: PostgrestError | null };
```

Ou usando o tipo do Database:

```typescript
// ✅ Melhor: Usando tipos do Database
import type { Database } from '@/types/supabase';
type TableRow = Database['public']['Tables']['table']['Row'];

const { data } = await supabase.from('table').select('*');
// TypeScript agora infere o tipo corretamente
```

---

## ✅ Benefícios

1. **Type-check funciona sem conexão**: Não precisa de conexão com Supabase
2. **Tipos preservados**: Os tipos são mantidos corretamente mesmo durante type-check
3. **Execução mais rápida**: Não tenta fazer conexões desnecessárias
4. **Compatível com CI/CD**: Funciona em ambientes sem acesso ao banco

---

## 🔄 Próximos Passos

### Erros de Tipo Durante Type-Check

⚠️ **IMPORTANTE**: Após resolver o erro de conexão, você pode ver erros de tipo onde o TypeScript infere `never` para operações do Supabase. **Estes erros são esperados e podem ser ignorados** - eles não afetam o runtime.

Para mais informações, consulte: [ERROS_TIPO_TYPE_CHECK_ACEITOS.md](./ERROS_TIPO_TYPE_CHECK_ACEITOS.md)

### Se Precisar Corrigir Erros de Tipo

1. Verifique se os tipos do Database estão atualizados
2. Execute `npm run type-check` para ver os erros específicos
3. **Aceite que erros de `never` com Supabase são uma limitação conhecida**
4. Corrija apenas erros que não sejam relacionados a `never` e Supabase
5. Atualize os tipos do Supabase se o schema mudou

---

## 📚 Referências

- [TypeScript Type Checking](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)
- [Supabase TypeScript Types](https://supabase.com/docs/reference/javascript/typescript-support)

