#!/bin/bash

# Start Both Backend and Frontend Script
# This script starts both servers in separate terminal windows/tabs

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Business Dashboard..."
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect OS and open new terminal windows accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "📱 Detected macOS"
    
    # Start backend in new terminal window
    echo "🔧 Starting backend server..."
    osascript <<EOF
tell application "Terminal"
    do script "cd '$SCRIPT_DIR' && ./start-backend.sh"
end tell
EOF
    
    # Wait a moment for backend to start
    sleep 2
    
    # Start frontend in new terminal window
    echo "🎨 Starting frontend server..."
    osascript <<EOF
tell application "Terminal"
    do script "cd '$SCRIPT_DIR' && ./start-frontend.sh"
end tell
EOF
    
    echo ""
    echo "✅ Both servers are starting in separate Terminal windows"
    echo ""
    echo "📍 Backend: http://localhost:8000"
    echo "📍 Frontend: http://localhost:5173"
    echo ""
    echo "💡 Close the Terminal windows to stop the servers"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🐧 Detected Linux"
    
    if command_exists gnome-terminal; then
        # GNOME Terminal
        gnome-terminal --tab --title="Backend" -- bash -c "cd '$SCRIPT_DIR' && ./start-backend.sh; exec bash" &
        sleep 2
        gnome-terminal --tab --title="Frontend" -- bash -c "cd '$SCRIPT_DIR' && ./start-frontend.sh; exec bash" &
    elif command_exists xterm; then
        # xterm
        xterm -T "Backend" -e "cd '$SCRIPT_DIR' && ./start-backend.sh" &
        sleep 2
        xterm -T "Frontend" -e "cd '$SCRIPT_DIR' && ./start-frontend.sh" &
    else
        echo "❌ No supported terminal found. Please run manually:"
        echo "   Terminal 1: ./start-backend.sh"
        echo "   Terminal 2: ./start-frontend.sh"
        exit 1
    fi
    
    echo ""
    echo "✅ Both servers are starting in separate terminal windows"
    
else
    # Fallback: run in background
    echo "⚠️  OS not fully supported. Starting servers in background..."
    echo ""
    echo "💡 Run these commands in separate terminals:"
    echo "   Terminal 1: ./start-backend.sh"
    echo "   Terminal 2: ./start-frontend.sh"
    echo ""
    
    # Start backend in background
    cd "$SCRIPT_DIR"
    ./start-backend.sh &
    BACKEND_PID=$!
    
    sleep 3
    
    # Start frontend in background
    ./start-frontend.sh &
    FRONTEND_PID=$!
    
    echo "Backend PID: $BACKEND_PID"
    echo "Frontend PID: $FRONTEND_PID"
    echo ""
    echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
fi

