import { TabbyEmptyState, TabbyPageHeader, TabbySection } from '@/components/tabby/TabbyPrimitives';
import { useClasses, useUserPreferences } from '@/hooks/useFirestoreSync';
import { androidColorToHex, formatMinutes, tintFromHex } from '@/lib/tabby';
import { AssistChip } from '@/lib/material-web-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function classSupportingLine(cls: ReturnType<typeof useClasses>['classes'][0]): string {
  return [
    cls.subjectCode && !cls.subject.includes(cls.subjectCode) ? cls.subjectCode : '',
    cls.periodNumber ? `Period ${cls.periodNumber}` : '',
    [cls.room, cls.teacher].filter(Boolean).join(' with '),
  ].filter(Boolean).join(' · ') || 'No room or teacher set.';
}

export function TimetablePage() {
  const { classes, loading } = useClasses();
  const { preferences } = useUserPreferences();
  const metadata = [preferences?.schoolName, preferences?.classSection, preferences?.term]
    .filter(Boolean)
    .join(' · ');

  const classesByDay: Record<number, typeof classes> = {};
  classes.forEach((cls) => {
    if (!cls.isBreak) {
      classesByDay[cls.dayOfWeek] ||= [];
      classesByDay[cls.dayOfWeek].push(cls);
    }
  });

  return (
    <div className="h-full min-h-full overflow-auto px-5 pb-2 pt-5 sm:px-8 sm:py-5 lg:px-[108px]">
      <div className="w-full pb-4">
        <TabbyPageHeader
          title="Timetable"
          subtitle={metadata || 'Classes synced from your Android Tabby app.'}
          symbol="calendar_clock"
          shape="arch"
        />

        {loading ? (
          <TabbyEmptyState
            title="Loading timetable"
            body="Tabby is checking your synced classes."
            compact
          />
        ) : classes.length === 0 ? (
          <TabbyEmptyState
            title="No classes yet"
            body="Add classes in your Android app and enable Web Tabby sync to see your timetable here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {DAYS.map((dayName, index) => {
              const dayNumber = index + 1;
              const dayClasses = classesByDay[dayNumber] || [];

              return (
                <TabbySection key={dayNumber} title={dayName}>
                  {dayClasses.length === 0 ? (
                    <div className="px-4 py-5 text-body-medium text-muted-foreground">
                      No classes.
                    </div>
                  ) : (
                    <div>
                      {dayClasses.map((cls, classIndex) => {
                        const color = androidColorToHex(cls.color);
                        return (
                          <div
                            key={cls.id}
                            className="flex gap-4 border-b border-border/20 px-4 py-4 last:border-b-0"
                            style={{ backgroundColor: tintFromHex(color, 0.1) }}
                          >
                            <div
                              className="mt-1 h-14 w-1 shrink-0 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="truncate text-title-medium font-black text-foreground">
                                  {cls.subject}
                                </h4>
                                <AssistChip
                                  label={formatMinutes(cls.startMinutes)}
                                  className="h-7 shrink-0 rounded-full bg-background/70 font-black"
                                />
                              </div>
                              <p className="mt-1 text-body-medium font-medium text-foreground">
                                {formatMinutes(cls.startMinutes)} - {formatMinutes(cls.endMinutes)}
                              </p>
                              <p className="mt-1 line-clamp-2 text-body-small text-muted-foreground">
                                {classSupportingLine(cls)}
                              </p>
                            </div>
                            {classIndex === 0 && (
                              <span className="sr-only">First class of {dayName}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabbySection>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
