# Quick Start Guide

## 🚀 Easy Startup Scripts

We've created scripts to make starting the app super easy!

### First Time Setup

Run the setup script once to install all dependencies:

```bash
./setup.sh
```

This will:
- ✅ Create Python virtual environment
- ✅ Install backend dependencies
- ✅ Install frontend dependencies
- ✅ Make all scripts executable

### Starting the App

#### Option 1: Simple Start (Recommended for Testing)

Start both servers in the same terminal:

```bash
./start-simple.sh
```

This runs both servers in the background. Press `Ctrl+C` to stop both.

#### Option 2: Start Both Servers (macOS - Separate Windows)

**macOS:**
```bash
./start.sh
```
This opens two Terminal windows - one for backend, one for frontend.

**Linux:**
```bash
./start.sh
```
This opens two terminal tabs/windows.

#### Option 3: Start Servers Separately

**Backend only:**
```bash
./start-backend.sh
```
Starts FastAPI server at http://localhost:8000

**Frontend only:**
```bash
./start-frontend.sh
```
Starts React dev server at http://localhost:5173

### Manual Start (if scripts don't work)

**Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

## 📋 Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL** (optional, SQLite works for development)

## 🔑 Optional: OpenAI API Key

For AI insights feature, add to `backend/.env`:
```
OPENAI_API_KEY=your-api-key-here
```

## 🌐 Access the App

Once both servers are running:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 🛑 Stopping the Servers

- Press `Ctrl+C` in each terminal window
- Or close the terminal windows
- Or run: `pkill -f "uvicorn\|vite"`

## 📝 Troubleshooting

### Scripts won't run
```bash
chmod +x *.sh
```

### Backend won't start
- **Port 8000 in use:** The script will ask if you want to kill the existing process
- **Virtual environment missing:** Run `./setup.sh`
- **Dependencies missing:** Run `./setup.sh` or manually: `cd backend && source venv/bin/activate && pip install -r requirements.txt`

### Frontend won't start
- **Port 5173 in use:** The script will ask if you want to kill the existing process
- **node_modules missing:** Run `./setup.sh` or manually: `cd frontend && npm install`

### start.sh doesn't open new windows (macOS)
- Make sure Terminal.app has accessibility permissions
- Or use `./start-simple.sh` instead
- Or run servers manually in separate terminals

### Check what's running
```bash
# Check backend
lsof -i :8000

# Check frontend
lsof -i :5173

# Kill processes
kill $(lsof -ti:8000)  # Backend
kill $(lsof -ti:5173)  # Frontend
```

## 💡 Tips

- Use `./start-simple.sh` for quick testing
- Use `./start.sh` for development (separate windows)
- Scripts automatically check for dependencies and install if needed
- Scripts handle port conflicts and ask what to do
