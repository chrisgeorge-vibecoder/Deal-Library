# AWS Amplify Secrets vs Environment Variables Conflict Fix

## The Problem

You've added the same keys to both **Secrets** and **Environment Variables** in AWS Amplify. This can cause conflicts and prevent your features from loading properly.

## Why This Is An Issue

In AWS Amplify:
- **Secrets** are encrypted and automatically exposed as environment variables at runtime
- **Environment Variables** are plaintext and directly accessible
- If the same key exists in both places, there can be conflicts or unpredictable precedence
- This can cause `process.env.VARIABLE_NAME` to return `undefined` or an incorrect value

## The Solution

### Step 1: Identify Which Variables Should Be Secrets vs Environment Variables

**Keep ONLY in Secrets (Remove from Environment Variables):**
- `RESEND_API_KEY` - Email service API key
- `GEMINI_API_KEY` - Google Gemini AI API key
- `SUPABASE_URL` - Supabase project URL (sensitive)
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (highly sensitive)
- `GOOGLE_APPS_SCRIPT_URL` - Can be a secret if it contains sensitive data
- `APPS_SCRIPT_SHARED_SECRET` - Shared secret for Apps Script
- `GOOGLE_SHEETS_API_KEY` - Google Sheets API key (if used)

**Keep ONLY in Environment Variables (Remove from Secrets):**
- `NEXT_PUBLIC_API_URL` - Public URL (not sensitive)
- `NEXT_PUBLIC_READ_ONLY` - Public flag (not sensitive)
- `USE_SUPABASE` - Feature flag (not sensitive)
- `NODE_ENV` - Node environment (usually auto-set)
- `CORS_ORIGIN` - CORS configuration (if used)

### Step 2: Clean Up AWS Amplify Configuration

1. **Go to AWS Amplify Console**
   - Navigate to your app
   - Go to **App settings** → **Environment variables**

2. **Remove Duplicates from Environment Variables**
   - Look for any keys that are ALSO in Secrets
   - Delete them from Environment Variables section
   - Keep only non-sensitive configuration values

3. **Verify Secrets Are Set**
   - Click **Manage secrets**
   - Ensure all sensitive keys are listed here
   - If missing, add them here (NOT in Environment Variables)

### Step 3: Recommended Configuration

**In Secrets (Manage secrets section):**
```
RESEND_API_KEY = re_xxxxx
GEMINI_API_KEY = AIzaSyxxxxx
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY = eyJxxxxx
GOOGLE_APPS_SCRIPT_URL = https://script.google.com/...
APPS_SCRIPT_SHARED_SECRET = your_secret_here (if used)
```

**In Environment Variables (NOT in Secrets):**
```
NEXT_PUBLIC_API_URL = https://your-backend-url.com
NEXT_PUBLIC_READ_ONLY = false
USE_SUPABASE = true
```

### Step 4: How AWS Amplify Secrets Work

✅ **Good News:** Your code doesn't need to change!

AWS Amplify automatically exposes Secrets as environment variables at runtime. So when your code does:
```javascript
const apiKey = process.env.RESEND_API_KEY;
```

It will work correctly if `RESEND_API_KEY` is set in Secrets (even if not in Environment Variables).

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

## Quick Checklist

- [ ] Remove `RESEND_API_KEY` from Environment Variables (keep only in Secrets)
- [ ] Remove `GEMINI_API_KEY` from Environment Variables (keep only in Secrets)
- [ ] Remove `SUPABASE_URL` from Environment Variables (keep only in Secrets)
- [ ] Remove `SUPABASE_ANON_KEY` from Environment Variables (keep only in Secrets)
- [ ] Remove `SUPABASE_SERVICE_ROLE_KEY` from Environment Variables (keep only in Secrets)
- [ ] Keep `NEXT_PUBLIC_API_URL` in Environment Variables only
- [ ] Keep `USE_SUPABASE` in Environment Variables only
- [ ] Verify all secrets are present in the Secrets section
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

**The Rule: One Variable = One Place**

- Sensitive data (API keys, tokens, secrets) → **Secrets only**
- Public configuration (URLs, flags) → **Environment Variables only**
- Never store the same key in both places

After removing duplicates and redeploying, your features should work correctly.

