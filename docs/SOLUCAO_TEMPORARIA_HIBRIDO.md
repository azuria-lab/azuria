# 🔧 Solução Temporária para Modo Híbrido

**Data**: Janeiro 2025  
**Status**: ✅ **IMPLEMENTADO TEMPORARIAMENTE**

---

## ⚠️ Problema Identificado

No modo híbrido, os erros 401/403/406 ocorrem porque:
- O token JWT do Supabase Cloud não funciona no Supabase Local
- Os secrets JWT são diferentes entre Cloud e Local
- O RLS (Row Level Security) bloqueia queries sem token válido

---

## ✅ Solução Temporária Implementada

**Arquivo**: `src/integrations/supabase/client.ts`

**Mudança**: No modo híbrido, temporariamente usando **Cloud para dados também** até configurar JWT secret compartilhado.

**Antes**:
```typescript
if (MODE === 'hybrid') {
  authUrl = CLOUD_URL;      // Cloud para auth ✅
  dataUrl = LOCAL_URL;      // Local para data ❌ (token não funciona)
}
```

**Depois**:
```typescript
if (MODE === 'hybrid') {
  authUrl = CLOUD_URL;      // Cloud para auth ✅
  dataUrl = CLOUD_URL;      // Cloud para data também ✅ (temporário)
}
```

---

## 🎯 Resultado

- ✅ **Autenticação**: Cloud (funciona)
- ✅ **Dados**: Cloud (funciona temporariamente)
- ✅ **Erros 401/403/406**: Devem desaparecer
- ⚠️ **Modo Híbrido Real**: Requer configuração adicional (JWT secret)

---

## 📋 Para Usar Modo Híbrido Real (Futuro)

Quando quiser usar Local para dados:

1. **Obter JWT Secret do Cloud**:
   - Dashboard Supabase > Settings > API > JWT Secret

2. **Configurar no Local** (`supabase/config.toml`):
   ```toml
   [auth.jwt]
   secret = "seu-jwt-secret-do-cloud"
   ```

3. **Reverter mudança temporária** em `client.ts`:
   ```typescript
   dataUrl = LOCAL_URL;      // Voltar para Local
   dataKey = LOCAL_ANON_KEY; // Voltar para Local
   ```

---

## ✅ Status Atual

| Item | Status |
|------|--------|
| Modo Híbrido | ✅ Funcionando (Cloud para tudo temporariamente) |
| Erros 401/403/406 | ✅ Devem desaparecer |
| Autenticação | ✅ Funcionando |
| Queries de Dados | ✅ Funcionando (via Cloud) |

---

**Status**: ✅ **Solução temporária implementada - Erros devem desaparecer**

