#!/bin/bash
# Azure deployment script for Nhyira Haven backend

# Variables (set these before running)
RESOURCE_GROUP="nhyira-haven-rg"
APP_NAME="nhyira-haven-api"
LOCATION="eastus"
SKU="F1" # Free tier

echo "🚀 Deploying Nhyira Haven API to Azure..."

# Create resource group if it doesn't exist
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan (Free tier)
echo "📋 Creating App Service plan..."
az appservice plan create \
  --name "nhyira-haven-plan" \
  --resource-group $RESOURCE_GROUP \
  --sku $SKU \
  --is-linux

# Create Web App
echo "🌐 Creating Web App..."
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan "nhyira-haven-plan" \
  --runtime "DOTNETCORE:9.0"

# Set environment variables (you'll need to set these manually or via Key Vault)
echo "⚙️ Setting environment variables..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
    "ASPNETCORE_ENVIRONMENT=Production" \
    "DATABASE_URL=@Microsoft.KeyVault(VaultUrl=https://your-keyvault.vault.azure.net/;SecretName=DatabaseUrl)" \
    "Jwt__Key=@Microsoft.KeyVault(VaultUrl=https://your-keyvault.vault.azure.net/;SecretName=JwtKey)"

# Enable HTTPS Only
echo "🔒 Enabling HTTPS..."
az webapp update --name $APP_NAME --resource-group $RESOURCE_GROUP --set httpsOnly=true

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set DATABASE_URL environment variable to your Supabase connection string"
echo "2. Set Jwt__Key to a secure random key (at least 32 characters)"
echo "3. Push your code to Azure:"
echo "   git remote add azure https://$APP_NAME.scm.azurewebsites.net"
echo "   git push azure main"