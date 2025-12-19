# Supabase RPC Function for ZIP Code Commerce Data Queries

## Problem
The current approach of using `.in()` with batches of ZIP codes is still timing out, even with aggressive optimizations (25 ZIPs per batch, 8 batches max, 10 second timeout).

## Solution: Postgres RPC Function

Create a Postgres function that efficiently queries commerce data for specific ZIP codes. This will be much faster because:
- Executes on the database server with optimized query plan
- Can use indexes more efficiently
- Returns results directly without multiple round trips
- Can handle larger ZIP code lists in a single query

## Step 1: Create the RPC Function

Run this SQL in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION get_commerce_data_for_zips(
  zip_codes TEXT[],
  max_records INTEGER DEFAULT 50000
)
RETURNS TABLE(
  sanitized_value TEXT,
  weight INTEGER,
  audience_name TEXT,
  seed TEXT,
  dt TEXT
) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cas.sanitized_value::TEXT,
    cas.weight::INTEGER,
    cas.audience_name::TEXT,
    cas.seed::TEXT,
    cas.dt::TEXT
  FROM commerce_audience_segments cas
  WHERE cas.sanitized_value = ANY(
    SELECT 'NA_US_' || zip_code FROM unnest(zip_codes) AS zip_code
  )
  LIMIT max_records;
END;
$$;
```

## Step 2: Grant Permissions

```sql
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_commerce_data_for_zips(TEXT[], INTEGER) TO authenticated;

-- Grant execute permission to anon users
GRANT EXECUTE ON FUNCTION get_commerce_data_for_zips(TEXT[], INTEGER) TO anon;
```

## Step 3: Create Index (if not exists)

Ensure there's an index on `sanitized_value` for fast lookups:

```sql
-- Check if index exists, create if not
CREATE INDEX IF NOT EXISTS idx_commerce_audience_segments_sanitized_value 
ON commerce_audience_segments(sanitized_value);
```

## Step 4: Verify It Works

Test the function:

```sql
-- Test with a few ZIP codes
SELECT * FROM get_commerce_data_for_zips(ARRAY['10001', '10002', '10003'], 1000);

-- Test with more ZIP codes
SELECT * FROM get_commerce_data_for_zips(ARRAY['10001', '10002', '10003', '10004', '10005'], 5000);
```

## Step 5: Update Code to Use RPC

Update `loadZipCodesDataFromSupabase()` in `commerceAudienceService.ts` to use the RPC function instead of batched `.in()` queries.

## Benefits

1. ✅ **Much Faster** - Single query instead of multiple batches
2. ✅ **Uses Indexes** - Can leverage index on `sanitized_value`
3. ✅ **No Round Trips** - One database call instead of 8+
4. ✅ **Handles Large Lists** - Can process 200+ ZIP codes in one query
5. ✅ **STABLE Function** - Postgres can optimize query plan

## Performance Comparison

- **Batched `.in()` Queries:** 8 batches × 1-2 seconds = 8-16 seconds (times out)
- **RPC Function:** Single query = < 3 seconds (expected)

