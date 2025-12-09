import { Deal } from '@/types/deal';
import { ShoppingCart, Trash2, Bookmark, BookmarkCheck } from 'lucide-react';

// Deal card component for chat interface - simplified design

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  onAddToCart?: () => void;
  onRemoveFromCart?: () => void;
  isInCart?: boolean;
  onSaveCard?: (card: { type: 'deal' | 'persona' | 'audience-insights' | 'market-sizing' | 'geo-cards', data: any }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export default function DealCard({ deal, onClick, onAddToCart, onRemoveFromCart, isInCart = false, onSaveCard, onUnsaveCard, isSaved }: DealCardProps) {
  const isCommerceAudience = (deal.dealName || '').toLowerCase().includes('purchase intender');
  const cardId = `deal-${deal.id}`;
  const saved = isSaved ? isSaved(cardId) : false;
  
  return (
    <div 
      className={`card p-6 hover:shadow-sovrn-lg transition-all duration-200 cursor-pointer group ${
        isCommerceAudience 
          ? 'border-l-4 border-brand-gold bg-gradient-to-r from-brand-gold/5 to-transparent' 
          : ''
      }`}
      onClick={onClick}
    >
      {/* Deal Name with Bookmark */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
            {deal.dealName}
          </h3>
          {isCommerceAudience && (
            <span className="text-lg">🛍️</span>
          )}
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
      <p className="text-neutral-600 text-sm leading-relaxed mb-4">
        {deal.description}
      </p>

      {/* Environment */}
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
          {deal.environment}
        </span>
      </div>

      {/* Persona Insights */}
      {deal.personaInsights && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{deal.personaInsights.emoji}</span>
            <h4 className="font-semibold text-blue-900">{deal.personaInsights.personaName}</h4>
          </div>
          <p className="text-sm text-blue-800 mb-2 font-medium">{deal.personaInsights.coreInsight}</p>
          <div className="space-y-1">
            <div className="text-xs text-blue-700">
              <span className="font-medium">Creative Hook:</span> {deal.personaInsights.actionableStrategy.creativeHook}
            </div>
            <div className="text-xs text-blue-700">
              <span className="font-medium">Media Strategy:</span> {deal.personaInsights.actionableStrategy.mediaTargeting}
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <div className="pt-4 border-t border-neutral-200">
        {isInCart ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromCart?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Remove from Cart
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              isCommerceAudience
                ? 'bg-gradient-to-r from-brand-gold to-brand-orange text-brand-charcoal hover:shadow-sovrn-lg hover:scale-105'
                : 'bg-brand-gold/10 text-brand-charcoal hover:bg-brand-gold/20'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
