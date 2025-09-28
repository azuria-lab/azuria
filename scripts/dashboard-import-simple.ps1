# Simple Dashboard Import Script
# Importa dashboards via REST API diretamente

param(
    [string]$SubscriptionId = "cdb292f9-b4c2-4513-ae78-de6238161d25",
    [string]$ResourceGroup = "Azuria-Resources"
)

Write-Host "Dashboard Import - Azure Portal" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# Verificar autenticação
try {
    az account show --output none
    Write-Host "Azure CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "Please run: az login" -ForegroundColor Red
    exit 1
}

# Configurar subscription
az account set --subscription $SubscriptionId

Write-Host "Dashboard files ready for manual import:" -ForegroundColor Blue
Write-Host "1. monitoring/dashboards/azuria-production-dashboard.json" -ForegroundColor White
Write-Host "2. monitoring/dashboards/azuria-performance-dashboard.json" -ForegroundColor White  
Write-Host "3. monitoring/dashboards/azuria-business-dashboard.json" -ForegroundColor White

Write-Host "`nManual import steps:" -ForegroundColor Cyan
Write-Host "1. Open Azure Portal: https://portal.azure.com" -ForegroundColor White
Write-Host "2. Go to Dashboard > Browse All Dashboards > Upload" -ForegroundColor White
Write-Host "3. Select JSON files from monitoring/dashboards/" -ForegroundColor White
Write-Host "4. Configure resource context to Application Insights" -ForegroundColor White

Write-Host "`nApplication Insights Resource:" -ForegroundColor Yellow
Write-Host "Name: ai-jxbkuxsj7yfpo" -ForegroundColor White
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "Subscription: $SubscriptionId" -ForegroundColor White

Write-Host "`nDashboard URLs after import:" -ForegroundColor Cyan
$baseUrl = "https://portal.azure.com/#@/dashboard/arm/subscriptions/$SubscriptionId/resourcegroups/$ResourceGroup/providers/microsoft.portal/dashboards"
Write-Host "$baseUrl/Azuria-Production-Dashboard" -ForegroundColor Blue
Write-Host "$baseUrl/Azuria-Performance-Dashboard" -ForegroundColor Blue
Write-Host "$baseUrl/Azuria-Business-Dashboard" -ForegroundColor Blue

Write-Host "`nReady for dashboard import!" -ForegroundColor Green