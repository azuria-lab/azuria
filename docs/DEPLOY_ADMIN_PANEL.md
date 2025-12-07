# 🚀 Guia de Deploy - Painel Admin (Modo Deus)

## 📋 Resumo das Mudanças

Este documento descreve o processo de deploy do Painel Admin do Modo Deus, incluindo:
- Painel Admin completo (`/admin/creator`)
- APIs backend para monitoramento
- Migrations do banco de dados
- Integração com Supabase

## ✅ Pré-requisitos

### Variáveis de Ambiente

**Backend:**
- `ADMIN_UID=13e44f17-bdf4-4493-81ab-2a2d6e590181`
- `SUPABASE_URL=<sua-url-supabase>`
- `SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>`

**Frontend:**
- `VITE_ADMIN_UID=13e44f17-bdf4-4493-81ab-2a2d6e590181`
- `VITE_SUPABASE_URL=<sua-url-supabase>`
- `VITE_SUPABASE_ANON_KEY=<sua-anon-key>`

## 📦 Passo 1: Aplicar Migrations no Supabase

Execute as seguintes migrations na ordem:

1. **0001_create_creator_alerts.sql** (se ainda não aplicada)
2. **0002_create_admin_actions.sql** (se ainda não aplicada)
3. **0003_create_creator_evolution.sql** ⭐ NOVA
4. **0004_create_creator_health.sql** ⭐ NOVA

### Como Aplicar

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute cada migration na ordem acima
4. Verifique se as tabelas foram criadas:
   - `creator_alerts`
   - `admin_actions`
   - `creator_evolution_events`
   - `creator_evolution_snapshots`
   - `creator_health`

## 🔧 Passo 2: Configurar Backend Admin API

### Desenvolvimento Local

```bash
npm run dev:admin-api
```

Isso inicia o servidor Express na porta `8081` com as rotas:
- `GET /api/admin/creator/list`
- `GET /api/admin/creator/evolution`
- `GET /api/admin/creator/health`
- `GET /api/admin/creator/stream` (SSE)
- `POST /api/admin/creator/ack`
- `POST /api/admin/creator/copilot`

### Produção

Configure seu servidor de produção para expor essas rotas. O arquivo `scripts/dev-admin-server.ts` pode ser usado como referência.

**Importante:** Em produção, certifique-se de:
- Usar variáveis de ambiente corretas
- Habilitar HTTPS
- Configurar CORS adequadamente
- Validar autenticação admin em todas as rotas

## 🎨 Passo 3: Deploy do Frontend

### Build

```bash
npm run build
```

### Verificar Build

O build deve incluir:
- Rota `/admin/creator` no `App.tsx`
- Componentes em `src/components/creator/`
- Página em `src/pages/admin/creator.tsx`

### Deploy

Siga o processo normal de deploy do seu frontend (Vercel, Netlify, etc.).

## 🧪 Passo 4: Validação Pós-Deploy

### Testar APIs

```bash
# Listar alertas
curl "https://seu-dominio.com/api/admin/creator/list?admin_uid=13e44f17-bdf4-4493-81ab-2a2d6e590181&limit=5"

# Ver evolução
curl "https://seu-dominio.com/api/admin/creator/evolution?admin_uid=13e44f17-bdf4-4493-81ab-2a2d6e590181"

# Ver health
curl "https://seu-dominio.com/api/admin/creator/health?admin_uid=13e44f17-bdf4-4493-81ab-2a2d6e590181"
```

### Testar Painel

1. Acesse `https://seu-dominio.com/admin/creator`
2. Verifique se está autenticado como admin
3. Confirme que os componentes carregam:
   - AlertsList
   - Timeline
   - EvolutionPanel
   - HealthMap
   - RoadmapEditor
   - CopilotPanel

### Testar SSE (Server-Sent Events)

```bash
curl -N "https://seu-dominio.com/api/admin/creator/stream?admin_uid=13e44f17-bdf4-4493-81ab-2a2d6e590181"
```

Você deve receber eventos `heartbeat` a cada 30 segundos.

## 📊 Passo 5: Inserir Dados Iniciais (Opcional)

Para testar o painel com dados reais, insira alguns registros:

### Alertas Críticos

```sql
INSERT INTO creator_alerts (type, severity, message, status)
VALUES 
  ('alert', 'critical', 'Falha no gateway 5xx acima do limite', 'new'),
  ('alert', 'high', 'Latência do Marketplace Sync acima de 250ms', 'new');
```

### Health Modules

```sql
INSERT INTO creator_health (module, health, latency_ms, error_rate)
VALUES 
  ('API Gateway', 'ok', 120, 0.5),
  ('Marketplace Sync', 'warn', 280, 1.2),
  ('Billing Service', 'critical', 350, 5.1),
  ('AI Engine', 'ok', 80, 0.1);
```

### Evolution Events

```sql
INSERT INTO creator_evolution_events (type, payload)
VALUES 
  ('insight', '{"message": "IA sugere revisar latência do Marketplace Sync"}'::jsonb),
  ('pattern', '{"message": "Aumento de erros 5xx no gateway (padrão detectado)"}'::jsonb);
```

## 🔒 Segurança

### Admin Guard

Todas as rotas `/api/admin/creator/*` são protegidas pelo `adminGuard` que:
- Valida o header `x-admin: true`
- Verifica se `x-admin-uid` corresponde ao `ADMIN_UID` configurado
- Retorna 403 se não autorizado

### Recomendações

1. **Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend**
2. Use HTTPS em produção
3. Configure rate limiting nas APIs admin
4. Monitore logs de acesso ao painel
5. Considere adicionar autenticação adicional (2FA) para admin

## 🐛 Troubleshooting

### Painel não carrega

- Verifique se as variáveis de ambiente estão configuradas
- Confirme que o usuário está autenticado
- Verifique o console do navegador para erros

### APIs retornam 403

- Confirme que `ADMIN_UID` está correto
- Verifique se os headers `x-admin` e `x-admin-uid` estão sendo enviados
- Valide que o `adminGuard` está funcionando

### SSE não conecta

- Verifique se o servidor suporta SSE
- Confirme que não há proxy/firewall bloqueando
- Teste com `curl -N` para ver eventos em tempo real

### Dados não aparecem

- Confirme que as migrations foram aplicadas
- Verifique se há dados nas tabelas do Supabase
- Teste as queries diretamente no Supabase SQL Editor

## 📝 Checklist Final

- [ ] Migrations aplicadas no Supabase
- [ ] Variáveis de ambiente configuradas (backend e frontend)
- [ ] Backend admin API rodando em produção
- [ ] Frontend buildado e deployado
- [ ] Rotas `/api/admin/creator/*` acessíveis
- [ ] Painel `/admin/creator` carregando
- [ ] SSE funcionando
- [ ] Dados reais aparecendo (se inseridos)
- [ ] Testes de segurança realizados

## 🎉 Conclusão

Após seguir todos os passos, o Painel Admin do Modo Deus estará totalmente funcional em produção!

Para suporte ou dúvidas, consulte:
- `docs/creator-panel.md` - Documentação técnica do painel
- `src/azuria_ai/core/adminGuard.ts` - Implementação do guard
- `scripts/dev-admin-server.ts` - Servidor de desenvolvimento

