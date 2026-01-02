# ⚡ Configuração Rápida - Google OAuth

**Projeto**: `crpzkppsriranmeumfqs`

---

## 🎯 Passos Essenciais

### 1️⃣ Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**
3. Tipo: **Web application**
4. Adicione **Authorized redirect URIs**:
   ```
   https://crpzkppsriranmeumfqs.supabase.co/auth/v1/callback
   ```
5. **Copie** o **Client ID** e **Client Secret**

### 2️⃣ Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/auth/providers
2. Encontre **Google** e **ative** o toggle
3. Cole o **Client ID** e **Client Secret**
4. Clique em **Save**

### 3️⃣ Testar

1. Acesse: `http://localhost:8080/login`
2. Clique em **"Entrar com Google"**
3. Deve funcionar! ✅

---

## ❌ Erro: "provider is not enabled"

**Solução**: Ative o toggle do Google em:
https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/auth/providers

---

**Guia completo**: Veja `GOOGLE_OAUTH_SETUP_SUPABASE_DASHBOARD.md` para detalhes.

