'use client';

import { Users, Target, BarChart3, MapPin, TrendingUp, Building2, Lightbulb, ShoppingCart } from 'lucide-react';
import { ComprehensiveReport } from '@/types/agentMode';
import ExportOptionsMenu from './ExportOptionsMenu';

interface CampaignPlannerResultsProps {
  report: ComprehensiveReport;
}

export default function CampaignPlannerResults({ report }: CampaignPlannerResultsProps) {
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Export Options - Sticky Header */}
      <div className="sticky top-0 z-10 bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Marketing Campaign Plan</h3>
            <p className="text-sm text-gray-600">Copy formatted content or print</p>
          </div>
          <ExportOptionsMenu report={report} />
        </div>
      </div>

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
          <p className="text-gray-700 leading-relaxed mb-6">
            Sovrn is pleased to present a comprehensive marketing strategy to help {report.advertiserName} reach their target audiences across the United States. Through our advanced audience intelligence platform, we have identified and mapped precise audience segments that align with your campaign objectives.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-xs text-purple-700 mb-1 uppercase tracking-wide">Audience Segments</div>
              <div className="text-3xl font-bold text-purple-900">{report.summary.totalAudiences}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700 mb-1 uppercase tracking-wide">Deal Recommendations</div>
              <div className="text-3xl font-bold text-blue-900">{report.summary.totalDeals}</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="text-xs text-indigo-700 mb-1 uppercase tracking-wide">Audience Personas</div>
              <div className="text-3xl font-bold text-indigo-900">{report.summary.totalPersonas}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-xs text-green-700 mb-1 uppercase tracking-wide">Estimated Reach</div>
              <div className="text-3xl font-bold text-green-900">{formatNumber(report.results.marketSizing.reachEstimate)}</div>
            </div>
          </div>
        </section>

        {/* Target Audience Analysis */}
        {report.results.audiences.count > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Target Audience Analysis</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We have identified <strong>{report.results.audiences.count} precision audience segments</strong> that align with your target market. These segments represent high-value opportunities for reaching your ideal customers.
            </p>

            {/* Audience Segments Grid */}
            <div className="space-y-6">
              {report.results.audiences.segments.map((segment: any, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {segment.segmentName || segment.name || segment.sovrnSegmentName || 'Segment'}
                    </h3>
                    {segment.segmentType && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {segment.segmentType}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {segment.segmentDescription || segment.description || 'Audience segment details'}
                  </p>
                  {segment.scale7DayUS && (
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Reach: {formatNumber(segment.scale7DayUS)}</span>
                      {segment.cpm && <span>CPM: ${segment.cpm.toFixed(2)}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Audience Personas */}
        {report.results.personas.count > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Audience Personas</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Understanding your audience goes beyond demographics. We've developed detailed personas that bring your target customers to life:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.results.personas.profiles.map((persona: any, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{persona.emoji}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{persona.name || persona.personaName}</h3>
                      <p className="text-sm text-gray-600">{persona.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {persona.coreInsight || persona.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Campaign Recommendations */}
        {report.results.deals.count > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Recommendations</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Based on your campaign objectives, we recommend the following deal packages optimized for maximum performance:
            </p>

            <div className="space-y-4">
              {report.results.deals.recommendations.map((deal: any, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{deal.dealName}</h3>
                  <p className="text-sm text-gray-600 mb-3">{deal.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      {deal.environment}
                    </span>
                    {deal.mediaType && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {deal.mediaType}
                      </span>
                    )}
                    {deal.dealId && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        ID: {deal.dealId}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Geographic Targeting */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Geographic Targeting Capabilities</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Our platform provides <strong>ZIP code-level targeting</strong> capabilities to maximize campaign efficiency. For each campaign, we can:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span className="text-gray-700">Identify Top Markets: Pinpoint the highest-concentration ZIPs for each audience segment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span className="text-gray-700">Optimize for Location: Align campaigns with proximity to physical locations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span className="text-gray-700">Exclude Low-Performing Areas: Avoid waste by filtering out low-density markets</span>
            </li>
          </ul>

          {report.results.geographic.topMarkets && report.results.geographic.topMarkets.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Recommended Markets</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {report.results.geographic.topMarkets.map((market: any, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="font-medium text-gray-900">
                      {market.city || market.name}, {market.state || market.region}
                    </div>
                    <div className="text-xs text-gray-600">Market #{index + 1}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Market Sizing */}
        {report.results.marketSizing.totalAddressableMarket > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Sizing & Opportunity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-sm text-gray-600 mb-2">Total Addressable Market</div>
                <div className="text-4xl font-bold text-gray-900">
                  {formatNumber(report.results.marketSizing.totalAddressableMarket)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Potential consumers</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-sm text-gray-600 mb-2">Estimated Reach</div>
                <div className="text-4xl font-bold text-gray-900">
                  {formatNumber(report.results.marketSizing.reachEstimate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Unique users (7-day scale)</div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Our audience intelligence reveals key demographic characteristics that can inform targeting strategy, including age distribution, income levels, education attainment, and geographic concentration in high-value markets.
            </p>
          </section>
        )}

        {/* SWOT Analysis */}
        {report.results.swot && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketing SWOT Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-green-200 rounded-lg p-5 bg-green-50">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">✓</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {report.results.swot.strengths.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-green-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-red-200 rounded-lg p-5 bg-red-50">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">✗</span> Weaknesses
                </h3>
                <ul className="space-y-2">
                  {report.results.swot.weaknesses.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-red-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-blue-200 rounded-lg p-5 bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">→</span> Opportunities
                </h3>
                <ul className="space-y-2">
                  {report.results.swot.opportunities.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-blue-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-orange-200 rounded-lg p-5 bg-orange-50">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">⚠</span> Threats
                </h3>
                <ul className="space-y-2">
                  {report.results.swot.threats.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-orange-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Competitive Analysis & Differentiation */}
        {report.results.strategy?.competitors && report.results.strategy.competitors.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Competitive Analysis & Differentiation</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Understanding the competitive landscape is crucial for positioning your campaign effectively.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Key Competitors</h3>
                <ul className="space-y-2">
                  {report.results.strategy.competitors.map((competitor, index) => (
                    <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-purple-600">
                      {competitor}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Differentiation Strategies</h3>
                <ul className="space-y-2">
                  {report.results.strategy.differentiators?.map((diff, index) => (
                    <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-blue-600">
                      {diff}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Market Prioritization */}
        {report.results.strategy?.marketTiers && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Prioritization Strategy</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Based on audience density, spending power, and market characteristics:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-purple-200 rounded-lg p-5 bg-purple-50">
                <h3 className="font-semibold text-purple-900 mb-3">Tier 1 Markets (Primary Focus)</h3>
                <ul className="space-y-1">
                  {report.results.strategy.marketTiers.tier1.map((city, index) => (
                    <li key={index} className="text-sm text-gray-700">• {city}</li>
                  ))}
                </ul>
              </div>

              <div className="border border-blue-200 rounded-lg p-5 bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-3">Tier 2 Markets (Secondary Expansion)</h3>
                <ul className="space-y-1">
                  {report.results.strategy.marketTiers.tier2.map((city, index) => (
                    <li key={index} className="text-sm text-gray-700">• {city}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Rationale:</strong> {report.results.strategy.marketTiers.rationale}
              </p>
            </div>
          </section>
        )}

        {/* Budget Pacing Strategy */}
        {report.results.strategy?.budgetPacing && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended Budget Pacing Strategy</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Total Campaign Budget: <strong>{report.results.strategy.budgetPacing.totalBudget}</strong>
            </p>
            
            <div className="space-y-4">
              {report.results.strategy.budgetPacing.phases.map((phase, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{(phase.percentage * 100).toFixed(0)}%</span>
                      <span className="font-semibold text-purple-600">{phase.budget}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Duration:</strong> {phase.duration}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Focus:</strong> {phase.focus}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                This phased approach allows for strategic budget allocation aligned with the customer journey, starting with awareness building and progressively moving toward conversion optimization.
              </p>
            </div>
          </section>
        )}

        {/* Dayparting Recommendations */}
        {report.results.strategy?.dayparting && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dayparting Recommendations</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Optimal Campaign Flight Times:
            </p>
            
            <div className="border border-gray-200 rounded-lg p-5">
              <ul className="space-y-3">
                {report.results.strategy.dayparting.optimal.map((time, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-purple-600 font-semibold">⏰</span>
                    <span className="text-sm text-gray-700">{time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Rationale:</strong> {report.results.strategy.dayparting.rationale}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                By concentrating ad delivery during high-intent periods, we can maximize campaign efficiency and reduce wasted impressions.
              </p>
            </div>
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
  );
}

