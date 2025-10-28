# U.S. Market Insights - Quick Start Guide

## What is it?
A strategic market intelligence tool that transforms census data from 33,000+ ZIP codes into actionable insights for marketers.

## Quick Start (3 Steps)

### 1. Start the Servers
```bash
# Terminal 1 - Backend
cd deal-library-backend
npm run dev

# Terminal 2 - Frontend  
cd deal-library-frontend
npm run dev
```

### 2. Navigate to the Tool
Open http://localhost:3000 → Click **"U.S. Market Insights"** in the sidebar's Plan section

### 3. Explore Markets
1. **Select a metric** (e.g., "Median Household Income")
2. **Choose a geographic level** (Region, State, CBSA, County, City, ZIP)
3. **Click any market** to see its detailed profile with strategic snapshot

## Two Core Features

### Feature 1: Top Market Identification 🔍
**Purpose:** Find the highest-ranking markets for any demographic/economic attribute

**How to use:**
- Select metric from dropdown (organized by category)
- Switch geographic level using tabs
- View top 50 markets ranked high-to-low
- Use search box to filter by name
- Click any market to view profile

**Example Use Cases:**
- "Show me the top 20 states by median household income"
- "Which metro areas have the highest college-educated populations?"
- "Find counties with the lowest poverty rates"

### Feature 2: Market Profile Deep Dive 📊
**Purpose:** Get a comprehensive profile of any market with strategic insights

**What you get:**
- All 18 demographic/economic attributes
- National benchmark comparisons (% above/below average)
- **Strategic Market Snapshot** with:
  - Top 3 Strengths (what makes this market stand out)
  - Top 3 Considerations (areas that lag behind)
  - Natural language summary
- Attributes color-coded by significance

**Example Use Case:**
You're planning a campaign targeting affluent families. Select "California" at the State level:
- See it's 25% above national average in household income
- Notice 15% above average in college education
- Strategic snapshot highlights key opportunities and considerations
- Use insights to refine targeting and messaging

## Available Metrics (18 Total)

### Demographics (6 metrics)
- Total Population
- Median Age
- Population 65+
- Population 18-24
- Male Population %
- Female Population %

### Socioeconomics (5 metrics)
- Median Household Income ⭐ (Popular)
- Median Individual Income
- Six-Figure Households % ⭐ (Popular)
- Poverty Rate
- Unemployment Rate

### Housing & Wealth (3 metrics)
- Median Home Value ⭐ (Popular)
- Median Rent
- Homeownership Rate

### Education & Social (4 metrics)
- College Educated % ⭐ (Popular)
- Married Population %
- Dual-Income Families %
- Hispanic Population %
- Asian Population %

## Geographic Levels Explained

| Level | Example | Use Case |
|-------|---------|----------|
| **Region** | "Northeast", "South" | National campaign planning |
| **State** | "California", "Texas" | State-level media buys |
| **CBSA** | "New York-Newark-Jersey City, NY-NJ" | Metro area targeting |
| **County** | "Los Angeles County, California" | Granular regional analysis |
| **City** | "Austin, Texas" | City-specific campaigns |
| **ZIP** | "90210" | Hyper-local targeting |

## Reading the Strategic Snapshot

The **Strategic Market Snapshot** is the tool's signature feature - it automatically identifies what makes a market unique:

### Top Strengths (Green) ✅
Attributes where the market significantly **exceeds** national average
- **Example:** "Median Household Income: $85,000 (35% above national average)"
- **Insight:** This market has higher purchasing power than typical

### Key Considerations (Red) ⚠️
Attributes where the market significantly **lags** national average
- **Example:** "Population 18-24: 6.2% (20% below national average)"
- **Insight:** Fewer young adults - adjust youth-focused campaigns

### Using These Insights
1. **Identify opportunity areas** - Strengths suggest where to lean in
2. **Adjust expectations** - Considerations highlight areas to de-emphasize
3. **Refine messaging** - Tailor creative to market's unique profile
4. **Budget allocation** - Deploy capital where demographics align with product

## Real-World Marketing Scenarios

### Scenario 1: Luxury Product Launch
**Goal:** Find markets with high-income, educated professionals

**Workflow:**
1. Select "Six-Figure Households %" metric
2. Choose "CBSA" level to see metro areas
3. Review top 10 markets
4. Click each to see if they also have high college education
5. Export list (future feature) for media planning

### Scenario 2: Family-Oriented Campaign
**Goal:** Identify counties with married, dual-income families

**Workflow:**
1. Select "Dual-Income Families %" metric
2. Choose "County" level
3. Filter for counties with population > 100,000
4. Review strategic snapshots for other family indicators
5. Cross-reference with "Married Population %" metric

### Scenario 3: Geographic Expansion
**Goal:** Compare multiple states for potential expansion

**Workflow:**
1. Select "Median Household Income" at State level
2. Identify 5 candidate states in top 20
3. Click each state for detailed profile
4. Compare strategic snapshots side-by-side
5. Look for complementary strengths (e.g., high income + high homeownership)

## Tips & Tricks

### 🎯 Finding Hidden Gems
- Don't just look at top 5 - scroll to ranks 15-25 for overlooked opportunities
- Use search to quickly find specific markets you're considering

### 📊 Understanding Percentages
- Green highlights = >10% above national average (significant strength)
- Red highlights = >10% below national average (significant gap)
- White cards = Within 10% of national average (typical)

### 🔄 Comparing Metrics
- Select one metric, note top markets
- Switch to related metric (e.g., Income → Education)
- See which markets appear in both lists (strongest opportunities)

### 🗺️ Geographic Strategy
- Start broad (Region/State) to understand macro trends
- Drill down (CBSA/County) for tactical execution
- Use ZIP for hyper-local direct mail/OOH campaigns

## API Endpoints (For Developers)

```bash
# Get all available metrics
GET /api/market-insights/metrics

# Get top markets by metric
POST /api/market-insights/top-markets
Body: { "metricId": "income_household_median", "geoLevel": "state", "limit": 50 }

# Get market profile
POST /api/market-insights/profile  
Body: { "geoLevel": "state", "marketName": "California" }
```

## Troubleshooting

### "Failed to connect to the server"
- Ensure backend is running on port 3002
- Check `deal-library-backend/.env` for correct settings
- Verify the backend started successfully (look for "Server running on port 3002" message)

### "No markets found"
- Some metrics may have limited data at certain geographic levels
- Try a different geographic level or metric

### Slow loading (ZIP level)
- ZIP level has 33,000+ records - first load takes 5-10 seconds
- Subsequent loads are cached and instant

## Data Source
All data sourced from `uszips.csv` containing:
- 33,000+ residential ZIP codes (ZCTA=TRUE filter applied)
- U.S. Census Bureau demographic data
- American Community Survey economic data
- Aggregated using population-weighted averages for accuracy

## Support
For issues or questions, refer to:
- `US_MARKET_INSIGHTS_IMPLEMENTATION_COMPLETE.md` - Full technical documentation
- Plan document: `us-market-insights-tool.plan.md`

---

**Ready to identify your next high-opportunity market? Start exploring!** 🚀

