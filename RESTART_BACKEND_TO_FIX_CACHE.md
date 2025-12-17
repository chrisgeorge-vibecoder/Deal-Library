# URGENT: Restart Backend to Fix Commerce Baseline Cache

**Date:** October 31, 2025  
**Status:** ⚠️ ACTION REQUIRED

---

## The Problem

You're still seeing commerce baseline references like:

**Camping & Hiking Example:**
> "Unlike the typical online shopper, our Camping & Hiking audience is notably less affluent, with a median income **13% below the commerce baseline**."

This is **old cached content** because:
1. ✅ We updated the prompts with explicit prohibitions
2. ✅ We changed the cache keys to force regeneration
3. ❌ **BUT the backend is still running the OLD code**

---

## The Solution: Restart the Backend

The backend needs to be restarted to load the new TypeScript code with updated cache keys.

### Option 1: Using the Demo Restart Script (Recommended)

```bash
cd /Users/cgeorge/Deal-Library
./restart-system.sh
```

### Option 2: Manual Restart

```bash
# Stop the backend
cd /Users/cgeorge/Deal-Library/deal-library-backend
pkill -f "node.*index.js" || pkill -f "ts-node.*index.ts"

# Rebuild and start
npm run build
npm start
```

### Option 3: If Using PM2

```bash
pm2 restart deal-library-backend
```

---

## What Will Happen After Restart

### ✅ New Cache Keys Active:
- Old: `executive_Camping & Hiking` → ❌ (ignored)
- New: `executive_v3_Camping & Hiking` → ✅ (fresh generation)

### ✅ New Prompts Active:
- Explicit FORBIDDEN PHRASES list
- "Let's better understand people in the market for [segment]" opening
- Only "vs national average" comparisons

### ✅ Expected Output (Camping & Hiking - Corrected):

**Before (WRONG - Old Cache):**
> "Unlike the typical online shopper, our Camping & Hiking audience is notably less affluent, with a median income **13% below the commerce baseline**."

**After (CORRECT - Fresh Generation):**
> "Let's better understand people in the market for Camping & Hiking. The combination of below-average household income (**-13% vs national average**) with family-focused suburban living (3.3 household size) suggests a budget-conscious segment that prioritizes practical value over premium gear. Their 55% cross-shopping overlap with Speakers, combined with 44% STEM education, reveals a tech-savvy group that researches extensively before purchases, indicating they respond to messaging around durability testing, feature comparisons, and long-term cost-per-use rather than brand prestige or aesthetic appeal."

---

## Quick Check: Is Backend Using New Code?

After restarting, generate ANY Audience Insights report and check:

### ✅ Signs the restart worked:
1. Opening line starts with "Let's better understand people in the market for..."
2. All comparisons say "vs national average" or "vs US national average"
3. NO mentions of "commerce baseline"
4. NO mentions of "typical online shopper"

### ❌ Signs you need to restart again:
1. Still seeing "Unlike the typical online shopper"
2. Still seeing "commerce baseline"
3. Doesn't start with "Let's better understand..."

---

## Why This Happened

**In-Memory Cache:**
- The AI response cache (`aiResponseCache`) is stored in memory
- It persists as long as the Node.js process is running
- Old cached responses stay in memory until the process restarts

**Code Changes Need Server Restart:**
- Our TypeScript changes updated the cache keys
- But the running server is executing the OLD compiled JavaScript
- Restart = load NEW compiled JavaScript = NEW cache keys = fresh generation

---

## Files We Modified (Now Need to Load)

**File:** `/deal-library-backend/src/services/audienceInsightsService.ts`

**Changes That Need to Load:**
1. Line 2018: Cache key changed to `persona_v2_${segment}_${category}`
2. Line 2421: Cache key changed to `executive_v3_${segment}`
3. Lines 2438-2450: Added FORBIDDEN PHRASES section
4. Lines 2461-2467: Added BAD EXAMPLE showing commerce baseline usage
5. Lines 2037-2047: Added FORBIDDEN PHRASES to persona prompt

---

## After Restart: Test These Segments

Generate reports for these segments to verify the fix:

1. **Food Storage** (showed "19.2% lower than the Commerce Baseline")
2. **Camping & Hiking** (showed "13% below the commerce baseline")
3. **Hairdressing & Cosmetology** (showed "17.2% below the commerce baseline")

All should now say "vs national average" instead.

---

## Summary

| Step | Status |
|------|--------|
| 1. Updated prompts with prohibitions | ✅ Done |
| 2. Changed cache keys | ✅ Done |
| 3. **Restart backend** | ⚠️ **NEEDS TO BE DONE** |
| 4. Verify output | ⏳ After restart |

**Next Action:** Restart the backend server using one of the methods above.









