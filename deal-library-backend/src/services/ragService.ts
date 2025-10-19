import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * RAG (Retrieval Augmented Generation) Service
 * Handles semantic search over research library and context augmentation for LLM
 */

interface ResearchChunk {
  study_id: number;
  study_title: string;
  chunk_text: string;
  page_number: number | null;
  similarity: number;
  metadata: any;
}

interface RAGContext {
  chunks: ResearchChunk[];
  citations: Array<{
    studyId: number;
    studyTitle: string;
    pages: number[];
  }>;
  augmentedPrompt: string;
}

export class RAGService {
  private genAI: GoogleGenerativeAI;
  private embeddingModel: any;
  private supabase: any;

  constructor(supabase: any) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
    this.supabase = supabase;
    
    console.log('✅ RAG Service initialized with Gemini embeddings');
  }

  /**
   * Generate embedding vector for a text query
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('❌ Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Search research library for relevant context
   */
  async searchResearchLibrary(
    query: string,
    options: {
      matchThreshold?: number;
      matchCount?: number;
      categories?: string[];
    } = {}
  ): Promise<ResearchChunk[]> {
    const {
      matchThreshold = 0.7,
      matchCount = 5,
      categories = []
    } = options;

    try {
      // Generate embedding for the query
      console.log(`🔍 Generating embedding for query: "${query}"`);
      const queryEmbedding = await this.generateEmbedding(query);

      // Build the RPC call parameters
      const rpcParams: any = {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      };

      // Call Supabase function to search embeddings
      const { data, error } = await this.supabase
        .rpc('search_research_embeddings', rpcParams);

      if (error) {
        console.error('❌ Error searching research embeddings:', error);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} relevant research chunks`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in searchResearchLibrary:', error);
      return [];
    }
  }

  /**
   * Retrieve relevant research and create augmented context for LLM
   */
  async retrieveContext(query: string): Promise<RAGContext> {
    const chunks = await this.searchResearchLibrary(query, {
      matchThreshold: 0.7,
      matchCount: 5
    });

    if (chunks.length === 0) {
      return {
        chunks: [],
        citations: [],
        augmentedPrompt: ''
      };
    }

    // Group chunks by study for citations
    const citationMap = new Map<number, { studyId: number; studyTitle: string; pages: Set<number> }>();
    
    chunks.forEach(chunk => {
      if (!citationMap.has(chunk.study_id)) {
        citationMap.set(chunk.study_id, {
          studyId: chunk.study_id,
          studyTitle: chunk.study_title,
          pages: new Set()
        });
      }
      if (chunk.page_number) {
        citationMap.get(chunk.study_id)!.pages.add(chunk.page_number);
      }
    });

    const citations = Array.from(citationMap.values()).map(c => ({
      studyId: c.studyId,
      studyTitle: c.studyTitle,
      pages: Array.from(c.pages).sort((a, b) => a - b)
    }));

    // Create augmented prompt with research context
    const augmentedPrompt = this.buildAugmentedPrompt(chunks);

    return {
      chunks,
      citations,
      augmentedPrompt
    };
  }

  /**
   * Build augmented prompt with research context
   */
  private buildAugmentedPrompt(chunks: ResearchChunk[]): string {
    if (chunks.length === 0) {
      return '';
    }

    let prompt = '\n\n**RESEARCH LIBRARY CONTEXT:**\n';
    prompt += 'The following excerpts from industry research studies may be relevant to this query:\n\n';

    chunks.forEach((chunk, index) => {
      const pageRef = chunk.page_number ? ` (p.${chunk.page_number})` : '';
      prompt += `[Source ${index + 1}: "${chunk.study_title}"${pageRef}]\n`;
      prompt += `${chunk.chunk_text}\n\n`;
    });

    prompt += '**INSTRUCTIONS FOR USING RESEARCH:**\n';
    prompt += '- When citing research, use format: "According to [Study Name], ..." or "Research from [Study Name] shows..."\n';
    prompt += '- Blend research insights with your general marketing knowledge\n';
    prompt += '- Always cite specific studies when you use their findings\n';
    prompt += '- If research doesn\'t fully answer the query, supplement with general knowledge but note the distinction\n';
    prompt += '- Include page references when citing: "According to [Study Name] (p.X), ..."\n\n';

    return prompt;
  }

  /**
   * Track citation usage in database
   */
  async trackCitation(
    studyIds: number[],
    query: string,
    chunkIds: number[],
    sessionId?: string
  ): Promise<void> {
    try {
      const citations = studyIds.map(studyId => ({
        study_id: studyId,
        query_text: query,
        chunk_ids: chunkIds,
        session_id: sessionId || null
      }));

      const { error } = await this.supabase
        .from('research_citations')
        .insert(citations);

      if (error) {
        console.error('❌ Error tracking citations:', error);
      } else {
        console.log(`✅ Tracked ${studyIds.length} research citations`);
      }
    } catch (error) {
      console.error('❌ Error in trackCitation:', error);
    }
  }

  /**
   * Check cache for similar queries
   */
  async checkCache(query: string): Promise<RAGContext | null> {
    try {
      // Create hash of query for cache lookup
      const crypto = require('crypto');
      const queryHash = crypto.createHash('md5').update(query.toLowerCase().trim()).digest('hex');

      const { data, error } = await this.supabase
        .from('rag_queries_cache')
        .select('*')
        .eq('query_hash', queryHash)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      // Increment hit count
      await this.supabase
        .from('rag_queries_cache')
        .update({ hit_count: data.hit_count + 1 })
        .eq('id', data.id);

      console.log(`✅ Cache hit for query: "${query}"`);

      return {
        chunks: data.retrieved_chunks || [],
        citations: this.extractCitationsFromChunks(data.retrieved_chunks || []),
        augmentedPrompt: data.response_context || ''
      };
    } catch (error) {
      console.error('❌ Error checking cache:', error);
      return null;
    }
  }

  /**
   * Save RAG context to cache
   */
  async saveToCache(query: string, context: RAGContext, ttlHours: number = 24): Promise<void> {
    try {
      const crypto = require('crypto');
      const queryHash = crypto.createHash('md5').update(query.toLowerCase().trim()).digest('hex');
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttlHours);

      const { error } = await this.supabase
        .from('rag_queries_cache')
        .upsert({
          query_hash: queryHash,
          query_text: query,
          retrieved_chunks: context.chunks,
          response_context: context.augmentedPrompt,
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'query_hash'
        });

      if (error) {
        console.error('❌ Error saving to cache:', error);
      } else {
        console.log(`✅ Cached RAG context for query: "${query}"`);
      }
    } catch (error) {
      console.error('❌ Error in saveToCache:', error);
    }
  }

  /**
   * Extract citations from chunks
   */
  private extractCitationsFromChunks(chunks: ResearchChunk[]): Array<{
    studyId: number;
    studyTitle: string;
    pages: number[];
  }> {
    const citationMap = new Map<number, { studyId: number; studyTitle: string; pages: Set<number> }>();
    
    chunks.forEach(chunk => {
      if (!citationMap.has(chunk.study_id)) {
        citationMap.set(chunk.study_id, {
          studyId: chunk.study_id,
          studyTitle: chunk.study_title,
          pages: new Set()
        });
      }
      if (chunk.page_number) {
        citationMap.get(chunk.study_id)!.pages.add(chunk.page_number);
      }
    });

    return Array.from(citationMap.values()).map(c => ({
      studyId: c.studyId,
      studyTitle: c.studyTitle,
      pages: Array.from(c.pages).sort((a, b) => a - b)
    }));
  }

  /**
   * Format citations for display
   */
  formatCitations(citations: Array<{ studyId: number; studyTitle: string; pages: number[] }>): string {
    if (citations.length === 0) {
      return '';
    }

    let formatted = '\n\n---\n**Sources:**\n';
    citations.forEach((citation, index) => {
      const pageRef = citation.pages.length > 0 ? ` (p.${citation.pages.join(', ')})` : '';
      formatted += `${index + 1}. ${citation.studyTitle}${pageRef}\n`;
    });

    return formatted;
  }
}

