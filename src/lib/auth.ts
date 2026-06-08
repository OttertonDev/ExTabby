import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export const DEMO_MODE_STORAGE_KEY = 'tabby-demo-mode';
export const TABBY_AUTH_CHANGED_EVENT = 'tabby-auth-changed';

const googleProvider = new GoogleAuthProvider();

export function notifyAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(TABBY_AUTH_CHANGED_EVENT));
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
    notifyAuthChanged();
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
