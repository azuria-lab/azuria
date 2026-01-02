# 🔍 Como Verificar a Requisição na Network

## 📋 Passo a Passo

### 1. Abrir DevTools
- Pressione **F12** ou **Ctrl+Shift+I**
- Vá na aba **Network**

### 2. Filtrar Requisições
- No campo de filtro, digite: `create-subscription`
- Ou clique em **Fetch/XHR** para ver apenas requisições AJAX

### 3. Tentar Criar Assinatura
- No app, selecione um plano
- Clique em "Começar agora"
- A requisição deve aparecer na lista

### 4. Verificar Detalhes da Requisição

Clique na requisição `create-subscription` e verifique:

#### **Aba "Headers"**

**Request Headers** (o que foi enviado):
- Procure por: **Authorization**
- Deve ter: `Bearer eyJhbGciOiJIUzI1NiIs...` (um token JWT longo)

**Request Payload** (Body):
- Deve ter:
  ```json
  {
    "planId": "essencial" ou "pro",
    "billingInterval": "monthly" ou "annual"
  }
  ```

#### **Aba "Response" ou "Preview"**

Veja o que foi retornado:
- Status: `500 Internal Server Error`
- Body: Mensagem de erro

#### **Aba "Timing"**

Veja quanto tempo levou e onde travou

---

## ✅ O que verificar

### Se Authorization header estiver presente:
✅ Token está sendo enviado  
❌ Problema está na validação do token no backend

### Se Authorization header NÃO estiver presente:
❌ Token não está sendo enviado  
❌ Problema está no frontend

---

## 📸 Compartilhar

Se puder, me diga:
1. **Authorization header está presente?** (Sim/Não)
2. **Qual é o erro na Response?** (copie a mensagem)
3. **O que aparece no Request Payload?** (planId e billingInterval)

---

**Última atualização**: 01/01/2025

