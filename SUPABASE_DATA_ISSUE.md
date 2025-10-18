# Supabase Data Issue - Investigation Needed

## Problem

After enabling Supabase (`USE_SUPABASE=true`), the backend reports:
- **Census Data**: 0 records in Supabase (expected 38,551)
- **Commerce Segments**: Query timeout / 0 records visible (expected 4,214,534)
- **Audience Overlaps**: 7,562 records (expected 3,781 - seems we have duplicates from multiple migrations)

## What Happened

The migration script showed successful insertions:
```
✅ Census Data Migration Complete!
   Total: 41551
   Success: 38551
   Failed: 3000

✅ Commerce Audience Migration Complete!
   Total: 4,314,534
   Success: 4,214,534
   Failed: 100,000
```

But when querying Supabase, tables appear empty or return no data.

## Possible Causes

1. **Transaction Rollback**: Migrations might have been in a transaction that rolled back
2. **Row Level Security (RLS)**: Supabase RLS might be blocking queries
3. **API Key Permissions**: Anon key might not have read permissions
4. **Table Visibility**: Tables might exist but not be accessible to the anon key

## Investigation Steps

### Step 1: Check Supabase Dashboard

Go to: https://eibebfevxkskffepguya.supabase.co

Navigate to **Table Editor** and check:
- Does `census_data` table show 38,551 rows?
- Does `commerce_audience_segments` table show 4,214,534 rows?
- Does `audience_overlaps` table show 3,781 rows?

### Step 2: Check Row Level Security (RLS)

In Supabase Dashboard:
1. Go to **Authentication > Policies**
2. Check if RLS is enabled on tables
3. If enabled, check if there are policies allowing SELECT

**Likely Fix**: Run this in Supabase SQL Editor:
```sql
-- Disable RLS for now (we can add it later with proper policies)
ALTER TABLE census_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE commerce_audience_segments DISABLE ROW LEVEL SECURITY;
ALTER TABLE audience_overlaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_personas DISABLE ROW LEVEL SECURITY;
ALTER TABLE audience_reports_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE commerce_baseline DISABLE ROW LEVEL SECURITY;
```

### Step 3: Verify Table Permissions

Run in Supabase SQL Editor:
```sql
-- Check if data actually exists
SELECT COUNT(*) FROM census_data;
SELECT COUNT(*) FROM commerce_audience_segments;
SELECT COUNT(*) FROM audience_overlaps;

-- Check first few records
SELECT * FROM census_data LIMIT 5;
SELECT * FROM commerce_audience_segments LIMIT 5;
```

## Current Status

**Action Taken**: Reverted to CSV mode (`USE_SUPABASE=false`) for stability

**Backend Status**: Running normally with CSV data
- Census: 33,782 ZIP codes
- Commerce: 2,071,130 records
- All features working

**Next Steps**:
1. Investigate why Supabase tables appear empty
2. Check RLS settings in Supabase dashboard
3. Verify migration data persisted
4. Re-enable Supabase once data is confirmed accessible

## Workaround

The application is **fully functional in CSV mode**. Supabase is optional and can be enabled later once the data visibility issue is resolved.

**No impact to production deployment** - CSV mode works perfectly.

---

**Recommendation**: Check Supabase dashboard to see if data is there, then disable RLS if needed.

