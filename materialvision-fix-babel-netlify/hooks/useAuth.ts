import { useEffect, useState, useCallback } from 'react';
import { blink } from '@/lib/blink';
import type { BlinkUser } from '@blinkdotnew/sdk';

interface AuthState {
  user: BlinkUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((authState) => {
      setState({
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
      });
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await blink.auth.signInWithEmail(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await blink.auth.signUp({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    await blink.auth.signOut();
  }, []);

  return { ...state, signIn, signUp, signOut };
}
