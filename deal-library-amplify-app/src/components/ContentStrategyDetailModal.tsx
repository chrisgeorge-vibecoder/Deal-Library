import React, { useState } from 'react';
import { X, FileText, TrendingUp, Calendar, BarChart3, Bookmark, BookmarkCheck, Target, Clock, Copy, Download, Printer, CheckCircle2, Presentation } from 'lucide-react';
import { ContentStrategy } from '@/types/deal';
import { useCardExport } from '@/hooks/useCardExport';
import { SlideView, SlideRenderer } from '@/components/slides';
import { generateContentStrategySlides } from '@/lib/slideConfigs';

interface ContentStrategyDetailModalProps {
  contentStrategy: ContentStrategy | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'content-strategy', data: ContentStrategy }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
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
  const [viewMode, setViewMode] = useState<'detail' | 'slides'>('detail');

  // Enhanced validation to ensure contentStrategy has all required properties
  if (!isOpen || !contentStrategy || 
      !contentStrategy.industryOrTopic ||
      !contentStrategy.trendingTopics || 
      !Array.isArray(contentStrategy.trendingTopics) ||
      !contentStrategy.contentRecommendations ||
      !contentStrategy.seoOpportunities ||
      !contentStrategy.editorialCalendar ||
      !Array.isArray(contentStrategy.editorialCalendar)) {
    return null;
  }

  const modalId = 'content-strategy-modal-content';
  const filename = `content-strategy-${contentStrategy.industryOrTopic?.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const slides = generateContentStrategySlides(contentStrategy);

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
        className="relative bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-6xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-neutral-200 z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary-600" />
              <h3 className="text-2xl font-bold text-neutral-900">
                Content Strategy: {contentStrategy.industryOrTopic || 'Untitled'}
              </h3>
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
                    ? 'bg-brand-gold text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {isSaved(`content-strategy-${contentStrategy.industryOrTopic || 'untitled'}`) ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          </div>

          {/* View Mode Toggle & Export Toolbar */}
          <div className="flex items-center justify-between px-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
              <button
                onClick={() => setViewMode('detail')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'detail' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Detail</span>
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
                <span className="hidden sm:inline">Slides</span>
              </button>
            </div>

            {/* Export Buttons (only show in detail view) */}
            {viewMode === 'detail' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium mr-2">Export:</span>
                <button
                  onClick={() => handleCopyAsHTML(`#${modalId}`)}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Copy formatted content for PowerPoint/Google Slides"
                >
                  {exportSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{exportSuccess ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleDownloadAsImage(`#${modalId}`, filename)}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Download as high-quality image"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Image</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  title="Print or save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Content */}
        {viewMode === 'slides' ? (
          <div className="flex-1 min-h-[500px]">
            <SlideView
              slides={slides}
              cardType="content-strategy"
              cardTitle={contentStrategy.industryOrTopic || 'Content Strategy'}
            >
              {(slide) => <SlideRenderer slide={slide} slideIndex={slides.indexOf(slide)} />}
            </SlideView>
          </div>
        ) : (
        <div id={modalId} className="p-8 space-y-10">
          {/* Trending Topics */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <h4 className="text-lg font-bold text-neutral-900">Trending Topics</h4>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(contentStrategy.trendingTopics || []).map((topic, index) => (
                <div key={index} className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-semibold text-neutral-900">{topic.topic || 'Untitled Topic'}</h6>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      topic.relevance === 'High' ? 'bg-green-100 text-green-800' :
                      topic.relevance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {topic.relevance || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{topic.trend || 'Unknown'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Recommendations */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <Target className="w-6 h-6 text-secondary-600" />
              <h4 className="text-lg font-bold text-neutral-900">Content Recommendations</h4>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Recommended Formats</h5>
                <div className="space-y-4">
                  {(contentStrategy.contentRecommendations?.formats || []).map((format, index) => (
                    <div key={index} className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-semibold text-neutral-900">{format.format || 'Untitled Format'}</h6>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          format.priority === 'High' ? 'bg-red-100 text-red-800' :
                          format.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {format.priority || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{format.rationale || 'No rationale provided.'}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Platforms & Frequency</h5>
                <div className="space-y-5">
                  <div>
                    <h6 className="font-medium text-neutral-700 mb-3">Recommended Platforms</h6>
                    <div className="flex flex-wrap gap-2">
                      {(contentStrategy.contentRecommendations?.platforms || []).map((platform, index) => (
                        <span key={index} className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h6 className="font-medium text-neutral-700 mb-3">Publishing Frequency</h6>
                    <div className="flex items-center gap-3 bg-green-50 p-5 rounded-xl border border-green-200">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span className="text-neutral-700 font-medium">{contentStrategy.contentRecommendations?.frequency || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Opportunities */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <h4 className="text-lg font-bold text-neutral-900">SEO Opportunities</h4>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Target Keywords</h5>
                <div className="flex flex-wrap gap-2">
                  {(contentStrategy.seoOpportunities?.keywords || []).map((keyword, index) => (
                    <span key={index} className="px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Content Gaps</h5>
                <div className="space-y-3">
                  {(contentStrategy.seoOpportunities?.contentGaps || []).map((gap, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                      <span className="text-sm text-neutral-700 leading-relaxed">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h5 className="text-base font-semibold text-neutral-800 mb-4">Competitor Analysis</h5>
              <p className="text-neutral-700 bg-neutral-50 p-5 rounded-xl border border-neutral-200 leading-relaxed">{contentStrategy.seoOpportunities?.competitorAnalysis || 'No competitor analysis available.'}</p>
            </div>
          </div>

          {/* Editorial Calendar */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h4 className="text-lg font-bold text-neutral-900">Editorial Calendar</h4>
            </div>
            
            <div className="space-y-5">
              {(contentStrategy.editorialCalendar || []).map((calendarItem, index) => (
                <div key={index} className="border border-neutral-200 rounded-xl p-5 bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <h6 className="font-semibold text-neutral-900">{calendarItem.timeframe || 'Unknown Timeframe'}</h6>
                  </div>
                  
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div>
                      <h6 className="font-medium text-neutral-700 mb-3">Themes</h6>
                      <div className="flex flex-wrap gap-2">
                        {(calendarItem.themes || []).map((theme, i) => (
                          <span key={i} className="px-3 py-1.5 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h6 className="font-medium text-neutral-700 mb-3">Content Ideas</h6>
                      <ul className="space-y-2">
                        {(calendarItem.contentIdeas || []).map((idea, i) => (
                          <li key={i} className="text-sm text-neutral-600 flex items-start gap-2 leading-relaxed">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                            {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sources */}
          {contentStrategy.sources && contentStrategy.sources.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-neutral-900 mb-4">Sources</h4>
              <div className="space-y-3">
                {contentStrategy.sources.map((source, index) => (
                  <div key={index} className="flex items-start gap-3 bg-neutral-50 p-5 rounded-xl border border-neutral-200">
                    <div className="flex-1">
                      <h6 className="font-medium text-neutral-800">{source.title}</h6>
                      {source.note && <p className="text-sm text-neutral-600 mt-1">{source.note}</p>}
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-gold hover:text-brand-gold-dark text-sm font-medium whitespace-nowrap"
                    >
                      View Source
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
