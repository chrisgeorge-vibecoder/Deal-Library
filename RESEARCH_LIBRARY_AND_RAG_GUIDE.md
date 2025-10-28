# Research Library & RAG Integration Guide

## 🎯 Overview

Sovrn Launchpad now has two powerful new features:

1. **Research Library**: A downloadable PDF library of industry studies for marketers
2. **RAG (Retrieval Augmented Generation)**: AI assistant enhanced with research-backed responses

## 📚 Feature 1: Research Library

### What It Does
A curated library where users can browse, search, and download relevant research studies from sources like IAB, eMarketer, Nielsen, etc.

### Key Features
- ✅ Browse all published studies
- ✅ Filter by category (Programmatic, Retail Media, CTV, etc.)
- ✅ Filter by source (IAB, eMarketer, etc.)
- ✅ Search by keywords
- ✅ Featured studies highlighted
- ✅ Download tracking
- ✅ View statistics

### Usage

#### For End Users
Access the Research Library at `/research` (once you add the route):

```typescript
// Example: Add to your Next.js app
import ResearchLibrary from '@/components/ResearchLibrary';

export default function ResearchPage() {
  return <ResearchLibrary apiBaseUrl="http://localhost:3002" />;
}
```

#### For Admins: Adding Studies

**Method 1: Via API**
```bash
curl -X POST http://localhost:3002/api/research \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The State of Programmatic Advertising 2024",
    "description": "Comprehensive analysis of programmatic trends",
    "author": "IAB",
    "publication_date": "2024-01-15",
    "source": "IAB",
    "category": "Programmatic",
    "tags": ["programmatic", "trends", "best-practices"],
    "file_url": "https://your-storage.com/study.pdf",
    "summary": "Key findings: 85% of digital ad spend is now programmatic",
    "why_it_matters": "Essential for understanding 2024 landscape",
    "is_featured": true
  }'
```

**Method 2: Direct Database Insert**
```sql
INSERT INTO research_studies (
  title, description, author, publication_date, source, category, 
  tags, file_url, summary, why_it_matters, is_featured
) VALUES (
  'Retail Media Networks: The New Frontier',
  'How retail media networks are transforming digital advertising',
  'eMarketer',
  '2024-02-10',
  'eMarketer',
  'Retail Media',
  ARRAY['retail-media', 'commerce', 'targeting'],
  'https://your-storage.com/retail-media.pdf',
  'Retail media to reach $60B by 2025',
  'Critical for brands leveraging commerce data',
  true
);
```

## 🤖 Feature 2: RAG-Enhanced AI Assistant

### What It Does
The AI assistant now references your research library when answering questions, providing research-backed responses with citations.

### How It Works

1. **User asks a question**: "What are the latest trends in CTV advertising?"
2. **System retrieves research**: Searches the research library for relevant content
3. **AI generates response**: Gemini receives both the query AND relevant research excerpts
4. **Response includes citations**: Answer references specific studies with page numbers

### Example Response

**User**: "What are best practices for programmatic advertising in 2024?"

**Launchpad AI** (with RAG):
> According to the IAB Programmatic Study (2024), 85% of digital ad spend is now programmatic, with CTV growing at 35% YoY. Best practices include:
> 
> - **First-party data integration**: Research from IAB Programmatic Study (p.12) shows advertisers using first-party data see 34% higher ROAS
> - **Contextual targeting**: Combining contextual with behavioral targeting performs especially well in Q4
> - **Brand safety controls**: Essential for maintaining brand integrity
> 
> For your retail campaign, I'd recommend focusing on contextual targeting combined with your customer data.
>
> ---
> **Sources:**
> 1. The State of Programmatic Advertising 2024 (p.12, 18)
> 2. Retail Media Networks: The New Frontier (p.5)

### RAG Configuration

The system uses a **hybrid approach** (Option B) that:
- ✅ Prioritizes research when available
- ✅ Supplements with general knowledge when needed
- ✅ Always cites sources transparently
- ✅ Blends research with practical advice

## 🚀 Setup Instructions

### 1. Database Setup

Run the schema creation script:

```bash
# Connect to your Supabase project
psql postgresql://your-connection-string

# Run the schema
\i deal-library-backend/scripts/createResearchLibrarySchema.sql
```

This creates:
- `research_studies` - Study metadata
- `research_embeddings` - Vector embeddings for semantic search
- `research_citations` - Track which studies are cited
- `rag_queries_cache` - Cache for performance

### 2. Enable Supabase

Ensure your `.env` has:
```bash
USE_SUPABASE=true
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
GEMINI_API_KEY=your-gemini-key
```

### 3. Start the Backend

```bash
cd deal-library-backend
npm install
npm run dev
```

The backend will now:
- ✅ Initialize Research Library Controller
- ✅ Enable RAG in Gemini Service
- ✅ Log: "✅ Research Library initialized"
- ✅ Log: "✅ RAG enabled for Gemini Service"

### 4. Add Studies and Generate Embeddings

**Step 1: Add a study**
```bash
curl -X POST http://localhost:3002/api/research \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Study",
    "file_url": "https://example.com/study.pdf",
    "category": "Programmatic",
    "is_published": true
  }'
```

**Step 2: Process the study (generate embeddings)**

Option A: Using text directly (for testing)
```bash
curl -X POST http://localhost:3002/api/research/1/process-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your research text here. This could be extracted from a PDF..."
  }'
```

Option B: Process PDF (requires pdf-parse library)
```bash
# First, install pdf-parse
cd deal-library-backend
npm install pdf-parse

# Then process
curl -X POST http://localhost:3002/api/research/1/process
```

### 5. Test RAG Integration

Ask the AI assistant a question related to your research:

```bash
curl -X POST http://localhost:3002/api/deals/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the latest programmatic trends?"
  }'
```

You should see:
- 📚 Log: "Retrieving research context for query..."
- 📚 Log: "Found X relevant research chunks from Y studies"
- Response includes citations at the bottom

## 📊 API Endpoints

### Research Library

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/research` | List all published studies |
| GET | `/api/research/:id` | Get study details |
| GET | `/api/research/categories` | Get all categories |
| GET | `/api/research/sources` | Get all sources |
| GET | `/api/research/stats` | Get library statistics |
| POST | `/api/research/:id/download` | Track download |
| POST | `/api/research` | Create new study (admin) |
| PUT | `/api/research/:id` | Update study (admin) |
| DELETE | `/api/research/:id` | Delete study (admin) |
| POST | `/api/research/:id/process` | Generate embeddings from PDF |
| POST | `/api/research/:id/process-text` | Generate embeddings from text |

### Query Parameters for `/api/research`

- `category` - Filter by category
- `source` - Filter by source  
- `search` - Search in title/description
- `featured` - Show only featured (true/false)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

## 🎨 Frontend Integration

### Add Research Library Page

```typescript
// app/research/page.tsx
'use client';

import ResearchLibrary from '@/components/ResearchLibrary';

export default function ResearchPage() {
  return (
    <div className="min-h-screen">
      <ResearchLibrary apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'} />
    </div>
  );
}
```

### Add Navigation Link

```typescript
// Add to your navigation
<Link href="/research" className="nav-link">
  📚 Research Library
</Link>
```

### The AI Assistant Automatically Uses RAG

No changes needed! The existing AI assistant (`ChatInterface`) will automatically:
- Retrieve relevant research when answering questions
- Include citations in responses
- Track which studies are most useful

## 🔧 Advanced Configuration

### Adjust RAG Parameters

Edit `ragService.ts`:

```typescript
// In searchResearchLibrary method
const context = await this.ragService.retrieveContext(query, {
  matchThreshold: 0.7,  // Minimum similarity (0-1)
  matchCount: 5,        // Number of chunks to retrieve
  categories: []        // Optional: filter by category
});
```

### Change Prompt Behavior

Edit `geminiService.ts` - look for the RAG instructions section:

```typescript
prompt += '**INSTRUCTIONS FOR USING RESEARCH:**\n';
prompt += '- When citing research, use format: "According to [Study Name], ..."\n';
// Customize instructions here
```

### Add PDF Processing

To enable automatic PDF parsing:

```bash
cd deal-library-backend
npm install pdf-parse
```

Then uncomment the PDF processing code in `pdfProcessingService.ts`.

## 📈 Monitoring & Analytics

### View Citation Statistics

```sql
-- Most cited studies
SELECT 
  rs.title,
  COUNT(rc.id) as citation_count
FROM research_studies rs
LEFT JOIN research_citations rc ON rs.id = rc.study_id
GROUP BY rs.id, rs.title
ORDER BY citation_count DESC;
```

### View Popular Studies

```sql
-- Most downloaded studies
SELECT title, download_count, view_count
FROM research_studies
ORDER BY download_count DESC
LIMIT 10;
```

### Check RAG Cache Performance

```sql
-- Cache hit rate
SELECT 
  COUNT(*) as total_queries,
  SUM(hit_count) as total_hits,
  AVG(hit_count) as avg_hits_per_query
FROM rag_queries_cache;
```

## 🎯 Best Practices

### For Research Library
1. **Curate quality over quantity** - Add studies that truly help your users
2. **Write compelling summaries** - Help users decide if a study is relevant
3. **Use "Why It Matters"** - Explain practical value
4. **Tag thoughtfully** - Makes filtering more useful
5. **Feature selectively** - Only feature truly exceptional studies

### For RAG
1. **Process all PDFs** - Generate embeddings for all studies
2. **Monitor citations** - See which research is most useful
3. **Update regularly** - Add new studies as they're published
4. **Test queries** - Verify RAG returns relevant context
5. **Clear cache** - After updating studies, clear the cache

## 🐛 Troubleshooting

### RAG Not Working

**Check logs for:**
```
✅ RAG enabled for Gemini Service
📚 Retrieving research context for query...
```

**If missing:**
1. Verify `USE_SUPABASE=true` in `.env`
2. Check Supabase connection
3. Confirm studies have embeddings generated

### No Studies Appearing

1. Check studies are `is_published = true`
2. Verify API endpoint responds: `curl http://localhost:3002/api/research`
3. Check browser console for errors

### Embeddings Failing

1. Verify GEMINI_API_KEY is set
2. Check study has valid text content
3. Try with `/process-text` endpoint first (easier to debug)

## 🚀 Next Steps

1. **Upload your first study** - Use the API or SQL
2. **Generate embeddings** - Process the study text
3. **Test RAG** - Ask related questions in the Co-Pilot
4. **Add Research Library to nav** - Make it discoverable
5. **Monitor usage** - Track downloads and citations

## 💡 Tips

- **Start with text processing**: Use `/process-text` endpoint before implementing full PDF parsing
- **Test incrementally**: Add one study, test RAG, then add more
- **Use featured studies**: Highlight your best research
- **Track what users download**: Indicates what content is most valuable
- **Update prompts**: Customize RAG instructions for your audience

## 📞 Support

If you encounter issues:
1. Check server logs for RAG-related messages
2. Verify Supabase has pgvector extension enabled
3. Confirm embeddings table has data
4. Test RAG with simple queries first

---

**You're all set!** 🎉

You now have:
- ✅ A beautiful Research Library UI
- ✅ RAG-enhanced AI assistant with citations
- ✅ Full backend API for managing studies
- ✅ Vector search for semantic matching
- ✅ Citation tracking and analytics

Sovrn Launchpad will now provide research-backed answers with proper citations, positioning your tool as a comprehensive, credible resource for marketers! 📚🤖

