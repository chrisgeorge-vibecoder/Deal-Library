'use client';

import { useState } from 'react';
import { Users, Target, BarChart3, MapPin, TrendingUp, Building2, Lightbulb, ShoppingCart, Plus, Check, Bookmark, BookmarkCheck, Shield, AlertTriangle, Presentation, ChevronRight } from 'lucide-react';
import { ComprehensiveReport } from '@/types/agentMode';
import { Deal, MarketingSWOT, CompetitiveIntelligence, Persona, GeoCard } from '@/types/deal';
import { MarketSizing } from './MarketSizingCard';
import DealCard from './DealCard';
import {
  InlinePersonaCard,
  InlineMarketSizingCard,
  InlineGeoCard,
  InlineSWOTCard,
  InlineCompetitiveIntelCard
} from './InlineStrategyCards';

// Import Detail Modals
import PersonaDetailModal from './PersonaDetailModal';
import { MarketSizingDetailModal } from './MarketSizingDetailModal';
import GeoDetailModal from './GeoDetailModal';
import { MarketingSWOTDetailModal } from './MarketingSWOTDetailModal';
import { CompetitiveIntelligenceDetailModal } from './CompetitiveIntelligenceDetailModal';

interface CampaignPlannerResultsProps {
  report: ComprehensiveReport;
  onAddToCart?: (deal: Deal) => void;
  onRemoveFromCart?: (dealId: string) => void;
  isInCart?: (dealId: string) => boolean;
  onSaveCard?: (card: { type: string; data: any }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export default function CampaignPlannerResults({ 
  report, 
  onAddToCart, 
  onRemoveFromCart, 
  isInCart,
  onSaveCard,
  onUnsaveCard,
  isSaved
}: CampaignPlannerResultsProps) {
  // CLIENT-SIDE DEBUG: Log when component renders
  console.log('🖥️ [BROWSER] CampaignPlannerResults: Component rendered');
  console.log('   [BROWSER] Report exists:', !!report);
  console.log('   [BROWSER] Report structure:', report ? Object.keys(report) : 'null');
  console.log('   [BROWSER] Results exists:', !!report?.results);
  console.log('   [BROWSER] Strategy exists:', !!report?.results?.strategy);
  if (report?.results?.strategy) {
    console.log('   [BROWSER] Strategy data:', {
      hasCompetitors: !!report.results.strategy.competitors,
      competitorsCount: report.results.strategy.competitors?.length || 0,
      competitors: report.results.strategy.competitors,
      hasDifferentiators: !!report.results.strategy.differentiators,
      differentiatorsCount: report.results.strategy.differentiators?.length || 0,
      isAIGenerated: report.results.strategy.isAIGenerated
    });
  } else {
    console.warn('   [BROWSER] ⚠️ No strategy data in report!');
    console.log('   [BROWSER] Full report.results:', report?.results);
  }
  
  // Modal state
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedMarketSizing, setSelectedMarketSizing] = useState<MarketSizing | null>(null);
  const [selectedGeo, setSelectedGeo] = useState<GeoCard | null>(null);
  const [selectedSwot, setSelectedSwot] = useState<MarketingSWOT | null>(null);
  const [selectedCompetitiveIntel, setSelectedCompetitiveIntel] = useState<CompetitiveIntelligence | null>(null);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  // Transform data for modals
  const transformPersonaForModal = (persona: any): Persona => ({
    id: persona.id || `persona-${persona.name || persona.personaName}`,
    name: persona.name || persona.personaName || 'Unknown',
    emoji: persona.emoji || '👤',
    segmentId: persona.segmentId || '',
    category: persona.category || 'General',
    coreInsight: persona.coreInsight || persona.description || '',
    creativeHooks: persona.creativeHooks || [],
    mediaTargeting: persona.mediaTargeting || [],
    audienceMotivation: persona.audienceMotivation || persona.motivations?.[0] || '',
    actionableStrategy: persona.actionableStrategy || {
      creativeHook: persona.creativeHooks?.[0] || '',
      mediaTargeting: persona.mediaTargeting?.[0] || ''
    },
    dealCount: persona.dealCount
  });

  const transformMarketSizingForModal = (): MarketSizing => ({
    id: `market-sizing-${report.advertiserName}`,
    marketName: `${report.advertiserName} Market`,
    totalMarketSize: report.results.marketSizing.totalMarketSize || formatNumber(report.results.marketSizing.totalAddressableMarket),
    growthRate: report.results.marketSizing.growthRate || 'N/A',
    addressableMarket: report.results.marketSizing.addressableMarket || 'N/A',
    addressableValue: report.results.marketSizing.addressableValue || 'N/A',
    demographics: {
      population: formatNumber(report.results.marketSizing.totalAddressableMarket || 0),
      targetAge: report.results.marketSizing.demographicBreakdown?.ageDistribution 
        ? Object.keys(report.results.marketSizing.demographicBreakdown.ageDistribution)[0] || 'All ages'
        : 'All ages',
      penetration: report.results.marketSizing.demographicBreakdown?.penetration || 'N/A'
    },
    growthTrends: {
      growthRate: report.results.marketSizing.growthTrends?.growthRate || report.results.marketSizing.growthRate || 'N/A',
      seasonality: report.results.marketSizing.growthTrends?.seasonality || 'Year-round',
      keyOpportunities: report.results.marketSizing.growthTrends?.keyOpportunities || []
    },
    marketInsights: {
      keyDrivers: report.results.marketSizing.marketInsights?.keyDrivers || [],
      barriers: report.results.marketSizing.marketInsights?.barriers || [],
      opportunities: report.results.marketSizing.marketInsights?.opportunities || []
    }
  });

  const transformGeoForModal = (): GeoCard => ({
    id: `geo-insights-${report.advertiserName}`,
    audienceName: `${report.advertiserName} Geographic Insights`,
    totalAddressable: formatNumber(report.results.marketSizing.totalAddressableMarket || 0),
    topMarkets: report.results.geographic.topMarkets?.slice(0, 10).map((m: any) => ({
      city: m.city,
      state: m.state,
      region: `${m.city}, ${m.state}`,
      concentration: m.concentration,
      population: m.population,
      medianIncome: m.medianIncome,
      urbanRural: m.urbanRural,
      percentage: `${(m.concentration * 100).toFixed(1)}%`
    })) || [],
    demographics: {
      medianIncome: report.results.geographic.topMarkets?.[0]?.medianIncome
    }
  });

  const transformSwotForModal = (): MarketingSWOT => ({
    id: `marketing-swot-${report.advertiserName}`,
    companyName: report.advertiserName,
    swot: {
      strengths: (report.results.swot?.strengths || []).map((s: any) => 
        typeof s === 'string' ? { title: s, description: '' } : s
      ),
      weaknesses: (report.results.swot?.weaknesses || []).map((w: any) => 
        typeof w === 'string' ? { title: w, description: '' } : w
      ),
      opportunities: (report.results.swot?.opportunities || []).map((o: any) => 
        typeof o === 'string' ? { title: o, description: '' } : o
      ),
      threats: (report.results.swot?.threats || []).map((t: any) => 
        typeof t === 'string' ? { title: t, description: '' } : t
      )
    },
    summary: report.results.swot?.summary || `Marketing SWOT analysis for ${report.advertiserName}`,
    recommendedActions: report.results.swot?.recommendedActions || []
  });

  const transformCompetitiveIntelForModal = (): CompetitiveIntelligence => {
    const strategy = report.results.strategy as any;
    
    // Debug logging
    console.log('🔄 Transforming Competitive Intelligence data:');
    console.log('   Strategy:', strategy);
    console.log('   Competitors:', strategy?.competitors);
    console.log('   Differentiators:', strategy?.differentiators);
    console.log('   Strategic Recommendations:', strategy?.strategicRecommendations);
    
    // Parse competitors from the strategy data
    // Competitors come as strings like "Competitor Name - positioning"
    // Handle both string arrays and ensure we always have at least one competitor
    const competitorsArray = strategy?.competitors || [];
    const mainCompetitors = competitorsArray.length > 0 
      ? competitorsArray.map((c: string) => {
          const parts = typeof c === 'string' ? c.split(' - ') : [String(c)];
          return {
            name: parts[0] || c || 'Industry competitor',
            positioning: parts.slice(1).join(' - ') || 'Competitive player in the market',
            keyStrengths: [] // We don't have this data from the strategy generator
          };
        })
      : [{
          name: 'Industry competitors',
          positioning: 'Competitive market landscape',
          keyStrengths: []
        }];

    // Build strategic recommendations array (for modal display)
    const strategicRecsArray = [
      ...(strategy?.strategicRecommendations?.positioning || []),
      ...(strategy?.strategicRecommendations?.messaging || []),
      ...(strategy?.strategicRecommendations?.channels || [])
    ].slice(0, 6);

    // Get market positioning text
    const marketPositioningText = strategy?.competitiveAnalysis?.marketPositioning || 
                                  strategy?.marketPositioning ||
                                  `${report.advertiserName} operates in a competitive market with opportunities for differentiation.`;

    // Build the proper structure for both modal and slides
    const result: any = {
      id: `competitive-intelligence-${report.advertiserName}`,
      competitorOrIndustry: report.advertiserName,
      // Legacy fields for backward compatibility
      competitors: mainCompetitors.map(c => ({
        name: c.name,
        strategy: c.positioning
      })),
      competitiveAdvantages: strategy?.differentiators || [],
      recommendations: strategicRecsArray.length > 0 ? strategicRecsArray : 
                       (report.results.swot?.recommendedActions?.slice(0, 3) || []),
      // Structure expected by modal (CompetitiveIntelligenceDetailModal)
      marketPosition: {
        marketShare: 'Competitive market position',
        growthTrajectory: 'Growing market with opportunities',
        keyDifferentiators: strategy?.differentiators || []
      },
      strengthsWeaknesses: {
        strengths: strategy?.differentiators?.slice(0, 3) || [],
        weaknesses: strategy?.messagingGaps?.slice(0, 3) || []
      },
      messagingPositioning: {
        coreMessaging: marketPositioningText,
        targetAudience: report.targetAudience || 'Target market segments',
        valueProposition: strategy?.differentiators?.join('. ') || 'Competitive advantages in the market'
      },
      // Array format expected by modal
      strategicRecommendations: strategicRecsArray.length > 0 ? strategicRecsArray : 
                                 (report.results.swot?.recommendedActions?.slice(0, 4) || []),
      // Structure expected by generateCompetitiveIntelSlides
      competitiveAnalysis: {
        marketPositioning: marketPositioningText,
        mainCompetitors: mainCompetitors,
        differentiationOpportunities: strategy?.differentiators || []
      },
      // Structure expected by generateCompetitiveIntelSlides
      messagingAnalysis: {
        commonThemes: strategy?.commonThemes || [],
        messagingGaps: strategy?.messagingGaps || [],
        toneAndVoice: 'Professional and customer-focused'
      },
      sources: strategy?.sources || []
    };

    // Add object format for slides (as a separate property to avoid conflict with modal's array format)
    // The slides generator will check for strategicRecommendationsForSlides first, then fall back to strategicRecommendations
    if (strategy?.strategicRecommendations && typeof strategy.strategicRecommendations === 'object' && !Array.isArray(strategy.strategicRecommendations)) {
      result.strategicRecommendationsForSlides = strategy.strategicRecommendations;
    } else if (strategicRecsArray.length > 0) {
      // If we only have an array, create an object structure for slides
      result.strategicRecommendationsForSlides = {
        positioning: strategy?.strategicRecommendations?.positioning || strategicRecsArray.slice(0, 2),
        messaging: strategy?.strategicRecommendations?.messaging || strategicRecsArray.slice(2, 4),
        channels: strategy?.strategicRecommendations?.channels || strategicRecsArray.slice(4, 6)
      };
    }

    return result;
  };

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Main Document Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Document Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Marketing Proposal for {report.advertiserName}
            </h1>
            <p className="text-gray-600 mb-4">Prepared by Sovrn • {formatDate()}</p>
            <div className="h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded"></div>
          </div>

          {/* Executive Summary */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
            <div className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
              {(report.results as any).executiveSummary || (
                <p>Sovrn is pleased to present a comprehensive marketing strategy to help {report.advertiserName} reach their target audiences across the United States. Through our advanced audience intelligence platform, we have identified and mapped precise audience segments that align with your campaign objectives.</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-700 mb-1 uppercase tracking-wide">Audience Segments</div>
                <div className="text-3xl font-bold text-purple-900">{report.results.audiences?.segments?.length || report.summary.totalAudiences || 0}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700 mb-1 uppercase tracking-wide">Deal Recommendations</div>
                <div className="text-3xl font-bold text-blue-900">{report.results.deals?.recommendations?.length || report.summary.totalDeals || 0}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="text-xs text-indigo-700 mb-1 uppercase tracking-wide">Audience Personas</div>
                <div className="text-3xl font-bold text-indigo-900">{report.results.personas?.profiles?.length || report.summary.totalPersonas || 0}</div>
              </div>
            </div>
          </section>

          {/* Target Audience Analysis */}
          {(report.results.audiences?.segments?.length > 0 || report.results.audiences?.count > 0) && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Target Audience Analysis</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We have identified <strong>{report.results.audiences.segments?.length || report.results.audiences.count} precision audience segments</strong> that align with your target market. These segments represent high-value opportunities for reaching your ideal customers.
              </p>

              {/* Audience Segments Grid */}
              <div className="space-y-6">
                {(report.results.audiences.segments || []).map((enrichedSegment: any, index: number) => {
                  // Handle enriched segment structure (segment nested inside)
                  const segment = enrichedSegment.segment || enrichedSegment;
                  const segmentName = segment.segmentName || segment.name || enrichedSegment.segmentName || 'Audience Segment';
                  const segmentDesc = segment.segmentDescription || segment.description || enrichedSegment.strategicHook || 'High-value audience segment';
                  const segmentType = segment.segmentType || enrichedSegment.segmentType;
                  const scale = segment.scale7DayUS || segment.scale || segment['scale_7day_us'];
                  const cpm = segment.cpm;
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{segmentName}</h3>
                        {segmentType && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            {segmentType}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{segmentDesc}</p>
                      {scale && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Reach: {formatNumber(scale)}</span>
                          {cpm && <span>CPM: ${cpm.toFixed(2)}</span>}
                        </div>
                      )}
                      {/* Show data sources if available */}
                      {enrichedSegment.dataSources && enrichedSegment.dataSources.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {enrichedSegment.dataSources.map((source: string, idx: number) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {source}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Strategy Cards Section - Clickable Inline Cards */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Presentation className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Strategy Cards</h2>
              <span className="text-sm text-gray-500 ml-2">Click any card to view slides</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personas as Inline Cards */}
              {report.results.personas.profiles.map((persona: any, index: number) => {
                const personaData = transformPersonaForModal(persona);
                const personaCardId = personaData.id;
                const isPersonaSaved = isSaved ? isSaved(personaCardId) : false;
                
                return (
                  <InlinePersonaCard
                    key={personaCardId}
                    persona={persona}
                    onClick={() => setSelectedPersona(personaData)}
                    onSave={() => {
                      if (isPersonaSaved) {
                        onUnsaveCard?.(personaCardId);
                      } else {
                        onSaveCard?.({ type: 'audience-persona', data: personaData });
                      }
                    }}
                    isSaved={isPersonaSaved}
                  />
                );
              })}

              {/* SWOT Card */}
              {report.results.swot && (
                <InlineSWOTCard
                  swot={{
                    companyName: report.advertiserName,
                    summary: report.results.swot.summary,
                    swot: {
                      strengths: report.results.swot.strengths,
                      weaknesses: report.results.swot.weaknesses,
                      opportunities: report.results.swot.opportunities,
                      threats: report.results.swot.threats
                    }
                  }}
                  onClick={() => setSelectedSwot(transformSwotForModal())}
                  onSave={() => {
                    const cardId = `marketing-swot-${report.advertiserName}`;
                    if (isSaved?.(cardId)) {
                      onUnsaveCard?.(cardId);
                    } else {
                      onSaveCard?.({ type: 'marketing-swot', data: transformSwotForModal() });
                    }
                  }}
                  isSaved={isSaved?.(`marketing-swot-${report.advertiserName}`)}
                />
              )}

            </div>
          </section>

          {/* Campaign Recommendations - Now with Deal Cards */}
          {(report.results.deals?.recommendations?.length > 0 || report.results.deals?.count > 0) && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended Deals</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Based on your campaign objectives, we recommend the following deal packages optimized for maximum performance. 
                <strong> Add deals to your cart to include them in your proposal.</strong>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.results.deals.recommendations.map((deal: any, index: number) => {
                  const dealData: Deal = {
                    id: deal.id || deal.dealId || `deal-${index}`,
                    dealName: deal.dealName || deal.name || 'Untitled Deal',
                    dealId: deal.dealId || deal.id || `deal-${index}`,
                    description: deal.description || '',
                    environment: deal.environment || 'Web',
                    targeting: deal.targeting || '',
                    mediaType: deal.mediaType || 'Display',
                    flightDate: deal.flightDate || '',
                    bidGuidance: deal.bidGuidance || '',
                    createdBy: deal.createdBy || 'Campaign Planner',
                    createdAt: deal.createdAt || new Date().toISOString(),
                    updatedAt: deal.updatedAt || new Date().toISOString(),
                    personaInsights: deal.personaInsights
                  };
                  const inCart = isInCart ? isInCart(dealData.id) : false;
                  
                  return (
                    <div key={dealData.id} className="relative">
                      <DealCard
                        deal={dealData}
                        onClick={() => console.log('Deal clicked:', dealData)}
                        onAddToCart={onAddToCart ? () => onAddToCart(dealData) : undefined}
                        onRemoveFromCart={onRemoveFromCart ? () => onRemoveFromCart(dealData.id) : undefined}
                        isInCart={inCart}
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Quick add all button */}
              {onAddToCart && report.results.deals.recommendations.length > 1 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      report.results.deals.recommendations.forEach((deal: any, index: number) => {
                        const dealData: Deal = {
                          id: deal.id || deal.dealId || `deal-${index}`,
                          dealName: deal.dealName || deal.name || 'Untitled Deal',
                          dealId: deal.dealId || deal.id || `deal-${index}`,
                          description: deal.description || '',
                          environment: deal.environment || 'Web',
                          targeting: deal.targeting || '',
                          mediaType: deal.mediaType || 'Display',
                          flightDate: deal.flightDate || '',
                          bidGuidance: deal.bidGuidance || '',
                          createdBy: deal.createdBy || 'Campaign Planner',
                          createdAt: deal.createdAt || new Date().toISOString(),
                          updatedAt: deal.updatedAt || new Date().toISOString()
                        };
                        if (!isInCart?.(dealData.id)) {
                          onAddToCart(dealData);
                        }
                      });
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add All Recommended Deals to Cart
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Measurement & Success Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Measurement & Success Metrics</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We recommend tracking the following KPIs to ensure campaign success:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Upper Funnel</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Impressions delivered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Unique reach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Viewability rate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Brand lift (if measured)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Middle Funnel</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Click-through rate (CTR)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Site visits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Landing page engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Time on site</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Lower Funnel</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Test appointments scheduled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Form completions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Phone calls generated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Cost per acquisition (CPA)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Business Outcomes</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Return on ad spend (ROAS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Customer lifetime value</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Market share growth</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Why Sovrn */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Sovrn for {report.advertiserName}?</h2>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-2">1. Unmatched Scale & Quality</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Commerce Audience segments across all categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Extensive interest-based targeting options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>20M+ daily US reach across engaged consumers</span>
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-2">2. Data-Driven Precision</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Behavioral purchase intent signals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Real-time audience refresh (7-day cookie scale)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>ZIP code-level geographic intelligence</span>
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-2">3. Transparent Performance</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Clear CPM pricing with no hidden fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Real-time reporting and optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Dedicated support and strategic guidance</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To move forward with this proposal, we recommend:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Strategic Planning Session</h3>
                  <p className="text-sm text-gray-600">Review audience priorities, align on campaign objectives, and discuss creative requirements</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Audience Insights Workshop</h3>
                  <p className="text-sm text-gray-600">Deep-dive into specific segments, review geographic data, and explore behavioral overlaps</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Finalize Campaign Strategy</h3>
                  <p className="text-sm text-gray-600">Lock messaging and creative, set budget and pacing, establish success metrics</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Launch Campaign</h3>
                  <p className="text-sm text-gray-600">Test priority audiences, monitor and optimize, scale based on results</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-8">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Contact Information</h3>
              <p className="text-sm text-gray-600 mb-1"><strong>Sovrn Marketing Solutions</strong></p>
              <p className="text-sm text-gray-600">Email: sales@sovrn.com</p>
              <p className="text-sm text-gray-600">Website: www.sovrn.com</p>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>This proposal is valid for 60 days from the date of issuance.</p>
              <p>© {new Date().getFullYear()} Sovrn Holdings, Inc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modals */}
      <PersonaDetailModal
        persona={selectedPersona}
        isOpen={!!selectedPersona}
        onClose={() => setSelectedPersona(null)}
        onViewDeals={() => {}} // No-op for campaign planner context
        onSaveCard={onSaveCard ? (card) => onSaveCard({ type: card.type, data: card.data }) : undefined}
        onUnsaveCard={onUnsaveCard}
        isSaved={isSaved}
      />

      <MarketSizingDetailModal
        sizing={selectedMarketSizing}
        isOpen={!!selectedMarketSizing}
        onClose={() => setSelectedMarketSizing(null)}
        onSaveCard={onSaveCard ? (card) => onSaveCard({ type: card.type, data: card.data }) : undefined}
        onUnsaveCard={onUnsaveCard}
        isSaved={isSaved}
      />

      <GeoDetailModal
        geo={selectedGeo}
        isOpen={!!selectedGeo}
        onClose={() => setSelectedGeo(null)}
        onSaveCard={onSaveCard}
        onUnsaveCard={onUnsaveCard}
        isSaved={isSaved}
      />

      <MarketingSWOTDetailModal
        swot={selectedSwot}
        isOpen={!!selectedSwot}
        onClose={() => setSelectedSwot(null)}
        onSaveCard={onSaveCard ? (card) => onSaveCard({ type: card.type, data: card.data }) : undefined}
        onUnsaveCard={onUnsaveCard}
        isSaved={isSaved}
      />

      <CompetitiveIntelligenceDetailModal
        competitiveIntel={selectedCompetitiveIntel}
        isOpen={!!selectedCompetitiveIntel}
        onClose={() => setSelectedCompetitiveIntel(null)}
        onSaveCard={onSaveCard ? (card) => onSaveCard({ type: card.type, data: card.data }) : undefined}
        onUnsaveCard={onUnsaveCard}
        isSaved={isSaved}
      />
    </>
  );
}
