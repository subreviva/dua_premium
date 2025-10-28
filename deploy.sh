#!/bin/bash

# DUA - Automated Vercel Deployment Script
# Run with: bash deploy.sh

set -e  # Exit on error

echo "🚀 Starting DUA Deployment Process..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found!"
    echo "   Please create it with your environment variables."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🔨 Building project..."
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Ask for deployment type
read -p "Deploy to production? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌟 Deploying to PRODUCTION..."
    vercel --prod
else
    echo "🔍 Deploying to PREVIEW..."
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Check your deployment URL"
echo "   2. Verify environment variables in Vercel Dashboard"
echo "   3. Test all features"
echo ""
echo "🎉 DUA is live!"
