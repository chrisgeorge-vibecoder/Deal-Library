'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, TrendingUp, Target, Bookmark, BookmarkCheck } from 'lucide-react';
import { CampaignBrief } from '@/types/deal';

interface CampaignBriefModalProps {
  brief: {
    marketPersonaSummary: string;
    targetedHeadlines: string[];
    valuePropositions: Array<{
      theme: string;
      rationale: string;
      priority: number;
    }>;
    generatedAt: string;
  };
  marketName: string;
  marketGeoLevel: string;
  onClose: () => void;
  onSave?: (brief: CampaignBrief) => void;
  onUnsave?: (briefId: string) => void;
  isSaved?: boolean;
}

export default function CampaignBriefModal({ 
  brief, 
  marketName, 
  marketGeoLevel,
  onClose, 
  onSave, 
  onUnsave, 
  isSaved 
}: CampaignBriefModalProps) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [key]: false });
    }, 2000);
  };

  const handleSaveToggle = () => {
    const campaignBrief: CampaignBrief = {
      marketName,
      marketGeoLevel,
      marketPersonaSummary: brief.marketPersonaSummary,
      targetedHeadlines: brief.targetedHeadlines,
      valuePropositions: brief.valuePropositions,
      generatedAt: brief.generatedAt
    };

    if (isSaved && onUnsave) {
      const briefId = `campaign-brief-${marketGeoLevel}-${marketName}`;
      onUnsave(briefId);
    } else if (onSave) {
      onSave(campaignBrief);
    }
  };

  const getTierColor = (priority: number): string => {
    switch (priority) {
      case 1: return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 2: return 'bg-gray-300/20 text-gray-700 border-gray-400/30';
      case 3: return 'bg-orange-400/20 text-orange-700 border-orange-500/30';
      default: return 'bg-gray-200/20 text-gray-600 border-gray-300/30';
    }
  };

  const getTierLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'Primary';
      case 2: return 'Secondary';
      case 3: return 'Tertiary';
      default: return 'Other';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-brand-gold to-brand-gold-light p-6 border-b border-brand-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Sparkles className="w-6 h-6 text-brand-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Campaign Brief</h2>
              <p className="text-sm text-white/80">{marketName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={handleSaveToggle}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={isSaved ? 'Remove from saved cards' : 'Save to cards'}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-6 h-6 text-white" />
                ) : (
                  <Bookmark className="w-6 h-6 text-white" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Market Persona Summary */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-gold" />
                <h3 className="text-lg font-semibold text-gray-900">Target Audience Persona</h3>
              </div>
              <button
                onClick={() => handleCopy(brief.marketPersonaSummary, 'persona')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copiedStates['persona'] ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">{brief.marketPersonaSummary}</p>
            </div>
          </section>

          {/* Targeted Headlines */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-semibold text-gray-900">
                Targeted Headlines
                <span className="text-sm text-gray-500 font-normal ml-2">(A/B Test Ready)</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {brief.targetedHeadlines.map((headline, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-gold/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold rounded">
                          Variant {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">{headline}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(headline, `headline-${index}`)}
                      className="flex-shrink-0 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copiedStates[`headline-${index}`] ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Value Propositions */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-semibold text-gray-900">Value Propositions</h3>
            </div>
            <div className="space-y-3">
              {brief.valuePropositions
                .sort((a, b) => a.priority - b.priority)
                .map((vp, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 ${getTierColor(vp.priority)}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/50 text-xs font-bold rounded">
                          {getTierLabel(vp.priority)}
                        </span>
                        <h4 className="font-bold text-lg">{vp.theme}</h4>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{vp.rationale}</p>
                  </div>
                ))}
            </div>
          </section>

          {/* Timestamp */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
            Generated {new Date(brief.generatedAt).toLocaleString()}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

