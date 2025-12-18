# Supabase RPC Function Solution (Recommended)

## Problem
Even with the view, queries are timing out. This is because:
- The view computes DISTINCT on-the-fly (not materialized)
- Large table (4.2M+ rows) makes DISTINCT expensive
- Supabase statement timeout (code 57014) is being hit

## Solution: Postgres RPC Function

Create a Postgres function that returns segments directly. This is much faster because:
- Executes on the database server
- Can use indexes more efficiently
- Returns results directly without view overhead

## Step 1: Create the RPC Function

Run this SQL in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION get_audience_segment_names(limit_count INTEGER DEFAULT 500)
RETURNS TABLE(audience_name TEXT) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT trim(cas.audience_name)::TEXT
  FROM commerce_audience_segments cas
  WHERE cas.audience_name IS NOT NULL
    AND trim(cas.audience_name) != ''
  ORDER BY trim(cas.audience_name)
  LIMIT limit_count;
END;
$$;
```

## Step 2: Grant Permissions

```sql
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_audience_segment_names(INTEGER) TO authenticated;

-- Grant execute permission to anon users
GRANT EXECUTE ON FUNCTION get_audience_segment_names(INTEGER) TO anon;
```

## Step 3: Verify It Works

Test the function:

```sql
-- Test with default limit (500)
SELECT * FROM get_audience_segment_names();

-- Test with custom limit
SELECT * FROM get_audience_segment_names(200);
```

## Step 4: Update Code to Use RPC

Update `commerceAudienceService.ts`:

**File:** `deal-library-amplify-app/src/lib/services/commerceAudienceService.ts`

**In `getSegmentNamesFromSupabase()` method, replace the query with:**

```typescript
const queryPromise = (async () => {
  // Use RPC function for better performance
  const { data, error } = await supabase.rpc('get_audience_segment_names', {
    limit_count: 500
  });
  
  if (error) {
    console.error('❌ Supabase RPC error:', error.message);
    throw new Error(`Supabase RPC failed: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    console.warn('⚠️ No data returned from Supabase RPC');
    return [];
  }
  
  // RPC returns array of objects with audience_name property
  const segmentNames = data.map((row: any) => row.audience_name?.trim()).filter(Boolean) as string[];
  const uniqueNames = Array.from(new Set(segmentNames));
  
  console.log(`✅ getSegmentNamesFromSupabase (RPC): Found ${uniqueNames.length} unique segments`);
  console.log(`   Sample segments (first 10): ${uniqueNames.slice(0, 10).join(', ')}`);
  
  return uniqueNames.sort();
})();
```

## Benefits

1. ✅ **Much Faster** - Executes on database server with optimized query plan
2. ✅ **Uses Indexes** - Can leverage the index we created
3. ✅ **No View Overhead** - Direct query execution
4. ✅ **Configurable Limit** - Can adjust limit via parameter
5. ✅ **STABLE Function** - Postgres can optimize and cache results

## Performance Comparison

- **View Query:** ~15-20 seconds (times out)
- **RPC Function:** < 2 seconds (expected)

## Alternative: Materialized View

If RPC doesn't work, try a materialized view:

```sql
CREATE MATERIALIZED VIEW v_audience_segment_names_materialized AS
SELECT DISTINCT trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL;

CREATE UNIQUE INDEX ON v_audience_segment_names_materialized (audience_name);

-- Refresh periodically (run this after data updates)
REFRESH MATERIALIZED VIEW v_audience_segment_names_materialized;
```

Then query it:
```typescript
const { data, error } = await supabase
  .from('v_audience_segment_names_materialized')
  .select('audience_name')
  .order('audience_name', { ascending: true });
```

## Next Steps

1. **Try RPC function first** (recommended - fastest)
2. **If RPC doesn't work**, try materialized view
3. **If both fail**, check Supabase dashboard for query performance issues

