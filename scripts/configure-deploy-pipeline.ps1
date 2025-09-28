# 🚀 Script de Configuração do Deploy Pipeline
# Configura automaticamente GitHub Secrets para Azure Static Web Apps

param(
    [string]$GitHubRepo = "azuria-lab/azuria",
    [string]$GitHubToken = $env:GITHUB_TOKEN
)

Write-Host "🚀 Configurando Deploy Pipeline para Azure Static Web Apps" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Cyan

# Verificar se o GitHub CLI está instalado
try {
    gh --version | Out-Null
    Write-Host "✅ GitHub CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub CLI não encontrado" -ForegroundColor Red
    Write-Host "   Instale o GitHub CLI: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Secrets necessários para o pipeline
$secrets = @{
    "AZURE_STATIC_WEB_APPS_API_TOKEN" = "3a1b69b72a2cc933611ae2c69b0b60b6bc8661b5e4028127e5195ba1cc71dc5a02-2dff2d16-2784-4099-a87a-1cd99da063f000f02260b17b720f"
    "AZURE_SUBSCRIPTION_ID" = "cdb292f9-b4c2-4513-ae78-de6238161d25"
    "AZURE_TENANT_ID" = "3e882f31-08a2-450e-a764-e4959eab15fe"
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = "InstrumentationKey=338068d6-88f7-4590-9767-d5ab79a7af95;IngestionEndpoint=https://eastus2-3.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus2.livediagnostics.monitor.azure.com/;ApplicationId=4a006ec4-9eb1-4534-b378-1c6a52faf39c"
    "NEXT_PUBLIC_SUPABASE_URL" = "https://crpzkppsriranmeumfqs.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
    "AZURE_ENV_NAME" = "Azuria"
    "AZURE_LOCATION" = "eastus2"
}

Write-Host "📝 Configurando GitHub Secrets..." -ForegroundColor Blue

foreach ($secret in $secrets.GetEnumerator()) {
    $secretName = $secret.Key
    $secretValue = $secret.Value
    
    if ([string]::IsNullOrEmpty($secretValue)) {
        Write-Host "⚠️  Secret $secretName está vazio - pulando" -ForegroundColor Yellow
        continue
    }
    
    try {
        # Configurar secret usando GitHub CLI
        echo $secretValue | gh secret set $secretName --repo $GitHubRepo
        Write-Host "✅ Secret configurado: $secretName" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao configurar secret: $secretName" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n🔄 Verificando configuração do workflow..." -ForegroundColor Blue

# Verificar se o workflow existe
$workflowPath = ".github/workflows/azure-static-web-apps.yml"
if (Test-Path $workflowPath) {
    Write-Host "✅ Workflow encontrado: $workflowPath" -ForegroundColor Green
    
    # Verificar elementos essenciais do workflow
    $workflowContent = Get-Content $workflowPath -Raw
    
    $checks = @{
        "azure_static_web_apps_api_token" = $workflowContent -match "azure_static_web_apps_api_token"
        "build:next command" = $workflowContent -match "build:next"
        "Application Insights" = $workflowContent -match "APPLICATIONINSIGHTS_CONNECTION_STRING"
        "Supabase config" = $workflowContent -match "NEXT_PUBLIC_SUPABASE"
    }
    
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "✅ $($check.Key) configurado" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($check.Key) não encontrado no workflow" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ Workflow não encontrado: $workflowPath" -ForegroundColor Red
}

Write-Host "`n🎯 Testando pipeline..." -ForegroundColor Blue

try {
    # Verificar último workflow run
    $lastRun = gh run list --repo $GitHubRepo --limit 1 --json status,conclusion,createdAt,headBranch | ConvertFrom-Json
    
    if ($lastRun.Count -gt 0) {
        $run = $lastRun[0]
        Write-Host "📊 Último workflow run:" -ForegroundColor Cyan
        Write-Host "   Status: $($run.status)" -ForegroundColor White
        Write-Host "   Conclusão: $($run.conclusion)" -ForegroundColor White
        Write-Host "   Branch: $($run.headBranch)" -ForegroundColor White
        Write-Host "   Data: $($run.createdAt)" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️  Não foi possível verificar workflow runs" -ForegroundColor Yellow
}

Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. 🔄 Faça um push para a branch main para testar o pipeline" -ForegroundColor White
Write-Host "2. 🌐 Acesse: https://github.com/$GitHubRepo/actions" -ForegroundColor White
Write-Host "3. 📊 Monitore o deploy no Azure Portal" -ForegroundColor White
Write-Host "4. 🎯 Valide o site em: https://swa-jxbkuxsj7yfpo.azurestaticapps.net" -ForegroundColor White

Write-Host "`n✅ Configuração do Deploy Pipeline concluída!" -ForegroundColor Green
Write-Host "🚀 Pipeline pronto para deploy automático!" -ForegroundColor Yellow

# URLs importantes
Write-Host "`n🔗 Links importantes:" -ForegroundColor Cyan
Write-Host "   GitHub Actions: https://github.com/$GitHubRepo/actions" -ForegroundColor Blue
Write-Host "   Azure Static Web App: https://portal.azure.com/#@/resource/subscriptions/cdb292f9-b4c2-4513-ae78-de6238161d25/resourceGroups/Azuria-Resources/providers/Microsoft.Web/staticSites/swa-jxbkuxsj7yfpo" -ForegroundColor Blue
Write-Host "   Application Insights: https://portal.azure.com/#@/resource/subscriptions/cdb292f9-b4c2-4513-ae78-de6238161d25/resourceGroups/Azuria-Resources/providers/microsoft.insights/components/ai-jxbkuxsj7yfpo" -ForegroundColor Blue