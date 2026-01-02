# ✅ Checklist de Liberação - AbacatePay

Este documento detalha todas as tarefas necessárias para liberar completamente o AbacatePay e habilitar o modo produção.

## 📋 Status Geral

- [x] **1. Conta criada** - ✅ Completo
- [ ] **2. Faça sua primeira transação teste** - ⏳ Próximo passo
- [ ] **3. Complete seus dados** - ⏳ Pendente
- [ ] **4. Registre seu KYC** - ⏳ Pendente
- [ ] **5. Modo produção disponível** - ⏳ Pendente
- [ ] **6. Faça sua primeira venda** - ⏳ Pendente

---

## 🧪 Passo 2: Faça sua primeira transação teste

### Objetivo
Criar e processar uma cobrança de teste para validar a integração.

### Como fazer

#### Opção A: Via Dashboard do AbacatePay (Recomendado para teste rápido)

1. No dashboard do AbacatePay, clique no botão **"Criar link de pagamento"** (visível no passo 2)
2. Preencha os dados:
   - **Valor Total**: R$ 1,00 (valor mínimo para teste)
   - **Selecione um Produto**: Deixe vazio ou selecione um produto existente (opcional)
   - **URL de Retorno**: Use uma das opções abaixo:
     - `https://azuria.app.br/planos` (URL de produção)
     - `http://localhost:8080/planos` (se testando localmente)
     - `https://example.com/return` (qualquer URL válida para teste)
   - **URL de Conclusão**: Use uma das opções abaixo:
     - `https://azuria.app.br/payment/success` (URL de produção)
     - `http://localhost:8080/payment/success` (se testando localmente)
     - `https://example.com/success` (qualquer URL válida para teste)
   - **Cupons**: Deixe desabilitado para o primeiro teste
3. Clique em **"Salvar"**
4. Copie o link de pagamento gerado
5. Abra o link em uma nova aba
6. Complete o pagamento (em modo teste, você pode simular)
7. Volte ao dashboard e verifique se a transação aparece como **"Paga"**

**Nota sobre as URLs:** Como está em **modo teste**, você pode usar qualquer URL válida. O AbacatePay não vai realmente redirecionar para essas URLs em modo teste, mas elas são necessárias para criar o link. Use URLs simples como `https://example.com/return` e `https://example.com/success` se preferir.

#### Opção B: Via Aplicação Azuria (Teste completo da integração)

1. Certifique-se de que a API Key está configurada no Supabase:
   ```bash
   # Verificar se a secret existe
   supabase secrets list
   ```

2. Se não estiver configurada, adicione:
   ```bash
   supabase secrets set ABACATEPAY_API_KEY=abacate_sua_chave_aqui
   ```

3. Acesse a aplicação Azuria em modo desenvolvimento
4. Vá para a página de **Planos** (`/planos`)
5. Selecione um plano (ex: Essencial)
6. Clique em **"Começar agora"**
7. Você será redirecionado para o AbacatePay
8. Complete o pagamento de teste
9. Verifique se foi redirecionado de volta para a aplicação

### Verificação

- [ ] Cobrança criada no dashboard do AbacatePay
- [ ] Link de pagamento gerado com sucesso
- [ ] Pagamento processado (status: "Paga")
- [ ] Webhook recebido (verificar logs do Supabase)
- [ ] Subscription criada no banco de dados (se aplicável)

### Próximo passo
Após completar, o passo 2 será marcado como concluído automaticamente.

---

## 📝 Passo 3: Complete seus dados

### Objetivo
Preencher todas as informações da conta para habilitar funcionalidades avançadas.

### Como fazer

1. No dashboard do AbacatePay, vá em **Configurações > Dados da Conta**
2. Preencha os seguintes campos:

   **Informações Básicas:**
   - [ ] Nome completo ou Razão Social
   - [ ] CPF/CNPJ
   - [ ] Email (já deve estar preenchido)
   - [ ] Telefone de contato
   - [ ] Data de nascimento (se pessoa física)

   **Endereço:**
   - [ ] CEP
   - [ ] Rua/Avenida
   - [ ] Número
   - [ ] Complemento (opcional)
   - [ ] Bairro
   - [ ] Cidade
   - [ ] Estado (UF)

   **Dados Bancários (para saques):**
   - [ ] Banco
   - [ ] Agência
   - [ ] Conta corrente
   - [ ] Tipo de conta (Corrente/Poupança)
   - [ ] CPF/CNPJ do titular

3. Clique em **"Salvar"**

### Verificação

- [ ] Todos os campos obrigatórios preenchidos
- [ ] Dados salvos com sucesso
- [ ] Status do passo 3 atualizado no dashboard

### Próximo passo
Após completar, o passo 3 será marcado como concluído.

---

## 🔐 Passo 4: Registre seu KYC (Know Your Customer)

### Objetivo
Completar a verificação de identidade para habilitar saques e aumentar limites.

### Como fazer

1. No dashboard do AbacatePay, vá em **Configurações > Verificação de Identidade (KYC)**
2. Prepare os documentos necessários:

   **Para Pessoa Física:**
   - [ ] Foto do RG ou CNH (frente e verso)
   - [ ] Selfie segurando o documento
   - [ ] Comprovante de residência (conta de luz, água ou telefone)

   **Para Pessoa Jurídica:**
   - [ ] Contrato Social ou Estatuto
   - [ ] Cartão CNPJ
   - [ ] Documentos dos sócios (RG e CPF)
   - [ ] Comprovante de endereço da empresa

3. Faça upload dos documentos:
   - Certifique-se de que as fotos estão nítidas
   - Todos os dados devem estar legíveis
   - Documentos não podem estar vencidos

4. Aguarde a análise (geralmente 1-3 dias úteis)

### Verificação

- [ ] Todos os documentos enviados
- [ ] Status: "Em análise" ou "Aprovado"
- [ ] Se reprovado, corrigir conforme feedback e reenviar

### Próximo passo
Após aprovação do KYC, o passo 4 será marcado como concluído.

---

## 🚀 Passo 5: Modo produção disponível

### Objetivo
Habilitar o modo produção após completar todas as verificações anteriores.

### Como fazer

1. Certifique-se de que os passos 1-4 estão completos:
   - [x] Conta criada
   - [x] Primeira transação teste realizada
   - [x] Dados completos
   - [x] KYC aprovado

2. No dashboard do AbacatePay, procure por:
   - **"Ativar Modo Produção"** ou
   - **"Solicitar Aprovação para Produção"**

3. Se necessário, entre em contato com o suporte:
   - Email: suporte@abacatepay.com
   - Ou use o chat do dashboard

4. Aguarde a aprovação (pode levar alguns dias)

### Verificação

- [ ] Modo produção habilitado
- [ ] API Key de produção disponível
- [ ] Limites de transação aumentados
- [ ] Saques habilitados

### Configuração no Azuria

Após liberar o modo produção:

1. Obtenha a **API Key de Produção**:
   - Vá em **Configurações > API Keys**
   - Copie a chave de produção (diferente da de teste)

2. Atualize as variáveis de ambiente no Supabase:
   ```bash
   supabase secrets set ABACATEPAY_API_KEY=abacate_prod_sua_chave_aqui
   ```

3. Atualize a variável de modo:
   ```bash
   supabase secrets set VITE_ABACATEPAY_DEV_MODE=false
   ```

4. Faça deploy das Edge Functions novamente:
   ```bash
   supabase functions deploy abacatepay-create-billing
   supabase functions deploy abacatepay-webhook
   supabase functions deploy abacatepay-check-status
   supabase functions deploy abacatepay-renew-subscription
   ```

### Próximo passo
Após habilitar o modo produção, o passo 5 será marcado como concluído.

---

## 💰 Passo 6: Faça sua primeira venda

### Objetivo
Processar a primeira transação real em modo produção.

### Como fazer

1. Certifique-se de que o modo produção está ativo (passo 5)

2. Teste o fluxo completo na aplicação:
   - [ ] Acesse a página de planos em produção
   - [ ] Selecione um plano
   - [ ] Inicie o checkout
   - [ ] Complete o pagamento real (valor mínimo)
   - [ ] Verifique o redirecionamento

3. Verifique no dashboard do AbacatePay:
   - [ ] Transação aparece como "Paga"
   - [ ] Valor disponível para saque atualizado
   - [ ] Webhook processado corretamente

4. Verifique no banco de dados:
   - [ ] Subscription criada/ativada
   - [ ] Status correto
   - [ ] Dados de pagamento salvos

### Verificação

- [ ] Primeira transação real processada
- [ ] Pagamento confirmado
- [ ] Subscription ativada no sistema
- [ ] Webhook funcionando corretamente

### Próximo passo
Após completar, o passo 6 será marcado como concluído e o AbacatePay estará totalmente liberado!

---

## 🔧 Configurações Adicionais Recomendadas

### Webhook

Certifique-se de que o webhook está configurado:

1. No dashboard do AbacatePay, vá em **INTEGRAÇÃO > Webhook**
2. Adicione a URL:
   ```
   https://[seu-projeto-id].supabase.co/functions/v1/abacatepay-webhook
   ```
3. Selecione os eventos:
   - ✅ `billing.paid`
   - ✅ `billing.refunded`
   - ✅ `billing.expired`
   - ✅ `billing.created` (opcional)

### Notificações

Configure notificações por email:
- [ ] Notificações de pagamentos recebidos
- [ ] Notificações de saques processados
- [ ] Alertas de segurança

### Segurança

- [ ] Ative autenticação de dois fatores (2FA)
- [ ] Configure limites de transação
- [ ] Revise permissões de API

---

## 📞 Suporte

Se encontrar problemas em qualquer etapa:

1. **Documentação**: https://docs.abacatepay.com
2. **Suporte**: suporte@abacatepay.com
3. **Chat**: Disponível no dashboard
4. **Status**: https://status.abacatepay.com

---

## ✅ Checklist Final

Antes de considerar o AbacatePay totalmente liberado:

- [ ] Todos os 6 passos completos
- [ ] Modo produção ativo
- [ ] Webhook configurado e funcionando
- [ ] Primeira transação real processada
- [ ] Integração testada end-to-end
- [ ] Documentação atualizada
- [ ] Equipe treinada no uso do sistema

---

**Última atualização:** 2025-01-27  
**Versão:** 1.0

