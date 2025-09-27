@description('Name of the Static Web App')
param staticWebAppName string

@description('The location for the Static Web App')
param location string = resourceGroup().location

@description('The environment name')
param environmentName string

@description('The managed identity resource ID')
param managedIdentityId string

// Static Web App resource
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  tags: {
    'azd-service-name': 'web'
    'azd-env-name': environmentName
  }
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    buildProperties: {
      appLocation: '/'
      apiLocation: 'api'
      outputLocation: '.next'
      appBuildCommand: 'npm run build:next'
      skipGithubActionWorkflowGeneration: true
    }
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    enterpriseGradeCdnStatus: 'Enabled'
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
}

// App Settings for Static Web App
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    NODE_ENV: 'production'
  }
}

@description('The Static Web App resource name')
output staticWebAppName string = staticWebApp.name

@description('The Static Web App default hostname')
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'

@description('The Static Web App resource ID')
output staticWebAppId string = staticWebApp.id