# 🔧 Solução para Erros 401/406 no Modo Híbrido

**Data**: Janeiro 2025  
**Problema**: Erros 401 (Unauthorized) e 406 (Not Acceptable) ao acessar Supabase Local

---

## 🔍 Diagnóstico

### Problema Identificado

No modo híbrido:
- ✅ Autenticação funciona no Cloud (`supabaseAuth`)
- ❌ Queries de dados falham no Local (`supabaseData`) com 401/406

**Causa Raiz**: 
O token JWT do Supabase Cloud não é válido no Supabase Local porque eles têm **secrets JWT diferentes**.

---

## ✅ Soluções Possíveis

### **Opção 1: Desabilitar RLS no Local para Desenvolvimento** (Recomendado)

Para desenvolvimento local, você pode desabilitar temporariamente o RLS (Row Level Security) nas tabelas:

```sql
-- No Supabase Studio Local (http://localhost:54323)
-- Ou via SQL:
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
-- ... outras tabelas conforme necessário
```

**Vantagens**:
- ✅ Funciona imediatamente
- ✅ Ideal para desenvolvimento
- ✅ Não requer configuração complexa

**Desvantagens**:
- ⚠️ Apenas para desenvolvimento
- ⚠️ Não testa RLS localmente

---

### **Opção 2: Usar Service Role Key no Local** (Não Recomendado)

Usar a service_role key bypassa RLS, mas não é seguro:

```typescript
// NÃO RECOMENDADO - apenas para testes
const supabaseData = createClient(
  LOCAL_URL,
  SERVICE_ROLE_KEY // ⚠️ Bypassa RLS
);
```

---

### **Opção 3: Configurar JWT Secret Compartilhado** (Complexo)

Configurar o mesmo JWT secret no Local e Cloud:

1. Obter JWT secret do Cloud
2. Configurar no `supabase/config.toml`:
```toml
[auth.jwt]
secret = "seu-jwt-secret-do-cloud"
```

**Desvantagens**:
- ⚠️ Requer sincronização manual
- ⚠️ Complexo de manter

---

### **Opção 4: Usar Modo Cloud para Desenvolvimento** (Mais Simples)

Para desenvolvimento, usar apenas o Cloud:

```bash
npm run env:cloud
npm run dev:cloud
```

**Vantagens**:
- ✅ Funciona imediatamente
- ✅ Testa o ambiente real
- ✅ Sem configuração adicional

---

## 🚀 Solução Recomendada

### **Para Desenvolvimento Rápido**:

1. **Usar modo Cloud**:
   ```bash
   npm run env:cloud
   npm run dev:cloud
   ```

2. **Ou desabilitar RLS no Local** (se quiser usar modo híbrido):
   - Acesse: http://localhost:54323 (Supabase Studio)
   - Vá em Authentication > Policies
   - Desabilite RLS temporariamente nas tabelas necessárias

### **Para Produção**:

O modo híbrido requer configuração adicional. Considere:
- Usar apenas Cloud em produção
- Ou configurar JWT secret compartilhado
- Ou usar Edge Functions para fazer queries autenticadas

---

## 📊 Status Atual

| Item | Status |
|------|--------|
| Autenticação Cloud | ✅ Funcionando |
| Queries Local | ❌ Erro 401/406 |
| Causa | JWT secrets diferentes |
| **Solução Imediata** | Usar modo Cloud |

---

## 🔧 Correção Aplicada

Adicionado listener para sincronizar tokens (mas ainda requer configuração adicional do JWT secret ou desabilitar RLS).

**Arquivo**: `src/integrations/supabase/client.ts`

---

**Recomendação**: Use `npm run env:cloud` e `npm run dev:cloud` para desenvolvimento até configurar o JWT secret compartilhado ou desabilitar RLS no Local.

