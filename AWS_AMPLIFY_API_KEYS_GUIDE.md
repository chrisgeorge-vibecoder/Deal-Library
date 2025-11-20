# AWS Amplify API Keys Setup Guide

This guide shows you how to find all your API keys and add them to AWS Amplify Secret Management.

## Required API Keys

### 1. **GEMINI_API_KEY** (Backend - Required)
**What it's for:** Google Gemini AI API for deal analysis and AI-powered features

**How to find it:**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" or go to [API Keys page](https://aistudio.google.com/app/apikey)
4. Click "Create API Key"
5. Copy the key (starts with `AIza...`)

**Add to AWS Amplify:**
- Variable name: `GEMINI_API_KEY`
- Value: Your API key from Google AI Studio

---

### 2. **GOOGLE_APPS_SCRIPT_URL** (Backend - Required for Production)
**What it's for:** Google Apps Script URL that provides deal data

**How to find it:**
1. Open your Google Apps Script project
2. Click "Deploy" → "New deployment"
3. Select type: "Web app"
4. Copy the "Web app URL" (looks like: `https://script.google.com/macros/s/AKfycbz.../exec`)

**Add to AWS Amplify:**
- Variable name: `GOOGLE_APPS_SCRIPT_URL`
- Value: Your Apps Script web app URL

**Note:** If you don't have this yet, see `deal-library-backend/GOOGLE_APPS_SCRIPT_SETUP.md` for setup instructions.

---

### 3. **RESEND_API_KEY** (Frontend - Required for Email Features)
**What it's for:** Resend email API for sending custom deal request emails and cart emails

**How to find it:**
1. Go to [Resend.com](https://resend.com)
2. Sign in to your account
3. Navigate to [API Keys](https://resend.com/api-keys)
4. Click "Create API Key"
5. Give it a name (e.g., "Deal Library")
6. Copy the key (starts with `re_`)

**Add to AWS Amplify:**
- Variable name: `RESEND_API_KEY`
- Value: Your Resend API key

---

## Required API Keys (Supabase)

### 4. **SUPABASE_URL** (Backend - Required)
**What it's for:** Supabase project URL for database caching and data storage

**How to find it:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to "Settings" → "API"
4. Copy the "Project URL" (looks like: `https://xxxxx.supabase.co`)

**Add to AWS Amplify:**
- Variable name: `SUPABASE_URL`
- Value: Your Supabase project URL

---

### 5. **SUPABASE_ANON_KEY** (Backend - Required)
**What it's for:** Supabase anonymous/public key for client-side access

**How to find it:**
1. In Supabase Dashboard → "Settings" → "API"
2. Copy the "anon public" key (long string starting with `eyJ...`)

**Add to AWS Amplify:**
- Variable name: `SUPABASE_ANON_KEY`
- Value: Your Supabase anon key

---

### 6. **SUPABASE_SERVICE_ROLE_KEY** (Backend - Required)
**What it's for:** Supabase service role key for server-side operations (has admin privileges)

**How to find it:**
1. In Supabase Dashboard → "Settings" → "API"
2. Copy the "service_role" key (long string starting with `eyJ...`)
3. ⚠️ **Keep this secret!** Never expose it in client-side code.

**Add to AWS Amplify:**
- Variable name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your Supabase service role key

---

### 7. **USE_SUPABASE** (Backend - Required)
**What it's for:** Enable Supabase features

**Value:**
- Set to `true` to use Supabase (recommended for production)

**Add to AWS Amplify:**
- Variable name: `USE_SUPABASE`
- Value: `true`

---

## How to Add Keys to AWS Amplify

### Step 1: Access AWS Amplify Console
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app
3. Go to **"App settings"** → **"Environment variables"**

### Step 2: Add Each Variable
1. Click **"Manage variables"** or **"Add variable"**
2. For each API key:
   - **Key:** Enter the variable name (e.g., `GEMINI_API_KEY`)
   - **Value:** Paste your API key
   - Click **"Save"**

### Step 3: Add Variables for Both Frontend and Backend

**For Backend (if deploying separately):**
- `GEMINI_API_KEY`
- `GOOGLE_APPS_SCRIPT_URL`
- `SUPABASE_URL` (required)
- `SUPABASE_ANON_KEY` (required)
- `SUPABASE_SERVICE_ROLE_KEY` (required)
- `USE_SUPABASE` (required - set to `true`)

**For Frontend (Next.js):**
- `RESEND_API_KEY`
- `NEXT_PUBLIC_API_URL` (if your backend is on a different domain)

### Step 4: Trigger a New Build
After adding variables, trigger a new build to apply the changes:
1. Go to your app in Amplify Console
2. Click **"Redeploy this version"** or push a new commit

---

## Finding Your Current Keys (If Already Set Locally)

If you already have these keys set up locally, you can find them in:

### Backend Keys:
```bash
# Check your local .env file
cat deal-library-backend/.env

# Or check environment variables
cd deal-library-backend
env | grep -E "GEMINI|GOOGLE_APPS|SUPABASE"
```

### Frontend Keys:
```bash
# Check your local .env.local file (may be protected)
cat deal-library-frontend/.env.local

# Note: .env.local files are git-ignored for security
```

---

## Quick Reference Checklist

Copy this checklist and check off each key as you add it:

- [ ] **GEMINI_API_KEY** - From [Google AI Studio](https://aistudio.google.com/app/apikey)
- [ ] **GOOGLE_APPS_SCRIPT_URL** - From your Google Apps Script deployment
- [ ] **RESEND_API_KEY** - From [Resend.com API Keys](https://resend.com/api-keys)
- [ ] **SUPABASE_URL** - From Supabase Dashboard → Settings → API (required)
- [ ] **SUPABASE_ANON_KEY** - From Supabase Dashboard → Settings → API (required)
- [ ] **SUPABASE_SERVICE_ROLE_KEY** - From Supabase Dashboard → Settings → API (required)
- [ ] **USE_SUPABASE** - Set to `true` (required)

---

## Security Notes

1. **Never commit API keys to Git** - They should only be in AWS Amplify environment variables
2. **Use different keys for production and development** if possible
3. **Rotate keys periodically** for security
4. **Service role keys** (like `SUPABASE_SERVICE_ROLE_KEY`) have admin access - keep them secret!

---

## Troubleshooting

### Keys Not Working?
1. Verify the key is correct (no extra spaces, quotes, or newlines)
2. Check that the variable name matches exactly (case-sensitive)
3. Ensure you've triggered a new build after adding variables
4. Check build logs in AWS Amplify for error messages

### Can't Find a Key?
- **GEMINI_API_KEY:** Create a new one at [Google AI Studio](https://aistudio.google.com/app/apikey)
- **RESEND_API_KEY:** Create a new one at [Resend.com](https://resend.com/api-keys)
- **GOOGLE_APPS_SCRIPT_URL:** See setup guide in `deal-library-backend/GOOGLE_APPS_SCRIPT_SETUP.md`
- **Supabase keys:** Check your Supabase project settings

---

## Need Help?

- **Backend environment variables:** See `deal-library-backend/ENVIRONMENT.md`
- **Resend setup:** See `deal-library-frontend/RESEND_SETUP.md`
- **Google Apps Script setup:** See `deal-library-backend/GOOGLE_APPS_SCRIPT_SETUP.md`
- **Supabase setup:** See `SUPABASE_SETUP_INSTRUCTIONS.md`

