# 🚀 Quick Start Checklist - Research Library & RAG

## ✅ 5-Minute Setup

### Step 1: Database Setup (2 minutes)
```bash
# Connect to Supabase
psql postgresql://your-connection-string

# Run schema
\i deal-library-backend/scripts/createResearchLibrarySchema.sql

# Add sample studies
\i deal-library-backend/scripts/sampleResearchStudies.sql
```

**Expected output**: 
- ✅ 4 tables created
- ✅ 6 sample studies inserted

---

### Step 2: Enable in Backend (1 minute)

Verify your `.env` has:
```bash
USE_SUPABASE=true
SUPABASE_URL=your-url
SUPABASE_KEY=your-key
GEMINI_API_KEY=your-key
```

Restart backend:
```bash
cd deal-library-backend
npm run dev
```

**Look for these logs**:
```
✅ Research Library initialized
✅ RAG enabled for Gemini Service
✅ Research Library routes registered
```

---

### Step 3: Process Sample Text (1 minute)

Add embeddings for one study:
```bash
curl -X POST http://localhost:3002/api/research/1/process-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Programmatic advertising now represents 85% of all digital ad spend. CTV programmatic spending grew 35% year-over-year. Advertisers using first-party data saw 34% higher ROAS."
  }'
```

**Expected response**:
```json
{
  "message": "Text processed successfully",
  "chunksProcessed": 3
}
```

---

### Step 4: Test RAG (1 minute)

Ask the Co-Pilot a related question:
```bash
curl -X POST http://localhost:3002/api/deals/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What are programmatic advertising trends?"}'
```

**Look for**:
- Response mentions "85%" or "34% higher ROAS"
- Citations section at bottom with study name
- Logs show: `📚 Found X relevant research chunks`

✅ **If you see citations in the response, RAG is working!**

---

### Step 5: View Research Library (Optional)

Test the API:
```bash
curl http://localhost:3002/api/research
```

Should return 6 sample studies.

---

## 🎯 Quick Validation

✅ Backend logs show "RAG enabled"  
✅ `/api/research` returns studies  
✅ `/api/research/1/process-text` works  
✅ Co-Pilot responses include citations  
✅ Database has records in `research_embeddings` table  

---

## 🎨 Add to Frontend (Optional)

### Create Research Library Page
```bash
# Create new file: deal-library-frontend/src/app/research/page.tsx
```

```typescript
'use client';

import ResearchLibrary from '@/components/ResearchLibrary';

export default function ResearchPage() {
  return <ResearchLibrary apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'} />;
}
```

### Add to Navigation
Add link to your nav:
```typescript
<Link href="/research">📚 Research Library</Link>
```

---

## 📊 Verify It's Working

### Check Embeddings Were Created
```sql
SELECT COUNT(*) FROM research_embeddings;
-- Should return > 0
```

### Check RAG Retrieval
```sql
SELECT * FROM research_studies LIMIT 5;
-- Should show 6 studies
```

### Test Citation Tracking
After asking questions, check:
```sql
SELECT * FROM research_citations;
-- Should have records
```

---

## 🐛 Troubleshooting

### Problem: "RAG disabled" in logs
**Fix**: Verify `USE_SUPABASE=true` in `.env`

### Problem: No citations in responses
**Fix**: 
1. Check embeddings table has data: `SELECT COUNT(*) FROM research_embeddings;`
2. If empty, run Step 3 again
3. Make sure your query is related to the processed text

### Problem: "pgvector not found"
**Fix**: Enable pgvector extension in Supabase:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Problem: Studies not appearing
**Fix**: Check `is_published = true` in database

---

## 📚 Next Steps

Now that RAG is working:

1. **Add real research** - Replace sample studies with actual PDFs
2. **Process all studies** - Run `/process-text` for each study  
3. **Add Research Library to nav** - Make it discoverable
4. **Monitor usage** - Check `/api/research/stats`
5. **Customize prompts** - Edit RAG instructions in `geminiService.ts`

---

## 📖 Full Documentation

For detailed setup and advanced features:
- `RESEARCH_LIBRARY_AND_RAG_GUIDE.md` - Complete setup guide
- `IMPLEMENTATION_SUMMARY.md` - What was built and why

---

## ✨ You're Done!

Your Co-Pilot now:
- ✅ Provides research-backed answers
- ✅ Cites specific studies
- ✅ Combines research with general knowledge
- ✅ Tracks which research is most useful

**Users can now**:
- Browse and download research studies
- Get AI answers backed by real research
- See transparent citations for credibility

**Congratulations!** 🎉 You've successfully implemented both the Research Library and RAG enhancement.

