# 🧪 Guia de Testes - Modo Deus (Pós-Remoção NIM)

Este guia lista os testes essenciais para validar o funcionamento do Modo Deus após a remoção da integração NVIDIA NIM.

---

## ✅ Testes Rápidos (5 minutos)

### 1. Verificar Inicialização do Sistema

**O que testar:** Sistema deve inicializar sem erros relacionados ao NIM

**Como testar:**
1. Inicie a aplicação: `npm run dev`
2. Abra o console do navegador (F12)
3. Verifique se não há erros relacionados ao NIM
4. Procure por logs como: `[AIRouter] Initialized` (deve mostrar apenas Gemini)

**Resultado esperado:**
- ✅ Sem erros de console
- ✅ Log mostra apenas `geminiAvailable: true/false`
- ✅ Aplicação carrega normalmente

---

### 2. Verificar Status do Gemini

**O que testar:** Gemini deve estar disponível e funcionando

**Como testar:**
1. Abra o Dashboard Admin (se tiver acesso)
2. Vá para a seção "IA" ou "Consciousness"
3. Verifique o status do Gemini

**Ou via console:**
```javascript
// No console do navegador
// Verificar se AIRouter está disponível
window.__AZURIA_DEV__?.getAIRouterStatus?.()
```

**Resultado esperado:**
- ✅ Gemini aparece como "Online" ou "Offline" (dependendo da configuração)
- ✅ NIM não aparece mais na lista
- ✅ Apenas Gemini Flash e Local (Fallback) são exibidos

---

### 3. Teste de Evento Básico - Calculadora

**O que testar:** Sistema deve reagir a eventos da calculadora

**Como testar:**
1. Vá para a Calculadora Básica
2. Preencha alguns campos (Custo, Margem, etc.)
3. Complete um cálculo
4. Observe se aparece alguma mensagem/toast do Modo Deus

**Resultado esperado:**
- ✅ Evento `calc:completed` é processado
- ✅ Se houver margem muito baixa, pode aparecer um toast/sugestão
- ✅ Sem erros no console

---

## 🔍 Testes Intermediários (15 minutos)

### 4. Verificar Admin Dashboard

**O que testar:** Dashboard admin não deve mostrar referências ao NIM

**Como testar:**
1. Acesse o Admin Dashboard (se disponível)
2. Vá para a seção de métricas do Modo Deus
3. Verifique a seção "IA"

**Resultado esperado:**
- ✅ Apenas Gemini Flash aparece na lista de modelos
- ✅ Local (Fallback) aparece como sempre disponível
- ✅ Não há referências ao NIM
- ✅ Estatísticas são calculadas corretamente (taxa de sucesso, cache, etc.)

---

### 5. Teste de Análise com Gemini

**O que testar:** Sistema deve usar Gemini para análises (rápidas e profundas)

**Como testar:**
1. Abra o console do navegador
2. Force uma análise via código (se houver API exposta):

```javascript
// Exemplo de teste direto (se disponível)
// No console do navegador
const { executeAI } = await import('/src/azuria_ai/consciousness/AIRouter');
const result = await executeAI({
  id: 'test-' + Date.now(),
  taskType: 'deep_analysis',
  input: 'Analise: empresa tem margem de 5%, custo fixo alto, poucas vendas',
  useCache: false
});
console.log('Resultado:', result);
```

**Resultado esperado:**
- ✅ Requisição é processada sem erro
- ✅ Modelo usado é `gemini` (não `nim`)
- ✅ Resposta contém análise útil
- ✅ Sem timeouts ou erros

---

### 6. Teste de Fallback para Local

**O que testar:** Se Gemini não estiver disponível, deve usar regras locais

**Como testar:**
1. Desabilite temporariamente o Gemini (remova API key do .env ou desconfigure)
2. Recarregue a aplicação
3. Execute uma análise

**Resultado esperado:**
- ✅ Sistema não quebra
- ✅ Usa `local` como fallback
- ✅ Resposta básica é gerada (mesmo que limitada)
- ✅ Sem erros fatais

---

## 🎯 Testes Avançados (30 minutos)

### 7. Teste de Eventos do Modo Deus

**O que testar:** Sistema processa diferentes tipos de eventos

**Como testar:**
1. Execute diferentes ações na aplicação:
   - Navegue entre telas (`user:navigation`)
   - Complete cálculos (`calc:completed`)
   - Alterne entre diferentes calculadoras
   - Gere relatórios
2. Observe o console para logs de processamento
3. Verifique se mensagens aparecem quando apropriado

**Resultado esperado:**
- ✅ Eventos são capturados e processados
- ✅ Logs mostram processamento correto
- ✅ Mensagens relevantes aparecem (sem spam)
- ✅ Sistema não trava ou consome recursos excessivos

---

### 8. Teste de Performance

**O que testar:** Sistema deve responder rapidamente

**Como testar:**
1. Abra o DevTools > Performance
2. Grave uma sessão enquanto usa a calculadora
3. Complete alguns cálculos
4. Analise o tempo de resposta

**Resultado esperado:**
- ✅ Respostas do Gemini em < 3 segundos (normal)
- ✅ Interface não trava
- ✅ Sem memory leaks aparentes
- ✅ Sem requisições bloqueantes

---

### 9. Teste de Integração Completa

**O que testar:** Fluxo completo de evento → processamento → mensagem

**Como testar:**
1. Abra a Calculadora Básica
2. Configure um cenário que deve gerar alerta:
   - Margem muito baixa (< 5%)
   - Custo muito alto
   - Preço de venda abaixo do custo
3. Complete o cálculo
4. Aguarde processamento (pode levar alguns segundos)
5. Verifique se mensagem aparece

**Resultado esperado:**
- ✅ Evento é capturado
- ✅ Sistema processa via PerceptionGate
- ✅ DecisionEngine decide emitir mensagem
- ✅ Toast/mensagem aparece na interface
- ✅ Mensagem é relevante e útil

---

## 🧹 Testes de Limpeza

### 10. Verificar Imports e Referências

**O que testar:** Não deve haver imports órfãos ou referências ao NIM

**Como testar:**
```bash
# No terminal
grep -r "nim\|NIM\|SupabaseNIMAdapter" src/ --exclude-dir=node_modules
```

**Resultado esperado:**
- ✅ Nenhuma referência encontrada (ou apenas em comentários/documentação)
- ✅ Build funciona sem erros: `npm run build`

---

### 11. Verificar Build de Produção

**O que testar:** Build deve funcionar sem erros

**Como testar:**
```bash
npm run build
```

**Resultado esperado:**
- ✅ Build completa sem erros
- ✅ Sem warnings relacionados ao NIM
- ✅ Bundle gerado corretamente

---

## 📊 Testes Automatizados (Opcional)

### 12. Rodar Testes Unitários

```bash
npm test
```

**Resultado esperado:**
- ✅ Todos os testes passam
- ✅ Sem testes quebrados relacionados ao NIM

---

### 13. Rodar Smoke Tests

```bash
npm run test:smoke
```

**Resultado esperado:**
- ✅ Smoke tests passam
- ✅ Aplicação básica funciona

---

## 🔧 Checklist Final

Use este checklist para validar tudo:

- [ ] Aplicação inicia sem erros
- [ ] Console não mostra erros relacionados ao NIM
- [ ] Gemini está disponível (se configurado)
- [ ] Admin Dashboard não mostra NIM
- [ ] Eventos da calculadora são processados
- [ ] Mensagens aparecem quando apropriado
- [ ] Fallback para local funciona
- [ ] Build de produção funciona
- [ ] Testes automatizados passam
- [ ] Sem referências ao NIM no código (exceto comentários)

---

## 🐛 Troubleshooting

### Problema: Erros no console relacionados ao NIM

**Solução:**
1. Verifique se todos os arquivos foram removidos
2. Limpe o cache: `rm -rf node_modules/.vite`
3. Reinstale: `npm install`
4. Rebuild: `npm run build`

### Problema: Gemini não funciona

**Solução:**
1. Verifique se `VITE_GEMINI_API_KEY` está configurada
2. Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas (se usando Edge Function)
3. Verifique logs no console
4. Teste a Edge Function `azuria-chat` diretamente

### Problema: Mensagens não aparecem

**Solução:**
1. Verifique se o Modo Deus está ativo
2. Verifique logs do DecisionEngine no console
3. Verifique se eventos estão sendo capturados
4. Verifique OutputGate logs (pode estar silenciando mensagens)

---

## 📝 Notas

- Todos os testes devem ser executados após remoção do NIM
- Se encontrar problemas, verifique os logs do console
- Testes podem variar dependendo da configuração do ambiente
- Para testes mais profundos, considere usar os scripts em `scripts/mode-deus-tests/`

