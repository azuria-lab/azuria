# 📊 Resultados Parciais do Diagnóstico: `users` vs `user_profiles`

**Data**: Janeiro 2025  
**Status**: ⏳ **Aguardando resultados completos**

---

## ✅ Descobertas Até Agora

### **1. Foreign Key Encontrada** 🔍

**Tabela `price_audit` referencia `users`**:
- `table_name`: `price_audit`
- `column_name`: `user_id`
- `foreign_table_name`: `users`
- `foreign_column_name`: `id`

**Conclusão**: A tabela `users` **ESTÁ SENDO USADA** por pelo menos uma tabela (`price_audit`).

---

## 📋 Queries Executadas

- ✅ **QUERY 7**: Foreign Keys - **EXECUTADA** (1 resultado)
- ⏳ **QUERY 1**: Estrutura de `users` - **PENDENTE**
- ⏳ **QUERY 2**: Estrutura de `user_profiles` - **PENDENTE**
- ⏳ **QUERY 3**: Dados de `users` - **PENDENTE**
- ⏳ **QUERY 4**: Dados de `user_profiles` - **PENDENTE**
- ⏳ **QUERY 5**: Comparação de IDs e Emails - **PENDENTE**
- ⏳ **QUERY 6**: Referências (similar à QUERY 7) - **PENDENTE**

---

## 🎯 Próximos Passos

### **Execute as Queries Restantes**:

1. **QUERY 1** - Ver estrutura de `users` (colunas, tipos)
2. **QUERY 3** - Ver os 2 registros em `users`
3. **QUERY 4** - Ver os 3 registros em `user_profiles`
4. **QUERY 5** - Comparar IDs e emails (CRÍTICO)

---

## 🔍 Análise Inicial

### **Possíveis Cenários**:

1. **`users` é legado mas ainda referenciada**
   - `price_audit` usa `users`
   - Precisa migrar referência para `user_profiles`

2. **`users` tem função diferente**
   - Pode ser tabela de autenticação do Supabase (`auth.users`)
   - Não deve ser removida

3. **Duplicação real**
   - `users` e `user_profiles` têm dados diferentes
   - Precisa sincronizar ou migrar

---

**Execute as QUERIES 1, 3, 4 e 5 e envie os resultados para análise completa!**

