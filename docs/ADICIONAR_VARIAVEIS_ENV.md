# 📝 Adicionar Variáveis ao .env para Modo Híbrido

**Ação Necessária**: Adicionar manualmente ao arquivo `.env`

---

## 🔑 Variáveis a Adicionar

Abra o arquivo `.env` na raiz do projeto e adicione as seguintes linhas:

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
```

---

## 📋 Notas Importantes

1. **VITE_SUPABASE_CLOUD_URL**: Já existe no seu `.env` como `VITE_SUPABASE_URL`
2. **VITE_SUPABASE_CLOUD_ANON_KEY**: Já existe no seu `.env` como `VITE_SUPABASE_PUBLISHABLE_KEY`
3. **VITE_SUPABASE_LOCAL_URL**: URL do Supabase local (já configurado)
4. **VITE_SUPABASE_LOCAL_ANON_KEY**: **NOVA** - Chave obtida do `supabase status`

---

## ✅ Após Adicionar

Execute novamente:

```bash
# Regenerar presets com as novas variáveis
npm run env:generate

# Ativar modo híbrido novamente
npm run env:hybrid

# Verificar se está correto
cat .env.local | grep VITE_SUPABASE
```

Deve mostrar:
```
VITE_SUPABASE_MODE=hybrid
VITE_SUPABASE_CLOUD_URL=https://crpzkppsriranmeumfqs.supabase.co
VITE_SUPABASE_CLOUD_ANON_KEY=eyJhbGci...
VITE_SUPABASE_LOCAL_URL=http://127.0.0.1:54321
VITE_SUPABASE_LOCAL_ANON_KEY=eyJhbGci...
```

---

## 🚀 Depois Testar

```bash
npm run dev:hybrid
```

No console do navegador, deve aparecer:
```
[Supabase] Mode: hybrid
```

