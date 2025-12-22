'use client';

import React, { useRef, useCallback } from 'react';
import { Bookmark, ArrowRight, Download } from 'lucide-react';
import { SovrnInsight, CATEGORY_COLORS, CATEGORY_ICONS } from '@/data/sovrnInsights';
import html2canvas from 'html2canvas';

interface InsightCardProps {
  insight: SovrnInsight;
  onSave?: (insight: SovrnInsight) => void;
  onCopy?: (insight: SovrnInsight) => void;
  onShare?: (insight: SovrnInsight) => void;
  onViewRelated?: (insight: SovrnInsight) => void;
  isSaved?: boolean;
  isHero?: boolean;
  isDaily?: boolean;
  isFullscreen?: boolean;
}

export default function InsightCard({
  insight,
  onSave,
  onCopy,
  onShare,
  onViewRelated,
  isSaved = false,
  isHero = false,
  isDaily = false,
  isFullscreen = false,
}: InsightCardProps) {
  const categoryStyle = CATEGORY_COLORS[insight.category];
  const categoryIcon = CATEGORY_ICONS[insight.category];

  // Format the "Did You Know" text to highlight numbers and percentages
  const formatDidYouKnow = (text: string) => {
    // Highlight numbers, percentages, and dollar amounts
    // Also captures K, +, or K+ suffixes that directly follow the metric
    // Excludes numbers followed by "D" (like "3D") to avoid highlighting "3" in "3D Printers"
    return text.replace(
      /(\$[\d,]+(?:\.\d+)?[K]?[+]?|\d+(?:\.\d+)?%(?:x)?[K]?[+]?|\d+(?:,\d+)+(?:\.\d+)?[K]?[+]?)(?![D])/g,
      '<span class="font-bold">$1</span>'
    );
  };

  if (isHero) {
    // Compact mode for daily insight on main page (not fullscreen)
    const isCompact = isDaily && !isFullscreen;
    
    // Fullscreen uses square-optimized vertical layout for LinkedIn sharing (1:1 aspect ratio)
    if (isFullscreen) {
      const cardRef = useRef<HTMLDivElement>(null);
      const actionsRef = useRef<HTMLDivElement>(null);

      const handleDownload = useCallback(async () => {
        if (!cardRef.current || !actionsRef.current) return;
        
        // Hide action buttons during capture
        actionsRef.current.style.display = 'none';
        
        try {
          const canvas = await html2canvas(cardRef.current, {
            scale: 2, // 2x scale for 1080px output
            useCORS: true,
            backgroundColor: null,
          });
          
          // Convert to JPG and download
          const link = document.createElement('a');
          link.download = `sovrn-insight-${insight.id}.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 0.95);
          link.click();
        } catch (error) {
          console.error('Error downloading image:', error);
        } finally {
          // Show action buttons again
          actionsRef.current.style.display = 'flex';
        }
      }, [insight.id]);

      return (
        <div className="group relative rounded-2xl overflow-hidden shadow-sovrn-lg flex flex-col" style={{ maxWidth: '540px', aspectRatio: '1 / 1' }}>
          {/* Capture area */}
          <div ref={cardRef} className="flex flex-col flex-1">
            {/* Top - Gold with headline */}
            <div className="bg-brand-gold p-6 flex-[2] flex flex-col justify-center relative">
              {/* Sovrn logo - upper left */}
              <div className="absolute top-3 left-4">
                <img 
                  src="/Sovrn_Logo.png" 
                  alt="Sovrn" 
                  className="h-5 w-auto"
                />
              </div>
              <h2 className="text-2xl font-extrabold text-brand-charcoal leading-tight text-center px-4 mt-4">
                {insight.headline}
              </h2>
            </div>

            {/* Bottom - White with content */}
            <div className="bg-white p-5 flex-[3] flex flex-col">
              {/* Did You Know */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💡</span>
                  <h3 className="text-sm font-bold text-brand-charcoal">Did You Know?</h3>
                </div>
                <p 
                  className="text-sm text-neutral-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatDidYouKnow(insight.didYouKnow) }}
                />
              </div>

              {/* Marketing Implication */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎯</span>
                  <h3 className="text-sm font-bold text-brand-charcoal">Marketing Implication</h3>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {insight.marketingImplication}
                </p>
              </div>

              {/* Powered by footer */}
              <div className="mt-auto pt-3">
                <p className="text-[10px] text-neutral-400 text-center">
                  Powered by the Sovrn Data Collective
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons - upper right, appear on hover */}
          <div 
            ref={actionsRef}
            className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {/* Download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="p-2 rounded-lg bg-white/90 text-neutral-600 hover:bg-brand-gold hover:text-brand-charcoal transition-all shadow-sm"
              title="Download as JPG"
            >
              <Download className="w-4 h-4" />
            </button>
            {/* Save button - just icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave?.(insight);
              }}
              className={`p-2 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-brand-gold text-brand-charcoal'
                  : 'bg-white/90 text-neutral-600 hover:bg-brand-gold hover:text-brand-charcoal'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      );
    }
    
    // Non-fullscreen (compact daily insight on main page) uses white background
    return (
      <div className="relative bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sovrn-lg">
        {/* Color accent bar at top - consistent with standard cards */}
        <div className={`h-1.5 ${categoryStyle.bg.replace('bg-', 'bg-').replace('-50', '-400')}`} />
        
        <div className={isCompact ? "p-5" : "p-8"}>
          {/* Badges in a row */}
          <div className="flex items-center gap-2 mb-3">
            {/* Daily badge */}
            {isDaily && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-gold text-brand-charcoal rounded-full font-semibold ${isCompact ? 'text-xs' : 'text-sm'}`}>
                ⚡ Today's Insight
              </div>
            )}

            {/* Category badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${isCompact ? 'text-xs' : 'text-sm'} ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border}`}>
              <span>{categoryIcon}</span>
              <span>{insight.category}</span>
            </div>
          </div>

          {/* Headline */}
          <h2 className={`font-extrabold text-brand-charcoal leading-tight ${isCompact ? 'text-xl md:text-2xl mb-3' : 'text-3xl md:text-4xl mb-6'}`}>
            {insight.headline}
          </h2>

          {/* Did You Know */}
          <div className={isCompact ? "mb-3" : "mb-6"}>
            <div className={`flex items-center gap-2 ${isCompact ? 'mb-1.5' : 'mb-3'}`}>
              <span className={isCompact ? "text-lg" : "text-2xl"}>💡</span>
              <h3 className={`font-bold text-brand-charcoal ${isCompact ? 'text-sm' : 'text-lg'}`}>Did You Know?</h3>
            </div>
            <p 
              className={`text-neutral-700 leading-relaxed ${isCompact ? 'text-sm' : 'text-lg'}`}
              dangerouslySetInnerHTML={{ __html: formatDidYouKnow(insight.didYouKnow) }}
            />
          </div>

          {/* Marketing Implication - solid background consistent with standard cards */}
          <div className={`${categoryStyle.bg} rounded-xl border ${categoryStyle.border} ${isCompact ? 'p-3' : 'p-5'}`}>
            <div className={`flex items-center gap-2 ${isCompact ? 'mb-1' : 'mb-2'}`}>
              <span className={isCompact ? "text-base" : "text-xl"}>🎯</span>
              <h3 className={`font-bold text-brand-charcoal ${isCompact ? 'text-sm' : 'text-base'}`}>Marketing Implication</h3>
            </div>
            <p className={`text-neutral-800 font-medium leading-relaxed ${isCompact ? 'text-sm' : ''}`}>
              {insight.marketingImplication}
            </p>
          </div>

          {/* Tags - hidden in fullscreen mode for cleaner focus */}
          {!isFullscreen && insight.tags.length > 0 && (
            <div className={`flex flex-wrap gap-2 border-t border-neutral-100 ${isCompact ? 'mt-3 pt-3' : 'mt-6 pt-4'}`}>
              {insight.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-neutral-100 text-neutral-500 rounded text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons - save only */}
          <div className={`flex items-center gap-2 border-t border-neutral-100 ${isCompact ? 'mt-3 pt-3' : 'mt-6 pt-4'}`}>
            <button
              onClick={() => onSave?.(insight)}
              className={`flex items-center gap-1.5 rounded-lg font-medium transition-all ${
                isCompact
                  ? 'px-2.5 py-1.5 text-xs' 
                  : 'px-4 py-2.5 text-sm'
              } ${
                isSaved
                  ? 'bg-brand-gold text-brand-charcoal'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-brand-gold/10 hover:text-brand-gold'
              }`}
            >
              <Bookmark className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            {onViewRelated && (
              <button
                onClick={() => onViewRelated(insight)}
                className={`flex items-center gap-1.5 rounded-lg font-medium bg-brand-charcoal text-white hover:bg-neutral-800 transition-all ml-auto ${isCompact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'}`}
              >
                Related
                <ArrowRight className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard card
  return (
    <div className="group relative rounded-xl border border-neutral-200 shadow-sovrn hover:shadow-sovrn-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Gold header with headline - fixed height for 2-line headlines */}
      <div className="bg-brand-gold p-4 relative min-h-[88px] flex items-center">
        {/* Sovrn logo - upper left */}
        <div className="absolute top-3 left-3">
          <img 
            src="/Sovrn_Logo.png" 
            alt="Sovrn" 
            className="h-4 w-auto opacity-80"
          />
        </div>
        
        {/* Save button - appears on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(insight);
            }}
            className={`p-1.5 rounded-lg transition-all shadow-sm ${
              isSaved
                ? 'bg-white text-[#FFD42B]'
                : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-brand-charcoal'
            }`}
            title={isSaved ? 'Saved' : 'Save insight'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        {/* Headline - with top padding to avoid logo */}
        <h3 className="text-lg font-bold text-brand-charcoal leading-snug pr-8 mt-4">
          {insight.headline}
        </h3>
      </div>

      {/* White content area */}
      <div className="bg-white p-4 flex flex-col flex-1">
        {/* Did You Know */}
        <div className="mb-4 flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">💡</span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Did You Know?</span>
          </div>
          <p 
            className="text-sm text-neutral-600 leading-relaxed line-clamp-4"
            dangerouslySetInnerHTML={{ __html: formatDidYouKnow(insight.didYouKnow) }}
          />
        </div>

        {/* Marketing Implication */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">🎯</span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Marketing Implication</span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {insight.marketingImplication}
          </p>
        </div>
      </div>
    </div>
  );
}

// Compact card variant for carousel view
export function InsightCardCompact({
  insight,
  onSave,
  onCopy,
  isSaved = false,
  onClick,
}: {
  insight: SovrnInsight;
  onSave?: (insight: SovrnInsight) => void;
  onCopy?: (insight: SovrnInsight) => void;
  isSaved?: boolean;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl border border-neutral-200 shadow-sovrn hover:shadow-sovrn-lg transition-all duration-300 overflow-hidden cursor-pointer min-w-[320px] max-w-[400px] snap-center"
    >
      {/* Gold header with headline - fixed height for 2-line headlines */}
      <div className="bg-brand-gold p-3 relative min-h-[72px] flex items-center">
        {/* Sovrn logo - upper left */}
        <div className="absolute top-2 left-2">
          <img 
            src="/Sovrn_Logo.png" 
            alt="Sovrn" 
            className="h-3 w-auto opacity-80"
          />
        </div>
        
        {/* Save button - appears on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(insight);
            }}
            className={`p-1 rounded-lg transition-all shadow-sm ${
              isSaved ? 'bg-white text-[#FFD42B]' : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-brand-charcoal'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Headline - with top padding to avoid logo */}
        <h3 className="font-bold text-brand-charcoal line-clamp-2 pr-6 mt-3">
          {insight.headline}
        </h3>
      </div>
      
      {/* White content area */}
      <div className="bg-white p-3">
        {/* Truncated content */}
        <p className="text-xs text-neutral-500 line-clamp-2 mb-2">
          {insight.didYouKnow}
        </p>

        {/* CTA */}
        <div className="flex items-center text-xs text-brand-orange font-medium">
          <span>Read insight</span>
          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

