# Chat Interface 504 Timeout Fix

## Issue
The chat interface is returning a 504 Gateway Timeout error:
```
/api/deals/search:1 Failed to load resource: the server responded with a status of 504
Search error: Error: Failed to search deals
```

## Root Cause
AWS Amplify serverless functions have timeout limits (typically 10-30 seconds). The Gemini API call was taking longer than this limit, causing the serverless function to timeout before returning a response.

**Specific Issues:**
1. No timeout wrapper in the API route - function could run until Amplify's limit
2. Sending all 552 deals to Gemini - too many deals to process quickly
3. Gemini's 60-second timeout is longer than Amplify's function timeout
4. No graceful fallback when timeout occurs

## Fixes Applied

### 1. API Route Timeout Wrapper
**File:** `deal-library-amplify-app/src/app/api/deals/search/route.ts`

- Added 25-second timeout wrapper (leaves buffer for Amplify's 30-second limit)
- Returns proper 504 error response before Amplify times out
- Includes helpful error message for users

### 2. Deal Pre-filtering
**File:** `deal-library-amplify-app/src/lib/controllers/dealsControllerWrapper.ts`

- Pre-filters deals to top 50 most relevant before sending to Gemini
- Uses keyword scoring to identify most relevant deals
- Reduces Gemini processing time significantly

### 3. Shorter Gemini Timeout
- Reduced Gemini timeout from 60 seconds to 20 seconds
- Ensures we can return a response before Amplify times out
- Falls back to keyword search if Gemini times out

### 4. Improved Fallback Logic
- Better keyword-based fallback when Gemini fails/times out
- Uses pre-filtered deals if available
- Provides helpful messages when no deals found

## Code Changes

### API Route (`/api/deals/search/route.ts`)
```typescript
const API_TIMEOUT_MS = 25000; // 25 seconds

// Race between search and timeout
const result = await Promise.race([
  controller.searchDealsAIDirect(body),
  timeoutPromise
]);
```

### Search Controller (`dealsControllerWrapper.ts`)
```typescript
// Pre-filter to top 50 deals
const MAX_DEALS_FOR_GEMINI = 50;
if (allDeals.length > MAX_DEALS_FOR_GEMINI) {
  // Score and filter deals by relevance
  dealsForGemini = scoredDeals.slice(0, MAX_DEALS_FOR_GEMINI);
}

// 20-second timeout for Gemini
const geminiTimeoutPromise = new Promise<never>((_, reject) => {
  setTimeout(() => reject(new Error('Gemini analysis timeout')), 20000);
});
```

## Expected Behavior After Fix

1. **Fast Response (< 25 seconds):**
   - Pre-filters deals to top 50
   - Sends to Gemini with 20-second timeout
   - Returns results quickly

2. **Timeout Handling:**
   - If Gemini times out (> 20 seconds), falls back to keyword search
   - Returns results within 25 seconds
   - No 504 errors from Amplify

3. **Error Responses:**
   - Returns proper JSON error response
   - Includes helpful user message
   - Frontend can handle the error gracefully

## Testing

After deployment, test:

1. **Normal Query:**
   - "show me deals for parents"
   - Should return within 20-25 seconds
   - Should show relevant deals

2. **Timeout Scenario:**
   - If Gemini is slow, should fall back to keyword search
   - Should still return within 25 seconds
   - Should not show 504 error

3. **Error Handling:**
   - Check browser console for proper error messages
   - Verify frontend handles 504 responses correctly

## Performance Improvements

- **Before:** 552 deals → Gemini → 60+ seconds → 504 timeout
- **After:** 552 deals → Pre-filter to 50 → Gemini (20s timeout) → Fallback if needed → Response in < 25s

## Related Files
- `deal-library-amplify-app/src/app/api/deals/search/route.ts` - API route with timeout
- `deal-library-amplify-app/src/lib/controllers/dealsControllerWrapper.ts` - Search logic with pre-filtering
- `deal-library-amplify-app/src/app/page.tsx` - Frontend timeout (already fixed)


