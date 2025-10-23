import React from 'react';
import { X, Award, Target, MessageSquare, Volume2, Bookmark, BookmarkCheck, CheckCircle, XCircle } from 'lucide-react';
import { BrandStrategy } from '@/types/deal';

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
            <Award className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-neutral-900">
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

        {/* Modal Content */}
        <div className="p-6 space-y-8">
          {/* Positioning */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-primary-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Brand Positioning</h4>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Current Perception</h5>
                <p className="text-neutral-700 bg-blue-50 p-4 rounded-lg">{brandStrategy.positioning?.currentPerception || 'Not specified'}</p>
              </div>
              
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Target Position</h5>
                <p className="text-neutral-700 bg-green-50 p-4 rounded-lg">{brandStrategy.positioning?.targetPosition || 'Not specified'}</p>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="font-medium text-neutral-800 mb-3">Key Differentiators</h5>
              <div className="space-y-2">
                {(brandStrategy.positioning?.differentiators || []).map((differentiator, index) => (
                  <div key={index} className="flex items-start gap-3 bg-purple-50 p-3 rounded-lg">
                    <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">{differentiator || 'Untitled differentiator'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messaging Framework */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-secondary-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Messaging Framework</h4>
            </div>
            
            <div className="space-y-6">
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Core Message</h5>
                <div className="bg-brand-gold/10 border border-brand-gold/20 p-4 rounded-lg">
                  <p className="text-lg font-medium text-neutral-900">{brandStrategy.messagingFramework?.coreMessage || 'No core message available'}</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Supporting Messages</h5>
                <div className="space-y-3">
                  {(brandStrategy.messagingFramework?.supportingMessages || []).map((message, index) => (
                    <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                      <span className="text-neutral-700">{message || 'No message available'}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Proof Points</h5>
                <div className="grid gap-3 md:grid-cols-2">
                  {(brandStrategy.messagingFramework?.proofPoints || []).map((proof, index) => (
                    <div key={index} className="flex items-start gap-3 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700">{proof || 'No proof point available'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Brand Voice */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Brand Voice & Tone</h4>
            </div>
            
            <div className="space-y-6">
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Tone Attributes</h5>
                <div className="flex flex-wrap gap-2">
                  {(brandStrategy.brandVoice?.toneAttributes || []).map((attribute, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {attribute || 'Unknown'}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-neutral-800 mb-3">Voice Guidelines</h5>
                <p className="text-neutral-700 bg-neutral-50 p-4 rounded-lg">{brandStrategy.brandVoice?.voiceGuidelines || 'No voice guidelines available'}</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h5 className="font-medium text-neutral-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Brand Voice Do's
                  </h5>
                  <div className="space-y-2">
                    {(brandStrategy.brandVoice?.dosDonts?.dos || []).map((doItem, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 p-3 rounded-lg">
                        <span className="text-sm text-neutral-700">{doItem || 'No guideline provided'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-neutral-800 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Brand Voice Don'ts
                  </h5>
                  <div className="space-y-2">
                    {(brandStrategy.brandVoice?.dosDonts?.donts || []).map((dontItem, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <span className="text-sm text-neutral-700">{dontItem || 'No guideline provided'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Strategic Recommendations</h4>
            </div>
            
            <div className="space-y-3">
              {(brandStrategy.strategicRecommendations || []).map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-neutral-700">{recommendation || 'No recommendation available'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sources */}
          {brandStrategy.sources && brandStrategy.sources.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-4">Sources</h4>
              <div className="space-y-2">
                {(brandStrategy.sources || []).map((source, index) => (
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
