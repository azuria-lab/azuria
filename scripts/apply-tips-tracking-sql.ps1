# Script para aplicar SQL de dicas personalizadas no Supabase
Write-Host "`n[APLICANDO SQL DE DICAS PERSONALIZADAS]" -ForegroundColor Cyan

$sqlPath = "c:\Rômulo\Projetos\azuria\supabase\migrations\dashboard_tips_tracking.sql"

if (Test-Path $sqlPath) {
    Write-Host "Arquivo encontrado!" -ForegroundColor Green
    
    # Ler o SQL
    $sql = Get-Content $sqlPath -Raw -Encoding UTF8
    
    # Copiar para clipboard
    Set-Clipboard $sql
    Write-Host "SQL copiado para clipboard! Use Ctrl+V para colar." -ForegroundColor Green
    
    # Abrir navegador
    Start-Process "https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql/new"
    Write-Host "Navegador aberto no SQL Editor do Supabase." -ForegroundColor Green
    Write-Host "`nPróximos passos:" -ForegroundColor Yellow
    Write-Host "  1. Cole o SQL (Ctrl+V)" -ForegroundColor White
    Write-Host "  2. Clique em RUN" -ForegroundColor White
    Write-Host "  3. Aguarde ~20 segundos" -ForegroundColor White
    Write-Host "  4. Veja 'Success. No rows returned'`n" -ForegroundColor White
} else {
    Write-Host "Erro: Arquivo nao encontrado em $sqlPath" -ForegroundColor Red
}
