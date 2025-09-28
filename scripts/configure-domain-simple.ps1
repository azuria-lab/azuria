# Simple Custom Domain Configuration
param(
    [string]$ResourceGroupName = "Azuria-Resources",
    [string]$StaticWebAppName = "swa-jxbkuxsj7yfpo",
    [string]$CustomDomain = "azuria.app.br"
)

Write-Host "Custom Domain Configuration" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Cyan

# Verificar Azure CLI
try {
    az account show --output none
    Write-Host "Azure CLI authenticated" -ForegroundColor Green
}
catch {
    Write-Host "Please run: az login" -ForegroundColor Red
    exit 1
}

# Obter informações do Static Web App
Write-Host "Getting Static Web App information..." -ForegroundColor Yellow
$swa = az staticwebapp show --name $StaticWebAppName --resource-group $ResourceGroupName | ConvertFrom-Json

if ($swa) {
    Write-Host "Static Web App found: $($swa.name)" -ForegroundColor Green
    Write-Host "Default hostname: $($swa.defaultHostname)" -ForegroundColor Cyan
    
    # Adicionar domínio customizado
    Write-Host "Adding custom domain: $CustomDomain" -ForegroundColor Yellow
    
    az staticwebapp hostname set --name $StaticWebAppName --resource-group $ResourceGroupName --hostname $CustomDomain
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Custom domain added successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "Error adding custom domain" -ForegroundColor Red
    }
    
    # Mostrar DNS requirements
    Write-Host "`nDNS Configuration Required:" -ForegroundColor Cyan
    Write-Host "Add CNAME record:" -ForegroundColor White
    Write-Host "  Name: $CustomDomain" -ForegroundColor Gray
    Write-Host "  Value: $($swa.defaultHostname)" -ForegroundColor Gray
    
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Configure DNS with your provider" -ForegroundColor White
    Write-Host "2. Wait for DNS propagation" -ForegroundColor White
    Write-Host "3. SSL will be configured automatically" -ForegroundColor White
}
else {
    Write-Host "Static Web App not found" -ForegroundColor Red
}