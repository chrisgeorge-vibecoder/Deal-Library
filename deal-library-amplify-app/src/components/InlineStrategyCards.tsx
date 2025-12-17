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
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">{persona.emoji || '👤'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-900 truncate">
              {persona.name || persona.personaName}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {onSave && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSave(); }}
                  className={`p-1 rounded transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              )}
              <Presentation className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
          {persona.category && (
            <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full mt-1">
              {persona.category}
            </span>
          )}
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {persona.coreInsight || persona.description}
          </p>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          Audience Persona
        </span>
        <span className="text-indigo-600 font-medium group-hover:underline">View Slides →</span>
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
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{insights.audienceName || 'Audience Insights'}</h4>
            <p className="text-xs text-gray-500 mt-0.5">Behavioral Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1 rounded transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {insights.demographics?.ageRange && (
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500">Age Range</div>
            <div className="font-medium text-gray-900">{insights.demographics.ageRange}</div>
          </div>
        )}
        {insights.demographics?.incomeRange && (
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500">Income</div>
            <div className="font-medium text-gray-900">{insights.demographics.incomeRange}</div>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>5 slides available</span>
        <span className="text-blue-600 font-medium group-hover:underline">View Slides →</span>
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
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{sizing.marketName || 'Market Intelligence'}</h4>
            <p className="text-xs text-gray-500 mt-0.5">Market Sizing & Trends</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1 rounded transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-4">
        {sizing.totalMarketSize && (
          <div>
            <div className="text-2xl font-bold text-green-600">{sizing.totalMarketSize}</div>
            <div className="text-xs text-gray-500">Total Market</div>
          </div>
        )}
        {sizing.growthRate && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="font-medium text-green-600">{sizing.growthRate}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>4 slides available</span>
        <span className="text-green-600 font-medium group-hover:underline">View Slides →</span>
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
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{geo.audienceName || 'Geographic Insights'}</h4>
            <p className="text-xs text-gray-500 mt-0.5">Location Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1 rounded transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-4">
        {geo.totalAddressable && (
          <div>
            <div className="text-xl font-bold text-blue-600">{geo.totalAddressable}</div>
            <div className="text-xs text-gray-500">Addressable Market</div>
          </div>
        )}
        {topMarket && (
          <div className="text-sm">
            <div className="text-xs text-gray-500">Top Market</div>
            <div className="font-medium text-gray-900">
              {topMarket.city ? `${topMarket.city}, ${topMarket.state}` : topMarket.region}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>{geo.topMarkets?.length || 0} markets analyzed</span>
        <span className="text-blue-600 font-medium group-hover:underline">View Slides →</span>
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
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Marketing SWOT</h4>
            <p className="text-xs text-gray-500 mt-0.5">{swot.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1 rounded transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
        </div>
      </div>
      
      {/* Mini SWOT Grid */}
      <div className="mt-3 grid grid-cols-4 gap-1">
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
      
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>3 slides available</span>
        <span className="text-purple-600 font-medium group-hover:underline">View Slides →</span>
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
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Competitive Intelligence</h4>
            <p className="text-xs text-gray-500 mt-0.5">{intel.competitorOrIndustry}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1 rounded transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-gray-400 group-hover:text-violet-500" />
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-500" />
        </div>
      </div>
      
      {intel.competitiveAnalysis?.mainCompetitors && intel.competitiveAnalysis.mainCompetitors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {intel.competitiveAnalysis.mainCompetitors.slice(0, 3).map((comp, idx) => (
            <span key={idx} className="px-2 py-1 bg-violet-50 text-violet-700 text-xs rounded-full">
              {comp.name}
            </span>
          ))}
          {intel.competitiveAnalysis.mainCompetitors.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{intel.competitiveAnalysis.mainCompetitors.length - 3} more
            </span>
          )}
        </div>
      )}
      
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>4 slides available</span>
        <span className="text-violet-600 font-medium group-hover:underline">View Slides →</span>
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
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Brand Strategy</h4>
            <p className="text-xs text-gray-500 mt-0.5">{strategy.brandOrCategory}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1 rounded transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
        </div>
      </div>
      
      {strategy.messagingFramework?.coreMessage && (
        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-900 font-medium line-clamp-2">
            "{strategy.messagingFramework.coreMessage}"
          </p>
        </div>
      )}
      
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>5 slides available</span>
        <span className="text-amber-600 font-medium group-hover:underline">View Slides →</span>
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
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Content Strategy</h4>
            <p className="text-xs text-gray-500 mt-0.5">{strategy.industryOrTopic}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1 rounded transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-gray-400 group-hover:text-cyan-500" />
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500" />
        </div>
      </div>
      
      {strategy.trendingTopics && strategy.trendingTopics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {strategy.trendingTopics.slice(0, 3).map((topic, idx) => (
            <span key={idx} className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full">
              {typeof topic === 'string' ? topic : topic.topic}
            </span>
          ))}
        </div>
      )}
      
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>4 slides available</span>
        <span className="text-cyan-600 font-medium group-hover:underline">View Slides →</span>
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
  const recColor = recommendation.includes('buy') ? 'text-green-600 bg-green-50' 
    : recommendation.includes('sell') ? 'text-red-600 bg-red-50' 
    : 'text-gray-600 bg-gray-50';

  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {profile.companyInfo?.name} ({profile.stockSymbol})
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">{profile.companyInfo?.sector}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`p-1 rounded transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
          <Presentation className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-3">
        {profile.companyInfo?.marketCap && (
          <div>
            <div className="text-lg font-bold text-gray-900">{profile.companyInfo.marketCap}</div>
            <div className="text-xs text-gray-500">Market Cap</div>
          </div>
        )}
        {profile.investmentOutlook?.recommendation && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${recColor}`}>
            {profile.investmentOutlook.recommendation}
          </span>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>5 slides available</span>
        <span className="text-blue-600 font-medium group-hover:underline">View Slides →</span>
      </div>
    </div>
  );
}




