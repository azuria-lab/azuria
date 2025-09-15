
# 🔧 Guia de Solução de Problemas - Precifica+

Este guia ajuda a resolver os problemas mais comuns encontrados no Precifica+.

## 🚨 Problemas Críticos

### (Dev/Test) Falhas de OOM em Testes de Integração

Se a suíte de testes travar por dezenas de minutos e encerrar com:

```text
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

#### Contexto Atual

- O arquivo `src/__tests__/integration/calculator-flow.test.tsx` foi temporariamente desabilitado (`describe.skip`) para desbloquear o pipeline e evitar consumo excessivo de memória (>3.5GB) durante execuções completas do Vitest.
- Causa provável: combinação de árvore de componentes grande + caches (react-query, histórico, mocks parciais) + múltiplas interações `userEvent` acumulando referências.

#### Mitigação Aplicada

1. Suite marcada como `skip` com comentário detalhando plano de reintrodução.
2. Testes de unidade + smoke permanecem ativos e cobrindo paths críticos do cálculo.

#### Próximos Passos Planejados

- Extrair um harness leve da calculadora (sem analytics, sem theming pesado, sem react-query real).
- Mockar completamente providers (auth, query client, analytics) e limitar histórico a memória volátil.
- Reintroduzir como `calculator-flow.light.test.tsx` objetivando execução <5s e sem crescimento de heap.
- Migrar cenários mais realistas para camada E2E (Playwright) se necessário.

#### Estado Atual (Teste Leve Introduzido)

Uma variante reduzida já foi adicionada em `src/__tests__/smoke/calculator-flow.light.test.tsx` cobrindo:

- Caso feliz mínimo: inserir custo + impostos + taxa e gerar preço de venda.
- Mocks completos para: `framer-motion`, `HistoryService` (desativado), contexto de auth (usuário anônimo).
- Sem histórico persistente, sem analytics, sem animações, sem carregamento de árvore pesada.

Critérios de sucesso do teste leve:

| Critério | Objetivo |
|----------|----------|
| Tempo de execução | < 5s local / < 10s CI |
| RSS aproximado | Estável (sem crescimento progressivo) |
| Largura de escopo | Apenas fluxo de cálculo básico |
| Independência | Não requer serviços externos |

Checklist de diagnóstico se o teste leve falhar:

1. Labels de acessibilidade (aria-label / textContent) mudaram?
2. Houve introdução de providers pesados no componente renderizado?
3. Entraram novas dependências não mockadas criando caches grandes?

Expansão segura: duplicar o teste leve e adicionar um segundo cenário, monitorando tempo total (< 15s agregado). Evitar loops ou múltiplas execuções repetitivas de interações de usuário.

#### Ação Caso Necessite Reativar Agora

1. Remova `describe.skip` em `calculator-flow.test.tsx`.
2. Rode localmente:

   ```bash
   npx vitest run src/__tests__/integration/calculator-flow.test.tsx --maxWorkers=1 --no-threads
   ```

3. Se ainda crescer memória, experimentar flag Node:

   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096 & npx vitest run src/__tests__/integration/calculator-flow.test.tsx
   ```

> Issue recomendada: "Refatorar integração Calculator Flow para versão leve".


### App não carrega/Tela branca

#### Possíveis Causas
- Cache do navegador corrompido
- JavaScript desabilitado
- Extensões do navegador interferindo
- Problemas de conectividade

#### Soluções

1. **Limpar Cache do Navegador**
   ```
   Chrome: Ctrl+Shift+Del > Limpar dados de navegação
   Firefox: Ctrl+Shift+Del > Limpar dados
   Safari: Cmd+Option+E > Esvaziar caches
   ```

2. **Verificar JavaScript**
   - Chrome: Configurações > Privacidade > Configurações do site > JavaScript
   - Certifique-se que está "Permitido"

3. **Modo Incógnito/Privado**
   - Teste o app em modo incógnito
   - Se funcionar, o problema são extensões ou cache

4. **Desabilitar Extensões**
   - Desative todas as extensões temporariamente
   - Reative uma por vez para identificar conflitos

### Erro de Autenticação

#### Sintomas
- "Sessão expirada"
- "Token inválido"
- Redirecionamento para login constantemente

#### Soluções

1. **Fazer Logout/Login**
   ```
   1. Clique em seu avatar > Sair
   2. Aguarde 10 segundos
   3. Faça login novamente
   4. Verifique se o problema persiste
   ```

2. **Limpar Storage Local**
   ```
   No navegador:
   F12 > Application > Local Storage > precifica.app
   Clique em "Clear All"
   ```

3. **Verificar Email de Confirmação**
   - Verifique se confirmou seu email
   - Procure por emails na pasta spam
   - Reenvie confirmação se necessário

## 📊 Problemas de Cálculo

### Resultados Incorretos

#### Verificações Básicas

1. **Conferir Dados de Entrada**
   ```
   ✓ Custo em formato correto (100.50)
   ✓ Margem em percentual (30 = 30%)
   ✓ Impostos configurados corretamente
   ✓ Regime tributário selecionado
   ```

2. **Validar Configurações**
   - Acesse Configurações > Negócio
   - Verifique impostos padrão
   - Confirme regime tributário
   - Teste com configurações manuais

#### Problemas Específicos

**Margem muito baixa/alta:**
```
Problema: Margem calculada diferente do esperado
Causa: Impostos/taxas não considerados na base de cálculo
Solução: Revisar método de cálculo nas configurações
```

**Impostos não aplicados:**
```
Problema: Resultado sem impostos
Causa: Regime tributário não configurado
Solução: Configurar regime em Configurações > Negócio
```

### Calculadora Travada

#### Sintomas
- Botão "Calcular" não responde
- Campos não aceitam entrada
- Interface congelada

#### Soluções

1. **Refresh da Página**
   - Pressione F5 ou Ctrl+R
   - Se PWA instalado, feche e reabra

2. **Verificar Console de Erros**
   ```
   1. Pressione F12
   2. Vá para aba "Console"
   3. Procure por erros em vermelho
   4. Capture screenshot e reporte
   ```

3. **Testar Calculadora Básica**
   - Use apenas campos obrigatórios
   - Se funcionar, problema é com campos avançados

## 📈 Problemas de Analytics

### Dashboard não carrega

#### Possíveis Causas
- Problemas de conectividade
- Dados corrompidos
- Cache desatualizado

#### Soluções

1. **Verificar Conexão**
   ```
   1. Teste outros sites
   2. Verifique velocidade da internet
   3. Tente connection móvel (4G/5G)
   ```

2. **Forçar Atualização**
   - Clique no botão "Atualizar" no dashboard
   - Aguarde carregamento completo
   - Verifique se dados aparecem

3. **Verificar Período**
   - Mude o período de análise
   - Teste com "Último mês"
   - Alguns períodos podem ter poucos dados

### Métricas Zeradas

#### Diagnóstico
```
Se todas as métricas mostram zero:
├── Problema de conexão com banco
├── Filtros muito restritivos
└── Dados ainda não processados

Se apenas algumas métricas:
├── Configuração específica
├── Permissões de dados
└── Integração específica
```

#### Soluções

1. **Verificar Filtros**
   - Remova todos os filtros
   - Use período "Tudo"
   - Verifique se dados aparecem

2. **Aguardar Processamento**
   - Dados podem levar até 1h para aparecer
   - Analytics é atualizado a cada 30 minutos
   - Dados históricos podem demorar mais

## 🤖 Problemas de IA

### IA não responde

#### Possíveis Causas
- Cota de API excedida
- Problema temporário do serviço
- Entrada inválida

#### Soluções

1. **Aguardar e Tentar Novamente**
   - Aguarde 1-2 minutos
   - Tente uma pergunta mais simples
   - Verifique se não há caracteres especiais

2. **Reformular Pergunta**
   ```
   ❌ Evite: "Como calcular preço p/ produto xyz com margem alta?"
   ✅ Use: "Qual margem ideal para produtos eletrônicos?"
   ```

3. **Verificar Status do Serviço**
   - Acesse página de status (se disponível)
   - Verifique redes sociais oficiais
   - Entre em contato com suporte

### Recomendações Inconsistentes

#### Sintomas
- IA sugere preços muito altos/baixos
- Recomendações contraditórias
- Confiança muito baixa (<50%)

#### Soluções

1. **Fornecer Mais Contexto**
   ```
   Em vez de apenas "Smartphone"
   Use: "Smartphone Samsung Galaxy A54, custo R$ 800, mercado classe B"
   ```

2. **Validar Dados de Entrada**
   - Custo realista para o produto
   - Categoria correta
   - Marketplace específico

3. **Considerar Como Sugestão**
   - IA oferece ponto de partida
   - Sempre validar com conhecimento do mercado
   - Usar como segunda opinião

## 📱 Problemas PWA/Mobile

### PWA não instala

#### No Android

1. **Verificar Navegador**
   - Use Chrome ou Edge
   - Firefox pode ter problemas
   - Atualize para versão mais recente

2. **Verificar Configurações**
   ```
   Chrome > Configurações > Site Settings
   > Notifications > Permitir
   > Pop-ups > Permitir para precifica.app
   ```

#### No iOS

1. **Usar Safari**
   - PWA no iOS só funciona no Safari
   - Chrome/Firefox não suportam instalação

2. **Seguir Passos Corretos**
   ```
   1. Abra site no Safari
   2. Toque no botão compartilhar
   3. Role até "Adicionar à Tela Inicial"
   4. Confirme instalação
   ```

### App Offline não funciona

#### Verificações

1. **Teste de Conectividade**
   ```
   1. Abra o app
   2. Desligue WiFi/dados móveis
   3. Teste calculadora básica
   4. Deve funcionar normalmente
   ```

2. **Verificar Service Worker**
   ```
   F12 > Application > Service Workers
   Deve mostrar service worker ativo
   ```

3. **Limpar Cache do App**
   ```
   Configurações > Storage > precifica.app
   Limpar cache (mas não dados)
   ```

## 🔐 Problemas de Segurança

### Suspeita de Conta Comprometida

#### Sinais de Alerta
- Login de locais desconhecidos
- Configurações alteradas sem seu conhecimento
- Cálculos que você não fez no histórico

#### Ações Imediatas

1. **Alterar Senha**
   ```
   1. Configurações > Segurança > Alterar Senha
   2. Use senha forte e única
   3. Não reutilize de outros sites
   ```

2. **Verificar Sessões Ativas**
   - Veja todos os dispositivos logados
   - Desconecte dispositivos desconhecidos
   - Ative 2FA se disponível

3. **Verificar Configurações**
   - Revise todas as configurações
   - Verifique integrações ativas
   - Confirme dados de contato

### Problemas de Privacidade

#### Dados sendo compartilhados
- Revise configurações de privacidade
- Desative integrações desnecessárias
- Entre em contato para esclarecimentos

## 🌐 Problemas de Conexão

### Site lento/instável

#### Diagnóstico de Rede

1. **Teste de Velocidade**
   ```
   Use speedtest.net para verificar:
   - Download > 10 Mbps (mínimo)
   - Upload > 1 Mbps (mínimo)  
   - Latência < 100ms (ideal)
   ```

2. **Teste de DNS**
   ```
   Tente usar DNS público:
   - Google: 8.8.8.8 e 8.8.4.4
   - Cloudflare: 1.1.1.1 e 1.0.0.1
   ```

#### Otimizações

1. **Fechar Abas Desnecessárias**
   - Cada aba consome recursos
   - Feche outros apps pesados

2. **Verificar Extensões**
   - AdBlocks podem interferir
   - VPNs podem causar lentidão
   - Desative temporariamente para testar

### Timeouts/Desconexões

#### Soluções Temporárias

1. **Refresh Periódico**
   - Recarregue a página se instável
   - Salve trabalho importante frequently

2. **Modo Offline**
   - Use calculadora básica offline
   - Sincronize quando conexão melhorar

## 🛠️ Ferramentas de Diagnóstico

### Console do Navegador

```javascript
// Verificar estado da aplicação
console.log(localStorage.getItem('supabase.auth.token'));
console.log(navigator.onLine); // Status da conexão
console.log(navigator.serviceWorker.controller); // Service Worker
```

### Verificação de Saúde

1. **Acesse** Configurações > Sistema > Diagnóstico
2. **Execute** teste de conectividade
3. **Verifique** todos os serviços
4. **Exporte** relatório se necessário

### Informações do Sistema

```
Para reportar problemas, inclua:
├── Navegador e versão
├── Sistema operacional  
├── Versão do app
├── Passos para reproduzir
└── Screenshots dos erros
```

## 📞 Quando Contatar o Suporte

### Problemas que Exigem Suporte

- ❌ App não carrega após seguir todas as soluções
- ❌ Dados perdidos ou corrompidos
- ❌ Problemas de cobrança/pagamento
- ❌ Suspeita de bug no sistema
- ❌ Solicitações de recursos/melhorias

### Informações para Incluir

```
Título: [Problema] - Descrição curta

Descrição:
1. O que você tentava fazer?
2. O que aconteceu de errado?
3. Já tentou as soluções do guia?
4. Quando começou o problema?

Ambiente:
- Navegador: Chrome 120.0
- SO: Windows 11
- Dispositivo: Desktop/Mobile
- Versão do app: 1.2.3
```

### Canais de Suporte

1. **Chat Online**: Resposta imediata
2. **Email**: suporte@precifica.app
3. **WhatsApp**: +55 11 99999-9999
4. **Discord**: Comunidade técnica

---

## ✅ Checklist de Solução

Antes de contatar o suporte, verifique:

- [ ] Tentei recarregar a página (F5)
- [ ] Testei em modo incógnito
- [ ] Limpei cache do navegador
- [ ] Verifiquei conexão com internet
- [ ] Testei em outro navegador
- [ ] Consultei este guia de troubleshooting
- [ ] Verifiquei se não é manutenção programada

Se nada funcionar, nosso suporte está aqui para ajudar! 🚀
