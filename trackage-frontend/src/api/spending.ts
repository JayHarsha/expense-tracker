import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { MemberSpendingSummary, PersonalSpendingSummary } from '../types';

const fetchGroupSpendingSummary = (groupId: number, ym: string) =>
  apiClient.get<MemberSpendingSummary[]>(`/groups/${groupId}/spending-summary`, { params: { ym } }).then((r) => r.data);
const fetchPersonalSpendingSummary = (ym: string) =>
  apiClient.get<PersonalSpendingSummary>('/users/me/spending-summary', { params: { ym } }).then((r) => r.data);

export function useGroupSpendingSummary(groupId: number, ym: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'spending-summary', ym],
    queryFn: () => fetchGroupSpendingSummary(groupId, ym),
  });
}

export function usePersonalSpendingSummary(ym: string) {
  return useQuery({
    queryKey: ['users', 'me', 'spending-summary', ym],
    queryFn: () => fetchPersonalSpendingSummary(ym),
  });
}
