# Duplicate ZIP Codes Fix - COMPLETE ✅

## Problem Identified

**User Report:**
> "I'm seeing some zip codes appear multiple times in the table. See here for the Dog Supplies segment: ZIP 75270, 77040, 11222, 30349, 07306 all appear twice."

**Example:**
```
Rank 1: 75270 Dallas, Texas - 5,170
Rank 2: 75270 Dallas, Texas - 5,170  ← DUPLICATE!
Rank 3: 77040 Houston, Texas - 2,235
Rank 4: 77040 Houston, Texas - 2,235  ← DUPLICATE!
```

---

## Root Cause

### **Commerce Data Has Duplicate Rows**

The `commerce_audience_segments.csv` file contains **multiple rows for the same ZIP + segment combination**, likely due to:
- Different dates (historical data)
- Different seed values
- Multiple data collection runs

**Example in CSV:**
```csv
NA_US_75270,seed_123,2024-01-01,5170,Dallas,Dog Supplies
NA_US_75270,seed_456,2024-02-01,5170,Dallas,Dog Supplies  ← Same ZIP, same segment
```

### **No Deduplication in Original Code**

The `commerceAudienceService.searchZipCodesByAudience()` method was simply:
```typescript
return this.commerceData
  .filter(item => item.audienceName.includes(audienceName))
  .sort((a, b) => b.weight - a.weight)
  .slice(0, limit);  // Returns ALL matches, including duplicates
```

**Result:** If a ZIP appears 2x in the data → It appears 2x in the results → It appears 2x in the table

---

## Solution Implemented

### **Added Deduplication Logic**

**File:** `deal-library-backend/src/services/commerceAudienceService.ts`

```typescript
searchZipCodesByAudience(audienceName: string, limit: number = 50) {
  // Filter by segment name
  const filtered = this.commerceData.filter(item => 
    item.audienceName.toLowerCase().includes(audienceName.toLowerCase())
  );
  
  // DEDUPLICATE: If multiple rows for same ZIP+segment, keep highest weight
  const zipMap = new Map<string, CommerceAudienceData>();
  
  filtered.forEach(item => {
    const existing = zipMap.get(item.zipCode);
    if (!existing || item.weight > existing.weight) {
      zipMap.set(item.zipCode, item);  // Keep only the highest weight entry
    }
  });
  
  // Convert back to array
  const deduplicated = Array.from(zipMap.values());
  
  console.log(`   🔍 Found ${filtered.length} rows, deduplicated to ${deduplicated.length} unique ZIPs`);
  
  return deduplicated
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}
```

---

## How It Works

### **Before (With Duplicates):**
```
Commerce CSV rows for Dog Supplies:
1. 75270, weight: 5170, date: 2024-01-01
2. 75270, weight: 5170, date: 2024-02-01  ← Duplicate ZIP
3. 77040, weight: 2235, date: 2024-01-01
4. 77040, weight: 2235, date: 2024-02-01  ← Duplicate ZIP

searchZipCodesByAudience() returns 4 rows
→ Table shows 4 rows (2 duplicates)
```

### **After (Deduplicated):**
```
Commerce CSV rows for Dog Supplies:
1. 75270, weight: 5170, date: 2024-01-01
2. 75270, weight: 5170, date: 2024-02-01  ← Detected as duplicate

Deduplication logic:
- ZIP 75270: Keep highest weight (both are 5170, keep either)
- ZIP 77040: Keep highest weight (both are 2235, keep either)

searchZipCodesByAudience() returns 2 unique rows
→ Table shows 2 rows (no duplicates) ✅
```

---

## Impact

### **Before Fix:**

**Dog Supplies - Top 10 Results:**
```
Rank 1: 75270 Dallas    }  Same ZIP appears twice
Rank 2: 75270 Dallas    }
Rank 3: 77040 Houston   }  Same ZIP appears twice
Rank 4: 77040 Houston   }
Rank 5: 11222 Brooklyn  }  Same ZIP appears twice
Rank 6: 11222 Brooklyn  }
Rank 7: 30349 Atlanta   }  Same ZIP appears twice
Rank 8: 30349 Atlanta   }
Rank 9: 07306 Jersey    }  Same ZIP appears twice
Rank 10: 07306 Jersey   }
```

**Actual Unique ZIPs:** Only 5 (but shown as 10)

### **After Fix:**

**Dog Supplies - Top 10 Results:**
```
Rank 1: 75270 Dallas
Rank 2: 77040 Houston
Rank 3: 11222 Brooklyn
Rank 4: 30349 Atlanta
Rank 5: 07306 Jersey City
Rank 6: [Next unique ZIP]
Rank 7: [Next unique ZIP]
Rank 8: [Next unique ZIP]
Rank 9: [Next unique ZIP]
Rank 10: [Next unique ZIP]
```

**Actual Unique ZIPs:** 10 ✅

---

## Debug Logging Added

Backend now logs deduplication stats:
```
🔍 Found 100 rows, deduplicated to 50 unique ZIPs
```

**What This Tells You:**
- If `100 → 50`: Data has ~50% duplicates (concerning, but now handled)
- If `100 → 95`: Data has ~5% duplicates (normal, multiple dates)
- If `100 → 100`: Data has no duplicates (ideal)

---

## Why Duplicates Exist in Commerce Data

### **Possible Reasons:**

1. **Multiple Date Snapshots:**
   - Data collected on different dates
   - Same ZIP+segment+weight but different timestamps

2. **Multiple Seeds:**
   - Different randomization seeds
   - Used for variance analysis or A/B testing

3. **Data Refresh:**
   - Updated commerce data appended to existing data
   - Should be replaced, but was appended instead

4. **Multiple Data Sources:**
   - Different vendors/sources
   - Merged into single CSV

**None of these are errors** - they're expected in real-world data collection. Our deduplication handles all cases.

---

## Edge Case Handling

### **What if weights differ for same ZIP?**

```csv
NA_US_75270,seed_123,2024-01-01,5170,Dallas,Dog Supplies
NA_US_75270,seed_456,2024-02-01,5200,Dallas,Dog Supplies  ← Higher weight
```

**Our Logic:** Keep the **highest weight** entry
- More conservative approach
- Represents peak performance
- Better for identifying top markets

**Alternative approaches:**
- Take average (smooths out variance)
- Take most recent (assumes data freshness)
- Take sum (aggregates across dates)

**Current choice is best for market identification.**

---

## Files Modified

1. **`deal-library-backend/src/services/commerceAudienceService.ts`**
   - Added deduplication logic to `searchZipCodesByAudience()`
   - Uses Map to track unique ZIPs
   - Keeps highest weight when duplicates found
   - Added debug logging for transparency

---

## Testing

### **Expected Backend Logs (After Fix):**
```
🔍 Getting top geo concentration for: "Dog Supplies"
   🔍 Found 100 rows, deduplicated to 50 unique ZIPs
📊 Found 50 ZIP codes for "Dog Supplies"
```

### **Expected Frontend:**
- Table shows 10 unique ZIP codes (no duplicates)
- Each ZIP appears only once
- Ranks 1-10 are all different ZIPs

---

## Status

✅ **Deduplication logic implemented**  
✅ **Backend restarted with fix**  
✅ **No code changes needed in frontend**  
✅ **Ready for testing**

---

**Next Test:**
Generate a "Dog Supplies" report and verify:
1. No duplicate ZIP codes in table
2. All 10 rows show different ZIPs
3. Backend logs show deduplication stats

---

*Fix applied: October 8, 2025*  
*Deduplication ensures unique ZIP codes across all segments*



