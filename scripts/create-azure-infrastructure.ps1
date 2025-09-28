# Azure Infrastructure Creation Script
# Run this script after logging into Azure Portal and having the Azure CLI configured

param(
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "azuria-prod-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus2",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "azuria-prod"
)

Write-Host "🚀 Creating Azure Infrastructure for Azuria" -ForegroundColor Green
Write-Host "Subscription: $SubscriptionId" -ForegroundColor Yellow
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Yellow
Write-Host "Location: $Location" -ForegroundColor Yellow

# Set subscription
Write-Host "Setting subscription..." -ForegroundColor Blue
az account set --subscription $SubscriptionId

# Create Resource Group
Write-Host "Creating Resource Group..." -ForegroundColor Blue
az group create --name $ResourceGroupName --location $Location

# Create Static Web App
Write-Host "Creating Static Web App..." -ForegroundColor Blue
$swaResult = az staticwebapp create `
    --name "$AppName-swa" `
    --resource-group $ResourceGroupName `
    --location $Location `
    --source "https://github.com/azuria-lab/azuria" `
    --branch "main" `
    --app-location "/" `
    --api-location "api" `
    --output-location ".next" `
    --login-with-github

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Static Web App created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create Static Web App" -ForegroundColor Red
    exit 1
}

# Create Log Analytics Workspace
Write-Host "Creating Log Analytics Workspace..." -ForegroundColor Blue
az monitor log-analytics workspace create `
    --resource-group $ResourceGroupName `
    --workspace-name "$AppName-logs" `
    --location $Location

# Create Application Insights
Write-Host "Creating Application Insights..." -ForegroundColor Blue
az monitor app-insights component create `
    --app "$AppName-insights" `
    --location $Location `
    --resource-group $ResourceGroupName `
    --workspace "$AppName-logs"

# Get deployment token
Write-Host "Getting deployment token..." -ForegroundColor Blue
$deploymentToken = az staticwebapp secrets list --name "$AppName-swa" --resource-group $ResourceGroupName --query "properties.apiKey" -o tsv

# Get Application Insights connection string
Write-Host "Getting Application Insights connection string..." -ForegroundColor Blue
$appInsightsConnectionString = az monitor app-insights component show `
    --app "$AppName-insights" `
    --resource-group $ResourceGroupName `
    --query "connectionString" -o tsv

# Create Service Principal for GitHub Actions
Write-Host "Creating Service Principal for GitHub Actions..." -ForegroundColor Blue
$spResult = az ad sp create-for-rbac `
    --name "$AppName-github-actions" `
    --role contributor `
    --scopes "/subscriptions/$SubscriptionId" `
    --sdk-auth

$spJson = $spResult | ConvertFrom-Json

Write-Host "🎉 Infrastructure created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 GitHub Secrets to configure:" -ForegroundColor Yellow
Write-Host "AZURE_CLIENT_ID=$($spJson.clientId)" -ForegroundColor White
Write-Host "AZURE_TENANT_ID=$($spJson.tenantId)" -ForegroundColor White
Write-Host "AZURE_SUBSCRIPTION_ID=$($spJson.subscriptionId)" -ForegroundColor White
Write-Host "AZURE_STATIC_WEB_APPS_API_TOKEN=$deploymentToken" -ForegroundColor White
Write-Host "APPLICATIONINSIGHTS_CONNECTION_STRING=$appInsightsConnectionString" -ForegroundColor White
Write-Host "AZURE_ENV_NAME=$AppName" -ForegroundColor White
Write-Host "AZURE_LOCATION=$Location" -ForegroundColor White
Write-Host ""
Write-Host "Also add these Supabase secrets:" -ForegroundColor Yellow
Write-Host "NEXT_PUBLIC_SUPABASE_URL=https://crpzkppsriranmeumfqs.supabase.co" -ForegroundColor White
Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM" -ForegroundColor White
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://github.com/azuria-lab/azuria/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Add all the secrets above" -ForegroundColor White
Write-Host "3. Push to main branch to trigger deployment" -ForegroundColor White