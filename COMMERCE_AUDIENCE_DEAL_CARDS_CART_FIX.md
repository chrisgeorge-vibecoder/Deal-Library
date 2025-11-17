# Commerce Audience Insights - Deal Cards Cart Fix

## Issue
Deal cards at the bottom of Commerce Audience Insights results had bookmark functionality that saved them to "Saved Cards" under the Plan section. This was incorrect behavior - Deal cards should only have cart functionality and appear in the "Cart" under the Activate section.

## Solution Implemented

### Changes Made to `/deal-library-frontend/src/app/audience-insights/page.tsx`

#### 1. Updated Imports
- **Removed**: `Bookmark`, `BookmarkCheck` (no longer needed)
- **Added**: `ShoppingCart`, `Trash2` (for cart functionality)

```typescript
// Before
import { Target, TrendingUp, Users, MapPin, BarChart3, Download, Sparkles, Bookmark, ArrowRight, BookmarkCheck } from 'lucide-react';

// After
import { Target, TrendingUp, Users, MapPin, BarChart3, Download, Sparkles, ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';
```

#### 2. Removed Bookmark State and Functions
- **Removed** `savedDealIds` state variable
- **Removed** `handleSaveDeal()` function
- **Removed** `handleUnsaveDeal()` function  
- **Removed** `isDealSaved()` function

These were replaced by existing cart functionality:
- `handleAddToCart()` - dispatches 'addToCart' event
- `handleRemoveFromCart()` - dispatches 'removeFromCart' event
- `isInCart()` - checks if deal is in cart

#### 3. Updated Deal Card Icon Button (Lines ~1566-1588)

**Before:**
- Bookmark icon (📑) in top-right corner
- Toggled between saved/unsaved states
- Blue styling when saved
- Called `handleSaveDeal()` / `handleUnsaveDeal()`

**After:**
- Shopping cart icon (🛒) in top-right corner
- Toggles between in-cart/not-in-cart states  
- Red styling when in cart (with trash icon)
- Gold/orange styling when not in cart (with cart icon)
- Calls `handleAddToCart()` / `handleRemoveFromCart()`

```typescript
// Cart button logic
{inCart ? (
  <Trash2 className="w-4 h-4" />  // Red - Remove from cart
) : (
  <ShoppingCart className="w-4 h-4" />  // Gold - Add to cart
)}
```

#### 4. Cleaned Up DealDetailModal Props (Lines ~1750-1758)

**Removed unnecessary props:**
- `onSaveCard={handleSaveDeal}` ❌
- `onUnsaveCard={handleUnsaveDeal}` ❌
- `isSaved={isDealSaved}` ❌

**Kept cart props:**
- `onAddToCart={handleAddToCart}` ✅
- `onRemoveFromCart={handleRemoveFromCart}` ✅
- `isInCart={isInCart}` ✅

The DealDetailModal already only supported cart functionality, so these save props were unused and unnecessary.

## User Experience Changes

### Before
- ✅ Click bookmark icon on Deal card
- ✅ Deal saves to "Saved Cards" under **Plan** section
- ❌ Wrong workflow - deals should go to cart for activation

### After  
- ✅ Click shopping cart icon on Deal card
- ✅ Deal adds to "Cart" under **Activate** section
- ✅ Correct workflow - deals ready for campaign activation
- ✅ Red trash icon appears when deal is in cart
- ✅ Click trash icon to remove from cart

## Visual Styling

### Cart Icon States
1. **Not in Cart**: 
   - Gold shopping cart icon 🛒
   - Hover effect with orange tint
   - Border with white background

2. **In Cart**: 
   - Red trash/delete icon 🗑️
   - Red background tint
   - Red border
   - Indicates removal action

## Integration Points

The cart functionality integrates with the main AppLayout component via custom events:

```typescript
// Add to cart
window.dispatchEvent(new CustomEvent('addToCart', { detail: { deal } }));

// Remove from cart  
window.dispatchEvent(new CustomEvent('removeFromCart', { detail: { dealId } }));
```

These events are captured by AppLayout, which manages the centralized cart state and displays deals in the Activate section's cart view.

## Testing Recommendations

1. Navigate to Commerce Audience Insights tool
2. Generate an audience report (e.g., "Pet Care Purchase Intenders")
3. Scroll to "Recommended Deals" section at bottom
4. Verify shopping cart icon appears in top-right of each deal card
5. Click cart icon - should add deal to cart
6. Navigate to Activate > Cart - verify deal appears
7. Return to Commerce Audience Insights
8. Verify cart icon changed to red trash icon for added deals
9. Click trash icon - should remove from cart
10. Verify deal removed from Activate > Cart

## Files Modified
- `/deal-library-frontend/src/app/audience-insights/page.tsx`

## No Breaking Changes
- All changes are self-contained to the Commerce Audience Insights page
- Cart functionality was already implemented and working
- Simply replaced save/bookmark with cart actions
- No backend changes required
- No API changes required

## Status
✅ **COMPLETE** - Deal cards now correctly use cart functionality and appear in Activate > Cart instead of Plan > Saved Cards.



