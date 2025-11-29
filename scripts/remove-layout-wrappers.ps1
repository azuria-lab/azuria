# Script para remover wrappers <Layout> duplicados de páginas do dashboard
# Este script processa múltiplos arquivos e remove imports e tags <Layout> redundantes

$pages = @(
    "SimpleCalculatorPage.tsx",
    "AdvancedProCalculatorPage.tsx",
    "TaxCalculatorPage.tsx",
    "BatchCalculatorPage.tsx",
    "SensitivityAnalysisPage.tsx",
    "MarketplacePage.tsx",
    "AdvancedAnalyticsDashboard.tsx",
    "AnalyticsDashboardPage.tsx",
    "HistoryPage.tsx",
    "Templates.tsx",
    "IntegrationsPage.tsx",
    "MarketplaceComparatorPage.tsx",
    "ApiPage.tsx",
    "AutomationPage.tsx",
    "ImportPage.tsx",
    "ScenariosPage.tsx",
    "PricingMetricsDashboard.tsx",
    "IntelligenceDataPage.tsx",
    "CollaborationPage.tsx"
)

$pagesPath = "c:\Rômulo\Projetos\azuria\src\pages"

Write-Host "Removing duplicate Layout wrappers from dashboard pages..." -ForegroundColor Cyan

foreach ($page in $pages) {
    $filePath = Join-Path $pagesPath $page
    
    if (Test-Path $filePath) {
        Write-Host "Processing: $page" -ForegroundColor Yellow
        
        # Ler conteúdo do arquivo
        $content = Get-Content $filePath -Raw
        
        # Remover linha de import do Layout
        $content = $content -replace "import\s+(?:MainLayout|Layout)\s+from\s+['\`"]@/components/layout/Layout['\`"];?\r?\n", ""
        
        # Remover tags <Layout> e <MainLayout> (preservando conteúdo interno)
        # Remover abertura
        $content = $content -replace "<(?:Main)?Layout>\s*\r?\n\s*", ""
        # Remover fechamento  
        $content = $content -replace "\s*</(?:Main)?Layout>\s*\r?\n", "`r`n"
        
        # Salvar arquivo modificado
        Set-Content $filePath -Value $content -NoNewline
        
        Write-Host "  ✓ Updated $page" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $page" -ForegroundColor Red
    }
}

Write-Host "`nDone! All pages updated." -ForegroundColor Cyan
Write-Host "Please verify the changes and test the application." -ForegroundColor Yellow
