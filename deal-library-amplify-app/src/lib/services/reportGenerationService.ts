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


Marketing SWOT Analysis

${this.generateSWOTSection(results.swot)}

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
   * Generate executive summary section with competitive positioning
   */
  private generateExecutiveSummary(results: AnalysisResults): string {
    const reach = results.marketSizing.reachEstimate;
    const reachFormatted = reach > 1000000 
      ? `${(reach / 1000000).toFixed(1)}M` 
      : `${(reach / 1000).toFixed(0)}K`;

    let summary = `Key Findings:

• ${results.audiences.count} precision audience segments identified and mapped
• ${reachFormatted} potential reach across target demographics (${results.marketSizing.totalAddressableMarket > 0 ? `${((results.marketSizing.reachEstimate / results.marketSizing.totalAddressableMarket) * 100).toFixed(1)}% market penetration` : 'comprehensive coverage'})
• ${results.personas.count} audience personas developed for targeting
• ${results.deals.count} deal recommendations optimized for campaign objectives`;

    // Add geographic insights if available
    if (results.geographic.topMarkets && results.geographic.topMarkets.length > 0) {
      summary += `\n• ${results.geographic.topMarkets.length} high-opportunity markets identified with concentration analysis`;
    } else {
      summary += `\n• ZIP code-level geographic targeting capabilities`;
    }

    // Add competitive positioning if available
    if (results.strategy && results.strategy.competitors && results.strategy.competitors.length > 0) {
      summary += `\n• Competitive analysis and differentiation strategy developed`;
    }

    summary += `\n• Comprehensive demographic and behavioral intelligence`;

    return summary;
  }

  /**
   * Generate audience segments section
   */
  private generateAudienceSegmentsSection(segments: any[]): string {
    if (segments.length === 0) {
      return 'Audience Segments\n\nAudience segments will be populated based on campaign requirements.';
    }

    let section = `Audience Segments\n\nWe have identified ${segments.length} precision audience segments:\n\n`;
    
    segments.forEach((enrichedSeg, index) => {
      // Unwrap enriched segment to get actual segment data
      const seg = enrichedSeg.segment || enrichedSeg;
      
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
   * Generate personas section (Enhanced with rich Audience Insights data)
   */
  private generatePersonasSection(personas: any): string {
    if (personas.count === 0) {
      return '';
    }

    const aiGeneratedCount = personas.profiles.filter((p: any) => p.isAIGenerated).length;
    
    let section = `Audience Personas\n\n`;
    section += `Understanding your audience goes beyond demographics. We've developed ${personas.count} detailed personas`;
    if (aiGeneratedCount > 0) {
      section += ` (${aiGeneratedCount} AI-generated with census-backed insights)`;
    }
    section += `:\n\n`;
    
    personas.profiles.forEach((persona: any, index: number) => {
      const personaName = persona.name || persona.personaName;
      const emoji = persona.emoji || '';
      
      section += `${index + 1}. ${emoji} ${personaName}\n`;
      section += `   Category: ${persona.category}\n`;
      section += `   ${persona.coreInsight || persona.description}\n`;
      
      // If AI-generated, include rich demographic data
      if (persona.isAIGenerated && persona.demographics) {
        section += `\n   Key Demographics:\n`;
        if (persona.demographics.medianIncome) {
          section += `   • Median Income: $${(persona.demographics.medianIncome / 1000).toFixed(0)}K\n`;
        }
        if (persona.demographics.topAge) {
          section += `   • Primary Age: ${persona.demographics.topAge}\n`;
        }
        if (persona.demographics.educationLevel) {
          section += `   • Bachelor's Degree: ${persona.demographics.educationLevel}%\n`;
        }
        if (persona.demographics.topMarkets && persona.demographics.topMarkets.length > 0) {
          section += `   • Top Markets: ${persona.demographics.topMarkets.slice(0, 3).join(', ')}\n`;
        }
      }
      
      // If AI-generated, include behavioral overlaps
      if (persona.isAIGenerated && persona.behavioralOverlap && persona.behavioralOverlap.length > 0) {
        section += `\n   Cross-Sell Opportunities:\n`;
        persona.behavioralOverlap.slice(0, 2).forEach((overlap: any) => {
          section += `   • ${overlap.segment} (${overlap.overlapPercentage}% overlap)\n`;
        });
      }
      
      // Include creative hooks (rich or basic)
      if (persona.creativeHooks && persona.creativeHooks.length > 0) {
        section += `\n   Messaging Recommendations:\n`;
        persona.creativeHooks.slice(0, 2).forEach((hook: string) => {
          section += `   • ${hook}\n`;
        });
      }
      
      section += `\n`;
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
    
    // If we have actual matched segments, show them
    if (results.audiences.segments && results.audiences.segments.length > 0) {
      let section = `We have identified ${results.audiences.count} precision audience segments that align with your target market:\n\n`;
      
      results.audiences.segments.slice(0, 5).forEach((enrichedSeg, index) => {
        const seg = enrichedSeg.segment || enrichedSeg;
        const segmentName = seg.segmentName || seg.name;
        const segmentDesc = seg.segmentDescription || seg.description || '';
        const scale = seg.scale7DayUS || seg['scale_7day_us'] || seg.scale || 0;
        
        section += `${index + 1}. ${segmentName}\n`;
        if (segmentDesc) {
          section += `   ${segmentDesc}\n`;
        }
        if (scale > 0) {
          section += `   Reach: ${this.formatReach(scale)}\n`;
        }
        section += `   Strategic Value: This segment represents a key opportunity for ${brief.advertiserName}'s campaign objectives.\n\n`;
      });
      
      return section;
    } else {
      // Fallback to target audiences from brief
      let section = `We have identified ${results.audiences.count} precision audience segments that align with your target market:\n\n`;
      
      brief.targetAudiences.forEach((audience, index) => {
        section += `${index + 1}. ${audience}\n`;
        section += `   Strategic Value: This audience segment represents a key opportunity for ${brief.advertiserName} to achieve their campaign objectives.\n\n`;
      });

      return section;
    }
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
   * Generate geographic section with actual market data
   */
  private generateGeographicSection(results: AnalysisResults): string {
    const geo = results.geographic;
    
    let section = `Our platform provides ZIP code-level targeting capabilities to maximize campaign efficiency. Based on your target audiences, we've identified high-opportunity markets:\n\n`;

    if (geo.topMarkets && geo.topMarkets.length > 0) {
      section += `Top Recommended Markets (ranked by opportunity score):\n\n`;
      
      geo.topMarkets.slice(0, 10).forEach((market, index) => {
        const cityState = `${market.city}, ${market.state}`;
        const concentration = market.concentration ? `${(market.concentration * 100).toFixed(1)}% concentration` : '';
        const population = market.population ? ` | Pop: ${this.formatNumber(market.population)}` : '';
        const income = market.medianIncome ? ` | Med. Income: $${this.formatNumber(market.medianIncome)}` : '';
        const urbanRural = market.urbanRural && market.urbanRural !== 'Unknown' ? ` | ${market.urbanRural}` : '';
        
        section += `${index + 1}. ${cityState}\n`;
        if (concentration || population || income) {
          section += `   ${concentration}${population}${income}${urbanRural}\n`;
        }
        section += `\n`;
      });

      section += `\nGeographic Targeting Strategy:\n\n`;
      section += `• Focus initial campaign deployment on Tier 1 markets (top 5) for maximum efficiency\n`;
      section += `• Scale to Tier 2 markets (6-10) based on early performance data\n`;
      section += `• Use ZIP code-level targeting to exclude low-density areas and reduce waste\n`;
      section += `• Customize messaging by market characteristics (urban vs suburban, income levels)\n`;
    } else {
      // Fallback to generic capabilities
      section += `Geographic Intelligence Capabilities:\n\n`;
      section += `• Top Market Identification - Pinpoint highest-concentration areas for each audience segment\n`;
      section += `• Location-Based Optimization - Align campaigns with physical store or service locations\n`;
      section += `• Urban/Suburban/Rural Targeting - Reach audiences in their preferred environments\n`;
      section += `• Regional Customization - Tailor messaging and offers by geography\n\n`;
      section += `Note: Detailed market analysis will be provided once audience segments are finalized.\n`;
    }

    return section;
  }
  
  /**
   * Format number for display
   */
  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toFixed(0);
  }

  /**
   * Generate market sizing section with demographic breakdown
   */
  private generateMarketSizingSection(results: AnalysisResults): string {
    const sizing = results.marketSizing;
    const tam = this.formatReach(sizing.totalAddressableMarket);
    const reach = this.formatReach(sizing.reachEstimate);

    let section = `Market Opportunity Analysis:

Total Addressable Market: ${tam} potential consumers
Estimated Reach: ${reach} unique users (7-day cookie scale)
Market Penetration: ${((sizing.reachEstimate / sizing.totalAddressableMarket) * 100).toFixed(1)}% of total addressable market
`;

    // Add demographic breakdown if available
    if (sizing.demographicBreakdown) {
      const demo = sizing.demographicBreakdown;
      
      // Age distribution
      if (demo.ageDistribution && Object.keys(demo.ageDistribution).length > 0) {
        section += `\nAge Distribution:\n`;
        const sortedAges = Object.entries(demo.ageDistribution)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3);
        
        for (const [ageRange, percentage] of sortedAges) {
          section += `• ${ageRange}: ${(percentage as number).toFixed(1)}%\n`;
        }
      }
      
      // Income distribution
      if (demo.incomeDistribution && Object.keys(demo.incomeDistribution).length > 0) {
        section += `\nIncome Distribution:\n`;
        const sortedIncome = Object.entries(demo.incomeDistribution)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3);
        
        for (const [incomeRange, percentage] of sortedIncome) {
          section += `• ${incomeRange}: ${(percentage as number).toFixed(1)}%\n`;
        }
      }
      
      // Education distribution
      if (demo.educationDistribution && Object.keys(demo.educationDistribution).length > 0) {
        section += `\nEducation Attainment:\n`;
        const sortedEdu = Object.entries(demo.educationDistribution)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3);
        
        for (const [eduLevel, percentage] of sortedEdu) {
          section += `• ${eduLevel}: ${(percentage as number).toFixed(1)}%\n`;
        }
      }
    }

    // Add strategic implications
    section += `\nStrategic Implications:

• Target messaging and creative to dominant demographic segments
• Price positioning should align with income distribution
• Media channel selection optimized for age and education profiles
• Geographic targeting prioritizes high-concentration, high-value markets`;

    return section;
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
   * Generate competitive analysis section with enhanced positioning
   */
  private generateCompetitiveAnalysisSection(strategy: any): string {
    if (!strategy.competitors || !strategy.differentiators) return '';
    
    let section = `
Competitive Landscape & Differentiation Strategy

Understanding your competitive position is essential for effective campaign positioning. Our analysis reveals key opportunities to differentiate and capture market share.

Competitive Environment:

${strategy.competitors.map((c: string, index: number) => `${index + 1}. ${c}`).join('\n')}

Strategic Differentiation Opportunities:

${strategy.differentiators.map((d: string, index: number) => {
  // Parse differentiation strategy format: "Title: Description"
  const parts = d.split(':');
  if (parts.length > 1 && parts[0]) {
    return `${index + 1}. ${parts[0].trim()}\n   ${parts.slice(1).join(':').trim()}`;
  }
  return `${index + 1}. ${d}`;
}).join('\n\n')}

Competitive Positioning Recommendations:

• Lead with unique value propositions that competitors cannot easily replicate
• Focus messaging on differentiating attributes identified above
• Target underserved audience segments where competition is less intense
• Leverage data-driven targeting to reach audiences more efficiently than competitors
• Monitor competitive activity and adjust positioning as market dynamics evolve

`;
    return section;
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


