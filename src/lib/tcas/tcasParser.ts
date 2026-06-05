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

// ============================================================================
// University Parser
// ============================================================================

export function parseUniversity(
  data: UniversityApiResponse
): TcasUniversity {
  return {
    id: data.university_id,
    nameTh: data.university_name,
    nameEn: data.university_name_en,
    type: data.university_type,
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
    programId: data.program_id,
    universityId: data.university_id,
    universityNameTh: data.university_name_th,
    universityNameEn: data.university_name_en,
    campusNameTh: data.campus_name_th,
    campusNameEn: data.campus_name_en,
    facultyId: data.faculty_id,
    facultyNameTh: data.faculty_name_th,
    facultyNameEn: data.faculty_name_en,
    groupFieldId: data.group_field_id,
    groupFieldTh: data.group_field_th,
    fieldId: data.field_id,
    fieldNameTh: data.field_name_th,
    fieldNameEn: data.field_name_en,
    programNameTh: data.program_name_th,
    programNameEn: data.program_name_en,
    programTypeNameTh: data.program_type_name_th,
    cost: data.cost,
    graduateRate: data.graduate_rate,
    employmentRate: data.employment_rate,
    medianSalary: data.median_salary,
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
  return {
    roundNumber: Number.parseInt(parts[0], 10),
    roundYear: parts[1] || '',
  };
}

export function parseRoundProject(
  data: RoundProjectApiResponse
): TcasRoundProject {
  const { roundNumber, roundYear } = parseRoundType(data.type);

  return {
    projectId: data.project_id,
    projectNameTh: data.project_name_th,
    roundNumber,
    roundYear,
    seats: data.receive_student_number,
    minGpax: data.min_gpax,
    scoreConditions: data.score_conditions || {},
    scores: data.scores || {},
    description: data.description,
    condition: data.condition,
    link: data.link,
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
