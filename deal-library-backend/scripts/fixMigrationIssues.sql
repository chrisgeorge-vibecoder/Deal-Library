-- Fix Migration Issues
-- Run this in Supabase SQL Editor to fix census data schema and retry migration

-- ============================================================================
-- 1. Drop and recreate census_data table with correct numeric precision
-- ============================================================================

DROP TABLE IF EXISTS census_data CASCADE;

CREATE TABLE census_data (
  zip VARCHAR(5) PRIMARY KEY,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  city VARCHAR(100),
  state_id VARCHAR(2),
  state_name VARCHAR(50),
  zcta BOOLEAN,
  population INTEGER,
  density DECIMAL(10, 2),
  age_median DECIMAL(6, 2),  -- Increased from 5 to 6 digits
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
  education_bachelors DECIMAL(6, 2),  -- Increased precision
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
  home_value BIGINT,  -- Changed from INTEGER to BIGINT for large values
  rent_median INTEGER,
  home_ownership DECIMAL(6, 2),
  unemployment_rate DECIMAL(6, 2),
  poverty DECIMAL(6, 2),
  self_employed DECIMAL(6, 2),
  charitable_givers DECIMAL(6, 2),
  cbsa_name VARCHAR(200),
  cbsa_metro BOOLEAN,
  county_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX idx_census_state ON census_data(state_id);
CREATE INDEX idx_census_city ON census_data(city);
CREATE INDEX idx_census_zcta ON census_data(zcta);
CREATE INDEX idx_census_income ON census_data(income_household_median);
CREATE INDEX idx_census_population ON census_data(population DESC);

-- Recreate trigger
CREATE TRIGGER update_census_data_updated_at BEFORE UPDATE ON census_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE census_data IS 'US Census demographic data by ZIP code (41K records) - FIXED SCHEMA';

-- ============================================================================
-- 2. Clear personas table to allow fresh insert
-- ============================================================================

TRUNCATE TABLE generated_personas CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Census data table recreated with correct schema. Personas table cleared. Ready to retry migration.';
END $$;

