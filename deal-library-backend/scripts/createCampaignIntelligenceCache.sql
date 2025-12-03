-- ============================================================================
-- Campaign Intelligence Cache Schema
-- Purpose: Cache AI-generated competitive intelligence and strategic insights
-- ============================================================================

-- ============================================================================
-- Table: campaign_intelligence_cache
-- Purpose: Store competitive intelligence, SWOT, and strategic insights
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_intelligence_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  advertiser_name VARCHAR(200),
  industry VARCHAR(100),
  products JSONB,
  objectives JSONB,
  competitive_intelligence JSONB,
  base_swot JSONB,
  industry_insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for campaign_intelligence_cache
CREATE INDEX IF NOT EXISTS idx_campaign_cache_key ON campaign_intelligence_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_campaign_expires ON campaign_intelligence_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_campaign_advertiser ON campaign_intelligence_cache(advertiser_name);
CREATE INDEX IF NOT EXISTS idx_campaign_industry ON campaign_intelligence_cache(industry);

-- ============================================================================
-- Table: audience_search_cache
-- Purpose: Cache audience search results (if not already exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audience_search_cache (
  id SERIAL PRIMARY KEY,
  query VARCHAR(500) NOT NULL,
  filters JSONB,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for audience_search_cache
CREATE INDEX IF NOT EXISTS idx_audience_search_query ON audience_search_cache(query);
CREATE INDEX IF NOT EXISTS idx_audience_search_expires ON audience_search_cache(expires_at);

-- Auto-cleanup trigger for expired cache entries (run daily)
-- This prevents cache tables from growing indefinitely
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM campaign_intelligence_cache WHERE expires_at < NOW();
  DELETE FROM audience_search_cache WHERE expires_at < NOW();
  DELETE FROM audience_reports_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comment describing the tables
COMMENT ON TABLE campaign_intelligence_cache IS 'Caches AI-generated competitive intelligence with 24-hour TTL to improve campaign generation performance';
COMMENT ON TABLE audience_search_cache IS 'Caches audience search results with 1-hour TTL to reduce repeated searches';




