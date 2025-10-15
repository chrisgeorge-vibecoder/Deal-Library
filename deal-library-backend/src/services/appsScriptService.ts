import { Deal } from '../types/deal';
import { PersonaService } from './personaService';

export class AppsScriptService {
  private baseUrl: string | null;
  private personaService: PersonaService;

  constructor() {
    const url = process.env.GOOGLE_APPS_SCRIPT_URL;
    const sharedSecret = process.env.APPS_SCRIPT_SHARED_SECRET;
    
    if (!url) {
      console.warn('⚠️  GOOGLE_APPS_SCRIPT_URL not configured - Apps Script integration will be unavailable');
      this.baseUrl = null;
    } else {
      // Append a shared secret as query param if configured
      if (sharedSecret) {
        const hasQuery = url.includes('?');
        this.baseUrl = `${url}${hasQuery ? '&' : '?'}api_key=${encodeURIComponent(sharedSecret)}`;
      } else {
        this.baseUrl = url;
      }
      console.log('✅ AppsScriptService initialized');
    }

    // Helper to join query params safely
    const makeUrlWith = (base: string, suffix: string) => `${base}${base.includes('?') ? '&' : '?'}${suffix}`;
    // Bind helpers for reuse
    (this as any)._makeUrlWith = makeUrlWith;
    
    this.personaService = new PersonaService();
  }

  /**
   * Fetch all deals from Google Apps Script
   */
  async getAllDeals(): Promise<Deal[]> {
    console.log('🔍 AppsScriptService.getAllDeals called, baseUrl:', this.baseUrl);

    if (!this.baseUrl) {
      console.warn('⚠️  Apps Script URL not configured - returning empty deals array');
      return [];
    }

    try {
      const response = await fetch(this.baseUrl, { redirect: 'follow' });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as { success: boolean; deals: any[]; total: number; error?: string };
      
      if (!data.success) {
        throw new Error(`Apps Script error: ${data.error || 'Unknown error'}`);
      }
      
      // Convert the raw deal data to our Deal format
      const deals: Deal[] = data.deals.map((deal: any, index: number) => {
        const dealName = deal['Deal Name'] || deal.dealName || '';
        const personaInsights = this.personaService.matchDealToPersona(dealName) || undefined;
        
        return {
          id: deal['Deal ID'] || deal.ID || `deal-${index}`,
          dealName,
          dealId: deal['Deal ID'] || deal.ID || `deal-${index}`,
          description: deal.Description || deal.description || '',
          targeting: deal.Targeting || deal.targeting || '',
          environment: deal.Environment || deal.environment || '',
          mediaType: deal['Media Type'] || deal.mediaType || '',
          flightDate: deal['Flight Date'] || deal.flightDate || '',
          bidGuidance: deal['Bid Guidance'] || deal.bidGuidance || '',
          createdBy: deal['Created By'] || deal.createdBy || 'System',
          createdAt: deal['Created At'] || deal.createdAt || new Date().toISOString(),
          updatedAt: deal['Updated At'] || deal.updatedAt || new Date().toISOString(),
          personaInsights
        };
      });
      
      console.log(`✅ Successfully fetched ${deals.length} deals from Apps Script`);
      return deals;
    } catch (error) {
      console.error('Error fetching deals from Apps Script:', error);
      throw new Error(`Apps Script error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  /**
   * Get a specific deal by ID
   */
  async getDealById(id: string): Promise<Deal | null> {
    if (!this.baseUrl) {
      throw new Error('GOOGLE_APPS_SCRIPT_URL environment variable is required');
    }

    try {
      const makeUrlWith: (base: string, suffix: string) => string = (this as any)._makeUrlWith;
      const response = await fetch(makeUrlWith(this.baseUrl, `action=deal&id=${encodeURIComponent(id)}`));
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as Deal | null;
      return data;
    } catch (error) {
      console.error('Error fetching deal from Apps Script:', error);
      throw error; // Don't fallback to mock data - throw the error instead
    }
  }

  /**
   * Add a new deal via Google Apps Script
   */
  async addDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    if (!this.baseUrl) {
      throw new Error('GOOGLE_APPS_SCRIPT_URL environment variable is required');
    }

    try {
      const makeUrlWith: (base: string, suffix: string) => string = (this as any)._makeUrlWith;
      const response = await fetch(makeUrlWith(this.baseUrl, 'action=create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deal)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as Deal;
      return data;
    } catch (error) {
      console.error('Error adding deal via Apps Script:', error);
      throw error; // Don't fallback to mock data - throw the error instead
    }
  }

  /**
   * Update an existing deal via Google Apps Script
   */
  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | null> {
    if (!this.baseUrl) {
      throw new Error('GOOGLE_APPS_SCRIPT_URL environment variable is required');
    }

    try {
      const makeUrlWith: (base: string, suffix: string) => string = (this as any)._makeUrlWith;
      const response = await fetch(makeUrlWith(this.baseUrl, 'action=update'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updates
        })
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as Deal | null;
      return data;
    } catch (error) {
      console.error('Error updating deal via Apps Script:', error);
      throw error; // Don't fallback to mock data - throw the error instead
    }
  }

  /**
   * Submit a custom deal request
   */
  async submitCustomDealRequest(requestData: {
    companyName: string;
    contactEmail: string;
    campaignObjectives: string;
    targetAudience: string;
    budgetRange?: string;
    timeline?: string;
    additionalNotes?: string;
  }): Promise<{ message: string; requestId: string }> {
    if (!this.baseUrl) {
      throw new Error('GOOGLE_APPS_SCRIPT_URL environment variable is required');
    }

    try {
      const makeUrlWith: (base: string, suffix: string) => string = (this as any)._makeUrlWith;
      const response = await fetch(makeUrlWith(this.baseUrl, 'action=custom-deal-request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as { message: string; requestId: string };
      return data;
    } catch (error) {
      console.error('Error submitting custom deal request:', error);
      throw error; // Don't fallback to mock data - throw the error instead
    }
  }

  /**
   * Health check for Apps Script service
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; environment: string; service: string }> {
    if (!this.baseUrl) {
      throw new Error('GOOGLE_APPS_SCRIPT_URL environment variable is required');
    }

    try {
      const makeUrlWith: (base: string, suffix: string) => string = (this as any)._makeUrlWith;
      const response = await fetch(makeUrlWith(this.baseUrl, 'action=health'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as { status: string; timestamp: string; environment: string; service: string };
      return data;
    } catch (error) {
      console.error('Error checking Apps Script health:', error);
      throw error; // Don't fallback to mock data - throw the error instead
    }
  }

}
