# 🚀 Guia Rápido - Resolver azuria.app.br

**Problema**: Domínio não funciona  
**Status Atual**: www configurado ✅, apex não configurado ❌, SSL não funcionando ❌

---

## ⚡ Solução Rápida (30 minutos)

### Opção A: Azure DNS (Recomendado - Mais Fácil)

**Execute no PowerShell**:

```powershell
# 1. Login no Azure
az login

# 2. Execute o script automático
.\scripts\configure-azuria-domain.ps1 -UseAzureDNS
```

**Depois, no registro.br**:

1. Acesse: https://registro.br
2. Login → Meus Domínios → azuria.app.br
3. Vá em **"Servidores DNS"** (não "DNS Records")
4. Altere para "Usar outros servidores"
5. **Cole os 4 name servers** que o script mostrou (formato: `ns1-XX.azure-dns.com`)
6. Salve

**Resultado**: Tudo funcionará em 24-48h automaticamente! ✅

---

### Opção B: Manter registro.br (Requer mais passos)

#### Parte 1: Configurar DNS no registro.br

1. **Acesse**: https://registro.br → Login
2. **Vá em**: Meus Domínios → azuria.app.br → **DNS** (ou Gerenciar DNS)

3. **Adicione estes registros**:

```
# Registro 1 - Para azuria.app.br (sem www)
Tipo: A
Nome: @ (ou deixe vazio, ou azuria.app.br)
Destino/Valor: 20.36.155.201
TTL: 3600

# Registro 2 - Para www.azuria.app.br (já deve existir)
Tipo: CNAME
Nome: www
Destino/Valor: blue-tree-0b17b720f.2.azurestaticapps.net
TTL: 3600
```

4. **Salve** e aguarde 10-30 minutos

#### Parte 2: Adicionar no Azure Portal

1. **Acesse**: https://portal.azure.com
2. **Procure**: "Static Web Apps" na busca
3. **Clique em**: `swa-jxbkuxsj7yfpo`
4. **Menu lateral**: Custom domains
5. **Clique**: + Add

**Para azuria.app.br**:
- Domain name: `azuria.app.br`
- Validation method: TXT record
- **COPIE** o valor TXT que aparecer

**Para www.azuria.app.br**:
- Domain name: `www.azuria.app.br`
- Validation method: TXT record
- **COPIE** o valor TXT que aparecer

#### Parte 3: Adicionar TXT Records no registro.br

**Volte ao registro.br** e adicione:

```
# TXT para validar azuria.app.br
Tipo: TXT
Nome: _dnsauth (ou _dnsauth.azuria.app.br)
Valor: [COLE o valor que copiou do Azure]
TTL: 3600

# TXT para validar www.azuria.app.br
Tipo: TXT
Nome: _dnsauth.www
Valor: [COLE o valor que copiou do Azure]
TTL: 3600
```

**Salve** e aguarde

#### Parte 4: Validar no Azure

1. Volte ao Azure Portal → Custom domains
2. Aguarde 10-30 minutos
3. Clique em **"Validate and add"** para cada domínio
4. Aguarde status mudar para "Ready" (pode levar 48h)

---

## 🔍 Verificar se Funcionou

**Após 30 minutos**, teste:

```powershell
# Verificar DNS
nslookup azuria.app.br
# Deve mostrar: 20.36.155.201

nslookup www.azuria.app.br
# Deve mostrar: blue-tree-0b17b720f... (Azure)

# Limpar cache DNS local
ipconfig /flushdns

# Testar no navegador (após SSL provisionar - 24h)
# https://azuria.app.br
# https://www.azuria.app.br
```

---

## ⏱️ Quanto Tempo Leva?

| Etapa | Tempo |
|-------|-------|
| **Configurar DNS** | 10-30 min (propagação) |
| **Adicionar no Azure** | 5 min (imediato) |
| **Validação TXT** | 10-60 min |
| **SSL Certificate** | 1-48 horas |
| **HTTPS funcionando** | Até 48h total |

---

## 🎯 Resumo

### ✅ O Que Está Funcionando
- DNS do www.azuria.app.br configurado
- Static Web App no Azure rodando

### ❌ O Que Falta
1. Configurar DNS do azuria.app.br (sem www)
2. Adicionar custom domains no Azure Portal
3. Adicionar TXT records para validação
4. Aguardar SSL provisionar

### 📋 Escolha Sua Solução

- **Opção A** (recomendado): Migrar para Azure DNS
  - ✅ Mais fácil
  - ✅ Automático
  - ✅ Melhor integração
  - ⏱️ 5 min de trabalho manual

- **Opção B**: Manter registro.br
  - ⚠️ Mais trabalhoso
  - ⚠️ Pode ter limitações
  - ⏱️ 20 min de trabalho manual

---

## 🆘 Problemas Comuns

### "registro.br não aceita CNAME em @"
- ✅ Use registro A com IP: `20.36.155.201`
- ✅ OU migre para Azure DNS

### "Certificado SSL não provisiona"
- ⏳ Aguarde até 48h
- ✅ Verifique TXT records estão corretos
- ✅ Verifique DNS propagou (`nslookup`)

### "DNS não propaga"
- ⏳ Aguarde mais (pode levar 24h)
- ✅ Limpe cache: `ipconfig /flushdns`
- ✅ Use outro DNS: `nslookup azuria.app.br 8.8.8.8`

---

## 📞 Suporte

- **Relatório Completo**: `DOMAIN_DIAGNOSTIC_REPORT.md`
- **Script Automático**: `scripts\configure-azuria-domain.ps1`
- **Azure Portal**: https://portal.azure.com
- **Registro.br**: https://registro.br

---

**Recomendação Final**: Execute o script com `-UseAzureDNS` para resolver tudo automaticamente! 🚀
