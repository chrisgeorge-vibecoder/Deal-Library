# Gemini Query Routing Fix

## Issue
Queries that require Gemini API (like market sizing) are not working when "Deal Opportunities" card is selected. The query "what is the market size for energy drink shoppers?" was being routed to deals search instead of market sizing.

## Root Cause
When a card type is selected (e.g., "Deal Opportunities"), the code was routing ALL queries to that card's handler, even if the query was clearly about a different topic (like market sizing).

**Specific Issues:**
1. No intent detection before routing - queries went to selected card type regardless of content
2. `forceDeals: true` prevented AI responses for general questions
3. Market sizing queries were being forced through deals search

## Fixes Applied

### 1. Intent Detection Before Routing
**File:** `deal-library-amplify-app/src/app/page.tsx`

- Added market sizing keyword detection even when "deals" card is selected
- Routes to market sizing API if query contains market sizing keywords
- Only uses deals search if query is actually about deals or ambiguous

### 2. General Question Handling in Deals Search
**File:** `deal-library-amplify-app/src/lib/controllers/dealsControllerWrapper.ts`

- Added detection for non-deal queries (market sizing, audience insights, etc.)
- Returns AI response for general questions even when `forceDeals: true`
- Only forces deals if query is actually about deals

### 3. Frontend Response Handling
**File:** `deal-library-amplify-app/src/app/page.tsx`

- Added handling for `isGeneralQuestion` flag in response
- Shows AI response without deals for general questions
- Properly clears loading state

## Code Changes

### Frontend Routing (`page.tsx`)
```typescript
if (selectedType === 'deals') {
  // Check if query is clearly about market sizing
  const marketSizingKeywords = ['market size', 'market sizing', ...];
  const isMarketSizingQuery = marketSizingKeywords.some(keyword => queryLower.includes(keyword));
  
  if (isMarketSizingQuery) {
    // Route to market sizing API instead
    return;
  }
  // Otherwise proceed with deals search
}
```

### Backend General Question Detection (`dealsControllerWrapper.ts`)
```typescript
// Check if query is clearly not about deals
const nonDealKeywords = ['market size', 'audience insight', ...];
const isNonDealQuery = nonDealKeywords.some(keyword => queryLower.includes(keyword));

// Return AI response even with forceDeals if query is not about deals
if (geminiResult.deals.length === 0 && geminiResult.aiResponse && 
    (!forceDeals || isNonDealQuery)) {
  return { deals: [], aiResponse: geminiResult.aiResponse, isGeneralQuestion: true };
}
```

## Expected Behavior After Fix

1. **Market Sizing Query with Deals Card Selected:**
   - "what is the market size for energy drink shoppers?"
   - Should route to market sizing API
   - Should return market sizing analysis
   - Should NOT try to find deals

2. **General Question with Deals Card Selected:**
   - "what is programmatic advertising?"
   - Should return AI response from Gemini
   - Should NOT try to force deals
   - Should clear loading state properly

3. **Deal Query with Deals Card Selected:**
   - "show me deals for parents"
   - Should route to deals search
   - Should return relevant deals
   - Should work as before

## Testing

After deployment, test:

1. **Market Sizing with Deals Card:**
   - Select "Deal Opportunities" card
   - Ask: "what is the market size for energy drink shoppers?"
   - Should show market sizing analysis (not deals)

2. **General Question with Deals Card:**
   - Select "Deal Opportunities" card
   - Ask: "what is programmatic advertising?"
   - Should show AI response (not deals)
   - Should clear loading state

3. **Deal Query with Deals Card:**
   - Select "Deal Opportunities" card
   - Ask: "show me deals for parents"
   - Should show relevant deals
   - Should work normally

## Related Files
- `deal-library-amplify-app/src/app/page.tsx` - Frontend routing logic
- `deal-library-amplify-app/src/lib/controllers/dealsControllerWrapper.ts` - Backend search logic




