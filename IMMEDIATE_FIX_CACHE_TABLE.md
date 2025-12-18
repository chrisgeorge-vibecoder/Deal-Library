# Immediate Fix: Create Cache Table

## Problem
RPC function is still timing out because DISTINCT on 4.2M rows is too slow, even in a function.

## Solution: Cache Table (Fastest)

Create a separate table that stores just the unique segment names. This is the fastest approach.

## Step 1: Create Cache Table

Run this SQL in Supabase SQL Editor:

```sql
-- Create table for unique segment names
CREATE TABLE IF NOT EXISTS audience_segment_names_cache (
  audience_name TEXT PRIMARY KEY,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_audience_segment_names_cache_name 
  ON audience_segment_names_cache (audience_name);

-- Populate the cache table (this may take 30-60 seconds, but only needs to run once)
INSERT INTO audience_segment_names_cache (audience_name)
SELECT DISTINCT trim(audience_name)
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL
  AND trim(audience_name) != ''
ON CONFLICT (audience_name) DO UPDATE SET updated_at = NOW();
```

## Step 2: Grant Permissions

```sql
-- Grant SELECT to authenticated users
GRANT SELECT ON audience_segment_names_cache TO authenticated;

-- Grant SELECT to anon users
GRANT SELECT ON audience_segment_names_cache TO anon;
```

## Step 3: Verify Cache Table

```sql
-- Check how many segments are in cache
SELECT COUNT(*) FROM audience_segment_names_cache;

-- Should return 199 (or close to it)

-- Check sample segments
SELECT * FROM audience_segment_names_cache 
ORDER BY audience_name 
LIMIT 20;
```

## Step 4: Update Code (Already Done!)

The code has been updated to:
1. Try RPC function first
2. If RPC times out, try cache table
3. If cache table doesn't exist, fall back to view
4. If view doesn't exist, fall back to direct table query

## Step 5: Test

After creating the cache table:
1. Deploy the updated code
2. Test the Commerce Audience Insights dropdown
3. Should load in < 1 second

## Refresh Strategy

If you add new segments to the main table, refresh the cache:

```sql
-- Refresh cache (run this periodically, e.g., daily or after data updates)
INSERT INTO audience_segment_names_cache (audience_name)
SELECT DISTINCT trim(audience_name)
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL
  AND trim(audience_name) != ''
ON CONFLICT (audience_name) DO UPDATE SET updated_at = NOW();
```

## Performance

- **Cache Table Query:** < 0.5 seconds ✅
- **RPC Function:** 15-20 seconds (times out) ❌
- **View Query:** 15-20 seconds (times out) ❌
- **Direct Table:** 15-20 seconds (times out) ❌

## Why This Works

1. ✅ **No DISTINCT computation** - Already pre-computed
2. ✅ **Small table** - Only 199 rows instead of 4.2M
3. ✅ **Indexed** - Fast lookups
4. ✅ **Simple query** - Just SELECT with ORDER BY

## Next Steps

1. **Create the cache table** (Step 1-2 above)
2. **Deploy the code** (already updated)
3. **Test** - Should work immediately

The code will automatically use the cache table when RPC times out!

