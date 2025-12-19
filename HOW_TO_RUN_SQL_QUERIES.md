# How to Run SQL Queries in Supabase

Quick guide for running the verification queries.

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

## Step 2: Run Each Query

Copy and paste each query one at a time, then click **"Run"** (or press Ctrl+Enter / Cmd+Enter).

### Query 1: Count Unique Segments

```sql
SELECT COUNT(*) AS unique_segments
FROM (
  SELECT DISTINCT trim(audience_name)
  FROM commerce_audience_segments
  WHERE audience_name IS NOT NULL
) t;
```

**What to copy:**
- The number shown in the `unique_segments` column
- Example: `150`

---

### Query 2: List Unique Segment Names

```sql
SELECT DISTINCT trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL
ORDER BY audience_name
LIMIT 100;
```

**What to copy:**
- The entire result table (all rows)
- Or at minimum, the first 20 segment names
- Example:
  ```
  Animals & Pet Supplies
  Apparel & Accessories
  Baby & Toddler
  ...
  ```

---

### Query 3: Search Pet-Related Segments

```sql
SELECT DISTINCT trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL
  AND (
    lower(audience_name) LIKE '%pet%'
    OR lower(audience_name) LIKE '%cat%'
    OR lower(audience_name) LIKE '%dog%'
    OR lower(audience_name) LIKE '%animal%'
  )
ORDER BY audience_name;
```

**What to copy:**
- The entire result table (all rows)
- If no results, write "No pet-related segments found"
- Example:
  ```
  Cat Supplies
  Dog Supplies
  Pet Supplies
  ```

---

### Query 4: Top Segment Distribution

```sql
SELECT
  trim(audience_name) AS audience_name,
  COUNT(*) AS record_count
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL
GROUP BY trim(audience_name)
ORDER BY record_count DESC, audience_name
LIMIT 20;
```

**What to copy:**
- The entire result table (all rows)
- Or at minimum, the top 10 with their counts
- Example:
  ```
  Computers - 50000
  Electronics - 30000
  ...
  ```

## Step 3: Copy Results

### Method 1: Copy Entire Table
1. Click anywhere in the result table
2. Select all (Ctrl+A / Cmd+A)
3. Copy (Ctrl+C / Cmd+C)
4. Paste into the template

### Method 2: Copy Individual Values
1. Click on a cell
2. Copy the value
3. Paste into the template

### Method 3: Screenshot
1. Take a screenshot of the results
2. Attach to your message to Supabase support

## Step 4: Fill in the Template

1. Open `SQL_QUERY_RESULTS_TEMPLATE.md`
2. Paste results into the corresponding sections
3. Fill in the "First 20" and "Top 10" sections
4. Save the file

## Step 5: Share with Supabase Support

Copy the filled-in template and share it with Supabase support in your support ticket or email.

## Troubleshooting

### "Table doesn't exist" error
- Verify you're in the correct project
- Check the table name is exactly `commerce_audience_segments`

### "Permission denied" error
- You may need to run queries as a different role
- Check with your Supabase admin

### No results returned
- This is actually useful information! It means the data might be missing (Scenario B)
- Share this with Supabase support

### Query takes too long
- The queries are optimized, but large tables can take time
- Wait for the query to complete (up to 30 seconds is normal)
- If it times out, share that information with Supabase support

## Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Ran Query 1 (Count unique segments)
- [ ] Ran Query 2 (List unique names)
- [ ] Ran Query 3 (Pet-related search)
- [ ] Ran Query 4 (Top distribution)
- [ ] Copied all results
- [ ] Filled in `SQL_QUERY_RESULTS_TEMPLATE.md`
- [ ] Ready to share with Supabase support


