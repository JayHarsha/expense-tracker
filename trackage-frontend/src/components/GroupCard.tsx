import { Link } from 'react-router-dom';
import type { GroupSummary } from '../types';

export function GroupCard({ group }: { group: GroupSummary }) {
  return (
    <Link
      to={`/groups/${group.id}`}
      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-brand-400 hover:shadow dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="font-medium">{group.name}</span>
      <span className="font-mono text-xs text-slate-400">{group.inviteCode}</span>
    </Link>
  );
}
