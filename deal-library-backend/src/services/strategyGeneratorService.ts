/**
 * Strategy Generator Service
 * Generates strategic marketing recommendations including:
 * - Competitor analysis
 * - Market tier recommendations  
 * - Budget pacing by phase
 * - Dayparting recommendations
 * - Differentiation strategies
 */

import { ParsedBrief } from '../types/agentMode';

export interface CompetitorAnalysis {
  competitors: string[];
  differentiators: string[];
}

export interface MarketTiers {
  tier1: string[];
  tier2: string[];
  rationale: string;
}

export interface BudgetPhase {
  name: string;
  percentage: number;
  budget: string;
  focus: string;
  duration: string;
}

export interface BudgetPacing {
  phases: BudgetPhase[];
  totalBudget: string;
}

export interface Dayparting {
  optimal: string[];
  rationale: string;
}

export class StrategyGeneratorService {
  
  /**
   * Generate competitor analysis based on industry/products
   */
  generateCompetitorAnalysis(brief: ParsedBrief): CompetitorAnalysis {
    const industry = this.detectIndustry(brief);
    const products = brief.keyProducts || [];
    const context = brief.additionalContext?.toLowerCase() || '';
    
    console.log(`🏢 Generating competitor analysis for ${industry}`);
    
    // Industry-specific competitor databases
    const competitorMap: Record<string, string[]> = {
      'electronics': [
        'Bose (premium audio leader, mass-market appeal)',
        'Bang & Olufsen (ultra-premium, design-focused)',
        'Apple HomePod (ecosystem integration, Siri-powered)',
        'Amazon Echo Studio (affordable smart audio)',
        'JBL (value-oriented audio solutions)',
        'Sonos (multi-room pioneer, seamless integration)'
      ],
      'coffee': [
        'Blue Bottle Coffee (Nestlé-owned, premium positioning)',
        'Trade Coffee (subscription marketplace)',
        'La Colombe (premium cafe + retail)',
        'Intelligentsia (specialty roaster)',
        'Counter Culture (direct trade pioneer)'
      ],
      'fitness': [
        'Peloton (connected fitness)',
        'ClassPass (multi-studio membership)',
        'Barry\'s Bootcamp (HIIT workouts)',
        'F45 Training (functional training)',
        'Orangetheory (science-backed workouts)'
      ],
      'food_delivery': [
        'DoorDash (market leader)',
        'Uber Eats (ride-share advantage)',
        'Grubhub (restaurant partnerships)',
        'Postmates (rapid delivery)'
      ],
      'beauty': [
        'Sephora (beauty retail leader)',
        'Ulta Beauty (mass + prestige)',
        'Blue Mercury (luxury beauty)',
        'Glossier (direct-to-consumer)'
      ],
      'pet_care': [
        'Chewy (online pet supplies)',
        'Petco (omnichannel retail)',
        'PetSmart (in-store experience)',
        'BarkBox (subscription boxes)'
      ]
    };
    
    const competitors = competitorMap[industry] || [
      'Industry leaders with established brand recognition',
      'Digital-first competitors with strong online presence',
      'Traditional players expanding into digital channels'
    ];
    
    const differentiators = this.generateDifferentiators(industry, products, context);
    
    return { competitors, differentiators };
  }
  
  /**
   * Generate differentiation strategies
   */
  private generateDifferentiators(
    industry: string,
    products: string[] = [],
    context: string = ''
  ): string[] {
    const diffs: string[] = [];
    
    // Check for premium positioning
    const hasPremium = products.some(p => 
      /premium|specialty|artisan|craft|luxury/i.test(p)
    ) || context.includes('premium') || context.includes('quality');
    
    // Check for subscription model
    const hasSubscription = products.some(p => 
      /subscription|recurring|membership/i.test(p)
    );
    
    // Check for ethical/sustainable focus
    const hasEthical = products.some(p => 
      /ethical|sustainable|organic|fair.?trade/i.test(p)
    ) || context.includes('sustainab') || context.includes('ethical') || context.includes('environment');
    
    // Check for digital/tech focus
    const hasDigital = context.includes('digital') || context.includes('technology') || context.includes('ai');
    
    // Generate differentiators based on positioning
    if (hasPremium && hasEthical) {
      diffs.push('**Transparency:** Show full farm-to-cup/source-to-shelf journey with traceability');
      diffs.push('**Sustainability:** Go beyond certifications with specific environmental impact metrics');
    } else if (hasPremium) {
      diffs.push('**Quality guarantee:** Transparent sourcing and production process');
      diffs.push('**Expert curation:** Professional selection and quality control');
    }
    
    if (hasSubscription) {
      diffs.push('**Flexibility:** Easy pause, skip, or cancel - no commitment pressure');
      diffs.push('**Customization:** AI-powered or quiz-based personalization');
    }
    
    if (hasDigital) {
      diffs.push('**Technology:** Leverage AI/ML for personalized recommendations');
      diffs.push('**Data-driven:** Use customer insights to continuously improve experience');
    }
    
    if (hasEthical) {
      diffs.push('**Community:** Build subscriber community around shared values');
      diffs.push('**Impact reporting:** Show customers the real-world impact of their purchases');
    }
    
    // Industry-specific differentiators
    if (industry === 'electronics') {
      diffs.push('**Seamless Integration:** Works with all major streaming services and smart home platforms');
      diffs.push('**Room-by-room control:** Individual zones with synchronized or independent playback');
      diffs.push('**Sound quality:** Trueplay tuning technology adapts to room acoustics automatically');
      diffs.push('**Ecosystem flexibility:** No locked-in platforms - Apple Music, Spotify, any service works');
    } else if (industry === 'coffee') {
      if (!diffs.some(d => d.includes('Customization'))) {
        diffs.push('**Taste matching:** Quiz-based profile to match customers with perfect beans');
      }
      diffs.push('**Education:** Brewing guides, origin stories, and coffee culture content');
    } else if (industry === 'fitness') {
      diffs.push('**Community:** Social features, challenges, and group accountability');
      diffs.push('**Results tracking:** Data visualization and progress analytics');
    } else if (industry === 'beauty') {
      diffs.push('**Personalization:** Skin/hair analysis and customized product recommendations');
      diffs.push('**Education:** Tutorials, ingredient transparency, and expert advice');
    }
    
    // Default differentiators if none found
    if (diffs.length === 0) {
      diffs.push('**Customer experience:** Exceptional service and attention to detail');
      diffs.push('**Value proposition:** Clear differentiation through quality or price');
      diffs.push('**Brand story:** Authentic narrative that resonates with target audience');
    }
    
    return diffs;
  }
  
  /**
   * Generate market tier recommendations
   */
  generateMarketTiers(brief: ParsedBrief): MarketTiers {
    const industry = this.detectIndustry(brief);
    const geoFocus = brief.geographicFocus?.toLowerCase() || '';
    
    console.log(`🗺️ Generating market tiers for ${industry}`);
    
    const tierMaps: Record<string, MarketTiers> = {
      'electronics': {
        tier1: ['San Francisco', 'Seattle', 'New York City', 'Los Angeles', 'Boston', 'Austin', 'Chicago', 'San Jose'],
        tier2: ['Denver', 'Portland', 'San Diego', 'Washington DC', 'Minneapolis', 'Atlanta', 'Dallas'],
        rationale: 'Tech-forward demographics, high household income, early adopter mentality, and strong smart home adoption rates'
      },
      'coffee': {
        tier1: ['Seattle', 'Portland', 'San Francisco', 'New York City', 'Chicago', 'Boston', 'Austin', 'Los Angeles'],
        tier2: ['Denver', 'Minneapolis', 'Washington DC', 'Philadelphia', 'San Diego', 'Nashville', 'Boulder'],
        rationale: 'High specialty coffee culture penetration, premium spending power, and sustainability-conscious demographics'
      },
      'fitness': {
        tier1: ['Los Angeles', 'New York City', 'Miami', 'San Francisco', 'Chicago', 'Boston', 'Seattle', 'Denver'],
        tier2: ['Austin', 'San Diego', 'Portland', 'Nashville', 'Atlanta', 'Dallas', 'Phoenix'],
        rationale: 'Health-conscious demographics, boutique fitness adoption, and strong outdoor/active lifestyle culture'
      },
      'beauty': {
        tier1: ['New York City', 'Los Angeles', 'Miami', 'San Francisco', 'Chicago', 'Dallas', 'Atlanta'],
        tier2: ['Seattle', 'Boston', 'Austin', 'Phoenix', 'San Diego', 'Denver', 'Charlotte'],
        rationale: 'High beauty spending, influencer concentration, and fashion-forward demographics'
      },
      'pet_care': {
        tier1: ['San Francisco', 'Seattle', 'Portland', 'Austin', 'Denver', 'Boston', 'San Diego'],
        tier2: ['Minneapolis', 'Nashville', 'Raleigh', 'Salt Lake City', 'Madison', 'Boulder'],
        rationale: 'High pet ownership rates, premium pet spending, and treat-pets-as-family culture'
      },
      'food_delivery': {
        tier1: ['New York City', 'Los Angeles', 'San Francisco', 'Chicago', 'Washington DC', 'Boston', 'Seattle'],
        tier2: ['Austin', 'Denver', 'Philadelphia', 'Atlanta', 'Miami', 'Portland', 'Minneapolis'],
        rationale: 'High population density, young professional demographics, and established delivery infrastructure'
      }
    };
    
    // Default tiers if industry not found
    const defaultTiers: MarketTiers = {
      tier1: ['New York City', 'Los Angeles', 'Chicago', 'San Francisco', 'Boston', 'Seattle'],
      tier2: ['Austin', 'Denver', 'Washington DC', 'Philadelphia', 'Atlanta', 'Portland'],
      rationale: 'Major metropolitan areas with high population density, affluent demographics, and strong digital adoption'
    };
    
    const tiers = tierMaps[industry] || defaultTiers;
    
    // Filter based on geographic focus if specified
    if (geoFocus && !geoFocus.includes('national')) {
      if (geoFocus.includes('northeast') || geoFocus.includes('east coast')) {
        tiers.tier1 = tiers.tier1.filter(c => 
          ['New York City', 'Boston', 'Philadelphia', 'Washington DC'].includes(c)
        );
        tiers.tier2 = tiers.tier2.filter(c => 
          ['Philadelphia', 'Baltimore', 'Pittsburgh', 'Charlotte'].includes(c)
        );
      } else if (geoFocus.includes('west coast')) {
        tiers.tier1 = tiers.tier1.filter(c => 
          ['Los Angeles', 'San Francisco', 'Seattle', 'San Diego', 'Portland'].includes(c)
        );
        tiers.tier2 = tiers.tier2.filter(c => 
          ['San Diego', 'Portland', 'Sacramento', 'San Jose'].includes(c)
        );
      }
    }
    
    return tiers;
  }
  
  /**
   * Generate budget pacing recommendations
   */
  generateBudgetPacing(brief: ParsedBrief): BudgetPacing {
    const totalBudget = brief.budgetRange || '$250K-$500K';
    const timeline = brief.timeline || '90 days';
    const objectives = brief.campaignObjectives || [];
    
    console.log(`💰 Generating budget pacing for ${totalBudget} over ${timeline}`);
    
    // Analyze objectives to determine pacing
    const hasAwareness = objectives.some(o => /awareness|brand/i.test(o));
    const hasSales = objectives.some(o => /sales|conversion|revenue|drive/i.test(o));
    const hasLaunch = objectives.some(o => /launch|introduce/i.test(o));
    const hasEngagement = objectives.some(o => /engagement|community/i.test(o));
    
    // Determine pacing strategy
    let pacing = { awareness: 40, consideration: 35, conversion: 25 };
    
    if (hasLaunch) {
      // Product launch needs heavy awareness upfront
      pacing = { awareness: 50, consideration: 30, conversion: 20 };
    } else if (hasAwareness && !hasSales) {
      // Pure awareness campaign
      pacing = { awareness: 60, consideration: 30, conversion: 10 };
    } else if (hasSales && !hasAwareness) {
      // Performance/sales focused
      pacing = { awareness: 20, consideration: 30, conversion: 50 };
    } else if (hasEngagement) {
      // Engagement/community building
      pacing = { awareness: 35, consideration: 40, conversion: 25 };
    }
    
    // Parse budget
    const budgetNum = this.parseBudgetString(totalBudget);
    const budgetMid = budgetNum; // Use midpoint if range
    
    // Parse timeline
    const days = this.parseTimelineDays(timeline);
    
    const phases: BudgetPhase[] = [
      {
        name: 'Phase 1 - Awareness',
        percentage: pacing.awareness,
        budget: this.formatBudget(budgetMid * pacing.awareness / 100),
        focus: 'Heavy media weight to build awareness. Focus on reach over frequency. Creative: Brand story, product benefits, category education.',
        duration: `Days 1-${Math.floor(days * 0.33)}`
      },
      {
        name: 'Phase 2 - Consideration',
        percentage: pacing.consideration,
        budget: this.formatBudget(budgetMid * pacing.consideration / 100),
        focus: 'Shift to middle-funnel tactics. Retarget engaged users. Creative: Product details, customer testimonials, comparison content.',
        duration: `Days ${Math.floor(days * 0.33) + 1}-${Math.floor(days * 0.67)}`
      },
      {
        name: 'Phase 3 - Conversion',
        percentage: pacing.conversion,
        budget: this.formatBudget(budgetMid * pacing.conversion / 100),
        focus: 'Performance-focused optimization. Heavy retargeting of site visitors. Creative: Limited-time offers, urgency messaging, social proof.',
        duration: `Days ${Math.floor(days * 0.67) + 1}-${days}`
      }
    ];
    
    return {
      phases,
      totalBudget: this.formatBudget(budgetMid)
    };
  }
  
  /**
   * Generate dayparting recommendations
   */
  generateDayparting(brief: ParsedBrief): Dayparting {
    const industry = this.detectIndustry(brief);
    const audiences = brief.targetAudiences || [];
    
    console.log(`⏰ Generating dayparting for ${industry}`);
    
    const daypartMap: Record<string, Dayparting> = {
      'electronics': {
        optimal: ['7-10pm (evening research)', 'Weekend afternoons (12-5pm)', 'Lunch hours (12-2pm)'],
        rationale: 'Premium electronics purchases involve extended research and comparison shopping. Evening leisure time for deep product evaluation, weekends for in-depth consideration and partner discussions, lunch breaks for initial discovery and wishlist building.'
      },
      'coffee': {
        optimal: ['6-10am (morning routine)', '2-4pm (afternoon pick-me-up)', 'Weekend mornings'],
        rationale: 'Peak coffee consumption and purchase intent during morning hours and mid-afternoon. Weekend morning leisure browsing provides secondary opportunity.'
      },
      'fitness': {
        optimal: ['5-8am (morning workout)', '5-8pm (evening workout)', 'Weekend afternoons'],
        rationale: 'Gym-goers planning workouts during commute times and lunch breaks. Evening planning for next-day workouts. Weekend = longer decision-making windows.'
      },
      'food_delivery': {
        optimal: ['11am-1pm (lunch)', '5-8pm (dinner)', 'Weekend evenings'],
        rationale: 'Meal time purchase intent peaks. Weekend evenings capture leisure dining and social occasions.'
      },
      'beauty': {
        optimal: ['7-9pm (evening routine)', 'Lunch hours (12-2pm)', 'Weekend afternoons'],
        rationale: 'Evening skincare routine prompts research. Lunch break browsing. Weekend = extended consideration time for beauty purchases.'
      },
      'pet_care': {
        optimal: ['7-9am (morning routine)', '6-9pm (evening)', 'Weekend days'],
        rationale: 'Pet care planning during daily routines. Evening research after work. Weekends = shopping and planning time.'
      },
      'subscription': {
        optimal: ['Lunch hours (12-2pm)', '8-10pm (evening leisure)', 'Sunday evenings'],
        rationale: 'Lunch break browsing and evening couch-time research. Sunday = planning/decision-making for week ahead.'
      }
    };
    
    // Check for professional audiences - adjust timing
    const hasProfessional = audiences.some(a => 
      /professional|business|office|executive|manager/i.test(a)
    );
    
    if (hasProfessional && !daypartMap[industry]) {
      return {
        optimal: ['7-9am (morning commute)', '12-2pm (lunch break)', '5-7pm (evening commute)'],
        rationale: 'Professional audiences engage during commute times and lunch breaks when planning personal purchases.'
      };
    }
    
    // Default dayparting
    return daypartMap[industry] || {
      optimal: ['9am-12pm (morning productivity)', '7-10pm (evening leisure)', 'Weekend afternoons'],
      rationale: 'General high-engagement periods across demographics. Morning = active browsing, evening = leisure consideration, weekends = extended research time.'
    };
  }
  
  /**
   * Detect industry from brief
   */
  private detectIndustry(brief: ParsedBrief): string {
    const allText = `${brief.targetAudiences?.join(' ') || ''} ${brief.keyProducts?.join(' ') || ''} ${brief.additionalContext || ''}`.toLowerCase();
    
    // Electronics/Audio (check first - more specific)
    if (allText.includes('speaker') || allText.includes('audio') || allText.includes('sound') || 
        allText.includes('electronics') || allText.includes('sonos') || allText.includes('bose') ||
        allText.includes('home audio') || allText.includes('soundbar') || allText.includes('smart speaker')) {
      return 'electronics';
    }
    
    if (allText.includes('coffee') || allText.includes('cafe') || allText.includes('bean')) return 'coffee';
    if (allText.includes('fitness') || allText.includes('gym') || allText.includes('workout') || allText.includes('exercise')) return 'fitness';
    if (allText.includes('food delivery') || allText.includes('restaurant') || allText.includes('meal delivery')) return 'food_delivery';
    if (allText.includes('beauty') || allText.includes('cosmetic') || allText.includes('skincare') || allText.includes('makeup')) return 'beauty';
    if (allText.includes('pet') || allText.includes('dog') || allText.includes('cat')) return 'pet_care';
    if (allText.includes('subscription') || allText.includes('recurring')) return 'subscription';
    
    return 'general';
  }
  
  /**
   * Parse budget string to number
   */
  private parseBudgetString(budget: string): number {
    // Handle ranges like "$250K-$500K" - return midpoint
    const rangeMatch = budget.match(/\$?([\d,]+)([kKmM])?.*?\$?([\d,]+)([kKmM])?/);
    if (rangeMatch && rangeMatch[3]) {
      const low = this.parseAmount(rangeMatch[1] || '250', rangeMatch[2]);
      const high = this.parseAmount(rangeMatch[3] || '500', rangeMatch[4]);
      return (low + high) / 2;
    }
    
    // Handle single amount like "$250K" or "$1M+"
    const match = budget.match(/\$?([\d,]+)([kKmM])?/);
    if (!match || !match[1]) return 250000; // Default
    
    return this.parseAmount(match[1], match[2]);
  }
  
  private parseAmount(numStr: string, multiplier?: string): number {
    let num = parseInt(numStr.replace(/,/g, ''));
    if (multiplier?.toLowerCase() === 'k') num *= 1000;
    if (multiplier?.toLowerCase() === 'm') num *= 1000000;
    return num;
  }
  
  /**
   * Parse timeline to days
   */
  private parseTimelineDays(timeline: string): number {
    const lower = timeline.toLowerCase();
    
    // Check for specific day count
    const dayMatch = lower.match(/(\d+)\s*days?/);
    if (dayMatch && dayMatch[1]) return parseInt(dayMatch[1]);
    
    // Check for weeks
    const weekMatch = lower.match(/(\d+)\s*weeks?/);
    if (weekMatch && weekMatch[1]) return parseInt(weekMatch[1]) * 7;
    
    // Check for months
    const monthMatch = lower.match(/(\d+)\s*months?/);
    if (monthMatch && monthMatch[1]) return parseInt(monthMatch[1]) * 30;
    
    // Check for quarters
    if (lower.includes('q1') || lower.includes('q2') || lower.includes('q3') || lower.includes('q4')) {
      return 90;
    }
    
    // Default to 90 days
    return 90;
  }
  
  /**
   * Format budget number to string
   */
  private formatBudget(amount: number): string {
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      return `$${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
    }
    if (amount >= 1000) {
      const thousands = amount / 1000;
      return `$${thousands % 1 === 0 ? thousands : thousands.toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  }
}

