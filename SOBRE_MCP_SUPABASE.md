# 🔌 Sobre MCP Server e Extensões Supabase

**Data**: Janeiro 2025

---

## ❌ Status Atual: Não Existe MCP Server Oficial

**Resposta Direta**: Não existe um MCP Server oficial do Supabase para Cursor ainda.

---

## ✅ Alternativas Disponíveis

### 1. **Supabase CLI** (Recomendado) ✅

**Vantagens**:
- ✅ Oficial do Supabase
- ✅ Funciona via terminal
- ✅ Pode ser usado no Cursor
- ✅ Suporta todas as operações

**Comandos Úteis**:
```bash
# Linkar projeto
supabase link --project-ref seu-project-ref

# Aplicar migrações
supabase db push

# Ver status
supabase status

# Gerar tipos TypeScript
supabase gen types typescript --project-id seu-project-ref > src/types/supabase.ts
```

---

### 2. **Supabase Dashboard** ✅

**Vantagens**:
- ✅ Interface visual
- ✅ SQL Editor integrado
- ✅ Gerenciamento completo
- ✅ Acesso direto ao banco

**URL**: https://supabase.com/dashboard/project/seu-project-ref

---

### 3. **Extensões VS Code** (Podem funcionar no Cursor)

#### Extensão Não-Oficial:
- **Nome**: `supabase.supabase-vscode`
- **Funcionalidades**:
  - Autocomplete SQL
  - Queries diretas
  - Gerenciamento de tabelas

**Nota**: Cursor é baseado em VS Code, então extensões podem funcionar.

---

## 🔧 Como Configurar MCP Customizado (Futuro)

Se quiser criar um MCP Server customizado para Supabase:

### Estrutura Básica:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["path/to/supabase-mcp-server.js"],
      "env": {
        "SUPABASE_URL": "sua-url",
        "SUPABASE_KEY": "sua-key"
      }
    }
  }
}
```

### Funcionalidades Possíveis:
- ✅ Executar queries SQL
- ✅ Gerenciar tabelas
- ✅ Aplicar migrações
- ✅ Ver schema
- ✅ Gerar tipos

---

## 💡 Recomendação

**Para Agora**:
- ✅ Use **Supabase CLI** via terminal
- ✅ Use **Supabase Dashboard** para visualização
- ✅ Configure scripts npm para facilitar

**Para Futuro**:
- ⏳ Aguarde MCP Server oficial (se lançarem)
- ⏳ Ou crie servidor customizado se necessário

---

## 📝 Scripts Úteis (já configurados)

Você já tem scripts npm configurados:

```bash
# Desenvolvimento
npm run dev:cloud

# Supabase Local
npm run supabase:start
npm run supabase:status
npm run supabase:stop

# Migrações
supabase db push  # Aplicar no Cloud
```

---

**Conclusão**: Use Supabase CLI e Dashboard por enquanto. MCP Server oficial ainda não existe, mas pode ser criado customizado se necessário.

