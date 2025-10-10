'use client';

import { Deal } from '@/types/deal';
import AudienceExplorer from '@/components/AudienceExplorer';
import { useSaveCard, useCart } from '@/components/AppLayout';

export default function IntelligenceCardsPage() {
  // Get cart and save/unsave functions from AppLayout context
  const { onSaveCard, onUnsaveCard, isSaved } = useSaveCard();
  const { onAddToCart, onRemoveFromCart, isInCart } = useCart();

  const handleDealClick = (deal: Deal) => {
    console.log('📋 Intelligence Cards: Deal clicked, dispatching event to AppLayout');
    const event = new CustomEvent('openDealModal', { detail: { deal } });
    window.dispatchEvent(event);
  };

  return (
    <div className="h-full">
      <AudienceExplorer
        onDealClick={handleDealClick}
        onAddToCart={onAddToCart}
        onRemoveFromCart={onRemoveFromCart}
        isInCart={isInCart}
        onSwitchToChat={(query) => {
          // Navigate to main page with query
          window.location.href = `/?search=${encodeURIComponent(query)}`;
        }}
        onSaveCard={onSaveCard}
        onUnsaveCard={onUnsaveCard}
        isSaved={isSaved}
      />

      {/* Note: Deal Detail Modal is now managed in AppLayout.tsx */}
    </div>
  );
}
