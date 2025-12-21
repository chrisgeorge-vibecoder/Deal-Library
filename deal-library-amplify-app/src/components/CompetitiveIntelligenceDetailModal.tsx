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
        {/* Minimalist Header */}
        <div className="bg-white border-b border-slate-200/50 p-6 sm:rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50/80 rounded-lg flex items-center justify-center border border-slate-100/80">
                <Target className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 -tracking-[0.01em]">
                  {cleanMarkdown(competitiveIntel.competitorOrIndustry || '')}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">Competitive Intelligence</p>
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
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                  }`}
                >
                  {isSaved(`competitive-intelligence-${competitiveIntel.competitorOrIndustry}`) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              )}
              <button onClick={onClose} className="p-2 text-slate-300 hover:bg-slate-100 hover:text-slate-500 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Export Toolbar */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100/80">
            <span className="text-xs text-slate-400 font-medium mr-2">Export:</span>
            <button onClick={() => handleCopyAsHTML(`#${modalId}`)} disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors disabled:opacity-50 border border-slate-200/60">
              {exportSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{exportSuccess ? 'Copied!' : 'Copy'}</span>
            </button>
            <button onClick={() => handleDownloadAsImage(`#${modalId}`, filename)} disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors disabled:opacity-50 border border-slate-200/60">
              <Download className="w-3.5 h-3.5" /><span>Image</span>
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200/60">
              <Printer className="w-3.5 h-3.5" /><span>Print</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div id={modalId} className="p-6 space-y-6">
          
          {/* Section 1: Market Position - The Insight */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50/60 rounded-lg border border-slate-100/60">
                <TrendingUp className="w-4 h-4 text-slate-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Market Position</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200/50">
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Market Share</h5>
                <div className="text-sm font-medium text-slate-900 leading-relaxed">
                  <HighlightedText text={competitiveIntel.marketPosition?.marketShare || 'N/A'} />
                </div>
              </div>
              <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-200/50">
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Growth Trajectory</h5>
                <div className="text-sm font-medium text-slate-900 leading-relaxed">{competitiveIntel.marketPosition?.growthTrajectory || 'N/A'}</div>
              </div>
            </div>

            {/* Key Differentiators */}
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase mb-2 tracking-wide">Key Differentiators</h5>
              <div className="flex flex-wrap gap-2">
                {competitiveIntel.marketPosition?.keyDifferentiators?.slice(0, 4).map((diff, index) => (
                  <span key={index} className="px-3 py-1.5 bg-slate-100/80 text-slate-700 text-sm rounded-full border border-slate-200/60">
                    {cleanMarkdown(diff)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Strengths & Weaknesses - The Opportunity */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-slate-600" />
              <h4 className="font-semibold text-slate-900 tracking-tight">Competitive Analysis</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Strengths</h5>
                <ul className="space-y-1.5">
                  {competitiveIntel.strengthsWeaknesses?.strengths?.slice(0, 3).map((strength, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{cleanMarkdown(strength)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Weaknesses</h5>
                <ul className="space-y-1.5">
                  {competitiveIntel.strengthsWeaknesses?.weaknesses?.slice(0, 3).map((weakness, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></span>
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
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <MessageSquare className="w-4 h-4 text-slate-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Messaging & Positioning</h4>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wide">Core Messaging</h5>
                <p className="text-slate-700 leading-relaxed">{cleanMarkdown(competitiveIntel.messagingPositioning?.coreMessaging || 'N/A')}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                  <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wide">Target Audience</h5>
                  <p className="text-sm text-slate-700 leading-relaxed">{cleanMarkdown(competitiveIntel.messagingPositioning?.targetAudience || 'N/A')}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                  <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wide">Value Proposition</h5>
                  <p className="text-sm text-slate-700 leading-relaxed">{cleanMarkdown(competitiveIntel.messagingPositioning?.valueProposition || 'N/A')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Recommendations */}
          {competitiveIntel.strategicRecommendations && competitiveIntel.strategicRecommendations.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-slate-600" />
                <h4 className="font-semibold text-slate-900 tracking-tight">Strategic Recommendations</h4>
              </div>
              <div className="space-y-3">
                {competitiveIntel.strategicRecommendations.slice(0, 4).map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-slate-200/60">
                    <div className="w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-slate-700 leading-relaxed">{cleanMarkdown(rec)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {competitiveIntel.sources && competitiveIntel.sources.length > 0 && (
            <div className="pt-4 border-t border-slate-200/60">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wide">Sources</h4>
              <div className="space-y-1">
                {competitiveIntel.sources.map((src, idx) => (
                  <div key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="text-slate-400">•</span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors">
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
        <div className="sticky bottom-0 bg-white border-t border-slate-200/60 px-6 py-4 sm:rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">AI-generated competitive analysis</div>
            <button onClick={onClose}
              className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium border border-slate-200/60">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
