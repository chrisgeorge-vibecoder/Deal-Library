# US Market Insights - Maryland Commerce Data Diagnostic Fix

## Issue Reported
User selected **State = Maryland** in the US Market Insights tool and received the message: **"No commerce audience data available for this market."**

## Root Cause Analysis

The issue could be caused by several factors:

1. **ZIP Code Format Mismatch**: Maryland ZIP codes from census data might not match the format in commerce database
2. **No Commerce Data Coverage**: Maryland ZIP codes might not have any commerce audience data in the Supabase database
3. **All Segments Filtered Out**: Commerce data exists but all segments are filtered out by:
   - Outlier filtering (top 10% most widespread segments)
   - Category filtering
   - Excluded category filtering

## Diagnostic Improvements Implemented

### 1. Enhanced Logging in `getSegmentsForZipCodes`

**File:** `deal-library-amplify-app/src/lib/services/commerceAudienceService.ts`

**Added:**
- Logs how many ZIP codes are being searched
- Shows how many ZIP codes match vs. don't match in commerce data
- Displays sample matching and non-matching ZIP codes
- Logs how many commerce items were processed and matched
- Shows total segments found before filtering

**Example Output:**
```
🔍 getSegmentsForZipCodes: Searching 250 ZIP codes
📊 Found 180 matching ZIPs in commerce data, 70 not found
✅ Matching ZIPs: 21201, 21202, 21203, 21204, 21205...
⚠️ Non-matching ZIPs: 21001, 21002...
📈 Processed 50,000 commerce items, 1,200 matched ZIP codes, found 45 segments
```

### 2. Enhanced Logging in API Route

**File:** `deal-library-amplify-app/src/app/api/market-insights/market-commerce/route.ts`

**Added:**
- Logs sample ZIP codes being searched (first 5-10)
- When no segments found, shows diagnostic information:
  - Total commerce records available
  - Total segments available
  - Test result on first 10 ZIP codes before filtering

**Example Output:**
```
📍 Found 250 ZIP codes for Maryland
📍 Sample ZIP codes: 21201, 21202, 21203, 21204, 21205... (250 total)
⚠️ No segments found. Commerce data status: 10000 total records, 500 segments available
🔬 Diagnostic: First 10 ZIPs returned 0 segments before filtering
```

## How to Diagnose the Issue

### Step 1: Check Server Logs

After selecting Maryland in the US Market Insights tool, check the server logs (CloudWatch or local console) for:

1. **ZIP Code Matching:**
   ```
   📊 Found X matching ZIPs in commerce data, Y not found
   ```
   - If `X = 0`: No Maryland ZIP codes exist in commerce database (data coverage issue)
   - If `X > 0` but segments = 0: ZIP codes exist but no segments pass filters

2. **Sample ZIP Codes:**
   ```
   ✅ Matching ZIPs: 21201, 21202...
   ⚠️ Non-matching ZIPs: 21001, 21002...
   ```
   - Check if the ZIP codes look correct (5 digits)
   - Verify if non-matching ZIPs are valid Maryland ZIPs

3. **Segment Filtering:**
   ```
   📈 Processed X commerce items, Y matched ZIP codes, found Z segments
   ```
   - If `Y = 0`: No commerce data for Maryland ZIP codes
   - If `Y > 0` but `Z = 0`: Data exists but all segments filtered out

### Step 2: Verify Data Coverage

Run this query in Supabase to check if Maryland ZIP codes have commerce data:

```sql
-- Check if any Maryland ZIP codes have commerce data
SELECT 
  COUNT(DISTINCT sanitized_value) as zip_count,
  COUNT(*) as total_records
FROM commerce_audience_segments
WHERE sanitized_value LIKE 'NA_US_21%'  -- Maryland ZIPs start with 21
  OR sanitized_value LIKE 'NA_US_20%'    -- Some Maryland ZIPs start with 20
```

**Expected Results:**
- If `zip_count = 0`: No Maryland ZIP codes in commerce database (data coverage gap)
- If `zip_count > 0`: Maryland ZIP codes exist, investigate filtering logic

### Step 3: Check ZIP Code Format

Verify that ZIP codes are stored consistently:

```sql
-- Check ZIP code format in commerce data
SELECT DISTINCT 
  sanitized_value,
  LENGTH(REPLACE(sanitized_value, 'NA_US_', '')) as zip_length
FROM commerce_audience_segments
WHERE sanitized_value LIKE 'NA_US_21%'
LIMIT 10;
```

**Expected:** All ZIP codes should be 5 digits after removing `NA_US_` prefix.

## Potential Solutions

### Solution 1: Data Coverage Issue
**If no Maryland ZIP codes exist in commerce database:**
- This is a data source limitation
- Consider expanding commerce data coverage to include Maryland
- Or document that certain states/regions have limited coverage

### Solution 2: ZIP Code Format Issue
**If ZIP codes don't match due to format:**
- Normalize ZIP codes to ensure consistent format (5 digits, no leading zeros)
- Update data loading logic to handle format variations

### Solution 3: Over-Filtering
**If data exists but all segments filtered out:**
- Review outlier filtering threshold (currently 10%)
- Consider reducing threshold or making it configurable
- Check excluded categories list

## Testing

1. **Select Maryland in US Market Insights**
2. **Check browser console** for API response
3. **Check server logs** for diagnostic output
4. **Verify ZIP codes** match between census and commerce data

## Next Steps

1. **Deploy the diagnostic improvements** to production
2. **Test with Maryland** and review logs
3. **Identify root cause** based on diagnostic output
4. **Implement appropriate fix** based on findings:
   - If data coverage: Expand data or document limitation
   - If format issue: Normalize ZIP codes
   - If filtering: Adjust filter thresholds

---

**Status:** ✅ Diagnostic improvements implemented - Ready for testing

**Files Modified:**
- `deal-library-amplify-app/src/lib/services/commerceAudienceService.ts`
- `deal-library-amplify-app/src/app/api/market-insights/market-commerce/route.ts`

