-- ============================================================================
-- Research Library & RAG Schema for Sovrn Launchpad
-- Purpose: Store research PDFs and enable semantic search with pgvector
-- ============================================================================

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- Table: research_studies
-- Purpose: Store metadata for research PDFs in the library
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_studies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  author VARCHAR(255),
  publication_date DATE,
  source VARCHAR(255), -- e.g., "IAB", "eMarketer", "Nielsen"
  category VARCHAR(100), -- e.g., "Programmatic", "Retail Media", "CTV", "Audience Targeting"
  tags TEXT[], -- Array of tags for filtering
  file_url TEXT NOT NULL, -- URL to PDF storage (Supabase Storage or external)
  file_size_kb INTEGER,
  thumbnail_url TEXT, -- Optional thumbnail/cover image
  summary TEXT, -- Brief summary of key findings
  why_it_matters TEXT, -- Curator's note on why this is valuable
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE, -- Allow draft/unpublished studies
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for research_studies
CREATE INDEX IF NOT EXISTS idx_research_category ON research_studies(category);
CREATE INDEX IF NOT EXISTS idx_research_source ON research_studies(source);
CREATE INDEX IF NOT EXISTS idx_research_featured ON research_studies(is_featured, is_published);
CREATE INDEX IF NOT EXISTS idx_research_published ON research_studies(is_published);
CREATE INDEX IF NOT EXISTS idx_research_publication_date ON research_studies(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_research_tags ON research_studies USING GIN(tags);

-- ============================================================================
-- Table: research_embeddings
-- Purpose: Store text chunks and their vector embeddings for RAG
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_embeddings (
  id BIGSERIAL PRIMARY KEY,
  study_id INTEGER NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL, -- The actual text chunk from the PDF
  chunk_index INTEGER NOT NULL, -- Order of chunk in document
  page_number INTEGER, -- Which page this chunk is from
  embedding vector(768), -- Using 768 dimensions for text-embedding-004 or similar models
  token_count INTEGER, -- Number of tokens in this chunk
  metadata JSONB, -- Store additional context (section headings, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for research_embeddings
CREATE INDEX IF NOT EXISTS idx_embeddings_study ON research_embeddings(study_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON research_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Note: You may need to increase lists parameter based on number of embeddings

-- ============================================================================
-- Table: research_citations
-- Purpose: Track which research studies are cited in AI assistant responses
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_citations (
  id BIGSERIAL PRIMARY KEY,
  study_id INTEGER NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL, -- The user's query
  chunk_ids INTEGER[], -- Which embedding chunks were used
  session_id VARCHAR(100), -- Optional: track user sessions
  cited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for research_citations
CREATE INDEX IF NOT EXISTS idx_citations_study ON research_citations(study_id);
CREATE INDEX IF NOT EXISTS idx_citations_date ON research_citations(cited_at DESC);

-- ============================================================================
-- Table: rag_queries_cache
-- Purpose: Cache RAG responses to reduce embedding API calls
-- ============================================================================
CREATE TABLE IF NOT EXISTS rag_queries_cache (
  id SERIAL PRIMARY KEY,
  query_hash VARCHAR(64) UNIQUE NOT NULL, -- MD5 hash of query
  query_text TEXT NOT NULL,
  retrieved_chunks JSONB, -- Store the chunks that were retrieved
  response_context TEXT, -- The augmented context sent to LLM
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  hit_count INTEGER DEFAULT 0
);

-- Indexes for rag_queries_cache
CREATE INDEX IF NOT EXISTS idx_rag_cache_hash ON rag_queries_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_rag_cache_expires ON rag_queries_cache(expires_at);

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

-- Trigger for research_studies
CREATE TRIGGER update_research_studies_updated_at BEFORE UPDATE ON research_studies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(study_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE research_studies 
  SET download_count = download_count + 1 
  WHERE id = study_id_param;
END;
$$ language 'plpgsql';

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(study_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE research_studies 
  SET view_count = view_count + 1 
  WHERE id = study_id_param;
END;
$$ language 'plpgsql';

-- ============================================================================
-- Semantic Search Function
-- Purpose: Find relevant research chunks for a given query embedding
-- ============================================================================
CREATE OR REPLACE FUNCTION search_research_embeddings(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  study_id INTEGER,
  study_title VARCHAR(500),
  chunk_text TEXT,
  page_number INTEGER,
  similarity float,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    re.study_id,
    rs.title,
    re.chunk_text,
    re.page_number,
    1 - (re.embedding <=> query_embedding) as similarity,
    re.metadata
  FROM research_embeddings re
  JOIN research_studies rs ON re.study_id = rs.id
  WHERE 
    rs.is_published = true
    AND 1 - (re.embedding <=> query_embedding) > match_threshold
  ORDER BY re.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ language 'plpgsql';

-- ============================================================================
-- Sample Data for Testing
-- ============================================================================
-- You can uncomment these to add sample entries for testing

-- INSERT INTO research_studies (
--   title, 
--   description, 
--   author,
--   publication_date,
--   source,
--   category,
--   tags,
--   file_url,
--   summary,
--   why_it_matters,
--   is_featured
-- ) VALUES 
-- (
--   'The State of Programmatic Advertising 2024',
--   'Comprehensive analysis of programmatic advertising trends, spending, and best practices.',
--   'IAB',
--   '2024-01-15',
--   'IAB',
--   'Programmatic',
--   ARRAY['programmatic', 'trends', 'best-practices'],
--   'https://example.com/studies/iab-programmatic-2024.pdf',
--   'Key findings: 85% of digital ad spend is now programmatic, CTV growing at 35% YoY',
--   'Essential reading for understanding current programmatic landscape and planning 2024 campaigns',
--   true
-- ),
-- (
--   'Retail Media Networks: The New Frontier',
--   'How retail media networks are transforming digital advertising.',
--   'eMarketer',
--   '2024-02-10',
--   'eMarketer',
--   'Retail Media',
--   ARRAY['retail-media', 'commerce', 'targeting'],
--   'https://example.com/studies/emarketer-retail-media.pdf',
--   'Retail media to reach $60B by 2025, offering unparalleled first-party data',
--   'Critical for brands wanting to leverage commerce data for targeting',
--   true
-- );

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Note: For now we'll leave RLS disabled, but you can enable later for auth
-- ============================================================================

-- ALTER TABLE research_studies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE research_embeddings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE research_citations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rag_queries_cache ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE research_studies IS 'Research PDFs library with metadata for browse/download';
COMMENT ON TABLE research_embeddings IS 'Text chunks and vector embeddings for RAG semantic search';
COMMENT ON TABLE research_citations IS 'Track which research studies are cited in AI assistant responses';
COMMENT ON TABLE rag_queries_cache IS 'Cache RAG retrieval results to optimize performance';

COMMENT ON COLUMN research_embeddings.embedding IS 'Vector embedding (768-dim) for semantic search using text-embedding-004 or similar';
COMMENT ON FUNCTION search_research_embeddings IS 'Semantic search function to find relevant research chunks by cosine similarity';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Research Library & RAG schema created successfully!';
  RAISE NOTICE '📚 Next steps:';
  RAISE NOTICE '   1. Upload PDFs to Supabase Storage';
  RAISE NOTICE '   2. Parse PDFs and generate embeddings';
  RAISE NOTICE '   3. Populate research_studies and research_embeddings tables';
  RAISE NOTICE '   4. Integrate RAG with Gemini service';
END $$;

