'use client';

import React from 'react';
import { X, BarChart3, TrendingUp, Users, Target, DollarSign, Lightbulb, ShoppingCart, Bookmark, BookmarkCheck } from 'lucide-react';
import { MarketSizing } from './MarketSizingCard';
import { getStrategyCardStyle } from '@/data/strategyCardStyles';
import { HighlightedText } from './HighlightedText';

interface MarketSizingDetailModalProps {
  sizing: MarketSizing | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDeals?: (sizing: MarketSizing) => void;
  onSaveCard?: (card: { type: 'market-sizing', data: MarketSizing }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export function MarketSizingDetailModal({ sizing, isOpen, onClose, onViewDeals, onSaveCard, onUnsaveCard, isSaved }: MarketSizingDetailModalProps) {
  if (!isOpen || !sizing) return null;
  
  const style = getStrategyCardStyle('Market Intelligence');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored Header */}
        <div className={`${style.headerBg} p-6 sm:rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-xl sm:text-2xl font-bold">{sizing.marketName}</h3>
                <p className="text-white/80 text-sm">Market Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onSaveCard && onUnsaveCard && isSaved && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSaved(`market-sizing-${sizing.marketName}`)) {
                      onUnsaveCard(`market-sizing-${sizing.marketName}`);
                    } else {
                      onSaveCard({ type: 'market-sizing', data: sizing });
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isSaved(`market-sizing-${sizing.marketName}`)
                      ? 'bg-white text-rose-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isSaved(`market-sizing-${sizing.marketName}`) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Section 1: The Insight - Market Size */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <DollarSign className={`w-4 h-4 ${style.text}`} />
              </div>
              <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Market Overview</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-xl border border-rose-200">
                <h5 className="text-xs font-semibold text-rose-600 uppercase mb-2">Total Market Size</h5>
                <div className="text-2xl font-bold text-rose-900 mb-1">
                  <HighlightedText text={sizing.totalMarketSize || 'N/A'} />
                </div>
                <div className="flex items-center gap-2 text-sm text-rose-700">
                  <TrendingUp className="w-4 h-4" />
                  <span>{sizing.growthRate} annual growth</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <h5 className="text-xs font-semibold text-green-600 uppercase mb-2">Addressable Market</h5>
                <div className="text-xl font-bold text-green-900 mb-1">
                  <HighlightedText text={sizing.addressableValue || 'N/A'} />
                </div>
                <p className="text-sm text-green-700">{sizing.addressableMarket}</p>
              </div>
            </div>

            {/* Demographics Row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-neutral-500 mb-1">Population</div>
                <div className="text-neutral-900 font-semibold text-sm">
                  <HighlightedText text={sizing.demographics?.population || 'N/A'} />
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-neutral-500 mb-1">Target Age</div>
                <div className="text-neutral-900 font-semibold text-sm">{sizing.demographics?.targetAge || 'N/A'}</div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-neutral-500 mb-1">Penetration</div>
                <div className="text-neutral-900 font-semibold text-sm">
                  <HighlightedText text={sizing.demographics?.penetration || 'N/A'} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: The Opportunity - Key Insights */}
          <div className={`${style.bg} border ${style.border} rounded-xl p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className={`w-5 h-5 ${style.text}`} />
              <h4 className={`font-semibold ${style.text}`}>Market Insights</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h5 className="text-xs font-semibold text-green-700 uppercase mb-2">Key Drivers</h5>
                <ul className="space-y-1.5">
                  {sizing.marketInsights?.keyDrivers?.slice(0, 3).map((driver, index) => (
                    <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-red-700 uppercase mb-2">Barriers</h5>
                <ul className="space-y-1.5">
                  {sizing.marketInsights?.barriers?.slice(0, 3).map((barrier, index) => (
                    <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{barrier}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-blue-700 uppercase mb-2">Opportunities</h5>
                <ul className="space-y-1.5">
                  {sizing.marketInsights?.opportunities?.slice(0, 3).map((opportunity, index) => (
                    <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: The Action - Growth Trends */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <TrendingUp className={`w-4 h-4 ${style.text}`} />
              </div>
              <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Growth Trends</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-green-600">
                    <HighlightedText text={sizing.growthTrends?.growthRate || 'N/A'} />
                  </span>
                  <span className="text-sm text-neutral-500">YoY Growth</span>
                </div>
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Seasonality</div>
                <p className="text-sm text-neutral-700">{sizing.growthTrends?.seasonality || 'N/A'}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Key Opportunities</div>
                <ul className="space-y-1.5">
                  {sizing.growthTrends?.keyOpportunities?.slice(0, 3).map((opp, index) => (
                    <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 ${style.bgSolid} rounded-full mt-1.5 flex-shrink-0`}></span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sources */}
          {sizing.sources && sizing.sources.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Sources</h4>
              <div className="space-y-1">
                {sizing.sources.map((src, idx) => (
                  <div key={idx} className="text-xs text-neutral-600 flex items-center gap-2">
                    <span className="text-neutral-400">•</span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-rose-600 hover:underline">
                        {src.title || src.url}
                      </a>
                    ) : (
                      <span>{src.title}</span>
                    )}
                    {src.note && <span className="text-neutral-400">— {src.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 sm:rounded-b-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
            >
              Close
            </button>
            {onViewDeals && (
              <button
                onClick={() => onViewDeals(sizing)}
                className={`px-4 py-2 ${style.headerBg} text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2`}
              >
                <ShoppingCart className="w-4 h-4" />
                Find Deals
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
