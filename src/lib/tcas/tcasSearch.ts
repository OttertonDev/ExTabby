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

export function getCompositeFieldKey(
  program: Pick<TcasProgram, 'groupFieldId' | 'fieldId'>
): string {
  return `${program.groupFieldId}:${program.fieldId}`;
}

const FIELD_LABEL_RULES: Array<[RegExp, string]> = [
  [/computer|คอมพิวเตอร์|วิทยาการคอม/i, 'Computer Science'],
  [/software|ซอฟต์แวร์/i, 'Software Engineering'],
  [/information technology|สารสนเทศ|เทคโนโลยีสารสนเทศ/i, 'Information Technology'],
  [/data|ข้อมูล/i, 'Data Science'],
  [/medicine|medical|แพทย/i, 'Medicine'],
  [/nursing|พยาบาล/i, 'Nursing'],
  [/dent/i, 'Dentistry'],
  [/pharmacy|เภสัช/i, 'Pharmacy'],
  [/veterinary|สัตวแพทย/i, 'Veterinary Medicine'],
  [/public health|สาธารณสุข/i, 'Public Health'],
  [/engineering|วิศว/i, 'Engineering'],
  [/architecture|สถาปัต/i, 'Architecture'],
  [/design|ออกแบบ/i, 'Design'],
  [/business administration|บริหาร|จัดการ/i, 'Business'],
  [/accounting|บัญชี/i, 'Accounting'],
  [/economics|เศรษฐ/i, 'Economics'],
  [/law|นิติ/i, 'Law'],
  [/politic|รัฐศาส/i, 'Political Science'],
  [/communication|journalism|media|นิเทศ|วารสาร/i, 'Communication'],
  [/education|ครุ|ศึกษาศาสตร์|การศึกษา/i, 'Education'],
  [/psychology|จิตวิทยา/i, 'Psychology'],
  [/social work|สังคมสงเคราะห์/i, 'Social Work'],
  [/science|วิทยาศาสตร์/i, 'Science'],
  [/mathematics|math|คณิต/i, 'Mathematics'],
  [/physics|ฟิสิกส์/i, 'Physics'],
  [/chemistry|เคมี/i, 'Chemistry'],
  [/biology|ชีว/i, 'Biology'],
  [/agriculture|เกษตร/i, 'Agriculture'],
  [/food|อาหาร/i, 'Food Science'],
  [/tourism|ท่องเที่ยว/i, 'Tourism'],
  [/hospitality|hotel|โรงแรม/i, 'Hospitality'],
  [/aviation|airline|การบิน/i, 'Aviation'],
  [/logistics|โลจิส/i, 'Logistics'],
  [/arts|ศิลป/i, 'Arts'],
  [/music|ดนตรี/i, 'Music'],
  [/language|english|thai|japanese|chinese|ภาษา|อังกฤษ|ไทย|ญี่ปุ่น|จีน/i, 'Languages'],
];

function compareThai(a: string, b: string): number {
  return a.localeCompare(b, 'th');
}

function compareEnglish(a: string, b: string): number {
  return a.localeCompare(b, 'en');
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (match) => match.toUpperCase());
}

function cleanupEnglishLabel(value: string): string | null {
  const asciiText = value
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!/[a-z]/i.test(asciiText)) return null;
  if (!asciiText || asciiText === 'Not specified') return null;

  const withoutPrefixes = asciiText
    .replace(/^major\s+of\s+/i, '')
    .replace(/^field\s+of\s+/i, '')
    .replace(/^department\s+of\s+/i, '')
    .replace(/\s+program$/i, '')
    .trim();

  return toTitleCase(withoutPrefixes).slice(0, 36);
}

export function getSimpleFieldLabel(program: TcasProgram): string {
  const searchableText = [
    program.fieldNameEn,
    program.fieldNameTh,
    program.groupFieldTh,
    program.facultyNameEn,
    program.facultyNameTh,
  ].join(' ');

  const rule = FIELD_LABEL_RULES.find(([pattern]) => pattern.test(searchableText));
  if (rule) return rule[1];

  return (
    cleanupEnglishLabel(program.fieldNameEn) ??
    cleanupEnglishLabel(program.groupFieldTh) ??
    'Other'
  );
}

export function getSimpleFieldKey(program: TcasProgram): string {
  return getSimpleFieldLabel(program).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

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
    results = results.filter((p) => getSimpleFieldKey(p) === filters.fieldId);
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
      const univCompare = compareThai(a.universityNameTh, b.universityNameTh);
      if (univCompare !== 0) return univCompare;

      // Then by faculty name
      const facultyCompare = compareThai(a.facultyNameTh, b.facultyNameTh);
      if (facultyCompare !== 0) return facultyCompare;

      // Then by program name
      return compareThai(a.programNameTh, b.programNameTh);
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
export function getFieldOptions(
  programs: TcasProgram[],
  universityId?: string | null
): TcasFilterOption[] {
  const uniqueFields = new Map<string, string>();

  programs
    .filter((program) => !universityId || program.universityId === universityId)
    .forEach((program) => {
      const key = getSimpleFieldKey(program);
      if (!uniqueFields.has(key)) {
        uniqueFields.set(key, getSimpleFieldLabel(program));
      }
    });

  return Array.from(uniqueFields.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => compareEnglish(a.label, b.label));
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
    compareThai(a.nameTh, b.nameTh)
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
          groupFieldId: program.groupFieldId,
          fieldId: program.fieldId,
          nameTh: program.fieldNameTh,
          nameEn: program.fieldNameEn,
        });
      }
    });

  return Array.from(uniqueFields.values()).sort((a, b) =>
    compareThai(a.nameTh, b.nameTh)
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
    .sort((a, b) => compareThai(a.programNameTh, b.programNameTh));
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
    .filter((r) => Number.isFinite(r.roundNumber) && r.roundNumber >= 1 && r.roundNumber <= 4)
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
      projects.sort((a, b) => compareThai(a.projectNameTh, b.projectNameTh));

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
