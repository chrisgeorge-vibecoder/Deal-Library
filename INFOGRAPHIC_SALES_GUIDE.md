# 📊 Commerce Audience Infographic Sales Guide

## Overview
Created a complete suite of sales-ready infographics to help your team win advertiser prospects with compelling, insight-driven visuals using Sovrn brand colors.

---

## 🎨 What You Have

### 1. **Full Venn Diagram Infographics** (`sales-infographics.html`)
- **Size**: 600x500px (perfect for email bodies)
- **Features**: 
  - 2-circle Venn diagrams showing audience overlaps
  - Large overlap percentages that grab attention
  - "💡 The Insight" box explaining WHY the overlap matters
  - Sovrn-branded footer
- **Best for**: Main pitch emails, follow-ups, case studies

**Examples Included:**
1. 🏕️ Camping & Hiking × Speakers (55% overlap)
2. ☕ Coffee × Exercise & Fitness (50% overlap)
3. ☕ Coffee × Household Supplies (52% overlap)
4. 🐕 Dog Supplies × Entertainment Centers (60% overlap)
5. 👟 Activewear × Outerwear (66% overlap)

### 2. **Compact Profile Cards** (`audience-profile-cards.html`)
- **Size**: 350x450px (mobile-friendly)
- **Features**:
  - Quick-scan format with key stat front and center
  - Gradient headers with emojis for visual interest
  - Concise "Why It Matters" insights
  - Grid layout for pitch decks
- **Best for**: Email attachments, social posts, signature blocks, multi-audience comparisons

### 3. **React Component Generator** (`AudienceInfographicGenerator.tsx`)
- **Location**: `/deal-library-frontend/src/components/`
- **Features**:
  - Live editing of all fields
  - Download as PNG or SVG
  - 5 Sovrn color scheme options
  - Auto-calculates percentages
- **Best for**: Creating custom infographics on-demand

---

## 📧 Sales Email Templates

### Template 1: The Hook Email
```
Subject: Did you know 55% of camping gear buyers also purchase speakers?

[First Name],

I came across something interesting in our commerce data that reminded me of [Brand].

[INFOGRAPHIC IMAGE HERE]

Adventure seekers want their soundtrack everywhere they go—whether it's motivating 
music on the trail or setting the mood at the campsite. That's a 9.9M audience actively 
shopping for wireless and rugged audio solutions.

Curious how we could help [Brand] reach them?

Best,
[Your Name]
```

### Template 2: The Persona-Led Email
```
Subject: The Coffee + Fitness Buyer: Your ideal customer?

[First Name],

Quick question: Does this sound like your target customer?

[PROFILE CARD IMAGE HERE]

Health-conscious early risers who fuel their active lifestyles with quality coffee. 
They're tracking macros, hitting the gym before work, and investing in wellness.

That's 10M commerce buyers with proven purchase intent. Want to learn how to reach them?

[CTA Button]
```

### Template 3: The Multi-Segment Pitch
```
Subject: 3 high-value audiences for [Brand Category]

[First Name],

Based on [Brand]'s products, I pulled three commerce audiences with the highest 
purchase propensity:

[CARD 1] [CARD 2] [CARD 3]

Combined reach: 24.9M buyers
Avg. overlap with [category]: 58%

Which audience profile looks most interesting to you?

Talk soon,
[Your Name]
```

---

## 💡 Key Selling Points to Emphasize

### When presenting these infographics:

1. **Data Storytelling**
   - "This isn't just data—it's the story of why your customers buy"
   - The overlap reveals intent and lifestyle patterns

2. **Precision Targeting**
   - "50%+ overlap means half your audience is already buying [overlap product]"
   - Reduce waste, increase ROI

3. **Scale + Quality**
   - Millions in reach with proven purchase behavior
   - Not modeled—actual commerce transactions

4. **The "Why" Behind the Buy**
   - Your insight explanations show you understand the customer
   - Helps creative teams develop resonant messaging

---

## 🎯 Best Practices

### DO:
✅ Lead with a question ("Did you know...?")
✅ Use the insight to show you understand their customer
✅ Keep email copy brief—let the visual do the work
✅ Include one clear CTA
✅ Follow up with more detailed deck if interested

### DON'T:
❌ Overload with multiple infographics in one email
❌ Send without personalization (mention their brand/category)
❌ Forget to test image rendering in email clients
❌ Use generic subjects like "Audience Data for Review"

---

## 📦 File Organization

```
Deal-Library/
├── sales-infographics.html          # Full Venn diagrams (5 examples)
├── audience-profile-cards.html      # Compact cards (6 examples)
├── venn-diagram-demo.html           # Original 2 & 3-circle demos
└── deal-library-frontend/src/components/
    ├── VennDiagram.tsx              # Basic Venn component
    └── AudienceInfographicGenerator.tsx  # Full generator with editor
```

---

## 🚀 How to Use

### For Sales Emails:
1. Open `sales-infographics.html` or `audience-profile-cards.html`
2. Right-click on infographic → "Save Image As" → Save as PNG
3. Insert into email or attach
4. Personalize the copy around the insight

### For Custom Infographics:
1. Navigate to http://localhost:3000 (once integrated)
2. Use the AudienceInfographicGenerator component
3. Edit segment name, overlap %, insight text
4. Choose color scheme
5. Download PNG or SVG

### For Pitch Decks:
1. Use Profile Cards in a grid (2-3 per slide)
2. Or use full Venn diagrams for deeper dives
3. Print page as PDF for offline presentations

---

## 🎨 Sovrn Brand Colors Used

All infographics use approved Sovrn brand colors:
- **Gold** (#FFD42B) - Primary
- **Orange** (#FF9A00) - Secondary
- **Coral** (#FF7B43)
- **Purple** (#D45087)
- **Navy** (#2F4A7C)
- **Charcoal** (#282828)

---

## 📊 Commerce Segments with Strong Stories

Here are more high-overlap segments from your data that would make great infographics:

| Segment | Top Overlap | % | Story Angle |
|---------|-------------|---|-------------|
| Camping & Hiking | Speakers | 55% | "The Soundtrack to Adventure" |
| Coffee | Exercise & Fitness | 50% | "Morning Fuel, Morning Workout" |
| Coffee | Household Supplies | 52% | "The Organized Home Maker" |
| Activewear | Outerwear | 66% | "Always Ready to Move" |
| Dog Supplies | Entertainment Centers | 60% | "The Homebody Pet Parent" |
| Advertising & Marketing | Sporting Goods | 60% | "Work Hard, Play Hard" |

**Want more?** The React generator can create these instantly with your full 199-segment dataset.

---

## 🔄 Next Steps

1. **Test in Email**: Send a test email to yourself to verify rendering
2. **Get Feedback**: Share with 2-3 top performers on the team
3. **A/B Test**: Try hook-led vs persona-led approaches
4. **Track Results**: Monitor open rates and reply rates
5. **Iterate**: Adjust insights based on what resonates

---

## 💬 Questions?

**For technical issues**: Check browser console or contact dev team
**For content questions**: These insights are based on actual commerce overlap data
**For new segments**: Use the React generator or request custom builds

---

**Last Updated**: October 10, 2025
**Created by**: AI Assistant + Sovrn Commerce Data Team



