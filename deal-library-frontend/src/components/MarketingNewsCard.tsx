import React from 'react';
import { Newspaper, ExternalLink, Bookmark, BookmarkCheck, Building2, Lightbulb } from 'lucide-react';
import { MarketingNews } from '@/types/deal';

interface MarketingNewsCardProps {
  news: MarketingNews;
  onClick?: () => void;
  onViewDetails?: () => void;
  onSaveCard?: () => void;
  onUnsaveCard?: () => void;
  isSaved?: boolean;
}

export default function MarketingNewsCard({ 
  news, 
  onClick, 
  onViewDetails,
  onSaveCard,
  onUnsaveCard,
  isSaved = false 
}: MarketingNewsCardProps) {
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getSourceColor = (source: string) => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('adweek')) return 'bg-blue-100 text-blue-800';
    if (sourceLower.includes('adage')) return 'bg-purple-100 text-purple-800';
    if (sourceLower.includes('digiday')) return 'bg-green-100 text-green-800';
    if (sourceLower.includes('drum')) return 'bg-red-100 text-red-800';
    if (sourceLower.includes('adexchanger')) return 'bg-orange-100 text-orange-800';
    if (sourceLower.includes('marketecture')) return 'bg-indigo-100 text-indigo-800';
    if (sourceLower.includes('substack')) return 'bg-pink-100 text-pink-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div 
      className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <Newspaper className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {news.headline}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getSourceColor(news.source)}`}>
                {news.source}
              </span>
              <span className="text-xs text-neutral-500">
                {formatDate(news.publishDate)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Save button */}
        {(onSaveCard || onUnsaveCard) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isSaved && onUnsaveCard) {
                onUnsaveCard();
              } else if (!isSaved && onSaveCard) {
                onSaveCard();
              }
            }}
            className={`p-2 rounded-lg transition-colors border flex-shrink-0 ${
              isSaved
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
                : 'text-neutral-400 hover:text-blue-600 hover:bg-blue-50 border-neutral-200'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save card'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Synopsis */}
      <div className="mb-4">
        <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">
          {news.synopsis}
        </p>
      </div>

      {/* Companies */}
      {news.companies && news.companies.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-neutral-700">Companies</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {news.companies.slice(0, 3).map((company, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200"
              >
                {company}
              </span>
            ))}
            {news.companies.length > 3 && (
              <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md">
                +{news.companies.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Key Insights */}
      {news.keyInsights && news.keyInsights.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-3 h-3 text-amber-600" />
            <span className="text-xs font-medium text-neutral-700">Key Insights</span>
          </div>
          <div className="space-y-1">
            {news.keyInsights.slice(0, 2).map((insight, index) => (
              <div key={index} className="text-xs text-neutral-600 leading-relaxed">
                • {insight}
              </div>
            ))}
            {news.keyInsights.length > 2 && (
              <div className="text-xs text-neutral-500 italic">
                +{news.keyInsights.length - 2} more insights
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (news.url && news.url !== '#') {
              window.open(news.url, '_blank');
            }
          }}
          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
          disabled={!news.url || news.url === '#'}
        >
          <ExternalLink className="w-3 h-3" />
          <span>Visit Source</span>
        </button>
      </div>
    </div>
  );
}
