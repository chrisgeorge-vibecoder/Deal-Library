# Competitive Intelligence - Browser Console Debugging Guide

## Issue
Competitive Intelligence card not populating, and no console logs visible.

## Root Cause Analysis

### The Problem
The console.log statements in `agentModeService.ts` are **server-side** (Node.js), so they appear in:
- Server terminal/logs
- **NOT** in the browser console

### What I Added
I've added **client-side logging** with `[BROWSER]` tags that WILL appear in your browser console.

## How to Debug

### Step 1: Open Browser DevTools
1. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. Click the **Console** tab
3. **Clear the console** (trash icon) to start fresh

### Step 2: Generate a Campaign Report
1. Go to Campaign Planner
2. Fill out the form (advertiser name, industry, etc.)
3. Click "Generate Campaign"
4. **Watch the console** as it generates

### Step 3: Look for These Logs

#### When Report Completes:
```
🎉 [BROWSER] Complete event received!
   [BROWSER] Report structure: ["advertiserName", "generatedDate", "results", ...]
   [BROWSER] Report.results: ["audiences", "deals", "personas", "strategy", ...]
   [BROWSER] Report.results.strategy: { competitors: [...], differentiators: [...] }
   [BROWSER] Strategy competitors: ["Competitor 1 - positioning", ...]
   [BROWSER] Strategy competitors count: 3
```

#### When Component Renders:
```
🖥️ [BROWSER] CampaignPlannerResults: Component rendered
   [BROWSER] Report exists: true
   [BROWSER] Results exists: true
   [BROWSER] Strategy exists: true
   [BROWSER] Strategy data: { hasCompetitors: true, competitorsCount: 3, ... }
```

#### When Card Evaluates:
```
🔍 [BROWSER] Competitive Intelligence Card Debug:
   [BROWSER] Strategy exists: true
   [BROWSER] Competitors: ["Competitor 1 - positioning", ...]
   [BROWSER] Competitors length: 3
   [BROWSER] Full strategy object: { competitors: [...], differentiators: [...] }
   ✅ Strategy and competitors found - showing card
```

## Diagnostic Scenarios

### Scenario 1: No `[BROWSER]` logs at all
**Problem**: Component isn't rendering or console is filtered
**Solution**: 
- Check if console filter is set to hide logs
- Verify the page loaded correctly
- Check for JavaScript errors (red text in console)

### Scenario 2: See "Complete event" but no strategy
```
🎉 [BROWSER] Complete event received!
   [BROWSER] Report.results.strategy: undefined
```
**Problem**: Server isn't generating strategy data
**Solution**: Check server logs/terminal for:
- `🎯 Generating strategic insights...`
- `🤖 Generating AI competitive intelligence via Gemini API...`
- Any errors in `generateStrategyInsights()`

### Scenario 3: Strategy exists but no competitors
```
   [BROWSER] Strategy exists: true
   [BROWSER] Strategy data: { hasCompetitors: false, competitorsCount: 0 }
   ⚠️ Strategy exists but no competitors - showing card with fallback
```
**Problem**: Gemini API failed or returned empty data
**Solution**: Check server logs for:
- `❌ Gemini API returned error:`
- `⚠️ Falling back to rule-based competitive analysis`
- The fallback should still show the card with "Industry competitors"

### Scenario 4: Strategy exists with competitors but card doesn't show
```
   [BROWSER] Strategy exists: true
   [BROWSER] Competitors: ["Competitor 1", "Competitor 2"]
   [BROWSER] Competitors length: 2
   ✅ Strategy and competitors found - showing card
```
**Problem**: Rendering issue (card should show)
**Solution**: Check React DevTools to see if component rendered but is hidden

## Server-Side Logs (Terminal/Backend)

These logs appear in your **server terminal**, not browser console:

```
🎯 Generating strategic insights...
🤖 Generating AI competitive intelligence via Gemini API...
   Query: "Acme Corp in pet care industry"
   Advertiser: Acme Corp
   Industry: pet care
   Products: premium dog food
   Calling Gemini Pro model...
   Response received (1234 chars), parsing JSON...
✅ Generated competitive intelligence (Pro) for: Acme Corp in pet care industry
   Gemini API response received: { success: true, hasData: true }
   Parsing response data: { hasCompetitiveAnalysis: true, competitorsCount: 5 }
✅ AI competitive intelligence generated successfully:
   Competitors: 5
   Differentiators: 3
```

## Quick Checklist

- [ ] Browser DevTools Console is open
- [ ] Console filter is set to show "All levels" (not just Errors)
- [ ] Campaign report generation completed
- [ ] Look for `[BROWSER]` tagged logs
- [ ] Check if `Report.results.strategy` exists
- [ ] Check if `strategy.competitors` has data
- [ ] If no strategy, check server terminal logs

## Next Steps Based on What You See

1. **If you see `[BROWSER]` logs**: The issue is in data flow or rendering
2. **If you DON'T see `[BROWSER]` logs**: Component isn't rendering (check for errors)
3. **If strategy is undefined**: Check server logs for generation errors
4. **If strategy exists but empty**: Check Gemini API response in server logs

## Files Modified

1. `deal-library-amplify-app/src/components/CampaignPlannerResults.tsx`
   - Added client-side logging when component renders
   - Enhanced card debug logging with `[BROWSER]` tags

2. `deal-library-amplify-app/src/app/campaign-planner/page.tsx`
   - Added logging when report is received via SSE
   - Logs strategy data structure when complete event arrives

