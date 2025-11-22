# 🔧 Configuração do Modo Híbrido Supabase - Passo a Passo

**Data**: Janeiro 2025  
**Status**: ⚙️ **EM CONFIGURAÇÃO**

---

## ✅ Passo 1: Supabase CLI - VERIFICADO

✅ **Supabase CLI instalado**: v2.33.9  
⚠️ **Versão mais nova disponível**: v2.58.5 (pode atualizar depois)

---

## ✅ Passo 2: Supabase Local - INICIALIZADO

✅ **Supabase local está rodando**

**Credenciais Locais Obtidas**:
```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

---

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

### **Atualizar arquivo `.env`**

Adicione ou atualize as seguintes variáveis no seu arquivo `.env`:

```env
# ============================================
# CLOUD - Supabase Cloud (Auth em modo híbrido)
# ============================================
VITE_SUPABASE_CLOUD_URL=https://crpzkppsriranmeumfqs.supabase.co
VITE_SUPABASE_CLOUD_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM

# ============================================
# LOCAL - Supabase CLI/Docker (Data em modo híbrido)
# ============================================
VITE_SUPABASE_LOCAL_URL=http://127.0.0.1:54321
VITE_SUPABASE_LOCAL_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# ============================================
# MODE - Modo de operação (cloud, local, hybrid)
# ============================================
# VITE_SUPABASE_MODE=hybrid  # Será definido automaticamente pelos presets
```

**Nota**: As chaves acima foram obtidas do status do Supabase local. Use essas mesmas chaves no seu `.env`.

---

## 📋 Próximos Comandos a Executar

Após atualizar o `.env`, execute:

```bash
# 1. Gerar presets de ambiente
npm run env:generate

# 2. Ativar modo híbrido
npm run env:hybrid

# 3. Verificar configuração
cat .env.local | grep VITE_SUPABASE_MODE

# 4. Iniciar desenvolvimento em modo híbrido
npm run dev:hybrid
```

---

## 🔍 Verificação

Para verificar se está funcionando:

1. **Verificar modo ativo**:
   ```bash
   cat .env.local | grep VITE_SUPABASE_MODE
   ```
   Deve mostrar: `VITE_SUPABASE_MODE=hybrid`

2. **Verificar clientes no código**:
   - Abra o console do navegador ao iniciar `npm run dev:hybrid`
   - Deve ver: `[Supabase] Mode: hybrid`

3. **Testar autenticação**:
   - Login deve usar cloud (supabaseAuth)
   - Queries devem usar local (supabaseData)

---

## 🐛 Troubleshooting

### Erro: "Missing cloud credentials"
- Verifique se `VITE_SUPABASE_CLOUD_URL` e `VITE_SUPABASE_CLOUD_ANON_KEY` estão no `.env`

### Erro: "Missing local credentials"
- Verifique se `VITE_SUPABASE_LOCAL_ANON_KEY` está no `.env`
- Execute `npm run supabase:status` para obter a chave local

### Erro: "Connection refused on port 54321"
- Execute `npm run supabase:start` para iniciar o Supabase local

---

**Última atualização**: Janeiro 2025

