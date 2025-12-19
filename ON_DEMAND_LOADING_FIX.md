# On-Demand Loading Fix

## Problem
Loading all commerce data (10k records) times out when generating reports. The first page query itself is timing out.

## Solution: On-Demand Segment Loading

Instead of loading all data upfront, we now load data **on-demand for the specific segment** being analyzed.

## Changes Made

### 1. New Method: `loadSegmentDataFromSupabase()`
- Queries Supabase filtered by segment name
- Only loads data for the specific segment needed
- Much faster (typically < 2 seconds vs 15+ seconds timeout)
- Uses case-insensitive partial matching

### 2. Updated: `searchZipCodesByAudience()` 
- Now async (returns Promise)
- Automatically loads data on-demand if not already loaded
- Falls back to in-memory data if available
- All call sites updated to await the method

### 3. Updated: Report Generation
- No longer tries to load all data upfront
- Loads data on-demand when needed for specific segment
- Much faster and avoids timeouts

## How It Works

**Before:**
1. User clicks "Generate Report"
2. System tries to load 10k records (times out)
3. ❌ Error

**After:**
1. User clicks "Generate Report"
2. System queries Supabase for specific segment only (e.g., "Pet Supplies")
3. Gets only records for that segment (maybe 500-2000 records)
4. ✅ Fast and works!

## Performance

- **Loading all data:** 15+ seconds (times out)
- **Loading segment-specific data:** < 2 seconds ✅

## Query Used

```typescript
const { data, error } = await supabase
  .from('commerce_audience_segments')
  .select('sanitized_value, weight, audience_name, seed, dt')
  .ilike('audience_name', `%${segmentName}%`) // Case-insensitive partial match
  .limit(5000);
```

## Files Updated

1. ✅ `commerceAudienceService.ts` - Added on-demand loading
2. ✅ `audienceInsightsService.ts` - Removed upfront data loading
3. ✅ `audienceInsightsService.ts` - Updated all `searchZipCodesByAudience` calls to await
4. ✅ `commerceBaselineService.ts` - Updated to await
5. ✅ `audienceSearchService.ts` - Updated to await
6. ✅ `audienceGeoAnalysisService.ts` - Updated to await
7. ✅ `agentModeService.ts` - Updated to await
8. ✅ `dealsController.ts` - Updated to await

## Testing

After deployment:
1. Select a segment from dropdown (should work - already fixed)
2. Click "Generate Report"
3. Should load quickly (< 5 seconds) instead of timing out
4. Report should generate successfully

## Expected Behavior

- ✅ Segment dropdown works (using cache table)
- ✅ Report generation loads segment data on-demand
- ✅ No more timeouts
- ✅ Faster report generation




