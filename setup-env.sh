#!/bin/bash

# Setup environment variables for development
# This script loads Codespace user secrets into .env.local

echo "🔧 Setting up environment variables..."

# Check if running in Codespace
if [ -n "$CODESPACE_NAME" ]; then
    echo "✓ Running in GitHub Codespace: $CODESPACE_NAME"
    
    # Try to get SUNO_API_KEY from Codespace secrets
    # Note: User secrets are typically available via gh CLI
    if command -v gh &> /dev/null; then
        echo "✓ GitHub CLI available"
        
        # Check if secret exists
        if gh secret list --user | grep -q "SUNO_API_KEY"; then
            echo "✓ SUNO_API_KEY found in user secrets"
            
            # Note: We cannot directly read the secret value via gh CLI
            # The secret must be manually added to repository secrets or
            # set as an environment variable in Codespace settings
            echo ""
            echo "⚠️  IMPORTANT: Codespace user secrets are NOT automatically"
            echo "   injected into development processes."
            echo ""
            echo "📝 To use your SUNO_API_KEY:"
            echo "   1. Go to: https://github.com/settings/codespaces"
            echo "   2. Find your SUNO_API_KEY secret"
            echo "   3. Select this repository in 'Repository access'"
            echo "   OR"
            echo "   4. Add SUNO_API_KEY to Vercel environment variables"
            echo ""
        else
            echo "❌ SUNO_API_KEY not found in user secrets"
        fi
    fi
else
    echo "⚠️  Not running in a Codespace"
fi

# Check if .env.local exists and has SUNO_API_KEY
if [ -f ".env.local" ]; then
    if grep -q "^SUNO_API_KEY=.\+" .env.local; then
        echo "✓ .env.local exists with SUNO_API_KEY configured"
    else
        echo "⚠️  .env.local exists but SUNO_API_KEY is empty"
        echo "   Please add your API key to .env.local"
    fi
else
    echo "❌ .env.local not found"
    echo "   Creating from template..."
    cp .env.example .env.local
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local and add your SUNO_API_KEY"
echo "  2. Run: pnpm dev"
echo ""
