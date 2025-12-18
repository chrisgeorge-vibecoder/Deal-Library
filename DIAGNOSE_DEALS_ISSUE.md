# Diagnose Deals Loading Issue

After redeployment, deals are still not loading. Let's diagnose the issue step by step.

## Step 1: Check the Test Endpoint

Visit this URL to run comprehensive diagnostics:
```
https://main.d397i1d40lia7t.amplifyapp.com/api/deals/diagnose
```

Note: Changed from `/api/deals/test` to `/api/deals/diagnose` to avoid conflict with dynamic route `/api/deals/[id]`

This will test:
1. ✅ Environment variable is set
2. ✅ AppsScriptService initialization
3. ✅ Health endpoint connection
4. ✅ Fetching deals from Apps Script

**What to look for:**
- If step 1 fails: Environment variable not accessible at runtime
- If step 2 fails: Service initialization issue
- If step 3 fails: Apps Script connection issue
- If step 4 fails: Apps Script returning error or empty data

## Step 2: Check Debug Endpoint

Verify environment variable is still set:
```
https://main.d397i1d40lia7t.amplifyapp.com/api/deals/debug
```

Should show `hasAppsScriptUrl: true`

## Step 3: Test Apps Script Directly

Open these URLs in your browser to test the Apps Script directly:

**Health Check:**
```
https://script.google.com/macros/s/AKfycbzCMqE5D6lvyUn3U5vbm6XG8EZYDageIUIqN5NCUHx6mv51ob-sUwhvy-TYa_4J8Cv6/exec?action=health
```

**Get Deals:**
```
https://script.google.com/macros/s/AKfycbzCMqE5D6lvyUn3U5vbm6XG8EZYDageIUIqN5NCUHx6mv51ob-sUwhvy-TYa_4J8Cv6/exec?action=deals
```

**Expected results:**
- Health: `{"status":"OK",...}`
- Deals: JSON array with deal objects

## Step 4: Check Browser Console

1. Open: https://main.d397i1d40lia7t.amplifyapp.com/deals
2. Press F12 → Console tab
3. Look for error messages
4. Common errors to check:
   - `❌ Error loading deals: ...`
   - `⚠️ No deals returned from API`
   - Network errors in Network tab

## Step 5: Check API Response Directly

Visit:
```
https://main.d397i1d40lia7t.amplifyapp.com/api/deals
```

Check the response:
- If it has `error` field: That's the actual error message
- If it has `deals: []`: Apps Script returned empty array or error was caught
- If it has `deals: [...]`: Success! Issue is in frontend rendering

## Step 6: Check AWS Amplify Runtime Logs

1. Go to AWS Amplify Console
2. Select your app
3. Click on the latest deployment
4. Click "Runtime logs" or "View logs"
5. Look for:
   - `🔍 AppsScriptService.getAllDeals called`
   - `❌ Error fetching deals`
   - `Apps Script error`
   - `HTTP error! status:`

## Common Issues & Solutions

### Issue: Environment Variable Not Accessible at Runtime
**Symptoms:** Test endpoint shows step 1 passed but getAllDeals fails
**Solution:** The variable might be in Secrets instead of Environment Variables, or needs redeploy

### Issue: Apps Script Connection Failed
**Symptoms:** Health check fails in test endpoint
**Solutions:**
- Check Apps Script is deployed as web app
- Verify URL is correct
- Check Apps Script execution logs in Google Apps Script editor

### Issue: Apps Script Returns Error
**Symptoms:** Test endpoint step 4 fails with Apps Script error
**Solutions:**
- Open Google Apps Script editor
- Check execution logs for errors
- Verify Google Sheet has data
- Check sheet tab name matches script configuration

### Issue: Apps Script Returns Empty Array
**Symptoms:** Test endpoint step 4 passes but dealCount is 0
**Solutions:**
- Check Google Sheet has data in "Always On Deals" tab
- Verify column headers match expected format
- Check Apps Script execution logs

### Issue: CORS/Network Error
**Symptoms:** Browser console shows CORS or fetch errors
**Solutions:**
- Verify Apps Script deployment settings:
  - Execute as: "Me"
  - Who has access: "Anyone"
- Ensure it's deployed as "Web app", not "API Executable"

## Next Steps

Based on what you find:

1. **If diagnose endpoint shows specific error:** Fix that issue
2. **If Apps Script URL doesn't work:** Fix Apps Script deployment
3. **If environment variable not accessible:** Check AWS Amplify configuration
4. **If deals are fetched but not displayed:** Check frontend console for rendering errors

