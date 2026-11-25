#!/usr/bin/env bash
# Runs HealthVault backend + frontend as detached persistent daemons
# Logs: /tmp/healthvault_backend.log and /tmp/healthvault_frontend.log

PROJECT_DIR="/Users/nikhil/.gemini/antigravity/scratch/healthvault"

echo "Starting backend..."
nohup "$PROJECT_DIR/backend/venv/bin/uvicorn" main:app --app-dir "$PROJECT_DIR/backend" --host 127.0.0.1 --port 8000 \
  > /tmp/healthvault_backend.log 2>&1 &
echo "Backend PID: $!"

sleep 2

echo "Starting frontend..."
cd "$PROJECT_DIR/frontend"
nohup npm run dev -- --host \
  > /tmp/healthvault_frontend.log 2>&1 &
echo "Frontend PID: $!"

sleep 3
echo ""
echo "=== Port check ==="
lsof -iTCP:8000 -sTCP:LISTEN -P 2>/dev/null | tail -1
lsof -iTCP:5173 -sTCP:LISTEN -P 2>/dev/null | tail -1
echo ""
echo "Open → http://localhost:5173"
