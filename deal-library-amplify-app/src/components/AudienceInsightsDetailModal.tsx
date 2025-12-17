'use client';

import React from 'react';
import { X, ShoppingCart, Users, Target, Lightbulb, TrendingUp, Smartphone, Bookmark, BookmarkCheck } from 'lucide-react';
import { AudienceInsights } from './AudienceInsightsCard';
import { getStrategyCardStyle, usesSovrnData } from '@/data/strategyCardStyles';
import { HighlightedText } from './HighlightedText';

interface AudienceInsightsDetailModalProps {
  insights: AudienceInsights | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDeals: (insights: AudienceInsights) => void;
  onSaveCard?: (card: { type: 'audience-insights', data: AudienceInsights }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export const AudienceInsightsDetailModal: React.FC<AudienceInsightsDetailModalProps> = ({
  insights,
  isOpen,
  onClose,
  onViewDeals,
  onSaveCard,
  onUnsaveCard,
  isSaved
}) => {
  if (!isOpen || !insights) return null;
  
  const style = getStrategyCardStyle('Audience Insights');
  const isSovrnCard = usesSovrnData('Audience Insights');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:rounded-xl shadow-sovrn-lg sm:max-w-3xl sm:max-h-[90vh] overflow-y-auto"
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
                <Users className="w-6 h-6 text-[#282828]" />
              </div>
              <div className="text-[#282828]">
                <h2 className="text-xl sm:text-2xl font-bold">{insights.audienceName}</h2>
                <p className="text-[#282828]/70 text-sm">Audience Insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onSaveCard && onUnsaveCard && isSaved && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSaved(`audience-insights-${insights.audienceName}`)) {
                      onUnsaveCard(`audience-insights-${insights.audienceName}`);
                    } else {
                      onSaveCard({ type: 'audience-insights', data: insights });
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isSaved(`audience-insights-${insights.audienceName}`)
                      ? 'bg-white text-[#FFD42B]'
                      : 'bg-black/10 text-[#282828] hover:bg-black/20'
                  }`}
                >
                  {isSaved(`audience-insights-${insights.audienceName}`) ? (
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
                className="p-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#282828]" />
              </button>
            </div>
          </div>
        </div>

        {/* Content - Simplified 3-Section Structure */}
        <div className="p-6 space-y-6">
          
          {/* Section 1: Who They Are - Demographics Summary */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <Target className={`w-4 h-4 ${style.text}`} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Who They Are</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-neutral-500 mb-1">Age Range</div>
                <div className="text-neutral-900 font-semibold">
                  <HighlightedText text={insights.demographics?.ageRange || 'N/A'} />
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-neutral-500 mb-1">Income Range</div>
                <div className="text-neutral-900 font-semibold">
                  <HighlightedText text={insights.demographics?.incomeRange || 'N/A'} />
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-neutral-500 mb-1">Gender Split</div>
                <div className="text-neutral-900 font-semibold">
                  <HighlightedText text={insights.demographics?.genderSplit || 'N/A'} />
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-neutral-500 mb-1">Top Locations</div>
                <div className="text-neutral-900 font-semibold text-sm">
                  {insights.demographics?.topLocations?.slice(0, 2).join(', ') || 'N/A'}
                </div>
              </div>
            </div>

            {/* Device Usage - Compact */}
            {insights.behavior?.deviceUsage && (
              <div className="mt-4 flex items-center gap-4 bg-neutral-50 p-3 rounded-lg">
                <Smartphone className="w-4 h-4 text-neutral-500" />
                <div className="flex gap-4 text-sm">
                  <span><span className="font-bold text-brand-orange">{insights.behavior.deviceUsage.mobile}%</span> Mobile</span>
                  <span><span className="font-bold text-brand-orange">{insights.behavior.deviceUsage.desktop}%</span> Desktop</span>
                  <span><span className="font-bold text-brand-orange">{insights.behavior.deviceUsage.tablet}%</span> Tablet</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: What Drives Them - Key Insights */}
          <div className={`${style.bg} border ${style.border} rounded-xl p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className={`w-5 h-5 ${style.text}`} />
              <h3 className={`font-semibold ${style.text}`}>What Drives Them</h3>
            </div>
            
            {/* Key Characteristics */}
            <div className="space-y-2 mb-4">
              {insights.insights?.keyCharacteristics?.slice(0, 4).map((char, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className={`w-1.5 h-1.5 ${style.bgSolid} rounded-full mt-2 flex-shrink-0`}></span>
                  <span className="text-neutral-700"><HighlightedText text={char} /></span>
                </div>
              ))}
            </div>
            
            {/* Interests Tags */}
            {insights.insights?.interests && insights.insights.interests.length > 0 && (
              <div className="pt-4 border-t border-sky-200">
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {insights.insights.interests.slice(0, 6).map((interest, index) => (
                    <span key={index} className="px-2.5 py-1 bg-white text-sky-700 text-xs font-medium rounded-full border border-sky-200">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pain Points */}
            {insights.insights?.painPoints && insights.insights.painPoints.length > 0 && (
              <div className="mt-4 pt-4 border-t border-sky-200">
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Pain Points</div>
                <div className="space-y-1">
                  {insights.insights.painPoints.slice(0, 3).map((pain, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-neutral-700">{pain}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: How to Reach Them - Media Strategy */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <TrendingUp className={`w-4 h-4 ${style.text}`} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">How to Reach Them</h3>
            </div>
            
            {/* Creative Guidance */}
            {insights.creativeGuidance && (
              <div className="space-y-4">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Messaging Tone</div>
                  <p className="text-neutral-700">{insights.creativeGuidance.messagingTone}</p>
                </div>
                
                {insights.creativeGuidance.keyMessages && (
                  <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Key Messages</div>
                    <div className="space-y-2">
                      {insights.creativeGuidance.keyMessages.slice(0, 3).map((msg, index) => (
                        <div key={index} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                          <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-neutral-700">{msg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Media Strategy - Compact */}
            {insights.mediaStrategy && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {insights.mediaStrategy.preferredChannels && (
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Channels</div>
                    <div className="flex flex-wrap gap-1">
                      {insights.mediaStrategy.preferredChannels.slice(0, 4).map((ch, index) => (
                        <span key={index} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {insights.mediaStrategy.optimalTiming && (
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Best Times</div>
                    <div className="flex flex-wrap gap-1">
                      {insights.mediaStrategy.optimalTiming.slice(0, 3).map((time, index) => (
                        <span key={index} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sources */}
          {insights.sources && insights.sources.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Sources</h4>
              <div className="space-y-1">
                {insights.sources.map((src, idx) => (
                  <div key={idx} className="text-xs text-neutral-600 flex items-center gap-2">
                    <span className="text-neutral-400">•</span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">
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
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 sm:rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              AI-generated insights
            </div>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => onViewDeals(insights)}
                className={`px-4 py-2 ${style.headerBg} text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2`}
              >
                <ShoppingCart className="w-4 h-4" />
                Find Deals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
