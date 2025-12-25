# 🧪 Como Testar o Release Automático

## ✅ Status Atual

- ✅ Semantic Release configurado
- ✅ Deploy automático configurado
- ✅ Secrets do Vercel cadastrados
- ✅ Workflow pronto para uso

## 🚀 Teste Rápido

### Opção 1: Commit de Feature (Recomendado)

Crie um commit que gere uma **minor release** (1.0.0 → 1.1.0):

```bash
# Fazer uma mudança pequena (ex: adicionar comentário)
echo "# Teste" >> README.md

# Commit com conventional commit
git add README.md
git commit -m "feat: adicionar teste de release automático"
git push origin main
```

**O que vai acontecer:**
1. CI executa (lint, tests, build)
2. Se CI passar → Release workflow executa
3. Semantic-release detecta `feat:` → Gera minor release
4. Cria tag (ex: v1.0.1), atualiza CHANGELOG, cria release
5. Deploy automático para Vercel

### Opção 2: Commit de Fix (Patch Release)

```bash
git commit -m "fix: corrigir typo no README"
git push origin main
```

Gera **patch release** (1.0.0 → 1.0.1)

### Opção 3: Breaking Change (Major Release)

```bash
git commit -m "feat: refatorar estrutura de pastas

BREAKING CHANGE: Estrutura de pastas foi reorganizada"
git push origin main
```

Gera **major release** (1.0.0 → 2.0.0)

## 📊 Como Verificar

### 1. GitHub Actions

Acesse: https://github.com/azuria-lab/azuria/actions

Você deve ver:
- ✅ Workflow "CI" executando
- ✅ Workflow "Release" executando (após CI passar)

### 2. GitHub Releases

Acesse: https://github.com/azuria-lab/azuria/releases

Você deve ver:
- ✅ Nova release criada automaticamente
- ✅ Changelog gerado automaticamente
- ✅ Artefatos anexados (dist, SBOM, licenças)

### 3. CHANGELOG.md

```bash
git pull origin main
cat CHANGELOG.md
```

Deve estar atualizado com a nova versão.

### 4. package.json

```bash
cat package.json | grep version
```

Versão deve estar atualizada.

### 5. Tags

```bash
git fetch --tags
git tag -l
```

Nova tag deve aparecer (ex: v1.0.1)

### 6. Vercel Dashboard

Acesse: https://vercel.com/azurias-projects-ea27c6b3/azuria

Você deve ver:
- ✅ Novo deployment em produção
- ✅ URL atualizada

## ⚠️ Se Nada Acontecer

### Semantic-release não cria release?

**Possíveis causas:**
- Commits não seguem conventional commits
- Não há mudanças desde a última release
- CI ainda está executando (aguarde)

**Solução:**
- Verifique logs do workflow "Release"
- Certifique-se de usar `feat:`, `fix:`, etc.

### Deploy não executa?

**Possíveis causas:**
- Nenhuma nova versão foi publicada
- Secrets do Vercel incorretos
- Permissões insuficientes

**Solução:**
- Verifique se release foi criado
- Verifique logs do job "Deploy"
- Confirme secrets no GitHub

## 🎯 Próximo Passo

Faça um commit de teste agora:

```bash
git add .
git commit -m "feat: testar release automático"
git push origin main
```

Depois acompanhe em:
- https://github.com/azuria-lab/azuria/actions
- https://github.com/azuria-lab/azuria/releases

