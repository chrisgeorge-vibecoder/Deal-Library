import { AudienceSegment } from '@/types/audience';
import { Bookmark, BookmarkCheck, Target, ShoppingBag } from 'lucide-react';

interface AudienceCardProps {
  segment: AudienceSegment;
  onClick?: () => void;
  onSaveCard?: (card: { type: 'audience-taxonomy', data: AudienceSegment }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export default function AudienceCard({ 
  segment, 
  onClick, 
  onSaveCard, 
  onUnsaveCard, 
  isSaved 
}: AudienceCardProps) {
  const cardId = `audience-taxonomy-${segment.sovrnSegmentId}`;
  const saved = isSaved ? isSaved(cardId) : false;
  const isCommerceAudience = segment.segmentType === 'Commerce Audience';

  return (
    <div 
      className={`card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
        isCommerceAudience 
          ? 'border-l-4 border-brand-gold bg-gradient-to-r from-brand-gold/5 to-transparent' 
          : ''
      }`}
      onClick={onClick}
    >
      {/* Header: Icon and Bookmark */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCommerceAudience ? (
            <ShoppingBag className="w-5 h-5 text-brand-gold" />
          ) : (
            <Target className="w-5 h-5 text-brand-orange" />
          )}
          {segment.activelyGenerated && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        {onSaveCard && onUnsaveCard && isSaved && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (saved) {
                onUnsaveCard(cardId);
              } else {
                onSaveCard({ type: 'audience-taxonomy', data: segment });
              }
            }}
            className={`p-2 rounded-lg transition-colors border ${
              saved
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
                : 'text-neutral-400 hover:text-blue-600 hover:bg-blue-50 border-neutral-200'
            }`}
            title={saved ? 'Remove from saved' : 'Save card'}
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Segment Name */}
      <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-orange transition-colors mb-2">
        {segment.segmentName}
      </h3>

      {/* Description */}
      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
        {segment.segmentDescription}
      </p>

      {/* Full Path Breadcrumb */}
      <div className="text-xs text-neutral-500 mb-3 font-medium line-clamp-1" title={segment.fullPath}>
        {segment.fullPath}
      </div>

      {/* Metrics Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
          ${segment.cpm.toFixed(2)} CPM
        </span>
        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
          {(segment.mediaPercentCost * 100).toFixed(0)}% Media Cost
        </span>
        <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
          {segment.segmentType}
        </span>
      </div>
    </div>
  );
}
