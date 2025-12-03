#!/bin/bash

# Start Frontend Server Script
# This script starts the React frontend development server

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "🚀 Starting Business Dashboard Frontend..."
echo ""

# Navigate to frontend directory
cd "$FRONTEND_DIR" || {
    echo "❌ Error: Could not navigate to frontend directory: $FRONTEND_DIR"
    exit 1
}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# Check if port is already in use
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 5173 is already in use!"
    echo "   Another server might be running. Stop it first or use a different port."
    echo ""
    read -p "Do you want to kill the existing process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill $(lsof -ti:5173) 2>/dev/null || true
        sleep 1
    else
        echo "Exiting. Please stop the existing server first."
        exit 1
    fi
fi

# Start the development server
echo ""
echo "🌟 Starting Vite dev server on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev -- --host 0.0.0.0 --port 5173

