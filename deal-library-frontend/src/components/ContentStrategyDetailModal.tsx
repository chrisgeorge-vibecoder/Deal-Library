import React from 'react';
import { X, FileText, TrendingUp, Calendar, BarChart3, Bookmark, BookmarkCheck, Target, Clock } from 'lucide-react';
import { ContentStrategy } from '@/types/deal';

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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-neutral-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-neutral-900">
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

        {/* Modal Content */}
        <div className="p-6 space-y-8">
          {/* Trending Topics */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Trending Topics</h4>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(contentStrategy.trendingTopics || []).map((topic, index) => (
                <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h6 className="font-semibold text-neutral-900">{topic.topic || 'Untitled Topic'}</h6>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-secondary-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Content Recommendations</h4>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Recommended Formats</h5>
                <div className="space-y-3">
                  {(contentStrategy.contentRecommendations?.formats || []).map((format, index) => (
                    <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="font-semibold text-neutral-900">{format.format || 'Untitled Format'}</h6>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          format.priority === 'High' ? 'bg-red-100 text-red-800' :
                          format.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {format.priority || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600">{format.rationale || 'No rationale provided.'}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Platforms & Frequency</h5>
                <div className="space-y-4">
                  <div>
                    <h6 className="font-medium text-neutral-700 mb-2">Recommended Platforms</h6>
                    <div className="flex flex-wrap gap-2">
                      {(contentStrategy.contentRecommendations?.platforms || []).map((platform, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h6 className="font-medium text-neutral-700 mb-2">Publishing Frequency</h6>
                    <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-neutral-700">{contentStrategy.contentRecommendations?.frequency || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Opportunities */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-semibold text-neutral-900">SEO Opportunities</h4>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Target Keywords</h5>
                <div className="flex flex-wrap gap-2">
                  {(contentStrategy.seoOpportunities?.keywords || []).map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Content Gaps</h5>
                <div className="space-y-2">
                  {(contentStrategy.seoOpportunities?.contentGaps || []).map((gap, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                      <span className="text-sm text-neutral-700">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="font-medium text-neutral-800 mb-3">Competitor Analysis</h5>
              <p className="text-neutral-700 bg-neutral-50 p-4 rounded-lg">{contentStrategy.seoOpportunities?.competitorAnalysis || 'No competitor analysis available.'}</p>
            </div>
          </div>

          {/* Editorial Calendar */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Editorial Calendar</h4>
            </div>
            
            <div className="space-y-4">
              {(contentStrategy.editorialCalendar || []).map((calendarItem, index) => (
                <div key={index} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <h6 className="font-semibold text-neutral-900">{calendarItem.timeframe || 'Unknown Timeframe'}</h6>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h6 className="font-medium text-neutral-700 mb-2">Themes</h6>
                      <div className="flex flex-wrap gap-2">
                        {(calendarItem.themes || []).map((theme, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h6 className="font-medium text-neutral-700 mb-2">Content Ideas</h6>
                      <ul className="space-y-1">
                        {(calendarItem.contentIdeas || []).map((idea, i) => (
                          <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                            <span className="w-1 h-1 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
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
              <h4 className="text-lg font-semibold text-neutral-900 mb-4">Sources</h4>
              <div className="space-y-2">
                {contentStrategy.sources.map((source, index) => (
                  <div key={index} className="flex items-start gap-3 bg-neutral-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <h6 className="font-medium text-neutral-800">{source.title}</h6>
                      {source.note && <p className="text-sm text-neutral-600">{source.note}</p>}
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-gold hover:text-brand-gold-dark text-sm"
                    >
                      View Source
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
