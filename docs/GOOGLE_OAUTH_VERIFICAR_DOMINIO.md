# ✅ Verificar Domínio azuria.app.br no Google Cloud Console

**Problema**: Aviso "Domínio ausente: azuria.app.br" mesmo com o domínio online.

**Causa**: O Google precisa verificar que você é o proprietário do domínio antes de permitir usá-lo na tela de consentimento OAuth.

---

## 🚀 Solução: Adicionar e Verificar o Domínio

### **Passo 1: Adicionar o Domínio**

1. Na página de **Branding** do Google Cloud Console
2. Na seção **"Domínios autorizados"**
3. Clique em **"+ Adicionar domínio"**
4. Digite: `azuria.app.br`
5. Clique em **Adicionar**

### **Passo 2: Verificar o Domínio no Google Search Console**

O Google vai pedir para verificar a propriedade do domínio. Você tem duas opções:

#### **Opção A: Verificação via HTML (Mais Rápido)** ✅

1. O Google vai gerar um arquivo HTML para você fazer upload
2. Faça upload desse arquivo na raiz do seu site: `https://azuria.app.br/arquivo.html`
3. Volte ao Google Search Console e clique em **Verificar**

#### **Opção B: Verificação via DNS (Mais Permanente)** ✅

1. O Google vai fornecer um registro TXT para adicionar no DNS
2. Acesse o painel do seu provedor de DNS (onde você configurou o domínio)
3. Adicione o registro TXT fornecido pelo Google
4. Aguarde a propagação (pode levar alguns minutos)
5. Volte ao Google Search Console e clique em **Verificar**

---

## 📋 Passo a Passo Detalhado

### 1. Adicionar Domínio no Google Cloud Console

1. Acesse: https://console.cloud.google.com/auth/branding?project=gen-lang-client-0206082474
2. Na seção **"Domínios autorizados"**
3. Clique em **"+ Adicionar domínio"**
4. Digite: `azuria.app.br`
5. Clique em **Adicionar**

### 2. Verificar no Google Search Console

1. Você será redirecionado ou receberá um link para o Google Search Console
2. Se não for redirecionado, acesse: https://search.google.com/search-console
3. Adicione a propriedade `azuria.app.br`
4. Escolha o método de verificação (HTML ou DNS)
5. Siga as instruções para verificar

### 3. Voltar ao Google Cloud Console

1. Após verificar no Search Console, volte para a página de Branding
2. O domínio deve aparecer como verificado
3. Clique em **Salvar**

---

## ⚠️ Importante

### Se o Domínio Já Estiver Verificado no Search Console

Se você já verificou `azuria.app.br` no Google Search Console antes:
- O Google pode reconhecer automaticamente
- Pode levar alguns minutos para sincronizar
- Tente adicionar o domínio novamente

### Se Não Tiver Acesso ao Search Console

1. Acesse: https://search.google.com/search-console
2. Faça login com a mesma conta Google usada no Cloud Console
3. Adicione a propriedade `azuria.app.br`
4. Verifique usando um dos métodos acima

---

## ✅ Resultado Esperado

Após verificar:
- ✅ O aviso "Domínio ausente" desaparece
- ✅ O domínio `azuria.app.br` aparece na lista de domínios autorizados
- ✅ As URLs do branding (home page, privacy, terms) funcionam corretamente
- ✅ A tela de consentimento mostrará "Azuria" ao invés do domínio do Supabase

---

## 🔗 Links Úteis

- **Google Search Console**: https://search.google.com/search-console
- **Google Cloud Console - Branding**: https://console.cloud.google.com/auth/branding
- **Documentação Google**: https://support.google.com/cloud/answer/9110914

---

## 💡 Dica

Se você já tem o domínio verificado no Google Search Console para outro projeto, pode precisar verificar novamente ou adicionar a propriedade no projeto atual do Google Cloud.

---

**Após verificar o domínio, o aviso desaparecerá e você poderá usar "Azuria" na tela de consentimento!** 🎉

