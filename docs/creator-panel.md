## Painel do Criador (/admin/creator)

### Como rodar local
```
NIM_API_KEY=...
NIM_BASE_URL=https://api.nvidia.com/v1
NIM_DEFAULT_MODEL=llama-3.1-70b
npm run dev
```

### Endpoints
- SSE: `/api/admin/creator/stream` (header `x-admin: true`)
- List: `/api/admin/creator/list`
- Ack/Resolve: `/api/admin/creator/ack`
- Evolution: `/api/admin/creator/evolution`

### Índices recomendados (Supabase/Postgres)
```
CREATE INDEX IF NOT EXISTS idx_creator_alerts_status_created_at 
  ON creator_alerts(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at 
  ON admin_actions(created_at DESC);
```

### Segurança
- Apenas ADMIN deve ter acesso (placeholder header, integrar com auth real).
- Nenhuma ação automática: recomendações são somente leitura; aceitar/ignorar gera admin_action.

### Eventos consumidos
- `ai.creator-alert`, `ai.creator-insight`, `ai.creator-recommendation`, `ai.creator-roadmap`
- Evolução: `ai.evolution-*`

### Migrations
- `db/migrations/0001_create_creator_alerts.sql`
- `db/migrations/0002_create_admin_actions.sql`

### Testes
- `node scripts/run-creator-tests.js`
- `node scripts/mode-deus-tests/run-evolution-expansion-tests.js`

### Deploy checklist
- Aplicar migrations em ambiente seguro.
- Configurar variáveis de ambiente (NIM/Gemini/DB).
- Garantir CORS/CSRF e autenticação admin nas rotas.

