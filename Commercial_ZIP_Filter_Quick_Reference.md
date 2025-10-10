# Commercial ZIP Filter - Quick Reference

## ✅ Implementation Complete!

### What Changed:

**New checkbox added below segment selector:**
```
☐ Include downtown commercial ZIPs (offices, low residential pop)
💡 Enable for B2B segments. Disable for consumer segments.
```

**Default:** UNCHECKED (excludes commercial ZIPs)

---

## What Gets Filtered (When Unchecked):

**Downtown Commercial ZIPs:**
- Population < 10,000
- Examples: 60602 Chicago, 75270 Dallas, 10004 NYC, 20024 DC
- Characteristics: Offices, high volume, extreme over-index

**Why Filter:**
- Office workers' behavior ≠ residential consumer behavior
- Extreme over-index scores (3.6M%) are misleading
- Demographics contaminated with daytime office population

---

## When to Use the Toggle:

### ☑️ **CHECK the box for:**
- Office Furniture
- Office Supplies
- Business Software
- Business & Industrial segments
- Any B2B targeting

### ☐ **UNCHECK the box for (default):**
- Dog Supplies
- Baby Products
- Home & Garden
- Food & Beverages
- Apparel
- Most consumer segments

---

## Example Results:

### Dog Supplies (Unchecked - Default):
```
✅ Top Markets: All residential areas
   1. Atlanta suburbs (78k pop)
   2. Jersey City neighborhoods (54k pop)
   3. Westminster CA (90k pop)
   
❌ Excluded: Downtown Chicago (1k pop), Dallas commercial (0 pop)
```

### Office Furniture (Checked):
```
✅ Top Markets: Commercial + Residential
   1. Chicago downtown offices (1k pop) 🏢
   2. Dallas commercial district (0 pop) 🏢
   3. Atlanta suburbs (78k pop) 🏘️
   
✅ Included: ALL markets (comprehensive B2B view)
```

---

## Quick Decision Matrix:

| Segment Type | Toggle State | Rationale |
|--------------|--------------|-----------|
| Pet Products | ☐ OFF | Pets live at home, not offices |
| Baby Products | ☐ OFF | Families are residential |
| Home & Garden | ☐ OFF | Homes, not offices |
| Office Furniture | ☑️ ON | Offices ARE the market |
| Business Software | ☑️ ON | B2B targeting |
| Electronics | Either | Depends: Consumer or Enterprise? |

---

*Your solution was perfect - smart default with flexibility!*



