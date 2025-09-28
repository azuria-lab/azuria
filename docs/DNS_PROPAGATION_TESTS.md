# 🔍 Comandos para Testar Propagação DNS - azuria.app.br

## 📋 Status da Configuração
- ✅ **DNS configurado** no registro.br
- ✅ **Apontamento**: `blue-tree-0b17b720f.2.azurestaticapps.net`
- ⏳ **Propagação**: Em andamento (pode levar 1-24h)

## 🧪 Testes de Propagação DNS

### **Windows (PowerShell/CMD)**
```powershell
# Teste básico DNS
nslookup azuria.app.br

# Teste específico CNAME
nslookup -type=CNAME azuria.app.br

# Teste com servidor DNS público (Google)
nslookup azuria.app.br 8.8.8.8

# Teste conectividade HTTP
curl -I http://azuria.app.br

# Teste HTTPS (quando SSL estiver ativo)
curl -I https://azuria.app.br
```

### **Testes Online (Navegador)**
Acesse essas ferramentas para verificar propagação global:
- **DNS Checker**: https://dnschecker.org/#CNAME/azuria.app.br
- **MX Toolbox**: https://mxtoolbox.com/SuperTool.aspx?action=cname%3aazuria.app.br
- **DNS Propagation**: https://www.whatsmydns.net/#CNAME/azuria.app.br

## 📊 Interpretando os Resultados

### ✅ **DNS Propagado (Sucesso)**
```
Resultado esperado:
azuria.app.br	canonical name = blue-tree-0b17b720f.2.azurestaticapps.net
blue-tree-0b17b720f.2.azurestaticapps.net	internet address = XXX.XXX.XXX.XXX
```

### ⏳ **DNS Ainda Propagando**
```
Possíveis resultados durante propagação:
- "Non-existent domain"
- "No such host is known"
- Timeout ou erro de conexão
```

### ❌ **Erro de Configuração**
```
Se aparecer:
- Outro domínio que não seja o Azure SWA
- "NXDOMAIN" persistente após 24h
- Redirecionamento para página de erro
```

## 🚀 Após Propagação DNS (Próximo Passo)

Quando o `nslookup azuria.app.br` retornar o Azure SWA, execute:

```bash
# Adicionar domínio no Azure Static Web Apps
az staticwebapp hostname set --name "swa-jxbkuxsj7yfpo" --resource-group "Azuria-Resources" --hostname "azuria.app.br" --validation-method "cname-delegation"

# Verificar status do domínio
az staticwebapp hostname list --name "swa-jxbkuxsj7yfpo" --resource-group "Azuria-Resources" --output table

# Verificar detalhes do domínio customizado
az staticwebapp hostname show --name "swa-jxbkuxsj7yfpo" --resource-group "Azuria-Resources" --hostname "azuria.app.br"
```

## ⏰ Timeline Esperado

| Tempo | Status | Ação |
|-------|--------|------|
| **0-2h** | Propagação inicial | Testar `nslookup` ocasionalmente |
| **2-6h** | Propagação parcial | Alguns servidores DNS já resolvem |
| **6-24h** | Propagação completa | Todos os servidores DNS resolvem |
| **24h+** | Configurar Azure | Adicionar domínio no Azure SWA |
| **24-48h** | SSL automático | Azure provisiona certificado |

## 📱 Script de Monitoramento Automático

```powershell
# Monitor DNS - Execute a cada hora
$domain = "azuria.app.br"
$target = "blue-tree-0b17b720f.2.azurestaticapps.net"

do {
    Write-Host "`n🔍 Testando DNS propagação - $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Yellow
    
    try {
        $result = nslookup $domain 2>$null
        if ($result -match $target) {
            Write-Host "✅ DNS PROPAGADO! $domain → $target" -ForegroundColor Green
            Write-Host "🚀 Próximo passo: Configurar no Azure Static Web Apps" -ForegroundColor Cyan
            break
        } else {
            Write-Host "⏳ Ainda propagando... Tentando novamente em 1 hora" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Erro no DNS: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 3600  # 1 hora
} while ($true)
```

## 🆘 Troubleshooting

### **DNS não propaga após 24h**
```powershell
# Verificar configuração no registro.br
# Limpar cache DNS local
ipconfig /flushdns

# Testar com DNS público
nslookup azuria.app.br 1.1.1.1  # Cloudflare
nslookup azuria.app.br 8.8.8.8  # Google
```

### **Erro ao adicionar domínio no Azure**
- Aguardar mais tempo para propagação global
- Verificar se CNAME está correto
- Tentar comando Azure novamente

## 🎯 Resultado Final Esperado

Quando tudo estiver funcionando:
- **http://azuria.app.br** → Redirecionamento automático para HTTPS
- **https://azuria.app.br** → Aplicação Azuria funcionando
- **Certificado SSL** → Válido e automático (Let's Encrypt via Azure)
- **Monitoramento** → Application Insights capturando métricas

## 📞 Status Check Rápido

Execute este comando para verificar tudo:
```powershell
# Check completo
nslookup azuria.app.br; curl -I https://azuria.app.br; az staticwebapp hostname list --name "swa-jxbkuxsj7yfpo" --resource-group "Azuria-Resources"
```