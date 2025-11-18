# 🔍 Diagnóstico Completo: `users` vs `user_profiles`

**Data**: Janeiro 2025  
**Status**: ✅ **Análise Completa - Problema Identificado**

---

## 📊 Resultados da Análise

### **1. Estrutura de `users`** (5 colunas)

| Coluna | Tipo | Nullable | Observação |
|--------|------|----------|------------|
| `id` | uuid | NO | Chave primária |
| `tenant_id` | uuid | NO | **Multi-tenancy** |
| `email` | text | NO | Email obrigatório |
| `role` | text | NO | Role obrigatório |
| `created_at` | timestamp | NO | Data de criação |

**Características**:
- ✅ Tabela multi-tenant (`tenant_id`)
- ✅ Sistema de roles (`role`)
- ❌ Não tem campos de perfil (nome, avatar, etc.)

---

### **2. Estrutura de `user_profiles`** (9 colunas)

| Coluna | Tipo | Nullable | Observação |
|--------|------|----------|------------|
| `id` | uuid | NO | Referencia `auth.users(id)` |
| `email` | text | YES | Email opcional |
| `name` | text | YES | Nome do usuário |
| `avatar_url` | text | YES | URL do avatar |
| `is_pro` | boolean | YES | Status PRO |
| `created_at` | timestamp | NO | Data de criação |
| `updated_at` | timestamp | NO | Data de atualização |
| `phone` | text | YES | Telefone |
| `company` | text | YES | Empresa |

**Características**:
- ✅ Tabela de perfis completa
- ✅ Referencia `auth.users` (Supabase Auth)
- ✅ Campos de perfil completos

---

### **3. Dados de `users`** (2 registros)

| ID | Email | Created At |
|----|-------|------------|
| `00000000-0000-0000-0000-000000000002` | `admin@demo.com` | 2025-09-27 |
| `00000000-0000-0000-0000-000000000101` | `owner@demo.local` | 2025-09-19 |

**Observação**: 
- ⚠️ IDs são **dados de teste/demo** (não são UUIDs reais)
- ⚠️ Emails são **demo/teste**

---

### **4. Dados de `user_profiles`** (3 registros)

| ID | Email | Name | Created At |
|----|-------|------|------------|
| `13e44f17-bdf4-4493-81ab-2a2d6e590181` | `zromulo.barbosa@icloud.com` | Rômulo Barbosa | 2025-10-23 |
| `00ee0b3d-5541-4e27-a22b-647f8735c243` | `rf.refritec@gmail.com` | Usuário Teste | 2025-10-19 |
| `819ac65a-ee40-42b3-bd52-d4b73aea41d7` | `zromulo.barbosa@icloud.com` | Rômulo Barbosa | 2025-10-17 |

**Observação**:
- ✅ IDs são **UUIDs reais**
- ✅ Emails são **reais**
- ⚠️ Há **duplicação** de email (`zromulo.barbosa@icloud.com` aparece 2x)

---

### **5. Comparação** (CRÍTICO)

| ID | Email | Em `users` | Em `user_profiles` |
|----|-------|------------|-------------------|
| `13e44f17-bdf4-4493-81ab-2a2d6e590181` | `zromulo.barbosa@icloud.com` | ❌ | ✅ |
| `00ee0b3d-5541-4e27-a22b-647f8735c243` | `rf.refritec@gmail.com` | ❌ | ✅ |
| `819ac65a-ee40-42b3-bd52-d4b73aea41d7` | `zromulo.barbosa@icloud.com` | ❌ | ✅ |
| `00000000-0000-0000-0000-000000000002` | `admin@demo.com` | ✅ | ❌ |
| `00000000-0000-0000-0000-000000000101` | `owner@demo.local` | ✅ | ❌ |

**Conclusão**:
- ❌ **Nenhum ID coincide** entre as duas tabelas
- ❌ Tabelas **totalmente desconectadas**
- ✅ `user_profiles` tem **usuários reais**
- ⚠️ `users` tem apenas **dados de teste/demo**

---

### **6. `price_audit`**

- **Total de registros**: **0** (tabela vazia)
- **Foreign Key**: `user_id` → `users.id`
- **Status**: Não está sendo usada

---

## 🎯 Conclusões

### **1. `users` é Tabela Legada** 🗑️

**Evidências**:
- ✅ Estrutura diferente (multi-tenant, roles)
- ✅ Apenas dados de teste/demo
- ✅ Não é usada no código atual
- ✅ Não está sincronizada com `user_profiles`

**Função Original**:
- Parece ser de um sistema antigo com multi-tenancy
- Sistema de roles próprio
- Não integrado com Supabase Auth

---

### **2. `user_profiles` é a Tabela Atual** ✅

**Evidências**:
- ✅ Referencia `auth.users` (Supabase Auth)
- ✅ Tem usuários reais
- ✅ Usada no código atual
- ✅ Estrutura completa de perfis

---

### **3. `price_audit` Precisa Correção** ⚠️

**Problema**:
- ❌ Referencia `users` (legada)
- ❌ Tabela vazia (0 registros)
- ❌ Não está sendo usada

**Solução**:
- Migrar foreign key para `user_profiles` (se necessário)
- Ou remover tabela (se não for usada)

---

## 📋 Problemas Identificados

### **1. Duplicação de Email em `user_profiles`** ⚠️

**Problema**:
- `zromulo.barbosa@icloud.com` aparece **2 vezes** com IDs diferentes
- Pode causar inconsistências

**Solução Necessária**:
- Verificar se são usuários diferentes ou duplicação
- Consolidar se necessário

---

### **2. Tabela `users` Legada** 🗑️

**Problema**:
- Tabela não usada ocupando espaço
- Pode causar confusão

**Solução Necessária**:
- Remover após verificar dependências
- Ou migrar dados importantes (se houver)

---

### **3. `price_audit` Referencia Tabela Errada** ⚠️

**Problema**:
- Foreign key aponta para `users` (legada)
- Deveria apontar para `user_profiles` (se necessário)

**Solução Necessária**:
- Corrigir foreign key
- Ou remover tabela (se não for usada)

---

## 🎯 Plano de Ação

### **Prioridade ALTA** 🔴

1. ✅ **Verificar duplicação de email** em `user_profiles`
2. ✅ **Remover tabela `users`** (legada, não usada)
3. ✅ **Corrigir ou remover `price_audit`** (vazia, referencia errada)

### **Prioridade MÉDIA** 🟡

4. 📝 **Documentar migração**
5. 🔧 **Limpar dependências**

---

**Próximo passo**: Criar migração para corrigir/remover tabelas legadas!

