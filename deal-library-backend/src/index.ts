import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { DealsController } from './controllers/dealsController';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { corsMiddleware } from './middleware/cors';
import { PersonaService } from './services/personaService';
import { PersistenceService } from './services/persistenceService';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['GEMINI_API_KEY', 'GOOGLE_APPS_SCRIPT_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please set the following environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  process.exit(1);
}

console.log('✅ All required environment variables are set');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize controllers and services
const persistenceService = new PersistenceService();
const dealsController = new DealsController();
const personaService = new PersonaService();

// Security middleware
app.use(helmet());
app.use(corsMiddleware);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Sovrn Marketing Co-Pilot Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Auto-load commerce audience data on startup
  console.log(`\n📦 Auto-loading commerce audience data...`);
  try {
    const { commerceAudienceService } = await import('./services/commerceAudienceService');
    const result = await commerceAudienceService.loadCommerceData();
    if (result.success) {
      console.log(`✅ Commerce data loaded: ${result.stats?.totalRecords.toLocaleString()} records, ${result.stats?.audienceSegments.length} segments\n`);
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

export default app;
