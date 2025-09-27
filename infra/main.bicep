targetScope = 'resourceGroup'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string = resourceGroup().location

// Generate unique resource token as per IaC rules
var resourceToken = uniqueString(subscription().id, resourceGroup().id, location, environmentName)

// User-Assigned Managed Identity (required by AZD rules)
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'mi-${environmentName}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Static Web App module
module staticWebApp 'modules/staticwebapp.bicep' = {
  name: 'staticwebapp-deployment'
  params: {
    staticWebAppName: 'swa-${resourceToken}'
    location: location
    environmentName: environmentName
    managedIdentityId: managedIdentity.id
  }
}

// Application Insights and Log Analytics module
module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring-deployment'
  params: {
    appInsightsName: 'ai-${resourceToken}'
    logAnalyticsName: 'log-${resourceToken}'
    location: location
    environmentName: environmentName
  }
}

// Key Vault module
module keyVault 'modules/keyvault.bicep' = {
  name: 'keyvault-deployment'
  params: {
    name: 'kv${resourceToken}'
    location: location
    environmentName: environmentName
    managedIdentityPrincipalId: managedIdentity.properties.principalId
  }
}

// Outputs (required by AZD rules)
@description('The resource group ID')
output RESOURCE_GROUP_ID string = resourceGroup().id

@description('The Static Web App default hostname')
output STATIC_WEB_APP_URL string = staticWebApp.outputs.staticWebAppUrl

@description('The Static Web App name')
output STATIC_WEB_APP_NAME string = staticWebApp.outputs.staticWebAppName

@description('The Application Insights connection string')
output APPLICATION_INSIGHTS_CONNECTION_STRING string = monitoring.outputs.applicationInsightsConnectionString

@description('The Key Vault URI')
output KEY_VAULT_URI string = keyVault.outputs.keyVaultUri