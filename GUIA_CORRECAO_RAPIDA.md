# ⚡ Guia de Correção Rápida - Pré Deploy

**Tempo Estimado**: 30-60 minutos  
**Prioridade**: 🔴 **CRÍTICO**

---

## ✅ Problema 1: URL Antiga Removida

**Status**: ✅ **CORRIGIDO**
- URL antiga `yiornerygxhwfchnqslq` removida do `index.html`
- Apenas URL atual `crpzkppsriranmeumfqs` mantida

---

## 🔴 Problema 2: Vulnerabilidades de Dependências

### **Passo 1: Corrigir Automaticamente**

```bash
# Corrigir vulnerabilidades que não requerem breaking changes
npm audit fix
```

### **Passo 2: Revisar Vulnerabilidades Restantes**

```bash
# Ver relatório completo
npm audit

# Se houver vulnerabilidades críticas restantes
npm audit fix --force
```

### **Passo 3: Verificar Dependências Críticas**

**Dependências que podem precisar atualização manual**:
- `jspdf` - Atualizar para versão mais recente
- `playwright` - Atualizar para versão mais recente
- `glob` - Verificar se pode atualizar

**Comando para atualizar específicas**:
```bash
npm update jspdf playwright
```

### **Passo 4: Testar Após Correções**

```bash
# Verificar se build ainda funciona
npm run build

# Verificar se testes passam
npm test
```

---

## 🔴 Problema 3: Console.log em Produção

### **Arquivos a Corrigir**:

1. **`lib/mercadopago.ts`**
   - Substituir `console.log` por `logger.info`
   - Substituir `console.error` por `logger.error`
   - Substituir `console.warn` por `logger.warn`

2. **`supabase/functions/mercadopago-webhook/index.ts`**
   - Substituir `console.log` por logger apropriado

### **Padrão de Correção**:

```typescript
// ANTES
console.log('✅ Plan created:', response.body.id);
console.error('❌ Error:', error);
console.warn('⚠️ Warning:', message);

// DEPOIS
import { logger } from '@/services/logger';

logger.info('Plan created', { planId: response.body.id });
logger.error('Error creating plan', { error });
logger.warn('Warning', { message });
```

### **Nota**:
- `src/examples/ui-ux-examples.tsx` pode manter console.log (é arquivo de exemplo)
- Edge Functions podem precisar de logger próprio do Supabase

---

## 📋 Checklist Final

### **Antes do Deploy**:

- [x] ✅ Remover URL antiga do Supabase
- [ ] 🔴 Executar `npm audit fix`
- [ ] 🔴 Revisar vulnerabilidades restantes
- [ ] 🔴 Substituir console.log por logger
- [ ] 🟡 Testar build após correções
- [ ] 🟡 Testar funcionalidades críticas

### **Após Correções**:

- [ ] Verificar se build funciona: `npm run build`
- [ ] Verificar se lint passa: `npm run lint`
- [ ] Verificar se type-check passa: `npm run type-check`
- [ ] Testar aplicação localmente: `npm run dev`
- [ ] Verificar console do navegador (sem erros)

---

## 🚀 Próximos Passos

1. **Executar correções acima**
2. **Testar tudo localmente**
3. **Fazer commit das correções**
4. **Deploy para produção**
5. **Monitorar logs e erros**

---

## 📝 Notas Importantes

- ⚠️ **Backup**: Fazer commit antes de `npm audit fix --force`
- ⚠️ **Testes**: Testar todas as funcionalidades após correções
- ⚠️ **Rollback**: Ter plano de rollback caso algo quebre

---

**Tempo Total Estimado**: 30-60 minutos  
**Prioridade**: 🔴 **CRÍTICO - Fazer antes do deploy**

