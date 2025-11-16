
# 🚀 Guia de Deploy - Azuria

Este guia detalha como fazer o deploy do Azuria em diferentes ambientes, desde desenvolvimento local até produção.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Ambientes](#ambientes)
- [Deploy via Lovable](#deploy-via-lovable)
- [Deploy Manual](#deploy-manual)
- [Configuração do Supabase](#configuração-do-supabase)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Domínio Customizado](#domínio-customizado)
- [Monitoramento](#monitoramento)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O Azuria é uma aplicação React/Vite que pode ser deployada como arquivos estáticos em qualquer servidor web. O backend é fornecido pelo Supabase como BaaS (Backend as a Service).

### Arquitetura de Deploy

```
Frontend (React/Vite)
├── Build estático (dist/)
├── Deploy em CDN/Static Host
└── Domínio customizado

Backend (Supabase)
├── Database PostgreSQL
├── Authentication
├── Edge Functions
├── Storage
└── Real-time subscriptions
```

## 🏗️ Ambientes

### Development (Local)

```bash
# Servidor de desenvolvimento local
npm run dev
# Acesso: http://localhost:5173

# Supabase local (opcional)
supabase start
# Database: http://localhost:54323
```

### Staging (Lovable)

```bash
# Deploy automático no push para main
git push origin main
# URL: https://[project-id].lovable.app
```

### Production

```bash
# Deploy via Lovable Publish
# ou deploy manual em provedor de escolha
npm run build
# Arquivos em ./dist/
```

## 🎨 Deploy via Lovable

### Deploy Automático

O Azuria está configurado para deploy automático via Vercel ou outras plataformas:

1. **Push para Main**: Qualquer push para a branch `main` dispara deploy automático
2. **Preview**: Deploy é disponível em URL de staging
3. **Testes Automáticos**: CI/CD executa testes antes do deploy

### Deploy Manual (Lovable)

1. **Acesse o Dashboard**: Entre no projeto no Lovable
2. **Botão Publish**: Clique em "Publish" no canto superior direito
3. **Configurações**: Ajuste configurações se necessário
4. **Deploy**: Confirme o deploy para produção

### Configurações no Lovable

```typescript
// lovable.config.ts (se existir)
export default {
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true
  },
  deploy: {
    provider: 'lovable',
    customDomain: 'precifica.app', // se configurado
    headers: {
      '/*': {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    }
  }
};
```

## 🔧 Deploy Manual

### Preparação do Build

```bash
# 1. Clone o repositório
git clone <repository-url>
cd precifica-plus

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.production
# Edite .env.production com valores de produção

# 4. Execute o build
npm run build

# 5. Arquivos estáticos estão em ./dist/
ls -la dist/
```

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Ou via GitHub integration
# Conecte repositório no dashboard da Vercel
```

#### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "app/**/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Ou via Git integration
# Conecte repositório no dashboard da Netlify
```

#### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/service-worker.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### GitHub Pages

```bash
# 1. Instalar gh-pages
npm install --save-dev gh-pages

# 2. Adicionar scripts ao package.json
{
  "homepage": "https://username.github.io/precifica-plus",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

# 3. Deploy
npm run deploy
```

### Docker

#### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
        
        # Service Worker
        location /service-worker.js {
            root /usr/share/nginx/html;
            add_header Cache-Control "public, max-age=0, must-revalidate";
        }
        
        # Static assets
        location /assets/ {
            root /usr/share/nginx/html;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
    }
}
```

#### Docker Commands

```bash
# Build da imagem
docker build -t precifica-plus .

# Executar container
docker run -p 80:80 precifica-plus

# Com docker-compose
docker-compose up -d
```

## ⚡ Configuração do Supabase

### Supabase Production Setup

1. **Criar Projeto**:
   ```bash
   # Acesse https://supabase.com/dashboard
   # Clique em "New Project"
   # Configure nome, região e senha
   ```

2. **Configurar Database**:
   ```sql
   -- Execute as migrations necessárias
   -- Arquivo: supabase/migrations/*.sql
   ```

3. **Configurar Authentication**:
   ```bash
   # Dashboard > Authentication > Settings
   # Configure provedores (email, Google, etc.)
   # Configure URLs de redirect
   ```

4. **Configurar Edge Functions**:
   ```bash
   # Deploy das Edge Functions
   supabase functions deploy --project-ref your-project-ref
   ```

### Database Migrations

```bash
# Executar migrations na produção
supabase migration up --db-url "postgresql://..."

# Ou via dashboard SQL Editor
# Copie e execute o conteúdo dos arquivos .sql
```

### RLS Policies

Verifique se todas as políticas RLS estão configuradas:

```sql
-- Exemplo de política para calculation_history
CREATE POLICY "Users can view own calculations" 
ON calculation_history FOR SELECT 
USING (auth.uid() = user_id);

-- Listar todas as políticas
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

## 🔐 Variáveis de Ambiente

### Desenvolvimento (.env.local)

```env
# Supabase Local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local-anon-key

# Analytics (opcional em dev)
VITE_GA_MEASUREMENT_ID=G-DEV123456789
```

### Produção (.env.production)

```env
# Supabase Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Google Analytics
VITE_GA_MEASUREMENT_ID=G-PROD123456789

# API Keys (apenas se necessário)
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_MARKETPLACE_API_KEY=your-marketplace-key

# App Config
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### Configuração por Provedor

#### Vercel

```bash
# Via CLI
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Via Dashboard
# https://vercel.com/dashboard > Settings > Environment Variables
```

#### Netlify

```bash
# Via CLI
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"

# Via Dashboard
# https://app.netlify.com > Site Settings > Environment Variables
```

## 🌐 Domínio Customizado

### Configuração no Lovable

1. **Acesse Settings**: Projeto > Settings > Domains
2. **Adicionar Domínio**: Click "Connect Domain"
3. **Configurar DNS**: Aponte seu domínio para Lovable
4. **SSL**: Certificado automático via Let's Encrypt

### Configuração DNS

```dns
# Para domínio raiz (precifica.app)
A Record: @ -> IP_DO_PROVEDOR

# Para subdomínio (app.precifica.app)  
CNAME: app -> your-project.lovable.app

# Exemplo Cloudflare
Type: CNAME
Name: app
Content: your-project.lovable.app
TTL: Auto
```

### SSL/TLS

A maioria dos provedores oferece SSL automático:

- **Lovable**: SSL automático via Let's Encrypt
- **Vercel**: SSL automático
- **Netlify**: SSL automático
- **Cloudflare**: SSL através do proxy

## 📊 Monitoramento

### Health Checks

Implemente endpoints de health check:

```typescript
// src/utils/healthCheck.ts
export const healthCheck = async () => {
  const checks = {
    supabase: false,
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION
  };
  
  try {
    // Teste conexão Supabase
    const { data } = await supabase.from('user_profiles').select('count');
    checks.supabase = !!data;
  } catch (error) {
    console.error('Health check failed:', error);
  }
  
  return checks;
};
```

### Performance Monitoring

```typescript
// src/utils/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // Enviar para Google Analytics ou serviço de monitoramento
  console.log('Web Vital:', metric);
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Error Tracking

```typescript
// src/utils/errorTracking.ts
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Enviar para serviço de tracking (Sentry, LogRocket, etc.)
  // trackError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Enviar para serviço de tracking
  // trackError(event.reason);
});
```

## 🔧 Troubleshooting

### Problemas Comuns

#### Build Failures

```bash
# Limpar cache e node_modules
rm -rf node_modules package-lock.json
npm install

# Verificar versões
node --version  # Deve ser >= 18
npm --version   # Deve ser >= 9

# Build local para debug
npm run build -- --mode development
```

#### Routing Issues (404 em refresh)

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
4. **Email**: suporte@precifica.app

**Deploy bem-sucedido! 🚀**
