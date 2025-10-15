# 🧪 Testing Sales Prospecting Tool with Real Deal IDs

## ⚠️ **IMPORTANT: CORS Issue**

When you open the HTML file directly (`file:///path/to/file.html`), browsers **block** API requests to `localhost:3002` for security reasons (CORS).

**Symptoms:**
```
❌ Failed to load deals from API: TypeError: Failed to fetch
🔍 Finding deals for: "Pet Supplies" + "Outerwear"
⚠️  No API deals loaded
```

---

## ✅ **Solution: Use a Local Web Server**

You have **3 options** to test the tool properly:

---

### **Option 1: Use the Frontend Server** (Recommended)

Since the tool is already in `/deal-library-frontend/public/`, just access it through the Next.js dev server:

```bash
# Terminal 1: Start Backend
cd deal-library-backend
npm start

# Terminal 2: Start Frontend
cd deal-library-frontend
npm run dev

# Then open in browser:
http://localhost:3000/sales-prospecting-tool.html
```

✅ **This avoids CORS issues** because both the page and API are on `localhost`

---

### **Option 2: Use Python HTTP Server**

Simple one-liner to serve the HTML file:

```bash
# In the Deal-Library directory
cd /Users/cgeorge/Deal-Library

# Start simple HTTP server
python3 -m http.server 8000

# Then open in browser:
http://localhost:8000/sales-prospecting-tool-confluence.html
```

✅ **This avoids CORS issues** and is the quickest way to test standalone HTML files

---

### **Option 3: Use Node HTTP Server**

If you don't have Python:

```bash
# Install http-server globally (one time)
npm install -g http-server

# Start server
cd /Users/cgeorge/Deal-Library
http-server -p 8000

# Then open in browser:
http://localhost:8000/sales-prospecting-tool-confluence.html
```

---

## 🧪 **Testing Steps**

### **1. Start Backend**
```bash
cd deal-library-backend
npm start

# Should see:
# ✅ Server running on port 3002
```

### **2. Start Frontend (or HTTP server)**
```bash
# Option A: Frontend
cd deal-library-frontend
npm run dev

# Option B: Python server
python3 -m http.server 8000
```

### **3. Open Browser**
```
http://localhost:3000/sales-prospecting-tool.html
# OR
http://localhost:8000/sales-prospecting-tool-confluence.html
```

### **4. Open Browser Console** (F12 or Cmd+Option+I)

You should see:
```
🔄 Fetching deals from API...
✅ Loaded 150 deals from API
📊 Found 50+ Commerce Audience deals
```

### **5. Test with Pet Supplies**

1. Select category: **"Home & Garden"**
2. Select segment: **"Pet Supplies"**
3. Choose overlap: **"Outerwear"**
4. Click **"Generate Infographic & Email"**
5. Scroll down to **"Relevant Deal IDs"**

**Expected Output (in console):**
```
🔍 Finding deals for: "Pet Supplies" + "Outerwear"
📦 Total API deals: 150
🛒 Commerce Audience deals: 52
  ✓ Match: Pet Supplies → SVN_717141060
  ✓ Match: Pet Supplies → SVN_426285879
  ✓ Match: Pet Supplies → SVN_749714215
  ✓ Match: Pet Supplies → SVN_691935077
  ✓ Match: Pet Owners → SVN_102938471
✅ Found 5 relevant deals, showing top 5
```

**Expected Output (on page):**
```
┌─────────────────────────────────────────┐
│ SVN_717141060                           │
│ Pet Supplies (Multi-format)             │
│ Targets: Pet Supplies                   │
│ 💰 15.5 CPM                             │
├─────────────────────────────────────────┤
│ SVN_426285879                           │
│ Pet Supplies (Mobile App - Video)       │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

## 🐛 **Troubleshooting**

### **Problem: "Failed to load deals from API"**

**Check 1: Is backend running?**
```bash
curl http://localhost:3002/api/deals | jq '.deals | length'
# Should return a number (e.g., 150)
```

**Check 2: Are you using `http://localhost` (not `file://`)?**
```
❌ file:///Users/cgeorge/Deal-Library/sales-prospecting-tool.html
✅ http://localhost:8000/sales-prospecting-tool.html
```

**Check 3: Check browser console for errors**
- Open DevTools (F12)
- Look for red error messages
- Common issues: CORS, network errors, backend not running

---

### **Problem: "No specific deals found"**

**Check console output:**

**If you see:**
```
⚠️  No API deals loaded
```
→ **API call failed** - see "Failed to load deals" above

**If you see:**
```
📦 Total API deals: 150
🛒 Commerce Audience deals: 0
```
→ **No Commerce deals in API** - check Deal Library has "Commerce Audiences" targeting

**If you see:**
```
🛒 Commerce Audience deals: 52
✅ Found 0 relevant deals
```
→ **Matching logic issue** - check segment name spelling

---

### **Problem: Deals appear but don't match segment**

The tool uses **fuzzy matching**:
- "Pet Supplies" matches "Pet Supplies" ✓
- "Pet Supplies" matches "Pet Owners" ✓ (both have "pet")
- "Pet Supplies" matches "Animals & Pet Supplies" ✓ (contains "pet supplies")

If a segment isn't matching, check:
1. Deal name format: `[Segment] Purchase Intender (Format)`
2. Targeting field: Must include "Commerce Audiences"
3. Segment name spelling in Deal Library

---

## 📊 **Expected Results for Different Segments**

| **Segment** | **Expected Deals** |
|-------------|-------------------|
| Pet Supplies | 4-5 deals (Pet Supplies + Pet Owners) |
| Baby & Toddler | 8-10 deals (Baby & Toddler + Baby Health + Baby Safety, etc.) |
| Activewear | 4 deals (Activewear formats) |
| Coffee | 4 deals (Coffee formats) |
| Cosmetics | 4 deals (Cosmetics formats) |
| Shoes | 4 deals (Shoes formats) |

Each segment typically has:
- Multi-format / All Format
- Mobile App - Display
- Mobile App - Video
- CTV

---

## 🎯 **Quick Test Command**

Test if API is working from command line:

```bash
# Test API
curl -s http://localhost:3002/api/deals?limit=10 | jq '.deals[0]'

# Test Pet Supplies deals
curl -s http://localhost:3002/api/deals?limit=200 | \
  jq -r '.deals[] | select(.dealName | contains("Pet Supplies")) | .dealId'

# Should output:
# SVN_717141060
# SVN_691935077
# SVN_749714215
# SVN_426285879
```

---

## 📁 **File Locations**

- **Confluence version**: `/Users/cgeorge/Deal-Library/sales-prospecting-tool-confluence.html`
- **Standalone v2**: `/Users/cgeorge/Deal-Library/sales-prospecting-tool-v2.html`
- **Website version**: `/Users/cgeorge/Deal-Library/deal-library-frontend/public/sales-prospecting-tool.html`

All 3 versions now have:
- ✅ Real API integration
- ✅ Enhanced debugging
- ✅ CORS warning
- ✅ Improved error handling

---

## ✅ **Success Checklist**

- [ ] Backend running on port 3002
- [ ] Opened via `http://localhost` (not `file://`)
- [ ] Console shows "✅ Loaded X deals from API"
- [ ] Console shows "📊 Found X Commerce Audience deals"
- [ ] Generated infographic for Pet Supplies
- [ ] Saw real SVN_xxxxxxxx Deal IDs (not SAMPLE-xxx)
- [ ] Saw real bid guidance (15.5, 5, 1.5, 21)

---

**Last Updated**: October 13, 2025  
**Required**: Backend running + HTTP server (not file://)


