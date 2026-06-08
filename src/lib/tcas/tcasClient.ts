// TCAS API client with browser-native caching
// Reference: Tabby-Schedule/app/src/main/java/com/ottertondev/tabby/feature/road/TcasPublicDataClient.kt

import type {
  TcasUniversity,
  TcasProgram,
  TcasRoundProject,
  UniversityApiResponse,
  ProgramApiResponse,
  RoundProjectApiResponse,
  TcasCacheMetadata,
} from '@/types/tcas';
import {
  TCAS_API_BASE_URL,
  TCAS_CACHE_VERSION,
  TCAS_CACHE_TTL_DAYS,
} from '@/types/tcas';
import {
  parseUniversities,
  parsePrograms,
  parseRoundProjects,
} from './tcasParser';

// ============================================================================
// Cache Keys
// ============================================================================

const CACHE_NAME = 'tcas-public-data';
const CACHE_METADATA_KEY = 'tcas-cache-metadata';

class NonRetryableFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableFetchError';
  }
}

// ============================================================================
// Cache Utilities
// ============================================================================

/**
 * Get cache metadata from localStorage
 */
function getCacheMetadata(): TcasCacheMetadata | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem(CACHE_METADATA_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as TcasCacheMetadata;
  } catch (error) {
    console.error('Failed to read cache metadata:', error);
    return null;
  }
}

/**
 * Set cache metadata in localStorage
 */
function setCacheMetadata(metadata: TcasCacheMetadata): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to write cache metadata:', error);
  }
}

/**
 * Check if cache is expired
 */
function isCacheExpired(): boolean {
  const metadata = getCacheMetadata();
  if (!metadata) return true;

  // Check version
  if (metadata.version !== TCAS_CACHE_VERSION) return true;

  // Check TTL
  const now = Date.now();
  const ageInDays = (now - metadata.lastFetched) / (1000 * 60 * 60 * 24);
  return ageInDays > TCAS_CACHE_TTL_DAYS;
}

function canUseCacheStorage(): boolean {
  return typeof caches !== 'undefined';
}

/**
 * Fetch with exponential backoff retry
 */
export async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  retryDelayMs = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;

      // Don't retry on 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        throw new NonRetryableFetchError(`HTTP ${response.status}: ${response.statusText}`);
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (error instanceof NonRetryableFetchError) {
        throw error;
      }
      lastError = error as Error;
    }

    // Exponential backoff: 1s, 2s, 4s
    if (attempt < maxRetries - 1) {
      const delay = Math.pow(2, attempt) * retryDelayMs;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}

/**
 * Fetch from network and cache the response
 */
async function fetchAndCache(url: string): Promise<Response> {
  const response = await fetchWithRetry(url);

  // Cache the response
  try {
    if (!canUseCacheStorage()) return response;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(url, response.clone());
  } catch (error) {
    console.warn('Failed to cache response:', error);
  }

  return response;
}

/**
 * Fetch with cache fallback.
 * Strategy: cache-first while metadata is fresh; network-first after expiry.
 */
async function fetchWithCache(url: string): Promise<Response> {
  const cacheIsExpired = isCacheExpired();

  if (!cacheIsExpired && canUseCacheStorage()) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        return cachedResponse;
      }
    } catch (cacheError) {
      console.warn('Fresh cache lookup failed, trying network:', cacheError);
    }
  }

  try {
    // Try network first
    return await fetchAndCache(url);
  } catch (networkError) {
    console.warn('Network fetch failed, trying cache:', networkError);

    // Fallback to cache
    try {
      if (!canUseCacheStorage()) throw networkError;

      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        console.log(cacheIsExpired ? 'Serving expired cache after network failure:' : 'Serving from cache:', url);
        return cachedResponse;
      }
    } catch (cacheError) {
      console.error('Cache fetch failed:', cacheError);
    }

    // Re-throw network error if cache also failed
    throw networkError;
  }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all universities
 */
export async function fetchUniversities(): Promise<TcasUniversity[]> {
  const url = `${TCAS_API_BASE_URL}/universities.json`;

  try {
    const response = await fetchWithCache(url);
    const data: UniversityApiResponse[] = await response.json();
    return parseUniversities(data);
  } catch (error) {
    console.error('Failed to fetch universities:', error);
    throw new Error('Failed to load universities. Please check your connection.', {
      cause: error,
    });
  }
}

/**
 * Fetch all programs
 */
export async function fetchPrograms(): Promise<TcasProgram[]> {
  const url = `${TCAS_API_BASE_URL}/courses.json`;

  try {
    const response = await fetchWithCache(url);
    const data: ProgramApiResponse[] = await response.json();
    return parsePrograms(data);
  } catch (error) {
    console.error('Failed to fetch programs:', error);
    throw new Error('Failed to load programs. Please check your connection.', {
      cause: error,
    });
  }
}

/**
 * Fetch rounds for a specific program
 */
export async function fetchRoundsForProgram(
  programId: string
): Promise<TcasRoundProject[]> {
  const url = `${TCAS_API_BASE_URL}/rounds/${encodeURIComponent(programId)}.json`;

  try {
    const response = await fetchWithCache(url);
    const data: RoundProjectApiResponse[] = await response.json();
    return parseRoundProjects(data);
  } catch (error) {
    console.error(`Failed to fetch rounds for program ${programId}:`, error);
    throw new Error('Admission rounds are currently unavailable from myTCAS.', {
      cause: error,
    });
  }
}

/**
 * Fetch universities and programs together
 * This is the main initialization function
 */
export async function fetchTcasData(): Promise<{
  universities: TcasUniversity[];
  programs: TcasProgram[];
}> {
  const [universities, programs] = await Promise.all([
    fetchUniversities(),
    fetchPrograms(),
  ]);

  // Update cache metadata
  setCacheMetadata({
    lastFetched: Date.now(),
    version: TCAS_CACHE_VERSION,
  });

  return { universities, programs };
}

/**
 * Prefetch logo for a university
 * Loads the image and caches it in the browser
 */
export async function prefetchLogo(logoUrl: string): Promise<void> {
  try {
    if (!canUseCacheStorage()) return;
    const response = await fetch(logoUrl);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(logoUrl, response);
    }
  } catch (error) {
    // Silently fail - logos are non-critical
    console.debug('Failed to prefetch logo:', logoUrl, error);
  }
}

/**
 * Clear all TCAS cache
 */
export async function clearTcasCache(): Promise<void> {
  try {
    if (canUseCacheStorage()) {
      await caches.delete(CACHE_NAME);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CACHE_METADATA_KEY);
    }
    console.log('TCAS cache cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
    throw new Error('Failed to clear cache', { cause: error });
  }
}

/**
 * Check if cached data exists and is valid
 */
export async function hasCachedData(): Promise<boolean> {
  try {
    if (isCacheExpired()) return false;

    if (!canUseCacheStorage()) return false;

    const cache = await caches.open(CACHE_NAME);
    const universitiesUrl = `${TCAS_API_BASE_URL}/universities.json`;
    const programsUrl = `${TCAS_API_BASE_URL}/courses.json`;

    const [universitiesCache, programsCache] = await Promise.all([
      cache.match(universitiesUrl),
      cache.match(programsUrl),
    ]);

    return !!(universitiesCache && programsCache);
  } catch (error) {
    console.error('Failed to check cached data:', error);
    return false;
  }
}
