# 🔗 Linkar Projeto Supabase via CLI

**Project ID Correto**: `crpzkppsriranmeumfqs`

---

## ⚠️ Problema Atual

O CLI não está conseguindo linkar automaticamente. Isso pode acontecer por:

1. **Conta não logada** no CLI
2. **Permissões insuficientes** na conta
3. **Precisa da senha do banco** para linkar

---

## 🔧 Soluções

### **Opção 1: Fazer Login Novamente**

```bash
supabase login
```

Isso abrirá o navegador para autenticar.

---

### **Opção 2: Linkar com Senha do Banco**

```bash
supabase link --project-ref crpzkppsriranmeumfqs --password SUA_SENHA_DO_BANCO
```

**Onde encontrar a senha**:
1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/database
2. Em **Database Password**, clique em **Reset Database Password** ou veja a senha atual
3. Use essa senha no comando acima

---

### **Opção 3: Aplicar Migrações via SQL Editor** (Mais Simples)

Se o link não funcionar, você pode aplicar as migrações diretamente:

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql
2. Execute cada migração na ordem (veja `GUIA_RAPIDO_APLICAR_MIGRACOES.md`)

---

## ✅ Verificar se Está Linkado

Após linkar, verifique:

```bash
supabase status
```

Se mostrar URLs do Cloud (não local), está linkado corretamente.

---

**Recomendação**: Se o link não funcionar, use o **SQL Editor** que é mais simples e direto!

