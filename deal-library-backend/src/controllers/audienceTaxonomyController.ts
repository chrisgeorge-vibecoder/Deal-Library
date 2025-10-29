/**
 * Audience Taxonomy Controller
 * REST API for audience search and taxonomy management
 */

import { Request, Response, Router } from 'express';
import { AudienceSearchService } from '../services/audienceSearchService';
import { AudienceTaxonomyService } from '../services/audienceTaxonomyService';
import { GeminiService } from '../services/geminiService';
import { AudienceSearchFilters } from '../types/audienceTaxonomy';

export class AudienceTaxonomyController {
  private router: Router;
  private searchService: AudienceSearchService;
  private taxonomyService: AudienceTaxonomyService;

  constructor(geminiService: GeminiService) {
    this.router = Router();
    this.searchService = new AudienceSearchService(geminiService);
    this.taxonomyService = AudienceTaxonomyService.getInstance();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/browse', this.browseAudiences.bind(this));
    this.router.post('/search', this.searchAudiences.bind(this));
    this.router.get('/segment/:id', this.getSegmentDetails.bind(this));
    this.router.get('/stats', this.getStats.bind(this));
    this.router.post('/reload', this.reloadTaxonomy.bind(this));
  }

  /**
   * GET /api/audiences/browse
   * Fast endpoint that returns all segments without AI processing
   */
  private async browseAudiences(req: Request, res: Response): Promise<void> {
    try {
      console.log('📚 Browse audiences request');
      
      const segments = await this.taxonomyService.getTaxonomyData();

      res.json({
        success: true,
        segments,
        count: segments.length
      });
    } catch (error) {
      console.error('❌ Error browsing audiences:', error);
      res.status(500).json({
        error: 'Failed to browse audiences',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/audiences/search
   * Body: { query: string, filters?: AudienceSearchFilters }
   */
  private async searchAudiences(req: Request, res: Response): Promise<void> {
    try {
      const { query, filters } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required and must be a string' });
        return;
      }

      console.log(`🔍 Audience search request: "${query}"`);

      const results = await this.searchService.searchAudiences(query, filters);

      res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('❌ Error searching audiences:', error);
      res.status(500).json({
        error: 'Failed to search audiences',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/audiences/segment/:id
   */
  private async getSegmentDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Segment ID is required' });
        return;
      }

      const segment = await this.searchService.getSegmentDetails(id);

      if (!segment) {
        res.status(404).json({ error: 'Segment not found' });
        return;
      }

      res.json({
        success: true,
        segment
      });
    } catch (error) {
      console.error('❌ Error getting segment details:', error);
      res.status(500).json({
        error: 'Failed to get segment details',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/audiences/stats
   */
  private async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.taxonomyService.getStats();

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('❌ Error getting taxonomy stats:', error);
      res.status(500).json({
        error: 'Failed to get taxonomy stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/audiences/reload
   * Admin endpoint to reload taxonomy data
   */
  private async reloadTaxonomy(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔄 Reloading audience taxonomy data...');
      
      await this.taxonomyService.reload();
      const stats = await this.taxonomyService.getStats();

      res.json({
        success: true,
        message: 'Audience taxonomy data reloaded successfully',
        stats
      });
    } catch (error) {
      console.error('❌ Error reloading taxonomy:', error);
      res.status(500).json({
        error: 'Failed to reload taxonomy data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

