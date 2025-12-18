# SQL Query Results for Supabase Support

**Instructions:** Run the 4 refined queries in Supabase SQL Editor and paste the results below. Then share this document with Supabase support.

---

## Query 1: Count Unique Segments (Normalized)

**Query:**
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
[PASTE RESULT HERE - Should be a single number like: unique_segments: 199]
```

**Your Result:**
```
unique_segments: 199
```

---

## Query 2: List Unique Segment Names (First 100, Normalized and Ordered)

**Query:**
```sql
SELECT DISTINCT trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL
ORDER BY audience_name
LIMIT 100;
```

**Result:**
```
[PASTE FULL RESULT HERE - Should be a list of segment names]
```

**First 20 Distinct Names (REQUIRED - paste these):**
1. 3D Printers
2. Activewear
3. Advertising & Marketing
4. Agriculture
5. Alcoholic Beverages
6. Animals & Pet Supplies
7. Antivirus & Security Software
8. Arcade Equipment
9. Arts & Entertainment
10. Athletics
11. Audio
12. Baby & Toddler
13. Baby & Toddler Clothing
14. Baby & Toddler Furniture
15. Baby Bathing
16. Baby Gift Sets
17. Baby Health
18. Baby Safety
19. Baby Toys & Activity Equipment
20. Baby Transport

---

## Query 3: Search Pet-Related Segments (Normalized)

**Query:**
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
[PASTE FULL RESULT HERE - Should show pet-related segments if they exist]
```

**Pet-Related Segments Found (REQUIRED - paste ALL results):**
- Animals & Pet Supplies ✅
- Cat Supplies ✅
- Communications (false positive - contains "cat")
- Dog Supplies ✅
- Educational Software (false positive - contains "cat")
- Educational Toys (false positive - contains "cat")
- Live Animals ✅
- Pet Supplies ✅

**Note:** The false positives are expected due to LIKE matching. The actual pet-related segments are:
- Animals & Pet Supplies
- Cat Supplies
- Dog Supplies
- Live Animals
- Pet Supplies

**If no results, write:** "No pet-related segments found"

---

## Query 4: Top Segment Distribution (Normalized)

**Query:**
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
[PASTE FULL RESULT HERE - Should show segments with their record counts]
```

**Top 10 Segments by Count (REQUIRED - paste these with counts):**
1. Media - 408065 records
2. GPS Tracking Services - 375465 records
3. Household Appliances - 342130 records
4. Computers - 308294 records
5. Circuit Boards & Components - 275240 records
6. Indoor Games - 238732 records
7. Televisions - 213568 records
8. Shorts - 197356 records
9. Operating Systems - 159618 records
10. Music & Sound Recordings - 152748 records

---

## Quick Diagnosis

Based on the results above, Supabase support will determine:

**Scenario A (Data Exists):**
- ✅ Query 3 returns pet-related segments
- ✅ Overall distinct count looks healthy (>10 segments)
- **Action:** Use DISTINCT view and verify RLS/pipeline

**Scenario B (Data Missing):**
- ❌ Query 3 returns no rows
- ❌ Distribution is dominated by "Computers"
- **Action:** Proceed with import and add the index

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

**RLS Status (Optional but Helpful):**
- RLS Enabled: [YES/NO - run: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'commerce_audience_segments';`]
- Policies: [List any existing policies or "None"]

---

## How to Fill This Out

1. Open Supabase Dashboard → SQL Editor
2. Run each query one at a time
3. Copy the results (you can copy the entire result table)
4. Paste into the corresponding section above
5. Fill in the "First 20" and "Top 10" sections
6. Share this document with Supabase support

---

## Example Format

**Good Example:**
```
Query 1 Result:
unique_segments: 150

Query 2 First 20:
1. Animals & Pet Supplies
2. Apparel & Accessories
3. Baby & Toddler
...

Query 3 Pet Segments:
- Cat Supplies
- Dog Supplies
- Pet Supplies

Query 4 Top 10:
1. Computers - 50000 records
2. Electronics - 30000 records
...
```

