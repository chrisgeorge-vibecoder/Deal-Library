# Debugging Guide: Audience Insights Issues

## ✅ Debug Logging Added

I've added comprehensive console logging to help diagnose the three issues you're experiencing:

1. **Map not loading**
2. **Population data not showing in table**
3. **Demographic Deep Dive charts not loading**

---

## How to Use the Debug Logs

### Step 1: Open Browser Console
1. Open the Audience Insights page
2. Press `F12` (or `Cmd+Option+I` on Mac)
3. Click the "Console" tab
4. Clear any existing logs

### Step 2: Generate a Report
1. Select a category and segment
2. Click "Generate Report"
3. Watch the console for debug messages

---

## What to Look For

### 🔍 **API Request/Response**

```
🔍 [DEBUG] Generating report for: { selectedCategory: "Electronics", selectedSegment: "Audio" }
📡 [DEBUG] API Response status: 200
📦 [DEBUG] Full API Response: { ... }
```

**Check:**
- Is the API status `200`?
- Does the response contain `success: true`?
- Is `report` object present?

---

### 📊 **Geographic Hotspots Data**

```
📊 [DEBUG] Geographic Hotspots: {
  count: 35,
  sample: {
    zipCode: "60602",
    city: "Chicago",
    state: "Illinois",
    density: 454713,
    population: undefined,    ← LOOK HERE!
    overIndex: undefined      ← AND HERE!
  },
  hasPopulation: false,       ← IMPORTANT!
  hasOverIndex: false         ← IMPORTANT!
}
```

**What This Tells You:**

#### **If `hasPopulation: false` and `hasOverIndex: false`:**
❌ **Root Cause:** Backend is NOT returning population and overIndex data in the API response.

**Possible Reasons:**
1. The backend code changes (commerce baseline) broke the geographic hotspots data structure
2. The `geographicHotspots` in the report is being mapped incorrectly
3. The `getTopGeographicConcentration` function is not including population/overIndex in the return

**What to relay:**
> "The API response is missing `population` and `overIndex` fields in the `geographicHotspots` array. Backend needs to include these fields."

#### **If `hasPopulation: true` and `hasOverIndex: true`:**
✅ Data is there! The problem is in the frontend rendering.

---

### 🗺️ **Map Component Props**

```
🗺️ [DEBUG] AudienceInsightsMap received props: {
  hotspotsCount: 10,
  segmentName: "Audio",
  firstHotspot: {
    zipCode: "60602",
    city: "Chicago",
    state: "Illinois",
    density: 454713
  },
  allHotspots: [ ... ]
}
```

**Check:**
- Is `hotspotsCount` > 0?
- Does `firstHotspot` have `city` and `state`?
- Are these values valid (not "Unknown")?

---

### 🗺️ **Map Marker Creation**

```
🗺️ [DEBUG] Processing hotspot 1: { zipCode: "60602", city: "Chicago", state: "Illinois", ... }
✅ [DEBUG] Coordinates for Chicago, Illinois: [41.8781, -87.6298]
🗺️ [DEBUG] Total markers created: 10
```

**If you see:**
- ⚠️ `No coordinates found for: Unknown, Unknown`
  → **Problem:** City/state data is missing or "Unknown"
  
- 🗺️ `Total markers created: 0`
  → **Problem:** No valid coordinates could be found for any hotspots

**What to relay:**
> "Map is receiving hotspots with city/state as 'Unknown'. Backend needs to return actual city and state names."

---

### 📋 **Table Rows**

```
📋 [DEBUG] Table row 1: {
  zipCode: "60602",
  city: "Chicago",
  state: "Illinois",
  density: 454713,
  population: 1127,        ← Should be a number
  overIndex: 2122660       ← Should be a number
}
```

**If you see:**
```
📋 [DEBUG] Table row 1: {
  zipCode: "60602",
  city: "Chicago",
  state: "Illinois",
  density: 454713,
  population: undefined,   ← PROBLEM!
  overIndex: undefined     ← PROBLEM!
}
```

**What to relay:**
> "Table rows show `population: undefined` and `overIndex: undefined`. Backend API response is not including these fields."

---

### 📊 **Demographics Charts Data**

```
📊 [DEBUG] Demographics: {
  incomeDistribution: [
    { bracket: "$100k-$150k", percentage: 31.07, nationalAvg: 15 },
    { bracket: "$50k-$75k", percentage: 29.21, nationalAvg: 25 },
    ...
  ],
  educationLevels: [
    { level: "High School or Less", percentage: 73.31 },
    ...
  ],
  ageDistribution: [
    { bracket: "30-39", percentage: 88.27 },
    ...
  ]
}
```

**If you see:**
```
📊 [DEBUG] Demographics: {
  incomeDistribution: undefined,
  educationLevels: undefined,
  ageDistribution: undefined
}
```

**What to relay:**
> "Demographics object is coming back undefined. Backend is not returning demographics data in the API response."

---

## Common Issues & Solutions

### Issue 1: Population/Over-Index Missing

**Symptoms:**
- Table shows "N/A" for population
- Over-Index column shows "N/A"
- Map may not load or markers may be missing

**Root Cause:**
The backend `audienceInsightsService.ts` is not including `population` and `overIndex` in the `geographicHotspots` array.

**Current Backend Code (WRONG):**
```typescript
geographicHotspots: topZipCodes.map((zip, index) => ({
  zipCode: zip.zipCode,
  city: zip.city || 'Unknown',
  state: zip.state || 'Unknown',
  density: zip.weight,  // ← Only includes these 4 fields
})),
```

**Should Be:**
```typescript
geographicHotspots: topZipCodes.map((zip, index) => ({
  zipCode: zip.zipCode,
  city: zip.city || 'Unknown',
  state: zip.state || 'Unknown',
  density: zip.weight,
  population: zip.population,    // ← ADD THIS
  overIndex: zip.overIndex        // ← ADD THIS
})),
```

---

### Issue 2: City/State showing "Unknown"

**Symptoms:**
- Map shows warning: "No coordinates found for: Unknown, Unknown"
- Table shows "Unknown, Unknown" for city/state

**Root Cause:**
The `getTopGeographicConcentration` function in the backend is returning ZIPs without city/state data from census lookup.

**What to Check in Backend Logs:**
```
⚠️  ${missingCityState} ZIPs missing city/state data (likely zero population in census)
```

If this number is high (> 5), the census data lookup is failing.

---

### Issue 3: Charts Not Loading

**Symptoms:**
- "Bar chart comparing audience HHI vs national average" placeholder shows
- No actual charts render

**Root Cause:**
The charts are just **placeholders** - we never implemented actual chart components!

**Current Code:**
```tsx
<div className="bg-gradient-to-br from-green-50 to-blue-50 ...">
  <BarChart3 className="..." />
  <p>Bar chart comparing audience HHI vs national average</p>
</div>
```

**This is NOT a bug** - the charts were never built. They're placeholders like the map was.

---

## Quick Decision Tree

### For the User to Report:

1. **Generate a report and check console**

2. **Look for this log:**
   ```
   📊 [DEBUG] Geographic Hotspots: { ... hasPopulation: ..., hasOverIndex: ... }
   ```

3. **If `hasPopulation: false`:**
   → **Report:** "Backend is not returning population/overIndex in API response"
   
4. **If city/state are "Unknown":**
   → **Report:** "Backend is returning 'Unknown' for city/state fields"
   
5. **If demographics are undefined:**
   → **Report:** "Backend demographics object is undefined"
   
6. **For charts:**
   → **Note:** Charts are placeholders (not implemented yet)
   
7. **For map not loading:**
   → **Check:** "Total markers created" count
   → **If 0:** City/state data is missing
   → **If > 0:** Check browser console for Leaflet errors

---

## Copy This Template

**For the user to send back:**

```
DEBUG REPORT:

API Status: [200/500/etc]
API Success: [true/false]

Geographic Hotspots:
- Count: [number]
- Has Population: [true/false]
- Has OverIndex: [true/false]
- Sample City/State: [value]

Map:
- Props Received: [true/false]
- Hotspots Count: [number]
- Markers Created: [number]
- First Marker Coords: [present/missing]

Table:
- Rows Rendering: [true/false]
- Population Values: [numbers/undefined/N/A]
- OverIndex Values: [numbers/undefined/N/A]

Demographics:
- Income Distribution: [array/undefined]
- Education Levels: [array/undefined]
- Age Distribution: [array/undefined]

Any Console Errors: [paste here]
```

---

## Expected Behavior (When Working)

### ✅ Correct API Response:
```json
{
  "success": true,
  "report": {
    "geographicHotspots": [
      {
        "zipCode": "60602",
        "city": "Chicago",
        "state": "Illinois",
        "density": 454713,
        "population": 1127,
        "overIndex": 2122660
      }
    ],
    "demographics": {
      "incomeDistribution": [ ... ],
      "educationLevels": [ ... ],
      "ageDistribution": [ ... ]
    }
  }
}
```

### ✅ Correct Console Output:
```
✅ [DEBUG] Report received successfully
📊 [DEBUG] Geographic Hotspots: { count: 35, hasPopulation: true, hasOverIndex: true }
🗺️ [DEBUG] Total markers created: 10
📋 [DEBUG] Table row 1: { population: 1127, overIndex: 2122660 }
📊 [DEBUG] Income Distribution data: [Array of 5 objects]
```

---

*Debug logging added to help diagnose the root cause of issues.*
*Please generate a report and send back the console output!*



