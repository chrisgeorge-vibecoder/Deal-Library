#!/bin/bash

# Demo Stability System - Prevents context loss during demos
# This script ensures both frontend and backend maintain state and recover gracefully

set -e

echo "🚀 Starting Demo Stability System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

# Function to log errors
error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to log success
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to log warnings
warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if services are already running
check_services() {
    log "Checking service status..."
    
    BACKEND_RUNNING=false
    FRONTEND_RUNNING=false
    
    if pgrep -f "node dist/index.js" > /dev/null; then
        BACKEND_RUNNING=true
        log "Backend is running"
    fi
    
    if pgrep -f "next dev" > /dev/null; then
        FRONTEND_RUNNING=true
        log "Frontend is running"
    fi
    
    echo "BACKEND_RUNNING=$BACKEND_RUNNING"
    echo "FRONTEND_RUNNING=$FRONTEND_RUNNING"
}

# Graceful shutdown function
graceful_shutdown() {
    log "Initiating graceful shutdown..."
    
    # Stop frontend gracefully
    if pgrep -f "next dev" > /dev/null; then
        log "Stopping frontend gracefully..."
        pkill -TERM -f "next dev" || true
        sleep 3
        pkill -KILL -f "next dev" || true
    fi
    
    # Stop backend gracefully
    if pgrep -f "node dist/index.js" > /dev/null; then
        log "Stopping backend gracefully..."
        pkill -TERM -f "node dist/index.js" || true
        sleep 3
        pkill -KILL -f "node dist/index.js" || true
    fi
    
    success "Graceful shutdown completed"
}

# Start backend with persistence
start_backend() {
    log "Starting backend with enhanced stability..."
    
    cd "/Users/cgeorge/Deal Library/deal-library-backend"
    
    # Check if dist directory exists and is recent
    if [ ! -d "dist" ] || [ "$(find dist -name "*.js" -mtime +1 | wc -l)" -gt 0 ]; then
        log "Building backend..."
        npm run build
    fi
    
    # Start backend in background with logging
    nohup npm start > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    
    # Wait for backend to be ready
    log "Waiting for backend to initialize..."
    for i in {1..30}; do
        if curl -s http://localhost:3002/health > /dev/null 2>&1; then
            success "Backend is ready on port 3002"
            return 0
        fi
        sleep 2
        log "Waiting for backend... (attempt $i/30)"
    done
    
    error "Backend failed to start within 60 seconds"
    return 1
}

# Start frontend with cache management
start_frontend() {
    log "Starting frontend with enhanced stability..."
    
    cd "/Users/cgeorge/Deal Library/deal-library-frontend"
    
    # Clean cache only if it's problematic
    if [ -d ".next" ]; then
        # Check if cache is corrupted (compilation errors)
        if npm run build > /dev/null 2>&1; then
            log "Cache is healthy, keeping existing build"
        else
            warn "Cache appears corrupted, cleaning..."
            rm -rf .next
            rm -rf node_modules/.cache
        fi
    fi
    
    # Start frontend in background with logging
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    
    # Wait for frontend to be ready
    log "Waiting for frontend to initialize..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            success "Frontend is ready on port 3000"
            return 0
        fi
        sleep 2
        log "Waiting for frontend... (attempt $i/30)"
    done
    
    error "Frontend failed to start within 60 seconds"
    return 1
}

# Health check function
health_check() {
    log "Performing comprehensive health check..."
    
    # Check backend health
    if curl -s http://localhost:3002/health | grep -q "OK"; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
        return 1
    fi
    
    # Check frontend health
    if curl -s http://localhost:3000 | grep -q "Launchpad"; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
        return 1
    fi
    
    # Check API endpoints
    if curl -s http://localhost:3002/api/personas | grep -q "id"; then
        success "API endpoints are responding"
    else
        error "API endpoints are not responding"
        return 1
    fi
    
    success "All health checks passed - Demo is ready!"
    return 0
}

# Auto-recovery function
auto_recovery() {
    log "Attempting auto-recovery..."
    
    # Check what's broken and fix it
    if ! curl -s http://localhost:3002/health > /dev/null 2>&1; then
        warn "Backend is down, restarting..."
        start_backend
    fi
    
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        warn "Frontend is down, restarting..."
        start_frontend
    fi
    
    # Final health check
    if health_check; then
        success "Auto-recovery successful!"
        return 0
    else
        error "Auto-recovery failed"
        return 1
    fi
}

# Create logs directory
mkdir -p logs

# Main execution
case "${1:-start}" in
    "start")
        log "Starting demo stability system..."
        graceful_shutdown
        start_backend
        start_frontend
        health_check
        ;;
    "stop")
        graceful_shutdown
        ;;
    "restart")
        graceful_shutdown
        sleep 2
        start_backend
        start_frontend
        health_check
        ;;
    "health")
        health_check
        ;;
    "recover")
        auto_recovery
        ;;
    "status")
        check_services
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|health|recover|status}"
        exit 1
        ;;
esac

success "Demo stability system operation completed!"
