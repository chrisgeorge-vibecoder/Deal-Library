# 🎬 Demo Checklist - Sovrn Launchpad

## Pre-Demo Setup (5 minutes before)

### ✅ Quick Health Check
```bash
./demo-health-check.sh
```
**Expected Result:** All green checkmarks ✅

### ✅ Start Demo (if needed)
```bash
./start-demo.sh
```
**Expected Result:** Both servers start successfully

## Demo URLs
- **Main Application:** http://localhost:3000
- **Geographic Insights:** http://localhost:3000/geographic-insights

## Demo Flow Recommendations

### 1. **Audience Explorer** (2-3 minutes)
- Show category-based navigation
- Demonstrate filtering (Deal Opportunities > CTV)
- Show search functionality
- Highlight save cards feature

### 2. **Chat Interface** (3-4 minutes)
- Show card type selector
- Demonstrate AI responses for different card types
- Show "View Relevant Deals" functionality
- Highlight saved cards in sidebar

### 3. **Geographic Insights** (4-5 minutes)
- Show the new zip code-based architecture
- Demonstrate advanced filtering system
- Show filter presets (High Opportunity Markets, Tech Hubs)
- Demonstrate search functionality
- Show tab navigation (Overview, Zip Codes, Markets, Segments)

## Key Features to Highlight

### 🎯 **Filtering System**
- Quick presets for common scenarios
- Advanced filtering by demographics, market conditions
- Real-time data updates

### 🤖 **AI Integration**
- Gemini-powered responses
- Context-aware card generation
- Intelligent routing based on query type

### 💾 **Save Cards**
- Individual card saving
- Persistent storage
- Easy access from sidebar

### 🗺️ **Geographic Analysis**
- Zip code-based insights
- DMA mapping
- Market opportunity scoring

## Backup Plans

### If Backend Stops:
1. Run `./demo-backend.sh` in a separate terminal
2. Wait 30 seconds for restart
3. Continue demo

### If Frontend Stops:
1. Run `cd deal-library-frontend && npm run dev`
2. Wait 30 seconds for restart
3. Continue demo

### If APIs Fail:
- Use sample data (automatically loads)
- Explain that real-time data will return shortly
- Focus on UI/UX features

## Post-Demo

### Clean Shutdown
```bash
# Press Ctrl+C in the terminal running start-demo.sh
# Or run:
./demo-health-check.sh
```

## Troubleshooting Commands

### Check What's Running
```bash
lsof -i :3000  # Frontend
lsof -i :3002  # Backend
```

### Kill Everything
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### View Logs
```bash
tail -f backend.log    # Backend logs
tail -f frontend.log   # Frontend logs
```

## Demo Scripts Summary

| Script | Purpose | Usage |
|--------|---------|-------|
| `start-demo.sh` | Start both servers with monitoring | `./start-demo.sh` |
| `demo-backend.sh` | Start backend only with auto-restart | `./demo-backend.sh` |
| `demo-health-check.sh` | Quick health check | `./demo-health-check.sh` |

## Success Metrics
- ✅ Both servers start within 60 seconds
- ✅ All API endpoints respond with HTTP 200
- ✅ Frontend loads without errors
- ✅ Filter functionality works
- ✅ Save cards persist
- ✅ AI responses generate correctly

---
**Remember:** The demo is designed to be resilient. Even if some external services are down, the core functionality will work with sample data.