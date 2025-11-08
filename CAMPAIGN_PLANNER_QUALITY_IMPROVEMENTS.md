# Campaign Planner Quality Improvements

## 🎯 Goal: Match LabCorp Proposal Quality

### Current State vs Target State

| Metric | LabCorp Standard | Current Output | Gap |
|--------|-----------------|----------------|-----|
| **Audience Segments** | 42 segments | 0 segments | ❌ CRITICAL |
| **Deal Recommendations** | Multiple deals per audience | 0 deals | ❌ CRITICAL |
| **Personas** | 3 detailed, context-rich | 3 generic | ⚠️ NEEDS IMPROVEMENT |
| **Reach Data** | Specific numbers (e.g., 9.4M) | Generic (30M total) | ⚠️ NEEDS IMPROVEMENT |
| **Campaign Strategies** | 3 complete strategies | None | ❌ MISSING |

---

## 🐛 Root Causes Identified

### 1. **Audience Search Returning 0 Results**

**Problem:**
- Search for "Moms" returns 0 segments
- Over-reliance on Gemini AI scoring with no fallback
- Too narrow search (only exact query, no related terms)

**Evidence:**
```
🔍 Searching audiences for: "Moms"
📦 Total segments collected: 0
```

**Should Find:**
- Baby & Toddler Toys (PIA)
- Children's Apparel (PIA)
- Household Supplies (PIA)
- Family-related Interest segments
- Parenting Demographics

### 2. **Memory Optimizations Limiting Results**

**Current Constraints (Too Restrictive):**
```typescript
// Agent Mode Service - Lines 338, 358, 370
const searchQueries = parsedBrief.targetAudiences.slice(0, 2); // Only 2 queries
allSegments.push(...(result.bestFit || []).slice(0, 5)); // Only top 5 per query
).slice(0, 10); // Max 10 total segments
```

**LabCorp Had:**
- 42 segments across 3 personas
- Multiple commerce + interest + demographic segments
- ~15-20 segments per persona

### 3. **Deal Matching Logic Too Narrow**

**Current:**
- Simple keyword matching
- Returns top 3 deals per segment
- If no segments found → 0 deals total

**LabCorp Had:**
- Complete deal inventory per audience
- CTV, Mobile App, Multi-format variations
- Reach and CPM data for each

### 4. **No Search Query Expansion**

**Current:** 
- Searches exactly what user types: "Moms"
- No related terms or synonyms

**Should Search:**
- "Moms" → also "parents", "family", "mothers", "children", "household"
- "Coffee lovers" → also "coffee", "espresso", "caffeine", "cafe"
- "Athletes" → also "fitness", "sports", "exercise", "athletic"

---

## 🔧 Improvements Needed

### Priority 1: Fix Audience Search (CRITICAL)

**A. Add Query Expansion**
```typescript
// Before: Single query
searchAudiences("Moms", {})

// After: Multiple related queries
const expandedQueries = await expandSearchTerms("Moms");
// Returns: ["Moms", "parents", "family", "mothers", "children", "household", "baby", "toddler"]

for (const query of expandedQueries) {
  results.push(await searchAudiences(query, {}));
}
```

**B. Add Keyword Fallback**
If Gemini scoring returns 0, fall back to simple keyword matching:
- Search segment names for "mom", "mother", "parent", "family", "child", "baby"
- Search segment descriptions for related terms
- Include commerce audiences with household/family categories

**C. Increase Limits**
```typescript
// From: Too restrictive
const searchQueries = parsedBrief.targetAudiences.slice(0, 2); // 2 queries
allSegments.push(...(result.bestFit || []).slice(0, 5)); // 5 per query
).slice(0, 10); // 10 total max

// To: More comprehensive (LabCorp quality)
const searchQueries = parsedBrief.targetAudiences.slice(0, 3); // 3 queries
allSegments.push(...(result.bestFit || []).slice(0, 10)); // 10 per query
allSegments.push(...(result.highValue || []).slice(0, 5)); // Add high-value too
).slice(0, 30); // 30 total max
```

### Priority 2: Improve Deal Matching

**A. Broader Matching**
- Match deals to audience categories, not just names
- Include deal variations (CTV, Mobile App, Multi-format)
- Return 5-10 deals per audience, not just 3

**B. Add Deal Enrichment**
- Include reach/scale data
- Add CPM/pricing guidance
- Show environment (CTV, Mobile App, etc.)

### Priority 3: Enhance Personas

**A. Link Personas to Found Audiences**
- Generate personas FROM the actual audience segments found
- Not generic personas disconnected from segments

**B. Add Commerce Context**
- Include purchase intent data
- Show cross-shopping behaviors
- Add demographic overlays

### Priority 4: Add Campaign Strategies

**A. Generate 3 Campaign Strategies**
- Map audiences to specific campaign objectives
- Provide messaging recommendations
- Include media mix suggestions

**B. Add Reach & Budget Estimates**
- Calculated from actual audience scales
- CPM-based budget recommendations
- Expected performance metrics

---

## 📋 Implementation Plan

### Phase 1: Critical Fixes (Must Do Now)

1. **✅ Add Query Expansion Function**
   - File: `agentModeService.ts`
   - Add `expandSearchTerms()` method
   - Use Gemini to generate related search terms

2. **✅ Add Keyword Fallback**
   - If Gemini search returns < 3 segments
   - Fall back to direct taxonomy keyword search
   - Include commerce segments by category

3. **✅ Increase Result Limits**
   - 3 queries instead of 2
   - 10 segments per query instead of 5
   - Include high-value segments
   - Max 30 segments instead of 10

4. **✅ Improve Deal Matching**
   - Match to audience categories
   - Include deal variations
   - Return 10 deals per campaign, not 3

### Phase 2: Quality Enhancements (High Priority)

5. **Generate Personas from Found Audiences**
   - Use actual segment data to create personas
   - Link personas to specific segments

6. **Add Audience Reach Data**
   - Pull scale7DayUS from segments
   - Calculate total addressable market
   - Show reach by segment

7. **Generate Campaign Strategies**
   - 3 distinct strategies based on objectives
   - Audience-to-objective mapping
   - Messaging recommendations

### Phase 3: Polish (Medium Priority)

8. **Add Budget Recommendations**
   - CPM-based calculations
   - Pilot vs full-scale options
   - Expected performance metrics

9. **Enhance Geographic Intelligence**
   - ZIP-level concentration data
   - Urban/suburban/rural distribution
   - Proximity targeting

10. **Add Competitive Context**
    - Market positioning
    - Competitive landscape
    - Strategic opportunities

---

## 🎯 Success Criteria

### Campaign Planner Output Should Include:

✅ **15-30 Audience Segments** (currently 0)
- Mix of commerce, interest, and demographic
- With reach/scale data
- Categorized by relevance

✅ **10+ Deal Recommendations** (currently 0)
- Matched to audience segments
- With CPM and reach data
- Across multiple environments

✅ **3 Rich Personas** (currently generic)
- Generated from actual segment data
- With purchase intent insights
- Linked to specific segments

✅ **3 Campaign Strategies** (currently missing)
- Mapped to campaign objectives
- With messaging recommendations
- Including budget estimates

✅ **Market Sizing** (partially working)
- Based on actual audience scales
- Segmented by audience type
- With penetration estimates

---

## 🚀 Expected Outcome

**Before:**
```
Audience Segments: 0
Deal Recommendations: 0
Personas: 3 generic
Campaign Strategies: None
```

**After (LabCorp Quality):**
```
Audience Segments: 25-30 specific segments
- 12 Commerce Audiences (e.g., Baby & Toddler, Household Supplies)
- 10 Interest Audiences (e.g., Parenting, Family Activities)
- 3-5 Demographic Audiences (e.g., Parents with Young Children)

Deal Recommendations: 15+ deals
- 5 CTV deals
- 5 Mobile App deals
- 5 Multi-format deals
- With CPM ranges ($0.65-$0.85)

Personas: 3 detailed, context-rich
- Linked to specific audience segments
- With purchase intent data
- Commerce insights included

Campaign Strategies: 3 complete strategies
- Objective-specific messaging
- Audience-to-tactic mapping
- Budget and reach estimates
```

---

## ⏱️ Implementation Timeline

**Immediate (Next 30 minutes):**
- Add query expansion
- Add keyword fallback
- Increase result limits

**Short-term (Next 1-2 hours):**
- Improve deal matching
- Link personas to segments
- Add reach calculations

**Medium-term (Next session):**
- Generate campaign strategies
- Add budget recommendations
- Polish output format

---

## 📝 Notes

- LabCorp proposal was manually curated, but Campaign Planner should achieve 80-90% of that quality automatically
- Key is **finding relevant segments** - rest flows from that
- Current "memory optimizations" went too far and hurt quality
- Better to have slower but richer results than fast but empty results

---

*Document Created: 2025-11-06*
*Status: Ready for Implementation*



