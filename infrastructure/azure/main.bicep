// Azure Infrastructure as Code - Main Bicep Template
// Azuria Production Infrastructure - Multi-region deployment

@description('Environment name (dev, staging, prod)')
param environment string = 'prod'

@description('Location for primary resources')
param primaryLocation string = 'eastus'

@description('Location for secondary resources (DR)')
param secondaryLocation string = 'westus2'

@description('Application name prefix')
param appName string = 'azuria'

@description('Container Registry SKU')
@allowed(['Basic', 'Standard', 'Premium'])
param acrSku string = 'Standard'

@description('AKS cluster node count')
@minValue(1)
@maxValue(10)
param aksNodeCount int = 3

@description('AKS VM size')
param aksVmSize string = 'Standard_D2s_v3'

// Variables
var resourceGroupName = '${appName}-${environment}-rg'
var acrName = '${appName}${environment}acr${uniqueString(resourceGroup().id)}'
var aksName = '${appName}-${environment}-aks'
var logAnalyticsName = '${appName}-${environment}-logs'
var appInsightsName = '${appName}-${environment}-insights'
var keyVaultName = '${appName}-${environment}-kv-${uniqueString(resourceGroup().id)}'
var cosmosDbName = '${appName}-${environment}-cosmos'
var storageAccountName = '${appName}${environment}st${uniqueString(resourceGroup().id)}'
var cdnProfileName = '${appName}-${environment}-cdn'
var frontDoorName = '${appName}-${environment}-afd'

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: primaryLocation
  sku: {
    name: acrSku
  }
  properties: {
    adminUserEnabled: true
    policies: {
      quarantinePolicy: {
        status: 'enabled'
      }
      retentionPolicy: {
        status: 'enabled'
        days: 30
      }
      trustPolicy: {
        status: 'enabled'
        type: 'Notary'
      }
    }
    encryption: {
      status: 'enabled'
    }
    dataEndpointEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

// Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: primaryLocation
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
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: primaryLocation
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// AKS Cluster
resource aksCluster 'Microsoft.ContainerService/managedClusters@2023-10-01' = {
  name: aksName
  location: primaryLocation
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    dnsPrefix: '${appName}-${environment}'
    agentPoolProfiles: [
      {
        name: 'agentpool'
        count: aksNodeCount
        vmSize: aksVmSize
        osType: 'Linux'
        mode: 'System'
        enableAutoScaling: true
        minCount: 1
        maxCount: 10
        availabilityZones: [
          '1'
          '2'
          '3'
        ]
      }
    ]
    servicePrincipalProfile: {
      clientId: 'msi'
    }
    addonProfiles: {
      omsAgent: {
        enabled: true
        config: {
          logAnalyticsWorkspaceResourceID: logAnalytics.id
        }
      }
      azurePolicy: {
        enabled: true
      }
      ingressApplicationGateway: {
        enabled: true
        config: {
          applicationGatewayName: '${appName}-${environment}-agw'
          subnetCIDR: '10.2.0.0/16'
        }
      }
    }
    networkProfile: {
      networkPlugin: 'azure'
      loadBalancerSku: 'standard'
      outboundType: 'loadBalancer'
      serviceCidr: '10.0.0.0/16'
      dnsServiceIP: '10.0.0.10'
      dockerBridgeCidr: '172.17.0.1/16'
    }
    autoScalerProfile: {
      scaleDownDelayAfterAdd: '10m'
      scaleDownDelayAfterDelete: '10s'
      scaleDownDelayAfterFailure: '3m'
      scaleDownUnneededTime: '10m'
      scaleDownUtilizationThreshold: '0.5'
      maxGracefulTerminationSec: '600'
    }
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: primaryLocation
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: aksCluster.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
    enabledForDeployment: false
    enabledForTemplateDeployment: false
    enabledForDiskEncryption: false
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// Cosmos DB
resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts@2023-11-15' = {
  name: cosmosDbName
  location: primaryLocation
  kind: 'GlobalDocumentDB'
  properties: {
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: primaryLocation
        failoverPriority: 0
      }
      {
        locationName: secondaryLocation
        failoverPriority: 1
      }
    ]
    databaseAccountOfferType: 'Standard'
    enableAutomaticFailover: true
    enableMultipleWriteLocations: false
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
    backupPolicy: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: 240
        backupRetentionIntervalInHours: 720
        backupStorageRedundancy: 'Geo'
      }
    }
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: primaryLocation
  sku: {
    name: 'Standard_GRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
    encryption: {
      services: {
        blob: {
          enabled: true
        }
        file: {
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
  }
}

// CDN Profile
resource cdnProfile 'Microsoft.Cdn/profiles@2023-05-01' = {
  name: cdnProfileName
  location: 'Global'
  sku: {
    name: 'Standard_Microsoft'
  }
  properties: {}
}

// Front Door
resource frontDoor 'Microsoft.Cdn/profiles@2023-05-01' = {
  name: frontDoorName
  location: 'Global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  properties: {
    originResponseTimeoutSeconds: 60
  }
}

// Role Assignment for AKS to pull from ACR
resource acrPullAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: containerRegistry
  name: guid(containerRegistry.id, aksCluster.id, 'AcrPull')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
    principalId: aksCluster.properties.identityProfile.kubeletidentity.objectId
    principalType: 'ServicePrincipal'
  }
}

// Outputs
output acrLoginServer string = containerRegistry.properties.loginServer
output aksClusterName string = aksCluster.name
output keyVaultName string = keyVault.name
output cosmosDbEndpoint string = cosmosDb.properties.documentEndpoint
output storageAccountName string = storageAccount.name
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output logAnalyticsWorkspaceId string = logAnalytics.properties.customerId