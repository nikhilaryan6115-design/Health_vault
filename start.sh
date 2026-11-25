#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo " Starting HealthVault — wHACKiest 2026 Hackathon Prototype"
echo " Track T-3: Know Thyself"
echo "=========================================================="

# Start backend in background
cd "$PROJECT_DIR/backend"
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi

echo "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..."
./venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

trap "kill $BACKEND_PID 2>/dev/null || true" EXIT

# Start frontend
cd "$PROJECT_DIR/frontend"
echo "[2/2] Launching Vite Frontend on http://localhost:5173..."
npm run dev -- --host
