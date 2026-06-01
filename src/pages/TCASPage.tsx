import { motion } from 'framer-motion';
import { MaterialSymbol, TabbyPageHeader, TabbySection } from '@/components/tabby/TabbyPrimitives';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const tcasRounds = [
  {
    id: 1,
    name: 'TCAS Round 1',
    nameEn: 'Portfolio',
    status: 'completed',
    deadline: '2025-11-15',
    choices: [
      { university: 'Chulalongkorn University', faculty: 'Engineering', program: 'Computer Engineering', status: 'accepted' },
      { university: 'Mahidol University', faculty: 'Science', program: 'Computer Science', status: 'pending' },
    ],
  },
  {
    id: 2,
    name: 'TCAS Round 2',
    nameEn: 'Quota',
    status: 'active',
    deadline: '2025-12-20',
    choices: [
      { university: 'Kasetsart University', faculty: 'Engineering', program: 'Software Engineering', status: 'pending' },
    ],
  },
  {
    id: 3,
    name: 'TCAS Round 3',
    nameEn: 'Admission',
    status: 'upcoming',
    deadline: '2026-02-15',
    choices: [],
  },
  {
    id: 4,
    name: 'TCAS Round 4',
    nameEn: 'Direct Admission',
    status: 'upcoming',
    deadline: '2026-04-30',
    choices: [],
  },
];

function statusTone(status: string) {
  switch (status) {
    case 'completed':
    case 'accepted':
      return 'bg-tabby-mint text-primary';
    case 'active':
    case 'pending':
      return 'bg-secondary/25 text-foreground';
    default:
      return 'bg-background/70 text-muted-foreground';
  }
}

function statusSymbol(status: string) {
  switch (status) {
    case 'completed':
    case 'accepted':
      return 'check_circle';
    case 'active':
    case 'pending':
      return 'schedule';
    default:
      return 'info';
  }
}

export function TCASPage() {
  return (
    <motion.div
      className="h-full overflow-auto px-4 py-5 sm:px-6"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="mx-auto max-w-5xl">
        <TabbyPageHeader
          title="TCAS"
          subtitle="Road to University. This web view is styled after Android Tabby; real public myTCAS data is a future implementation."
          symbol="school"
          shape="gem"
        />

        <div className="mb-6 rounded-[1.5rem] bg-tabby-mint px-5 py-4 text-body-medium text-primary ring-1 ring-primary/10">
          <span className="font-black">Preview data.</span> Android Tabby already has the real public TCAS data client and parser; this page still shows sample choices.
        </div>

        <div className="space-y-5">
          {tcasRounds.map((round) => (
            <motion.div
              key={round.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            >
              <TabbySection>
                <div className="px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`grid size-10 place-items-center rounded-full ${statusTone(round.status)}`}>
                        <MaterialSymbol name={statusSymbol(round.status)} className="text-[1.25rem]" />
                      </div>
                      <div>
                        <h3 className="text-title-large font-black text-foreground">{round.name}</h3>
                        <p className="text-body-small font-bold text-muted-foreground">{round.nameEn}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusTone(round.status)}`}>
                      {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-body-small text-muted-foreground">
                    <MaterialSymbol name="event" className="text-[1rem]" />
                    Deadline: {new Date(round.deadline).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  {round.choices.length > 0 ? (
                    <div className="mt-5 overflow-hidden rounded-[1.125rem] bg-background/65">
                      <p className="border-b border-border/20 px-4 py-3 text-body-small font-black text-muted-foreground">
                        Your Choices ({round.choices.length})
                      </p>
                      {round.choices.map((choice) => (
                        <div key={`${round.id}-${choice.university}-${choice.program}`} className="border-b border-border/20 px-4 py-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <MaterialSymbol name={statusSymbol(choice.status)} className="mt-0.5 text-[1.15rem] text-primary" />
                            <div>
                              <h4 className="font-black text-foreground">{choice.university}</h4>
                              <p className="text-body-small text-muted-foreground">{choice.faculty}</p>
                              <p className="text-body-small text-muted-foreground">{choice.program}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.125rem] bg-background/65 px-4 py-6 text-center text-body-small text-muted-foreground">
                      No choices added yet.
                    </div>
                  )}
                </div>
              </TabbySection>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
