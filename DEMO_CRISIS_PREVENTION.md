# Demo Crisis Prevention Guide

## 🚨 CRITICAL: Preventing Demo Disasters

This guide ensures your demos never fail due to context loss or service instability.

## Quick Start for Demos

### Option 1: Ultra-Stable Demo Mode (RECOMMENDED)
```bash
./start-demo-stable.sh
```
This starts everything with maximum stability and auto-recovery.

### Option 2: Manual Stable Start
```bash
./demo-stability.sh start
```

## Why Context Loss Happens

1. **Backend Restarts**: Every `pkill` command kills the backend and loses all memory
2. **Frontend Cache Issues**: Stale compilation cache causes errors
3. **No Persistence**: System has no memory of previous queries/responses
4. **Port Conflicts**: Multiple instances fighting for the same ports

## What We've Fixed

### ✅ Persistence Layer
- Backend now saves state to `demo-state.json`
- Last queries and responses are preserved
- Context survives restarts

### ✅ Graceful Shutdown/Startup
- Services shut down cleanly (SIGTERM, then SIGKILL)
- No orphaned processes
- Clean port release

### ✅ Health Monitoring
- Continuous health checks every 30 seconds
- Auto-recovery if services fail
- Comprehensive status reporting

### ✅ Cache Management
- Smart cache cleaning (only when corrupted)
- Preserves healthy builds
- Prevents compilation errors

### ✅ Auto-Recovery
- Detects failed services
- Automatically restarts broken components
- Maintains demo continuity

## Demo Day Checklist

### Before Demo (30 minutes before)
- [ ] Run `./start-demo-stable.sh`
- [ ] Verify both services are running: `./demo-stability.sh health`
- [ ] Test key functionality:
  - [ ] Chat interface loads
  - [ ] Intelligence Cards load data
  - [ ] Geo Insights page works
  - [ ] API endpoints respond

### During Demo
- [ ] Keep terminal with stability script open
- [ ] If anything fails, run `./demo-stability.sh recover`
- [ ] Check status anytime with `./demo-stability.sh status`

### After Demo
- [ ] Run `./demo-stability.sh stop` to clean shutdown

## Emergency Recovery Commands

### If Services Stop Working
```bash
./demo-stability.sh recover
```

### If Frontend Shows Errors
```bash
./demo-stability.sh restart
```

### If Backend Loses Context
```bash
# Check if persistence is working
curl http://localhost:3002/health | jq '.persistence'

# If not, restart with persistence
./demo-stability.sh restart
```

### If Port Conflicts Occur
```bash
# Kill all conflicting processes
pkill -f "node dist/index.js"
pkill -f "next dev"
sleep 2
./demo-stability.sh start
```

## Monitoring Commands

### Check Service Status
```bash
./demo-stability.sh status
```

### Health Check
```bash
./demo-stability.sh health
```

### View Logs
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs  
tail -f logs/frontend.log
```

## Prevention Strategies

### 1. Always Use Demo-Stable Mode
Never use basic `npm start` for demos. Always use:
```bash
./start-demo-stable.sh
```

### 2. Test Before Demo
Run a full test sequence:
```bash
./demo-stability.sh start
./demo-stability.sh health

# Test key features
curl http://localhost:3000 > /dev/null
curl http://localhost:3002/api/personas > /dev/null
```

### 3. Keep Recovery Commands Ready
Have these commands ready in your terminal:
```bash
./demo-stability.sh recover
./demo-stability.sh health
```

### 4. Monitor Continuously
The stability script monitors health every 30 seconds and auto-recovers.

## Common Issues and Solutions

### Issue: "Cannot access 'loadDataBySubcategory' before initialization"
**Solution**: This is a frontend compilation error. Run:
```bash
./demo-stability.sh restart
```

### Issue: Backend returns generic responses
**Solution**: Context was lost. Check persistence:
```bash
curl http://localhost:3002/health | jq '.persistence'
```

### Issue: Frontend shows compilation errors
**Solution**: Cache corruption. The stability script will auto-clean if needed.

### Issue: Port already in use
**Solution**: Graceful restart:
```bash
./demo-stability.sh restart
```

## Demo Success Metrics

A successful demo should show:
- ✅ Frontend loads instantly
- ✅ Intelligence Cards show real data
- ✅ Chat interface responds with context
- ✅ Geo Insights works with real data
- ✅ No compilation errors
- ✅ No context loss between queries

## Backup Plan

If the stability system fails:
1. Run `./demo-stability.sh stop`
2. Wait 5 seconds
3. Run `./demo-stability.sh start`
4. Run `./demo-stability.sh health`

If that fails:
1. Close all terminals
2. Open new terminal
3. Run `./start-demo-stable.sh`

## Support

If you encounter issues:
1. Check logs in `logs/` directory
2. Run health checks
3. Use auto-recovery
4. Restart with stability system

Remember: **The stability system is designed to prevent demo disasters. Use it religiously for demos.**


