import React from 'react';
import { X, Target, TrendingUp, MessageSquare, Bookmark, BookmarkCheck, Users, Zap } from 'lucide-react';
import { CompetitiveIntelligence } from '@/types/deal';

interface CompetitiveIntelligenceDetailModalProps {
  competitiveIntel: CompetitiveIntelligence | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'competitive-intelligence', data: CompetitiveIntelligence }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

// Helper function to clean markdown formatting from text
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
    .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
    .replace(/`(.*?)`/g, '$1') // Remove `code`
    .replace(/#{1,6}\s*/g, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Convert links to plain text
};

export function CompetitiveIntelligenceDetailModal({ 
  competitiveIntel, 
  isOpen, 
  onClose, 
  onSaveCard, 
  onUnsaveCard, 
  isSaved 
}: CompetitiveIntelligenceDetailModalProps) {
  if (!isOpen || !competitiveIntel) return null;

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
            <Target className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-neutral-900">
              Competitive Intelligence: {cleanMarkdown(competitiveIntel.competitorOrIndustry)}
            </h3>
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
                    ? 'bg-brand-gold text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {isSaved(`competitive-intelligence-${competitiveIntel.competitorOrIndustry}`) ? (
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
          {/* Competitive Analysis */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Competitive Analysis</h4>
            </div>
            
            <div className="mb-6">
              <h5 className="font-medium text-neutral-800 mb-3">Main Competitors</h5>
              <div className="grid gap-4 md:grid-cols-2">
                {competitiveIntel.competitiveAnalysis.mainCompetitors.map((competitor, index) => (
                  <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                    <h6 className="font-semibold text-neutral-900 mb-2">{cleanMarkdown(competitor.name)}</h6>
                    <p className="text-sm text-neutral-600 mb-3">{cleanMarkdown(competitor.positioning)}</p>
                    <div>
                      <span className="text-xs font-medium text-neutral-700">Key Strengths:</span>
                      <ul className="mt-1 space-y-1">
                        {competitor.keyStrengths.map((strength, i) => (
                          <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                            <span className="w-1 h-1 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
                            {cleanMarkdown(strength)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h5 className="font-medium text-neutral-800 mb-3">Market Positioning</h5>
              <p className="text-neutral-700 bg-blue-50 p-4 rounded-lg">{cleanMarkdown(competitiveIntel.competitiveAnalysis.marketPositioning)}</p>
            </div>

            <div>
              <h5 className="font-medium text-neutral-800 mb-3">Differentiation Opportunities</h5>
              <div className="space-y-2">
                {competitiveIntel.competitiveAnalysis.differentiationOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-start gap-3 bg-green-50 p-3 rounded-lg">
                    <Zap className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">{cleanMarkdown(opportunity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messaging Analysis */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-secondary-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Messaging Analysis</h4>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Common Themes</h5>
                <div className="space-y-2">
                  {competitiveIntel.messagingAnalysis.commonThemes.map((theme, index) => (
                    <div key={index} className="bg-neutral-50 p-3 rounded-lg">
                      <span className="text-sm text-neutral-700">{cleanMarkdown(theme)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Messaging Gaps</h5>
                <div className="space-y-2">
                  {competitiveIntel.messagingAnalysis.messagingGaps.map((gap, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                      <span className="text-sm text-neutral-700">{cleanMarkdown(gap)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="font-medium text-neutral-800 mb-3">Tone & Voice</h5>
              <p className="text-neutral-700 bg-neutral-50 p-4 rounded-lg">{cleanMarkdown(competitiveIntel.messagingAnalysis.toneAndVoice)}</p>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Strategic Recommendations</h4>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Positioning</h5>
                <div className="space-y-2">
                  {competitiveIntel.strategicRecommendations.positioning.map((rec, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <span className="text-sm text-neutral-700">{cleanMarkdown(rec)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Messaging</h5>
                <div className="space-y-2">
                  {competitiveIntel.strategicRecommendations.messaging.map((rec, index) => (
                    <div key={index} className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                      <span className="text-sm text-neutral-700">{cleanMarkdown(rec)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Channels</h5>
                <div className="space-y-2">
                  {competitiveIntel.strategicRecommendations.channels.map((rec, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <span className="text-sm text-neutral-700">{cleanMarkdown(rec)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sources */}
          {competitiveIntel.sources && competitiveIntel.sources.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-4">Sources</h4>
              <div className="space-y-2">
                {competitiveIntel.sources.map((source, index) => (
                  <div key={index} className="flex items-start gap-3 bg-neutral-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <h6 className="font-medium text-neutral-800">{cleanMarkdown(source.title)}</h6>
                      {source.note && <p className="text-sm text-neutral-600">{cleanMarkdown(source.note)}</p>}
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
