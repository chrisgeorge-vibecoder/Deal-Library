# LinkedIn Commerce Audience Insights Generator

## 📋 Overview

This tool automatically generates **"Did you know?"** insights for LinkedIn posts about Commerce Audiences. It:

1. 🔍 Queries all unique Commerce Audiences from your Supabase database
2. 🎲 Randomly selects 10 audiences
3. 📊 Generates comprehensive insights reports for each (using Census data, demographics, behavioral patterns)
4. 💡 Extracts 5 data-driven "Did you know?" insights per audience
5. 📝 Outputs results in both human-readable text and JSON formats

## 🚀 Quick Start

### Prerequisites

Make sure your backend `.env` file has these variables set:

```bash
# Required for Supabase database access
USE_SUPABASE=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Required for AI-powered insights generation
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run the Generator

```bash
./run-linkedin-insights.sh
```

That's it! The script will:
- Load your environment variables
- Install dependencies if needed
- Run the insights generator
- Save results to the root directory

## 📄 Output Files

### 1. `linkedin-commerce-insights.txt`
Human-readable format with 10 LinkedIn posts, each containing:
- Audience name
- 5 "Did you know?" insights with data and context
- Suggested hashtags

**Example:**
```
================================================================================
LINKEDIN POST #1: Pet Supplies
================================================================================

🎯 Did You Know? Pet Supplies Audience Insights

1. Income Level
   📊 $78,450 median HHI
   💡 11.4% higher than the national average

2. Purchasing Power
   📊 8.2% higher income
   💡 compared to average online shoppers

3. Education
   📊 32.5% Bachelor's degree or higher
   💡 7.1% lower than national average

4. Top Markets
   📊 Seattle, WA, Austin, TX, Denver, CO
   💡 Highest concentration ZIP codes for targeted reach

5. Primary Age Group
   📊 Ages 30-39
   💡 Represents 28% of this audience segment

---
These data-driven insights are powered by Sovrn's Commerce Audience Intelligence 
platform, analyzing real shopping behavior across millions of consumers.

#AudienceInsights #CommerceData #TargetedMarketing #PetSupplies
```

### 2. `linkedin-commerce-insights.json`
Structured JSON data for programmatic use:

```json
[
  {
    "audienceName": "Pet Supplies",
    "insights": [
      {
        "audience": "Pet Supplies",
        "insight": "Income Level",
        "data": "$78,450 median HHI",
        "context": "11.4% higher than the national average"
      },
      ...
    ],
    "reportSummary": "Full executive summary from the audience insights report..."
  }
]
```

## 🎯 What Insights Are Generated?

The script intelligently extracts up to 5 insights from each audience report:

1. **Income Level** - Median household income vs. national average
2. **Purchasing Power** - Income comparison vs. average online shoppers
3. **Education** - Bachelor's degree % vs. national benchmark
4. **Top Markets** - Top 3 geographic concentration areas
5. **Primary Age Group** - Dominant age bracket and percentage
6. **Entrepreneurial Spirit** - Self-employment rate (if notable)
7. **Family-Oriented** - Marriage/family household indicators
8. **Homeownership** - Home ownership rate (if above average)
9. **Affluent Markets** - Median home value (if premium)
10. **Cross-Shopping Behavior** - Top overlapping audience segments

The script selects the 5 most compelling insights based on data availability and significance.

## 🔧 Technical Details

### Script Location
- **Main Script**: `deal-library-backend/scripts/generate-linkedin-insights.ts`
- **Runner**: `run-linkedin-insights.sh` (root directory)

### How It Works

1. **Data Loading** - Loads commerce audience segments from Supabase
2. **Audience Selection** - Gets all unique audience names, randomly selects 10
3. **Report Generation** - For each audience:
   - Queries top 50 ZIP codes by audience weight
   - Enriches with Census demographic data
   - Calculates behavioral overlaps with other segments
   - Generates AI-powered strategic insights using Gemini
   - Compares against national and commerce baselines
4. **Insight Extraction** - Parses reports and extracts the most impactful data points
5. **Output Formatting** - Generates both text and JSON outputs

### Dependencies

The script uses these existing services:
- `SupabaseService` - Database access
- `commerceAudienceService` - Commerce audience data loading
- `audienceInsightsService` - Comprehensive report generation
- `censusDataService` - Demographic enrichment (via insights service)
- `geminiService` - AI-powered insights (via insights service)

## 📊 Data Sources

The insights are powered by:
- **Commerce Audience Segments** (2M+ records) - ZIP code × audience mappings
- **US Census Data** (41K+ ZIP codes) - Demographics, income, education, lifestyle
- **Behavioral Overlaps** - Cross-audience shopping patterns
- **AI Analysis** (Google Gemini) - Strategic insights and persona generation

## 🎨 Customization

### Change Number of Audiences

Edit line in `generate-linkedin-insights.ts`:
```typescript
const selectedAudiences = getRandomSelection(allAudiences, 10); // Change 10 to desired number
```

### Change Number of Insights Per Audience

Edit the return statement in `extractDidYouKnowInsights()`:
```typescript
return insights.slice(0, 5); // Change 5 to desired number
```

### Select Specific Audiences (Not Random)

Replace the random selection with specific audience names:
```typescript
const selectedAudiences = [
  'Pet Supplies',
  'Electronics',
  'Home Decor',
  // ... add your specific audiences
];
```

## 🐛 Troubleshooting

### "No commerce data found"
- Ensure `USE_SUPABASE=true` in your `.env` file
- Verify Supabase credentials are correct
- Check that `commerce_audience_segments` table exists and has data

### "Failed to generate report"
- Check that Census data is loaded in Supabase (`census_data` table)
- Verify `GEMINI_API_KEY` is set for AI-powered insights
- Review backend logs for specific error messages

### "Script execution failed"
- Run `cd deal-library-backend && npm install` to ensure dependencies are installed
- Check that all environment variables are set correctly
- Try running with `npx ts-node scripts/generate-linkedin-insights.ts` directly for detailed error output

## 📈 Example Use Cases

1. **Social Media Calendar** - Generate 10 posts once per week
2. **Sales Enablement** - Share audience insights with sales team
3. **Client Presentations** - Use data points in pitch decks
4. **Market Research** - Discover trends across different audiences
5. **Content Marketing** - Create blog posts or whitepapers from insights

## 🔄 Automation Ideas

### Weekly LinkedIn Posts
Add to cron job:
```bash
0 9 * * MON cd /path/to/Deal-Library && ./run-linkedin-insights.sh
```

### Slack Integration
Send results to Slack channel:
```bash
./run-linkedin-insights.sh && curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"New LinkedIn insights generated! Check linkedin-commerce-insights.txt"}' \
  YOUR_SLACK_WEBHOOK_URL
```

## 📝 Notes

- Each report generation takes ~5-10 seconds depending on data complexity
- Reports are cached for 1 hour to avoid regeneration
- The random selection ensures variety in your LinkedIn content
- All insights are backed by real data from Census and commerce behavior

## 🆘 Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify all prerequisites are met
3. Review the generated `backend.log` file for detailed logs
4. Ensure your Supabase database has all required tables and data

---

**Built with ❤️ for Sovrn's Commerce Audience Intelligence platform**








