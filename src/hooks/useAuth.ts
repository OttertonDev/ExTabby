import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo mode first
    const demoUser = localStorage.getItem('tabby-demo-mode');
    if (demoUser) {
      try {
        setUser(JSON.parse(demoUser) as User);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('tabby-demo-mode');
      }
    }

    // Otherwise use Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
