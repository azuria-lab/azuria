# 🔄 Modo Híbrido - Supabase (Cloud Auth + Local Data)

## 📖 Visão Geral

O **modo híbrido** permite que você use o **Supabase Cloud para autenticação** e o **Supabase Local (CLI/Docker) para dados**, oferecendo o melhor dos dois mundos:

✅ **Vantagens:**
- 🔐 Autenticação gerenciada na cloud (recuperação de senha, OAuth, etc)
- ⚡ Desenvolvimento rápido com dados locais
- 💰 Sem custos de queries durante desenvolvimento
- 🔄 Sincronização de usuários entre cloud e local
- 🚀 Deploy fácil: apenas mude para modo cloud

## 🎯 Modos Disponíveis

O projeto suporta três modos de operação:

| Modo | Auth | Data | Uso |
|------|------|------|-----|
| **cloud** | ☁️ Cloud | ☁️ Cloud | Produção, staging |
| **local** | 🏠 Local | 🏠 Local | Dev 100% offline |
| **hybrid** | ☁️ Cloud | 🏠 Local | Dev com auth real |

## 🚀 Início Rápido

### 1️⃣ Iniciar Supabase Local

```bash
# Inicia o Supabase localmente (Docker)
npm run supabase:start

# Verifique o status e anote as credenciais
npm run supabase:status
```

**⚠️ Importante:** Anote o `anon key` exibido no status - você precisará dele!

### 2️⃣ Configurar Credenciais

Edite o arquivo `.env` na raiz do projeto e adicione as credenciais locais:

```env
# ============================================
# LOCAL - Supabase CLI/Docker (Desenvolvimento)
# ============================================
VITE_SUPABASE_LOCAL_URL=http://127.0.0.1:54321
VITE_SUPABASE_LOCAL_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Dica:** Cole a `anon key` obtida no passo anterior.

### 3️⃣ Gerar Presets de Ambiente

```bash
# Gera os arquivos .env.cloud, .env.localdev e .env.hybrid
npm run env:generate
```

Este comando cria automaticamente os três arquivos de preset baseados no seu `.env` principal.

### 4️⃣ Ativar Modo Híbrido

```bash
# Ativa o modo híbrido (copia .env.hybrid para .env.local)
npm run env:hybrid
```

### 5️⃣ Iniciar Desenvolvimento

```bash
# Inicia dev com modo híbrido (já ativa o Supabase local automaticamente)
npm run dev:hybrid
```

## 🔄 Trocar Entre Modos

```bash
# Modo Cloud (produção)
npm run env:cloud
npm run dev:cloud

# Modo Local (desenvolvimento offline)
npm run env:local
npm run dev:local

# Modo Híbrido (auth cloud + data local)
npm run env:hybrid
npm run dev:hybrid
```

## 🛠️ Configuração Manual

Se preferir configurar manualmente, siga estes passos:

### 1. Copiar Template

```bash
cp .env.hybrid.example .env.hybrid
```

### 2. Editar .env.hybrid

```env
VITE_SUPABASE_MODE=hybrid

# Cloud (Auth)
VITE_SUPABASE_CLOUD_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_CLOUD_ANON_KEY=sua-chave-cloud

# Local (Data)
VITE_SUPABASE_LOCAL_URL=http://127.0.0.1:54321
VITE_SUPABASE_LOCAL_ANON_KEY=sua-chave-local
```

### 3. Aplicar Configuração

```bash
node scripts/switch-env.mjs hybrid
```

## 📋 Estrutura de Arquivos

```
.env                    # Configuração principal (fonte)
.env.local              # Configuração ativa (gerada automaticamente)

# Presets (gerados por env:generate)
.env.cloud              # Preset para modo cloud
.env.localdev           # Preset para modo local
.env.hybrid             # Preset para modo híbrido

# Templates (exemplos para referência)
.env.cloud.example
.env.localdev.example
.env.hybrid.example
```

## 🔧 Como Funciona

### Arquitetura do Cliente

O arquivo `src/integrations/supabase/client.ts` exporta três clientes:

```typescript
// Cliente para autenticação
export const supabaseAuth

// Cliente para dados
export const supabaseData

// Cliente legado (para compatibilidade)
export const supabase
```

### Lógica de Modo Híbrido

```typescript
if (MODE === 'hybrid') {
  supabaseAuth  → cloud client (autenticação)
  supabaseData  → local client (queries de dados)
}
```

### Migração de Código

Se você usa o cliente antigo `supabase`, ele continuará funcionando:

```typescript
// Antigo (ainda funciona)
import { supabase } from '@/integrations/supabase/client'

// Novo (recomendado para modo híbrido)
import { supabaseAuth, supabaseData } from '@/integrations/supabase/client'

// Para auth
const { data, error } = await supabaseAuth.auth.signIn(...)

// Para dados
const { data, error } = await supabaseData.from('users').select('*')
```

## ⚠️ Considerações Importantes

### 1. Sincronização de Usuários

Usuários criados na cloud **NÃO existem automaticamente** no banco local. Você tem duas opções:

**Opção A: Trigger Automático**
- Configure um trigger no banco local para criar perfis quando usuários fizerem login
- Veja `supabase/functions.sql` para exemplo

**Opção B: Seed Manual**
- Crie usuários de teste no banco local
- Use `supabase/seed.sql` para popular dados

### 2. Schema Consistency

Mantenha os schemas cloud e local sincronizados:

```bash
# Pull schema da cloud
npm run supabase:pull

# Aplicar migrations localmente
npm run supabase:reset
```

### 3. Edge Functions

Edge Functions só rodam na cloud. Em modo híbrido/local:
- Auth: funciona (cloud)
- Edge Functions: não disponíveis localmente
- RPCs: rodam no banco local

### 4. Storage/Realtime

- **Storage**: apenas na cloud
- **Realtime**: funciona em ambos, mas são instâncias separadas

## 🐛 Troubleshooting

### Erro: "No Supabase config found"

```bash
# Verifique se o modo está configurado
cat .env.local | grep VITE_SUPABASE_MODE

# Regenere os presets
npm run env:generate
npm run env:hybrid
```

### Erro: "Connection refused on port 54321"

```bash
# O Supabase local não está rodando
npm run supabase:start

# Verifique o status
npm run supabase:status
```

### Erro: "Invalid API key"

```bash
# Obtenha a chave correta
npm run supabase:status

# Copie a "anon key" e cole em .env:
# VITE_SUPABASE_LOCAL_ANON_KEY=eyJhbGci...

# Regenere os presets
npm run env:generate
npm run env:hybrid
```

### Auth funciona mas queries falham

Verifique se você está usando o cliente correto:

```typescript
// ❌ Errado em modo híbrido
await supabase.from('users').select()

// ✅ Correto
await supabaseData.from('users').select()
```

### Usuário não tem dados no banco local

```bash
# Reset do banco e aplique seed
npm run supabase:reset

# Ou crie um trigger para criar perfis automaticamente
# Veja supabase/functions.sql
```

## 📚 Recursos Adicionais

- [Documentação Supabase CLI](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Casos de Uso

### Desenvolvimento com Auth Real

```bash
npm run dev:hybrid
```

- Autenticação usando contas reais
- Dados locais para desenvolvimento rápido
- OAuth (Google, GitHub) funciona normalmente

### Testes de Integração

```bash
npm run env:hybrid
npm run test
```

- Auth isolado em cloud (não afeta dev)
- Dados de teste em banco local limpo

### Demo/Staging Local

```bash
npm run env:hybrid
npm run build
npm run preview
```

- Apresente com auth real
- Sem custos de queries
- Performance máxima

## 🔐 Segurança

### Chaves Públicas vs Privadas

- ✅ **anon key**: pode ser commitada (é pública)
- ❌ **service_role key**: NUNCA commite (é privada)

### .gitignore

Os seguintes arquivos NÃO devem ser commitados:

```gitignore
.env.local
.env.cloud
.env.localdev
.env.hybrid
```

Templates (*.example) PODEM ser commitados.

## 📝 Checklist de Setup

- [ ] Supabase local instalado e rodando
- [ ] Credenciais cloud configuradas em `.env`
- [ ] Credenciais local obtidas com `supabase status`
- [ ] `.env` atualizado com `VITE_SUPABASE_LOCAL_*`
- [ ] Executado `npm run env:generate`
- [ ] Executado `npm run env:hybrid`
- [ ] Schema local sincronizado com cloud
- [ ] Teste de login/signup funcionando
- [ ] Queries de dados retornando resultados

## 🆘 Suporte

Se encontrar problemas:

1. Verifique este guia primeiro
2. Consulte a [documentação do Supabase](https://supabase.com/docs)
3. Veja os logs do Supabase local: `npm run supabase:status`
4. Abra uma issue no repositório

---

**Desenvolvido com ❤️ pela equipe Azuria**
