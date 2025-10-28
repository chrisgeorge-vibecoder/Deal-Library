# Audience Insights Port Configuration Fix

## Issue
"Failed to load segments: Failed to fetch" error when accessing Commerce Audience Insights tool.

## Root Cause
The frontend was attempting to fetch data from `http://localhost:3001`, but the backend server is actually running on `http://localhost:3002`.

## Solution
Updated all API endpoint URLs in the Audience Insights page to use the correct port (3002).

## Changes Made

### File: `deal-library-frontend/src/app/audience-insights/page.tsx`

#### Changed URLs from port 3001 → 3002:

1. **Segments loading endpoint**:
   - Before: `http://localhost:3001/api/audience-geo-analysis/segments`
   - After: `http://localhost:3002/api/audience-geo-analysis/segments`

2. **Fallback segments endpoint**:
   - Before: `http://localhost:3001/api/commerce-audiences/segments`
   - After: `http://localhost:3002/api/commerce-audiences/segments`

3. **Report generation endpoint**:
   - Before: `http://localhost:3001/api/audience-insights/generate`
   - After: `http://localhost:3002/api/audience-insights/generate`

## Verification

Backend server status checked and confirmed:
```bash
✅ Port 3000: Frontend (Next.js)
✅ Port 3002: Backend (Express/TypeScript)
✅ API responding correctly: http://localhost:3002/api/audience-geo-analysis/segments
```

## Testing Steps

1. **Refresh the browser** (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
2. Navigate to the Audience Insights page
3. Select a category (e.g., "Health & Beauty")
4. Segments should now load successfully
5. Select a segment and generate a report
6. Report should generate without errors

## Expected Result

- Category dropdown populates correctly
- Segment dropdown loads segments for selected category
- "Generate Report" button creates audience insights report
- Deal cards display and can be clicked
- Modal and save features work as implemented

## Server Configuration

The system uses the following port configuration:
- **Frontend**: Port 3000
- **Backend**: Port 3002
- Port 3001 is not used in this configuration

## Status
✅ **FIXED** - All API endpoints now correctly point to port 3002

---

**Date**: October 28, 2025
**Issue**: Failed to fetch segments
**Resolution**: Updated port configuration from 3001 to 3002

