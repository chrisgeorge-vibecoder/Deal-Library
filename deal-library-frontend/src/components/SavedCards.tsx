import React from 'react';
import { BookmarkCheck, X, ShoppingCart, Users, BarChart3, MapPin, Lightbulb, TrendingUp } from 'lucide-react';
import { Deal, Persona, AudienceInsights, MarketSizing, GeoCard } from '@/types/deal';

interface SavedCard {
  type: 'deal' | 'persona' | 'audience-insights' | 'market-sizing' | 'geo-cards';
  data: any;
  savedAt: string;
}

interface SavedCardsProps {
  savedCards: SavedCard[];
  onUnsaveCard: (cardId: string) => void;
  onCardClick?: (card: SavedCard) => void;
}

export default function SavedCards({ savedCards, onUnsaveCard, onCardClick }: SavedCardsProps) {
  const getCardIcon = (type: string) => {
    switch (type) {
      case 'deal':
        return <ShoppingCart className="w-4 h-4 text-blue-600" />;
      case 'persona':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'audience-insights':
        return <Lightbulb className="w-4 h-4 text-purple-600" />;
      case 'market-sizing':
        return <BarChart3 className="w-4 h-4 text-orange-600" />;
      case 'geo-cards':
        return <MapPin className="w-4 h-4 text-indigo-600" />;
      default:
        return <BookmarkCheck className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCardTitle = (card: SavedCard) => {
    switch (card.type) {
      case 'deal':
        return (card.data as Deal).dealName;
      case 'persona':
        return (card.data as Persona).name;
      case 'audience-insights':
        return (card.data as AudienceInsights).audienceName;
      case 'market-sizing':
        return (card.data as MarketSizing).marketName;
      case 'geo-cards':
        return (card.data as GeoCard).audienceName;
      default:
        return 'Unknown Card';
    }
  };

  const getCardSubtitle = (card: SavedCard) => {
    switch (card.type) {
      case 'deal':
        const deal = card.data as Deal;
        return `${deal.mediaType} • ${deal.environment}`;
      case 'persona':
        const persona = card.data as Persona;
        return `${persona.category} • ${persona.dealCount} deals`;
      case 'audience-insights':
        return 'Audience Insights';
      case 'market-sizing':
        return 'Market Analysis';
      case 'geo-cards':
        return 'Geo Insights';
      default:
        return '';
    }
  };

  const getCardId = (card: SavedCard) => {
    switch (card.type) {
      case 'deal':
        return `deal-${(card.data as Deal).dealId}`;
      case 'persona':
        return `persona-${(card.data as Persona).id}`;
      case 'audience-insights':
        return `audience-insights-${(card.data as AudienceInsights).audienceName}`;
      case 'market-sizing':
        return `market-sizing-${(card.data as MarketSizing).marketName}`;
      case 'geo-cards':
        return `geo-cards-${(card.data as GeoCard).id}`;
      default:
        return '';
    }
  };

  const formatSavedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (savedCards.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <BookmarkCheck className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No saved cards yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Save cards from detailed modals to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-blue-600" />
          Saved Cards ({savedCards.length})
        </h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {savedCards.map((card, index) => (
          <div
            key={`${getCardId(card)}-${index}`}
            className="group relative mx-2 mb-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => onCardClick?.(card)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getCardIcon(card.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {getCardTitle(card)}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {getCardSubtitle(card)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatSavedDate(card.savedAt)}
                </p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnsaveCard(getCardId(card));
                }}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Remove from saved"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
