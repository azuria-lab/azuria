# Configurar Alertas Inteligentes Avançados para Azuria
# Performance, Downtime, Erros e Métricas de Negócio

param(
    [string]$SubscriptionId = "cdb292f9-b4c2-4513-ae78-de6238161d25",
    [string]$ResourceGroup = "Azuria-Resources",
    [string]$ApplicationInsightsName = "ai-jxbkuxsj7yfpo",
    [string]$Email = "contato@azuria.app.br"
)

Write-Host "🚨 Configurando Alertas Inteligentes Avançados..." -ForegroundColor Green

# 1. Alerta de Core Web Vitals - Performance Crítica
Write-Host "⚡ Criando alerta de Core Web Vitals..." -ForegroundColor Yellow
az monitor scheduled-query create `
    --name "azuria-core-web-vitals-alert" `
    --resource-group $ResourceGroup `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" `
    --condition "count > 5" `
    --condition-query "customEvents | where name == 'web_vitals' and tostring(customDimensions.name) == 'LCP' and todouble(customDimensions.value) > 4000 | summarize count()" `
    --description "Alert when LCP (Largest Contentful Paint) exceeds 4 seconds for multiple users" `
    --evaluation-frequency "PT5M" `
    --window-size "PT15M" `
    --severity 2 `
    --action-groups "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/actionGroups/azuria-alerts"

# 2. Alerta de Spike de Erros JavaScript
Write-Host "🔥 Criando alerta de spike de erros..." -ForegroundColor Yellow
az monitor scheduled-query create `
    --name "azuria-javascript-error-spike" `
    --resource-group $ResourceGroup `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" `
    --condition "count > 20" `
    --condition-query "exceptions | where timestamp > ago(15m) | summarize count()" `
    --description "Alert when JavaScript errors spike above normal levels" `
    --evaluation-frequency "PT5M" `
    --window-size "PT15M" `
    --severity 1 `
    --action-groups "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/actionGroups/azuria-alerts"

# 3. Alerta de Performance API Supabase
Write-Host "🔗 Criando alerta de performance API..." -ForegroundColor Yellow
az monitor scheduled-query create `
    --name "azuria-api-performance-alert" `
    --resource-group $ResourceGroup `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" `
    --condition "count > 10" `
    --condition-query "customEvents | where name == 'api_request' and toint(customDimensions.duration) > 5000 | summarize count()" `
    --description "Alert when API calls take longer than 5 seconds" `
    --evaluation-frequency "PT5M" `
    --window-size "PT15M" `
    --severity 3 `
    --action-groups "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/actionGroups/azuria-alerts"

# 4. Alerta de Conversão Baixa (Business Intelligence)
Write-Host "💼 Criando alerta de conversão de negócio..." -ForegroundColor Yellow
az monitor scheduled-query create `
    --name "azuria-low-conversion-alert" `
    --resource-group $ResourceGroup `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" `
    --condition "count < 5" `
    --condition-query "customEvents | where name == 'user_signup' and timestamp > ago(24h) | summarize count()" `
    --description "Alert when daily signups drop below expected threshold" `
    --evaluation-frequency "PT1H" `
    --window-size "PT24H" `
    --severity 4 `
    --action-groups "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/actionGroups/azuria-alerts"

# 5. Alerta de Anomalia de Tráfego
Write-Host "📊 Criando alerta de anomalia de tráfego..." -ForegroundColor Yellow
az monitor scheduled-query create `
    --name "azuria-traffic-anomaly-alert" `
    --resource-group $ResourceGroup `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" `
    --condition "count > 2000" `
    --condition-query "pageViews | where timestamp > ago(1h) | summarize count()" `
    --description "Alert when hourly traffic exceeds normal patterns (potential DDoS or viral content)" `
    --evaluation-frequency "PT15M" `
    --window-size "PT1H" `
    --severity 4 `
    --action-groups "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/actionGroups/azuria-alerts"

# 6. Alerta de Falha de Feature Crítica
Write-Host "🎯 Criando alerta de falha de feature..." -ForegroundColor Yellow
az monitor scheduled-query create `
    --name "azuria-critical-feature-failure" `
    --resource-group $ResourceGroup `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" `
    --condition "count < 1" `
    --condition-query "customEvents | where name == 'pricing_calculation' and timestamp > ago(2h) | summarize count()" `
    --description "Alert when critical pricing calculator feature shows no usage (potential failure)" `
    --evaluation-frequency "PT30M" `
    --window-size "PT2H" `
    --severity 1 `
    --action-groups "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/actionGroups/azuria-alerts"

Write-Host "✅ Alertas inteligentes configurados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Alertas criados:" -ForegroundColor Cyan
Write-Host "  ⚡ Core Web Vitals (LCP > 4s)" -ForegroundColor White
Write-Host "  🔥 Spike de Erros JavaScript (> 20 erros/15min)" -ForegroundColor White
Write-Host "  🔗 Performance API (> 5s latência)" -ForegroundColor White
Write-Host "  💼 Conversão Baixa (< 5 signups/dia)" -ForegroundColor White
Write-Host "  📊 Anomalia de Tráfego (> 2000 views/hora)" -ForegroundColor White
Write-Host "  🎯 Falha de Feature Crítica (sem uso calculadora/2h)" -ForegroundColor White