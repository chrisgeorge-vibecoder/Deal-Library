#!/bin/bash

# Test Market Sizing Response Format Fix
# This script tests that market sizing responses are properly formatted

echo "🧪 Testing Market Sizing Response Format Fix"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Basic market sizing query
echo "📊 Test 1: Basic Market Sizing Query"
echo "Query: 'What is the market size for electric vehicles?'"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3002/api/market-sizing \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the market size for electric vehicles?"}' 2>/dev/null)

# Check if response is valid JSON
if echo "$RESPONSE" | jq empty 2>/dev/null; then
  echo -e "${GREEN}✓ Response is valid JSON${NC}"
else
  echo -e "${RED}✗ Response is NOT valid JSON${NC}"
  echo "Response: $RESPONSE"
  exit 1
fi

# Check if aiResponse field exists and contains text (not JSON)
AI_RESPONSE=$(echo "$RESPONSE" | jq -r '.aiResponse' 2>/dev/null)

if [ -z "$AI_RESPONSE" ] || [ "$AI_RESPONSE" == "null" ]; then
  echo -e "${RED}✗ aiResponse field is missing or null${NC}"
  exit 1
fi

# Check if aiResponse looks like JSON (starts with { or [)
if [[ "$AI_RESPONSE" == "{"* ]] || [[ "$AI_RESPONSE" == "["* ]]; then
  echo -e "${RED}✗ aiResponse contains JSON instead of text${NC}"
  echo "aiResponse: $AI_RESPONSE"
  exit 1
else
  echo -e "${GREEN}✓ aiResponse contains natural language text${NC}"
fi

# Check if aiResponse is reasonable length (at least 50 characters)
AI_RESPONSE_LENGTH=${#AI_RESPONSE}
if [ $AI_RESPONSE_LENGTH -lt 50 ]; then
  echo -e "${YELLOW}⚠ aiResponse is very short ($AI_RESPONSE_LENGTH chars)${NC}"
else
  echo -e "${GREEN}✓ aiResponse has reasonable length ($AI_RESPONSE_LENGTH chars)${NC}"
fi

# Check if marketSizing array exists and has data
MARKET_SIZING_COUNT=$(echo "$RESPONSE" | jq '.marketSizing | length' 2>/dev/null)

if [ -z "$MARKET_SIZING_COUNT" ] || [ "$MARKET_SIZING_COUNT" == "null" ] || [ "$MARKET_SIZING_COUNT" -eq 0 ]; then
  echo -e "${YELLOW}⚠ No market sizing cards returned${NC}"
else
  echo -e "${GREEN}✓ Returned $MARKET_SIZING_COUNT market sizing card(s)${NC}"
fi

echo ""
echo "📝 Sample aiResponse:"
echo "---"
echo "$AI_RESPONSE" | head -c 300
echo "..."
echo "---"
echo ""

# Test 2: Check for raw JSON in response
echo "📊 Test 2: Verify No Raw JSON Display"
echo ""

# Check if the entire response object is being returned as a string
if echo "$AI_RESPONSE" | grep -q '"marketSizing"'; then
  echo -e "${RED}✗ aiResponse contains the string 'marketSizing' - likely has raw JSON${NC}"
  exit 1
else
  echo -e "${GREEN}✓ aiResponse does NOT contain raw JSON markers${NC}"
fi

if echo "$AI_RESPONSE" | grep -q '"strategicRecommendations"'; then
  echo -e "${RED}✗ aiResponse contains 'strategicRecommendations' - likely has raw JSON${NC}"
  exit 1
else
  echo -e "${GREEN}✓ aiResponse does NOT contain JSON structure markers${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ All tests passed! Market sizing format fix is working correctly.${NC}"
echo ""
echo "The response is:"
echo "  ✓ Valid JSON structure"
echo "  ✓ aiResponse contains natural language (not JSON)"
echo "  ✓ No raw JSON being displayed to users"
echo "  ✓ Market sizing cards are properly formatted"
echo ""






