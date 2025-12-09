import { AudienceInsights, GeoCard } from '@/types/deal';
import { MarketSizing } from '@/components/MarketSizingCard';

export const sampleAudienceInsights: AudienceInsights[] = [
  {
    id: 'sports-fans-ctv',
    audienceName: 'Sports Fans on CTV',
    demographics: {
      ageRange: '25-44',
      incomeRange: '$75k+',
      genderSplit: '65% Male, 35% Female',
      topLocations: ['California', 'Texas', 'Florida', 'New York']
    },
    behavior: {
      deviceUsage: {
        mobile: 45,
        desktop: 30,
        tablet: 25
      },
      peakHours: ['7-9 PM EST', 'Weekend afternoons'],
      purchaseFrequency: 'Monthly',
      avgOrderValue: '$89'
    },
    insights: {
      keyCharacteristics: [
        'High engagement with live sports content',
        'Tech-savvy early adopters',
        'Premium brand preferences'
      ],
      interests: ['Sports', 'Technology', 'Entertainment'],
      painPoints: ['Ad fatigue', 'Content discovery']
    },
    sampleData: true
  },
  {
    id: 'new-parents',
    audienceName: 'New Parents',
    demographics: {
      ageRange: '25-35',
      incomeRange: '$50k-$100k',
      genderSplit: '60% Female, 40% Male',
      topLocations: ['Suburban areas', 'Major metros']
    },
    behavior: {
      deviceUsage: {
        mobile: 70,
        desktop: 20,
        tablet: 10
      },
      peakHours: ['9-11 PM', 'Early morning'],
      purchaseFrequency: 'Weekly',
      avgOrderValue: '$45'
    },
    insights: {
      keyCharacteristics: [
        'Research-heavy purchasing behavior',
        'Value safety and quality over price',
        'Time-constrained decision making'
      ],
      interests: ['Parenting', 'Health', 'Safety'],
      painPoints: ['Time constraints', 'Information overload']
    },
    sampleData: true
  }
];

export const sampleMarketSizing: MarketSizing[] = [
  {
    id: 'college-students',
    marketName: 'College Students Market',
    totalMarketSize: '$19.4B',
    growthRate: '+12% YoY',
    addressableMarket: '42% addressable',
    addressableValue: '$8.2B',
    demographics: {
      population: '19.4M students',
      targetAge: '18-24 year olds',
      penetration: '89% mobile-first'
    },
    growthTrends: {
      growthRate: '+8% YoY',
      seasonality: 'Peak in Q1 & Q4',
      keyOpportunities: ['Digital adoption', 'Streaming growth', 'Mobile-first behavior']
    },
    marketInsights: {
      keyDrivers: ['Digital adoption', 'Streaming growth', 'Mobile-first behavior'],
      barriers: ['Limited disposable income', 'Ad fatigue', 'Short attention spans'],
      opportunities: ['Graduate students', 'International students', 'Community colleges']
    },
    sampleData: true
  },
  {
    id: 'pet-owners',
    marketName: 'Pet Owners Market',
    totalMarketSize: '$123.6B',
    growthRate: '+15% YoY',
    addressableMarket: '37% addressable',
    addressableValue: '$45.2B',
    demographics: {
      population: '70% of households',
      targetAge: 'Pet owners 25-55',
      penetration: '67% online shoppers'
    },
    growthTrends: {
      growthRate: '+18% YoY',
      seasonality: 'Holiday spikes, summer peak',
      keyOpportunities: ['Premiumization', 'E-commerce growth', 'Subscription models']
    },
    marketInsights: {
      keyDrivers: ['Premiumization', 'E-commerce growth', 'Humanization of pets'],
      barriers: ['Price sensitivity', 'Brand loyalty', 'Seasonal spending'],
      opportunities: ['Senior pet owners', 'First-time owners', 'Pet-specific social media']
    },
    sampleData: true
  }
];

export const sampleGeoCards: GeoCard[] = [
  {
    id: 'geo-1',
    audienceName: 'Tech Professionals',
    topMarkets: [
      { region: 'San Francisco Bay Area', percentage: '23%' },
      { region: 'Seattle Metro', percentage: '18%' },
      { region: 'Austin, TX', percentage: '12%' },
      { region: 'New York Metro', percentage: '11%' }
    ],
    insights: [
      'Highest concentration in major tech hubs',
      'Strong presence in secondary tech cities',
      'Remote work driving suburban expansion',
      'High disposable income in target areas'
    ],
    totalAddressable: '2.3M professionals',
    sampleData: true
  },
  {
    id: 'geo-2',
    audienceName: 'New Parents',
    topMarkets: [
      { region: 'Suburban areas nationwide', percentage: '35%' },
      { region: 'California suburbs', percentage: '15%' },
      { region: 'Texas suburbs', percentage: '12%' },
      { region: 'Florida suburbs', percentage: '10%' }
    ],
    insights: [
      'Concentrated in family-friendly suburbs',
      'Strong presence in warm weather states',
      'Growing in mid-size cities',
      'High engagement in community-focused areas'
    ],
    totalAddressable: '4.1M households',
    sampleData: true
  }
];
