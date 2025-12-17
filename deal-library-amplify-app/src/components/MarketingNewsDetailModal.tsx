'use client';

import React from 'react';
import { X, Newspaper, ExternalLink, Calendar, Bookmark, BookmarkCheck, Building2, Lightbulb } from 'lucide-react';
import { MarketingNews } from '@/types/deal';
import { getStrategyCardStyle } from '@/data/strategyCardStyles';

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
  const style = getStrategyCardStyle('Marketing News');

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
    if (sourceLower.includes('adweek')) return 'bg-blue-100 text-blue-800';
    if (sourceLower.includes('adage')) return 'bg-purple-100 text-purple-800';
    if (sourceLower.includes('digiday')) return 'bg-green-100 text-green-800';
    if (sourceLower.includes('drum')) return 'bg-red-100 text-red-800';
    if (sourceLower.includes('adexchanger')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleSaveToggle = () => {
    if (saved && onUnsaveCard) {
      onUnsaveCard(cardId);
    } else if (!saved && onSaveCard) {
      onSaveCard({ type: 'marketing-news', data: news });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-3xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored Header */}
        <div className={`${style.headerBg} p-6 sm:rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div className="text-white flex-1">
                <h3 className="text-lg sm:text-xl font-bold leading-tight">{news.headline}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSourceColor(news.source)}`}>
                    {news.source}
                  </span>
                  <span className="text-white/70 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(news.date)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onSaveCard && onUnsaveCard && isSaved && (
                <button onClick={handleSaveToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    saved ? 'bg-white text-slate-600' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}>
                  {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              )}
              <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Section 1: Synopsis - The Insight */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <Newspaper className={`w-4 h-4 ${style.text}`} />
              </div>
              <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Synopsis</h4>
            </div>
            <p className="text-neutral-700 leading-relaxed text-lg">{news.synopsis}</p>
          </div>

          {/* Section 2: Marketing Insight - The Opportunity */}
          {news.marketingInsight && (
            <div className={`${style.bg} border ${style.border} rounded-xl p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className={`w-5 h-5 ${style.text}`} />
                <h4 className={`font-semibold ${style.text}`}>Marketing Insight</h4>
              </div>
              <p className="text-neutral-700 leading-relaxed">{news.marketingInsight}</p>
            </div>
          )}

          {/* Section 3: Mentioned Brands - The Action */}
          {news.mentionedBrands && news.mentionedBrands.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 ${style.bg} rounded-lg`}>
                  <Building2 className={`w-4 h-4 ${style.text}`} />
                </div>
                <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Mentioned Brands</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {news.mentionedBrands.map((brand, index) => (
                  <span key={index} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-full border border-neutral-200">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          {news.topics && news.topics.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Topics</h4>
              <div className="flex flex-wrap gap-2">
                {news.topics.map((topic, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 sm:rounded-b-lg">
          <div className="flex items-center justify-between">
            <button onClick={onClose}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium">
              Close
            </button>
            {news.url && news.url !== '#' && (
              <a href={news.url} target="_blank" rel="noopener noreferrer"
                className={`px-4 py-2 ${style.headerBg} text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2`}>
                <ExternalLink className="w-4 h-4" />
                Read Full Article
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
