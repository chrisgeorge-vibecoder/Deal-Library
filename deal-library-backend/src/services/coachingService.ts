import { Deal } from '../types/deal';
import { CoachingInsights } from './geminiService';
import { audienceInsightsService } from './audienceInsightsService';
import { commerceAudienceService } from './commerceAudienceService';

interface AudienceData {
  segment: string;
  report: any;
  overlaps: Array<{
    segment: string;
    overlapPercentage: number;
    insight: string;
  }>;
  demographics: {
    medianHHI: number;
    medianHHIvsNational: number;
    medianHHIvsCommerce: number;
    educationLevel: number;
    educationVsNational: number;
    educationVsCommerce: number;
    topAgeBracket: string;
  };
  geographicHotspots: Array<{
    zipCode: string;
    city: string;
    state: string;
    density: number;
    overIndex?: number;
  }>;
}

interface DealAnalysis {
  dealName: string;
  audienceSegment: string;
  mediaType: string;
  environment: string;
  cpm?: number;
  bidGuidance: string;
}

export class CoachingService {
  private static instance: CoachingService | null = null;

  static getInstance(): CoachingService {
    if (!CoachingService.instance) {
      CoachingService.instance = new CoachingService();
    }
    return CoachingService.instance;
  }

  /**
   * Generate data-driven coaching insights for recommended deals
   */
  async generateCoaching(deals: Deal[], query: string): Promise<CoachingInsights> {
    console.log(`🎯 Generating data-driven coaching for ${deals.length} deals: "${query}"`);
    
    if (deals.length === 0) {
      return this.generateGenericCoaching(query);
    }

    try {
      // Step 1: Extract and analyze audience segments from deals
      const dealAnalysis = this.analyzeDeals(deals);
      console.log(`📊 Analyzed deals: ${dealAnalysis.map(d => `${d.audienceSegment} (${d.mediaType})`).join(', ')}`);

      // Step 2: Fetch audience intelligence for each unique segment
      const audienceData = await this.getAudienceDataForDeals(dealAnalysis);
      console.log(`🧠 Fetched audience data for ${audienceData.length} segments`);

      // Step 3: Generate coaching insights using real data
      const coaching = await this.synthesizeCoachingInsights(dealAnalysis, audienceData, query);
      console.log(`✅ Generated data-driven coaching with ${coaching.hiddenOpportunities?.length || 0} opportunities`);

      return coaching;
    } catch (error) {
      console.error('❌ Error generating coaching:', error);
      return this.generateGenericCoaching(query);
    }
  }

  /**
   * Extract audience segments from deal names and analyze deal properties
   */
  private analyzeDeals(deals: Deal[]): DealAnalysis[] {
    return deals.map(deal => {
      const audienceSegment = this.extractAudienceSegment(deal.dealName);
      
      // Extract CPM from bid guidance if available
      const cpm = this.extractCpmFromBidGuidance(deal.bidGuidance);
      
      return {
        dealName: deal.dealName,
        audienceSegment,
        mediaType: deal.mediaType || 'Unknown',
        environment: deal.environment || 'Unknown',
        cpm,
        bidGuidance: deal.bidGuidance || 'Contact for pricing'
      };
    });
  }

  /**
   * Extract audience segment name from Commerce Audience deal names
   * Examples:
   * - "Baby & Toddler Purchase Intender (CTV)" → "Baby & Toddler"
   * - "Pet Supplies Purchase Intender (Mobile App)" → "Pet Supplies"
   */
  private extractAudienceSegment(dealName: string): string {
    // Pattern: "Segment Name Purchase Intender (Format)"
    const match = dealName.match(/^(.+?)\s+Purchase Intender/i);
    if (match && match[1]) {
      return match[1].trim();
    }

    // Fallback: Look for CommerceData_ prefix pattern
    const commerceMatch = dealName.match(/CommerceData_(.+?)_/);
    if (commerceMatch && commerceMatch[1]) {
      return commerceMatch[1].replace(/_/g, ' ');
    }

    // Return first part before any parentheses or brackets
    const firstPart = dealName.split(/[(\[]/)[0];
    return firstPart ? firstPart.trim() : dealName.trim();
  }

  /**
   * Extract CPM value from bid guidance text
   */
  private extractCpmFromBidGuidance(bidGuidance: any): number | undefined {
    if (!bidGuidance || typeof bidGuidance !== 'string') {
      return undefined;
    }
    const match = bidGuidance.match(/\$(\d+(?:\.\d{2})?)\s*CPM/i);
    return match && match[1] ? parseFloat(match[1]) : undefined;
  }

  /**
   * Fetch comprehensive audience intelligence for each segment found in deals
   */
  private async getAudienceDataForDeals(dealAnalysis: DealAnalysis[]): Promise<AudienceData[]> {
    const uniqueSegments = [...new Set(dealAnalysis.map(d => d.audienceSegment))];
    const audienceData: AudienceData[] = [];

    for (const segment of uniqueSegments) {
      try {
        console.log(`🔍 Fetching audience report for: "${segment}"`);
        
        // Generate audience insights report
        const report = await audienceInsightsService.generateReport(segment, 'General', false);
        
        if (report) {
          audienceData.push({
            segment,
            report,
            overlaps: report.behavioralOverlap || [],
            demographics: {
              medianHHI: report.keyMetrics.medianHHI,
              medianHHIvsNational: report.keyMetrics.medianHHIvsNational,
              medianHHIvsCommerce: report.keyMetrics.medianHHIvsCommerce,
              educationLevel: report.keyMetrics.educationLevel,
              educationVsNational: report.keyMetrics.educationVsNational,
              educationVsCommerce: report.keyMetrics.educationVsCommerce,
              topAgeBracket: report.keyMetrics.topAgeBracket
            },
            geographicHotspots: report.geographicHotspots || []
          });
        }
      } catch (error) {
        console.warn(`⚠️ Could not fetch audience data for segment "${segment}":`, error);
      }
    }

    return audienceData;
  }

  /**
   * Synthesize comprehensive coaching insights using real audience data
   */
  private async synthesizeCoachingInsights(
    dealAnalysis: DealAnalysis[], 
    audienceData: AudienceData[], 
    query: string
  ): Promise<CoachingInsights> {
    
    if (audienceData.length === 0) {
      return this.generateGenericCoaching(query);
    }

    // Aggregate data across all segments
    const primarySegment = audienceData[0]; // Use most relevant segment for primary insights
    if (!primarySegment) {
      return this.generateGenericCoaching(query);
    }
    const allOverlaps = audienceData.flatMap(data => data.overlaps);
    const avgCpm = dealAnalysis
      .map(d => d.cpm)
      .filter(cpm => cpm !== undefined)
      .reduce((sum, cpm, _, arr) => sum + cpm! / arr.length, 0);

    return {
      strategyRationale: this.generateStrategyRationale(primarySegment, allOverlaps, dealAnalysis),
      hiddenOpportunities: this.identifyHiddenOpportunities(allOverlaps, primarySegment, dealAnalysis),
      riskWarnings: this.identifyRiskWarnings(primarySegment, dealAnalysis),
      testingFramework: this.calculateTestingFramework(dealAnalysis, primarySegment, avgCpm),
      quickWins: this.generateQuickWins(dealAnalysis, primarySegment),
      scalingPath: this.generateScalingPath(dealAnalysis, primarySegment),
      competitiveIntelligence: this.generateCompetitiveIntelligence(primarySegment, allOverlaps)
    };
  }

  /**
   * Generate data-driven strategy rationale using audience demographics and overlaps
   */
  private generateStrategyRationale(
    primarySegment: AudienceData, 
    allOverlaps: Array<{segment: string; overlapPercentage: number; insight: string}>,
    dealAnalysis: DealAnalysis[]
  ): string {
    const { demographics, geographicHotspots } = primarySegment;
    const { medianHHI, medianHHIvsCommerce, educationVsCommerce } = demographics;
    
    // Format income with context
    const incomeContext = medianHHIvsCommerce > 15 
      ? `affluent (${medianHHIvsCommerce.toFixed(0)}% above commerce average)`
      : medianHHIvsCommerce < -15 
      ? `value-conscious (${Math.abs(medianHHIvsCommerce).toFixed(0)}% below commerce average)`
      : `mainstream`;

    // Pick top 2 overlaps for strategy context
    const topOverlaps = allOverlaps
      .filter(o => o.overlapPercentage > 20)
      .slice(0, 2)
      .map(o => `${o.segment} (${o.overlapPercentage.toFixed(0)}%)`);
    
    const overlapContext = topOverlaps.length > 0 
      ? `Strong cross-purchase behavior with ${topOverlaps.join(' and ')} reveals `
      : '';

    // Geographic context
    const topMarket = geographicHotspots.slice(0, 2)
      .map(h => `${h.city}, ${h.state}`)
      .join(' and ');

    const geographyContext = topMarket 
      ? `Geographic concentration in ${topMarket} indicates ` 
      : '';

    return `${overlapContext}${geographyContext}a ${incomeContext} audience ($${medianHHI.toLocaleString()} median income) with ${dealAnalysis.length} recommended deal${dealAnalysis.length > 1 ? 's' : ''} across ${[...new Set(dealAnalysis.map(d => d.mediaType))].join(' and ')} channels. This combination targets high-intent purchasers during peak consideration moments.`;
  }

  /**
   * Identify unexpected insights from cross-purchase patterns
   */
  private identifyHiddenOpportunities(
    allOverlaps: Array<{segment: string; overlapPercentage: number; insight: string}>,
    primarySegment: AudienceData,
    dealAnalysis: DealAnalysis[]
  ): string[] {
    const opportunities: string[] = [];
    
    // High-value unexpected overlaps (>30%)
    const highValueOverlaps = allOverlaps
      .filter(o => o.overlapPercentage > 30)
      .slice(0, 3);
    
    highValueOverlaps.forEach(overlap => {
      if (overlap.segment.toLowerCase() !== primarySegment.segment.toLowerCase()) {
        opportunities.push(`Unexpected ${overlap.overlapPercentage.toFixed(0)}% overlap with ${overlap.segment} suggests cross-category targeting opportunities`);
      }
    });

    // Geographic over-indexing opportunities
    const topGeoMarkets = primarySegment.geographicHotspots
      .filter(h => h.overIndex && h.overIndex > 2)
      .slice(0, 2);
    
    topGeoMarkets.forEach(market => {
      opportunities.push(`${market.overIndex}x over-indexing in ${market.city}, ${market.state} indicates untapped market potential`);
    });

    // Income positioning opportunities
    const { medianHHIvsCommerce } = primarySegment.demographics;
    if (medianHHIvsCommerce > 20) {
      opportunities.push(`Premium positioning opportunity: ${medianHHIvsCommerce.toFixed(0)}% above average commerce income`);
    } else if (medianHHIvsCommerce < -20) {
      opportunities.push(`Value-focused messaging opportunity: ${Math.abs(medianHHIvsCommerce).toFixed(0)}% below average commerce income`);
    }

    // Media type diversification
    const mediaTypes = [...new Set(dealAnalysis.map(d => d.mediaType))];
    if (mediaTypes.length === 1 && dealAnalysis.length > 1) {
      opportunities.push(`Consider testing additional media formats beyond ${mediaTypes[0]} for broader reach`);
    }

    return opportunities.length > 0 ? opportunities : ['Cross-segment analysis reveals expansion opportunities with similar audience behavior patterns'];
  }

  /**
   * Generate risk warnings based on audience data and market conditions
   */
  private identifyRiskWarnings(primarySegment: AudienceData, dealAnalysis: DealAnalysis[]): string[] {
    const warnings: string[] = [];
    const { demographics, geographicHotspots } = primarySegment;

    // Audience saturation concerns
    if (geographicHotspots.length < 3) {
      warnings.push('Limited geographic concentration may impact campaign scale and efficiency');
    }

    // Income sensitivity
    const { medianHHIvsCommerce } = demographics;
    if (medianHHIvsCommerce > 30) {
      warnings.push('Premium audience may be price-sensitive to promotional messaging');
    }

    // Deal format risks
    const ctvDeals = dealAnalysis.filter(d => d.environment.toLowerCase().includes('ctv'));
    if (ctvDeals.length === dealAnalysis.length) {
      warnings.push('CTV-only strategy may limit reach - consider mobile app or web display supplements');
    }

    // Competition in high-overlap segments
    const highOverlaps = primarySegment.overlaps.filter(o => o.overlapPercentage > 40);
    if (highOverlaps.length > 2) {
      warnings.push('High overlap with popular segments may increase competitive pressure and CPM costs');
    }

    return warnings.length > 0 ? warnings : ['Monitor campaign performance for early optimization signals'];
  }

  /**
   * Calculate realistic testing framework with budget and metrics
   */
  private calculateTestingFramework(
    dealAnalysis: DealAnalysis[], 
    primarySegment: AudienceData,
    avgCpm: number
  ): {
    minimumBudget?: string;
    testDuration?: string;
    successMetrics?: string[];
    optimizationSignals?: string[];
  } {
    // Calculate minimum viable budget based on estimated reach and CPM
    const estimatedReach = 200000; // Conservative estimate for testing
    const marginFactor = 1.15; // 15% margin for testing overhead
    
    let minimumBudget = '$5,000'; // Default
    if (avgCpm > 0) {
      const calculatedBudget = (estimatedReach / 1000) * avgCpm * marginFactor;
      minimumBudget = calculatedBudget > 5000 
        ? `$${calculatedBudget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : '$5,000';
    }

    // Determine test duration based on audience type
    const testDuration = primarySegment.demographics.medianHHIvsCommerce > 20 
      ? '3-4 weeks' 
      : '2-3 weeks';

    // Success metrics based on audience characteristics
    const incomeLevel = primarySegment.demographics.medianHHIvsCommerce;
    const isHighIncome = incomeLevel > 15;
    
    const successMetrics = [
      isHighIncome ? 'CTR >1.8%' : 'CTR >2.2%',
      `CPM efficiency <$${avgCpm > 0 ? (avgCpm * 1.2).toFixed(0) : '20'}`,
      'Conversion rate >1.0%',
      isHighIncome ? 'Quality score >7.5' : 'Quality score >7.0'
    ];

    const optimizationSignals = [
      'CTR trend analysis over 7-day windows',
      'Geographic performance by market concentration',
      'Time-of-day performance patterns',
      'Creative fatigue indicators (>5 days same creative)'
    ];

    return {
      minimumBudget,
      testDuration,
      successMetrics,
      optimizationSignals
    };
  }

  /**
   * Generate quick wins based on audience and deal data
   */
  private generateQuickWins(dealAnalysis: DealAnalysis[], primarySegment: AudienceData): string[] {
    const quickWins: string[] = [];

    // Prioritize highest-confidence deals first
    quickWins.push('Launch with highest-confidence deals first for immediate performance validation');

    // Geographic quick wins
    const topMarket = primarySegment.geographicHotspots[0];
    if (topMarket && topMarket.overIndex && topMarket.overIndex > 2) {
      quickWins.push(`Start in ${topMarket.city}, ${topMarket.state} (${topMarket.overIndex}x over-index) for fastest validation`);
    }

    // Creative testing quick wins
    quickWins.push('Test 3-4 creative variants immediately to identify winning messaging early');

    // Timing quick wins
    const isFamilyAudience = primarySegment.demographics.topAgeBracket.includes('30') || 
                            primarySegment.demographics.topAgeBracket.includes('40');
    if (isFamilyAudience) {
      quickWins.push('Focus on weekday evenings and weekend mornings for family audience engagement');
    }

    return quickWins;
  }

  /**
   * Generate scaling path based on performance data
   */
  private generateScalingPath(dealAnalysis: DealAnalysis[], primarySegment: AudienceData): string[] {
    const scalingPath: string[] = [];

    // Start with high-confidence segments
    scalingPath.push('Scale winning creative formats and audience segments based on 2-week performance data');

    // Geographic expansion
    const topMarkets = primarySegment.geographicHotspots.slice(0, 3);
    if (topMarkets.length > 1) {
      const nextMarkets = topMarkets.slice(1).map(m => `${m.city}, ${m.state}`).join(', ');
      scalingPath.push(`Expand to similar demographic markets: ${nextMarkets}`);
    }

    // Media type expansion
    const currentFormats = [...new Set(dealAnalysis.map(d => d.mediaType))];
    if (currentFormats.length === 1) {
      scalingPath.push(`Test complementary formats to ${currentFormats[0]} based on audience behavior patterns`);
    } else {
      scalingPath.push('Optimize budget allocation across performing formats based on efficiency metrics');
    }

    // Advanced targeting
    scalingPath.push('Implement lookalike targeting based on top-performing audience characteristics');
    scalingPath.push('Set up automated bid optimization rules for sustained performance improvement');

    return scalingPath;
  }

  /**
   * Generate competitive intelligence using demographic data and market analysis
   */
  private generateCompetitiveIntelligence(
    primarySegment: AudienceData,
    allOverlaps: Array<{segment: string; overlapPercentage: number; insight: string}>
  ): string {
    const { demographics } = primarySegment;
    const { medianHHIvsCommerce, educationVsCommerce } = demographics;
    
    // Market maturity assessment
    const isPremiumMarket = medianHHIvsCommerce > 20 && educationVsCommerce > 15;
    const isValueMarket = medianHHIvsCommerce < -15;
    
    let marketContext = '';
    if (isPremiumMarket) {
      marketContext = 'Premium market with affluent, educated consumers - competitive advantage through quality positioning and premium creative execution.';
    } else if (isValueMarket) {
      marketContext = 'Value-conscious market - focus on price efficiency and practical benefits over luxury positioning.';
    } else {
      marketContext = 'Mainstream market with balanced price/quality expectations - competitive through efficiency and broad appeal.';
    }

    // Channel saturation insights
    const highOverlapSegments = allOverlaps.filter(o => o.overlapPercentage > 35);
    const saturationContext = highOverlapSegments.length > 2 
      ? 'High segment overlaps suggest competitive pressure - early entry timing and strong creative differentiation critical.'
      : 'Lower segment overlap indicates opportunity for first-mover advantage with proper audience education.';

    // Geographic competitive advantage
    const topMarkets = primarySegment.geographicHotspots.slice(0, 2);
    const geoContext = topMarkets.length > 0 
      ? `Geographic concentration in ${topMarkets.map(m => `${m.city}, ${m.state}`).join(' and ')} provides local market knowledge advantage over national competitors.`
      : '';

    return `${marketContext} ${saturationContext} ${geoContext}`.trim();
  }

  /**
   * Fallback to generic coaching when data is unavailable
   */
  private generateGenericCoaching(query: string): CoachingInsights {
    console.log('⚠️ Generating generic coaching fallback');
    
    return {
      strategyRationale: `These deals have been selected based on your query "${query}" and represent proven advertising inventory with established audience targeting capabilities.`,
      hiddenOpportunities: [
        'Consider cross-audience targeting opportunities revealed through overlap analysis',
        'Leverage seasonal and trend data for optimal campaign timing'
      ],
      riskWarnings: [
        'Monitor audience saturation levels in high-performing segments',
        'Watch for competitive pressure in key demographic groups'
      ],
      testingFramework: {
        minimumBudget: '$5,000',
        testDuration: '2-4 weeks',
        successMetrics: ['CTR', 'conversion rate', 'cost per acquisition']
      },
      quickWins: [
        'Start with highest-confidence deals first',
        'Implement A/B testing across different creative formats'
      ],
      scalingPath: [
        'Scale winning creative formats and audiences',
        'Expand to similar demographic segments',
        'Optimize based on performance data'
      ],
      competitiveIntelligence: 'Market positioning analysis shows key opportunities in specified audience segments with competitive advantages in targeting precision and reach efficiency.'
    };
  }
}

export const coachingService = CoachingService.getInstance();
