import test from 'node:test';
import assert from 'node:assert/strict';
import type { TcasProgram } from '@/types/tcas';
import { fetchWithRetry } from './tcasClient';
import { normalizeExternalUrl, parseProgram, parseRoundProject } from './tcasParser';
import { filterPrograms, getFieldOptions, groupRoundsByNumber } from './tcasSearch';

function makeProgram(overrides: Partial<TcasProgram>): TcasProgram {
  return {
    programId: 'program-1',
    universityId: 'u1',
    universityNameTh: 'University One',
    universityNameEn: 'University One',
    campusNameTh: 'Main',
    campusNameEn: 'Main',
    facultyId: 'f1',
    facultyNameTh: 'Faculty',
    facultyNameEn: 'Faculty',
    groupFieldId: 'g1',
    groupFieldTh: 'Group',
    fieldId: '01',
    fieldNameTh: 'Field',
    fieldNameEn: 'Field',
    programNameTh: 'Program',
    programNameEn: 'Program',
    programTypeNameTh: 'Bachelor',
    cost: null,
    graduateRate: null,
    employmentRate: null,
    medianSalary: null,
    ...overrides,
  };
}

test('parseProgram normalizes placeholder values', () => {
  const program = parseProgram({
    program_id: 'p1',
    university_id: 'u1',
    university_name_th: 'Test University',
    university_name_en: '',
    campus_name_th: '-',
    campus_name_en: '0',
    faculty_id: 'f1',
    faculty_name_th: 'Science',
    faculty_name_en: null,
    group_field_id: 'g1',
    group_field_th: 'Sciences',
    field_id: '01',
    field_name_th: 'Physics',
    field_name_en: null,
    program_name_th: 'Physics',
    program_name_en: '',
    program_type_name_th: 'Bachelor',
    cost: '-',
    graduate_rate: '0',
    employment_rate: '',
    median_salary: '24000',
  });

  assert.equal(program.universityNameEn, 'Not specified');
  assert.equal(program.campusNameTh, 'Not specified');
  assert.equal(program.cost, null);
  assert.equal(program.graduateRate, null);
  assert.equal(program.employmentRate, null);
  assert.equal(program.medianSalary, '24000');
});

test('field filtering uses short English labels without visible duplicates', () => {
  const programs = [
    makeProgram({
      programId: 'a',
      groupFieldId: 'g1',
      fieldId: '01',
      fieldNameTh: 'แพทยศาสตร์',
      fieldNameEn: 'Medicine',
    }),
    makeProgram({
      programId: 'b',
      groupFieldId: 'g2',
      fieldId: '01',
      fieldNameTh: 'แพทยศาสตร์',
      fieldNameEn: 'Medicine',
    }),
    makeProgram({
      programId: 'c',
      groupFieldId: 'g3',
      fieldId: '02',
      fieldNameTh: 'วิทยาการคอมพิวเตอร์',
      fieldNameEn: 'Computer Science',
    }),
  ];

  const options = getFieldOptions(programs);
  const results = filterPrograms(programs, '', { fieldId: 'medicine' });

  assert.deepEqual(options.map((option) => option.label), ['Computer Science', 'Medicine']);
  assert.deepEqual(results.map((program) => program.programId), ['a', 'b']);
});

test('round grouping ignores malformed round numbers', () => {
  const valid = parseRoundProject({
    project_id: 'r1',
    project_name_th: 'Round 1 project',
    type: '1_2569',
    receive_student_number: '12',
    min_gpax: '2.5',
    score_conditions: null,
    scores: { TGAT: '30', TPAT: '-' },
    description: '-',
    condition: '',
    link: 'www.example.com',
  });
  const invalid = parseRoundProject({
    project_id: 'rX',
    project_name_th: 'Broken project',
    type: 'special',
    receive_student_number: 4,
    min_gpax: null,
    score_conditions: null,
    scores: null,
    description: '',
    condition: '',
    link: '/relative',
  });

  const groups = groupRoundsByNumber([valid, invalid]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0]?.roundNumber, 1);
  assert.equal(groups[0]?.totalSeats, 12);
  assert.equal(valid.minGpax, 2.5);
  assert.deepEqual(valid.scores, { TGAT: 30 });
  assert.equal(valid.link, 'https://www.example.com');
  assert.equal(invalid.link, null);
});

test('normalizeExternalUrl only keeps absolute http links', () => {
  assert.equal(normalizeExternalUrl('https://example.com/a'), 'https://example.com/a');
  assert.equal(normalizeExternalUrl('www.example.com/a'), 'https://www.example.com/a');
  assert.equal(normalizeExternalUrl('/local/path'), null);
  assert.equal(normalizeExternalUrl('-'), null);
});

test('fetchWithRetry does not retry 4xx responses', async () => {
  let calls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response('', { status: 403, statusText: 'Forbidden' });
  };

  try {
    await assert.rejects(() => fetchWithRetry('https://example.com/forbidden', 3, 0), {
      message: 'HTTP 403: Forbidden',
    });
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
