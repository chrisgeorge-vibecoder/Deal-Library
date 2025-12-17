import React, { useState } from 'react';
import { X, BarChart3, TrendingUp, Users, Target, Globe, DollarSign, Calendar, Lightbulb, ShoppingCart, Bookmark, BookmarkCheck, Presentation, FileText } from 'lucide-react';
import { MarketSizing } from './MarketSizingCard';
import { SlideView, SlideRenderer } from '@/components/slides';
import { generateMarketSizingSlides } from '@/lib/slideConfigs';

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
  const [viewMode, setViewMode] = useState<'detail' | 'slides'>('detail');
  
  if (!isOpen) {
    return null;
  }
  
  if (!sizing) {
    return null;
  }
  
  const slides = generateMarketSizingSlides(sizing);

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
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-neutral-200 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-semibold text-neutral-900">
                Market Analysis: {sizing.marketName}
              </h3>
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
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                      : 'text-neutral-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  title={isSaved(`market-sizing-${sizing.marketName}`) ? 'Remove from saved' : 'Save card'}
                >
                  {isSaved(`market-sizing-${sizing.marketName}`) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              )}
              <button onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg mt-3 w-fit">
            <button
              onClick={() => setViewMode('detail')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'detail' 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Detail</span>
            </button>
            <button
              onClick={() => setViewMode('slides')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'slides' 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Slides</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {viewMode === 'slides' ? (
          <div className="flex-1 min-h-[500px]">
            <SlideView
              slides={slides}
              cardType="market-sizing"
              cardTitle={sizing.marketName || 'Market Intelligence'}
            >
              {(slide) => <SlideRenderer slide={slide} slideIndex={slides.indexOf(slide)} />}
            </SlideView>
          </div>
        ) : (
        <div className="p-6 space-y-6">
          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-0 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-sm font-bold">ℹ</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-1">Market Sizing Data</h4>
                <p className="text-sm text-amber-700">
                  This analysis provides general market sizing and trend information. For specific competitive intelligence about individual companies, 
                  please use dedicated market research tools or consult industry reports.
                </p>
              </div>
            </div>
          </div>

          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <h4 className="font-semibold text-primary-800">Total Market Size</h4>
              </div>
              <div className="text-3xl font-bold text-primary-900 mb-1">{sizing.totalMarketSize}</div>
              <div className="flex items-center gap-2 text-sm text-primary-700">
                <TrendingUp className="w-4 h-4" />
                <span>{sizing.growthRate} annual growth</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Addressable Market</h4>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-900 mb-1">{sizing.addressableValue}</div>
              <div className="text-sm text-green-700">{sizing.addressableMarket}</div>
            </div>
          </div>

          {/* Demographics */}
          <div>
            <h4 className="flex items-center gap-2 text-lg font-semibold text-neutral-800 mb-4">
              <Users className="w-5 h-5 text-neutral-500" /> Demographics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 sm:p-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h5 className="font-medium text-neutral-700 mb-2">Population</h5>
                <p className="text-sm text-neutral-600">{sizing.demographics.population}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h5 className="font-medium text-neutral-700 mb-2">Target Age</h5>
                <p className="text-sm text-neutral-600">{sizing.demographics.targetAge}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h5 className="font-medium text-neutral-700 mb-2">Penetration</h5>
                <p className="text-sm text-neutral-600">{sizing.demographics.penetration}</p>
              </div>
            </div>
          </div>

          {/* Growth Trends */}
          <div>
            <h4 className="flex items-center gap-2 text-lg font-semibold text-neutral-800 mb-4">
              <TrendingUp className="w-5 h-5 text-neutral-500" /> Growth Trends
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-neutral-700 mb-2">Growth Rate</h5>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{sizing.growthTrends.growthRate}</span>
                  <span className="text-sm text-neutral-500">YoY</span>
                </div>
                <h5 className="font-medium text-neutral-700 mb-2">Seasonality</h5>
                <p className="text-sm text-neutral-600">{sizing.growthTrends.seasonality}</p>
              </div>
              <div>
                <h5 className="font-medium text-neutral-700 mb-2">Key Opportunities</h5>
                <ul className="space-y-2">
                  {sizing.growthTrends.keyOpportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-neutral-600 flex items-start gap-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div>
            <h4 className="flex items-center gap-2 text-lg font-semibold text-neutral-800 mb-4">
              <Lightbulb className="w-5 h-5 text-neutral-500" /> Market Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h5 className="font-medium text-green-700 mb-3">Key Drivers</h5>
                <ul className="space-y-2">
                  {sizing.marketInsights.keyDrivers.map((driver, index) => (
                    <li key={index} className="text-sm text-neutral-600 flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-red-700 mb-3">Barriers</h5>
                <ul className="space-y-2">
                  {sizing.marketInsights.barriers.map((barrier, index) => (
                    <li key={index} className="text-sm text-neutral-600 flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{barrier}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-700 mb-3">Opportunities</h5>
                <ul className="space-y-2">
                  {sizing.marketInsights.opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-neutral-600 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        )}
        {/* Sources */}
        {sizing.sources && sizing.sources.length > 0 && (
          <div className="px-6 pb-2">
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">Sources</h4>
            <ul className="space-y-1">
              {sizing.sources.map((src, idx) => (
                <li key={idx} className="text-xs text-neutral-600">
                  {src.url ? (
                    <a href={src.url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                      {src.title || src.url}
                    </a>
                  ) : (
                    <span>{src.title}</span>
                  )}
                  {src.note && <span className="text-neutral-500"> — {src.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white p-6 border-t border-neutral-200 flex justify-between items-center z-10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
          >
            Close Analysis
          </button>
          {onViewDeals && (
            <button
              onClick={() => onViewDeals(sizing)}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md"
            >
              <ShoppingCart className="w-5 h-5" />
              Find Relevant Deals
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
