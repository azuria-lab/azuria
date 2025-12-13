# 🔐 Configuração do Login com Google OAuth

Este guia explica como configurar o login com Google no projeto Azuria usando o Supabase Auth.

## 📋 Pré-requisitos

- Conta Google (para acessar o Google Cloud Console)
- Projeto Supabase configurado
- Acesso ao dashboard do Supabase

---

## 🚀 Passo a Passo

### 1. Criar Credenciais OAuth no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth client ID**
5. Configure a tela de consentimento OAuth se ainda não o fez:
   - Clique em **Configure Consent Screen**
   - Escolha **External** (para qualquer conta Google)
   - Preencha as informações obrigatórias:
     - App name: **Azuria**
     - User support email: seu email
     - Developer contact information: seu email
   - Clique em **Save and Continue**
   - Em **Scopes**, adicione:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Clique em **Save and Continue**
   - Adicione usuários de teste (opcional para desenvolvimento)
   - Clique em **Save and Continue** e **Back to Dashboard**

6. Volte para **Credentials** e clique em **Create Credentials** > **OAuth client ID**
7. Escolha **Application type**: **Web application**
8. Nome: **Azuria Web Client**

### 2. Configurar URLs de Redirecionamento

#### Para Desenvolvimento Local:

Adicione as seguintes **Authorized JavaScript origins**:
```
http://localhost:5173
http://127.0.0.1:54321
```

Adicione as seguintes **Authorized redirect URIs**:
```
http://localhost:5173/auth/callback
http://127.0.0.1:54321/auth/v1/callback
```

#### Para Produção (Supabase Cloud):

Obtenha a URL de callback do Supabase:
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Authentication** > **Providers**
3. Role até **Google**
4. Copie a **Callback URL** (formato: `https://<seu-projeto>.supabase.co/auth/v1/callback`)

Adicione no Google Cloud Console:
```
https://<seu-projeto>.supabase.co/auth/v1/callback
https://seu-dominio.com/auth/callback
```

9. Clique em **Create**
10. **IMPORTANTE**: Copie o **Client ID** e o **Client Secret** gerados

---

### 3. Configurar no Supabase Dashboard (Produção)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** > **Providers**
4. Role até encontrar **Google**
5. Ative o provider
6. Cole o **Client ID** do Google
7. Cole o **Client Secret** do Google
8. Clique em **Save**

---

### 4. Configurar Localmente (Desenvolvimento)

#### 4.1. Configurar Variáveis de Ambiente

Adicione as credenciais no arquivo `.env` (na raiz do projeto):

```bash
# Google OAuth (for Supabase Auth)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=sua-client-id-aqui.apps.googleusercontent.com
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=seu-client-secret-aqui
```

#### 4.2. Verificar Configuração do Supabase Local

O arquivo `supabase/config.toml` já está configurado com:

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
redirect_uri = ""
skip_nonce_check = true
```

---

### 5. Testar o Login

#### Desenvolvimento Local:

1. Certifique-se de que o Supabase local está rodando:
```bash
supabase start
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse http://localhost:5173/login
4. Clique no botão **"Entrar com Google"** ou **"Cadastrar com Google"**
5. Você será redirecionado para a tela de login do Google
6. Após fazer login, será redirecionado de volta para o aplicativo

#### Produção:

1. Faça o deploy das alterações
2. Acesse sua aplicação em produção
3. Teste o login com Google

---

## 🔧 Solução de Problemas

### Erro: "redirect_uri_mismatch"

**Causa**: A URL de redirecionamento não está configurada no Google Cloud Console.

**Solução**: 
1. Verifique se todas as URLs de redirecionamento estão configuradas corretamente
2. Certifique-se de incluir tanto a URL do Supabase quanto a URL da sua aplicação
3. URLs devem ser exatas (incluindo http/https e porta)

### Erro: "Error loading OAuth provider"

**Causa**: Credenciais não configuradas ou incorretas.

**Solução**:
1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Certifique-se de que o Supabase local foi reiniciado após adicionar as variáveis
3. Verifique se há erros de digitação no Client ID e Secret

### Login funciona localmente mas não em produção

**Causa**: Configuração do Supabase Dashboard não está correta.

**Solução**:
1. Verifique se o provider Google está ativado no Supabase Dashboard
2. Confirme que as credenciais estão corretas
3. Verifique se a URL de callback está adicionada no Google Cloud Console

### Usuário não é criado no banco de dados

**Causa**: Pode haver problemas com RLS (Row Level Security) ou triggers.

**Solução**:
1. Verifique se existe um trigger para criar o perfil do usuário automaticamente
2. Verifique as políticas RLS na tabela `user_profiles`
3. Confira os logs do Supabase para erros

---

## 📝 Notas Importantes

- **Segurança**: Nunca commite o arquivo `.env` com as credenciais
- **Produção**: Use secrets managers (Vercel Environment Variables, etc.) em produção
- **Callback URLs**: As URLs devem ser exatas, incluindo o protocolo (http/https)
- **Usuários de Teste**: Em desenvolvimento, adicione contas de teste no Google Cloud Console se o app não for público
- **Verificação do App**: Para uso em produção, você precisará verificar o app no Google Cloud Console

---

## 🔗 Links Úteis

- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## ✅ Checklist de Configuração

- [ ] Criar projeto no Google Cloud Console
- [ ] Configurar tela de consentimento OAuth
- [ ] Criar OAuth Client ID
- [ ] Adicionar URLs de redirecionamento (local e produção)
- [ ] Copiar Client ID e Client Secret
- [ ] Configurar no Supabase Dashboard (produção)
- [ ] Adicionar variáveis de ambiente no `.env` (local)
- [ ] Reiniciar Supabase local
- [ ] Testar login local
- [ ] Deploy e testar em produção

---

## 🎯 Resultado Final

Após seguir todos os passos, os usuários poderão:
- Fazer login com suas contas Google
- Criar conta automaticamente no primeiro login
- Ter seus dados de perfil (nome, email, foto) preenchidos automaticamente
- Fazer logout e login novamente sem problemas
