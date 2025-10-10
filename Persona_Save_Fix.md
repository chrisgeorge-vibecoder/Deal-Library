# Persona Save Functionality - FIXED ✅

## Issue
Clicking the bookmark icon in the Audience Insights persona module did not save the card to the left pane.

---

## Root Cause

The Audience Insights page was dispatching a `saveCard` event:
```typescript
window.dispatchEvent(new CustomEvent('saveCard', { detail: personaCard }));
```

But `AppLayout` had **no event listener** for `saveCard` events!

---

## Solution

Added `saveCard` event listener to `AppLayout.tsx` that:

1. **Listens for the custom event**
2. **Transforms the card data** to match the expected Persona format
3. **Calls handleSaveCard** to add to saved cards
4. **Saves to localStorage** automatically

---

## Implementation

### Code Added:
```typescript
const handleSaveCardEvent = (event: any) => {
  console.log('💾 AppLayout: Received saveCard event:', event.detail);
  const cardData = event.detail;
  
  // Handle persona card from Audience Insights page
  if (cardData.type === 'persona') {
    const personaData: Persona = {
      id: cardData.segment || cardData.title,
      name: cardData.title,
      description: cardData.description,
      category: cardData.category,
      demographics: {
        age: '',
        income: '',
        location: '',
        interests: []
      },
      insights: cardData.description
    };
    handleSaveCard({ type: 'persona', data: personaData });
  } else {
    handleSaveCard(cardData);
  }
};

// Add to event listeners
window.addEventListener('saveCard', handleSaveCardEvent);

// Add to cleanup
window.removeEventListener('saveCard', handleSaveCardEvent);
```

---

## How It Works Now

### **User Flow:**

1. **User generates Audience Insights report**
   - Persona module appears at top
   - Bookmark icon is unfilled (gray)

2. **User clicks bookmark icon**
   - Event dispatched: `saveCard` with persona data
   - `AppLayout` catches event
   - Transforms data to Persona format
   - Adds to `savedCards` state
   - Saves to `localStorage`
   - Bookmark icon fills with orange
   - State set to `isPersonaSaved = true`

3. **User sees saved card in left pane**
   - Persona appears in "Saved Cards" section
   - Can click to view details
   - Can remove from saved cards

4. **User refreshes page**
   - Saved cards persist (from localStorage)
   - Bookmark remains filled

---

## Testing

**To verify:**

1. Go to Audience Insights
2. Generate any report (e.g., Electronics > Audio)
3. Click bookmark icon in persona module
4. Check browser console for: `💾 AppLayout: Received saveCard event`
5. Check left pane for saved persona card
6. Refresh page
7. Verify card is still there

---

## Files Modified

1. **`deal-library-frontend/src/components/AppLayout.tsx`**
   - Added `handleSaveCardEvent` function
   - Added event listener for `saveCard`
   - Transform persona data format
   - Added to cleanup

---

**Status:** ✅ FIXED  
**Ready for testing**  
**Date:** October 9, 2025



