# 🔗 Deal IDs API Integration - Sales Prospecting Tool

## ✅ **Integration Complete**

The Sales Prospecting Tool now **fetches real Deal IDs** from your Deal Library API instead of using mock data.

---

## 🎯 **What Changed**

### **Before (Mock Data)**
- 16 hardcoded sample deals
- Static data embedded in HTML
- No connection to actual inventory

### **After (Real API Data)**
- **Live connection** to `http://localhost:3002/api/deals`
- **Commerce Audience Purchase Intender** deals only
- **Real-time** deal information
- **Actual Deal IDs** (e.g., `SVN_426285879`, `SVN_744295785`)
- **Real bid guidance** from your Deal Library

---

## 📊 **Available Commerce Audience Deals**

Your Deal Library contains **Commerce Audience Purchase Intender** deals for the following segments:

### **Baby & Kids**
- Baby & Toddler, Baby & Toddler Clothing
- Baby Gift Sets, Baby Health, Baby Safety
- Baby Toys & Activity Equipment, Baby Transport
- Diapering, New Parents

### **Fashion & Apparel**
- Activewear, Clothing & Accessories, Clothing Accessories
- Dresses, Shirts & Tops, Shoes, Sunglasses

### **Food & Beverage**
- Beverages, Coffee, Condiments & Sauces
- Food Items, Sports & Energy Drinks

### **Health & Beauty**
- Cosmetics, Health & Beauty, Personal Care
- Fitness & Nutrition, Fitness Enthusiasts

### **Home & Pets**
- Animals & Pet Supplies, Cat Supplies, Dog Supplies
- Pet Owners, Pet Supplies

### **Entertainment & Lifestyle**
- Arts & Entertainment, Event Tickets
- Luggage & Bags, Media, Party & Celebration

---

## 🔧 **How It Works**

### **1. On Page Load**
```javascript
async function loadDealsFromAPI() {
    const response = await fetch('http://localhost:3002/api/deals?limit=500');
    const data = await response.json();
    apiDeals = data.deals || [];
}
```

### **2. Filtering Commerce Deals**
```javascript
const commerceDeals = apiDeals.filter(deal => 
    deal.targeting && deal.targeting.includes('Commerce Audiences')
);
```

### **3. Extracting Segment Names**
```javascript
// "Pet Supplies Purchase Intender (Mobile App - Video)" → "Pet Supplies"
const match = dealName.match(/^(.+?)\s+Purchase Intender/);
```

### **4. Smart Matching**
- **Exact match**: "Pet Supplies" === "Pet Supplies"
- **Fuzzy match**: "Pet Owners" matches "Pet Supplies"
- **Plural/singular**: "Shoe" matches "Shoes"
- **Contains**: "Baby & Toddler" matches "Baby Gift Sets"

### **5. Prioritization**
- **Score 3**: Matches both primary segment AND overlap
- **Score 2**: Matches primary segment only
- **Score 1**: Matches overlap product only

---

## 📈 **Example Usage**

### **User Action:**
1. Select category: "Home & Garden"
2. Select segment: "Pet Supplies"
3. Choose overlap: "Outerwear"
4. Click "Generate Infographic & Email"

### **API Response:**
The tool fetches and displays:
- `SVN_717141060` - Pet Supplies (Multi-format) - $15.50 CPM
- `SVN_426285879` - Pet Supplies (Mobile App - Video) - $5 CPM
- `SVN_749714215` - Pet Supplies (Mobile App - Display) - $1.50 CPM
- `SVN_691935077` - Pet Supplies (CTV) - $21 CPM
- `SVN_102938471` - Pet Owners (Multi-format) - $15.50 CPM

---

## 🚀 **Benefits**

1. **Always Current**: Shows latest deals from your inventory
2. **Accurate Pricing**: Real bid guidance, not estimates
3. **Real Deal IDs**: Copy-paste into campaigns
4. **Format Options**: See all available formats (Display, Video, CTV, Multi-format)
5. **Easy Updates**: Add new deals in Deal Library, they appear automatically

---

## 🔒 **Fallback Behavior**

If the API is unavailable:
- Tool continues to work
- Shows "No deals currently available" message
- Console logs error for debugging

---

## 📁 **Files Updated**

- ✅ `/sales-prospecting-tool-confluence.html` - Confluence embed version
- ✅ `/sales-prospecting-tool-v2.html` - Standalone version
- ✅ `/deal-library-frontend/public/sales-prospecting-tool.html` - Website version

---

## 🎓 **For Developers**

### **To Add More Segments:**
Just create new "Purchase Intender" deals in the Deal Library with:
- Deal Name format: `[Segment Name] Purchase Intender (Format)`
- Targeting: `Commerce Audiences`
- The tool will automatically pick them up!

### **To Customize Matching:**
Edit the `matchesSegment()` function in the HTML file (around line 1275)

### **To Change Number of Deals Shown:**
Update `.slice(0, 5)` to `.slice(0, N)` (line 1320)

---

## ✅ **Testing**

To test the integration:

1. **Start the backend**:
```bash
cd deal-library-backend
npm start
```

2. **Open the tool**:
```bash
open sales-prospecting-tool-confluence.html
```

3. **Check console** (F12):
```
✅ Loaded 150 deals from API
```

4. **Generate an infographic** and scroll to "Relevant Deal IDs" section

---

## 🐛 **Troubleshooting**

### **"No deals currently available"**
- Check backend is running on port 3002
- Check console for API errors
- Verify deals exist in Deal Library

### **Deals don't match segment**
- Check deal names include "Purchase Intender"
- Check targeting includes "Commerce Audiences"
- Check segment name spelling in Deal Library

### **CORS errors**
- Backend should allow localhost origins
- Check backend CORS configuration

---

**Last Updated**: 2025-10-13  
**API Endpoint**: `http://localhost:3002/api/deals`  
**Deal Count**: ~50 Commerce Audience segments (multiple formats each)


