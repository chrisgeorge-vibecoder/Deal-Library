#!/bin/bash

# Trade Publication Insights Generator Runner
# This script compiles and runs the trade publication insights generator

echo "🚀 Commerce Audience Insights Generator for Trade Publication"
echo "=============================================================="
echo ""

cd deal-library-backend

# Load environment variables from .env file
if [ -f .env ]; then
  echo "📋 Loading environment variables from .env file..."
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "⚠️  No .env file found in backend directory"
  echo "Make sure these environment variables are set:"
  echo "  - GEMINI_API_KEY"
  echo "  - SUPABASE_URL"
  echo "  - SUPABASE_SERVICE_ROLE_KEY"
  echo "  - USE_SUPABASE=true"
  echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "⚠️  Dependencies not installed. Running npm install..."
  npm install
fi

# Run the TypeScript script directly with ts-node (via npx)
echo "▶️  Running insights generator..."
echo ""
echo "⏱️  This may take 10-15 minutes as it analyzes multiple segments..."
echo ""
npx ts-node scripts/generate-trade-publication-insights.ts

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Script execution failed"
  exit 1
fi

echo ""
echo "✅ Done! Check the generated files in the root directory:"
echo "   - trade-publication-insights.txt (formatted for article)"
echo "   - trade-publication-insights.json (structured data)"


