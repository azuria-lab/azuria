<#
.SYNOPSIS
    Configura o domínio personalizado azuria.app.br no Azure Static Web Apps

.DESCRIPTION
    Script para automatizar a configuração do domínio personalizado azuria.app.br
    incluindo verificação de DNS, adição no Azure e monitoramento de SSL

.PARAMETER ResourceGroupName
    Nome do resource group (padrão: Azuria-Resources)

.PARAMETER StaticWebAppName
    Nome do Static Web App (padrão: swa-jxbkuxsj7yfpo)

.PARAMETER UseAzureDNS
    Se deve criar e usar Azure DNS Zone

.EXAMPLE
    .\configure-azuria-domain.ps1
    
.EXAMPLE
    .\configure-azuria-domain.ps1 -UseAzureDNS
#>

param(
    [string]$ResourceGroupName = "Azuria-Resources",
    [string]$StaticWebAppName = "swa-jxbkuxsj7yfpo",
    [switch]$UseAzureDNS = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🌐 Configuração de Domínio Personalizado - azuria.app.br" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Função para testar DNS
function Test-DomainDNS {
    param(
        [string]$Domain
    )
    
    Write-Host "🔍 Verificando DNS para $Domain..." -ForegroundColor Yellow
    
    try {
        $result = Resolve-DnsName -Name $Domain -ErrorAction SilentlyContinue
        if ($result) {
            Write-Host "  ✅ DNS resolvido:" -ForegroundColor Green
            $result | ForEach-Object {
                if ($_.Type -eq "A") {
                    Write-Host "     Tipo: A, IP: $($_.IPAddress)" -ForegroundColor Gray
                }
                elseif ($_.Type -eq "CNAME") {
                    Write-Host "     Tipo: CNAME, Target: $($_.NameHost)" -ForegroundColor Gray
                }
            }
            return $true
        }
        else {
            Write-Host "  ❌ DNS não configurado" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "  ❌ Erro ao resolver DNS: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Função para obter info do Static Web App
function Get-StaticWebAppInfo {
    Write-Host "📊 Obtendo informações do Static Web App..." -ForegroundColor Yellow
    
    try {
        $swa = az staticwebapp show `
            --name $StaticWebAppName `
            --resource-group $ResourceGroupName `
            --output json | ConvertFrom-Json
        
        if ($swa) {
            Write-Host "  ✅ Static Web App encontrado" -ForegroundColor Green
            Write-Host "     Nome: $($swa.name)" -ForegroundColor Gray
            Write-Host "     Default hostname: $($swa.defaultHostname)" -ForegroundColor Gray
            Write-Host "     Location: $($swa.location)" -ForegroundColor Gray
            return $swa
        }
        else {
            Write-Host "  ❌ Static Web App não encontrado" -ForegroundColor Red
            return $null
        }
    }
    catch {
        Write-Host "  ❌ Erro ao obter info: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Função para adicionar custom domain
function Add-CustomDomain {
    param(
        [string]$DomainName
    )
    
    Write-Host "➕ Adicionando domínio $DomainName..." -ForegroundColor Yellow
    
    try {
        az staticwebapp hostname set `
            --name $StaticWebAppName `
            --resource-group $ResourceGroupName `
            --hostname $DomainName `
            --output none
        
        Write-Host "  ✅ Domínio adicionado com sucesso" -ForegroundColor Green
        Write-Host "  ⏳ Aguarde a validação e provisionamento SSL (pode levar até 48h)" -ForegroundColor Yellow
        return $true
    }
    catch {
        Write-Host "  ❌ Erro ao adicionar domínio: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Função para listar custom domains
function Get-CustomDomains {
    Write-Host "📋 Listando custom domains configurados..." -ForegroundColor Yellow
    
    try {
        $domains = az staticwebapp hostname list `
            --name $StaticWebAppName `
            --resource-group $ResourceGroupName `
            --output json | ConvertFrom-Json
        
        if ($domains -and $domains.Count -gt 0) {
            Write-Host "  ✅ Domínios encontrados:" -ForegroundColor Green
            $domains | ForEach-Object {
                $status = if ($_.properties.validationStatus -eq "Succeeded") { "✅" } else { "⏳" }
                Write-Host "     $status $($_.name) - Status: $($_.properties.validationStatus)" -ForegroundColor Gray
            }
        }
        else {
            Write-Host "  ⚠️  Nenhum custom domain configurado" -ForegroundColor Yellow
        }
        
        return $domains
    }
    catch {
        Write-Host "  ❌ Erro ao listar domínios: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Função para criar Azure DNS Zone
function New-AzureDNSZone {
    Write-Host "🌍 Criando Azure DNS Zone..." -ForegroundColor Yellow
    
    try {
        az network dns zone create `
            --resource-group $ResourceGroupName `
            --name "azuria.app.br" `
            --output none
        
        Write-Host "  ✅ DNS Zone criado" -ForegroundColor Green
        
        # Obter name servers
        $ns = az network dns zone show `
            --resource-group $ResourceGroupName `
            --name "azuria.app.br" `
            --query "nameServers" `
            --output json | ConvertFrom-Json
        
        Write-Host ""
        Write-Host "  📝 Configure estes Name Servers no registro.br:" -ForegroundColor Cyan
        $ns | ForEach-Object {
            Write-Host "     $_" -ForegroundColor White
        }
        Write-Host ""
        
        return $true
    }
    catch {
        Write-Host "  ❌ Erro ao criar DNS Zone: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Função para criar registros DNS no Azure
function New-AzureDNSRecords {
    Write-Host "📝 Criando registros DNS no Azure..." -ForegroundColor Yellow
    
    # Obter IP do Static Web App
    $swaHostname = "blue-tree-0b17b720f.2.azurestaticapps.net"
    $ip = "20.36.155.201"
    
    try {
        # Criar registro A para apex
        Write-Host "  ➕ Criando registro A para apex domain..." -ForegroundColor Gray
        az network dns record-set a add-record `
            --resource-group $ResourceGroupName `
            --zone-name "azuria.app.br" `
            --record-set-name "@" `
            --ipv4-address $ip `
            --output none
        
        Write-Host "     [OK] Registro A criado (@ -> $ip)" -ForegroundColor Green
        
        # Criar registro CNAME para www
        Write-Host "  ➕ Criando registro CNAME para www..." -ForegroundColor Gray
        az network dns record-set cname set-record `
            --resource-group $ResourceGroupName `
            --zone-name "azuria.app.br" `
            --record-set-name "www" `
            --cname $swaHostname `
            --output none
        
        Write-Host "     [OK] Registro CNAME criado (www -> $swaHostname)" -ForegroundColor Green
        
        return $true
    }
    catch {
        Write-Host "  ❌ Erro ao criar registros DNS: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main Script
Write-Host "Passo 1: Verificando autenticação Azure..." -ForegroundColor Cyan
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "✅ Autenticado como: $($account.user.name)" -ForegroundColor Green
    Write-Host "   Subscription: $($account.name)" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host "❌ Não autenticado no Azure. Execute: az login" -ForegroundColor Red
    exit 1
}

Write-Host "Passo 2: Verificando DNS atual..." -ForegroundColor Cyan
$apexDNS = Test-DomainDNS -Domain "azuria.app.br"
$wwwDNS = Test-DomainDNS -Domain "www.azuria.app.br"
Write-Host ""

Write-Host "Passo 3: Verificando Static Web App..." -ForegroundColor Cyan
$swa = Get-StaticWebAppInfo
if (-not $swa) {
    Write-Host "❌ Não foi possível continuar sem o Static Web App" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Passo 4: Verificando custom domains existentes..." -ForegroundColor Cyan
$existingDomains = Get-CustomDomains
Write-Host ""

# Se UseAzureDNS, criar DNS Zone
if ($UseAzureDNS) {
    Write-Host "Passo 5: Configurando Azure DNS..." -ForegroundColor Cyan
    
    # Verificar se DNS Zone já existe
    $dnsZone = az network dns zone show `
        --resource-group $ResourceGroupName `
        --name "azuria.app.br" `
        --output json 2>$null | ConvertFrom-Json
    
    if (-not $dnsZone) {
        $created = New-AzureDNSZone
        if ($created) {
            $recordsCreated = New-AzureDNSRecords
        }
    }
    else {
        Write-Host "  ✅ DNS Zone já existe" -ForegroundColor Green
        # Criar registros se não existirem
        $recordsCreated = New-AzureDNSRecords
    }
    Write-Host ""
}

Write-Host "Passo 6: Adicionando custom domains no Static Web App..." -ForegroundColor Cyan

# Verificar se domínios já estão adicionados
$needsApex = -not ($existingDomains | Where-Object { $_.name -eq "azuria.app.br" })
$needsWww = -not ($existingDomains | Where-Object { $_.name -eq "www.azuria.app.br" })

if ($needsApex) {
    if ($apexDNS -or $UseAzureDNS) {
        Add-CustomDomain -DomainName "azuria.app.br"
    }
    else {
        Write-Host "  ⚠️  DNS para azuria.app.br não configurado. Configure primeiro no registro.br" -ForegroundColor Yellow
    }
}
else {
    Write-Host "  ℹ️  azuria.app.br já está adicionado" -ForegroundColor Cyan
}

if ($needsWww) {
    if ($wwwDNS) {
        Add-CustomDomain -DomainName "www.azuria.app.br"
    }
    else {
        Write-Host "  ⚠️  DNS para www.azuria.app.br não configurado. Configure primeiro no registro.br" -ForegroundColor Yellow
    }
}
else {
    Write-Host "  ℹ️  www.azuria.app.br já está adicionado" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "✅ Configuração concluída!" -ForegroundColor Green
Write-Host ""

if (-not $UseAzureDNS) {
    Write-Host "📝 Próximos passos manuais no registro.br:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Acesse https://registro.br" -ForegroundColor White
    Write-Host "2. Vá em 'Meus Domínios' → azuria.app.br → DNS" -ForegroundColor White
    Write-Host ""
    
    if (-not $apexDNS) {
        Write-Host "3. Adicione registro para domínio apex:" -ForegroundColor White
        Write-Host "   Tipo: A" -ForegroundColor Cyan
        Write-Host "   Nome: @" -ForegroundColor Cyan
        Write-Host "   Valor: 20.36.155.201" -ForegroundColor Cyan
        Write-Host "   TTL: 3600" -ForegroundColor Cyan
        Write-Host ""
    }
    
    Write-Host "4. Obtenha TXT records de validação no Azure Portal:" -ForegroundColor White
    Write-Host "   Azure Portal → Static Web Apps → swa-jxbkuxsj7yfpo" -ForegroundColor Cyan
    Write-Host "   → Custom domains → Copie os TXT records" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "5. Adicione TXT records no registro.br para validação" -ForegroundColor White
    Write-Host ""
}

Write-Host "⏳ Aguarde até 48 horas para:" -ForegroundColor Yellow
Write-Host "   • Propagação DNS completa" -ForegroundColor Gray
Write-Host "   • Validação de domínio no Azure" -ForegroundColor Gray
Write-Host "   • Provisionamento de certificados SSL" -ForegroundColor Gray
Write-Host ""

Write-Host "🔍 Verificar status:" -ForegroundColor Cyan
Write-Host "   Azure Portal: https://portal.azure.com" -ForegroundColor Gray
Write-Host "   DNS: nslookup azuria.app.br" -ForegroundColor Gray
Write-Host "   DNS: nslookup www.azuria.app.br" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 Relatório completo: DOMAIN_DIAGNOSTIC_REPORT.md" -ForegroundColor Cyan
Write-Host ""
