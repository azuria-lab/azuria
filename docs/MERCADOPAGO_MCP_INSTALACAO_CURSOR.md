# 🚀 Instalação Mercado Pago MCP - Cursor (Guia Oficial)

**Baseado na documentação oficial do Mercado Pago**

---

## ⚡ Método Rápido: Instalação Automática

### Passo 1: Usar Botão de Instalação

1. Acesse: https://www.mercadopago.com.br/developers/pt/docs/mcp-server
2. Na seção **"Cursor"**, clique no botão:
   ```
   [Install MCP Server]
   ```
3. O Cursor abrirá automaticamente e iniciará a configuração

**Vantagem**: Tudo é feito automaticamente via OAuth! ✅

---

## 🔧 Método Manual: Configuração Passo a Passo

### Passo 1: Criar Arquivo de Configuração

1. Na raiz do projeto, crie o arquivo: `.cursor/mcp.json`
2. Adicione o seguinte conteúdo:

```json
{
  "mcpServers": {
    "mercadopago-mcp-server": {
      "url": "https://mcp.mercadopago.com/mcp"
    }
  }
}
```

**Importante**: 
- ✅ Não precisa de Access Token no arquivo (usa OAuth)
- ✅ O nome deve ser exatamente `mercadopago-mcp-server`
- ✅ A URL é: `https://mcp.mercadopago.com/mcp`

### Passo 2: Habilitar no Cursor

1. Abra: **Cursor Settings** → **Tools & MCPs**
2. Procure por: **"mercadopago-mcp-server"** na lista de servidores
3. Clique no botão: **"Connect"**

### Passo 3: Autenticação OAuth

Ao clicar em **"Connect"**:

1. **Redirecionamento Automático**: Você será redirecionado para o site do Mercado Pago
2. **Selecionar País**: Escolha o país de operação (Brasil)
3. **Revisar Permissões**: Veja quais permissões estão sendo solicitadas
4. **Autorizar**: Clique em **"Autorizar"** para permitir a conexão
5. **Retorno Automático**: Você será redirecionado de volta ao Cursor
6. **Conexão Pronta**: O MCP estará conectado! ✅

---

## ✅ Verificar Conexão

### Teste Rápido

No chat do Cursor, digite:

```
Busque na documentação do Mercado Pago como integrar o Checkout Pro.
```

Se funcionar, você verá a resposta com informações da documentação oficial!

### Verificar Status

1. Vá em: **Cursor Settings** → **Tools & MCPs**
2. Procure: **"mercadopago-mcp-server"**
3. Deve aparecer como: **"Connected"** ou **"Enabled"** ✅

---

## 🎯 Funcionalidades Disponíveis

Após conectar, você terá acesso a:

### 1. Buscar Documentação
```
Busque na documentação do Mercado Pago como criar assinaturas recorrentes.
```

### 2. Sugestões de Código
```
Mostre exemplos de código para integrar Checkout Transparente.
```

### 3. Avaliar Integração
```
Avalie minha integração atual do Mercado Pago e sugira melhorias.
```

---

## 🔧 Troubleshooting

### Problema: MCP não aparece na lista

**Solução:**
1. Verifique se o arquivo `.cursor/mcp.json` existe
2. Verifique se o JSON está correto (sem erros de sintaxe)
3. Clique em **"Refresh"** nas configurações do Cursor
4. Reinicie o Cursor

### Problema: Erro ao conectar

**Solução:**
1. Verifique se a URL está correta: `https://mcp.mercadopago.com/mcp`
2. Verifique sua conexão com a internet
3. Tente novamente o processo de autenticação OAuth

### Problema: Autenticação OAuth falha

**Solução:**
1. Certifique-se de estar logado no Mercado Pago
2. Verifique se tem permissões na conta
3. Tente em um navegador diferente
4. Limpe cookies e cache do navegador

---

## 📝 Estrutura do Arquivo

O arquivo `.cursor/mcp.json` deve ter esta estrutura exata:

```json
{
  "mcpServers": {
    "mercadopago-mcp-server": {
      "url": "https://mcp.mercadopago.com/mcp"
    }
  }
}
```

**Notas importantes:**
- ✅ Nome do servidor: `mercadopago-mcp-server` (exatamente assim)
- ✅ URL: `https://mcp.mercadopago.com/mcp`
- ✅ Não precisa de `headers` ou `Authorization` (usa OAuth)
- ✅ O arquivo está no `.gitignore` (não será commitado)

---

## 🔒 Segurança

- ✅ O arquivo `.cursor/mcp.json` está no `.gitignore`
- ✅ Autenticação via OAuth (mais seguro que tokens)
- ✅ Não precisa armazenar Access Token no código
- ✅ Permissões são gerenciadas pelo Mercado Pago

---

## 📚 Recursos

- **Documentação Oficial**: https://www.mercadopago.com.br/developers/pt/docs/mcp-server
- **Mercado Pago Developers**: https://www.mercadopago.com.br/developers
- **Status do Serviço**: https://status.mercadopago.com.br

---

**Última atualização**: Janeiro 2025  
**Status**: 🟢 Pronto para usar

