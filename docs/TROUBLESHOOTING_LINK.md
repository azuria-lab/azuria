# 🔧 Troubleshooting: Link do Projeto

**Problema**: Comando `supabase link` não está funcionando

---

## 🔍 Possíveis Causas

### 1. **Senha com Caracteres Especiais**
A senha contém caracteres especiais que podem causar problemas no PowerShell:
- `#`, `}`, `,`, `$`, `£`, `=`, `/`

**Solução**: Use aspas duplas ou simples ao redor da senha:
```powershell
supabase link --project-ref crpzkppsriranmeumfqs --password "3#t},#$fOmC2£2M=./EY_2tm"
```

### 2. **Projeto Não Encontrado**
O project-ref pode estar incorreto ou você não tem acesso.

**Verificar**: 
```bash
supabase projects list
```

### 3. **Permissões Insuficientes**
Sua conta pode não ter permissão para linkar o projeto.

**Solução**: Verifique se você é owner/admin do projeto no Dashboard.

---

## ✅ Soluções Alternativas

### **Opção A: Usar SQL Editor** (Mais Simples)

Se o link não funcionar, aplique as migrações diretamente:

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql
2. Execute cada migração na ordem (veja `GUIA_RAPIDO_APLICAR_MIGRACOES.md`)

### **Opção B: Tentar com Token**

1. Obtenha token: https://supabase.com/dashboard/account/tokens
2. Execute:
```powershell
$env:SUPABASE_ACCESS_TOKEN="seu-token"
supabase link --project-ref crpzkppsriranmeumfqs
```

---

**Recomendação**: Se o link continuar falhando, use o **SQL Editor** que é mais direto e confiável.

