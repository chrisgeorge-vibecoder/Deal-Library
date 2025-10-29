import React from 'react';
import { X, BookmarkCheck, Users, BarChart3, MapPin, Lightbulb, TrendingUp, BookOpen, Target, Building2, Newspaper, FileText, Award, Sparkles } from 'lucide-react';
import { SavedCard } from '@/types/deal';

interface SavedCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCards: SavedCard[];
  onUnsaveCard: (cardId: string) => void;
  onCardClick?: (card: SavedCard) => void;
  onClearAll?: () => void;
}

export default function SavedCardsModal({ 
  isOpen, 
  onClose, 
  savedCards, 
  onUnsaveCard, 
  onCardClick,
  onClearAll
}: SavedCardsModalProps) {
  if (!isOpen) return null;

  const handleExportCards = () => {
    const exportData = savedCards.map(card => ({
      'Type': card.type,
      'Title': getCardTitle(card),
      'Subtitle': getCardSubtitle(card),
      'Saved At': new Date(card.savedAt).toLocaleString(),
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovrn-saved-cards-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (window.confirm(`Are you sure you want to clear all ${savedCards.length} saved card${savedCards.length !== 1 ? 's' : ''}?`)) {
      onClearAll?.();
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'deal':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'persona':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'audience-insights':
        return <Lightbulb className="w-4 h-4 text-purple-600" />;
      case 'market-sizing':
        return <BarChart3 className="w-4 h-4 text-orange-600" />;
      case 'geo-cards':
        return <MapPin className="w-4 h-4 text-indigo-600" />;
      case 'research':
        return <BookOpen className="w-4 h-4 text-teal-600" />;
      case 'marketing-swot':
        return <Target className="w-4 h-4 text-red-600" />;
      case 'company-profile':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'marketing-news':
        return <Newspaper className="w-4 h-4 text-pink-600" />;
      case 'competitive-intelligence':
        return <Target className="w-4 h-4 text-amber-600" />;
      case 'content-strategy':
        return <FileText className="w-4 h-4 text-cyan-600" />;
      case 'brand-strategy':
        return <Award className="w-4 h-4 text-violet-600" />;
      case 'market-profile':
        return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      case 'campaign-brief':
        return <Sparkles className="w-4 h-4 text-brand-gold" />;
      case 'audience-taxonomy':
        return <Users className="w-4 h-4 text-brand-orange" />;
      default:
        return <BookmarkCheck className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCardTitle = (card: SavedCard) => {
    switch (card.type) {
      case 'deal':
        return (card.data as any).dealName;
      case 'persona':
        return (card.data as any).name;
      case 'audience-insights':
        return (card.data as any).audienceName;
      case 'market-sizing':
        return (card.data as any).marketName;
      case 'geo-cards':
        return (card.data as any).audienceName;
      case 'research':
        return (card.data as any).title;
      case 'marketing-swot':
        return `Marketing SWOT: ${(card.data as any).companyName}`;
      case 'company-profile':
        return `${(card.data as any).companyInfo?.name || 'Company'} (${(card.data as any).stockSymbol})`;
      case 'marketing-news':
        return (card.data as any).headline;
      case 'competitive-intelligence':
        return `Competitive Intelligence: ${(card.data as any).competitorOrIndustry}`;
      case 'content-strategy':
        return `Content Strategy: ${(card.data as any).industryOrTopic}`;
      case 'brand-strategy':
        return `Brand Strategy: ${(card.data as any).brandOrCategory}`;
      case 'market-profile':
        return (card.data as any).name;
      case 'campaign-brief':
        return `Campaign Brief: ${(card.data as any).marketName}`;
      case 'audience-taxonomy':
        return (card.data as any).segmentName || 'Audience Segment';
      default:
        return 'Unknown Card';
    }
  };

  const getCardSubtitle = (card: SavedCard) => {
    switch (card.type) {
      case 'deal':
        const deal = card.data as any;
        return `${deal.mediaType} • ${deal.environment}`;
      case 'persona':
        const persona = card.data as any;
        return `${persona.category} • ${persona.dealCount} deals`;
      case 'audience-insights':
        return 'Audience Insights';
      case 'market-sizing':
        return 'Market Analysis';
      case 'geo-cards':
        return 'Geo Insights';
      case 'research':
        const research = card.data as any;
        return `${research.source || 'Research'} • ${research.category || 'Study'}`;
      case 'marketing-swot':
        return 'Marketing SWOT Analysis';
      case 'company-profile':
        const profile = card.data as any;
        return `Company Profile • ${profile.companyInfo?.sector || 'Public Company'}`;
      case 'marketing-news':
        const news = card.data as any;
        return `Marketing News • ${news.source}`;
      case 'competitive-intelligence':
        return 'Competitive Analysis';
      case 'content-strategy':
        return 'Content Planning';
      case 'brand-strategy':
        return 'Brand Positioning';
      case 'market-profile':
        const marketProfile = card.data as any;
        const geoLevelLabel = marketProfile.geoLevel?.charAt(0).toUpperCase() + marketProfile.geoLevel?.slice(1);
        return `${geoLevelLabel} • Market Insights`;
      case 'campaign-brief':
        const brief = card.data as any;
        const briefGeoLevelLabel = brief.marketGeoLevel?.charAt(0).toUpperCase() + brief.marketGeoLevel?.slice(1);
        return `${briefGeoLevelLabel} • AI Generated`;
      case 'audience-taxonomy':
        const audienceTax = card.data as any;
        return `${audienceTax.segmentType || 'Audience'} • ${audienceTax.tier1 || 'Taxonomy'}`;
      default:
        return '';
    }
  };

  const getCardId = (card: SavedCard) => {
    switch (card.type) {
      case 'deal':
        return `deal-${(card.data as any).dealId}`;
      case 'persona':
        return `persona-${(card.data as any).id}`;
      case 'audience-insights':
        return `audience-insights-${(card.data as any).audienceName}`;
      case 'market-sizing':
        return `market-sizing-${(card.data as any).marketName}`;
      case 'geo-cards':
        return `geo-cards-${(card.data as any).id}`;
      case 'marketing-swot':
        return `marketing-swot-${(card.data as any).companyName}`;
      case 'company-profile':
        return `company-profile-${(card.data as any).stockSymbol}`;
      case 'marketing-news':
        return `marketing-news-${(card.data as any).id}`;
      case 'competitive-intelligence':
        return `competitive-intelligence-${(card.data as any).competitorOrIndustry}`;
      case 'content-strategy':
        return `content-strategy-${(card.data as any).industryOrTopic}`;
      case 'brand-strategy':
        return `brand-strategy-${(card.data as any).brandOrCategory}`;
      case 'research':
        return `research-${(card.data as any).id}`;
      case 'market-profile':
        return `market-profile-${(card.data as any).geoLevel}-${(card.data as any).name}`;
      case 'campaign-brief':
        return `campaign-brief-${(card.data as any).marketGeoLevel}-${(card.data as any).marketName}`;
      case 'audience-taxonomy':
        return `audience-taxonomy-${(card.data as any).sovrnSegmentId || 'unknown'}`;
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
        className="bg-white rounded-xl shadow-sovrn-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">Saved Cards</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClearAll}
              className="btn-secondary text-sm"
              disabled={savedCards.length === 0}
            >
              Clear All
            </button>
            <button 
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {savedCards.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkCheck className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-lg font-medium text-neutral-500 mb-2">No saved cards yet</h3>
              <p className="text-neutral-400">
                Save cards from Plan tools to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCards.map((card, index) => (
                  <div
                    key={`${getCardId(card)}-${index}`}
                    className="group relative p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
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
              
              <div className="border-t border-neutral-200 pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-neutral-900">
                    {savedCards.length} card{savedCards.length !== 1 ? 's' : ''} saved
                  </span>
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                    <button 
                      onClick={handleExportCards}
                      className="btn-primary"
                    >
                      Export Saved Cards
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
