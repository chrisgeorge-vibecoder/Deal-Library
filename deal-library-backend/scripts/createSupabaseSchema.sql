-- Supabase Schema for Sovrn Launchpad
-- Run this in Supabase SQL Editor to create all tables and indexes

-- ============================================================================
-- Table: census_data
-- Purpose: Store US Census demographic data by ZIP code
-- ============================================================================
CREATE TABLE IF NOT EXISTS census_data (
  zip VARCHAR(5) PRIMARY KEY,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  city VARCHAR(100),
  state_id VARCHAR(2),
  state_name VARCHAR(50),
  zcta BOOLEAN,
  population INTEGER,
  density DECIMAL(10, 2),
  age_median DECIMAL(6, 2),
  age_under_10 DECIMAL(6, 2),
  age_10_to_19 DECIMAL(6, 2),
  age_20s DECIMAL(6, 2),
  age_30s DECIMAL(6, 2),
  age_40s DECIMAL(6, 2),
  age_50s DECIMAL(6, 2),
  age_60s DECIMAL(6, 2),
  age_70s DECIMAL(6, 2),
  age_over_80 DECIMAL(6, 2),
  income_household_median INTEGER,
  education_bachelors DECIMAL(6, 2),
  education_graduate DECIMAL(6, 2),
  education_stem_degree DECIMAL(6, 2),
  race_white DECIMAL(6, 2),
  race_black DECIMAL(6, 2),
  race_asian DECIMAL(6, 2),
  hispanic DECIMAL(6, 2),
  family_size DECIMAL(6, 2),
  married DECIMAL(6, 2),
  family_dual_income DECIMAL(6, 2),
  commute_time DECIMAL(6, 2),
  home_value BIGINT,
  rent_median INTEGER,
  home_ownership DECIMAL(6, 2),
  unemployment_rate DECIMAL(6, 2),
  poverty DECIMAL(6, 2),
  self_employed DECIMAL(6, 2),
  charitable_givers DECIMAL(6, 2),
  veteran DECIMAL(6, 2),
  rent_burden DECIMAL(6, 2),
  cbsa_name VARCHAR(200),
  cbsa_metro BOOLEAN,
  county_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for census_data
CREATE INDEX IF NOT EXISTS idx_census_state ON census_data(state_id);
CREATE INDEX IF NOT EXISTS idx_census_city ON census_data(city);
CREATE INDEX IF NOT EXISTS idx_census_zcta ON census_data(zcta);
CREATE INDEX IF NOT EXISTS idx_census_income ON census_data(income_household_median);
CREATE INDEX IF NOT EXISTS idx_census_population ON census_data(population DESC);

-- ============================================================================
-- Table: commerce_audience_segments
-- Purpose: Store commerce audience segment data (ZIP code x Audience mapping)
-- ============================================================================
CREATE TABLE IF NOT EXISTS commerce_audience_segments (
  id BIGSERIAL PRIMARY KEY,
  sanitized_value VARCHAR(50),
  seed VARCHAR(50),
  dt DATE,
  weight INTEGER,
  label VARCHAR(50),
  audience_name VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for commerce_audience_segments
CREATE INDEX IF NOT EXISTS idx_commerce_audience ON commerce_audience_segments(audience_name);
CREATE INDEX IF NOT EXISTS idx_commerce_zip ON commerce_audience_segments(sanitized_value);
CREATE INDEX IF NOT EXISTS idx_commerce_weight ON commerce_audience_segments(weight DESC);
CREATE INDEX IF NOT EXISTS idx_commerce_composite ON commerce_audience_segments(audience_name, sanitized_value);
CREATE INDEX IF NOT EXISTS idx_commerce_date ON commerce_audience_segments(dt DESC);

-- ============================================================================
-- Table: audience_overlaps
-- Purpose: Store audience segment overlap metadata and behavioral patterns
-- ============================================================================
CREATE TABLE IF NOT EXISTS audience_overlaps (
  id SERIAL PRIMARY KEY,
  segment_name VARCHAR(200),
  segment_id VARCHAR(50),
  section_header VARCHAR(200),
  field_name VARCHAR(200),
  data_value TEXT,
  use_case TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audience_overlaps
CREATE INDEX IF NOT EXISTS idx_overlap_segment ON audience_overlaps(segment_name);
CREATE INDEX IF NOT EXISTS idx_overlap_segment_id ON audience_overlaps(segment_id);

-- ============================================================================
-- Table: generated_personas
-- Purpose: Store dynamically generated and static audience personas
-- ============================================================================
CREATE TABLE IF NOT EXISTS generated_personas (
  id SERIAL PRIMARY KEY,
  segment_id VARCHAR(50) UNIQUE,
  segment_name VARCHAR(200),
  persona_name VARCHAR(200),
  emoji VARCHAR(10),
  category VARCHAR(100),
  core_insight TEXT,
  creative_hooks JSONB,
  media_targeting JSONB,
  audience_motivation TEXT,
  actionable_strategy TEXT,
  is_dynamic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for generated_personas
CREATE INDEX IF NOT EXISTS idx_persona_segment ON generated_personas(segment_id);
CREATE INDEX IF NOT EXISTS idx_persona_dynamic ON generated_personas(is_dynamic);

-- ============================================================================
-- Table: audience_reports_cache
-- Purpose: Cache generated audience insights reports to reduce API costs
-- ============================================================================
CREATE TABLE IF NOT EXISTS audience_reports_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE,
  segment VARCHAR(200),
  category VARCHAR(100),
  report_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes for audience_reports_cache
CREATE INDEX IF NOT EXISTS idx_reports_segment ON audience_reports_cache(segment);
CREATE INDEX IF NOT EXISTS idx_reports_expires ON audience_reports_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_reports_cache_key ON audience_reports_cache(cache_key);

-- ============================================================================
-- Table: commerce_baseline
-- Purpose: Store commerce baseline calculations for comparison metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS commerce_baseline (
  id SERIAL PRIMARY KEY,
  calculation_date DATE UNIQUE,
  median_hhi INTEGER,
  median_age DECIMAL(5, 2),
  median_education DECIMAL(5, 2),
  top_zips JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for commerce_baseline
CREATE INDEX IF NOT EXISTS idx_baseline_date ON commerce_baseline(calculation_date DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Note: For production, you should enable RLS and create appropriate policies
-- For now, we'll leave it disabled for simplicity
-- ============================================================================

-- Enable RLS (uncomment when ready to implement auth)
-- ALTER TABLE census_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE commerce_audience_segments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audience_overlaps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE generated_personas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audience_reports_cache ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE commerce_baseline ENABLE ROW LEVEL SECURITY;

-- Example policy (allow all for authenticated users)
-- CREATE POLICY "Allow all for authenticated users" ON census_data
--   FOR ALL
--   USING (auth.role() = 'authenticated');

-- ============================================================================
-- Functions & Triggers
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_census_data_updated_at BEFORE UPDATE ON census_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audience_overlaps_updated_at BEFORE UPDATE ON audience_overlaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_personas_updated_at BEFORE UPDATE ON generated_personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Verification Queries
-- Run these after migration to verify data integrity
-- ============================================================================

-- SELECT COUNT(*) as census_records FROM census_data;
-- SELECT COUNT(*) as commerce_records FROM commerce_audience_segments;
-- SELECT COUNT(DISTINCT audience_name) as unique_audiences FROM commerce_audience_segments;
-- SELECT COUNT(*) as overlap_records FROM audience_overlaps;
-- SELECT COUNT(*) as persona_records FROM generated_personas;

COMMENT ON TABLE census_data IS 'US Census demographic data by ZIP code (41K records)';
COMMENT ON TABLE commerce_audience_segments IS 'Commerce audience segment data - ZIP x Audience mapping (4.3M records)';
COMMENT ON TABLE audience_overlaps IS 'Audience segment behavioral overlap metadata (3.7K records)';
COMMENT ON TABLE generated_personas IS 'Dynamically generated and static audience personas';
COMMENT ON TABLE audience_reports_cache IS 'Cache for generated audience insights reports (TTL-based)';
COMMENT ON TABLE commerce_baseline IS 'Commerce baseline calculations for comparison metrics';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Supabase schema created successfully! Run migration scripts to populate data.';
END $$;

