'use client';

import React from 'react';
import { X, ShoppingCart, Users, Target, Lightbulb, TrendingUp, Smartphone, Bookmark, BookmarkCheck, Copy, Download, Printer, CheckCircle2 } from 'lucide-react';
import { AudienceInsights } from './AudienceInsightsCard';
import { getStrategyCardStyle, usesSovrnData } from '@/data/strategyCardStyles';
import { HighlightedText } from './HighlightedText';
import { useCardExport } from '@/hooks/useCardExport';

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
  const { handleCopyAsHTML, handleDownloadAsImage, handlePrint, isExporting, exportSuccess } = useCardExport();

  if (!isOpen || !insights) return null;
  
  const modalId = 'audience-insights-modal-content';
  const filename = `audience-insights-${insights.audienceName?.replace(/[^a-zA-Z0-9]/g, '-')}`;
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
        className="relative bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimalist Header */}
        <div className="bg-white border-b border-slate-200/50 p-6 sm:rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50/80 rounded-lg flex items-center justify-center border border-slate-100/80">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 -tracking-[0.01em]">
                  {insights.audienceName}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">Audience Insights</p>
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
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
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
                className="p-2 text-slate-300 hover:bg-slate-100 hover:text-slate-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Export Toolbar */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100/80">
            <span className="text-xs text-slate-400 font-medium mr-2">Export:</span>
            <button
              onClick={() => handleCopyAsHTML(`#${modalId}`)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors disabled:opacity-50 border border-slate-200/50"
            >
              {exportSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{exportSuccess ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={() => handleDownloadAsImage(`#${modalId}`, filename)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors disabled:opacity-50 border border-slate-200/50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Image</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200/50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div id={modalId} className="p-6 space-y-6">
          
          {/* Section 1: Who They Are - Demographics Summary */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50/60 rounded-lg border border-slate-100/60">
                <Target className="w-4 h-4 text-slate-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Who They Are</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200/50">
                <div className="text-xs font-medium text-slate-400 mb-1">Age Range</div>
                <div className="text-slate-900 font-semibold">
                  <HighlightedText text={insights.demographics?.ageRange || 'N/A'} />
                </div>
              </div>
              <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200/50">
                <div className="text-xs font-medium text-slate-400 mb-1">Income Range</div>
                <div className="text-slate-900 font-semibold">
                  <HighlightedText text={insights.demographics?.incomeRange || 'N/A'} />
                </div>
              </div>
              <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200/50">
                <div className="text-xs font-medium text-slate-400 mb-1">Gender Split</div>
                <div className="text-slate-900 font-semibold">
                  <HighlightedText text={insights.demographics?.genderSplit || 'N/A'} />
                </div>
              </div>
              <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200/50">
                <div className="text-xs font-medium text-slate-400 mb-1">Top Locations</div>
                <div className="text-slate-900 font-semibold text-sm">
                  {insights.demographics?.topLocations?.slice(0, 2).join(', ') || 'N/A'}
                </div>
              </div>
            </div>

            {/* Device Usage - Compact */}
            {insights.behavior?.deviceUsage && (
              <div className="mt-4 flex items-center gap-4 bg-slate-50/60 p-3 rounded-lg border border-slate-200/50">
                <Smartphone className="w-4 h-4 text-slate-600" />
                <div className="flex gap-4 text-sm">
                  <span><span className="font-bold">{insights.behavior.deviceUsage.mobile}%</span> Mobile</span>
                  <span><span className="font-bold">{insights.behavior.deviceUsage.desktop}%</span> Desktop</span>
                  <span><span className="font-bold">{insights.behavior.deviceUsage.tablet}%</span> Tablet</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: What Drives Them - Key Insights */}
          <div className="bg-slate-50/60 border border-slate-200/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-slate-600" />
              <h4 className="font-semibold text-slate-900 -tracking-[0.01em]">What Drives Them</h4>
            </div>
            
            {/* Key Characteristics */}
            <div className="space-y-2 mb-4">
              {insights.insights?.keyCharacteristics?.slice(0, 4).map((char, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700 leading-relaxed"><HighlightedText text={char} /></span>
                </div>
              ))}
            </div>
            
            {/* Interests Tags */}
            {insights.insights?.interests && insights.insights.interests.length > 0 && (
              <div className="pt-4 border-t border-slate-200/50">
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {insights.insights.interests.slice(0, 6).map((interest, index) => (
                    <span key={index} className="px-2.5 py-1 bg-slate-100/80 text-slate-700 text-xs font-medium rounded-full border border-slate-200/60">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pain Points */}
            {insights.insights?.painPoints && insights.insights.painPoints.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200/50">
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Pain Points</div>
                <div className="space-y-1">
                  {insights.insights.painPoints.slice(0, 3).map((pain, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-slate-700 leading-relaxed">{pain}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: How to Reach Them - Media Strategy */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50/60 rounded-lg border border-slate-100/60">
                <TrendingUp className="w-4 h-4 text-slate-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">How to Reach Them</h4>
            </div>
            
            {/* Creative Guidance */}
            {insights.creativeGuidance && (
              <div className="space-y-4">
                <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200/50">
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Messaging Tone</div>
                  <p className="text-slate-700 leading-relaxed">{insights.creativeGuidance.messagingTone}</p>
                </div>
                
                {insights.creativeGuidance.keyMessages && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Key Messages</div>
                    <div className="space-y-2">
                      {insights.creativeGuidance.keyMessages.slice(0, 3).map((msg, index) => (
                        <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200/50">
                          <span className="w-5 h-5 bg-slate-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-slate-700 leading-relaxed">{msg}</span>
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
                  <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200/50">
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Channels</div>
                    <div className="flex flex-wrap gap-1">
                      {insights.mediaStrategy.preferredChannels.slice(0, 4).map((ch, index) => (
                        <span key={index} className="px-2 py-0.5 bg-slate-100/80 text-slate-700 text-xs rounded-full border border-slate-200/60">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {insights.mediaStrategy.optimalTiming && (
                  <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200/50">
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Best Times</div>
                    <div className="flex flex-wrap gap-1">
                      {insights.mediaStrategy.optimalTiming.slice(0, 3).map((time, index) => (
                        <span key={index} className="px-2 py-0.5 bg-slate-100/80 text-slate-700 text-xs rounded-full border border-slate-200/60">
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
            <div className="pt-4 border-t border-slate-200/50">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2 tracking-wide">Sources</h4>
              <div className="space-y-1">
                {insights.sources.map((src, idx) => (
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
        <div className="sticky bottom-0 bg-white border-t border-slate-200/50 px-6 py-4 sm:rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              AI-generated insights
            </div>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium border border-slate-200/50"
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
