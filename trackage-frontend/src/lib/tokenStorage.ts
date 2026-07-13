import type { UserSummary } from '../types';

const ACCESS_TOKEN_KEY = 'trackage.accessToken';
const REFRESH_TOKEN_KEY = 'trackage.refreshToken';
const USER_KEY = 'trackage.user';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: (): UserSummary | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserSummary) : null;
  },
  setSession: (accessToken: string, refreshToken: string, user: UserSummary) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  setUser: (user: UserSummary) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
