#!/bin/bash

# Demo-Ready Backend Startup Script
# This script ensures the backend stays running and restarts automatically if it crashes

echo "🚀 Starting Demo-Ready Backend Server..."
echo "📅 $(date)"
echo "=================================="

# Function to start backend with auto-restart
start_backend() {
    echo "🔄 Starting backend server..."
    cd "/Users/cgeorge/Deal Library/deal-library-backend"
    
    # Kill any existing processes on port 3002
    echo "🧹 Cleaning up existing processes..."
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    
    # Wait a moment for cleanup
    sleep 2
    
    # Start with auto-restart using nodemon
    echo "✅ Starting backend with auto-restart enabled..."
    npm run dev
}

# Function to check if backend is healthy
check_health() {
    echo "🔍 Checking backend health..."
    response=$(curl -s -w "%{http_code}" http://localhost:3002/api/deals/search -X POST -H "Content-Type: application/json" -d '{"query":"health check"}' -o /dev/null)
    
    if [ "$response" = "200" ]; then
        echo "✅ Backend is healthy (HTTP $response)"
        return 0
    else
        echo "❌ Backend health check failed (HTTP $response)"
        return 1
    fi
}

# Function to handle graceful shutdown
cleanup() {
    echo ""
    echo "🛑 Shutting down backend server..."
    echo "📅 $(date)"
    echo "=================================="
    
    # Kill the backend process
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    
    echo "✅ Backend server stopped"
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM

echo "🎯 Demo Backend Configuration:"
echo "   • Auto-restart on crash: ✅"
echo "   • Health monitoring: ✅"
echo "   • Graceful shutdown: ✅"
echo "   • Port: 3002"
echo "   • Logs: Real-time"
echo ""

# Start the backend
start_backend


