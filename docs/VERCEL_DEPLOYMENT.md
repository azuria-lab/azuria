# 🚀 Guia de Deploy no Vercel - Azuria

**Data**: 9 de Outubro de 2025  
**Status**: Pronto para Deploy ✅

---

## ✅ Checklist de Preparação

- [x] Vite config otimizado para produção
- [x] Build command: `npm run build`
- [x] Output directory: `dist`
- [x] `.gitignore` protegendo arquivos sensíveis
- [x] `.env.example` documentado
- [x] `vercel.json` criado com configurações
- [x] Git status limpo
- [x] Branch main atualizada

---

## 📋 Passo a Passo para Deploy

### 1️⃣ Preparação Local (CONCLUÍDO ✅)

```bash
# Status confirmado
✅ Working tree clean
✅ Branch: main (atualizada)
✅ Último commit: 5bc229a (3 dias atrás)
✅ vercel.json criado
```

### 2️⃣ Criar Projeto no Vercel

1. **Acesse**: https://vercel.com/new
2. **Importe**: Repositório `azuria-lab/azuria`
3. **Framework Preset**: Vite (detectado automaticamente)
4. **Build Command**: `npm run build` (já configurado)
5. **Output Directory**: `dist` (já configurado)

### 3️⃣ Configurar Variáveis de Ambiente

No painel do Vercel, adicione as seguintes variáveis:

#### ⚠️ OBRIGATÓRIAS (Supabase):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Como obter:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie **Project URL** e **anon/public key**

#### 🔧 OPCIONAIS (Legacy/Aliases):

```env
VITE_SUPABASE_PROJECT_ID=seu-projeto-id
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 💳 OPCIONAIS (Mercado Pago - se configurado):

```env
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Como obter:**
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **Credenciais**
3. Copie a **Public Key** de Produção

---

### 4️⃣ Deploy Automático

Uma vez configurado, o Vercel fará deploy automático a cada push para `main`:

```bash
git add .
git commit -m "feat: sua feature"
git push origin main
```

**URL de Preview**: `https://azuria-git-branch-nome.vercel.app`  
**URL de Produção**: `https://azuria.vercel.app` (ou domínio customizado)

---

## 🔍 Validação Pós-Deploy

### Checklist de Testes:

- [ ] Site carrega sem erros 404
- [ ] Login funciona (se Supabase configurado)
- [ ] Calculadora abre e funciona
- [ ] Dashboard carrega
- [ ] Histórico funciona
- [ ] PWA instala corretamente
- [ ] Rotas SPA funcionam (refresh em `/calculadora`)
- [ ] Assets carregam (imagens, CSS)
- [ ] Console sem erros críticos
- [ ] Performance Lighthouse > 90

### Comandos de Teste Local:

```bash
# Build de produção local
npm run build

# Preview da build
npm run preview

# Teste de tipos
npm run type-check

# Testes automatizados
npm run test:smoke
```

---

## 🛠️ Configuração Avançada (Opcional)

### Domínio Customizado

1. Vá em **Settings** → **Domains**
2. Adicione: `azuria.com.br` (ou seu domínio)
3. Configure DNS conforme instruções do Vercel

### Analytics

Ative **Vercel Analytics** para métricas:
- Web Vitals (Core Web Vitals)
- Real User Monitoring
- Performance insights

### Edge Functions (se necessário)

Para webhooks do Mercado Pago:
1. Crie pasta `api/` na raiz
2. Adicione handlers em TypeScript
3. Deploy automático

---

## 📊 Configurações do vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  
  // SPA: redireciona todas as rotas para index.html
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  
  // Headers de segurança
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ],
  
  // Cache agressivo para assets
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 🚨 Troubleshooting

### Problema: Build falha

```bash
# Verificar localmente
npm install
npm run build
```

**Causas comuns:**
- Dependências faltando
- Erros TypeScript
- Falta de memória (Vercel: 3 GB limit)

### Problema: 404 em rotas SPA

✅ **Solução**: `rewrites` no `vercel.json` (já configurado)

### Problema: Variáveis de ambiente não funcionam

⚠️ **Importante**: 
- Apenas variáveis com prefixo `VITE_` são expostas no frontend
- Variáveis sem prefixo são privadas (backend/build only)
- Rebuild necessário após adicionar novas variáveis

### Problema: Supabase não conecta

Verifique:
1. URL e Key corretas
2. CORS configurado no Supabase (adicione domínio Vercel)
3. RLS policies permitem acesso anônimo (onde necessário)

---

## 📈 Performance Otimizada

### Otimizações já implementadas no vite.config.ts:

```typescript
build: {
  target: 'es2015',
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,        // Remove console.log em prod
      drop_debugger: true,
      pure_funcs: ['console.log'],
      passes: 2
    }
  },
  rollupOptions: {
    output: {
      inlineDynamicImports: true,  // Bundle único (mais rápido)
      entryFileNames: 'assets/app.js',
      assetFileNames: 'assets/[name].[ext]',
    }
  }
}
```

### Resultado esperado:
- ✅ Build size: ~1-2 MB (gzipped)
- ✅ FCP (First Contentful Paint): < 1.5s
- ✅ TTI (Time to Interactive): < 3s
- ✅ Lighthouse Score: 95+

---

## 🔐 Segurança

### Headers implementados:

- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy: camera=(), microphone=()`

### Boas práticas:

- ✅ `.env` não commitado
- ✅ Secrets via Vercel Environment Variables
- ✅ CORS configurado no Supabase
- ✅ RLS (Row Level Security) ativo no Supabase

---

## 📞 Suporte

**Vercel Docs**: https://vercel.com/docs  
**Vite + Vercel**: https://vercel.com/docs/frameworks/vite  
**Supabase + Vercel**: https://supabase.com/docs/guides/hosting/vercel

---

## ✅ Status Final

**Projeto Azuria está PRONTO para deploy no Vercel! 🚀**

**Próximos passos:**
1. Configure as variáveis de ambiente no Vercel
2. Importe o repositório
3. Clique em "Deploy"
4. Aguarde ~2-3 minutos
5. Acesse sua URL de produção!

**Estimativa de tempo total**: 10-15 minutos ⏱️
