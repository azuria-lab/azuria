# 🚀 Setup de Release e Deploy Automático

## 📋 Visão Geral

O workflow de release agora está configurado para:

1. **Semantic Release Automático**: Versionamento baseado em conventional commits
2. **Deploy Automático**: Deploy para Vercel após release bem-sucedido

## 🔧 Configuração Necessária

### 1. Secrets do GitHub

Configure os seguintes secrets no GitHub (Settings → Secrets and variables → Actions):

#### Obrigatórios:

```bash
VERCEL_TOKEN=seu_vercel_token
VERCEL_ORG_ID=seu_org_id
VERCEL_PROJECT_ID=seu_project_id
```

#### Como obter:

**VERCEL_TOKEN:**
1. Acesse: https://vercel.com/account/tokens
2. Clique em "Create Token"
3. Nome: `github-actions-release`
4. Scope: Full Account
5. Copie o token gerado

**VERCEL_ORG_ID e VERCEL_PROJECT_ID:**
1. Acesse: https://vercel.com/your-team/settings
2. Vá em "General" → "Team ID" (é o ORG_ID)
3. Para PROJECT_ID:
   - Acesse seu projeto no Vercel
   - Vá em Settings → General
   - O Project ID está visível na página

Ou via CLI:
```bash
vercel link
# Isso mostra o ORG_ID e PROJECT_ID
```

### 2. Verificar Configuração do Semantic Release

O arquivo `.releaserc.json` está configurado para:
- ✅ Analisar commits (conventional commits)
- ✅ Gerar changelog automaticamente
- ✅ Atualizar `package.json` com nova versão
- ✅ Criar tag e release no GitHub
- ✅ Commitar mudanças automaticamente

## 🔄 Como Funciona

### Fluxo Automático:

```
1. Push para main com commits convencionais
   ↓
2. CI executa e valida
   ↓
3. Release workflow verifica se CI passou
   ↓
4. Semantic-release analisa commits
   ↓
5. Se houver mudanças que gerem release:
   - Gera nova versão (1.0.0 → 1.0.1)
   - Atualiza CHANGELOG.md
   - Atualiza package.json
   - Cria tag (v1.0.1)
   - Cria release no GitHub
   ↓
6. Deploy automático para Vercel (produção)
```

### Tipos de Commits que Geram Release:

- `feat:` → **Minor** (1.0.0 → 1.1.0)
- `fix:` → **Patch** (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → **Major** (1.0.0 → 2.0.0)

### Exemplo de Uso:

```bash
# Feature que gera minor release
git commit -m "feat: adicionar calculadora de impostos"
git push origin main

# Fix que gera patch release
git commit -m "fix: corrigir cálculo de margem"
git push origin main

# Breaking change que gera major release
git commit -m "feat: refatorar API

BREAKING CHANGE: API agora requer autenticação"
git push origin main
```

## ✅ Verificação

### Verificar se Release Funcionou:

1. **GitHub Releases**: https://github.com/azuria-lab/azuria/releases
   - Deve aparecer nova release com changelog

2. **CHANGELOG.md**: Deve estar atualizado

3. **package.json**: Versão deve estar atualizada

4. **Tags**: Nova tag deve existir (ex: `v1.0.1`)

5. **Vercel**: Deploy deve aparecer no dashboard

### Verificar se Deploy Funcionou:

1. **Vercel Dashboard**: https://vercel.com/azurias-projects-ea27c6b3/azuria
   - Deve aparecer novo deployment

2. **URL de Produção**: https://azuria.app.br
   - Deve estar atualizado

## 🐛 Troubleshooting

### Release não cria nova versão:

- Verifique se os commits seguem conventional commits
- Verifique se há mudanças desde a última release
- Veja logs do workflow para detalhes

### Deploy não executa:

- Verifique se secrets estão configurados
- Verifique se release foi criado com sucesso
- Veja logs do job `deploy`

### Erro de permissões no Vercel:

- Verifique se `VERCEL_TOKEN` tem permissões corretas
- Verifique se `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` estão corretos

## 📚 Referências

- [Semantic Release](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vercel CLI](https://vercel.com/docs/cli)

