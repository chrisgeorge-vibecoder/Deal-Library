#!/bin/bash

# Demo Startup Script - Ensures both frontend and backend are running reliably
# Usage: ./start-demo.sh

echo "🎬 Starting Sovrn Launchpad Demo"
echo "📅 $(date)"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    print_status "Cleaning up port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Function to cleanup all development processes
cleanup_all() {
    print_status "Cleaning up all development processes..."
    
    # Kill all nodemon and ts-node processes
    pkill -f "nodemon.*src/index.ts" 2>/dev/null || true
    pkill -f "ts-node.*src/index.ts" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    
    # Kill specific ports
    kill_port 3000
    kill_port 3001
    kill_port 3002
    
    sleep 3
}

# Function to start backend
start_backend() {
    print_status "Starting backend server..."
    
    # Kill existing backend processes
    kill_port 3002
    
    # Start backend in background
    cd "/Users/cgeorge/Deal-Library/deal-library-backend"
    PORT=3002 npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    for i in {1..30}; do
        if check_port 3002; then
            print_success "Backend started successfully on port 3002"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    print_error "Backend failed to start within 60 seconds"
    return 1
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend server..."
    
    # Kill existing frontend processes
    kill_port 3000
    
    # Start frontend in background
    cd "/Users/cgeorge/Deal-Library/deal-library-frontend"
    PORT=3000 npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    for i in {1..30}; do
        if check_port 3000; then
            print_success "Frontend started successfully on port 3000"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    print_error "Frontend failed to start within 60 seconds"
    return 1
}

# Function to test API connectivity
test_apis() {
    print_status "Testing API connectivity..."
    
    # Test backend API
    response=$(curl -s -w "%{http_code}" http://localhost:3002/api/deals/search -X POST -H "Content-Type: application/json" -d '{"query":"test"}' -o /dev/null)
    
    if [ "$response" = "200" ]; then
        print_success "Backend API responding correctly (HTTP $response)"
    else
        print_error "Backend API test failed (HTTP $response)"
        return 1
    fi
    
    # Test frontend
    response=$(curl -s -w "%{http_code}" http://localhost:3000/ -o /dev/null)
    
    if [ "$response" = "200" ]; then
        print_success "Frontend responding correctly (HTTP $response)"
    else
        print_error "Frontend test failed (HTTP $response)"
        return 1
    fi
    
    return 0
}

# Function to display demo information
show_demo_info() {
    echo ""
    print_success "🎬 Demo is ready!"
    echo ""
    echo "📋 Demo URLs:"
    echo "   • Main Application: http://localhost:3000"
    echo "   • Geographic Insights: http://localhost:3000/geographic-insights"
    echo "   • Backend API: http://localhost:3002"
    echo ""
    echo "🔧 Demo Features:"
    echo "   • Audience Explorer with filtering"
    echo "   • Chat interface with AI"
    echo "   • Geographic Insights with advanced filters"
    echo "   • Save cards functionality"
    echo "   • Market sizing and audience insights"
    echo ""
    echo "📊 Monitoring:"
    echo "   • Backend logs: tail -f backend.log"
    echo "   • Frontend logs: tail -f frontend.log"
    echo ""
    echo "🛑 To stop demo: Ctrl+C"
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    print_status "Shutting down demo..."
    
    # Kill backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    kill_port 3002
    
    # Kill frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    kill_port 3000
    
    print_success "Demo stopped successfully"
    echo "📅 $(date)"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
echo ""
print_status "Preparing demo environment..."

# Cleanup any existing processes first
cleanup_all

# Check if we're in the right directory
if [ ! -d "/Users/cgeorge/Deal-Library/deal-library-backend" ] || [ ! -d "/Users/cgeorge/Deal-Library/deal-library-frontend" ]; then
    print_error "Could not find backend or frontend directories"
    exit 1
fi

# Start backend
if ! start_backend; then
    print_error "Failed to start backend"
    exit 1
fi

# Start frontend
if ! start_frontend; then
    print_error "Failed to start frontend"
    exit 1
fi

# Test APIs
if ! test_apis; then
    print_warning "API tests failed, but servers are running"
fi

# Show demo information
show_demo_info

# Keep script running and monitor
print_status "Demo is running... Press Ctrl+C to stop"
while true; do
    sleep 10
    
    # Check if processes are still running
    if ! check_port 3002; then
        print_warning "Backend appears to have stopped, restarting..."
        start_backend
    fi
    
    if ! check_port 3000; then
        print_warning "Frontend appears to have stopped, restarting..."
        start_frontend
    fi
done