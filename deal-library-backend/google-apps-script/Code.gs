/**
 * Google Apps Script for Sovrn Deal Library
 * This script provides a web API for your Google Sheet
 * 
 * Setup Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace the default code with this
 * 4. Save and deploy as web app
 * 5. Set permissions to "Anyone" and "Execute as: Me"
 * 6. Copy the web app URL
 */

// Configuration - Update these values
const SHEET_NAME = 'Always On Deals'; // Name of your sheet tab
const HEADER_ROW = 1; // Row number with headers

/**
 * GET / - Health check
 */
function doGet(e) {
  const action = e.parameter.action || 'health';
  
  try {
    switch (action) {
      case 'health':
        return createResponse({ 
          status: 'OK', 
          timestamp: new Date().toISOString(),
          environment: 'production',
          service: 'Google Apps Script'
        });
      
      case 'deals':
        return getDeals(e);
      
      case 'deal':
        return getDealById(e);
      
      default:
        return createErrorResponse('Invalid action', 400);
    }
  } catch (error) {
    return createErrorResponse(error.message, 500);
  }
}

/**
 * POST / - Handle POST requests (create, update)
 */
function doPost(e) {
  const action = e.parameter.action || 'create';
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    switch (action) {
      case 'create':
        return createDeal(data);
      
      case 'update':
        return updateDeal(data);
      
      case 'custom-deal-request':
        return handleCustomDealRequest(data);
      
      default:
        return createErrorResponse('Invalid action', 400);
    }
  } catch (error) {
    return createErrorResponse(error.message, 500);
  }
}

/**
 * Get all deals from the sheet
 */
function getDeals(e) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= HEADER_ROW) {
    return createResponse([]);
  }
  
  const deals = data.slice(HEADER_ROW).map((row, index) => 
    rowToDeal(row, index + HEADER_ROW + 1)
  ).filter(deal => deal !== null);
  
  return createResponse(deals);
}

/**
 * Get a specific deal by ID
 */
function getDealById(e) {
  const dealId = e.parameter.id;
  if (!dealId) {
    return createErrorResponse('Deal ID is required', 400);
  }
  
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = HEADER_ROW; i < data.length; i++) {
    const row = data[i];
    if (row[0] === dealId) { // ID is in column A
      const deal = rowToDeal(row, i + 1);
      return createResponse(deal);
    }
  }
  
  return createErrorResponse('Deal not found', 404);
}

/**
 * Create a new deal
 */
function createDeal(data) {
  const sheet = getSheet();
  
  const newDeal = {
    id: generateId(),
    dealName: data.dealName || '',
    dealId: data.dealId || '',
    description: data.description || '',
    targeting: data.targeting || '',
    environment: data.environment || '',
    mediaType: data.mediaType || '',
    flightDate: data.flightDate || new Date().toISOString().split('T')[0],
    bidGuidance: data.bidGuidance || '',
    createdBy: data.createdBy || 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const row = dealToRow(newDeal);
  sheet.appendRow(row);
  
  return createResponse(newDeal, 201);
}

/**
 * Update an existing deal
 */
function updateDeal(data) {
  const dealId = data.id;
  if (!dealId) {
    return createErrorResponse('Deal ID is required', 400);
  }
  
  const sheet = getSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = HEADER_ROW; i < values.length; i++) {
    if (values[i][0] === dealId) {
      // Update the row
      const updatedDeal = {
        ...rowToDeal(values[i], i + 1),
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      const newRow = dealToRow(updatedDeal);
      const range = sheet.getRange(i + 1, 1, 1, newRow.length);
      range.setValues([newRow]);
      
      return createResponse(updatedDeal);
    }
  }
  
  return createErrorResponse('Deal not found', 404);
}

/**
 * Handle custom deal requests
 */
function handleCustomDealRequest(data) {
  // Log the request (you could also email it or add to a separate sheet)
  console.log('Custom Deal Request:', data);
  
  // You could add this to a separate "Requests" sheet
  const requestsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Requests') || 
                       SpreadsheetApp.getActiveSpreadsheet().insertSheet('Requests');
  
  const requestData = [
    new Date().toISOString(),
    data.companyName || '',
    data.contactEmail || '',
    data.campaignObjectives || '',
    data.targetAudience || '',
    data.budgetRange || '',
    data.timeline || '',
    data.additionalNotes || ''
  ];
  
  requestsSheet.appendRow(requestData);
  
  return createResponse({ 
    message: 'Custom deal request submitted successfully',
    requestId: generateId()
  });
}

/**
 * Convert a sheet row to a Deal object
 */
function rowToDeal(row, rowNumber) {
  if (row.length < 8) {
    console.warn(`Row ${rowNumber} has insufficient columns:`, row);
    return null;
  }
  
  return {
    id: row[0] || generateId(),
    dealName: row[1] || '',
    dealId: row[2] || '',
    description: row[3] || '',
    targeting: row[4] || '',
    environment: row[5] || '',
    mediaType: row[6] || '',
    flightDate: row[7] || new Date().toISOString().split('T')[0],
    bidGuidance: row[8] || '',
    createdBy: row[9] || 'System',
    createdAt: row[10] || new Date().toISOString(),
    updatedAt: row[11] || new Date().toISOString()
  };
}

/**
 * Convert a Deal object to a sheet row
 */
function dealToRow(deal) {
  return [
    deal.id,
    deal.dealName,
    deal.dealId,
    deal.description,
    deal.targeting,
    deal.environment,
    deal.mediaType,
    deal.flightDate,
    deal.bidGuidance,
    deal.createdBy,
    deal.createdAt,
    deal.updatedAt
  ];
}

/**
 * Get the main sheet
 */
function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Create the sheet if it doesn't exist
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    
    // Add headers
    const headers = [
      'ID', 'Deal Name', 'Deal ID', 'Description', 'Targeting', 'Environment', 
      'Media Type', 'Flight Date', 'Bid Guidance', 'Created By', 'Created At', 'Updated At'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  return sheet;
}

/**
 * Generate a unique ID
 */
function generateId() {
  return `deal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a JSON response
 */
function createResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create an error response
 */
function createErrorResponse(message, statusCode = 500) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      error: message, 
      statusCode: statusCode 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
