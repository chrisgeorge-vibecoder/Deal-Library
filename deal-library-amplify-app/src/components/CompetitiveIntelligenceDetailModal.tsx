'use client';

import React from 'react';
import { X, Target, TrendingUp, MessageSquare, Bookmark, BookmarkCheck, Users, Zap, Copy, Download, Printer, CheckCircle2 } from 'lucide-react';
import { CompetitiveIntelligence } from '@/types/deal';
import { useCardExport } from '@/hooks/useCardExport';
import { getStrategyCardStyle } from '@/data/strategyCardStyles';
import { HighlightedText } from './HighlightedText';

interface CompetitiveIntelligenceDetailModalProps {
  competitiveIntel: CompetitiveIntelligence | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'competitive-intelligence', data: CompetitiveIntelligence }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
};

export function CompetitiveIntelligenceDetailModal({ 
  competitiveIntel, 
  isOpen, 
  onClose, 
  onSaveCard, 
  onUnsaveCard, 
  isSaved 
}: CompetitiveIntelligenceDetailModalProps) {
  const { handleCopyAsHTML, handleDownloadAsImage, handlePrint, isExporting, exportSuccess } = useCardExport();

  if (!isOpen || !competitiveIntel) return null;

  const modalId = 'competitive-intel-modal-content';
  const filename = `competitive-intelligence-${competitiveIntel.competitorOrIndustry?.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const style = getStrategyCardStyle('Competitive Intelligence');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-xl sm:text-2xl font-bold">
                  {cleanMarkdown(competitiveIntel.competitorOrIndustry || '')}
                </h3>
                <p className="text-white/80 text-sm">Competitive Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onSaveCard && onUnsaveCard && isSaved && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSaved(`competitive-intelligence-${competitiveIntel.competitorOrIndustry}`)) {
                      onUnsaveCard(`competitive-intelligence-${competitiveIntel.competitorOrIndustry}`);
                    } else {
                      onSaveCard({ type: 'competitive-intelligence', data: competitiveIntel });
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isSaved(`competitive-intelligence-${competitiveIntel.competitorOrIndustry}`)
                      ? 'bg-white text-indigo-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isSaved(`competitive-intelligence-${competitiveIntel.competitorOrIndustry}`) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              )}
              <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Export Toolbar */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
            <span className="text-xs text-white/70 font-medium mr-2">Export:</span>
            <button onClick={() => handleCopyAsHTML(`#${modalId}`)} disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50">
              {exportSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{exportSuccess ? 'Copied!' : 'Copy'}</span>
            </button>
            <button onClick={() => handleDownloadAsImage(`#${modalId}`, filename)} disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50">
              <Download className="w-3.5 h-3.5" /><span>Image</span>
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
              <Printer className="w-3.5 h-3.5" /><span>Print</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div id={modalId} className="p-6 space-y-6">
          
          {/* Section 1: Market Position - The Insight */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <TrendingUp className={`w-4 h-4 ${style.text}`} />
              </div>
              <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Market Position</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                <h5 className="text-xs font-semibold text-indigo-600 uppercase mb-2">Market Share</h5>
                <div className="text-xl font-bold text-indigo-900">
                  <HighlightedText text={competitiveIntel.marketPosition?.marketShare || 'N/A'} />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h5 className="text-xs font-semibold text-green-600 uppercase mb-2">Growth Trajectory</h5>
                <div className="text-xl font-bold text-green-900">{competitiveIntel.marketPosition?.growthTrajectory || 'N/A'}</div>
              </div>
            </div>

            {/* Key Differentiators */}
            <div>
              <h5 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Key Differentiators</h5>
              <div className="flex flex-wrap gap-2">
                {competitiveIntel.marketPosition?.keyDifferentiators?.slice(0, 4).map((diff, index) => (
                  <span key={index} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                    {cleanMarkdown(diff)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Strengths & Weaknesses - The Opportunity */}
          <div className={`${style.bg} border ${style.border} rounded-xl p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className={`w-5 h-5 ${style.text}`} />
              <h4 className={`font-semibold ${style.text}`}>Competitive Analysis</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-xs font-semibold text-green-700 uppercase mb-2">Strengths</h5>
                <ul className="space-y-1.5">
                  {competitiveIntel.strengthsWeaknesses?.strengths?.slice(0, 3).map((strength, index) => (
                    <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{cleanMarkdown(strength)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-red-700 uppercase mb-2">Weaknesses</h5>
                <ul className="space-y-1.5">
                  {competitiveIntel.strengthsWeaknesses?.weaknesses?.slice(0, 3).map((weakness, index) => (
                    <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{cleanMarkdown(weakness)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Messaging & Positioning - The Action */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <MessageSquare className={`w-4 h-4 ${style.text}`} />
              </div>
              <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Messaging & Positioning</h4>
            </div>
            
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h5 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Core Messaging</h5>
                <p className="text-neutral-700">{cleanMarkdown(competitiveIntel.messagingPositioning?.coreMessaging || 'N/A')}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h5 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Target Audience</h5>
                  <p className="text-sm text-neutral-700">{cleanMarkdown(competitiveIntel.messagingPositioning?.targetAudience || 'N/A')}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h5 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Value Proposition</h5>
                  <p className="text-sm text-neutral-700">{cleanMarkdown(competitiveIntel.messagingPositioning?.valueProposition || 'N/A')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Recommendations */}
          {competitiveIntel.strategicRecommendations && competitiveIntel.strategicRecommendations.length > 0 && (
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-brand-gold" />
                <h4 className="font-semibold text-neutral-900">Strategic Recommendations</h4>
              </div>
              <div className="space-y-2">
                {competitiveIntel.strategicRecommendations.slice(0, 4).map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-neutral-200">
                    <div className={`w-6 h-6 ${style.headerBg} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                      {index + 1}
                    </div>
                    <span className="text-neutral-700">{cleanMarkdown(rec)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {competitiveIntel.sources && competitiveIntel.sources.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Sources</h4>
              <div className="space-y-1">
                {competitiveIntel.sources.map((src, idx) => (
                  <div key={idx} className="text-xs text-neutral-600 flex items-center gap-2">
                    <span className="text-neutral-400">•</span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
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
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 sm:rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">AI-generated competitive analysis</div>
            <button onClick={onClose}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
