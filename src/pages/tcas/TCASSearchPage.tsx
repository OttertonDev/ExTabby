// Main TCAS Search Page - University browser and program search
// Reference: Tabby-Schedule/app/src/main/java/com/ottertondev/tabby/feature/road/RoadToUniversityRoute.kt

import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TabbyPageHeader, TabbySection, MaterialSymbol } from '@/components/tabby/TabbyPrimitives';
import { useTcasData, useTcasSearch } from '@/hooks/useTcas';
import {
  TcasListSkeleton,
  TcasEmptyState,
  TcasErrorCard,
  TcasSearchBar,
  TcasFilterChips,
  UniversityLogo,
} from '@/components/tcas/TcasComponents';
import type {
  TcasUniversity,
  TcasProgram,
  TcasFilterOption,
  TcasFacultyProgramGroup,
} from '@/types/tcas';

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

function UniversityListItem({
  university,
  search,
}: {
  university: TcasUniversity;
  search: string;
}) {
  return (
    <Link
      to={{ pathname: `/tcas/university/${encodeURIComponent(university.id)}`, search }}
      className="block"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3 border-b border-border/20 px-4 py-4 last:border-b-0 hover:bg-surface-variant/30"
        whileHover={{ x: 4, scale: 1.002 }}
        transition={expressiveTransition}
      >
        <UniversityLogo src={university.logoUrl} alt={university.nameTh} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-title-medium font-black text-foreground">
            {university.nameTh}
          </h3>
          <p className="truncate text-body-small text-muted-foreground">{university.nameEn}</p>
        </div>
        <MaterialSymbol name="chevron_right" className="text-[1.25rem] text-muted-foreground" />
      </motion.div>
    </Link>
  );
}

function ProgramSearchListItem({
  program,
  search,
  showLogo = true,
}: {
  program: TcasProgram;
  search: string;
  showLogo?: boolean;
}) {
  const detailParts = [program.facultyNameTh, program.fieldNameTh];
  if (program.majorNameTh) {
    detailParts.push(program.majorNameTh);
  }

  return (
    <Link
      to={{ pathname: `/tcas/program/${encodeURIComponent(program.programId)}`, search }}
      className="block"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-start gap-3 border-b border-border/20 px-4 py-4 last:border-b-0 hover:bg-surface-variant/30"
        whileHover={{ x: 4, scale: 1.002 }}
        transition={expressiveTransition}
      >
        {showLogo && (
          <UniversityLogo
            src={`https://assets.mytcas.com/i/logo/${program.universityId}.png`}
            alt={program.universityNameTh}
            size="md"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-title-medium font-black text-foreground">
            {program.programNameTh}
          </h3>
          <p className="mt-1 truncate text-body-small text-muted-foreground">
            {program.universityNameTh}
          </p>
          <p className="mt-0.5 truncate text-body-small text-muted-foreground">
            {detailParts.join(' · ')}
          </p>
        </div>
        <MaterialSymbol name="chevron_right" className="mt-1 text-[1.25rem] text-muted-foreground" />
      </motion.div>
    </Link>
  );
}

function FacultyGroupListItem({
  group,
  search,
}: {
  group: TcasFacultyProgramGroup;
  search: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const universityName = group.programs[0]?.universityNameTh ?? 'University';
  const campusLabel =
    group.campusNameTh !== 'Not specified' ? group.campusNameTh : group.campusNameEn;
  const majorLabel = group.programs.length === 1 ? 'major' : 'majors';

  return (
    <motion.div
      variants={itemVariants}
      className="border-b border-border/20 last:border-b-0"
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-surface-variant/30"
        aria-expanded={expanded}
      >
        <UniversityLogo
          src={`https://assets.mytcas.com/i/logo/${group.universityId}.png`}
          alt={universityName}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-title-medium font-black text-foreground">
            {group.facultyNameTh}
          </h3>
          <p className="mt-1 truncate text-body-small text-muted-foreground">
            {campusLabel} · {group.programs.length} {majorLabel}
          </p>
        </div>
        <MaterialSymbol
          name={expanded ? 'expand_less' : 'expand_more'}
          className="text-[1.25rem] text-muted-foreground"
        />
      </button>

      {expanded && (
        <div className="border-t border-border/15 bg-surface-variant/20">
          {group.programs.map((program) => (
            <ProgramSearchListItem
              key={program.programId}
              program={program}
              search={search}
              showLogo={false}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function FilterMenu({
  label,
  value,
  allLabel,
  options,
  open,
  onOpenChange,
  onChange,
}: {
  label: string;
  value: string;
  allLabel: string;
  options: TcasFilterOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
}) {
  const selectedLabel = options.find((option) => option.key === value)?.label ?? allLabel;

  return (
    <div className="min-w-0">
      <span className="mb-1.5 block text-body-small font-bold text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-full bg-surface-variant px-4 text-left text-body-medium font-bold text-foreground ring-1 ring-border/25 transition-colors hover:bg-surface-variant/75 focus:outline-none focus:ring-2 focus:ring-primary/45"
          aria-expanded={open}
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <MaterialSymbol
            name={open ? 'expand_less' : 'expand_more'}
            className="text-[1.25rem] text-muted-foreground"
          />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-[1rem] bg-background p-1 ring-1 ring-border/30 shadow-elevation-3">
            <button
              type="button"
              onClick={() => {
                onChange('');
                onOpenChange(false);
              }}
              className="flex w-full items-start rounded-xl px-3 py-2 text-left text-body-small font-bold text-foreground hover:bg-surface-variant"
            >
              {allLabel}
            </button>
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  onChange(option.key);
                  onOpenChange(false);
                }}
                className="flex w-full items-start rounded-xl px-3 py-2 text-left text-body-small font-bold text-foreground hover:bg-surface-variant"
              >
                <span className="line-clamp-2 min-w-0">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TCASPage() {
  const location = useLocation();
  const [openFilter, setOpenFilter] = useState<'university' | 'field' | null>(null);
  const { universities, programs, loading, error, refresh } = useTcasData();
  const {
    query,
    setQuery,
    filters,
    setFilters,
    clearFilters,
    searchResults,
    filterResults,
    groupedFilterResults,
    shouldGroupUniversityOnly,
    universityOptions,
    fieldOptions,
    hasActiveFilters,
  } = useTcasSearch(programs);

  // Three mutually exclusive display modes
  const mode = query.trim() ? 'search' : hasActiveFilters ? 'filter' : 'universities';
  const selectedUniversity = filters.universityId ?? '';
  const selectedField = filters.fieldId ?? '';

  const filterChips = useMemo(() => {
    const chips = [];
    if (filters.universityId) {
      const option = universityOptions.find((o) => o.key === filters.universityId);
      if (option) {
        chips.push({
          label: option.label,
          onRemove: () => setFilters({ ...filters, universityId: null }),
        });
      }
    }
    if (filters.fieldId) {
      const option = fieldOptions.find((o) => o.key === filters.fieldId);
      if (option) {
        chips.push({
          label: option.label,
          onRemove: () => setFilters({ ...filters, fieldId: null }),
        });
      }
    }
    return chips;
  }, [filters, universityOptions, fieldOptions, setFilters]);

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
        <TabbyPageHeader
          title="TCAS"
          subtitle="Browse public university programs from myTCAS database."
          symbol="school"
          shape="gem"
          titleVariation='"wght" 1000, "wdth" 25, "ROND" 100'
        />

        <div className="mb-5">
          <TcasSearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search programs, universities, faculties..."
          />
        </div>

        <div className="mb-4 grid min-w-0 gap-3 md:grid-cols-2">
          <FilterMenu
            label="University"
            value={selectedUniversity}
            allLabel="All universities"
            options={universityOptions}
            open={openFilter === 'university'}
            onOpenChange={(open) => setOpenFilter(open ? 'university' : null)}
            onChange={(value) =>
              setFilters({
                universityId: value || null,
                fieldId: null,
              })
            }
          />
          <FilterMenu
            label="Field"
            value={selectedField}
            allLabel="All fields"
            options={fieldOptions}
            open={openFilter === 'field'}
            onOpenChange={(open) => setOpenFilter(open ? 'field' : null)}
            onChange={(value) =>
              setFilters({
                ...filters,
                fieldId: value || null,
              })
            }
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-4 flex items-center gap-3">
            <TcasFilterChips chips={filterChips} />
            <button
              onClick={clearFilters}
              className="text-sm font-bold text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {loading && (
          <TabbySection title="Loading...">
            <TcasListSkeleton count={8} />
          </TabbySection>
        )}

        {error && !loading && (
          <TcasErrorCard message={error} onRetry={refresh} />
        )}

        {!loading && !error && (
          <>
            {mode === 'universities' && (
              <TabbySection title={`Universities (${universities.length})`}>
                {universities.length === 0 ? (
                  <div className="px-4 py-8 text-center text-body-medium text-muted-foreground">
                    No universities found.
                  </div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    transition={{ staggerChildren: 0.03, delayChildren: 0.05 }}
                  >
                    <AnimatePresence>
                      {universities.map((university) => (
                        <UniversityListItem
                          key={university.id}
                          university={university}
                          search={location.search}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </TabbySection>
            )}

            {mode === 'search' && (
              <TabbySection title={`Search results (${searchResults.length})`}>
                {searchResults.length === 0 ? (
                  <div className="px-4 py-8">
                    <TcasEmptyState
                      title="No programs found"
                      body="Try a different search term."
                      icon="search_off"
                    />
                  </div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    transition={{ staggerChildren: 0.03, delayChildren: 0.05 }}
                  >
                    <AnimatePresence>
                      {searchResults.map((program) => (
                        <ProgramSearchListItem
                          key={program.programId}
                          program={program}
                          search={location.search}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </TabbySection>
            )}

            {mode === 'filter' && (
              <TabbySection
                title={
                  shouldGroupUniversityOnly
                    ? `Filtered faculties (${groupedFilterResults.length})`
                    : `Filtered programs (${filterResults.length})`
                }
              >
                {filterResults.length === 0 ? (
                  <div className="px-4 py-8">
                    <TcasEmptyState
                      title="No programs found"
                      body="Try adjusting your filters."
                      icon="search_off"
                    />
                  </div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    transition={{ staggerChildren: 0.03, delayChildren: 0.05 }}
                  >
                    <AnimatePresence>
                      {shouldGroupUniversityOnly
                        ? groupedFilterResults.map((group) => (
                          <FacultyGroupListItem
                            key={group.groupKey}
                            group={group}
                            search={location.search}
                          />
                        ))
                        : filterResults.map((program) => (
                          <ProgramSearchListItem
                            key={program.programId}
                            program={program}
                            search={location.search}
                          />
                        ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </TabbySection>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
