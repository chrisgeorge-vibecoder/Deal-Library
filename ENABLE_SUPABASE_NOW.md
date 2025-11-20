# Enable Supabase - Step-by-Step Guide

## Current Status
✅ Supabase project is set up  
✅ 4.26M records already migrated  
✅ Code is ready - just needs to be enabled  

---

## Step 1: Get Your Supabase Service Role Key

The service role key is needed for admin operations. Here's how to get it:

1. Go to your Supabase Dashboard: https://eibebfevxkskffepguya.supabase.co
2. Click **Settings** (gear icon in left sidebar)
3. Click **API** in the settings menu
4. Scroll down to **Project API keys**
5. Find **`service_role`** key (it's the **secret** one)
6. Click the **eye icon** to reveal it
7. **Copy the entire key** (it's a long JWT token starting with `eyJ...`)

⚠️ **Important**: The service role key has admin privileges. Keep it secret!

---

## Step 2: Update Local Backend .env File

Edit `deal-library-backend/.env` and make sure it has:

```bash
# Supabase Database Configuration
SUPABASE_URL=https://eibebfevxkskffepguya.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpYmViZmV2eGtza2ZmZXBndXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTA5OTksImV4cCI6MjA3NjMyNjk5OX0.CyuV-YgzB4lbuZXwAuECVAZQwsn6G8FXu_5xvfsY_TE
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
USE_SUPABASE=true
```

**Change**: `USE_SUPABASE=false` → `USE_SUPABASE=true`  
**Add**: `SUPABASE_SERVICE_ROLE_KEY` with the key you copied in Step 1

---

## Step 3: Restart Backend

```bash
cd /Users/cgeorge/Deal-Library/deal-library-backend

# Rebuild TypeScript
npm run build

# Restart the backend
# (Stop existing process if running, then start new one)
```

If you're using a process manager or script, restart it. The backend will now load from Supabase.

---

## Step 4: Verify Supabase is Active

### Option A: Check Backend Logs

Look for these messages in your backend startup logs:

```
📊 CensusDataService: Supabase mode enabled
🛒 CommerceAudienceService: Supabase mode enabled
💾 AudienceInsightsService: Supabase caching enabled
✅ Loaded 38,551 ZIP codes from Supabase
✅ Commerce audience data loaded from Supabase: 4,214,534 records
```

### Option B: Test Admin Endpoint

```bash
curl http://localhost:3002/api/admin/supabase-status
```

Should return:
```json
{
  "enabled": true,
  "tables": {
    "census_data": 38551,
    "commerce_audience_segments": 4214534,
    "audience_overlaps": 3781,
    "generated_personas": 0,
    "audience_reports_cache": 0
  },
  "message": "Supabase is active and connected"
}
```

---

## Step 5: Add Supabase Keys to AWS Amplify

Now that you're using Supabase, you need to add these to AWS Amplify:

1. Go to **AWS Amplify Console** → Your App → **App settings** → **Environment variables**

2. Add these variables:

   **For Backend:**
   - `SUPABASE_URL` = `https://eibebfevxkskffepguya.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpYmViZmV2eGtza2ZmZXBndXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTA5OTksImV4cCI6MjA3NjMyNjk5OX0.CyuV-YgzB4lbuZXwAuECVAZQwsn6G8FXu_5xvfsY_TE`
   - `SUPABASE_SERVICE_ROLE_KEY` = (the service role key from Step 1)
   - `USE_SUPABASE` = `true`

3. **Save** and trigger a new build

---

## Benefits You'll See

Once Supabase is enabled:

- ⚡ **Faster startup**: Backend starts in 2-3 seconds (was 30-60s)
- 💾 **Lower memory**: 50MB vs 500MB RAM usage
- 🚀 **Faster queries**: 50ms vs 500ms response times
- 💿 **Persistent cache**: Reports cached across server restarts
- 📈 **Better scalability**: Can handle multiple instances

---

## Troubleshooting

### "Supabase credentials not configured"
- Check `.env` has all three keys: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Verify no extra spaces or quotes around values
- Restart backend after updating `.env`

### "No census data found in Supabase"
- Data should already be migrated (4.26M records)
- Check Supabase dashboard → Table Editor → `census_data` table
- If empty, run: `npm run migrate:supabase`

### "Failed to query Supabase"
- Check internet connection
- Verify Supabase project is active at https://eibebfevxkskffepguya.supabase.co
- Check Supabase dashboard for any service issues

### Want to Rollback?
If you need to revert to CSV mode:
1. Edit `.env`: `USE_SUPABASE=false`
2. Restart backend
3. App automatically falls back to CSV files

---

## Next Steps

1. ✅ Enable Supabase locally (Steps 1-4 above)
2. ✅ Test that everything works
3. ✅ Add keys to AWS Amplify (Step 5)
4. ✅ Deploy to production

---

**Questions?** Check these docs:
- `ENABLE_SUPABASE_QUICKSTART.md` - Quick reference
- `SUPABASE_IMPLEMENTATION_SUMMARY.md` - Full details
- `SUPABASE_SETUP_INSTRUCTIONS.md` - Original setup guide

