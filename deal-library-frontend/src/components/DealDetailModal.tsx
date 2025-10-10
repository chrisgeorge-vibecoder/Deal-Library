import { Deal } from '@/types/deal';
import { X, Target, Globe, Video, DollarSign, ShoppingCart, Trash2, Bookmark, BookmarkCheck } from 'lucide-react';

interface DealDetailModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (deal: Deal) => void;
  onRemoveFromCart: (dealId: string) => void;
  isInCart: (dealId: string) => boolean;
  onSaveCard?: (card: { type: 'deal', data: Deal }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export default function DealDetailModal({ 
  deal, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onRemoveFromCart, 
  isInCart,
  onSaveCard,
  onUnsaveCard,
  isSaved
}: DealDetailModalProps) {
  if (!isOpen || !deal) return null;

  const isCommerceAudience = (deal.dealName || '').toLowerCase().includes('purchase intender');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`bg-white rounded-xl shadow-sovrn-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
          isCommerceAudience ? 'border-l-4 border-brand-gold' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex justify-between items-start p-6 border-b border-neutral-200 ${
          isCommerceAudience ? 'bg-gradient-to-r from-brand-gold/5 to-transparent' : ''
        }`}>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-neutral-900">{deal.dealName}</h2>
              {isCommerceAudience && (
                <span className="text-2xl">🛍️</span>
              )}
            </div>
            <p className="text-sm text-neutral-500 mb-4">ID: {deal.dealId}</p>
            <div className="flex gap-2">
              <span className="badge bg-primary-100 text-primary-800">
                {deal.environment}
              </span>
              <span className="badge bg-secondary-100 text-secondary-800">
                {deal.mediaType}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSaveCard && onUnsaveCard && isSaved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSaved(`deal-${deal.dealId}`)) {
                    onUnsaveCard(`deal-${deal.dealId}`);
                  } else {
                    onSaveCard({ type: 'deal', data: deal });
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved(`deal-${deal.dealId}`)
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-neutral-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isSaved(`deal-${deal.dealId}`) ? 'Remove from saved' : 'Save card'}
              >
                {isSaved(`deal-${deal.dealId}`) ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-neutral-500 hover:text-neutral-700 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Description</h3>
            <p className="text-neutral-700 leading-relaxed">{deal.description}</p>
          </div>

          {/* Details Grid - 2x2 Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Target className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Targeting</h4>
                <p className="text-neutral-600 text-sm">{deal.targeting}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Globe className="w-5 h-5 text-secondary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Environment</h4>
                <p className="text-neutral-600 text-sm">{deal.environment}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-100 rounded-lg">
                <Video className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Media Type</h4>
                <p className="text-neutral-600 text-sm">{deal.mediaType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Bid Guidance</h4>
                <p className="text-neutral-600 text-sm">{deal.bidGuidance}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Persona Insights */}
        {deal.personaInsights && (
          <div className="p-6 border-t border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">{deal.personaInsights.emoji}</span>
              Strategic Persona Insights
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">{deal.personaInsights.personaName}</h4>
                <p className="text-sm text-blue-800 font-medium">{deal.personaInsights.coreInsight}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-blue-900 mb-2">Creative Strategy</h5>
                  <p className="text-sm text-blue-700 mb-2">{deal.personaInsights.actionableStrategy.creativeHook}</p>
                  <div className="space-y-1">
                    <h6 className="font-medium text-blue-800 text-xs">Additional Creative Hooks:</h6>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {deal.personaInsights.creativeHooks.map((hook, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-500">•</span>
                          <span>{hook}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-blue-900 mb-2">Media Targeting</h5>
                  <p className="text-sm text-blue-700 mb-2">{deal.personaInsights.actionableStrategy.mediaTargeting}</p>
                  <div className="space-y-1">
                    <h6 className="font-medium text-blue-800 text-xs">Targeting Channels:</h6>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {deal.personaInsights.mediaTargeting.map((target, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-500">•</span>
                          <span>{target}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">Audience Motivation</h5>
                <p className="text-sm text-blue-700">{deal.personaInsights.audienceMotivation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-neutral-200 bg-neutral-50">
          <div className="text-sm text-neutral-600">
            Deal ID: {deal.id}
          </div>
          <div className="flex items-center gap-3">
            {isInCart(deal.id) ? (
              <button
                onClick={() => onRemoveFromCart(deal.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove from Cart
              </button>
            ) : (
              <button
                onClick={() => onAddToCart(deal)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isCommerceAudience
                    ? 'bg-gradient-to-r from-brand-gold to-brand-orange text-brand-charcoal hover:shadow-sovrn-lg hover:scale-105'
                    : 'bg-brand-gold/10 text-brand-charcoal hover:bg-brand-gold/20'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
