/**
 * Report Generation Service
 * Compiles analysis results into professional markdown proposals
 */

import { AnalysisResults, ParsedBrief } from '../types/agentMode';
import { Deal } from '../types/deal';

export class ReportGenerationService {
  /**
   * Generate complete markdown report from analysis results
   */
  generateReport(results: AnalysisResults): string {
    const brief = results.parsedBrief;
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // DEBUG: Check if strategy data is present
    console.log('📊 Report Generation - Strategy Data Check:');
    console.log('   Has strategy:', !!results.strategy);
    if (results.strategy) {
      console.log('   Competitors:', results.strategy.competitors?.length || 0);
      console.log('   Differentiators:', results.strategy.differentiators?.length || 0);
      console.log('   Market Tiers:', !!results.strategy.marketTiers);
      console.log('   Budget Pacing:', !!results.strategy.budgetPacing);
      console.log('   Dayparting:', !!results.strategy.dayparting);
    }

    return `Marketing Proposal for ${brief.advertiserName}

Prepared by Sovrn | ${date}

────────────────────────────────────────────────────────────────────

Executive Summary

Sovrn is pleased to present a comprehensive marketing strategy to help ${brief.advertiserName} reach their target audiences across the United States. Through our advanced audience intelligence platform, we have identified and mapped precise audience segments that align with your campaign objectives.

${this.generateExecutiveSummary(results)}


Target Audience Analysis

${this.generateAudienceAnalysis(results)}


${this.generateAudienceSegmentsSection(results.audiences.segments)}


${this.generatePersonasSection(results.personas)}


Campaign Recommendations

${this.generateCampaignRecommendations(results, brief)}


${this.generateDealRecommendations(results.deals.recommendations)}


Geographic Targeting Capabilities

${this.generateGeographicSection(results)}


Market Sizing & Opportunity

${this.generateMarketSizingSection(results)}


Marketing SWOT Analysis

${this.generateSWOTSection(results.swot)}

${results.strategy ? this.generateCompetitiveAnalysisSection(results.strategy) : ''}

${results.strategy?.marketTiers ? this.generateMarketTiersSection(results.strategy.marketTiers) : ''}

${results.strategy?.budgetPacing ? this.generateBudgetPacingSection(results.strategy.budgetPacing) : ''}

${results.strategy?.dayparting ? this.generateDaypartingSection(results.strategy.dayparting) : ''}

Measurement & Success Metrics

${this.generateMetricsSection()}


Why Sovrn for ${brief.advertiserName}?

${this.generateWhySovrnSection()}


Next Steps

To move forward with this proposal, we recommend:

1. Strategic Planning Session
   Review audience priorities, align on campaign objectives, and discuss creative requirements

2. Audience Insights Workshop
   Deep-dive into specific segments, review geographic data, and explore behavioral overlaps

3. Finalize Campaign Strategy
   Lock messaging and creative, set budget and pacing, establish success metrics

4. Launch Campaign
   Test priority audiences, monitor and optimize, scale based on results


Contact Information

Sovrn Marketing Solutions

Email: sales@sovrn.com
Website: www.sovrn.com

This proposal is valid for 60 days from the date of issuance.
© ${new Date().getFullYear()} Sovrn Holdings, Inc. All rights reserved.
`;
  }

  /**
   * Generate executive summary section
   */
  private generateExecutiveSummary(results: AnalysisResults): string {
    const reach = results.marketSizing.reachEstimate;
    const reachFormatted = reach > 1000000 
      ? `${(reach / 1000000).toFixed(1)}M` 
      : `${(reach / 1000).toFixed(0)}K`;

    return `Key Findings:

• ${results.audiences.count} precision audience segments identified and mapped
• ${reachFormatted} potential reach across target demographics
• ${results.personas.count} audience personas developed for targeting
• ${results.deals.count} deal recommendations optimized for campaign objectives
• ZIP code-level geographic targeting capabilities
• Comprehensive demographic and behavioral intelligence`;
  }

  /**
   * Generate audience segments section
   */
  private generateAudienceSegmentsSection(segments: any[]): string {
    if (segments.length === 0) {
      return 'Audience Segments\n\nAudience segments will be populated based on campaign requirements.';
    }

    let section = `Audience Segments\n\nWe have identified ${segments.length} precision audience segments:\n\n`;
    
    segments.forEach((seg, index) => {
      section += `${index + 1}. ${seg.segmentName || seg.name}\n`;
      section += `   ${seg.segmentDescription || seg.description || 'Audience segment details'}\n`;
      if (seg.segmentType) {
        section += `   Type: ${seg.segmentType}\n`;
      }
      if (seg.scale7DayUS) {
        section += `   Reach: ${this.formatReach(seg.scale7DayUS)}`;
        if (seg.cpm) {
          section += ` | CPM: $${seg.cpm.toFixed(2)}`;
        }
        section += `\n`;
      }
      section += `\n`;
    });

    return section;
  }

  /**
   * Generate personas section
   */
  private generatePersonasSection(personas: any): string {
    if (personas.count === 0) {
      return '';
    }

    let section = `Audience Personas\n\n`;
    section += `Understanding your audience goes beyond demographics. We've developed ${personas.count} detailed personas:\n\n`;
    
    personas.profiles.forEach((persona: any, index: number) => {
      section += `${index + 1}. ${persona.name || persona.personaName}\n`;
      section += `   ${persona.category}\n`;
      section += `   ${persona.coreInsight || persona.description}\n\n`;
    });

    return section;
  }

  /**
   * Generate campaign recommendations section
   */
  private generateCampaignRecommendations(results: AnalysisResults, brief: ParsedBrief): string {
    let section = `Based on your campaign objectives, we recommend:\n\n`;
    
    brief.campaignObjectives.forEach((objective, index) => {
      section += `Campaign ${index + 1}: ${objective}\n\n`;
      section += `Target Audiences:\n`;
      brief.targetAudiences.slice(0, 3).forEach(aud => {
        section += `• ${aud}\n`;
      });
      section += `\n`;
      section += `Recommended Approach:\n`;
      section += `• Precision audience targeting using behavioral and demographic signals\n`;
      section += `• Multi-channel activation across display, video, and native formats\n`;
      section += `• Geographic optimization based on market intelligence\n`;
      section += `• Real-time performance monitoring and optimization\n\n`;
    });

    return section;
  }

  /**
   * Generate "Why Sovrn" section
   */
  private generateWhySovrnSection(): string {
    return `1. Unmatched Scale & Quality

• Commerce Audience segments across all categories
• Extensive interest-based targeting options
• 20M+ daily US reach across engaged consumers

2. Data-Driven Precision

• Behavioral purchase intent signals
• Real-time audience refresh (7-day cookie scale)
• ZIP code-level geographic intelligence
• Demographic enrichment from census data

3. Transparent Performance

• Clear CPM pricing with no hidden fees
• Real-time reporting and optimization
• Dedicated support and strategic guidance`;
  }

  /**
   * Generate audience analysis section
   */
  private generateAudienceAnalysis(results: AnalysisResults): string {
    const brief = results.parsedBrief;
    
    let section = `We have identified ${results.audiences.count} precision audience segments that align with your target market:\n\n`;
    
    brief.targetAudiences.forEach((audience, index) => {
      section += `${index + 1}. ${audience}\n`;
      section += `   Strategic Value: This audience segment represents a key opportunity for ${brief.advertiserName} to achieve their campaign objectives.\n\n`;
    });

    return section;
  }


  /**
   * Generate deal recommendations section
   */
  private generateDealRecommendations(deals: Deal[]): string {
    if (deals.length === 0) {
      return `Deal Recommendations

We will identify specific deal packages tailored to your campaign objectives. Our deal inventory includes:

• Premium Display packages across top-tier publishers
• Connected TV (CTV) deals for high-engagement video content
• Native Advertising opportunities for seamless brand integration
• Mobile activations for on-the-go audiences
• Programmatic Guaranteed deals for predictable delivery

All deals include:
• Transparent pricing and no hidden fees
• Brand-safe environments
• Third-party verification
• Real-time reporting and optimization`;
    }

    let section = `Deal Recommendations\n\nWe have identified ${deals.length} recommended deals aligned with your campaign objectives:\n\n`;

    deals.forEach((deal, index) => {
      section += `${index + 1}. ${deal.dealName}\n`;
      section += `   ${deal.description}\n`;
      section += `   Environment: ${deal.environment}`;
      if (deal.mediaType) {
        section += ` | Media Type: ${deal.mediaType}`;
      }
      if (deal.dealId) {
        section += ` | Deal ID: ${deal.dealId}`;
      }
      section += `\n\n`;
    });

    return section;
  }

  /**
   * Generate geographic section
   */
  private generateGeographicSection(results: AnalysisResults): string {
    const geo = results.geographic;
    
    let section = `Our platform provides ZIP code-level targeting capabilities to maximize campaign efficiency:\n\n`;
    section += `Geographic Intelligence Features:\n\n`;
    section += `• Top Market Identification - Pinpoint highest-concentration areas for each audience segment\n`;
    section += `• Location-Based Optimization - Align campaigns with physical store or service locations\n`;
    section += `• Urban/Suburban/Rural Targeting - Reach audiences in their preferred environments\n`;
    section += `• Regional Customization - Tailor messaging and offers by geography\n`;

    if (geo.topMarkets && geo.topMarkets.length > 0) {
      section += `\nTop Recommended Markets:\n\n`;
      geo.topMarkets.slice(0, 10).forEach((market, index) => {
        section += `${index + 1}. ${market.name || market.city || market.zipCode}, ${market.state || market.region || ''}\n`;
      });
    }

    return section;
  }

  /**
   * Generate market sizing section
   */
  private generateMarketSizingSection(results: AnalysisResults): string {
    const sizing = results.marketSizing;
    const tam = this.formatReach(sizing.totalAddressableMarket);
    const reach = this.formatReach(sizing.reachEstimate);

    return `Market Opportunity:

Total Addressable Market: ${tam} potential consumers
Estimated Reach: ${reach} unique users (7-day cookie scale)
Market Penetration: ${((sizing.reachEstimate / sizing.totalAddressableMarket) * 100).toFixed(1)}% of total addressable market

Our audience intelligence reveals key demographic characteristics that can inform targeting strategy:

• Age distribution optimized for target audience preferences
• Income levels aligned with product/service positioning
• Education and lifestyle attributes for precision targeting
• Geographic concentration in high-value markets`;
  }

  /**
   * Generate SWOT section
   */
  private generateSWOTSection(swot: any): string {
    return `Strengths:
${swot.strengths.map((s: string) => `• ${s}`).join('\n')}

Weaknesses:
${swot.weaknesses.map((w: string) => `• ${w}`).join('\n')}

Opportunities:
${swot.opportunities.map((o: string) => `• ${o}`).join('\n')}

Threats:
${swot.threats.map((t: string) => `• ${t}`).join('\n')}`;
  }

  /**
   * Generate metrics section
   */
  private generateMetricsSection(): string {
    return `We recommend tracking the following KPIs:

Upper Funnel:
• Impressions delivered
• Unique reach achieved
• Viewability rate
• Brand lift (if measured)

Middle Funnel:
• Click-through rate (CTR)
• Site visits
• Landing page engagement
• Time on site

Lower Funnel:
• Conversions (form fills, sign-ups, purchases)
• Cost per acquisition (CPA)
• Phone calls generated
• Walk-in conversions (where trackable)

Business Outcomes:
• Return on ad spend (ROAS)
• Customer lifetime value (CLV)
• Market share growth

All metrics available through real-time dashboards, weekly performance reports, and monthly business reviews.`;
  }

  /**
   * Generate competitive analysis section (NEW)
   */
  private generateCompetitiveAnalysisSection(strategy: any): string {
    if (!strategy.competitors || !strategy.differentiators) return '';
    
    return `
Competitive Analysis & Differentiation

Understanding the competitive landscape is crucial for positioning your campaign effectively.

Key Competitors:

${strategy.competitors.map((c: string) => `• ${c}`).join('\n')}

Recommended Differentiation Strategies:

${strategy.differentiators.map((d: string) => `${d}`).join('\n\n')}

`;
  }

  /**
   * Generate market tiers section (NEW)
   */
  private generateMarketTiersSection(marketTiers: any): string {
    return `
Market Prioritization Strategy

Based on audience density, spending power, and market characteristics:

Tier 1 Markets (Primary Focus):
${marketTiers.tier1.map((city: string) => `• ${city}`).join('\n')}

Tier 2 Markets (Secondary Expansion):
${marketTiers.tier2.map((city: string) => `• ${city}`).join('\n')}

Rationale:
${marketTiers.rationale}

`;
  }

  /**
   * Generate budget pacing section (NEW)
   */
  private generateBudgetPacingSection(budgetPacing: any): string {
    return `
Recommended Budget Pacing Strategy

Total Campaign Budget: ${budgetPacing.totalBudget}

${budgetPacing.phases.map((phase: any) => `
${phase.name} (${phase.percentage}% - ${phase.budget})
Duration: ${phase.duration}

Focus: ${phase.focus}
`).join('\n')}

This phased approach allows for strategic budget allocation aligned with the customer journey, starting with awareness building and progressively moving toward conversion optimization.

`;
  }

  /**
   * Generate dayparting section (NEW)
   */
  private generateDaypartingSection(dayparting: any): string {
    return `
Dayparting Recommendations

Optimal Campaign Flight Times:

${dayparting.optimal.map((time: string) => `• ${time}`).join('\n')}

Rationale:
${dayparting.rationale}

By concentrating ad delivery during high-intent periods, we can maximize campaign efficiency and reduce wasted impressions.

`;
  }

  /**
   * Format large numbers for reach display
   */
  private formatReach(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toFixed(0);
  }
}

// Export singleton instance
export const reportGenerationService = new ReportGenerationService();


