// Search and filter logic for TCAS programs
// Reference: Tabby-Schedule/app/src/main/java/com/ottertondev/tabby/feature/road/TcasSearch.kt

import Fuse, { type IFuseOptions } from 'fuse.js';
import type {
  TcasProgram,
  TcasFilterOption,
  TcasFaculty,
  TcasField,
  TcasRoundProject,
  TcasRoundGroup,
  TcasSearchFilters,
} from '@/types/tcas';
import { TCAS_MAX_SEARCH_RESULTS, TCAS_ROUND_NAMES } from '@/types/tcas';

// ============================================================================
// Fuse.js Configuration
// ============================================================================

const fuseOptions: IFuseOptions<TcasProgram> = {
  keys: [
    { name: 'programNameEn', weight: 2 },
    { name: 'programNameTh', weight: 2 },
    { name: 'universityNameEn', weight: 1.5 },
    { name: 'universityNameTh', weight: 1.5 },
    { name: 'facultyNameEn', weight: 1 },
    { name: 'facultyNameTh', weight: 1 },
    { name: 'fieldNameEn', weight: 1 },
    { name: 'fieldNameTh', weight: 1 },
    { name: 'programTypeNameTh', weight: 0.5 },
    { name: 'campusNameEn', weight: 0.5 },
    { name: 'campusNameTh', weight: 0.5 },
  ],
  threshold: 0.2, // Much stricter (was 0.4) - lower = more exact matches
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true, // Match anywhere in the string
  shouldSort: true,
};

// ============================================================================
// Search & Filter Functions
// ============================================================================

// Cache for Fuse instances to avoid re-creating on every search
const fuseCache = new WeakMap<TcasProgram[], Fuse<TcasProgram>>();

/**
 * Get or create a Fuse instance for the given programs array
 */
function getFuseInstance(programs: TcasProgram[]): Fuse<TcasProgram> {
  let fuse = fuseCache.get(programs);
  if (!fuse) {
    fuse = new Fuse(programs, fuseOptions);
    fuseCache.set(programs, fuse);
  }
  return fuse;
}

/**
 * Filter programs by query and filters
 * Returns up to TCAS_MAX_SEARCH_RESULTS results
 */
export function filterPrograms(
  programs: TcasProgram[],
  query: string,
  filters: TcasSearchFilters
): TcasProgram[] {
  let results = programs;

  // Apply university filter
  if (filters.universityId) {
    results = results.filter((p) => p.universityId === filters.universityId);
  }

  // Apply field filter
  if (filters.fieldId) {
    results = results.filter((p) => p.fieldId === filters.fieldId);
  }

  // Apply text search if query exists
  if (query.trim()) {
    const fuse = getFuseInstance(results);
    const searchResults = fuse.search(query.trim());
    results = searchResults.map((result) => result.item);
  } else {
    // No query - sort by university, faculty, program name
    results = [...results].sort((a, b) => {
      // Sort by university name
      const univCompare = a.universityNameTh.localeCompare(
        b.universityNameTh,
        'th'
      );
      if (univCompare !== 0) return univCompare;

      // Then by faculty name
      const facultyCompare = a.facultyNameTh.localeCompare(
        b.facultyNameTh,
        'th'
      );
      if (facultyCompare !== 0) return facultyCompare;

      // Then by program name
      return a.programNameTh.localeCompare(b.programNameTh, 'th');
    });
  }

  // Limit results
  return results.slice(0, TCAS_MAX_SEARCH_RESULTS);
}

// ============================================================================
// Filter Options Extraction
// ============================================================================

/**
 * Extract unique universities for filter dropdown
 */
export function getUniversityOptions(
  programs: TcasProgram[]
): TcasFilterOption[] {
  const uniqueUniversities = new Map<string, string>();

  programs.forEach((program) => {
    if (!uniqueUniversities.has(program.universityId)) {
      uniqueUniversities.set(program.universityId, program.universityNameTh);
    }
  });

  return Array.from(uniqueUniversities.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'th'));
}

/**
 * Extract unique fields for filter dropdown
 */
export function getFieldOptions(programs: TcasProgram[]): TcasFilterOption[] {
  const uniqueFields = new Map<string, string>();

  programs.forEach((program) => {
    if (!uniqueFields.has(program.fieldId)) {
      uniqueFields.set(program.fieldId, program.fieldNameTh);
    }
  });

  return Array.from(uniqueFields.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'th'));
}

// ============================================================================
// Hierarchical Navigation Extraction
// ============================================================================

/**
 * Get faculties for a specific university
 */
export function getFacultiesForUniversity(
  programs: TcasProgram[],
  universityId: string
): TcasFaculty[] {
  const uniqueFaculties = new Map<string, TcasFaculty>();

  programs
    .filter((p) => p.universityId === universityId)
    .forEach((program) => {
      if (!uniqueFaculties.has(program.facultyId)) {
        uniqueFaculties.set(program.facultyId, {
          universityId: program.universityId,
          facultyId: program.facultyId,
          nameTh: program.facultyNameTh,
          nameEn: program.facultyNameEn,
        });
      }
    });

  return Array.from(uniqueFaculties.values()).sort((a, b) =>
    a.nameTh.localeCompare(b.nameTh, 'th')
  );
}

/**
 * Get fields for a specific faculty
 */
export function getFieldsForFaculty(
  programs: TcasProgram[],
  universityId: string,
  facultyId: string
): TcasField[] {
  const uniqueFields = new Map<string, TcasField>();

  programs
    .filter(
      (p) => p.universityId === universityId && p.facultyId === facultyId
    )
    .forEach((program) => {
      if (!uniqueFields.has(program.fieldId)) {
        uniqueFields.set(program.fieldId, {
          universityId: program.universityId,
          facultyId: program.facultyId,
          fieldId: program.fieldId,
          nameTh: program.fieldNameTh,
          nameEn: program.fieldNameEn,
        });
      }
    });

  return Array.from(uniqueFields.values()).sort((a, b) =>
    a.nameTh.localeCompare(b.nameTh, 'th')
  );
}

/**
 * Get programs for a specific field
 */
export function getProgramsForField(
  programs: TcasProgram[],
  universityId: string,
  facultyId: string,
  fieldId: string
): TcasProgram[] {
  return programs
    .filter(
      (p) =>
        p.universityId === universityId &&
        p.facultyId === facultyId &&
        p.fieldId === fieldId
    )
    .sort((a, b) => a.programNameTh.localeCompare(b.programNameTh, 'th'));
}

/**
 * Find a specific program by ID
 */
export function findProgramById(
  programs: TcasProgram[],
  programId: string
): TcasProgram | undefined {
  return programs.find((p) => p.programId === programId);
}

// ============================================================================
// Round Grouping
// ============================================================================

/**
 * Group round projects by round number (1-4)
 * Filters out rounds > 4
 */
export function groupRoundsByNumber(
  rounds: TcasRoundProject[]
): TcasRoundGroup[] {
  // Filter and group by round number
  const groupsMap = new Map<number, TcasRoundProject[]>();

  rounds
    .filter((r) => r.roundNumber >= 1 && r.roundNumber <= 4)
    .forEach((round) => {
      const existing = groupsMap.get(round.roundNumber) || [];
      existing.push(round);
      groupsMap.set(round.roundNumber, existing);
    });

  // Convert to TcasRoundGroup array
  const groups: TcasRoundGroup[] = [];

  for (let roundNumber = 1; roundNumber <= 4; roundNumber++) {
    const projects = groupsMap.get(roundNumber) || [];

    if (projects.length > 0) {
      // Sort projects alphabetically
      projects.sort((a, b) =>
        a.projectNameTh.localeCompare(b.projectNameTh, 'th')
      );

      // Calculate total seats
      const totalSeats = projects.reduce((sum, p) => sum + p.seats, 0);

      groups.push({
        roundNumber,
        roundName: TCAS_ROUND_NAMES[roundNumber] || `รอบ ${roundNumber}`,
        totalSeats,
        projects,
      });
    }
  }

  return groups;
}
