import React from 'react';
import { X, Award, Target, MessageSquare, Volume2, Bookmark, BookmarkCheck, CheckCircle, XCircle, Copy, Download, Printer, CheckCircle2 } from 'lucide-react';
import { BrandStrategy } from '@/types/deal';
import { useCardExport } from '@/hooks/useCardExport';

interface BrandStrategyDetailModalProps {
  brandStrategy: BrandStrategy | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'brand-strategy', data: BrandStrategy }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export function BrandStrategyDetailModal({ 
  brandStrategy, 
  isOpen, 
  onClose, 
  onSaveCard, 
  onUnsaveCard, 
  isSaved 
}: BrandStrategyDetailModalProps) {
  const { handleCopyAsHTML, handleDownloadAsImage, handlePrint, isExporting, exportSuccess } = useCardExport();

  // Enhanced validation to ensure brandStrategy has all required properties
  if (!isOpen || !brandStrategy || 
      !brandStrategy.brandOrCategory ||
      !brandStrategy.positioning ||
      !brandStrategy.messagingFramework ||
      !brandStrategy.brandVoice ||
      !brandStrategy.strategicRecommendations ||
      !Array.isArray(brandStrategy.strategicRecommendations)) {
    return null;
  }

  const modalId = 'brand-strategy-modal-content';
  const filename = `brand-strategy-${brandStrategy.brandOrCategory?.replace(/[^a-zA-Z0-9]/g, '-')}`;

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
              <Award className="w-6 h-6 text-primary-600" />
              <h3 className="text-2xl font-bold text-neutral-900">
                Brand Strategy: {brandStrategy.brandOrCategory || 'Untitled'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
            {onSaveCard && onUnsaveCard && isSaved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const cardId = `brand-strategy-${brandStrategy.brandOrCategory || 'untitled'}`;
                  if (isSaved(cardId)) {
                    onUnsaveCard(cardId);
                  } else {
                    onSaveCard({ type: 'brand-strategy', data: brandStrategy });
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved(`brand-strategy-${brandStrategy.brandOrCategory || 'untitled'}`)
                    ? 'bg-brand-gold text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {isSaved(`brand-strategy-${brandStrategy.brandOrCategory || 'untitled'}`) ? (
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

          {/* Export Toolbar */}
          <div className="flex items-center gap-2 px-2">
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
        </div>

        {/* Modal Content */}
        <div id={modalId} className="p-8 space-y-10">
          {/* Positioning */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <Target className="w-6 h-6 text-primary-600" />
              <h4 className="text-lg font-bold text-neutral-900">Brand Positioning</h4>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Current Perception</h5>
                <p className="text-neutral-700 bg-blue-50 p-5 rounded-xl border border-blue-200 leading-relaxed">{brandStrategy.positioning?.currentPerception || 'Not specified'}</p>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Target Position</h5>
                <p className="text-neutral-700 bg-green-50 p-5 rounded-xl border border-green-200 leading-relaxed">{brandStrategy.positioning?.targetPosition || 'Not specified'}</p>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="text-base font-semibold text-neutral-800 mb-4">Key Differentiators</h5>
              <div className="space-y-3">
                {(brandStrategy.positioning?.differentiators || []).map((differentiator, index) => (
                  <div key={index} className="flex items-start gap-3 bg-purple-50 p-5 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow">
                    <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700 leading-relaxed">{differentiator || 'Untitled differentiator'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messaging Framework */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <MessageSquare className="w-6 h-6 text-secondary-600" />
              <h4 className="text-lg font-bold text-neutral-900">Messaging Framework</h4>
            </div>
            
            <div className="space-y-8">
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Core Message</h5>
                <div className="bg-gradient-to-br from-brand-gold/20 to-brand-gold/10 border-2 border-brand-gold/30 p-8 rounded-xl shadow-md">
                  <p className="text-xl font-bold text-neutral-900 leading-relaxed text-center">{brandStrategy.messagingFramework?.coreMessage || 'No core message available'}</p>
                </div>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Supporting Messages</h5>
                <div className="space-y-3">
                  {(brandStrategy.messagingFramework?.supportingMessages || []).map((message, index) => (
                    <div key={index} className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
                      <span className="text-neutral-700 leading-relaxed">{message || 'No message available'}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Proof Points</h5>
                <div className="grid gap-4 lg:grid-cols-2">
                  {(brandStrategy.messagingFramework?.proofPoints || []).map((proof, index) => (
                    <div key={index} className="flex items-start gap-3 bg-green-50 p-5 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700 leading-relaxed">{proof || 'No proof point available'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Brand Voice */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <Volume2 className="w-6 h-6 text-green-600" />
              <h4 className="text-lg font-bold text-neutral-900">Brand Voice & Tone</h4>
            </div>
            
            <div className="space-y-8">
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Tone Attributes</h5>
                <div className="flex flex-wrap gap-2">
                  {(brandStrategy.brandVoice?.toneAttributes || []).map((attribute, index) => (
                    <span key={index} className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {attribute || 'Unknown'}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-base font-semibold text-neutral-800 mb-4">Voice Guidelines</h5>
                <p className="text-neutral-700 bg-neutral-50 p-5 rounded-xl border border-neutral-200 leading-relaxed">{brandStrategy.brandVoice?.voiceGuidelines || 'No voice guidelines available'}</p>
              </div>
              
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h5 className="text-base font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Brand Voice Do's
                  </h5>
                  <div className="space-y-3">
                    {(brandStrategy.brandVoice?.dosDonts?.dos || []).map((doItem, index) => (
                      <div key={index} className="bg-green-50 border-2 border-green-300 p-5 rounded-xl hover:shadow-lg transition-shadow">
                        <span className="text-sm text-neutral-700 leading-relaxed font-medium">{doItem || 'No guideline provided'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-base font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    Brand Voice Don'ts
                  </h5>
                  <div className="space-y-3">
                    {(brandStrategy.brandVoice?.dosDonts?.donts || []).map((dontItem, index) => (
                      <div key={index} className="bg-red-50 border-2 border-red-300 p-5 rounded-xl hover:shadow-lg transition-shadow">
                        <span className="text-sm text-neutral-700 leading-relaxed font-medium">{dontItem || 'No guideline provided'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div>
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-200 mb-6">
              <Award className="w-6 h-6 text-purple-600" />
              <h4 className="text-lg font-bold text-neutral-900">Strategic Recommendations</h4>
            </div>
            
            <div className="space-y-4">
              {(brandStrategy.strategicRecommendations || []).map((recommendation, index) => (
                <div key={index} className="flex items-start gap-4 bg-purple-50 border border-purple-200 p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-base font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-neutral-700 leading-relaxed">{recommendation || 'No recommendation available'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sources */}
          {brandStrategy.sources && brandStrategy.sources.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-neutral-900 mb-4">Sources</h4>
              <div className="space-y-3">
                {(brandStrategy.sources || []).map((source, index) => (
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
      </div>
    </div>
  );
}
