# AWS Amplify Secrets vs Environment Variables Conflict Fix

## The Problem

You've added the same keys to both **Secrets** and **Environment Variables** in AWS Amplify. This can cause conflicts and prevent your features from loading properly.

## Why This Is An Issue

In AWS Amplify:
- **Secrets** are encrypted and automatically exposed as environment variables at runtime
- **Environment Variables** are plaintext and directly accessible
- If the same key exists in both places, there can be conflicts or unpredictable precedence
- This can cause `process.env.VARIABLE_NAME` to return `undefined` or an incorrect value

## ⚠️ IMPORTANT CORRECTION FOR NEXT.JS

**For Next.js applications on AWS Amplify:**
- Next.js API routes (server-side) **MUST** use **Environment Variables** (not Secrets) to access `process.env` variables at runtime
- Secrets in AWS Amplify are primarily designed for Lambda functions and may not be automatically available to Next.js API routes
- If a variable is needed in Next.js API routes, it **must** be in Environment Variables

## The Solution

### Step 1: Identify Which Variables Should Be Secrets vs Environment Variables

**⚠️ CRITICAL: For Next.js Server-Side Variables (used in API routes), use Environment Variables:**

**Keep in Environment Variables (Required for Next.js API routes):**
- `RESEND_API_KEY` - Email service API key (used in `/api/send-cart-email`, `/api/send-custom-deal-request`)
- `GOOGLE_APPS_SCRIPT_URL` - Google Apps Script URL (used in `/api/deals` route) ⚠️ **REQUIRED**
- `GEMINI_API_KEY` - Google Gemini AI API key (used in API routes)
- `SUPABASE_URL` - Supabase project URL (used in API routes)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (used in API routes)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (used in API routes)
- `APPS_SCRIPT_SHARED_SECRET` - Shared secret for Apps Script (if used)
- `USE_SUPABASE` - Feature flag
- `NEXT_PUBLIC_API_URL` - Public URL (accessible to browser)
- `NEXT_PUBLIC_READ_ONLY` - Public flag (accessible to browser)

**DO NOT use Secrets for Next.js API routes** - They may not be accessible via `process.env` at runtime.

**Note:** While Environment Variables are visible in build logs, AWS Amplify encrypts them at rest. For Next.js, this is the practical approach since Secrets aren't guaranteed to work for Next.js API routes.

### Step 2: Clean Up AWS Amplify Configuration

1. **Go to AWS Amplify Console**
   - Navigate to your app
   - Go to **App settings** → **Environment variables**

2. **For Next.js: Move Variables from Secrets to Environment Variables**
   - If you have variables in Secrets that are needed by Next.js API routes, they should be in Environment Variables instead
   - Click **Manage secrets** and note which variables are there
   - Remove them from Secrets
   - Add them to Environment Variables section

3. **Verify All Required Variables Are in Environment Variables**
   - Check that `GOOGLE_APPS_SCRIPT_URL` is in Environment Variables (not Secrets)
   - Verify `RESEND_API_KEY` is in Environment Variables if you use email features
   - Ensure all API keys used in API routes are in Environment Variables

### Step 3: Recommended Configuration for Next.js

**⚠️ For Next.js on AWS Amplify, use Environment Variables section:**

**In Environment Variables (App settings → Environment variables):**
```
# Server-side API route variables (required for Next.js API routes)
RESEND_API_KEY = re_xxxxx
GOOGLE_APPS_SCRIPT_URL = https://script.google.com/... (REQUIRED for deals)
GEMINI_API_KEY = AIzaSyxxxxx
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY = eyJxxxxx
APPS_SCRIPT_SHARED_SECRET = your_secret_here (if used)
USE_SUPABASE = true

# Client-side variables (accessible to browser)
NEXT_PUBLIC_API_URL = https://your-backend-url.com
NEXT_PUBLIC_READ_ONLY = false
```

**DO NOT use Secrets for Next.js** - They may not be accessible to API routes at runtime.

### Step 4: How AWS Amplify Environment Variables Work for Next.js

✅ **Important for Next.js:**

For Next.js API routes, environment variables must be in the **Environment Variables** section (not Secrets) to be accessible via `process.env` at runtime.

Your code doesn't need to change - just ensure variables are in the correct section:
```javascript
// This will work if GOOGLE_APPS_SCRIPT_URL is in Environment Variables
const url = process.env.GOOGLE_APPS_SCRIPT_URL;
```

**Why not Secrets?** AWS Amplify Secrets are designed for Lambda functions and other AWS services. They may not be automatically exposed to Next.js API routes at runtime, which is why you're seeing the error.

### Step 5: Redeploy Your Application

After cleaning up the duplicates:

1. **Trigger a new deployment:**
   - In AWS Amplify Console
   - Click **Redeploy this version** OR
   - Push a new commit to trigger a new build

2. **Monitor the build logs:**
   - Check for any warnings about environment variables
   - Verify the build completes successfully

3. **Test your features:**
   - Test email features (uses `RESEND_API_KEY`)
   - Test AI features (uses `GEMINI_API_KEY`)
   - Test Supabase features (uses `SUPABASE_*` keys)
   - Verify all previously broken features now work

## Quick Checklist for Next.js

- [ ] **Add `GOOGLE_APPS_SCRIPT_URL` to Environment Variables** (REQUIRED - this fixes your current error)
- [ ] Remove `GOOGLE_APPS_SCRIPT_URL` from Secrets (if present)
- [ ] Ensure `RESEND_API_KEY` is in Environment Variables (not Secrets)
- [ ] Ensure `GEMINI_API_KEY` is in Environment Variables (not Secrets)
- [ ] Ensure `SUPABASE_URL` is in Environment Variables (not Secrets)
- [ ] Ensure `SUPABASE_ANON_KEY` is in Environment Variables (not Secrets)
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is in Environment Variables (not Secrets)
- [ ] Keep `NEXT_PUBLIC_API_URL` in Environment Variables
- [ ] Keep `USE_SUPABASE` in Environment Variables
- [ ] **Remove duplicates** - if a variable exists in both Secrets and Environment Variables, remove it from Secrets
- [ ] Redeploy the application
- [ ] Test all features that were previously broken

## Why This Happens

Many developers add variables to Environment Variables first (easier to see/edit), then also add them to Secrets "just to be safe." However, AWS Amplify's Secrets management is designed to be the single source of truth for sensitive data.

## Additional Notes

- **Never store secrets in Environment Variables** - They're visible in build logs and artifacts
- **Secrets are automatically encrypted** by AWS Amplify
- **Secrets are exposed as `process.env.VARIABLE_NAME`** at runtime automatically
- **No code changes needed** - Your existing `process.env` access will work once duplicates are removed

## Troubleshooting

### If features still don't work after cleanup:

1. **Check build logs** for any environment variable warnings
2. **Verify secret names** match exactly (case-sensitive)
3. **Ensure secrets have values** - empty secrets won't work
4. **Check runtime logs** in CloudWatch to see if `process.env` variables are undefined
5. **Verify the deployment completed** - incomplete deployments may not have the latest config

### If you're unsure which section has the variable:

1. Remove it from Environment Variables
2. Add it to Secrets (if not already there)
3. Redeploy and test

### Common Error Messages:

- `process.env.RESEND_API_KEY is undefined` - Variable not in Secrets, or duplicate conflict
- `Email service is not configured` - `RESEND_API_KEY` missing or not accessible
- `Failed to set up process.env.secrets` - Secrets configuration issue

## Summary

**The Rule for Next.js on AWS Amplify: Use Environment Variables**

- **All variables needed by Next.js API routes** → **Environment Variables section**
- **Client-side variables (NEXT_PUBLIC_*)** → **Environment Variables section**
- **Never store the same key in both Secrets and Environment Variables** - remove from Secrets
- Secrets are not recommended for Next.js as they may not be accessible to API routes

**To Fix Your Current Error:**
1. Add `GOOGLE_APPS_SCRIPT_URL` to Environment Variables (if not already there)
2. Remove `GOOGLE_APPS_SCRIPT_URL` from Secrets (if it exists there)
3. Redeploy the application

After this, `process.env.GOOGLE_APPS_SCRIPT_URL` will be accessible in your API routes.

