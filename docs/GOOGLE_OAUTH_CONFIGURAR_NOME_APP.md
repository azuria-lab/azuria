# 🔧 Configurar Nome "Azuria" na Tela de Consentimento OAuth

**Problema**: Mesmo com domínio verificado, ainda aparece `crpzkppsriranmeumfqs.supabase.co` ao invés de **Azuria**.

**Causa**: O nome da aplicação precisa ser configurado na **tela de consentimento OAuth**, não apenas no branding.

---

## 🚀 Solução: Configurar App Name na Tela de Consentimento

### **Passo 1: Acessar Tela de Consentimento OAuth**

1. Acesse: https://console.cloud.google.com/apis/credentials/consent
2. Ou navegue: **APIs & Services** > **OAuth consent screen**

### **Passo 2: Editar Informações da Aplicação**

1. Clique em **EDIT APP** (ou **Edit**)

### **Passo 3: Configurar App Information**

Na primeira etapa **"App information"**:

1. **App name**: Digite exatamente: `Azuria`
   - ⚠️ **IMPORTANTE**: Deve ser "Azuria" (sem aspas)
   - Não pode estar vazio
   - Este é o nome que aparece na tela de login do Google

2. **User support email**: Seu email (já deve estar preenchido)

3. **App logo** (opcional): Faça upload do logo do Azuria se quiser

4. **Application home page**: `https://azuria.app.br/`

5. **Application privacy policy link**: `https://azuria.app.br/privacy`

6. **Application terms of service link**: `https://azuria.app.br/terms`

### **Passo 4: Verificar Scopes**

Na etapa **"Scopes"**:

Certifique-se de ter:
- ✅ `.../auth/userinfo.email`
- ✅ `.../auth/userinfo.profile`

### **Passo 5: Salvar e Publicar**

1. Clique em **Save and Continue** em cada etapa
2. Na última etapa, clique em **Back to Dashboard**
3. **IMPORTANTE**: Se necessário, publique a aplicação ou mantenha em "Testing"

---

## ⚠️ Problemas Comuns

### O Nome Não Aparece Imediatamente

1. **Cache do Google**: Pode levar alguns minutos para atualizar
2. **Limpar cache**: Tente em uma janela anônima/privada
3. **Aguardar**: Pode levar até 10-15 minutos para propagar

### Ainda Mostra o Domínio do Supabase

Se ainda mostrar `crpzkppsriranmeumfqs.supabase.co`:

1. Verifique se o **App name** está preenchido como "Azuria"
2. Verifique se salvou todas as etapas
3. Aguarde alguns minutos
4. Tente em modo anônimo/privado
5. Faça logout e login novamente no Google

### Status "Testing" vs "In Production"

- **Testing**: O nome pode não aparecer para todos os usuários imediatamente
- **In Production**: Aparece para todos, mas requer verificação do Google

---

## 🔍 Verificar Configuração Atual

Para verificar se está configurado corretamente:

1. Acesse: https://console.cloud.google.com/apis/credentials/consent
2. Veja a seção **"App information"**
3. Confirme que o **App name** está como "Azuria"
4. Se não estiver, clique em **Edit** e configure

---

## ✅ Resultado Esperado

Após configurar corretamente:

**Tela de seleção de conta do Google deve mostrar:**
- ✅ "Prosseguir para **Azuria**" (ao invés de crpzkppsriranmeumfqs.supabase.co)

**Tela de consentimento deve mostrar:**
- ✅ "Fazer login no serviço **Azuria**"

---

## 🔗 Links Úteis

- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent
- **Google Cloud Console**: https://console.cloud.google.com/

---

## 💡 Dica Extra

Se o nome ainda não aparecer após configurar:

1. Verifique qual projeto do Google Cloud está sendo usado
2. Certifique-se de que está editando o projeto correto (gen-lang-client-0206082474)
3. As credenciais OAuth devem estar no mesmo projeto da tela de consentimento

---

**Configure o App name como "Azuria" e aguarde alguns minutos para ver a mudança!** 🎯

