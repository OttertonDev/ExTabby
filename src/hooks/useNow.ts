import { useEffect, useState } from 'react';
import { jsDayToAndroidDay } from '@/lib/today';

export interface NowSnapshot {
  /** epoch millis */
  millis: number;
  /** minutes since local midnight */
  minuteOfDay: number;
  /** Android-style day of week: 1 = Monday ... 7 = Sunday */
  dayOfWeek: number;
}

function snapshot(): NowSnapshot {
  const d = new Date();
  return {
    millis: d.getTime(),
    minuteOfDay: d.getHours() * 60 + d.getMinutes(),
    dayOfWeek: jsDayToAndroidDay(d.getDay()),
  };
}

/**
 * Returns the current time, re-rendering once per minute so time-aware
 * dashboard widgets (class ring progress, overdue counts) stay live.
 */
export function useNow(): NowSnapshot {
  const [now, setNow] = useState<NowSnapshot>(snapshot);

  useEffect(() => {
    // Align the first tick to the next minute boundary, then tick every minute.
    let intervalId: ReturnType<typeof setInterval>;
    const msToNextMinute = 60_000 - (Date.now() % 60_000);
    const timeoutId = setTimeout(() => {
      setNow(snapshot());
      intervalId = setInterval(() => setNow(snapshot()), 60_000);
    }, msToNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return now;
}
