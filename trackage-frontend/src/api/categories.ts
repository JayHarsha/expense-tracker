import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { Category } from '../types';

const fetchCategories = (groupId: number) =>
  apiClient.get<Category[]>(`/groups/${groupId}/categories`).then((r) => r.data);

export interface CreateCategoryRequest {
  groupId: number;
  name: string;
  color?: string;
  icon?: string;
}
const createCategoryRequest = (req: CreateCategoryRequest) =>
  apiClient.post<Category>('/categories', req).then((r) => r.data);

export function useCategories(groupId: number) {
  return useQuery({ queryKey: ['groups', groupId, 'categories'], queryFn: () => fetchCategories(groupId) });
}

export function useCreateCategory(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategoryRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'categories'] }),
  });
}
