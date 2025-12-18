# Fix: GOOGLE_APPS_SCRIPT_URL Runtime Check

## Problem

The error `GOOGLE_APPS_SCRIPT_URL environment variable is required to fetch real deals` was occurring even though:
- ✅ The environment variable IS set in AWS Amplify
- ✅ The debug endpoint (`/api/deals/debug`) shows `hasAppsScriptUrl: true`
- ❌ But deals API still fails with "environment variable required" error

## Root Cause

The issue was a **singleton initialization timing problem**:

1. The `DealsController` uses a singleton pattern
2. The singleton is created once when the module first loads
3. `AppsScriptService` reads `GOOGLE_APPS_SCRIPT_URL` in its constructor
4. If the singleton was created before the environment variable was available (or in a different context), `baseUrl` would be set to `null`
5. Once set to `null`, it would never be checked again, even if the env var became available later

## Solution

Modified `AppsScriptService` to check the environment variable **at runtime** instead of only in the constructor:

1. Added a `getBaseUrl()` method that checks `process.env.GOOGLE_APPS_SCRIPT_URL` every time it's called
2. Updated all methods (`getAllDeals()`, `getDealById()`, `addDeal()`, etc.) to use `getBaseUrl()` instead of `this.baseUrl`
3. The method also updates the cached `this.baseUrl` value, so subsequent calls are efficient

## Changes Made

**File:** `deal-library-amplify-app/src/lib/services/appsScriptService.ts`

### Added Runtime Check Method

```typescript
private getBaseUrl(): string {
  // Check environment variable at runtime (not just constructor)
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;
  const sharedSecret = process.env.APPS_SCRIPT_SHARED_SECRET;
  
  if (!url) {
    this.baseUrl = null;
    return '';
  }
  
  // Build URL with shared secret if configured
  if (sharedSecret) {
    const hasQuery = url.includes('?');
    const fullUrl = `${url}${hasQuery ? '&' : '?'}api_key=${encodeURIComponent(sharedSecret)}`;
    this.baseUrl = fullUrl;
    return fullUrl;
  } else {
    this.baseUrl = url;
    return url;
  }
}
```

### Updated All Methods

All methods now call `getBaseUrl()` at runtime:

- `getAllDeals()`
- `getDealById()`
- `addDeal()`
- `updateDeal()`
- `submitCustomDealRequest()`
- `healthCheck()`

## Testing

After deploying this fix:

1. **Verify the environment variable is set:**
   - Visit: `https://main.d397i1d40lia7t.amplifyapp.com/api/deals/debug`
   - Should show `hasAppsScriptUrl: true`

2. **Test the deals API:**
   - Visit: `https://main.d397i1d40lia7t.amplifyapp.com/api/deals`
   - Should return deals data (or empty array if no deals, but no "environment variable required" error)

3. **Check browser console:**
   - Visit: `https://main.d397i1d40lia7t.amplifyapp.com/deals`
   - Should not show "GOOGLE_APPS_SCRIPT_URL environment variable is required" error

## Why This Works

- **Before:** Environment variable was only checked once during singleton initialization
- **After:** Environment variable is checked every time a method is called
- **Benefit:** Even if the singleton was created before env vars were available, it will now pick them up at runtime

## Deployment

1. Commit and push the changes
2. AWS Amplify will automatically rebuild and redeploy
3. No changes needed to environment variables (they're already set correctly)

## Related Files

- `deal-library-amplify-app/src/lib/services/appsScriptService.ts` - Fixed runtime check
- `deal-library-amplify-app/src/app/api/deals/route.ts` - Uses AppsScriptService
- `deal-library-amplify-app/src/app/api/deals/debug/route.ts` - Debug endpoint (already working)

