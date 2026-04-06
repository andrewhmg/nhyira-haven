# Azure + Supabase Deployment Guide

This guide will walk you through deploying Nhyira Haven to Azure (app) + Supabase (database).

## Prerequisites

- Azure account (free tier available for students)
- Supabase account (free tier: 500MB database)
- GitHub account (repo must be public for grading)

---

## Step 1: Set Up Supabase (PostgreSQL Database)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: `nhyira-haven`
4. Set a strong database password (save this!)
5. Choose a region close to you
6. Wait for project to be created (~2 minutes)

### 1.2 Get Connection String

1. Go to **Project Settings** → **Database**
2. Find **Connection string** → **ADO.NET**
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password

Example:
```
Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD
```

---

## Step 2: Create Azure Resources

### 2.1 Install Azure CLI

```bash
# macOS
brew install azure-cli

# Verify
az --version
```

### 2.2 Login to Azure

```bash
az login
```

### 2.3 Create Resources

```bash
# Set variables
RESOURCE_GROUP="nhyira-haven-rg"
APP_NAME="nhyira-haven-api"
LOCATION="eastus"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan (Free tier)
az appservice plan create \
  --name "nhyira-haven-plan" \
  --resource-group $RESOURCE_GROUP \
  --sku F1 \
  --is-linux

# Create Web App
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan "nhyira-haven-plan" \
  --runtime "DOTNETCORE:10.0"
```

---

## Step 3: Configure Environment Variables

### 3.1 Set Supabase Connection String

```bash
az webapp config appsettings set \
  --resource-group nhyira-haven-rg \
  --name nhyira-haven-api \
  --settings \
    "ConnectionStrings__DefaultConnection=Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD"
```

### 3.2 Set JWT Secret Key

```bash
# Generate a secure random key
openssl rand -base64 32

# Set it in Azure
az webapp config appsettings set \
  --resource-group nhyira-haven-rg \
  --name nhyira-haven-api \
  --settings \
    "Jwt__Key=YOUR_SECURE_KEY_HERE"
```

### 3.3 Set Frontend URL (for CORS)

```bash
az webapp config appsettings set \
  --resource-group nhyira-haven-rg \
  --name nhyira-haven-api \
  --settings \
    "AllowedOrigins=https://nhyira-haven.azurewebsites.net"
```

---

## Step 4: Deploy Backend

### Option A: GitHub Actions (Recommended)

1. Go to **Azure Portal** → **App Service** → `nhyira-haven-api`
2. Click **Get publish profile**
3. Copy the content
4. Go to **GitHub** → **Repo** → **Settings** → **Secrets**
5. Create secret: `AZURE_WEBAPP_PUBLISH_PROFILE`
6. Paste the publish profile content
7. Push to main branch - GitHub Actions will auto-deploy

### Option B: Manual Deploy

```bash
cd backend
dotnet publish -c Release -o ./publish

# Create deployment zip
cd publish
zip -r ../deploy.zip .

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group nhyira-haven-rg \
  --name nhyira-haven-api \
  --src ../deploy.zip
```

---

## Step 5: Run Database Migrations

### 5.1 Create PostgreSQL Migration

```bash
cd backend
dotnet ef migrations add InitialCreate_PostgreSQL --output-dir Migrations/PostgreSQL
```

### 5.2 Run Migration on Azure

You'll need to SSH into the Azure Web App:

```bash
az webapp ssh --name nhyira-haven-api --resource-group nhyira-haven-rg

# In SSH session:
cd site/wwwroot
dotnet ef database update
```

---

## Step 6: Deploy Frontend (Azure Static Web Apps)

### 6.1 Create Static Web App

```bash
az staticwebapp create \
  --name nhyira-haven-frontend \
  --resource-group nhyira-haven-rg \
  --source . \
  --location eastus \
  --branch main \
  --app-location "frontend" \
  --output-location "dist" \
  --login-with azure
```

### 6.2 Configure Frontend Environment

```bash
az staticwebapp appsettings set \
  --name nhyira-haven-frontend \
  --resource-group nhyira-haven-rg \
  --settings \
    "VITE_API_URL=https://nhyira-haven-api.azurewebsites.net/api"
```

---

## Step 7: Update CORS in Backend

Update `Program.cs` CORS to include your frontend URL:

```csharp
policy.WithOrigins(
    "http://localhost:5173",
    "https://nhyira-haven.azurewebsites.net",
    "https://nhyira-haven-api.azurewebsites.net"
)
```

---

## Step 8: Seed Database

Run the seed endpoint after deployment:

```bash
curl -X POST https://nhyira-haven-api.azurewebsites.net/api/seed
```

Or use the command:

```bash
az webapp ssh --name nhyira-haven-api --resource-group nhyira-haven-rg
cd site/wwwroot
dotnet NhyiraHaven.dll seed
```

---

## Environment Variables Summary

| Variable | Location | Example |
|----------|----------|---------|
| `ConnectionStrings__DefaultConnection` | Azure App Service | `Host=db.xxx.supabase.co;Port=5432;...` |
| `Jwt__Key` | Azure App Service | Random 32+ char string |
| `Jwt__Issuer` | Azure App Service | `NhyiraHaven` |
| `Jwt__Audience` | Azure App Service | `NhyiraHaven` |
| `VITE_API_URL` | Static Web App | `https://nhyira-haven-api.azurewebsites.net/api` |

---

## URLs After Deployment

| Service | URL |
|---------|-----|
| Backend API | `https://nhyira-haven-api.azurewebsites.net` |
| Frontend | `https://nhyira-haven.azurewebsites.net` |
| API Health | `https://nhyira-haven-api.azurewebsites.net/api/health` |
| Swagger | `https://nhyira-haven-api.azurewebsites.net/swagger` |

---

## Troubleshooting

### Database Connection Issues

```bash
# Check logs
az webapp log tail --name nhyira-haven-api --resource-group nhyira-haven-rg

# Test connection locally
dotnet ef database update
```

### Frontend Not Connecting to Backend

1. Check CORS settings in backend
2. Verify `VITE_API_URL` in frontend environment
3. Check browser console for CORS errors

### Migration Issues

```bash
# Drop and recreate database (WARNING: destructive)
dotnet ef database drop
dotnet ef database update
```

---

## Security Checklist

- [ ] JWT secret is at least 32 characters
- [ ] Database password is strong
- [ ] HTTPS only enabled on Azure
- [ ] CORS configured for frontend URL only
- [ ] Connection strings stored in Azure (not in code)
- [ ] GitHub secrets configured (not in repo)

---

## Cost Estimate

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Azure App Service | F1 Free | $0 |
| Azure Static Web Apps | Free | $0 |
| Supabase | Free | $0 |
| **Total** | | **$0** |

---

*Last updated: April 2026*