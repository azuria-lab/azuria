# 🔐 Guia Completo para PowerShell

**Problema**: PowerShell interpreta caracteres especiais da senha

---

## 📋 Passo a Passo

### **Passo 1: Fazer Login**

Execute no PowerShell:

```powershell
supabase login
```

Isso vai abrir o navegador para você fazer login.

---

### **Passo 2: Linkar Projeto (Método Correto para PowerShell)**

**Opção A: Usar Variável** (Recomendado)

```powershell
$senha = '3#t},#$fOmC2£2M=./EY_2tm'
supabase link --project-ref crpzkppsriranmeumfqs --password $senha
```

**Opção B: Usar Aspas Simples**

```powershell
supabase link --project-ref crpzkppsriranmeumfqs --password '3#t},#$fOmC2£2M=./EY_2tm'
```

**Opção C: Usar Aspas Duplas com Escape**

```powershell
supabase link --project-ref crpzkppsriranmeumfqs --password "3#t`},`#$fOmC2£2M=./EY_2tm"
```

---

### **Passo 3: Verificar Conexão**

```powershell
supabase status
```

Se mostrar URLs do Cloud (não `127.0.0.1`), está conectado! ✅

---

## ⚠️ Por Que o Erro Aconteceu?

O PowerShell interpreta caracteres especiais como:
- `#` - Comentário
- `}` - Bloco de código
- `,` - Separador
- `$` - Variável

**Solução**: Use aspas simples `'...'` ou variável `$senha`

---

## ✅ Comandos Prontos para Copiar

### **1. Login**
```powershell
supabase login
```

### **2. Linkar (Copie e Cole)**
```powershell
$senha = '3#t},#$fOmC2£2M=./EY_2tm'
supabase link --project-ref crpzkppsriranmeumfqs --password $senha
```

### **3. Verificar**
```powershell
supabase status
```

---

**Execute esses comandos no seu PowerShell!**

