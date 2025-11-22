# 🎯 Plano de Correção Final: Remover Tabelas Legadas

**Data**: Janeiro 2025  
**Status**: ✅ **Pronto para Aplicar**

---

## 📊 Resumo da Análise

### **Problemas Identificados**:

1. ✅ **`users` é tabela legada**
   - Estrutura multi-tenant antiga (`tenant_id`, `role`)
   - Apenas dados de teste/demo (2 registros)
   - Não é usada no código atual
   - Não sincronizada com `user_profiles`

2. ✅ **`price_audit` está vazia e referencia tabela errada**
   - 0 registros
   - Foreign key aponta para `users` (legada)
   - Não é usada no código

3. ⚠️ **Duplicação de email em `user_profiles`**
   - `zromulo.barbosa@icloud.com` aparece 2x com IDs diferentes
   - Precisa investigar e consolidar

---

## 🎯 Ações Planejadas

### **Migração Criada**: `20250111_remove_legacy_users.sql`

**O que faz**:
1. ✅ Remove foreign key de `price_audit` para `users`
2. ✅ Remove tabela `price_audit` (vazia, não usada)
3. ✅ Remove tabela `users` (legada, não usada)
4. ✅ Remove policies, triggers e índices relacionados

**Segurança**:
- ✅ Verifica dependências antes de remover
- ✅ Remove apenas se não houver outras foreign keys
- ✅ Usa `IF EXISTS` para evitar erros

---

## 📋 Próximos Passos

### **1. Aplicar Migração** 🔴

Execute no SQL Editor:
```sql
-- Copiar conteúdo de: supabase/migrations/20250111_remove_legacy_users.sql
```

### **2. Verificar Duplicação de Email** 🟡

Investigar duplicação em `user_profiles`:
```sql
SELECT id, email, name, created_at
FROM public.user_profiles
WHERE email = 'zromulo.barbosa@icloud.com'
ORDER BY created_at;
```

**Decisão**:
- Se forem usuários diferentes → Manter ambos
- Se for duplicação → Consolidar em um registro

### **3. Verificar Resultado** ✅

Após aplicar migração, verificar:
```sql
-- Verificar se users foi removida
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- Verificar se price_audit foi removida
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'price_audit';

-- Verificar tabelas restantes
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## ⚠️ Observações Importantes

### **Antes de Aplicar**:
- ✅ Backup do banco (se necessário)
- ✅ Verificar se não há outras dependências
- ✅ Confirmar que `price_audit` está vazia (0 registros)

### **Após Aplicar**:
- ✅ Verificar se aplicação continua funcionando
- ✅ Verificar se não há erros no console
- ✅ Documentar remoção

---

## 📊 Impacto Esperado

### **Benefícios**:
- ✅ Schema mais limpo
- ✅ Menos confusão (sem tabelas duplicadas)
- ✅ Menos manutenção
- ✅ Melhor performance (menos tabelas)

### **Riscos**:
- ⚠️ Baixo risco (tabelas não são usadas)
- ⚠️ Se houver código oculto usando essas tabelas, pode quebrar
- ⚠️ Mitigação: Verificar logs após aplicação

---

**Status**: ✅ **Pronto para aplicar migração!**

