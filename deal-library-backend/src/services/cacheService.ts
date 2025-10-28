/**
 * Simple in-memory cache service for API responses
 * Provides TTL-based caching to reduce expensive database queries
 */
export class CacheService {
  private cache = new Map<string, { data: any; expires: number; created: number }>();
  
  /**
   * Get cached data by key
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  /**
   * Set cache data with TTL
   */
  set(key: string, data: any, ttlMs: number = 300000): void { // 5 minutes default
    const now = Date.now();
    this.cache.set(key, {
      data,
      expires: now + ttlMs,
      created: now
    });
  }
  
  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clear expired entries (cleanup)
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { 
    size: number; 
    keys: string[]; 
    oldestEntry: number | null;
    memoryUsage: number;
  } {
    const keys = Array.from(this.cache.keys());
    let oldestEntry = null;
    
    if (keys.length > 0) {
      oldestEntry = Math.min(...Array.from(this.cache.values()).map(item => item.created));
    }
    
    // Rough memory usage estimate (not precise)
    const memoryUsage = JSON.stringify(Array.from(this.cache.entries())).length;
    
    return {
      size: this.cache.size,
      keys,
      oldestEntry,
      memoryUsage
    };
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Auto-cleanup expired entries every 10 minutes
setInterval(() => {
  const cleared = cacheService.clearExpired();
  if (cleared > 0) {
    console.log(`🧹 Cache cleanup: removed ${cleared} expired entries`);
  }
}, 10 * 60 * 1000);
