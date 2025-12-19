# Strategic Marketing Insights Fix Recommendation

## Issues Identified

Based on browser testing of https://launchpad.sovrn.ai/audience-insights:

1. **Strategic Marketing Insights**: Only showing minimal fallback content ("Digital channels", "Targeted advertising") instead of full AI-generated insights
2. **Persona Emoji**: Showing generic 👤 instead of segment-specific emoji (e.g., 👶 for Diapering)
3. **Persona Content**: ✅ Working well - "Practical Pam" description is excellent

## Root Cause Analysis

The Strategic Marketing Insights are falling back to minimal content because:
- Gemini API calls are timing out (30-second timeout per call)
- Error handling catches the timeout and returns minimal fallback content
- No retry logic for failed Gemini calls
- No user-facing indication that generation failed

## Recommended Fixes

### Priority 1: Increase Timeout and Add Retry Logic

**File**: `deal-library-amplify-app/src/lib/services/audienceInsightsService.ts`

**Changes**:
1. Increase `GEMINI_CALL_TIMEOUT_MS` from 30s to 45s for strategic content generation
2. Add retry logic (2 retries) for failed Gemini calls
3. Add better error logging to identify specific failure points

```typescript
// In generateStrategicContent method (around line 564)
const GEMINI_CALL_TIMEOUT_MS = 45000; // Increased from 30s to 45s

// Add retry wrapper function
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 2,
  timeout: number = GEMINI_CALL_TIMEOUT_MS
): Promise<T> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt + 1} failed:`, error);
      if (attempt === retries) {
        throw error;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw new Error('All retry attempts failed');
};

// Update strategicInsightsPromise to use retry
const strategicInsightsPromise = withRetry(() => 
  this.generateStrategicInsights(
    trimmedSegment,
    category || 'General',
    demographics,
    overlaps,
    geoIntelligence,
    commerceBaseline
  )
).catch(error => {
  console.error('❌ Failed to generate strategic insights after retries:', error);
  // Return more informative fallback
  return {
    targetPersona: `The ${trimmedSegment} audience`,
    keyInsights: [`Strong engagement with ${trimmedSegment} products and services`],
    messagingRecommendations: [
      {
        valueProposition: `Target ${trimmedSegment} enthusiasts with quality-focused messaging`,
        dataBacking: `Based on ${demographics.validZipCount || 'thousands of'} ZIP codes with high ${trimmedSegment} purchase activity`,
        emotionalBenefit: `Connect with parents/caregivers seeking reliable solutions`,
        campaignReady: false
      }
    ],
    channelRecommendations: [
      'Digital display advertising on premium content sites',
      'Social media platforms targeting relevant demographics',
      'Email marketing campaigns with personalized recommendations'
    ],
    creativeGuidance: `Focus on ${trimmedSegment} needs and preferences, showcasing how your offering aligns with their interests.`
  };
});
```

### Priority 2: Improve Persona Emoji Handling

**File**: `deal-library-amplify-app/src/lib/services/audienceInsightsService.ts`

**Changes**:
1. Add segment-specific emoji mapping as fallback
2. Ensure persona emoji is set even when AI generation fails

```typescript
// Add emoji mapping helper (around line 628)
const getSegmentEmoji = (segment: string, category: string): string => {
  const segmentLower = segment.toLowerCase();
  const categoryLower = category.toLowerCase();
  
  // Baby & Toddler category
  if (categoryLower.includes('baby') || categoryLower.includes('toddler')) {
    if (segmentLower.includes('diaper')) return '👶';
    if (segmentLower.includes('nurs') || segmentLower.includes('feed')) return '🍼';
    if (segmentLower.includes('toy')) return '🧸';
    if (segmentLower.includes('safety')) return '🛡️';
    return '👶';
  }
  
  // Add more category-specific emojis as needed
  if (categoryLower.includes('pet')) return '🐾';
  if (categoryLower.includes('health') || categoryLower.includes('beauty')) return '💄';
  if (categoryLower.includes('home') || categoryLower.includes('garden')) return '🏠';
  
  return '👤'; // Default fallback
};

// Update personaResultPromise fallback (around line 633)
const personaResultPromise = Promise.race([
  this.generateAIPersona(trimmedSegment, category || 'General', demographics, overlaps, geoIntelligence, commerceBaseline),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('AI persona generation timeout')), GEMINI_CALL_TIMEOUT_MS)
  )
]).catch(error => {
  console.error('❌ Failed to generate AI persona:', error);
  return {
    name: trimmedSegment,
    emoji: getSegmentEmoji(trimmedSegment, category || 'General'), // Use segment-specific emoji
    description: `The ${trimmedSegment} audience`
  };
});
```

### Priority 3: Add Better Error Logging and User Feedback

**File**: `deal-library-amplify-app/src/app/api/audience-insights/strategic-content/route.ts`

**Changes**:
1. Add detailed logging for debugging
2. Return partial success if some content generated

```typescript
// Around line 70-86, add better logging
const strategicContent = await Promise.race([strategicContentPromise, timeoutPromise]);

console.log('✅ Strategic content generated successfully:', {
  hasExecutiveSummary: !!strategicContent.executiveSummary,
  hasStrategicInsights: !!strategicContent.strategicInsights,
  messagingRecsCount: strategicContent.strategicInsights?.messagingRecommendations?.length || 0,
  messagingRecsType: Array.isArray(strategicContent.strategicInsights?.messagingRecommendations?.[0]) 
    ? 'array' 
    : typeof strategicContent.strategicInsights?.messagingRecommendations?.[0],
  personaName: strategicContent.personaName,
  personaEmoji: strategicContent.personaEmoji,
  personaDescription: strategicContent.personaDescription?.substring(0, 100) + '...'
});

// Check if we got minimal fallback content
const isMinimalContent = 
  strategicContent.strategicInsights?.messagingRecommendations?.length === 2 &&
  strategicContent.strategicInsights.messagingRecommendations[0] === 'Digital channels' &&
  strategicContent.strategicInsights.messagingRecommendations[1] === 'Targeted advertising';

if (isMinimalContent) {
  console.warn('⚠️ WARNING: Strategic insights appear to be minimal fallback content');
  // Could optionally return an error or warning flag
}

return NextResponse.json({
  success: true,
  executiveSummary: strategicContent.executiveSummary,
  strategicInsights: strategicContent.strategicInsights,
  personaName: strategicContent.personaName,
  personaEmoji: strategicContent.personaEmoji,
  personaDescription: strategicContent.personaDescription
});
```

### Priority 4: Frontend Error Handling

**File**: `deal-library-amplify-app/src/app/audience-insights/page.tsx`

**Changes**:
1. Detect minimal content and show appropriate message
2. Add option to retry if content appears incomplete

```typescript
// In loadStrategicContent function (around line 929)
if (data.success) {
  // Check if content is minimal/fallback
  const messagingRecs = data.strategicInsights?.messagingRecommendations || [];
  const isMinimalContent = messagingRecs.length === 2 && 
    messagingRecs[0] === 'Digital channels' && 
    messagingRecs[1] === 'Targeted advertising';
  
  if (isMinimalContent) {
    console.warn('⚠️ Received minimal fallback content - AI generation may have failed');
    // Optionally show a warning to user or automatically retry
  }
  
  // ... rest of update logic
}
```

## Implementation Steps

1. **Step 1**: Increase timeout to 45s and add retry logic (Priority 1)
2. **Step 2**: Add segment-specific emoji mapping (Priority 2)
3. **Step 3**: Add better error logging (Priority 3)
4. **Step 4**: Test with multiple segments to verify fixes
5. **Step 5**: Monitor CloudWatch logs to identify any remaining timeout issues

## Testing Checklist

After implementing fixes:
- [ ] Generate Strategic Marketing Insights for "Diapering" segment
- [ ] Verify full AI-generated content appears (not just "Digital channels", "Targeted advertising")
- [ ] Verify persona emoji is segment-specific (👶 for Diapering, not 👤)
- [ ] Test with timeout scenario (if possible) to verify retry logic
- [ ] Check browser console for detailed error logs
- [ ] Verify persona content remains excellent ("Practical Pam" style)

## Expected Outcomes

After fixes:
1. **Strategic Marketing Insights**: Should show full AI-generated recommendations with value propositions, data backing, emotional benefits
2. **Persona Emoji**: Should show segment-specific emoji (👶 for baby-related segments)
3. **Error Handling**: Better logging and user feedback when generation fails
4. **Reliability**: Retry logic should reduce timeout-related failures

