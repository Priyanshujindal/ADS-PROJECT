#!/bin/bash
# Titanic Predictor - Single Command Start Script with Auto Port Detection (macOS/Linux)

echo "🚀 Starting Titanic Predictor..."

# Function to find an available port starting from a given port
find_available_port() {
    local port=$1
    while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
        port=$((port + 1))
    done
    echo $port
}

# Find available ports
FRONTEND_PORT=$(find_available_port 8000)
BACKEND_PORT=$(find_available_port 5002)

echo "🔧 Starting Flask backend on port $BACKEND_PORT..."
PORT=$BACKEND_PORT .venv/bin/python server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

echo "🌐 Starting static frontend on port $FRONTEND_PORT..."
python3 -m http.server $FRONTEND_PORT &
FRONTEND_PID=$!

# Create a temporary config file for the frontend to read backend port
echo "window.BACKEND_URL = 'http://127.0.0.1:$BACKEND_PORT';" > backend-config.js

echo "✅ Server is running!"
echo "📍 Frontend: http://127.0.0.1:$FRONTEND_PORT"
echo "📍 Backend API: http://127.0.0.1:$BACKEND_PORT"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f backend-config.js; exit' INT
wait
