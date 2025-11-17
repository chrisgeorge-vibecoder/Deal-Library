# Agent Mode Memory Issue - Root Cause Identified

**Date:** November 6, 2025  
**Issue:** `ERR_INCOMPLETE_CHUNKED_ENCODING` causing "network error"

---

## Root Cause: OUT OF MEMORY ❌

The backend Node.js process is **running out of memory** and crashing mid-request:

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

### Why This Happens:
1. Agent Mode loads 2M+ commerce records into memory
2. Processes multiple parallel analyses (audiences, deals, personas, etc.)
3. Node.js default heap size (512MB-1GB) is insufficient
4. Process crashes mid-stream → SSE connection interrupted → `ERR_INCOMPLETE_CHUNKED_ENCODING`

---

## What I Tried:

### ❌ Attempt 1: package.json NODE_OPTIONS
```json
"dev": "cross-env NODE_OPTIONS='--max-old-space-size=4096' PORT=3002 nodemon src/index.ts"
```
**Result:** cross-env doesn't properly pass NODE_OPTIONS to child process

### ❌ Attempt 2: nodemon.json nodeArgs
```json
"nodeArgs": ["--max-old-space-size=4096"]
```
**Result:** Still crashing with memory errors

### ❌ Attempt 3: Direct ts-node with NODE_OPTIONS
```bash
NODE_OPTIONS="--max-old-space-size=4096" PORT=3002 npx ts-node src/index.ts
```
**Result:** Backend becomes unresponsive, doesn't answer requests

---

## The Real Problem:

Even with 4GB of heap, the system is likely hitting memory issues due to:

1. **Commerce data loading** - 2M+ records loaded twice (Supabase attempt + CSV fallback)
2. **Parallel processing** - Agent Mode runs 8 analyses simultaneously
3. **No streaming/chunking** - All data loaded into memory at once
4. **Possible memory leaks** - Objects not being garbage collected

---

## Solutions (In Order of Preference):

### Option 1: Reduce Memory Usage (RECOMMENDED)
**Modify commerce data loading to be more efficient:**

```typescript
// In commerceAudienceService.ts
// Load data in smaller chunks
// Implement lazy loading
// Clear unnecessary data from memory after use
```

**Advantages:**
- Works with default Node memory
- More scalable long-term
- Fixes root cause

**Disadvantages:**
- Requires code refactoring
- Takes time to implement

### Option 2: Disable Commerce Data Loading for Agent Mode
**Skip the 2M+ record loading when Agent Mode is running:**

```typescript
// In agentModeService.ts
// Don't wait for full commerce data load
// Use cached/partial data instead
```

**Advantages:**
- Quick fix
- Agent Mode works immediately

**Disadvantages:**
- Less complete data for recommendations

### Option 3: Run Backend in Production Mode
**Build and run compiled JS instead of ts-node:**

```bash
cd deal-library-backend
npm run build
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

**Advantages:**
- Production build is more memory-efficient
- No ts-node overhead

**Disadvantages:**
- Requires rebuild after every code change
- Not suitable for development

### Option 4: Use External Process
**Run Agent Mode in a separate Node process with its own memory:**

```typescript
// Fork a child process for Agent Mode
const { fork } = require('child_process');
const agentProcess = fork('agent-mode-worker.ts', [], {
  execArgv: ['--max-old-space-size=4096']
});
```

**Advantages:**
- Isolated memory
- Won't crash main server

**Disadvantages:**
- Complex IPC setup
- Significant refactoring required

---

## Immediate Workaround for User:

### Use Individual Tools Instead of Agent Mode

Build the recommendation manually using:

1. **Audience Browser** (`/audience-insights`)
   - Search: "basketball fans"
   - Search: "athletes"  
   - Search: "sneaker enthusiasts"

2. **Deal Search** (main page)
   - Search: "NBA"
   - Search: "sports"
   - Search: "basketball"

3. **Generate Personas** (sidebar)
   - Create 3 persona cards for each audience

4. **Market Sizing** (if available as standalone)
   - Calculate reach for audiences

5. **Compile into Report**
   - Export individual components
   - Combine manually in document

**Advantages:**
- Works immediately
- No memory issues
- More control over output

**Disadvantages:**
- Manual process
- Takes longer
- No automated report generation

---

## Recommended Next Steps:

1. **For User Right Now:**
   - Use individual tools to build recommendation
   - Save each component separately
   - Compile manually

2. **For Developer (Long-term Fix):**
   - Profile memory usage in commerce data loading
   - Implement streaming/chunking for large datasets
   - Add memory monitoring/alerting
   - Consider Redis or external cache for large datasets
   - Optimize parallel processing in Agent Mode

---

## Technical Details:

**Memory Crash Location:**
```
Reached heap limit during:
- RegExpPrototype.exec (extracting products from brief)
- Possibly in extraction helper methods with regex
```

**Heap Usage When Crashing:**
```
3917.0 MB → 4106.6 MB (approaching 4GB limit)
```

**GC Behavior:**
```
Mark-Compact taking 2250ms
Scavenge failing
"allocation failure; scavenge might not succeed"
```

This suggests the heap is fragmented and unable to allocate even small objects.

---

## Files Modified (that didn't solve the problem):

1. `/deal-library-backend/package.json` - Added NODE_OPTIONS
2. `/deal-library-backend/nodemon.json` - Added nodeArgs
3. `/deal-library-backend/src/services/agentModeService.ts` - Fast extraction (helps but not enough)

---

## Status: ❌ NOT RESOLVED

**Agent Mode still crashes due to memory limits.**

**User should use individual tools as workaround until memory optimization is implemented.**

---

**Created:** November 6, 2025  
**Last Updated:** November 6, 2025





