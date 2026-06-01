// Types matching the Android app's Firestore structure exactly

export interface UserPreferences {
  realName?: string;
  profileName?: string;
  profileAvatarPath?: string;
  studentId?: string;
  studyTrack?: string;
  schoolName?: string;
  term?: string;
  classSection?: string;
  homeroomTeacher?: string;
  reducedMotion?: boolean;
  animationIntensity?: number;
  reminderDefaultMinutes?: number;
  weekStartsOnMonday?: boolean;
  use24HourFormat?: boolean;
  notificationsEnabled?: boolean;
  daysUntilEventName?: string;
  daysUntilTargetMillis?: number;
  lastSyncedAt?: any; // Firestore Timestamp
}

export interface Subject {
  id: string;
  localId: number;
  name: string;
  color: number; // Long color value
  notes?: string;
  updatedAt?: any; // Firestore Timestamp
}

export interface ClassSession {
  id: string;
  localId: number;
  dayOfWeek: number; // 1 = Monday, 7 = Sunday
  startMinutes: number; // Minutes from midnight
  endMinutes: number; // Minutes from midnight
  subject: string; // Subject name
  subjectId?: number | null;
  subjectCode?: string;
  room: string;
  teacher: string;
  color: number; // Long color value
  periodNumber?: number | null;
  isBreak?: boolean;
  notes?: string;
  notifyEnabled?: boolean;
  updatedAt?: any; // Firestore Timestamp
}

export interface Task {
  id: string;
  localId: number;
  title: string;
  type: string; // "homework" or "exam"
  dueDayOfWeek: number;
  dueMinutes: number;
  classId?: number | null;
  subjectId?: number | null;
  dueAtMillis: number; // timestamp
  priority: number; // 0 = low, 1 = medium, 2 = high
  isComplete: boolean;
  reminderMinutesBefore?: number | null;
  notes?: string;
  updatedAt?: any; // Firestore Timestamp
}

export interface SyncStatus {
  lastSynced: number | null;
  syncing: boolean;
  error: string | null;
}
