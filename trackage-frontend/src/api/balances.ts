import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { Balance, SettlementSuggestion } from '../types';

const fetchBalances = (groupId: number) =>
  apiClient.get<Balance[]>(`/groups/${groupId}/balances`).then((r) => r.data);
const fetchSettlementSuggestions = (groupId: number) =>
  apiClient.get<SettlementSuggestion[]>(`/groups/${groupId}/settlements/suggestions`).then((r) => r.data);

export function useBalances(groupId: number) {
  return useQuery({ queryKey: ['groups', groupId, 'balances'], queryFn: () => fetchBalances(groupId) });
}

export function useSettlementSuggestions(groupId: number) {
  return useQuery({
    queryKey: ['groups', groupId, 'settlements', 'suggestions'],
    queryFn: () => fetchSettlementSuggestions(groupId),
  });
}
