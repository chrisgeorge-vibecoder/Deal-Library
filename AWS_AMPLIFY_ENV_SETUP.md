# AWS Amplify Environment Variables Setup Guide

## Current Status

Based on the build logs, you're seeing:
```
!Failed to set up process.env.secrets
```

This warning indicates that AWS Amplify Secrets are not properly configured. This won't block the build, but **will cause runtime errors** when features that require these variables are used.

---

## Required Environment Variables

### 1. **RESEND_API_KEY** (Required for Email Features)
**Location:** AWS Amplify → **Secrets** (not Environment Variables)

**Why Secrets?** This is a sensitive API key that should be encrypted.

**What it's used for:**
- Sending cart emails (`/api/send-cart-email`)
- Sending custom deal request emails (`/api/send-custom-deal-request`)

**What happens if missing:**
- ✅ Build will succeed
- ❌ Email features will fail at runtime
- ❌ Users will see "Failed to send email" errors

**How to get it:**
1. Go to [Resend.com](https://resend.com)
2. Sign in to your account
3. Navigate to [API Keys](https://resend.com/api-keys)
4. Click "Create API Key"
5. Copy the key (starts with `re_`)

**How to add in AWS Amplify:**
1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Click **Manage secrets**
5. Add: `RESEND_API_KEY` = `re_your_key_here`

---

### 2. **NEXT_PUBLIC_API_URL** (Optional but Recommended)
**Location:** AWS Amplify → **Environment Variables**

**Why Environment Variables?** This is a public URL, not sensitive.

**What it's used for:**
- Connecting frontend to backend API
- Used in: `campaign-planner/page.tsx`, `market-insights/page.tsx`

**Current default:** `http://localhost:3002` (won't work in production)

**What happens if missing:**
- ✅ Build will succeed
- ⚠️ Frontend will try to connect to `localhost:3002` (will fail)
- ⚠️ Backend-dependent features won't work

**What to set:**
- If backend is deployed: `https://your-backend-url.com`
- If backend is on AWS Amplify (separate app): Use that app's URL
- If backend is on EC2/Elastic Beanstalk: Use that URL

**How to add in AWS Amplify:**
1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`

---

### 3. **NEXT_PUBLIC_READ_ONLY** (Optional)
**Location:** AWS Amplify → **Environment Variables**

**What it's used for:**
- Disabling form submissions in read-only mode
- Used in: `CustomDealForm.tsx`

**What happens if missing:**
- ✅ Build will succeed
- ✅ App will work normally (defaults to `false`)

**How to add (if needed):**
1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Add: `NEXT_PUBLIC_READ_ONLY` = `false` (or leave unset)

---

## Setup Checklist

### Critical (Required for Email Features)
- [ ] Add `RESEND_API_KEY` to **Secrets** in AWS Amplify

### Recommended (Required for Backend Features)
- [ ] Add `NEXT_PUBLIC_API_URL` to **Environment Variables** in AWS Amplify
- [ ] Deploy backend separately and get its URL

### Optional
- [ ] Add `NEXT_PUBLIC_READ_ONLY` if you need read-only mode

---

## How to Add Variables in AWS Amplify

### For Secrets (Sensitive Data):
1. Go to AWS Amplify Console
2. Select your app → **App settings** → **Environment variables**
3. Click **Manage secrets** button
4. Click **Add secret**
5. Enter:
   - **Key:** `RESEND_API_KEY`
   - **Value:** Your Resend API key
6. Click **Save**

### For Environment Variables (Non-Sensitive):
1. Go to AWS Amplify Console
2. Select your app → **App settings** → **Environment variables**
3. Click **Add variable**
4. Enter:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** Your backend URL
5. Click **Save**

---

## Verification

After adding variables:
1. **Redeploy** your app (or wait for next deployment)
2. Check build logs - the warning should disappear
3. Test email features to ensure `RESEND_API_KEY` is working
4. Test backend connections to ensure `NEXT_PUBLIC_API_URL` is correct

---

## Troubleshooting

### "Failed to send email" errors
- **Cause:** `RESEND_API_KEY` is missing or incorrect
- **Fix:** Add it to Secrets in AWS Amplify

### Backend connection errors
- **Cause:** `NEXT_PUBLIC_API_URL` is missing or incorrect
- **Fix:** Add correct backend URL to Environment Variables

### Build succeeds but features don't work
- **Cause:** Environment variables not set or incorrect
- **Fix:** Check AWS Amplify Console → Environment Variables

---

## Notes

- **Secrets vs Environment Variables:**
  - Use **Secrets** for sensitive data (API keys, tokens)
  - Use **Environment Variables** for non-sensitive config (URLs, flags)
  
- **Next.js Environment Variables:**
  - Variables starting with `NEXT_PUBLIC_` are exposed to the browser
  - Server-side variables (like `RESEND_API_KEY`) are only available in API routes
  
- **Build vs Runtime:**
  - Missing variables won't block the build
  - Missing variables will cause runtime errors when features are used

