'use client';

import React from 'react';
import { X, Award, Target, MessageSquare, Volume2, Bookmark, BookmarkCheck, CheckCircle, XCircle, Copy, Download, Printer, CheckCircle2 } from 'lucide-react';
import { BrandStrategy } from '@/types/deal';
import { useCardExport } from '@/hooks/useCardExport';
import { getStrategyCardStyle } from '@/data/strategyCardStyles';
import { HighlightedText } from './HighlightedText';

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

  // Enhanced validation
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
  const style = getStrategyCardStyle('Brand Strategy');

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
        className="relative bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimalist Header */}
        <div className="bg-white border-b border-slate-200/60 p-6 sm:rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                <Award className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  {brandStrategy.brandOrCategory || 'Brand Strategy'}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">Brand Strategy</p>
              </div>
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
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
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
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Export Toolbar */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium mr-2">Export:</span>
            <button
              onClick={() => handleCopyAsHTML(`#${modalId}`)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors disabled:opacity-50 border border-slate-200/60"
            >
              {exportSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{exportSuccess ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={() => handleDownloadAsImage(`#${modalId}`, filename)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors disabled:opacity-50 border border-slate-200/60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Image</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200/60"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div id={modalId} className="p-6 space-y-6">
          
          {/* Section 1: The Insight - Brand Positioning */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <Target className="w-4 h-4 text-slate-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Brand Positioning</h4>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Current Perception</h5>
                <p className="text-slate-700 leading-relaxed">
                  <HighlightedText text={brandStrategy.positioning?.currentPerception || 'Not specified'} />
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                <h5 className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Target Position</h5>
                <p className="text-slate-700 leading-relaxed">
                  <HighlightedText text={brandStrategy.positioning?.targetPosition || 'Not specified'} />
                </p>
              </div>
            </div>

            {/* Key Differentiators */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-neutral-500 uppercase">Key Differentiators</h5>
              {(brandStrategy.positioning?.differentiators || []).map((diff, index) => (
                <div key={index} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                  <Target className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 leading-relaxed"><HighlightedText text={diff || ''} /></span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: The Opportunity - Core Message */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              <h4 className="font-semibold text-slate-900 tracking-tight">Core Message</h4>
            </div>
            <p className="text-xl font-semibold text-slate-900 leading-relaxed text-center mb-4 tracking-tight">
              "{brandStrategy.messagingFramework?.coreMessage || 'No core message available'}"
            </p>
            
            {/* Supporting Messages */}
            <div className="space-y-2 pt-4 border-t border-slate-200/60">
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Supporting Messages</h5>
              {(brandStrategy.messagingFramework?.supportingMessages || []).map((msg, index) => (
                <p key={index} className="text-slate-700 pl-4 border-l-2 border-slate-300 leading-relaxed">
                  <HighlightedText text={msg || ''} />
                </p>
              ))}
            </div>
            
            {/* Proof Points */}
            <div className="mt-4 pt-4 border-t border-slate-200/60 grid gap-2 md:grid-cols-2">
              {(brandStrategy.messagingFramework?.proofPoints || []).map((proof, index) => (
                <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200/60">
                  <CheckCircle className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed">{proof}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: The Action - Brand Voice & Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <Volume2 className="w-4 h-4 text-slate-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Brand Voice</h4>
            </div>
            
            {/* Tone Attributes */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(brandStrategy.brandVoice?.toneAttributes || []).map((attr, index) => (
                <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full border border-slate-200/60">
                  {attr}
                </span>
              ))}
            </div>
            
            {/* Voice Guidelines */}
            <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200/60 mb-4 leading-relaxed">
              {brandStrategy.brandVoice?.voiceGuidelines || 'No voice guidelines available'}
            </p>
            
            {/* Do's and Don'ts in compact format */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-slate-600" /> Do's
                </h5>
                <ul className="space-y-1">
                  {(brandStrategy.brandVoice?.dosDonts?.dos || []).map((item, index) => (
                    <li key={index} className="text-sm text-slate-700 pl-2 leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-600" /> Don'ts
                </h5>
                <ul className="space-y-1">
                  {(brandStrategy.brandVoice?.dosDonts?.donts || []).map((item, index) => (
                    <li key={index} className="text-sm text-slate-700 pl-2 leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-slate-600" />
              <h4 className="font-semibold text-slate-900 tracking-tight">Strategic Recommendations</h4>
            </div>
            <div className="space-y-3">
              {(brandStrategy.strategicRecommendations || []).map((rec, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-slate-200/60">
                  <div className="w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-slate-700 leading-relaxed"><HighlightedText text={rec || ''} /></span>
                </div>
              ))}
            </div>
          </div>

          {/* Sources */}
          {brandStrategy.sources && brandStrategy.sources.length > 0 && (
            <div className="pt-4 border-t border-slate-200/60">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 tracking-wide">Sources</h4>
              <div className="space-y-2">
                {brandStrategy.sources.map((source, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <span className="text-slate-400">•</span>
                    <div className="flex-1">
                      <span className="font-medium text-slate-700">{source.title}</span>
                      {source.note && <span className="text-slate-500 ml-2">— {source.note}</span>}
                    </div>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-slate-900 hover:underline text-xs transition-colors"
                      >
                        View
                      </a>
                    )}
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
