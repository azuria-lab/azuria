# ⚡ Quick Start - Mercado Pago MCP Server

## 🚀 Configuração Rápida (3 minutos)

### Método 1: Instalação Automática (Recomendado) ⚡

1. Acesse: https://www.mercadopago.com.br/developers/pt/docs/mcp-server
2. Na seção **"Cursor"**, clique no botão **"Install MCP Server"**
3. O Cursor abrirá automaticamente e iniciará a configuração
4. Você será redirecionado para autenticação OAuth
5. Autorize a conexão
6. Pronto! ✅

### Método 2: Instalação Manual

1. **Criar arquivo de configuração**:
   - Crie: `.cursor/mcp.json` na raiz do projeto
   - Adicione:

```json
{
  "mcpServers": {
    "mercadopago-mcp-server": {
      "url": "https://mcp.mercadopago.com/mcp"
    }
  }
}
```

2. **Habilitar no Cursor**:
   - Vá em: **Cursor Settings** → **Tools & MCPs**
   - Procure: **"mercadopago-mcp-server"**
   - Clique: **"Connect"**

3. **Autenticar**:
   - Você será redirecionado para o Mercado Pago
   - Selecione o país
   - Autorize a conexão
   - Retornará automaticamente ao Cursor

### 3. Testar

No chat do Cursor, teste:

```
Busque na documentação do Mercado Pago como integrar o Checkout Pro.
```

Ou pergunte:
- "Como criar um checkout transparente?"
- "Mostre exemplos de código para assinaturas recorrentes"

---

## ✅ Pronto!

Agora você pode usar o Mercado Pago MCP Server para:
- 📖 Acessar documentação dentro do IDE
- 💡 Receber sugestões de código
- 🔍 Avaliar sua integração

---

## 📚 Documentação Oficial

- **Guia Completo**: https://www.mercadopago.com.br/developers/pt/docs/mcp-server
- **Ferramentas Disponíveis**: Consulte a documentação para ver todas as tools disponíveis

