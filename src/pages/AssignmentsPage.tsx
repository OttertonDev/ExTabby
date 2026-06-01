import { AnimatePresence, motion } from 'framer-motion';
import {
  MaterialSymbol,
  TabbyEmptyState,
  TabbyPageHeader,
  TabbySection,
} from '@/components/tabby/TabbyPrimitives';
import { useTasks } from '@/hooks/useFirestoreSync';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

function formatDate(timestamp: number) {
  if (!timestamp) return 'No due date';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function priorityLabel(priority: number) {
  switch (priority) {
    case 2:
      return 'High';
    case 1:
      return 'Medium';
    case 0:
      return 'Low';
    default:
      return 'Normal';
  }
}

function TaskRow({ task, completedView = false }: { task: ReturnType<typeof useTasks>['tasks'][0]; completedView?: boolean }) {
  const isExam = task.type === 'exam';

  return (
    <motion.div
      variants={itemVariants}
      className="border-b border-border/20 px-4 py-4 last:border-b-0"
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-background/70 text-primary">
          <MaterialSymbol name={task.isComplete ? 'check_circle' : isExam ? 'quiz' : 'assignment'} className="text-[1.25rem]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`truncate text-title-medium font-black ${task.isComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {task.title}
            </h3>
            <span className="rounded-full bg-tabby-mint px-2.5 py-1 text-xs font-black text-primary">
              {isExam ? 'Exam' : 'Homework'}
            </span>
            <span className="rounded-full bg-background/70 px-2.5 py-1 text-xs font-black text-muted-foreground">
              {task.isComplete ? 'Done' : 'To do'}
            </span>
          </div>
          {task.notes && (
            <p className="mt-1 line-clamp-2 text-body-small text-muted-foreground">{task.notes}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-small text-muted-foreground">
            <span>{formatDate(task.dueAtMillis)}</span>
            <span>Priority {priorityLabel(task.priority)}</span>
            {task.reminderMinutesBefore ? <span>Reminder {task.reminderMinutesBefore} min before</span> : null}
          </div>
        </div>
        {completedView && <span className="sr-only">Completed assignment</span>}
      </div>
    </motion.div>
  );
}

export function AssignmentsPage() {
  const { tasks, loading } = useTasks();
  const pendingTasks = tasks.filter((task) => !task.isComplete);
  const completedTasks = tasks.filter((task) => task.isComplete);

  return (
    <motion.div
      className="h-full overflow-auto px-4 py-5 sm:px-6"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="mx-auto max-w-4xl">
        <TabbyPageHeader
          title="Assignments"
          subtitle="Homework and exams synced from Android Tabby."
          symbol="assignment"
          shape="ghost"
        />

        {loading ? (
          <TabbyEmptyState title="Loading assignments" body="Tabby is checking your synced work." compact />
        ) : tasks.length === 0 ? (
          <TabbyEmptyState
            title="No assignments yet"
            body="Create homework or exams in your Android app and enable Web Tabby sync to see them here."
          />
        ) : (
          <div className="space-y-7">
            {pendingTasks.length > 0 && (
              <TabbySection title={`Pending (${pendingTasks.length})`}>
                <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.04 }}>
                  <AnimatePresence>
                    {pendingTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </TabbySection>
            )}

            {completedTasks.length > 0 && (
              <TabbySection title={`Completed (${completedTasks.length})`}>
                <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.04 }}>
                  <AnimatePresence>
                    {completedTasks.map((task) => (
                      <TaskRow key={task.id} task={task} completedView />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </TabbySection>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
