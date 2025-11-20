# Backend URL Setup Guide

## Current Situation

Your backend is **not deployed yet**. It currently runs locally on `http://localhost:3002`.

**The Problem:**
- Your frontend is deployed to AWS Amplify
- The frontend tries to connect to the backend API
- `localhost:3002` won't work from a deployed frontend (localhost only works on your computer)

---

## Your Options

### Option 1: Deploy Backend to AWS Amplify (Recommended)

You can deploy your backend as a **separate AWS Amplify app**:

1. **Create a new Amplify app for the backend:**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select the `deal-library-backend` folder as the root

2. **Configure the build:**
   - Create `amplify.yml` in `deal-library-backend/`:
   ```yaml
   version: 1
   backend:
     phases:
       build:
         commands:
           - npm ci
           - npm run build
   ```
   
3. **Add environment variables:**
   - `GEMINI_API_KEY`
   - `GOOGLE_APPS_SCRIPT_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `USE_SUPABASE=true`
   - `PORT=3002`

4. **Get the backend URL:**
   - After deployment, AWS Amplify will give you a URL like:
   - `https://main.xxxxx.amplifyapp.com`
   - Or if you set up a custom domain: `https://api.yourdomain.com`

5. **Set frontend environment variable:**
   - In your **frontend** Amplify app
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.amplifyapp.com`

---

### Option 2: Deploy Backend to AWS Elastic Beanstalk

1. **Create Elastic Beanstalk application:**
   - Go to AWS Elastic Beanstalk Console
   - Create new application
   - Choose Node.js platform
   - Upload your backend code

2. **Configure environment:**
   - Add all required environment variables
   - Set PORT (Elastic Beanstalk will provide the URL)

3. **Get the backend URL:**
   - Elastic Beanstalk will give you a URL like:
   - `https://your-app.elasticbeanstalk.com`

4. **Set frontend environment variable:**
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-app.elasticbeanstalk.com`

---

### Option 3: Deploy Backend to AWS EC2

1. **Launch EC2 instance:**
   - Choose Ubuntu/Amazon Linux
   - Install Node.js
   - Clone your repository
   - Set up PM2 or systemd to run the backend

2. **Configure security group:**
   - Open port 3002 (or whatever port you use)
   - Allow HTTP/HTTPS traffic

3. **Get the backend URL:**
   - Use EC2 public IP or domain:
   - `http://your-ec2-ip:3002` or `https://api.yourdomain.com`

4. **Set frontend environment variable:**
   - Add: `NEXT_PUBLIC_API_URL` = `http://your-ec2-ip:3002`

---

### Option 4: Use a Different Backend Service

- **Railway:** https://railway.app
- **Render:** https://render.com
- **Fly.io:** https://fly.io
- **Heroku:** https://heroku.com

These services make it easy to deploy Node.js backends.

---

### Option 5: Leave It Unset (Temporary)

If you don't need backend features immediately:

1. **Don't set `NEXT_PUBLIC_API_URL`** in AWS Amplify
2. The frontend will default to `http://localhost:3002`
3. Backend-dependent features won't work, but the app will still build and deploy
4. You can add the backend URL later when you deploy it

**What won't work:**
- Campaign Planner (needs backend API)
- Market Insights (needs backend API)
- Any features that call the backend

**What will still work:**
- Static pages
- Email features (uses Resend directly)
- Any frontend-only features

---

## Recommended Next Steps

1. **For now:** Leave `NEXT_PUBLIC_API_URL` unset in AWS Amplify
2. **Later:** Deploy backend to AWS Amplify (Option 1) or another service
3. **Then:** Add `NEXT_PUBLIC_API_URL` with your backend URL

---

## How to Check If Backend Is Deployed

If you're not sure if your backend is deployed:

1. **Check AWS Amplify Console:**
   - Look for a separate app for the backend
   - Check the URL

2. **Check AWS Elastic Beanstalk:**
   - Look for any running applications

3. **Check AWS EC2:**
   - Look for running instances

4. **Test the URL:**
   - Try visiting: `https://your-backend-url/health`
   - If you get a response, the backend is deployed

---

## Current Default

Your frontend code currently defaults to:
```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
```

This means:
- If `NEXT_PUBLIC_API_URL` is not set → uses `localhost:3002` (won't work in production)
- If `NEXT_PUBLIC_API_URL` is set → uses that URL

---

## Quick Answer

**Right now, you don't have a backend URL because the backend isn't deployed.**

**Options:**
1. **Deploy backend first** → Then set `NEXT_PUBLIC_API_URL` to that URL
2. **Leave it unset for now** → Deploy frontend without backend features
3. **Use a backend-as-a-service** → Deploy quickly to Railway/Render/etc.

Would you like help deploying the backend to AWS Amplify?

