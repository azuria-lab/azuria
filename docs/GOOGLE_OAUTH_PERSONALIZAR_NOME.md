# 🎨 Personalizar Nome "Azuria" na Tela de Consentimento Google

**Problema**: A tela de login do Google mostra `crpzkppsriranmeumfqs.supabase.co` ao invés de **Azuria**.

**Solução**: Configurar a tela de consentimento OAuth no Google Cloud Console.

---

## 🚀 Passo a Passo

### 1. Acessar Tela de Consentimento OAuth

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto onde você criou as credenciais OAuth
3. No menu lateral, vá em **APIs & Services** > **OAuth consent screen**

### 2. Editar Informações da Aplicação

1. Clique em **EDIT APP** (ou **Edit** se já estiver configurado)

### 3. Preencher Dados da Aplicação

Na seção **App information**:

- **App name**: `Azuria`
- **User support email**: Seu email de suporte
- **App logo** (opcional): Faça upload do logo do Azuria se quiser
- **Application home page** (opcional): `https://azuria.com.br` ou seu domínio
- **Application privacy policy link** (opcional): Link para política de privacidade
- **Application terms of service link** (opcional): Link para termos de serviço
- **Authorized domains** (opcional): Adicione seu domínio se tiver

### 4. Configurar Scopes

Na seção **Scopes**:

Certifique-se de ter:
- ✅ `.../auth/userinfo.email`
- ✅ `.../auth/userinfo.profile`

### 5. Salvar e Publicar

1. Clique em **Save and Continue** em cada etapa
2. Na última etapa, clique em **Back to Dashboard**
3. **Importante**: Se o app ainda não foi publicado, você pode precisar publicá-lo para que o nome apareça corretamente

---

## ⚠️ Importante

### Status da Aplicação

- **Testing**: O nome pode não aparecer corretamente para todos os usuários
- **In Production**: O nome aparecerá para todos, mas requer verificação do Google

### Para Desenvolvimento

Se estiver em modo **Testing**:
- O nome "Azuria" aparecerá apenas para usuários de teste adicionados
- Adicione seus emails de teste na seção **Test users**

### Para Produção

Para que apareça para todos os usuários:
1. Complete todas as informações obrigatórias
2. Publique a aplicação
3. Pode ser necessário verificar o app com o Google (processo mais longo)

---

## ✅ Resultado Esperado

Após configurar, a tela de login do Google deve mostrar:

**"Fazer login no serviço Azuria"** ✅

Ao invés de:

**"Fazer login no serviço crpzkppsriranmeumfqs.supabase.co"** ❌

---

## 🔗 Links Úteis

- **Google Cloud Console - OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent
- **Documentação Google**: https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred

---

**Nota**: As mudanças podem levar alguns minutos para propagar. Teste novamente após salvar.

