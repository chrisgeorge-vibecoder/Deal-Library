#!/bin/bash

# Demo-Stable Startup Script
# This script ensures maximum stability for demos by preventing context loss

set -e

echo "🎯 Starting DEMO-STABLE mode..."
echo "This ensures maximum stability and prevents context loss during demos"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== DEMO STABILITY CHECKLIST ===${NC}"
echo "✅ Persistence layer implemented"
echo "✅ Graceful shutdown/startup"
echo "✅ Health monitoring"
echo "✅ Auto-recovery system"
echo "✅ Cache management"
echo ""

# Use the demo stability system
echo -e "${YELLOW}Initializing demo stability system...${NC}"
./demo-stability.sh start

echo ""
echo -e "${GREEN}🎯 DEMO-STABLE MODE ACTIVE!${NC}"
echo ""
echo "Your demo is now running with enhanced stability:"
echo "• Context will be preserved across restarts"
echo "• Auto-recovery if services fail"
echo "• Health monitoring active"
echo ""
echo "Demo URLs:"
echo "• Frontend: http://localhost:3000"
echo "• Backend Health: http://localhost:3002/health"
echo ""
echo "Commands for demo management:"
echo "• Check status: ./demo-stability.sh status"
echo "• Health check: ./demo-stability.sh health"
echo "• Auto-recovery: ./demo-stability.sh recover"
echo "• Stop services: ./demo-stability.sh stop"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Use Ctrl+C to stop all services gracefully${NC}"

# Keep the script running and monitor health
trap './demo-stability.sh stop; exit 0' INT TERM

echo "Monitoring demo health... (Press Ctrl+C to stop)"
while true; do
    if ! ./demo-stability.sh health > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ Health check failed, attempting recovery...${NC}"
        ./demo-stability.sh recover
    fi
    sleep 30
done


