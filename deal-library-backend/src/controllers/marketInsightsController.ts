/**
 * Market Insights Controller
 * API endpoints for U.S. Market Insights feature
 */

import { Request, Response, Router } from 'express';
import { MarketInsightsService } from '../services/marketInsightsService';
import { commerceAudienceService } from '../services/commerceAudienceService';
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
    this.router.post('/search-markets', this.searchMarkets.bind(this));
    this.router.post('/profile', this.getMarketProfile.bind(this));
    this.router.post('/top-zip-codes', this.getTopZipCodes.bind(this));
    this.router.post('/market-commerce', this.getMarketCommerce.bind(this));
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
   * POST /api/market-insights/search-markets
   * Search all markets by name (not limited to top 50)
   * Body: { query: string, geoLevel: GeographicLevel, limit?: number, includeCommercialZips?: boolean }
   */
  private async searchMarkets(req: Request, res: Response): Promise<void> {
    try {
      const { query, geoLevel, limit = 20, includeCommercialZips = false } = req.body;

      // Validation
      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: query'
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

      console.log(`🔍 Searching markets: "${query}" at ${geoLevel} level`);

      const searchResults = await this.marketInsightsService.searchMarkets(
        query.trim(),
        geoLevel as GeographicLevel,
        limit,
        includeCommercialZips
      );

      res.json({
        success: true,
        query,
        geoLevel,
        markets: searchResults,
        count: searchResults.length
      });
    } catch (error) {
      console.error('Error searching markets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search markets',
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

  /**
   * POST /api/market-insights/market-commerce
   * Get commerce/shopping segments specific to a market
   */
  private async getMarketCommerce(req: Request, res: Response): Promise<void> {
    try {
      const { geoLevel, marketName, includeCommercialZips = false, categoryFilter } = req.body;

      // Validation
      if (!geoLevel || !marketName) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: geoLevel and marketName'
        });
        return;
      }

      const categoryLabel = categoryFilter && categoryFilter !== 'All Categories' 
        ? ` [${categoryFilter}]` 
        : '';
      console.log(`🛒 Getting commerce data for ${marketName} (${geoLevel})${categoryLabel}`);
      console.log(`   📝 categoryFilter received: "${categoryFilter}" (type: ${typeof categoryFilter})`);

      // Get the ZIP codes for this market
      const zipCodes = await this.marketInsightsService.getMarketZipCodes(
        geoLevel as GeographicLevel,
        marketName,
        includeCommercialZips
      );

      if (zipCodes.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Market not found or has no ZIP codes'
        });
        return;
      }

      console.log(`   📍 Found ${zipCodes.length} ZIP codes for ${marketName}`);

      // Get commerce segments with over-index for these ZIP codes, optionally filtered by category
      const segments = await commerceAudienceService.getSegmentsWithOverIndex(
        zipCodes,
        10, // outlierPercentile
        categoryFilter
      );

      // Debug: Log the categories of returned segments
      if (categoryFilter && categoryFilter !== 'All Categories') {
        const categoryCounts = segments.reduce((acc, seg) => {
          acc[seg.level1Category] = (acc[seg.level1Category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(`   📊 Segments by category after filter:`, categoryCounts);
      }

      // Sort by total weight (popularity in this market)
      const sortedByPopularity = [...segments]
        .sort((a, b) => b.totalWeight - a.totalWeight)
        .slice(0, 10);

      // Sort by over-index (how much this market over-indexes vs national)
      const sortedByOverIndex = [...segments]
        .sort((a, b) => b.overIndex - a.overIndex)
        .slice(0, 10);

      console.log(`   ✅ Found ${segments.length} segments, top by popularity: ${sortedByPopularity[0]?.name} (${sortedByPopularity[0]?.level1Category}), top by over-index: ${sortedByOverIndex[0]?.name} (${sortedByOverIndex[0]?.level1Category})`);

      res.json({
        success: true,
        marketName,
        geoLevel,
        zipCodeCount: zipCodes.length,
        totalSegments: segments.length,
        categoryFilter: categoryFilter || 'All Categories',
        topByPopularity: sortedByPopularity,
        topByOverIndex: sortedByOverIndex
      });
    } catch (error) {
      console.error('Error fetching market commerce data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch market commerce data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

