// Data parser for TCAS API responses
// Reference: Tabby-Schedule/app/src/main/java/com/ottertondev/tabby/feature/road/TcasDataParser.kt

import type {
  TcasUniversity,
  TcasProgram,
  TcasRoundProject,
  UniversityApiResponse,
  ProgramApiResponse,
  RoundProjectApiResponse,
} from '@/types/tcas';
import { TCAS_LOGO_BASE_URL } from '@/types/tcas';

const FALLBACK_TEXT = 'Not specified';

function cleanText(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  if (!text || text === '-' || text === '0') return null;
  return text;
}

function requiredText(
  value: string | number | null | undefined,
  fallback = FALLBACK_TEXT
): string {
  return cleanText(value) ?? fallback;
}

function cleanNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;

  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  return numberValue;
}

function cleanNullableNumber(value: string | number | null | undefined): number | null {
  const text = cleanText(value);
  if (!text) return null;

  const numberValue = Number(text);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function cleanScores(value: Record<string, string | number> | null | undefined): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.entries(value).reduce<Record<string, number>>((scores, [key, score]) => {
    const numberValue = cleanNullableNumber(score);
    if (numberValue !== null) {
      scores[key] = numberValue;
    }
    return scores;
  }, {});
}

export function normalizeExternalUrl(value: string | null | undefined): string | null {
  const text = cleanText(value);
  if (!text) return null;

  if (/^https?:\/\//i.test(text)) return text;
  if (/^www\./i.test(text)) return `https://${text}`;
  return null;
}

// ============================================================================
// University Parser
// ============================================================================

export function parseUniversity(
  data: UniversityApiResponse
): TcasUniversity {
  return {
    id: requiredText(data.university_id, 'unknown-university'),
    nameTh: requiredText(data.university_name),
    nameEn: requiredText(data.university_name_en),
    type: requiredText(data.university_type),
    logoUrl: `${TCAS_LOGO_BASE_URL}/${data.university_id}.png`,
    logoFilePath: null,
  };
}

export function parseUniversities(
  data: UniversityApiResponse[]
): TcasUniversity[] {
  return data.map(parseUniversity);
}

// ============================================================================
// Program Parser
// ============================================================================

export function parseProgram(data: ProgramApiResponse): TcasProgram {
  return {
    programId: requiredText(data.program_id, 'unknown-program'),
    universityId: requiredText(data.university_id, 'unknown-university'),
    universityNameTh: requiredText(data.university_name_th),
    universityNameEn: requiredText(data.university_name_en),
    campusNameTh: requiredText(data.campus_name_th),
    campusNameEn: requiredText(data.campus_name_en),
    facultyId: requiredText(data.faculty_id, 'unknown-faculty'),
    facultyNameTh: requiredText(data.faculty_name_th),
    facultyNameEn: requiredText(data.faculty_name_en),
    groupFieldId: requiredText(data.group_field_id, 'unknown-group'),
    groupFieldTh: requiredText(data.group_field_th),
    fieldId: requiredText(data.field_id, 'unknown-field'),
    fieldNameTh: requiredText(data.field_name_th),
    fieldNameEn: requiredText(data.field_name_en),
    programNameTh: requiredText(data.program_name_th),
    programNameEn: requiredText(data.program_name_en),
    programTypeNameTh: requiredText(data.program_type_name_th),
    cost: cleanText(data.cost),
    graduateRate: cleanText(data.graduate_rate),
    employmentRate: cleanText(data.employment_rate),
    medianSalary: cleanText(data.median_salary),
  };
}

export function parsePrograms(data: ProgramApiResponse[]): TcasProgram[] {
  return data.map(parseProgram);
}

// ============================================================================
// Round Project Parser
// ============================================================================

/**
 * Extract round number and year from type field
 * Example: "1_2569" -> { roundNumber: 1, roundYear: "2569" }
 */
function parseRoundType(type: string): { roundNumber: number; roundYear: string } {
  const parts = type.split('_');
  const roundNumber = Number.parseInt(parts[0], 10);

  return {
    roundNumber: Number.isNaN(roundNumber) ? 0 : roundNumber,
    roundYear: parts[1] || '',
  };
}

export function parseRoundProject(
  data: RoundProjectApiResponse
): TcasRoundProject {
  const { roundNumber, roundYear } = parseRoundType(data.type);

  return {
    projectId: requiredText(data.project_id, 'unknown-project'),
    projectNameTh: requiredText(data.project_name_th),
    roundNumber,
    roundYear,
    seats: cleanNumber(data.receive_student_number),
    minGpax: cleanNullableNumber(data.min_gpax),
    scoreConditions: data.score_conditions || {},
    scores: cleanScores(data.scores),
    description: cleanText(data.description),
    condition: cleanText(data.condition),
    link: normalizeExternalUrl(data.link),
  };
}

export function parseRoundProjects(
  data: RoundProjectApiResponse[]
): TcasRoundProject[] {
  return data.map(parseRoundProject);
}

// ============================================================================
// Search Text Composition
// ============================================================================

/**
 * Create a searchable text string from all program fields
 * Used for full-text search across all program attributes
 */
export function composeSearchText(program: TcasProgram): string {
  return [
    program.programNameEn,
    program.programNameTh,
    program.universityNameEn,
    program.universityNameTh,
    program.facultyNameEn,
    program.facultyNameTh,
    program.groupFieldTh,
    program.fieldNameEn,
    program.fieldNameTh,
    program.programTypeNameTh,
    program.campusNameEn,
    program.campusNameTh,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
