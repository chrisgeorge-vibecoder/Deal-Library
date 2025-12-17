'use client';

import React from 'react';
import { 
  Users, Target, BarChart3, MapPin, TrendingUp, Building2, 
  Lightbulb, FileText, Award, Newspaper, Shield, AlertTriangle,
  ChevronRight, Bookmark, BookmarkCheck, Presentation, Download
} from 'lucide-react';
import { getStrategyCardStyle, usesSovrnData, StrategyCardCategory } from '@/data/strategyCardStyles';

// ===========================================
// SHARED CARD WRAPPER COMPONENT
// ===========================================
interface CardWrapperProps {
  category: StrategyCardCategory;
  onClick: () => void;
  children: React.ReactNode;
  onSave?: () => void;
  isSaved?: boolean;
  onDownload?: () => void;
}

function CardWrapper({ category, onClick, children, onSave, isSaved, onDownload }: CardWrapperProps) {
  const style = getStrategyCardStyle(category);
  const isSovrnCard = usesSovrnData(category);

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px] flex items-center`}>
        {/* Sovrn logo - only on Gold/Sovrn data cards */}
        {isSovrnCard && (
          <div className="absolute top-3 left-3">
            <img 
              src="/Sovrn_Logo.png" 
              alt="Sovrn" 
              className="h-4 w-auto opacity-80"
            />
          </div>
        )}
        
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onDownload && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSovrnCard 
                  ? 'bg-white/90 text-neutral-600 hover:bg-white hover:text-[#282828]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? isSovrnCard 
                    ? 'bg-white text-[#FFD42B]' 
                    : 'bg-white text-[#2F4A7C]'
                  : isSovrnCard
                    ? 'bg-white/90 text-neutral-600 hover:bg-white hover:text-[#282828]'
                    : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

// ===========================================
// INLINE PERSONA CARD
// ===========================================
interface InlinePersonaCardProps {
  persona: {
    emoji?: string;
    name?: string;
    personaName?: string;
    category?: string;
    coreInsight?: string;
    description?: string;
    dealCount?: number;
  };
  onClick: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function InlinePersonaCard({ persona, onClick, onSave, isSaved }: InlinePersonaCardProps) {
  const style = getStrategyCardStyle('Audience Personas');
  const isSovrnCard = usesSovrnData('Audience Personas');

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Gold Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px]`}>
        {/* Sovrn logo */}
        <div className="absolute top-3 left-3">
          <img src="/Sovrn_Logo.png" alt="Sovrn" className="h-4 w-auto opacity-80" />
        </div>
        
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-white text-[#FFD42B]'
                  : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-[#282828]'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-3xl flex-shrink-0">{persona.emoji || '👤'}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[#282828] truncate text-lg">
              {persona.name || persona.personaName}
            </h4>
            {persona.category && (
              <span className="inline-block px-2 py-0.5 bg-white/50 text-[#282828] text-xs font-medium rounded-full mt-1">
                {persona.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="bg-white p-4">
        <p className="text-sm text-neutral-600 line-clamp-2">
          {persona.coreInsight || persona.description}
        </p>
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Audience Persona
          </span>
          <span className="text-[#FFD42B] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// INLINE AUDIENCE INSIGHTS CARD
// ===========================================
interface InlineAudienceInsightsCardProps {
  insights: {
    audienceName?: string;
    demographics?: {
      ageRange?: string;
      incomeRange?: string;
    };
    insights?: {
      keyCharacteristics?: string[];
    };
  };
  onClick: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function InlineAudienceInsightsCard({ insights, onClick, onSave, isSaved }: InlineAudienceInsightsCardProps) {
  const style = getStrategyCardStyle('Audience Insights');

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Gold Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px]`}>
        {/* Sovrn logo */}
        <div className="absolute top-3 left-3">
          <img src="/Sovrn_Logo.png" alt="Sovrn" className="h-4 w-auto opacity-80" />
        </div>
        
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-white text-[#FFD42B]'
                  : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-[#282828]'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-3 mt-4">
          <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-[#282828]" />
          </div>
          <div>
            <h4 className="font-bold text-[#282828]">{insights.audienceName || 'Audience Insights'}</h4>
            <p className="text-xs text-[#282828]/70">Behavioral Analysis</p>
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="bg-white p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {insights.demographics?.ageRange && (
            <div className="bg-neutral-50 rounded p-2">
              <div className="text-xs text-neutral-500">Age Range</div>
              <div className="font-medium text-neutral-900">{insights.demographics.ageRange}</div>
            </div>
          )}
          {insights.demographics?.incomeRange && (
            <div className="bg-neutral-50 rounded p-2">
              <div className="text-xs text-neutral-500">Income</div>
              <div className="font-medium text-neutral-900">{insights.demographics.incomeRange}</div>
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>5 slides available</span>
          <span className="text-[#FFD42B] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View Slides
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// INLINE MARKET SIZING CARD (Gemini - Navy)
// ===========================================
interface InlineMarketSizingCardProps {
  sizing: {
    marketName?: string;
    totalMarketSize?: string;
    growthRate?: string;
    addressableValue?: string;
  };
  onClick: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function InlineMarketSizingCard({ sizing, onClick, onSave, isSaved }: InlineMarketSizingCardProps) {
  const style = getStrategyCardStyle('Market Intelligence');

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Navy Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px]`}>
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-white text-[#2F4A7C]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-white">{sizing.marketName || 'Market Intelligence'}</h4>
            <p className="text-xs text-white/70">Market Sizing & Trends</p>
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="bg-white p-4">
        <div className="flex items-center gap-4">
          {sizing.totalMarketSize && (
            <div>
              <div className="text-2xl font-bold text-[#2F4A7C]">{sizing.totalMarketSize}</div>
              <div className="text-xs text-neutral-500">Total Market</div>
            </div>
          )}
          {sizing.growthRate && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-600">{sizing.growthRate}</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>4 slides available</span>
          <span className="text-[#2F4A7C] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View Slides
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// INLINE GEO INSIGHTS CARD (Sovrn - Gold)
// ===========================================
interface InlineGeoCardProps {
  geo: {
    audienceName?: string;
    totalAddressable?: string;
    topMarkets?: Array<{ region?: string; city?: string; state?: string; percentage?: string }>;
  };
  onClick: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function InlineGeoCard({ geo, onClick, onSave, isSaved }: InlineGeoCardProps) {
  const topMarket = geo.topMarkets?.[0];
  const style = getStrategyCardStyle('Geo Insights');
  
  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Gold Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px]`}>
        {/* Sovrn logo */}
        <div className="absolute top-3 left-3">
          <img src="/Sovrn_Logo.png" alt="Sovrn" className="h-4 w-auto opacity-80" />
        </div>
        
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-white text-[#FFD42B]'
                  : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-[#282828]'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-3 mt-4">
          <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-[#282828]" />
          </div>
          <div>
            <h4 className="font-bold text-[#282828]">{geo.audienceName || 'Geographic Insights'}</h4>
            <p className="text-xs text-[#282828]/70">Location Analysis</p>
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="bg-white p-4">
        <div className="flex items-center gap-4">
          {geo.totalAddressable && (
            <div>
              <div className="text-xl font-bold text-[#282828]">{geo.totalAddressable}</div>
              <div className="text-xs text-neutral-500">Addressable Market</div>
            </div>
          )}
          {topMarket && (
            <div className="text-sm">
              <div className="text-xs text-neutral-500">Top Market</div>
              <div className="font-medium text-neutral-900">
                {topMarket.city ? `${topMarket.city}, ${topMarket.state}` : topMarket.region}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>{geo.topMarkets?.length || 0} markets analyzed</span>
          <span className="text-[#FFD42B] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View Slides
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// INLINE SWOT CARD (Gemini - Navy)
// ===========================================
interface InlineSWOTCardProps {
  swot: {
    companyName?: string;
    summary?: string;
    swot?: {
      strengths?: Array<{ title: string } | string>;
      weaknesses?: Array<{ title: string } | string>;
      opportunities?: Array<{ title: string } | string>;
      threats?: Array<{ title: string } | string>;
    };
  };
  onClick: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function InlineSWOTCard({ swot, onClick, onSave, isSaved }: InlineSWOTCardProps) {
  const style = getStrategyCardStyle('Marketing SWOT');
  
  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Navy Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px]`}>
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-white text-[#2F4A7C]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-white">Marketing SWOT</h4>
            <p className="text-xs text-white/70">{swot.companyName}</p>
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="bg-white p-4">
        {/* Mini SWOT Grid */}
        <div className="grid grid-cols-4 gap-1">
          <div className="bg-green-50 p-2 rounded text-center">
            <Shield className="w-4 h-4 text-green-600 mx-auto" />
            <div className="text-xs font-medium text-green-700 mt-1">{swot.swot?.strengths?.length || 0}</div>
          </div>
          <div className="bg-red-50 p-2 rounded text-center">
            <AlertTriangle className="w-4 h-4 text-red-600 mx-auto" />
            <div className="text-xs font-medium text-red-700 mt-1">{swot.swot?.weaknesses?.length || 0}</div>
          </div>
          <div className="bg-blue-50 p-2 rounded text-center">
            <TrendingUp className="w-4 h-4 text-blue-600 mx-auto" />
            <div className="text-xs font-medium text-blue-700 mt-1">{swot.swot?.opportunities?.length || 0}</div>
          </div>
          <div className="bg-orange-50 p-2 rounded text-center">
            <AlertTriangle className="w-4 h-4 text-orange-600 mx-auto" />
            <div className="text-xs font-medium text-orange-700 mt-1">{swot.swot?.threats?.length || 0}</div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>3 slides available</span>
          <span className="text-[#2F4A7C] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View Slides
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// INLINE COMPETITIVE INTELLIGENCE CARD (Gemini - Navy)
// ===========================================
interface InlineCompetitiveIntelCardProps {
  intel: {
    competitorOrIndustry?: string;
    competitiveAnalysis?: {
      mainCompetitors?: Array<{ name: string }>;
      marketPositioning?: string;
    };
  };
  onClick: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function InlineCompetitiveIntelCard({ intel, onClick, onSave, isSaved }: InlineCompetitiveIntelCardProps) {
  const style = getStrategyCardStyle('Competitive Intelligence');

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Navy Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px]`}>
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-white text-[#2F4A7C]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-white">Competitive Intelligence</h4>
            <p className="text-xs text-white/70">{intel.competitorOrIndustry}</p>
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="bg-white p-4">
        {intel.competitiveAnalysis?.mainCompetitors && intel.competitiveAnalysis.mainCompetitors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {intel.competitiveAnalysis.mainCompetitors.slice(0, 3).map((comp, idx) => (
              <span key={idx} className="px-2 py-1 bg-[#2F4A7C]/10 text-[#2F4A7C] text-xs rounded-full font-medium">
                {comp.name}
              </span>
            ))}
            {intel.competitiveAnalysis.mainCompetitors.length > 3 && (
              <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                +{intel.competitiveAnalysis.mainCompetitors.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>4 slides available</span>
          <span className="text-[#2F4A7C] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View Slides
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// INLINE BRAND STRATEGY CARD (Gemini - Navy)
// ===========================================
interface InlineBrandStrategyCardProps {
  strategy: {
    brandOrCategory?: string;
    positioning?: {
      targetPosition?: string;
    };
    messagingFramework?: {
      coreMessage?: string;
    };
  };
  onClick: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function InlineBrandStrategyCard({ strategy, onClick, onSave, isSaved }: InlineBrandStrategyCardProps) {
  const style = getStrategyCardStyle('Brand Strategy');

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Navy Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px]`}>
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-white text-[#2F4A7C]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-white">Brand Strategy</h4>
            <p className="text-xs text-white/70">{strategy.brandOrCategory}</p>
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="bg-white p-4">
        {strategy.messagingFramework?.coreMessage && (
          <div className="p-3 bg-[#2F4A7C]/5 rounded-lg border border-[#2F4A7C]/10">
            <p className="text-sm text-[#2F4A7C] font-medium line-clamp-2">
              "{strategy.messagingFramework.coreMessage}"
            </p>
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>5 slides available</span>
          <span className="text-[#2F4A7C] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View Slides
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// INLINE CONTENT STRATEGY CARD (Gemini - Navy)
// ===========================================
interface InlineContentStrategyCardProps {
  strategy: {
    industryOrTopic?: string;
    trendingTopics?: Array<{ topic: string; relevance: string }>;
    contentRecommendations?: {
      frequency?: string;
    };
  };
  onClick: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function InlineContentStrategyCard({ strategy, onClick, onSave, isSaved }: InlineContentStrategyCardProps) {
  const style = getStrategyCardStyle('Content Strategy');

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Navy Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px]`}>
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-white text-[#2F4A7C]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-white">Content Strategy</h4>
            <p className="text-xs text-white/70">{strategy.industryOrTopic}</p>
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="bg-white p-4">
        {strategy.trendingTopics && strategy.trendingTopics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {strategy.trendingTopics.slice(0, 3).map((topic, idx) => (
              <span key={idx} className="px-2 py-1 bg-[#2F4A7C]/10 text-[#2F4A7C] text-xs rounded-full font-medium">
                {typeof topic === 'string' ? topic : topic.topic}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>4 slides available</span>
          <span className="text-[#2F4A7C] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View Slides
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// INLINE COMPANY PROFILE CARD (Gemini - Navy)
// ===========================================
interface InlineCompanyProfileCardProps {
  profile: {
    stockSymbol?: string;
    companyInfo?: {
      name?: string;
      sector?: string;
      marketCap?: string;
    };
    investmentOutlook?: {
      recommendation?: string;
    };
  };
  onClick: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function InlineCompanyProfileCard({ profile, onClick, onSave, isSaved }: InlineCompanyProfileCardProps) {
  const style = getStrategyCardStyle('Company Profiles');
  const recommendation = profile.investmentOutlook?.recommendation?.toLowerCase() || '';
  const recColor = recommendation.includes('buy') ? 'text-green-600 bg-green-50' 
    : recommendation.includes('sell') ? 'text-red-600 bg-red-50' 
    : 'text-neutral-600 bg-neutral-50';

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Navy Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px]`}>
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-white text-[#2F4A7C]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-white">
              {profile.companyInfo?.name} ({profile.stockSymbol})
            </h4>
            <p className="text-xs text-white/70">{profile.companyInfo?.sector}</p>
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="bg-white p-4">
        <div className="flex items-center gap-3">
          {profile.companyInfo?.marketCap && (
            <div>
              <div className="text-lg font-bold text-neutral-900">{profile.companyInfo.marketCap}</div>
              <div className="text-xs text-neutral-500">Market Cap</div>
            </div>
          )}
          {profile.investmentOutlook?.recommendation && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${recColor}`}>
              {profile.investmentOutlook.recommendation}
            </span>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>5 slides available</span>
          <span className="text-[#2F4A7C] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View Slides
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// INLINE MARKETING NEWS CARD (Gemini - Navy)
// ===========================================
interface InlineMarketingNewsCardProps {
  news: {
    headline?: string;
    summary?: string;
    source?: string;
    date?: string;
    category?: string;
  };
  onClick: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function InlineMarketingNewsCard({ news, onClick, onSave, isSaved }: InlineMarketingNewsCardProps) {
  const style = getStrategyCardStyle('Marketing News');

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-neutral-200"
    >
      {/* Navy Header */}
      <div className={`${style.headerBg} p-4 relative min-h-[72px]`}>
        {/* Action buttons - appear on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded-lg transition-all shadow-sm ${
                isSaved
                  ? 'bg-white text-[#2F4A7C]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white truncate">{news.headline || 'Marketing News'}</h4>
            <p className="text-xs text-white/70">{news.source} • {news.date}</p>
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="bg-white p-4">
        {news.summary && (
          <p className="text-sm text-neutral-600 line-clamp-2">{news.summary}</p>
        )}
        {news.category && (
          <span className="inline-block mt-2 px-2 py-1 bg-[#2F4A7C]/10 text-[#2F4A7C] text-xs rounded-full font-medium">
            {news.category}
          </span>
        )}
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>News Article</span>
          <span className="text-[#2F4A7C] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Read More
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
