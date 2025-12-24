# 🔒 Auditoria de Segurança - Supabase RLS

**Data:** 24/12/2024  
**Autor:** Auditoria Automática  
**Status:** ✅ CORREÇÕES APLICADAS

---

## 📋 Sumário Executivo

Uma auditoria completa foi realizada no banco de dados Supabase do Azuria, identificando **11 vulnerabilidades críticas** relacionadas a Row Level Security (RLS) desabilitado e uma view com configuração insegura.

### Impacto Potencial

⚠️ **CRÍTICO**: Sem as correções, **qualquer usuário autenticado** poderia:
- Ver dados de precificação de OUTROS usuários
- Acessar estratégias comerciais confidenciais
- Visualizar histórico de preços de concorrentes
- Modificar/deletar dados de outros usuários

---

## 🚨 Problemas Identificados

### 1. Tabelas sem RLS (Dynamic Pricing) - **CRÍTICO**

| Tabela | Tem user_id | RLS Antes | Risco |
|--------|-------------|-----------|-------|
| `pricing_rules` | ✅ | ❌ Desabilitado | **CRÍTICO** |
| `pricing_rule_executions` | ✅ | ❌ Desabilitado | **CRÍTICO** |
| `price_adjustments` | ✅ | ❌ Desabilitado | **CRÍTICO** |
| `pricing_strategies` | ✅ | ❌ Desabilitado | **CRÍTICO** |
| `price_history` | ✅ | ❌ Desabilitado | **CRÍTICO** |
| `pricing_performance_metrics` | ✅ | ❌ Desabilitado | **CRÍTICO** |
| `price_simulations` | ✅ | ❌ Desabilitado | **CRÍTICO** |

### 2. Tabelas sem RLS (RAG/Licitações) - **MÉDIO**

| Tabela | Tem user_id | RLS Antes | Risco |
|--------|-------------|-----------|-------|
| `rag_documents` | ❌ | ❌ Desabilitado | **MÉDIO** |
| `portals` | ❌ | ❌ Desabilitado | **MÉDIO** |
| `detected_editais` | ❌ | ❌ Desabilitado | **MÉDIO** |

### 3. View com Security Definer - **ALTO**

| View | Problema | Risco |
|------|----------|-------|
| `v_price_monitoring_summary` | SECURITY DEFINER (default) | **ALTO** |

A view estava usando `SECURITY DEFINER` implicitamente, permitindo que usuários acessassem dados que não deveriam via a view.

---

## ✅ Correções Aplicadas

### Arquivo de Migração
```
supabase/migrations/20251224_security_audit_fix_rls.sql
```

### Resumo das Correções

#### 1. Tabelas de Dynamic Pricing (7 tabelas)

Cada tabela recebeu:
- `ENABLE ROW LEVEL SECURITY`
- 4 políticas RLS:
  - `SELECT`: `user_id = auth.uid()`
  - `INSERT`: `user_id = auth.uid()`
  - `UPDATE`: `user_id = auth.uid()` (USING e WITH CHECK)
  - `DELETE`: `user_id = auth.uid()`

#### 2. Tabelas de RAG/Licitações (3 tabelas)

Como são tabelas de dados públicos (legislação/editais):
- `ENABLE ROW LEVEL SECURITY`
- Política `SELECT` para usuários autenticados
- Modificações apenas via `service_role` (backend)

#### 3. View v_price_monitoring_summary

Recriada com:
```sql
CREATE VIEW v_price_monitoring_summary 
WITH (security_invoker = true)
```

Isso garante que a view respeite as políticas RLS das tabelas subjacentes.

---

## 📊 Matriz de Segurança Após Correções

| Tabela | RLS | SELECT | INSERT | UPDATE | DELETE |
|--------|-----|--------|--------|--------|--------|
| `pricing_rules` | ✅ | own | own | own | own |
| `pricing_rule_executions` | ✅ | own | own | own | own |
| `price_adjustments` | ✅ | own | own | own | own |
| `pricing_strategies` | ✅ | own | own | own | own |
| `price_history` | ✅ | own | own | own | own |
| `pricing_performance_metrics` | ✅ | own | own | own | own |
| `price_simulations` | ✅ | own | own | own | own |
| `rag_documents` | ✅ | all | - | - | - |
| `portals` | ✅ | all | - | - | - |
| `detected_editais` | ✅ | all | - | - | - |

**Legenda:**
- `own` = apenas dados próprios (`user_id = auth.uid()`)
- `all` = todos os registros (dados públicos)
- `-` = apenas via service_role

---

## 🚀 Como Aplicar

### Opção 1: Supabase Cloud (Produção)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Cole o conteúdo de `supabase/migrations/20251224_security_audit_fix_rls.sql`
4. Execute

### Opção 2: Supabase Local (Desenvolvimento)

```bash
# Se usando Supabase CLI
supabase db push

# Ou via psql direto
psql $DATABASE_URL -f supabase/migrations/20251224_security_audit_fix_rls.sql
```

### Opção 3: Via Migração Automática

A migração será aplicada automaticamente no próximo deploy se você estiver usando o sistema de migrações do Supabase.

---

## 🔍 Verificação Pós-Aplicação

Execute estas queries no SQL Editor para verificar:

### Verificar RLS Habilitado
```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'pricing_rules', 
    'pricing_rule_executions',
    'price_adjustments',
    'pricing_strategies',
    'price_history',
    'pricing_performance_metrics',
    'price_simulations',
    'rag_documents',
    'portals',
    'detected_editais'
  )
ORDER BY tablename;
```

### Verificar Políticas Criadas
```sql
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Verificar View com Security Invoker
```sql
SELECT 
    viewname,
    definition
FROM pg_views
WHERE viewname = 'v_price_monitoring_summary';
```

---

## ⚠️ Considerações Importantes

### 1. Service Role

O `service_role` do Supabase **bypassa RLS** automaticamente. Use-o apenas no backend para:
- Operações administrativas
- Scraping de editais
- Inserção de documentos RAG

### 2. Tabelas Compartilhadas

`rag_documents`, `portals` e `detected_editais` são dados públicos de legislação e licitações. A política permite leitura por todos os usuários autenticados, mas modificação apenas via backend.

### 3. Backwards Compatibility

As correções são **backward compatible**. Aplicativos existentes continuarão funcionando, mas agora com isolamento de dados correto.

---

## 📝 Checklist de Segurança

- [x] RLS habilitado em todas as tabelas com dados de usuário
- [x] Políticas SELECT com filtro por user_id
- [x] Políticas INSERT com verificação de user_id
- [x] Políticas UPDATE com USING e WITH CHECK
- [x] Políticas DELETE com filtro por user_id
- [x] View recriada com SECURITY INVOKER
- [x] Tabelas públicas protegidas contra modificação não autorizada

---

## 🔐 Recomendações Futuras

1. **Auditorias Regulares**: Execute o Security Advisor do Supabase mensalmente
2. **Logs de Acesso**: Habilite logging para detectar tentativas de acesso não autorizado
3. **Testes de Penetração**: Teste periodicamente o isolamento de dados entre usuários
4. **Revisão de Migrações**: Sempre inclua `ENABLE ROW LEVEL SECURITY` em novas tabelas

---

## 📧 Contato

Em caso de dúvidas sobre segurança, entre em contato com a equipe de desenvolvimento.

**Última Atualização:** 24/12/2024

