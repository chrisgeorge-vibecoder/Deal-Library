'use client';

import React from 'react';
import { 
  Users, Target, BarChart3, MapPin, TrendingUp, Building2, 
  Lightbulb, FileText, Award, Newspaper, Shield, AlertTriangle,
  ChevronRight, Bookmark, BookmarkCheck, Presentation
} from 'lucide-react';

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
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200/50 rounded-xl p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300/60 hover:-translate-y-px transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl flex-shrink-0">{persona.emoji || '👤'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold text-slate-900 truncate -tracking-[0.01em] leading-tight">
              {persona.name || persona.personaName}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {onSave && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSave(); }}
                  className={`p-1.5 rounded transition-colors ${isSaved ? 'text-slate-700' : 'text-slate-300 hover:text-slate-500'}`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              )}
              <Presentation className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </div>
          {persona.category && (
            <span className="inline-block px-2.5 py-1 bg-slate-100/80 text-slate-700 text-xs font-medium rounded-full mt-2 border border-slate-200/60">
              {persona.category}
            </span>
          )}
          <p className="text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed">
            {persona.coreInsight || persona.description}
          </p>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Audience Persona
        </span>
        <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">View Slides →</span>
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
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200/50 rounded-xl p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300/60 hover:-translate-y-px transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-50/80 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100/80">
            <Lightbulb className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 -tracking-[0.01em] leading-tight">{insights.audienceName || 'Audience Insights'}</h4>
            <p className="text-xs text-slate-400 mt-1">Behavioral Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded transition-colors ${isSaved ? 'text-slate-700' : 'text-slate-300 hover:text-slate-500'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {insights.demographics?.ageRange && (
          <div className="bg-slate-50/60 rounded-lg p-3 border border-slate-100/60">
            <div className="text-xs text-slate-400 mb-1">Age Range</div>
            <div className="font-medium text-slate-900 leading-tight">{insights.demographics.ageRange}</div>
          </div>
        )}
        {insights.demographics?.incomeRange && (
          <div className="bg-slate-50/60 rounded-lg p-3 border border-slate-100/60">
            <div className="text-xs text-slate-400 mb-1">Income</div>
            <div className="font-medium text-slate-900 leading-tight">{insights.demographics.incomeRange}</div>
          </div>
        )}
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
        <span>5 slides available</span>
        <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">View Slides →</span>
      </div>
    </div>
  );
}

// ===========================================
// INLINE MARKET SIZING CARD
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
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200/50 rounded-xl p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300/60 hover:-translate-y-px transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-50/80 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100/80">
            <BarChart3 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 -tracking-[0.01em] leading-tight">{sizing.marketName || 'Market Intelligence'}</h4>
            <p className="text-xs text-slate-400 mt-1">Market Sizing & Trends</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded transition-colors ${isSaved ? 'text-slate-700' : 'text-slate-300 hover:text-slate-500'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-6">
        {sizing.totalMarketSize && (
          <div>
            <div className="text-2xl font-semibold text-slate-900 -tracking-[0.01em]">{sizing.totalMarketSize}</div>
            <div className="text-xs text-slate-400 mt-1">Total Market</div>
          </div>
        )}
        {sizing.growthRate && (
          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <span className="font-medium text-slate-700">{sizing.growthRate}</span>
          </div>
        )}
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
        <span>4 slides available</span>
        <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">View Slides →</span>
      </div>
    </div>
  );
}

// ===========================================
// INLINE GEO INSIGHTS CARD
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
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200/50 rounded-xl p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300/60 hover:-translate-y-px transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-50/80 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100/80">
            <MapPin className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 -tracking-[0.01em] leading-tight">{geo.audienceName || 'Geographic Insights'}</h4>
            <p className="text-xs text-slate-400 mt-1">Location Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded transition-colors ${isSaved ? 'text-slate-700' : 'text-slate-300 hover:text-slate-500'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-6">
        {geo.totalAddressable && (
          <div>
            <div className="text-xl font-semibold text-slate-900 -tracking-[0.01em]">{geo.totalAddressable}</div>
            <div className="text-xs text-slate-400 mt-1">Addressable Market</div>
          </div>
        )}
        {topMarket && (
          <div className="text-sm">
            <div className="text-xs text-slate-400 mb-1">Top Market</div>
            <div className="font-medium text-slate-900 leading-tight">
              {topMarket.city ? `${topMarket.city}, ${topMarket.state}` : topMarket.region}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
        <span>{geo.topMarkets?.length || 0} markets analyzed</span>
        <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">View Slides →</span>
      </div>
    </div>
  );
}

// ===========================================
// INLINE SWOT CARD
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
  const getItemTitle = (item: { title: string } | string) => 
    typeof item === 'string' ? item : item.title;
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200/50 rounded-xl p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300/60 hover:-translate-y-px transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-50/80 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100/80">
            <Target className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 -tracking-[0.01em] leading-tight">Marketing SWOT</h4>
            <p className="text-xs text-slate-400 mt-1">{swot.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded transition-colors ${isSaved ? 'text-slate-700' : 'text-slate-300 hover:text-slate-500'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </div>
      
      {/* Mini SWOT Grid */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="bg-slate-50/60 p-3 rounded-lg text-center border border-slate-100/60">
          <Shield className="w-4 h-4 text-slate-600 mx-auto" />
          <div className="text-xs font-semibold text-slate-700 mt-1.5">{swot.swot?.strengths?.length || 0}</div>
        </div>
        <div className="bg-slate-50/60 p-3 rounded-lg text-center border border-slate-100/60">
          <AlertTriangle className="w-4 h-4 text-slate-600 mx-auto" />
          <div className="text-xs font-semibold text-slate-700 mt-1.5">{swot.swot?.weaknesses?.length || 0}</div>
        </div>
        <div className="bg-slate-50/60 p-3 rounded-lg text-center border border-slate-100/60">
          <TrendingUp className="w-4 h-4 text-slate-600 mx-auto" />
          <div className="text-xs font-semibold text-slate-700 mt-1.5">{swot.swot?.opportunities?.length || 0}</div>
        </div>
        <div className="bg-slate-50/60 p-3 rounded-lg text-center border border-slate-100/60">
          <AlertTriangle className="w-4 h-4 text-slate-600 mx-auto" />
          <div className="text-xs font-semibold text-slate-700 mt-1.5">{swot.swot?.threats?.length || 0}</div>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
        <span>3 slides available</span>
        <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">View Slides →</span>
      </div>
    </div>
  );
}

// ===========================================
// INLINE COMPETITIVE INTELLIGENCE CARD
// ===========================================
interface InlineCompetitiveIntelCardProps {
  intel: {
    competitorOrIndustry?: string;
    marketPosition?: {
      keyDifferentiators?: string[];
    };
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
  // Support both new structure (marketPosition.keyDifferentiators) and legacy (competitiveAnalysis.mainCompetitors)
  const differentiators = intel.marketPosition?.keyDifferentiators || [];
  const competitors = intel.competitiveAnalysis?.mainCompetitors || [];
  const hasContent = differentiators.length > 0 || competitors.length > 0;
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200/50 rounded-xl p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300/60 hover:-translate-y-px transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-50/80 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100/80">
            <Target className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 -tracking-[0.01em] leading-tight">Competitive Intelligence</h4>
            <p className="text-xs text-slate-400 mt-1">{intel.competitorOrIndustry}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded transition-colors ${isSaved ? 'text-slate-700' : 'text-slate-300 hover:text-slate-500'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </div>
      
      {hasContent && (
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Show key differentiators (new structure) */}
          {differentiators.length > 0 && differentiators.slice(0, 3).map((diff, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-slate-100/80 text-slate-700 text-xs font-medium rounded-full border border-slate-200/60">
              {diff}
            </span>
          ))}
          {/* Show competitors (legacy structure) */}
          {competitors.length > 0 && competitors.slice(0, 3).map((comp, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-slate-100/80 text-slate-700 text-xs font-medium rounded-full border border-slate-200/60">
              {comp.name}
            </span>
          ))}
          {(differentiators.length > 3 || competitors.length > 3) && (
            <span className="px-2.5 py-1 bg-slate-50/80 text-slate-600 text-xs font-medium rounded-full border border-slate-200/60">
              +{Math.max(differentiators.length, competitors.length) - 3} more
            </span>
          )}
        </div>
      )}
      
      <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
        <span>4 slides available</span>
        <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">View Slides →</span>
      </div>
    </div>
  );
}

// ===========================================
// INLINE BRAND STRATEGY CARD
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
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200/50 rounded-xl p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300/60 hover:-translate-y-px transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-50/80 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100/80">
            <Award className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 -tracking-[0.01em] leading-tight">Brand Strategy</h4>
            <p className="text-xs text-slate-400 mt-1">{strategy.brandOrCategory}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded transition-colors ${isSaved ? 'text-slate-700' : 'text-slate-300 hover:text-slate-500'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </div>
      
      {strategy.messagingFramework?.coreMessage && (
        <div className="mt-4 p-4 bg-slate-50/60 rounded-lg border border-slate-200/60">
          <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed">
            "{strategy.messagingFramework.coreMessage}"
          </p>
        </div>
      )}
      
      <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
        <span>5 slides available</span>
        <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">View Slides →</span>
      </div>
    </div>
  );
}

// ===========================================
// INLINE CONTENT STRATEGY CARD
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
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200/50 rounded-xl p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300/60 hover:-translate-y-px transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-50/80 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100/80">
            <FileText className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 -tracking-[0.01em] leading-tight">Content Strategy</h4>
            <p className="text-xs text-slate-400 mt-1">{strategy.industryOrTopic}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded transition-colors ${isSaved ? 'text-slate-700' : 'text-slate-300 hover:text-slate-500'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </div>
      
      {strategy.trendingTopics && strategy.trendingTopics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {strategy.trendingTopics.slice(0, 3).map((topic, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-slate-100/80 text-slate-700 text-xs font-medium rounded-full border border-slate-200/60">
              {typeof topic === 'string' ? topic : topic.topic}
            </span>
          ))}
        </div>
      )}
      
      <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
        <span>4 slides available</span>
        <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">View Slides →</span>
      </div>
    </div>
  );
}

// ===========================================
// INLINE COMPANY PROFILE CARD
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
  const recommendation = profile.investmentOutlook?.recommendation?.toLowerCase() || '';
  const recColor = recommendation.includes('buy') ? 'text-slate-700 bg-slate-100/80 border-slate-200/60' 
    : recommendation.includes('sell') ? 'text-slate-700 bg-slate-100/80 border-slate-200/60' 
    : 'text-slate-600 bg-slate-50/80 border-slate-200/60';

  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200/50 rounded-xl p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300/60 hover:-translate-y-px transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-50/80 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100/80">
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 -tracking-[0.01em] leading-tight">
              {profile.companyInfo?.name} ({profile.stockSymbol})
            </h4>
            <p className="text-xs text-slate-400 mt-1">{profile.companyInfo?.sector}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1.5 rounded transition-colors ${isSaved ? 'text-slate-700' : 'text-slate-300 hover:text-slate-500'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-4">
        {profile.companyInfo?.marketCap && (
          <div>
            <div className="text-lg font-semibold text-slate-900 -tracking-[0.01em]">{profile.companyInfo.marketCap}</div>
            <div className="text-xs text-slate-400 mt-1">Market Cap</div>
          </div>
        )}
        {profile.investmentOutlook?.recommendation && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${recColor}`}>
            {profile.investmentOutlook.recommendation}
          </span>
        )}
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
        <span>5 slides available</span>
        <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">View Slides →</span>
      </div>
    </div>
  );
}




