#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  🏥 ClinicalTriModal AI — Clinical Diagnostic Platform"
echo "  Comparing: ML (Random Forest) vs DL (CNN) vs Simple Rules (J48)"
echo "=========================================================="

cd "$(dirname "$0")"

# 1. Resolve Python 3.12 environment
if [ -d "$HOME/.pyenv/versions/3.12.7" ]; then
    PYTHON_CMD="$HOME/.pyenv/versions/3.12.7/bin/python"
elif command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo "🔹 Using Python: $($PYTHON_CMD --version)"

# 2. Check if frontend build exists; if not, build it
if [ ! -d "frontend/dist" ] || [ ! -f "frontend/dist/index.html" ]; then
    echo "📦 Building React production bundle..."
    cd frontend
    npm install --silent
    npm run build
    cd ..
fi

# 3. Start unified FastAPI + React server on port 8000
PORT="${PORT:-8001}"
echo "🚀 Starting Unified Application Server at http://localhost:$PORT"
echo "   - React Frontend: http://localhost:$PORT"
echo "   - FastAPI Swagger Docs: http://localhost:$PORT/docs"
echo "   - Health Check: http://localhost:$PORT/api/health"
echo "----------------------------------------------------------"
echo "Press Ctrl+C to stop the server."

exec "$PYTHON_CMD" -m uvicorn backend.app:app --host 0.0.0.0 --port $PORT
