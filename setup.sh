#!/bin/bash

# Setup Script
# This script sets up the development environment

set -e

echo "🔧 Setting up Business Dashboard Development Environment..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Backend Setup
echo "📦 Setting up backend..."
cd "$SCRIPT_DIR/backend"

if [ ! -d "venv" ]; then
    echo "   Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "   Activating virtual environment..."
source venv/bin/activate

echo "   Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "   ✅ Backend setup complete!"
echo ""

# Frontend Setup
echo "📦 Setting up frontend..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "   Installing Node.js dependencies..."
    npm install
    echo "   ✅ Frontend setup complete!"
else
    echo "   ✅ Frontend dependencies already installed!"
fi

echo ""

# Make scripts executable
echo "🔐 Making scripts executable..."
chmod +x "$SCRIPT_DIR/start-backend.sh"
chmod +x "$SCRIPT_DIR/start-frontend.sh"
chmod +x "$SCRIPT_DIR/start.sh"
chmod +x "$SCRIPT_DIR/setup.sh"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. (Optional) Add OpenAI API key to backend/.env:"
echo "      OPENAI_API_KEY=your-key-here"
echo ""
echo "   2. Start the application:"
echo "      ./start.sh          # Start both servers (macOS/Linux)"
echo "      OR"
echo "      ./start-backend.sh  # Start backend only"
echo "      ./start-frontend.sh # Start frontend only"
echo ""
echo "   3. Open http://localhost:5173 in your browser"
echo ""

