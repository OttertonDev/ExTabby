import { motion } from 'framer-motion';
import { TabbyEmptyState } from '@/components/tabby/TabbyPrimitives';
import { WidgetGrid } from '@/components/home/WidgetGrid';
import { useClasses, useTasks, useUserPreferences } from '@/hooks/useFirestoreSync';
import { useNow } from '@/hooks/useNow';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function greeting(minuteOfDay: number): string {
  const hour = Math.floor(minuteOfDay / 60);
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomePage() {
  const { classes, loading: classesLoading } = useClasses();
  const { tasks, loading: tasksLoading } = useTasks();
  const { preferences, loading: prefsLoading } = useUserPreferences();
  const now = useNow();

  const loading = classesLoading || tasksLoading || prefsLoading;

  const d = new Date(now.millis);
  const dayLabel = `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
  const name = preferences?.profileName || preferences?.realName || '';

  return (
    <div className="h-full min-h-full overflow-auto pb-2 pl-12 pr-5 pt-9 sm:pr-8 sm:pt-9 lg:pr-[108px]">
      <div className="w-full max-w-3xl pb-4">
        {/* Greeting / day label header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          className="mb-6"
        >
          <p className="text-body-medium font-medium uppercase tracking-wide text-muted-foreground">
            {dayLabel}
          </p>
          <h2
            className="mt-1 font-display text-headline-large font-black leading-tight text-foreground"
            style={{ fontVariationSettings: '"wght" 1000, "ROND" 50' }}
          >
            {greeting(now.minuteOfDay)}{name ? `, ${name}` : ''}
          </h2>
        </motion.div>

        {/* Modules row — wraps to next line on narrow screens */}
        {loading ? (
          <TabbyEmptyState
            title="Loading your day"
            body="Tabby is pulling your synced classes and tasks."
            compact
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0, 0, 1], delay: 0.05 }}
            className="flex flex-wrap gap-6"
          >
            <WidgetGrid classes={classes} tasks={tasks} preferences={preferences} />
            {/* Future modules go here */}
          </motion.div>
        )}
      </div>
    </div>
  );
}
