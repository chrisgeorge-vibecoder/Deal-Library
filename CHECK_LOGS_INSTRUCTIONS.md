# Check AWS Amplify Runtime Logs

The error persists, but we need to see what's actually happening. Please check the AWS Amplify runtime logs:

## Steps to Check Logs

1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/
2. Select your app
3. Click on the latest deployment
4. Click "Runtime logs" or "View logs" tab
5. Look for logs that start with:
   - `🔍 getBaseUrl() called:`
   - `🔍 AppsScriptService.getAllDeals called`
   - `❌ GOOGLE_APPS_SCRIPT_URL is not set in process.env`

## What to Look For

The logs should show:
- Whether `getBaseUrl()` is being called
- What `hasUrl` value is (should be `true` if env var is available)
- What environment variables are actually available
- The exact error message

## Expected vs Actual

**Expected (if working):**
```
🔍 getBaseUrl() called: { hasUrl: true, urlLength: 112, ... }
🔍 AppsScriptService.getAllDeals called, baseUrl: https://script.google.com/macros/s/...
```

**Actual (if failing):**
```
🔍 getBaseUrl() called: { hasUrl: false, urlLength: 0, ... }
❌ GOOGLE_APPS_SCRIPT_URL is not set in process.env
```

This will tell us if the environment variable is available when `getBaseUrl()` is actually called from the `/api/deals` route.

