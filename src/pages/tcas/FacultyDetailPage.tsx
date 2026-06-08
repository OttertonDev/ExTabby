// Faculty Detail Page - Shows the list of fields within a faculty
// Reference: Tabby-Schedule RoadToUniversityRoute.kt (RoadFieldRoute)

import { useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TabbyPageHeader, TabbySection, MaterialSymbol } from '@/components/tabby/TabbyPrimitives';
import { useTcasData } from '@/hooks/useTcas';
import { TcasEmptyState, TcasErrorCard, TcasListSkeleton, UniversityLogo } from '@/components/tcas/TcasComponents';
import { getFacultiesForUniversity, getFieldsForFaculty, getProgramsForField } from '@/lib/tcas/tcasSearch';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

const expressiveTransition = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 26,
  mass: 1,
};

export function FacultyDetailPage() {
  const { universityId, facultyId } = useParams<{ universityId: string; facultyId: string }>();
  const location = useLocation();
  const { universities, programs, loading, error, refresh } = useTcasData();
  const university = universities.find((u) => u.id === universityId);

  const faculty = useMemo(() => {
    if (!universityId || !facultyId) return undefined;
    return getFacultiesForUniversity(programs, universityId).find((f) => f.facultyId === facultyId);
  }, [programs, universityId, facultyId]);

  const fields = useMemo(() => {
    if (!universityId || !facultyId) return [];
    return getFieldsForFaculty(programs, universityId, facultyId).map((field) => ({
      field,
      programCount: getProgramsForField(programs, universityId, facultyId, field.fieldId).length,
    }));
  }, [programs, universityId, facultyId]);

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
          to={{ pathname: `/tcas/university/${encodeURIComponent(universityId ?? '')}`, search: location.search }}
          className="mb-4 inline-flex items-center gap-1 text-body-medium text-primary hover:underline"
        >
          <MaterialSymbol name="arrow_back" className="text-[1.15rem]" />
          <span>Back to faculties</span>
        </Link>

        {loading && (
          <TabbySection title="Loading faculty...">
            <TcasListSkeleton count={6} />
          </TabbySection>
        )}

        {error && !loading && <TcasErrorCard message={error} onRetry={refresh} />}

        {!loading && !error && (!university || !faculty) && (
          <TcasErrorCard message="Faculty not found" />
        )}

        {!loading && !error && university && faculty && (
          <>
            <TabbyPageHeader
              title={faculty.nameTh}
              subtitle={`${faculty.nameEn} · ${university.nameTh}`}
              symbol="account_balance"
              shape="gem"
              action={<UniversityLogo src={university.logoUrl} alt={university.nameTh} size="lg" />}
            />

            {fields.length === 0 ? (
              <TcasEmptyState
                title="No fields found"
                body="This faculty has no public programs in the current TCAS dataset."
                icon="search_off"
              />
            ) : (
              <TabbySection title={`Fields (${fields.length})`}>
                <motion.div
                  initial="hidden"
                  animate="show"
                  transition={{ staggerChildren: 0.03, delayChildren: 0.05 }}
                >
                  <AnimatePresence>
                    {fields.map(({ field, programCount }) => (
                      <Link
                        key={`${field.groupFieldId}:${field.fieldId}`}
                        to={{
                          pathname: `/tcas/university/${encodeURIComponent(university.id)}/faculty/${encodeURIComponent(faculty.facultyId)}/field/${encodeURIComponent(field.fieldId)}`,
                          search: location.search,
                        }}
                        className="block"
                      >
                        <motion.div
                          variants={itemVariants}
                          className="flex items-center gap-3 border-b border-border/20 px-4 py-4 last:border-b-0 hover:bg-surface-variant/30"
                          whileHover={{ x: 4, scale: 1.002 }}
                          transition={expressiveTransition}
                        >
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-title-medium font-black text-foreground">
                              {field.nameTh}
                            </h3>
                            <p className="truncate text-body-small text-muted-foreground">
                              {field.nameEn}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-tabby-mint px-3 py-1 text-xs font-black text-primary">
                            {programCount}
                          </span>
                          <MaterialSymbol name="chevron_right" className="text-[1.25rem] text-muted-foreground" />
                        </motion.div>
                      </Link>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </TabbySection>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
