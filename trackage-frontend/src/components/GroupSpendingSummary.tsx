import { useState } from 'react';
import { useGroupSpendingSummary } from '../api/spending';
import { currentYearMonth } from '../lib/currentYearMonth';

export function GroupSpendingSummary({ groupId }: { groupId: number }) {
  const [ym, setYm] = useState(currentYearMonth());
  const { data: summary, isLoading } = useGroupSpendingSummary(groupId, ym);

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-500 dark:text-slate-400">Spending by member</h2>
        <input
          type="month"
          value={ym}
          onChange={(e) => setYm(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {summary && summary.length === 0 && <p className="text-sm text-slate-500">No members yet.</p>}

      {summary && summary.length > 0 && (
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-2 px-2 text-xs font-medium text-slate-400">
            <span>Member</span>
            <span className="text-right">Paid so far</span>
            <span className="text-right">Spend once settled up</span>
          </div>
          {summary.map((m) => (
            <div
              key={m.userId}
              className="grid grid-cols-3 gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-sm dark:bg-slate-800"
            >
              <span>{m.userName}</span>
              <span className="text-right">${m.actualSpent.toFixed(2)}</span>
              <span className="text-right">${m.share.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
