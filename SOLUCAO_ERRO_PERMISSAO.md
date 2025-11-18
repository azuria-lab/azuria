# ⚠️ Erro de Permissão - Solução

**Erro**: `Your account does not have the necessary privileges to access this endpoint`

**Causa**: A conta logada no CLI não tem permissão para acessar o projeto `crpzkppsriranmeumfqs`

---

## 🔧 Soluções

### **Opção 1: Fazer Login com Conta Correta** (Recomendado)

1. **Fazer logout**:
```bash
# Não há comando direto, mas você pode limpar o token
```

2. **Fazer login novamente**:
```bash
supabase login
```

Isso abrirá o navegador para autenticar com a conta que tem acesso ao projeto.

3. **Tentar linkar novamente**:
```bash
supabase link --project-ref crpzkppsriranmeumfqs --password "3#t},#$fOmC2£2M=./EY_2tm"
```

---

### **Opção 2: Usar SQL Editor** ⭐ **MAIS SIMPLES E RECOMENDADO**

Como o link está dando problema de permissão, a melhor solução é aplicar as migrações diretamente via SQL Editor:

1. **Acesse**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql
2. **Execute cada migração** na ordem (veja `GUIA_RAPIDO_APLICAR_MIGRACOES.md`)

**Vantagens**:
- ✅ Não depende de permissões do CLI
- ✅ Mais visual e direto
- ✅ Você vê o resultado imediatamente
- ✅ Funciona sempre

---

### **Opção 3: Verificar Permissões no Dashboard**

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/general
2. Verifique se você é **Owner** ou **Admin** do projeto
3. Se não for, peça para o owner te dar acesso

---

## 💡 Recomendação

**Use o SQL Editor** - é mais simples, mais rápido e não depende de configurações do CLI!

Veja `GUIA_RAPIDO_APLICAR_MIGRACOES.md` para o passo a passo completo.

