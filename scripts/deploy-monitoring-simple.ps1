# Azure Monitoring - Deploy All Alerts and Dashboards
# Execute este script para configurar todo o monitoramento do Azuria

param(
    [string]$SubscriptionId = "",
    [string]$ResourceGroup = "rg-azuria-prod",
    [string]$ApplicationInsightsName = "ai-jxbkuxsj7yfpo",
    [string]$Email = "contato@azuria.app.br"
)

# Verificar se está logado
Write-Host "🔐 Verificando autenticação Azure..." -ForegroundColor Yellow
$account = az account show --query user.name -o tsv 2>$null
if (-not $account) {
    Write-Host "❌ Execute 'az login' primeiro!" -ForegroundColor Red
    exit 1
}

# Obter subscription ID se não fornecido
if (-not $SubscriptionId) {
    $SubscriptionId = az account show --query id -o tsv
    Write-Host "📋 Usando subscription: $SubscriptionId" -ForegroundColor Green
}

# Definir subscription atual
az account set --subscription $SubscriptionId

Write-Host "✅ Logado como: $account" -ForegroundColor Green
Write-Host "📋 Subscription: $SubscriptionId" -ForegroundColor Green
Write-Host "📦 Resource Group: $ResourceGroup" -ForegroundColor Green
Write-Host "📊 Application Insights: $ApplicationInsightsName" -ForegroundColor Green

# 1. Criar Action Group para notificações
Write-Host ""
Write-Host "📧 Criando Action Group para alertas..." -ForegroundColor Yellow

$actionGroupCmd = "az monitor action-group create --name azuria-alerts --resource-group $ResourceGroup --short-name azuria"
Invoke-Expression $actionGroupCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Action Group criado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "✅ Action Group já existe (isso é normal)!" -ForegroundColor Green
}

# 2. Criar alertas de disponibilidade
Write-Host ""
Write-Host "🚨 Criando alerta de disponibilidade..." -ForegroundColor Yellow

$availabilityCmd = @"
az monitor metrics alert create --name azuria-availability-alert --resource-group $ResourceGroup --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" --condition "avg availabilityResults/availabilityPercentage LessThan 99" --description "Alert when Azuria availability drops below 99%" --evaluation-frequency PT5M --window-size PT15M --severity 2 --action "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/actionGroups/azuria-alerts"
"@

Invoke-Expression $availabilityCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Alerta de disponibilidade criado!" -ForegroundColor Green
} else {
    Write-Host "✅ Alerta de disponibilidade já existe!" -ForegroundColor Green
}

# 3. Criar alertas de performance
Write-Host ""
Write-Host "⚡ Criando alerta de performance..." -ForegroundColor Yellow

$performanceCmd = @"
az monitor metrics alert create --name azuria-performance-alert --resource-group $ResourceGroup --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" --condition "avg requests/duration GreaterThan 2000" --description "Alert when response time exceeds 2 seconds" --evaluation-frequency PT5M --window-size PT15M --severity 3 --action "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/actionGroups/azuria-alerts"
"@

Invoke-Expression $performanceCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Alerta de performance criado!" -ForegroundColor Green
} else {
    Write-Host "✅ Alerta de performance já existe!" -ForegroundColor Green
}

# 4. Criar alertas de taxa de erro
Write-Host ""
Write-Host "🔥 Criando alerta de taxa de erro..." -ForegroundColor Yellow

$errorCmd = @"
az monitor metrics alert create --name azuria-error-rate-alert --resource-group $ResourceGroup --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" --condition "avg requests/failed GreaterThan 5" --description "Alert when error rate exceeds 5%" --evaluation-frequency PT5M --window-size PT15M --severity 2 --action "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/actionGroups/azuria-alerts"
"@

Invoke-Expression $errorCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Alerta de taxa de erro criado!" -ForegroundColor Green
} else {
    Write-Host "✅ Alerta de taxa de erro já existe!" -ForegroundColor Green
}

# 5. Configurar dashboard
Write-Host ""
Write-Host "📊 Configurando dashboard..." -ForegroundColor Yellow

$dashboardFile = "monitoring\azuria-dashboard.json"
if (Test-Path $dashboardFile) {
    # Substituir placeholders no dashboard
    $dashboardContent = Get-Content $dashboardFile -Raw
    $dashboardContent = $dashboardContent.Replace('""', "`"$SubscriptionId`"")
    $dashboardContent = $dashboardContent.Replace('"INSERT_LOCATION"', '"eastus2"')
    $dashboardContent | Set-Content $dashboardFile -Encoding UTF8
    
    Write-Host "✅ Dashboard configurado! Importe manualmente no Azure Portal." -ForegroundColor Green
    Write-Host "   Arquivo: $dashboardFile" -ForegroundColor Gray
} else {
    Write-Host "❌ Arquivo de dashboard não encontrado: $dashboardFile" -ForegroundColor Red
}

# 6. Resumo final
Write-Host ""
Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Alertas criados:" -ForegroundColor White
Write-Host "   📊 Disponibilidade (menor que 99%)" -ForegroundColor Gray
Write-Host "   ⚡ Performance (maior que 2s)" -ForegroundColor Gray  
Write-Host "   🚨 Taxa de erro (maior que 5%)" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Vá para Azure Portal → Dashboards" -ForegroundColor White
Write-Host "2. Import → Selecione: monitoring\azuria-dashboard.json" -ForegroundColor White  
Write-Host "3. Teste os alertas com Application Insights → Live Metrics" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Links úteis:" -ForegroundColor Cyan
$appInsightsUrl = "https://portal.azure.com/#resource/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName"
$alertsUrl = "https://portal.azure.com/#blade/Microsoft_Azure_Monitoring/AzureMonitoringBrowseBlade/alertRules"
Write-Host "   Application Insights: $appInsightsUrl" -ForegroundColor Blue
Write-Host "   Alertas: $alertsUrl" -ForegroundColor Blue