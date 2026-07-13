import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { GroupDetail, GroupSummary, UserSummary } from '../types';

const fetchGroups = () => apiClient.get<GroupSummary[]>('/groups').then((r) => r.data);
const fetchGroupDetail = (id: number) => apiClient.get<GroupDetail>(`/groups/${id}`).then((r) => r.data);
const createGroupRequest = (name: string) =>
  apiClient.post<GroupSummary>('/groups', { name }).then((r) => r.data);
const joinGroupRequest = (inviteCode: string) =>
  apiClient.post<GroupSummary>('/groups/join', { inviteCode }).then((r) => r.data);
const leaveGroupRequest = (id: number) => apiClient.delete(`/groups/${id}/members/me`);
const addPlaceholderMemberRequest = ({ groupId, name }: { groupId: number; name: string }) =>
  apiClient.post<UserSummary>(`/groups/${groupId}/members`, { name }).then((r) => r.data);

export function useGroups() {
  return useQuery({ queryKey: ['groups'], queryFn: fetchGroups });
}

export function useGroupDetail(groupId: number) {
  return useQuery({ queryKey: ['groups', groupId], queryFn: () => fetchGroupDetail(groupId) });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroupRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinGroupRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useAddPlaceholderMember(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => addPlaceholderMemberRequest({ groupId, name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId] }),
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveGroupRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}
