'use client';

import { Persona } from '@/types/deal';
import { X, Users, Target, MessageSquare, Eye, Bookmark, BookmarkCheck, Lightbulb } from 'lucide-react';
import { getStrategyCardStyle, usesSovrnData } from '@/data/strategyCardStyles';
import { HighlightedText } from './HighlightedText';

interface PersonaDetailModalProps {
  persona: Persona | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDeals: (persona: Persona) => void;
  onSaveCard?: (card: { type: 'persona', data: Persona }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export default function PersonaDetailModal({ 
  persona, 
  isOpen, 
  onClose, 
  onViewDeals,
  onSaveCard,
  onUnsaveCard,
  isSaved
}: PersonaDetailModalProps) {
  if (!isOpen || !persona) return null;
  
  const style = getStrategyCardStyle('Audience Personas');
  const isSovrnCard = usesSovrnData('Audience Personas');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:rounded-xl shadow-sovrn-lg max-w-full sm:max-w-3xl sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored Header - Gold background for Sovrn data */}
        <div className={`${style.headerBg} p-6 sm:rounded-t-xl relative`}>
          {/* Sovrn logo for Gold header cards */}
          {isSovrnCard && (
            <div className="absolute top-4 left-4">
              <img src="/Sovrn_Logo.png" alt="Sovrn" className="h-5 w-auto opacity-80" />
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl bg-black/10 p-3 rounded-xl">{persona.emoji}</span>
              <div className="text-[#282828]">
                <h2 className="text-xl sm:text-2xl font-bold">{persona.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-black/10 text-[#282828] text-sm font-medium rounded-full">
                    {persona.category}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onSaveCard && onUnsaveCard && isSaved && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSaved(`persona-${persona.id}`)) {
                      onUnsaveCard(`persona-${persona.id}`);
                    } else {
                      onSaveCard({ type: 'persona', data: persona });
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isSaved(`persona-${persona.id}`)
                      ? 'bg-white text-emerald-600'
                      : 'bg-black/10 text-[#282828] hover:bg-black/20'
                  }`}
                  title={isSaved(`persona-${persona.id}`) ? 'Remove from saved' : 'Save card'}
                >
                  {isSaved(`persona-${persona.id}`) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-lg transition-colors touch-manipulation active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-[#282828]" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Section 1: Core Insight */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <Eye className={`w-4 h-4 ${style.text}`} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Core Insight</h3>
            </div>
            <p className="text-neutral-700 leading-relaxed text-lg">
              <HighlightedText text={persona.coreInsight || ''} />
            </p>
          </div>

          {/* Section 2: Creative Hook - The "Did You Know?" equivalent */}
          <div className={`${style.bg} border ${style.border} rounded-xl p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className={`w-5 h-5 ${style.text}`} />
              <h3 className={`font-semibold ${style.text}`}>Creative Hook</h3>
            </div>
            <p className="text-neutral-800 italic font-medium text-lg leading-relaxed">
              "{persona.creativeHooks?.[0] || 'No creative hook available'}"
            </p>
            {persona.creativeHooks && persona.creativeHooks.length > 1 && (
              <div className="mt-4 pt-4 border-t border-emerald-200 space-y-2">
                {persona.creativeHooks.slice(1).map((hook, index) => (
                  <p key={index} className="text-neutral-600 text-sm italic">
                    "{hook}"
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Media Targeting - The "Marketing Implication" equivalent */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 ${style.bg} rounded-lg`}>
                <Target className={`w-4 h-4 ${style.text}`} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Media Targeting</h3>
            </div>
            {Array.isArray(persona.mediaTargeting) ? (
              <ul className="space-y-2">
                {persona.mediaTargeting.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={`w-1.5 h-1.5 ${style.bgSolid} rounded-full mt-2 flex-shrink-0`}></span>
                    <span className="text-neutral-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-700 leading-relaxed">
                {persona.mediaTargeting || 'No media targeting available'}
              </p>
            )}
          </div>

          {/* Strategic Takeaway - NEW SECTION */}
          {persona.actionableStrategy && (
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-brand-gold" />
                <h3 className="font-semibold text-neutral-900">Strategic Takeaway</h3>
              </div>
              <div className="space-y-3">
                {persona.actionableStrategy.creativeHook && (
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase">Creative Approach:</span>
                    <p className="text-neutral-700 mt-1">{persona.actionableStrategy.creativeHook}</p>
                  </div>
                )}
                {persona.actionableStrategy.mediaTargeting && (
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase">Channel Strategy:</span>
                    <p className="text-neutral-700 mt-1">{persona.actionableStrategy.mediaTargeting}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 sm:rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={() => onViewDeals(persona)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 ${style.headerBg} ${style.headerText} rounded-lg hover:opacity-90 transition-opacity font-medium`}
            >
              <Users className="w-5 h-5" />
              View Relevant Deals
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
