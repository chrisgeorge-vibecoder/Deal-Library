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
  | 'Regional Markets'
  | 'City Insights'
  | 'Data Discoveries';

export const CATEGORY_COLORS: Record<InsightCategory, { bg: string; text: string; border: string }> = {
  'Consumer Profiles': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  'Lifestyle & Values': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  'Regional Markets': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300' },
  'City Insights': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-300' },
  'Data Discoveries': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
};

export const CATEGORY_ICONS: Record<InsightCategory, string> = {
  'Consumer Profiles': '👤',
  'Lifestyle & Values': '💡',
  'Regional Markets': '🗺️',
  'City Insights': '🏙️',
  'Data Discoveries': '🔍',
};

export const sovrnInsights: SovrnInsight[] = [
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
    category: 'Regional Markets',
    tags: ['college', 'young-adults', 'subscriptions', 'high-income'],
    featured: true,
  },
  {
    id: 'college-2',
    headline: 'Ann Arbor: America\'s Entrepreneurial College Town',
    didYouKnow: 'Ann Arbor, Michigan has 16.1% self-employment—nearly 40% higher than the national average. Combined with 76.1% college-educated residents and a 33.5% charitable giving rate, it\'s one of America\'s most entrepreneurial and socially conscious markets.',
    marketingImplication: 'B2E (business-to-entrepreneur) products, sustainable brands, and premium local goods resonate strongly here.',
    category: 'Regional Markets',
    tags: ['ann-arbor', 'entrepreneur', 'sustainable', 'educated'],
  },
  {
    id: 'college-3',
    headline: 'Boulder: Where Everyone Starts a Business',
    didYouKnow: 'Boulder, Colorado has the highest self-employment rate among college towns at 19.5%—nearly double the national average. With 76.3% college educated, it\'s a hotbed for outdoor gear, sustainable products, and premium fitness brands.',
    marketingImplication: 'Performance-oriented, sustainability-focused products with premium price points perform exceptionally well.',
    category: 'Regional Markets',
    tags: ['boulder', 'outdoor', 'fitness', 'sustainable', 'premium'],
  },
  {
    id: 'college-4',
    headline: 'State College: America\'s Youngest ZIP Codes',
    didYouKnow: 'State College, Pennsylvania (home of Penn State) has 33.7% of its population in their 20s—2.5x the national average. It\'s one of America\'s youngest significant markets with a median age of just 28.6.',
    marketingImplication: 'Ideal test market for Gen Z products, student services, and affordable premium brands.',
    category: 'Regional Markets',
    tags: ['state-college', 'gen-z', 'students', 'test-market'],
  },

  // COASTAL MARKET INSIGHTS (25-28)
  {
    id: 'coastal-1',
    headline: 'The Coastal Premium: 24% Higher Income',
    didYouKnow: 'Coastal Americans (East + West Coast) earn $95,144 median income—24% more than the heartland\'s $76,688. But the real difference? Home values: $534K coastal vs. $265K inland—more than double.',
    marketingImplication: 'Coastal markets can support 2x higher price points for home goods, furniture, and lifestyle products. But focus messaging on space efficiency—their dollars stretch differently.',
    category: 'Regional Markets',
    tags: ['coastal', 'premium', 'home-values', 'pricing'],
    featured: true,
  },
  {
    id: 'coastal-2',
    headline: 'West Coast: The Self-Employment Capital',
    didYouKnow: 'West Coast residents have a 14% self-employment rate—the highest in the nation. Combined with 49% STEM education and $100,290 median income, this creates a unique "tech freelancer" consumer profile.',
    marketingImplication: 'Target with productivity tools, home office equipment, and business-casual lifestyle products. These buyers value efficiency and premium quality.',
    category: 'Regional Markets',
    tags: ['west-coast', 'self-employed', 'tech', 'freelancer'],
  },
  {
    id: 'coastal-3',
    headline: 'The 4-Minute Coastal Commute Gap',
    didYouKnow: 'Coastal Americans spend 28.9 minutes commuting vs. 24.8 minutes in the heartland—that\'s 17% more drive time. Over a year, that\'s 35 extra hours in transit.',
    marketingImplication: 'Podcast advertising, mobile commerce, and audio content reach coastal audiences during their extended commute windows.',
    category: 'Regional Markets',
    tags: ['commute', 'podcasts', 'audio', 'mobile'],
  },
  {
    id: 'coastal-4',
    headline: 'Gulf Coast: The Homeownership Belt',
    didYouKnow: 'The Gulf Coast has 66% homeownership—higher than both the East Coast (varies) and West Coast. Combined with lower home values ($314K median), these markets represent excellent opportunity for home improvement, outdoor living, and family products.',
    marketingImplication: 'Focus on value-oriented messaging, DIY products, and outdoor/patio living. These are practical buyers with established homes.',
    category: 'Regional Markets',
    tags: ['gulf-coast', 'homeowners', 'DIY', 'outdoor'],
  },

  // ECCENTRIC CITY SHOPPING INSIGHTS (29-33)
  {
    id: 'city-1',
    headline: 'Silicon Valley: Where 75% Have STEM Degrees',
    didYouKnow: 'In Cupertino, California (Apple HQ), 75.1% of residents hold STEM degrees—more than double the national average. These hyper-technical consumers respond to data-backed claims and feature-rich products.',
    marketingImplication: 'Lead with specifications, technical details, and performance metrics. Traditional emotional marketing underperforms in these markets.',
    category: 'Regional Markets',
    tags: ['silicon-valley', 'STEM', 'tech', 'data-driven'],
  },
  {
    id: 'city-2',
    headline: 'The Creative Class in Sherman Oaks',
    didYouKnow: 'Sherman Oaks, California has 26.6% self-employment—the highest of any major U.S. market. Combined with 65.2% college education, this is America\'s "creative class capital."',
    marketingImplication: 'Premium freelancer and creative professional products, from home studios to luxury athleisure, perform exceptionally well.',
    category: 'Regional Markets',
    tags: ['sherman-oaks', 'creative', 'freelancer', 'self-employed'],
  },
  {
    id: 'city-3',
    headline: 'The Villages: 65% Are 65+',
    didYouKnow: 'The Villages, Florida has the nation\'s oldest population—64.9% are 65 or older with a median age of 72.4. This concentrated senior market represents $billions in healthcare, leisure, and lifestyle spending.',
    marketingImplication: 'Accessibility-focused products, health and wellness, and premium leisure goods. Avoid digital-only marketing—direct mail and traditional media still dominate.',
    category: 'Regional Markets',
    tags: ['the-villages', 'seniors', 'healthcare', 'traditional-media'],
  },
  {
    id: 'city-4',
    headline: 'The Super Commuter Cities',
    didYouKnow: 'Queens neighborhoods like South Ozone Park average 46-minute one-way commutes—that\'s nearly 2 hours daily, 10 hours weekly, and 21 full days per year spent commuting.',
    marketingImplication: 'Audio entertainment, mobile gaming, language learning apps, and podcast advertising reach these captive audiences. Consider time-saving products and delivery services.',
    category: 'Regional Markets',
    tags: ['queens', 'commuters', 'audio', 'podcasts', 'time-saving'],
  },
  {
    id: 'city-5',
    headline: 'NYC: The Renter Nation',
    didYouKnow: 'Astoria, New York has just 18.3% homeownership—the lowest of any major market. Yet median rent is $2,145/month, creating a unique "wealthy renter" segment with high disposable income.',
    marketingImplication: 'Apartment-friendly products, space-saving solutions, and high-end rental lifestyle items (vs. home improvement) resonate. These consumers invest in experiences and possessions, not property.',
    category: 'Regional Markets',
    tags: ['nyc', 'renters', 'urban', 'space-saving', 'experiences'],
  },

  // AFFLUENT MARKET INSIGHTS (34-36)
  {
    id: 'affluent-1',
    headline: 'The Affluent Renter Phenomenon',
    didYouKnow: 'Nearly 4.6 million Americans earn over $100K but rent rather than own. Concentrated in NYC, SF, DC, and Chicago, this "affluent renter" segment is 72.1% college-educated with massive discretionary spending power.',
    marketingImplication: 'Premium subscription services, luxury experiences, and high-end consumables (vs. durables) perform well. These consumers invest in lifestyle, not property equity.',
    category: 'Regional Markets',
    tags: ['affluent-renters', 'urban', 'subscriptions', 'luxury'],
    featured: true,
  },
  {
    id: 'affluent-2',
    headline: 'The DINK Market: 70% Dual-Income, Tiny Households',
    didYouKnow: 'Markets like Chantilly, VA (72.8% dual-income) and Seattle represent America\'s concentrated "DINK" (Dual Income, No Kids) population—earning $126K+ with just 2.3 people per household.',
    marketingImplication: 'Premium travel, luxury experiences, high-end dining, and lifestyle products. These consumers prioritize quality over quantity with significant discretionary income.',
    category: 'Regional Markets',
    tags: ['DINK', 'dual-income', 'travel', 'luxury', 'experiences'],
  },
  {
    id: 'affluent-3',
    headline: 'Danville: America\'s Most Philanthropic City',
    didYouKnow: 'Danville, California has the nation\'s highest charitable giving rate at 59.7%—nearly 3x the national average. These values-driven consumers respond strongly to cause marketing and brand purpose.',
    marketingImplication: 'Lead with sustainability, social impact, and ethical sourcing. Partnerships with nonprofits and "give back" programs drive conversion.',
    category: 'Regional Markets',
    tags: ['danville', 'philanthropy', 'cause-marketing', 'values'],
  },

  // FAMILY MARKET INSIGHTS (37-38)
  {
    id: 'family-market-1',
    headline: 'The Family Stronghold: Sammamish, WA',
    didYouKnow: 'Sammamish, Washington has America\'s highest marriage rate (71.8%) combined with large families (3.29 average)—and a stunning median income of $241,206. This is America\'s wealthiest family market.',
    marketingImplication: 'Premium family products, education services, and large-format goods. These families buy quality over price and invest heavily in children\'s development.',
    category: 'Regional Markets',
    tags: ['sammamish', 'family', 'premium', 'education', 'wealthy'],
  },
  {
    id: 'family-market-2',
    headline: 'High Net Worth Families: 9.7 Million Strong',
    didYouKnow: 'Nearly 10 million Americans live in households earning $150K+, with 3+ family members, and 75%+ homeownership. Their average home value? $791,570.',
    marketingImplication: 'Family-size premium products, home investment goods, and multi-generational services. Brand loyalty is high—acquisition costs are worth it for lifetime value.',
    category: 'Regional Markets',
    tags: ['high-net-worth', 'family', 'premium', 'loyalty'],
  },

  // TECH HUB COMPARISON (39-40)
  {
    id: 'tech-1',
    headline: 'Silicon Valley vs. Austin: The STEM Gap',
    didYouKnow: 'Silicon Valley has 63.5% STEM-educated residents vs. Austin\'s 47.8%—but Austin has 16% self-employment vs. Silicon Valley\'s 13.2%. Same tech industry, different consumer profiles.',
    marketingImplication: 'Silicon Valley buyers are feature-driven analysts; Austin buyers are entrepreneurial risk-takers. Adjust messaging accordingly.',
    category: 'Regional Markets',
    tags: ['silicon-valley', 'austin', 'tech', 'STEM', 'entrepreneurs'],
  },
  {
    id: 'tech-2',
    headline: 'The Boston Tech Anomaly',
    didYouKnow: 'Boston\'s tech corridor has the lowest self-employment rate among major tech hubs at just 2.3% (vs. 13%+ elsewhere). These are corporate tech workers, not founders—different buying psychology.',
    marketingImplication: 'Premium corporate lifestyle products, commuter goods, and family services resonate. Less "hustle culture," more work-life balance positioning.',
    category: 'Regional Markets',
    tags: ['boston', 'corporate', 'tech', 'work-life-balance'],
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
    category: 'City Insights',
    tags: ['NYC', 'charity', 'cause-marketing', 'educated', 'affluent'],
    featured: true,
  },
  {
    id: 'city-nyc-2',
    headline: '76% of New Yorkers Rent',
    didYouKnow: 'Only 24% of New York City residents own their homes—less than half the national average of 65.4%. Yet home values are $955,095 (2.5x national) and rent averages $2,267/month. This is a market of wealthy renters with no equity—all disposable income goes to lifestyle, not property.',
    marketingImplication: 'Skip home improvement; focus on experiences, fashion, dining, and portable luxury. NYC consumers invest in themselves, not their homes.',
    category: 'City Insights',
    tags: ['NYC', 'renters', 'luxury', 'lifestyle', 'experiences'],
  },

  // CITY INSIGHTS - LOS ANGELES
  {
    id: 'city-la-1',
    headline: '1 in 5 LA Workers Is a Boss',
    didYouKnow: 'Los Angeles has a 20.2% self-employment rate—71% higher than the national average of 11.8%. Combined with the largest family sizes among major metros (3.47 people), LA is a city of entrepreneurial families running side businesses.',
    marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates strongly. Position products as business tools, not just personal items.',
    category: 'City Insights',
    tags: ['LA', 'entrepreneurs', 'self-employed', 'families', 'B2B'],
  },
  {
    id: 'city-la-2',
    headline: 'LA Families Rent, Don\'t Buy',
    didYouKnow: 'Only 29.2% of Angelenos own homes—lower than even Brooklyn (30%). Yet average family size is 3.47—the largest among top 10 cities. LA families are renting large apartments and houses, not buying. Home values hit $972K.',
    marketingImplication: 'Focus on flexible, rental-friendly products. No permanent installations. Emphasize family utility in limited space.',
    category: 'City Insights',
    tags: ['LA', 'renters', 'families', 'housing', 'flexible'],
  },

  // CITY INSIGHTS - CHICAGO
  {
    id: 'city-chicago-1',
    headline: 'Chicago\'s 34-Minute Commutes',
    didYouKnow: 'Chicago\'s average commute is 33.7 minutes—26% longer than the national average of 26.7 minutes. That\'s 58 extra hours per year stuck in transit. Combined with 17.2% in their 20s, Chicago has young professionals losing time to commutes.',
    marketingImplication: 'Podcast advertising, mobile commerce, and time-saving products dominate here. Audio content reaches Chicago audiences during their extended L train rides.',
    category: 'City Insights',
    tags: ['Chicago', 'commute', 'podcasts', 'mobile', 'young-professionals'],
  },
  {
    id: 'city-chicago-2',
    headline: 'Chicago: Smart But Single',
    didYouKnow: 'Chicago residents are 41.8% college-educated (+21% vs national) but only 35.7% married (-25% vs national). This is a city of educated singles and unmarried partners—the opposite of suburban family life.',
    marketingImplication: 'Singles marketing, dating apps, and individual-focused products outperform family positioning. Emphasize personal growth and social life.',
    category: 'City Insights',
    tags: ['Chicago', 'singles', 'educated', 'dating', 'urban'],
  },

  // CITY INSIGHTS - HOUSTON
  {
    id: 'city-houston-1',
    headline: 'Houston\'s Big Family Culture',
    didYouKnow: 'Houston\'s average family size is 3.35 people—the second-largest among top 10 cities. Combined with 15.5% in their 20s and a median age of just 34.4 (5 years younger than national), Houston is a city of young, growing families.',
    marketingImplication: 'Family-size products, bulk buying, and kid-focused marketing will overperform. Position for the whole household.',
    category: 'City Insights',
    tags: ['Houston', 'families', 'young', 'bulk', 'kids'],
  },
  {
    id: 'city-houston-2',
    headline: 'Houston: Hustle City USA',
    didYouKnow: 'Houston\'s self-employment rate is 17.4%—47% higher than the 11.8% national average. Despite below-average incomes ($69,772), Houstonians are starting businesses at exceptional rates.',
    marketingImplication: 'Side-hustle messaging and business tools resonate. Position as investments in future success, not luxury indulgences.',
    category: 'City Insights',
    tags: ['Houston', 'entrepreneurs', 'side-hustle', 'business', 'hustle'],
  },

  // CITY INSIGHTS - BROOKLYN
  {
    id: 'city-brooklyn-1',
    headline: '$963K Homes, 70% Renters',
    didYouKnow: 'Brooklyn median home values are $962,843—2.5x the national average—yet only 30% of residents own homes. This is a borough of million-dollar properties occupied by renters paying $1,865/month.',
    marketingImplication: 'Luxury lifestyle products work—but not home-focused ones. Brooklyn consumers want experiences, fashion, and food.',
    category: 'City Insights',
    tags: ['Brooklyn', 'renters', 'luxury', 'lifestyle', 'expensive'],
  },
  {
    id: 'city-brooklyn-2',
    headline: 'Brooklyn\'s 42-Min Commutes',
    didYouKnow: 'Brooklyn\'s average commute is 42.1 minutes—the longest of any major city, 58% above national average. That\'s 137 extra hours per year—nearly 6 full days—lost to commuting.',
    marketingImplication: 'Audio content, mobile apps, and commuter-friendly products dominate. Brooklyn audiences are captive on the subway.',
    category: 'City Insights',
    tags: ['Brooklyn', 'commute', 'subway', 'mobile', 'audio'],
  },

  // CITY INSIGHTS - MIAMI
  {
    id: 'city-miami-1',
    headline: 'Miami: 22% Self-Employed',
    didYouKnow: 'Miami\'s self-employment rate is 22.2%—the highest of any top 10 city—88% above national average. Combined with an older population (23.3% over 60), Miami is a city of established entrepreneurs.',
    marketingImplication: 'Business-owner messaging works at scale. Miami consumers are decision-makers, not employees.',
    category: 'City Insights',
    tags: ['Miami', 'entrepreneurs', 'self-employed', 'established', 'B2B'],
  },
  {
    id: 'city-miami-2',
    headline: 'Miami Is the Oldest Big City',
    didYouKnow: 'Miami\'s median age is 41.2 years—nearly 2 years older than the national average of 39.3. It\'s the only major city with an older-than-average population. Combined with 53.8% homeownership, this is established wealth.',
    marketingImplication: 'Don\'t over-index on youth marketing in Miami. Quality, reliability, and luxury resonate more than trends.',
    category: 'City Insights',
    tags: ['Miami', 'seniors', 'established', 'wealth', 'luxury'],
  },

  // CITY INSIGHTS - PHOENIX
  {
    id: 'city-phoenix-1',
    headline: 'Phoenix Has 27% Fewer Seniors',
    didYouKnow: 'Only 17.1% of Phoenix residents are 60+—compared to 23.3% nationally. Combined with a median age of 35.1, Phoenix is rapidly becoming a young professional magnet, not a retirement destination.',
    marketingImplication: 'Pivot from senior-focused marketing. Phoenix is attracting young families and remote workers.',
    category: 'City Insights',
    tags: ['Phoenix', 'young', 'remote-work', 'growth', 'families'],
  },
  {
    id: 'city-phoenix-2',
    headline: 'Phoenix: Dual-Income Boom',
    didYouKnow: 'Phoenix\'s dual-income household rate is 55.7%—4% above national average. Combined with 15.5% in their 20s and larger families (3.33), Phoenix is a city of young working couples starting families.',
    marketingImplication: 'Time-saving and family convenience products dominate. Both parents work—efficiency is the value proposition.',
    category: 'City Insights',
    tags: ['Phoenix', 'dual-income', 'families', 'convenience', 'efficiency'],
  },

  // CITY INSIGHTS - PHILADELPHIA
  {
    id: 'city-philly-1',
    headline: 'Philly: Lowest Major City Income',
    didYouKnow: 'Philadelphia\'s median household income is just $61,810—27% below the national average of $84,386. Only 28.1% earn six figures (vs. 39.2% nationally). Philly is a value-conscious market.',
    marketingImplication: 'Price sensitivity is real. Lead with value, deals, and affordability. Premium positioning will underperform.',
    category: 'City Insights',
    tags: ['Philadelphia', 'budget', 'value', 'deals', 'affordability'],
  },
  {
    id: 'city-philly-2',
    headline: 'Philly: Only 32% Married',
    didYouKnow: 'Only 31.9% of Philadelphians are married—the lowest of any top 10 city, 33% below the national average. Combined with lower incomes and 15.9% in their 20s, this is a young, single, budget-conscious market.',
    marketingImplication: 'Singles and young professional marketing works. Skip family-oriented messaging. Emphasize affordability.',
    category: 'City Insights',
    tags: ['Philadelphia', 'singles', 'young', 'budget', 'affordable'],
  },

  // CITY INSIGHTS - SAN ANTONIO
  {
    id: 'city-sanantonio-1',
    headline: 'Cheapest Homes, Biggest Families',
    didYouKnow: 'San Antonio\'s median home value is just $246,721—35% below national average. Yet family sizes are 3.37—the largest of any top 10 city. Affordable housing + big families = value-driven households.',
    marketingImplication: 'Family-size value packs and bulk offerings will dominate. These are budget-conscious families maximizing value.',
    category: 'City Insights',
    tags: ['San Antonio', 'affordable', 'families', 'bulk', 'value'],
  },
  {
    id: 'city-sanantonio-2',
    headline: 'San Antonio Gives 25% Less',
    didYouKnow: 'Only 16.5% of San Antonians give to charity—compared to 22.1% nationally. This isn\'t a values-driven market. Combined with lower incomes ($73,438), practical concerns outweigh cause marketing.',
    marketingImplication: 'Skip cause marketing and social impact messaging. Focus on practical benefits and savings instead.',
    category: 'City Insights',
    tags: ['San Antonio', 'practical', 'value', 'savings', 'budget'],
  },

  // CITY INSIGHTS - LAS VEGAS
  {
    id: 'city-vegas-1',
    headline: 'Vegas: Fewest College Grads',
    didYouKnow: 'Only 26.4% of Las Vegas residents are college-educated—the lowest of any top 10 city, 24% below national average. This is a trade and service economy, not a knowledge economy.',
    marketingImplication: 'Skip intellectual or aspirational messaging. Practical, entertainment-focused marketing resonates. Keep it simple.',
    category: 'City Insights',
    tags: ['Las Vegas', 'practical', 'entertainment', 'simple', 'service'],
  },
  {
    id: 'city-vegas-2',
    headline: 'Vegas Has Shortest Commutes',
    didYouKnow: 'Vegas commuters spend just 25.1 minutes in transit—6% below national average. Combined with 54.3% homeownership and affordable housing ($379,684), Vegas offers suburban convenience with urban entertainment.',
    marketingImplication: 'Time savings isn\'t the value proposition here—people already have time. Focus on experience and entertainment instead.',
    category: 'City Insights',
    tags: ['Las Vegas', 'entertainment', 'convenience', 'affordable', 'experience'],
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

