// Custom React hooks for TCAS data fetching and state management
// Reference: Tabby-Schedule/app/src/main/java/com/ottertondev/tabby/feature/road/RoadToUniversityViewModel.kt

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  TcasUniversity,
  TcasProgram,
  TcasRoundProject,
  TcasSearchFilters,
  TcasFilterOption,
} from '@/types/tcas';
import {
  fetchTcasData,
  fetchRoundsForProgram,
  hasCachedData,
} from '@/lib/tcas/tcasClient';
import {
  filterPrograms,
  getUniversityOptions,
  getFieldOptions,
  findProgramById,
  groupRoundsByNumber,
} from '@/lib/tcas/tcasSearch';
import type { TcasRoundGroup } from '@/types/tcas';

// ============================================================================
// Main TCAS Data Hook
// ============================================================================

interface UseTcasDataReturn {
  universities: TcasUniversity[];
  programs: TcasProgram[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Main hook for fetching and caching TCAS data
 * Loads universities and programs on mount
 */
export function useTcasData(): UseTcasDataReturn {
  const [universities, setUniversities] = useState<TcasUniversity[]>([]);
  const [programs, setPrograms] = useState<TcasProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTcasData();
      setUniversities(data.universities);
      setPrograms(data.programs);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load TCAS data';
      setError(errorMessage);
      console.error('useTcasData: Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    universities,
    programs,
    loading,
    error,
    refresh: loadData,
  };
}

// ============================================================================
// Search & Filter Hook
// ============================================================================

interface UseTcasSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  filters: TcasSearchFilters;
  setFilters: (filters: TcasSearchFilters) => void;
  clearFilters: () => void;
  results: TcasProgram[];
  universityOptions: TcasFilterOption[];
  fieldOptions: TcasFilterOption[];
  hasActiveFilters: boolean;
}

/**
 * Hook for managing search state and filtering programs
 */
export function useTcasSearch(programs: TcasProgram[]): UseTcasSearchReturn {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<TcasSearchFilters>({
    universityId: null,
    fieldId: null,
  });

  // Compute filter options
  const universityOptions = useMemo(
    () => getUniversityOptions(programs),
    [programs]
  );

  const fieldOptions = useMemo(() => getFieldOptions(programs), [programs]);

  // Compute search results - NO DEBOUNCING for instant updates
  const results = useMemo(
    () => filterPrograms(programs, query, filters),
    [programs, query, filters]
  );

  const hasActiveFilters = Boolean(filters.universityId || filters.fieldId);

  const clearFilters = useCallback(() => {
    setFilters({ universityId: null, fieldId: null });
  }, []);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    clearFilters,
    results,
    universityOptions,
    fieldOptions,
    hasActiveFilters,
  };
}

// ============================================================================
// Program Detail Hook
// ============================================================================

interface UseTcasProgramDetailReturn {
  program: TcasProgram | undefined;
  rounds: TcasRoundProject[];
  roundGroups: TcasRoundGroup[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching program details including admission rounds
 */
export function useTcasProgramDetail(
  programs: TcasProgram[],
  programId: string | undefined
): UseTcasProgramDetailReturn {
  const [rounds, setRounds] = useState<TcasRoundProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find program from programs list
  const program = useMemo(
    () => (programId ? findProgramById(programs, programId) : undefined),
    [programs, programId]
  );

  // Load rounds when programId changes
  useEffect(() => {
    if (!programId) {
      setRounds([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const loadRounds = async () => {
      setLoading(true);
      setError(null);

      try {
        const roundData = await fetchRoundsForProgram(programId);
        if (!cancelled) {
          setRounds(roundData);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to load rounds';
          setError(errorMessage);
          console.error('useTcasProgramDetail: Error loading rounds:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRounds();

    return () => {
      cancelled = true;
    };
  }, [programId]);

  // Group rounds by number
  const roundGroups = useMemo(() => groupRoundsByNumber(rounds), [rounds]);

  return {
    program,
    rounds,
    roundGroups,
    loading,
    error,
  };
}

// ============================================================================
// Cache Status Hook
// ============================================================================

interface UseCacheStatusReturn {
  hasCached: boolean;
  checking: boolean;
}

/**
 * Hook to check if cached TCAS data exists
 */
export function useCacheStatus(): UseCacheStatusReturn {
  const [hasCached, setHasCached] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkCache = async () => {
      try {
        const cached = await hasCachedData();
        setHasCached(cached);
      } catch (error) {
        console.error('Error checking cache:', error);
        setHasCached(false);
      } finally {
        setChecking(false);
      }
    };

    checkCache();
  }, []);

  return { hasCached, checking };
}
