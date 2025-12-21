/**
 * Proposal Builder Service
 * 
 * Assembles marketing proposals from pre-generated audience insights reports
 * Instead of dynamically generating everything, this leverages the 198 Commerce Audiences
 * with rich census-backed data for instant, high-quality proposals.
 */

import { audienceInsightsReports, PreGeneratedAudienceReport } from '@/data/audienceInsightsReports';
import { ComprehensiveReport, AnalysisResults, ParsedBrief } from '@/types/agentMode';
import { Deal } from '@/types/deal';
import { DealsController } from '@/lib/controllers/dealsController';
import { audienceInsightsService } from './audienceInsightsService';
import { GeminiService } from './geminiService';

export interface ProposalBuilderInput {
  advertiserName: string;
  selectedAudiences: string[]; // Array of segment names from audienceInsightsReports
  campaignObjective: string; // 'awareness' | 'consideration' | 'conversion' | 'full-funnel'
  budgetRange?: string;
  geographicFocus?: string;
}

export class ProposalBuilderService {
  private dealsController: DealsController;
  private geminiService: GeminiService | null = null;

  constructor() {
    this.dealsController = new DealsController();
  }

  /**
   * Get or initialize Gemini service (lazy loading)
   */
  private getGeminiService(): GeminiService | null {
    if (!this.geminiService) {
      try {
        this.geminiService = new GeminiService();
      } catch (error) {
        console.error('Failed to initialize GeminiService:', error);
        return null;
      }
    }
    return this.geminiService;
  }

  /**
   * Build a complete marketing proposal from selected audiences
   */
  async buildProposal(input: ProposalBuilderInput): Promise<ComprehensiveReport> {
    console.log('📋 Building proposal for:', {
      advertiser: input.advertiserName,
      audiences: input.selectedAudiences,
      objective: input.campaignObjective
    });

    // Step 1: Pull pre-generated reports for selected audiences
    const audienceReports = this.getAudienceReports(input.selectedAudiences);
    console.log(`✅ Found ${audienceReports.length} pre-generated reports`);

    // Step 2: Fetch all deals
    const allDeals = await this.dealsController.getAllDeals();
    console.log(`📦 Fetched ${allDeals.length} total deals`);

    // Step 3: Match deals to audiences
    const matchedDeals = await this.matchDealsToAudiences(audienceReports, allDeals);
    console.log(`🎯 Matched ${matchedDeals.length} deals across all audiences`);

    // Step 4: Generate executive summary and SWOT analysis (parallel AI calls for performance)
    const [executiveSummary, swotData] = await Promise.all([
      this.generateExecutiveSummary(input, audienceReports),
      this.generateSWOT(input.advertiserName)
    ]);

    // Step 5: Assemble the comprehensive report
    const report = this.assembleReport(input, audienceReports, matchedDeals, executiveSummary, swotData);

    return report;
  }

  /**
   * Get pre-generated reports for selected audience segments
   */
  private getAudienceReports(segmentNames: string[]): PreGeneratedAudienceReport[] {
    const reports: PreGeneratedAudienceReport[] = [];

    for (const segmentName of segmentNames) {
      const report = audienceInsightsReports[segmentName];
      if (report) {
        reports.push(report);
      } else {
        console.warn(`⚠️ No pre-generated report found for segment: ${segmentName}`);
      }
    }

    return reports;
  }

  /**
   * Match deals to audiences using keyword matching
   */
  private async matchDealsToAudiences(
    reports: PreGeneratedAudienceReport[],
    allDeals: Deal[]
  ): Promise<Deal[]> {
    const matchedDeals = new Map<string, Deal>(); // Use Map to deduplicate by deal ID

    for (const report of reports) {
      try {
        // Use existing getRecommendedDeals method from audienceInsightsService
        const recommended = await audienceInsightsService.getRecommendedDeals(
          report.segment,
          report.category,
          allDeals
        );

        // Add unique deals to the map
        for (const deal of recommended) {
          const dealId = deal.id || deal.dealId || deal.name;
          if (dealId && !matchedDeals.has(dealId)) {
            matchedDeals.set(dealId, deal as Deal);
          }
        }
      } catch (error) {
        console.error(`❌ Error matching deals for ${report.segment}:`, error);
      }
    }

    // Return up to 20 deals (prioritized)
    return Array.from(matchedDeals.values()).slice(0, 20);
  }

  /**
   * Generate executive summary using AI (single lightweight call)
   */
  private async generateExecutiveSummary(
    input: ProposalBuilderInput,
    reports: PreGeneratedAudienceReport[]
  ): Promise<string> {
    const geminiService = this.getGeminiService();
    if (!geminiService) {
      // Fallback to a basic summary if Gemini is unavailable
      return this.generateFallbackSummary(input, reports);
    }

    try {
      // Build context from pre-generated reports
      const audienceSummaries = reports.map(report => ({
        segment: report.segment,
        summary: report.executiveSummary,
        persona: report.personaName,
        demographics: report.keyMetrics
      }));

      const prompt = `You are a marketing strategist creating an executive summary for a marketing proposal.

Advertiser: ${input.advertiserName}
Campaign Objective: ${input.campaignObjective}
${input.budgetRange ? `Budget Range: ${input.budgetRange}` : ''}
${input.geographicFocus ? `Geographic Focus: ${input.geographicFocus}` : ''}

Selected Audiences:
${audienceSummaries.map((a, i) => `
${i + 1}. ${a.segment}
   - ${a.summary.substring(0, 200)}...
   - Key Persona: ${a.persona}
`).join('\n')}

Write a compelling 3-4 paragraph executive summary (approximately 300-400 words) that:
1. Introduces the marketing opportunity for ${input.advertiserName}
2. Highlights the value of targeting these specific audiences
3. Emphasizes data-driven insights and reach potential
4. Positions Sovrn as the strategic partner

Be professional, data-backed, and focused on business value. Do not include markdown formatting.`;

      // Use the Flash model for faster generation
      const result = await geminiService['model'].generateContent(prompt);
      const summary = result.response.text().trim();

      return summary || this.generateFallbackSummary(input, reports);
    } catch (error) {
      console.error('❌ Error generating executive summary with AI:', error);
      return this.generateFallbackSummary(input, reports);
    }
  }

  /**
   * Fallback summary if AI generation fails
   */
  private generateFallbackSummary(
    input: ProposalBuilderInput,
    reports: PreGeneratedAudienceReport[]
  ): string {
    const audienceNames = reports.map(r => r.segment).join(', ');
    return `Sovrn is pleased to present a comprehensive marketing strategy to help ${input.advertiserName} reach their target audiences across the United States. Through our advanced audience intelligence platform, we have identified ${reports.length} precision audience segment${reports.length > 1 ? 's' : ''} (${audienceNames}) that align with your campaign objectives.

Our data-driven approach leverages verified purchase intent signals and census-backed demographic insights to ensure your message reaches the right consumers at the right time. These audiences represent high-value opportunities for reaching your ideal customers with measurable engagement and conversion potential.

We recommend a strategic ${input.campaignObjective} campaign that targets these audiences through our premium inventory across CTV, Mobile App, and Multi-format channels. Our transparent pricing and real-time optimization capabilities ensure maximum efficiency and performance throughout your campaign.`;
  }

  /**
   * Generate SWOT analysis using AI (lightweight call)
   */
  private async generateSWOT(
    advertiserName: string
  ): Promise<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  }> {
    const geminiService = this.getGeminiService();
    if (!geminiService) {
      // Return empty SWOT if Gemini unavailable
      return {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      };
    }

    try {
      const swotResult = await geminiService.generateMarketingSWOT(advertiserName);
      
      if (swotResult && swotResult.swot) {
        return {
          strengths: (swotResult.swot.strengths || []).map((s: any) => 
            typeof s === 'string' ? s : `${s.title || ''}${s.description ? ': ' + s.description : ''}`.trim()
          ).slice(0, 5),
          weaknesses: (swotResult.swot.weaknesses || []).map((w: any) => 
            typeof w === 'string' ? w : `${w.title || ''}${w.description ? ': ' + w.description : ''}`.trim()
          ).slice(0, 5),
          opportunities: (swotResult.swot.opportunities || []).map((o: any) => 
            typeof o === 'string' ? o : `${o.title || ''}${o.description ? ': ' + o.description : ''}`.trim()
          ).slice(0, 5),
          threats: (swotResult.swot.threats || []).map((t: any) => 
            typeof t === 'string' ? t : `${t.title || ''}${t.description ? ': ' + t.description : ''}`.trim()
          ).slice(0, 5)
        };
      }
    } catch (error) {
      console.error('❌ Error generating SWOT with AI:', error);
    }

    // Fallback to empty SWOT
    return {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };
  }

  /**
   * Assemble the final comprehensive report
   */
  private assembleReport(
    input: ProposalBuilderInput,
    reports: PreGeneratedAudienceReport[],
    deals: Deal[],
    executiveSummary: string,
    swotData: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }
  ): ComprehensiveReport {
    // Extract personas from reports
    const personas = reports.map(report => {
      const creativeHooks = this.extractCreativeHooks(report);
      const mediaTargeting = this.extractMediaTargeting(report);
      
      // Extract first creative hook and media targeting for actionableStrategy
      const firstHook = creativeHooks[0] || '';
      const firstTargeting = mediaTargeting[0] || '';
      
      return {
        name: report.personaName,
        emoji: report.personaEmoji,
        description: report.personaDescription || report.executiveSummary.substring(0, 300),
        segmentId: report.segment,
        category: report.category,
        coreInsight: report.executiveSummary,
        creativeHooks,
        mediaTargeting,
        audienceMotivation: report.strategicInsights?.targetPersona || '',
        actionableStrategy: {
          creativeHook: firstHook,
          mediaTargeting: firstTargeting
        }
      };
    });

    // Aggregate market sizing from reports
    const totalReach = reports.reduce((sum, report) => {
      // Estimate reach from demographics if available
      return sum; // Placeholder - would need actual scale data
    }, 0);

    // Extract geographic insights
    const topMarkets = this.aggregateTopMarkets(reports);

    // Build parsed brief for compatibility
    const parsedBrief: ParsedBrief = {
      advertiserName: input.advertiserName,
      targetAudiences: input.selectedAudiences,
      campaignObjectives: [input.campaignObjective],
      budgetRange: input.budgetRange,
      geographicFocus: input.geographicFocus
    };

    // Build results (with executive summary stored as custom property)
    const results: AnalysisResults & { executiveSummary?: string } = {
      parsedBrief,
      executiveSummary, // Store for easy access
      audiences: {
        segments: reports.map(report => ({
          segmentName: report.segment,
          segmentDescription: report.executiveSummary,
          segmentType: 'Commerce Audience',
          category: report.category
        })),
        count: reports.length
      },
      deals: {
        recommendations: deals,
        count: deals.length
      },
      personas: {
        profiles: personas,
        count: personas.length
      },
      audienceInsights: {
        reports: reports,
        count: reports.length
      },
      marketSizing: {
        totalAddressableMarket: totalReach || 30000000, // Fallback estimate
        reachEstimate: totalReach || 30000000,
        demographicBreakdown: this.aggregateDemographics(reports)
      },
      geographic: {
        topMarkets: topMarkets,
        coverageMap: null
      },
      swot: {
        strengths: swotData.strengths,
        weaknesses: swotData.weaknesses,
        opportunities: swotData.opportunities,
        threats: swotData.threats
      },
      companyProfile: {
        industry: '',
        competitiveLandscape: '',
        marketPosition: ''
      },
      errors: []
    };

    // Build comprehensive report
    const report: ComprehensiveReport = {
      advertiserName: input.advertiserName,
      generatedDate: new Date(),
      results,
      markdownReport: this.generateMarkdownReport(input, results, executiveSummary),
      summary: {
        totalAudiences: reports.length,
        totalDeals: deals.length,
        totalPersonas: personas.length,
        estimatedReach: totalReach || 30000000,
        recommendedBudget: input.budgetRange || 'TBD',
      }
    };

    return report;
  }

  /**
   * Extract creative hooks from strategic insights
   */
  private extractCreativeHooks(report: PreGeneratedAudienceReport): string[] {
    const hooks: string[] = [];
    const messaging = report.strategicInsights?.messagingRecommendations || [];
    
    for (const msg of messaging) {
      if (typeof msg === 'string') {
        hooks.push(msg);
      } else if (msg && typeof msg === 'object') {
        // Handle object format: extract valueProposition, or fallback to stringifying
        if ('valueProposition' in msg && typeof msg.valueProposition === 'string') {
          hooks.push(msg.valueProposition);
        } else if ('title' in msg && typeof msg.title === 'string') {
          hooks.push(msg.title);
        } else {
          // Fallback: convert object to string representation
          const fallback = JSON.stringify(msg).slice(0, 150);
          hooks.push(fallback);
        }
      }
    }
    
    return hooks.slice(0, 3).filter(hook => hook.trim().length > 0);
  }

  /**
   * Extract media targeting recommendations
   */
  private extractMediaTargeting(report: PreGeneratedAudienceReport): string[] {
    const targeting: string[] = [];
    const channels = report.strategicInsights?.channelRecommendations || [];
    
    for (const channel of channels) {
      if (typeof channel === 'string') {
        targeting.push(channel);
      } else if (channel && typeof channel === 'object') {
        // Handle object format with platform property
        if ('platform' in channel) {
          const platform = channel.platform || '';
          const target = channel.targeting || '';
          if (platform) {
            targeting.push(target ? `${platform}: ${target}` : platform);
          }
        } else if ('title' in channel && typeof channel.title === 'string') {
          targeting.push(channel.title);
        } else {
          // Fallback: convert object to string representation
          const fallback = JSON.stringify(channel).slice(0, 150);
          targeting.push(fallback);
        }
      }
    }
    
    return targeting.slice(0, 3).filter(target => target.trim().length > 0);
  }

  /**
   * Aggregate top markets from multiple reports
   */
  private aggregateTopMarkets(reports: PreGeneratedAudienceReport[]): any[] {
    const marketMap = new Map<string, any>();

    for (const report of reports) {
      const hotspots = report.geographicHotspots || [];
      for (const hotspot of hotspots) {
        const key = `${hotspot.city}, ${hotspot.state}`;
        if (!marketMap.has(key)) {
          marketMap.set(key, {
            city: hotspot.city,
            state: hotspot.state,
            concentration: hotspot.density / 1000, // Normalize
            population: hotspot.population,
            medianIncome: null, // Would need to fetch from census data
            urbanRural: 'Urban'
          });
        }
      }
    }

    // Sort by concentration and return top 10
    return Array.from(marketMap.values())
      .sort((a, b) => (b.concentration || 0) - (a.concentration || 0))
      .slice(0, 10);
  }

  /**
   * Aggregate demographics across reports
   */
  private aggregateDemographics(reports: PreGeneratedAudienceReport[]): any {
    if (reports.length === 0) return null;

    // For simplicity, use the first report's demographics
    // In a production system, you'd want to weight/average across reports
    const firstReport = reports[0];
    return {
      ageDistribution: firstReport.demographics?.ageDistribution || [],
      incomeDistribution: firstReport.demographics?.incomeDistribution || [],
      educationLevels: firstReport.demographics?.educationLevels || []
    };
  }

  /**
   * Generate markdown report (for compatibility)
   */
  private generateMarkdownReport(
    input: ProposalBuilderInput,
    results: AnalysisResults,
    executiveSummary: string
  ): string {
    return `# Marketing Proposal for ${input.advertiserName}

## Executive Summary

${executiveSummary}

## Target Audiences

${results.audiences.segments.map((seg: any, i: number) => `
### ${i + 1}. ${seg.segmentName}
${seg.segmentDescription}
`).join('\n')}

## Recommended Deals

${results.deals.recommendations.map((deal: Deal, i: number) => `
${i + 1}. **${deal.dealName}** - ${deal.environment || 'Web'}
`).join('\n')}

---
Generated by Sovrn Launchpad
`;
  }
}

