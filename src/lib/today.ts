// Today/Home dashboard calculations.
// Ported verbatim from the Android app's PlannerCalculations.kt and TodayViewModel.kt
// so the web Home screen produces identical numbers to the Android "Today" screen.

import type { ClassSession, Task } from '@/types/firestore';

export const TASK_TYPE_HOMEWORK = 'homework';

export interface ClassDayProgress {
  /** 0..1 fraction of today's classes that are done (counts partial progress through the current class). */
  todayClassProgress: number;
  /** Number of classes still remaining today. */
  classesLeftToday: number;
  hasTodayClasses: boolean;
}

/**
 * Port of PlannerCalculations.classDayProgress.
 * @param classes  all classes
 * @param dayOfWeek 1 = Monday ... 7 = Sunday (Android convention)
 * @param minuteOfDay minutes since midnight, local time
 */
export function classDayProgress(
  classes: ClassSession[],
  dayOfWeek: number,
  minuteOfDay: number
): ClassDayProgress {
  const todayClasses = classes
    .filter((c) => c.dayOfWeek === dayOfWeek && !c.isBreak)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  const completedClasses = todayClasses.filter((c) => minuteOfDay >= c.endMinutes).length;

  const current = todayClasses.find(
    (c) => minuteOfDay >= c.startMinutes && minuteOfDay < c.endMinutes
  );
  const currentClassProgress = current
    ? (minuteOfDay - current.startMinutes) / Math.max(1, current.endMinutes - current.startMinutes)
    : 0;

  const todayClassProgress =
    todayClasses.length === 0
      ? 0
      : clamp01((completedClasses + currentClassProgress) / todayClasses.length);

  return {
    todayClassProgress,
    classesLeftToday: Math.max(0, todayClasses.length - completedClasses),
    hasTodayClasses: todayClasses.length > 0,
  };
}

export interface HomeworkStats {
  homeworkCompleted: number;
  homeworkTotal: number;
}

/** Port of TodayViewModel homework counting. */
export function homeworkStats(tasks: Task[]): HomeworkStats {
  const homework = tasks.filter((t) => t.type === TASK_TYPE_HOMEWORK);
  return {
    homeworkTotal: homework.length,
    homeworkCompleted: homework.filter((t) => t.isComplete).length,
  };
}

export interface OverdueStats {
  finishedOverdueHomeworkToday: number;
  overdueHomeworkLeftToday: number;
}

/** Port of TodayViewModel overdue homework counting (homework due earlier today). */
export function overdueStats(
  tasks: Task[],
  dayOfWeek: number,
  minuteOfDay: number
): OverdueStats {
  const overdue = tasks.filter(
    (t) =>
      t.type === TASK_TYPE_HOMEWORK &&
      t.dueDayOfWeek === dayOfWeek &&
      t.dueMinutes < minuteOfDay
  );
  return {
    finishedOverdueHomeworkToday: overdue.filter((t) => t.isComplete).length,
    overdueHomeworkLeftToday: overdue.filter((t) => !t.isComplete).length,
  };
}

/** Port of TodayRoute.daysUntilTarget — whole days between local midnight today and target's local midnight. */
export function daysUntilTarget(targetMillis: number, now: number): number {
  if (targetMillis <= 0) return 0;
  const startOfDay = (ms: number) => {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const diff = startOfDay(targetMillis) - startOfDay(now);
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Convert JS Date.getDay() (0=Sun..6=Sat) to Android dayOfWeek (1=Mon..7=Sun). */
export function jsDayToAndroidDay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}
