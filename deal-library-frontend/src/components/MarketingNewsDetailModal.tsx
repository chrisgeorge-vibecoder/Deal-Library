import React from 'react';
import { X, Newspaper, ExternalLink, Calendar, Bookmark, BookmarkCheck, Building2, Lightbulb } from 'lucide-react';
import { MarketingNews } from '@/types/deal';

interface MarketingNewsDetailModalProps {
  news: MarketingNews | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'marketing-news', data: MarketingNews }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export function MarketingNewsDetailModal({ 
  news, 
  isOpen, 
  onClose, 
  onSaveCard, 
  onUnsaveCard, 
  isSaved 
}: MarketingNewsDetailModalProps) {
  if (!isOpen || !news) return null;

  const cardId = `marketing-news-${news.id}`;
  const saved = isSaved ? isSaved(cardId) : false;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getSourceColor = (source: string) => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('adweek')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (sourceLower.includes('adage')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (sourceLower.includes('digiday')) return 'bg-green-100 text-green-800 border-green-200';
    if (sourceLower.includes('drum')) return 'bg-red-100 text-red-800 border-red-200';
    if (sourceLower.includes('adexchanger')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (sourceLower.includes('marketecture')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (sourceLower.includes('substack')) return 'bg-pink-100 text-pink-800 border-pink-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleSaveToggle = () => {
    if (saved && onUnsaveCard) {
      onUnsaveCard(cardId);
    } else if (!saved && onSaveCard) {
      onSaveCard({ type: 'marketing-news', data: news });
    }
  };

  const handleVisitArticle = () => {
    if (news.url && news.url !== '#') {
      window.open(news.url, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-200">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-primary-50 rounded-lg">
              <Newspaper className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-tight">
                {news.headline}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-sm px-3 py-1 rounded-full border ${getSourceColor(news.source)}`}>
                  {news.source}
                </span>
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(news.publishDate)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Close and Save buttons */}
          <div className="flex items-center gap-2 ml-4">
            {onSaveCard && onUnsaveCard && (
              <button
                onClick={handleSaveToggle}
                className={`p-2 rounded-lg transition-colors border ${
                  saved
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
                    : 'text-neutral-400 hover:text-blue-600 hover:bg-blue-50 border-neutral-200'
                }`}
                title={saved ? 'Remove from saved' : 'Save card'}
              >
                {saved ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Synopsis */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-3">Summary</h3>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <p className="text-neutral-700 leading-relaxed">
                {news.synopsis}
              </p>
            </div>
          </div>

          {/* Companies */}
          {news.companies && news.companies.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-3">Companies Mentioned</h3>
              <div className="flex flex-wrap gap-2">
                {news.companies.map((company, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-medium"
                  >
                    <Building2 className="w-4 h-4" />
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights */}
          {news.keyInsights && news.keyInsights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-3">Key Insights</h3>
              <div className="space-y-3">
                {news.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-neutral-700 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Read Article Button */}
          <div className="pt-4 border-t border-neutral-200">
            <button
              onClick={handleVisitArticle}
              disabled={!news.url || news.url === '#'}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                news.url && news.url !== '#'
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              {news.url && news.url !== '#' ? 'Visit Source Website' : 'Source Link Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
