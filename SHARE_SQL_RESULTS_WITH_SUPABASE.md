# SQL Query Results to Share with Supabase Support

## Instructions
1. Run the 4 SQL queries in Supabase SQL Editor
2. Copy the results below
3. Share this document with Supabase support

---

## Query 1: Count Unique Segments (Normalized)

**Query (Refined - guards against whitespace/casing issues):**
```sql
SELECT COUNT(*) AS unique_segments
FROM (
  SELECT DISTINCT trim(audience_name)
  FROM commerce_audience_segments
  WHERE audience_name IS NOT NULL
) t;
```

**Result:**
```
[Paste result here - should show a number like: unique_segments: 150]
```

**Your Result:**
```
unique_segments: [FILL IN]
```

---

## Query 2: List Unique Segment Names (First 100, Normalized and Ordered)

**Query (Refined - normalized and ordered):**
```sql
SELECT DISTINCT trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL
ORDER BY audience_name
LIMIT 100;
```

**Result:**
```
[Paste result here - should show a list of segment names]
```

**First 20 segments (REQUIRED - paste these):**
1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 
9. 
10. 
11. 
12. 
13. 
14. 
15. 
16. 
17. 
18. 
19. 
20. 

---

## Query 3: Search Pet-Related Segments (Normalized)

**Query (Refined - normalized search):**
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

**Result:**
```
[Paste FULL list here - should show pet-related segments if they exist]
```

**Pet-related segments found (REQUIRED - paste all results):**
- 
- 
- 
- 
- 
- 
- 
- 

**If no results, write:** "No pet-related segments found" 

---

## Query 4: Top Segment Distribution (Normalized)

**Query (Refined - normalized grouping):**
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

**Result:**
```
[Paste result here - shows which segments have the most records]
```

**Top 10 segments by count (REQUIRED - paste these):**
1.  -  records
2.  -  records
3.  -  records
4.  -  records
5.  -  records
6.  -  records
7.  -  records
8.  -  records
9.  -  records
10.  -  records

---

## Query 5: RLS Sanity Check (Optional but Recommended)

**Query (Only if you suspect RLS is filtering rows):**
```sql
-- Check if RLS is enabled on the table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'commerce_audience_segments';
```

**Or check policies:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'commerce_audience_segments';
```

**Result:**
```
[Paste result here - shows if RLS is enabled and what policies exist]
```

**RLS Status:**
- RLS Enabled: [YES/NO]
- Policies Found: [List policies or "None"]

**If RLS is enabled and you need a permissive policy:**
```sql
-- Adjust to your auth model; remove if multi-tenant
CREATE POLICY "segments_read_all"
ON commerce_audience_segments
FOR SELECT TO authenticated
USING (true);
```

---

## Additional Information

**Current API Response:**
```json
{
  "success": true,
  "segments": ["Computers"]
}
```

**Expected Segments for "Animals & Pet Supplies":**
- Animals & Pet Supplies
- Cat Supplies
- Dog Supplies
- Live Animals
- Pet Supplies

**Current Query Code:**
```typescript
const { data, error } = await supabase
  .from('commerce_audience_segments')
  .select('audience_name')
  .not('audience_name', 'is', null)
  .limit(10000);
```

---

## Next Steps

Once you have the results:
1. Fill in the results above
2. Share this document with Supabase support
3. They will help determine if it's Scenario A (data exists, query issue) or Scenario B (data missing, import needed)

