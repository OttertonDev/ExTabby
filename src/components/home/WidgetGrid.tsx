import { useMemo } from 'react';
import { ClassRing } from './ClassRing';
import { MetricWidget } from './MetricWidget';
import { WidgetModule } from './WidgetModule';
import type { ClassSession, Task, UserPreferences } from '@/types/firestore';
import {
  classDayProgress,
  homeworkStats,
  overdueStats,
  daysUntilTarget,
} from '@/lib/today';
import { useNow } from '@/hooks/useNow';

// Bar colors ported verbatim from TodayRoute.kt
const ASSIGNMENT = { inactive: '#F39292', active: '#DA6868', text: '#690C0C' };
const COUNTDOWN = { inactive: '#BDEDB8', active: '#6FBC65', text: '#0C6917' };
const OVERDUE = { inactive: '#FFCF68', active: '#E5B25F', text: '#693B0C' };

export interface WidgetGridProps {
  classes: ClassSession[];
  tasks: Task[];
  preferences: UserPreferences | null;
  entryToken?: number;
}

export function WidgetGrid({ classes, tasks, preferences, entryToken = 0 }: WidgetGridProps) {
  const now = useNow();
  const reducedMotion = preferences?.reducedMotion ?? false;

  const ring = useMemo(
    () => classDayProgress(classes, now.dayOfWeek, now.minuteOfDay),
    [classes, now.dayOfWeek, now.minuteOfDay]
  );
  const homework = useMemo(() => homeworkStats(tasks), [tasks]);
  const overdue = useMemo(
    () => overdueStats(tasks, now.dayOfWeek, now.minuteOfDay),
    [tasks, now.dayOfWeek, now.minuteOfDay]
  );

  // Assignment bar
  const assignmentProgress =
    homework.homeworkTotal > 0 ? homework.homeworkCompleted / homework.homeworkTotal : 0;

  // Countdown bar
  const targetMillis = preferences?.daysUntilTargetMillis ?? 0;
  const eventName = preferences?.daysUntilEventName ?? '';
  const hasCountdown = targetMillis > 0 && eventName.trim().length > 0;
  const daysUntil = daysUntilTarget(targetMillis, now.millis);
  const isEventToday = hasCountdown && daysUntil === 0;
  const countdownProgress = !hasCountdown ? 0 : isEventToday ? 1 : Math.min(1, Math.max(0, 1 - daysUntil / 365));
  const countdownLabel = hasCountdown ? eventName.toUpperCase() : 'COUNTDOWN';
  const countdownValue = !hasCountdown ? 'Set' : isEventToday ? 'Today' : String(daysUntil);

  // Overdue bar
  const overdueTotal = overdue.finishedOverdueHomeworkToday + overdue.overdueHomeworkLeftToday;
  const overdueProgress = overdueTotal > 0 ? overdue.finishedOverdueHomeworkToday / overdueTotal : 0;

  return (
    <WidgetModule>
      <div className="flex w-fit gap-1.5">
        {/* Class ring — fixed square */}
        <div className="size-[175px] shrink-0">
          <ClassRing
            progress={ring.todayClassProgress}
            classesLeft={ring.classesLeftToday}
            reducedMotion={reducedMotion}
            entryToken={entryToken}
          />
        </div>

        {/* Three stacked metric bars (right) */}
        <div className="grid h-[175px] w-[200px] grid-rows-3 gap-1.5">
          <MetricWidget
            label="ASSIGNMENT"
            value={`${homework.homeworkCompleted}/${homework.homeworkTotal}`}
            iconName="assignment_returned"
            inactiveColor={ASSIGNMENT.inactive}
            activeColor={ASSIGNMENT.active}
            textColor={ASSIGNMENT.text}
            progress={assignmentProgress}
            animationPosition={1}
            reducedMotion={reducedMotion}
            entryToken={entryToken}
          />
          <MetricWidget
            label={countdownLabel}
            value={countdownValue}
            iconName="clock_arrow_up"
            inactiveColor={COUNTDOWN.inactive}
            activeColor={COUNTDOWN.active}
            textColor={COUNTDOWN.text}
            progress={countdownProgress}
            animationPosition={2}
            reducedMotion={reducedMotion}
            entryToken={entryToken}
          />
          <MetricWidget
            label="OVERDUE"
            value={`${overdue.finishedOverdueHomeworkToday}/${overdue.overdueHomeworkLeftToday}`}
            iconName="release_alert"
            inactiveColor={OVERDUE.inactive}
            activeColor={OVERDUE.active}
            textColor={OVERDUE.text}
            progress={overdueProgress}
            animationPosition={3}
            reducedMotion={reducedMotion}
            entryToken={entryToken}
          />
        </div>
      </div>
    </WidgetModule>
  );
}
