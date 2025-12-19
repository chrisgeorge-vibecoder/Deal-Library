# View Implementation Checklist

Follow this checklist to implement the Supabase view solution.

## Prerequisites

- [ ] Supabase support has confirmed data exists (Scenario A)
- [ ] SQL queries have been run and results shared
- [ ] You have access to Supabase SQL Editor

## Implementation Steps

### Step 1: Create the View

- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Run the view creation SQL:
  ```sql
  CREATE OR REPLACE VIEW v_audience_segment_names AS
  SELECT DISTINCT trim(audience_name) AS audience_name
  FROM commerce_audience_segments
  WHERE audience_name IS NOT NULL;
  ```
- [ ] Verify view was created: `SELECT * FROM v_audience_segment_names LIMIT 10;`

### Step 2: Check RLS Status

- [ ] Run RLS check query:
  ```sql
  SELECT 
    schemaname,
    tablename,
    rowsecurity
  FROM pg_tables
  WHERE tablename = 'commerce_audience_segments';
  ```
- [ ] If RLS is enabled (`rowsecurity = true`), create policy:
  ```sql
  CREATE POLICY "segments_read_all"
  ON commerce_audience_segments
  FOR SELECT TO authenticated
  USING (true);
  ```
- [ ] If using anon access, also create:
  ```sql
  CREATE POLICY "segments_read_anon"
  ON commerce_audience_segments
  FOR SELECT TO anon
  USING (true);
  ```

### Step 3: Create Performance Index

- [ ] Run index creation:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_comm_aud_segments_name
    ON commerce_audience_segments (lower(trim(audience_name)));
  ```
- [ ] Verify index was created:
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE tablename = 'commerce_audience_segments' 
  AND indexname = 'idx_comm_aud_segments_name';
  ```

### Step 4: Update Code

- [ ] Open `deal-library-amplify-app/src/lib/services/commerceAudienceService.ts`
- [ ] Find `getSegmentNamesFromSupabase()` method
- [ ] Update query to use view (already done - verify it's correct)
- [ ] Verify code change:
  ```typescript
  const { data, error } = await supabase
    .from('v_audience_segment_names')  // ← Changed from 'commerce_audience_segments'
    .select('audience_name')
    .order('audience_name', { ascending: true })
    .limit(SAMPLE_SIZE);
  ```

### Step 5: Validate View Works

- [ ] Run validation query in Supabase SQL Editor:
  ```sql
  SELECT audience_name
  FROM v_audience_segment_names
  WHERE lower(audience_name) LIKE '%pet%' 
     OR lower(audience_name) LIKE '%cat%'
     OR lower(audience_name) LIKE '%dog%' 
     OR lower(audience_name) LIKE '%animal%'
  ORDER BY audience_name;
  ```
- [ ] Verify pet-related segments are returned
- [ ] Check total unique segments:
  ```sql
  SELECT COUNT(*) FROM v_audience_segment_names;
  ```

### Step 6: Test Locally

- [ ] Build and test locally:
  ```bash
  cd deal-library-amplify-app
  npm run build
  npm run dev
  ```
- [ ] Navigate to Commerce Audience Insights page
- [ ] Select "Animals & Pet Supplies" category
- [ ] Verify segments dropdown populates with pet-related segments
- [ ] Check browser console for any errors

### Step 7: Deploy and Test

- [ ] Commit code changes:
  ```bash
  git add deal-library-amplify-app/src/lib/services/commerceAudienceService.ts
  git commit -m "Use Supabase view for segment names query"
  git push
  ```
- [ ] Wait for Amplify deployment to complete
- [ ] Test on production URL: `https://main.d397i1d40lia7t.amplifyapp.com/audience-insights`
- [ ] Select "Animals & Pet Supplies" category
- [ ] Verify segments dropdown works correctly
- [ ] Check browser console and network tab for errors

### Step 8: Verify No Caching Issues

- [ ] Clear browser cache
- [ ] Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- [ ] Check if segments load correctly
- [ ] If still showing old data, wait 5 minutes and retry (Amplify SSR cache)

## Troubleshooting

### If segments still don't appear:

1. **Check RLS policies:**
   - Verify the policy allows your API role to read
   - Check if multi-tenant filters are blocking rows

2. **Verify view exists:**
   ```sql
   SELECT * FROM information_schema.views 
   WHERE table_name = 'v_audience_segment_names';
   ```

3. **Check API logs:**
   - Look for Supabase query errors
   - Verify the query is using the view, not the table

4. **Test direct query:**
   - Run the query directly in Supabase SQL Editor
   - Compare results with API response

5. **Clear Amplify cache:**
   - Redeploy the application
   - Wait for full deployment to complete

## Success Criteria

- ✅ View created successfully
- ✅ RLS policy allows reading (if RLS enabled)
- ✅ Index created for performance
- ✅ Code updated to use view
- ✅ Validation query returns pet segments
- ✅ Local test works correctly
- ✅ Production deployment works correctly
- ✅ Segments dropdown populates with correct segments

## Rollback Plan

If the view approach doesn't work:

1. Revert code changes:
   ```bash
   git revert <commit-hash>
   git push
   ```

2. Keep the view in database (it won't hurt, and you can use it later)

3. Investigate alternative solutions:
   - Check if category filtering is needed
   - Verify data actually exists in database
   - Check for other filtering logic in API




