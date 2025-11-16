# 📚 Azuria - Índice Completo de Documentação

Bem-vindo à documentação completa do Azuria! Este índice organiza toda a documentação técnica, guias de usuário e referências de API.

---

## 🚀 Início Rápido

**Novo no Azuria?** Comece por aqui:

1. [README Principal](../README.md) - Visão geral do projeto
2. [Guia de Instalação](../README.md#quick-start) - Como rodar o projeto
3. [Arquitetura](./ARCHITECTURE.md) - Entenda a estrutura
4. [Guia do Usuário](./USER_GUIDE.md) - Como usar a plataforma

---

## 🧮 Calculadoras

### Calculadora Avançada
**Documentação:** [ADVANCED_CALCULATOR.md](./ADVANCED_CALCULATOR.md)  
**Acesso:** `/calculadora-avancada`

Precificação profissional para marketplaces com wizard em 3 etapas, cálculo em tempo real, simulação de cenários, exportação PDF e histórico.

### Calculadora Tributária
**Documentação:** [TAX_CALCULATOR.md](./TAX_CALCULATOR.md)

Análise fiscal completa com Simples Nacional, Lucro Presumido e Lucro Real. Comparação automática e recomendação do melhor regime.

---

## 🏪 Sistema Multi-Marketplace

**Documentação:** [MARKETPLACE.md](./MARKETPLACE.md)  
**Acesso:** `/marketplace`

Gestão centralizada de vendas em 30+ marketplaces (3 ativos: Mercado Livre, Amazon, Shopee). Dashboard unificado com métricas consolidadas.

---

## 💳 Sistemas de Pagamento

### Stripe (Ativo)
**Documentação:** [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md)  
**Quick Start:** [STRIPE_README.md](../STRIPE_README.md)  
**Checklist:** [STRIPE_SETUP_CHECKLIST.md](../STRIPE_SETUP_CHECKLIST.md)

Sistema de assinaturas completo com Checkout Session, Customer Portal e Webhooks.

### Mercado Pago (Planejado)

**Primeiro acesso?** Leia nesta ordem:

1. [MERCADOPAGO_README.md](../MERCADOPAGO_README.md) - Visão geral e quick start
2. [EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md](../EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md) - Checklist de deploy
3. [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md) - Guia detalhado

---

## 📁 Estrutura Completa - Mercado Pago

### 1. Código Fonte (Edge Functions)

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| `supabase/functions/_shared/types.ts` | Tipos TypeScript e configuração de planos | 224 |
| `supabase/functions/_shared/utils.ts` | Utilitários (auth, API calls, logs) | 118 |
| `supabase/functions/create-subscription/index.ts` | Cria assinatura recorrente | 145 |
| `supabase/functions/create-payment-preference/index.ts` | Cria pagamento único | 143 |
| `supabase/functions/cancel-subscription/index.ts` | Cancela assinatura | 102 |
| `supabase/functions/mercadopago-webhook/index.ts` | Processa webhooks do MP | 233 |

**Total**: 965 linhas de código TypeScript

### 2. Configuração

| Arquivo | Descrição |
|---------|-----------|
| `supabase/functions/deno.json` | Configuração do Deno Runtime |
| `supabase/functions/.env.example` | Exemplo de variáveis de ambiente |

### 3. Documentação Técnica

| Documento | Páginas | Público-Alvo | Conteúdo |
|-----------|---------|--------------|----------|
| [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md) | 8 | Desenvolvedores | Guia completo de deploy com comandos e troubleshooting |
| [EDGE_FUNCTIONS_USAGE.md](./EDGE_FUNCTIONS_USAGE.md) | 10 | Desenvolvedores | Exemplos de código e integração com frontend |
| [ARCHITECTURE_DIAGRAM.md](../ARCHITECTURE_DIAGRAM.md) | 9 | Arquitetos/Devs | Diagramas de arquitetura e fluxos |

### 4. Documentação Gerencial

| Documento | Páginas | Público-Alvo | Conteúdo |
|-----------|---------|--------------|----------|
| [EDGE_FUNCTIONS_SUMMARY.md](../EDGE_FUNCTIONS_SUMMARY.md) | 6 | Gerentes | Resumo executivo com métricas |
| [MERCADOPAGO_EDGE_FUNCTIONS_COMPLETE.md](../MERCADOPAGO_EDGE_FUNCTIONS_COMPLETE.md) | 12 | Técnicos/Gerentes | Documentação técnica completa |

### 5. Guias Operacionais

| Documento | Páginas | Público-Alvo | Conteúdo |
|-----------|---------|--------------|----------|
| [EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md](../EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md) | 7 | Operações | Checklist passo a passo para deploy |
| [MERCADOPAGO_README.md](../MERCADOPAGO_README.md) | 8 | Todos | Visão geral e quick start |
| [supabase/functions/README.md](../supabase/functions/README.md) | 4 | Desenvolvedores | Guia de desenvolvimento local |

### 6. Scripts

| Script | Descrição | Uso |
|--------|-----------|-----|
| `scripts/validate-edge-functions.mjs` | Valida configuração das Edge Functions | `npm run validate:edge-functions` |

---

## 🗺️ Navegação por Cenário

### Cenário 1: Fazer o Deploy Inicial

1. [MERCADOPAGO_README.md](../MERCADOPAGO_README.md) - Entender o sistema
2. [EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md](../EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md) - Seguir checklist
3. [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md) - Comandos detalhados

### Cenário 2: Desenvolver/Modificar

1. [EDGE_FUNCTIONS_USAGE.md](./EDGE_FUNCTIONS_USAGE.md) - Ver exemplos
2. [supabase/functions/README.md](../supabase/functions/README.md) - Setup local
3. [ARCHITECTURE_DIAGRAM.md](../ARCHITECTURE_DIAGRAM.md) - Entender arquitetura

### Cenário 3: Troubleshooting

1. [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md#-troubleshooting) - Problemas comuns
2. [EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md](../EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md#-troubleshooting) - Diagnóstico
3. Logs: `supabase functions logs mercadopago-webhook --follow`

### Cenário 4: Apresentar para Stakeholders

1. [EDGE_FUNCTIONS_SUMMARY.md](../EDGE_FUNCTIONS_SUMMARY.md) - Resumo executivo
2. [ARCHITECTURE_DIAGRAM.md](../ARCHITECTURE_DIAGRAM.md) - Diagramas visuais
3. [MERCADOPAGO_EDGE_FUNCTIONS_COMPLETE.md](../MERCADOPAGO_EDGE_FUNCTIONS_COMPLETE.md) - Documentação completa

---

## 📊 Estatísticas

**Documentação Total**: 10 arquivos  
**Páginas de Documentação**: 52 páginas  
**Linhas de Documentação**: 800+ linhas  
**Código TypeScript**: 965 linhas  
**Scripts**: 1 arquivo (145 linhas)  
**Tempo Total de Leitura**: ~2-3 horas  
**Tempo de Deploy**: 15-30 minutos  

---

## 🔍 Busca Rápida

### Por Tópico

**Deploy**:
- [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md)
- [EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md](../EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md)

**Desenvolvimento**:
- [EDGE_FUNCTIONS_USAGE.md](./EDGE_FUNCTIONS_USAGE.md)
- [supabase/functions/README.md](../supabase/functions/README.md)

**Arquitetura**:
- [ARCHITECTURE_DIAGRAM.md](../ARCHITECTURE_DIAGRAM.md)
- [MERCADOPAGO_EDGE_FUNCTIONS_COMPLETE.md](../MERCADOPAGO_EDGE_FUNCTIONS_COMPLETE.md)

**Operações**:
- [EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md](../EDGE_FUNCTIONS_DEPLOY_CHECKLIST.md)
- [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md#-monitoramento)

### Por Palavras-chave

- **Webhook**: [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md#configurar-webhook)
- **Secrets**: [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md#configurar-variáveis)
- **Teste**: [EDGE_FUNCTIONS_USAGE.md](./EDGE_FUNCTIONS_USAGE.md#-testar-localmente)
- **Logs**: [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md#-monitoramento)
- **Segurança**: [ARCHITECTURE_DIAGRAM.md](../ARCHITECTURE_DIAGRAM.md#-camadas-de-segurança)
- **Troubleshooting**: [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md#-troubleshooting)

---

## ✅ Validação

Antes de começar, execute:

```bash
npm run validate:edge-functions
```

Isso garante que todos os arquivos estão presentes e corretos.

---

## 🆘 Ajuda

**Dúvidas sobre deploy?**  
→ [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md)

**Dúvidas sobre código?**  
→ [EDGE_FUNCTIONS_USAGE.md](./EDGE_FUNCTIONS_USAGE.md)

**Dúvidas sobre arquitetura?**  
→ [ARCHITECTURE_DIAGRAM.md](../ARCHITECTURE_DIAGRAM.md)

**Problemas técnicos?**  
→ [EDGE_FUNCTIONS_DEPLOY.md](./EDGE_FUNCTIONS_DEPLOY.md#-troubleshooting)

---

## 📝 Changelog

### v1.0.0 (Janeiro 2025)

- ✅ Criação inicial de todas as Edge Functions
- ✅ Documentação completa (10 arquivos)
- ✅ Script de validação
- ✅ Exemplos de integração
- ✅ Diagramas de arquitetura
- ✅ Checklist de deploy

---

**Última atualização**: Janeiro 2025  
**Versão da documentação**: 1.0.0  
**Mantido por**: Equipe Azuria
