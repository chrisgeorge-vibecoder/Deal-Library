# 🔍 DEBUGGING: GOOGLE_APPS_SCRIPT_URL Configuration

## Current Status
✅ **Environment variable IS set** (confirmed by `/api/deals/debug`)  
❌ **Deals page still shows "Loading deals..." but never loads**

## What We Know
- ✅ `GOOGLE_APPS_SCRIPT_URL` is configured in AWS Amplify
- ✅ Variable is accessible (hasAppsScriptUrl: true, length: 112)
- ❌ Deals are not loading - likely an issue with the Apps Script itself

## Next Steps: Debug the Apps Script Connection

Since the environment variable is set, the issue is likely with the Apps Script itself. Let's diagnose:

### Step 1: Test the Apps Script URL Directly

Open this URL in your browser:
```
https://script.google.com/macros/s/AKfycbzCMqE5D6lvyUn3U5vbm6XG8EZYDageIUIqN5NCUHx6mv51ob-sUwhvy-TYa_4J8Cv6/exec?action=deals
```

**Expected:** Should return JSON data with deals array  
**If you see an error:** The Apps Script needs to be fixed or redeployed

### Step 2: Test with Health Check

Test the health endpoint:
```
https://script.google.com/macros/s/AKfycbzCMqE5D6lvyUn3U5vbm6XG8EZYDageIUIqN5NCUHx6mv51ob-sUwhvy-TYa_4J8Cv6/exec?action=health
```

**Expected:** Should return `{"status":"OK",...}`  
**If this fails:** The Apps Script deployment may be broken

### Step 3: Check Browser Console

1. Open the deals page: https://main.d397i1d40lia7t.amplifyapp.com/deals
2. Open browser DevTools (F12) → Console tab
3. Look for error messages - they will show the exact issue

### Step 4: Check Network Tab

1. In DevTools → Network tab
2. Refresh the page
3. Look for `/api/deals` request
4. Click on it and check:
   - Response status (should be 200)
   - Response body (check if it has an `error` field)

### Step 5: Test Locally (Optional)

Run the test script:
```bash
cd /Users/cgeorge/Deal-Library
node test-apps-script-connection.js
```

This will test the Apps Script connection and show detailed error messages.

## Important Notes

✅ **Must be in Environment Variables** (NOT Secrets)  
✅ **No `NEXT_PUBLIC_` prefix** needed (server-side only)  
✅ **Must redeploy** after adding/changing  
✅ **Case-sensitive:** Exactly `GOOGLE_APPS_SCRIPT_URL`

## Common Issues & Solutions

### Issue 1: Apps Script Returns Empty Array
**Symptoms:** API returns `{"deals":[],"total":0}`

**Solutions:**
- Check your Google Sheet - make sure it has data
- Verify the sheet tab name matches in Apps Script code (default: "Always On Deals")
- Check Apps Script execution logs: Apps Script Editor → Executions

### Issue 2: Apps Script Returns Error
**Symptoms:** Browser console shows error from Apps Script

**Solutions:**
- Open Apps Script Editor (Extensions → Apps Script in your Google Sheet)
- Check for syntax errors in the code
- Review execution logs for runtime errors
- Redeploy the Apps Script as web app

### Issue 3: CORS or Network Error
**Symptoms:** Browser console shows CORS or fetch errors

**Solutions:**
- Verify Apps Script is deployed with:
  - Execute as: "Me"
  - Who has access: "Anyone"
- The deployment must be a "Web app", not "API Executable"

### Issue 4: Apps Script URL Changed
**Symptoms:** 404 errors or "script not found"

**Solutions:**
- If you redeployed the Apps Script, the URL may have changed
- Get the new deployment URL from Apps Script Editor → Deploy → Manage deployments
- Update `GOOGLE_APPS_SCRIPT_URL` in AWS Amplify with new URL
- Redeploy Amplify app

### Issue 5: Check AWS Amplify Logs
1. Go to AWS Amplify Console → Your App
2. Click on the latest build/deployment
3. Check "Runtime logs" for API route errors
4. Look for error messages from `/api/deals` route

## Reference

- Full setup guide: `AMPLIFY_ENV_VAR_SETUP.md`
- Quick fix guide: `QUICK_FIX_GOOGLE_APPS_SCRIPT_URL.md`

