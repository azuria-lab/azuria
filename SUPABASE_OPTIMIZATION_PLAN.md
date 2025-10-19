# 🔧 Plano de Correção e Otimização - Supabase

**Data:** 17 de Outubro de 2025  
**Status:** Em Progresso

---

## ❌ Problemas Identificados

### 1. **Erro de Cadastro - "Failed to fetch"** ✅ CORRIGIDO
**Causa:** Políticas RLS bloqueando inserções do trigger `handle_new_user`

**Solução Aplicada:**
- Modificadas políticas `self_insert` e `owner_ins`
- Agora permitem inserções via trigger (SECURITY DEFINER)
- Teste novamente o cadastro!

---

### 2. **Security Advisor - 197 Issues**

#### 🔴 Errors (6)
1. **Security Definer View** - `public.v_products_margin`
   - View herdada do sistema multi-tenant
   - Não é do Azuria, mas pode ser ajustada

#### ⚠️ Warnings (191)
Principalmente: **"Function Search Path Mutable"**

**Funções Afetadas:**
- Funções do sistema multi-tenant (marketplace, tenants, etc.)
- Algumas funções do Azuria já foram corrigidas

**Status:** 
- ✅ 4 funções principais corrigidas (get_current_user_id, is_admin_user, etc.)
- ⏳ Restantes são do sistema multi-tenant existente

---

## 📊 Recomendações do Supabase

### Usar Supabase CLI para Inspeção
O Supabase recomenda usar o CLI com comandos `inspect db` para:

1. **Performance:**
   ```bash
   supabase inspect db cache-hit
   supabase inspect db unused-indexes
   supabase inspect db long-running-queries
   supabase inspect db outliers
   ```

2. **Disco:**
   ```bash
   supabase inspect db bloat
   supabase inspect db table-sizes
   supabase inspect db index-sizes
   ```

3. **Locks e Conexões:**
   ```bash
   supabase inspect db locks
   supabase inspect db blocking
   supabase inspect db role-connections
   ```

---

## 🎯 Próximas Ações

### Prioridade ALTA (Fazer AGORA)

#### 1. Testar Cadastro ⭐
- **URL:** http://localhost:8080/cadastro
- **Teste com:**
  - Nome: Rômulo Barbosa
  - Email: zromulo.barbosa@icloud.com
  - Senha: (com letra maiúscula, números e símbolos)
- **Esperado:** Cadastro com sucesso + redirecionamento

#### 2. Instalar Supabase CLI (Opcional mas Recomendado)
```powershell
# Instalar via Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Ou via npm
npm install -g supabase
```

Depois linkar com o projeto:
```powershell
supabase link --project-ref crpzkppsriranmeumfqs
```

#### 3. Executar Diagnósticos Básicos
```powershell
# Cache hit rate (deve ser > 99%)
supabase inspect db cache-hit

# Unused indexes
supabase inspect db unused-indexes

# Table sizes
supabase inspect db table-sizes
```

---

### Prioridade MÉDIA

#### 1. Corrigir Warnings Restantes
Aplicar `SET search_path = public, auth` em todas as funções.

**Funções a Corrigir:**
- `has_role`, `has_team_role`, `has_organization_role`
- `is_team_member`, `is_organization_member`
- `can_access_calculation`, `can_user_access_calculation`
- `create_collaboration_notification`
- Todas as funções de cleanup e maintenance

**Script de Correção:** (criar depois de testar cadastro)

#### 2. Otimizar Queries Lentas
Usar SQL do Supabase Docs:
```sql
-- Most frequently called queries
SELECT
  auth.rolname,
  statements.query,
  statements.calls,
  statements.total_exec_time + statements.total_plan_time as total_time,
  statements.mean_exec_time + statements.mean_plan_time as mean_time
FROM pg_stat_statements as statements
INNER JOIN pg_authid as auth ON statements.userid = auth.oid
ORDER BY statements.calls DESC
LIMIT 100;
```

#### 3. Verificar Cache Hit Rate
```sql
SELECT
  'index hit rate' as name,
  (sum(idx_blks_hit)) / nullif(sum(idx_blks_hit + idx_blks_read), 0) * 100 as ratio
FROM pg_statio_user_indexes
UNION ALL
SELECT
  'table hit rate' as name,
  sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100 as ratio
FROM pg_statio_user_tables;
```

**Meta:** > 99% de hit rate

---

### Prioridade BAIXA

#### 1. Review do Sistema Multi-Tenant
As views e funções herdadas precisam ser analisadas:
- `v_products_margin` (SECURITY DEFINER)
- `v_marketplace_*` (várias views)
- Funções de marketplace

**Decisão Necessária:**
- Manter e otimizar?
- Remover se não usado?
- Documentar para uso futuro?

#### 2. Implementar Monitoramento Contínuo
- Configurar alertas para cache hit rate < 95%
- Monitorar queries lentas (> 1s)
- Alertas para bloat de tabelas

---

## 📈 Métricas de Sucesso

### Antes (Atual)
- ❌ Cadastro falhando
- ⚠️ 197 issues no Security Advisor
- ❓ Performance desconhecida
- ❓ Cache hit rate desconhecido

### Depois (Meta)
- ✅ Cadastro funcionando perfeitamente
- ✅ < 20 issues no Security Advisor (apenas warnings não críticos)
- ✅ Cache hit rate > 99%
- ✅ Queries < 100ms (p95)
- ✅ Zero unused indexes
- ✅ Bloat < 10%

---

## 🛠️ Ferramentas Recomendadas

### 1. Supabase CLI
**Por quê:** 
- Inspeção detalhada do banco
- Comandos especializados
- Integração nativa

**Instalação:** Ver seção acima

### 2. Supabase Dashboard
**Uso Atual:**
- Security Advisor ✅
- Performance Advisor ✅
- Query Performance (em breve)

### 3. pgAdmin ou DBeaver (Opcional)
Para análises mais profundas quando necessário.

---

## 📝 Checklist de Execução

### Hoje (17/10/2025)
- [x] Corrigir políticas RLS de INSERT
- [ ] Testar cadastro de usuário
- [ ] Verificar se perfil é criado automaticamente
- [ ] Testar login com usuário criado
- [ ] Verificar dados no Dashboard Supabase

### Esta Semana
- [ ] Instalar Supabase CLI
- [ ] Executar todos os comandos inspect
- [ ] Documentar resultados
- [ ] Corrigir warnings restantes (search_path)
- [ ] Otimizar queries identificadas

### Próxima Semana
- [ ] Review sistema multi-tenant
- [ ] Configurar monitoramento
- [ ] Implementar alertas
- [ ] Documentação final

---

## 🎓 Aprendizados

### Sobre Políticas RLS com Triggers
**Problema:** Trigger com `SECURITY DEFINER` não tem acesso a `auth.uid()`

**Solução:** Políticas devem permitir:
1. Inserção pelo usuário (`id = auth.uid()`)
2. Inserção pelo sistema (trigger)

**Implementação:**
```sql
CREATE POLICY name ON table
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() OR 
    TRUE  -- Permite trigger
  );
```

### Sobre Security Advisor
- **Errors:** Problemas de segurança reais
- **Warnings:** Melhorias recomendadas
- **Info:** Apenas informativo

Nem todos os warnings precisam ser corrigidos imediatamente!

---

## 📞 Referências

1. [Supabase - Debugging and Monitoring](https://supabase.com/docs/guides/database/inspect)
2. [Supabase - Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
3. [PostgreSQL - pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html)
4. [Supabase CLI - Install](https://supabase.com/docs/guides/cli/getting-started)

---

**Última Atualização:** 17/10/2025 - Corrigidas políticas RLS para signup
