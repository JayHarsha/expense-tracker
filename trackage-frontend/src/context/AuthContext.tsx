import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { setOnAuthFailure } from '../lib/apiClient';
import { tokenStorage } from '../lib/tokenStorage';
import type { OtpIssuedResponse, UserSummary } from '../types';

interface AuthContextValue {
  user: UserSummary | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<OtpIssuedResponse>;
  verifySignup: (email: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(() => tokenStorage.getUser());

  const logout = useCallback(() => {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.clear();
    setUser(null);
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {
        // Best-effort revoke; local session is already cleared either way.
      });
    }
  }, []);

  useEffect(() => {
    setOnAuthFailure(() => setUser(null));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    tokenStorage.setSession(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    return authApi.signup(name, email, password);
  }, []);

  const verifySignup = useCallback(async (email: string, code: string) => {
    const res = await authApi.verifySignup(email, code);
    tokenStorage.setSession(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, login, signup, verifySignup, logout }),
    [user, login, signup, verifySignup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
