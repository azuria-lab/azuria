# 🔍 Análise: `users` e `price_audit`

**Data**: Janeiro 2025  
**Status**: ⏳ **Aguardando resultados completos**

---

## ✅ Descobertas

### **1. Foreign Key Encontrada** 🔗

**`price_audit` referencia `users`**:
- Tabela: `price_audit`
- Coluna: `user_id`
- Referencia: `users.id`

### **2. Status no Código** 📝

**Análise anterior**:
- ❌ `price_audit` - **NÃO encontrado uso no código**
- ❌ `users` - **NÃO encontrado uso no código** (só `user_profiles` é usado)

**Conclusão**: Ambas as tabelas parecem ser **legadas/não utilizadas**.

---

## 🎯 Cenários Possíveis

### **Cenário 1: Tabelas Legadas** 🗑️
- `users` e `price_audit` são resíduos de desenvolvimento antigo
- Não estão sendo usadas
- Podem ser removidas (após migrar dados se necessário)

### **Cenário 2: `users` é `auth.users`** 🔐
- `users` pode ser a tabela de autenticação do Supabase (`auth.users`)
- Não deve ser removida
- `price_audit` deveria referenciar `user_profiles` ao invés de `users`

### **Cenário 3: Dados Importantes** 💾
- `users` e `price_audit` têm dados importantes
- Precisa migrar antes de remover

---

## 📋 Queries Necessárias

Execute e envie os resultados:

### **QUERY 1**: Estrutura de `users`
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
```

### **QUERY 3**: Dados de `users`
```sql
SELECT id, email, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;
```

### **QUERY 4**: Dados de `user_profiles`
```sql
SELECT id, email, name, created_at
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 10;
```

### **QUERY 5**: Comparação (CRÍTICO)
```sql
SELECT 
    COALESCE(u.id::text, up.id::text) as id,
    COALESCE(u.email, up.email) as email,
    CASE WHEN u.id IS NOT NULL THEN '✅ users' ELSE '❌' END as em_users,
    CASE WHEN up.id IS NOT NULL THEN '✅ user_profiles' ELSE '❌' END as em_user_profiles
FROM public.users u
FULL OUTER JOIN public.user_profiles up ON u.id = up.id
ORDER BY COALESCE(u.created_at, up.created_at) DESC;
```

### **BONUS**: Verificar `price_audit`
```sql
SELECT COUNT(*) as total_registros FROM public.price_audit;
SELECT user_id, COUNT(*) FROM public.price_audit GROUP BY user_id;
```

---

## 🎯 Próximos Passos

1. ✅ Executar queries acima
2. ✅ Analisar estrutura e dados
3. ✅ Decidir ação:
   - Remover `users` e `price_audit` (se legadas)
   - Migrar `price_audit.user_id` para `user_profiles.id`
   - Manter ambas (se tiverem função diferente)

---

**Execute as queries e envie os resultados para análise completa!**

