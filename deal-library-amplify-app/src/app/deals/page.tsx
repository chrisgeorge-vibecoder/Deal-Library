'use client';

import { Deal } from '@/types/deal';
import DealBrowser from '@/components/DealBrowser';
import { useSaveCard, useCart } from '@/components/AppLayout';

export default function DealsPage() {
  // Get cart and save/unsave functions from AppLayout context
  const { onSaveCard, onUnsaveCard, isSaved } = useSaveCard();
  const { onAddToCart, onRemoveFromCart, isInCart, cart } = useCart();

  const handleDealClick = (deal: Deal) => {
    console.log('📋 Deals Page: Deal clicked, dispatching event to AppLayout');
    const event = new CustomEvent('openDealModal', { detail: { deal } });
    window.dispatchEvent(event);
  };

  const handleRequestCustomDeal = () => {
    console.log('📋 Deals Page: Request Custom Deal clicked');
    const event = new CustomEvent('openCustomDealForm');
    window.dispatchEvent(event);
  };

  const handleOpenCart = () => {
    console.log('📋 Deals Page: Open Cart clicked');
    const event = new CustomEvent('openCart');
    window.dispatchEvent(event);
  };

  return (
    <div className="h-full">
      <DealBrowser
        onDealClick={handleDealClick}
        onAddToCart={onAddToCart}
        onRemoveFromCart={onRemoveFromCart}
        isInCart={isInCart}
        onRequestCustomDeal={handleRequestCustomDeal}
        cart={cart}
        onOpenCart={handleOpenCart}
      />

      {/* Note: Deal Detail Modal and Custom Deal Form are managed in AppLayout.tsx */}
    </div>
  );
}
