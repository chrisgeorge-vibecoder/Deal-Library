#!/bin/bash

echo "🚀 Setting up Google Sheets Integration for Sovrn Deal Library"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit the .env file and add your credentials:"
    echo "   - GOOGLE_APPS_SCRIPT_URL (Recommended - easier setup)"
    echo "   - OR Google Sheets API credentials (more complex)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if required packages are installed
echo "📦 Checking dependencies..."
if ! npm list googleapis > /dev/null 2>&1; then
    echo "Installing googleapis package..."
    npm install googleapis
fi

echo ""
echo "🔧 Next steps:"
echo ""
echo "📋 OPTION 1: Google Apps Script (Recommended - Easier)"
echo "1. Follow the guide in GOOGLE_APPS_SCRIPT_SETUP.md"
echo "2. Deploy your Apps Script as a web app"
echo "3. Add the URL to your .env file"
echo "4. Run: node test-apps-script.js"
echo "5. Start the server: npm run dev"
echo ""
echo "📋 OPTION 2: Google Sheets API (More Complex)"
echo "1. Follow the guide in GOOGLE_SHEETS_SETUP.md"
echo "2. Set up Google Cloud Console and API keys"
echo "3. Add credentials to your .env file"
echo "4. Run: node test-google-sheets.js"
echo "5. Start the server: npm run dev"
echo ""
echo "💡 We recommend Google Apps Script for easier setup!"
