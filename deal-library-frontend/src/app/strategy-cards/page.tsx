'use client';

import AudienceExplorer from '@/components/AudienceExplorer';
import { useSaveCard } from '@/components/AppLayout';

export default function IntelligenceCardsPage() {
  // Get save/unsave functions from AppLayout context
  const { onSaveCard, onUnsaveCard, isSaved } = useSaveCard();

  return (
    <div className="h-full">
      <AudienceExplorer
        onSwitchToChat={(query) => {
          // Navigate to main page with query
          window.location.href = `/?search=${encodeURIComponent(query)}`;
        }}
        onSaveCard={onSaveCard}
        onUnsaveCard={onUnsaveCard}
        isSaved={isSaved}
      />
    </div>
  );
}
