'use client';

import React from 'react';
import { X, FileText, TrendingUp, Calendar, Target, Bookmark, BookmarkCheck, Copy, Download, Printer, CheckCircle2 } from 'lucide-react';
import { ContentStrategy } from '@/types/deal';
import { useCardExport } from '@/hooks/useCardExport';
import { getStrategyCardStyle } from '@/data/strategyCardStyles';
import { HighlightedText } from './HighlightedText';

interface ContentStrategyDetailModalProps {
  contentStrategy: ContentStrategy | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'content-strategy', data: ContentStrategy }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

// Helper to normalize trending topics from different API formats
function normalizeTrendingTopics(topics: any[]): Array<{topic: string; volume?: string; momentum?: string; relevance?: string}> {
  if (!topics || !Array.isArray(topics)) return [];
  return topics.map(t => {
    if (typeof t === 'string') {
      return { topic: t };
    }
    return {
      topic: t.topic || t.name || t.title || 'Topic',
      volume: t.volume || t.searchVolume,
      momentum: t.momentum || t.trend || t.relevance || 'stable',
      relevance: t.relevance
    };
  });
}

// Helper to normalize content recommendations
function normalizeContentRecommendations(recs: any): Array<{type: string; priority?: string; reasoning?: string}> {
  if (!recs) return [];
  // Check for formats array (API structure)
  const formats = recs.formats || recs.contentTypes || [];
  return formats.map((f: any) => ({
    type: f.format || f.type || f.name || 'Content Type',
    priority: f.priority || 'medium',
    reasoning: f.rationale || f.reasoning || f.description || ''
  }));
}

// Helper to normalize editorial calendar
function normalizeEditorialCalendar(calendar: any[]): Array<{month: string; theme: string; contentTypes: string[]}> {
  if (!calendar || !Array.isArray(calendar)) return [];
  return calendar.map(entry => ({
    month: entry.month || entry.timeframe || entry.period || 'Upcoming',
    theme: entry.theme || (entry.themes && entry.themes[0]) || 'Theme TBD',
    contentTypes: entry.contentTypes || entry.contentIdeas || entry.themes || []
  }));
}

// Helper to normalize SEO opportunities
function normalizeSeoOpportunities(seo: any): {targetKeywords: string[]; contentGaps: string[]} {
  if (!seo) return { targetKeywords: [], contentGaps: [] };
  return {
    targetKeywords: seo.targetKeywords || seo.keywords || [],
    contentGaps: seo.contentGaps || seo.gaps || []
  };
}

export function ContentStrategyDetailModal({ 
  contentStrategy, 
  isOpen, 
  onClose, 
  onSaveCard, 
  onUnsaveCard, 
  isSaved 
}: ContentStrategyDetailModalProps) {
  const { handleCopyAsHTML, handleDownloadAsImage, handlePrint, isExporting, exportSuccess } = useCardExport();

  if (!isOpen || !contentStrategy || !contentStrategy.industryOrTopic) {
    return null;
  }

  // Normalize data from different API formats
  const trendingTopics = normalizeTrendingTopics(contentStrategy.trendingTopics || []);
  const contentTypes = normalizeContentRecommendations(contentStrategy.contentRecommendations);
  const editorialCalendar = normalizeEditorialCalendar(contentStrategy.editorialCalendar || []);
  const seoOpportunities = normalizeSeoOpportunities(contentStrategy.seoOpportunities);
  const voiceAndTone = contentStrategy.contentRecommendations?.voiceAndTone || 
                       contentStrategy.contentRecommendations?.tone ||
                       contentStrategy.tone || '';

  const modalId = 'content-strategy-modal-content';
  const filename = `content-strategy-${contentStrategy.industryOrTopic?.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const style = getStrategyCardStyle('Content Strategy');

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
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-xl sm:text-2xl font-bold">{contentStrategy.industryOrTopic}</h3>
                <p className="text-white/80 text-sm">Content Strategy</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onSaveCard && onUnsaveCard && isSaved && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const cardId = `content-strategy-${contentStrategy.industryOrTopic || 'untitled'}`;
                    if (isSaved(cardId)) {
                      onUnsaveCard(cardId);
                    } else {
                      onSaveCard({ type: 'content-strategy', data: contentStrategy });
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isSaved(`content-strategy-${contentStrategy.industryOrTopic || 'untitled'}`)
                      ? 'bg-white text-amber-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isSaved(`content-strategy-${contentStrategy.industryOrTopic || 'untitled'}`) ? (
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
          
          {/* Section 1: Trending Topics - The Insight */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <TrendingUp className={`w-4 h-4 ${style.text}`} />
              </div>
              <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Trending Topics</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trendingTopics.slice(0, 4).map((topic, index) => (
                <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-amber-900">{topic.topic}</h5>
                    {topic.momentum && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        topic.momentum.toLowerCase().includes('grow') || topic.momentum.toLowerCase().includes('rising') || topic.momentum.toLowerCase() === 'high' ? 'bg-green-100 text-green-700' :
                        topic.momentum.toLowerCase().includes('stable') || topic.momentum.toLowerCase() === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {topic.momentum}
                      </span>
                    )}
                  </div>
                  {topic.volume && (
                    <p className="text-sm text-amber-700">
                      <HighlightedText text={`${topic.volume} search volume`} />
                    </p>
                  )}
                  {topic.relevance && !topic.volume && (
                    <p className="text-sm text-amber-700">Relevance: {topic.relevance}</p>
                  )}
                </div>
              ))}
              {trendingTopics.length === 0 && (
                <p className="text-sm text-neutral-400 italic col-span-2">No trending topics data available</p>
              )}
            </div>
          </div>

          {/* Section 2: Content Recommendations - The Opportunity */}
          <div className={`${style.bg} border ${style.border} rounded-xl p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Target className={`w-5 h-5 ${style.text}`} />
              <h4 className={`font-semibold ${style.text}`}>Content Recommendations</h4>
            </div>
            
            <div className="space-y-4">
              {contentTypes.slice(0, 3).map((type, index) => (
                <div key={index} className="bg-white/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-neutral-900">{type.type}</h5>
                    {type.priority && (
                      <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                        {type.priority} priority
                      </span>
                    )}
                  </div>
                  {type.reasoning && (
                    <p className="text-sm text-neutral-600">{type.reasoning}</p>
                  )}
                </div>
              ))}
              {contentTypes.length === 0 && (
                <p className="text-sm text-neutral-400 italic">No content recommendations available</p>
              )}
            </div>
            
            {/* Voice & Tone */}
            {voiceAndTone && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <h5 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Voice & Tone</h5>
                <p className="text-sm text-neutral-700">{voiceAndTone}</p>
              </div>
            )}
          </div>

          {/* Section 3: Editorial Calendar & SEO - The Action */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <Calendar className={`w-4 h-4 ${style.text}`} />
              </div>
              <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Editorial Calendar</h4>
            </div>
            
            {editorialCalendar.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50">
                      <th className="px-3 py-2 text-left font-semibold text-neutral-700">Period</th>
                      <th className="px-3 py-2 text-left font-semibold text-neutral-700">Theme</th>
                      <th className="px-3 py-2 text-left font-semibold text-neutral-700">Content Ideas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editorialCalendar.slice(0, 4).map((entry, index) => (
                      <tr key={index} className="border-t border-neutral-100">
                        <td className="px-3 py-2 font-medium text-neutral-900">{entry.month}</td>
                        <td className="px-3 py-2 text-neutral-700">{entry.theme}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {entry.contentTypes?.slice(0, 2).map((type, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                                {typeof type === 'string' ? type : String(type)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">No editorial calendar data available</p>
            )}

            {/* SEO Opportunities */}
            {(seoOpportunities.targetKeywords.length > 0 || seoOpportunities.contentGaps.length > 0) && (
              <div className="mt-6 bg-neutral-50 p-4 rounded-lg">
                <h5 className="text-xs font-semibold text-neutral-500 uppercase mb-3">SEO Opportunities</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seoOpportunities.targetKeywords.length > 0 && (
                    <div>
                      <h6 className="text-xs font-medium text-neutral-600 mb-2">Target Keywords</h6>
                      <div className="flex flex-wrap gap-1">
                        {seoOpportunities.targetKeywords.slice(0, 6).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white text-neutral-700 text-xs rounded border border-neutral-200">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {seoOpportunities.contentGaps.length > 0 && (
                    <div>
                      <h6 className="text-xs font-medium text-neutral-600 mb-2">Content Gaps</h6>
                      <ul className="space-y-1">
                        {seoOpportunities.contentGaps.slice(0, 3).map((gap, idx) => (
                          <li key={idx} className="text-xs text-neutral-700 flex items-start gap-1">
                            <span className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sources */}
          {contentStrategy.sources && contentStrategy.sources.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Sources</h4>
              <div className="space-y-1">
                {contentStrategy.sources.map((src, idx) => (
                  <div key={idx} className="text-xs text-neutral-600 flex items-center gap-2">
                    <span className="text-neutral-400">•</span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline">
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
            <div className="text-xs text-neutral-500">AI-generated content strategy</div>
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
