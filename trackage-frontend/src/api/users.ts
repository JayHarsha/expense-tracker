import { apiClient } from '../lib/apiClient';
import type { UserSummary } from '../types';

export interface UpdateProfileRequest {
  name?: string;
  /** Empty string clears the picture; omit to leave unchanged. */
  avatar?: string;
}

export function getMe() {
  return apiClient.get<UserSummary>('/users/me').then((r) => r.data);
}

export function updateProfile(req: UpdateProfileRequest) {
  return apiClient.patch<UserSummary>('/users/me', req).then((r) => r.data);
}
