#!/usr/bin/env powershell

<#
.SYNOPSIS
    Deploy Azure Application Insights Workbooks for Azuria monitoring
.DESCRIPTION
    This script deploys custom monitoring dashboards to Azure Application Insights
    Created workbooks: Main Dashboard, Alerts Dashboard, Infrastructure Dashboard
.PARAMETER ResourceGroup
    Azure Resource Group name
.PARAMETER SubscriptionId
    Azure Subscription ID
.PARAMETER AppInsightsName
    Application Insights component name
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup,
    
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$true)]
    [string]$AppInsightsName
)

# Configuration
$ScriptPath = $PSScriptRoot
$DashboardsPath = Join-Path $ScriptPath "dashboards"
$AppInsightsResourceId = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/microsoft.insights/components/$AppInsightsName"

# Dashboard configurations
$Dashboards = @(
    @{
        Name = "azuria-main-dashboard"
        DisplayName = "Azuria - Main Dashboard"
        Description = "Comprehensive performance monitoring for Azuria application"
        File = "azuria-main-dashboard.json"
    },
    @{
        Name = "azuria-alerts-dashboard" 
        DisplayName = "Azuria - Alerts & SLA Dashboard"
        Description = "Real-time alerts, SLA monitoring and incident tracking"
        File = "azuria-alerts-dashboard.json"
    },
    @{
        Name = "azuria-infrastructure-dashboard"
        DisplayName = "Azuria - Infrastructure Dashboard"
        Description = "Azure resources monitoring, costs and infrastructure health"
        File = "azuria-infrastructure-dashboard.json"
    }
)

Write-Host "🚀 Starting Azuria Monitoring Dashboards Deployment" -ForegroundColor Green
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Cyan
Write-Host "Subscription: $SubscriptionId" -ForegroundColor Cyan
Write-Host "App Insights: $AppInsightsName" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed and logged in
try {
    $azAccount = az account show --query "id" -o tsv 2>$null
    if (-not $azAccount) {
        throw "Not logged in"
    }
    Write-Host "✅ Azure CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not authenticated. Please run 'az login'" -ForegroundColor Red
    exit 1
}

# Set correct subscription
Write-Host "🔄 Setting subscription context..." -ForegroundColor Yellow
az account set --subscription $SubscriptionId

# Verify resource group exists
Write-Host "🔍 Verifying resource group..." -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroup
if ($rgExists -eq "false") {
    Write-Host "❌ Resource group '$ResourceGroup' not found" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Resource group verified" -ForegroundColor Green

# Verify Application Insights exists
Write-Host "🔍 Verifying Application Insights component..." -ForegroundColor Yellow
try {
    $appInsights = az monitor app-insights component show --app $AppInsightsName --resource-group $ResourceGroup --query "id" -o tsv 2>$null
    if (-not $appInsights) {
        throw "App Insights not found"
    }
    Write-Host "✅ Application Insights component verified" -ForegroundColor Green
} catch {
    Write-Host "❌ Application Insights '$AppInsightsName' not found in resource group '$ResourceGroup'" -ForegroundColor Red
    exit 1
}

# Deploy each dashboard
foreach ($dashboard in $Dashboards) {
    Write-Host ""
    Write-Host "📊 Deploying: $($dashboard.DisplayName)" -ForegroundColor Cyan
    
    $dashboardFile = Join-Path $DashboardsPath $dashboard.File
    
    if (-not (Test-Path $dashboardFile)) {
        Write-Host "❌ Dashboard file not found: $dashboardFile" -ForegroundColor Red
        continue
    }
    
    # Read and process dashboard content
    try {
        $dashboardContent = Get-Content $dashboardFile -Raw | ConvertFrom-Json
        
        # Update fallback resource IDs with actual App Insights resource ID
        $dashboardContent.fallbackResourceIds = @($AppInsightsResourceId)
        
        # Convert back to JSON
        $updatedContent = $dashboardContent | ConvertTo-Json -Depth 50 -Compress
        
        # Create temporary file with updated content
        $tempFile = [System.IO.Path]::GetTempFileName() + ".json"
        $updatedContent | Out-File -FilePath $tempFile -Encoding UTF8
        
        # Deploy workbook using Azure CLI
        Write-Host "⚡ Creating workbook..." -ForegroundColor Yellow
        
        $result = az monitor app-insights workbook create `
            --resource-group $ResourceGroup `
            --name $dashboard.Name `
            --display-name $dashboard.DisplayName `
            --serialized-data $updatedContent `
            --source-id $AppInsightsResourceId `
            --query "id" -o tsv 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully deployed: $($dashboard.DisplayName)" -ForegroundColor Green
            Write-Host "   Workbook ID: $result" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  Workbook may already exist, attempting update..." -ForegroundColor Yellow
            
            # Try to update existing workbook
            $updateResult = az monitor app-insights workbook update `
                --resource-group $ResourceGroup `
                --name $dashboard.Name `
                --serialized-data $updatedContent `
                --query "id" -o tsv 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Successfully updated: $($dashboard.DisplayName)" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to create/update: $($dashboard.DisplayName)" -ForegroundColor Red
                Write-Host "   Error: $updateResult" -ForegroundColor Red
            }
        }
        
        # Clean up temp file
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "❌ Error processing dashboard file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Dashboard deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Open Azure Portal" -ForegroundColor White
Write-Host "2. Navigate to your Application Insights resource" -ForegroundColor White
Write-Host "3. Go to 'Workbooks' section" -ForegroundColor White
Write-Host "4. Find your new dashboards in 'My Workbooks'" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Direct links:" -ForegroundColor Yellow
Write-Host "- Main Dashboard: https://portal.azure.com/#@/resource$AppInsightsResourceId/workbooks" -ForegroundColor Cyan
Write-Host "- Resource Group: https://portal.azure.com/#@/resource/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup" -ForegroundColor Cyan

# Generate summary report
$summaryFile = Join-Path $ScriptPath "deployment-summary.json"
$summary = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    subscription = $SubscriptionId
    resourceGroup = $ResourceGroup
    appInsightsName = $AppInsightsName
    appInsightsResourceId = $AppInsightsResourceId
    dashboards = $Dashboards | ForEach-Object { 
        @{
            name = $_.Name
            displayName = $_.DisplayName
            status = "deployed"
        }
    }
} | ConvertTo-Json -Depth 10

$summary | Out-File -FilePath $summaryFile -Encoding UTF8
Write-Host "📄 Deployment summary saved: $summaryFile" -ForegroundColor Gray