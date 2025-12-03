/**
 * Market Insights Controller
 * API endpoints for U.S. Market Insights feature
 */

import { Request, Response, Router } from 'express';
import { MarketInsightsService } from '../services/marketInsightsService';
import { GeographicLevel } from '../types/censusData';

export class MarketInsightsController {
  private router: Router;
  private marketInsightsService: MarketInsightsService;

  constructor() {
    this.router = Router();
    this.marketInsightsService = new MarketInsightsService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/metrics', this.getAvailableMetrics.bind(this));
    this.router.post('/top-markets', this.getTopMarkets.bind(this));
    this.router.post('/profile', this.getMarketProfile.bind(this));
    this.router.post('/top-zip-codes', this.getTopZipCodes.bind(this));
  }

  /**
   * GET /api/market-insights/metrics
   * Get list of available metrics for analysis
   */
  private async getAvailableMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = this.marketInsightsService.getAvailableMetrics();
      res.json({
        success: true,
        metrics,
        count: metrics.length
      });
    } catch (error) {
      console.error('Error fetching available metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch available metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/market-insights/top-markets
   * Get top markets ranked by a specific metric
   * Body: { metricId: string, geoLevel: GeographicLevel, limit?: number }
   */
  private async getTopMarkets(req: Request, res: Response): Promise<void> {
    try {
      const { metricId, geoLevel, limit = 50, includeCommercialZips = false } = req.body;

      // Validation
      if (!metricId) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: metricId'
        });
        return;
      }

      if (!geoLevel) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: geoLevel'
        });
        return;
      }

      const validGeoLevels: GeographicLevel[] = ['region', 'state', 'cbsa', 'county', 'city', 'zip'];
      if (!validGeoLevels.includes(geoLevel as GeographicLevel)) {
        res.status(400).json({
          success: false,
          error: `Invalid geoLevel. Must be one of: ${validGeoLevels.join(', ')}`
        });
        return;
      }

      console.log(`🔍 Fetching top ${limit} markets by ${metricId} at ${geoLevel} level ${includeCommercialZips ? '(including commercial ZIPs)' : '(residential only)'}`);

      const topMarkets = await this.marketInsightsService.getTopMarketsByMetric(
        metricId,
        geoLevel as GeographicLevel,
        limit,
        includeCommercialZips
      );

      res.json({
        success: true,
        metricId,
        geoLevel,
        markets: topMarkets,
        count: topMarkets.length
      });
    } catch (error) {
      console.error('Error fetching top markets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch top markets',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/market-insights/top-zip-codes
   * Get top 5000 zip codes ranked by a specific metric for campaign targeting
   * Body: { metricId: string, limit?: number, includeCommercialZips?: boolean }
   */
  private async getTopZipCodes(req: Request, res: Response): Promise<void> {
    try {
      const { metricId, limit = 5000, includeCommercialZips = false } = req.body;

      // Validation
      if (!metricId) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: metricId'
        });
        return;
      }

      console.log(`🔍 Fetching top ${limit} zip codes by ${metricId} ${includeCommercialZips ? '(including commercial ZIPs)' : '(residential only)'}`);

      const topZipCodes = await this.marketInsightsService.getTopZipCodesByMetric(
        metricId,
        limit,
        includeCommercialZips
      );

      res.json({
        success: true,
        metricId,
        zipCodes: topZipCodes,
        count: topZipCodes.length
      });
    } catch (error) {
      console.error('Error fetching top zip codes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch top zip codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/market-insights/profile
   * Get comprehensive market profile
   * Body: { geoLevel: GeographicLevel, marketName: string }
   */
  private async getMarketProfile(req: Request, res: Response): Promise<void> {
    try {
      const { geoLevel, marketName, includeCommercialZips = false } = req.body;

      // Validation
      if (!geoLevel) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: geoLevel'
        });
        return;
      }

      if (!marketName) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: marketName'
        });
        return;
      }

      const validGeoLevels: GeographicLevel[] = ['region', 'state', 'cbsa', 'county', 'city', 'zip'];
      if (!validGeoLevels.includes(geoLevel as GeographicLevel)) {
        res.status(400).json({
          success: false,
          error: `Invalid geoLevel. Must be one of: ${validGeoLevels.join(', ')}`
        });
        return;
      }

      console.log(`📊 Fetching market profile for ${marketName} (${geoLevel}) ${includeCommercialZips ? '(including commercial ZIPs)' : '(residential only)'}`);

      const profile = await this.marketInsightsService.getMarketProfile(
        geoLevel as GeographicLevel,
        marketName,
        includeCommercialZips
      );

      res.json({
        success: true,
        profile
      });
    } catch (error) {
      console.error('Error fetching market profile:', error);
      
      // Handle "not found" errors separately
      if (error instanceof Error && error.message.includes('Market not found')) {
        res.status(404).json({
          success: false,
          error: 'Market not found',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch market profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

