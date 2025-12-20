'use client';

import React from 'react';
import { GeoCard } from '@/types/deal';
import { X, MapPin, Users, TrendingUp, Target, BarChart3, Bookmark, BookmarkCheck, ShoppingCart } from 'lucide-react';
import dynamic from 'next/dynamic';
import { getStrategyCardStyle, usesSovrnData } from '@/data/strategyCardStyles';
import { HighlightedText } from './HighlightedText';

const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

interface GeoDetailModalProps {
  geo: GeoCard | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDeals?: (geo: GeoCard) => void;
  onSaveCard?: (card: { type: 'geo-cards', data: GeoCard }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export default function GeoDetailModal({ 
  geo, 
  isOpen, 
  onClose, 
  onViewDeals,
  onSaveCard,
  onUnsaveCard,
  isSaved
}: GeoDetailModalProps) {
  if (!isOpen || !geo) return null;
  
  const style = getStrategyCardStyle('Geo Insights');
  const isSovrnCard = usesSovrnData('Geo Insights');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:rounded-xl shadow-sovrn-lg sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored Header - Gold for Sovrn data */}
        <div className={`${style.headerBg} p-6 sm:rounded-t-xl relative`}>
          {/* Sovrn logo for Gold header cards */}
          {isSovrnCard && (
            <div className="absolute top-4 left-4">
              <img src="/Sovrn_Logo.png" alt="Sovrn" className="h-5 w-auto opacity-80" />
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/10 rounded-xl">
                <MapPin className="w-6 h-6 text-[#282828]" />
              </div>
              <div className="text-[#282828]">
                <h2 className="text-xl sm:text-2xl font-bold">{geo.audienceName}</h2>
                <p className="text-[#282828]/70 text-sm">Geo Insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onSaveCard && onUnsaveCard && isSaved && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSaved(`geo-cards-${geo.audienceName}`)) {
                      onUnsaveCard(`geo-cards-${geo.audienceName}`);
                    } else {
                      onSaveCard({ type: 'geo-cards', data: geo });
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isSaved(`geo-cards-${geo.audienceName}`)
                      ? 'bg-white text-[#FFD42B]'
                      : 'bg-black/10 text-[#282828] hover:bg-black/20'
                  }`}
                >
                  {isSaved(`geo-cards-${geo.audienceName}`) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              )}
              <button 
                onClick={onClose} 
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-lg transition-colors touch-manipulation active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-[#282828]" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Section 1: Map & Summary - The Insight */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <MapPin className={`w-4 h-4 ${style.text}`} />
              </div>
              <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Geographic Distribution</h4>
            </div>
            
            {/* Interactive Map */}
            <div className="rounded-lg overflow-hidden border border-neutral-200 mb-4">
              <InteractiveMap 
                zipData={geo.topZipCodes.map(z => ({
                  zip: z.zipCode,
                  indexScore: z.indexScore,
                  rawCount: z.reachIndex || 0,
                  geoLocation: z.geoLocation || { lat: 0, lon: 0 },
                  population: z.population || 0
                }))}
                audienceName={geo.audienceName}
              />
            </div>
            
            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
                <h5 className="text-xs font-semibold text-teal-600 uppercase mb-1">Total ZIPs</h5>
                <div className="text-2xl font-bold text-teal-900">
                  <HighlightedText text={String(geo.summary?.totalZipCodes || geo.topZipCodes.length)} />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h5 className="text-xs font-semibold text-blue-600 uppercase mb-1">Top Region</h5>
                <div className="text-xl font-bold text-blue-900">{geo.summary?.topRegion || 'N/A'}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h5 className="text-xs font-semibold text-green-600 uppercase mb-1">Avg Index</h5>
                <div className="text-2xl font-bold text-green-900">
                  <HighlightedText text={String(geo.summary?.averageIndexScore || 'N/A')} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Top ZIP Codes - The Opportunity */}
          <div className={`${style.bg} border ${style.border} rounded-xl p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className={`w-5 h-5 ${style.text}`} />
              <h4 className={`font-semibold ${style.text}`}>Top ZIP Codes</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/50">
                    <th className="px-3 py-2 text-left font-semibold text-neutral-700">ZIP Code</th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-700">City/Area</th>
                    <th className="px-3 py-2 text-right font-semibold text-neutral-700">Index Score</th>
                    <th className="px-3 py-2 text-right font-semibold text-neutral-700">Population</th>
                  </tr>
                </thead>
                <tbody>
                  {geo.topZipCodes.slice(0, 6).map((zip, index) => (
                    <tr key={index} className="border-t border-teal-100">
                      <td className="px-3 py-2 font-mono text-neutral-900">{zip.zipCode}</td>
                      <td className="px-3 py-2 text-neutral-700">{zip.cityName || 'N/A'}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          zip.indexScore >= 200 ? 'bg-green-100 text-green-700' :
                          zip.indexScore >= 150 ? 'bg-blue-100 text-blue-700' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          {zip.indexScore}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-neutral-600">
                        {zip.population?.toLocaleString() || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Targeting Strategy - The Action */}
          {geo.insights && geo.insights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-1.5 ${style.bg} rounded-lg`}>
                  <Target className={`w-4 h-4 ${style.text}`} />
                </div>
                <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Targeting Insights</h4>
              </div>
              
              <div className="space-y-2">
                {geo.insights.slice(0, 4).map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <div className={`w-6 h-6 ${style.headerBg} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                      {index + 1}
                    </div>
                    <span className="text-neutral-700">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {geo.sources && geo.sources.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Sources</h4>
              <div className="space-y-1">
                {geo.sources.map((src, idx) => (
                  <div key={idx} className="text-xs text-neutral-600 flex items-center gap-2">
                    <span className="text-neutral-400">•</span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                        {src.title || src.url}
                      </a>
                    ) : (
                      <span>{src.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 sm:rounded-b-xl">
          <div className="flex items-center justify-between">
            <button onClick={onClose}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium">
              Close
            </button>
            {onViewDeals && (
              <button onClick={() => onViewDeals(geo)}
                className={`px-4 py-2 ${style.headerBg} text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2`}>
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
