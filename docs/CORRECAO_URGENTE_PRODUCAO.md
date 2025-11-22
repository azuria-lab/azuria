# 🚨 CORREÇÃO URGENTE - Produção com Página em Branco

## ❌ Problema

**Site:** https://azuria.app.br
**Status:** Página em branco
**Erro:** `Uncaught Error: supabaseUrl is required`

## 🔍 Causa

As **variáveis de ambiente do Supabase não estão configuradas no Vercel**, causando falha ao inicializar o cliente Supabase.

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### 1️⃣ Configurar Variáveis no Vercel

Acesse: https://vercel.com/azurias-projects-ea27c6b3/azuria/settings/environment-variables

Adicione as seguintes variáveis:

#### Para Modo Cloud (Produção)

```env
VITE_SUPABASE_URL=https://crpzkppsriranmeumfqs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM
```

**OU** (se usar modo híbrido):

```env
VITE_SUPABASE_MODE=cloud
VITE_SUPABASE_CLOUD_URL=https://crpzkppsriranmeumfqs.supabase.co
VITE_SUPABASE_CLOUD_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM
```

### 2️⃣ Configuração no Vercel (Passo a Passo)

1. Acesse https://vercel.com/azurias-projects-ea27c6b3/azuria
2. Vá em **Settings** → **Environment Variables**
3. Para cada variável:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://crpzkppsriranmeumfqs.supabase.co`
   - **Environment:** Marque **Production**, **Preview**, e **Development**
   - Clique em **Add**
4. Repita para `VITE_SUPABASE_ANON_KEY`

### 3️⃣ Forçar Novo Deploy

Após adicionar as variáveis:

**Opção A - Via Web:**
1. Vá em **Deployments**
2. Clique nos 3 pontos do último deploy
3. Clique em **Redeploy**

**Opção B - Via CLI (mais rápido):**
```bash
cd C:\Rômulo\Projetos\azuria
git commit --allow-empty -m "chore: trigger redeploy with env vars"
git push origin main
```

### 4️⃣ Verificar Correção

Após ~2 minutos:
1. Acesse https://azuria.app.br
2. Abra o Console do navegador (F12)
3. Deve aparecer sem erros
4. A aplicação deve carregar normalmente

## 📋 Variáveis Completas Recomendadas

Para um setup completo de produção, adicione também:

```env
# Supabase (Obrigatório)
VITE_SUPABASE_URL=https://crpzkppsriranmeumfqs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM

# App Config (Opcional mas recomendado)
VITE_APP_NAME=Azuria
VITE_APP_URL=https://azuria.app.br

# Analytics (Opcional)
VITE_ENABLE_ANALYTICS=true

# Modo (Opcional - deixar vazio para cloud por padrão)
VITE_SUPABASE_MODE=cloud
```

## 🔧 Alternativa: Via Comando CLI

Se você tiver o Vercel CLI instalado:

```bash
# Adicionar variáveis
vercel env add VITE_SUPABASE_URL
# Cole o valor quando solicitado

vercel env add VITE_SUPABASE_ANON_KEY
# Cole o valor quando solicitado

# Fazer redeploy
vercel --prod
```

## ⚠️ Problema Secundário (CSP)

Após corrigir o Supabase, você pode ter um warning do CSP sobre `wecel.live`. Para corrigir:

Edite `index.html` e adicione na tag `<meta>` do CSP:

```html
<meta http-equiv="Content-Security-Policy" 
      content="... script-src 'self' 'unsafe-inline' 'unsafe-eval' https://wecel.live; ...">
```

Mas isso é secundário - **priorize configurar o Supabase primeiro**!

## 📊 Checklist de Verificação

- [ ] Variáveis adicionadas no Vercel
- [ ] Redeploy realizado
- [ ] Site carregando normalmente
- [ ] Sem erros no console
- [ ] Login funcionando
- [ ] Dashboard acessível

## 🆘 Se Ainda Não Funcionar

1. Verifique se as variáveis foram salvas corretamente no Vercel
2. Confirme que o redeploy foi acionado (deve aparecer um novo deployment)
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Tente em uma aba anônima

---

**Tempo Estimado:** 5 minutos
**Prioridade:** 🔴 CRÍTICA
**Deploy Atual:** Quebrado (página em branco)
**Deploy Após Correção:** ✅ Funcionando

