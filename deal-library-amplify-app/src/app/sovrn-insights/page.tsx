'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Zap, Search, Shuffle, X, 
  ChevronLeft, ChevronRight, Download, Bookmark,
  BarChart2
} from 'lucide-react';
import InsightCard from '@/components/InsightCard';
import { useSaveCard } from '@/components/AppLayout';
import {
  sovrnInsights,
  SovrnInsight,
  InsightCategory,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  getAllCategories,
  getCategoryCounts,
  searchInsights,
  getRandomInsights,
  getRelatedInsights,
  getDailyInsight,
  getFeaturedInsights,
} from '@/data/sovrnInsights';
import html2canvas from 'html2canvas';

function SovrnInsightsContent() {
  // Get save card context for saving insights
  const { onSaveCard, onUnsaveCard, isSaved } = useSaveCard();
  const searchParams = useSearchParams();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | 'all'>('all');
  const [filteredInsights, setFilteredInsights] = useState<SovrnInsight[]>(sovrnInsights);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenInsight, setFullscreenInsight] = useState<SovrnInsight | null>(null);
  const [relatedInsights, setRelatedInsights] = useState<SovrnInsight[]>([]);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Refs
  const cardRef = useRef<HTMLDivElement>(null);

  // Categories and counts
  const categories = getAllCategories();
  const categoryCounts = getCategoryCounts();

  // Helper function to get card ID for an insight
  const getInsightCardId = (insight: SovrnInsight) => `sovrn-insight-${insight.id}`;
  
  // Check if an insight is saved
  const isInsightSaved = (insight: SovrnInsight) => isSaved(getInsightCardId(insight));

  // Handle openInsight query parameter
  useEffect(() => {
    const openInsightId = searchParams.get('openInsight');
    if (openInsightId) {
      const insight = sovrnInsights.find(i => i.id === openInsightId);
      if (insight) {
        setFullscreenInsight(insight);
        setRelatedInsights(getRelatedInsights(insight, 6));
        setIsFullscreen(true);
      }
    }
  }, [searchParams]);

  // Filter insights based on search and category
  useEffect(() => {
    let results = sovrnInsights;

    // Apply search filter
    if (searchQuery.trim()) {
      results = searchInsights(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(insight => insight.category === selectedCategory);
    }

    setFilteredInsights(results);
  }, [searchQuery, selectedCategory]);

  // Handlers
  const handleSave = useCallback((insight: SovrnInsight) => {
    const cardId = getInsightCardId(insight);
    if (isInsightSaved(insight)) {
      onUnsaveCard(cardId);
    } else {
      onSaveCard({ type: 'sovrn-insight', data: insight });
    }
  }, [onSaveCard, onUnsaveCard]);

  const handleCopy = useCallback(async (insight: SovrnInsight) => {
    const text = `📊 ${insight.headline}\n\n💡 Did You Know?\n${insight.didYouKnow}\n\n🎯 Marketing Implication\n${insight.marketingImplication}\n\n— Sovrn Insights`;
    
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleShare = useCallback(async (insight: SovrnInsight) => {
    // Create a shareable image
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sovrn-insight-${insight.id}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      } catch (err) {
        console.error('Failed to generate image:', err);
      }
    }
  }, []);

  const handleShuffle = useCallback(() => {
    const shuffled = getRandomInsights(sovrnInsights.length);
    setFilteredInsights(shuffled);
  }, []);

  const handleViewRelated = useCallback((insight: SovrnInsight) => {
    const related = getRelatedInsights(insight, 6);
    setRelatedInsights(related);
    setFullscreenInsight(insight);
    setIsFullscreen(true);
  }, []);

  const handleFullscreen = useCallback((insight: SovrnInsight) => {
    setFullscreenInsight(insight);
    setRelatedInsights(getRelatedInsights(insight, 6));
    setIsFullscreen(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setFullscreenInsight(null);
    setRelatedInsights([]);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-brand-gold to-brand-orange rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-brand-charcoal">
                  Sovrn Insights
                </h1>
                <p className="text-sm text-neutral-500">
                  Data-driven marketing insights
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 md:flex-initial md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                />
              </div>

              {/* Shuffle */}
              <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:border-brand-gold hover:text-brand-gold transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            </div>
          </div>

          {/* Category filters */}
          <div className="mt-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-brand-charcoal text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                All ({sovrnInsights.length})
              </button>
              {categories.map(category => {
                const icon = CATEGORY_ICONS[category];
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-brand-charcoal text-white'
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{category}</span>
                    <span className="text-xs opacity-60">({categoryCounts[category]})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <BarChart2 className="w-4 h-4" />
            <span>{filteredInsights.length} insights</span>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Content */}
        {filteredInsights.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">No insights found</h3>
            <p className="text-neutral-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-brand-gold hover:text-brand-orange font-medium"
            >
              Reset filters
            </button>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInsights.map(insight => (
              <div key={insight.id} onClick={() => handleFullscreen(insight)} className="cursor-pointer">
                <InsightCard
                  insight={insight}
                  isSaved={isInsightSaved(insight)}
                  onSave={handleSave}
                  onCopy={handleCopy}
                  onShare={handleShare}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen/Presentation Modal */}
      {isFullscreen && fullscreenInsight && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Close button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          <button
            onClick={() => {
              const currentIndex = filteredInsights.findIndex(i => i.id === fullscreenInsight.id);
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredInsights.length - 1;
              setFullscreenInsight(filteredInsights[prevIndex]);
              setRelatedInsights(getRelatedInsights(filteredInsights[prevIndex], 6));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              const currentIndex = filteredInsights.findIndex(i => i.id === fullscreenInsight.id);
              const nextIndex = currentIndex < filteredInsights.length - 1 ? currentIndex + 1 : 0;
              setFullscreenInsight(filteredInsights[nextIndex]);
              setRelatedInsights(getRelatedInsights(filteredInsights[nextIndex], 6));
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Content - square format optimized for LinkedIn (1:1 aspect ratio) */}
          <div className="w-full max-w-[540px] mx-auto">
            <InsightCard
              insight={fullscreenInsight}
              isHero
              isFullscreen
              isSaved={isInsightSaved(fullscreenInsight)}
              onSave={handleSave}
              onCopy={handleCopy}
              onShare={handleShare}
            />
          </div>
        </div>
      )}

      {/* Copy toast */}
      {showCopyToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-brand-charcoal text-white rounded-lg shadow-lg text-sm font-medium z-50 animate-fade-in">
          ✓ Copied to clipboard
        </div>
      )}

      {/* Custom styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function SovrnInsightsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading insights...</p>
        </div>
      </div>
    }>
      <SovrnInsightsContent />
    </Suspense>
  );
}

