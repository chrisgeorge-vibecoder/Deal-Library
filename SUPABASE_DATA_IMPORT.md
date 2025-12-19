# Supabase Data Import (If Data Missing)

If Supabase support confirms that pet segments are missing from the database (Scenario B), use this guide to import the data.

## Quick Import (Small Dataset)

If you only need to add a few pet-related segments:

```sql
INSERT INTO commerce_audience_segments (audience_name)
VALUES
  ('Animals & Pet Supplies'),
  ('Cat Supplies'),
  ('Dog Supplies'),
  ('Live Animals'),
  ('Pet Supplies');
```

## Full Import (Large Dataset)

### Option 1: Using Supabase Table Editor

1. Go to Supabase Dashboard → Table Editor
2. Select `commerce_audience_segments` table
3. Click "Import" button
4. Upload your CSV file
5. Map columns correctly:
   - `audience_name` → Your CSV column with segment names
   - Other columns as needed (zipCode, weight, seed, date, etc.)

### Option 2: Using SQL with CSV

If you have a CSV file, you can use the Supabase SQL Editor:

```sql
-- First, ensure the table structure matches your CSV
-- Then use COPY command (requires file to be accessible to database)

-- Note: Supabase may require using the Table Editor import instead
-- Check Supabase documentation for your plan's capabilities
```

### Option 3: Server-Side Script

Create a Node.js script to import data:

```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as csv from 'csv-parse/sync';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function importSegments() {
  // Read CSV file
  const csvContent = fs.readFileSync('commerce_audience_segments.csv', 'utf-8');
  const records = csv.parse(csvContent, { columns: true });
  
  // Process and insert in batches
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    // Normalize audience_name (trim whitespace)
    const normalizedBatch = batch.map(record => ({
      ...record,
      audience_name: record.audience_name?.trim()
    }));
    
    const { error } = await supabase
      .from('commerce_audience_segments')
      .insert(normalizedBatch);
    
    if (error) {
      console.error(`Error inserting batch ${i}-${i + batchSize}:`, error);
    } else {
      console.log(`✅ Inserted batch ${i}-${i + batchSize}`);
    }
  }
}

importSegments();
```

## Create Index for Performance

After importing, create an index:

```sql
CREATE INDEX IF NOT EXISTS idx_comm_aud_segments_name
  ON commerce_audience_segments (lower(trim(audience_name)));
```

## Verify Import

After importing, verify the data:

```sql
-- Check total count
SELECT COUNT(*) FROM commerce_audience_segments;

-- Check unique segments
SELECT COUNT(DISTINCT trim(audience_name)) 
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL;

-- Verify pet segments exist
SELECT DISTINCT trim(audience_name) AS audience_name
FROM commerce_audience_segments
WHERE audience_name IS NOT NULL
  AND (
    lower(audience_name) LIKE '%pet%'
    OR lower(audience_name) LIKE '%cat%'
    OR lower(audience_name) LIKE '%dog%'
    OR lower(audience_name) LIKE '%animal%'
  )
ORDER BY audience_name;
```

## CSV Format Expected

Your CSV should have at minimum:
- `audience_name` - The segment name (required)
- Other columns as needed by your schema:
  - `zipCode` or `sanitized_value`
  - `weight`
  - `seed`
  - `date`
  - `label`

Example CSV:
```csv
sanitized_value,seed,date,weight,label,audience_name
NA_US_90210,sample,2024-01-01,100,Label1,Pet Supplies
NA_US_90211,sample,2024-01-01,150,Label2,Cat Supplies
```

## Upsert (Update or Insert)

If you want to update existing records or insert new ones:

```sql
-- Using Supabase upsert (requires unique constraint)
INSERT INTO commerce_audience_segments (audience_name, zipCode, weight, seed, date)
VALUES
  ('Pet Supplies', '90210', 100, 'sample', '2024-01-01'),
  ('Cat Supplies', '90211', 150, 'sample', '2024-01-01')
ON CONFLICT (audience_name, zipCode) 
DO UPDATE SET 
  weight = EXCLUDED.weight,
  date = EXCLUDED.date;
```

## Next Steps

1. ✅ Import the data using one of the methods above
2. ✅ Create the index for performance
3. ✅ Verify the import with the verification queries
4. ✅ Test the API endpoint to confirm segments are returned
5. ✅ Deploy and test in production


