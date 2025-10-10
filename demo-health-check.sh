#!/bin/bash

# Demo Health Check Script
# Quickly check if both frontend and backend are running and healthy

echo "🏥 Demo Health Check"
echo "==================="
echo "📅 $(date)"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check port
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to test API
test_api() {
    local url=$1
    local name=$2
    
    response=$(curl -s -w "%{http_code}" "$url" -o /dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "   ${GREEN}✅ $name: Healthy (HTTP $response)${NC}"
        return 0
    else
        echo -e "   ${RED}❌ $name: Failed (HTTP $response)${NC}"
        return 1
    fi
}

# Check Backend
echo "🔧 Backend (Port 3002):"
if check_port 3002; then
    echo -e "   ${GREEN}✅ Port 3002: Listening${NC}"
    
    # Test backend API
    test_api "http://localhost:3002/api/deals/search" "API Endpoint"
    BACKEND_HEALTHY=$?
else
    echo -e "   ${RED}❌ Port 3002: Not listening${NC}"
    BACKEND_HEALTHY=1
fi

echo ""

# Check Frontend
echo "🎨 Frontend (Port 3000):"
if check_port 3000; then
    echo -e "   ${GREEN}✅ Port 3000: Listening${NC}"
    
    # Test frontend
    test_api "http://localhost:3000/" "Main Page"
    FRONTEND_HEALTHY=$?
else
    echo -e "   ${RED}❌ Port 3000: Not listening${NC}"
    FRONTEND_HEALTHY=1
fi

echo ""

# Overall Status
echo "📊 Overall Status:"
if [ $BACKEND_HEALTHY -eq 0 ] && [ $FRONTEND_HEALTHY -eq 0 ]; then
    echo -e "   ${GREEN}🎉 Demo is fully operational!${NC}"
    echo ""
    echo "🌐 Demo URLs:"
    echo "   • Main App: http://localhost:3000"
    echo "   • Geographic Insights: http://localhost:3000/geographic-insights"
    exit 0
else
    echo -e "   ${RED}⚠️  Demo has issues${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    if [ $BACKEND_HEALTHY -ne 0 ]; then
        echo "   • Backend: Run ./start-demo.sh or ./demo-backend.sh"
    fi
    if [ $FRONTEND_HEALTHY -ne 0 ]; then
        echo "   • Frontend: Run ./start-demo.sh"
    fi
    exit 1
fi


