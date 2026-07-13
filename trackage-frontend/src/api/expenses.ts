import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { CreateExpenseRequest, Expense } from '../types';

const fetchExpenses = (groupId: number) =>
  apiClient.get<Expense[]>('/expenses', { params: { groupId } }).then((r) => r.data);
const fetchExpense = (id: number) => apiClient.get<Expense>(`/expenses/${id}`).then((r) => r.data);
const createExpenseRequest = (req: CreateExpenseRequest) =>
  apiClient.post<Expense>('/expenses', req).then((r) => r.data);
const updateExpenseRequest = ({ id, ...req }: CreateExpenseRequest & { id: number }) =>
  apiClient.put<Expense>(`/expenses/${id}`, req).then((r) => r.data);
const deleteExpenseRequest = (id: number) => apiClient.delete(`/expenses/${id}`);

export interface SettleUpRequest {
  groupId: number;
  payerId: number;
  receiverId: number;
  amount: number;
  date?: string;
}
const recordSettlementRequest = (req: SettleUpRequest) =>
  apiClient.post<Expense>('/expenses/settle', req).then((r) => r.data);

export function useExpenses(groupId: number) {
  return useQuery({ queryKey: ['groups', groupId, 'expenses'], queryFn: () => fetchExpenses(groupId) });
}

export function useExpense(id: number | undefined) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => fetchExpense(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateExpense(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpenseRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}

export function useUpdateExpense(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExpenseRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.id] });
    },
  });
}

export function useDeleteExpense(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpenseRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}

export function useRecordSettlement(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordSettlementRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}
