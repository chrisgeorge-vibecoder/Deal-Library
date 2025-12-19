# Pre-Deployment Checklist

## ⚠️ IMPORTANT: Do NOT Deploy Yet!

The code has been updated to use the view `v_audience_segment_names`, but **the view doesn't exist in Supabase yet**. If you deploy now, the API will fail because it's trying to query a non-existent view.

## Required Steps BEFORE Deployment

### Step 1: Create the View in Supabase ✅

1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
CREATE OR REPLACE VIEW v_audience_segment_names AS
SELECT DISTINCT trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL;
```

3. Verify it was created:
```sql
SELECT * FROM v_audience_segment_names LIMIT 10;
```

**Status:** [ ] View created and verified

---

### Step 2: Check RLS Status ✅

1. Check if RLS is enabled:
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'commerce_audience_segments';
```

2. If RLS is enabled (`rowsecurity = true`), create a permissive policy:

**For authenticated users:**
```sql
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

**Status:** [ ] RLS checked and policies created (if needed)

---

### Step 3: Create Performance Index ✅

Run this SQL:

```sql
CREATE INDEX IF NOT EXISTS idx_comm_aud_segments_name
  ON commerce_audience_segments (lower(trim(audience_name)));
```

Verify it was created:
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'commerce_audience_segments' 
AND indexname = 'idx_comm_aud_segments_name';
```

**Status:** [ ] Index created and verified

---

### Step 4: Validate the View Works ✅

Test the view returns expected data:

```sql
-- Should return diverse segments (not just "Computers")
SELECT audience_name
FROM v_audience_segment_names
ORDER BY audience_name
LIMIT 20;
```

```sql
-- Should return pet-related segments
SELECT audience_name
FROM v_audience_segment_names
WHERE lower(audience_name) LIKE '%pet%' 
   OR lower(audience_name) LIKE '%cat%'
   OR lower(audience_name) LIKE '%dog%' 
   OR lower(audience_name) LIKE '%animal%'
ORDER BY audience_name;
```

**Status:** [ ] View returns expected data

---

### Step 5: Test Locally (Optional but Recommended) ✅

1. Build locally:
   ```bash
   cd deal-library-amplify-app
   npm run build
   npm run dev
   ```

2. Test the API endpoint:
   - Navigate to Commerce Audience Insights page
   - Select "Animals & Pet Supplies" category
   - Verify segments dropdown populates correctly

**Status:** [ ] Local test passed

---

### Step 6: Deploy Code ✅

**ONLY AFTER completing steps 1-4 above:**

1. Commit changes:
   ```bash
   git add deal-library-amplify-app/src/lib/services/commerceAudienceService.ts
   git commit -m "Use Supabase view for segment names query"
   git push
   ```

2. Wait for Amplify deployment to complete

3. Test in production:
   - Navigate to: https://main.d397i1d40lia7t.amplifyapp.com/audience-insights
   - Select "Animals & Pet Supplies" category
   - Verify segments dropdown works correctly

**Status:** [ ] Code deployed and tested

---

## Quick Reference: All SQL in One Place

Run these in Supabase SQL Editor (in order):

```sql
-- 1. Create view
CREATE OR REPLACE VIEW v_audience_segment_names AS
SELECT DISTINCT trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL;

-- 2. Check RLS
SELECT rowsecurity FROM pg_tables 
WHERE tablename = 'commerce_audience_segments';

-- 3. Create RLS policy (if RLS is enabled)
CREATE POLICY "segments_read_all"
ON commerce_audience_segments
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "segments_read_anon"
ON commerce_audience_segments
FOR SELECT TO anon
USING (true);

-- 4. Create index
CREATE INDEX IF NOT EXISTS idx_comm_aud_segments_name
  ON commerce_audience_segments (lower(trim(audience_name)));

-- 5. Validate view
SELECT * FROM v_audience_segment_names LIMIT 20;
```

---

## What Happens If You Deploy Before Creating the View?

❌ **The API will fail** with an error like:
```
Error: relation "v_audience_segment_names" does not exist
```

The code is trying to query a view that doesn't exist yet, so Supabase will return an error.

---

## Deployment Order

1. ✅ **First:** Create view, RLS policies, and index in Supabase
2. ✅ **Then:** Deploy the code changes
3. ✅ **Finally:** Test in production

---

## Current Status

- [x] Code updated to use view ✅
- [ ] View created in Supabase ⏳
- [ ] RLS policies checked/created ⏳
- [ ] Index created ⏳
- [ ] View validated ⏳
- [ ] Code deployed ⏳

**You're about 80% ready - just need to create the database objects first!**




