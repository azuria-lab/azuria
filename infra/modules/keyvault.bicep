@description('The name of the Key Vault')
param name string

@description('The location for the Key Vault')
param location string = resourceGroup().location

@description('The environment name')
param environmentName string

@description('The principal ID of the managed identity')
param managedIdentityPrincipalId string

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: name
  location: location
  tags: {
    'azd-env-name': environmentName
  }
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenant().tenantId
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    enableRbacAuthorization: false
    accessPolicies: [
      {
        tenantId: tenant().tenantId
        objectId: managedIdentityPrincipalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// Placeholder secrets (will be populated during deployment)
resource supabaseServiceRoleKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'supabase-service-role-key'
  properties: {
    value: 'placeholder-value-to-be-updated'
    contentType: 'text/plain'
  }
}

@description('The Key Vault URI')
output keyVaultUri string = keyVault.properties.vaultUri

@description('The Key Vault resource ID')
output keyVaultId string = keyVault.id

@description('The Key Vault name')
output keyVaultName string = keyVault.name