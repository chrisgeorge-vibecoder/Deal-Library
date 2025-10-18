-- Alternative fix: ALTER existing table instead of DROP/CREATE
-- Run this if the DROP/CREATE didn't work

-- Alter all DECIMAL(5,2) fields to DECIMAL(6,2)
ALTER TABLE census_data ALTER COLUMN age_median TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN age_under_10 TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN age_10_to_19 TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN age_20s TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN age_30s TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN age_40s TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN age_50s TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN age_60s TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN age_70s TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN age_over_80 TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN education_bachelors TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN education_graduate TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN education_stem_degree TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN race_white TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN race_black TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN race_asian TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN hispanic TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN family_size TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN married TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN family_dual_income TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN commute_time TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN home_value TYPE BIGINT;
ALTER TABLE census_data ALTER COLUMN home_ownership TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN unemployment_rate TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN poverty TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN self_employed TYPE DECIMAL(6, 2);
ALTER TABLE census_data ALTER COLUMN charitable_givers TYPE DECIMAL(6, 2);

-- Verify schema
SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'census_data'
AND column_name IN ('age_median', 'education_bachelors', 'home_value')
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Census data table schema updated. All DECIMAL fields now support up to 9999.99';
END $$;

