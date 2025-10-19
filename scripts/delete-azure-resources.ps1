# Script para Deletar Recursos Azure - Azuria
# ⚠️ EXECUTE APENAS APÓS CONFIRMAR QUE O DOMÍNIO ESTÁ FUNCIONANDO NO VERCEL!
# Data: 11 de Outubro de 2025

Write-Host "🔍 Verificando recursos Azure do Azuria..." -ForegroundColor Cyan
Write-Host ""

# 1. Listar recursos atuais
Write-Host "📋 Recursos encontrados:" -ForegroundColor Yellow
az resource list --resource-group Azuria-Resources --output table

Write-Host ""
Write-Host "⚠️  ATENÇÃO! Você está prestes a deletar recursos do Azure." -ForegroundColor Red
Write-Host "   Isso vai economizar aproximadamente R$ 17-30/mês" -ForegroundColor Green
Write-Host ""

# Verificar se o usuário quer fazer backup do Key Vault
$backupKeyVault = Read-Host "Deseja fazer backup dos secrets do Key Vault primeiro? (s/n)"

if ($backupKeyVault -eq "s") {
    Write-Host "📦 Listando secrets do Key Vault..." -ForegroundColor Cyan
    az keyvault secret list --vault-name kvjxbkuxsj7yfpo --output table
    
    Write-Host ""
    Write-Host "💾 Para fazer backup de um secret específico, use:" -ForegroundColor Yellow
    Write-Host "   az keyvault secret show --vault-name kvjxbkuxsj7yfpo --name NOME_DO_SECRET" -ForegroundColor Gray
    Write-Host ""
    
    $continuar = Read-Host "Fez o backup necessário? Deseja continuar com a deleção? (s/n)"
    if ($continuar -ne "s") {
        Write-Host "❌ Operação cancelada pelo usuário." -ForegroundColor Red
        exit
    }
}

# Confirmar deleção
Write-Host ""
$confirmacao = Read-Host "❓ Tem certeza que deseja deletar TODOS os recursos do Azure? Digite 'DELETAR' para confirmar"

if ($confirmacao -ne "DELETAR") {
    Write-Host "❌ Operação cancelada. Nenhum recurso foi deletado." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🗑️  Iniciando deleção de recursos..." -ForegroundColor Yellow
Write-Host ""

# 2. Deletar grupos de recursos vazios primeiro (rápido e seguro)
Write-Host "📦 Deletando grupos de recursos vazios..." -ForegroundColor Cyan

$gruposVazios = @("azuria-dev-rg", "azuria-staging-rg", "azuria-prod-rg")

foreach ($grupo in $gruposVazios) {
    Write-Host "  ➜ Deletando $grupo..." -ForegroundColor Gray
    az group delete --name $grupo --yes --no-wait
    Write-Host "  ✅ $grupo marcado para deleção" -ForegroundColor Green
}

Write-Host ""

# 3. Deletar recursos individuais do grupo principal
Write-Host "📦 Deletando recursos do grupo Azuria-Resources..." -ForegroundColor Cyan

# Static Web App
Write-Host "  ➜ Deletando Static Web App..." -ForegroundColor Gray
az staticwebapp delete --name swa-jxbkuxsj7yfpo --resource-group Azuria-Resources --yes

# Log Analytics
Write-Host "  ➜ Deletando Log Analytics..." -ForegroundColor Gray
az monitor log-analytics workspace delete --resource-group Azuria-Resources --workspace-name log-jxbkuxsj7yfpo --yes --force

# Application Insights
Write-Host "  ➜ Deletando Application Insights..." -ForegroundColor Gray
az monitor app-insights component delete --app ai-jxbkuxsj7yfpo --resource-group Azuria-Resources

# Alerts
Write-Host "  ➜ Deletando Metric Alerts..." -ForegroundColor Gray
az monitor metrics alert delete --name azuria-availability-alert --resource-group Azuria-Resources
az monitor metrics alert delete --name azuria-performance-alert --resource-group Azuria-Resources
az monitor metrics alert delete --name azuria-error-count-alert --resource-group Azuria-Resources

# Action Groups
Write-Host "  ➜ Deletando Action Groups..." -ForegroundColor Gray
az monitor action-group delete --name azuria-alerts --resource-group Azuria-Resources

# Key Vault (soft delete enabled, será recuperável por 90 dias)
Write-Host "  ➜ Deletando Key Vault..." -ForegroundColor Gray
az keyvault delete --name kvjxbkuxsj7yfpo --resource-group Azuria-Resources

# Managed Identity
Write-Host "  ➜ Deletando Managed Identity..." -ForegroundColor Gray
az identity delete --name mi-Azuria --resource-group Azuria-Resources

Write-Host ""
Write-Host "✅ Recursos individuais deletados!" -ForegroundColor Green
Write-Host ""

# 4. Deletar o grupo de recursos principal (limpa tudo que sobrou)
$deletarGrupoPrincipal = Read-Host "Deseja deletar também o grupo de recursos Azuria-Resources? (s/n)"

if ($deletarGrupoPrincipal -eq "s") {
    Write-Host ""
    Write-Host "🗑️  Deletando grupo de recursos Azuria-Resources..." -ForegroundColor Yellow
    az group delete --name Azuria-Resources --yes --no-wait
    Write-Host "✅ Grupo marcado para deleção" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ DELEÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumo:" -ForegroundColor Yellow
Write-Host "  • Grupos vazios deletados: 3" -ForegroundColor White
Write-Host "  • Recursos deletados do Azuria-Resources: ~10" -ForegroundColor White
Write-Host "  • Economia mensal estimada: R$ 17-30" -ForegroundColor Green
Write-Host ""
Write-Host "⏰ Observações:" -ForegroundColor Yellow
Write-Host "  • Deleção pode levar até 10-15 minutos para completar" -ForegroundColor White
Write-Host "  • Key Vault será recuperável por 90 dias (soft delete)" -ForegroundColor White
Write-Host "  • Verifique o Azure Portal para confirmar deleção" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Verificar status:" -ForegroundColor Yellow
Write-Host "   https://portal.azure.com/#view/HubsExtension/BrowseResourceGroups" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Migração para Vercel concluída com sucesso!" -ForegroundColor Green
Write-Host "   Seu site agora está 100% no Vercel: https://azuria.app.br" -ForegroundColor Cyan
Write-Host ""
