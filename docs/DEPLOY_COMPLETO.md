# 🚀 Deploy - Documentação Completa

**Última atualização:** 2025-01-27  
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Ambientes](#ambientes)
3. [CI/CD](#cicd)
4. [Processo de Deploy](#processo-de-deploy)
5. [Vercel](#vercel)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O projeto está configurado para deploy automático via **Vercel** com CI/CD completo via GitHub Actions.

---

## 🌍 Ambientes

### Local

Desenvolvimento local com Supabase local ou cloud.

```bash
npm run dev
```

### Homologação

Ambiente de staging (se configurado).

### Produção

Ambiente de produção em produção.

---

## 🔄 CI/CD

### Workflow

O workflow de CI está em `.github/workflows/ci.yml` e inclui:

1. **Lint:** Verificação de código
2. **Type Check:** Verificação de tipos
3. **Tests:** Execução de testes
4. **Coverage:** Geração de cobertura
5. **Build:** Build de produção

### Deploy Automático

- **Push para main:** Deploy automático em staging
- **Production:** Deploy em produção via dashboard

---

## 📦 Processo de Deploy

### Pré-requisitos

1. Variáveis de ambiente configuradas
2. Build passando localmente
3. Testes passando

### Passo a Passo

1. **Commit e Push:**
   ```bash
   git add .
   git commit -m "feat: nova feature"
   git push origin main
   ```

2. **CI/CD:**
   - GitHub Actions executa automaticamente
   - Build é testado
   - Se passar, deploy automático

3. **Verificação:**
   - Verificar deploy no Vercel
   - Testar funcionalidades
   - Verificar logs

### Rollback

No Vercel Dashboard:
1. Acesse Deployments
2. Selecione deploy anterior
3. Clique em "Promote to Production"

---

## ☁️ Vercel

### Configuração

Arquivo `vercel.json` contém:
- Headers de segurança
- Rewrites para SPA
- Cache strategy

### Variáveis de Ambiente

Configure no Vercel Dashboard:
- Settings → Environment Variables

### Custom Domain

Configure em:
- Settings → Domains

---

## 🔧 Troubleshooting

### Build Falha

1. Verificar logs no Vercel
2. Testar build local: `npm run build`
3. Verificar variáveis de ambiente

### Erros em Produção

1. Verificar logs no Vercel
2. Verificar variáveis de ambiente
3. Verificar Supabase connection

---

## 📚 Referências

- [Vercel Documentation](https://vercel.com/docs)
- [README Principal](../README.md)

---

**Fim da Documentação**

