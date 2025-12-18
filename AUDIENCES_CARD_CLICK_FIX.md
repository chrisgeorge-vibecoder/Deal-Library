# Audiences Card Click Error Fix

## Issue
When clicking on an audience card in the Audiences tool (under "Activate"), users get an error page:
```
Something went wrong!
An unexpected error occurred. This might be a temporary issue.
```

## Root Cause
**Error:** `TypeError: Cannot read properties of null (reading 'toFixed')`

The error occurs in the `AudienceDetailModal` component when trying to display CPM and Media Cost values. Some audience segments have `null` or `undefined` values for:
- `segment.cpm` 
- `segment.mediaPercentCost`

The code was calling `.toFixed()` directly on these values without null checks:
```typescript
// ❌ Before (causes error if cpm is null)
${segment.cpm.toFixed(2)}

// ❌ Before (causes error if mediaPercentCost is null)
{(segment.mediaPercentCost * 100).toFixed(0)}%
```

## Solution ✅

Added null checks and fallback values in `AudienceDetailModal.tsx`:

```typescript
// ✅ After (handles null values)
{segment.cpm != null ? `$${segment.cpm.toFixed(2)}` : 'N/A'}

// ✅ After (handles null values)
{segment.mediaPercentCost != null ? `${(segment.mediaPercentCost * 100).toFixed(0)}%` : 'N/A'}
```

## Files Modified

1. **`deal-library-amplify-app/src/components/AudienceDetailModal.tsx`**
   - Added null checks for `segment.cpm` and `segment.mediaPercentCost`
   - Display "N/A" when values are null/undefined

2. **`deal-library-amplify-app/src/types/audience.ts`**
   - Updated `AudienceSegment` interface to allow `null` for `cpm` and `mediaPercentCost`
   - Changed from `cpm: number` to `cpm: number | null`
   - Changed from `mediaPercentCost: number` to `mediaPercentCost: number | null`

## Testing

**After fix:**
1. Navigate to `/audiences` page
2. Click on any audience card
3. Modal should open successfully
4. If CPM or Media Cost is null, it will display "N/A" instead of crashing

## Impact

- ✅ Prevents crashes when audience segments have missing CPM/Media Cost data
- ✅ Gracefully handles null values with "N/A" display
- ✅ Improves user experience - no more error pages

---

**Status:** ✅ Fix implemented

