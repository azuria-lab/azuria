# Manual Azure Infrastructure Setup Guide

Como o login automático está encontrando problemas de MFA, vou fornecer instruções para criar a infraestrutura manualmente.

## 🚀 Passo 1: Criar Recursos no Azure Portal

### 1.1 Criar Resource Group
1. Acesse [portal.azure.com](https://portal.azure.com)
2. Procure por "Resource groups" 
3. Clique em **"+ Create"**
4. Configure:
   - **Resource group name**: `azuria-prod-rg`
   - **Region**: `East US 2`
   - Clique **"Review + create"** → **"Create"**

### 1.2 Criar Azure Static Web Apps
1. No portal Azure, procure por "Static Web Apps"
2. Clique em **"+ Create"**
3. Configure:
   - **Resource group**: `azuria-prod-rg`
   - **Name**: `azuria-prod-swa`
   - **Plan type**: `Standard`
   - **Region**: `East US 2`
   - **Source**: `GitHub`
   - **GitHub repository**: `azuria-lab/azuria`
   - **Branch**: `main`
   - **Build presets**: `Next.js`
   - **App location**: `/`
   - **Api location**: `api`
   - **Output location**: `.next`

4. Clique **"Review + create"** → **"Create"**

### 1.3 Criar Application Insights
1. Procure por "Application Insights"
2. Clique em **"+ Create"**
3. Configure:
   - **Resource group**: `azuria-prod-rg`
   - **Name**: `azuria-prod-insights`
   - **Region**: `East US 2`
   - **Resource Mode**: `Workspace-based`
   - Criar novo Log Analytics Workspace: `azuria-prod-logs`

4. Clique **"Review + create"** → **"Create"**

### 1.4 Criar Service Principal para GitHub Actions
1. Procure por "Microsoft Entra ID" (antigo Azure AD)
2. Vá em **"App registrations"** → **"+ New registration"**
3. Configure:
   - **Name**: `azuria-github-actions`
   - **Supported account types**: `Accounts in this organizational directory only`
   - Clique **"Register"**

4. Na página do app criado:
   - Copie o **Application (client) ID** → `AZURE_CLIENT_ID`
   - Copie o **Directory (tenant) ID** → `AZURE_TENANT_ID`

5. Vá em **"Certificates & secrets"** → **"+ New client secret"**
   - Copie o **Value** (não o Secret ID) → `AZURE_CLIENT_SECRET`

6. Vá em **"Subscriptions"** → Sua subscription → **"Access control (IAM)"**
   - Clique **"+ Add"** → **"Add role assignment"**
   - **Role**: `Contributor`
   - **Assign access to**: `User, group, or service principal`
   - **Select**: `azuria-github-actions`
   - Clique **"Save"**

## 🔑 Passo 2: Coletar Secrets

Após criar os recursos, colete os seguintes valores:

### Azure Static Web Apps
1. Vá para o recurso `azuria-prod-swa`
2. Em **"Overview"** → copie a **URL**
3. Em **"Manage deployment token"** → copie o **Deployment token** → `AZURE_STATIC_WEB_APPS_API_TOKEN`

### Application Insights
1. Vá para o recurso `azuria-prod-insights`
2. Em **"Overview"** → copie a **Connection String** → `APPLICATIONINSIGHTS_CONNECTION_STRING`

### Subscription Info
1. Vá em **"Subscriptions"**
2. Copie o **Subscription ID** → `AZURE_SUBSCRIPTION_ID`

## 📝 Passo 3: Configurar GitHub Secrets

No seu repositório GitHub (`azuria-lab/azuria`):

1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique **"New repository secret"** para cada um:

```
AZURE_CLIENT_ID=<valor-do-app-registration>
AZURE_TENANT_ID=<valor-do-tenant>
AZURE_SUBSCRIPTION_ID=<valor-da-subscription>
AZURE_STATIC_WEB_APPS_API_TOKEN=<deployment-token>
NEXT_PUBLIC_SUPABASE_URL=https://crpzkppsriranmeumfqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM
AZURE_ENV_NAME=azuria-prod
AZURE_LOCATION=eastus2
APPLICATIONINSIGHTS_CONNECTION_STRING=<connection-string>
```

## ✅ Passo 4: Validar Deployment

1. Após configurar todos os secrets, faça um commit/push para `main`
2. Vá em **Actions** no GitHub para ver o workflow rodando
3. Se tudo estiver correto, a aplicação será deployada automaticamente

## 🔧 Troubleshooting

Se o deployment falhar:
1. Verifique os logs no GitHub Actions
2. Confirme que todos os secrets estão configurados corretamente
3. Verifique se o Service Principal tem permissões de Contributor na subscription

---

**Próximo passo**: Assim que você criar esses recursos no Azure, me avise que eu posso continuar com a configuração dos GitHub Secrets automaticamente!