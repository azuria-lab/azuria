# 🔄 Migração Azure → Vercel - Guia Completo

**Data**: 11 de Outubro de 2025  
**Status**: Em Progresso  
**Domínio**: azuria.app.br

---

## ✅ **PROGRESSO ATUAL**

### **VERCEL (Completo)** ✅
- [x] Deploy em produção funcionando
- [x] Build automático configurado
- [x] Variáveis de ambiente configuradas
- [x] Domínio azuria.app.br adicionado
- [x] Subdomínio www.azuria.app.br adicionado

### **REGISTRO.BR (Pendente)** ⏳
- [ ] Atualizar registros DNS
- [ ] Remover registros antigos do Azure
- [ ] Aguardar propagação DNS (24-48h)

### **AZURE (Pendente)** ⏳
- [ ] Backup de dados (se necessário)
- [ ] Desativar recursos
- [ ] Deletar grupos de recursos
- [ ] Cancelar assinatura (se houver)

---

## 🌐 **PASSO 1: CONFIGURAR DNS NO REGISTRO.BR**

### **1.1 Acessar Painel DNS**
1. Acesse: https://registro.br/
2. Faça login com suas credenciais
3. Vá em: **Domínios** → **azuria.app.br** → **Editar Zona DNS**

### **1.2 Configurar Registros para Vercel**

#### **Registro A - Domínio Principal**
```
Tipo: A
Nome: azuria.app.br (ou @ ou deixe em branco)
Dados: 76.76.21.21
TTL: 3600
```

#### **Registro A - Subdomínio WWW**
```
Tipo: A
Nome: www
Dados: 76.76.21.21
TTL: 3600
```

### **1.3 Remover Registros Antigos do Azure**

❌ **DELETAR:**
```
TXT _dnsauth.azuria.app.br
    Valor: v_f1c5cb2c2000lwz47y9mGLImzLU_

CNAME www.azuria.app.br
    Valor: blue-tree-0b3b5729f.4.azurestaticapps.net
```

### **1.4 Salvar e Aguardar**
- Clique em **"SALVAR ALTERAÇÕES"**
- Propagação DNS: **24-48 horas** (geralmente 1-4 horas)

---

## 🔍 **PASSO 2: VERIFICAR PROPAGAÇÃO DNS**

### **Online (Recomendado)**
- https://dnschecker.org/ → Digite `azuria.app.br`
- Deve mostrar: `76.76.21.21` em todas as regiões

### **Via Terminal**
```powershell
# Windows
nslookup azuria.app.br

# Deve retornar:
# Address: 76.76.21.21
```

---

## ☁️ **PASSO 3: DESATIVAR RECURSOS AZURE**

### **3.1 Recursos Identificados**

#### **Grupo: Azuria-Resources** (brazilsouth)
- `swa-jxbkuxsj7yfpo` - Static Web App (❌ DELETAR)
- `log-jxbkuxsj7yfpo` - Log Analytics (❌ DELETAR)
- `ai-jxbkuxsj7yfpo` - Application Insights (❌ DELETAR)
- `kvjxbkuxsj7yfpo` - Key Vault (⚠️ Verificar se tem secrets importantes)
- `mi-Azuria` - Managed Identity (❌ DELETAR)
- Alerts (azuria-alerts, azuria-availability-alert, etc.) (❌ DELETAR)

#### **Grupos Vazios**
- `azuria-dev-rg` (eastus2) - VAZIO ✅
- `azuria-staging-rg` (eastus2) - VAZIO ✅
- `azuria-prod-rg` (eastus2) - VAZIO ✅
- `cloud-shell-storage-eastus` (eastus) - Cloud Shell (⚠️ Manter se usar Azure CLI)

### **3.2 Custo Estimado Atual**

| Recurso | Custo Mensal Estimado |
|---------|----------------------|
| Static Web App (Free) | R$ 0 |
| Log Analytics (Standard) | ~R$ 9-15 |
| Application Insights | ~R$ 5-10 |
| Key Vault | ~R$ 3-5 |
| Managed Identity | R$ 0 |
| **TOTAL** | **~R$ 17-30/mês** |

---

## 🗑️ **PASSO 4: COMANDOS PARA DELETAR AZURE**

### **⚠️ IMPORTANTE: BACKUP ANTES DE DELETAR**

#### **4.1 Verificar Secrets no Key Vault**
```bash
# Listar secrets
az keyvault secret list --vault-name kvjxbkuxsj7yfpo --output table

# Fazer backup de algum secret importante (se houver)
az keyvault secret show --vault-name kvjxbkuxsj7yfpo --name nome-do-secret
```

#### **4.2 Exportar Logs (Opcional)**
```bash
# Se quiser backup dos logs antes de deletar
az monitor log-analytics workspace show --resource-group Azuria-Resources --workspace-name log-jxbkuxsj7yfpo
```

### **4.3 Deletar Grupos de Recursos Vazios (Seguro)**
```bash
# Deletar grupos vazios (rápido e sem custo)
az group delete --name azuria-dev-rg --yes --no-wait
az group delete --name azuria-staging-rg --yes --no-wait
az group delete --name azuria-prod-rg --yes --no-wait
```

### **4.4 Deletar Grupo Principal (CUIDADO!)**
```bash
# ⚠️ ISSO DELETA TUDO! Confirme antes!
az group delete --name Azuria-Resources --yes --no-wait

# Alternativa: Deletar recursos individuais
az staticwebapp delete --name swa-jxbkuxsj7yfpo --resource-group Azuria-Resources --yes
az monitor log-analytics workspace delete --resource-group Azuria-Resources --workspace-name log-jxbkuxsj7yfpo --yes
az monitor app-insights component delete --app ai-jxbkuxsj7yfpo --resource-group Azuria-Resources
az keyvault delete --name kvjxbkuxsj7yfpo --resource-group Azuria-Resources
az identity delete --name mi-Azuria --resource-group Azuria-Resources
```

---

## 📊 **PASSO 5: COMPARAÇÃO AZURE vs VERCEL**

| Feature | Azure Static Web Apps | Vercel | Vencedor |
|---------|----------------------|--------|----------|
| **Custo Free Tier** | 100 GB/mês | 100 GB/mês | Empate |
| **Deploy Automático** | ✅ Via GitHub | ✅ Via GitHub | Empate |
| **Build Time** | ~3-5 min | ~1-2 min | 🏆 Vercel |
| **Configuração** | Complexa | Simples | 🏆 Vercel |
| **DNS Custom** | Complicado | Fácil | 🏆 Vercel |
| **Edge Network** | Limitado | Global CDN | 🏆 Vercel |
| **Analytics** | Precisa configurar | Built-in | 🏆 Vercel |
| **Preview Deploys** | ✅ | ✅ | Empate |
| **Custo Mensal** | ~R$ 17-30 | R$ 0 (Hobby) | 🏆 Vercel |

**Economia estimada: R$ 17-30/mês = R$ 204-360/ano** 💰

---

## ✅ **PASSO 6: VALIDAÇÃO PÓS-MIGRAÇÃO**

### **Checklist de Testes**
- [ ] https://azuria.app.br abre e funciona
- [ ] https://www.azuria.app.br redireciona para azuria.app.br
- [ ] Login funciona
- [ ] Calculadora funciona
- [ ] Dashboard carrega
- [ ] Histórico salva dados
- [ ] PWA instala
- [ ] HTTPS funcionando (SSL automático Vercel)
- [ ] Performance melhorou (comparar Lighthouse)

### **Monitoramento Vercel**
- Analytics: https://vercel.com/azurias-projects-ea27c6b3/azuria/analytics
- Logs: https://vercel.com/azurias-projects-ea27c6b3/azuria/logs
- Settings: https://vercel.com/azurias-projects-ea27c6b3/azuria/settings

---

## 📝 **CHECKLIST RESUMIDO**

### **Imediato (Hoje)**
- [ ] Configurar DNS no Registro.br (10 minutos)
- [ ] Remover registros Azure do DNS (5 minutos)
- [ ] Salvar alterações DNS

### **Próximas 24-48h**
- [ ] Aguardar propagação DNS
- [ ] Verificar azuria.app.br funcionando
- [ ] Testar todas as funcionalidades

### **Após Confirmação (3-7 dias)**
- [ ] Fazer backup de secrets do Key Vault (se necessário)
- [ ] Deletar grupos de recursos vazios
- [ ] Deletar grupo Azuria-Resources
- [ ] Confirmar que não há cobranças futuras

---

## 🎯 **BENEFÍCIOS DA MIGRAÇÃO**

### **Técnicos**
- ✅ Deploy 2x mais rápido
- ✅ Configuração mais simples
- ✅ CDN global automático
- ✅ Analytics integrado
- ✅ Preview deploys automáticos
- ✅ SSL/HTTPS automático
- ✅ Rollback com 1 clique

### **Financeiros**
- ✅ Economia de R$ 17-30/mês
- ✅ Sem custos surpresa
- ✅ Tier gratuito generoso
- ✅ Escalabilidade previsível

### **Operacionais**
- ✅ Menos complexidade
- ✅ Melhor DX (Developer Experience)
- ✅ Documentação superior
- ✅ Suporte community ativo

---

## 📞 **SUPORTE**

### **Vercel**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://vercel-status.com

### **Registro.br**
- Suporte: https://registro.br/suporte/
- FAQ DNS: https://registro.br/ajuda/

---

## ⚠️ **AVISOS IMPORTANTES**

1. **Backup**: Sempre faça backup antes de deletar recursos
2. **DNS**: Aguarde propagação completa (24-48h) antes de deletar Azure
3. **Key Vault**: Verifique se há secrets importantes antes de deletar
4. **Teste**: Teste tudo em azuria.app.br antes de deletar Azure
5. **Custos**: Verifique no Azure Portal se não há cobranças pendentes

---

## 🎉 **STATUS ATUAL**

```
VERCEL: ✅ PRONTO PARA PRODUÇÃO
DNS:    ⏳ AGUARDANDO CONFIGURAÇÃO
AZURE:  ⏳ AGUARDANDO MIGRAÇÃO COMPLETA
```

**Próximo passo:** Configurar DNS no Registro.br! 🚀
