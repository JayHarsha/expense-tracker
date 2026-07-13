import { useState } from 'react';
import { usePersonalSpendingSummary } from '../api/spending';
import { currentYearMonth } from '../lib/currentYearMonth';

export function PersonalSpendingSummary() {
  const [ym, setYm] = useState(currentYearMonth());
  const { data, isLoading } = usePersonalSpendingSummary(ym);

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-500 dark:text-slate-400">Your spending</h2>
        <input
          type="month"
          value={ym}
          onChange={(e) => setYm(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}

      {data && (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-slate-500">Paid by you so far</p>
            <p className="text-lg font-semibold">${data.actualSpent.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Your spend once settled up</p>
            <p className="text-lg font-semibold">${data.share.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{data.netBalance >= 0 ? 'You should receive' : 'You should pay'}</p>
            <p className={`text-lg font-semibold ${data.netBalance >= 0 ? 'text-amber-800' : 'text-amber-500'}`}>
              ${Math.abs(data.netBalance).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
