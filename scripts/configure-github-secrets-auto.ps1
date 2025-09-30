# Script para configurar automaticamente os GitHub Secrets
# Azuria Project - Automated GitHub Secrets Configuration

Write-Host ""
Write-Host "CONFIGURANDO GITHUB SECRETS AUTOMATICAMENTE" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Credenciais devem ser obtidas do arquivo azure-credentials gerado
# Execute primeiro: .\generate-azure-credentials.ps1 -CreateResourceGroups
Write-Host "ERRO: Este script foi atualizado para nao conter credenciais hardcoded!" -ForegroundColor Red
Write-Host "As credenciais ja foram configuradas com sucesso nos GitHub Secrets." -ForegroundColor Green
Write-Host "Para reconfigurar, execute: .\generate-azure-credentials.ps1" -ForegroundColor Yellow
exit 0

$secrets = @{
    "AZURE_CLIENT_ID" = "PLACEHOLDER"
    "AZURE_CLIENT_SECRET" = "PLACEHOLDER" 
    "AZURE_TENANT_ID" = "PLACEHOLDER"
    "AZURE_SUBSCRIPTION_ID" = "PLACEHOLDER"
    "REGISTRY_LOGIN_SERVER" = "PLACEHOLDER"
    "REGISTRY_USERNAME" = "PLACEHOLDER"
    "REGISTRY_PASSWORD" = "PLACEHOLDER"
}

$repository = "azuria-lab/azuria"

# Verificar GitHub CLI
try {
    $ghUser = gh api user --jq .login 2>$null
    if ($ghUser) {
        Write-Host "OK GitHub autenticado como: $ghUser" -ForegroundColor Green
    } else {
        Write-Host "ERRO: Nao autenticado no GitHub" -ForegroundColor Red
        Write-Host "Execute: gh auth login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "ERRO: GitHub CLI nao encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configurando secrets no repositorio: $repository" -ForegroundColor Blue
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($secret in $secrets.GetEnumerator()) {
    try {
        Write-Host "Configurando: $($secret.Key)" -ForegroundColor Yellow
        
        # Configurar secret usando GitHub CLI
        $secret.Value | gh secret set $secret.Key --repo $repository
        
        Write-Host "OK $($secret.Key) configurado!" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "ERRO ao configurar $($secret.Key): $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "RESUMO:" -ForegroundColor Cyan
Write-Host "Secrets configurados: $successCount" -ForegroundColor Green
Write-Host "Secrets com erro: $errorCount" -ForegroundColor Red

if ($errorCount -eq 0) {
    Write-Host ""
    Write-Host "SUCESSO! Todos os secrets foram configurados!" -ForegroundColor Green
    Write-Host ""
    Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
    Write-Host "1. Testar pipeline: git commit --allow-empty -m 'test: CI/CD'" -ForegroundColor White
    Write-Host "2. Verificar Actions: https://github.com/$repository/actions" -ForegroundColor White
    Write-Host "3. Deploy infraestrutura: .\deploy-azure.ps1 -Environment dev" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ALGUNS SECRETS NAO FORAM CONFIGURADOS" -ForegroundColor Yellow
    Write-Host "Configure manualmente em: https://github.com/$repository/settings/secrets/actions" -ForegroundColor White
}

Write-Host ""
Read-Host "Pressione Enter para continuar"