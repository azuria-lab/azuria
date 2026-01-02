# 🔐 Configuração do Google OAuth no Supabase Dashboard

**Projeto**: `crpzkppsriranmeumfqs`  
**URL do Projeto**: `https://crpzkppsriranmeumfqs.supabase.co`

---

## 📋 Pré-requisitos

1. ✅ Conta Google (para acessar o Google Cloud Console)
2. ✅ Acesso ao Supabase Dashboard do projeto
3. ✅ Credenciais OAuth do Google (Client ID e Secret)

---

## 🚀 Passo a Passo Completo

### **PARTE 1: Criar Credenciais OAuth no Google Cloud Console**

#### 1.1. Acessar o Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Selecione ou crie um projeto

#### 1.2. Configurar Tela de Consentimento OAuth

1. No menu lateral, vá em **APIs & Services** > **OAuth consent screen**
2. Se ainda não configurou:
   - Escolha **External** (para qualquer conta Google)
   - Preencha:
     - **App name**: `Azuria`
     - **User support email**: seu email
     - **Developer contact information**: seu email
   - Clique em **Save and Continue**
   - Em **Scopes**, adicione:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Clique em **Save and Continue**
   - Adicione usuários de teste (opcional para desenvolvimento)
   - Clique em **Save and Continue** e **Back to Dashboard**

#### 1.3. Criar Credenciais OAuth

1. Vá em **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth client ID**
3. Escolha **Application type**: **Web application**
4. Nome: `Azuria Web Client`

#### 1.4. Configurar URLs de Redirecionamento

**IMPORTANTE**: Você precisa adicionar a URL de callback do Supabase. Para obter:

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/auth/providers
2. Role até encontrar **Google**
3. Copie a **Callback URL** (formato: `https://crpzkppsriranmeumfqs.supabase.co/auth/v1/callback`)

**No Google Cloud Console**, adicione:

**Authorized JavaScript origins:**
```
http://localhost:8080
http://localhost:5173
https://crpzkppsriranmeumfqs.supabase.co
```

**Authorized redirect URIs:**
```
https://crpzkppsriranmeumfqs.supabase.co/auth/v1/callback
http://localhost:8080/dashboard
http://localhost:5173/dashboard
```

5. Clique em **Create**
6. **COPIE** o **Client ID** e o **Client Secret** gerados (você precisará deles no próximo passo)

---

### **PARTE 2: Configurar no Supabase Dashboard**

#### 2.1. Acessar Configurações de Autenticação

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/auth/providers
2. Ou navegue: **Authentication** > **Providers** no menu lateral

#### 2.2. Habilitar Provider Google

1. Role até encontrar a seção **Google**
2. Clique no toggle para **ativar** o provider
3. Você verá campos para:
   - **Client ID (for OAuth)**
   - **Client Secret (for OAuth)**

#### 2.3. Preencher Credenciais

1. **Client ID (for OAuth)**: Cole o Client ID que você copiou do Google Cloud Console
   - Formato: `xxxxx.apps.googleusercontent.com`

2. **Client Secret (for OAuth)**: Cole o Client Secret que você copiou do Google Cloud Console
   - Formato: `GOCSPX-xxxxx`

3. **Callback URL**: Deve aparecer automaticamente como:
   ```
   https://crpzkppsriranmeumfqs.supabase.co/auth/v1/callback
   ```
   - ✅ Verifique se está correto
   - ✅ Esta URL deve estar nas **Authorized redirect URIs** do Google Cloud Console

#### 2.4. Salvar Configuração

1. Clique em **Save** no final da página
2. Aguarde a confirmação de sucesso

---

### **PARTE 3: Verificar Configuração**

#### 3.1. Testar no Dashboard

1. Volte para: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/auth/providers
2. Verifique se o toggle do **Google** está **ativado** (verde)
3. Verifique se os campos **Client ID** e **Client Secret** estão preenchidos

#### 3.2. Testar no Frontend

1. Acesse sua aplicação: `http://localhost:8080/login`
2. Clique no botão **"Entrar com Google"**
3. Você deve ser redirecionado para a tela de login do Google
4. Após fazer login, deve ser redirecionado de volta para `/dashboard`

---

## 🔧 Solução de Problemas

### ❌ Erro: "Unsupported provider: provider is not enabled"

**Causa**: O provider Google não está habilitado no Supabase Dashboard.

**Solução**:
1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/auth/providers
2. Verifique se o toggle do **Google** está **ativado**
3. Se não estiver, ative e salve
4. Aguarde alguns segundos e tente novamente

### ❌ Erro: "redirect_uri_mismatch"

**Causa**: A URL de callback não está configurada no Google Cloud Console.

**Solução**:
1. Acesse o Google Cloud Console > Credentials
2. Edite seu OAuth Client ID
3. Adicione exatamente esta URL nas **Authorized redirect URIs**:
   ```
   https://crpzkppsriranmeumfqs.supabase.co/auth/v1/callback
   ```
4. Salve e aguarde alguns minutos para propagar
5. Tente novamente

### ❌ Erro: "invalid_client"

**Causa**: Client ID ou Secret incorretos.

**Solução**:
1. Verifique se copiou corretamente do Google Cloud Console
2. Verifique se não há espaços extras
3. No Supabase Dashboard, apague e cole novamente
4. Salve e tente novamente

### ❌ Login funciona mas usuário não é criado

**Causa**: Pode haver problemas com triggers ou RLS.

**Solução**:
1. Verifique os logs do Supabase: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/logs/explorer
2. Verifique se o trigger `on_auth_user_created` existe
3. Verifique as políticas RLS na tabela `user_profiles`

---

## ✅ Checklist de Configuração

- [ ] Tela de consentimento OAuth configurada no Google Cloud Console
- [ ] Credenciais OAuth criadas no Google Cloud Console
- [ ] Client ID copiado
- [ ] Client Secret copiado
- [ ] URLs de redirecionamento adicionadas no Google Cloud Console
- [ ] Provider Google habilitado no Supabase Dashboard
- [ ] Client ID configurado no Supabase Dashboard
- [ ] Client Secret configurado no Supabase Dashboard
- [ ] Configuração salva no Supabase Dashboard
- [ ] Teste de login realizado com sucesso

---

## 🔗 Links Úteis

- **Supabase Dashboard - Auth Providers**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/auth/providers
- **Google Cloud Console**: https://console.cloud.google.com/
- **Documentação Supabase OAuth**: https://supabase.com/docs/guides/auth/social-login/auth-google
- **Documentação Google OAuth**: https://developers.google.com/identity/protocols/oauth2

---

## 📝 Notas Importantes

1. **Segurança**: Nunca compartilhe o Client Secret publicamente
2. **Propagação**: Mudanças no Google Cloud Console podem levar alguns minutos para propagar
3. **Ambientes**: Para produção, você precisará adicionar a URL de produção nas **Authorized redirect URIs**
4. **Verificação**: Para uso em produção em larga escala, o app precisa ser verificado pelo Google

---

**Pronto! Após seguir estes passos, o login com Google deve funcionar corretamente.** 🎉

