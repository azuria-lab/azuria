// Azure Static Web Apps Infrastructure
// Azuria Production Deployment - Static Web Apps + Application Insights

@description('Environment name (dev, staging, prod)')
param environment string = 'prod'

@description('Location for resources')
param location string = 'eastus2'

@description('Application name prefix')
param appName string = 'azuria'

@description('GitHub repository URL')
param repositoryUrl string = 'https://github.com/azuria-lab/azuria'

@description('GitHub branch for deployment')
param branch string = 'main'

@description('Build configuration for the static web app')
param buildConfig object = {
  appLocation: '/'
  apiLocation: 'api'
  outputLocation: '.next'
}

// Variables
var resourceGroupName = '${appName}-${environment}-rg'
var staticWebAppName = '${appName}-${environment}-swa'
var appInsightsName = '${appName}-${environment}-insights'
var logAnalyticsName = '${appName}-${environment}-logs'

// Log Analytics Workspace for Application Insights
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 90
    features: {
      searchVersion: 1
      legacy: 0
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: 5
    }
  }
  tags: {
    environment: environment
    application: appName
    component: 'monitoring'
  }
}

// Application Insights for monitoring
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    SamplingPercentage: 100
  }
  tags: {
    environment: environment
    application: appName
    component: 'monitoring'
  }
}

// Azure Static Web Apps
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    // GitHub integration (will be configured later)
    repositoryUrl: repositoryUrl
    branch: branch
    buildProperties: {
      appLocation: buildConfig.appLocation
      apiLocation: buildConfig.apiLocation
      outputLocation: buildConfig.outputLocation
      appBuildCommand: 'npm run build:next'
      skipGithubActionWorkflowGeneration: true
    }
    // Configuration
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
    enterpriseGradeCdnStatus: 'Enabled'
  }
  tags: {
    environment: environment
    application: appName
    component: 'frontend'
  }
}

// Application Settings for Static Web App
resource staticWebAppConfig 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.properties.ConnectionString
    NEXT_PUBLIC_SUPABASE_URL: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=supabase-url)'
    NEXT_PUBLIC_SUPABASE_ANON_KEY: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=supabase-anon-key)'
  }
}

// Key Vault for secrets management
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${appName}-${environment}-kv'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
  }
  tags: {
    environment: environment
    application: appName
    component: 'security'
  }
}

// Custom domain configuration (optional)
resource customDomain 'Microsoft.Web/staticSites/customDomains@2023-01-01' = if (environment == 'prod') {
  parent: staticWebApp
  name: 'azuria.com'
  properties: {
    validationMethod: 'dns-txt-token'
  }
}

// Outputs for GitHub Actions and other integrations
output staticWebAppName string = staticWebApp.name
output staticWebAppId string = staticWebApp.id
output staticWebAppUrl string = staticWebApp.properties.defaultHostname
output staticWebAppApiToken string = staticWebApp.listSecrets().properties.apiKey
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output keyVaultName string = keyVault.name
output resourceGroupName string = resourceGroup().name

// Diagnostic settings for monitoring
resource staticWebAppDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${staticWebAppName}-diagnostics'
  scope: staticWebApp
  properties: {
    workspaceId: logAnalytics.id
    logs: [
      {
        category: 'SiteAppLogs'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: 30
        }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: 30
        }
      }
    ]
  }
}