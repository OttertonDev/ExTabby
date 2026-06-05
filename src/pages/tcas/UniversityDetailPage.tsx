// University Detail Page - Shows faculties for a university
// Placeholder implementation - shows message that hierarchical navigation coming soon

import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TabbyPageHeader, MaterialSymbol } from '@/components/tabby/TabbyPrimitives';
import { useTcasData } from '@/hooks/useTcas';
import { TcasEmptyState } from '@/components/tcas/TcasComponents';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function UniversityDetailPage() {
  const { universityId } = useParams<{ universityId: string }>();
  const { universities } = useTcasData();
  const university = universities.find((u) => u.id === universityId);

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
          to="/tcas"
          className="mb-4 inline-flex items-center gap-1 text-body-medium text-primary hover:underline"
        >
          <MaterialSymbol name="arrow_back" className="text-[1.15rem]" />
          <span>Back to TCAS</span>
        </Link>

        {university && (
          <TabbyPageHeader
            title={university.nameTh}
            subtitle={university.nameEn}
            symbol="school"
            shape="gem"
          />
        )}

        <TcasEmptyState
          title="Hierarchical Navigation Coming Soon"
          body="Direct program search is available now. Use the search bar on the main TCAS page to find programs by name, university, or field."
          icon="construction"
        />
      </div>
    </motion.div>
  );
}
