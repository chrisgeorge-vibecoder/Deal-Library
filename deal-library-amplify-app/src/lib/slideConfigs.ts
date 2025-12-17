import { SlideData } from '@/components/slides/SlideView';
import { 
  Award, Target, MessageSquare, Volume2, Users, Lightbulb, 
  TrendingUp, BarChart3, Building2, MapPin, Newspaper, 
  FileText, Calendar, DollarSign, Smartphone, Globe, AlertTriangle,
  LucideIcon
} from 'lucide-react';
import { BrandStrategy, CompanyProfile, CompetitiveIntelligence, ContentStrategy, MarketingSWOT, MarketingNews, Persona, GeoCard } from '@/types/deal';

// ============================================
// UTILITY: Split list items across multiple slides
// Max 3-4 items per slide to avoid overflow
// ============================================
const MAX_LIST_ITEMS_PER_SLIDE = 3;

interface ListSlideConfig {
  baseId: string;
  title: string;
  icon: LucideIcon;
  accentColor: string;
  header?: string;
  items: Array<{ title?: string; content: string; tag?: string; tagColor?: string }>;
  numbered?: boolean;
}

function generatePaginatedListSlides(config: ListSlideConfig): SlideData[] {
  const { baseId, title, icon, accentColor, header, items, numbered } = config;
  
  if (items.length <= MAX_LIST_ITEMS_PER_SLIDE) {
    // Single slide is enough
    return [{
      id: baseId,
      title,
      type: 'list',
      content: {
        title,
        icon,
        accentColor,
        header,
        items,
        numbered
      }
    }];
  }
  
  // Split across multiple slides
  const slides: SlideData[] = [];
  const totalPages = Math.ceil(items.length / MAX_LIST_ITEMS_PER_SLIDE);
  
  for (let page = 0; page < totalPages; page++) {
    const startIdx = page * MAX_LIST_ITEMS_PER_SLIDE;
    const pageItems = items.slice(startIdx, startIdx + MAX_LIST_ITEMS_PER_SLIDE);
    const isFirstPage = page === 0;
    const pageLabel = totalPages > 1 ? ` (${page + 1}/${totalPages})` : '';
    
    slides.push({
      id: `${baseId}-${page + 1}`,
      title: `${title}${pageLabel}`,
      type: 'list',
      content: {
        title: `${title}${pageLabel}`,
        icon,
        accentColor,
        header: isFirstPage ? header : undefined,
        items: pageItems,
        numbered
      }
    });
  }
  
  return slides;
}

// ============================================
// 1. BRAND STRATEGY CARD - 7 slides (expanded)
// ============================================
export function generateBrandStrategySlides(data: BrandStrategy): SlideData[] {
  return [
    // Slide 1: Title
    {
      id: 'brand-title',
      title: 'Brand Strategy Overview',
      type: 'title',
      content: {
        title: `Brand Strategy: ${data.brandOrCategory}`,
        subtitle: data.positioning?.targetPosition || 'Comprehensive brand positioning and messaging framework',
        category: 'Brand Strategy',
        icon: Award,
        accentColor: '#7C3AED', // Purple
      }
    },
    // Slide 2: Brand Positioning
    {
      id: 'brand-positioning',
      title: 'Brand Positioning',
      type: 'two-column',
      content: {
        title: 'Brand Positioning',
        icon: Target,
        accentColor: '#1E40AF',
        leftColumn: {
          title: 'Current Perception',
          content: data.positioning?.currentPerception || 'Not specified',
          type: 'text'
        },
        rightColumn: {
          title: 'Target Position',
          content: data.positioning?.targetPosition || 'Not specified',
          type: 'text'
        }
      }
    },
    // Slide 3: Key Differentiators (NEW)
    {
      id: 'brand-differentiators',
      title: 'Key Differentiators',
      type: 'list',
      content: {
        title: 'Key Differentiators',
        icon: Award,
        accentColor: '#8B5CF6',
        header: 'What sets this brand apart from competitors',
        items: (data.positioning?.differentiators || []).map((diff: string) => ({
          content: diff
        })),
        numbered: false
      }
    },
    // Slide 4: Core Message & Proof Points (enhanced)
    {
      id: 'brand-message',
      title: 'Messaging Framework',
      type: 'two-column',
      content: {
        title: 'Messaging Framework',
        icon: MessageSquare,
        accentColor: '#059669',
        leftColumn: {
          title: 'Core Message',
          content: data.messagingFramework?.coreMessage || 'Not specified',
          type: 'text'
        },
        rightColumn: {
          title: 'Supporting Messages',
          items: data.messagingFramework?.supportingMessages || [],
          type: 'bullets'
        }
      }
    },
    // Slide 5: Proof Points (NEW)
    {
      id: 'brand-proofpoints',
      title: 'Proof Points',
      type: 'list',
      content: {
        title: 'Proof Points',
        icon: Target,
        accentColor: '#3B82F6',
        header: 'Evidence that supports brand claims',
        items: (data.messagingFramework?.proofPoints || []).map((point: string) => ({
          content: point
        })),
        numbered: true
      }
    },
    // Slide 6: Brand Voice & Tone (enhanced with tone attributes)
    {
      id: 'brand-voice',
      title: 'Brand Voice & Tone',
      type: 'two-column',
      content: {
        title: `Brand Voice & Tone`,
        icon: Volume2,
        accentColor: '#22C55E',
        leftColumn: {
          title: "Do's",
          items: data.brandVoice?.dosDonts?.dos || [],
          type: 'do'
        },
        rightColumn: {
          title: "Don'ts",
          items: data.brandVoice?.dosDonts?.donts || [],
          type: 'dont'
        }
      }
    },
    // Slide 7: Strategic Recommendations
    {
      id: 'brand-recommendations',
      title: 'Strategic Recommendations',
      type: 'list',
      content: {
        title: 'Strategic Recommendations',
        icon: Award,
        accentColor: '#7C3AED',
        items: (data.strategicRecommendations || []).map((rec: string) => ({
          content: rec
        })),
        numbered: true
      }
    }
  ];
}

// ============================================
// 2. AUDIENCE PERSONA CARD - 5 slides (expanded)
// ============================================
export function generatePersonaSlides(data: Persona): SlideData[] {
  return [
    // Slide 1: Persona Overview
    {
      id: 'persona-overview',
      title: 'Persona Overview',
      type: 'title',
      content: {
        title: `${data.emoji || '👤'} ${data.name}`,
        subtitle: data.coreInsight || '',
        category: data.category || 'Audience Persona',
        icon: Users,
        accentColor: '#6366F1',
        stats: [
          { label: 'Available Deals', value: String(data.dealCount || 0) }
        ]
      }
    },
    // Slide 2: Core Insight
    {
      id: 'persona-insight',
      title: 'Core Insight',
      type: 'two-column',
      content: {
        title: 'Persona Insights',
        icon: Lightbulb,
        accentColor: '#F59E0B',
        leftColumn: {
          title: 'Core Insight',
          content: data.coreInsight || 'No insight available',
          type: 'text'
        },
        rightColumn: {
          title: 'Category',
          content: `This persona falls under the ${data.category || 'general'} category with ${data.dealCount || 0} relevant advertising deals available.`,
          type: 'text'
        }
      }
    },
    // Slide 3: Creative Hooks (NEW - shows all hooks)
    {
      id: 'persona-hooks',
      title: 'Creative Hooks',
      type: 'list',
      content: {
        title: 'Creative Hooks & Messaging',
        icon: MessageSquare,
        accentColor: '#8B5CF6',
        header: 'Messaging angles to connect with this audience',
        items: (data.creativeHooks || []).map((hook: string, index: number) => ({
          title: `Hook ${index + 1}`,
          content: hook
        })),
        numbered: true
      }
    },
    // Slide 4: Media Targeting Strategy
    {
      id: 'persona-targeting',
      title: 'Media Targeting',
      type: 'list',
      content: {
        title: 'Media Targeting Strategy',
        icon: Target,
        accentColor: '#6366F1',
        header: 'How to reach this audience effectively',
        items: data.mediaTargeting ? [{
          content: data.mediaTargeting
        }] : [],
        numbered: false
      }
    },
    // Slide 5: Activation Summary (NEW)
    {
      id: 'persona-activation',
      title: 'Activation Summary',
      type: 'grid',
      content: {
        title: 'Quick Activation Guide',
        icon: TrendingUp,
        accentColor: '#22C55E',
        columns: 2,
        items: [
          { label: 'Persona Name', value: data.name || 'Not specified' },
          { label: 'Category', value: data.category || 'Not specified' },
          { label: 'Deal Opportunities', value: `${data.dealCount || 0} deals available` },
          { label: 'Key Hook', value: data.creativeHooks?.[0]?.slice(0, 80) + '...' || 'See creative hooks slide' }
        ]
      }
    }
  ];
}

// ============================================
// 3. AUDIENCE INSIGHTS CARD - 5 slides
// ============================================
export function generateAudienceInsightsSlides(data: any): SlideData[] {
  return [
    // Slide 1: Title
    {
      id: 'audience-title',
      title: 'Audience Overview',
      type: 'title',
      content: {
        title: data.audienceName || 'Audience Insights',
        subtitle: 'Comprehensive audience analysis and behavioral insights',
        category: 'Audience Insights',
        icon: Users,
        accentColor: '#3B82F6'
      }
    },
    // Slide 2: Demographics
    {
      id: 'audience-demographics',
      title: 'Demographics',
      type: 'grid',
      content: {
        title: 'Demographics',
        icon: Users,
        accentColor: '#3B82F6',
        columns: 2,
        items: [
          { label: 'Age Range', value: data.demographics?.ageRange || 'N/A' },
          { label: 'Income Range', value: data.demographics?.incomeRange || 'N/A' },
          { label: 'Gender Split', value: data.demographics?.genderSplit || 'N/A' },
          { label: 'Top Locations', value: (data.demographics?.topLocations || []).join(', ') || 'N/A' }
        ]
      }
    },
    // Slide 3: Behavior Patterns
    {
      id: 'audience-behavior',
      title: 'Behavior Patterns',
      type: 'stats',
      content: {
        title: 'Behavior Patterns',
        icon: TrendingUp,
        accentColor: '#22C55E',
        stats: [
          { 
            label: 'Mobile', 
            value: `${data.behavior?.deviceUsage?.mobile || 0}%`,
            icon: Smartphone,
            color: '#3B82F6'
          },
          { 
            label: 'Desktop', 
            value: `${data.behavior?.deviceUsage?.desktop || 0}%`,
            color: '#6B7280'
          },
          { 
            label: 'Tablet', 
            value: `${data.behavior?.deviceUsage?.tablet || 0}%`,
            color: '#8B5CF6'
          }
        ],
        summary: `Peak Hours: ${Array.isArray(data.behavior?.peakHours) ? data.behavior.peakHours.join(', ') : data.behavior?.peakHours || 'N/A'} | Frequency: ${data.behavior?.purchaseFrequency || 'N/A'}`
      }
    },
    // Slide 4: Key Insights
    {
      id: 'audience-insights',
      title: 'Key Insights',
      type: 'two-column',
      content: {
        title: 'Key Insights',
        icon: Lightbulb,
        accentColor: '#F59E0B',
        leftColumn: {
          title: 'Key Characteristics',
          items: data.insights?.keyCharacteristics || [],
          type: 'bullets'
        },
        rightColumn: {
          title: 'Pain Points',
          items: data.insights?.painPoints || [],
          type: 'bullets'
        }
      }
    },
    // Slide 5: Media Strategy
    {
      id: 'audience-media',
      title: 'Media Strategy',
      type: 'grid',
      content: {
        title: 'Media Strategy',
        icon: Target,
        accentColor: '#6366F1',
        columns: 2,
        items: [
          { label: 'Preferred Channels', value: (data.mediaStrategy?.preferredChannels || []).join(', ') || 'N/A' },
          { label: 'Optimal Timing', value: (data.mediaStrategy?.optimalTiming || []).join(', ') || 'N/A' },
          { label: 'Creative Formats', value: (data.mediaStrategy?.creativeFormats || []).join(', ') || 'N/A' },
          { label: 'Targeting Approach', value: data.mediaStrategy?.targetingApproach || 'N/A' }
        ]
      }
    }
  ];
}

// ============================================
// 4. MARKET INTELLIGENCE CARD - 4 slides
// ============================================
export function generateMarketSizingSlides(data: any): SlideData[] {
  return [
    // Slide 1: Market Overview
    {
      id: 'market-overview',
      title: 'Market Overview',
      type: 'title',
      content: {
        title: data.marketName || 'Market Intelligence',
        subtitle: `Total Market Size: ${data.totalMarketSize || 'N/A'}`,
        category: 'Market Intelligence',
        icon: BarChart3,
        accentColor: '#059669',
        stats: [
          { label: 'Growth Rate', value: data.growthRate || 'N/A' },
          { label: 'Addressable Market', value: data.addressableValue || 'N/A' }
        ]
      }
    },
    // Slide 2: Demographics & TAM
    {
      id: 'market-demographics',
      title: 'Demographics & TAM',
      type: 'grid',
      content: {
        title: 'Market Demographics',
        icon: Users,
        accentColor: '#3B82F6',
        columns: 2,
        items: [
          { label: 'Population', value: data.demographics?.population || 'N/A' },
          { label: 'Target Age', value: data.demographics?.targetAge || 'N/A' },
          { label: 'Penetration', value: data.demographics?.penetration || 'N/A' },
          { label: 'Addressable Market', value: data.addressableMarket || 'N/A' }
        ]
      }
    },
    // Slide 3: Growth Trends
    {
      id: 'market-trends',
      title: 'Growth Trends',
      type: 'list',
      content: {
        title: 'Growth Trends',
        icon: TrendingUp,
        accentColor: '#22C55E',
        header: `Growth Rate: ${data.growthTrends?.growthRate || 'N/A'} YoY | Seasonality: ${data.growthTrends?.seasonality || 'N/A'}`,
        items: (data.growthTrends?.keyOpportunities || []).map((opp: string) => ({
          title: 'Opportunity',
          content: opp
        })),
        numbered: true
      }
    },
    // Slide 4: Market Insights (3-column)
    {
      id: 'market-insights',
      title: 'Market Insights',
      type: 'grid',
      content: {
        title: 'Market Insights',
        icon: Lightbulb,
        accentColor: '#F59E0B',
        columns: 3,
        items: [
          ...(data.marketInsights?.keyDrivers || []).slice(0, 2).map((d: string) => ({ 
            label: 'Driver', 
            value: d,
            color: '#22C55E'
          })),
          ...(data.marketInsights?.barriers || []).slice(0, 2).map((b: string) => ({ 
            label: 'Barrier', 
            value: b,
            color: '#EF4444'
          })),
          ...(data.marketInsights?.opportunities || []).slice(0, 2).map((o: string) => ({ 
            label: 'Opportunity', 
            value: o,
            color: '#3B82F6'
          }))
        ]
      }
    }
  ];
}

// ============================================
// 5. COMPANY PROFILE CARD - 5 slides
// ============================================
export function generateCompanyProfileSlides(data: CompanyProfile): SlideData[] {
  return [
    // Slide 1: Company Overview
    {
      id: 'company-overview',
      title: 'Company Overview',
      type: 'title',
      content: {
        title: `${data.companyInfo?.name || 'Company'} (${data.stockSymbol || 'N/A'})`,
        subtitle: data.companyInfo?.sector || '',
        category: 'Company Profile',
        icon: Building2,
        accentColor: '#3B82F6',
        stats: [
          { label: 'Market Cap', value: data.companyInfo?.marketCap || 'N/A' },
          { label: 'Stock Price', value: data.companyInfo?.recentPrice || 'N/A' },
          { label: 'Recommendation', value: data.investmentOutlook?.recommendation || 'N/A' }
        ]
      }
    },
    // Slide 2: Recent Performance
    {
      id: 'company-performance',
      title: 'Recent Performance',
      type: 'stats',
      content: {
        title: 'Recent Performance',
        icon: TrendingUp,
        accentColor: '#22C55E',
        summary: data.recentPerformance?.executiveSummary || '',
        stats: (data.recentPerformance?.keyMetrics || []).map((metric: any) => ({
          label: metric.metric,
          value: metric.value,
          trend: metric.trend as 'up' | 'down' | 'neutral',
          color: metric.trend === 'positive' ? '#22C55E' : metric.trend === 'negative' ? '#EF4444' : '#6B7280'
        }))
      }
    },
    // Slide 3: Competitive Analysis
    {
      id: 'company-competitive',
      title: 'Competitive Analysis',
      type: 'list',
      content: {
        title: 'Competitive Analysis',
        icon: Target,
        accentColor: '#6366F1',
        header: `Market Share: ${data.competitiveAnalysis?.marketShare || 'N/A'} | ${data.competitiveAnalysis?.competitivePosition || ''}`,
        items: (data.competitiveAnalysis?.mainCompetitors || []).map((comp: any) => ({
          title: comp.name,
          content: comp.strength
        })),
        numbered: false
      }
    },
    // Slide 4: Growth Opportunities
    {
      id: 'company-growth',
      title: 'Growth Opportunities',
      type: 'list',
      content: {
        title: 'Growth Opportunities',
        icon: DollarSign,
        accentColor: '#059669',
        items: (data.growthOpportunities || []).map((opp: any) => ({
          title: opp.opportunity,
          content: opp.potential
        })),
        numbered: true
      }
    },
    // Slide 5: Investment Outlook
    {
      id: 'company-outlook',
      title: 'Investment Outlook',
      type: 'two-column',
      content: {
        title: 'Investment Outlook',
        icon: BarChart3,
        accentColor: '#3B82F6',
        leftColumn: {
          title: 'Strengths',
          items: data.investmentOutlook?.strengths || [],
          type: 'do'
        },
        rightColumn: {
          title: 'Risks',
          items: data.investmentOutlook?.risks || [],
          type: 'dont'
        }
      }
    }
  ];
}

// ============================================
// 6. COMPETITIVE INTELLIGENCE CARD - 4 slides
// ============================================
export function generateCompetitiveIntelSlides(data: CompetitiveIntelligence): SlideData[] {
  return [
    // Slide 1: Competitive Landscape
    {
      id: 'competitive-overview',
      title: 'Competitive Landscape',
      type: 'title',
      content: {
        title: `Competitive Intelligence: ${data.competitorOrIndustry || 'Industry Analysis'}`,
        subtitle: data.competitiveAnalysis?.marketPositioning || '',
        category: 'Competitive Intelligence',
        icon: Target,
        accentColor: '#7C3AED'
      }
    },
    // Slide 2: Main Competitors
    {
      id: 'competitive-competitors',
      title: 'Main Competitors',
      type: 'list',
      content: {
        title: 'Main Competitors',
        icon: Users,
        accentColor: '#3B82F6',
        items: (data.competitiveAnalysis?.mainCompetitors || []).map((comp: any) => ({
          title: comp.name,
          content: `${comp.positioning}. Key strengths: ${(comp.keyStrengths || []).join(', ')}`
        })),
        twoColumn: true
      }
    },
    // Slide 3: Messaging Analysis
    {
      id: 'competitive-messaging',
      title: 'Messaging Analysis',
      type: 'two-column',
      content: {
        title: 'Messaging Analysis',
        icon: MessageSquare,
        accentColor: '#F59E0B',
        leftColumn: {
          title: 'Common Themes',
          items: data.messagingAnalysis?.commonThemes || [],
          type: 'bullets'
        },
        rightColumn: {
          title: 'Messaging Gaps',
          items: data.messagingAnalysis?.messagingGaps || [],
          type: 'bullets'
        }
      }
    },
    // Slide 4: Strategic Recommendations
    {
      id: 'competitive-recommendations',
      title: 'Strategic Recommendations',
      type: 'grid',
      content: {
        title: 'Strategic Recommendations',
        icon: TrendingUp,
        accentColor: '#22C55E',
        columns: 3,
        items: [
          ...(data.strategicRecommendations?.positioning || []).slice(0, 1).map((r: string) => ({
            label: 'Positioning',
            value: r,
            color: '#3B82F6'
          })),
          ...(data.strategicRecommendations?.messaging || []).slice(0, 1).map((r: string) => ({
            label: 'Messaging',
            value: r,
            color: '#8B5CF6'
          })),
          ...(data.strategicRecommendations?.channels || []).slice(0, 1).map((r: string) => ({
            label: 'Channels',
            value: r,
            color: '#22C55E'
          }))
        ]
      }
    }
  ];
}

// ============================================
// 7. CONTENT STRATEGY CARD - 4 slides
// ============================================
export function generateContentStrategySlides(data: ContentStrategy): SlideData[] {
  return [
    // Slide 1: Overview & Trending Topics
    {
      id: 'content-overview',
      title: 'Content Strategy Overview',
      type: 'title',
      content: {
        title: `Content Strategy: ${data.industryOrTopic || 'Industry'}`,
        subtitle: 'Content planning and strategic recommendations',
        category: 'Content Strategy',
        icon: FileText,
        accentColor: '#8B5CF6'
      }
    },
    // Slide 2: Content Recommendations
    {
      id: 'content-recommendations',
      title: 'Content Recommendations',
      type: 'list',
      content: {
        title: 'Content Recommendations',
        icon: Target,
        accentColor: '#3B82F6',
        header: `Frequency: ${data.contentRecommendations?.frequency || 'N/A'} | Platforms: ${(data.contentRecommendations?.platforms || []).join(', ')}`,
        items: (data.contentRecommendations?.formats || []).map((format: any) => ({
          title: format.format,
          content: format.rationale,
          tag: format.priority,
          tagColor: format.priority === 'High' ? '#EF4444' : format.priority === 'Medium' ? '#F59E0B' : '#22C55E'
        })),
        numbered: false
      }
    },
    // Slide 3: SEO Opportunities
    {
      id: 'content-seo',
      title: 'SEO Opportunities',
      type: 'two-column',
      content: {
        title: 'SEO Opportunities',
        icon: TrendingUp,
        accentColor: '#22C55E',
        leftColumn: {
          title: 'Target Keywords',
          items: data.seoOpportunities?.keywords || [],
          type: 'bullets'
        },
        rightColumn: {
          title: 'Content Gaps',
          items: data.seoOpportunities?.contentGaps || [],
          type: 'bullets'
        }
      }
    },
    // Slide 4: Editorial Calendar
    {
      id: 'content-calendar',
      title: 'Editorial Calendar',
      type: 'list',
      content: {
        title: 'Editorial Calendar',
        icon: Calendar,
        accentColor: '#8B5CF6',
        items: (data.editorialCalendar || []).map((entry: any) => ({
          title: entry.timeframe,
          content: `Themes: ${(entry.themes || []).join(', ')} | Ideas: ${(entry.contentIdeas || []).slice(0, 2).join(', ')}`
        })),
        numbered: false
      }
    }
  ];
}

// ============================================
// 8. MARKETING SWOT CARD - 3 slides
// ============================================
export function generateMarketingSWOTSlides(data: MarketingSWOT): SlideData[] {
  return [
    // Slide 1: Strategic Summary
    {
      id: 'swot-summary',
      title: 'Strategic Summary',
      type: 'title',
      content: {
        title: `Marketing SWOT: ${data.companyName || 'Company'}`,
        subtitle: data.summary || '',
        category: 'Marketing SWOT',
        icon: Target,
        accentColor: '#6366F1'
      }
    },
    // Slide 2: SWOT Matrix
    {
      id: 'swot-matrix',
      title: 'SWOT Matrix',
      type: 'swot',
      content: {
        companyName: data.companyName,
        strengths: data.swot?.strengths || [],
        weaknesses: data.swot?.weaknesses || [],
        opportunities: data.swot?.opportunities || [],
        threats: data.swot?.threats || []
      }
    },
    // Slide 3: Recommended Actions
    {
      id: 'swot-actions',
      title: 'Recommended Actions',
      type: 'list',
      content: {
        title: 'Recommended Actions',
        icon: TrendingUp,
        accentColor: '#059669',
        items: (data.recommendedActions || []).map((action: string) => ({
          content: action
        })),
        numbered: true
      }
    }
  ];
}

// ============================================
// 9. GEO INSIGHTS CARD - 4 slides
// ============================================
export function generateGeoInsightsSlides(data: GeoCard): SlideData[] {
  return [
    // Slide 1: Geographic Overview
    {
      id: 'geo-overview',
      title: 'Geographic Overview',
      type: 'title',
      content: {
        title: `Geo Insights: ${data.audienceName || 'Geographic Analysis'}`,
        subtitle: `Total Addressable Market: ${data.totalAddressable || 'N/A'}`,
        category: 'Geo Insights',
        icon: MapPin,
        accentColor: '#3B82F6'
      }
    },
    // Slide 2: Top Markets
    {
      id: 'geo-markets',
      title: 'Top Markets',
      type: 'table',
      content: {
        title: 'Top Markets',
        icon: TrendingUp,
        accentColor: '#22C55E',
        headers: ['Region', 'Percentage', 'Status'],
        rows: (data.topMarkets || []).map((market: any, index: number) => ({
          cells: [market.region, market.percentage, index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Tertiary'],
          highlight: index === 0,
          tag: index === 0 ? 'Top' : undefined,
          tagColor: '#22C55E'
        }))
      }
    },
    // Slide 3: Demographics & Market Characteristics
    {
      id: 'geo-demographics',
      title: 'Demographics & Market',
      type: 'grid',
      content: {
        title: 'Demographics & Market Characteristics',
        icon: Users,
        accentColor: '#6366F1',
        columns: 2,
        items: [
          { label: 'Population', value: (data as any).demographics?.population || 'N/A' },
          { label: 'Median Age', value: String(data.demographics?.medianAge || 'N/A') },
          { label: 'Median Income', value: String(data.demographics?.medianIncome || 'N/A') },
          { label: 'Urban/Rural', value: (data as any).demographics?.urbanRuralSplit || 'N/A' }
        ]
      }
    },
    // Slide 4: Advertising Opportunities
    {
      id: 'geo-advertising',
      title: 'Advertising Opportunities',
      type: 'grid',
      content: {
        title: 'Advertising Opportunities',
        icon: Target,
        accentColor: '#F59E0B',
        columns: 2,
        items: [
          { label: 'Optimal Channels', value: (data.advertisingOpportunities?.optimalChannels || []).join(', ') || 'N/A' },
          { label: 'Peak Engagement', value: (data.advertisingOpportunities?.peakEngagement || []).join(', ') || 'N/A' },
          { label: 'Creative Considerations', value: (data.advertisingOpportunities?.creativeConsiderations || []).join(', ') || 'N/A' },
          { label: 'Budget Recommendations', value: data.advertisingOpportunities?.budgetRecommendations || 'N/A' }
        ]
      }
    }
  ];
}

// ============================================
// 10. MARKETING NEWS CARD - 4 slides (expanded)
// ============================================
export function generateMarketingNewsSlides(data: MarketingNews): SlideData[] {
  return [
    // Slide 1: Headline
    {
      id: 'news-headline',
      title: 'News Headline',
      type: 'title',
      content: {
        title: data.headline || 'Marketing News',
        subtitle: '',
        category: data.source || 'Marketing News',
        icon: Newspaper,
        accentColor: '#EF4444',
        footer: data.publishDate ? new Date(data.publishDate).toLocaleDateString('en-US', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        }) : ''
      }
    },
    // Slide 2: Summary (NEW)
    {
      id: 'news-summary',
      title: 'Article Summary',
      type: 'list',
      content: {
        title: 'Article Summary',
        icon: FileText,
        accentColor: '#3B82F6',
        header: data.synopsis || 'No summary available',
        items: [],
        numbered: false
      }
    },
    // Slide 3: Key Insights
    {
      id: 'news-insights',
      title: 'Key Insights',
      type: 'list',
      content: {
        title: 'Key Insights',
        icon: Lightbulb,
        accentColor: '#F59E0B',
        items: (data.keyInsights || []).map((insight: string) => ({
          content: insight
        })),
        numbered: true
      }
    },
    // Slide 4: Companies & Implications (NEW)
    {
      id: 'news-companies',
      title: 'Companies & Implications',
      type: 'grid',
      content: {
        title: 'Companies Mentioned & Market Implications',
        icon: Building2,
        accentColor: '#6366F1',
        columns: 2,
        items: [
          { 
            label: 'Companies Involved', 
            value: (data.companies || []).length > 0 ? data.companies.join(', ') : 'No companies mentioned'
          },
          { 
            label: 'Source', 
            value: data.source || 'Unknown source'
          },
          { 
            label: 'Publication Date', 
            value: data.publishDate ? new Date(data.publishDate).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'short', day: 'numeric' 
            }) : 'Date not available'
          },
          { 
            label: 'Key Takeaway', 
            value: data.keyInsights?.[0]?.slice(0, 100) + '...' || 'See insights slide'
          }
        ]
      }
    }
  ];
}

// ============================================
// 11. CAMPAIGN BRIEF CARD - dynamic slides (paginated)
// ============================================
export function generateCampaignBriefSlides(data: any): SlideData[] {
  const brief = data;
  
  const slides: SlideData[] = [
    // Slide 1: Title
    {
      id: 'brief-title',
      title: 'Campaign Brief Overview',
      type: 'title',
      content: {
        title: `Campaign Brief: ${brief.marketName || 'Market'}`,
        subtitle: brief.marketPersonaSummary?.substring(0, 100) + '...' || 'AI-Generated Campaign Strategy',
        category: 'Campaign Brief',
        icon: Target,
        accentColor: '#D4A853', // brand-gold
        stats: [
          { label: 'Headlines', value: String(brief.targetedHeadlines?.length || 0) },
          { label: 'Value Props', value: String(brief.valuePropositions?.length || 0) }
        ]
      }
    },
    // Slide 2: Target Audience Persona
    {
      id: 'brief-persona',
      title: 'Target Audience',
      type: 'list',
      content: {
        title: 'Target Audience Persona',
        icon: Users,
        accentColor: '#3B82F6', // blue
        header: brief.marketPersonaSummary || '',
        items: [],
        numbered: false
      }
    }
  ];
  
  // Headlines - paginated if more than 3
  const headlineItems = (brief.targetedHeadlines || []).map((headline: string, index: number) => ({
    title: `Variant ${index + 1}`,
    content: headline
  }));
  
  slides.push(...generatePaginatedListSlides({
    baseId: 'brief-headlines',
    title: 'Targeted Headlines',
    icon: MessageSquare,
    accentColor: '#8B5CF6',
    header: 'A/B test ready campaign headline variations',
    items: headlineItems,
    numbered: true
  }));
  
  // Value Propositions - paginated if more than 3
  const vpItems = (brief.valuePropositions || [])
    .sort((a: any, b: any) => a.priority - b.priority)
    .map((vp: any) => ({
      title: `${vp.priority === 1 ? 'Primary' : vp.priority === 2 ? 'Secondary' : 'Tertiary'}: ${vp.theme}`,
      content: vp.rationale
    }));
  
  slides.push(...generatePaginatedListSlides({
    baseId: 'brief-value-props',
    title: 'Value Propositions',
    icon: TrendingUp,
    accentColor: '#22C55E',
    header: 'Prioritized messaging themes',
    items: vpItems,
    numbered: false
  }));
  
  return slides;
}

// ============================================
// 12. MARKET PROFILE CARD - dynamic slides (paginated)
// ============================================
export function generateMarketProfileSlides(data: any): SlideData[] {
  const profile = data;
  
  // Get top strengths and concerns from strategic snapshot
  const strengths = profile.strategicSnapshot?.topStrengths || [];
  const concerns = profile.strategicSnapshot?.bottomConcerns || [];
  
  // Group attributes by category
  const attributesByCategory = (profile.attributes || []).reduce((acc: any, attr: any) => {
    if (!acc[attr.category]) {
      acc[attr.category] = [];
    }
    acc[attr.category].push(attr);
    return acc;
  }, {} as Record<string, any[]>);
  
  const slides: SlideData[] = [
    // Slide 1: Market Overview Title
    {
      id: 'market-title',
      title: 'Market Overview',
      type: 'title',
      content: {
        title: profile.name || 'Market Profile',
        subtitle: profile.strategicSnapshot?.archetype || `${profile.geoLevel?.toUpperCase() || 'Market'} Analysis`,
        category: 'U.S. Market Insights',
        icon: MapPin,
        accentColor: '#D4A853', // brand-gold
        stats: [
          { label: 'Population', value: profile.population?.toLocaleString() || 'N/A' },
          { label: 'Geographic Level', value: profile.geoLevel?.toUpperCase() || 'N/A' }
        ]
      }
    }
  ];
  
  // Market Strengths - paginated if more than 3
  const strengthItems = strengths.map((s: any) => ({
    title: s.name,
    content: `${s.formattedValue} (${s.percentDifference > 0 ? '+' : ''}${s.percentDifference?.toFixed(1)}% vs national)`
  }));
  
  slides.push(...generatePaginatedListSlides({
    baseId: 'market-strengths',
    title: 'Top Market Strengths',
    icon: TrendingUp,
    accentColor: '#22C55E',
    header: 'Attributes where this market exceeds national averages',
    items: strengthItems,
    numbered: true
  }));
  
  // Key Considerations - paginated if more than 3
  const concernItems = concerns.map((c: any) => ({
    title: c.name,
    content: `${c.formattedValue} (${c.percentDifference > 0 ? '+' : ''}${c.percentDifference?.toFixed(1)}% vs national)`
  }));
  
  slides.push(...generatePaginatedListSlides({
    baseId: 'market-considerations',
    title: 'Areas Below National Average',
    icon: AlertTriangle,
    accentColor: '#EF4444',
    header: 'Attributes to consider when targeting this market',
    items: concernItems,
    numbered: true
  }));
  
  // Demographics Grid - max 6 items (2 columns x 3 rows)
  slides.push({
    id: 'market-demographics',
    title: 'Demographics',
    type: 'grid',
    content: {
      title: 'Key Demographics',
      icon: Users,
      accentColor: '#3B82F6',
      columns: 2,
      items: (attributesByCategory['Demographics'] || []).slice(0, 6).map((attr: any) => ({
        label: attr.name,
        value: attr.formattedValue,
        subtext: attr.percentDifference !== undefined ? `${attr.percentDifference > 0 ? '+' : ''}${attr.percentDifference.toFixed(1)}% vs US` : undefined
      }))
    }
  });
  
  // Similar Markets - max 5 rows
  slides.push({
    id: 'market-similar',
    title: 'Similar Markets',
    type: 'table',
    content: {
      title: 'Similar Markets',
      icon: MapPin,
      accentColor: '#8B5CF6',
      headers: ['Market', 'Population', 'Match Score'],
      rows: (profile.similarMarkets || []).slice(0, 6).map((sm: any, index: number) => ({
        cells: [sm.name, sm.population?.toLocaleString() || 'N/A', `${sm.similarityScore}%`],
        highlight: index === 0,
        tag: index === 0 ? 'Best Match' : undefined,
        tagColor: '#8B5CF6'
      }))
    }
  });
  
  return slides;
}

// ============================================
// MASTER GENERATOR - Routes to correct function
// ============================================
export type CardType = 
  | 'brand-strategy' 
  | 'persona' 
  | 'audience-insights' 
  | 'market-sizing' 
  | 'company-profile' 
  | 'competitive-intelligence' 
  | 'content-strategy' 
  | 'marketing-swot' 
  | 'geo-cards' 
  | 'marketing-news'
  | 'market-profile'
  | 'campaign-brief';

export function generateSlides(cardType: CardType, data: any): SlideData[] {
  switch (cardType) {
    case 'brand-strategy':
      return generateBrandStrategySlides(data);
    case 'persona':
      return generatePersonaSlides(data);
    case 'audience-insights':
      return generateAudienceInsightsSlides(data);
    case 'market-sizing':
      return generateMarketSizingSlides(data);
    case 'company-profile':
      return generateCompanyProfileSlides(data);
    case 'competitive-intelligence':
      return generateCompetitiveIntelSlides(data);
    case 'content-strategy':
      return generateContentStrategySlides(data);
    case 'marketing-swot':
      return generateMarketingSWOTSlides(data);
    case 'geo-cards':
      return generateGeoInsightsSlides(data);
    case 'marketing-news':
      return generateMarketingNewsSlides(data);
    case 'market-profile':
      return generateMarketProfileSlides(data);
    case 'campaign-brief':
      return generateCampaignBriefSlides(data);
    default:
      return [];
  }
}

