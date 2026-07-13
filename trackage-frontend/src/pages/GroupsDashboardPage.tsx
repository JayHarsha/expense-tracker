import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateGroup, useGroups, useJoinGroup } from '../api/groups';
import { GroupCard } from '../components/GroupCard';
import { extractErrorMessage } from '../lib/apiClient';

export function GroupsDashboardPage() {
  const { data: groups, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const group = await createGroup.mutateAsync(groupName);
      setGroupName('');
      navigate(`/groups/${group.id}`);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create group'));
    }
  };

  const onJoin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const group = await joinGroup.mutateAsync(inviteCode);
      setInviteCode('');
      navigate(`/groups/${group.id}`);
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid invite code'));
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-xl font-bold">Your groups</h1>
        {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {!isLoading && groups?.length === 0 && (
          <p className="text-sm text-slate-500">No groups yet — create one or join with an invite code.</p>
        )}
        <div className="space-y-2">
          {groups?.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid gap-6 sm:grid-cols-2">
        <form onSubmit={onCreate} className="space-y-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="font-semibold">Create a group</h2>
          <input
            required
            placeholder="e.g. Goa Trip"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="submit"
            disabled={createGroup.isPending}
            className="w-full rounded-md bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Create
          </button>
        </form>

        <form onSubmit={onJoin} className="space-y-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="font-semibold">Join with invite code</h2>
          <input
            required
            placeholder="e.g. AB3D9K2Q"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono tracking-widest dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="submit"
            disabled={joinGroup.isPending}
            className="w-full rounded-md bg-slate-700 px-3 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
