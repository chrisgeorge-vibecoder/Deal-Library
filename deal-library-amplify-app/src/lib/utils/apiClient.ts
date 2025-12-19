/**
 * Enhanced API Client with retry, caching, and error handling
 */

export interface ApiClientOptions {
  /** Retry configuration */
  retry?: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
    retryableStatusCodes?: number[];
  };
  /** Cache configuration */
  cache?: {
    enabled?: boolean;
    ttlMs?: number;
    key?: string;
  };
  /** Timeout in milliseconds */
  timeoutMs?: number;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T;
  cached: boolean;
  attempt: number;
}

class ApiClient {
  private cache = new Map<string, { data: any; expires: number }>();

  /**
   * Make an API request with retry, caching, and error handling
   */
  async request<T>(
    url: string,
    options: RequestInit = {},
    clientOptions: ApiClientOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      retry = { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2, retryableStatusCodes: [408, 429, 500, 502, 503, 504] },
      cache = { enabled: false },
      timeoutMs = 60000,
      signal
    } = clientOptions;

    // Check cache first
    if (cache.enabled && cache.key) {
      const cached = this.getFromCache<T>(cache.key);
      if (cached) {
        return { data: cached, cached: true, attempt: 0 };
      }
    }

    // Create timeout controller
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

    // Combine abort signals
    const combinedSignal = signal || timeoutController.signal;
    if (signal && timeoutController.signal) {
      // If both signals exist, abort when either fires
      signal.addEventListener('abort', () => timeoutController.abort());
      timeoutController.signal.addEventListener('abort', () => {
        if (!signal.aborted) {
          // Create a new abort controller that combines both
        }
      });
    }

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < (retry.maxAttempts || 3)) {
      attempt++;
      
      try {
        clearTimeout(timeoutId);
        const response = await fetch(url, {
          ...options,
          signal: combinedSignal
        });

        // Handle non-OK responses
        if (!response.ok) {
          const statusCode = response.status;
          
          // Check if retryable
          if (retry.retryableStatusCodes?.includes(statusCode) && attempt < (retry.maxAttempts || 3)) {
            const delay = (retry.delayMs || 1000) * Math.pow(retry.backoffMultiplier || 2, attempt - 1);
            console.log(`⏳ Retrying request (attempt ${attempt}/${retry.maxAttempts}) after ${delay}ms...`);
            await this.delay(delay);
            continue;
          }

          // Not retryable or max attempts reached
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`HTTP ${statusCode}: ${errorText}`);
        }

        // Parse response
        const data = await response.json() as T;

        // Cache the response
        if (cache.enabled && cache.key) {
          this.setCache(cache.key, data, cache.ttlMs || 300000);
        }

        return { data, cached: false, attempt };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on abort/timeout
        if (lastError.name === 'AbortError') {
          throw new Error('Request timeout or cancelled');
        }

        // Don't retry on network errors if we've exhausted attempts
        if (attempt >= (retry.maxAttempts || 3)) {
          break;
        }

        // Retry with exponential backoff
        const delay = (retry.delayMs || 1000) * Math.pow(retry.backoffMultiplier || 2, attempt - 1);
        console.log(`⏳ Retrying request (attempt ${attempt}/${retry.maxAttempts}) after ${delay}ms...`);
        await this.delay(delay);
      }
    }

    // All retries exhausted
    throw lastError || new Error('Request failed after all retry attempts');
  }

  /**
   * GET request helper
   */
  async get<T>(url: string, options: ApiClientOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET' }, options);
  }

  /**
   * POST request helper
   */
  async post<T>(url: string, body: any, options: ApiClientOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options as any
      },
      body: JSON.stringify(body)
    }, options);
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  private setCache(key: string, data: any, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    });
  }

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Utility: Delay promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

