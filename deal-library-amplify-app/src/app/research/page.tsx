'use client';

import ResearchLibrary from '@/components/ResearchLibrary';
import { useSaveCard } from '@/components/AppLayout';
import { Suspense } from 'react';

function ResearchPageContent() {
  // Get save/unsave functions from AppLayout context
  const { onSaveCard, onUnsaveCard, isSaved } = useSaveCard();

  return (
    <ResearchLibrary 
      onSaveCard={onSaveCard}
      onUnsaveCard={onUnsaveCard}
      isSaved={isSaved}
    />
  );
}

export default function ResearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResearchPageContent />
    </Suspense>
  );
}
