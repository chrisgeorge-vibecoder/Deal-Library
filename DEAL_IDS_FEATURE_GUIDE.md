# 🎯 Deal IDs Feature - Sales Prospecting Tool

## ✅ Feature Added

The Sales Prospecting Tool now displays **relevant Deal IDs** based on the selected audience segment and overlapping audience.

---

## 📋 What It Does

When a sales rep generates an infographic for a specific audience combination, the tool now automatically shows:

1. **Up to 5 relevant Deal IDs** that match the audience segments
2. **Deal Name** (e.g., "Athletic Performance Network")
3. **Targeting Details** (which audiences each deal covers)
4. **Bid Guidance** (CPM ranges for each deal)

---

## 🎨 How It Looks

**New Section Added:**

```
┌─────────────────────────────────────────┐
│ 5. Relevant Deal IDs                    │
├─────────────────────────────────────────┤
│ SPORT-001                               │
│ Athletic Performance Network            │
│ Targets: Athletics, Sporting Goods...  │
│ $3.50 - $4.50 CPM                       │
├─────────────────────────────────────────┤
│ FITNESS-015                             │
│ Health & Wellness Network               │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

## 🔍 How It Works

### **Matching Logic:**

The tool finds deals that match **either**:
- The **primary audience segment** (e.g., "Camping & Hiking")
- The **overlapping audience** (e.g., "Sporting Goods")

### **Prioritization:**

Deals are sorted by relevance:
1. **Deals matching BOTH segments** (primary + overlap) appear first
2. Deals matching only one segment appear next
3. **Top 5 most relevant** deals are displayed

---

## 📊 Sample Deals Included

The tool includes **16 sample deals** covering major categories:

| Deal ID | Deal Name | Target Segments |
|---------|-----------|----------------|
| **SPORT-001** | Athletic Performance Network | Athletics, Sporting Goods, Exercise & Fitness |
| **HOME-002** | Home Improvement Marketplace | Home & Garden, Furniture, Building Materials |
| **TECH-003** | Consumer Electronics Premium | Electronics, Laptops, Mobile Devices |
| **BABY-004** | New Parents Network | Baby & Toddler, Parenting Products |
| **FOOD-005** | Grocery & CPG Marketplace | Food Items, Beverages, Household Supplies |
| **FASHION-006** | Apparel & Lifestyle Network | Clothing, Shoes, Fashion Accessories |
| **BEAUTY-007** | Health & Beauty Collective | Health & Beauty, Personal Care, Cosmetics |
| **PET-008** | Pet Owners Premium Network | Pet Supplies, Dog/Cat Supplies |
| **AUTO-009** | Automotive Enthusiasts Network | Vehicles & Parts |
| **OFFICE-010** | Business Solutions Marketplace | Office Supplies, Business & Industrial |
| **OUTDOOR-011** | Outdoor Adventure Network | Camping & Hiking, Outdoor Recreation |
| **MEDIA-012** | Entertainment & Media Network | Arts & Entertainment, Media, Books |
| **KIDS-013** | Children's Products Network | Toys, Educational Products |
| **KITCHEN-014** | Kitchen & Dining Premium | Kitchen Appliances, Cookware |
| **FITNESS-015** | Health & Wellness Network | Fitness & Nutrition, Exercise |
| **ALCOHOL-016** | Premium Beverage Network | Alcoholic Beverages |

---

## 💼 Use Cases

### **For Sales Reps:**
1. **Quick Deal Reference** - See which existing deals apply to the prospect's audience
2. **Campaign Activation** - Use the Deal IDs when setting up campaigns
3. **Cross-Selling** - Identify additional deals the client might be interested in

### **For Account Managers:**
1. **Deal Collaboration** - Know which deals to coordinate with
2. **Revenue Optimization** - Match clients to high-CPM premium deals
3. **Custom Deal Justification** - Show when no existing deal covers the audience

---

## 🔧 Technical Implementation

### **Data Structure:**

```javascript
const dealsDatabase = [
    {
        dealId: "SPORT-001",
        dealName: "Athletic Performance Network",
        targeting: "Athletics, Sporting Goods, Exercise & Fitness",
        segments: ["Athletics", "Sporting Goods", "Exercise & Fitness", ...],
        bidGuidance: "$3.50 - $4.50 CPM"
    },
    // ... more deals
];
```

### **Matching Function:**

```javascript
function findRelevantDeals(segment, overlapProduct) {
    // 1. Find deals matching primary segment OR overlap
    // 2. Sort by relevance (matching both > matching one)
    // 3. Return top 5
}
```

---

## 🔄 Updating the Deals

### **Option 1: Edit the HTML File (Quick)**

For temporary updates or testing:

1. Open the HTML file
2. Find the `dealsDatabase` array (around line 677)
3. Add, remove, or modify deals
4. Save and reload

### **Option 2: Connect to Your Backend API (Production)**

For dynamic, real-time deal data:

```javascript
// Replace the embedded dealsDatabase with an API call
async function loadDeals() {
    const response = await fetch('http://localhost:3002/api/deals');
    const deals = await response.json();
    // Transform to match the format
    return deals.map(deal => ({
        dealId: deal.dealId,
        dealName: deal.dealName,
        targeting: deal.targeting,
        segments: extractSegments(deal.targeting),
        bidGuidance: deal.bidGuidance
    }));
}
```

### **Option 3: Fetch from Google Sheets**

If your deals are in Google Sheets:

```javascript
async function loadDealsFromSheets() {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL + '?action=getDeals');
    const deals = await response.json();
    // Transform to match format
}
```

---

## 🎨 Customization

### **Change CPM Badge Color:**

In the CSS (around line 337):

```css
.deal-cpm {
    background: #d4e8d4;  /* Change this */
    color: #2d5016;       /* And this */
}
```

### **Change Border Color:**

```css
.deals-list li {
    border-left: 4px solid #2F4A7C;  /* Change this */
}
```

### **Show More/Fewer Deals:**

In `findRelevantDeals()` function (line 1372):

```javascript
return relevantDeals.slice(0, 5);  // Change 5 to any number
```

---

## 📏 Height Considerations

### **For Confluence:**

The Deal IDs section adds ~300-500px to the page height.

**Updated iframe height recommendation:**

```html
<iframe height="3100px">  <!-- Increased from 2800px -->
```

**Height breakdown:**
- Original content: ~2,500px
- Deal IDs section: ~300-500px (varies by number of deals)
- **Total:** ~2,800-3,000px
- **Recommended:** `3100px` (with buffer)

---

## ✅ Files Updated

1. ✅ `sales-prospecting-tool-v2.html` - Main version with Deal IDs
2. ✅ `sales-prospecting-tool-confluence.html` - Confluence version with Deal IDs
3. ✅ `deal-library-frontend/public/sales-prospecting-tool.html` - Website version with Deal IDs

---

## 🧪 Testing

### **Test Scenario 1: Athletic Audience**

1. Select "Sports & Outdoors" category
2. Select "Camping & Hiking" segment
3. Select "Sporting Goods" overlap
4. Click "Generate Infographic & Email"
5. **Expected:** See SPORT-001, OUTDOOR-011, and related deals

### **Test Scenario 2: Baby Products**

1. Select "Baby & Kids" category
2. Select "Baby & Toddler" segment
3. Select any overlap
4. Click generate
5. **Expected:** See BABY-004 deal

### **Test Scenario 3: No Matches**

1. Select a very niche segment
2. **Expected:** See message "No specific deals found" with contact instructions

---

## 🚀 Next Steps

### **Phase 1: Currently Implemented** ✅
- [x] Sample deals database embedded in tool
- [x] Automatic deal matching based on segments
- [x] Visual display of Deal IDs, names, targeting, and CPM
- [x] Prioritization of most relevant deals

### **Phase 2: Future Enhancements** (Optional)

- [ ] **Live API Integration** - Fetch real-time deals from your backend
- [ ] **Click-to-Copy** - Click a Deal ID to copy it to clipboard
- [ ] **Deal Details Modal** - Click for more info about each deal
- [ ] **Filter by CPM Range** - Show only deals within budget
- [ ] **Deal Performance Data** - Show historical CTR, conversion rate
- [ ] **Contact Deal Owner** - Direct link to reach out to deal manager

---

## 📞 Support

### **To Add More Deals:**

Contact your development team to:
1. Add deals to the `dealsDatabase` array, OR
2. Connect the tool to your live Deals API

### **To Customize Matching Logic:**

The matching is currently based on exact segment name matches. For more sophisticated matching (fuzzy matching, category-level matching, etc.), contact your development team.

---

## 🎯 Summary

**What Changed:**
- ✅ Added section "5. Relevant Deal IDs"
- ✅ Shows up to 5 matching deals per audience combination
- ✅ Includes 16 sample deals covering major categories
- ✅ Displays Deal ID, name, targeting, and CPM range
- ✅ Prioritizes deals matching both primary and overlap segments

**Benefit for Sales:**
- Faster deal discovery
- More accurate campaign setup
- Better cross-selling opportunities
- Reduced need to search through deal lists manually

**Next Action:**
Test the feature by generating infographics for different audience combinations!


