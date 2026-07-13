import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from '../types';
import { tokenStorage } from './tokenStorage';

// Empty string (the default) means "same origin as the page" - correct when the
// backend serves this build as static resources. Set VITE_API_BASE_URL only when
// running the frontend dev server against a backend on a different origin.
const baseURL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/trackage`;

export const apiClient = axios.create({ baseURL });

// Separate, un-intercepted client used only for the refresh call itself,
// so a failed refresh can't recursively trigger another refresh attempt.
const refreshClient = axios.create({ baseURL });

let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(callback: () => void) {
  onAuthFailure = callback;
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await refreshClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    tokenStorage.setSession(data.accessToken, data.refreshToken, data.user);
    return data.accessToken;
  } catch {
    return null;
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthEndpoint = config?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && config && !config._retried && !isAuthEndpoint) {
      config._retried = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        config.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient.request(config);
      }
      tokenStorage.clear();
      onAuthFailure?.();
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    return data?.error ?? fallback;
  }
  return fallback;
}
