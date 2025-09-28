# Comandos para Configuração do Domínio azuria.app.br

## 📋 Informações do Azure Static Web App

- **Nome**: swa-jxbkuxsj7yfpo
- **Resource Group**: Azuria-Resources
- **URL Atual**: https://blue-tree-0b17b720f.2.azurestaticapps.net
- **Domínio Desejado**: azuria.app.br

## 🔧 Passo 1: Configurar DNS no registro.br

**PRIMEIRO**: Configure o DNS no registro.br:

1. Acesse https://registro.br
2. Vá em "Meus Domínios" → "azuria.app.br" → "DNS"
3. Adicione o registro CNAME:

```
Tipo: CNAME
Nome: azuria.app.br (ou @)
Valor: blue-tree-0b17b720f.2.azurestaticapps.net
TTL: 3600
```

4. Aguarde propagação DNS (pode levar até 24 horas)

## 🔧 Passo 2: Verificar Propagação DNS

Antes de adicionar no Azure, verifique se o DNS está propagando:

```bash
# Verificar CNAME
nslookup azuria.app.br

# Ou usar dig (se disponível)
dig azuria.app.br CNAME
```

## 🔧 Passo 3: Adicionar Domínio no Azure

**APÓS** a propagação DNS, execute:

```bash
# Adicionar domínio personalizado
az staticwebapp hostname set --name "swa-jxbkuxsj7yfpo" --resource-group "Azuria-Resources" --hostname "azuria.app.br" --validation-method "cname-delegation"

# Verificar status
az staticwebapp hostname list --name "swa-jxbkuxsj7yfpo" --resource-group "Azuria-Resources" --output table

# Verificar detalhes do domínio
az staticwebapp hostname show --name "swa-jxbkuxsj7yfpo" --resource-group "Azuria-Resources" --hostname "azuria.app.br"
```

## 🔒 Passo 4: Aguardar Certificado SSL

O Azure provisionará automaticamente um certificado SSL Let's Encrypt após validar o domínio.

## ✅ Verificação Final

Após configuração completa:

- **Domínio**: https://azuria.app.br
- **SSL**: Automático via Azure
- **Redirects**: Configurar se necessário

## 📋 Status Atual

- [x] Infraestrutura Azure criada
- [x] Scripts de configuração criados
- [ ] DNS configurado no registro.br (AÇÃO NECESSÁRIA)
- [ ] Domínio adicionado no Azure
- [ ] SSL provisionado
- [ ] Testes realizados

## 🚨 Nota Importante

O Azure **requer** que o registro CNAME já esteja configurado e propagado **antes** de adicionar o domínio. Por isso o comando falhou - é necessário primeiro configurar o DNS no registro.br.