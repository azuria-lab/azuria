# 🚀 Release Workflow - Documentação Técnica

## 📋 Visão Geral

O workflow de release foi projetado para ser **robusto, previsível e profissional**, executando apenas quando uma tag de versão é criada e garantindo que o CI principal esteja 100% verde antes de prosseguir.

## 🎯 Objetivos do Workflow

1. **Não executar em todo push** - Apenas em tags `v*.*.*`
2. **Dependência do CI** - Só executa se o CI principal estiver verde
3. **Validações rigorosas** - Tag, permissões e token são validados
4. **Artefatos versionados** - Build, SBOM e licenças incluídos
5. **Não quebrar pipeline** - Falhas do release não afetam o CI principal

## 🔄 Fluxo do Release

```
┌─────────────────┐
│  Tag Criada     │  v1.0.0
│  (v*.*.*)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Job: validate  │  ✅ Valida tag, token, permissões
│                 │  ✅ Verifica se CI está verde
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   ✅        ❌
    │         │
    ▼         ▼
┌─────────┐  ┌──────────────┐
│ release │  │ Notificação  │
│         │  │ de Falha     │
└────┬────┘  └──────────────┘
     │
     ▼
┌─────────────────┐
│  Build          │
│  SBOM           │
│  Licenças       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Release │
│  com Artefatos  │
└─────────────────┘
```

## 🏗️ Estrutura do Workflow

### 1. Trigger (`on:`)

```yaml
on:
  push:
    tags:
      - 'v*.*.*'  # Padrão semântico: v1.0.0, v2.1.3, etc.
  workflow_dispatch:
    inputs:
      tag:
        description: 'Tag de versão (ex: v1.0.0)'
        required: true
```

**Decisão Técnica:**
- Usa `push: tags: ['v*.*.*']` para capturar apenas tags de versão
- Suporta `workflow_dispatch` para execução manual com validação
- Padrão `v*.*.*` garante versionamento semântico

### 2. Job: `validate`

**Responsabilidades:**
- ✅ Extrair e validar formato da tag
- ✅ Verificar se `GITHUB_TOKEN` está configurado
- ✅ Validar permissões do workflow
- ✅ **Verificar se o CI principal está verde** (crítico!)

**Validação do CI:**
```javascript
// Busca o workflow run do CI para o commit da tag
const { data: runs } = await github.rest.actions.listWorkflowRuns({
  workflow_id: 'ci.yml',
  head_sha: commitSha
});

// Verifica se está completo e com sucesso
if (status !== 'completed' || conclusion !== 'success') {
  throw new Error('CI não está verde!');
}
```

**Decisão Técnica:**
- Usa `actions/github-script@v7` para acessar a API do GitHub
- Busca o workflow run do CI pelo commit SHA da tag
- Falha com mensagem clara se CI não estiver verde

### 3. Job: `release`

**Dependências:**
```yaml
needs: validate
if: needs.validate.outputs.is-valid == 'true'
```

**Decisão Técnica:**
- Usa `needs:` para garantir que validação passe primeiro
- `if:` condicional previne execução se validação falhar
- `continue-on-error: false` garante que falhas sejam reportadas

**Etapas:**
1. **Checkout** - Código completo (fetch-depth: 0)
2. **Setup Node.js** - Versão 20 com cache
3. **Build** - `npm run build`
4. **SBOM** - Software Bill of Materials
5. **Licenças** - Inventário de terceiros
6. **Artefatos** - Preparação versionada
7. **GitHub Release** - Criação com assets

### 4. Artefatos Versionados

```yaml
name: release-artifacts-${{ needs.validate.outputs.tag }}
```

**Estrutura:**
```
release-artifacts/
├── dist/                    # Build da aplicação
├── sbom.json                # SBOM (CycloneDX)
├── THIRD_PARTY_LICENSES.md  # Licenças
├── VERSION.txt              # Versão (1.0.0)
└── TAG.txt                  # Tag (v1.0.0)
```

**Decisão Técnica:**
- Nome do artifact inclui a tag para versionamento
- `retention-days: 90` para histórico
- Arquivos de versão para referência

## 🛡️ Validações e Segurança

### Validação de Tag

```bash
# Formato esperado: v1.0.0 ou v1.0.0-beta.1
if [[ ! "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-.*)?$ ]]; then
  echo "❌ ERRO: Tag inválida"
  exit 1
fi
```

### Validação de Token

```bash
if [ -z "${{ secrets.GITHUB_TOKEN }}" ]; then
  echo "❌ ERRO: GITHUB_TOKEN não configurado"
  exit 1
fi
```

### Validação do CI

- Busca workflow run do CI pelo commit SHA
- Verifica `status === 'completed'`
- Verifica `conclusion === 'success'`
- Falha com mensagem clara se não passar

## 🔐 Permissões

```yaml
permissions:
  contents: write      # Criar releases e tags
  issues: write        # Fechar issues automaticamente
  pull-requests: write # Comentar em PRs
  id-token: write      # OIDC para segurança
```

**Decisão Técnica:**
- Permissões mínimas necessárias (princípio de menor privilégio)
- `id-token: write` para OIDC (melhor prática de segurança)

## 🚨 Tratamento de Erros

### Mensagens Claras

Cada validação falha com mensagem específica:
- ❌ `Tag inválida: xyz` → `Formato esperado: v1.0.0`
- ❌ `GITHUB_TOKEN não configurado`
- ❌ `CI não está verde (conclusão: failure)`

### Não Quebrar Pipeline Principal

```yaml
continue-on-error: false  # No job release
```

**Decisão Técnica:**
- Release falha explicitamente (não silenciosamente)
- Job de notificação opcional para falhas
- CI principal não é afetado (workflows separados)

## 📊 Concurrency

```yaml
concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false
```

**Decisão Técnica:**
- `cancel-in-progress: false` - Não cancela release em andamento
- Previne releases duplicadas para a mesma tag
- Permite releases simultâneas de tags diferentes

## 🎯 Justificativas Técnicas

### 1. Por que `on: push: tags:` e não `on: release:`?

- `release:` event só dispara após release ser criado (circular)
- `push: tags:` captura criação de tag diretamente
- Permite validações antes de criar release

### 2. Por que verificar CI via API?

- Garante que CI realmente passou (não apenas assumido)
- Busca pelo commit SHA da tag (precisão)
- Falha clara se CI não estiver verde

### 3. Por que `needs:` em vez de `workflow_run:`?

- `needs:` é mais direto e rápido
- `workflow_run:` requer workflow separado
- Melhor controle de dependências dentro do mesmo workflow

### 4. Por que artefatos versionados?

- Histórico de releases
- Download de versões específicas
- Auditoria e compliance (SBOM, licenças)

### 5. Por que `continue-on-error: false`?

- Falhas devem ser explícitas
- Não queremos releases silenciosamente falhadas
- Melhor visibilidade de problemas

## 📝 Exemplo de Uso

### Criar Release Manualmente

```bash
# 1. Criar tag
git tag v1.0.0
git push origin v1.0.0

# 2. Workflow executa automaticamente
# 3. Valida CI, build, cria release
```

### Via GitHub UI

1. Actions → Release → Run workflow
2. Inserir tag: `v1.0.0`
3. Workflow valida e executa

## ✅ Checklist de Release

Antes de criar uma tag, verifique:

- [ ] CI principal está verde
- [ ] Todos os testes passaram
- [ ] Build funciona localmente
- [ ] Tag segue formato `v*.*.*`
- [ ] `GITHUB_TOKEN` está configurado
- [ ] Permissões do workflow estão corretas

## 🔍 Troubleshooting

### "CI não está verde"
- Verifique o workflow run do CI para o commit da tag
- Aguarde CI completar antes de criar tag

### "Tag inválida"
- Use formato: `v1.0.0` ou `v1.0.0-beta.1`
- Não use: `1.0.0`, `v1.0`, `release-1.0.0`

### "GITHUB_TOKEN não configurado"
- Token é criado automaticamente pelo GitHub
- Verifique se workflow tem permissões corretas

### "Release falhou"
- Verifique logs do job `release`
- Build, SBOM ou licenças podem ter falhado
- Artefatos podem estar faltando

## 📚 Referências

- [GitHub Actions - Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases)

