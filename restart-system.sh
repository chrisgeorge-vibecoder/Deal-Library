#!/bin/bash

# Comprehensive system restart script to fix recurring port conflicts and stability issues
# This addresses the root causes of the recurring problems

echo "🔧 SYSTEM RESTART - Fixing Recurring Issues"
echo "📅 $(date)"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Function to kill processes more aggressively
kill_all_processes() {
    print_status "Killing all development processes..."
    
    # Kill by process names
    pkill -f "nodemon.*src/index.ts" 2>/dev/null || true
    pkill -f "ts-node.*src/index.ts" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "cross-env.*PORT.*next" 2>/dev/null || true
    pkill -f "cross-env.*PORT.*nodemon" 2>/dev/null || true
    
    # Kill by ports
    for port in 3000 3001 3002; do
        if lsof -ti:$port >/dev/null 2>&1; then
            print_status "Killing processes on port $port..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    # Wait for processes to fully terminate
    sleep 5
    
    # Double-check no processes are running
    for port in 3000 3001 3002; do
        if lsof -ti:$port >/dev/null 2>&1; then
            print_warning "Still processes on port $port, forcing kill..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 2
        fi
    done
}

# Function to verify ports are free
verify_ports_free() {
    print_status "Verifying ports are free..."
    for port in 3000 3001 3002; do
        if lsof -ti:$port >/dev/null 2>&1; then
            print_error "Port $port is still in use!"
            lsof -i:$port
            return 1
        else
            print_success "Port $port is free"
        fi
    done
    return 0
}

# Function to start backend with proper environment
start_backend() {
    print_status "Starting backend server..."
    
    cd /Users/cgeorge/Deal-Library/deal-library-backend
    
    # Ensure environment is clean
    export PORT=3002
    export NODE_ENV=development
    
    # Start with proper logging
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    print_status "Waiting for backend to start on port 3002..."
    for i in {1..30}; do
        if curl -s http://localhost:3002/health >/dev/null 2>&1; then
            print_success "Backend started successfully!"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    print_error "Backend failed to start"
    return 1
}

# Function to start frontend with proper environment
start_frontend() {
    print_status "Starting frontend server..."
    
    cd /Users/cgeorge/Deal-Library/deal-library-frontend
    
    # Ensure environment is clean
    export PORT=3000
    export NODE_ENV=development
    
    # Clear cache if needed
    if [ -d ".next" ]; then
        print_status "Clearing Next.js cache..."
        rm -rf .next
    fi
    
    # Start with proper logging
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start on port 3000..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            print_success "Frontend started successfully!"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    print_error "Frontend failed to start"
    return 1
}

# Function to test the fix
test_deal_matching() {
    print_status "Testing deal matching fix..."
    
    response=$(curl -s -w "%{http_code}" "http://localhost:3002/api/deals/search" \
        -H "Content-Type: application/json" \
        -d '{"query":"I'\''m the CMO of Old Navy and I want to reach new parents","conversationHistory":[],"selectedCardTypes":["deals"]}')
    
    if echo "$response" | grep -q '"dealName":.*[Bb]aby\|[Tt]oddler\|[Pp]arent' 2>/dev/null; then
        print_success "Deal matching fix is working - returning relevant parent/baby deals!"
    else
        print_warning "Deal matching may need adjustment - check the logs"
    fi
}

# Main execution
print_status "Starting comprehensive system restart..."

# Step 1: Kill all processes
kill_all_processes

# Step 2: Verify ports are free
if ! verify_ports_free; then
    print_error "Failed to free all ports. Manual intervention may be required."
    exit 1
fi

# Step 3: Start backend
if ! start_backend; then
    print_error "Failed to start backend"
    exit 1
fi

# Step 4: Start frontend  
if ! start_frontend; then
    print_error "Failed to start frontend"
    exit 1
fi

# Step 5: Test the fixes
sleep 5
test_deal_matching

print_success "System restart complete!"
echo ""
echo "🎉 Both systems should now be running stably:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend:  http://localhost:3002"
echo ""
echo "📊 The deal matching fix should now work for 'new parents' queries"
echo "✅ Strategic coaching should be visible in the UI"
echo ""
print_status "Monitor logs with: tail -f backend.log frontend.log"

