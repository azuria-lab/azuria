# Smart Alerts Configuration Script
# Configura alertas inteligentes para monitoramento da Azuria

param(
    [string]$SubscriptionId = "cdb292f9-b4c2-4513-ae78-de6238161d25",
    [string]$ResourceGroup = "Azuria-Resources",
    [string]$AppInsightsName = "ai-jxbkuxsj7yfpo"
)

Write-Host "Smart Alerts Configuration" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Cyan

# Verificar Azure CLI
try {
    az account show --output none
    Write-Host "Azure CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "Please run: az login" -ForegroundColor Red
    exit 1
}

# Configurar subscription
az account set --subscription $SubscriptionId

# Obter resource ID do Application Insights
$appInsightsId = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/components/$AppInsightsName"

Write-Host "Configuring alerts for: $AppInsightsName" -ForegroundColor Blue

# Criar Action Group (se não existir)
Write-Host "Creating Action Group..." -ForegroundColor Yellow

try {
    az monitor action-group create `
        --name "azuria-alerts" `
        --resource-group $ResourceGroup `
        --short-name "azuriaalert" `
        --action email "admin" "admin@azuria.com"
    
    Write-Host "Action Group created successfully" -ForegroundColor Green
} catch {
    Write-Host "Action Group may already exist" -ForegroundColor Yellow
}

# Definir alertas
$alerts = @(
    @{
        Name = "azuria-high-error-rate"
        Description = "High Error Rate Alert"
        Query = "exceptions | where timestamp > ago(15m) | summarize errorCount = count() | where errorCount > 10"
        Frequency = "PT5M"
        TimeWindow = "PT15M"
    },
    @{
        Name = "azuria-slow-response-time"
        Description = "Slow Response Time Alert"
        Query = "requests | where timestamp > ago(15m) | summarize avgDuration = avg(duration) | where avgDuration > 5000"
        Frequency = "PT5M"
        TimeWindow = "PT15M"
    },
    @{
        Name = "azuria-low-availability"
        Description = "Low Availability Alert"
        Query = "requests | where timestamp > ago(1h) | summarize availability = 100.0 * countif(success == true) / count() | where availability < 95"
        Frequency = "PT15M"
        TimeWindow = "PT1H"
    }
)

Write-Host "Creating alert rules..." -ForegroundColor Blue

foreach ($alert in $alerts) {
    Write-Host "Creating alert: $($alert.Description)" -ForegroundColor Cyan
    
    try {
        az monitor scheduled-query create `
            --name $alert.Name `
            --resource-group $ResourceGroup `
            --scopes $appInsightsId `
            --condition "count 'GreaterThan' Static 0 5" `
            --condition-query $alert.Query `
            --description $alert.Description `
            --evaluation-frequency $alert.Frequency `
            --window-size $alert.TimeWindow `
            --action-groups "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/actionGroups/azuria-alerts" `
            --severity 2
        
        Write-Host "Alert created: $($alert.Name)" -ForegroundColor Green
    } catch {
        Write-Host "Error creating alert: $($alert.Name)" -ForegroundColor Red
    }
}

Write-Host "Alert configuration completed!" -ForegroundColor Green

# Mostrar informações dos alertas
Write-Host "`nAlert Rules Created:" -ForegroundColor Cyan
Write-Host "1. High Error Rate (>10 errors/15min)" -ForegroundColor White
Write-Host "2. Slow Response Time (>5s average)" -ForegroundColor White
Write-Host "3. Low Availability (<95%)" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Verify alerts in Azure Portal" -ForegroundColor White
Write-Host "2. Test alert notifications" -ForegroundColor White
Write-Host "3. Adjust thresholds as needed" -ForegroundColor White

$portalUrl = "https://portal.azure.com/#@/resource/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/components/$AppInsightsName/alertsV2"
Write-Host "`nAlerts Portal: $portalUrl" -ForegroundColor Blue