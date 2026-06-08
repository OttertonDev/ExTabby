import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { DEMO_MODE_STORAGE_KEY, TABBY_AUTH_CHANGED_EVENT } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let firebaseUser: User | null = null;
    let firebaseReady = false;

    const getDemoUser = () => {
      const demoUser = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
      if (!demoUser) return null;

      try {
        return JSON.parse(demoUser) as User;
      } catch {
        localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
        return null;
      }
    };

    const syncCurrentUser = () => {
      const demoUser = getDemoUser();

      setUser(demoUser ?? firebaseUser);
      setLoading(!demoUser && !firebaseReady);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      firebaseUser = user;
      firebaseReady = true;
      syncCurrentUser();
    });

    window.addEventListener(TABBY_AUTH_CHANGED_EVENT, syncCurrentUser);
    syncCurrentUser();

    return () => {
      window.removeEventListener(TABBY_AUTH_CHANGED_EVENT, syncCurrentUser);
      unsubscribe();
    };
  }, []);

  return { user, loading };
}
