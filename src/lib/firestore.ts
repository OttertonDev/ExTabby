import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { SchoolClass, StudentTask, Subject, UserPreferences } from '@/types/models';

// Helper to convert Firestore data to typed object
function convertTimestamp(data: any) {
  const converted = { ...data };
  if (converted.createdAt) {
    converted.createdAt = converted.createdAt as Timestamp;
  }
  if (converted.updatedAt) {
    converted.updatedAt = converted.updatedAt as Timestamp;
  }
  return converted;
}

// Classes (Timetable) Service
export const classesService = {
  subscribe(userId: string, callback: (classes: SchoolClass[]) => void) {
    const q = query(
      collection(db, `users/${userId}/classes`),
      where('isBreak', '==', false),
      orderBy('dayOfWeek'),
      orderBy('startMinutes')
    );

    return onSnapshot(q, (snapshot) => {
      const classes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertTimestamp(doc.data()),
      })) as SchoolClass[];
      callback(classes);
    });
  },

  async add(userId: string, classData: Omit<SchoolClass, 'id' | 'createdAt' | 'updatedAt'>) {
    const ref = collection(db, `users/${userId}/classes`);
    return addDoc(ref, {
      ...classData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async update(userId: string, classId: string, updates: Partial<SchoolClass>) {
    const ref = doc(db, `users/${userId}/classes/${classId}`);
    return updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(userId: string, classId: string) {
    const ref = doc(db, `users/${userId}/classes/${classId}`);
    return deleteDoc(ref);
  },

  async updateMultiple(userId: string, classIds: string[], updates: Partial<SchoolClass>) {
    const promises = classIds.map((id) => this.update(userId, id, updates));
    return Promise.all(promises);
  },

  async deleteMultiple(userId: string, classIds: string[]) {
    const promises = classIds.map((id) => this.delete(userId, id));
    return Promise.all(promises);
  },
};

// Tasks (Assignments) Service
export const tasksService = {
  subscribe(userId: string, callback: (tasks: StudentTask[]) => void, filters?: QueryConstraint[]) {
    const constraints = [
      orderBy('dueAtMillis'),
      ...(filters || []),
    ];

    const q = query(
      collection(db, `users/${userId}/tasks`),
      ...constraints
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertTimestamp(doc.data()),
      })) as StudentTask[];
      callback(tasks);
    });
  },

  async add(userId: string, taskData: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>) {
    const ref = collection(db, `users/${userId}/tasks`);
    return addDoc(ref, {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async update(userId: string, taskId: string, updates: Partial<StudentTask>) {
    const ref = doc(db, `users/${userId}/tasks/${taskId}`);
    return updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(userId: string, taskId: string) {
    const ref = doc(db, `users/${userId}/tasks/${taskId}`);
    return deleteDoc(ref);
  },

  async markComplete(userId: string, taskId: string, isComplete: boolean) {
    return this.update(userId, taskId, { isComplete });
  },

  async updateMultiple(userId: string, taskIds: string[], updates: Partial<StudentTask>) {
    const promises = taskIds.map((id) => this.update(userId, id, updates));
    return Promise.all(promises);
  },
};

// Subjects Service
export const subjectsService = {
  subscribe(userId: string, callback: (subjects: Subject[]) => void) {
    const q = query(
      collection(db, `users/${userId}/subjects`),
      orderBy('name')
    );

    return onSnapshot(q, (snapshot) => {
      const subjects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subject[];
      callback(subjects);
    });
  },

  async add(userId: string, subjectData: Omit<Subject, 'id'>) {
    const ref = collection(db, `users/${userId}/subjects`);
    return addDoc(ref, subjectData);
  },

  async update(userId: string, subjectId: string, updates: Partial<Subject>) {
    const ref = doc(db, `users/${userId}/subjects/${subjectId}`);
    return updateDoc(ref, updates);
  },

  async delete(userId: string, subjectId: string) {
    const ref = doc(db, `users/${userId}/subjects/${subjectId}`);
    return deleteDoc(ref);
  },
};

// Preferences Service
export const preferencesService = {
  subscribe(userId: string, callback: (preferences: UserPreferences | null) => void) {
    const ref = doc(db, `users/${userId}/preferences`);

    return onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserPreferences);
      } else {
        callback(null);
      }
    });
  },

  async update(userId: string, updates: Partial<UserPreferences>) {
    const ref = doc(db, `users/${userId}/preferences`);
    return updateDoc(ref, updates);
  },
};
