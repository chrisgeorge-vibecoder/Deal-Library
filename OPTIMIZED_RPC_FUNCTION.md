# Optimized RPC Function (Faster Approach)

## Problem
The current RPC function is still timing out because DISTINCT on 4.2M rows is too slow, even in a function.

## Solution: Sample-Based RPC Function

Instead of computing DISTINCT on all rows, we'll:
1. Sample a subset of rows first
2. Then compute DISTINCT on the smaller set
3. This is much faster

## Step 1: Create Optimized RPC Function

Run this SQL in Supabase SQL Editor (REPLACE the existing function):

```sql
CREATE OR REPLACE FUNCTION get_audience_segment_names(limit_count INTEGER DEFAULT 500)
RETURNS TABLE(audience_name TEXT) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  -- Use a CTE to first sample rows, then get DISTINCT
  -- This is much faster than DISTINCT on all 4.2M rows
  WITH sampled_rows AS (
    SELECT DISTINCT trim(cas.audience_name)::TEXT AS audience_name
    FROM commerce_audience_segments cas
    WHERE cas.audience_name IS NOT NULL
      AND trim(cas.audience_name) != ''
    -- Sample first 50k rows for speed
    LIMIT 50000
  )
  SELECT DISTINCT sr.audience_name
  FROM sampled_rows sr
  ORDER BY sr.audience_name
  LIMIT limit_count;
END;
$$;
```

## Step 2: Alternative - Use Index Scan

If the above still times out, use this version that leverages the index:

```sql
CREATE OR REPLACE FUNCTION get_audience_segment_names(limit_count INTEGER DEFAULT 500)
RETURNS TABLE(audience_name TEXT) 
LANGUAGE sql
STABLE
AS $$
  -- Use the index we created for fast lookups
  SELECT DISTINCT trim(cas.audience_name)::TEXT
  FROM commerce_audience_segments cas
  WHERE cas.audience_name IS NOT NULL
    AND trim(cas.audience_name) != ''
    AND lower(trim(cas.audience_name)) IS NOT NULL
  ORDER BY lower(trim(cas.audience_name))
  LIMIT limit_count;
$$;
```

## Step 3: Best Solution - Materialized Table

Create a separate table that stores just unique segment names (updated periodically):

```sql
-- Create table for unique segment names
CREATE TABLE IF NOT EXISTS audience_segment_names_cache (
  audience_name TEXT PRIMARY KEY,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_audience_segment_names_cache_name 
  ON audience_segment_names_cache (audience_name);

-- Populate the cache table (run this once, then periodically)
INSERT INTO audience_segment_names_cache (audience_name)
SELECT DISTINCT trim(audience_name)
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL
  AND trim(audience_name) != ''
ON CONFLICT (audience_name) DO UPDATE SET updated_at = NOW();

-- Create RPC function that reads from cache table
CREATE OR REPLACE FUNCTION get_audience_segment_names(limit_count INTEGER DEFAULT 500)
RETURNS TABLE(audience_name TEXT) 
LANGUAGE sql
STABLE
AS $$
  SELECT asnc.audience_name
  FROM audience_segment_names_cache asnc
  ORDER BY asnc.audience_name
  LIMIT limit_count;
$$;
```

## Step 4: Update Code to Use Cache Table

If using the cache table approach, update code to query the table directly:

```typescript
// Query the cache table directly (fastest)
const { data, error } = await supabase
  .from('audience_segment_names_cache')
  .select('audience_name')
  .order('audience_name', { ascending: true })
  .limit(500);
```

## Performance Comparison

| Method | Expected Time | Status |
|--------|--------------|--------|
| Cache Table | < 0.5 seconds | ✅ Fastest |
| Optimized RPC (sampled) | < 2 seconds | ✅ Fast |
| Optimized RPC (index scan) | < 5 seconds | ⚠️ May still timeout |
| Current RPC (DISTINCT all) | 15-20 seconds | ❌ Times out |

## Recommended Approach

**Use the cache table approach** (Step 3):
1. ✅ Fastest (< 0.5 seconds)
2. ✅ No DISTINCT computation needed
3. ✅ Can be refreshed periodically
4. ✅ Simple query

## Refresh Strategy

Set up a scheduled job or trigger to refresh the cache:

```sql
-- Refresh cache (run this periodically, e.g., daily)
REFRESH MATERIALIZED VIEW IF EXISTS v_audience_segment_names_materialized;

-- Or for cache table:
INSERT INTO audience_segment_names_cache (audience_name)
SELECT DISTINCT trim(audience_name)
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL
  AND trim(audience_name) != ''
ON CONFLICT (audience_name) DO UPDATE SET updated_at = NOW();
```


