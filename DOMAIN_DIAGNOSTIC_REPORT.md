# 🔍 Diagnóstico Completo - Domínio azuria.app.br

**Data**: 1 de Outubro de 2025  
**Status**: ⚠️ Parcialmente Configurado

---

## 📊 Análise DNS Atual

### ✅ www.azuria.app.br (FUNCIONANDO)

```dns
Nome:    waws-prod-bn1-cd6b044b.sip.p.azurewebsites.windows.net
Address:  20.36.155.201
Aliases:  www.azuria.app.br
          blue-tree-0b17b720f.2.azurestaticapps.net
          azurestaticapps2.trafficmanager.net
```

**Status**: ✅ **DNS Configurado Corretamente**
- CNAME apontando para `blue-tree-0b17b720f.2.azurestaticapps.net`
- Resolução DNS funcionando
- IP final: 20.36.155.201

### ❌ azuria.app.br (NÃO FUNCIONANDO)

```dns
Nome:    azuria.app.br
Status:  Sem resposta válida (apenas SOA record)
```

**Status**: ❌ **DNS NÃO Configurado**
- Nenhum registro A ou CNAME
- Apenas registro SOA (autoridade)
- Domínio apex não aponta para Azure

---

## 🚨 Problemas Identificados

### 1. ⚠️ Domínio Apex (azuria.app.br) Não Configurado

**Problema**: O domínio raiz `azuria.app.br` não tem registro DNS apontando para o Azure.

**Causa**: Registro.br está mostrando apenas SOA (Start of Authority), sem A ou CNAME.

**Impacto**: 
- ❌ `https://azuria.app.br` → Não funciona
- ❌ `http://azuria.app.br` → Não funciona
- ✅ `https://www.azuria.app.br` → Funciona (mas com erro SSL)

### 2. ⚠️ Certificado SSL Não Configurado

**Problema**: O domínio `www.azuria.app.br` não tem certificado SSL válido.

**Causa**: Azure Static Web Apps não provisionou o certificado automaticamente.

**Erro**: "Não foi possível estabelecer relação de confiança para o canal seguro de SSL/TLS"

**Impacto**:
- ❌ HTTPS não funciona (erro de certificado)
- ⚠️ Navegadores mostrarão aviso de segurança

### 3. ⚠️ Domínio Não Adicionado no Azure Portal

**Problema**: O domínio personalizado não foi adicionado no Azure Static Web Apps.

**Evidência**: Apenas o domínio padrão Azure está ativo.

**Impacto**: Azure não sabe que deve servir conteúdo para azuria.app.br

---

## 🛠️ Solução Passo a Passo

### Fase 1: Configurar DNS no registro.br (URGENTE)

#### Passo 1.1: Adicionar Registro para Apex Domain

**Opção A - CNAME Flattening (Recomendado)**:
Se o registro.br suportar CNAME flattening:
```dns
Tipo: CNAME
Nome: @ (ou azuria.app.br)
Valor: blue-tree-0b17b720f.2.azurestaticapps.net
TTL: 3600
```

**Opção B - Registro ALIAS (Se disponível)**:
```dns
Tipo: ALIAS
Nome: @
Valor: blue-tree-0b17b720f.2.azurestaticapps.net
TTL: 3600
```

**Opção C - Registro A com IP do Azure** (Última opção):
```dns
Tipo: A
Nome: @
Valor: 20.36.155.201
TTL: 3600
```

⚠️ **NOTA IMPORTANTE**: O registro.br pode **NÃO permitir CNAME no apex domain** (@). Neste caso, você tem 3 alternativas:

1. **Usar NS (Name Servers) do Azure** (Melhor solução):
   - Criar Azure DNS Zone
   - Mudar NS no registro.br para Azure
   - Configurar todos os registros no Azure

2. **Usar apenas www** + **Redirecionamento**:
   - Configurar redirecionamento no registro.br de `@` para `www`
   - Usar apenas www.azuria.app.br

3. **Usar IP estático** (menos flexível):
   - Solicitar IP estático ao Azure
   - Configurar registro A

#### Passo 1.2: Verificar Configuração Atual do www

O `www.azuria.app.br` já está configurado:
```dns
✅ Tipo: CNAME
✅ Nome: www
✅ Valor: blue-tree-0b17b720f.2.azurestaticapps.net
```

**Manter essa configuração!**

### Fase 2: Adicionar Domínio no Azure Static Web Apps

#### Passo 2.1: Via Azure Portal (Recomendado)

1. **Acessar Azure Portal**:
   ```
   https://portal.azure.com
   ```

2. **Navegar para Static Web Apps**:
   - Procurar: "Static Web Apps"
   - Selecionar: `swa-jxbkuxsj7yfpo`

3. **Adicionar Custom Domain**:
   - Menu lateral → **Custom domains**
   - Clicar em **+ Add**
   - Escolher: **Custom domain on Azure DNS or other DNS provider**

4. **Configurar azuria.app.br (apex)**:
   ```
   Domain name: azuria.app.br
   Validation method: TXT record
   ```
   - Copiar o TXT record fornecido
   - Adicionar no registro.br:
     ```dns
     Tipo: TXT
     Nome: @ (ou _dnsauth)
     Valor: [valor fornecido pelo Azure]
     TTL: 3600
     ```
   - Aguardar propagação (5-10 minutos)
   - Clicar em **Validate and add**

5. **Configurar www.azuria.app.br**:
   ```
   Domain name: www.azuria.app.br
   Validation method: TXT record
   ```
   - Repetir processo acima para www
   - TXT record:
     ```dns
     Tipo: TXT
     Nome: _dnsauth.www
     Valor: [valor fornecido pelo Azure]
     TTL: 3600
     ```

#### Passo 2.2: Via Azure CLI (Alternativo)

```powershell
# Login no Azure
az login

# Adicionar domínio apex
az staticwebapp hostname set `
  --name swa-jxbkuxsj7yfpo `
  --resource-group Azuria-Resources `
  --hostname azuria.app.br

# Adicionar subdomínio www
az staticwebapp hostname set `
  --name swa-jxbkuxsj7yfpo `
  --resource-group Azuria-Resources `
  --hostname www.azuria.app.br
```

### Fase 3: Aguardar Provisionamento SSL

**Tempo Esperado**: 30 minutos a 48 horas

**Processo Automático do Azure**:
1. ✅ Validar DNS (TXT records)
2. ✅ Provisionar certificado Let's Encrypt
3. ✅ Configurar HTTPS automático
4. ✅ Renovação automática (90 dias)

**Verificar Status**:
- Azure Portal → Static Web Apps → swa-jxbkuxsj7yfpo
- Custom domains → Verificar status:
  - ⏳ "Validating" → Em processo
  - ✅ "Ready" → Certificado ativo

---

## 🔍 Comandos de Diagnóstico

### Verificar DNS Atual

```powershell
# Verificar apex domain
nslookup azuria.app.br

# Verificar www
nslookup www.azuria.app.br

# Verificar tipo CNAME
nslookup -type=CNAME www.azuria.app.br

# Verificar tipo A
nslookup -type=A azuria.app.br

# Verificar TXT records (validação)
nslookup -type=TXT azuria.app.br
nslookup -type=TXT _dnsauth.azuria.app.br
```

### Verificar Conectividade

```powershell
# Testar HTTP (sem SSL)
Test-NetConnection -ComputerName azuria.app.br -Port 80

# Testar HTTPS
Test-NetConnection -ComputerName azuria.app.br -Port 443

# Verificar certificado SSL
$cert = [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
Invoke-WebRequest -Uri "https://www.azuria.app.br" -Method Head
```

### Flush DNS Local

```powershell
# Limpar cache DNS local
ipconfig /flushdns

# Verificar novamente após limpar
nslookup azuria.app.br
```

---

## 📋 Checklist de Configuração

### DNS no registro.br

- [ ] **Registros para apex (azuria.app.br)**:
  - [ ] CNAME para blue-tree-0b17b720f.2.azurestaticapps.net (OU)
  - [ ] A record para 20.36.155.201 (OU)
  - [ ] Mudar NS para Azure DNS (melhor opção)
  - [ ] TXT para validação: `_dnsauth.azuria.app.br`

- [x] **Registros para www (www.azuria.app.br)** ✅:
  - [x] CNAME para blue-tree-0b17b720f.2.azurestaticapps.net ✅
  - [ ] TXT para validação: `_dnsauth.www.azuria.app.br`

### Azure Static Web Apps

- [ ] **Domínio adicionado no Azure Portal**:
  - [ ] azuria.app.br configurado
  - [ ] www.azuria.app.br configurado
  - [ ] TXT records validados

- [ ] **SSL Certificates**:
  - [ ] Certificado para azuria.app.br provisionado
  - [ ] Certificado para www.azuria.app.br provisionado
  - [ ] Status "Ready" no portal

### Testes de Conectividade

- [ ] **Resolução DNS**:
  - [ ] `nslookup azuria.app.br` retorna IP Azure
  - [x] `nslookup www.azuria.app.br` retorna IP Azure ✅

- [ ] **Acesso HTTP**:
  - [ ] `http://azuria.app.br` carrega aplicação
  - [ ] `http://www.azuria.app.br` carrega aplicação

- [ ] **Acesso HTTPS**:
  - [ ] `https://azuria.app.br` funciona sem erro
  - [ ] `https://www.azuria.app.br` funciona sem erro

- [ ] **Redirecionamento**:
  - [ ] `http://` redireciona para `https://`
  - [ ] `azuria.app.br` redireciona para `www.azuria.app.br` (ou vice-versa)

---

## 🎯 Solução Recomendada (Mais Simples)

### Opção 1: Usar Azure DNS (Recomendado)

**Vantagens**:
- ✅ Suporte completo a CNAME no apex
- ✅ Gerenciamento centralizado no Azure
- ✅ Integração perfeita com Static Web Apps
- ✅ SSL automático garantido

**Passos**:

1. **Criar Azure DNS Zone**:
   ```powershell
   az network dns zone create `
     --resource-group Azuria-Resources `
     --name azuria.app.br
   ```

2. **Obter Name Servers do Azure**:
   ```powershell
   az network dns zone show `
     --resource-group Azuria-Resources `
     --name azuria.app.br `
     --query nameServers
   ```

3. **Atualizar NS no registro.br**:
   - Acessar registro.br
   - Ir em "Servidores DNS"
   - Alterar para os 4 name servers do Azure
   - Exemplo:
     ```
     ns1-04.azure-dns.com
     ns2-04.azure-dns.net
     ns3-04.azure-dns.org
     ns4-04.azure-dns.info
     ```

4. **Criar registros no Azure DNS**:
   ```powershell
   # Registro A para apex
   az network dns record-set a add-record `
     --resource-group Azuria-Resources `
     --zone-name azuria.app.br `
     --record-set-name @ `
     --ipv4-address 20.36.155.201

   # Registro CNAME para www
   az network dns record-set cname set-record `
     --resource-group Azuria-Resources `
     --zone-name azuria.app.br `
     --record-set-name www `
     --cname blue-tree-0b17b720f.2.azurestaticapps.net
   ```

5. **Adicionar custom domains no SWA**:
   ```powershell
   az staticwebapp hostname set `
     --name swa-jxbkuxsj7yfpo `
     --resource-group Azuria-Resources `
     --hostname azuria.app.br

   az staticwebapp hostname set `
     --name swa-jxbkuxsj7yfpo `
     --resource-group Azuria-Resources `
     --hostname www.azuria.app.br
   ```

### Opção 2: Manter registro.br + Configuração Manual

**Vantagens**:
- ✅ Não precisa mudar name servers
- ✅ Mantém gerenciamento no registro.br

**Desvantagens**:
- ❌ Pode não suportar CNAME no apex
- ❌ Requer IP estático
- ❌ Configuração mais trabalhosa

**Passos**:

1. **No registro.br**:
   ```dns
   # Se CNAME no apex NÃO for suportado, usar A record:
   Tipo: A
   Nome: @
   Valor: 20.36.155.201
   TTL: 3600

   # Manter www:
   Tipo: CNAME
   Nome: www
   Valor: blue-tree-0b17b720f.2.azurestaticapps.net
   TTL: 3600

   # TXT para validação (obtido no Azure Portal):
   Tipo: TXT
   Nome: _dnsauth
   Valor: [obtido no Azure ao adicionar custom domain]
   TTL: 3600

   Tipo: TXT
   Nome: _dnsauth.www
   Valor: [obtido no Azure ao adicionar custom domain]
   TTL: 3600
   ```

2. **No Azure Portal**:
   - Adicionar custom domains (conforme Fase 2.1 acima)
   - Validar TXT records
   - Aguardar SSL provisioning

---

## ⏱️ Timeline Esperado

### Configuração Imediata (0-30min)
- ✅ Adicionar registros DNS no registro.br
- ✅ Adicionar custom domains no Azure Portal
- ✅ Adicionar TXT records para validação

### Propagação DNS (30min-24h)
- ⏳ DNS propaga globalmente
- ⏳ Azure valida propriedade do domínio
- ⏳ Verificar com `nslookup` periodicamente

### SSL Provisioning (1h-48h)
- ⏳ Azure provisiona certificados Let's Encrypt
- ⏳ Certificados instalados automaticamente
- ⏳ HTTPS ativado

### Teste Final (após 48h máximo)
- ✅ `https://azuria.app.br` funcionando
- ✅ `https://www.azuria.app.br` funcionando
- ✅ Certificados válidos
- ✅ Redirecionamentos configurados

---

## 📞 Próximos Passos Imediatos

### 1. Decisão de Arquitetura (AGORA)

Escolher entre:
- **Opção A**: Migrar para Azure DNS (mais robusto)
- **Opção B**: Manter registro.br + config manual

### 2. Configurar DNS (HOJE)

- Acessar registro.br
- Adicionar registros DNS conforme opção escolhida
- Documentar todos os valores configurados

### 3. Configurar Azure (HOJE)

- Acessar Azure Portal
- Adicionar custom domains
- Copiar TXT records para validação
- Adicionar TXT no registro.br

### 4. Monitorar (24-48h)

- Verificar propagação DNS a cada 6h
- Checar status SSL no Azure Portal
- Testar acessos quando DNS propagar

---

## 🚨 Atenção Especial

### Limitação do registro.br

O **registro.br** historicamente **NÃO permite CNAME no apex domain** (@). Isso significa que a configuração mais simples (CNAME) pode não funcionar para `azuria.app.br`.

**Soluções Verificadas**:

1. ✅ **Azure DNS** (100% compatível)
2. ✅ **A record com IP estático**
3. ⚠️ **Redirecionamento** (usar apenas www)

**Recomendação**: Migrar para **Azure DNS** para evitar limitações.

---

## 📊 Status Atual vs. Desejado

| Item | Status Atual | Status Desejado |
|------|--------------|-----------------|
| **www.azuria.app.br DNS** | ✅ Configurado | ✅ Configurado |
| **azuria.app.br DNS** | ❌ Não configurado | ✅ Configurado |
| **www SSL** | ❌ Erro certificado | ✅ Certificado válido |
| **apex SSL** | ❌ Não existe | ✅ Certificado válido |
| **Custom domain Azure** | ❌ Não adicionado | ✅ Adicionado |
| **HTTPS funcionando** | ❌ | ✅ |
| **Redirecionamento** | ❌ | ✅ |

---

## 🎓 Recursos Adicionais

### Documentação

- [Azure Static Web Apps Custom Domains](https://learn.microsoft.com/azure/static-web-apps/custom-domain)
- [Azure DNS Documentation](https://learn.microsoft.com/azure/dns/)
- [Registro.br - Gerenciamento DNS](https://registro.br/tecnologia/ferramentas/)

### Scripts de Automação

```powershell
# Script completo em: scripts/configure-custom-domain.ps1
.\scripts\configure-custom-domain.ps1 `
  -ResourceGroupName "Azuria-Resources" `
  -StaticWebAppName "swa-jxbkuxsj7yfpo" `
  -DomainName "azuria.app.br" `
  -IncludeWww $true
```

---

**Resumo**: O domínio `www.azuria.app.br` está com DNS configurado, mas precisa ser adicionado no Azure Portal para funcionar com SSL. O domínio apex `azuria.app.br` não está configurado. Recomendo migrar para **Azure DNS** para melhor integração.

---

*Relatório gerado em: October 1, 2025*  
*Próxima revisão: Após configuração DNS (24-48h)*
