# 🔄 Desconectar e Reconectar Supabase CLI

**Objetivo**: Conectar na conta correta e verificar todas as tabelas/SQLs no Cloud

---

## 📋 Passo a Passo

### **Passo 1: Desconectar da Conta Atual**

Execute no terminal e confirme com `y`:

```bash
supabase logout
```

Quando perguntar `Do you want to log out?`, digite `y` e pressione Enter.

---

### **Passo 2: Conectar na Conta Correta**

Execute:

```bash
supabase login
```

Isso abrirá o navegador para você fazer login com a conta que tem acesso ao projeto `crpzkppsriranmeumfqs`.

---

### **Passo 3: Linkar o Projeto**

Após fazer login, execute:

```bash
supabase link --project-ref crpzkppsriranmeumfqs --password "3#t},#$fOmC2£2M=./EY_2tm"
```

**Nota**: Use aspas duplas ao redor da senha por causa dos caracteres especiais.

---

### **Passo 4: Verificar Conexão**

```bash
supabase status
```

Se mostrar URLs do Cloud (não local), está conectado corretamente!

---

### **Passo 5: Verificar Schema Atual no Cloud**

Após conectar, vamos verificar todas as tabelas e SQLs:

```bash
# Ver todas as tabelas
supabase db pull --schema public

# Ou usar SQL direto
supabase db execute "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
```

---

## 🔍 Próximos Passos Após Conectar

1. ✅ **Listar todas as tabelas** no Cloud
2. ✅ **Verificar estrutura** de cada tabela
3. ✅ **Comparar com migrações locais**
4. ✅ **Identificar erros e inconsistências**
5. ✅ **Criar correções** se necessário

---

**Execute o logout primeiro e depois o login!**

