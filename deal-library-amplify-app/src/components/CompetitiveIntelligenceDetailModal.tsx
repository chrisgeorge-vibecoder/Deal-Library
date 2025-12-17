import React, { useState } from 'react';
import { X, Target, TrendingUp, MessageSquare, Bookmark, BookmarkCheck, Users, Zap, Copy, Download, Printer, CheckCircle2, Presentation, FileText } from 'lucide-react';
import { CompetitiveIntelligence } from '@/types/deal';
import { useCardExport } from '@/hooks/useCardExport';
import { SlideView, SlideRenderer } from '@/components/slides';
import { generateCompetitiveIntelSlides } from '@/lib/slideConfigs';

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
  const { handleCopyAsHTML, handleDownloadAsImage, handlePrint, isExporting, exportSuccess } = useCardExport();
  const [viewMode, setViewMode] = useState<'detail' | 'slides'>('detail');

  if (!isOpen || !competitiveIntel) return null;

  const modalId = 'competitive-intel-modal-content';
  const filename = `competitive-intelligence-${competitiveIntel.competitorOrIndustry?.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const slides = generateCompetitiveIntelSlides(competitiveIntel);

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
              <Target className="w-6 h-6 text-primary-600" />
              <h3 className="text-2xl font-bold text-neutral-900">
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
              cardType="competitive-intelligence"
              cardTitle={competitiveIntel.competitorOrIndustry || 'Competitive Intelligence'}
            >
              {(slide) => <SlideRenderer slide={slide} slideIndex={slides.indexOf(slide)} />}
            </SlideView>
          </div>
        ) : (
        <div id={modalId} className="p-8 space-y-10">
          {/* Competitive Analysis */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <Users className="w-6 h-6 text-primary-600" />
              <h4 className="text-lg font-bold text-neutral-900">Competitive Analysis</h4>
            </div>
            
            <div className="mb-8">
              <h5 className="text-base font-semibold text-neutral-800 mb-5">Main Competitors</h5>
              <div className="grid gap-5 lg:grid-cols-2">
                {competitiveIntel.competitiveAnalysis.mainCompetitors.map((competitor, index) => (
                  <div key={index} className="bg-white border-2 border-neutral-200 p-5 rounded-xl hover:shadow-lg transition-shadow">
                    <h6 className="font-bold text-lg text-neutral-900 mb-3">{cleanMarkdown(competitor.name)}</h6>
                    <p className="text-sm text-neutral-600 mb-4 leading-relaxed">{cleanMarkdown(competitor.positioning)}</p>
                    <div>
                      <span className="text-sm font-semibold text-neutral-700 mb-2 block">Key Strengths:</span>
                      <ul className="space-y-2">
                        {competitor.keyStrengths.map((strength, i) => (
                          <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="leading-relaxed">{cleanMarkdown(strength)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h5 className="text-base font-semibold text-neutral-800 mb-4">Market Positioning</h5>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-xl">
                <p className="text-neutral-700 leading-relaxed">{cleanMarkdown(competitiveIntel.competitiveAnalysis.marketPositioning)}</p>
              </div>
            </div>

            <div>
              <h5 className="text-base font-semibold text-neutral-800 mb-4">Differentiation Opportunities</h5>
              <div className="space-y-3">
                {competitiveIntel.competitiveAnalysis.differentiationOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-start gap-4 bg-green-50 p-5 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
                    <Zap className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700 leading-relaxed">{cleanMarkdown(opportunity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messaging Analysis */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <MessageSquare className="w-6 h-6 text-secondary-600" />
              <h4 className="text-lg font-bold text-neutral-900">Messaging Analysis</h4>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Common Themes</h5>
                <div className="space-y-3">
                  {competitiveIntel.messagingAnalysis.commonThemes.map((theme, index) => (
                    <div key={index} className="bg-neutral-50 p-5 rounded-xl border border-neutral-200">
                      <span className="text-sm text-neutral-700 leading-relaxed">{cleanMarkdown(theme)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Messaging Gaps</h5>
                <div className="space-y-3">
                  {competitiveIntel.messagingAnalysis.messagingGaps.map((gap, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 p-5 rounded-xl">
                      <span className="text-sm text-neutral-700 leading-relaxed">{cleanMarkdown(gap)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="text-base font-semibold text-neutral-800 mb-4">Tone & Voice</h5>
              <p className="text-neutral-700 bg-neutral-50 p-5 rounded-xl border border-neutral-200 leading-relaxed">{cleanMarkdown(competitiveIntel.messagingAnalysis.toneAndVoice)}</p>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h4 className="text-lg font-bold text-neutral-900">Strategic Recommendations</h4>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <h5 className="text-base font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Positioning
                </h5>
                <div className="space-y-3">
                  {competitiveIntel.strategicRecommendations.positioning.map((rec, index) => (
                    <div key={index} className="bg-blue-50 border-2 border-blue-200 p-5 rounded-xl hover:shadow-lg transition-shadow">
                      <span className="text-sm text-neutral-700 leading-relaxed">{cleanMarkdown(rec)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-purple-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Messaging
                </h5>
                <div className="space-y-3">
                  {competitiveIntel.strategicRecommendations.messaging.map((rec, index) => (
                    <div key={index} className="bg-purple-50 border-2 border-purple-200 p-5 rounded-xl hover:shadow-lg transition-shadow">
                      <span className="text-sm text-neutral-700 leading-relaxed">{cleanMarkdown(rec)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Channels
                </h5>
                <div className="space-y-3">
                  {competitiveIntel.strategicRecommendations.channels.map((rec, index) => (
                    <div key={index} className="bg-green-50 border-2 border-green-200 p-5 rounded-xl hover:shadow-lg transition-shadow">
                      <span className="text-sm text-neutral-700 leading-relaxed">{cleanMarkdown(rec)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sources */}
          {competitiveIntel.sources && competitiveIntel.sources.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-neutral-900 mb-4">Sources</h4>
              <div className="space-y-3">
                {competitiveIntel.sources.map((source, index) => (
                  <div key={index} className="flex items-start gap-3 bg-neutral-50 p-5 rounded-xl border border-neutral-200">
                    <div className="flex-1">
                      <h6 className="font-medium text-neutral-800">{cleanMarkdown(source.title)}</h6>
                      {source.note && <p className="text-sm text-neutral-600 mt-1">{cleanMarkdown(source.note)}</p>}
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
