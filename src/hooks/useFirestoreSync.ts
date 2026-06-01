import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import type { Subject, ClassSession, Task, UserPreferences } from '../types/firestore';

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, `users/${user.uid}/profile/preferences`),
      (snapshot) => {
        if (snapshot.exists()) {
          setPreferences(snapshot.data() as UserPreferences);
        } else {
          setPreferences(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('useUserPreferences: Error fetching preferences:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { preferences, loading };
}

export function useSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/subjects`),
      (snapshot) => {
        const subjectList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Subject[];
        setSubjects(subjectList);
        setLoading(false);
      },
      (error) => {
        console.error('useSubjects: Error fetching subjects:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { subjects, loading };
}

export function useClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setClasses([]);
      setLoading(false);
      return;
    }

    const classesRef = collection(db, `users/${user.uid}/classes`);

    const unsubscribe = onSnapshot(
      classesRef,
      (snapshot) => {
        const classList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ClassSession[];

        // Sort in memory
        classList.sort((a, b) => {
          if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
          return a.startMinutes - b.startMinutes;
        });

        setClasses(classList);
        setLoading(false);
      },
      (error) => {
        console.error('useClasses: Error fetching classes:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { classes, loading };
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/tasks`),
      (snapshot) => {
        const taskList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        setTasks(taskList);
        setLoading(false);
      },
      (error) => {
        console.error('useTasks: Error fetching tasks:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { tasks, loading };
}
