# Census Data: Available vs Currently Used

## Currently Used (✅ Active)

### **Demographics:**
1. ✅ **Age Median** (age_median)
2. ✅ **Age Distribution** (age_under_10 → age_over_80)
3. ✅ **Education - Bachelor's** (education_bachelors)
4. ✅ **Education - Graduate** (education_graduate)
5. ✅ **Household Size** (family_size)
6. ✅ **Ethnicity** (race_white, race_black, race_asian, hispanic)

### **Economics:**
7. ✅ **Household Income Median** (income_household_median)
8. ✅ **Income Distribution** (income_household_under_5 → income_household_150_over)
9. ✅ **Six-Figure Households** (income_household_six_figure)

### **Housing:**
10. ✅ **Home Value** (home_value) ← **YOU'RE RIGHT, WE ARE USING THIS!**
11. ✅ **Home Ownership Rate** (home_ownership)

### **Geography:**
12. ✅ **Urban/Rural Classification** (inferred from density/population)

---

## Available But NOT Used (🆕 Opportunities)

### **💼 Employment & Economy** (HIGH VALUE)

| Field | Description | Marketing Value |
|-------|-------------|-----------------|
| `labor_force_participation` | % working | **HIGH** - Indicates purchasing power, time availability |
| `unemployment_rate` | % unemployed | **MEDIUM** - Economic stress indicator |
| `self_employed` | % self-employed | **HIGH** - Entrepreneurs, small business owners (different buying behavior) |
| `farmer` | % farmers | **MEDIUM** - Rural, agricultural segments |
| `income_individual_median` | Personal income | **MEDIUM** - Supplement to household income |

**Use Cases:**
- Self-employed % → Identify B2B opportunities, flexible schedules
- Labor force participation → Time-of-day targeting, weekday vs weekend
- Unemployment rate → Price sensitivity indicator

---

### **👥 Family & Marital Status** (HIGH VALUE)

| Field | Description | Marketing Value |
|-------|-------------|-----------------|
| `married` | % married | **HIGH** - Joint purchasing decisions, family focus |
| `divorced` | % divorced | **MEDIUM** - Single-income households, different needs |
| `never_married` | % never married | **HIGH** - Singles, younger demo, different lifestyle |
| `widowed` | % widowed | **LOW** - Seniors, fixed income |
| `family_dual_income` | % dual income | **HIGH** - Wealthier, busier, convenience-focused |

**Use Cases:**
- Dual income families → Premium products, time-saving services
- Never married → Singles-focused products, smaller packages
- Married % → Family-oriented messaging

---

### **📚 Education Detail** (MEDIUM VALUE)

| Field | Description | Marketing Value |
|-------|-------------|-----------------|
| `education_less_highschool` | % < HS diploma | **MEDIUM** - Messaging complexity |
| `education_highschool` | % HS diploma | **MEDIUM** - Blue-collar segments |
| `education_some_college` | % some college | **MEDIUM** - Mid-tier education |
| `education_college_or_above` | % college+ | **LOW** - Duplicate of bachelor's + graduate |
| `education_stem_degree` | % STEM degrees | **HIGH** - Tech products, early adopters |

**Use Cases:**
- STEM degree % → Tech product affinity, innovation early adopters
- Education levels → Message sophistication (simple vs technical)

---

### **🏠 Housing Detail** (MEDIUM VALUE)

| Field | Description | Marketing Value |
|-------|-------------|-----------------|
| `housing_units` | Number of units | **LOW** - Already covered by population |
| `rent_median` | Median rent | **MEDIUM** - Supplement to home value |
| `rent_burden` | % income on rent | **MEDIUM** - Financial stress indicator |

**Use Cases:**
- Rent burden → Price sensitivity
- High rent + low income → Value-focused messaging

---

### **🚗 Lifestyle Indicators** (MEDIUM VALUE)

| Field | Description | Marketing Value |
|-------|-------------|-----------------|
| `commute_time` | Avg commute mins | **HIGH** - Car products, audio entertainment, convenience |
| `health_uninsured` | % uninsured | **MEDIUM** - Health product affordability |
| `veteran` | % veterans | **MEDIUM** - Patriotic messaging, discounts |
| `charitable_givers` | % donate to charity | **HIGH** - Values-based marketing, CSR messaging |

**Use Cases:**
- Long commute → Car products, podcasts, audio entertainment
- Charitable givers → Ethical brands, sustainability, social causes
- Veterans → American-made products, military discounts

---

### **🌍 Socioeconomic Factors** (MEDIUM VALUE)

| Field | Description | Marketing Value |
|-------|-------------|-----------------|
| `poverty` | % below poverty line | **MEDIUM** - Price sensitivity |
| `disabled` | % with disabilities | **LOW** - Accessibility considerations |
| `limited_english` | % limited English | **LOW** - Language considerations |

**Use Cases:**
- Poverty rate → Value/discount messaging
- Limited English → Multilingual marketing

---

### **👶 Detailed Age Brackets** (ALREADY USED)

We're already using these effectively:
- age_under_10, age_10_to_19, age_20s, age_30s, etc.
- age_over_65, age_18_to_24, age_over_18

---

### **📍 Geographic Detail** (LOW VALUE)

| Field | Description | Marketing Value |
|-------|-------------|-----------------|
| `county_name` | County | **LOW** - Already have city/state |
| `cbsa_name` | Metro area | **MEDIUM** - Market size context |
| `timezone` | Time zone | **LOW** - Already inferred |
| `military` | Military base ZIP | **LOW** - Already filtered out |

---

## Recommended Additions (Prioritized)

### **🔥 TIER 1: HIGH VALUE - IMPLEMENT NOW**

1. **Self-Employed %** (`self_employed`)
   - **Why:** Identifies entrepreneurs, small business owners
   - **Use:** B2B products, office supplies, flexible scheduling
   - **Example:** Office Furniture segment → 15% self-employed = home office focus

2. **Married %** (`married`)
   - **Why:** Joint decisions, family focus
   - **Use:** Family products, larger purchases
   - **Example:** Audio segment → 60% married = family entertainment hub

3. **Dual Income %** (`family_dual_income`)
   - **Why:** Wealthier, busier, convenience-focused
   - **Use:** Premium products, time-saving services
   - **Example:** Pet Supplies → 70% dual income = premium pet care services

4. **Commute Time** (`commute_time`)
   - **Why:** Car products, audio, convenience needs
   - **Use:** Automotive, audio, podcasts, meal kits
   - **Example:** Audio segment → 35 min avg commute = car audio systems

5. **Charitable Givers %** (`charitable_givers`)
   - **Why:** Values-based consumers
   - **Use:** Ethical brands, sustainability, CSR
   - **Example:** Pet Supplies → 45% charitable = eco-friendly, humane products

6. **STEM Degree %** (`education_stem_degree`)
   - **Why:** Early adopters, tech affinity
   - **Use:** Tech products, innovation, complex features
   - **Example:** Computer Components → 25% STEM = cutting-edge tech

---

### **⚡ TIER 2: MEDIUM VALUE - CONSIDER**

7. **Never Married %** (`never_married`)
   - Singles focus, smaller households
   
8. **Labor Force Participation** (`labor_force_participation`)
   - Working hours, purchasing power

9. **Rent Burden** (`rent_burden`)
   - Financial stress, price sensitivity

10. **Unemployment Rate** (`unemployment_rate`)
    - Economic conditions

---

### **📊 TIER 3: LOW VALUE - SKIP FOR NOW**

- Individual income (duplicates household income)
- Detailed education breakdown (already have bachelor's+)
- Geographic codes (already have city/state)
- Disability/limited English (niche use cases)

---

## Implementation Recommendation

### **Phase 1: Add Top 6 (Tier 1)** ✅

**Estimated effort:** 2-3 hours

**Changes needed:**
1. Update `censusDataService.ts` to parse new fields
2. Update `audienceInsightsService.ts` to aggregate new metrics
3. Update Gemini prompts to include new context
4. Update frontend display (optional - can show in "Deep Dive" section)

**Example additions to persona insights:**

```typescript
{
  lifestyle: {
    selfEmployed: 15.2,        // % entrepreneurs
    marriedRate: 58.3,          // % married
    dualIncome: 68.9,           // % dual income families
    avgCommute: 28.4,           // minutes
    charitableGivers: 42.1,     // % donate
    stemDegree: 18.7            // % STEM educated
  }
}
```

**Gemini prompt enhancement:**
```
LIFESTYLE & VALUES:
- Self-Employment: 15.2% (entrepreneurs, home offices)
- Married: 58.3%, Dual Income: 68.9% (joint decisions, busy families)
- Avg Commute: 28.4 mins (car time, audio needs)
- Charitable: 42.1% (values-driven, ethical brands)
- STEM: 18.7% (tech-savvy, early adopters)
```

---

## Expected Impact

### **Better Personas:**
- "The Entrepreneurial Audio Enthusiast" (15% self-employed)
- "The Dual-Income Dog Parent" (70% dual income, 60% married)
- "The Commuting Tech Professional" (35 min commute, 25% STEM)

### **Better Insights:**
- Time-of-day targeting (commute times)
- Values-based messaging (charitable givers)
- B2B opportunities (self-employed)
- Family vs singles positioning (married %)
- Premium vs value (dual income)

### **Better Channel Recommendations:**
- Long commute → Spotify, podcast ads, car audio
- Charitable → Patagonia-style brands, cause marketing
- STEM → Reddit, Hacker News, tech forums
- Dual income → Premium placements, convenience focus

---

## Summary

### **Currently Using:** 12 fields ✅
### **High-Value Available:** 6 fields 🔥
### **Medium-Value Available:** 10 fields ⚡
### **Low-Value Available:** 8 fields 📊

### **Recommendation:**
**Add the 6 Tier 1 fields** for maximum impact with minimal effort.

**Should we implement these?** The data is already in the CSV - we just need to parse and use it!

---

**Next Steps:**
1. Review Tier 1 recommendations
2. Decide which to implement
3. Update backend to parse/aggregate
4. Enhance Gemini prompts
5. Test with sample segments

**Would you like me to implement Tier 1 enhancements?** 🚀



