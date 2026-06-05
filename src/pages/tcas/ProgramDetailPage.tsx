// Program Detail Page - Shows program info and admission rounds
// Reference: Tabby-Schedule/app/src/main/java/com/ottertondev/tabby/feature/road/RoadProgramDetailRoute.kt

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TabbySection, MaterialSymbol } from '@/components/tabby/TabbyPrimitives';
import { useTcasData, useTcasProgramDetail } from '@/hooks/useTcas';
import {
  TcasListSkeleton,
  TcasErrorCard,
  TcasInfoRow,
  UniversityLogo,
} from '@/components/tcas/TcasComponents';
import type { TcasRoundProject } from '@/types/tcas';
import { TCAS_ROUND_COLORS } from '@/types/tcas';

// ============================================================================
// Page Animations
// ============================================================================

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

// ============================================================================
// Program Header
// ============================================================================

function ProgramHeader({ program }: { program: any }) {
  return (
    <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <UniversityLogo
        src={`https://assets.mytcas.com/i/logo/${program.universityId}.png`}
        alt={program.universityNameTh}
        size="lg"
      />
      <div className="min-w-0 flex-1">
        <h2 className="text-headline-large font-black leading-tight text-foreground">
          {program.programNameTh}
        </h2>
        <p className="mt-1 text-body-medium text-muted-foreground">
          {program.universityNameTh}
        </p>
        <p className="mt-0.5 text-body-small text-muted-foreground">
          {program.facultyNameTh} · {program.fieldNameTh}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Tab Navigation
// ============================================================================

interface TabButton {
  id: string;
  label: string;
  badge?: number;
}

function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: TabButton[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="mb-5 flex gap-2 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-variant text-muted-foreground hover:bg-surface-variant/70'
            }`}
          >
            {tab.badge !== undefined && (
              <span
                className="flex size-6 items-center justify-center rounded-full text-xs font-black"
                style={{
                  backgroundColor: tab.badge ? TCAS_ROUND_COLORS[tab.badge] : undefined,
                }}
              >
                {tab.badge}
              </span>
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Info Tab Content
// ============================================================================

function MainInfoTab({ program }: { program: any }) {
  return (
    <TabbySection>
      <TcasInfoRow label="Campus" value={program.campusNameTh} icon="location_on" />
      <TcasInfoRow label="Program Type" value={program.programTypeNameTh} icon="school" />
      <TcasInfoRow label="Tuition Cost" value={program.cost || 'N/A'} icon="payments" />
      <TcasInfoRow
        label="Graduate Rate"
        value={program.graduateRate || 'N/A'}
        icon="workspace_premium"
      />
      <TcasInfoRow
        label="Employment Rate"
        value={program.employmentRate || 'N/A'}
        icon="work"
      />
      <TcasInfoRow
        label="Median Salary"
        value={program.medianSalary || 'N/A'}
        icon="account_balance_wallet"
      />
    </TabbySection>
  );
}

// ============================================================================
// Round Project Item
// ============================================================================

function RoundProjectItem({ project }: { project: TcasRoundProject }) {
  return (
    <div className="border-b border-border/20 px-4 py-4 last:border-b-0">
      <h4 className="text-title-medium font-black text-foreground">{project.projectNameTh}</h4>

      <div className="mt-3 space-y-2 text-body-small">
        <div className="flex items-center gap-2">
          <MaterialSymbol name="group" className="text-[1rem] text-primary" />
          <span className="text-muted-foreground">Seats:</span>
          <span className="font-bold text-foreground">{project.seats} คน</span>
        </div>

        {project.minGpax !== null && (
          <div className="flex items-center gap-2">
            <MaterialSymbol name="school" className="text-[1rem] text-primary" />
            <span className="text-muted-foreground">Min GPAX:</span>
            <span className="font-bold text-foreground">{project.minGpax.toFixed(2)}</span>
          </div>
        )}

        {project.scores && Object.keys(project.scores).length > 0 && (
          <div className="mt-2">
            <p className="mb-1 font-bold text-muted-foreground">Score Requirements:</p>
            <div className="ml-6 space-y-1">
              {Object.entries(project.scores).map(([key, value]) => (
                <div key={key} className="text-foreground">
                  {key}: <span className="font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.condition && (
          <div className="mt-3 rounded-lg bg-surface-variant/50 p-3">
            <p className="text-body-small text-muted-foreground">{project.condition}</p>
          </div>
        )}

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
          >
            <span>More details</span>
            <MaterialSymbol name="open_in_new" className="text-[0.95rem]" />
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Round Tab Content
// ============================================================================

function RoundTab({ roundNumber, projects }: { roundNumber: number; projects: TcasRoundProject[] }) {
  if (projects.length === 0) {
    return (
      <TabbySection>
        <div className="px-4 py-8 text-center text-body-medium text-muted-foreground">
          No projects for this round.
        </div>
      </TabbySection>
    );
  }

  const totalSeats = projects.reduce((sum, p) => sum + p.seats, 0);

  return (
    <TabbySection title={`Total Seats: ${totalSeats} คน`}>
      {projects.map((project, index) => (
        <RoundProjectItem
          key={`round${roundNumber}-proj${index}`}
          project={project}
        />
      ))}
    </TabbySection>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProgramDetailPage() {
  const { programId } = useParams<{ programId: string }>();
  const { programs } = useTcasData();
  const { program, roundGroups, loading, error } = useTcasProgramDetail(programs, programId);
  const [activeTab, setActiveTab] = useState('info');

  // Build tabs
  const tabs: TabButton[] = [
    { id: 'info', label: 'Info' },
    ...roundGroups.map((group) => ({
      id: `round-${group.roundNumber}`,
      label: `รอบ ${group.roundNumber}`,
      badge: group.roundNumber,
    })),
  ];

  if (!program && !loading) {
    return (
      <motion.div
        className="h-full min-h-full overflow-auto px-5 pb-2 pt-9 sm:px-8 sm:pt-9 lg:px-[108px]"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <TcasErrorCard message="Program not found" />
      </motion.div>
    );
  }

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
        {/* Back Button */}
        <Link
          to="/tcas"
          className="mb-4 inline-flex items-center gap-1 text-body-medium text-primary hover:underline"
        >
          <MaterialSymbol name="arrow_back" className="text-[1.15rem]" />
          <span>Back to TCAS</span>
        </Link>

        {program && <ProgramHeader program={program} />}

        {loading ? (
          <TabbySection title="Loading rounds...">
            <TcasListSkeleton count={3} />
          </TabbySection>
        ) : error ? (
          <TcasErrorCard message={error} />
        ) : (
          <>
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'info' && program && <MainInfoTab program={program} />}

            {roundGroups.map((group) => {
              if (activeTab === `round-${group.roundNumber}`) {
                return (
                  <RoundTab
                    key={`round-tab-${group.roundNumber}`}
                    roundNumber={group.roundNumber}
                    projects={group.projects}
                  />
                );
              }
              return null;
            })}
          </>
        )}
      </div>
    </motion.div>
  );
}
