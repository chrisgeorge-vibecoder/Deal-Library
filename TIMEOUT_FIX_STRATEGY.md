# Timeout Fix Strategy

## Problem
Even with the view, the query is still timing out. This suggests:
1. The view might not be materialized (still computing DISTINCT on-the-fly)
2. The query might be hitting the full table despite the view
3. Supabase's statement timeout (code 57014) is being hit before our 20-second timeout

## Solutions Implemented

### 1. Reduced Limit
- Changed from 10,000 to 500 (we only have 199 segments anyway)
- This reduces the amount of data Supabase needs to process

### 2. Reduced Timeout
- Changed from 20 seconds to 15 seconds
- This ensures we fail faster and can fall back sooner

### 3. Added Fallback
- If view doesn't exist, fall back to direct table query
- This handles cases where the view wasn't created yet

### 4. Better Error Handling
- More detailed error logging
- Handles view-not-found errors gracefully

## Additional Solutions to Try

### Option 1: Use Materialized View (Best Performance)
If Supabase supports materialized views, create one:

```sql
CREATE MATERIALIZED VIEW v_audience_segment_names_materialized AS
SELECT DISTINCT trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL;

CREATE UNIQUE INDEX ON v_audience_segment_names_materialized (audience_name);

-- Refresh periodically (or on-demand)
REFRESH MATERIALIZED VIEW v_audience_segment_names_materialized;
```

### Option 2: Query with Smaller Limit First
Try getting just the first 50 segments, then expand if needed:

```typescript
// Get first batch
const { data } = await supabase
  .from('v_audience_segment_names')
  .select('audience_name')
  .order('audience_name', { ascending: true })
  .limit(50);
```

### Option 3: Cache Results
Cache the segment names in memory or Redis to avoid repeated queries:

```typescript
let cachedSegments: string[] | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL = 3600000; // 1 hour

if (cachedSegments && Date.now() < cacheExpiry) {
  return cachedSegments;
}
```

### Option 4: Use Supabase RPC Function
Create a Postgres function that returns segments directly:

```sql
CREATE OR REPLACE FUNCTION get_audience_segment_names()
RETURNS TABLE(audience_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT trim(commerce_audience_segments.audience_name)
  FROM commerce_audience_segments
  WHERE commerce_audience_segments.audience_name IS NOT NULL
  ORDER BY trim(commerce_audience_segments.audience_name)
  LIMIT 500;
END;
$$ LANGUAGE plpgsql;
```

Then call it:
```typescript
const { data, error } = await supabase.rpc('get_audience_segment_names');
```

## Recommended Next Steps

1. **Deploy the current fix** (reduced limit, better error handling)
2. **Test if it works** - the reduced limit might be enough
3. **If still timing out**, try Option 4 (RPC function) - it's the most performant
4. **If RPC doesn't work**, check Supabase dashboard for query performance metrics

## Debugging

Check Supabase dashboard:
1. Go to Database → Query Performance
2. Look for slow queries on `commerce_audience_segments`
3. Check if the view is being used or if it's falling back to table scan

## Expected Behavior After Fix

- Query should complete in < 5 seconds (199 segments is small)
- Should return all 199 unique segments
- Should include pet-related segments
- Should not timeout

