# Configure Custom Domain for Azure Static Web Apps
# This script configures azuria.app.br domain for the Static Web App

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$StaticWebAppName,
    
    [string]$CustomDomain = "azuria.app.br"
)

Write-Host "🌐 Configuring custom domain for Azure Static Web App..." -ForegroundColor Blue

try {
    # Get Static Web App details
    Write-Host "Getting Static Web App details..." -ForegroundColor Yellow
    $swa = az staticwebapp show --name $StaticWebAppName --resource-group $ResourceGroupName | ConvertFrom-Json
    
    if (-not $swa) {
        throw "Static Web App '$StaticWebAppName' not found in resource group '$ResourceGroupName'"
    }
    
    Write-Host "Found Static Web App: $($swa.name)" -ForegroundColor Green
    Write-Host "Default URL: https://$($swa.defaultHostname)" -ForegroundColor Cyan
    
    # Add custom domain
    Write-Host "Adding custom domain '$CustomDomain'..." -ForegroundColor Yellow
    
    $result = az staticwebapp hostname set --name $StaticWebAppName --resource-group $ResourceGroupName --hostname $CustomDomain --validation-method "cname-delegation" | ConvertFrom-Json
    
    if ($result) {
        Write-Host "🎉 Custom domain added successfully!" -ForegroundColor Green
        Write-Host "🌐 Custom URL: https://$CustomDomain" -ForegroundColor Cyan
        
        # Get validation token
        Write-Host "📋 Getting DNS validation information..." -ForegroundColor Yellow
        $validation = az staticwebapp hostname show --name $StaticWebAppName --resource-group $ResourceGroupName --hostname $CustomDomain | ConvertFrom-Json
        
        if ($validation) {
            Write-Host "`n📝 DNS Configuration Required:" -ForegroundColor Magenta
            Write-Host "════════════════════════════════════════" -ForegroundColor Magenta
            Write-Host "Add the following CNAME record to your DNS:" -ForegroundColor White
            Write-Host "  Type: CNAME" -ForegroundColor White
            Write-Host "  Name: $CustomDomain" -ForegroundColor White
            Write-Host "  Value: $($swa.defaultHostname)" -ForegroundColor White
            Write-Host "`nFor registro.br DNS management:" -ForegroundColor Yellow
            Write-Host "1. Login to https://registro.br" -ForegroundColor White
            Write-Host "2. Go to DNS management for azuria.app.br" -ForegroundColor White
            Write-Host "3. Add CNAME record pointing to: $($swa.defaultHostname)" -ForegroundColor White
            Write-Host "════════════════════════════════════════" -ForegroundColor Magenta
        }
    }
    
    # List all hostnames
    Write-Host "`n📋 Current hostnames for Static Web App:" -ForegroundColor Yellow
    az staticwebapp hostname list --name $StaticWebAppName --resource-group $ResourceGroupName --output table
    
    Write-Host "`n✅ Custom domain configuration completed!" -ForegroundColor Green
    Write-Host "⏳ Note: SSL certificate will be provisioned automatically after DNS validation (may take up to 24 hours)" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error configuring custom domain: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}