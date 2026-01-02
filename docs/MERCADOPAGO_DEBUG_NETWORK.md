# 🔍 Debug - Verificar Requisição Network

## 📋 O que verificar na aba Network

### 1. Encontrar a Requisição

1. Abra DevTools (F12)
2. Vá na aba **Network**
3. Tente criar uma assinatura
4. Procure pela requisição: `create-subscription`
5. Clique nela para ver detalhes

### 2. Verificar Headers (Aba "Headers")

#### Request Headers (o que foi enviado):

Verifique se existe:
- ✅ **Authorization**: `Bearer eyJhbGciOiJIUzI1NiIs...` (deve ter um token JWT)

Se **NÃO** tiver o header Authorization:
- ❌ O problema é no frontend (token não está sendo enviado)

Se **TIVER** o header Authorization:
- ✅ O token está sendo enviado
- O problema pode ser na validação no backend

#### Request Payload (Body):

Deve ter:
```json
{
  "planId": "essencial" ou "pro",
  "billingInterval": "monthly" ou "annual"
}
```

### 3. Verificar Response (Aba "Response" ou "Preview")

Veja o que a Edge Function retornou:
- Mensagem de erro
- Status code (deve ser 500)

### 4. Verificar Timing (Aba "Timing")

- Quanto tempo levou?
- Onde está travando?

---

## 🔍 O que procurar

### ✅ Se o Authorization header estiver presente:
- O problema está na validação do token no backend
- Verifique os logs do Supabase para ver o erro exato

### ❌ Se o Authorization header NÃO estiver presente:
- O problema está no frontend
- O token não está sendo enviado
- Verifique se o usuário está logado

---

## 📸 Compartilhar Informações

Se puder, compartilhe:
1. Screenshot da aba **Headers** (Request Headers)
2. Screenshot da aba **Response** ou **Preview**
3. O que aparece no campo **Authorization**

---

**Última atualização**: 01/01/2025

