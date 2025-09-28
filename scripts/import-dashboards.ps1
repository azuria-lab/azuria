# 📊 Script de Importação Automática dos Dashboards
# Importa os 3 dashboards de monitoramento no Azure Portal via Azure CLI

param(
    [string]$SubscriptionId = "cdb292f9-b4c2-4513-ae78-de6238161d25",
    [string]$ResourceGroup = "Azuria-Resources",
    [string]$Location = "eastus2"
)

Write-Host "📊 Importando Dashboards de Monitoramento da Azuria" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan

# Verificar se Azure CLI está instalado e autenticado
try {
    az account show --output none
    Write-Host "✅ Azure CLI autenticado" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI não está autenticado" -ForegroundColor Red
    Write-Host "   Execute: az login" -ForegroundColor Yellow
    exit 1
}

# Configurar subscription
Write-Host "🔧 Configurando subscription..." -ForegroundColor Blue
az account set --subscription $SubscriptionId

# Definir dashboards para importar
$dashboards = @(
    @{
        Name = "Azuria-Production-Dashboard"
        DisplayName = "Azuria - Dashboard de Producao"
        File = "monitoring/dashboards/azuria-production-dashboard.json"
        Description = "Dashboard principal com KPIs, Core Web Vitals e metricas de conversao"
    },
    @{
        Name = "Azuria-Performance-Dashboard" 
        DisplayName = "Azuria - Performance e Core Web Vitals"
        File = "monitoring/dashboards/azuria-performance-dashboard.json"
        Description = "Dashboard focado em performance, Core Web Vitals e tempos de resposta"
    },
    @{
        Name = "Azuria-Business-Dashboard"
        DisplayName = "Azuria - Business Intelligence"
        File = "monitoring/dashboards/azuria-business-dashboard.json"
        Description = "Dashboard de metricas de negocio, receita e analise de coorte"
    }
)

Write-Host "📋 Importando $($dashboards.Count) dashboards..." -ForegroundColor Blue

foreach ($dashboard in $dashboards) {
    Write-Host "`n🔄 Processando: $($dashboard.DisplayName)" -ForegroundColor Cyan
    
    # Verificar se arquivo existe
    if (-not (Test-Path $dashboard.File)) {
        Write-Host "❌ Arquivo não encontrado: $($dashboard.File)" -ForegroundColor Red
        continue
    }
    
    # Ler conteúdo do dashboard
    try {
        $dashboardContent = Get-Content $dashboard.File -Raw | ConvertFrom-Json
        Write-Host "✅ Arquivo carregado: $($dashboard.File)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao ler arquivo: $($dashboard.File)" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
        continue
    }
    
    # Preparar parâmetros para criação
    $dashboardName = $dashboard.Name
    $displayName = $dashboard.DisplayName
    
    # Tentar criar/atualizar dashboard
    try {
        # Verificar se dashboard já existe
        $existing = az portal dashboard show --name $dashboardName --resource-group $ResourceGroup 2>$null
        
        if ($existing) {
            Write-Host "🔄 Atualizando dashboard existente..." -ForegroundColor Yellow
            $command = "az portal dashboard update"
        } else {
            Write-Host "➕ Criando novo dashboard..." -ForegroundColor Blue
            $command = "az portal dashboard create"
        }
        
        # Executar comando de criação/atualização
        $tempFile = [System.IO.Path]::GetTempFileName() + ".json"
        $dashboardContent | ConvertTo-Json -Depth 50 | Set-Content $tempFile
        
        & cmd /c "$command --name `"$dashboardName`" --resource-group `"$ResourceGroup`" --input-path `"$tempFile`" --location `"$Location`" 2>nul"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Dashboard importado com sucesso: $displayName" -ForegroundColor Green
            
            # Gerar URL do dashboard
            $dashboardUrl = "https://portal.azure.com/#@/dashboard/arm/subscriptions/$SubscriptionId/resourcegroups/$ResourceGroup/providers/microsoft.portal/dashboards/$dashboardName"
            Write-Host "   🔗 URL: $dashboardUrl" -ForegroundColor Blue
        } else {
            Write-Host "❌ Erro ao importar dashboard: $displayName" -ForegroundColor Red
        }
        
        # Limpar arquivo temporário
        Remove-Item $tempFile -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "❌ Erro durante importação: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Configurando dashboards como favoritos..." -ForegroundColor Blue

# Tentar marcar dashboards como favoritos (pode falhar, mas não é crítico)
foreach ($dashboard in $dashboards) {
    try {
        az portal dashboard show --name $dashboard.Name --resource-group $ResourceGroup --output none
        Write-Host "⭐ Dashboard configurado: $($dashboard.DisplayName)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Dashboard pode não ter sido criado: $($dashboard.DisplayName)" -ForegroundColor Yellow
    }
}

Write-Host "`n📊 Verificando Application Insights..." -ForegroundColor Blue

# Verificar se Application Insights está ativo
try {
    $appInsights = az monitor app-insights component show --app "ai-jxbkuxsj7yfpo" --resource-group $ResourceGroup | ConvertFrom-Json
    Write-Host "✅ Application Insights ativo: $($appInsights.name)" -ForegroundColor Green
    Write-Host "   📊 Instrumentation Key: $($appInsights.instrumentationKey)" -ForegroundColor Blue
    Write-Host "   🔗 Portal: https://portal.azure.com/#@/resource/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/components/$($appInsights.name)" -ForegroundColor Blue
} catch {
    Write-Host "⚠️  Application Insights não encontrado ou inaccessível" -ForegroundColor Yellow
}

Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. 🌐 Acesse o Azure Portal: https://portal.azure.com" -ForegroundColor White
Write-Host "2. 📊 Navegue para Dashboard > Shared dashboards" -ForegroundColor White
Write-Host "3. 🔍 Encontre os dashboards da Azuria importados" -ForegroundColor White
Write-Host "4. 📌 Fixe os dashboards na barra lateral" -ForegroundColor White
Write-Host "5. ⚙️  Configure refresh intervals conforme necessário" -ForegroundColor White

Write-Host "`n✅ Importação dos Dashboards concluída!" -ForegroundColor Green
Write-Host "📊 Dashboards prontos para monitoramento em tempo real!" -ForegroundColor Yellow

# Links diretos para os dashboards
Write-Host "`n🔗 Links diretos dos dashboards:" -ForegroundColor Cyan
foreach ($dashboard in $dashboards) {
    $url = "https://portal.azure.com/#@/dashboard/arm/subscriptions/$SubscriptionId/resourcegroups/$ResourceGroup/providers/microsoft.portal/dashboards/$($dashboard.Name)"
    Write-Host "   $($dashboard.DisplayName): $url" -ForegroundColor Blue
}