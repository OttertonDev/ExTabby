// Main TCAS Search Page - University browser and program search
// Reference: Tabby-Schedule/app/src/main/java/com/ottertondev/tabby/feature/road/RoadToUniversityRoute.kt

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
import type { TcasUniversity, TcasProgram } from '@/types/tcas';

// ============================================================================
// Page Animations
// ============================================================================

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

// ============================================================================
// University List Item
// ============================================================================

function UniversityListItem({ university }: { university: TcasUniversity }) {
  return (
    <Link
      to={`/tcas/university/${university.id}`}
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

// ============================================================================
// Program Search Result Item
// ============================================================================

function ProgramSearchListItem({ program }: { program: TcasProgram }) {
  return (
    <Link
      to={`/tcas/program/${program.programId}`}
      className="block"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-start gap-3 border-b border-border/20 px-4 py-4 last:border-b-0 hover:bg-surface-variant/30"
        whileHover={{ x: 4, scale: 1.002 }}
        transition={expressiveTransition}
      >
        <UniversityLogo
          src={`https://assets.mytcas.com/i/logo/${program.universityId}.png`}
          alt={program.universityNameTh}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-title-medium font-black text-foreground">
            {program.programNameTh}
          </h3>
          <p className="mt-1 truncate text-body-small text-muted-foreground">
            {program.universityNameTh}
          </p>
          <p className="mt-0.5 truncate text-body-small text-muted-foreground">
            {program.facultyNameTh} · {program.fieldNameTh}
          </p>
        </div>
        <MaterialSymbol name="chevron_right" className="mt-1 text-[1.25rem] text-muted-foreground" />
      </motion.div>
    </Link>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TCASPage() {
  const { universities, programs, loading, error, refresh } = useTcasData();
  const {
    query,
    setQuery,
    filters,
    setFilters,
    clearFilters,
    results,
    universityOptions,
    fieldOptions,
    hasActiveFilters,
  } = useTcasSearch(programs);

  // Show university list when no query
  const showUniversityList = !query.trim() && !hasActiveFilters;

  // Build filter chips
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

        {/* Search Bar */}
        <div className="mb-5">
          <TcasSearchBar
            value={query}
            onChange={setQuery}
            placeholder="ค้นหาสาขาวิชา, มหาวิทยาลัย, คณะ..."
          />
        </div>

        {/* Filter Chips */}
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

        {/* Loading State */}
        {loading && (
          <TabbySection title="Loading...">
            <TcasListSkeleton count={8} />
          </TabbySection>
        )}

        {/* Error State */}
        {error && !loading && (
          <TcasErrorCard message={error} onRetry={refresh} />
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {showUniversityList ? (
              // University List View
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
                        <UniversityListItem key={university.id} university={university} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </TabbySection>
            ) : (
              // Search Results View
              <TabbySection title={`Programs (${results.length})`}>
                {results.length === 0 ? (
                  <div className="px-4 py-8">
                    <TcasEmptyState
                      title="No programs found"
                      body="Try adjusting your search query or filters."
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
                      {results.map((program) => (
                        <ProgramSearchListItem key={program.programId} program={program} />
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
