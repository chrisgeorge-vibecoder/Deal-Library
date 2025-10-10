# Google Sheets API Setup Guide

## 🚀 **Step-by-Step Google Sheets Integration**

### **1. Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project: `Sovrn Deal Library`
4. Click "Create"

### **2. Enable Google Sheets API**

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### **3. Create API Credentials**

#### **Option A: API Key (Simplest for read-only access)**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. (Optional) Restrict the key to Google Sheets API

#### **Option B: Service Account (Recommended for full access)**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Name: `deal-library-service`
4. Click "Create and Continue"
5. Skip roles for now, click "Done"
6. Click on the created service account
7. Go to "Keys" tab → "Add Key" → "Create new key"
8. Choose "JSON" format
9. Download the JSON file

### **4. Set Up Your Google Sheet**

1. Create a new Google Sheet
2. Name it: "Sovrn Deal Library"
3. Create the following columns in row 1:
   ```
   A: ID
   B: Title  
   C: Description
   D: Category
   E: Status
   F: Value
   G: Currency
   H: Partner
   I: Start Date
   J: End Date
   K: Tags
   L: Priority
   M: Created By
   N: Created At
   O: Updated At
   ```

4. Add some sample data in rows 2-5

### **5. Share the Sheet (if using Service Account)**

1. Open your Google Sheet
2. Click "Share" button
3. Add the service account email (from the JSON file) as an editor
4. Give it "Editor" permissions

### **6. Configure Environment Variables**

Create a `.env` file in the backend directory:

```bash
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_RANGE=Deals!A:O
GOOGLE_SHEETS_API_KEY=your_api_key_here

# Alternative: Service Account (if using JSON file)
# GOOGLE_SHEETS_SERVICE_ACCOUNT_PATH=./path/to/service-account.json
```

### **7. Get Your Spreadsheet ID**

From your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Copy the `SPREADSHEET_ID` part.

### **8. Test the Integration**

Run the backend and test the endpoints:
- `GET http://localhost:3001/api/deals` - Should return your sheet data
- `POST http://localhost:3001/api/deals` - Should add a new row

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"The caller does not have permission"**
   - Make sure the API is enabled
   - Check that your API key has the right permissions
   - If using service account, ensure the sheet is shared with the service account email

2. **"Requested entity was not found"**
   - Check that the spreadsheet ID is correct
   - Verify the sheet name and range

3. **"Invalid credentials"**
   - Double-check your API key
   - If using service account, ensure the JSON file is in the right location

### **Testing Commands:**

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test deals endpoint
curl http://localhost:3001/api/deals

# Test with specific deal
curl http://localhost:3001/api/deals/deal-123
```

## 📋 **Next Steps After Setup:**

1. ✅ Test the API endpoints
2. ✅ Connect frontend to backend
3. ✅ Implement real-time data sync
4. ✅ Add error handling and validation
5. ✅ Set up production deployment

## 🚨 **Security Notes:**

- Never commit your `.env` file to version control
- Use environment variables in production
- Consider using Google Cloud Secret Manager for production
- Restrict API keys to specific IPs if possible



