/**
 * Campaign Content Service
 * AI-powered campaign brief generation and high-fidelity ZIP targeting
 */

import { GeminiService } from './geminiService';
import { CensusDataService } from './censusDataService';
import { MarketAttribute, CensusZipCodeData, GeographicLevel } from '../types/censusData';

export interface CampaignBriefInput {
  marketName: string;
  marketArchetype: string;
  overIndexAttributes: MarketAttribute[];
  underIndexAttributes: MarketAttribute[];
  geoLevel: string;
  population: number;
  geographicHierarchy?: {
    region?: string;
    state?: string;
    cbsa?: string;
    county?: string;
    city?: string;
  };
}

export interface CampaignBriefOutput {
  marketPersonaSummary: string;
  targetedHeadlines: string[];
  valuePropositions: Array<{
    theme: string;
    rationale: string;
    priority: number;
  }>;
  generatedAt: string;
}

export interface HighFidelityZipCluster {
  zipCodes: Array<{
    zipCode: string;
    city: string;
    state: string;
    population: number;
    fidelityScore: number;
    keyMetrics: {
      [key: string]: number;
    };
  }>;
  clusterSize: number;
  archetype: string;
  weightingStrategy: string;
}

export class CampaignContentService {
  private geminiService: GeminiService;
  private censusService: CensusDataService;

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
    this.censusService = CensusDataService.getInstance();
  }

  /**
   * Generate AI-powered campaign brief from market profile
   */
  async generateCampaignBrief(input: CampaignBriefInput): Promise<CampaignBriefOutput> {
    console.log(`🤖 Generating campaign brief for ${input.marketName}`);
    
    const prompt = this.buildCampaignBriefPrompt(input);
    
    try {
      // Call Gemini with structured prompt
      const result = await this.geminiService['model'].generateContent(prompt);
      const responseText = result.response.text();
      
      console.log(`📄 Gemini response length: ${responseText.length} chars`);
      
      // Parse and validate JSON response
      const parsed = this.parseCampaignBriefResponse(responseText);
      
      return {
        ...parsed,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Campaign brief generation failed:', error);
      throw new Error('Failed to generate campaign brief');
    }
  }

  private buildCampaignBriefPrompt(input: CampaignBriefInput): string {
    const geoContext = this.formatGeographicContext(input);
    const overIndexData = input.overIndexAttributes.map(attr => 
      `${attr.name}: ${attr.formattedValue} (${attr.percentDifference >= 0 ? '+' : ''}${attr.percentDifference.toFixed(0)}% vs. national)`
    ).join('\n');
    const underIndexData = input.underIndexAttributes.map(attr =>
      `${attr.name}: ${attr.formattedValue} (${attr.percentDifference.toFixed(0)}% vs. national)`
    ).join('\n');

    return `You are a Senior Marketing Strategist creating a campaign brief for ${input.marketName}.

MARKET PROFILE DATA:
- Geographic Level: ${input.geoLevel}
- Population: ${input.population.toLocaleString()}
- Location Context: ${geoContext}
- Market Archetype: ${input.marketArchetype}

OVER-INDEX ATTRIBUTES (Strengths):
${overIndexData}

UNDER-INDEX ATTRIBUTES (Considerations):
${underIndexData}

YOUR TASK: Generate persuasive campaign content that a Creative Director would approve.

Return ONLY valid JSON with NO additional text:
{
  "marketPersonaSummary": "A compelling 100-word max paragraph describing the target audience. Focus on psychographic motivations derived from over-index attributes. Be specific about lifestyle, values, and purchase drivers. Avoid generic language. Write to persuade, not just describe.",
  
  "targetedHeadlines": [
    "Headline 1 - Leverage ${input.marketName} geo-relevance",
    "Headline 2 - Appeal to ${input.marketArchetype} characteristics",
    "Headline 3 - Address primary over-index strength",
    "Headline 4 - Secondary benefit/value angle",
    "Headline 5 - A/B test variant with urgency/scarcity"
  ],
  
  "valuePropositions": [
    {
      "theme": "Primary value theme (e.g., Luxury, Innovation, Convenience)",
      "rationale": "One sentence explaining why this resonates based on over-index data",
      "priority": 1
    },
    {
      "theme": "Secondary value theme",
      "rationale": "Data-backed rationale",
      "priority": 2
    },
    {
      "theme": "Tertiary value theme",
      "rationale": "Supporting rationale",
      "priority": 3
    }
  ]
}

CRITICAL: Return ONLY the JSON object. No markdown, no explanations.`;
  }

  private formatGeographicContext(input: CampaignBriefInput): string {
    const hier = input.geographicHierarchy;
    if (!hier) return 'N/A';
    const parts = [];
    if (hier.city) parts.push(hier.city);
    if (hier.county) parts.push(hier.county);
    if (hier.state) parts.push(hier.state);
    if (hier.region) parts.push(hier.region);
    return parts.join(' > ');
  }

  private parseCampaignBriefResponse(responseText: string): Omit<CampaignBriefOutput, 'generatedAt'> {
    let parsed: any;
    
    // Strategy 1: Extract from code block
    const codeBlockMatch = responseText.match(/```json\s*(\{[\s\S]*\})\s*```/);
    if (codeBlockMatch?.[1]) {
      try {
        parsed = JSON.parse(codeBlockMatch[1]);
        console.log('✅ Parsed JSON from code block');
      } catch (e) {
        console.warn('⚠️  Code block parse failed');
      }
    }
    
    // Strategy 2: Extract first { to last }
    if (!parsed) {
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          parsed = JSON.parse(responseText.substring(firstBrace, lastBrace + 1));
          console.log('✅ Parsed JSON from brace extraction');
        } catch (e) {
          console.warn('⚠️  Brace extraction parse failed');
        }
      }
    }
    
    // Validate structure
    if (!parsed?.marketPersonaSummary || !parsed?.targetedHeadlines || !parsed?.valuePropositions) {
      throw new Error('Invalid AI response structure');
    }
    
    return {
      marketPersonaSummary: parsed.marketPersonaSummary,
      targetedHeadlines: Array.isArray(parsed.targetedHeadlines) ? parsed.targetedHeadlines.slice(0, 5) : [],
      valuePropositions: Array.isArray(parsed.valuePropositions) ? parsed.valuePropositions.slice(0, 3) : []
    };
  }

  /**
   * Generate high-fidelity ZIP code targeting clusters
   * Filters and ranks ZIPs based on market archetype
   */
  async getHighFidelityZipCluster(
    marketArchetype: string,
    parentMarket: string,
    geoLevel: GeographicLevel,
    targetSize: number = 500
  ): Promise<HighFidelityZipCluster> {
    console.log(`🎯 Generating high-fidelity ZIP cluster for ${parentMarket} (${marketArchetype})`);
    
    // Step 1: Get all ZIP codes
    const allZipData = await this.censusService.getAllCensusData();
    
    // Step 2: Filter to parent market
    let relevantZips = this.filterZipsToParentMarket(allZipData, parentMarket, geoLevel);
    
    console.log(`📍 Found ${relevantZips.length} ZIPs in parent market`);
    
    // Step 3: Base filter - top 1000 by population
    relevantZips = relevantZips
      .sort((a, b) => b.population - a.population)
      .slice(0, Math.min(1000, relevantZips.length));
    
    // Step 4: Apply exclusion filters (de-noising)
    relevantZips = relevantZips.filter(zip => {
      // Exclude low-population ZIPs
      if (zip.population < 500) return false;
      
      // Note: military and rentBurden fields may not exist in current data model
      // We'll skip those filters for now
      
      return true;
    });
    
    console.log(`🔍 ${relevantZips.length} ZIPs after filtering`);
    
    // Step 5: Calculate archetype-specific fidelity scores
    const scoredZips = relevantZips.map(zip => {
      const score = this.calculateArchetypeFidelityScore(zip, marketArchetype);
      return {
        zipData: zip,
        fidelityScore: score
      };
    });
    
    // Step 6: Sort by fidelity score and take top N
    const topZips = scoredZips
      .sort((a, b) => b.fidelityScore - a.fidelityScore)
      .slice(0, Math.min(targetSize, scoredZips.length));
    
    console.log(`✅ Selected top ${topZips.length} high-fidelity ZIPs`);
    
    // Step 7: Format output
    return {
      zipCodes: topZips.map(item => ({
        zipCode: item.zipData.zipCode,
        city: item.zipData.geography.city,
        state: item.zipData.geography.state,
        population: item.zipData.population,
        fidelityScore: Math.round(item.fidelityScore),
        keyMetrics: this.extractKeyMetrics(item.zipData, marketArchetype)
      })),
      clusterSize: topZips.length,
      archetype: marketArchetype,
      weightingStrategy: this.getWeightingStrategyDescription(marketArchetype)
    };
  }

  private filterZipsToParentMarket(
    allZips: CensusZipCodeData[],
    parentMarket: string,
    geoLevel: GeographicLevel
  ): CensusZipCodeData[] {
    switch (geoLevel) {
      case 'state':
        return allZips.filter(z => z.geography.state === parentMarket);
      case 'cbsa':
        return allZips.filter(z => z.geography.metroArea === parentMarket);
      case 'county':
        return allZips.filter(z => z.geography.county === parentMarket);
      case 'city':
        return allZips.filter(z => z.geography.city === parentMarket);
      case 'region':
        const regionStates = this.getStatesInRegion(parentMarket);
        return allZips.filter(z => regionStates.includes(z.geography.state));
      default:
        return allZips;
    }
  }

  private getStatesInRegion(region: string): string[] {
    const regionMap: { [key: string]: string[] } = {
      'Northeast': ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'Rhode Island', 'Vermont', 'New Jersey', 'New York', 'Pennsylvania'],
      'Midwest': ['Illinois', 'Indiana', 'Michigan', 'Ohio', 'Wisconsin', 'Iowa', 'Kansas', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
      'South': ['Delaware', 'Florida', 'Georgia', 'Maryland', 'North Carolina', 'South Carolina', 'Virginia', 'West Virginia', 'Alabama', 'Kentucky', 'Mississippi', 'Tennessee', 'Arkansas', 'Louisiana', 'Oklahoma', 'Texas'],
      'West': ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming', 'Alaska', 'California', 'Hawaii', 'Oregon', 'Washington']
    };
    return regionMap[region] || [];
  }

  private calculateArchetypeFidelityScore(
    zip: CensusZipCodeData,
    archetype: string
  ): number {
    const normalize = (value: number, min: number, max: number): number => {
      if (max === min) return 50;
      return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    };

    switch (archetype) {
      case 'Affluent College Town': {
        const gradEducation = zip.demographics.education.graduateDegree || 0;
        const income = zip.economics.householdIncome.median || 0;
        const ageOver65 = zip.demographics.ageDistribution.age65plus || 0;
        
        const eduScore = normalize(gradEducation, 0, 60);
        const incomeScore = normalize(income, 30000, 150000);
        const ageScore = 100 - normalize(ageOver65, 0, 40);
        
        return (eduScore * 0.4) + (incomeScore * 0.3) + (ageScore * 0.3);
      }
      
      case 'Suburban Family Market': {
        const familySize = zip.demographics.householdSize?.average || 0;
        const married = zip.demographics.lifestyle?.married || 0;
        const homeownership = zip.geography.housing.ownerOccupiedRate || 0;
        
        const familyScore = normalize(familySize, 2.0, 4.0);
        const marriedScore = normalize(married, 0, 80);
        const homeScore = normalize(homeownership, 0, 100);
        
        return (familyScore * 0.4) + (marriedScore * 0.3) + (homeScore * 0.3);
      }
      
      case 'Tech Hub': {
        const stemDegree = zip.demographics.lifestyle?.stemDegree || 0;
        const age20s = zip.demographics.ageCohorts?.age20s || 0;
        const sixFigure = zip.economics.householdIncome.sixFigurePercentage || 0;
        
        const stemScore = normalize(stemDegree, 0, 40);
        const ageScore = normalize(age20s, 0, 30);
        const incomeScore = normalize(sixFigure, 0, 50);
        
        return (stemScore * 0.45) + (ageScore * 0.35) + (incomeScore * 0.2);
      }
      
      case 'Retirement Destination': {
        const age65plus = zip.demographics.ageDistribution.age65plus || 0;
        const homeownership = zip.geography.housing.ownerOccupiedRate || 0;
        const income = zip.economics.householdIncome.median || 0;
        
        const ageScore = normalize(age65plus, 0, 50);
        const homeScore = normalize(homeownership, 0, 100);
        const incomeScore = normalize(income, 30000, 100000);
        
        return (ageScore * 0.5) + (homeScore * 0.3) + (incomeScore * 0.2);
      }
      
      case 'Urban Metro': {
        const education = zip.demographics.education.bachelorDegree + zip.demographics.education.graduateDegree;
        const age20s30s = (zip.demographics.ageCohorts?.age20s || 0) + (zip.demographics.ageCohorts?.age30s || 0);
        const homeownership = zip.geography.housing.ownerOccupiedRate || 0;
        
        const eduScore = normalize(education, 0, 60);
        const ageScore = normalize(age20s30s, 0, 50);
        const renterScore = 100 - normalize(homeownership, 0, 100); // Inverse for renters
        
        return (eduScore * 0.4) + (ageScore * 0.35) + (renterScore * 0.25);
      }
      
      case 'Young Professional Market': {
        const age20s30s = (zip.demographics.ageCohorts?.age20s || 0) + (zip.demographics.ageCohorts?.age30s || 0);
        const income = zip.economics.householdIncome.median || 0;
        const education = zip.demographics.education.bachelorDegree + zip.demographics.education.graduateDegree;
        
        const ageScore = normalize(age20s30s, 0, 50);
        const incomeScore = normalize(income, 40000, 100000);
        const eduScore = normalize(education, 0, 50);
        
        return (ageScore * 0.4) + (incomeScore * 0.35) + (eduScore * 0.25);
      }
      
      default: {
        // General market scoring (balanced)
        const income = zip.economics.householdIncome.median || 0;
        const education = zip.demographics.education.bachelorDegree + zip.demographics.education.graduateDegree;
        return (normalize(income, 30000, 100000) * 0.5) + (normalize(education, 0, 50) * 0.5);
      }
    }
  }

  private extractKeyMetrics(zip: CensusZipCodeData, archetype: string): { [key: string]: number } {
    const base = {
      medianIncome: zip.economics.householdIncome.median || 0,
      collegeEducated: (zip.demographics.education.bachelorDegree + zip.demographics.education.graduateDegree) || 0,
      medianAge: zip.demographics.ageMedian || 0
    };

    // Add archetype-specific metrics
    switch (archetype) {
      case 'Affluent College Town':
        return { ...base, graduateDegree: zip.demographics.education.graduateDegree || 0 };
      case 'Tech Hub':
        return { ...base, stemDegree: zip.demographics.lifestyle?.stemDegree || 0 };
      case 'Suburban Family Market':
        return { ...base, householdSize: zip.demographics.householdSize?.average || 0, homeownership: zip.geography.housing.ownerOccupiedRate || 0 };
      default:
        return base;
    }
  }

  private getWeightingStrategyDescription(archetype: string): string {
    const strategies: { [key: string]: string } = {
      'Affluent College Town': 'Graduate Education (40%), Median Income (30%), Youth Population (30%)',
      'Suburban Family Market': 'Family Size (40%), Married Rate (30%), Homeownership (30%)',
      'Tech Hub': 'STEM Degree (45%), Age 20s (35%), Six-Figure Income (20%)',
      'Retirement Destination': 'Age 65+ (50%), Homeownership (30%), Income (20%)',
      'Urban Metro': 'Education (40%), Youth Population (35%), Renter-Friendly (25%)',
      'Young Professional Market': 'Age 20s-30s (40%), Income (35%), Education (25%)',
      'Manufacturing Hub': 'Industrial Employment (45%), Income $45-70K (30%), Population (25%)',
      'Middle America': 'Balanced Income & Education (50/50)'
    };
    return strategies[archetype] || 'Balanced Income & Education (50/50)';
  }
}

