-- Sample Research Studies for Testing
-- Run this after creating the research library schema

-- Sample Study 1: Programmatic Advertising
INSERT INTO research_studies (
  title, 
  description, 
  author,
  publication_date,
  source,
  category,
  tags,
  file_url,
  file_size_kb,
  summary,
  why_it_matters,
  is_featured,
  is_published
) VALUES (
  'The State of Programmatic Advertising 2024',
  'Comprehensive analysis of programmatic advertising trends, spending patterns, and best practices across display, video, and CTV channels.',
  'IAB',
  '2024-01-15',
  'IAB',
  'Programmatic',
  ARRAY['programmatic', 'trends', 'best-practices', 'ctv', 'display'],
  'https://www.iab.com/wp-content/uploads/2024/01/programmatic-study-2024.pdf',
  2840,
  'Key findings: 85% of digital ad spend is now programmatic, with CTV growing at 35% YoY. Advertisers using first-party data see 34% higher ROAS. Contextual targeting combined with behavioral data performs especially well in Q4.',
  'Essential reading for understanding the current programmatic landscape and planning 2024 media strategies. The insights on first-party data integration are particularly relevant for brands navigating the cookieless future.',
  true,
  true
);

-- Sample Study 2: Retail Media
INSERT INTO research_studies (
  title, 
  description, 
  author,
  publication_date,
  source,
  category,
  tags,
  file_url,
  file_size_kb,
  summary,
  why_it_matters,
  is_featured,
  is_published
) VALUES (
  'Retail Media Networks: The New Frontier',
  'How retail media networks are transforming digital advertising with unparalleled first-party commerce data and closed-loop attribution.',
  'eMarketer',
  '2024-02-10',
  'eMarketer',
  'Retail Media',
  ARRAY['retail-media', 'commerce', 'attribution', 'targeting'],
  'https://www.emarketer.com/content/retail-media-networks-2024',
  3150,
  'Retail media to reach $60B by 2025, offering brands direct access to in-market shoppers. Amazon, Walmart, and Target lead the space with sophisticated targeting capabilities. Average ROAS for retail media campaigns is 3.5x higher than traditional display.',
  'Critical for brands wanting to leverage commerce data for precision targeting. Retail media networks provide closed-loop measurement that traditional media cannot match.',
  true,
  true
);

-- Sample Study 3: CTV Advertising
INSERT INTO research_studies (
  title, 
  description, 
  author,
  publication_date,
  source,
  category,
  tags,
  file_url,
  file_size_kb,
  summary,
  why_it_matters,
  is_featured,
  is_published
) VALUES (
  'Connected TV Advertising: Trends and Opportunities 2024',
  'Deep dive into the CTV advertising ecosystem, including platform dynamics, audience behaviors, and measurement best practices.',
  'Nielsen',
  '2024-03-05',
  'Nielsen',
  'CTV',
  ARRAY['ctv', 'ott', 'streaming', 'video', 'measurement'],
  'https://www.nielsen.com/insights/2024/ctv-advertising-study/',
  2960,
  'CTV ad spending to exceed $30B in 2024. 78% of US households now have at least one streaming service. Viewers are more receptive to CTV ads than linear TV, with 45% reporting they pay attention to CTV ads.',
  'Essential for planning video campaigns in the streaming era. Provides benchmarks for CPMs, completion rates, and attribution models specific to CTV.',
  true,
  true
);

-- Sample Study 4: Audience Targeting
INSERT INTO research_studies (
  title, 
  description, 
  author,
  publication_date,
  source,
  category,
  tags,
  file_url,
  file_size_kb,
  summary,
  why_it_matters,
  is_featured,
  is_published
) VALUES (
  'The Future of Audience Targeting: Privacy-First Strategies',
  'Strategies for effective audience targeting in a privacy-first world, including contextual, cohort-based, and first-party data approaches.',
  'IAB',
  '2024-01-20',
  'IAB',
  'Audience Targeting',
  ARRAY['targeting', 'privacy', 'first-party-data', 'contextual'],
  'https://www.iab.com/wp-content/uploads/2024/01/audience-targeting-privacy.pdf',
  2150,
  'With third-party cookies declining, contextual targeting sees 42% growth. Brands investing in first-party data infrastructure see 2.8x better campaign performance. Cohort-based targeting (Privacy Sandbox) shows promise for maintaining relevance without individual tracking.',
  'Critical reading for adapting to privacy regulations and platform changes. Provides actionable frameworks for building privacy-compliant targeting strategies.',
  false,
  true
);

-- Sample Study 5: Consumer Behavior
INSERT INTO research_studies (
  title, 
  description, 
  author,
  publication_date,
  source,
  category,
  tags,
  file_url,
  file_size_kb,
  summary,
  why_it_matters,
  is_featured,
  is_published
) VALUES (
  'Digital Consumer Behavior Study 2024',
  'Annual study of online consumer behaviors, purchase journeys, and media consumption patterns across demographics.',
  'Forrester',
  '2024-02-01',
  'Forrester',
  'Consumer Behavior',
  ARRAY['consumer-behavior', 'purchase-journey', 'demographics'],
  'https://www.forrester.com/report/digital-consumer-behavior-2024',
  3480,
  'Mobile devices now account for 67% of digital media time. Gen Z consumers research products across an average of 5.3 channels before purchase. Video content influences 73% of purchase decisions.',
  'Understand how consumers research and buy in 2024. Essential for mapping effective customer journeys and channel strategies.',
  false,
  true
);

-- Sample Study 6: Brand Safety
INSERT INTO research_studies (
  title, 
  description, 
  author,
  publication_date,
  source,
  category,
  tags,
  file_url,
  file_size_kb,
  summary,
  why_it_matters,
  is_featured,
  is_published
) VALUES (
  'Brand Safety in Programmatic: Best Practices Guide',
  'Comprehensive guide to maintaining brand safety in programmatic campaigns, including tools, strategies, and case studies.',
  'IAS',
  '2023-11-15',
  'IAS',
  'Brand Safety',
  ARRAY['brand-safety', 'programmatic', 'quality', 'verification'],
  'https://www.integralads.com/brand-safety-guide-2024',
  1890,
  'Brand safety incidents cost advertisers $1.2B annually in wasted spend and reputation damage. Implementing comprehensive brand safety controls can reduce risk by 89% while maintaining 95%+ scale.',
  'Protect your brand reputation while maintaining campaign effectiveness. Includes practical checklists and tool recommendations.',
  false,
  true
);

-- Sample text content for testing RAG (you can use this with /process-text endpoint)
-- This is example content you'd extract from the PDFs

DO $$
BEGIN
  RAISE NOTICE '✅ Sample research studies inserted!';
  RAISE NOTICE '';
  RAISE NOTICE '📚 Next steps to test RAG:';
  RAISE NOTICE '   1. Choose a study ID (1-6)';
  RAISE NOTICE '   2. Add sample text using: POST /api/research/:id/process-text';
  RAISE NOTICE '   3. Test RAG with queries like: "What are programmatic trends?" or "How should I target audiences?"';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Example text to process for Study 1 (Programmatic):';
  RAISE NOTICE '   "Programmatic advertising now represents 85%% of all digital ad spend, up from 78%% in 2023."';
  RAISE NOTICE '   "CTV programmatic spending grew 35%% year-over-year, driven by increased streaming adoption."';
  RAISE NOTICE '   "Advertisers using first-party data in programmatic campaigns saw 34%% higher ROAS compared to third-party data alone."';
  RAISE NOTICE '   "Contextual targeting, when combined with behavioral data, performed especially well during Q4 holiday campaigns."';
  RAISE NOTICE '   "Brand safety remains a top concern, with 68%% of advertisers implementing advanced verification tools."';
END $$;

