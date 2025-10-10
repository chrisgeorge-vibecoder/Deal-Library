'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    console.log('Search query:', query);
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Sovrn Marketing Co-Pilot
        </h1>
        
        {error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        <ChatInterface
          onSearch={handleSearch}
          deals={[]}
          loading={loading}
          onDealClick={() => {}}
          onFilterToggle={() => {}}
          resetChat={false}
          onAddToCart={() => {}}
          onRemoveFromCart={() => {}}
          isInCart={() => false}
          aiResponse=""
          aiPersonas={[]}
          aiAudienceInsights={[]}
          aiMarketSizing={[]}
          aiGeoCards={[]}
          onPersonaClick={() => {}}
          inputValue=""
          onInputValueChange={() => {}}
        />
      </div>
    </div>
  );
}


