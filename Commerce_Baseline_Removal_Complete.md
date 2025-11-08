# Commerce Baseline Comparisons Removed

**Date:** October 31, 2025  
**Status:** ✅ COMPLETE (STRENGTHENED)

## What Changed

Removed all references to "commerce baseline" (online shopper comparisons) from AI-generated content. Now only using **US National census data** comparisons.

---

## Why This Change

The user removed the commerce baseline comparison from the visible data modules, but the AI-generated text (Persona and "The Who & The Why" sections) were still referencing "vs typical online shopper" and "vs commerce baseline."

This created inconsistency where:
- ❌ The modules showed "vs US National"
- ❌ The AI text referenced "vs online shoppers" or "vs commerce baseline"

---

## Changes Made

### 1. Persona Section Prompt ✅

**Before:**
```typescript
- Income: $87,479 (${vsCommerce.income}% vs typical online shopper)
- Education: Bachelor's degree (${vsCommerce.education}% vs typical online shopper)
```

**After:**
```typescript
- Income: $87,479 median household income (+24.2% vs US national average)
- Education: 18% Bachelor's+ (-48.5% vs US national average)
```

**Added Explicit Prohibitions:**
```
FORBIDDEN PHRASES - NEVER USE:
❌ "commerce baseline"
❌ "typical online shopper"
❌ "average online shopper"
❌ "vs commerce baseline"
❌ "compared to online shoppers"

ONLY USE FOR COMPARISONS:
✅ "vs national average"
✅ "vs US national average"
✅ "compared to national levels"
```

**Added Context:**
- Homeownership percentage
- Changed "Top Overlap" to "Top Cross-Shopping" for clarity

---

### 2. The Who & The Why Prompt ✅

**Before:**
```typescript
- Income: $87,479 median (+24.2% vs commerce baseline)
- Education: 18.0% Bachelor's+ (-48.5% vs commerce baseline)
```

**After:**
```typescript
- Income: $87,479 median (+24.2% vs US national average)
- Education: 18.0% Bachelor's+ (-48.5% vs US national average)
```

**Added Explicit Prohibitions:**
```
FORBIDDEN PHRASES - NEVER USE THESE:
❌ "commerce baseline"
❌ "typical online shopper"
❌ "average online shopper"
❌ "vs commerce baseline"
❌ "compared to online shoppers"
❌ "unlike the typical online shopper"

ONLY USE THESE COMPARISON PHRASES:
✅ "vs national average"
✅ "vs US national average"
✅ "compared to the national average"
✅ "above/below national levels"
```

**Added Bad Example to Prompt:**
```
BAD EXAMPLE #2 - Using forbidden commerce baseline language:
"Unlike the typical online shopper, this audience is distinctly more 
trade-skilled with education levels 17.2% below the commerce baseline..."
↑ NEVER use "typical online shopper" or "commerce baseline" - 
use "vs national average" instead.
```

---

### 3. Removed Calculation Code ✅

**Removed:**
```typescript
const vsCommerce = {
  income: ((demographics.medianHHI / commerceBaseline.medianHHI) - 1) * 100,
  education: ((demographics.educationBachelors / commerceBaseline.educationBachelorsPlus) - 1) * 100,
};
```

This calculation is still available in the backend but no longer passed to the AI prompts.

---

## Files Modified

**Backend:**
- `/deal-library-backend/src/services/audienceInsightsService.ts`
  - Updated `generateAIPersona()` method (lines 2023-2044)
  - Updated `generateExecutiveSummary()` method (lines 2414-2451)
  - Removed commerce baseline calculation from both prompts
  - All comparisons now reference US national averages

---

## Now Consistent Across All Sections

| Section | Comparison Used |
|---------|----------------|
| **Persona** | ✅ vs US National Average |
| **Data Modules** | ✅ vs US National Average |
| **The Who & The Why** | ✅ vs US National Average |

---

## Example Output (After Change)

### Persona Section:
> "Picture them in their suburban Dallas home with a $72K household income (+15% vs national average), part of a trade-skilled workforce where educational attainment runs 20% below national averages. Their Amazon cart mixes baby monitors with electronics accessories—functionality over flash..."

### The Who & The Why:
> "Let's better understand people in the market for Baby Transport. The combination of above-average household income (+15% vs national) with lower educational attainment (-20% vs national) suggests a trade-skilled workforce that prioritizes practical durability over brand prestige..."

---

## Testing Notes

1. Generate a new Audience Insights report
2. Verify no mentions of:
   - ❌ "commerce baseline"
   - ❌ "online shopper" comparisons
   - ❌ "typical shopper"
3. Confirm all comparisons reference:
   - ✅ "vs US national average"
   - ✅ "vs national"

---

## Cache Considerations

The AI response cache will need to clear for previously generated segments to see the updated comparison language.

- Cache keys: `persona_{segment}_{category}` and `executive_{segment}`
- Restart the backend or wait for cache expiration
- Or manually clear the cache if needed

---

## Issue Found & Fixed (Update 2)

**Problem:** Even after updating the data context to use "vs US national average", the AI was still generating text with forbidden phrases like:
- "Unlike the typical online shopper..."
- "17.2% below the commerce baseline"
- "compared to online shoppers"

**Example from Hairdressing & Cosmetology:**
> "Unlike the typical online shopper, this audience is distinctly more trade-skilled and blue-collar, with education levels 17.2% below the commerce baseline..."

**Root Cause:** The AI model was generating these phrases from patterns it learned, not from the data we provided.

**Solution:** Added explicit FORBIDDEN PHRASES section to both prompts with specific examples of what NOT to say, along with examples showing the exact forbidden language (like the Hairdressing example above).

**Result:** The prompts now include:
- ❌ List of 6 forbidden phrases to NEVER use
- ✅ List of allowed comparison phrases ONLY
- BAD EXAMPLE showing the exact forbidden pattern from Hairdressing & Cosmetology

This ensures the AI will not generate commerce baseline references even if it's seen similar patterns in training.

