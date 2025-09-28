# Script de verificacao de saude da aplicacao Azuria
# Este script verifica o status da aplicacao e coleta metricas essenciais

param(
    [string]$AppUrl = "https://blue-tree-0b17b720f.2.azurestaticapps.net",
    [int]$TimeoutSeconds = 30
)

Write-Host "Iniciando verificacao de saude da aplicacao Azuria..." -ForegroundColor Green

# Funcao para verificar conectividade
function Test-ApplicationHealth {
    param([string]$Url)
    
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec $TimeoutSeconds
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            ResponseTime = $responseTime
            ContentSize = $response.Content.Length
            Headers = $response.Headers
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            ResponseTime = $null
        }
    }
}

# Executar verificacao principal
$healthCheck = Test-ApplicationHealth -Url $AppUrl

if ($healthCheck.Success) {
    Write-Host "[OK] Aplicacao esta funcionando!" -ForegroundColor Green
    Write-Host "   Status: $($healthCheck.StatusCode)" -ForegroundColor White
    Write-Host "   Tempo de resposta: $([math]::Round($healthCheck.ResponseTime, 2))ms" -ForegroundColor White
    Write-Host "   Tamanho do conteudo: $($healthCheck.ContentSize) bytes" -ForegroundColor White
    
    # Verificar se o tempo de resposta esta dentro do aceitavel
    if ($healthCheck.ResponseTime -lt 2000) {
        Write-Host "[OK] Performance: EXCELENTE (menor que 2s)" -ForegroundColor Green
    } elseif ($healthCheck.ResponseTime -lt 5000) {
        Write-Host "[WARN] Performance: ACEITAVEL (2-5s)" -ForegroundColor Yellow
    } else {
        Write-Host "[ERROR] Performance: LENTA (maior que 5s)" -ForegroundColor Red
    }
    
    # Verificar certificado SSL
    try {
        $uri = [System.Uri]$AppUrl
        if ($uri.Scheme -eq "https") {
            Write-Host "[OK] SSL/TLS: Habilitado" -ForegroundColor Green
        }
    } catch {
        Write-Host "[WARN] SSL/TLS: Nao foi possivel verificar" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=== RESUMO DA VERIFICACAO ===" -ForegroundColor Cyan
    Write-Host "Status Geral: SAUDAVEL" -ForegroundColor Green
    Write-Host "URL: $AppUrl" -ForegroundColor White
    Write-Host "Verificado em: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor White
    
    exit 0
} else {
    Write-Host "[ERROR] Aplicacao nao esta respondendo!" -ForegroundColor Red
    Write-Host "   Erro: $($healthCheck.Error)" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "=== RESUMO DA VERIFICACAO ===" -ForegroundColor Cyan
    Write-Host "Status Geral: PROBLEMA" -ForegroundColor Red
    Write-Host "URL: $AppUrl" -ForegroundColor White
    Write-Host "Verificado em: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor White
    
    exit 1
}