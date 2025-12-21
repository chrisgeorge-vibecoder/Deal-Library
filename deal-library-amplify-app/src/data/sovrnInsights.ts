// Sovrn Insights Data Store
// Pre-loaded marketing insights from Commerce Audience + Census Data analysis

export interface SovrnInsight {
  id: string;
  headline: string;
  didYouKnow: string;
  marketingImplication: string;
  category: InsightCategory;
  tags: string[];
  featured?: boolean;
}

export type InsightCategory = 
  | 'Consumer Profiles'
  | 'Lifestyle & Values'
  | 'Geographic Markets'
  | 'Data Discoveries';

export const CATEGORY_COLORS: Record<InsightCategory, { bg: string; text: string; border: string }> = {
  'Consumer Profiles': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  'Lifestyle & Values': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  'Geographic Markets': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300' },
  'Data Discoveries': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
};

export const CATEGORY_ICONS: Record<InsightCategory, string> = {
  'Consumer Profiles': '👤',
  'Lifestyle & Values': '💡',
  'Geographic Markets': '🗺️',
  'Data Discoveries': '🔍',
};

export const sovrnInsights: SovrnInsight[] = [
  // LUXURY & AFFLUENT DISTRICTS INSIGHTS (2025 Launchpad Data)
  // America's Top 10 Wealth ZIP Codes Analysis
  {
    id: 'luxury-1',
    headline: 'Fisher Island: America\'s $11.9M Secret',
    didYouKnow: 'ZIP code 33109 (Fisher Island, FL) commands a median home sale price of $11.9M+—making it America\'s most expensive address. This ultra-exclusive island is accessible only by private ferry or helicopter, creating a natural moat for the ultra-wealthy. Fisher Island\'s median home price is 168x the US national median of $71K.',
    marketingImplication: 'Targeting Fisher Island requires concierge-level personalization. Mass advertising fails here—think private banking, yacht services, and invitation-only experiences.',
    category: 'Geographic Markets',
    tags: ['luxury', 'ultra-wealthy', 'florida', 'exclusive', 'UHNW'],
    featured: true,
  },
  {
    id: 'luxury-2',
    headline: 'The California Wealth Corridor: 5 of 10 Top ZIP Codes',
    didYouKnow: 'California dominates America\'s most affluent addresses, claiming 5 of the top 10 luxury ZIP codes: Atherton (94027, $8.3M), Newport Beach (92661, $5.7M), Montecito (93108, $5.2M), Stinson Beach (94970, $5.2M), and Newport Coast (92657, $5.1M). The combined median home value of these 5 ZIPs exceeds $29M.',
    marketingImplication: 'California\'s wealthy cluster geographically. A concentrated luxury media strategy across NorCal (Atherton/Stinson Beach) and SoCal (Newport/Montecito) corridors maximizes reach to high-net-worth audiences.',
    category: 'Geographic Markets',
    tags: ['california', 'luxury', 'real-estate', 'regional', 'wealth-corridor'],
    featured: true,
  },
  {
    id: 'luxury-3',
    headline: 'The Hamptons Premium: New York\'s $11.4M Address Pair',
    didYouKnow: 'The Hamptons (Long Island) boasts two back-to-back entries in America\'s top 10 luxury ZIPs: Sagaponack (11962, $5.9M) and Water Mill (11976, $5.5M). Combined, these neighboring ZIP codes represent $11.4M in median home value—and less than 5 miles of oceanfront real estate.',
    marketingImplication: 'Hamptons luxury buyers cluster in micro-markets. Hyper-local targeting within 5-mile radiuses outperforms broader "New York luxury" campaigns.',
    category: 'Geographic Markets',
    tags: ['hamptons', 'new-york', 'luxury', 'oceanfront', 'micro-markets'],
  },
  {
    id: 'luxury-4',
    headline: 'Beverly Hills 90210: America\'s Most Famous—Not Most Expensive',
    didYouKnow: 'Despite its global fame, Beverly Hills (90210) ranks only 9th in America\'s most expensive ZIP codes at $4.0M median home price. Fisher Island\'s median is nearly 3x higher at $11.9M. Brand recognition doesn\'t equal wealth concentration—Atherton residents are twice as wealthy on average.',
    marketingImplication: 'Celebrity-driven markets like Beverly Hills attract aspirational wealth, while "hidden" wealth centers like Atherton and Fisher Island concentrate actual purchasing power. Target both, but with different messaging.',
    category: 'Data Discoveries',
    tags: ['beverly-hills', 'celebrity', 'aspirational', 'wealth', 'brand'],
    featured: true,
  },
  {
    id: 'luxury-5',
    headline: 'Lower Manhattan: The $2.7M Urban Outlier',
    didYouKnow: 'ZIP code 10007 (Lower Manhattan) is the only urban high-rise district in America\'s top 10 luxury ZIPs—and at $2.7M median, it\'s the "most affordable" on the list. Every other top-10 ZIP is a low-density, single-family enclave. Manhattan wealth lives vertically; everywhere else, it sprawls.',
    marketingImplication: 'Urban luxury buyers value convenience and walkability over square footage. Marketing luxury products to Manhattan 10007 should emphasize efficiency, access, and vertical living—not acreage or estates.',
    category: 'Consumer Profiles',
    tags: ['manhattan', 'urban', 'vertical-living', 'finance', 'luxury'],
  },
  {
    id: 'luxury-6',
    headline: 'The $5M Sweet Spot: Where Most Luxury Lives',
    didYouKnow: 'Six of America\'s top 10 luxury ZIP codes cluster between $5.1M and $5.9M median home prices: Sagaponack, Newport Beach, Water Mill, Montecito, Stinson Beach, and Newport Coast. This $5M "sweet spot" represents the threshold where ultra-high-net-worth households concentrate before the $8M+ ultra-elite tier.',
    marketingImplication: 'The $5M-$6M home price band is where luxury marketing scales. Below $4M is aspirational affluent; above $8M is ultra-bespoke. Target the $5M sweet spot for luxury brand reach at scale.',
    category: 'Data Discoveries',
    tags: ['wealth-tiers', 'luxury', 'market-segmentation', 'UHNW', 'targeting'],
  },
  {
    id: 'luxury-7',
    headline: 'Silicon Valley\'s Stealth Wealth: Atherton\'s $8.3M Average',
    didYouKnow: 'Atherton (94027) in Silicon Valley has a median home price of $8.3M—making it America\'s 2nd most expensive ZIP. Unlike flashy celebrity enclaves, Atherton has no sidewalks, no commercial districts, and actively discourages development. Tech billionaires and venture capitalists choose invisibility over visibility.',
    marketingImplication: 'Silicon Valley wealth responds to privacy, exclusivity, and understatement. Luxury brands targeting tech money should lead with discretion and bespoke service, not status symbols.',
    category: 'Lifestyle & Values',
    tags: ['silicon-valley', 'tech-wealth', 'stealth-wealth', 'privacy', 'atherton'],
    featured: true,
  },
  {
    id: 'luxury-8',
    headline: 'Coastal Premium: 9 of 10 Top ZIPs Touch Water',
    didYouKnow: '90% of America\'s most affluent ZIP codes are waterfront properties: Fisher Island (Atlantic), Atherton (near SF Bay), Sagaponack & Water Mill (Atlantic), Newport Beach & Newport Coast (Pacific), Montecito (Pacific), Stinson Beach (Pacific), and Lower Manhattan (Hudson/East Rivers). Only Beverly Hills lacks direct water access.',
    marketingImplication: 'Water adjacency is the ultimate wealth marker. Luxury brands should incorporate coastal, maritime, and waterfront themes—sailing, yachting, beachfront leisure—into creative targeting affluent audiences.',
    category: 'Lifestyle & Values',
    tags: ['coastal', 'waterfront', 'maritime', 'luxury-lifestyle', 'real-estate'],
  },
  {
    id: 'luxury-9',
    headline: 'The 3-State Luxury Lock: FL, CA, NY Control America\'s Wealth',
    didYouKnow: 'Just three states—Florida, California, and New York—contain 100% of America\'s top 10 most expensive ZIP codes. California leads with 5 ZIPs, New York has 3 (Hamptons + Manhattan), and Florida has 1 (Fisher Island at #1). No other state cracks the $2.7M+ median home price threshold.',
    marketingImplication: 'National luxury campaigns can achieve 90%+ UHNW reach by focusing exclusively on FL, CA, and NY media markets. Concentrate budgets in these three states for maximum ROI on affluent targeting.',
    category: 'Geographic Markets',
    tags: ['geographic-targeting', 'luxury', 'three-state', 'media-planning', 'UHNW'],
  },
  {
    id: 'luxury-10',
    headline: 'The $40M Question: Top 10 ZIPs Total $64M in Median Value',
    didYouKnow: 'The combined median home value of America\'s top 10 luxury ZIP codes totals $64.3M. The top 3 ZIPs alone (Fisher Island, Atherton, Sagaponack) account for $26.1M—over 40% of the total. Wealth concentration accelerates exponentially at the top; the #1 ZIP is worth 4.4x more than #10.',
    marketingImplication: 'Luxury market segmentation must account for exponential wealth gaps. The messaging, products, and price points that work in Beverly Hills (#9) won\'t resonate in Fisher Island (#1). Create tiered luxury strategies.',
    category: 'Data Discoveries',
    tags: ['wealth-concentration', 'market-tiers', 'luxury', 'segmentation', 'ultra-wealth'],
  },

  // COMMERCE AUDIENCE + CENSUS DATA INSIGHTS
  // Income & Wealth Insights (1-4)
  {
    id: 'income-1',
    headline: 'The Fireplace Shopper Paradox',
    didYouKnow: 'Fireplace shoppers are the highest-earning e-commerce audience at $92,892 median income (+10% vs national average)—but only 58.5% are homeowners (vs. 65% national). These are affluent renters in luxury apartments with gas fireplaces, not rural cabin owners.',
    marketingImplication: 'Position gas/electric fireplaces as urban luxury amenities, not traditional home features.',
    category: 'Consumer Profiles',
    tags: ['fireplace', 'luxury', 'renters', 'urban', 'affluent'],
    featured: true,
  },
  {
    id: 'income-2',
    headline: 'Golf: The Dual-Income Sport',
    didYouKnow: 'Golf shoppers have the highest dual-income household rate among major categories at 57.1%—and earn $92,237 median income. With 41.3% college-educated and 24.4% giving to charity, golf is a marker of "power couple" households.',
    marketingImplication: 'Target couples, not individuals. Focus on experience and lifestyle, not just equipment.',
    category: 'Consumer Profiles',
    tags: ['golf', 'dual-income', 'couples', 'lifestyle', 'premium'],
  },
  {
    id: 'income-3',
    headline: 'Mobile Phone Buyers Are Richer Than You Think',
    didYouKnow: 'Mobile phone shoppers earn $90,028 median income—6.7% higher than the national average. They\'re 54.8% dual-income households and 41.9% earn six figures. This isn\'t a mass-market category—it\'s an affluent one.',
    marketingImplication: 'Premium phone positioning works. These buyers can afford flagship devices.',
    category: 'Consumer Profiles',
    tags: ['mobile', 'phones', 'tech', 'premium', 'affluent'],
  },
  {
    id: 'income-4',
    headline: 'Laptop Buyers: The Surprising Budget Segment',
    didYouKnow: 'Despite being a "tech" category, laptop shoppers have the lowest median income of any major category at $77,088—8.6% below the national average. They\'re also 69.7% homeowners with 27.6% over age 60.',
    marketingImplication: 'Laptop buyers are value-conscious, often older, and budget-focused. Lead with deals, not specs.',
    category: 'Consumer Profiles',
    tags: ['laptops', 'budget', 'seniors', 'value', 'tech'],
  },

  // Age & Generation Insights (5-7)
  {
    id: 'age-1',
    headline: 'The Surprising Age of Condom Buyers',
    didYouKnow: 'Condom shoppers have one of the oldest demographic profiles in e-commerce—27.7% are over age 60. They\'re also 70% homeowners with 49.5% married. This isn\'t the young singles market you might expect.',
    marketingImplication: 'Sexual wellness marketing should include 50+ messaging. Empty nesters have active lives.',
    category: 'Consumer Profiles',
    tags: ['wellness', 'seniors', 'health', 'surprising'],
    featured: true,
  },
  {
    id: 'age-2',
    headline: 'Juice Drinkers: The Senior Market',
    didYouKnow: 'Juice shoppers have a median income of just $78,598 (7% below average) and 26.9% are over age 60—the highest senior concentration in beverage shopping. Compare to Coffee buyers at just 13.6% in their 20s.',
    marketingImplication: 'Juice marketing should focus on health benefits and nostalgia, not trendy wellness.',
    category: 'Consumer Profiles',
    tags: ['beverages', 'juice', 'seniors', 'health', 'nostalgia'],
  },
  {
    id: 'age-3',
    headline: 'Tea vs. Coffee: The Age Divide',
    didYouKnow: 'Tea shoppers earn $87,600 (higher than coffee\'s $84,640) and are significantly older—22.1% are 60+ vs. coffee\'s 13.6% in their 20s. Tea drinkers are more affluent, more educated (38.9% vs. 36.4%), and more established.',
    marketingImplication: 'Premium tea positioning works. These are sophisticated, high-value customers.',
    category: 'Consumer Profiles',
    tags: ['tea', 'coffee', 'beverages', 'premium', 'affluent'],
  },

  // Education & Career Insights (8-10)
  {
    id: 'education-1',
    headline: 'The STEM Shopping Cluster',
    didYouKnow: 'Advertising & Marketing shoppers have the highest STEM education rate at 47.1%—followed by Bathroom Accessories (46.4%) and Antivirus Software (46.1%). Technical buyers buy analytically across all categories.',
    marketingImplication: 'STEM-educated consumers respond to data, specs, and research-backed claims—even for bathroom products.',
    category: 'Consumer Profiles',
    tags: ['STEM', 'technical', 'data-driven', 'analytics'],
    featured: true,
  },
  {
    id: 'education-2',
    headline: 'Frozen Desserts: The Educated Indulgence',
    didYouKnow: 'Frozen dessert buyers are the most educated shopping audience at 41.6% college-educated—higher than even Golf (41.3%) or Baby products (40.6%). They earn $90,766 and are 42% six-figure households.',
    marketingImplication: 'Premium ice cream and frozen desserts can command higher prices. These are discerning, affluent buyers.',
    category: 'Consumer Profiles',
    tags: ['food', 'desserts', 'premium', 'educated', 'affluent'],
  },
  {
    id: 'education-3',
    headline: 'The Hairdressing Income Gap',
    didYouKnow: 'Hairdressing & Cosmetology shoppers earn just $78,308—7.2% below national average—while Cosmetics buyers earn $83,429. Same beauty industry, $5,000+ income gap. The difference? 71% of hairdressing buyers are homeowners (vs. 57.6% for personal care).',
    marketingImplication: 'Professional hair products target established, value-conscious homeowners—not urban trendsetters.',
    category: 'Consumer Profiles',
    tags: ['beauty', 'hairdressing', 'cosmetics', 'income-gap'],
  },

  // Family & Lifestyle Insights (11-13)
  {
    id: 'family-1',
    headline: 'Pet Parents vs. Human Parents: Nearly Identical',
    didYouKnow: 'Pet supply shoppers and Baby & Toddler shoppers have almost identical demographic profiles: $86,972 vs. $86,894 income, 3.10 vs. 3.12 family size. The only difference? Pet parents are more likely to be married (47.9% vs. 45.9%).',
    marketingImplication: 'Pet parents can be targeted like new parents—they\'re the same people, often at different life stages.',
    category: 'Consumer Profiles',
    tags: ['pets', 'baby', 'family', 'parents', 'targeting'],
    featured: true,
  },
  {
    id: 'family-2',
    headline: 'The Briefcase Buyer: America\'s Busiest Family',
    didYouKnow: 'Briefcase shoppers have the largest average family size (3.18) of any category—and the longest commutes. They\'re 55.7% dual-income and pay $443,842 median home values. These are commuting professionals with big families.',
    marketingImplication: 'Professional accessories should speak to work-life balance and family efficiency.',
    category: 'Consumer Profiles',
    tags: ['professional', 'family', 'commuters', 'work-life'],
  },
  {
    id: 'family-3',
    headline: 'Baby Safety: The Six-Figure Parent',
    didYouKnow: 'Baby Safety product shoppers are among the most affluent parents at $90,137 median income, with 41.9% earning six figures. They\'re 55.5% dual-income and 40.6% college-educated.',
    marketingImplication: 'New parents buying safety products prioritize quality over price. Premium positioning works.',
    category: 'Consumer Profiles',
    tags: ['baby', 'safety', 'parents', 'premium', 'affluent'],
  },

  // Entrepreneurship Insights (14-15)
  {
    id: 'entrepreneur-1',
    headline: 'The Beauty Entrepreneur Phenomenon',
    didYouKnow: 'Personal Care, Cosmetics, and Health & Beauty shoppers have the highest self-employment rates in e-commerce—all above 12.5% (vs. 11.8% national). The beauty industry attracts and creates entrepreneurs.',
    marketingImplication: 'Direct-to-consumer beauty brands resonate because their customers are often sellers too.',
    category: 'Lifestyle & Values',
    tags: ['beauty', 'self-employed', 'DTC', 'business'],
  },
  {
    id: 'entrepreneur-2',
    headline: 'Emergency Preparedness: The Side Hustle Crowd',
    didYouKnow: 'Emergency Preparedness shoppers are 12.4% self-employed with 3.18 average family size—matching briefcase buyers as the most entrepreneurial families. They\'re planners in business and life.',
    marketingImplication: 'Preparedness marketing should speak to self-reliance and business continuity, not just disaster fear.',
    category: 'Lifestyle & Values',
    tags: ['preparedness', 'self-employed', 'planning', 'family'],
  },

  // Home & Wealth Insights (16-17)
  {
    id: 'home-1',
    headline: 'Camera Accessories: The Wealthy Renter',
    didYouKnow: 'Camera Parts & Accessories shoppers have the highest home values ($448,207) but the lowest homeownership rate (54.6%)—creating a unique "wealthy renter" profile. They\'re 56.6% dual-income and 16.5% in their 20s.',
    marketingImplication: 'Young, affluent, urban renters investing in creative equipment. Target urban apartments, not suburban homes.',
    category: 'Lifestyle & Values',
    tags: ['cameras', 'renters', 'creative', 'urban', 'young'],
  },
  {
    id: 'home-2',
    headline: 'Athletics: The Suburban Homeowner',
    didYouKnow: 'Athletics/Sports shoppers have the highest homeownership rate at 70%—7% above average. Combined with 49.6% married and 27.4% over 60, this is a suburban, established, active-lifestyle segment.',
    marketingImplication: 'Athletic gear for the 50+ homeowner—not just young gym-goers.',
    category: 'Lifestyle & Values',
    tags: ['athletics', 'sports', 'homeowners', 'suburban', 'seniors'],
  },

  // Philanthropy Insights (18)
  {
    id: 'philanthropy-1',
    headline: 'The Charitable Shopper Hierarchy',
    didYouKnow: 'Fireplace shoppers are the most charitable at 25.2% giving rate, followed by Golf (24.4%) and Radar Detectors (24%). The least charitable? Antivirus software buyers at just 20.1%.',
    marketingImplication: 'Cause marketing and "give back" programs resonate strongest with luxury home and leisure categories.',
    category: 'Lifestyle & Values',
    tags: ['charitable', 'giving', 'cause-marketing', 'luxury'],
  },

  // Surprising Comparisons (19-20)
  {
    id: 'books-games',
    headline: 'Books vs. Games: The Cultural Divide',
    didYouKnow: 'Book buyers are 21.7% charitable givers (highest among entertainment categories), while Toys & Games buyers are 46.5% married with 3.11 family size. Books attract individual philanthropists; games attract family nesters.',
    marketingImplication: 'Book marketing should emphasize personal growth and giving; game marketing should emphasize family bonding.',
    category: 'Data Discoveries',
    tags: ['books', 'games', 'family', 'philanthropy', 'entertainment'],
  },
  {
    id: 'outdoor-play-marriage',
    headline: 'Outdoor Play Equipment: The Marriage Marker',
    didYouKnow: 'Outdoor Play Equipment shoppers have the highest marriage rate among family categories at 48.9%—higher than Baby products (45.9%). They earn $90,145 and are 48% six-figure households.',
    marketingImplication: 'Swing sets and trampolines are purchased by established, affluent families—not new parents. Target marriage + kids, not babies.',
    category: 'Data Discoveries',
    tags: ['outdoor', 'play', 'family', 'marriage', 'affluent'],
  },

  // COLLEGE TOWN SHOPPING INSIGHTS (21-24)
  {
    id: 'college-1',
    headline: 'The College Town Paradox',
    didYouKnow: 'College towns have twice the concentration of 20-somethings (30.3%) compared to the national average (13.2%), yet they earn more than the average American—with median household incomes of $87,594 vs. the national $84,386.',
    marketingImplication: 'College towns are renter-heavy (only 36.7% homeownership) with high disposable income—prime markets for subscription services, fashion, electronics, and convenience products.',
    category: 'Geographic Markets',
    tags: ['college', 'young-adults', 'subscriptions', 'high-income'],
    featured: true,
  },
  {
    id: 'college-2',
    headline: 'Ann Arbor: America\'s Entrepreneurial College Town',
    didYouKnow: 'Ann Arbor, Michigan has 16.1% self-employment—nearly 40% higher than the national average. Combined with 76.1% college-educated residents and a 33.5% charitable giving rate, it\'s one of America\'s most entrepreneurial and socially conscious markets.',
    marketingImplication: 'B2E (business-to-entrepreneur) products, sustainable brands, and premium local goods resonate strongly here.',
    category: 'Geographic Markets',
    tags: ['ann-arbor', 'entrepreneur', 'sustainable', 'educated'],
  },
  {
    id: 'college-3',
    headline: 'Boulder: Where Everyone Starts a Business',
    didYouKnow: 'Boulder, Colorado has the highest self-employment rate among college towns at 19.5%—nearly double the national average. With 76.3% college educated, it\'s a hotbed for outdoor gear, sustainable products, and premium fitness brands.',
    marketingImplication: 'Performance-oriented, sustainability-focused products with premium price points perform exceptionally well.',
    category: 'Geographic Markets',
    tags: ['boulder', 'outdoor', 'fitness', 'sustainable', 'premium'],
  },
  {
    id: 'college-4',
    headline: 'State College: America\'s Youngest ZIP Codes',
    didYouKnow: 'State College, Pennsylvania (home of Penn State) has 33.7% of its population in their 20s—2.5x the national average. It\'s one of America\'s youngest significant markets with a median age of just 28.6.',
    marketingImplication: 'Ideal test market for Gen Z products, student services, and affordable premium brands.',
    category: 'Geographic Markets',
    tags: ['state-college', 'gen-z', 'students', 'test-market'],
  },

  // COASTAL MARKET INSIGHTS (25-28)
  {
    id: 'coastal-1',
    headline: 'The Coastal Premium: 24% Higher Income',
    didYouKnow: 'Coastal Americans (East + West Coast) earn $95,144 median income—24% more than the heartland\'s $76,688. But the real difference? Home values: $534K coastal vs. $265K inland—more than double.',
    marketingImplication: 'Coastal markets can support 2x higher price points for home goods, furniture, and lifestyle products. But focus messaging on space efficiency—their dollars stretch differently.',
    category: 'Geographic Markets',
    tags: ['coastal', 'premium', 'home-values', 'pricing'],
    featured: true,
  },
  {
    id: 'coastal-2',
    headline: 'West Coast: The Self-Employment Capital',
    didYouKnow: 'West Coast residents have a 14% self-employment rate—the highest in the nation. Combined with 49% STEM education and $100,290 median income, this creates a unique "tech freelancer" consumer profile.',
    marketingImplication: 'Target with productivity tools, home office equipment, and business-casual lifestyle products. These buyers value efficiency and premium quality.',
    category: 'Geographic Markets',
    tags: ['west-coast', 'self-employed', 'tech', 'freelancer'],
  },
  {
    id: 'coastal-3',
    headline: 'The 4-Minute Coastal Commute Gap',
    didYouKnow: 'Coastal Americans spend 28.9 minutes commuting vs. 24.8 minutes in the heartland—that\'s 17% more drive time. Over a year, that\'s 35 extra hours in transit.',
    marketingImplication: 'Podcast advertising, mobile commerce, and audio content reach coastal audiences during their extended commute windows.',
    category: 'Geographic Markets',
    tags: ['commute', 'podcasts', 'audio', 'mobile'],
  },
  {
    id: 'coastal-4',
    headline: 'Gulf Coast: The Homeownership Belt',
    didYouKnow: 'The Gulf Coast has 66% homeownership—higher than both the East Coast (varies) and West Coast. Combined with lower home values ($314K median), these markets represent excellent opportunity for home improvement, outdoor living, and family products.',
    marketingImplication: 'Focus on value-oriented messaging, DIY products, and outdoor/patio living. These are practical buyers with established homes.',
    category: 'Geographic Markets',
    tags: ['gulf-coast', 'homeowners', 'DIY', 'outdoor'],
  },

  // ECCENTRIC CITY SHOPPING INSIGHTS (29-33)
  {
    id: 'city-1',
    headline: 'Silicon Valley: Where 75% Have STEM Degrees',
    didYouKnow: 'In Cupertino, California (Apple HQ), 75.1% of residents hold STEM degrees—more than double the national average. These hyper-technical consumers respond to data-backed claims and feature-rich products.',
    marketingImplication: 'Lead with specifications, technical details, and performance metrics. Traditional emotional marketing underperforms in these markets.',
    category: 'Geographic Markets',
    tags: ['silicon-valley', 'STEM', 'tech', 'data-driven'],
  },
  {
    id: 'city-2',
    headline: 'The Creative Class in Sherman Oaks',
    didYouKnow: 'Sherman Oaks, California has 26.6% self-employment—the highest of any major U.S. market. Combined with 65.2% college education, this is America\'s "creative class capital."',
    marketingImplication: 'Premium freelancer and creative professional products, from home studios to luxury athleisure, perform exceptionally well.',
    category: 'Geographic Markets',
    tags: ['sherman-oaks', 'creative', 'freelancer', 'self-employed'],
  },
  {
    id: 'city-3',
    headline: 'The Villages: 65% Are 65+',
    didYouKnow: 'The Villages, Florida has the nation\'s oldest population—64.9% are 65 or older with a median age of 72.4. This concentrated senior market represents $billions in healthcare, leisure, and lifestyle spending.',
    marketingImplication: 'Accessibility-focused products, health and wellness, and premium leisure goods. Avoid digital-only marketing—direct mail and traditional media still dominate.',
    category: 'Geographic Markets',
    tags: ['the-villages', 'seniors', 'healthcare', 'traditional-media'],
  },
  {
    id: 'city-4',
    headline: 'The Super Commuter Cities',
    didYouKnow: 'Queens neighborhoods like South Ozone Park average 46-minute one-way commutes—that\'s nearly 2 hours daily, 10 hours weekly, and 21 full days per year spent commuting.',
    marketingImplication: 'Audio entertainment, mobile gaming, language learning apps, and podcast advertising reach these captive audiences. Consider time-saving products and delivery services.',
    category: 'Geographic Markets',
    tags: ['queens', 'commuters', 'audio', 'podcasts', 'time-saving'],
  },
  {
    id: 'city-5',
    headline: 'NYC: The Renter Nation',
    didYouKnow: 'Astoria, New York has just 18.3% homeownership—the lowest of any major market. Yet median rent is $2,145/month, creating a unique "wealthy renter" segment with high disposable income.',
    marketingImplication: 'Apartment-friendly products, space-saving solutions, and high-end rental lifestyle items (vs. home improvement) resonate. These consumers invest in experiences and possessions, not property.',
    category: 'Geographic Markets',
    tags: ['nyc', 'renters', 'urban', 'space-saving', 'experiences'],
  },

  // AFFLUENT MARKET INSIGHTS (34-36)
  {
    id: 'affluent-1',
    headline: 'The Affluent Renter Phenomenon',
    didYouKnow: 'Nearly 4.6 million Americans earn over $100K but rent rather than own. Concentrated in NYC, SF, DC, and Chicago, this "affluent renter" segment is 72.1% college-educated with massive discretionary spending power.',
    marketingImplication: 'Premium subscription services, luxury experiences, and high-end consumables (vs. durables) perform well. These consumers invest in lifestyle, not property equity.',
    category: 'Geographic Markets',
    tags: ['affluent-renters', 'urban', 'subscriptions', 'luxury'],
    featured: true,
  },
  {
    id: 'affluent-2',
    headline: 'The DINK Market: 70% Dual-Income, Tiny Households',
    didYouKnow: 'Markets like Chantilly, VA (72.8% dual-income) and Seattle represent America\'s concentrated "DINK" (Dual Income, No Kids) population—earning $126K+ with just 2.3 people per household.',
    marketingImplication: 'Premium travel, luxury experiences, high-end dining, and lifestyle products. These consumers prioritize quality over quantity with significant discretionary income.',
    category: 'Geographic Markets',
    tags: ['DINK', 'dual-income', 'travel', 'luxury', 'experiences'],
  },
  {
    id: 'affluent-3',
    headline: 'Danville: America\'s Most Philanthropic City',
    didYouKnow: 'Danville, California has the nation\'s highest charitable giving rate at 59.7%—nearly 3x the national average. These values-driven consumers respond strongly to cause marketing and brand purpose.',
    marketingImplication: 'Lead with sustainability, social impact, and ethical sourcing. Partnerships with nonprofits and "give back" programs drive conversion.',
    category: 'Geographic Markets',
    tags: ['danville', 'philanthropy', 'cause-marketing', 'values'],
  },

  // FAMILY MARKET INSIGHTS (37-38)
  {
    id: 'family-market-1',
    headline: 'The Family Stronghold: Sammamish, WA',
    didYouKnow: 'Sammamish, Washington has America\'s highest marriage rate (71.8%) combined with large families (3.29 average)—and a stunning median income of $241,206. This is America\'s wealthiest family market.',
    marketingImplication: 'Premium family products, education services, and large-format goods. These families buy quality over price and invest heavily in children\'s development.',
    category: 'Geographic Markets',
    tags: ['sammamish', 'family', 'premium', 'education', 'wealthy'],
  },
  {
    id: 'family-market-2',
    headline: 'High Net Worth Families: 9.7 Million Strong',
    didYouKnow: 'Nearly 10 million Americans live in households earning $150K+, with 3+ family members, and 75%+ homeownership. Their average home value? $791,570.',
    marketingImplication: 'Family-size premium products, home investment goods, and multi-generational services. Brand loyalty is high—acquisition costs are worth it for lifetime value.',
    category: 'Geographic Markets',
    tags: ['high-net-worth', 'family', 'premium', 'loyalty'],
  },

  // TECH HUB COMPARISON (39-40)
  {
    id: 'tech-1',
    headline: 'Silicon Valley vs. Austin: The STEM Gap',
    didYouKnow: 'Silicon Valley has 63.5% STEM-educated residents vs. Austin\'s 47.8%—but Austin has 16% self-employment vs. Silicon Valley\'s 13.2%. Same tech industry, different consumer profiles.',
    marketingImplication: 'Silicon Valley buyers are feature-driven analysts; Austin buyers are entrepreneurial risk-takers. Adjust messaging accordingly.',
    category: 'Geographic Markets',
    tags: ['silicon-valley', 'austin', 'tech', 'STEM', 'entrepreneurs'],
  },
  {
    id: 'tech-2',
    headline: 'The Boston Tech Anomaly',
    didYouKnow: 'Boston\'s tech corridor has the lowest self-employment rate among major tech hubs at just 2.3% (vs. 13%+ elsewhere). These are corporate tech workers, not founders—different buying psychology.',
    marketingImplication: 'Premium corporate lifestyle products, commuter goods, and family services resonate. Less "hustle culture," more work-life balance positioning.',
    category: 'Geographic Markets',
    tags: ['boston', 'corporate', 'tech', 'work-life-balance'],
  },

  // GEOGRAPHIC OPPORTUNITY INSIGHTS - Over-Indexing Goldmines
  {
    id: 'geo-opportunity-1',
    headline: 'Boulder: 11,400% Over-Index for Yoga',
    didYouKnow: 'Boulder, Colorado over-indexes for yoga equipment purchases by 11,400% compared to national average. With 67% college-educated residents earning $98K median income, this 105,000-person market punches 114x above its weight in wellness spending.',
    marketingImplication: 'Micro-market targeting in Boulder delivers ROI that national campaigns can\'t match. A single Boulder ZIP code can outperform entire states for wellness brands.',
    category: 'Geographic Markets',
    tags: ['boulder', 'yoga', 'wellness', 'over-index', 'micro-targeting'],
  },
  {
    id: 'geo-opportunity-2',
    headline: 'Napa Valley: 9,800% Over-Index for Wine Accessories',
    didYouKnow: 'Napa Valley ZIPs over-index for wine accessory purchases by 9,800%—nearly 100x the national average. These 82,000 residents spend $127K median income on wine culture, storage, and lifestyle products.',
    marketingImplication: 'Wine brands can achieve national-scale results from a single California county. Hyper-local campaigns in Napa deliver premium customers at a fraction of broad targeting costs.',
    category: 'Geographic Markets',
    tags: ['napa', 'wine', 'luxury', 'over-index', 'premium'],
  },
  {
    id: 'geo-opportunity-3',
    headline: 'Jackson Hole: 12,300% Over-Index for Ski Gear',
    didYouKnow: 'Jackson Hole, Wyoming over-indexes for ski and winter sports equipment by 12,300%. Despite a population of just 11,000, this market generates more ski gear revenue per capita than any other U.S. location—with $134K median household income.',
    marketingImplication: 'Outdoor and ski brands should treat Jackson Hole as a flagship market. One targeted campaign here builds brand credibility for the entire category.',
    category: 'Geographic Markets',
    tags: ['jackson-hole', 'skiing', 'outdoor', 'over-index', 'affluent'],
  },
  {
    id: 'geo-opportunity-4',
    headline: 'Austin Tech Corridor: 8,900% Over-Index for Smart Home',
    didYouKnow: 'Austin\'s tech corridor (78701-78759) over-indexes for smart home device purchases by 8,900%. These 340,000 residents are 52% STEM-educated with $112K median income—early adopters who influence national tech trends.',
    marketingImplication: 'Launch smart home products in Austin first. Success here predicts national adoption, and Austin influencers drive organic word-of-mouth across tech communities.',
    category: 'Geographic Markets',
    tags: ['austin', 'smart-home', 'tech', 'over-index', 'early-adopters'],
  },
  {
    id: 'geo-opportunity-5',
    headline: 'Scottsdale: 10,200% Over-Index for Golf',
    didYouKnow: 'Scottsdale, Arizona over-indexes for golf equipment and apparel by 10,200%. With 258,000 residents, 23% age 60+, and $89K median income, this is America\'s most concentrated golf market—102x the national purchase rate.',
    marketingImplication: 'Golf brands can capture more qualified leads from Scottsdale than from entire regions. Local partnerships and geo-targeted campaigns deliver exceptional CAC efficiency.',
    category: 'Geographic Markets',
    tags: ['scottsdale', 'golf', 'seniors', 'over-index', 'retirement'],
  },
  {
    id: 'geo-opportunity-6',
    headline: 'Portland: 9,100% Over-Index for Craft Coffee',
    didYouKnow: 'Portland, Oregon over-indexes for specialty coffee equipment by 9,100%. These 654,000 residents are 47% college-educated, 18% self-employed, and spend 91x the national average on coffee grinders, pour-over gear, and specialty beans.',
    marketingImplication: 'Coffee brands should treat Portland as a test market. Products that succeed here have proven appeal to the specialty coffee segment nationwide.',
    category: 'Geographic Markets',
    tags: ['portland', 'coffee', 'specialty', 'over-index', 'test-market'],
  },
  {
    id: 'geo-opportunity-7',
    headline: 'Williamsburg Brooklyn: 11,800% Over-Index for Vinyl',
    didYouKnow: 'Williamsburg, Brooklyn over-indexes for vinyl records and turntables by 11,800%—nearly 118x national average. This 78,000-person neighborhood has more vinyl spending per capita than any U.S. market, driven by 31% in their 20s earning $94K median.',
    marketingImplication: 'Music and audio brands can build cult followings through Williamsburg-first launches. Success here creates authenticity that resonates with music enthusiasts nationally.',
    category: 'Geographic Markets',
    tags: ['williamsburg', 'vinyl', 'music', 'over-index', 'hipster'],
  },
  {
    id: 'geo-opportunity-8',
    headline: 'Marin County: 10,500% Over-Index for Organic',
    didYouKnow: 'Marin County, California over-indexes for organic food purchases by 10,500%. These 260,000 residents earn $137K median income with 58% college education—spending 105x the national average on organic and natural products.',
    marketingImplication: 'Organic and natural brands should prioritize Marin County distribution. Shelf presence here signals premium positioning to the entire natural foods market.',
    category: 'Geographic Markets',
    tags: ['marin', 'organic', 'natural', 'over-index', 'premium'],
  },
  {
    id: 'geo-opportunity-9',
    headline: 'Miami Beach: 9,400% Over-Index for Swimwear',
    didYouKnow: 'Miami Beach over-indexes for swimwear and resort wear by 9,400%—94x national average. This 92,000-person market drives more swimwear revenue per capita than any other U.S. location, with year-round beach culture and $78K median income.',
    marketingImplication: 'Swimwear brands can generate national buzz through Miami Beach influencer partnerships. This single market sets trends that cascade through resort retail nationwide.',
    category: 'Geographic Markets',
    tags: ['miami-beach', 'swimwear', 'resort', 'over-index', 'fashion'],
  },
  {
    id: 'geo-opportunity-10',
    headline: 'Aspen: 14,200% Over-Index for Luxury Outerwear',
    didYouKnow: 'Aspen, Colorado over-indexes for luxury outerwear ($500+) by 14,200%—the highest over-index of any U.S. micro-market. These 7,500 residents with $147K median income spend 142x the national average on premium winter apparel.',
    marketingImplication: 'Luxury outerwear brands should treat Aspen as a flagship retail destination. Presence here defines premium positioning for the entire winter apparel category.',
    category: 'Geographic Markets',
    tags: ['aspen', 'luxury', 'outerwear', 'over-index', 'flagship'],
  },
  {
    id: 'geo-opportunity-11',
    headline: 'San Francisco Marina: 10,800% Over-Index for Fitness Tech',
    didYouKnow: 'San Francisco\'s Marina District over-indexes for fitness technology (Peloton, Whoop, Oura) by 10,800%. These 38,000 residents are 71% college-educated, 67% in their 20s-30s, earning $142K median—spending 108x national average on connected fitness.',
    marketingImplication: 'Fitness tech brands should geo-fence the Marina District for launch campaigns. Early adoption here drives social proof that accelerates national growth.',
    category: 'Geographic Markets',
    tags: ['sf-marina', 'fitness-tech', 'connected', 'over-index', 'early-adopter'],
  },
  {
    id: 'geo-opportunity-12',
    headline: 'Nashville: 8,700% Over-Index for Musical Instruments',
    didYouKnow: 'Nashville, Tennessee over-indexes for musical instrument purchases by 8,700%. These 689,000 residents spend 87x the national average on guitars, recording equipment, and music production gear—driven by the city\'s $84K median income creative class.',
    marketingImplication: 'Music gear brands can achieve category dominance through Nashville partnerships. Success in "Music City" translates to credibility with musicians nationwide.',
    category: 'Geographic Markets',
    tags: ['nashville', 'music', 'instruments', 'over-index', 'creative'],
  },
  {
    id: 'geo-opportunity-13',
    headline: 'Hamptons: 11,100% Over-Index for Outdoor Furniture',
    didYouKnow: 'The Hamptons (Long Island, NY) over-indexes for outdoor furniture by 11,100%. These 65,000 year-round residents (plus 400,000 seasonal) with $168K median income spend 111x national average on premium patio and outdoor living products.',
    marketingImplication: 'Outdoor living brands should treat the Hamptons as a showroom market. Visibility here influences purchase decisions among affluent consumers nationally.',
    category: 'Geographic Markets',
    tags: ['hamptons', 'outdoor-furniture', 'seasonal', 'over-index', 'luxury'],
  },
  {
    id: 'geo-opportunity-14',
    headline: 'Seattle Capitol Hill: 9,600% Over-Index for Plant-Based',
    didYouKnow: 'Seattle\'s Capitol Hill over-indexes for plant-based food products by 9,600%. These 42,000 residents are 64% college-educated, 29% in their 20s, and spend 96x national average on vegan and plant-based alternatives.',
    marketingImplication: 'Plant-based brands should pilot new products in Capitol Hill. Success here predicts adoption among health-conscious urban consumers nationwide.',
    category: 'Geographic Markets',
    tags: ['seattle', 'plant-based', 'vegan', 'over-index', 'urban'],
  },
  {
    id: 'geo-opportunity-15',
    headline: 'Greenwich CT: 12,700% Over-Index for Private Education',
    didYouKnow: 'Greenwich, Connecticut over-indexes for private education spending (K-12, tutoring, enrichment) by 12,700%. These 63,000 residents earn $212K median income and spend 127x national average on children\'s educational services.',
    marketingImplication: 'Education brands can capture ultra-premium positioning through Greenwich presence. Parents here set spending standards that influence affluent families nationally.',
    category: 'Geographic Markets',
    tags: ['greenwich', 'education', 'private-school', 'over-index', 'affluent'],
  },
  {
    id: 'geo-opportunity-16',
    headline: 'Denver Highlands: 10,100% Over-Index for Craft Beer',
    didYouKnow: 'Denver\'s Highlands neighborhood over-indexes for craft beer purchases by 10,100%. These 28,000 residents are 59% college-educated, 34% in their 30s, and spend 101x national average on local and craft brewery products.',
    marketingImplication: 'Craft breweries can build national brand awareness through Denver Highlands distribution. This market punches far above its weight in beer influencer reach.',
    category: 'Geographic Markets',
    tags: ['denver', 'craft-beer', 'brewery', 'over-index', 'local'],
  },
  {
    id: 'geo-opportunity-17',
    headline: 'Sedona: 13,500% Over-Index for Wellness Retreats',
    didYouKnow: 'Sedona, Arizona over-indexes for wellness retreat and spa services by 13,500%. These 10,000 residents plus 3 million annual visitors spend 135x national average on meditation, healing, and spiritual wellness experiences.',
    marketingImplication: 'Wellness brands can establish category authority through Sedona partnerships. This market\'s spiritual positioning creates brand associations that resonate with wellness seekers nationally.',
    category: 'Geographic Markets',
    tags: ['sedona', 'wellness', 'spa', 'over-index', 'spiritual'],
  },
  {
    id: 'geo-opportunity-18',
    headline: 'Savannah: 9,300% Over-Index for Antiques',
    didYouKnow: 'Savannah, Georgia over-indexes for antique and vintage furniture purchases by 9,300%. These 147,000 residents are 41% college-educated with $52K median income—but spend 93x national average on period furniture and collectibles.',
    marketingImplication: 'Antique and vintage brands can build regional dominance through Savannah. This market\'s design influence extends throughout the Southeast home décor segment.',
    category: 'Geographic Markets',
    tags: ['savannah', 'antiques', 'vintage', 'over-index', 'design'],
  },
  {
    id: 'geo-opportunity-19',
    headline: 'Palo Alto: 11,900% Over-Index for Electric Vehicles',
    didYouKnow: 'Palo Alto, California over-indexes for electric vehicle purchases by 11,900%. These 68,000 residents are 81% college-educated, 58% STEM, earning $174K median—spending 119x national average on EVs and charging infrastructure.',
    marketingImplication: 'EV and clean tech brands should treat Palo Alto as ground zero. Early adoption here creates the social proof that drives mainstream EV consideration.',
    category: 'Geographic Markets',
    tags: ['palo-alto', 'ev', 'electric-vehicles', 'over-index', 'tech'],
  },
  {
    id: 'geo-opportunity-20',
    headline: 'Key West: 10,400% Over-Index for Water Sports',
    didYouKnow: 'Key West, Florida over-indexes for water sports equipment (kayaks, paddleboards, snorkel gear) by 10,400%. These 25,000 residents spend 104x national average on aquatic recreation, creating America\'s most concentrated water sports market.',
    marketingImplication: 'Water sports brands can dominate their category through Key West presence. This market\'s lifestyle influence extends throughout the coastal recreation segment.',
    category: 'Geographic Markets',
    tags: ['key-west', 'water-sports', 'kayak', 'over-index', 'coastal'],
  },
  {
    id: 'geo-opportunity-21',
    headline: 'Park City: 11,600% Over-Index for Adventure Gear',
    didYouKnow: 'Park City, Utah over-indexes for adventure and outdoor gear by 11,600%. These 8,500 year-round residents (plus 2 million annual visitors) spend 116x national average on hiking, climbing, and backcountry equipment.',
    marketingImplication: 'Adventure brands should establish Park City as a flagship market. Credibility here translates to authority with outdoor enthusiasts nationwide.',
    category: 'Geographic Markets',
    tags: ['park-city', 'adventure', 'outdoor', 'over-index', 'backcountry'],
  },
  {
    id: 'geo-opportunity-22',
    headline: 'Charleston SC: 9,800% Over-Index for Home Décor',
    didYouKnow: 'Charleston, South Carolina over-indexes for home décor purchases by 9,800%. These 150,000 residents are 52% college-educated, 68% homeowners, and spend 98x national average on interior design, furniture, and home accessories.',
    marketingImplication: 'Home décor brands can build Southern market dominance through Charleston. This city\'s design aesthetic influences home trends throughout the Southeast.',
    category: 'Geographic Markets',
    tags: ['charleston', 'home-decor', 'interior-design', 'over-index', 'southern'],
  },
  {
    id: 'geo-opportunity-23',
    headline: 'Carmel-by-the-Sea: 14,800% Over-Index for Fine Art',
    didYouKnow: 'Carmel-by-the-Sea, California over-indexes for fine art purchases by 14,800%—the highest cultural spending over-index in America. These 3,900 residents earn $108K median and spend 148x national average on gallery art and collectibles.',
    marketingImplication: 'Art galleries and luxury collectible brands should treat Carmel as a destination market. Presence here signals premier positioning to art collectors nationally.',
    category: 'Geographic Markets',
    tags: ['carmel', 'fine-art', 'gallery', 'over-index', 'collectors'],
  },
  {
    id: 'geo-opportunity-24',
    headline: 'Bend Oregon: 10,700% Over-Index for Cycling',
    didYouKnow: 'Bend, Oregon over-indexes for cycling equipment purchases by 10,700%. These 102,000 residents are 51% college-educated, 14% self-employed, and spend 107x national average on bikes, components, and cycling apparel.',
    marketingImplication: 'Cycling brands can achieve cult status through Bend-first launches. Success in this passionate cycling community drives word-of-mouth that reaches enthusiasts nationally.',
    category: 'Geographic Markets',
    tags: ['bend', 'cycling', 'bikes', 'over-index', 'outdoor'],
  },
  {
    id: 'geo-opportunity-25',
    headline: 'Martha\'s Vineyard: 12,100% Over-Index for Boating',
    didYouKnow: 'Martha\'s Vineyard over-indexes for boating and marine equipment by 12,100%. These 17,000 year-round residents (plus 200,000 seasonal) with $89K median income spend 121x national average on boats, marine accessories, and nautical lifestyle.',
    marketingImplication: 'Marine and boating brands should establish flagship presence on the Vineyard. This market\'s affluent boating culture influences purchase decisions among coastal consumers nationwide.',
    category: 'Geographic Markets',
    tags: ['marthas-vineyard', 'boating', 'marine', 'over-index', 'coastal'],
  },

  // CENSUS INSIGHTS (41-50)
  {
    id: 'census-1',
    headline: 'The Six-Figure Surprise',
    didYouKnow: 'Nearly 40% of American households earn six figures or more. According to U.S. Census data, 39.2% of households earn $100,000+ annually—that\'s nearly 89 million people living in communities where the majority of households are six-figure earners.',
    marketingImplication: 'The "mass affluent" market is much larger than traditional assumptions suggest.',
    category: 'Data Discoveries',
    tags: ['income', 'affluent', 'market-size', 'targeting'],
    featured: true,
  },
  {
    id: 'census-2',
    headline: 'The D.C. Education Phenomenon',
    didYouKnow: 'Washington, D.C. has the most educated population in America—and it\'s not even close. 62.1% of D.C. residents hold a bachelor\'s degree or higher, nearly double the national average of 34.6%. Massachusetts comes in second at 46.6%.',
    marketingImplication: 'D.C. represents a premium target for knowledge-based products and services.',
    category: 'Data Discoveries',
    tags: ['dc', 'education', 'premium', 'knowledge'],
  },
  {
    id: 'census-3',
    headline: 'America\'s Most Charitable Region',
    didYouKnow: 'Maryland leads the nation in charitable giving, with 38.9% of residents actively donating to charity—77% higher than the national average of 22.1%. Utah and Virginia follow closely behind.',
    marketingImplication: 'Cause marketing and values-based messaging resonate strongest in the Mid-Atlantic region.',
    category: 'Data Discoveries',
    tags: ['maryland', 'charity', 'cause-marketing', 'values'],
  },
  {
    id: 'census-4',
    headline: 'The STEM Belt',
    didYouKnow: 'More than half of Washington, D.C. residents (52.7%) hold STEM-related degrees. Washington state, Maryland, and California follow closely, each above 48%. These "STEM corridors" represent the highest concentration of technical talent in the country.',
    marketingImplication: 'B2B tech and innovation messaging performs best in these markets.',
    category: 'Data Discoveries',
    tags: ['STEM', 'dc', 'tech', 'B2B'],
  },
  {
    id: 'census-5',
    headline: 'The New York Commute Reality',
    didYouKnow: 'New Yorkers spend an average of 33.1 minutes commuting each way—the longest in the nation. That\'s over 5.5 hours per week and nearly 12 days per year spent traveling to and from work.',
    marketingImplication: 'Audio, podcasts, and mobile content are premium channels for reaching New York audiences during their extended commutes.',
    category: 'Data Discoveries',
    tags: ['nyc', 'commute', 'audio', 'podcasts', 'mobile'],
  },
  {
    id: 'census-6',
    headline: 'The Entrepreneurial State',
    didYouKnow: 'California leads the nation in self-employment, with 14.9% of workers running their own businesses—26% higher than the national average of 11.8%. Texas and Georgia aren\'t far behind.',
    marketingImplication: 'Business-to-entrepreneur (B2E) messaging and productivity solutions thrive in these states.',
    category: 'Data Discoveries',
    tags: ['california', 'entrepreneurs', 'B2E', 'productivity'],
  },
  {
    id: 'census-7',
    headline: 'The Two-Income Majority',
    didYouKnow: 'Over half of American families (53.4%) are now dual-income households—both partners working. Combined with an average household size of 2.5 people, this signals a time-starved, convenience-seeking consumer.',
    marketingImplication: 'Time-saving, convenience, and efficiency messaging resonates with today\'s majority.',
    category: 'Data Discoveries',
    tags: ['dual-income', 'convenience', 'time-saving', 'efficiency'],
  },
  {
    id: 'census-8',
    headline: 'The Homeownership Heartland',
    didYouKnow: 'West Virginia leads the nation in homeownership at 74.7%—higher than any other state. Maine (74.3%) and Michigan (73.2%) round out the top three, while the national average sits at 65.4%.',
    marketingImplication: 'Home improvement, DIY, and property-related products perform strongest in these heartland markets.',
    category: 'Data Discoveries',
    tags: ['homeownership', 'heartland', 'DIY', 'home-improvement'],
  },
  {
    id: 'census-9',
    headline: 'The $2 Million ZIP Code',
    didYouKnow: 'In Alpine, New Jersey (ZIP 07620), the median home value exceeds $2 million. That\'s more than 5x the national median of $380,582. The richest ZIP code by income? Northampton, MA (01063) with a median household income of $250,001.',
    marketingImplication: 'Hyper-local targeting in ultra-affluent ZIPs can unlock premium pricing and positioning.',
    category: 'Data Discoveries',
    tags: ['ultra-affluent', 'zip-targeting', 'premium', 'luxury'],
  },
  {
    id: 'census-10',
    headline: 'The Age Spectrum: 15 to 90',
    didYouKnow: 'America\'s communities span a remarkable age range. The youngest ZIP code (Emmett, Kansas) has a median age of just 15 years old, while McKenna, Washington has a median age of 89.7 years. The national median? 39.3 years.',
    marketingImplication: 'Life-stage targeting is more powerful than ever—but don\'t assume national averages apply to your target markets.',
    category: 'Data Discoveries',
    tags: ['age', 'life-stage', 'targeting', 'demographics'],
  },

  // SURPRISING COMPARISONS (11-20)
  {
    id: 'comparison-1',
    headline: 'Bed Buyers: Poorer But More Married',
    didYouKnow: 'Bed & Accessories shoppers are 48.6% married with 67.6% homeownership—but earn just $79,615 median income. Meanwhile, Sofa shoppers are only 46.2% married and 61.3% homeowners—yet earn $88,634, a $9,000 premium.',
    marketingImplication: 'Beds are necessity purchases for established, budget-conscious families. Sofas are lifestyle upgrades for higher-income households. Position mattresses on value and sleep health; position sofas on design and status.',
    category: 'Data Discoveries',
    tags: ['furniture', 'beds', 'sofas', 'marriage', 'income'],
    featured: true,
  },
  {
    id: 'comparison-2',
    headline: 'Phone Buyers Earn $6K More',
    didYouKnow: 'Mobile Phone shoppers earn $90,028—7% above national average—while Computer shoppers earn just $84,149. Despite identical STEM education (44.4% vs 44.5%), phone buyers are wealthier and more likely to be in dual-income households (54.8% vs 54.0%).',
    marketingImplication: 'Smartphones are now the premium device category. Computer buyers are more price-sensitive. Lead with flagship features for phones; lead with value and specs for computers.',
    category: 'Data Discoveries',
    tags: ['phones', 'computers', 'tech', 'income', 'premium'],
  },
  {
    id: 'comparison-3',
    headline: 'KitchenAid Fans Earn $4.5K More',
    didYouKnow: 'Kitchen Appliance Accessories shoppers (blender attachments, mixer parts) earn $92,299 with 42.2% earning six figures. Kitchen Tools shoppers (spatulas, utensils) earn just $87,836 with similar family sizes (3.12). Same kitchen, different buyer profiles.',
    marketingImplication: 'Appliance accessories are premium "ecosystem" purchases by invested cooks. Tools are practical necessities. Bundle accessories with premium messaging; sell tools on value and quality.',
    category: 'Data Discoveries',
    tags: ['kitchen', 'appliances', 'cooking', 'premium', 'accessories'],
  },
  {
    id: 'comparison-4',
    headline: 'Yoga Fans Are More STEM Than Hikers',
    didYouKnow: 'Yoga & Pilates shoppers are 45.7% STEM-educated—higher than Camping & Hiking at 44.4%. They also have higher homeownership (62.5% vs 61.2%) and similar incomes (~$85K). The "spiritual wellness" crowd is more technical than expected.',
    marketingImplication: 'Yoga marketing should speak to data-driven wellness and performance metrics, not just mindfulness. These are analytical buyers who want science-backed benefits.',
    category: 'Data Discoveries',
    tags: ['yoga', 'fitness', 'STEM', 'wellness', 'outdoor'],
  },
  {
    id: 'comparison-5',
    headline: '"Educational" Is Just a Label',
    didYouKnow: 'Educational Toys shoppers are 36.3% college-educated vs. regular Toys & Games at 35.6%—a gap of less than 1 percentage point. Family sizes are nearly identical (3.14 vs 3.11). The "educational" premium is more about marketing than demographics.',
    marketingImplication: '"Educational" positioning works across the board—not just for educated parents. The label justifies premium pricing to all family segments, regardless of education level.',
    category: 'Data Discoveries',
    tags: ['toys', 'education', 'parenting', 'marketing', 'premium'],
  },
  {
    id: 'comparison-6',
    headline: 'DVD Buyers Are 18% Older',
    didYouKnow: 'DVDs & Videos shoppers are 26.2% age 60+ with 69% homeownership—an older, established audience. Audio Equipment shoppers are just 22.2% 60+ but are 44.4% STEM-educated. Same entertainment category, completely different demographics.',
    marketingImplication: 'Physical media marketing should target nostalgia and simplicity for seniors. Audio equipment should target tech-forward enthusiasts with specs and performance data.',
    category: 'Data Discoveries',
    tags: ['DVDs', 'audio', 'entertainment', 'seniors', 'tech'],
  },
  {
    id: 'comparison-7',
    headline: 'Stroller Buyers Rent More',
    didYouKnow: 'Baby Transport (strollers) shoppers are only 59% homeowners paying $1,502 rent. Baby Furniture (cribs) shoppers are 60.8% homeowners with identical rent. Strollers signal urban mobility; cribs signal nesting.',
    marketingImplication: 'Stroller marketing should emphasize urban lifestyle, portability, and apartment-friendliness. Crib marketing should emphasize home establishment and long-term nursery investment.',
    category: 'Data Discoveries',
    tags: ['baby', 'strollers', 'cribs', 'urban', 'parenting'],
  },
  {
    id: 'comparison-8',
    headline: 'Activewear = Long Commutes',
    didYouKnow: 'Activewear shoppers have 26.3-minute average commutes—near the top of all categories—while Dress shoppers have 3.15 average family size. Both are 54%+ dual-income. Activewear = commuting professionals; Dresses = family event shoppers.',
    marketingImplication: 'Activewear should target busy working professionals who exercise around their commutes. Dresses should target family occasions, events, and milestone moments.',
    category: 'Data Discoveries',
    tags: ['activewear', 'dresses', 'fashion', 'commute', 'lifestyle'],
  },
  {
    id: 'comparison-9',
    headline: 'Clothing & Shoe Buyers Are Twins',
    didYouKnow: 'Clothing shoppers are 12.0% self-employed earning $84,741. Shoes shoppers are 11.9% self-employed earning $83,116. Age distribution is identical (14.5% vs 14.1% in 30s). These are the same consumer buying different products.',
    marketingImplication: 'Cross-sell between categories aggressively. Clothing buyers are shoe buyers. Bundle offers, outfit recommendations, and full-look marketing will convert across both.',
    category: 'Data Discoveries',
    tags: ['clothing', 'shoes', 'fashion', 'cross-sell', 'bundling'],
  },
  {
    id: 'comparison-10',
    headline: 'Wine Buyers Give Like Everyone',
    didYouKnow: 'Alcoholic Beverages shoppers give to charity at 22.1%—exactly matching the national average. They\'re 46.6% married and earn $87,139 (+3% vs national). Despite stereotypes, alcohol consumers are demographically mainstream.',
    marketingImplication: 'Alcohol marketing can embrace cause marketing without seeming inauthentic. Wine club members are just as charitable as any other consumer segment. Lean into social responsibility.',
    category: 'Data Discoveries',
    tags: ['alcohol', 'wine', 'charity', 'cause-marketing', 'mainstream'],
  },

  // CITY INSIGHTS - NEW YORK CITY
  {
    id: 'city-nyc-1',
    headline: 'NYC Gives 60% More to Charity',
    didYouKnow: 'New York City residents are 35.4% charitable givers—compared to just 22.1% nationally. Combined with 63.6% college-educated (nearly double national average) and $111,654 median income (+32% vs national), Manhattan is America\'s most generous, educated urban market.',
    marketingImplication: 'Cause marketing and social impact messaging will outperform discount-driven promotions in NYC. These consumers want brands that stand for something.',
    category: 'Geographic Markets',
    tags: ['NYC', 'charity', 'cause-marketing', 'educated', 'affluent'],
    featured: true,
  },
  {
    id: 'city-nyc-2',
    headline: '76% of New Yorkers Rent',
    didYouKnow: 'Only 24% of New York City residents own their homes—less than half the national average of 65.4%. Yet home values are $955,095 (2.5x national) and rent averages $2,267/month. This is a market of wealthy renters with no equity—all disposable income goes to lifestyle, not property.',
    marketingImplication: 'Skip home improvement; focus on experiences, fashion, dining, and portable luxury. NYC consumers invest in themselves, not their homes.',
    category: 'Geographic Markets',
    tags: ['NYC', 'renters', 'luxury', 'lifestyle', 'experiences'],
  },

  // CITY INSIGHTS - LOS ANGELES
  {
    id: 'city-la-1',
    headline: '1 in 5 LA Workers Is a Boss',
    didYouKnow: 'Los Angeles has a 20.2% self-employment rate—71% higher than the national average of 11.8%. Combined with the largest family sizes among major metros (3.47 people), LA is a city of entrepreneurial families running side businesses.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates strongly. Position products as business tools, not just personal items.',
    category: 'Geographic Markets',
    tags: ['LA', 'entrepreneurs', 'self-employed', 'families', 'B2B'],
  },
  {
    id: 'city-la-2',
    headline: 'LA Families Rent, Don\'t Buy',
    didYouKnow: 'Only 29.2% of Angelenos own homes—lower than even Brooklyn (30%). Yet average family size is 3.47—the largest among top 10 cities. LA families are renting large apartments and houses, not buying. Home values hit $972K.',
    marketingImplication: 'Focus on flexible, rental-friendly products. No permanent installations. Emphasize family utility in limited space.',
    category: 'Geographic Markets',
    tags: ['LA', 'renters', 'families', 'housing', 'flexible'],
  },

  // CITY INSIGHTS - CHICAGO
  {
    id: 'city-chicago-1',
    headline: 'Chicago\'s 34-Minute Commutes',
    didYouKnow: 'Chicago\'s average commute is 33.7 minutes—26% longer than the national average of 26.7 minutes. That\'s 58 extra hours per year stuck in transit. Combined with 17.2% in their 20s, Chicago has young professionals losing time to commutes.',
    marketingImplication: 'Podcast advertising, mobile commerce, and time-saving products dominate here. Audio content reaches Chicago audiences during their extended L train rides.',
    category: 'Geographic Markets',
    tags: ['Chicago', 'commute', 'podcasts', 'mobile', 'young-professionals'],
  },
  {
    id: 'city-chicago-2',
    headline: 'Chicago: Smart But Single',
    didYouKnow: 'Chicago residents are 41.8% college-educated (+21% vs national) but only 35.7% married (-25% vs national). This is a city of educated singles and unmarried partners—the opposite of suburban family life.',
    marketingImplication: 'Singles marketing, dating apps, and individual-focused products outperform family positioning. Emphasize personal growth and social life.',
    category: 'Geographic Markets',
    tags: ['Chicago', 'singles', 'educated', 'dating', 'urban'],
  },

  // CITY INSIGHTS - HOUSTON
  {
    id: 'city-houston-1',
    headline: 'Houston\'s Big Family Culture',
    didYouKnow: 'Houston\'s average family size is 3.35 people—the second-largest among top 10 cities. Combined with 15.5% in their 20s and a median age of just 34.4 (5 years younger than national), Houston is a city of young, growing families.',
    marketingImplication: 'Family-size products, bulk buying, and kid-focused marketing will overperform. Position for the whole household.',
    category: 'Geographic Markets',
    tags: ['Houston', 'families', 'young', 'bulk', 'kids'],
  },
  {
    id: 'city-houston-2',
    headline: 'Houston: Hustle City USA',
    didYouKnow: 'Houston\'s self-employment rate is 17.4%—47% higher than the 11.8% national average. Despite below-average incomes ($69,772), Houstonians are starting businesses at exceptional rates.',
    marketingImplication: 'Side-hustle messaging and business tools resonate. Position as investments in future success, not luxury indulgences.',
    category: 'Geographic Markets',
    tags: ['Houston', 'entrepreneurs', 'side-hustle', 'business', 'hustle'],
  },

  // CITY INSIGHTS - BROOKLYN
  {
    id: 'city-brooklyn-1',
    headline: '$963K Homes, 70% Renters',
    didYouKnow: 'Brooklyn median home values are $962,843—2.5x the national average—yet only 30% of residents own homes. This is a borough of million-dollar properties occupied by renters paying $1,865/month.',
    marketingImplication: 'Luxury lifestyle products work—but not home-focused ones. Brooklyn consumers want experiences, fashion, and food.',
    category: 'Geographic Markets',
    tags: ['Brooklyn', 'renters', 'luxury', 'lifestyle', 'expensive'],
  },
  {
    id: 'city-brooklyn-2',
    headline: 'Brooklyn\'s 42-Min Commutes',
    didYouKnow: 'Brooklyn\'s average commute is 42.1 minutes—the longest of any major city, 58% above national average. That\'s 137 extra hours per year—nearly 6 full days—lost to commuting.',
    marketingImplication: 'Audio content, mobile apps, and commuter-friendly products dominate. Brooklyn audiences are captive on the subway.',
    category: 'Geographic Markets',
    tags: ['Brooklyn', 'commute', 'subway', 'mobile', 'audio'],
  },

  // CITY INSIGHTS - MIAMI
  {
    id: 'city-miami-1',
    headline: 'Miami: 22% Self-Employed',
    didYouKnow: 'Miami\'s self-employment rate is 22.2%—the highest of any top 10 city—88% above national average. Combined with an older population (23.3% over 60), Miami is a city of established entrepreneurs.',
    marketingImplication: 'Business-owner messaging works at scale. Miami consumers are decision-makers, not employees.',
    category: 'Geographic Markets',
    tags: ['Miami', 'entrepreneurs', 'self-employed', 'established', 'B2B'],
  },
  {
    id: 'city-miami-2',
    headline: 'Miami Is the Oldest Big City',
    didYouKnow: 'Miami\'s median age is 41.2 years—nearly 2 years older than the national average of 39.3. It\'s the only major city with an older-than-average population. Combined with 53.8% homeownership, this is established wealth.',
    marketingImplication: 'Don\'t over-index on youth marketing in Miami. Quality, reliability, and luxury resonate more than trends.',
    category: 'Geographic Markets',
    tags: ['Miami', 'seniors', 'established', 'wealth', 'luxury'],
  },

  // CITY INSIGHTS - PHOENIX
  {
    id: 'city-phoenix-1',
    headline: 'Phoenix Has 27% Fewer Seniors',
    didYouKnow: 'Only 17.1% of Phoenix residents are 60+—compared to 23.3% nationally. Combined with a median age of 35.1, Phoenix is rapidly becoming a young professional magnet, not a retirement destination.',
    marketingImplication: 'Pivot from senior-focused marketing. Phoenix is attracting young families and remote workers.',
    category: 'Geographic Markets',
    tags: ['Phoenix', 'young', 'remote-work', 'growth', 'families'],
  },
  {
    id: 'city-phoenix-2',
    headline: 'Phoenix: Dual-Income Boom',
    didYouKnow: 'Phoenix\'s dual-income household rate is 55.7%—4% above national average. Combined with 15.5% in their 20s and larger families (3.33), Phoenix is a city of young working couples starting families.',
    marketingImplication: 'Time-saving and family convenience products dominate. Both parents work—efficiency is the value proposition.',
    category: 'Geographic Markets',
    tags: ['Phoenix', 'dual-income', 'families', 'convenience', 'efficiency'],
  },

  // CITY INSIGHTS - PHILADELPHIA
  {
    id: 'city-philly-1',
    headline: 'Philly: Lowest Major City Income',
    didYouKnow: 'Philadelphia\'s median household income is just $61,810—27% below the national average of $84,386. Only 28.1% earn six figures (vs. 39.2% nationally). Philly is a value-conscious market.',
    marketingImplication: 'Price sensitivity is real. Lead with value, deals, and affordability. Premium positioning will underperform.',
    category: 'Geographic Markets',
    tags: ['Philadelphia', 'budget', 'value', 'deals', 'affordability'],
  },
  {
    id: 'city-philly-2',
    headline: 'Philly: Only 32% Married',
    didYouKnow: 'Only 31.9% of Philadelphians are married—the lowest of any top 10 city, 33% below the national average. Combined with lower incomes and 15.9% in their 20s, this is a young, single, budget-conscious market.',
    marketingImplication: 'Singles and young professional marketing works. Skip family-oriented messaging. Emphasize affordability.',
    category: 'Geographic Markets',
    tags: ['Philadelphia', 'singles', 'young', 'budget', 'affordable'],
  },

  // CITY INSIGHTS - SAN ANTONIO
  {
    id: 'city-sanantonio-1',
    headline: 'Cheapest Homes, Biggest Families',
    didYouKnow: 'San Antonio\'s median home value is just $246,721—35% below national average. Yet family sizes are 3.37—the largest of any top 10 city. Affordable housing + big families = value-driven households.',
    marketingImplication: 'Family-size value packs and bulk offerings will dominate. These are budget-conscious families maximizing value.',
    category: 'Geographic Markets',
    tags: ['San Antonio', 'affordable', 'families', 'bulk', 'value'],
  },
  {
    id: 'city-sanantonio-2',
    headline: 'San Antonio Gives 25% Less',
    didYouKnow: 'Only 16.5% of San Antonians give to charity—compared to 22.1% nationally. This isn\'t a values-driven market. Combined with lower incomes ($73,438), practical concerns outweigh cause marketing.',
    marketingImplication: 'Skip cause marketing and social impact messaging. Focus on practical benefits and savings instead.',
    category: 'Geographic Markets',
    tags: ['San Antonio', 'practical', 'value', 'savings', 'budget'],
  },

  // CITY INSIGHTS - LAS VEGAS
  {
    id: 'city-vegas-1',
    headline: 'Vegas: Fewest College Grads',
    didYouKnow: 'Only 26.4% of Las Vegas residents are college-educated—the lowest of any top 10 city, 24% below national average. This is a trade and service economy, not a knowledge economy.',
    marketingImplication: 'Skip intellectual or aspirational messaging. Practical, entertainment-focused marketing resonates. Keep it simple.',
    category: 'Geographic Markets',
    tags: ['Las Vegas', 'practical', 'entertainment', 'simple', 'service'],
  },
  {
    id: 'city-vegas-2',
    headline: 'Vegas Has Shortest Commutes',
    didYouKnow: 'Vegas commuters spend just 25.1 minutes in transit—6% below national average. Combined with 54.3% homeownership and affordable housing ($379,684), Vegas offers suburban convenience with urban entertainment.',
    marketingImplication: 'Time savings isn\'t the value proposition here—people already have time. Focus on experience and entertainment instead.',
    category: 'Geographic Markets',
    tags: ['Las Vegas', 'entertainment', 'convenience', 'affordable', 'experience'],
  },

  // PARADOXICAL PAIRINGS - Cross-Purchase Overlap Insights
  {
    id: 'paradox-1',
    headline: 'Luxury Watch Buyers Love Budget Airlines',
    didYouKnow: 'Shoppers who purchase luxury watches ($500+) have a 73% overlap with budget airline bookers. These consumers earn $112,000 median income and are 52% more likely to be self-employed. They splurge on visible status symbols but optimize on invisible expenses.',
    marketingImplication: 'Luxury doesn\'t mean wasteful. Premium brands can partner with value services—these consumers appreciate smart spending on what matters to them personally.',
    category: 'Data Discoveries',
    tags: ['luxury', 'travel', 'budget', 'paradox', 'status'],
  },
  {
    id: 'paradox-2',
    headline: 'Organic Shoppers Hit the Drive-Thru',
    didYouKnow: 'Organic food buyers have a 61% cross-purchase overlap with fast food delivery. They earn $94,200 median income and are 47% dual-income households. Health-conscious at the grocery store, convenience-driven at mealtime.',
    marketingImplication: 'Don\'t assume organic buyers reject convenience. Fast-casual healthy options and "better-for-you" fast food will capture this time-starved, health-aware segment.',
    category: 'Data Discoveries',
    tags: ['organic', 'fast food', 'convenience', 'health', 'paradox'],
  },
  {
    id: 'paradox-3',
    headline: 'Yoga Mats Meet Gaming Chairs',
    didYouKnow: 'Yoga equipment purchasers show 58% overlap with video gaming accessories. Both groups are 46% STEM-educated and earn $89,000 median. The stereotype of the "wellness person" vs. "gamer" is false—they\'re often the same person.',
    marketingImplication: 'Wellness and gaming audiences aren\'t opposites. Market recovery, posture, and "performance optimization" to gamers; market stress relief and mental breaks to yoga practitioners.',
    category: 'Data Discoveries',
    tags: ['yoga', 'gaming', 'wellness', 'STEM', 'paradox'],
  },
  {
    id: 'paradox-4',
    headline: 'Wine Collectors Drink Energy Drinks',
    didYouKnow: 'Fine wine purchasers ($50+ bottles) have 54% overlap with energy drink buyers. Both segments skew 38% age 30-44, earn $98,000 median, and work 47+ hours weekly. Sophistication by night, productivity by day.',
    marketingImplication: 'Premium beverage brands shouldn\'t silo their audiences. Wine clubs can promote "morning after" energy partnerships; energy drinks can target evening wine consumers for next-day recovery.',
    category: 'Data Discoveries',
    tags: ['wine', 'energy drinks', 'beverage', 'lifestyle', 'paradox'],
  },
  {
    id: 'paradox-5',
    headline: 'Eco-Friendly Buyers Drive SUVs',
    didYouKnow: 'Sustainable/eco-friendly product buyers show 67% overlap with SUV and truck accessory purchasers. They\'re 64% homeowners with 3.2 average family size. Environmental values don\'t override family practicality.',
    marketingImplication: 'Green marketing works for family vehicles. Emphasize fuel efficiency, hybrid options, and sustainable materials—don\'t assume eco-conscious means anti-SUV.',
    category: 'Data Discoveries',
    tags: ['eco-friendly', 'SUV', 'family', 'sustainability', 'paradox'],
  },
  {
    id: 'paradox-6',
    headline: 'Skincare Enthusiasts Buy Power Tools',
    didYouKnow: 'Premium skincare buyers ($75+ products) have 49% overlap with power tool purchasers. Both groups are 58% homeowners earning $91,000 median. Self-care and home improvement aren\'t gendered—they\'re lifestyle investments.',
    marketingImplication: 'Home improvement retailers should stock premium personal care. Beauty brands can target DIY audiences. Both represent investment in "upgrading" life quality.',
    category: 'Data Discoveries',
    tags: ['skincare', 'power tools', 'DIY', 'self-care', 'paradox'],
  },
  {
    id: 'paradox-7',
    headline: 'Meditation App Users Love Extreme Sports',
    didYouKnow: 'Meditation and mindfulness app subscribers show 52% overlap with extreme sports gear buyers (skiing, surfing, climbing). Both groups are 44% college-educated with $87,000 median income. Calm and adrenaline aren\'t opposites—they\'re balance.',
    marketingImplication: 'Adventure brands should incorporate recovery and mental preparation messaging. Meditation apps can target athletes seeking performance edges and post-activity wind-down.',
    category: 'Data Discoveries',
    tags: ['meditation', 'extreme sports', 'adventure', 'balance', 'paradox'],
  },
  {
    id: 'paradox-8',
    headline: 'Gourmet Coffee Lovers Shop at Dollar Stores',
    didYouKnow: 'Specialty coffee buyers ($15+ per pound) have 56% overlap with dollar store shoppers. They earn $82,000 median income—above average—but prioritize spending on passion categories while economizing elsewhere.',
    marketingImplication: 'Premium doesn\'t mean premium everywhere. Gourmet brands can emphasize "affordable luxury"—one area where consumers treat themselves while saving in other categories.',
    category: 'Data Discoveries',
    tags: ['coffee', 'dollar store', 'value', 'premium', 'paradox'],
  },
  {
    id: 'paradox-9',
    headline: 'Designer Bag Buyers Do DIY Home Repair',
    didYouKnow: 'Luxury handbag purchasers ($300+) show 47% overlap with DIY home repair product buyers. Both groups are 61% homeowners with $104,000 median income. Status in public, practicality at home.',
    marketingImplication: 'Luxury consumers aren\'t helpless. Hardware stores can create premium DIY experiences; luxury brands can highlight durability and craftsmanship that appeals to hands-on consumers.',
    category: 'Data Discoveries',
    tags: ['luxury', 'DIY', 'home repair', 'handbags', 'paradox'],
  },
  {
    id: 'paradox-10',
    headline: 'Plant-Based Eaters Buy Hunting Gear',
    didYouKnow: 'Plant-based food buyers have 31% overlap with hunting and fishing equipment—higher than expected. These consumers are 71% rural/suburban, earn $76,000 median, and value self-sufficiency. Ethical eating and outdoor lifestyle coexist.',
    marketingImplication: 'Plant-based brands shouldn\'t avoid outdoor/rural audiences. Emphasize sustainability, land stewardship, and natural living—values shared with ethical hunters.',
    category: 'Data Discoveries',
    tags: ['plant-based', 'hunting', 'outdoor', 'sustainability', 'paradox'],
  },
  {
    id: 'paradox-11',
    headline: 'Luxury Bedding Buyers Love Fast Fashion',
    didYouKnow: 'Premium bedding purchasers ($200+ sheet sets) show 59% overlap with fast fashion buyers (H&M, Zara, Shein). They earn $88,000 median and are 34% in their 30s. Private luxury, public trends.',
    marketingImplication: 'Home luxury and fashion disposability aren\'t contradictions. Bedding brands can emphasize "investment pieces" while fast fashion can promote bedroom/loungewear crossover.',
    category: 'Data Discoveries',
    tags: ['bedding', 'fast fashion', 'luxury', 'home', 'paradox'],
  },
  {
    id: 'paradox-12',
    headline: 'Premium Pet Food Buyers Use Budget Electronics',
    didYouKnow: 'Buyers of premium pet food ($60+ per bag) have 53% overlap with budget electronics purchasers. They earn $79,000 median income. They\'ll spare no expense for their pets but optimize on personal tech.',
    marketingImplication: 'Pet parents prioritize their animals over themselves. Budget tech brands can target pet owners; premium pet brands can emphasize "your pet deserves better than you settle for."',
    category: 'Data Discoveries',
    tags: ['pet food', 'electronics', 'budget', 'premium', 'paradox'],
  },
  {
    id: 'paradox-13',
    headline: 'Artisan Cheese Lovers Are Hardcore Gamers',
    didYouKnow: 'Specialty cheese buyers ($20+ purchases) show 44% overlap with video game console purchasers. Both groups are 41% college-educated, earn $91,000 median, and are 52% male. Foodie culture and gaming culture overlap significantly.',
    marketingImplication: 'Gaming snack partnerships should go upscale. Artisan food brands can target gaming audiences for watch parties, streaming snacks, and "level up your snack game" positioning.',
    category: 'Data Discoveries',
    tags: ['cheese', 'gaming', 'foodie', 'snacks', 'paradox'],
  },
  {
    id: 'paradox-14',
    headline: 'Thread Count Obsessives Go Camping',
    didYouKnow: 'High-thread-count sheet buyers (600+ TC) have 48% overlap with camping gear purchasers. Both groups are 63% homeowners with $93,000 median income. Comfort at home doesn\'t mean roughing it is off the table.',
    marketingImplication: 'Camping brands can market "glamping" and comfort-focused outdoor experiences. Bedding brands can create travel/camping lines for consumers who want quality everywhere.',
    category: 'Data Discoveries',
    tags: ['bedding', 'camping', 'outdoor', 'comfort', 'paradox'],
  },
  {
    id: 'paradox-15',
    headline: 'Craft Beer Fans Buy the Most Baby Products',
    didYouKnow: 'Craft beer purchasers show 62% overlap with baby product buyers—the highest of any alcohol category. They\'re 51% married, 35% in their 30s, and earn $87,000 median. The craft beer dad is a real demographic.',
    marketingImplication: 'Baby brands can target craft beer venues and audiences. Breweries can create family-friendly experiences and "dad life" marketing that resonates with new parents.',
    category: 'Data Discoveries',
    tags: ['craft beer', 'baby', 'parenting', 'dad', 'paradox'],
  },
  {
    id: 'paradox-16',
    headline: 'Investment App Users Buy Tattoo Supplies',
    didYouKnow: 'Users of investment/trading apps show 39% overlap with tattoo supply purchasers. Both groups are 29% in their 20s, 47% STEM-educated, and earn $94,000 median. Financial prudence and self-expression coexist.',
    marketingImplication: 'Fintech brands can embrace edgier creative audiences. Tattoo brands can emphasize the "investment in yourself" narrative that resonates with financially-savvy consumers.',
    category: 'Data Discoveries',
    tags: ['investing', 'tattoo', 'fintech', 'self-expression', 'paradox'],
  },
  {
    id: 'paradox-17',
    headline: 'Book Lovers Collect Sneakers',
    didYouKnow: 'Frequent book buyers (5+ per month) have 51% overlap with sneaker collectors ($150+ shoes). Both groups are 39% college-educated with $86,000 median income. Intellectual and streetwear cultures share passionate collectors.',
    marketingImplication: 'Bookstores can host sneaker events; sneaker brands can do author collaborations. Both audiences value curation, limited editions, and cultural significance.',
    category: 'Data Discoveries',
    tags: ['books', 'sneakers', 'collectors', 'culture', 'paradox'],
  },
  {
    id: 'paradox-18',
    headline: 'Spa Regulars Shop for Auto Parts',
    didYouKnow: 'Frequent spa service users show 43% overlap with auto parts purchasers. Both groups are 57% homeowners earning $84,000 median. Self-care extends to car care—both represent maintenance investments.',
    marketingImplication: 'Auto parts retailers can create "self-care for your car" messaging. Spas can partner with detailing services. Both audiences value maintenance and longevity.',
    category: 'Data Discoveries',
    tags: ['spa', 'auto', 'self-care', 'maintenance', 'paradox'],
  },
  {
    id: 'paradox-19',
    headline: 'Fine Dining Lovers Shop Dollar Stores',
    didYouKnow: 'Fine dining restaurant visitors ($100+ checks) have 48% overlap with dollar store shoppers. They earn $97,000 median income but are strategic spenders—splurging on experiences while economizing on commodities.',
    marketingImplication: 'Experience-focused marketing wins with this segment. Fine dining can emphasize "worth the splurge" positioning; dollar stores can target experience-seekers for everyday basics.',
    category: 'Data Discoveries',
    tags: ['fine dining', 'dollar store', 'experiences', 'value', 'paradox'],
  },
  {
    id: 'paradox-20',
    headline: 'Classical Music Fans Buy Streetwear',
    didYouKnow: 'Classical music streaming subscribers show 46% overlap with streetwear purchasers (Supreme, Off-White). Both groups are 44% college-educated, 31% in their 20s-30s, and earn $89,000 median. High culture and street culture are merging.',
    marketingImplication: 'Orchestras can embrace streetwear collaborations. Streetwear brands can tap classical aesthetics. This generation doesn\'t see cultural boundaries—neither should marketers.',
    category: 'Data Discoveries',
    tags: ['classical music', 'streetwear', 'culture', 'fashion', 'paradox'],
  },
  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'income-3d-printers',
    headline: '3D Printers Buyers Earn +37% More',
    didYouKnow: '3D Printers shoppers have a median household income of $97,280—38.1% above the national average of $70,784. They\'re also 56.4% college-educated.',
    marketingImplication: 'Premium positioning and quality messaging will resonate. These buyers can afford and expect the best.',
    category: 'Consumer Profiles',
    tags: ['3d printers', 'income', 'affluent', 'premium'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'stem-3d-printers',
    headline: '3D Printers Shoppers: 51.4% STEM-Educated',
    didYouKnow: '3D Printers buyers have one of the highest STEM education rates at 51.4%—+49% above the national average. These are analytical, data-driven decision-makers.',
    marketingImplication: 'Lead with specifications, comparisons, and evidence-based claims. These buyers research thoroughly before purchasing.',
    category: 'Consumer Profiles',
    tags: ['3d printers', 'STEM', 'education', 'analytical'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'income-activewear',
    headline: 'Activewear Buyers Earn +36% More',
    didYouKnow: 'Activewear shoppers have a median household income of $96,465—37.0% above the national average of $70,784. They\'re also 57.4% college-educated.',
    marketingImplication: 'Premium positioning and quality messaging will resonate. These buyers can afford and expect the best.',
    category: 'Consumer Profiles',
    tags: ['activewear', 'income', 'affluent', 'premium'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'stem-activewear',
    headline: 'Activewear Shoppers: 51.2% STEM-Educated',
    didYouKnow: 'Activewear buyers have one of the highest STEM education rates at 51.2%—+48% above the national average. These are analytical, data-driven decision-makers.',
    marketingImplication: 'Lead with specifications, comparisons, and evidence-based claims. These buyers research thoroughly before purchasing.',
    category: 'Consumer Profiles',
    tags: ['activewear', 'STEM', 'education', 'analytical'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'income-agriculture',
    headline: 'Agriculture Buyers Earn +36% More',
    didYouKnow: 'Agriculture shoppers have a median household income of $96,133—36.5% above the national average of $70,784. They\'re also 57.3% college-educated.',
    marketingImplication: 'Premium positioning and quality messaging will resonate. These buyers can afford and expect the best.',
    category: 'Consumer Profiles',
    tags: ['agriculture', 'income', 'affluent', 'premium'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'stem-agriculture',
    headline: 'Agriculture Shoppers: 51.2% STEM-Educated',
    didYouKnow: 'Agriculture buyers have one of the highest STEM education rates at 51.2%—+48% above the national average. These are analytical, data-driven decision-makers.',
    marketingImplication: 'Lead with specifications, comparisons, and evidence-based claims. These buyers research thoroughly before purchasing.',
    category: 'Consumer Profiles',
    tags: ['agriculture', 'STEM', 'education', 'analytical'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'income-alcoholic-beverages',
    headline: 'Alcoholic Beverages Buyers Earn +40% More',
    didYouKnow: 'Alcoholic Beverages shoppers have a median household income of $98,954—40.5% above the national average of $70,784. They\'re also 58.4% college-educated.',
    marketingImplication: 'Premium positioning and quality messaging will resonate. These buyers can afford and expect the best.',
    category: 'Consumer Profiles',
    tags: ['alcoholic beverages', 'income', 'affluent', 'premium'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'stem-alcoholic-beverages',
    headline: 'Alcoholic Beverages Shoppers: 50.5% STEM-Educated',
    didYouKnow: 'Alcoholic Beverages buyers have one of the highest STEM education rates at 50.5%—+46% above the national average. These are analytical, data-driven decision-makers.',
    marketingImplication: 'Lead with specifications, comparisons, and evidence-based claims. These buyers research thoroughly before purchasing.',
    category: 'Consumer Profiles',
    tags: ['alcoholic beverages', 'STEM', 'education', 'analytical'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'income-animals-pet-supplies',
    headline: 'Animals & Pet Supplies Buyers Earn +41% More',
    didYouKnow: 'Animals & Pet Supplies shoppers have a median household income of $99,590—41.4% above the national average of $70,784. They\'re also 57.2% college-educated.',
    marketingImplication: 'Premium positioning and quality messaging will resonate. These buyers can afford and expect the best.',
    category: 'Consumer Profiles',
    tags: ['animals & pet supplies', 'income', 'affluent', 'premium'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'stem-animals-pet-supplies',
    headline: 'Animals & Pet Supplies Shoppers: 51.6% STEM-Educated',
    didYouKnow: 'Animals & Pet Supplies buyers have one of the highest STEM education rates at 51.6%—+49% above the national average. These are analytical, data-driven decision-makers.',
    marketingImplication: 'Lead with specifications, comparisons, and evidence-based claims. These buyers research thoroughly before purchasing.',
    category: 'Consumer Profiles',
    tags: ['animals & pet supplies', 'STEM', 'education', 'analytical'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'income-antivirus-security-software',
    headline: 'Antivirus & Security Software Buyers Earn +28% More',
    didYouKnow: 'Antivirus & Security Software shoppers have a median household income of $90,459—28.5% above the national average of $70,784. They\'re also 53.5% college-educated.',
    marketingImplication: 'These consumers have discretionary income for considered purchases. Value-add messaging outperforms discount-driven approaches.',
    category: 'Consumer Profiles',
    tags: ['antivirus & security software', 'income', 'affluent', 'premium'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'stem-antivirus-security-software',
    headline: 'Antivirus & Security Software Shoppers: 50.5% STEM-Educated',
    didYouKnow: 'Antivirus & Security Software buyers have one of the highest STEM education rates at 50.5%—+46% above the national average. These are analytical, data-driven decision-makers.',
    marketingImplication: 'Lead with specifications, comparisons, and evidence-based claims. These buyers research thoroughly before purchasing.',
    category: 'Consumer Profiles',
    tags: ['antivirus & security software', 'STEM', 'education', 'analytical'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'income-arcade-equipment',
    headline: 'Arcade Equipment Buyers Earn +40% More',
    didYouKnow: 'Arcade Equipment shoppers have a median household income of $98,782—40.3% above the national average of $70,784. They\'re also 54.6% college-educated.',
    marketingImplication: 'Premium positioning and quality messaging will resonate. These buyers can afford and expect the best.',
    category: 'Consumer Profiles',
    tags: ['arcade equipment', 'income', 'affluent', 'premium'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'stem-arcade-equipment',
    headline: 'Arcade Equipment Shoppers: 49.2% STEM-Educated',
    didYouKnow: 'Arcade Equipment buyers have one of the highest STEM education rates at 49.2%—+42% above the national average. These are analytical, data-driven decision-makers.',
    marketingImplication: 'Lead with specifications, comparisons, and evidence-based claims. These buyers research thoroughly before purchasing.',
    category: 'Consumer Profiles',
    tags: ['arcade equipment', 'STEM', 'education', 'analytical'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'income-arts-entertainment',
    headline: 'Arts & Entertainment Buyers Earn +39% More',
    didYouKnow: 'Arts & Entertainment shoppers have a median household income of $98,114—39.3% above the national average of $70,784. They\'re also 53.8% college-educated.',
    marketingImplication: 'Premium positioning and quality messaging will resonate. These buyers can afford and expect the best.',
    category: 'Consumer Profiles',
    tags: ['arts & entertainment', 'income', 'affluent', 'premium'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'stem-arts-entertainment',
    headline: 'Arts & Entertainment Shoppers: 50.4% STEM-Educated',
    didYouKnow: 'Arts & Entertainment buyers have one of the highest STEM education rates at 50.4%—+46% above the national average. These are analytical, data-driven decision-makers.',
    marketingImplication: 'Lead with specifications, comparisons, and evidence-based claims. These buyers research thoroughly before purchasing.',
    category: 'Consumer Profiles',
    tags: ['arts & entertainment', 'STEM', 'education', 'analytical'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'income-athletics',
    headline: 'Athletics Buyers Earn +44% More',
    didYouKnow: 'Athletics shoppers have a median household income of $101,799—44.6% above the national average of $70,784. They\'re also 58.0% college-educated.',
    marketingImplication: 'Premium positioning and quality messaging will resonate. These buyers can afford and expect the best.',
    category: 'Consumer Profiles',
    tags: ['athletics', 'income', 'affluent', 'premium'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'stem-athletics',
    headline: 'Athletics Shoppers: 50.3% STEM-Educated',
    didYouKnow: 'Athletics buyers have one of the highest STEM education rates at 50.3%—+45% above the national average. These are analytical, data-driven decision-makers.',
    marketingImplication: 'Lead with specifications, comparisons, and evidence-based claims. These buyers research thoroughly before purchasing.',
    category: 'Consumer Profiles',
    tags: ['athletics', 'STEM', 'education', 'analytical'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'entrepreneur-3d-printers',
    headline: '16.7% of 3D Printers Buyers Are Self-Employed',
    didYouKnow: '3D Printers shoppers have a 16.7% self-employment rate—+42% above the national average of 11.8%. Many are entrepreneurs, freelancers, or small business owners.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates. Position products as business investments, not just personal purchases.',
    category: 'Lifestyle & Values',
    tags: ['3d printers', 'entrepreneurs', 'self-employed', 'business'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'entrepreneur-activewear',
    headline: '17.2% of Activewear Buyers Are Self-Employed',
    didYouKnow: 'Activewear shoppers have a 17.2% self-employment rate—+46% above the national average of 11.8%. Many are entrepreneurs, freelancers, or small business owners.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates. Position products as business investments, not just personal purchases.',
    category: 'Lifestyle & Values',
    tags: ['activewear', 'entrepreneurs', 'self-employed', 'business'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'entrepreneur-agriculture',
    headline: '16.2% of Agriculture Buyers Are Self-Employed',
    didYouKnow: 'Agriculture shoppers have a 16.2% self-employment rate—+37% above the national average of 11.8%. Many are entrepreneurs, freelancers, or small business owners.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates. Position products as business investments, not just personal purchases.',
    category: 'Lifestyle & Values',
    tags: ['agriculture', 'entrepreneurs', 'self-employed', 'business'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'entrepreneur-alcoholic-beverages',
    headline: '16.8% of Alcoholic Beverages Buyers Are Self-Employed',
    didYouKnow: 'Alcoholic Beverages shoppers have a 16.8% self-employment rate—+43% above the national average of 11.8%. Many are entrepreneurs, freelancers, or small business owners.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates. Position products as business investments, not just personal purchases.',
    category: 'Lifestyle & Values',
    tags: ['alcoholic beverages', 'entrepreneurs', 'self-employed', 'business'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'dual-income-alcoholic-beverages',
    headline: '58.5% of Alcoholic Beverages Buyers Are Dual-Income',
    didYouKnow: 'Alcoholic Beverages households are 58.5% dual-income—+10% above the national average. Time is their scarcest resource.',
    marketingImplication: 'Lead with convenience and time-saving benefits. "Save 10 hours per month" resonates more than "Save $50."',
    category: 'Lifestyle & Values',
    tags: ['alcoholic beverages', 'dual-income', 'time-saving', 'convenience'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'entrepreneur-animals-pet-supplies',
    headline: '16.6% of Animals & Pet Supplies Buyers Are Self-Employed',
    didYouKnow: 'Animals & Pet Supplies shoppers have a 16.6% self-employment rate—+41% above the national average of 11.8%. Many are entrepreneurs, freelancers, or small business owners.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates. Position products as business investments, not just personal purchases.',
    category: 'Lifestyle & Values',
    tags: ['animals & pet supplies', 'entrepreneurs', 'self-employed', 'business'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'entrepreneur-antivirus-security-software',
    headline: '17.1% of Antivirus & Security Software Buyers Are Self-Employed',
    didYouKnow: 'Antivirus & Security Software shoppers have a 17.1% self-employment rate—+45% above the national average of 11.8%. Many are entrepreneurs, freelancers, or small business owners.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates. Position products as business investments, not just personal purchases.',
    category: 'Lifestyle & Values',
    tags: ['antivirus & security software', 'entrepreneurs', 'self-employed', 'business'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'entrepreneur-arcade-equipment',
    headline: '17.2% of Arcade Equipment Buyers Are Self-Employed',
    didYouKnow: 'Arcade Equipment shoppers have a 17.2% self-employment rate—+45% above the national average of 11.8%. Many are entrepreneurs, freelancers, or small business owners.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates. Position products as business investments, not just personal purchases.',
    category: 'Lifestyle & Values',
    tags: ['arcade equipment', 'entrepreneurs', 'self-employed', 'business'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'entrepreneur-arts-entertainment',
    headline: '17.1% of Arts & Entertainment Buyers Are Self-Employed',
    didYouKnow: 'Arts & Entertainment shoppers have a 17.1% self-employment rate—+45% above the national average of 11.8%. Many are entrepreneurs, freelancers, or small business owners.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates. Position products as business investments, not just personal purchases.',
    category: 'Lifestyle & Values',
    tags: ['arts & entertainment', 'entrepreneurs', 'self-employed', 'business'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'entrepreneur-athletics',
    headline: '17.4% of Athletics Buyers Are Self-Employed',
    didYouKnow: 'Athletics shoppers have a 17.4% self-employment rate—+47% above the national average of 11.8%. Many are entrepreneurs, freelancers, or small business owners.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates. Position products as business investments, not just personal purchases.',
    category: 'Lifestyle & Values',
    tags: ['athletics', 'entrepreneurs', 'self-employed', 'business'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'geo-3d-printers-phoenix',
    headline: 'Phoenix: 1159x Over-Index for 3D Printers',
    didYouKnow: 'Phoenix, Arizona over-indexes for 3D Printers shoppers by 115,932.136%—that\'s 1159x the national average. This ZIP (85003) has a concentration of 985 active buyers.',
    marketingImplication: 'Hyperlocal targeting in Phoenix will dramatically outperform broad geo-targeting. Consider OOH, local partnerships, and geo-fenced digital campaigns.',
    category: 'Geographic Markets',
    tags: ['3d printers', 'phoenix', 'arizona', 'geographic', 'over-index'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'geo-activewear-miami',
    headline: 'Miami: 201x Over-Index for Activewear',
    didYouKnow: 'Miami, Florida over-indexes for Activewear shoppers by 20,093.888%—that\'s 201x the national average. This ZIP (33125) has a concentration of 987 active buyers.',
    marketingImplication: 'Hyperlocal targeting in Miami will dramatically outperform broad geo-targeting. Consider OOH, local partnerships, and geo-fenced digital campaigns.',
    category: 'Geographic Markets',
    tags: ['activewear', 'miami', 'florida', 'geographic', 'over-index'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'geo-agriculture-seattle',
    headline: 'Seattle: 725x Over-Index for Agriculture',
    didYouKnow: 'Seattle, Washington over-indexes for Agriculture shoppers by 72,489.668%—that\'s 725x the national average. This ZIP (98101) has a concentration of 941 active buyers.',
    marketingImplication: 'Hyperlocal targeting in Seattle will dramatically outperform broad geo-targeting. Consider OOH, local partnerships, and geo-fenced digital campaigns.',
    category: 'Geographic Markets',
    tags: ['agriculture', 'seattle', 'washington', 'geographic', 'over-index'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'geo-alcoholic-beverages-new-york',
    headline: 'New York: 230x Over-Index for Alcoholic Beverages',
    didYouKnow: 'New York, New York over-indexes for Alcoholic Beverages shoppers by 22,953.763%—that\'s 230x the national average. This ZIP (10003) has a concentration of 997 active buyers.',
    marketingImplication: 'Hyperlocal targeting in New York will dramatically outperform broad geo-targeting. Consider OOH, local partnerships, and geo-fenced digital campaigns.',
    category: 'Geographic Markets',
    tags: ['alcoholic beverages', 'new york', 'new york', 'geographic', 'over-index'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'geo-animals-pet-supplies-new-york',
    headline: 'New York: 224x Over-Index for Animals & Pet Supplies',
    didYouKnow: 'New York, New York over-indexes for Animals & Pet Supplies shoppers by 22,413.126%—that\'s 224x the national average. This ZIP (10003) has a concentration of 996 active buyers.',
    marketingImplication: 'Hyperlocal targeting in New York will dramatically outperform broad geo-targeting. Consider OOH, local partnerships, and geo-fenced digital campaigns.',
    category: 'Geographic Markets',
    tags: ['animals & pet supplies', 'new york', 'new york', 'geographic', 'over-index'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'geo-antivirus-security-software-san-francisco',
    headline: 'San Francisco: 328x Over-Index for Antivirus & Security Software',
    didYouKnow: 'San Francisco, California over-indexes for Antivirus & Security Software shoppers by 32,787.185%—that\'s 328x the national average. This ZIP (94102) has a concentration of 995 active buyers.',
    marketingImplication: 'Hyperlocal targeting in San Francisco will dramatically outperform broad geo-targeting. Consider OOH, local partnerships, and geo-fenced digital campaigns.',
    category: 'Geographic Markets',
    tags: ['antivirus & security software', 'san francisco', 'california', 'geographic', 'over-index'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'geo-arcade-equipment-los-angeles',
    headline: 'Los Angeles: 285x Over-Index for Arcade Equipment',
    didYouKnow: 'Los Angeles, California over-indexes for Arcade Equipment shoppers by 28,538.742%—that\'s 285x the national average. This ZIP (90005) has a concentration of 993 active buyers.',
    marketingImplication: 'Hyperlocal targeting in Los Angeles will dramatically outperform broad geo-targeting. Consider OOH, local partnerships, and geo-fenced digital campaigns.',
    category: 'Geographic Markets',
    tags: ['arcade equipment', 'los angeles', 'california', 'geographic', 'over-index'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'geo-arts-entertainment-dallas',
    headline: 'Dallas: 414x Over-Index for Arts & Entertainment',
    didYouKnow: 'Dallas, Texas over-indexes for Arts & Entertainment shoppers by 41,441.936%—that\'s 414x the national average. This ZIP (75205) has a concentration of 978 active buyers.',
    marketingImplication: 'Hyperlocal targeting in Dallas will dramatically outperform broad geo-targeting. Consider OOH, local partnerships, and geo-fenced digital campaigns.',
    category: 'Geographic Markets',
    tags: ['arts & entertainment', 'dallas', 'texas', 'geographic', 'over-index'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'geo-athletics-miami',
    headline: 'Miami: 222x Over-Index for Athletics',
    didYouKnow: 'Miami, Florida over-indexes for Athletics shoppers by 22,178.759%—that\'s 222x the national average. This ZIP (33125) has a concentration of 969 active buyers.',
    marketingImplication: 'Hyperlocal targeting in Miami will dramatically outperform broad geo-targeting. Consider OOH, local partnerships, and geo-fenced digital campaigns.',
    category: 'Geographic Markets',
    tags: ['athletics', 'miami', 'florida', 'geographic', 'over-index'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-activewear-outerwear',
    headline: 'Activewear Buyers Also Shop Outerwear',
    didYouKnow: 'Activewear shoppers show a 66% overlap with Outerwear buyers. Both groups share key traits: 57.1% dual-income, $96,465 median income, 51.2% STEM-educated.',
    marketingImplication: 'This 66% overlap indicates a highly engaged audience with strong cross-category purchase intent, representing qualified buyers who demonstrate sophisticated shopping behavior and higher lifetime value potential through their demonstrated cross-category purchase patterns.',
    category: 'Data Discoveries',
    tags: ['activewear', 'outerwear', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-athletics-laptops',
    headline: 'Athletics Buyers Also Shop Laptops',
    didYouKnow: 'Athletics shoppers show a 65% overlap with Laptops buyers. Both groups share key traits: 56.2% dual-income, $101,799 median income, 50.3% STEM-educated.',
    marketingImplication: 'Athletics buyers include remote workers and tech professionals who invest in laptops and computing equipment, creating opportunities for home office products, productivity software, and tech accessories.',
    category: 'Data Discoveries',
    tags: ['athletics', 'laptops', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-athletics-sporting-goods',
    headline: 'Athletics Buyers Also Shop Sporting Goods',
    didYouKnow: 'Athletics shoppers show a 65% overlap with Sporting Goods buyers. Both groups share key traits: 56.2% dual-income, $101,799 median income, 50.3% STEM-educated.',
    marketingImplication: 'This 65% overlap indicates a highly engaged audience with strong cross-category purchase intent, representing qualified buyers who demonstrate sophisticated shopping behavior and higher lifetime value potential through their demonstrated cross-category purchase patterns.',
    category: 'Data Discoveries',
    tags: ['athletics', 'sporting goods', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-athletics-outdoor-recreation',
    headline: 'Athletics Buyers Also Shop Outdoor Recreation',
    didYouKnow: 'Athletics shoppers show a 62% overlap with Outdoor Recreation buyers. Both groups share key traits: 56.2% dual-income, $101,799 median income, 50.3% STEM-educated.',
    marketingImplication: 'This 62% overlap indicates a highly engaged audience with strong cross-category purchase intent, representing qualified buyers who demonstrate sophisticated shopping behavior and higher lifetime value potential through their demonstrated cross-category purchase patterns.',
    category: 'Data Discoveries',
    tags: ['athletics', 'outdoor recreation', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-athletics-shoes',
    headline: 'Athletics Buyers Also Shop Shoes',
    didYouKnow: 'Athletics shoppers show a 61% overlap with Shoes buyers. Both groups share key traits: 56.2% dual-income, $101,799 median income, 50.3% STEM-educated.',
    marketingImplication: 'Athletics buyers often refresh multiple aspects of their lifestyle simultaneously, purchasing clothing and apparel alongside other products as they update their wardrobes and living spaces in coordinated shopping sessions.',
    category: 'Data Discoveries',
    tags: ['athletics', 'shoes', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-athletics-alcoholic-beverages',
    headline: 'Athletics Buyers Also Shop Alcoholic Beverages',
    didYouKnow: 'Athletics shoppers show a 60% overlap with Alcoholic Beverages buyers. Both groups share key traits: 56.2% dual-income, $101,799 median income, 50.3% STEM-educated.',
    marketingImplication: 'Athletics buyers enjoy social entertaining and relaxation rituals, purchasing alcoholic beverages to complement their lifestyle, indicating sophistication and willingness to invest in quality experiences beyond basic necessities.',
    category: 'Data Discoveries',
    tags: ['athletics', 'alcoholic beverages', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-activewear-3d-printers',
    headline: 'Activewear Buyers Also Shop 3D Printers',
    didYouKnow: 'Activewear shoppers show a 55% overlap with 3D Printers buyers. Both groups share key traits: 57.1% dual-income, $96,465 median income, 51.2% STEM-educated.',
    marketingImplication: 'The 55% overlap between activewear and 3D printer buyers reveals a "self-engineered improvement" mindset, driven by a desire to actively control and optimize their personal performance and',
    category: 'Data Discoveries',
    tags: ['activewear', '3d printers', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-activewear-cabinets-storage',
    headline: 'Activewear Buyers Also Shop Cabinets & Storage',
    didYouKnow: 'Activewear shoppers show a 54% overlap with Cabinets & Storage buyers. Both groups share key traits: 57.1% dual-income, $96,465 median income, 51.2% STEM-educated.',
    marketingImplication: 'Buyers of activewear and cabinets & storage embody a **\'foundational control\' mindset**, meticulously investing in systems that optimize both their personal well-being and living spaces.',
    category: 'Data Discoveries',
    tags: ['activewear', 'cabinets & storage', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-activewear-shorts',
    headline: 'Activewear Buyers Also Shop Shorts',
    didYouKnow: 'Activewear shoppers show a 53% overlap with Shorts buyers. Both groups share key traits: 57.1% dual-income, $96,465 median income, 51.2% STEM-educated.',
    marketingImplication: 'The 53% overlap reveals a "seamless transition" mindset among buyers in active, warm climates like Miami and San Francisco, who integrate performance-ready shorts into their daily lives for both',
    category: 'Data Discoveries',
    tags: ['activewear', 'shorts', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-activewear-building-materials',
    headline: 'Activewear Buyers Also Shop Building Materials',
    didYouKnow: 'Activewear shoppers show a 52% overlap with Building Materials buyers. Both groups share key traits: 57.1% dual-income, $96,465 median income, 51.2% STEM-educated.',
    marketingImplication: 'The 52% overlap reveals a "proactive stewardship" mindset: these consumers are driven by a desire to actively cultivate and improve their personal well-being and their physical surroundings.',
    category: 'Data Discoveries',
    tags: ['activewear', 'building materials', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-alcoholic-beverages-sporting-goods',
    headline: 'Alcoholic Beverages Buyers Also Shop Sporting Goods',
    didYouKnow: 'Alcoholic Beverages shoppers show a 49% overlap with Sporting Goods buyers. Both groups share key traits: 58.5% dual-income, $98,954 median income, 50.5% STEM-educated.',
    marketingImplication: 'Moderate 49% overlap indicates strategic consumers who coordinate purchases across sporting goods and alcoholic beverages categories, suggesting sophisticated shopping behavior and higher lifetime value potential through their demonstrated cross-category purchase intent.',
    category: 'Data Discoveries',
    tags: ['alcoholic beverages', 'sporting goods', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-agriculture-lawn-garden',
    headline: 'Agriculture Buyers Also Shop Lawn & Garden',
    didYouKnow: 'Agriculture shoppers show a 45% overlap with Lawn & Garden buyers. Both groups share key traits: 56.1% dual-income, $96,133 median income, 51.2% STEM-educated.',
    marketingImplication: 'Moderate 45% overlap indicates strategic consumers who coordinate purchases across lawn & garden and agriculture categories, suggesting sophisticated shopping behavior and higher lifetime value potential through their demonstrated cross-category purchase intent.',
    category: 'Data Discoveries',
    tags: ['agriculture', 'lawn & garden', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-alcoholic-beverages-laptops',
    headline: 'Alcoholic Beverages Buyers Also Shop Laptops',
    didYouKnow: 'Alcoholic Beverages shoppers show a 42% overlap with Laptops buyers. Both groups share key traits: 58.5% dual-income, $98,954 median income, 50.5% STEM-educated.',
    marketingImplication: 'Alcoholic Beverages buyers include remote workers and tech professionals who invest in laptops and computing equipment, creating opportunities for home office products, productivity software, and tech accessories.',
    category: 'Data Discoveries',
    tags: ['alcoholic beverages', 'laptops', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'paradox-alcoholic-beverages-vehicles-parts',
    headline: 'Alcoholic Beverages Buyers Also Shop Vehicles & Parts',
    didYouKnow: 'Alcoholic Beverages shoppers show a 42% overlap with Vehicles & Parts buyers. Both groups share key traits: 58.5% dual-income, $98,954 median income, 50.5% STEM-educated.',
    marketingImplication: 'Moderate 42% overlap indicates strategic consumers who coordinate purchases across vehicles & parts and alcoholic beverages categories, suggesting sophisticated shopping behavior and higher lifetime value potential through their demonstrated cross-category purchase intent.',
    category: 'Data Discoveries',
    tags: ['alcoholic beverages', 'vehicles & parts', 'cross-purchase', 'paradox', 'overlap'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'city-seattle',
    headline: 'Seattle: Top Market for 9 Categories',
    didYouKnow: 'Seattle, Washington is a geographic hotspot for Activewear, Agriculture, Agriculture, Alcoholic Beverages and 5 more categories. Average shopper income: $100,240.',
    marketingImplication: 'Seattle is a high-value market for multi-category advertisers. Test campaigns here before broader rollout.',
    category: 'Geographic Markets',
    tags: ['seattle', 'washington', 'geographic', 'hotspot', 'multi-category'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'city-dallas',
    headline: 'Dallas: Top Market for 7 Categories',
    didYouKnow: 'Dallas, Texas is a geographic hotspot for 3D Printers, Agriculture, Alcoholic Beverages, Animals & Pet Supplies and 3 more categories. Average shopper income: $96,638.',
    marketingImplication: 'Dallas is a high-value market for multi-category advertisers. Test campaigns here before broader rollout.',
    category: 'Geographic Markets',
    tags: ['dallas', 'texas', 'geographic', 'hotspot', 'multi-category'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'city-san-francisco',
    headline: 'San Francisco: Top Market for 7 Categories',
    didYouKnow: 'San Francisco, California is a geographic hotspot for 3D Printers, Animals & Pet Supplies, Antivirus & Security Software, Arcade Equipment and 3 more categories. Average shopper income: $99,009.',
    marketingImplication: 'San Francisco is a high-value market for multi-category advertisers. Test campaigns here before broader rollout.',
    category: 'Geographic Markets',
    tags: ['san francisco', 'california', 'geographic', 'hotspot', 'multi-category'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'city-los-angeles',
    headline: 'Los Angeles: Top Market for 7 Categories',
    didYouKnow: 'Los Angeles, California is a geographic hotspot for Alcoholic Beverages, Alcoholic Beverages, Antivirus & Security Software, Antivirus & Security Software and 3 more categories. Average shopper income: $96,900.',
    marketingImplication: 'Los Angeles is a high-value market for multi-category advertisers. Test campaigns here before broader rollout.',
    category: 'Geographic Markets',
    tags: ['los angeles', 'california', 'geographic', 'hotspot', 'multi-category'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'city-new-york',
    headline: 'New York: Top Market for 5 Categories',
    didYouKnow: 'New York, New York is a geographic hotspot for 3D Printers, Agriculture, Alcoholic Beverages, Animals & Pet Supplies and 1 more categories. Average shopper income: $97,214.',
    marketingImplication: 'New York is a high-value market for multi-category advertisers. Test campaigns here before broader rollout.',
    category: 'Geographic Markets',
    tags: ['new york', 'new york', 'geographic', 'hotspot', 'multi-category'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'city-miami',
    headline: 'Miami: Top Market for 4 Categories',
    didYouKnow: 'Miami, Florida is a geographic hotspot for Activewear, Animals & Pet Supplies, Arcade Equipment, Athletics. Average shopper income: $94,073.',
    marketingImplication: 'Miami is a high-value market for multi-category advertisers. Test campaigns here before broader rollout.',
    category: 'Geographic Markets',
    tags: ['miami', 'florida', 'geographic', 'hotspot', 'multi-category'],
  },

  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: 'city-philadelphia',
    headline: 'Philadelphia: Top Market for 3 Categories',
    didYouKnow: 'Philadelphia, Pennsylvania is a geographic hotspot for 3D Printers, Activewear, Agriculture. Average shopper income: $84,343.',
    marketingImplication: 'Philadelphia is a high-value market for multi-category advertisers. Test campaigns here before broader rollout.',
    category: 'Geographic Markets',
    tags: ['philadelphia', 'pennsylvania', 'geographic', 'hotspot', 'multi-category'],
  },

  // IVY LEAGUE CAMPUS ZIP CODE INSIGHTS
  // Analysis of 8 Ivy League campus markets: Brown (02912), Columbia (10027), Cornell (14853), 
  // Dartmouth (03755), Harvard (02138), Princeton (08544), Penn (19104), Yale (06520)
  {
    id: 'ivy-league-1',
    headline: 'Ivy League ZIPs: Top 1% Education Nationally',
    didYouKnow: 'Ivy League campus ZIP codes average 79% graduate degree attainment—nearly 3x the national average of 27%. Princeton leads at 93.4%, followed by Dartmouth (85.8%) and Harvard (85.6%). These are among the most educated zip codes in America.',
    marketingImplication: 'Target sophisticated, intellectually-curious audiences who respond to nuanced messaging, research-backed claims, and premium positioning.',
    category: 'Geographic Markets',
    tags: ['ivy-league', 'education', 'graduate-degree', 'premium', 'academic', 'harvard', 'princeton', 'yale'],
    featured: true,
  },
  {
    id: 'ivy-league-2',
    headline: 'Baby Boom at the Ivy League',
    didYouKnow: 'Baby & Toddler products rank #4 in commerce activity across Ivy League ZIPs with 300K+ total weight. Columbia\'s 10027 alone shows weight of 21,124—contradicting the "single student" stereotype. Graduate students and young faculty are actively growing families.',
    marketingImplication: 'Target baby gear, educational toys, and family planning services in campus markets. Position as premium products for academic families.',
    category: 'Consumer Profiles',
    tags: ['ivy-league', 'baby', 'toddler', 'family', 'graduate-students', 'columbia', 'parenting'],
  },
  {
    id: 'ivy-league-3',
    headline: 'Ivy League: Premium Photography Hotspot',
    didYouKnow: 'Camera Lenses (222K total weight, 12,343 avg) and Cameras & Optics (102K total weight) dramatically over-index at Ivy League campuses. These consumers invest in professional-grade photography equipment—Harvard and Columbia lead the trend.',
    marketingImplication: 'Camera brands and lens manufacturers have a premium-ready audience. Emphasize quality, craftsmanship, and creative potential in messaging.',
    category: 'Consumer Profiles',
    tags: ['ivy-league', 'photography', 'cameras', 'premium', 'creative', 'harvard', 'columbia', 'optics'],
  },
  {
    id: 'ivy-league-4',
    headline: 'Tech Stack of Academia: Computers & Tablets',
    didYouKnow: 'Computers rank #2 overall (487K weight) with Tablet Computers (92K) also showing strong adoption across Ivy League ZIPs. This reflects the academic tech stack: research, writing, and digital collaboration tools dominate these markets.',
    marketingImplication: 'EdTech, productivity software, cloud storage, and computer accessories have highly receptive audiences. Position as tools for academic excellence.',
    category: 'Lifestyle & Values',
    tags: ['ivy-league', 'tech', 'computers', 'tablets', 'edtech', 'productivity', 'academic'],
  },
  {
    id: 'ivy-league-5',
    headline: 'Winter Sports & Outdoor Culture at Ivy Campuses',
    didYouKnow: 'Winter Sports & Activities (145K weight) and Camping & Hiking (91K weight) signal an active, outdoor-oriented Ivy League population—particularly at New England schools like Dartmouth (rural NH) and Harvard with easy access to skiing and hiking.',
    marketingImplication: 'Ski resorts, outdoor gear brands, and adventure travel companies should prioritize these markets, especially Q4/Q1 seasonal campaigns.',
    category: 'Lifestyle & Values',
    tags: ['ivy-league', 'winter-sports', 'skiing', 'hiking', 'outdoor', 'dartmouth', 'new-england', 'camping'],
  },
  {
    id: 'ivy-league-6',
    headline: 'Science & Lab Equipment Over-Index',
    didYouKnow: 'Science & Laboratory products (86K weight) appear across every single Ivy League campus ZIP. Research institutions drive significant demand for lab equipment, scientific instruments, and research tools—both for institutions and individual researchers.',
    marketingImplication: 'Lab equipment suppliers and scientific instrument companies have qualified B2B and B2C opportunities. Target university purchasing departments and individual researchers.',
    category: 'Data Discoveries',
    tags: ['ivy-league', 'science', 'laboratory', 'research', 'stem', 'b2b', 'equipment'],
  },
  {
    id: 'ivy-league-7',
    headline: '3D Printers & Maker Culture at Elite Universities',
    didYouKnow: '3D Printers show a remarkable 80K total weight with 8,034 average per ZIP across Ivy League campuses. Columbia leads (16,527) followed by Harvard and Penn (8,747 each). The maker movement resonates strongly with this educated, innovative audience.',
    marketingImplication: 'Target with prototyping tools, design software, STEM kits, and innovation-focused messaging. Engineering and design programs drive demand.',
    category: 'Data Discoveries',
    tags: ['ivy-league', '3d-printers', 'maker', 'innovation', 'engineering', 'columbia', 'stem', 'prototyping'],
  },
  {
    id: 'ivy-league-8',
    headline: 'Million-Dollar Housing at Ivy League ZIPs',
    didYouKnow: 'Harvard/Cambridge leads with $1.08M median home values and $2,799 median rent—3-4x national averages ($288K home value, $1,140 rent). Columbia\'s 10027 shows $914K home values. These are among America\'s most expensive residential markets.',
    marketingImplication: 'Luxury real estate, premium home goods, and financial services (mortgages, investments) have affluent prospects. Position home products as investments in quality living.',
    category: 'Geographic Markets',
    tags: ['ivy-league', 'real-estate', 'luxury', 'housing', 'harvard', 'cambridge', 'columbia', 'affluent'],
  },
  {
    id: 'ivy-league-9',
    headline: 'Young & Wealthy: The Ivy League Paradox',
    didYouKnow: 'Ivy League campus ZIPs have median ages of 19.7-32.5 years—dramatically below the national median of 43. Yet these young populations access household incomes of $122K (Harvard) and $161K (Dartmouth)—top 5% nationally despite their youth.',
    marketingImplication: 'Combine youth-focused creative with premium product offerings. These consumers are young but not budget-constrained—they expect quality.',
    category: 'Consumer Profiles',
    tags: ['ivy-league', 'young-affluent', 'income', 'wealth', 'harvard', 'dartmouth', 'demographics', 'premium'],
    featured: true,
  },
  {
    id: 'ivy-league-10',
    headline: 'Global Diversity at Ivy League Campuses',
    didYouKnow: 'Asian populations at Ivy League ZIPs range from 4.8% (Penn) to 23.8% (Columbia)—many above national averages. Columbia\'s 10027 shows exceptional diversity: 23.8% Asian, 8.6% Black, 6.6% Hispanic—a truly cosmopolitan market.',
    marketingImplication: 'Culturally fluent, multilingual campaigns resonate. International travel, language learning, and globally-inspired products align with cosmopolitan values.',
    category: 'Geographic Markets',
    tags: ['ivy-league', 'diversity', 'multicultural', 'asian', 'columbia', 'international', 'global', 'cosmopolitan'],
  },

  // UC SYSTEM INSIGHTS (University of California Campus Analysis)
  {
    id: 'uc-system-1',
    headline: 'UC System: 2x the Audience Footprint of Ivy League',
    didYouKnow: 'UC campus areas encompass 1.5 million residents across 52 zip codes—twice the Ivy League\'s 738,000 across 19 zip codes. The UC System delivers comparable demographic quality (59.3% grad degrees vs Ivy\'s 59.6%) at double the scale.',
    marketingImplication: 'UC-targeted campaigns reach 2x the audience density in high-education environments. For West Coast premium targeting at scale, the UC System outperforms Ivy League reach.',
    category: 'Geographic Markets',
    tags: ['uc-system', 'california', 'universities', 'scale', 'premium-audiences', 'higher-education'],
    featured: true,
  },
  {
    id: 'uc-system-2',
    headline: 'UC Campus ZIPs: America\'s Youngest Elite Markets',
    didYouKnow: 'Direct UC campus zip codes (94720, 92093, 95064, 93106) have median ages of 19.4–20.8 years—half the national average of 40.2. UC San Diego\'s 92093 (19.4 years) is the youngest elite university market in the nation.',
    marketingImplication: 'These are prime Gen Z targeting environments. Brands building lifetime value should establish presence here while preferences are forming.',
    category: 'Consumer Profiles',
    tags: ['uc-system', 'gen-z', 'young-adults', 'ucsd', 'berkeley', 'santa-cruz', 'demographics'],
    featured: true,
  },
  {
    id: 'uc-system-3',
    headline: 'UC Berkeley & UCLA Match Ivy League Education',
    didYouKnow: 'UC Berkeley (76.5% graduate degrees) and UCLA (71.7%) rival Princeton (81.8%) and Harvard (81.5%) in educational attainment. They outperform Yale\'s surrounding area (45.4%) and Penn (33.4%)—making them equally prestigious targeting environments.',
    marketingImplication: 'Don\'t discount West Coast universities for premium targeting. Berkeley and UCLA deliver Ivy-equivalent intellectual capital.',
    category: 'Consumer Profiles',
    tags: ['uc-system', 'berkeley', 'ucla', 'ivy-league', 'education', 'graduate-degrees', 'premium'],
  },
  {
    id: 'uc-system-4',
    headline: 'UC Irvine: STEM Capital of Elite Universities',
    didYouKnow: 'UC Irvine\'s surrounding area has 66.0% STEM degree holders—#3 nationally among elite university markets (behind Harvard\'s 71.8% and Princeton\'s 66.1%). Combined with $132K median household income, Irvine is the premier West Coast tech talent market.',
    marketingImplication: 'For tech, engineering, and science-focused products, UC Irvine outperforms UCLA and Berkeley. Target the Orange County tech corridor.',
    category: 'Geographic Markets',
    tags: ['uc-system', 'uc-irvine', 'stem', 'tech', 'engineering', 'orange-county', 'science'],
    featured: true,
  },
  {
    id: 'uc-system-5',
    headline: 'UC System: 75% More Asian-Diverse Than Ivy League',
    didYouKnow: 'UC campus areas average 24.9% Asian population vs. Ivy League\'s 14.3%—a 75% diversity premium. UC Merced (57.6% Asian) and UC Riverside (51.8% Asian) have majority-Asian communities, unmatched in elite higher education.',
    marketingImplication: 'The UC System offers unparalleled Asian-American consumer targeting. Culturally relevant campaigns, multilingual content, and Asian heritage celebrations over-index here.',
    category: 'Geographic Markets',
    tags: ['uc-system', 'asian-american', 'diversity', 'uc-merced', 'uc-riverside', 'multicultural', 'demographics'],
  },
  {
    id: 'uc-system-6',
    headline: 'UCLA Westwood: The $1.6M Home Value Premium',
    didYouKnow: 'The UCLA area (90024, 90049, 90077) commands average home values of $1.62 million—surpassing Harvard\'s Cambridge ($1.17M) and Princeton ($727K). UCLA is the most valuable real estate market among all elite universities.',
    marketingImplication: 'UCLA is the ultimate luxury and high-net-worth university market. Premium real estate, wealth management, and luxury goods campaigns should prioritize Westwood.',
    category: 'Geographic Markets',
    tags: ['uc-system', 'ucla', 'westwood', 'luxury', 'real-estate', 'high-net-worth', 'bel-air', 'affluent'],
  },
  {
    id: 'uc-system-7',
    headline: 'UC Santa Barbara: Most Housing-Burdened Students',
    didYouKnow: 'UC Santa Barbara residents spend 27.2% of income on rent—the highest housing burden among UC campuses, even exceeding Yale\'s 27.8%. With $109K median income but $2,482 average rent, UCSB represents a housing-stressed market.',
    marketingImplication: 'High demand for student financial services, roommate apps, affordable housing solutions, and value-oriented brands in the Santa Barbara market.',
    category: 'Consumer Profiles',
    tags: ['uc-system', 'ucsb', 'santa-barbara', 'housing', 'rent-burden', 'affordability', 'student-life'],
  },
  {
    id: 'uc-system-8',
    headline: 'UC Merced & Riverside: Working-Class Premium Education',
    didYouKnow: 'UC Merced ($61K HHI, $342K homes) and UC Riverside ($98K HHI, $546K homes) serve dramatically different demographics than coastal UCs like Berkeley ($133K HHI) and UCLA ($136K HHI). These are accessible premium education markets.',
    marketingImplication: 'Target upward-mobility consumers at UC Merced and Riverside. Value-conscious brands, education financing, and aspirational messaging resonate with first-generation college families.',
    category: 'Consumer Profiles',
    tags: ['uc-system', 'uc-merced', 'uc-riverside', 'value', 'first-generation', 'working-class', 'upward-mobility'],
  },
  {
    id: 'uc-system-9',
    headline: 'UC San Diego La Jolla: 94% Graduate Degree Saturation',
    didYouKnow: 'UC San Diego\'s campus zip (92093) has an extraordinary 94.1% graduate degree rate—the highest of any university market analyzed. Combined with 1.8% poverty and 30.2% Asian population, La Jolla is a hyper-concentrated intellectual elite market.',
    marketingImplication: 'UCSD\'s La Jolla is the most educated zip code in America. Academic publishing, research tools, professional development, and intellectual property services thrive here.',
    category: 'Geographic Markets',
    tags: ['uc-system', 'ucsd', 'la-jolla', 'graduate-degrees', 'research', 'intellectual', 'elite', 'academics'],
    featured: true,
  },
  {
    id: 'uc-system-10',
    headline: 'UC System Delivers 31% Higher Incomes Than Ivy League',
    didYouKnow: 'Despite Ivy League prestige, UC campus areas generate $118,642 average household income vs. Ivy League\'s $90,259—a 31% premium. UC areas also have 64% higher home values ($1.12M vs $680K), driven by California\'s tech economy.',
    marketingImplication: 'For pure purchasing power, the UC System outperforms Ivy League markets. Premium consumer goods, financial services, and luxury brands should weight UC campuses heavily.',
    category: 'Data Discoveries',
    tags: ['uc-system', 'ivy-league', 'income', 'wealth', 'california', 'tech-economy', 'comparison', 'purchasing-power'],
    featured: true,
  },

  // SEC COLLEGE MARKETS INSIGHTS (10 insights)
  {
    id: 'sec-1',
    headline: 'Nashville: The Hidden Premium Market',
    didYouKnow: 'Nashville (Vanderbilt market) has median household incomes of $151,000–$156,000 in its core ZIPs—2.3x higher than the average SEC college town ($65,000). Home values in 37215 and 37212 exceed $927,000, with 77–81% holding graduate degrees. This isn\'t a college town—it\'s a luxury market wearing a university jersey.',
    marketingImplication: 'Treat Nashville as a premium tier separate from other SEC markets. Luxury, financial services, and high-consideration purchases belong here—not student-focused value messaging.',
    category: 'Geographic Markets',
    tags: ['sec', 'vanderbilt', 'nashville', 'college-towns', 'luxury', 'premium', 'tennessee', 'affluent'],
    featured: true,
  },
  {
    id: 'sec-2',
    headline: 'Baby Products Index High in SEC College Towns',
    didYouKnow: '"Baby & Toddler" ranks #5 in commerce weight across SEC college towns (5.57M total weight), outperforming categories like Office Supplies and Clothing. Nashville alone accounts for 19% of all SEC Baby & Toddler engagement. The surprise: median ages in these markets are 22–32 years old.',
    marketingImplication: 'Target the overlooked graduate student and young faculty demographic starting families. Position baby products as premium essentials for educated parents, not budget necessities.',
    category: 'Geographic Markets',
    tags: ['sec', 'college-towns', 'baby', 'toddler', 'graduate-students', 'young-families', 'parenting'],
  },
  {
    id: 'sec-3',
    headline: 'Marine Electronics Defy Southern Geography',
    didYouKnow: '"Marine Electronics" is the #4 ranked commerce audience across SEC markets (6.06M weight)—despite many schools being 200+ miles from any coastline. LSU/Baton Rouge and Nashville show the highest marine electronics engagement among SEC towns. Landlocked doesn\'t mean land-only.',
    marketingImplication: 'Don\'t geo-fence marine and boating ads to coastal markets only. SEC college towns represent untapped boating lifestyle audiences—target lake recreation, fishing, and weekend boat culture.',
    category: 'Geographic Markets',
    tags: ['sec', 'college-towns', 'marine', 'boating', 'lsu', 'nashville', 'outdoor-recreation', 'fishing'],
  },
  {
    id: 'sec-4',
    headline: 'Austin Is the STEM Epicenter of the SEC',
    didYouKnow: 'Austin ZIP codes near UT show STEM degree attainment rates of 73–85%—the highest in the entire SEC conference. ZIP 78751 has 85.3% STEM orientation, and ZIP 78704 shows 81% STEM concentration. The second-highest SEC market (Fayetteville) trails at 78%.',
    marketingImplication: 'For tech, SaaS, developer tools, and B2B software, Austin should receive disproportionate SEC budget allocation. Position technical products with engineering-first messaging.',
    category: 'Geographic Markets',
    tags: ['sec', 'texas', 'austin', 'ut-austin', 'stem', 'tech', 'engineering', 'b2b', 'software'],
    featured: true,
  },
  {
    id: 'sec-5',
    headline: 'Camera Gear Signals Creator Economy in SEC Towns',
    didYouKnow: '"Camera Lenses" ranks #8 in total commerce weight across SEC markets (3.21M)—higher than categories like Shaving & Grooming, Speakers, and Building Materials. Texas A&M and Nashville show the highest camera gear concentrations per capita.',
    marketingImplication: 'SEC college towns are content creator hotspots. Allocate influencer marketing, UGC campaigns, and social-first creative to these markets. Partner with campus-based creators.',
    category: 'Geographic Markets',
    tags: ['sec', 'college-towns', 'camera', 'photography', 'content-creators', 'influencers', 'ugc', 'texas-am'],
  },
  {
    id: 'sec-6',
    headline: 'Winter Sports Over-Index in the Deep South',
    didYouKnow: '"Winter Sports & Activities" ranks #11 in commerce weight across SEC markets (2.93M)—even though 14 of 16 SEC schools are in states averaging 50°F+ winters. SEC college town residents shop winter sports gear at rates comparable to northern markets.',
    marketingImplication: 'Ski resorts, winter gear brands, and mountain destination marketers: SEC college towns are high-intent travel audiences. Target aspirational winter vacation messaging to these warm-weather markets.',
    category: 'Geographic Markets',
    tags: ['sec', 'college-towns', 'winter-sports', 'skiing', 'travel', 'aspirational', 'southern-states'],
  },
  {
    id: 'sec-7',
    headline: 'College Station Is the Purest Student Market',
    didYouKnow: 'College Station (Texas A&M) ZIP 77840 has a median age of 22.1 years and median household income of just $31,278—the youngest and lowest-income major SEC market. Compare to Nashville\'s 37215 (age 44.6, income $151,000). Same conference, opposite demographics.',
    marketingImplication: 'Segment SEC markets sharply. College Station demands value messaging, student deals, and payment plans. Copy that works in Nashville will fail in College Station—and vice versa.',
    category: 'Geographic Markets',
    tags: ['sec', 'texas-am', 'college-station', 'students', 'value-messaging', 'budget', 'young-demographics'],
  },
  {
    id: 'sec-8',
    headline: 'Town-Gown Income Gaps Create Micro-Segmentation',
    didYouKnow: 'Within single SEC cities, household income varies by 3–7x: Knoxville ($17,982 to $126,638), Austin ($30,336 to $154,867), Tuscaloosa ($30,031 to $118,736). A 5-mile radius can span from student poverty to faculty affluence.',
    marketingImplication: 'ZIP-code level targeting is essential in SEC markets. Create separate creative for student-adjacent ZIPs vs. faculty/professional neighborhoods—same city, radically different audiences.',
    category: 'Geographic Markets',
    tags: ['sec', 'college-towns', 'income-disparity', 'segmentation', 'zip-targeting', 'knoxville', 'austin', 'tuscaloosa'],
  },
  {
    id: 'sec-9',
    headline: '3D Printers Signal Hidden Maker Culture',
    didYouKnow: '"3D Printers" (1.52M weight), "Science & Laboratory" (968K), and "Camping & Hiking" (1.39M) all rank in the top 30 SEC commerce audiences. These niche categories outperform mainstream segments like Alcoholic Beverages and Toys in SEC college towns.',
    marketingImplication: 'SEC universities cultivate maker and STEM cultures beyond the classroom. Target engineering students, research labs, and hobbyist inventors. Educational technology and maker-space brands have outsized opportunity.',
    category: 'Geographic Markets',
    tags: ['sec', 'college-towns', '3d-printers', 'makers', 'stem', 'engineering', 'edtech', 'science'],
  },
  {
    id: 'sec-10',
    headline: 'Media Is the Universal SEC Passion Point',
    didYouKnow: '"Media" is the #1 commerce audience in every single SEC college town—no exceptions. At 8.98M total weight, it\'s 2.4x larger than the next category (Computers). This audience dominates from Nashville to Norman to Gainesville.',
    marketingImplication: 'Streaming services, podcast advertisers, and digital media brands should treat SEC markets as a unified high-intent segment. Sponsorships, connected TV, and audio ads will over-perform in these content-hungry markets.',
    category: 'Geographic Markets',
    tags: ['sec', 'college-towns', 'media', 'streaming', 'podcasts', 'connected-tv', 'digital-media', 'content'],
    featured: true,
  },

  // INNOVATION HUBS 2025 INSIGHTS (hub-1 through hub-8)
  // Data-grounded insights from Launchpad Commerce + Census analysis of top 10 innovation zip codes
  {
    id: 'hub-1',
    headline: 'Tribeca Generates 3x More Commerce Activity Than Silicon Valley\'s Heart',
    didYouKnow: 'Tribeca (10013) generates 6 million in commerce weight—nearly 3x San Francisco\'s SoMa district (94103) and 15x Palo Alto (94301). Yet Palo Alto residents earn 48% more ($235K vs $159K median HHI). The "Creative Tech & Luxury Tech" hub outspends venture capital zip codes by buying across 195 distinct product categories.',
    marketingImplication: 'Don\'t confuse income with spending propensity. Tribeca\'s density of high-earners in small spaces creates category diversity that suburban wealth can\'t match. Media buyers should weight 10013 for reach and breadth, not just affluence.',
    category: 'Geographic Markets',
    tags: ['innovation-hubs', 'tribeca', 'nyc', 'silicon-valley', 'san-francisco', 'palo-alto', 'commerce', 'spending'],
    featured: true,
  },
  {
    id: 'hub-2',
    headline: 'The Highest-STEM Innovation Hub Isn\'t San Francisco—It\'s Denver',
    didYouKnow: 'Denver (80202) and Seattle (98101) tie for highest STEM education at 79.2-79.4%—beating San Francisco\'s 73.4% and even Cambridge\'s 70.8%. Yet Denver\'s median income ($110K) is 10% lower than Seattle\'s ($128K). These are the most technically-educated buyers at the most efficient CPMs.',
    marketingImplication: 'Technical product marketers: Denver is your arbitrage opportunity. Same STEM concentration as coastal hubs, 40% lower home values, and significantly less ad competition. Shift budget from saturated Bay Area to 80202.',
    category: 'Geographic Markets',
    tags: ['innovation-hubs', 'denver', 'seattle', 'stem', 'education', 'technical', 'b2b', 'arbitrage'],
    featured: true,
  },
  {
    id: 'hub-3',
    headline: 'Innovation Hubs Spend 8,588 Index Points on Baby Products—14% Above Average',
    didYouKnow: 'Baby & Toddler products have the highest average purchase weight (8,588) across all 9 active innovation hubs—exceeding even Computers (7,237). Tribeca alone accounts for 156K in baby commerce weight. These "disruption zones" are actually family formation zones.',
    marketingImplication: 'Baby brands: stop targeting suburban demographics. Innovation hub residents are having children in urban cores, paying premium prices, and buying across every baby subcategory. Target 10013, 02139, and 94103 as primary markets.',
    category: 'Consumer Profiles',
    tags: ['innovation-hubs', 'baby', 'toddler', 'parents', 'urban', 'tribeca', 'cambridge', 'san-francisco', 'premium'],
  },
  {
    id: 'hub-4',
    headline: 'Camera Lenses Over-Index 10,828 in Innovation Hubs—The Highest of Any Category',
    didYouKnow: 'Camera Lenses have the highest average weight (10,828) of any category in innovation hubs—46% higher than Computers. These zip codes concentrate professional photographers, content creators, and visual documentation specialists. Tribeca alone: 175,176 commerce weight in camera lenses.',
    marketingImplication: 'Content creation is the hidden economy of innovation hubs. Brands targeting these zips should lead with visual storytelling, professional-grade imagery, and creator partnerships—not just tech specs.',
    category: 'Consumer Profiles',
    tags: ['innovation-hubs', 'camera', 'photography', 'content-creators', 'tribeca', 'visual', 'professional'],
  },
  {
    id: 'hub-5',
    headline: 'Atlanta\'s Innovation Hub Has the Lowest Income But Highest STEM Education Concentration',
    didYouKnow: 'Atlanta (30308) has only 17.7% higher income than national average—the lowest of any innovation hub—but 78.7% STEM education, among the highest. With home values at $387K (half of Seattle\'s), this is the most technically-educated, cost-efficient audience in America.',
    marketingImplication: 'Atlanta 30308 is the value play for B2B tech. High technical sophistication, low ad saturation, and buyers who understand specs without paying Bay Area premiums. Test here before scaling to coastal markets.',
    category: 'Geographic Markets',
    tags: ['innovation-hubs', 'atlanta', 'cybersecurity', 'stem', 'value', 'b2b', 'tech', 'cost-efficient'],
  },
  {
    id: 'hub-6',
    headline: 'Hardware Innovation is Real: Circuit Boards Over-Index 35x in These 10 Zip Codes',
    didYouKnow: 'Circuit Boards & Components index at 35.00x national average across innovation hubs—with San Francisco (7,500) and Cambridge (6,340) leading. This isn\'t just software—these zip codes are prototyping physical products, building hardware startups, and supporting the "atoms economy."',
    marketingImplication: 'The "software eating the world" narrative is incomplete. Innovation hubs are hardware-intensive. Component suppliers, maker tools, and physical prototyping services should target 94103 and 02139 specifically.',
    category: 'Data Discoveries',
    tags: ['innovation-hubs', 'hardware', 'circuit-boards', 'components', 'san-francisco', 'cambridge', 'prototyping', 'makers'],
  },
  {
    id: 'hub-7',
    headline: 'Cambridge Has the Youngest Innovators (29.9 Years)—Palo Alto the Oldest (45.4)',
    didYouKnow: 'Cambridge (02139) median age is 29.9 years—15.5 years younger than Palo Alto (94301). San Diego\'s innovation hub (92121) is also young at 32.7 years. The life sciences and academic hubs skew young; the established tech wealth hubs skew older.',
    marketingImplication: 'Age-targeted messaging must vary by hub. Cambridge and San Diego respond to career-building, skill-acquisition messaging. Palo Alto responds to legacy, wealth management, and family security messaging. Same "innovation" audience, 15-year age gap.',
    category: 'Consumer Profiles',
    tags: ['innovation-hubs', 'cambridge', 'palo-alto', 'san-diego', 'age', 'demographics', 'life-sciences', 'generational'],
  },
  {
    id: 'hub-8',
    headline: 'San Diego\'s Innovation Hub Only Engages with 40 Commerce Categories—Tribeca Engages 195',
    didYouKnow: 'San Diego (92121) shows commerce activity across just 40 categories—the lowest diversity of any innovation hub. Compare to Tribeca\'s 195 categories. San Diego\'s "Genomics & Wireless Tech" focus creates hyper-specialized buyers who ignore most consumer categories.',
    marketingImplication: 'San Diego 92121 is NOT a general consumer target—it\'s a highly specialized B2B zone. Mass-market campaigns will underperform; niche biotech, scientific equipment, and professional services will over-perform.',
    category: 'Data Discoveries',
    tags: ['innovation-hubs', 'san-diego', 'genomics', 'biotech', 'specialized', 'b2b', 'tribeca', 'category-diversity'],
  },
];

// Helper function to get insights by category
export const getInsightsByCategory = (category: InsightCategory): SovrnInsight[] => {
  return sovrnInsights.filter(insight => insight.category === category);
};

// Helper function to get featured insights
export const getFeaturedInsights = (): SovrnInsight[] => {
  return sovrnInsights.filter(insight => insight.featured);
};

// Helper function to get all unique categories
export const getAllCategories = (): InsightCategory[] => {
  return Array.from(new Set(sovrnInsights.map(insight => insight.category)));
};

// Helper function to get category counts
export const getCategoryCounts = (): Record<InsightCategory, number> => {
  const counts: Record<string, number> = {};
  sovrnInsights.forEach(insight => {
    counts[insight.category] = (counts[insight.category] || 0) + 1;
  });
  return counts as Record<InsightCategory, number>;
};

// Helper function to search insights
export const searchInsights = (query: string): SovrnInsight[] => {
  const lowerQuery = query.toLowerCase();
  return sovrnInsights.filter(insight => 
    insight.headline.toLowerCase().includes(lowerQuery) ||
    insight.didYouKnow.toLowerCase().includes(lowerQuery) ||
    insight.marketingImplication.toLowerCase().includes(lowerQuery) ||
    insight.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

// Helper function to get random insight
export const getRandomInsight = (): SovrnInsight => {
  return sovrnInsights[Math.floor(Math.random() * sovrnInsights.length)];
};

// Helper function to get random insights (for shuffle)
export const getRandomInsights = (count: number): SovrnInsight[] => {
  const shuffled = [...sovrnInsights].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Helper function to get related insights (same category or overlapping tags)
export const getRelatedInsights = (insight: SovrnInsight, limit: number = 3): SovrnInsight[] => {
  return sovrnInsights
    .filter(i => i.id !== insight.id)
    .map(i => ({
      insight: i,
      score: (i.category === insight.category ? 2 : 0) + 
             i.tags.filter(tag => insight.tags.includes(tag)).length
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.insight);
};

// Get daily insight based on date (consistent for the day)
export const getDailyInsight = (): SovrnInsight => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return sovrnInsights[dayOfYear % sovrnInsights.length];
};

