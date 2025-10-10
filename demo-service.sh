#!/bin/bash

# Demo Service Script - Runs as a persistent service
# This script keeps the backend running and automatically restarts it if it crashes

SERVICE_NAME="sovrn-demo-backend"
LOG_FILE="/Users/cgeorge/Deal Library/demo-service.log"
PID_FILE="/Users/cgeorge/Deal Library/demo-service.pid"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to start the service
start_service() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log "Service is already running (PID: $(cat $PID_FILE))"
        return 1
    fi
    
    log "Starting $SERVICE_NAME service..."
    
    # Start the service in background
    nohup bash -c "
        while true; do
            cd '/Users/cgeorge/Deal Library/deal-library-backend'
            log 'Starting backend server...'
            npm run dev >> '$LOG_FILE' 2>&1
            
            # If we get here, the server crashed
            log 'Backend server crashed, restarting in 5 seconds...'
            sleep 5
        done
    " > /dev/null 2>&1 &
    
    echo $! > "$PID_FILE"
    log "Service started (PID: $!)"
    return 0
}

# Function to stop the service
stop_service() {
    if [ ! -f "$PID_FILE" ]; then
        log "Service is not running"
        return 1
    fi
    
    PID=$(cat "$PID_FILE")
    if kill -0 $PID 2>/dev/null; then
        log "Stopping $SERVICE_NAME service (PID: $PID)..."
        kill $PID
        rm -f "$PID_FILE"
        log "Service stopped"
    else
        log "Service was not running (stale PID file)"
        rm -f "$PID_FILE"
    fi
    return 0
}

# Function to check service status
status_service() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log "Service is running (PID: $(cat $PID_FILE))"
        return 0
    else
        log "Service is not running"
        return 1
    fi
}

# Function to restart the service
restart_service() {
    log "Restarting $SERVICE_NAME service..."
    stop_service
    sleep 2
    start_service
}

# Function to show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        tail -f "$LOG_FILE"
    else
        log "No log file found"
    fi
}

# Main command handling
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        status_service
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the demo backend service"
        echo "  stop    - Stop the demo backend service"
        echo "  restart - Restart the demo backend service"
        echo "  status  - Check if the service is running"
        echo "  logs    - Show live service logs"
        exit 1
        ;;
esac

exit $?


