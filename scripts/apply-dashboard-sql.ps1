# ============================================
# SCRIPT DE APLICAÇÃO AUTOMÁTICA DO SQL
# Abre o Supabase SQL Editor e copia o SQL
# ============================================

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   APLICACAO AUTOMATICA DO SQL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 1. Ler o arquivo SQL
$sqlPath = "c:\Rômulo\Projetos\azuria\supabase\migrations\dashboard_stats.sql"

if (!(Test-Path $sqlPath)) {
    Write-Host "`n[ERRO] Arquivo SQL nao encontrado!" -ForegroundColor Red
    Write-Host "Caminho: $sqlPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[1] Lendo arquivo SQL..." -ForegroundColor Cyan
$sqlContent = Get-Content $sqlPath -Raw
$lineCount = ($sqlContent -split "`n").Count

Write-Host "    Arquivo: dashboard_stats.sql" -ForegroundColor White
Write-Host "    Linhas: $lineCount" -ForegroundColor White
Write-Host "    Tamanho: $([Math]::Round($sqlContent.Length / 1KB, 2)) KB" -ForegroundColor White

# 2. Copiar para clipboard
Write-Host "`n[2] Copiando SQL para area de transferencia..." -ForegroundColor Cyan
Set-Clipboard -Value $sqlContent
Write-Host "    SQL copiado com sucesso!" -ForegroundColor Green

# 3. Abrir Supabase SQL Editor
$supabaseUrl = "https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql/new"
Write-Host "`n[3] Abrindo Supabase SQL Editor..." -ForegroundColor Cyan
Start-Process $supabaseUrl

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   PROXIMOS PASSOS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host "`n1. O navegador vai abrir o SQL Editor" -ForegroundColor White
Write-Host "2. Faca login no Supabase (se necessario)" -ForegroundColor White
Write-Host "3. No editor, pressione Ctrl+V para colar" -ForegroundColor Cyan
Write-Host "4. Clique em 'Run' ou pressione Ctrl+Enter" -ForegroundColor Cyan
Write-Host "5. Aguarde ~15 segundos" -ForegroundColor White
Write-Host "6. Deve aparecer: 'Success. No rows returned'" -ForegroundColor Green
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   O SQL ja esta na area de transferencia!" -ForegroundColor Yellow
Write-Host "   Basta colar no editor (Ctrl+V)" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Green
