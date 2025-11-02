#!/bin/bash

# 🚀 DUA MUSIC - Quick Start Script
# Run this after fixing the 400 error

echo "🎵 DUA MUSIC - Starting System Check"
echo "====================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  WARNING: .env.local not found"
    echo "📝 Creating template .env.local file..."
    echo "SUNO_API_KEY=your_api_key_here" > .env.local
    echo "✅ Created .env.local - PLEASE EDIT IT WITH YOUR API KEY"
    echo ""
fi

# Check if API key is set
if grep -q "your_api_key_here" .env.local 2>/dev/null; then
    echo "❌ ERROR: SUNO_API_KEY not configured in .env.local"
    echo "📝 Please edit .env.local and add your real API key"
    echo ""
    exit 1
fi

echo "✅ .env.local exists"
echo "✅ SUNO_API_KEY configured"
echo ""

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Dependencies installed"
echo ""

# Check if port 3000 is available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 3000 is already in use"
    echo "🔄 Killing existing process..."
    kill -9 $(lsof -t -i:3000) 2>/dev/null
    sleep 2
fi

echo "✅ Port 3000 is available"
echo ""

echo "🚀 Starting dev server..."
echo "💡 Server will start at http://localhost:3000"
echo "📊 Watch this terminal for logs"
echo ""
echo "🧪 In another terminal, run: ./test-endpoints.sh"
echo ""

# Start dev server
npm run dev
