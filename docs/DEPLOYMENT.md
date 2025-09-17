# 🚀 Guia de Deploy - Azuria

Este guia detalha como fazer o deploy do Azuria em diferentes ambientes, desde desenvolvimento local até produção.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Ambientes](#ambientes)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Resolução de Problemas](#resolução-de-problemas)
- [Checklist de Deploy](#-checklist-de-deploy)
- [Suporte](#-suporte)

## Visão Geral

O Azuria é uma aplicação SPA (Single Page Application) construída com Vite + React, servida como conteúdo estático e que consome APIs externas (Supabase e futuras APIs proprietárias). O deploy consiste basicamente em gerar os arquivos estáticos (`npm run build`) e publicá-los em um provedor de hosting que suporte HTTPS e cache eficiente.

## Ambientes

| Ambiente | Objetivo | Domínio / URL (exemplo) |
|----------|----------|--------------------------|
| Local    | Desenvolvimento individual | <http://localhost:5173> |
| Staging  | Validação pré-produção     | <https://staging.azuria.app> |
| Produção | Usuários finais            | <https://app.azuria.app> |

## Variáveis de Ambiente

As variáveis devem iniciar com `VITE_` para serem expostas ao front-end. Configure um arquivo `.env.local` (não commitar) para desenvolvimento:

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
VITE_APP_DOMAIN=azuria.app
VITE_API_BASE_V1=https://api.azuria.app/v1
VITE_API_BASE_V2=https://api.azuria.app/v2
```

Para confirmar carregamento:

```ts
console.log('Env vars', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_APP_DOMAIN: import.meta.env.VITE_APP_DOMAIN
});
```

## Build

```bash
npm run build
# Build de desenvolvimento (mantendo sourcemaps legíveis)
npm run build -- --mode development
```

## Resolução de Problemas

### Routing Issues (404 em refresh)

Configurar redirects para SPA:

```javascript
// Para Vercel - vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

// Para Netlify - _redirects
/*    /index.html   200

// Para Apache - .htaccess
RewriteEngine On
RewriteRule ^(?!.*\.).*$ /index.html [L]
```

#### Environment Variables

```bash
# Verificar se variáveis estão sendo carregadas
console.log('Env vars:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  // Nunca logar chaves secretas em produção!
});

# Variáveis devem começar com VITE_ para serem incluídas no build
```

#### Supabase Connection Issues

```typescript
// Testar conexão
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count');
    
    if (error) throw error;
    console.log('Supabase connected successfully');
  } catch (error) {
    console.error('Supabase connection failed:', error);
  }
};
```

#### PWA Issues

```javascript
// Verificar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('SW registrations:', registrations);
  });
}

// Verificar manifest
console.log('Manifest URL:', '/manifest.json');
fetch('/manifest.json').then(r => r.json()).then(console.log);
```

### Logs e Debug

#### Acessar Logs do Vercel

```bash
# Via CLI
vercel logs [deployment-url]

# Via Dashboard
# https://vercel.com > Project > Functions > View Logs
```

#### Acessar Logs do Netlify

```bash
# Via Dashboard
# https://app.netlify.com > Site > Functions > View Logs
```

#### Supabase Logs

```bash
# Dashboard > Logs > Real-time logs
# ou SQL logs, Auth logs, etc.
```

### Performance Issues

```bash
# Analisar bundle size
npm run build
npx vite-bundle-analyzer dist

# Lighthouse audit
npx lighthouse http://localhost:4173 --view

# Core Web Vitals
# Use Chrome DevTools > Performance
```

## 📝 Checklist de Deploy

### Pré-Deploy

- [ ] **Testes**: Todos os testes passam
- [ ] **Build**: Build local executa sem erros
- [ ] **Env Vars**: Variáveis de produção configuradas
- [ ] **Supabase**: Database e migrations atualizadas
- [ ] **Analytics**: Tracking configurado
- [ ] **Performance**: Bundle size otimizado
- [ ] **Security**: Headers de segurança configurados

### Pós-Deploy

- [ ] **Health Check**: Site carrega corretamente
- [ ] **Functionality**: Funcionalidades principais funcionam
- [ ] **Mobile**: Interface funciona em mobile
- [ ] **PWA**: Service Worker funciona
- [ ] **Analytics**: Eventos sendo trackados
- [ ] **Performance**: Core Web Vitals OK
- [ ] **SEO**: Meta tags corretas
- [ ] **Error Tracking**: Monitoramento ativo

---

## 🆘 Suporte

Para problemas de deploy:

1. **Verificar Logs**: Sempre primeiro passo
2. **GitHub Issues**: Reportar bugs
3. **Discord**: Suporte da comunidade
4. **Email**: <mailto:suporte@azuria.app>

Deploy bem-sucedido! 🚀
