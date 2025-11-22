# 🚀 Exemplos Práticos - Modo Híbrido

## 📖 Cenários Reais de Uso

### 1️⃣ Desenvolvimento Diário

**Situação:** Você está desenvolvendo uma nova feature e precisa de auth real mas quer dados locais.

```bash
# Manhã (primeira vez)
npm run supabase:start
npm run env:hybrid
npm run dev:hybrid

# Próximas vezes (Supabase já rodando)
npm run dev:hybrid
```

**Benefícios:**
- Login com sua conta real
- Dados locais super rápidos
- Sem custos de desenvolvimento
- Hot reload instantâneo

---

### 2️⃣ Testando OAuth (Google, GitHub)

**Situação:** Você precisa testar integração com Google/GitHub OAuth.

```bash
# Configure o OAuth no Supabase Cloud Dashboard
# Adicione http://localhost:5173 nas URLs de callback

npm run env:hybrid
npm run dev:hybrid

# Clique em "Login com Google"
# ✅ Funciona! Auth via cloud
# ✅ Dados salvos localmente
```

**Vantagens:**
- OAuth só funciona com cloud auth
- Dados de teste ficam no banco local
- Fácil reset: `npm run supabase:reset`

---

### 3️⃣ Demo para Cliente

**Situação:** Você vai apresentar o projeto para um cliente.

```bash
# Prepare dados de demonstração
npm run supabase:reset
# Edite supabase/seed.sql com dados bonitos

npm run env:hybrid
npm run build
npm run preview

# Apresente em http://localhost:4173
```

**Benefícios:**
- Performance máxima (dados locais)
- Auth real se cliente quiser testar login
- Sem custos durante apresentação
- Dados controlados (seed)

---

### 4️⃣ Testes de Integração

**Situação:** Rodando testes automatizados.

```bash
# setup-test.ts
import { execSync } from 'child_process';

beforeAll(() => {
  // Garante modo híbrido
  execSync('npm run env:hybrid', { stdio: 'inherit' });
  
  // Reset do banco local
  execSync('npm run supabase:reset', { stdio: 'inherit' });
});

# Rodar testes
npm run test
```

**Vantagens:**
- Testes isolados (banco local limpo)
- Auth real se necessário
- Rápido (sem latência de rede)
- Reproduzível

---

### 5️⃣ Desenvolvimento Offline (Parcial)

**Situação:** Você está no avião/café sem WiFi confiável.

```bash
# Antes de ficar offline:
npm run env:local  # ⚠️ Muda para local puro
npm run dev:local

# Agora você pode desenvolver:
# ✅ Dados funcionam
# ❌ Auth não funciona (precisa cloud)
# ❌ OAuth não funciona
```

**Quando usar:**
- Viagens longas
- WiFi instável
- Trabalho com APIs/dados apenas

**Quando voltar online:**
```bash
npm run env:hybrid  # Volta para híbrido
```

---

### 6️⃣ Debug de Queries SQL

**Situação:** Você precisa otimizar queries ou debug de RLS policies.

```bash
npm run env:hybrid
npm run dev:hybrid

# Em outro terminal:
npm run supabase:status

# Conecte no banco local:
psql -h localhost -p 54322 -U postgres

# Execute queries manualmente
SELECT * FROM calculation_history;
```

**Vantagens:**
- Acesso direto ao PostgreSQL local
- Pode executar EXPLAIN ANALYZE
- Testar policies RLS
- Ver logs de queries

---

### 7️⃣ Sincronizar Schema

**Situação:** O schema da cloud mudou e você quer atualizar o local.

```bash
# Pull schema da cloud
npm run supabase:pull

# Aplica no banco local
npm run supabase:reset

# Continua desenvolvimento
npm run env:hybrid
npm run dev:hybrid
```

**Quando fazer:**
- Depois de migrations na cloud
- Novo membro da equipe
- Após mudanças no schema
- Semanalmente (boa prática)

---

### 8️⃣ Trocar Rapidamente Entre Modos

**Situação:** Você quer comparar comportamento entre cloud e local.

```bash
# Teste com cloud
npm run env:cloud
npm run dev

# Pare (Ctrl+C)

# Teste com híbrido
npm run env:hybrid
npm run dev:hybrid

# Pare (Ctrl+C)

# Teste com local puro
npm run env:local
npm run dev:local
```

**Uso:**
- Debugging
- Performance comparison
- Validação de features

---

### 9️⃣ Setup de Novo Desenvolvedor

**Situação:** Um novo dev entra no time.

```bash
# 1. Clone e instale
git clone <repo>
cd azuria
npm install

# 2. Configure cloud credentials
# Peça ao lead as credenciais cloud
# Adicione ao .env:
# VITE_SUPABASE_CLOUD_URL=...
# VITE_SUPABASE_CLOUD_ANON_KEY=...

# 3. Inicie local
npm run supabase:start

# 4. Copie a local anon key
npm run supabase:status
# Adicione ao .env:
# VITE_SUPABASE_LOCAL_ANON_KEY=...

# 5. Gere presets
npm run env:generate

# 6. Ative híbrido
npm run env:hybrid

# 7. Rode!
npm run dev:hybrid
```

---

### 🔟 CI/CD Pipeline

**Situação:** Configurar GitHub Actions.

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install
        run: npm ci
      
      - name: Start Supabase
        run: npm run supabase:start
      
      - name: Setup Hybrid Mode
        run: |
          npm run env:hybrid
      
      - name: Run Tests
        run: npm test
      
      - name: Stop Supabase
        run: npm run supabase:stop
```

---

## 🎓 Dicas Avançadas

### Múltiplos Ambientes Locais

```bash
# .env.hybrid.staging (para staging)
VITE_SUPABASE_MODE=hybrid
VITE_SUPABASE_CLOUD_URL=https://staging.supabase.co
VITE_SUPABASE_CLOUD_ANON_KEY=staging-key
VITE_SUPABASE_LOCAL_URL=http://localhost:54321
VITE_SUPABASE_LOCAL_ANON_KEY=local-key

# Usar:
cp .env.hybrid.staging .env.local
npm run dev
```

### Automação com Scripts

```bash
# scripts/dev-quick.sh
#!/bin/bash
npm run supabase:start
npm run env:hybrid
npm run dev:hybrid
```

```bash
chmod +x scripts/dev-quick.sh
./scripts/dev-quick.sh
```

### Validação de Modo

```typescript
// src/utils/validateMode.ts
export function getCurrentMode() {
  const mode = import.meta.env.VITE_SUPABASE_MODE;
  console.log(`🔧 Modo atual: ${mode}`);
  
  if (mode === 'hybrid') {
    console.log('☁️ Auth: Cloud');
    console.log('🏠 Data: Local');
  }
  
  return mode;
}

// Use no App.tsx
import { getCurrentMode } from './utils/validateMode';
getCurrentMode();
```

### Debug de Modo

```typescript
// src/integrations/supabase/debug.ts
export function debugSupabaseConfig() {
  const mode = import.meta.env.VITE_SUPABASE_MODE;
  
  console.group('🔍 Supabase Config');
  console.log('Mode:', mode);
  console.log('Cloud URL:', import.meta.env.VITE_SUPABASE_CLOUD_URL);
  console.log('Local URL:', import.meta.env.VITE_SUPABASE_LOCAL_URL);
  console.log('Has Cloud Key:', !!import.meta.env.VITE_SUPABASE_CLOUD_ANON_KEY);
  console.log('Has Local Key:', !!import.meta.env.VITE_SUPABASE_LOCAL_ANON_KEY);
  console.groupEnd();
}

// Chame em dev
if (import.meta.env.DEV) {
  debugSupabaseConfig();
}
```

---

## 🚨 Erros Comuns e Soluções

### Erro: "Failed to fetch"

```bash
# Causa: Supabase local não está rodando
# Solução:
npm run supabase:start
```

### Erro: "Invalid JWT"

```bash
# Causa: Chave local errada ou expirada
# Solução:
npm run supabase:status  # copie nova anon key
# Atualize .env
npm run env:generate
npm run env:hybrid
```

### Erro: "User not found in database"

```bash
# Causa: Usuário existe na cloud mas não no banco local
# Solução A: Criar trigger automático (ver supabase/functions.sql)
# Solução B: Reset e seed
npm run supabase:reset
```

### Warning: "Supabase mode is 'hybrid' but..."

```bash
# Causa: Configuração incompleta
# Solução:
npm run env:generate  # regenera todos os presets
npm run env:hybrid    # reaplica modo híbrido
```

---

## 📚 Recursos Úteis

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Local Development Guide](https://supabase.com/docs/guides/local-development)
- [Auth Docs](https://supabase.com/docs/guides/auth)

---

**💡 Dica:** Adicione este arquivo aos seus bookmarks para referência rápida!
