import { Deal } from '@/types/deal';
import { ShoppingCart, Trash2, Bookmark, BookmarkCheck } from 'lucide-react';

// Unified Deal card component - single source of truth for all deal card styling

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  onAddToCart?: () => void;
  onRemoveFromCart?: () => void;
  isInCart?: boolean;
  onSaveCard?: (card: { type: 'deal' | 'persona' | 'audience-insights' | 'market-sizing' | 'geo-cards', data: any }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
  // Optional: show additional details like bid guidance and media type
  showBidGuidance?: boolean;
  showMediaType?: boolean;
  // Optional: compact mode for chat interface (smaller padding/text)
  compact?: boolean;
}

export default function DealCard({ 
  deal, 
  onClick, 
  onAddToCart, 
  onRemoveFromCart, 
  isInCart = false, 
  onSaveCard, 
  onUnsaveCard, 
  isSaved,
  showBidGuidance = false,
  showMediaType = false,
  compact = false
}: DealCardProps) {
  const cardId = `deal-${deal.id}`;
  const saved = isSaved ? isSaved(cardId) : false;
  
  // Dynamic classes based on compact mode
  const cardPadding = compact ? 'p-4' : 'p-6';
  const titleSize = compact ? 'text-base' : 'text-lg';
  const buttonPadding = compact ? 'px-3 py-2' : 'px-4 py-2';
  const buttonTextSize = compact ? 'text-xs' : 'text-sm';
  const iconSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const tagPadding = compact ? 'px-2 py-1' : 'px-3 py-1';
  const tagTextSize = compact ? 'text-xs' : 'text-sm';
  const borderSpacing = compact ? 'pt-3' : 'pt-4';
  const sectionSpacing = compact ? 'mb-3' : 'mb-4';
  
  return (
    <div 
      className={`card ${cardPadding} hover:shadow-sovrn-lg transition-all duration-200 cursor-pointer group`}
      onClick={onClick}
    >
      {/* Deal Name with Bookmark */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <h3 className={`${titleSize} font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors`}>
            {deal.dealName}
          </h3>
        </div>
        {onSaveCard && onUnsaveCard && isSaved && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (saved) {
                onUnsaveCard(cardId);
              } else {
                onSaveCard({ type: 'deal', data: deal });
              }
            }}
            className={`p-2 rounded-lg transition-colors border ${
              saved
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
                : 'text-neutral-400 hover:text-blue-600 hover:bg-blue-50 border-neutral-200'
            }`}
            title={saved ? 'Remove from saved' : 'Save card'}
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Description */}
      <p className={`text-neutral-600 ${buttonTextSize} leading-relaxed ${sectionSpacing}`}>
        {deal.description}
      </p>

      {/* Environment and optional Media Type tags */}
      <div className={`flex items-center gap-2 ${sectionSpacing}`}>
        <span className={`inline-flex items-center ${tagPadding} bg-primary-100 text-primary-800 ${tagTextSize} font-medium rounded-full`}>
          {deal.environment}
        </span>
        {showMediaType && deal.mediaType && (
          <span className={`inline-flex items-center ${tagPadding} bg-secondary-100 text-secondary-800 ${tagTextSize} font-medium rounded-full`}>
            {deal.mediaType}
          </span>
        )}
      </div>

      {/* Optional Bid Guidance */}
      {showBidGuidance && deal.bidGuidance && (
        <div className={sectionSpacing}>
          <span className="text-xs text-neutral-500 font-medium">Bid Guidance:</span>
          <span className="text-xs text-neutral-600 ml-1">{deal.bidGuidance}</span>
        </div>
      )}

      {/* Add to Cart Button */}
      <div className={`${borderSpacing} border-t border-neutral-200`}>
        {isInCart ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromCart?.();
            }}
            className={`w-full flex items-center justify-center gap-2 ${buttonPadding} bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors ${buttonTextSize} font-medium`}
          >
            <Trash2 className={iconSize} />
            Remove from Cart
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
            className={`w-full flex items-center justify-center gap-2 ${buttonPadding} rounded-lg transition-colors ${buttonTextSize} font-medium bg-brand-gold/10 text-brand-charcoal hover:bg-brand-gold/20`}
          >
            <ShoppingCart className={iconSize} />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
