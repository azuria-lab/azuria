# GitHub Secrets Configuration Guide

## Required Secrets for Azure Deployment

Configure these secrets in your GitHub repository at: `Settings > Secrets and variables > Actions`

### 🔐 Azure Authentication Secrets
- **AZURE_CLIENT_ID**: Your Azure Service Principal Client ID
- **AZURE_TENANT_ID**: Your Azure Tenant ID  
- **AZURE_SUBSCRIPTION_ID**: Your Azure Subscription ID

### 🌐 Azure Static Web Apps
- **AZURE_STATIC_WEB_APPS_API_TOKEN**: API token from your Azure Static Web Apps resource

### 🗄️ Supabase Database
- **NEXT_PUBLIC_SUPABASE_URL**: https://crpzkppsriranmeumfqs.supabase.co
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM

### ⚙️ Azure Environment Configuration
- **AZURE_ENV_NAME**: Production environment name (e.g., "azuria-prod")
- **AZURE_LOCATION**: Azure region (e.g., "East US 2")

## 🚀 How to Configure Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret with its corresponding value
5. Save each secret

## 🔍 Where to Find These Values

### Azure Service Principal (for authentication):
```bash
# Create service principal
az ad sp create-for-rbac --name "azuria-github-actions" --role contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

### Azure Static Web Apps API Token:
1. Go to Azure Portal
2. Navigate to your Static Web Apps resource
3. Go to **"Settings" → "Configuration"**
4. Copy the **Deployment token**

### Azure Subscription Info:
```bash
# Get subscription info
az account show
```

## ✅ Verification Checklist

- [ ] AZURE_CLIENT_ID
- [ ] AZURE_TENANT_ID  
- [ ] AZURE_SUBSCRIPTION_ID
- [ ] AZURE_STATIC_WEB_APPS_API_TOKEN
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] AZURE_ENV_NAME
- [ ] AZURE_LOCATION

Once all secrets are configured, GitHub Actions will be able to automatically deploy your application to Azure Static Web Apps.