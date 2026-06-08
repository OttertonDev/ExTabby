// Search and filter logic for TCAS programs
// Reference: Tabby-Schedule/app/src/main/java/com/ottertondev/tabby/feature/road/TcasSearch.kt

import Fuse, { type IFuseOptions } from 'fuse.js';
import type {
  TcasProgram,
  TcasFilterOption,
  TcasFaculty,
  TcasFacultyProgramGroup,
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
  // Medical/Health Information BEFORE general IT to avoid false matches
  [/medical information|health information|เวชสารสนเทศ|เวชระเบียน/i, 'Health Informatics'],
  // Archives BEFORE IT to avoid false matches
  [/archive|records management|library science|วิทยาระเบียน|บรรณารักษ์/i, 'Library & Information Science'],
  // Information Technology (includes Data Science)
  [/information technology|information system|data science|เทคโนโลยีสารสนเทศ|วิทยาการข้อมูล|วิทยาศาสตร์ข้อมูล/i, 'Information Technology'],
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
  // Prioritize field-specific text over faculty name to avoid false matches
  // (e.g., "Human Biology" in "Faculty of ICT" should not match "Information Technology")
  const primaryText = [
    program.fieldNameEn,
    program.fieldNameTh,
    program.groupFieldTh,
  ].join(' ');

  // Try matching with primary field text first
  const primaryRule = FIELD_LABEL_RULES.find(([pattern]) => pattern.test(primaryText));
  if (primaryRule) return primaryRule[1];

  // If no match, try including faculty name (for cases where field name is generic)
  const secondaryText = [
    primaryText,
    program.facultyNameEn,
    program.facultyNameTh,
  ].join(' ');

  const secondaryRule = FIELD_LABEL_RULES.find(([pattern]) => pattern.test(secondaryText));
  if (secondaryRule) return secondaryRule[1];

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
// University & Faculty Aliases
// ============================================================================

/**
 * Maps abbreviation (lowercase) → universityId, or → { universityId, facultyKeyword?, programKeyword? }
 * facultyKeyword matches facultyNameEn/Th; programKeyword matches programNameEn/Th
 */
type AliasTarget = string | { universityId: string; facultyKeyword?: string; programKeyword?: string };

const UNIVERSITY_ALIASES: Record<string, AliasTarget> = {
  // ── Chulalongkorn University (001) ────────────────────────────────────────
  cu: '001', chula: '001', chulalongkorn: '001', จุฬา: '001',
  'cu-eng': { universityId: '001', facultyKeyword: 'engineer' },
  cueng: { universityId: '001', facultyKeyword: 'engineer' },
  egcu: { universityId: '001', facultyKeyword: 'engineer' },
  'cu-sci': { universityId: '001', facultyKeyword: 'science' },
  cusci: { universityId: '001', facultyKeyword: 'science' },
  'cu-med': { universityId: '001', facultyKeyword: 'medicine' },
  cumed: { universityId: '001', facultyKeyword: 'medicine' },
  mdcu: { universityId: '001', facultyKeyword: 'medicine' },
  'cu-law': { universityId: '001', facultyKeyword: 'law' },
  culaw: { universityId: '001', facultyKeyword: 'law' },
  'cu-bus': { universityId: '001', facultyKeyword: 'commerce' },
  cubs: { universityId: '001', facultyKeyword: 'commerce' },
  'cu-cbs': { universityId: '001', facultyKeyword: 'commerce' },
  sasin: { universityId: '001', facultyKeyword: 'sasin' },
  'cu-arts': { universityId: '001', facultyKeyword: 'arts' },
  'cu-arch': { universityId: '001', facultyKeyword: 'architect' },
  cuarch: { universityId: '001', facultyKeyword: 'architect' },
  'cu-commarts': { universityId: '001', facultyKeyword: 'communication' },
  commarts: { universityId: '001', facultyKeyword: 'communication' },
  'cu-econ': { universityId: '001', facultyKeyword: 'econom' },
  'cu-edu': { universityId: '001', facultyKeyword: 'educat' },
  'cu-polsci': { universityId: '001', facultyKeyword: 'political' },
  'cu-psych': { universityId: '001', facultyKeyword: 'psycholog' },
  'cu-pharm': { universityId: '001', facultyKeyword: 'pharmac' },
  'cu-dent': { universityId: '001', facultyKeyword: 'dent' },
  'cu-nurs': { universityId: '001', facultyKeyword: 'nurs' },
  'cu-vet': { universityId: '001', facultyKeyword: 'veterinar' },
  'cu-ahs': { universityId: '001', facultyKeyword: 'allied' },
  'cu-sportsci': { universityId: '001', facultyKeyword: 'sport' },
  'cu-ict': { universityId: '001', facultyKeyword: 'information' },

  // ── Kasetsart University (002) ────────────────────────────────────────────
  ku: '002', kasetsart: '002', เกษตร: '002',
  kuic: { universityId: '002', facultyKeyword: 'international' },
  'ku-eng': { universityId: '002', facultyKeyword: 'engineer' },
  'ku-sci': { universityId: '002', facultyKeyword: 'science' },
  'ku-agr': { universityId: '002', facultyKeyword: 'agricultur' },
  'ku-vet': { universityId: '002', facultyKeyword: 'veterinar' },
  'ku-for': { universityId: '002', facultyKeyword: 'forest' },
  'ku-fish': { universityId: '002', facultyKeyword: 'fisher' },
  'ku-econ': { universityId: '002', facultyKeyword: 'econom' },
  'ku-bus': { universityId: '002', facultyKeyword: 'business' },
  'ku-arch': { universityId: '002', facultyKeyword: 'architect' },
  'ku-edu': { universityId: '002', facultyKeyword: 'educat' },

  // ── Khon Kaen University (003) ────────────────────────────────────────────
  kku: '003', 'khon kaen': '003', khonkaen: '003', มข: '003',
  kkuic: { universityId: '003', facultyKeyword: 'international' },
  'kku-eng': { universityId: '003', facultyKeyword: 'engineer' },
  'kku-med': { universityId: '003', facultyKeyword: 'medicine' },
  'kku-sci': { universityId: '003', facultyKeyword: 'science' },
  'kku-dent': { universityId: '003', facultyKeyword: 'dent' },
  'kku-pharm': { universityId: '003', facultyKeyword: 'pharmac' },
  'kku-nurs': { universityId: '003', facultyKeyword: 'nurs' },
  'kku-law': { universityId: '003', facultyKeyword: 'law' },
  'kku-econ': { universityId: '003', facultyKeyword: 'econom' },
  'kku-bus': { universityId: '003', facultyKeyword: 'business' },
  'kku-agr': { universityId: '003', facultyKeyword: 'agricultur' },
  'kku-arch': { universityId: '003', facultyKeyword: 'architect' },
  'kku-edu': { universityId: '003', facultyKeyword: 'educat' },
  cgsm: { universityId: '003', facultyKeyword: 'management' },
  cola: { universityId: '003', facultyKeyword: 'local' },

  // ── Chiang Mai University (004) ───────────────────────────────────────────
  cmu: '004', 'chiang mai': '004', chiangmai: '004', มช: '004',
  camt: { universityId: '004', facultyKeyword: 'arts media' },
  icdi: { universityId: '004', facultyKeyword: 'digital' },
  'cmu-eng': { universityId: '004', facultyKeyword: 'engineer' },
  'cmu-med': { universityId: '004', facultyKeyword: 'medicine' },
  'cmu-sci': { universityId: '004', facultyKeyword: 'science' },
  'cmu-dent': { universityId: '004', facultyKeyword: 'dent' },
  'cmu-pharm': { universityId: '004', facultyKeyword: 'pharmac' },
  'cmu-nurs': { universityId: '004', facultyKeyword: 'nurs' },
  'cmu-vet': { universityId: '004', facultyKeyword: 'veterinar' },
  'cmu-agr': { universityId: '004', facultyKeyword: 'agricultur' },
  'cmu-arch': { universityId: '004', facultyKeyword: 'architect' },
  'cmu-law': { universityId: '004', facultyKeyword: 'law' },
  'cmu-econ': { universityId: '004', facultyKeyword: 'econom' },
  'cmu-bus': { universityId: '004', facultyKeyword: 'business' },
  'cmu-edu': { universityId: '004', facultyKeyword: 'educat' },
  'cmu-polsci': { universityId: '004', facultyKeyword: 'political' },
  'cmu-masscomm': { universityId: '004', facultyKeyword: 'communication' },
  'cmu-faa': { universityId: '004', facultyKeyword: 'fine arts' },
  'cmu-ba': { universityId: '004', facultyKeyword: 'business' },

  // ── Thammasat University (005) ────────────────────────────────────────────
  tu: '005', thammasat: '005', มธ: '005',
  siit: { universityId: '005', facultyKeyword: 'sirindhorn' },
  pbic: { universityId: '005', facultyKeyword: 'pridi' },
  pridi: { universityId: '005', facultyKeyword: 'pridi' },
  tbs: { universityId: '005', facultyKeyword: 'commerce' },
  'tu-law': { universityId: '005', facultyKeyword: 'law' },
  tulaw: { universityId: '005', facultyKeyword: 'law' },
  'tu-eng': { universityId: '005', facultyKeyword: 'engineer' },
  tueng: { universityId: '005', facultyKeyword: 'engineer' },
  'tu-econ': { universityId: '005', facultyKeyword: 'econom' },
  'tu-sci': { universityId: '005', facultyKeyword: 'science' },
  'tu-bus': { universityId: '005', facultyKeyword: 'commerce' },
  'tu-polsci': { universityId: '005', facultyKeyword: 'political' },
  'tu-med': { universityId: '005', facultyKeyword: 'medicine' },
  'tu-dent': { universityId: '005', facultyKeyword: 'dent' },
  'tu-nurs': { universityId: '005', facultyKeyword: 'nurs' },
  'tu-pharm': { universityId: '005', facultyKeyword: 'pharmac' },
  'tu-arch': { universityId: '005', facultyKeyword: 'architect' },
  'tu-faa': { universityId: '005', facultyKeyword: 'fine arts' },
  'tu-jour': { universityId: '005', facultyKeyword: 'journal' },
  'tu-soc': { universityId: '005', facultyKeyword: 'social' },
  'tu-libarts': { universityId: '005', facultyKeyword: 'liberal' },

  // ── Mahidol University (006) ──────────────────────────────────────────────
  mu: '006', mahidol: '006', มม: '006',
  // ICT
  muict: { universityId: '006', facultyKeyword: 'information and communication' },
  ict: { universityId: '006', facultyKeyword: 'information and communication' },
  'mu-ict': { universityId: '006', facultyKeyword: 'information and communication' },
  // MUIC - International College
  muic: { universityId: '006', facultyKeyword: 'international college' },
  'mu-ic': { universityId: '006', facultyKeyword: 'international college' },
  'mu-int': { universityId: '006', facultyKeyword: 'international college' },
  // CMMU - College of Management
  cmmu: { universityId: '006', facultyKeyword: 'management' },
  'mu-mgmt': { universityId: '006', facultyKeyword: 'management' },
  // Medicine - Siriraj
  siriraj: { universityId: '006', facultyKeyword: 'siriraj' },
  simd: { universityId: '006', facultyKeyword: 'siriraj' },
  'mu-siriraj': { universityId: '006', facultyKeyword: 'siriraj' },
  // Medicine - Ramathibodi
  rama: { universityId: '006', facultyKeyword: 'ramathibodi' },
  ramathibodi: { universityId: '006', facultyKeyword: 'ramathibodi' },
  'mu-rama': { universityId: '006', facultyKeyword: 'ramathibodi' },
  // Science (DST)
  // DST = Digital Science and Technology (Thai curriculum under ICT faculty)
  dst: { universityId: '006', programKeyword: 'digital science' },
  'mu-dst': { universityId: '006', programKeyword: 'digital science' },
  mudst: { universityId: '006', programKeyword: 'digital science' },
  // Science faculty (separate from ICT)
  'mu-sci': { universityId: '006', facultyKeyword: 'faculty of science' },
  // Engineering
  'mu-eg': { universityId: '006', facultyKeyword: 'engineer' },
  'mu-eng': { universityId: '006', facultyKeyword: 'engineer' },
  mueg: { universityId: '006', facultyKeyword: 'engineer' },
  egmu: { universityId: '006', facultyKeyword: 'engineer' },
  // Pharmacy
  'mu-pharm': { universityId: '006', facultyKeyword: 'pharmac' },
  // Dentistry
  'mu-dent': { universityId: '006', facultyKeyword: 'dent' },
  // Nursing
  'mu-nurs': { universityId: '006', facultyKeyword: 'nurs' },
  'mu-ns': { universityId: '006', facultyKeyword: 'nurs' },
  // Public Health
  'mu-ph': { universityId: '006', facultyKeyword: 'public health' },
  // Veterinary
  'mu-vet': { universityId: '006', facultyKeyword: 'veterinar' },
  // Allied Medical / Medical Technology
  ams: { universityId: '006', facultyKeyword: 'allied' },
  'mu-ams': { universityId: '006', facultyKeyword: 'allied' },
  mls: { universityId: '006', facultyKeyword: 'medical technolog' },
  // Physical Therapy
  'mu-pt': { universityId: '006', facultyKeyword: 'physical therap' },
  // Tropical Medicine
  'mu-trop': { universityId: '006', facultyKeyword: 'tropical' },
  // Music
  'mu-music': { universityId: '006', facultyKeyword: 'music' },
  // Liberal Arts
  'mu-la': { universityId: '006', facultyKeyword: 'liberal' },
  // Social Sciences
  'mu-soc': { universityId: '006', facultyKeyword: 'social' },
  // Environment
  'mu-env': { universityId: '006', facultyKeyword: 'environment' },

  // ── Silpakorn University (008) ────────────────────────────────────────────
  su: '008', silpakorn: '008', ศิลปากร: '008',
  suic: { universityId: '008', facultyKeyword: 'international' },
  'su-arch': { universityId: '008', facultyKeyword: 'architect' },
  'su-arts': { universityId: '008', facultyKeyword: 'arts' },
  'su-archaeo': { universityId: '008', facultyKeyword: 'archaeolog' },
  'su-deco': { universityId: '008', facultyKeyword: 'decorat' },
  'su-paint': { universityId: '008', facultyKeyword: 'painting' },
  'su-eng': { universityId: '008', facultyKeyword: 'engineer' },
  'su-pharm': { universityId: '008', facultyKeyword: 'pharmac' },
  'su-sci': { universityId: '008', facultyKeyword: 'science' },
  'su-music': { universityId: '008', facultyKeyword: 'music' },
  'su-ict': { universityId: '008', facultyKeyword: 'information' },
  'su-mgmt': { universityId: '008', facultyKeyword: 'management' },

  // ── Srinakharinwirot University (009) ─────────────────────────────────────
  swu: '009', srinakharinwirot: '009', มศว: '009',
  'swu-med': { universityId: '009', facultyKeyword: 'medicine' },
  'swu-sci': { universityId: '009', facultyKeyword: 'science' },
  'swu-eng': { universityId: '009', facultyKeyword: 'engineer' },
  'swu-pharm': { universityId: '009', facultyKeyword: 'pharmac' },
  'swu-dent': { universityId: '009', facultyKeyword: 'dent' },
  'swu-nurs': { universityId: '009', facultyKeyword: 'nurs' },
  'swu-edu': { universityId: '009', facultyKeyword: 'educat' },
  'swu-arts': { universityId: '009', facultyKeyword: 'arts' },
  'swu-bus': { universityId: '009', facultyKeyword: 'business' },
  'swu-soc': { universityId: '009', facultyKeyword: 'social' },
  'swu-phyed': { universityId: '009', facultyKeyword: 'physical' },

  // ── Prince of Songkla University (010) ───────────────────────────────────
  psu: '010', 'prince of songkla': '010', songkla: '010', มอ: '010',
  psuic: { universityId: '010', facultyKeyword: 'international' },
  'psu-ic': { universityId: '010', facultyKeyword: 'international' },
  'psu-eng': { universityId: '010', facultyKeyword: 'engineer' },
  'psu-sci': { universityId: '010', facultyKeyword: 'science' },
  'psu-med': { universityId: '010', facultyKeyword: 'medicine' },
  'psu-dent': { universityId: '010', facultyKeyword: 'dent' },
  'psu-pharm': { universityId: '010', facultyKeyword: 'pharmac' },
  'psu-nurs': { universityId: '010', facultyKeyword: 'nurs' },
  'psu-law': { universityId: '010', facultyKeyword: 'law' },
  'psu-econ': { universityId: '010', facultyKeyword: 'econom' },
  'psu-ict': { universityId: '010', facultyKeyword: 'computing' },
  'psu-mgmt': { universityId: '010', facultyKeyword: 'management' },
  'psu-agro': { universityId: '010', facultyKeyword: 'agro' },
  'psu-env': { universityId: '010', facultyKeyword: 'environment' },

  // ── Maejo University (013) ────────────────────────────────────────────────
  mju: '013', maejo: '013', แม่โจ้: '013',

  // ── KMUTT (014) ───────────────────────────────────────────────────────────
  kmutt: '014', bangmod: '014', บางมด: '014',
  sit: { universityId: '014', facultyKeyword: 'information' },
  'kmutt-eng': { universityId: '014', facultyKeyword: 'engineer' },
  'kmutt-sci': { universityId: '014', facultyKeyword: 'science' },
  'kmutt-arch': { universityId: '014', facultyKeyword: 'architect' },
  'kmutt-ict': { universityId: '014', facultyKeyword: 'information' },
  fibo: { universityId: '014', facultyKeyword: 'robot' },
  gmi: { universityId: '014', facultyKeyword: 'management' },

  // ── KMUTNB (015) ──────────────────────────────────────────────────────────
  kmutnb: '015', พระนครเหนือ: '015',
  'kmutnb-eng': { universityId: '015', facultyKeyword: 'engineer' },
  'kmutnb-sci': { universityId: '015', facultyKeyword: 'science' },
  'kmutnb-ict': { universityId: '015', facultyKeyword: 'information' },
  'kmutnb-bus': { universityId: '015', facultyKeyword: 'business' },

  // ── KMITL (016) ───────────────────────────────────────────────────────────
  kmitl: '016', ladkrabang: '016', ลาดกระบัง: '016', สจล: '016',
  'kmitl-eng': { universityId: '016', facultyKeyword: 'engineer' },
  'kmitl-sci': { universityId: '016', facultyKeyword: 'science' },
  'kmitl-arch': { universityId: '016', facultyKeyword: 'architect' },
  'kmitl-ict': { universityId: '016', facultyKeyword: 'information' },
  'kmitl-agro': { universityId: '016', facultyKeyword: 'agro' },
  'kmitl-music': { universityId: '016', facultyKeyword: 'music' },
  'kmitl-med': { universityId: '016', facultyKeyword: 'medicine' },

  // ── Suranaree University of Technology (017) ──────────────────────────────
  sut: '017', suranaree: '017', มทส: '017',

  // ── Ubon Ratchathani University (018) ─────────────────────────────────────
  ubu: '018', ubon: '018', มอบ: '018',

  // ── Burapha University (019) ──────────────────────────────────────────────
  buu: '019', burapha: '019', มบ: '019',
  'buu-eng': { universityId: '019', facultyKeyword: 'engineer' },
  'buu-sci': { universityId: '019', facultyKeyword: 'science' },
  'buu-med': { universityId: '019', facultyKeyword: 'medicine' },
  'buu-edu': { universityId: '019', facultyKeyword: 'educat' },
  'buu-log': { universityId: '019', facultyKeyword: 'logistic' },

  // ── Naresuan University (020) ─────────────────────────────────────────────
  nu: '020', naresuan: '020', มน: '020',
  'nu-med': { universityId: '020', facultyKeyword: 'medicine' },
  'nu-eng': { universityId: '020', facultyKeyword: 'engineer' },
  'nu-sci': { universityId: '020', facultyKeyword: 'science' },
  'nu-pharm': { universityId: '020', facultyKeyword: 'pharmac' },
  'nu-dent': { universityId: '020', facultyKeyword: 'dent' },
  'nu-nurs': { universityId: '020', facultyKeyword: 'nurs' },
  'nu-law': { universityId: '020', facultyKeyword: 'law' },
  'nu-bus': { universityId: '020', facultyKeyword: 'business' },
  'nu-edu': { universityId: '020', facultyKeyword: 'educat' },
  'nu-arts': { universityId: '020', facultyKeyword: 'arts' },
  'nu-arch': { universityId: '020', facultyKeyword: 'architect' },
  'nu-agr': { universityId: '020', facultyKeyword: 'agricultur' },

  // ── Mahasarakham University (021) ─────────────────────────────────────────
  msu: '021', mahasarakham: '021', มมส: '021',

  // ── Thaksin University (022) ──────────────────────────────────────────────
  tsu: '022', thaksin: '022', มทษ: '022',

  // ── Walailak University (023) ─────────────────────────────────────────────
  wu: '023', walailak: '023', มวล: '023',

  // ── Mae Fah Luang University (024) ────────────────────────────────────────
  mfu: '024', 'mae fah luang': '024', มฟล: '024',
  'mfu-med': { universityId: '024', facultyKeyword: 'medicine' },
  'mfu-sci': { universityId: '024', facultyKeyword: 'science' },
  'mfu-ict': { universityId: '024', facultyKeyword: 'information' },
  'mfu-law': { universityId: '024', facultyKeyword: 'law' },
  'mfu-mgmt': { universityId: '024', facultyKeyword: 'management' },
  'mfu-cos': { universityId: '024', facultyKeyword: 'cosmet' },

  // ── Nakhon Phanom University (026) ────────────────────────────────────────
  npu: '026', 'nakhon phanom': '026',

  // ── University of Phayao (027) ────────────────────────────────────────────
  up: '027', phayao: '027', มพ: '027',

  // ── Kalasin University (028) ──────────────────────────────────────────────
  ksu: '028', kalasin: '028',

  // ── Chulabhorn Royal Academy (032) ───────────────────────────────────────
  cra: '032', chulabhorn: '032', จุฬาภรณ์: '032',

  // ── Ramkhamhaeng University (034) ────────────────────────────────────────
  ru: '034', ramkhamhaeng: '034', ราม: '034', มร: '034',

  // ── Bangkok University (051) ──────────────────────────────────────────────
  bu: '051', 'bangkok university': '051', มกท: '051',
  'bu-bus': { universityId: '051', facultyKeyword: 'business' },
  'bu-comm': { universityId: '051', facultyKeyword: 'communication' },
  'bu-eng': { universityId: '051', facultyKeyword: 'engineer' },
  'bu-acc': { universityId: '051', facultyKeyword: 'account' },
  'bu-ict': { universityId: '051', facultyKeyword: 'information' },
  'bu-arch': { universityId: '051', facultyKeyword: 'architect' },
  'bu-arts': { universityId: '051', facultyKeyword: 'arts' },
  'bu-law': { universityId: '051', facultyKeyword: 'law' },

  // ── Sripatum University (054) ─────────────────────────────────────────────
  spu: '054', sripatum: '054',
  'spu-bus': { universityId: '054', facultyKeyword: 'business' },
  'spu-ict': { universityId: '054', facultyKeyword: 'information' },
  'spu-law': { universityId: '054', facultyKeyword: 'law' },
  'spu-arch': { universityId: '054', facultyKeyword: 'architect' },
  'spu-eng': { universityId: '054', facultyKeyword: 'engineer' },

  // ── University of the Thai Chamber of Commerce (056) ─────────────────────
  utcc: '056', utk: '056', 'thai chamber': '056',

  // ── Mahanakorn University of Technology (061) ────────────────────────────
  mut: '061', mahanakorn: '061',

  // ── Rangsit University (068) ──────────────────────────────────────────────
  rsu: '068', rangsit: '068', มรส: '068',
  'rsu-med': { universityId: '068', facultyKeyword: 'medicine' },
  'rsu-pharm': { universityId: '068', facultyKeyword: 'pharmac' },
  'rsu-dent': { universityId: '068', facultyKeyword: 'dent' },
  'rsu-nurs': { universityId: '068', facultyKeyword: 'nurs' },
  'rsu-eng': { universityId: '068', facultyKeyword: 'engineer' },
  'rsu-bus': { universityId: '068', facultyKeyword: 'business' },
  'rsu-ict': { universityId: '068', facultyKeyword: 'information' },
  'rsu-law': { universityId: '068', facultyKeyword: 'law' },
  'rsu-arts': { universityId: '068', facultyKeyword: 'arts' },
  'rsu-comm': { universityId: '068', facultyKeyword: 'communication' },
  'rsu-arch': { universityId: '068', facultyKeyword: 'architect' },
  'rsu-aviation': { universityId: '068', facultyKeyword: 'aviation' },
  'rsu-sport': { universityId: '068', facultyKeyword: 'sport' },

  // ── Huachiew Chalermprakiet University (073) ──────────────────────────────
  hcu: '073', huachiew: '073',

  // ── Dhurakij Pundit University (103) ─────────────────────────────────────
  dpu: '103', dhurakij: '103',

  // ── Suan Dusit University (165) ───────────────────────────────────────────
  sdu: '165', 'suan dusit': '165', สวนดุสิต: '165', มสด: '165',

  // ── Suan Sunandha Rajabhat University (166) ───────────────────────────────
  ssru: '166', 'suan sunandha': '166', สวนสุนันทา: '166',

  // ── Rajamangala Universities (191-199) ────────────────────────────────────
  // Use verified API IDs: RMUTT=191, RMUTK=192, RMUTE=193, RMUTP=194,
  //                       RMUTR=195, RMUTL=196, RMUTS=197, RMUTI=199
  rmutt: '191', 'rmut thanyaburi': '191', ธัญบุรี: '191',
  rmutk: '192', 'rmut krungthep': '192', 'rmut bangkok': '192',
  rmute: '193', 'rmut tawan-ok': '193', 'rmut east': '193',
  rmutp: '194', 'rmut phra nakhon': '194',
  rmutr: '195', 'rmut rattanakosin': '195', รัตนโกสินทร์: '195',
  rmutl: '196', 'rmut lanna': '196', ล้านนา: '196',
  rmuts: '197', 'rmut srivijaya': '197', ศรีวิชัย: '197',
  rmuti: '199', 'rmut isan': '199', อีสาน: '199',
  rmut: '191', // default to Thanyaburi when unspecified

  // ── Navamindradhiraj University (216) ─────────────────────────────────────
  nmu: '216', navamindra: '216', นวมินทราธิราช: '216',

  // ── Panyapiwat Institute of Management / PIM (918) ────────────────────────
  pim: '918', panyapiwat: '918',

  // ── Rajapruk University (919) ─────────────────────────────────────────────
  rpu: '919', rajapruk: '919',

  // ── Assumption University (921) ───────────────────────────────────────────
  au: '921', abac: '921', assumption: '921', อัสสัมชัญ: '921',
  'au-bus': { universityId: '921', facultyKeyword: 'business' },
  'au-eng': { universityId: '921', facultyKeyword: 'engineer' },
  'au-comm': { universityId: '921', facultyKeyword: 'communication' },
  'au-law': { universityId: '921', facultyKeyword: 'law' },
  'au-nurs': { universityId: '921', facultyKeyword: 'nurs' },
  'au-sci': { universityId: '921', facultyKeyword: 'science' },
  'au-arch': { universityId: '921', facultyKeyword: 'architect' },

  // ── Payap University (912) ────────────────────────────────────────────────
  pyu: '912', payap: '912', พายัพ: '912',

  // ── Nation University (905) ───────────────────────────────────────────────
  nation: '905',

  // ── Rajabhat Universities ─────────────────────────────────────────────────
  // Verified IDs from myTCAS API
  // Bangkok group
  bsru: '174',  'bansomdej': '174',
  crru: '177',  chandrakasem: '177',
  pnru: '150',  phranakhon: '150',
  nrru: '148',  'nakhon ratchasima rajabhat': '148',
  cmru: '144',  'chiang mai rajabhat': '144',
  dru: '146',   dhonburi: '146',
  psru: '152',  pibulsongkram: '152',
  vru: '153',   valaya: '153',
  skru: '164',  'songkhla rajabhat': '164',
  ubru: '171',  'ubon rajabhat': '171',
  pbru: '179',  phetchaburi: '179',
  cpru: '142',  chaiyaphum: '142',
};

/**
 * Resolve a query string to an alias target, if any.
 * Returns null if the query doesn't match any alias.
 */
function resolveAlias(query: string): AliasTarget | null {
  return UNIVERSITY_ALIASES[query.trim().toLowerCase()] ?? null;
}

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
    const alias = resolveAlias(query);
    if (alias) {
      // Exact alias match: filter by university and optional faculty keyword
      if (typeof alias === 'string') {
        results = results.filter((p) => p.universityId === alias);
      } else {
        results = results.filter((p) => p.universityId === alias.universityId);
        if (alias.programKeyword) {
          const kw = alias.programKeyword.toLowerCase();
          results = results.filter(
            (p) =>
              p.programNameEn?.toLowerCase().includes(kw) ||
              p.programNameTh?.toLowerCase().includes(kw)
          );
        } else if (alias.facultyKeyword) {
          const kw = alias.facultyKeyword.toLowerCase();
          results = results.filter(
            (p) =>
              p.facultyNameEn?.toLowerCase().includes(kw) ||
              p.facultyNameTh?.toLowerCase().includes(kw) ||
              p.programNameEn?.toLowerCase().includes(kw) ||
              p.programNameTh?.toLowerCase().includes(kw)
          );
        }
      }
      // Sort alias results by faculty then program name
      results = [...results].sort((a, b) => {
        const fc = compareThai(a.facultyNameTh, b.facultyNameTh);
        return fc !== 0 ? fc : compareThai(a.programNameTh, b.programNameTh);
      });
    } else {
      const fuse = getFuseInstance(results);
      const searchResults = fuse.search(query.trim());
      results = searchResults.map((result) => result.item);
    }
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

/**
 * Group already-filtered programs by faculty + campus for university-only browsing.
 */
export function groupProgramsByFacultyCampus(
  programs: TcasProgram[]
): TcasFacultyProgramGroup[] {
  const groups = new Map<string, TcasFacultyProgramGroup>();

  programs.forEach((program) => {
    const campusKey = (program.campusNameTh || program.campusNameEn || '').trim().toLowerCase();
    const groupKey = `${program.universityId}:${program.facultyId}:${campusKey}`;

    const existing = groups.get(groupKey);
    if (existing) {
      existing.programs.push(program);
      return;
    }

    groups.set(groupKey, {
      groupKey,
      universityId: program.universityId,
      facultyId: program.facultyId,
      facultyNameTh: program.facultyNameTh,
      facultyNameEn: program.facultyNameEn,
      campusNameTh: program.campusNameTh,
      campusNameEn: program.campusNameEn,
      programs: [program],
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      programs: [...group.programs].sort((a, b) => {
        const byProgram = compareThai(a.programNameTh, b.programNameTh);
        if (byProgram !== 0) return byProgram;

        const byMajor = compareThai(a.majorNameTh ?? '', b.majorNameTh ?? '');
        if (byMajor !== 0) return byMajor;

        return compareThai(a.fieldNameTh, b.fieldNameTh);
      }),
    }))
    .sort((a, b) => {
      const byFaculty = compareThai(a.facultyNameTh, b.facultyNameTh);
      if (byFaculty !== 0) return byFaculty;

      return compareThai(a.campusNameTh, b.campusNameTh);
    });
}

// ============================================================================
// Filter Options Extraction
// ============================================================================

/**
 * University popularity ranking order based on QS/THE rankings, TCAS applicant preferences,
 * and general prestige (as of 2025-2026).
 * Lower rank number = more popular/prestigious.
 * Universities not in this map will be sorted alphabetically at the end.
 */
const UNIVERSITY_POPULARITY_RANK: Record<string, number> = {
  // Tier 1: Top National Universities (QS/THE Top Rankings)
  '001': 1,   // Chulalongkorn - #1 in Thailand (QS Asia 2026)
  '006': 2,   // Mahidol - Top medical/science university
  '005': 3,   // Thammasat - Top law/political science/business
  '004': 4,   // Chiang Mai - Top regional university
  '002': 5,   // Kasetsart - Top agriculture/veterinary

  // Tier 2: Top Technical & Strong Regional Universities
  '014': 6,   // KMUTT (Bangmod) - Top technical university
  '016': 7,   // KMITL (Ladkrabang) - Top technical university
  '003': 8,   // Khon Kaen - Top northeastern university
  '010': 9,   // Prince of Songkla - Top southern university
  '015': 10,  // KMUTNB (Phra Nakhon Nuea) - Technical university

  // Tier 3: Established Public Universities
  '017': 11,  // Suranaree University of Technology
  '020': 12,  // Naresuan
  '008': 13,  // Silpakorn - Top arts/architecture
  '009': 14,  // Srinakharinwirot
  '019': 15,  // Burapha
  '021': 16,  // Mahasarakham
  '023': 17,  // Walailak
  '024': 18,  // Mae Fah Luang
  '018': 19,  // Ubon Ratchathani
  '013': 20,  // Maejo
  '022': 21,  // Thaksin
  '027': 22,  // University of Phayao
  '026': 23,  // Nakhon Phanom
  '028': 24,  // Kalasin

  // Tier 4: Specialized/Medical Universities
  '032': 25,  // Chulabhorn Royal Academy
  '216': 26,  // Navamindradhiraj University

  // Tier 5: Open Universities
  '034': 27,  // Ramkhamhaeng

  // Tier 6: Rajamangala Universities (Technical/Vocational)
  '191': 28,  // RMUTT (Thanyaburi)
  '192': 29,  // RMUTK (Krungthep)
  '194': 30,  // RMUTP (Phra Nakhon)
  '196': 31,  // RMUTL (Lanna)
  '193': 32,  // RMUTE (Tawan-ok)
  '195': 33,  // RMUTR (Rattanakosin)
  '197': 34,  // RMUTS (Srivijaya)
  '199': 35,  // RMUTI (Isan)

  // Tier 7: Rajabhat Universities (Regional Teacher Training)
  '150': 36,  // Phranakhon Rajabhat
  '177': 37,  // Chandrakasem Rajabhat
  '174': 38,  // Bansomdej Rajabhat
  '144': 39,  // Chiang Mai Rajabhat
  '148': 40,  // Nakhon Ratchasima Rajabhat
  '152': 41,  // Pibulsongkram Rajabhat
  '164': 42,  // Songkhla Rajabhat
  '171': 43,  // Ubon Rajabhat
  '146': 44,  // Dhonburi Rajabhat
  '153': 45,  // Valaya Alongkorn Rajabhat
  '179': 46,  // Phetchaburi Rajabhat
  '142': 47,  // Chaiyaphum Rajabhat

  // Tier 8: Top Private Universities
  '921': 48,  // Assumption University (ABAC)
  '051': 49,  // Bangkok University
  '068': 50,  // Rangsit University

  // Tier 9: Other Private Universities
  '054': 51,  // Sripatum
  '056': 52,  // UTCC (University of the Thai Chamber of Commerce)
  '103': 53,  // Dhurakij Pundit
  '912': 54,  // Payap
  '061': 55,  // Mahanakorn University of Technology
  '073': 56,  // Huachiew Chalermprakiet
  '918': 57,  // Panyapiwat Institute of Management (PIM)
  '919': 58,  // Rajapruk University
  '905': 59,  // Nation University

  // Tier 10: Other Universities
  '165': 60,  // Suan Dusit
  '166': 61,  // Suan Sunandha Rajabhat
};

/**
 * Extract unique universities for filter dropdown, sorted by popularity/prestige
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
    .sort((a, b) => {
      const rankA = UNIVERSITY_POPULARITY_RANK[a.key] ?? 9999;
      const rankB = UNIVERSITY_POPULARITY_RANK[b.key] ?? 9999;

      // Sort by popularity rank first
      if (rankA !== rankB) {
        return rankA - rankB;
      }

      // If both have the same rank (or both unranked), sort alphabetically by Thai name
      return a.label.localeCompare(b.label, 'th');
    });
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
  // Key by normalized English name to deduplicate same-named faculties under different IDs
  const uniqueFaculties = new Map<string, TcasFaculty>();

  programs
    .filter((p) => p.universityId === universityId)
    .forEach((program) => {
      const key = (program.facultyNameEn ?? program.facultyNameTh ?? program.facultyId)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
      if (!uniqueFaculties.has(key)) {
        uniqueFaculties.set(key, {
          universityId: program.universityId,
          facultyId: program.facultyId,
          nameTh: program.facultyNameTh,
          nameEn: program.facultyNameEn,
        });
      }
    });

  // Sort by English name since Thai names are absent in the API data
  return Array.from(uniqueFaculties.values()).sort((a, b) =>
    compareEnglish(a.nameEn ?? a.nameTh ?? '', b.nameEn ?? b.nameTh ?? '')
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

  // Match by normalized faculty name to catch same-named faculties under different IDs
  const targetFaculty = programs.find(
    (p) => p.universityId === universityId && p.facultyId === facultyId
  );
  const targetName = targetFaculty
    ? (targetFaculty.facultyNameEn ?? targetFaculty.facultyNameTh ?? facultyId)
        .trim().toLowerCase().replace(/\s+/g, ' ')
    : null;

  programs
    .filter((p) => {
      if (p.universityId !== universityId) return false;
      if (!targetName) return p.facultyId === facultyId;
      const name = (p.facultyNameEn ?? p.facultyNameTh ?? p.facultyId)
        .trim().toLowerCase().replace(/\s+/g, ' ');
      return name === targetName;
    })
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
    compareEnglish(a.nameEn ?? a.nameTh ?? '', b.nameEn ?? b.nameTh ?? '')
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
  const targetFaculty = programs.find(
    (p) => p.universityId === universityId && p.facultyId === facultyId
  );
  const targetName = targetFaculty
    ? (targetFaculty.facultyNameEn ?? targetFaculty.facultyNameTh ?? facultyId)
        .trim().toLowerCase().replace(/\s+/g, ' ')
    : null;

  return programs
    .filter((p) => {
      if (p.universityId !== universityId || p.fieldId !== fieldId) return false;
      if (!targetName) return p.facultyId === facultyId;
      const name = (p.facultyNameEn ?? p.facultyNameTh ?? p.facultyId)
        .trim().toLowerCase().replace(/\s+/g, ' ');
      return name === targetName;
    })
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
