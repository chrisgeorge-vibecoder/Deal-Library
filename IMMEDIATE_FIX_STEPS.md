# Immediate Fix Steps for GOOGLE_APPS_SCRIPT_URL

## Step 1: Check the Debug Endpoint (DO THIS FIRST)

Visit your deployed app:
```
https://your-app.amplifyapp.com/api/deals/debug
```

Look for:
- `hasAppsScriptUrl: true` = Variable is detected ✅
- `hasAppsScriptUrl: false` = Variable is NOT detected ❌

## Step 2: If Variable is NOT Detected

### A. Verify Exact Variable Name in Amplify Console

1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Look for the variable - the name must be **EXACTLY**:
   ```
   GOOGLE_APPS_SCRIPT_URL
   ```
   
   **Common mistakes:**
   - ❌ `Google_Apps_Script_URL` (wrong casing)
   - ❌ `GOOGLE_APPS_SCRIPT` (missing _URL)
   - ❌ `GOOGLE-APPS-SCRIPT-URL` (using hyphens instead of underscores)
   - ✅ `GOOGLE_APPS_SCRIPT_URL` (correct)

### B. Verify Variable is Set for Your Branch

1. In the Environment Variables section, check which branch/environment it's set for
2. Ensure it's set for the **same branch** you're deploying
3. If unsure, set it for **"All branches"**

### C. Verify Variable Has a Value

1. Click on `GOOGLE_APPS_SCRIPT_URL` in the list
2. Ensure it has a value (not empty)
3. The value should start with `https://script.google.com/macros/s/`
4. Ensure there are no extra spaces or quotes around the value

### D. Remove and Re-add the Variable

Sometimes Amplify needs you to refresh the variable:

1. **Delete** `GOOGLE_APPS_SCRIPT_URL` from Environment Variables
2. **Save** the changes
3. **Add it back** with the exact name: `GOOGLE_APPS_SCRIPT_URL`
4. **Paste your URL** as the value
5. **Save** again

### E. Redeploy (CRITICAL)

After making any changes:

1. Go to AWS Amplify Console → Your app
2. Click **"Redeploy this version"** (or push a new commit)
3. Wait for deployment to complete
4. Check the build logs - you should see:
   ```
   GOOGLE_APPS_SCRIPT_URL is SET (length: XX)
   ```

## Step 3: Verify After Redeployment

1. Visit: `https://your-app.amplifyapp.com/api/deals/debug`
2. Check if `hasAppsScriptUrl: true`
3. If yes, test the deals page - it should work now!

## Step 4: If Still Not Working

### Check Build Logs

1. AWS Amplify Console → Your app → Build history
2. Open the latest build
3. Look for the line:
   ```
   GOOGLE_APPS_SCRIPT_URL is SET (length: XX)
   ```
   
   If it says "NOT SET", the variable is not configured correctly in Amplify Console.

### Alternative: Set at Branch Level

1. In Amplify Console, go to your branch settings
2. Set the environment variable at the **branch level** instead of app level
3. Redeploy

### Last Resort: Check Variable in Different Location

Try setting it in:
1. **App settings** → **Environment variables** (app level)
2. **Branch settings** → **Environment variables** (branch level)
3. Set for **"All branches"** to ensure it's available

## Quick Checklist

Before contacting support, verify:

- [ ] Variable name is exactly `GOOGLE_APPS_SCRIPT_URL` (check spelling, casing, underscores)
- [ ] Variable has a non-empty value
- [ ] Variable is set for the correct branch/environment
- [ ] Variable is NOT in Secrets (only in Environment Variables)
- [ ] App has been redeployed after setting the variable
- [ ] Build logs show "GOOGLE_APPS_SCRIPT_URL is SET"
- [ ] Debug endpoint shows `hasAppsScriptUrl: true`

## Why This Should Work

For AWS Amplify compute resources with Next.js standalone:
- Environment Variables are automatically available via `process.env` at runtime
- No code changes needed
- No special configuration needed (unless there's a platform issue)

If the variable is set correctly in Amplify Console and you've redeployed, it should work.

