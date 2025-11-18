# 🔗 Linkar Projeto com Senha do Banco

**Project ID**: `crpzkppsriranmeumfqs`

---

## 📋 Passo a Passo

### **Passo 1: Obter Senha do Banco**

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/database
2. Role até a seção **Database Password**
3. Você verá:
   - Se já tem senha: clique em **Show** ou **Reveal** para ver
   - Se não tem senha: clique em **Reset Database Password** para criar uma nova
4. **Copie a senha** (você precisará dela)

---

### **Passo 2: Linkar Projeto**

Execute no terminal (substitua `SUA_SENHA` pela senha que você copiou):

```bash
supabase link --project-ref crpzkppsriranmeumfqs --password SUA_SENHA
```

**Exemplo**:
```bash
supabase link --project-ref crpzkppsriranmeumfqs --password minhaSenha123
```

---

### **Passo 3: Verificar Conexão**

Após linkar, verifique:

```bash
supabase status
```

Se mostrar URLs do Cloud (não local), está conectado corretamente!

---

### **Passo 4: Aplicar Migrações**

Após linkar com sucesso:

```bash
supabase db push
```

Isso aplicará todas as migrações automaticamente no Cloud.

---

## ⚠️ Notas Importantes

1. **Senha**: A senha é sensível - não compartilhe publicamente
2. **Primeira vez**: Se for a primeira vez linkando, pode pedir confirmação
3. **Erro**: Se der erro, verifique se a senha está correta

---

**Pronto para começar!** Obtenha a senha e execute o comando acima.

