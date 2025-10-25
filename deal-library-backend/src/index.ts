import express, { NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import dotenv from 'dotenv';

import { DealsController } from './controllers/dealsController';
import { ResearchLibraryController } from './controllers/researchLibraryController';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { corsMiddleware } from './middleware/cors';
import { PersonaService } from './services/personaService';
import { PersistenceService } from './services/persistenceService';
import { SupabaseService } from './services/supabaseService';

// Load environment variables
dotenv.config();

// Validate environment variables
const recommendedEnvVars = ['GEMINI_API_KEY'];
const requiredEnvVarsProd = ['GOOGLE_APPS_SCRIPT_URL'];

const missingRecommended = recommendedEnvVars.filter(varName => !process.env[varName]);
const missingRequired = requiredEnvVarsProd.filter(varName => !process.env[varName]);

if (process.env.NODE_ENV === 'production') {
  if (missingRequired.length > 0) {
    console.error('❌ Missing required environment variables for production:', missingRequired.join(', '));
    process.exit(1);
  }
  if (missingRecommended.length > 0) {
    console.warn('⚠️  Missing recommended environment variables (some features will be disabled):', missingRecommended.join(', '));
  }
} else {
  if (missingRecommended.length > 0 || missingRequired.length > 0) {
    const allMissing = [...missingRecommended, ...missingRequired];
    console.warn('⚠️  Missing environment variables (development):', allMissing.join(', '));
    console.warn('Some features may be limited without these variables.');
  } else {
    console.log('✅ All environment variables are set');
  }
}

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize controllers and services
const persistenceService = new PersistenceService();
const dealsController = new DealsController();
const personaService = new PersonaService();

// Initialize Research Library Controller (requires Supabase)
let researchLibraryController: ResearchLibraryController | null = null;
if (process.env.USE_SUPABASE === 'true') {
  try {
    const supabase = SupabaseService.getClient();
    researchLibraryController = new ResearchLibraryController(supabase);
    console.log('✅ Research Library initialized');
  } catch (error) {
    console.warn('⚠️  Research Library disabled (Supabase not available)');
  }
}

// Security middleware
app.use(helmet({
  frameguard: { action: 'sameorigin' },
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginEmbedderPolicy: false, // avoid issues with PDF/image proxying
  crossOriginResourcePolicy: { policy: 'same-origin' },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      connectSrc: ["'self'", 'https:', 'http://localhost:3002']
    }
  }
}));
app.use(corsMiddleware);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  // Minimal logs in production
  app.use(morgan('tiny'));
} else if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      const error = new Error('Only PDF files are allowed') as any;
      error.statusCode = 400;
      cb(error);
    }
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  const state = persistenceService.getState();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    persistence: {
      hasLastQuery: !!state.lastQuery,
      lastQueryTime: state.timestamp,
      sessionDataKeys: Object.keys(state.sessionData)
    }
  });
});

// API Routes
app.get('/api/deals', (req, res) => dealsController.getDeals(req, res));
app.get('/api/deals/:id', (req, res) => dealsController.getDealById(req, res));
app.post('/api/deals', (req, res) => dealsController.createDeal(req, res));
app.put('/api/deals/:id', (req, res) => dealsController.updateDeal(req, res));
app.post('/api/custom-deal-request', (req, res) => dealsController.submitCustomDealRequest(req, res));
app.post('/api/deals/search', (req, res) => dealsController.searchDealsAI(req, res));
app.post('/api/audience-insights', (req, res) => dealsController.generateAudienceInsights(req, res));
app.post('/api/market-sizing', (req, res) => dealsController.generateMarketSizing(req, res));
app.post('/api/geographic-insights', (req, res) => dealsController.generateGeographicInsights(req, res));
app.post('/api/unified-search', (req, res) => dealsController.unifiedSearch(req, res));
app.post('/api/marketing-swot', (req, res) => dealsController.generateMarketingSWOT(req, res));
app.post('/api/company-profile', (req, res) => dealsController.generateCompanyProfile(req, res));
app.post('/api/marketing-news', (req, res) => dealsController.generateMarketingNews(req, res));
app.post('/api/competitive-intelligence', (req, res) => dealsController.generateCompetitiveIntelligence(req, res));
app.post('/api/content-strategy', (req, res) => dealsController.generateContentStrategy(req, res));
app.post('/api/brand-strategy', (req, res) => dealsController.generateBrandStrategy(req, res));

// Persona endpoints
app.get('/api/personas', async (req, res) => {
  try {
    // For now, return static personas from personaService
    // TODO: Eventually replace with dynamic persona generation
    const personas = personaService.getAllPersonas();
    const allDeals = await dealsController.getAllDeals();
    
    const personaCards = personas.map(persona => {
      // Count deals that match this persona
      const matchingDeals = allDeals.filter(deal => {
        const personaInsights = personaService.matchDealToPersona(deal.dealName);
        return personaInsights && personaInsights.segmentId === persona.segmentId;
      });
      
      return {
        id: persona.segmentId,
        name: persona.personaName,
        emoji: persona.emoji,
        segmentId: persona.segmentId,
        category: persona.category,
        coreInsight: persona.coreInsight,
        creativeHooks: persona.creativeHooks,
        mediaTargeting: persona.mediaTargeting,
        audienceMotivation: persona.audienceMotivation,
        actionableStrategy: persona.actionableStrategy,
        dealCount: matchingDeals.length
      };
    });
    res.json(personaCards);
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ error: 'Failed to fetch personas' });
  }
});

app.get('/api/deals/persona/:personaId', async (req, res) => {
  try {
    const { personaId } = req.params;
    const allDeals = await dealsController.getAllDeals();
    const personaDeals = allDeals.filter(deal => {
      const personaInsights = personaService.matchDealToPersona(deal.dealName);
      return personaInsights && personaInsights.segmentId === personaId;
    });
    res.json(personaDeals);
  } catch (error) {
    console.error('Error fetching deals for persona:', error);
    res.status(500).json({ error: 'Failed to fetch deals for persona' });
  }
});

// Census Data API Routes
app.post('/api/census/load', (req, res) => dealsController.loadCensusData(req, res));
app.post('/api/census/query', (req, res) => dealsController.queryCensusData(req, res));
app.post('/api/census/zip-codes', (req, res) => dealsController.getZipCodeData(req, res));
app.post('/api/census/search-location', (req, res) => dealsController.searchZipCodesByLocation(req, res));
app.get('/api/census/status', (req, res) => dealsController.getCensusDataStatus(req, res));

// Commerce Audience Data API Routes
app.post('/api/commerce-audiences/load', (req, res) => dealsController.loadCommerceAudienceData(req, res));
app.get('/api/commerce-audiences/segments', (req, res) => dealsController.getCommerceAudienceSegments(req, res));
app.post('/api/commerce-audiences/search-zip-codes', (req, res) => dealsController.searchZipCodesByAudience(req, res));
app.post('/api/commerce-audiences/zip-codes-data', (req, res) => dealsController.getAudienceDataForZipCodes(req, res));
app.get('/api/commerce-audiences/status', (req, res) => dealsController.getCommerceAudienceStatus(req, res));

// Audience Geo-Deep-Dive Analysis API Routes
app.post('/api/audience-geo-analysis/generate', (req, res) => dealsController.generateAudienceGeoDeepDive(req, res));
app.get('/api/audience-geo-analysis/segments', (req, res) => dealsController.getAvailableAudienceSegments(req, res));
app.get('/api/audience-geo-analysis/status', (req, res) => dealsController.getAudienceGeoAnalysisStatus(req, res));
app.post('/api/audience-geo-analysis/export-pdf', (req, res) => dealsController.exportAudienceGeoAnalysisPDF(req, res));

// Audience Insights API Routes
app.post('/api/audience-insights/generate', (req, res) => dealsController.generateAudienceInsightsReport(req, res));
app.post('/api/persona/generate', (req, res) => dealsController.generatePersonaCard(req, res));

// Commerce Baseline API Route
app.get('/api/commerce-baseline', async (req, res) => {
  try {
    const { commerceBaselineService } = await import('./services/commerceBaselineService');
    const baseline = await commerceBaselineService.getBaseline();
    const info = commerceBaselineService.getBaselineInfo();
    
    res.json({
      success: true,
      baseline,
      info
    });
  } catch (error) {
    console.error('Error fetching commerce baseline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commerce baseline'
    });
  }
});

// Research Library API Routes
if (researchLibraryController) {
  app.get('/api/research', (req, res) => researchLibraryController!.getAllStudies(req, res));
  app.get('/api/research/categories', (req, res) => researchLibraryController!.getCategories(req, res));
  app.get('/api/research/sources', (req, res) => researchLibraryController!.getSources(req, res));
  app.get('/api/research/stats', (req, res) => researchLibraryController!.getLibraryStats(req, res));
  app.get('/api/research/:id', (req, res) => researchLibraryController!.getStudyById(req, res));
  app.post('/api/research/:id/download', (req, res) => researchLibraryController!.downloadStudy(req, res));
  
  // File upload endpoint (must come before /api/research to avoid conflicts)
  app.post('/api/research/upload', upload.single('file'), (req: any, res: any) => {
    researchLibraryController!.uploadPDF(req, res);
  }, (err: any, req: any, res: any, next: any) => {
    // Handle multer errors specifically for this route
    if (err) {
      console.error('❌ Multer error in upload route:', err);
      if (err.message === 'Only PDF files are allowed') {
        return res.status(400).json({ error: 'Only PDF files are allowed.' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 30MB.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Unexpected file field.' });
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
  
  // Admin endpoints for research library
  app.post('/api/research', (req, res) => researchLibraryController!.createStudy(req, res));
  app.put('/api/research/:id', (req, res) => researchLibraryController!.updateStudy(req, res));
  app.delete('/api/research/:id', (req, res) => researchLibraryController!.deleteStudy(req, res));
  app.post('/api/research/:id/process', (req, res) => researchLibraryController!.processStudy(req, res));
  app.post('/api/research/:id/process-text', (req, res) => researchLibraryController!.processText(req, res));
  
  console.log('✅ Research Library routes registered');
} else {
  // Fallback routes when research library is not available
  app.get('/api/research', (req, res) => {
    res.status(503).json({
      error: 'Research Library Service Unavailable',
      message: 'The research library service is not configured. Please ensure Supabase is properly configured and USE_SUPABASE=true is set in environment variables.',
      studies: []
    });
  });
  
  app.get('/api/research/categories', (req, res) => {
    res.status(503).json({
      error: 'Research Library Service Unavailable',
      categories: []
    });
  });
  
  app.get('/api/research/sources', (req, res) => {
    res.status(503).json({
      error: 'Research Library Service Unavailable',
      sources: []
    });
  });
  
  console.log('⚠️  Research Library fallback routes registered (service unavailable)');
}


// Admin endpoints for Supabase data management
app.post('/api/admin/reload-census', async (req, res) => {
  try {
    const { CensusDataService } = await import('./services/censusDataService');
    const censusService = CensusDataService.getInstance();
    const result = await censusService.loadCensusData();
    
    res.json({
      success: result.success,
      message: 'Census data reloaded',
      stats: result.summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reload census data'
    });
  }
});

app.post('/api/admin/reload-commerce', async (req, res) => {
  try {
    const { commerceAudienceService } = await import('./services/commerceAudienceService');
    const result = await commerceAudienceService.loadCommerceData();
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reload commerce data'
    });
  }
});

app.post('/api/admin/clear-cache', async (req, res) => {
  try {
    if (process.env.USE_SUPABASE === 'true') {
      const supabase = SupabaseService.getClient();
      
      // Delete expired cache entries
      const { error } = await supabase
        .from('audience_reports_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());
      
      if (error) {
        throw new Error(error.message);
      }
      
      res.json({
        success: true,
        message: 'Expired cache entries cleared from Supabase'
      });
    } else {
      res.json({
        success: true,
        message: 'In-memory cache (no persistent cache to clear)'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear cache'
    });
  }
});

app.get('/api/admin/supabase-status', async (req, res) => {
  try {
    const enabled = process.env.USE_SUPABASE === 'true';
    
    if (!enabled) {
      res.json({
        enabled: false,
        message: 'Supabase is disabled. Using CSV fallback.'
      });
      return;
    }
    
    const supabase = SupabaseService.getClient();
    
    // Query record counts from each table
    const [censusCount, commerceCount, overlapCount, personaCount, cacheCount] = await Promise.all([
      supabase.from('census_data').select('*', { count: 'exact', head: true }),
      supabase.from('commerce_audience_segments').select('*', { count: 'exact', head: true }),
      supabase.from('audience_overlaps').select('*', { count: 'exact', head: true }),
      supabase.from('generated_personas').select('*', { count: 'exact', head: true }),
      supabase.from('audience_reports_cache').select('*', { count: 'exact', head: true })
    ]);
    
    res.json({
      enabled: true,
      tables: {
        census_data: censusCount.count || 0,
        commerce_audience_segments: commerceCount.count || 0,
        audience_overlaps: overlapCount.count || 0,
        generated_personas: personaCount.count || 0,
        audience_reports_cache: cacheCount.count || 0
      },
      message: 'Supabase is active and connected'
    });
  } catch (error) {
    res.status(500).json({
      enabled: true,
      error: error instanceof Error ? error.message : 'Failed to query Supabase status'
    });
  }
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server with error handling
const server = app.listen(PORT, async () => {
  console.log(`🚀 Sovrn Marketing Co-Pilot Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Auto-load commerce audience data on startup (always enabled)
  console.log(`\n📦 Auto-loading commerce audience data...`);
  try {
    const { commerceAudienceService } = await import('./services/commerceAudienceService');
    
    // Check if segments are already loaded
    const existingSegments = commerceAudienceService.getAudienceSegments();
    if (existingSegments.length === 0) {
      console.log(`🔄 No segments found, loading commerce data...`);
      const result = await commerceAudienceService.loadCommerceData();
      if (result.success) {
        console.log(`✅ Commerce data loaded: ${result.stats?.totalRecords.toLocaleString()} records, ${result.stats?.audienceSegments.length} segments`);
      }
    } else {
      console.log(`✅ Commerce segments already loaded: ${existingSegments.length} segments`);
    }
  } catch (error) {
    console.error(`⚠️  Failed to auto-load commerce data:`, error);
  }
  console.log(`📋 API endpoints:`);
  console.log(`   GET    /api/deals`);
  console.log(`   GET    /api/deals/:id`);
  console.log(`   POST   /api/deals`);
  console.log(`   PUT    /api/deals/:id`);
  console.log(`   POST   /api/custom-deal-request`);
  console.log(`   POST   /api/deals/search`);
  console.log(`   POST   /api/audience-insights`);
  console.log(`   POST   /api/market-sizing`);
  console.log(`   POST   /api/geographic-insights`);
  console.log(`   POST   /api/unified-search`);
  console.log(`   POST   /api/marketing-swot`);
  console.log(`   POST   /api/company-profile`);
  console.log(`   POST   /api/census/load`);
  console.log(`   POST   /api/census/query`);
  console.log(`   POST   /api/census/zip-codes`);
  console.log(`   POST   /api/census/search-location`);
  console.log(`   GET    /api/census/status`);
  console.log(`   POST   /api/commerce-audiences/load`);
  console.log(`   GET    /api/commerce-audiences/segments`);
  console.log(`   POST   /api/commerce-audiences/search-zip-codes`);
  console.log(`   POST   /api/commerce-audiences/zip-codes-data`);
  console.log(`   GET    /api/commerce-audiences/status`);
  console.log(`   POST   /api/audience-geo-analysis/generate`);
  console.log(`   GET    /api/audience-geo-analysis/segments`);
  console.log(`   GET    /api/audience-geo-analysis/status`);
  console.log(`   POST   /api/audience-geo-analysis/export-pdf`);
});

// Global error handling middleware
app.use((err: any, req: any, res: any, next: NextFunction) => {
  console.error('❌ Global error handler:', err);
  console.error('Error type:', typeof err);
  console.error('Error message:', err?.message);
  console.error('Error code:', err?.code);
  
  // Handle multer errors specifically
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 30MB.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field.' });
  }
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: 'Only PDF files are allowed.' });
  }
  
  // Handle any other multer validation errors
  if (err.message && err.message.includes('Only PDF files are allowed')) {
    return res.status(400).json({ error: 'Only PDF files are allowed.' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please kill existing processes or use a different port.`);
    console.error(`💡 Try: lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

export default app;
