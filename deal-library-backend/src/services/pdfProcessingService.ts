import { RAGService } from './ragService';

/**
 * PDF Processing Service
 * Handles PDF parsing, text extraction, chunking, and embedding generation
 */

interface PDFChunk {
  text: string;
  pageNumber: number;
  chunkIndex: number;
  tokenCount: number;
  metadata?: any;
}

interface ProcessedPDF {
  chunks: PDFChunk[];
  totalPages: number;
  totalTokens: number;
}

export class PDFProcessingService {
  private ragService: RAGService;
  private supabase: any;
  private readonly CHUNK_SIZE = 1000; // Characters per chunk
  private readonly CHUNK_OVERLAP = 200; // Overlap between chunks for context

  constructor(supabase: any, ragService: RAGService) {
    this.supabase = supabase;
    this.ragService = ragService;
    console.log('✅ PDF Processing Service initialized');
  }

  /**
   * Process a PDF file: extract text, chunk it, generate embeddings, and store
   */
  async processPDF(
    studyId: number,
    pdfUrl: string,
    metadata: { title: string; author?: string } = { title: 'Untitled' }
  ): Promise<{ success: boolean; chunksProcessed: number; error?: string }> {
    try {
      console.log(`📄 Processing PDF for study ${studyId}: ${pdfUrl}`);

      // Note: In production, you'll need to:
      // 1. Download PDF from URL or Supabase Storage
      // 2. Use a library like pdf-parse or pdfjs-dist to extract text
      // For now, we'll create a placeholder that you can implement

      console.log('⚠️  PDF text extraction not yet implemented');
      console.log('📝 To implement: Use pdf-parse npm package to extract text from PDF');
      
      // Placeholder: You would normally extract text here
      // const extractedText = await this.extractTextFromPDF(pdfUrl);
      // const processedPDF = this.chunkText(extractedText);
      // await this.generateAndStoreEmbeddings(studyId, processedPDF.chunks);

      return {
        success: false,
        chunksProcessed: 0,
        error: 'PDF processing not yet fully implemented. Need to add pdf-parse library.'
      };
    } catch (error: any) {
      console.error('❌ Error processing PDF:', error);
      return {
        success: false,
        chunksProcessed: 0,
        error: error.message
      };
    }
  }

  /**
   * Chunk text into smaller pieces suitable for embedding
   */
  private chunkText(text: string, metadata: any = {}): ProcessedPDF {
    const chunks: PDFChunk[] = [];
    let currentPage = 1;
    let chunkIndex = 0;

    // Split by pages (if we have page markers) or by fixed size
    // This is a simple implementation - you may want to be smarter about chunk boundaries
    const pagePattern = /\n--- Page (\d+) ---\n/g;
    const pages = text.split(pagePattern);

    for (let i = 0; i < pages.length; i += 2) {
      const pageText = pages[i] || '';
      const pageNum = i > 0 && pages[i - 1] ? parseInt(pages[i - 1] as string) : 1;

      // Split long pages into chunks
      const pageChunks = this.splitIntoChunks(pageText);

      pageChunks.forEach(chunkText => {
        chunks.push({
          text: chunkText,
          pageNumber: pageNum,
          chunkIndex: chunkIndex++,
          tokenCount: this.estimateTokenCount(chunkText),
          metadata: { ...metadata, page: pageNum }
        });
      });
    }

    const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);

    console.log(`✅ Chunked text into ${chunks.length} chunks (${totalTokens} tokens)`);

    return {
      chunks,
      totalPages: Math.max(...chunks.map(c => c.pageNumber)),
      totalTokens
    };
  }

  /**
   * Split text into chunks with overlap
   */
  private splitIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    let startPos = 0;

    while (startPos < text.length) {
      const endPos = Math.min(startPos + this.CHUNK_SIZE, text.length);
      let chunk = text.substring(startPos, endPos);

      // Try to break at sentence boundary if not at end
      if (endPos < text.length) {
        const lastPeriod = chunk.lastIndexOf('.');
        const lastNewline = chunk.lastIndexOf('\n');
        const breakPoint = Math.max(lastPeriod, lastNewline);

        if (breakPoint > this.CHUNK_SIZE / 2) {
          chunk = chunk.substring(0, breakPoint + 1);
          startPos += breakPoint + 1;
        } else {
          startPos = endPos;
        }
      } else {
        startPos = endPos;
      }

      chunks.push(chunk.trim());

      // Add overlap for next chunk
      if (startPos < text.length) {
        startPos = Math.max(0, startPos - this.CHUNK_OVERLAP);
      }
    }

    return chunks.filter(c => c.length > 50); // Filter out very short chunks
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokenCount(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate embeddings for chunks and store in database
   */
  async generateAndStoreEmbeddings(studyId: number, chunks: PDFChunk[]): Promise<number> {
    let storedCount = 0;

    console.log(`🔄 Generating embeddings for ${chunks.length} chunks...`);

    for (const chunk of chunks) {
      try {
        // Generate embedding
        const embedding = await this.ragService.generateEmbedding(chunk.text);

        // Store in database
        const { error } = await this.supabase
          .from('research_embeddings')
          .insert({
            study_id: studyId,
            chunk_text: chunk.text,
            chunk_index: chunk.chunkIndex,
            page_number: chunk.pageNumber,
            embedding: embedding,
            token_count: chunk.tokenCount,
            metadata: chunk.metadata
          });

        if (error) {
          console.error(`❌ Error storing embedding for chunk ${chunk.chunkIndex}:`, error);
        } else {
          storedCount++;
        }

        // Add small delay to avoid rate limiting
        await this.sleep(100);
      } catch (error) {
        console.error(`❌ Error processing chunk ${chunk.chunkIndex}:`, error);
      }
    }

    console.log(`✅ Stored ${storedCount}/${chunks.length} embeddings`);
    return storedCount;
  }

  /**
   * Process text directly (for testing without PDF)
   */
  async processText(
    studyId: number,
    text: string,
    metadata: any = {}
  ): Promise<{ success: boolean; chunksProcessed: number; error?: string }> {
    try {
      console.log(`📝 Processing text for study ${studyId}`);

      const processedPDF = this.chunkText(text, metadata);
      const storedCount = await this.generateAndStoreEmbeddings(studyId, processedPDF.chunks);

      return {
        success: true,
        chunksProcessed: storedCount
      };
    } catch (error: any) {
      console.error('❌ Error processing text:', error);
      return {
        success: false,
        chunksProcessed: 0,
        error: error.message
      };
    }
  }

  /**
   * Delete all embeddings for a study
   */
  async deleteEmbeddings(studyId: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('research_embeddings')
        .delete()
        .eq('study_id', studyId);

      if (error) {
        console.error(`❌ Error deleting embeddings for study ${studyId}:`, error);
      } else {
        console.log(`✅ Deleted embeddings for study ${studyId}`);
      }
    } catch (error) {
      console.error('❌ Error in deleteEmbeddings:', error);
    }
  }

  /**
   * Get embedding statistics for a study
   */
  async getEmbeddingStats(studyId: number): Promise<{
    chunkCount: number;
    totalTokens: number;
    avgTokensPerChunk: number;
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from('research_embeddings')
        .select('token_count')
        .eq('study_id', studyId);

      if (error || !data) {
        return null;
      }

      const chunkCount = data.length;
      const totalTokens = data.reduce((sum: number, row: any) => sum + (row.token_count || 0), 0);

      return {
        chunkCount,
        totalTokens,
        avgTokensPerChunk: chunkCount > 0 ? Math.round(totalTokens / chunkCount) : 0
      };
    } catch (error) {
      console.error('❌ Error getting embedding stats:', error);
      return null;
    }
  }

  /**
   * Helper: Sleep for ms milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

