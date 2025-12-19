# AWS Amplify Environment Variable Setup for Deals API

## Critical Configuration

The deals API requires `GOOGLE_APPS_SCRIPT_URL` to be set in AWS Amplify.

## Step-by-Step Setup

### 1. Go to AWS Amplify Console
- Navigate to your app
- Click **App settings** → **Environment variables**

### 2. Add the Environment Variable

**Variable Name:** `GOOGLE_APPS_SCRIPT_URL`  
**Variable Value:** Your Google Apps Script web app URL

**Example:**
```
GOOGLE_APPS_SCRIPT_URL = https://script.google.com/macros/s/AKfycbzCMqE5D6lvyUn3U5vbm6XG8EZYDageIUIqN5NCUHx6mv51ob-sUwhvy-TYa_4J8Cv6/exec
```

### 3. Important Notes

✅ **DO use Environment Variables** (not Secrets)  
✅ **DO NOT add `NEXT_PUBLIC_` prefix** - this is server-side only  
✅ **DO redeploy** after adding/changing variables  
✅ **DO verify** the URL is correct and accessible

### 4. Optional: API Key Authentication

If your Apps Script requires authentication, also add:

**Variable Name:** `APPS_SCRIPT_SHARED_SECRET`  
**Variable Value:** Your API key/secret

## Verification

### Method 1: Debug Endpoint
After deploying, visit:
```
https://your-app.amplifyapp.com/api/deals/debug
```

This will show:
- Whether `GOOGLE_APPS_SCRIPT_URL` is set
- The length of the URL (without exposing the full URL)
- Configuration instructions

### Method 2: Check Browser Console
1. Open the deals page
2. Open browser DevTools → Console
3. Look for error messages that mention `GOOGLE_APPS_SCRIPT_URL`

### Method 3: Check Server Logs
In AWS Amplify:
1. Go to **App settings** → **Build settings**
2. Check build logs for environment variable warnings
3. Check runtime logs for API route errors

## Common Issues

### Issue: Variable not found
**Symptoms:** Error message says "GOOGLE_APPS_SCRIPT_URL not configured"

**Solutions:**
1. Verify variable name is exactly `GOOGLE_APPS_SCRIPT_URL` (case-sensitive)
2. Ensure it's in **Environment Variables**, not Secrets
3. Redeploy the app after adding the variable
4. Check that you're in the correct branch/environment

### Issue: Variable set but still not working
**Symptoms:** Variable appears in debug endpoint but deals don't load

**Solutions:**
1. Verify the Apps Script URL is correct
2. Test the URL directly in a browser - it should return JSON
3. Check that the Apps Script is deployed as a web app
4. Verify the Apps Script has proper permissions (should be "Anyone" can execute)
5. Check server logs for fetch errors

### Issue: CORS or Network Errors
**Symptoms:** Browser console shows CORS or network errors

**Solutions:**
1. Apps Script must be deployed with "Execute as: Me" and "Who has access: Anyone"
2. The Apps Script URL should be the web app URL, not the editor URL
3. Check that the Apps Script returns proper JSON with CORS headers

## Testing the Apps Script URL

Before adding to Amplify, test the URL:

```bash
curl "https://your-script-url/exec?action=deals"
```

Or visit in browser:
```
https://your-script-url/exec?action=deals
```

Both should return JSON data with deals.

## After Configuration

1. **Redeploy** your Amplify app
2. **Wait** for deployment to complete
3. **Test** the `/deals` page
4. **Check** `/api/deals/debug` if issues persist

## Need Help?

If deals still don't load after following these steps:
1. Check `/api/deals/debug` endpoint
2. Check browser console for errors
3. Check AWS Amplify build/runtime logs
4. Verify Apps Script URL is accessible and returns valid JSON


