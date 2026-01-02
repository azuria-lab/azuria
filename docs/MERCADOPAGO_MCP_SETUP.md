# 🔌 Configuração Mercado Pago MCP Server - Cursor

**Data**: Janeiro 2025  
**Objetivo**: Conectar Cursor ao Mercado Pago MCP Server para acelerar integração  
**Fonte**: Documentação oficial do Mercado Pago

---

## 🎯 O Que é o Mercado Pago MCP Server?

O MCP Server do Mercado Pago é uma ferramenta de IA que:
- ✅ Fornece documentação dos checkouts dentro do IDE
- ✅ Sugere código para integração
- ✅ Avalia a qualidade da integração
- ✅ Acelera o desenvolvimento

---

## 📋 Pré-requisitos

1. ✅ Conta no Mercado Pago (pode ser de teste)
2. ✅ Cursor IDE instalado

---

## 🚀 Passo 1: Instalação Automática (Recomendado)

### Método Rápido: Botão de Instalação

1. Acesse a documentação do Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs/mcp-server
2. Clique no botão **"Install MCP Server"** na seção do Cursor
3. Isso abrirá o Cursor automaticamente e iniciará a configuração

**Vantagem**: Configuração automática via OAuth (não precisa de Access Token manualmente)

---

## ⚙️ Passo 2: Instalação Manual

### 2.1 Criar Arquivo de Configuração

1. No projeto, crie o arquivo: `.cursor/mcp.json`
2. Adicione a seguinte configuração:

```json
{
  "mcpServers": {
    "mercadopago-mcp-server": {
      "url": "https://mcp.mercadopago.com/mcp"
    }
  }
}
```

**Nota**: Para Cursor, não é necessário incluir o Access Token no arquivo. A autenticação será feita via OAuth.

### 2.2 Habilitar no Cursor

1. Acesse: **Cursor Settings** → **Tools & MCPs**
2. Procure por **"mercadopago-mcp-server"** na lista
3. Clique em **"Connect"** para habilitar

### 2.3 Autenticação OAuth

Ao clicar em **"Connect"**:
1. Você será redirecionado para o site do Mercado Pago
2. Selecione o **país** de operação
3. Revise as permissões solicitadas
4. Clique em **"Autorizar"** para permitir a conexão
5. Você será redirecionado automaticamente de volta ao Cursor
6. A conexão estará pronta! ✅

---

## 🔧 Configuração Alternativa (com Access Token)

Se preferir usar Access Token diretamente (não recomendado para Cursor, mas funciona):

### Obter Access Token

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em: **"Suas integrações" → "Detalhes da aplicação"**
3. Em **"Testes"** ou **"Produção"**, copie o **Access Token**

### Configuração com Token

```json
{
  "mcpServers": {
    "mercadopago-mcp-server": {
      "url": "https://mcp.mercadopago.com/mcp",
      "headers": {
        "Authorization": "Bearer SEU_ACCESS_TOKEN_AQUI"
      }
    }
  }
}
```

**⚠️ IMPORTANTE**: 
- Use credenciais de TESTE primeiro
- Nunca commite tokens no código!
- Prefira usar OAuth quando possível

---

## 🔒 Passo 3: Segurança (IMPORTANTE!)

### 3.1 Usar Variáveis de Ambiente

**NÃO coloque o token diretamente no arquivo de configuração!**

Use variáveis de ambiente:

```json
{
  "mcpServers": {
    "mercadopago": {
      "url": "https://mcp.mercadopago.com/mcp",
      "headers": {
        "Authorization": "Bearer ${MERCADOPAGO_ACCESS_TOKEN}"
      }
    }
  }
}
```

### 3.2 Configurar Variável de Ambiente

**Windows (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable("MERCADOPAGO_ACCESS_TOKEN", "TEST-seu-token", "User")
```

**Mac/Linux:**
```bash
echo 'export MERCADOPAGO_ACCESS_TOKEN="TEST-seu-token"' >> ~/.zshrc
source ~/.zshrc
```

### 3.3 Adicionar ao .gitignore

Certifique-se de que arquivos de configuração MCP estão no `.gitignore`:

```gitignore
# MCP Configurations
**/mcp.json
**/.cursor/mcp.json
**/globalStorage/mcp.json
```

---

## ✅ Passo 3: Verificar Conexão

### 3.1 Testar no Cursor

1. Após a autenticação OAuth, o MCP estará automaticamente conectado
2. Abra o chat do Cursor
3. Teste com uma consulta à documentação:

```
Busque na documentação do Mercado Pago como integrar o Checkout Pro.
```

Ou pergunte:
- "Como criar um checkout transparente?"
- "Mostre exemplos de código para assinaturas"
- "Avalie minha integração atual"

### 3.2 Verificar Status

1. Vá em: **Cursor Settings** → **Tools & MCPs**
2. Verifique se **"mercadopago-mcp-server"** aparece como **"Connected"** ou **"Enabled"**
3. Se aparecer erro, clique em **"Refresh"** para atualizar

### 3.3 Troubleshooting

Se não funcionar, verifique:
- ✅ Arquivo `.cursor/mcp.json` existe e está correto
- ✅ URL está correta: `https://mcp.mercadopago.com/mcp`
- ✅ Autenticação OAuth foi concluída
- ✅ Cursor foi reiniciado após configuração (se necessário)

---

## 🚀 Funcionalidades Disponíveis

Após conectar, você poderá:

### 1. Documentação Facilitada
- Acessar documentação dos checkouts dentro do IDE
- Ver exemplos de código diretamente
- Consultar referências da API

### 2. Sugestões de Código
- IA sugere código para integração
- Autocomplete melhorado
- Exemplos contextuais

### 3. Avaliação de Integração
- Receber recomendações para melhorar qualidade
- Identificar problemas potenciais
- Sugestões de otimização

---

## 📝 Exemplo de Uso

Após configurar, você pode usar assim no chat do Cursor:

```
"Usando o Mercado Pago MCP, mostre como criar 
uma assinatura recorrente mensal de R$ 59,00"
```

Ou:

```
"Avalie minha integração atual do Mercado Pago 
e sugira melhorias"
```

---

## 🔧 Troubleshooting

### Problema: MCP não conecta

**Soluções:**
1. Verifique se o token está correto
2. Certifique-se de que a URL está correta
3. Reinicie o Cursor
4. Verifique logs do Cursor (Help → Toggle Developer Tools)

### Problema: Token inválido

**Soluções:**
1. Gere um novo token no dashboard do Mercado Pago
2. Certifique-se de usar o token correto (TEST vs PRODUCTION)
3. Verifique se o token não expirou

### Problema: Cursor não reconhece MCP

**Soluções:**
1. Verifique se está usando versão recente do Cursor
2. Atualize o Cursor para última versão
3. Verifique se MCP está habilitado nas configurações

---

## 📚 Recursos Adicionais

- **Documentação Mercado Pago**: https://www.mercadopago.com.br/developers/pt/docs
- **MCP Server Docs**: https://www.mercadopago.com.br/developers/pt/docs/mcp-server
- **Status do Serviço**: https://status.mercadopago.com.br

---

## 🔄 Próximos Passos

Após conectar o MCP:

1. ✅ Testar funcionalidades básicas
2. ✅ Explorar documentação disponível
3. ✅ Usar sugestões de código para acelerar integração
4. ✅ Avaliar integração atual com IA

---

**Última atualização**: Janeiro 2025  
**Status**: 🟢 Pronto para configurar

