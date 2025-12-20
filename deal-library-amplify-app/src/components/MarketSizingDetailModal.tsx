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
        {/* Minimalist Header */}
        <div className="bg-white border-b border-slate-200/60 p-6 sm:rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                <BarChart3 className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">{sizing.marketName}</h3>
                <p className="text-sm text-slate-500 mt-0.5">Market Intelligence</p>
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
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
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
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Section 1: The Insight - Market Size */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <DollarSign className="w-4 h-4 text-slate-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Market Overview</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Total Market Size</h5>
                <div className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">
                  <HighlightedText text={sizing.totalMarketSize || 'N/A'} />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{sizing.growthRate} annual growth</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Addressable Market</h5>
                <div className="text-xl font-semibold text-slate-900 mb-1 tracking-tight">
                  <HighlightedText text={sizing.addressableValue || 'N/A'} />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{sizing.addressableMarket}</p>
              </div>
            </div>

            {/* Demographics Row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                <div className="text-xs font-medium text-slate-500 mb-1">Population</div>
                <div className="text-slate-900 font-semibold text-sm">
                  <HighlightedText text={sizing.demographics?.population || 'N/A'} />
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                <div className="text-xs font-medium text-slate-500 mb-1">Target Age</div>
                <div className="text-slate-900 font-semibold text-sm">{sizing.demographics?.targetAge || 'N/A'}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                <div className="text-xs font-medium text-slate-500 mb-1">Penetration</div>
                <div className="text-slate-900 font-semibold text-sm">
                  <HighlightedText text={sizing.demographics?.penetration || 'N/A'} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: The Opportunity - Key Insights */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-slate-600" />
              <h4 className="font-semibold text-slate-900 tracking-tight">Market Insights</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Key Drivers</h5>
                <ul className="space-y-1.5">
                  {sizing.marketInsights?.keyDrivers?.slice(0, 3).map((driver, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Barriers</h5>
                <ul className="space-y-1.5">
                  {sizing.marketInsights?.barriers?.slice(0, 3).map((barrier, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{barrier}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Opportunities</h5>
                <ul className="space-y-1.5">
                  {sizing.marketInsights?.opportunities?.slice(0, 3).map((opportunity, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></span>
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
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <TrendingUp className="w-4 h-4 text-slate-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Growth Trends</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-semibold text-slate-900 tracking-tight">
                    <HighlightedText text={sizing.growthTrends?.growthRate || 'N/A'} />
                  </span>
                  <span className="text-sm text-slate-500">YoY Growth</span>
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1 tracking-wide">Seasonality</div>
                <p className="text-sm text-slate-700 leading-relaxed">{sizing.growthTrends?.seasonality || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wide">Key Opportunities</div>
                <ul className="space-y-1.5">
                  {sizing.growthTrends?.keyOpportunities?.slice(0, 3).map((opp, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sources */}
          {sizing.sources && sizing.sources.length > 0 && (
            <div className="pt-4 border-t border-slate-200/60">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wide">Sources</h4>
              <div className="space-y-1">
                {sizing.sources.map((src, idx) => (
                  <div key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="text-slate-400">•</span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors">
                        {src.title || src.url}
                      </a>
                    ) : (
                      <span>{src.title}</span>
                    )}
                    {src.note && <span className="text-slate-400">— {src.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200/60 px-6 py-4 sm:rounded-b-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium border border-slate-200/60"
            >
              Close
            </button>
            {onViewDeals && (
              <button
                onClick={() => onViewDeals(sizing)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
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
