#!/bin/bash

# Demo Startup Script for Deal Library Amplify App
# Usage: ./start-demo.sh

echo "🎬 Starting Deal Library Application"
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

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/deal-library-amplify-app"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
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

# Function to cleanup development processes
cleanup_all() {
    print_status "Cleaning up existing processes..."
    pkill -f "next dev" 2>/dev/null || true
    kill_port 3000
    sleep 2
}

# Function to start the application
start_app() {
    print_status "Starting Next.js application..."
    
    # Kill existing processes
    kill_port 3000
    
    # Navigate to app directory
    cd "$APP_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Start in background
    PORT=3000 npm run dev > "$SCRIPT_DIR/app.log" 2>&1 &
    APP_PID=$!
    
    # Wait for app to start
    print_status "Waiting for application to start..."
    for i in {1..30}; do
        if check_port 3000; then
            print_success "Application started successfully on port 3000"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    print_error "Application failed to start within 60 seconds"
    return 1
}

# Function to test the application
test_app() {
    print_status "Testing application..."
    
    # Test main page
    response=$(curl -s -w "%{http_code}" http://localhost:3000/ -o /dev/null)
    
    if [ "$response" = "200" ]; then
        print_success "Application responding correctly (HTTP $response)"
        return 0
    else
        print_warning "Application test returned HTTP $response"
        return 1
    fi
}

# Function to display demo information
show_demo_info() {
    echo ""
    print_success "🎬 Application is ready!"
    echo ""
    echo "📋 URLs:"
    echo "   • Main Application: http://localhost:3000"
    echo "   • Audience Insights: http://localhost:3000/audience-insights"
    echo "   • Strategy Cards: http://localhost:3000/strategy-cards"
    echo "   • Market Insights: http://localhost:3000/market-insights"
    echo ""
    echo "📊 Monitoring:"
    echo "   • Application logs: tail -f app.log"
    echo ""
    echo "🛑 To stop: Ctrl+C"
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    print_status "Shutting down application..."
    
    if [ ! -z "$APP_PID" ]; then
        kill $APP_PID 2>/dev/null || true
    fi
    kill_port 3000
    
    print_success "Application stopped successfully"
    echo "📅 $(date)"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
echo ""
print_status "Preparing application environment..."

# Cleanup any existing processes first
cleanup_all

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    print_error "Could not find deal-library-amplify-app directory"
    exit 1
fi

# Start application
if ! start_app; then
    print_error "Failed to start application"
    exit 1
fi

# Test application
if ! test_app; then
    print_warning "Application tests failed, but server is running"
fi

# Show demo information
show_demo_info

# Keep script running and monitor
print_status "Application is running... Press Ctrl+C to stop"
while true; do
    sleep 10
    
    # Check if process is still running
    if ! check_port 3000; then
        print_warning "Application appears to have stopped, restarting..."
        start_app
    fi
done
