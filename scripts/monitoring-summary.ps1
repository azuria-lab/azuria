Write-Host "Configurando alertas inteligentes para o Azuria..." -ForegroundColor Green

$SubscriptionId = "cdb292f9-b4c2-4513-ae78-de6238161d25"
$ResourceGroup = "Azuria-Resources"
$ApplicationInsightsName = "ai-jxbkuxsj7yfpo"

# Alertas básicos já configurados anteriormente
Write-Host "Alertas básicos já configurados:" -ForegroundColor Yellow
Write-Host "  - Disponibilidade menor que 99%" -ForegroundColor Gray
Write-Host "  - Performance maior que 2 segundos" -ForegroundColor Gray
Write-Host "  - Erros maior que 10 por 15 minutos" -ForegroundColor Gray

# Links importantes
Write-Host ""
Write-Host "Links para configurar alertas avançados manualmente:" -ForegroundColor Cyan
Write-Host "Application Insights:" -ForegroundColor White
Write-Host "https://portal.azure.com/#resource/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$ApplicationInsightsName" -ForegroundColor Blue

Write-Host ""
Write-Host "Para criar alertas baseados em queries:" -ForegroundColor White
Write-Host "1. Va para Application Insights > Logs" -ForegroundColor Gray
Write-Host "2. Execute as queries do arquivo monitoring/queries/azuria-kql-queries.md" -ForegroundColor Gray
Write-Host "3. Clique em 'New alert rule' para criar alertas customizados" -ForegroundColor Gray

Write-Host ""
Write-Host "Dashboards prontos para importar:" -ForegroundColor Cyan
Write-Host "  - monitoring/dashboards/azuria-production-dashboard.json" -ForegroundColor Gray
Write-Host "  - monitoring/dashboards/azuria-performance-dashboard.json" -ForegroundColor Gray
Write-Host "  - monitoring/dashboards/azuria-business-dashboard.json" -ForegroundColor Gray

Write-Host ""
Write-Host "Configuracao de monitoramento concluida!" -ForegroundColor Green