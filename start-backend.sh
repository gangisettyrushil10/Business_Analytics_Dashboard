#!/bin/bash

# Start Backend Server Script
# This script starts the FastAPI backend server

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "🚀 Starting Business Dashboard Backend..."
echo ""

# Navigate to backend directory
cd "$BACKEND_DIR" || {
    echo "❌ Error: Could not navigate to backend directory: $BACKEND_DIR"
    exit 1
}

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    echo "✅ Dependencies installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Create backend/.env with your OPENAI_API_KEY (optional)"
fi

# Check if port is already in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 8000 is already in use!"
    echo "   Another server might be running. Stop it first or use a different port."
    echo ""
    read -p "Do you want to kill the existing process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill $(lsof -ti:8000) 2>/dev/null || true
        sleep 1
    else
        echo "Exiting. Please stop the existing server first."
        exit 1
    fi
fi

# Start the server
echo ""
echo "🌟 Starting FastAPI server on http://localhost:8000"
echo "📚 API docs available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app.main:app --reload --port 8000

