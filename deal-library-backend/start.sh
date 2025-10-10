#!/bin/bash

# Deal Library Backend Startup Script
# This script ensures all required environment variables are set before starting the server

echo "🚀 Starting Deal Library Backend..."

# Check if required environment variables are set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Error: GEMINI_API_KEY environment variable is not set"
    echo "Please set your Gemini API key:"
    echo "export GEMINI_API_KEY=your_api_key_here"
    exit 1
fi

if [ -z "$GOOGLE_APPS_SCRIPT_URL" ]; then
    echo "❌ Error: GOOGLE_APPS_SCRIPT_URL environment variable is not set"
    echo "Please set your Google Apps Script URL:"
    echo "export GOOGLE_APPS_SCRIPT_URL=your_apps_script_url_here"
    exit 1
fi

echo "✅ Environment variables validated"
echo "✅ Starting backend server..."

# Start the backend
npm run dev



