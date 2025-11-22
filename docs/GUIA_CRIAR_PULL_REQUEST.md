# 📝 Guia: Criar Pull Request para Main

**Data**: Janeiro 2025  
**Branch**: `feat/recuperacao-completa-todas-features` → `main`

---

## 🎯 Por Que Pull Request?

A branch `main` está protegida e requer:
- ✅ Status checks do CI/CD
- ✅ Revisão de código
- ✅ Aprovação antes do merge

**Isso é uma boa prática de segurança!**

---

## 📋 Passo a Passo

### **Método 1: Via GitHub Web Interface** ✅ MAIS FÁCIL

1. **Acesse**: https://github.com/azuria-lab/azuria
2. **Clique em**: "Pull requests" → "New pull request"
3. **Configure**:
   - **Base**: `main`
   - **Compare**: `feat/recuperacao-completa-todas-features`
4. **Título**: 
   ```
   feat: Recuperação completa de features e melhorias pré-deploy
   ```
5. **Descrição**:
   ```
   ## Correções Críticas
   - Remover URL antiga do Supabase do CSP
   - Corrigir 6 vulnerabilidades de dependências
   - Substituir console.log por logger condicional
   - Otimizar logs em Edge Functions
   
   ## Migrações do Supabase
   - Adicionar tabela payment_history
   - Consolidar subscriptions
   - Criar tabelas de métricas de negócio
   - Remover tabelas legadas (users, price_audit)
   
   ## Testes
   - Lint: 0 erros
   - Build: Sucesso
   - Type Check: Erros não bloqueantes
   
   ## Documentação
   - Relatórios de recuperação
   - Relatórios de melhorias
   - Guias de deploy
   ```
6. **Clique em**: "Create pull request"
7. **Aguarde**: CI/CD executar testes
8. **Aprove e merge**: Quando testes passarem

---

### **Método 2: Via GitHub CLI** (se instalado)

```bash
gh pr create \
  --base main \
  --head feat/recuperacao-completa-todas-features \
  --title "feat: Recuperação completa de features e melhorias pré-deploy" \
  --body "Correções críticas de segurança, migrações do Supabase e melhorias pré-deploy"
```

---

## ✅ O Que Acontece Depois

1. ⏳ **CI/CD executa**:
   - Lint
   - Type Check
   - Build
   - Testes

2. ⏳ **Se tudo passar**:
   - PR pode ser aprovado
   - Merge pode ser feito
   - Deploy automático disparado

3. ⏳ **Se algo falhar**:
   - Corrigir problemas
   - Push novas correções
   - CI/CD reexecuta

---

## 📊 Status Atual

- ✅ **Branch preparada**: `feat/recuperacao-completa-todas-features`
- ✅ **Commits prontos**: 3 commits importantes
- ✅ **Código testado**: Build funcionando
- ⏳ **Aguardando**: Pull Request ser criado

---

**Próximo passo**: Criar Pull Request no GitHub!

