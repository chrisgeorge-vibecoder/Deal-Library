import { pipeline } from '@xenova/transformers';
import { IndexFlatL2 } from 'faiss-node';
import { Deal } from '../types/deal';

export interface EmbeddingResult {
  deal: Deal;
  similarity: number;
}

export class EmbeddingService {
  private pipeline: any = null;
  private index: IndexFlatL2 | null = null;
  private deals: Deal[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing embedding service...');
      
      // Initialize the sentence transformer pipeline
      this.pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      
      // Initialize FAISS index (384 dimensions for all-MiniLM-L6-v2)
      this.index = new IndexFlatL2(384);
      
      this.isInitialized = true;
      console.log('✅ Embedding service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize embedding service:', error);
      throw error;
    }
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    if (!this.pipeline) {
      throw new Error('Embedding service not initialized');
    }

    try {
      const result = await this.pipeline(text, { pooling: 'mean', normalize: true });
      return Array.from(result.data);
    } catch (error) {
      console.error('❌ Failed to generate embedding:', error);
      throw error;
    }
  }

  public async buildIndex(deals: Deal[]): Promise<void> {
    if (!this.index || !this.pipeline) {
      throw new Error('Embedding service not initialized');
    }

    console.log(`🔄 Building vector index for ${deals.length} deals...`);
    this.deals = deals;
    console.log(`📊 Stored ${this.deals.length} deals in embedding service`);

    // Clear existing index by creating a new one
    this.index = new IndexFlatL2(384);

    // Generate embeddings for all deals
    for (let i = 0; i < deals.length; i++) {
      const deal = deals[i];
      if (!deal) continue;
      
      const dealText = this.createDealText(deal);
      
      try {
        const embedding = await this.generateEmbedding(dealText);
        this.index.add(embedding);
        
        if ((i + 1) % 50 === 0) {
          console.log(`📊 Processed ${i + 1}/${deals.length} deals`);
        }
      } catch (error) {
        console.error(`❌ Failed to process deal ${deal.dealId}:`, error);
        // Add zero vector as fallback
        const zeroVector = new Array(384).fill(0);
        this.index.add(zeroVector);
      }
    }

    console.log(`✅ Vector index built with ${this.index.ntotal()} vectors`);
  }

  public async searchSimilar(query: string, topK: number = 10): Promise<EmbeddingResult[]> {
    if (!this.index || !this.pipeline) {
      throw new Error('Embedding service not initialized');
    }

    console.log(`🔍 SearchSimilar called with ${this.deals.length} deals loaded`);
    if (this.deals.length === 0) {
      console.log('⚠️ No deals loaded, returning empty results');
      return [];
    }

    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Search for similar vectors
      const { distances, labels } = this.index.search(queryEmbedding, topK);
      
      const results: EmbeddingResult[] = [];
      
      for (let i = 0; i < labels.length; i++) {
        const dealIndex = labels[i];
        const distance = distances[i];
        if (dealIndex === undefined || distance === undefined || !this.deals[dealIndex]) continue;
        
        const similarity = 1 - distance; // Convert distance to similarity (0-1)
        
        if (dealIndex < this.deals.length && this.deals[dealIndex]) {
          results.push({
            deal: this.deals[dealIndex],
            similarity
          });
        }
      }
      
      console.log(`🔍 Found ${results.length} similar deals for query: "${query}"`);
      return results;
      
    } catch (error) {
      console.error('❌ Failed to search similar deals:', error);
      return [];
    }
  }

  private createDealText(deal: Deal): string {
    // Create a comprehensive text representation of the deal for embedding
    const parts = [
      deal.dealName || '',
      deal.description || '',
      deal.targeting || '',
      deal.environment || '',
      deal.mediaType || '',
      deal.bidGuidance || ''
    ];
    
    return parts.filter(part => part && part.trim()).join(' ');
  }

  public isReady(): boolean {
    return this.isInitialized && this.index !== null && this.pipeline !== null && this.deals.length > 0;
  }

  public getDealCount(): number {
    return this.deals.length;
  }
}
