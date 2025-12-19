# Troubleshooting: GOOGLE_APPS_SCRIPT_URL Not Available at Runtime

## Current Issue

Even after adding `GOOGLE_APPS_SCRIPT_URL` to Environment Variables and removing from Secrets, the error persists:
```
Failed to load deals: GOOGLE_APPS_SCRIPT_URL environment variable is required to fetch real deals
```

## Debug Steps

### Step 1: Check Debug Endpoint

Visit your deployed app's debug endpoint:
```
https://your-app.amplifyapp.com/api/deals/debug
```

This will show:
- `hasAppsScriptUrl: true/false` - Whether the variable is detected
- `appsScriptUrlLength: 0` - Length of the URL (without exposing it)
- Environment information

**If `hasAppsScriptUrl: false`**, the variable is not being passed to the runtime.

### Step 2: Verify Variable Name in Amplify Console

1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Environment variables**
4. **Verify exact spelling:** `GOOGLE_APPS_SCRIPT_URL`
   - Must be all uppercase
   - Must use underscores, not hyphens
   - Must match exactly: `GOOGLE_APPS_SCRIPT_URL` (not `GOOGLE_APPS_SCRIPT` or `Google_Apps_Script_URL`)

### Step 3: Check Which Branch/Environment

1. In Amplify Console, check which branch you're viewing
2. Ensure the variable is set for the **same branch** you're deploying
3. If using different branches, set the variable for each branch/environment

### Step 4: Verify Variable Value

1. In Environment Variables, click on `GOOGLE_APPS_SCRIPT_URL`
2. Verify it has a value (not empty)
3. Ensure there are no extra spaces or quotes
4. The value should look like: `https://script.google.com/macros/s/XXXXX/exec`

### Step 5: Check Build Logs

1. Go to AWS Amplify Console → Your app → Build history
2. Open the latest build
3. Check the build logs for:
   - Any errors about environment variables
   - The echo statements showing if `GOOGLE_APPS_SCRIPT_URL` is SET or NOT SET

## Common Issues and Solutions

### Issue 1: Variable in Wrong Branch/Environment

**Solution:** 
- Set the variable for the specific branch you're deploying
- Or set it for "All branches" if you want it everywhere

### Issue 2: Variable Name Mismatch

**Solution:**
- The code uses `GOOGLE_APPS_SCRIPT_URL` (exact casing)
- Ensure the variable name matches exactly in Amplify Console

### Issue 3: Variable Set After Deployment

**Solution:**
- You must **redeploy** after adding/changing environment variables
- Go to Amplify Console → Your app → Click "Redeploy this version" OR
- Push a new commit to trigger a new build

### Issue 4: AWS Amplify Compute Runtime Not Passing Variables

For Next.js standalone builds on AWS Amplify, environment variables should automatically be available. However, if they're not:

**Workaround 1: Verify in Amplify Console UI**
- Ensure the variable appears in the Environment Variables list
- Try removing and re-adding it

**Workaround 2: Check Amplify Console → App settings → Build settings**
- Verify the build configuration is correct
- Check if there are any custom build settings overriding environment variables

## Testing the Fix

After making changes:

1. **Redeploy the app**
2. **Wait for deployment to complete**
3. **Visit:** `https://your-app.amplifyapp.com/api/deals/debug`
4. **Check if `hasAppsScriptUrl: true`**
5. **Test the deals page** - it should load deals now

## Still Not Working?

If after all these steps it still doesn't work:

1. **Check CloudWatch Logs:**
   - AWS Amplify Console → Your app → Monitoring → View logs
   - Look for error messages about environment variables

2. **Verify Next.js Configuration:**
   - Ensure `next.config.js` doesn't have any environment variable filtering
   - Check that `output: 'standalone'` is set correctly

3. **Try Alternative:**
   - Some users have success by setting variables at the **branch level** instead of app level
   - Or try setting them for "All branches" to ensure they're available

4. **Contact AWS Support:**
   - If environment variables are set correctly but still not available, this might be an AWS Amplify platform issue

## Quick Verification Checklist

- [ ] Variable name is exactly `GOOGLE_APPS_SCRIPT_URL` (all caps, underscores)
- [ ] Variable has a value (not empty)
- [ ] Variable is set for the correct branch/environment
- [ ] App has been redeployed after setting the variable
- [ ] Debug endpoint shows `hasAppsScriptUrl: true`
- [ ] Build logs show the variable is SET (not NOT SET)




