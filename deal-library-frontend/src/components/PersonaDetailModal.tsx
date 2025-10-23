import { Persona } from '@/types/deal';
import { X, Users, Target, MessageSquare, Eye, Bookmark, BookmarkCheck } from 'lucide-react';

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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-sovrn-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{persona.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">{persona.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                    {persona.category}
                  </span>
                  <span className="text-sm text-neutral-500">
                    {persona.dealCount} deals available
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onSaveCard && onUnsaveCard && isSaved ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSaved(`persona-${persona.id}`)) {
                      onUnsaveCard(`persona-${persona.id}`);
                    } else {
                      onSaveCard({ type: 'persona', data: persona });
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors border ${
                    isSaved(`persona-${persona.id}`)
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
                      : 'text-neutral-500 hover:text-blue-600 hover:bg-blue-50 border-neutral-200'
                  }`}
                  title={isSaved(`persona-${persona.id}`) ? 'Remove from saved' : 'Save card'}
                >
                  {isSaved(`persona-${persona.id}`) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              ) : null}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Core Insight */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary-600" />
              Core Insight
            </h3>
            <p className="text-neutral-700 leading-relaxed">
              {persona.coreInsight}
            </p>
          </div>

          {/* Creative Hook */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              Creative Hook
            </h3>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-primary-800 italic font-medium">
                "{persona.creativeHooks?.[0] || 'No creative hook available'}"
              </p>
            </div>
          </div>

          {/* Media Targeting */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Media Targeting
            </h3>
            <p className="text-neutral-700 leading-relaxed">
              {persona.mediaTargeting}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={() => onViewDeals(persona)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Users className="w-5 h-5" />
              View Relevant Deals
            </button>
            <button
              onClick={(e) => {
                console.log('Footer close button clicked');
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
