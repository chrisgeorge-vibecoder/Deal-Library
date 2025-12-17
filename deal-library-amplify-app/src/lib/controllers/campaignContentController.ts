/**
 * Campaign Content Controller
 * REST API for AI-powered campaign brief generation
 */

import { Request, Response, Router } from 'express';
import { CampaignContentService } from '../services/campaignContentService';
import { MarketInsightsService } from '../services/marketInsightsService';
import { GeminiService } from '../services/geminiService';
import { GeographicLevel } from '../types/censusData';

export class CampaignContentController {
  private router: Router;
  private campaignContentService: CampaignContentService;
  private marketInsightsService: MarketInsightsService;

  constructor(geminiService: GeminiService) {
    this.router = Router();
    this.campaignContentService = new CampaignContentService(geminiService);
    this.marketInsightsService = new MarketInsightsService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/generate-brief', this.generateBrief.bind(this));
    this.router.post('/high-fidelity-zips', this.getHighFidelityZips.bind(this));
  }

  /**
   * POST /api/campaign-content/generate-brief
   * Body: { geoLevel, marketName, includeCommercialZips }
   */
  private async generateBrief(req: Request, res: Response): Promise<void> {
    try {
      const { geoLevel, marketName, includeCommercialZips = false } = req.body;

      // Validation
      if (!geoLevel || !marketName) {
        res.status(400).json({ error: 'geoLevel and marketName are required' });
        return;
      }

      console.log(`📋 Generating campaign brief for ${marketName} (${geoLevel})`);

      // Get full market profile
      const profile = await this.marketInsightsService.getMarketProfile(
        geoLevel,
        marketName,
        includeCommercialZips
      );

      // Transform to campaign brief input
      const input = {
        marketName: profile.name,
        marketArchetype: profile.strategicSnapshot.archetype || 'General Market',
        overIndexAttributes: profile.strategicSnapshot.topStrengths.slice(0, 3).map(s => 
          profile.attributes.find(a => a.name === s.attribute)!
        ).filter(a => a !== undefined),
        underIndexAttributes: profile.strategicSnapshot.bottomConcerns.slice(0, 3).map(c =>
          profile.attributes.find(a => a.name === c.attribute)!
        ).filter(a => a !== undefined),
        geoLevel: profile.geoLevel,
        population: profile.population,
        geographicHierarchy: profile.geographicHierarchy
      };

      // Generate brief
      const brief = await this.campaignContentService.generateCampaignBrief(input);

      res.json({
        success: true,
        brief
      });
    } catch (error) {
      console.error('❌ Error generating campaign brief:', error);
      res.status(500).json({
        error: 'Failed to generate campaign brief',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/campaign-content/high-fidelity-zips
   * Body: { marketArchetype, parentMarket, geoLevel, targetSize }
   */
  private async getHighFidelityZips(req: Request, res: Response): Promise<void> {
    try {
      const { marketArchetype, parentMarket, geoLevel, targetSize = 500 } = req.body;

      // Validation
      if (!marketArchetype || !parentMarket || !geoLevel) {
        res.status(400).json({ error: 'marketArchetype, parentMarket, and geoLevel are required' });
        return;
      }

      console.log(`🎯 Getting high-fidelity ZIPs for ${parentMarket} (${marketArchetype})`);

      // Generate cluster
      const cluster = await this.campaignContentService.getHighFidelityZipCluster(
        marketArchetype,
        parentMarket,
        geoLevel as GeographicLevel,
        targetSize
      );

      res.json({
        success: true,
        cluster
      });
    } catch (error) {
      console.error('❌ Error generating high-fidelity ZIP cluster:', error);
      res.status(500).json({
        error: 'Failed to generate high-fidelity ZIP cluster',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

