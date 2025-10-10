# Google Apps Script Setup Guide

## 🚀 **Why Google Apps Script is Better**

### **✅ Advantages over Google Sheets API:**
- **No API keys needed** - Direct access to your sheet
- **No authentication setup** - Works immediately  
- **No rate limits** - More reliable
- **Simpler deployment** - Just deploy the script
- **Better error handling** - Built-in Google services
- **Free** - No API usage costs

### **❌ Google Sheets API Disadvantages:**
- Complex OAuth setup
- API key management
- Rate limiting issues
- Authentication tokens expire
- Requires Google Cloud Console setup

---

## 📋 **Step-by-Step Setup**

### **1. Create Your Google Sheet**

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new sheet named "Sovrn Deal Library"
3. Add these column headers in row 1:
   ```
   A: ID | B: Deal Name | C: Deal ID | D: Description | E: Targeting | F: Environment | G: Media Type | H: Flight Date | I: Bid Guidance | J: Created By | K: Created At | L: Updated At
   ```
4. Add some sample data in rows 2-5

### **2. Set Up Google Apps Script**

1. **Open your Google Sheet**
2. **Go to Extensions > Apps Script**
3. **Replace the default code** with the code from `google-apps-script/Code.gs`
4. **Save the project** (Ctrl+S or Cmd+S)
5. **Name your project**: "Sovrn Deal Library API"

### **3. Deploy as Web App**

1. **Click "Deploy" > "New deployment"**
2. **Choose type**: "Web app"
3. **Execute as**: "Me"
4. **Who has access**: "Anyone"
5. **Click "Deploy"**
6. **Copy the web app URL** - this is your `GOOGLE_APPS_SCRIPT_URL`

### **4. Configure Your Backend**

1. **Edit your `.env` file**:
   ```bash
   GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

2. **Test the connection**:
   ```bash
   cd "/Users/cgeorge/Deal Library/deal-library-backend"
   node test-apps-script.js
   ```

### **5. Start Your Backend**

```bash
npm run dev
```

---

## 🧪 **Testing Your Setup**

### **Test Script**
I've created a test script for you:

```bash
cd "/Users/cgeorge/Deal Library/deal-library-backend"
node test-apps-script.js
```

### **Manual Testing**

1. **Health Check**: `GET http://localhost:3001/health`
2. **Get Deals**: `GET http://localhost:3001/api/deals`
3. **Get Deal by ID**: `GET http://localhost:3001/api/deals/deal-123`
4. **Create Deal**: `POST http://localhost:3001/api/deals`
5. **Update Deal**: `PUT http://localhost:3001/api/deals/deal-123`
6. **Custom Deal Request**: `POST http://localhost:3001/api/custom-deal-request`

---

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Script not found"**
   - Make sure you deployed the script as a web app
   - Check that the URL is correct
   - Ensure the script is saved and deployed

2. **"Permission denied"**
   - Make sure the web app is set to "Anyone" access
   - Check that "Execute as: Me" is selected

3. **"Sheet not found"**
   - Make sure your sheet tab is named "Deals"
   - Check that the sheet exists in the same spreadsheet as the script

4. **"No data returned"**
   - Add some sample data to your sheet
   - Check that the headers are in row 1
   - Verify the column order matches the expected format

### **Debug Steps:**

1. **Check the Apps Script logs**:
   - Go to Apps Script editor
   - Click "Executions" to see logs
   - Look for any error messages

2. **Test the script directly**:
   - In Apps Script editor, run the `doGet` function
   - Check the execution logs for errors

3. **Verify your sheet structure**:
   - Make sure headers are in row 1
   - Check that data starts from row 2
   - Verify column names match exactly

---

## 📊 **API Endpoints**

Your Apps Script will provide these endpoints:

### **GET Requests:**
- `?action=health` - Health check
- `?action=deals` - Get all deals
- `?action=deal&id=DEAL_ID` - Get specific deal

### **POST Requests:**
- `?action=create` - Create new deal
- `?action=update` - Update existing deal
- `?action=custom-deal-request` - Submit custom deal request

---

## 🚀 **Next Steps**

Once your Apps Script is working:

1. ✅ **Test the API endpoints**
2. ✅ **Connect frontend to backend**
3. ✅ **Add real-time data sync**
4. ✅ **Implement error handling**
5. ✅ **Deploy to production**

---

## 💡 **Pro Tips**

1. **Use the Apps Script editor** to debug issues
2. **Check execution logs** for detailed error messages
3. **Test with sample data** before connecting your frontend
4. **Keep your sheet structure consistent** with the expected format
5. **Use the test script** to verify everything works

---

## 🔒 **Security Notes**

- Apps Script runs with your Google account permissions
- No API keys or tokens to manage
- Automatic authentication through Google
- Free to use with no usage limits
- Perfect for internal tools and MVPs
