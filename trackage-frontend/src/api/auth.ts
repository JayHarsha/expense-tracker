import { apiClient } from '../lib/apiClient';
import type { AuthResponse, OtpIssuedResponse } from '../types';

export function signup(name: string, email: string, password: string) {
  return apiClient
    .post<OtpIssuedResponse>('/auth/signup', { name, email, password })
    .then((r) => r.data);
}

export function verifySignup(email: string, code: string) {
  return apiClient.post<AuthResponse>('/auth/verify-signup', { email, code }).then((r) => r.data);
}

export function resendVerification(email: string) {
  return apiClient.post<OtpIssuedResponse>('/auth/resend-verification', { email }).then((r) => r.data);
}

export function login(email: string, password: string) {
  return apiClient.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data);
}

export function forgotPassword(email: string) {
  return apiClient.post<OtpIssuedResponse>('/auth/forgot-password', { email }).then((r) => r.data);
}

export function resetPassword(email: string, code: string, newPassword: string) {
  return apiClient.post('/auth/reset-password', { email, code, newPassword });
}

export function logout(refreshToken: string) {
  return apiClient.post('/auth/logout', { refreshToken });
}
