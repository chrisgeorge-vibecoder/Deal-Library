# Quick Fix: GOOGLE_APPS_SCRIPT_URL Error

## The Error

```
Failed to load deals: GOOGLE_APPS_SCRIPT_URL environment variable is required to fetch real deals
```

## The Problem

For Next.js applications on AWS Amplify, environment variables used in API routes **must** be in the **Environment Variables** section (not Secrets) to be accessible via `process.env` at runtime.

## The Fix (5 Steps)

### 1. Go to AWS Amplify Console
- Navigate to your app
- Go to **App settings** → **Environment variables**

### 2. Check Environment Variables Section
- Look for `GOOGLE_APPS_SCRIPT_URL` in the Environment Variables list
- **If it's NOT there**, proceed to step 3
- **If it IS there**, skip to step 4

### 3. Add to Environment Variables
- Click **Add variable**
- **Key:** `GOOGLE_APPS_SCRIPT_URL`
- **Value:** Your Google Apps Script URL (e.g., `https://script.google.com/macros/s/.../exec`)
- Click **Save**

### 4. Remove from Secrets (if present)
- Click **Manage secrets**
- If `GOOGLE_APPS_SCRIPT_URL` appears in the secrets list, **delete it**
- This prevents conflicts

### 5. Redeploy
- In AWS Amplify Console, click **Redeploy this version** OR
- Push a new commit to trigger a new build
- Wait for deployment to complete

## Verify It's Working

After redeploying, test:
1. Visit your deployed app
2. Check if deals load correctly
3. If still not working, visit: `https://your-app.amplifyapp.com/api/deals/debug`
   - This will show if the variable is detected

## Why This Happens

AWS Amplify Secrets are designed for Lambda functions and may not be automatically available to Next.js API routes. For Next.js, use Environment Variables for all server-side variables accessed via `process.env`.

## Need Your Google Apps Script URL?

If you don't have it:
1. Open your Google Apps Script project
2. Click **Deploy** → **New deployment**
3. Select type: **Web app**
4. Copy the **Web app URL**
5. Use that URL as the value for `GOOGLE_APPS_SCRIPT_URL`

## Summary

✅ **Do:** Put `GOOGLE_APPS_SCRIPT_URL` in **Environment Variables**  
❌ **Don't:** Put it in Secrets (it won't work for Next.js API routes)  
🔄 **Then:** Redeploy your app

This should fix the error immediately after redeployment.

