# Environment Variables

This document describes the required environment variables for the Deal Library Backend.

## Required Environment Variables

### GEMINI_API_KEY
- **Description**: Google Gemini API key for AI-powered deal analysis
- **Example**: `AIzaSyBnVANBVRud4-2bgS9AB1BhRaWZ8jJJVtY`
- **How to get**: Visit [Google AI Studio](https://aistudio.google.com/) and create an API key

### GOOGLE_APPS_SCRIPT_URL
- **Description**: Google Apps Script URL that provides deal data
- **Example**: `https://script.google.com/macros/s/AKfycbzCMqE5D6lvyUn3U5vbm6XG8EZYDageIUIqN5NCUHx6mv51ob-sUwhvy-TYa_4J8Cv6/exec`
- **How to get**: Deploy your Google Apps Script and copy the web app URL

## Optional Environment Variables

### PORT
- **Description**: Port number for the backend server
- **Default**: `3001`
- **Example**: `3002`

## Setting Environment Variables

### Development
```bash
export GEMINI_API_KEY=your_api_key_here
export GOOGLE_APPS_SCRIPT_URL=your_apps_script_url_here
export PORT=3002
npm run dev
```

### Production
Create a `.env` file in the backend directory:
```
GEMINI_API_KEY=your_api_key_here
GOOGLE_APPS_SCRIPT_URL=your_apps_script_url_here
PORT=3002
```

## Validation

The backend will validate all required environment variables on startup and exit with an error if any are missing.

## Troubleshooting

If you see "Missing required environment variables" error:
1. Check that all required variables are set
2. Verify the variable names are correct (case-sensitive)
3. Ensure there are no extra spaces or quotes around the values
4. Restart the backend after setting the variables



