// TypeScript types matching Android Tabby TCAS data models
// Reference: Tabby-Schedule/app/src/main/java/com/ottertondev/tabby/feature/road/TcasModels.kt

// ============================================================================
// Core Domain Types
// ============================================================================

export interface TcasUniversity {
  id: string;
  nameTh: string;
  nameEn: string;
  type: string;
  logoUrl: string;
  logoFilePath?: string | null; // For offline caching
}

export interface TcasFaculty {
  universityId: string;
  facultyId: string;
  nameTh: string;
  nameEn: string;
}

export interface TcasField {
  universityId: string;
  facultyId: string;
  groupFieldId: string;
  fieldId: string;
  nameTh: string;
  nameEn: string;
}

export interface TcasProgram {
  programId: string;
  universityId: string;
  universityNameTh: string;
  universityNameEn: string;
  campusNameTh: string;
  campusNameEn: string;
  facultyId: string;
  facultyNameTh: string;
  facultyNameEn: string;
  groupFieldId: string;
  groupFieldTh: string;
  fieldId: string;
  fieldNameTh: string;
  fieldNameEn: string;
  programNameTh: string;
  programNameEn: string;
  programTypeNameTh: string;
  cost: string | null;
  graduateRate: string | null;
  employmentRate: string | null;
  medianSalary: string | null;
}

export interface TcasRoundProject {
  projectId: string;
  projectNameTh: string;
  roundNumber: number; // 1-4 (Portfolio, Quota, Admission, Direct)
  roundYear: string;
  seats: number;
  minGpax: number | null;
  scoreConditions: Record<string, string>;
  scores: Record<string, number>;
  description: string | null;
  condition: string | null;
  link: string | null;
}

export interface TcasRoundGroup {
  roundNumber: number;
  roundName: string;
  totalSeats: number;
  projects: TcasRoundProject[];
}

export interface TcasFilterOption {
  key: string;
  label: string;
}

// ============================================================================
// API Response Types (from S3 JSON)
// ============================================================================

export interface UniversityApiResponse {
  university_id: string;
  university_name: string; // Thai name
  university_name_en: string;
  university_type: string;
}

export interface ProgramApiResponse {
  program_id: string | null;
  university_id: string | null;
  university_name_th: string | null;
  university_name_en: string | null;
  campus_name_th: string | null;
  campus_name_en: string | null;
  faculty_id: string | null;
  faculty_name_th: string | null;
  faculty_name_en: string | null;
  group_field_id: string | null;
  group_field_th: string | null;
  field_id: string | null;
  field_name_th: string | null;
  field_name_en: string | null;
  program_name_th: string | null;
  program_name_en: string | null;
  program_type_name_th: string | null;
  cost: string | null;
  graduate_rate: string | null;
  employment_rate: string | null;
  median_salary: string | null;
}

export interface RoundProjectApiResponse {
  project_id: string;
  project_name_th: string;
  type: string; // e.g., "1_2569" (roundNumber_year)
  receive_student_number: string | number;
  min_gpax: string | number | null;
  score_conditions: Record<string, string> | null;
  scores: Record<string, string | number> | null;
  description: string;
  condition: string;
  link: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface TcasSearchFilters {
  universityId?: string | null;
  fieldId?: string | null;
}

export interface TcasSearchState {
  query: string;
  filters: TcasSearchFilters;
  results: TcasProgram[];
  isSearching: boolean;
}

export interface TcasCacheMetadata {
  lastFetched: number;
  version: string;
}

// ============================================================================
// Constants
// ============================================================================

export const TCAS_ROUND_NAMES: Record<number, string> = {
  1: 'Portfolio',
  2: 'Quota',
  3: 'Admission',
  4: 'Direct Admission',
};

export const TCAS_ROUND_COLORS: Record<number, string> = {
  1: '#FFB600', // Orange/Gold
  2: '#F26B55', // Red/Coral
  3: '#00A0A9', // Teal
  4: '#00709A', // Blue
};

export const TCAS_API_BASE_URL =
  'https://my-tcas.s3.ap-southeast-1.amazonaws.com/mytcas';

export const TCAS_LOGO_BASE_URL = 'https://assets.mytcas.com/i/logo';

export const TCAS_CACHE_VERSION = '1.0.0';
export const TCAS_CACHE_TTL_DAYS = 7;
export const TCAS_MAX_SEARCH_RESULTS = 80;
