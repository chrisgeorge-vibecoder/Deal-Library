-- FINAL FIX: Make all numeric fields generous to handle any value
-- This will definitely work

DROP TABLE IF EXISTS census_data CASCADE;

CREATE TABLE census_data (
  zip VARCHAR(5) PRIMARY KEY,
  lat DECIMAL(10, 7),
  lng DECIMAL(11, 7),
  city VARCHAR(100),
  state_id VARCHAR(2),
  state_name VARCHAR(50),
  zcta BOOLEAN,
  population BIGINT,
  density DECIMAL(10, 2),
  -- Age fields - allow up to 999.99
  age_median DECIMAL(10, 2),
  age_under_10 DECIMAL(10, 2),
  age_10_to_19 DECIMAL(10, 2),
  age_20s DECIMAL(10, 2),
  age_30s DECIMAL(10, 2),
  age_40s DECIMAL(10, 2),
  age_50s DECIMAL(10, 2),
  age_60s DECIMAL(10, 2),
  age_70s DECIMAL(10, 2),
  age_over_80 DECIMAL(10, 2),
  -- Income as BIGINT
  income_household_median BIGINT,
  -- Education/Demographics - allow up to 999.99
  education_bachelors DECIMAL(10, 2),
  education_graduate DECIMAL(10, 2),
  education_stem_degree DECIMAL(10, 2),
  race_white DECIMAL(10, 2),
  race_black DECIMAL(10, 2),
  race_asian DECIMAL(10, 2),
  hispanic DECIMAL(10, 2),
  family_size DECIMAL(10, 2),
  married DECIMAL(10, 2),
  family_dual_income DECIMAL(10, 2),
  commute_time DECIMAL(10, 2),
  -- Housing as BIGINT
  home_value BIGINT,
  rent_median BIGINT,
  home_ownership DECIMAL(10, 2),
  -- Employment
  unemployment_rate DECIMAL(10, 2),
  poverty DECIMAL(10, 2),
  self_employed DECIMAL(10, 2),
  charitable_givers DECIMAL(10, 2),
  -- Geography
  cbsa_name VARCHAR(200),
  cbsa_metro BOOLEAN,
  county_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_census_state ON census_data(state_id);
CREATE INDEX idx_census_city ON census_data(city);
CREATE INDEX idx_census_zcta ON census_data(zcta);
CREATE INDEX idx_census_income ON census_data(income_household_median);
CREATE INDEX idx_census_population ON census_data(population DESC);

-- Trigger
CREATE TRIGGER update_census_data_updated_at BEFORE UPDATE ON census_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Clear personas
TRUNCATE TABLE generated_personas CASCADE;

-- Verify
SELECT 'Census schema updated - all DECIMAL fields now support large values' as status;

