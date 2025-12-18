# Supabase View Setup (If Data Exists)

If Supabase support confirms that pet segments exist in the database (Scenario A), we can create a database view for better performance and guaranteed DISTINCT results.

## Step 1: Create the Normalized DISTINCT View

Run this SQL in Supabase SQL Editor:

**Option 1: Case-sensitive (preserves original casing):**
```sql
CREATE OR REPLACE VIEW v_audience_segment_names AS
SELECT DISTINCT trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL;
```

**Option 2: Case-insensitive (returns lowercase - only use if you're okay with lowercase names):**
```sql
CREATE OR REPLACE VIEW v_audience_segment_names AS
SELECT DISTINCT lower(trim(audience_name)) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL;
```

**Recommendation:** Use Option 1 (case-sensitive) to preserve original casing. You can normalize in the client if needed.

## Step 2: Ensure RLS Allows Reading the View

If RLS is enabled on `commerce_audience_segments`, the view will inherit RLS checks from the base table. Confirm your read policy allows the roles used by your API/app:

**Check if RLS is enabled:**
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'commerce_audience_segments';
```

**Create permissive policy (if needed):**
```sql
-- Example permissive policy (adjust for multi-tenant setups)
CREATE POLICY "segments_read_all"
ON commerce_audience_segments
FOR SELECT TO authenticated
USING (true);
```

**For anon (public) access:**
```sql
CREATE POLICY "segments_read_anon"
ON commerce_audience_segments
FOR SELECT TO anon
USING (true);
```

**Note:** If multi-tenant, keep your tenant filters in the base policies. The view will respect them.

## Step 3: Add Performance Index

Create the index for faster DISTINCT and LIKE filtering:

```sql
CREATE INDEX IF NOT EXISTS idx_comm_aud_segments_name
  ON commerce_audience_segments (lower(trim(audience_name)));
```

**Optional: If you later need category/taxonomy filters, add composite index:**
```sql
-- Adjust category_id to your actual schema column name
CREATE INDEX IF NOT EXISTS idx_comm_aud_segments_category_name
  ON commerce_audience_segments (category_id, lower(trim(audience_name)));
```

## Step 4: Update Code to Use View

Once the view is created, update `commerceAudienceService.ts`:

**File:** `deal-library-amplify-app/src/lib/services/commerceAudienceService.ts`

**Change in `getSegmentNamesFromSupabase()` method:**

```typescript
// OLD: Query the table directly
const { data, error } = await supabase
  .from('commerce_audience_segments')
  .select('audience_name', { count: 'exact', head: false })
  .not('audience_name', 'is', null)
  .order('audience_name', { ascending: true })
  .limit(SAMPLE_SIZE);

// NEW: Query the view (guaranteed DISTINCT, faster)
const { data, error } = await supabase
  .from('v_audience_segment_names')
  .select('audience_name')
  .order('audience_name', { ascending: true })
  .limit(SAMPLE_SIZE);
```

**Note:** Keep `SAMPLE_SIZE` to a sensible ceiling (e.g., 10k). If you used lowercase in the view, consider title-casing in UI or at fetch time.

## Benefits of Using View

1. ✅ **Guaranteed DISTINCT** - Database handles deduplication
2. ✅ **Faster queries** - Pre-computed distinct values
3. ✅ **Normalized** - Trims whitespace automatically
4. ✅ **Simpler code** - No need for client-side Set deduplication

## Index for Performance

Also create an index for faster lookups:

```sql
CREATE INDEX IF NOT EXISTS idx_comm_aud_segments_name
  ON commerce_audience_segments (lower(trim(audience_name)));
```

## When to Use

- ✅ Use view if Supabase confirms data exists (Scenario A)
- ✅ Use view if you want guaranteed DISTINCT results
- ✅ Use view for better performance on large datasets

## Step 5: Optional - Category-Aware View (Future Enhancement)

If you later need distinct segments within a category, create a category-scoped view:

```sql
CREATE OR REPLACE VIEW v_audience_segment_names_by_category AS
SELECT DISTINCT
  category_id,
  trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL;
```

Then query with:
```typescript
const { data, error } = await supabase
  .from('v_audience_segment_names_by_category')
  .select('audience_name')
  .eq('category_id', selectedCategoryId)
  .order('audience_name', { ascending: true })
  .limit(SAMPLE_SIZE);
```

## Step 6: Validate End-to-End

Re-run your "pet-related" search query against the view to verify it works:

```sql
SELECT audience_name
FROM v_audience_segment_names
WHERE lower(audience_name) LIKE '%pet%' 
   OR lower(audience_name) LIKE '%cat%'
   OR lower(audience_name) LIKE '%dog%' 
   OR lower(audience_name) LIKE '%animal%'
ORDER BY audience_name;
```

**If this returns expected items but your API still returns only "Computers", check:**
- API filtering logic
- Caching in your API route or Amplify SSR (invalidate/redeploy after schema changes)
- RLS differences between your local test and API role
- Category filter applied on a different column or with mismatched values

## Common Pitfalls to Watch

1. **Client code still hitting the base table** - Check for older build or environment mismatch
2. **RLS differences** - Your local testing user vs deployed API user may have different permissions
3. **Category filter mismatch** - Applied on different column or with mismatched values
4. **Caching issues** - API route or Amplify SSR caching (invalidate/redeploy after schema changes)

## When NOT to Use

- ❌ Don't use if data is missing (Scenario B) - need to import data first
- ❌ Don't use if you need to filter by other columns (category, taxonomy, etc.) - use category-aware view instead

