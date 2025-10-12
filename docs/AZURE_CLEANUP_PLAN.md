# 🗑️ Plano de Limpeza dos Recursos Azure

**Data:** 11 de Outubro de 2025  
**Status DNS:** ✅ Propagado e funcionando  
**Domínio:** azuria.app.br → Vercel (76.76.21.21)  
**Aplicação:** 100% migrada para Vercel

---

## ✅ Status da Migração

| Item | Status | Verificação |
|------|--------|-------------|
| **DNS Propagação** | ✅ Completo | nslookup azuria.app.br → 76.76.21.21 |
| **Domínio Principal** | ✅ Funcionando | https://azuria.app.br (200 OK) |
| **Subdomínio WWW** | ✅ Funcionando | https://www.azuria.app.br |
| **Deploy Vercel** | ✅ Produção | Deploy ID: dpl_D3WdPKYuBXARwyo3uDUAyMr3sRZH |
| **Performance** | ✅ Otimizado | -75% initial load, 104 chunks |
| **CI/CD** | ✅ Ativo | 12/12 checks passing |

---

## 💰 Análise de Custos Azure

### Recursos Identificados (Azuria-Resources)

| Recurso | Tipo | Custo Estimado/Mês | Necessário? |
|---------|------|---------------------|-------------|
| **swa-jxbkuxsj7yfpo** | Static Web App | R$ 0 (Free tier) | ❌ Substituído pelo Vercel |
| **log-jxbkuxsj7yfpo** | Log Analytics | R$ 9-15 | ❌ Vercel tem logs próprios |
| **ai-jxbkuxsj7yfpo** | Application Insights | R$ 5-10 | ❌ Vercel Analytics disponível |
| **kvjxbkuxsj7yfpo** | Key Vault | R$ 3-5 | ⚠️ Verificar secrets antes |
| **mi-Azuria** | Managed Identity | R$ 0 | ❌ Não usado no Vercel |
| **Action Groups (3x)** | Alerts | R$ 0 | ❌ Vercel tem monitoring |
| **Metric Alerts (3x)** | Monitoring | R$ 0 | ❌ Redundante |

### Grupos Vazios

| Resource Group | Status | Ação |
|----------------|--------|------|
| **azuria-dev-rg** | Vazio | ✅ Deletar |
| **azuria-staging-rg** | Vazio | ✅ Deletar |
| **azuria-prod-rg** | Vazio | ✅ Deletar |
| **cloud-shell-storage-eastus** | Cloud Shell | 🔒 Manter |

### 💵 Economia Estimada

```
Log Analytics:         R$ 9-15/mês
Application Insights:  R$ 5-10/mês
Key Vault:            R$ 3-5/mês
-------------------------------------
TOTAL:                R$ 17-30/mês
ANUAL:                R$ 204-360/ano
```

---

## 📋 Plano de Execução

### ⏰ Timeline Recomendado

#### **Período de Observação: 7 dias** (11-18 Out 2025)

**Objetivo:** Garantir que o Vercel está 100% estável antes de deletar Azure

**Checklist diário:**
- [ ] Dia 1 (11 Out): ✅ DNS funcionando
- [ ] Dia 2 (12 Out): Monitorar uptime
- [ ] Dia 3 (13 Out): Verificar performance
- [ ] Dia 4 (14 Out): Testar todas as features
- [ ] Dia 5 (15 Out): Verificar analytics
- [ ] Dia 6 (16 Out): Revisar logs
- [ ] Dia 7 (17 Out): Aprovação final

#### **Backup do Key Vault** (Antes da deleção)

```bash
# Listar todos os secrets
az keyvault secret list --vault-name kvjxbkuxsj7yfpo --output table

# Exportar cada secret (exemplo)
az keyvault secret show --vault-name kvjxbkuxsj7yfpo --name SUPABASE_URL --query value -o tsv > backup-secrets.txt
```

**Secrets esperados:**
- SUPABASE_URL → Já configurado no Vercel ✅
- SUPABASE_ANON_KEY → Já configurado no Vercel ✅
- Outros? → Verificar e documentar

#### **Deleção (18 Out 2025)**

**Ordem de execução:**

1. **Deletar grupos vazios** (Seguro, sem custos)
   ```bash
   az group delete --name azuria-dev-rg --yes --no-wait
   az group delete --name azuria-staging-rg --yes --no-wait
   az group delete --name azuria-prod-rg --yes --no-wait
   ```

2. **Deletar recursos individuais** (Mais seguro, controle granular)
   ```bash
   # Alerts (sem custo, deletar primeiro)
   az monitor metrics alert delete --name azuria-availability-alert --resource-group Azuria-Resources
   az monitor metrics alert delete --name azuria-performance-alert --resource-group Azuria-Resources
   az monitor metrics alert delete --name azuria-error-count-alert --resource-group Azuria-Resources
   
   # Action Groups
   az monitor action-group delete --name azuria-alerts --resource-group Azuria-Resources
   az monitor action-group delete --name "Application Insights Smart Detection" --resource-group Azuria-Resources
   
   # Application Insights
   az monitor app-insights component delete --app ai-jxbkuxsj7yfpo --resource-group Azuria-Resources
   
   # Static Web App (principal)
   az staticwebapp delete --name swa-jxbkuxsj7yfpo --resource-group Azuria-Resources
   
   # Log Analytics
   az monitor log-analytics workspace delete --workspace-name log-jxbkuxsj7yfpo --resource-group Azuria-Resources --force
   
   # Key Vault (após backup)
   az keyvault delete --name kvjxbkuxsj7yfpo --resource-group Azuria-Resources
   
   # Managed Identity
   az identity delete --name mi-Azuria --resource-group Azuria-Resources
   ```

3. **Deletar grupo principal** (Após confirmar que todos os recursos foram removidos)
   ```bash
   az group delete --name Azuria-Resources --yes
   ```

---

## 🛡️ Checklist de Segurança

### Antes de Deletar

- [ ] ✅ DNS propagado e funcionando (11 Out 2025)
- [ ] ⏳ 7 dias de observação completos (até 18 Out 2025)
- [ ] Backup de todos os secrets do Key Vault
- [ ] Documentar todas as configurações
- [ ] Exportar logs importantes (se necessário)
- [ ] Confirmar que Vercel Analytics está ativo
- [ ] Testar rollback plan (se necessário)

### Durante a Deleção

- [ ] Deletar em ordem (alerts → insights → webapp → logs → keyvault → identity)
- [ ] Verificar cada passo antes do próximo
- [ ] Documentar IDs de recursos deletados
- [ ] Fazer screenshots das confirmações

### Após a Deleção

- [ ] Confirmar que nenhum recurso ficou órfão
- [ ] Verificar billing para confirmar fim dos custos
- [ ] Documentar economia real
- [ ] Atualizar documentação do projeto
- [ ] Remover credenciais Azure desnecessárias

---

## 📊 Monitoramento Vercel

### Métricas para Acompanhar (Período de Observação)

**Analytics:**
- https://vercel.com/azurias-projects-ea27c6b3/azuria/analytics

**Logs:**
- https://vercel.com/azurias-projects-ea27c6b3/azuria/logs

**Deployments:**
- https://vercel.com/azurias-projects-ea27c6b3/azuria/deployments

**Métricas Esperadas:**
- Uptime: 99.9%+
- Response Time: < 200ms
- Error Rate: < 0.1%
- Build Success: 100%

---

## 🚨 Plano de Rollback (Emergência)

**Se algo der errado nas primeiras 24h:**

1. DNS pode ser revertido no Registro.br (propagação: 1-4h)
2. Azure Static Web App ainda existe (não deletado)
3. Build pode ser refeito no Azure

**Após 7 dias:**
- Rollback para Azure não é mais viável
- Foco em fix-forward no Vercel

---

## 📝 Script Automatizado de Deleção

Disponível em: `scripts/delete-azure-resources.ps1`

**Features:**
- Confirmações de segurança
- Backup automático de Key Vault
- Logs de todas as operações
- Rollback parcial se necessário

**Uso:**
```powershell
# Executar com confirmações
.\scripts\delete-azure-resources.ps1

# Modo dry-run (apenas listar, não deletar)
.\scripts\delete-azure-resources.ps1 -DryRun
```

---

## ✅ Checklist Final

### Pré-Deleção (11-17 Out 2025)
- [x] DNS propagado ✅
- [x] Domínio funcionando ✅
- [x] Deploy Vercel ativo ✅
- [ ] 7 dias de observação
- [ ] Backup Key Vault
- [ ] Aprovação final

### Deleção (18 Out 2025)
- [ ] Grupos vazios deletados
- [ ] Recursos individuais deletados
- [ ] Grupo principal deletado
- [ ] Billing verificado

### Pós-Deleção
- [ ] Documentação atualizada
- [ ] Economia confirmada
- [ ] Credenciais limpas
- [ ] Comemoração! 🎉

---

## 💡 Recomendações

1. **Não apressar:** 7 dias de observação são importantes
2. **Fazer backup:** Especialmente do Key Vault
3. **Deletar aos poucos:** Recursos individuais antes do grupo
4. **Monitorar billing:** Confirmar que custos pararam
5. **Documentar tudo:** Para referência futura

---

## 📞 Contatos de Emergência

**Vercel Support:** https://vercel.com/help  
**Azure Support:** https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade  
**Registro.br:** https://registro.br/ajuda/

---

**Status Atual:** 🟢 DNS PROPAGADO - AGUARDANDO PERÍODO DE OBSERVAÇÃO (7 dias)  
**Próxima Ação:** Monitorar uptime e performance até 18 de Outubro  
**Economia Esperada:** R$ 17-30/mês (R$ 204-360/ano)

---

**Última atualização:** 11 de Outubro de 2025, 18:10
