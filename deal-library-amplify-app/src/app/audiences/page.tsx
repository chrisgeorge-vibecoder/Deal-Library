'use client';

import { useState } from 'react';
import AudienceBrowser from '@/components/AudienceBrowser';
import AudienceDetailModal from '@/components/AudienceDetailModal';
import { AudienceSegment } from '@/types/audience';
import { useCart } from '@/components/AppLayout';

export default function AudiencesPage() {
  // Get cart context
  const { cart, onAddToCart, onRemoveFromCart, isInCart: isInCartContext } = useCart();
  
  // Modal state
  const [selectedSegment, setSelectedSegment] = useState<AudienceSegment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle card click from browse mode
  const handleCardClick = (segment: AudienceSegment) => {
    setSelectedSegment(segment);
    setIsModalOpen(true);
  };

  // Handle add audience to cart
  const handleAddToCart = (segment: AudienceSegment) => {
    // Convert audience segment to cart format
    const cartItem = {
      id: segment.sovrnSegmentId,
      dealName: segment.segmentName,
      category: segment.segmentType,
      tier1: segment.tier1,
      tier2: segment.tier2,
      description: segment.segmentDescription,
      cpm: segment.cpm,
      mediaPercentCost: segment.mediaPercentCost,
      _isAudience: true,
      _audienceData: segment
    };
    onAddToCart(cartItem);
  };

  // Handle remove audience from cart
  const handleRemoveFromCart = (segmentId: string) => {
    onRemoveFromCart(segmentId);
  };

  // Check if audience is in cart
  const isInCart = (segmentId: string) => {
    return isInCartContext(segmentId);
  };

  // Handle request custom audience
  const handleRequestCustomAudience = () => {
    const event = new CustomEvent('openCustomDealForm');
    window.dispatchEvent(event);
  };

  // Handle open cart
  const handleOpenCart = () => {
    const event = new CustomEvent('openCart');
    window.dispatchEvent(event);
  };

  return (
    <div className="h-full">
      <AudienceBrowser
        onAudienceClick={handleCardClick}
        onOpenCart={handleOpenCart}
        onRequestCustomAudience={handleRequestCustomAudience}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        isInCart={isInCart}
        cart={cart}
      />

      {/* Detail Modal */}
      <AudienceDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        segment={selectedSegment}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        isInCart={isInCart}
      />
    </div>
  );
}
