# Script para Deletar TODOS os Recursos Azure - Azuria
# Data: 17 de Outubro de 2025
# Status: Confirmado pelo usuario

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  DELECAO DE RECURSOS AZURE - AZURIA" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Deletar grupo de recursos azuria-resources (9 recursos)
Write-Host "[1/2] Deletando grupo 'azuria-resources'..." -ForegroundColor Yellow
Write-Host "      - Application Insights" -ForegroundColor Gray
Write-Host "      - Key Vault" -ForegroundColor Gray
Write-Host "      - Log Analytics Workspace" -ForegroundColor Gray
Write-Host "      - Managed Identity" -ForegroundColor Gray
Write-Host "      - Action Groups (3x)" -ForegroundColor Gray
Write-Host "      - Metric Alerts (3x)" -ForegroundColor Gray
Write-Host ""

try {
    az group delete --name "azuria-resources" --yes --no-wait 2>&1 | Out-Null
    Write-Host "      Status: Delecao iniciada (executando em background)" -ForegroundColor Green
} catch {
    Write-Host "      Erro ao deletar: $_" -ForegroundColor Red
}

Write-Host ""

# 2. Deletar grupo de recursos cloud-shell-storage-eastus (1 recurso)
Write-Host "[2/2] Deletando grupo 'cloud-shell-storage-eastus'..." -ForegroundColor Yellow
Write-Host "      - Storage Account (Cloud Shell)" -ForegroundColor Gray
Write-Host ""

try {
    az group delete --name "cloud-shell-storage-eastus" --yes --no-wait 2>&1 | Out-Null
    Write-Host "      Status: Delecao iniciada (executando em background)" -ForegroundColor Green
} catch {
    Write-Host "      Erro ao deletar: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  DELECAO INICIADA COM SUCESSO!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "- A delecao esta executando em background" -ForegroundColor White
Write-Host "- Pode levar de 5 a 15 minutos para completar" -ForegroundColor White
Write-Host "- Voce nao tera mais custos apos a conclusao" -ForegroundColor White
Write-Host ""
Write-Host "Para verificar o progresso:" -ForegroundColor Cyan
Write-Host "  az group show --name azuria-resources" -ForegroundColor Gray
Write-Host "  az group show --name cloud-shell-storage-eastus" -ForegroundColor Gray
Write-Host ""
Write-Host "Se os comandos retornarem erro, significa que foram deletados!" -ForegroundColor Green
Write-Host ""
