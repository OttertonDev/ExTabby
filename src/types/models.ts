// Base types
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Priority = 'low' | 'medium' | 'high';
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed';
export type TaskType = 'homework' | 'exam';

// Firestore timestamp type
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// User Profile
export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: FirestoreTimestamp;
}

// User Preferences (from Android DataStore)
export interface UserPreferences {
  realName: string;
  profileName: string;
  profileAvatarPath: string;
  studentId: string;
  studyTrack: string;
  reducedMotion: boolean;
  animationIntensity: number;
  reminderDefaultMinutes: number;
  weekStartsOnMonday: boolean;
  use24HourFormat: boolean;
  notificationsEnabled: boolean;
  daysUntilEventName: string;
  daysUntilTargetMillis: number;
  schoolName: string;
  term: string;
  classSection: string;
  homeroomTeacher: string;
  todayWidgetLayout: string;
  navigationBarLayout: string;
}

// Timetable Metadata
export interface TimetableMetadata {
  schoolName: string;
  term: string;
  classSection: string;
  homeroomTeacher: string;
}

// Subject (from Android Room Subject entity)
export interface Subject {
  id: string;
  name: string;
  color: string; // hex color
  notes: string;
}

// SchoolClass (from Android Room SchoolClass entity)
export interface SchoolClass {
  id: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number; // minutes from midnight
  endMinutes: number; // minutes from midnight
  subject: string;
  subjectId: string | null;
  room: string;
  teacher: string;
  color: string; // hex color
  notes: string;
  subjectCode: string;
  periodNumber: number | null;
  isBreak: boolean;
  notifyEnabled: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// StudentTask (from Android Room StudentTask entity)
export interface StudentTask {
  id: string;
  title: string;
  type: TaskType;
  dueDayOfWeek: DayOfWeek;
  dueMinutes: number; // minutes from midnight
  classId: string | null;
  subjectId: string | null;
  dueAtMillis: number; // absolute timestamp
  priority: Priority;
  isComplete: boolean;
  reminderMinutesBefore: number | null;
  notes: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// TaskAttachment (from Android Room TaskAttachment entity)
export interface TaskAttachment {
  id: string;
  taskId: string;
  displayName: string;
  mimeType: string | null;
  sizeBytes: number;
  filePath: string;
}

// TCAS University types
export interface University {
  id: string;
  name: string;
  nameEn: string;
  province: string;
  type: 'public' | 'private' | 'autonomous';
  website: string;
  logoUrl?: string;
}

export interface Faculty {
  id: string;
  universityId: string;
  name: string;
  nameEn: string;
}

export interface Program {
  id: string;
  facultyId: string;
  universityId: string;
  name: string;
  nameEn: string;
  degree: string;
  admissionRounds: string[];
  seats: number;
  tuitionFee: number;
}

// Helper function to convert minutes to HH:mm format
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Helper function to convert HH:mm to minutes
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to get day name
export function getDayName(dayOfWeek: DayOfWeek): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayOfWeek - 1];
}

// Helper function to get day abbreviation
export function getDayAbbr(dayOfWeek: DayOfWeek): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days[dayOfWeek - 1];
}
