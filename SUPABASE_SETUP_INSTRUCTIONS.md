# Supabase Setup Instructions

## Step 1: Add Credentials to .env File

Please manually add these lines to `deal-library-backend/.env`:

```bash
# Supabase Database Configuration
SUPABASE_URL=https://eibebfevxkskffepguya.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpYmViZmV2eGtza2ZmZXBndXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTA5OTksImV4cCI6MjA3NjMyNjk5OX0.CyuV-YgzB4lbuZXwAuECVAZQwsn6G8FXu_5xvfsY_TE
USE_SUPABASE=false
```

## Step 2: Create Database Schema

Go to your Supabase project: https://eibebfevxkskffepguya.supabase.co

Navigate to **SQL Editor** and run the schema creation script located at:
`deal-library-backend/scripts/createSupabaseSchema.sql`

This will create all necessary tables and indexes.

## Step 3: Run Data Migration

After schema is created, run the migration script:

```bash
cd deal-library-backend
npm run migrate:supabase
```

This will migrate all CSV data to Supabase (estimated time: 10-15 minutes for 4.3M records).

## Step 4: Enable Supabase

Once migration is complete and validated, update `.env`:

```bash
USE_SUPABASE=true
```

Then restart the backend server.

## Rollback

If you need to revert to CSV-based data loading:

```bash
USE_SUPABASE=false
```

And restart the backend.

# Supabase Database Configuration
SUPABASE_URL=https://eibebfevxkskffepguya.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpYmViZmV2eGtza2ZmZXBndXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTA5OTksImV4cCI6MjA3NjMyNjk5OX0.CyuV-YgzB4lbuZXwAuECVAZQwsn6G8FXu_5xvfsY_TE
USE_SUPABASE=false
