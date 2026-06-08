// University Detail Page - Shows faculties, fields, and programs for a university

import { useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TabbyPageHeader, TabbySection, MaterialSymbol } from '@/components/tabby/TabbyPrimitives';
import { useTcasData } from '@/hooks/useTcas';
import { TcasEmptyState, TcasErrorCard, TcasListSkeleton, UniversityLogo } from '@/components/tcas/TcasComponents';
import {
  getFacultiesForUniversity,
  getFieldsForFaculty,
  getProgramsForField,
} from '@/lib/tcas/tcasSearch';
import type { TcasFaculty, TcasField, TcasProgram } from '@/types/tcas';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

interface FacultyGroup {
  faculty: TcasFaculty;
  fields: Array<{
    field: TcasField;
    programs: TcasProgram[];
  }>;
}

export function UniversityDetailPage() {
  const { universityId } = useParams<{ universityId: string }>();
  const location = useLocation();
  const { universities, programs, loading, error, refresh } = useTcasData();
  const university = universities.find((u) => u.id === universityId);

  const facultyGroups = useMemo<FacultyGroup[]>(() => {
    if (!universityId) return [];

    return getFacultiesForUniversity(programs, universityId).map((faculty) => ({
      faculty,
      fields: getFieldsForFaculty(programs, universityId, faculty.facultyId).map((field) => ({
        field,
        programs: getProgramsForField(programs, universityId, faculty.facultyId, field.fieldId),
      })),
    }));
  }, [programs, universityId]);

  return (
    <motion.div
      className="h-full min-h-full overflow-auto px-5 pb-2 pt-9 sm:px-8 sm:pt-9 lg:px-[108px]"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="w-full pb-4">
        <Link
          to={{ pathname: '/tcas', search: location.search }}
          className="mb-4 inline-flex items-center gap-1 text-body-medium text-primary hover:underline"
        >
          <MaterialSymbol name="arrow_back" className="text-[1.15rem]" />
          <span>Back to TCAS</span>
        </Link>

        {loading && (
          <TabbySection title="Loading university...">
            <TcasListSkeleton count={6} />
          </TabbySection>
        )}

        {error && !loading && (
          <TcasErrorCard message={error} onRetry={refresh} />
        )}

        {!loading && !error && !university && (
          <TcasErrorCard message="University not found" />
        )}

        {!loading && !error && university && (
          <>
            <TabbyPageHeader
              title={university.nameTh}
              subtitle={university.nameEn}
              symbol="school"
              shape="gem"
              action={<UniversityLogo src={university.logoUrl} alt={university.nameTh} size="lg" />}
            />

            {facultyGroups.length === 0 ? (
              <TcasEmptyState
                title="No programs found"
                body="This university is listed, but no public programs are available in the current TCAS dataset."
                icon="search_off"
              />
            ) : (
              <TabbySection title={`Faculties (${facultyGroups.length})`}>
                {facultyGroups.map(({ faculty, fields }) => (
                  <div key={faculty.facultyId} className="border-b border-border/20 px-4 py-5 last:border-b-0">
                    <h3 className="text-title-medium font-black text-foreground">{faculty.nameTh}</h3>
                    <p className="mt-1 text-body-small text-muted-foreground">{faculty.nameEn}</p>

                    <div className="mt-4 space-y-4">
                      {fields.map(({ field, programs: fieldPrograms }) => (
                        <div key={`${field.groupFieldId}:${field.fieldId}`} className="rounded-[1rem] bg-background/70 p-3 ring-1 ring-border/20">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="truncate text-body-large font-black text-foreground">
                                {field.nameTh}
                              </h4>
                              <p className="truncate text-body-small text-muted-foreground">
                                {field.nameEn}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-tabby-mint px-3 py-1 text-xs font-black text-primary">
                              {fieldPrograms.length}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {fieldPrograms.map((program) => (
                              <Link
                                key={program.programId}
                                to={{
                                  pathname: `/tcas/program/${encodeURIComponent(program.programId)}`,
                                  search: location.search,
                                }}
                                className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 text-body-medium text-foreground hover:bg-surface-variant/60"
                              >
                                <span className="line-clamp-2 font-bold">{program.programNameTh}</span>
                                <MaterialSymbol name="chevron_right" className="mt-0.5 text-[1.1rem] text-muted-foreground" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabbySection>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
