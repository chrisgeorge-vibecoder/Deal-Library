import { google } from 'googleapis';
import { Deal, GoogleSheetsRow } from '../types/deal';

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private range: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
    this.range = process.env.GOOGLE_SHEETS_RANGE || 'Deals!A:Z';
    
    // Initialize Google Sheets API
    this.sheets = google.sheets({
      version: 'v4',
      auth: process.env.GOOGLE_SHEETS_API_KEY
    });
  }

  /**
   * Fetch all deals from Google Sheets
   */
  async getAllDeals(): Promise<Deal[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        return [];
      }

      // Skip header row and convert to Deal objects
      const deals = rows.slice(1).map((row: any[], index: number) => 
        this.rowToDeal(row, index + 2) // +2 because we skip header and arrays are 0-indexed
      ).filter((deal: Deal | null): deal is Deal => deal !== null);

      return deals;
    } catch (error) {
      console.error('Error fetching deals from Google Sheets:', error);
      throw new Error('Failed to fetch deals from Google Sheets');
    }
  }

  /**
   * Add a new deal to Google Sheets
   */
  async addDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    try {
      const newDeal: Deal = {
        ...deal,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const values = this.dealToRow(newDeal);
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [values]
        }
      });

      return newDeal;
    } catch (error) {
      console.error('Error adding deal to Google Sheets:', error);
      throw new Error('Failed to add deal to Google Sheets');
    }
  }

  /**
   * Update an existing deal in Google Sheets
   */
  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | null> {
    try {
      // First, find the row with the matching ID
      const allDeals = await this.getAllDeals();
      const dealIndex = allDeals.findIndex(deal => deal.id === id);
      
      if (dealIndex === -1) {
        return null;
      }

      const existingDeal = allDeals[dealIndex];
      if (!existingDeal) {
        return null;
      }

      const updatedDeal: Deal = {
        id: existingDeal.id,
        dealName: updates.dealName ?? existingDeal.dealName,
        dealId: updates.dealId ?? existingDeal.dealId,
        description: updates.description ?? existingDeal.description,
        targeting: updates.targeting ?? existingDeal.targeting,
        environment: updates.environment ?? existingDeal.environment,
        mediaType: updates.mediaType ?? existingDeal.mediaType,
        flightDate: updates.flightDate ?? existingDeal.flightDate,
        bidGuidance: updates.bidGuidance ?? existingDeal.bidGuidance,
        createdBy: existingDeal.createdBy,
        createdAt: existingDeal.createdAt,
        updatedAt: new Date().toISOString()
      };

      const values = this.dealToRow(updatedDeal);
      const rowNumber = dealIndex + 2; // +2 for header row and 0-indexing

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.range.split('!')[0]}!${rowNumber}:${rowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [values]
        }
      });

      return updatedDeal;
    } catch (error) {
      console.error('Error updating deal in Google Sheets:', error);
      throw new Error('Failed to update deal in Google Sheets');
    }
  }

  /**
   * Convert a Google Sheets row to a Deal object
   */
  private rowToDeal(row: any[], rowNumber: number): Deal | null {
    try {
      // Expected column order: ID, Title, Description, Category, Status, Value, Currency, Partner, StartDate, EndDate, Tags, Priority, CreatedBy, CreatedAt, UpdatedAt
      if (row.length < 10) {
        console.warn(`Row ${rowNumber} has insufficient columns:`, row);
        return null;
      }

      return {
        id: row[0] || this.generateId(),
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
    } catch (error) {
      console.error(`Error parsing row ${rowNumber}:`, error);
      return null;
    }
  }

  /**
   * Convert a Deal object to a Google Sheets row
   */
  private dealToRow(deal: Deal): any[] {
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
   * Generate a unique ID for new deals
   */
  private generateId(): string {
    return `deal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
