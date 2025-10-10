import { Deal } from '@/types/deal';

export const mockDeals: Deal[] = [
  {
    id: 'deal-001',
    dealName: 'Apple Partnership - iOS Integration',
    dealId: 'APPLE-001',
    description: 'Strategic partnership with Apple to integrate our advertising solutions into iOS apps, targeting premium mobile users.',
    targeting: 'Premium mobile users, iOS app users',
    environment: 'Production',
    mediaType: 'Mobile Display',
    flightDate: '2024-01-15',
    bidGuidance: '$2.50 - $3.00 CPM',
    createdBy: 'John Smith',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 'deal-002',
    dealName: 'Google AdSense Optimization',
    dealId: 'GOOGLE-002',
    description: 'Enhanced integration with Google AdSense to improve revenue per click and user experience.',
    targeting: 'Content creators, website owners',
    environment: 'Production',
    mediaType: 'Display',
    flightDate: '2024-02-01',
    bidGuidance: '$1.80 - $2.20 CPM',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-25T09:15:00Z',
    updatedAt: '2024-02-01T11:45:00Z'
  },
  {
    id: 'deal-003',
    dealName: 'Microsoft Azure Cloud Migration',
    dealId: 'MSFT-003',
    description: 'Migration of core infrastructure to Microsoft Azure for improved scalability and performance.',
    targeting: 'Enterprise clients, B2B customers',
    environment: 'Staging',
    mediaType: 'Video',
    flightDate: '2024-03-01',
    bidGuidance: '$3.50 - $4.00 CPM',
    createdBy: 'Mike Chen',
    createdAt: '2024-02-15T16:20:00Z',
    updatedAt: '2024-02-20T13:10:00Z'
  },
  {
    id: 'deal-004',
    dealName: 'Amazon AWS Data Analytics',
    dealId: 'AWS-004',
    description: 'Implementation of advanced data analytics using Amazon Web Services for better insights and reporting.',
    targeting: 'Data-driven marketers, analysts',
    environment: 'Production',
    mediaType: 'Native',
    flightDate: '2024-01-20',
    bidGuidance: '$2.00 - $2.50 CPM',
    createdBy: 'Emily Davis',
    createdAt: '2024-01-18T14:30:00Z',
    updatedAt: '2024-01-25T10:15:00Z'
  },
  {
    id: 'deal-005',
    dealName: 'Facebook Meta Advertising API',
    dealId: 'META-005',
    description: 'Integration with Facebook Meta advertising platform for enhanced social media advertising capabilities.',
    targeting: 'Social media users, Gen Z and Millennials',
    environment: 'Production',
    mediaType: 'Social',
    flightDate: '2023-11-01',
    bidGuidance: '$1.50 - $2.00 CPM',
    createdBy: 'Alex Rodriguez',
    createdAt: '2023-10-25T11:00:00Z',
    updatedAt: '2024-01-31T16:45:00Z'
  },
  {
    id: 'deal-006',
    dealName: 'Netflix Content Partnership',
    dealId: 'NFLX-006',
    description: 'Content distribution partnership with Netflix for premium video advertising opportunities.',
    targeting: 'Streaming audience, premium content viewers',
    environment: 'Production',
    mediaType: 'Video',
    flightDate: '2024-02-15',
    bidGuidance: '$4.00 - $5.00 CPM',
    createdBy: 'Lisa Wang',
    createdAt: '2024-02-10T13:45:00Z',
    updatedAt: '2024-02-15T09:30:00Z'
  },
  {
    id: 'deal-007',
    dealName: 'Spotify Audio Advertising',
    dealId: 'SPOT-007',
    description: 'Audio advertising integration with Spotify for music streaming platform monetization.',
    targeting: 'Music listeners, podcast audience',
    environment: 'Staging',
    mediaType: 'Audio',
    flightDate: '2024-04-01',
    bidGuidance: '$1.20 - $1.80 CPM',
    createdBy: 'David Kim',
    createdAt: '2024-03-05T15:20:00Z',
    updatedAt: '2024-03-10T12:00:00Z'
  },
  {
    id: 'deal-008',
    dealName: 'TikTok Short-Form Video Ads',
    dealId: 'TIKTOK-008',
    description: 'Short-form video advertising partnership with TikTok for Gen Z audience targeting.',
    targeting: 'Gen Z users, short-form video consumers',
    environment: 'Production',
    mediaType: 'Video',
    flightDate: '2024-01-01',
    bidGuidance: '$2.80 - $3.50 CPM',
    createdBy: 'Maria Garcia',
    createdAt: '2023-12-20T10:30:00Z',
    updatedAt: '2024-01-05T14:15:00Z'
  }
];

export const environments = [
  'Production',
  'Staging',
  'Development',
  'Testing'
];

export const mediaTypes = [
  'Display',
  'Video',
  'Mobile Display',
  'Native',
  'Social',
  'Audio',
  'Search'
];

export const targetingOptions = [
  'Premium mobile users',
  'Content creators',
  'Enterprise clients',
  'Data-driven marketers',
  'Social media users',
  'Streaming audience',
  'Music listeners',
  'Gen Z users'
];