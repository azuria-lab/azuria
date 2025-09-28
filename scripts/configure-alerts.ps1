Write-Host "Configurando monitoramento Azure Application Insights..." -ForegroundColor Green

# Obter subscription ID
$SubscriptionId = az account show --query id -o tsv
Write-Host "Subscription: $SubscriptionId" -ForegroundColor Yellow

# Definir variáveis
$ResourceGroup = "rg-azuria-prod"
$ApplicationInsightsName = "ai-jxbkuxsj7yfpo"

# 1. Criar Action Group
Write-Host "Criando Action Group..." -ForegroundColor Yellow
az monitor action-group create --name "azuria-alerts" --resource-group $ResourceGroup --short-name "azuria"

# 2. Criar alerta de disponibilidade
Write-Host "Criando alerta de disponibilidade..." -ForegroundColor Yellow
az monitor metrics alert create `
    --name "azuria-availability-alert" `
    --resource-group $ResourceGroup `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" `
    --condition "avg availabilityResults/availabilityPercentage LessThan 99" `
    --description "Alert when availability drops below 99%" `
    --evaluation-frequency "PT5M" `
    --window-size "PT15M" `
    --severity 2

# 3. Criar alerta de performance
Write-Host "Criando alerta de performance..." -ForegroundColor Yellow
az monitor metrics alert create `
    --name "azuria-performance-alert" `
    --resource-group $ResourceGroup `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" `
    --condition "avg requests/duration GreaterThan 2000" `
    --description "Alert when response time exceeds 2 seconds" `
    --evaluation-frequency "PT5M" `
    --window-size "PT15M" `
    --severity 3

# 4. Criar alerta de erro
Write-Host "Criando alerta de erro..." -ForegroundColor Yellow
az monitor metrics alert create `
    --name "azuria-error-rate-alert" `
    --resource-group $ResourceGroup `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" `
    --condition "avg requests/failed GreaterThan 5" `
    --description "Alert when error rate exceeds 5%" `
    --evaluation-frequency "PT5M" `
    --window-size "PT15M" `
    --severity 2

Write-Host "Configuracao concluida!" -ForegroundColor Green
Write-Host "Verifique os alertas no Azure Portal" -ForegroundColor Cyan