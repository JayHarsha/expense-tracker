import { useEffect, useMemo, useState } from 'react';
import { distributeByWeights } from '../lib/splitMath';
import type { ExpenseSplitInput, UserSummary } from '../types';
import { Avatar } from './Avatar';

type Mode = 'equal' | 'unequal' | 'percentage' | 'shares';

const MODES: { key: Mode; label: string }[] = [
  { key: 'equal', label: 'Equal' },
  { key: 'unequal', label: 'Unequal' },
  { key: 'percentage', label: 'Percentage' },
  { key: 'shares', label: 'Shares' },
];

export function SplitEditor({
  members,
  totalAmount,
  onChange,
  initialSplits,
}: {
  members: UserSummary[];
  totalAmount: number;
  onChange: (splits: ExpenseSplitInput[], isValid: boolean) => void;
  /** Prefills the editor in "unequal" mode from an existing expense's exact splits (edit flow). */
  initialSplits?: ExpenseSplitInput[];
}) {
  const [mode, setMode] = useState<Mode>(initialSplits ? 'unequal' : 'equal');
  const [participantIds, setParticipantIds] = useState<Set<number>>(
    () => new Set(initialSplits ? initialSplits.map((s) => s.userId) : members.map((m) => m.id)),
  );
  const [rawValues, setRawValues] = useState<Record<number, string>>(() =>
    initialSplits ? Object.fromEntries(initialSplits.map((s) => [s.userId, String(s.amount)])) : {},
  );

  useEffect(() => {
    if (!initialSplits) {
      setParticipantIds(new Set(members.map((m) => m.id)));
    }
  }, [members, initialSplits]);

  const participants = useMemo(
    () => members.filter((m) => participantIds.has(m.id)),
    [members, participantIds],
  );

  const toggleParticipant = (id: number) => {
    setParticipantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { amounts, isValid, remaining } = useMemo(() => {
    if (participants.length === 0) {
      return { amounts: {} as Record<number, number>, isValid: false, remaining: totalAmount };
    }
    if (mode === 'equal') {
      const weights = participants.map((p) => ({ id: p.id, weight: 1 }));
      return { amounts: distributeByWeights(totalAmount, weights), isValid: true, remaining: 0 };
    }
    if (mode === 'percentage' || mode === 'shares') {
      const weights = participants.map((p) => ({
        id: p.id,
        weight: Number(rawValues[p.id] ?? (mode === 'shares' ? 1 : 0)) || 0,
      }));
      return { amounts: distributeByWeights(totalAmount, weights), isValid: true, remaining: 0 };
    }
    // unequal: user enters exact amounts, must sum to total
    const amounts: Record<number, number> = {};
    let sum = 0;
    for (const p of participants) {
      const v = Number(rawValues[p.id] ?? 0) || 0;
      amounts[p.id] = v;
      sum += v;
    }
    const remaining = Math.round((totalAmount - sum) * 100) / 100;
    return { amounts, isValid: remaining === 0, remaining };
  }, [mode, participants, rawValues, totalAmount]);

  useEffect(() => {
    const splits: ExpenseSplitInput[] = participants.map((p) => ({ userId: p.id, amount: amounts[p.id] ?? 0 }));
    onChange(splits, isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amounts, isValid]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`flex-1 rounded px-2 py-1.5 text-sm font-medium transition ${
              mode === m.key
                ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const included = participantIds.has(member.id);
          return (
            <div key={member.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={included}
                onChange={() => toggleParticipant(member.id)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Avatar id={member.id} name={member.name} size={28} />
              <span className="flex-1 text-sm">{member.name}</span>
              {!included ? null : mode === 'equal' ? (
                <span className="w-20 text-right text-sm text-slate-500">
                  ${(amounts[member.id] ?? 0).toFixed(2)}
                </span>
              ) : mode === 'unequal' ? (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-24 rounded-md border border-slate-300 px-2 py-1 text-right text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={rawValues[member.id] ?? ''}
                  onChange={(e) => setRawValues((prev) => ({ ...prev, [member.id]: e.target.value }))}
                  placeholder="0.00"
                />
              ) : mode === 'percentage' ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-16 rounded-md border border-slate-300 px-2 py-1 text-right text-sm dark:border-slate-700 dark:bg-slate-900"
                    value={rawValues[member.id] ?? ''}
                    onChange={(e) => setRawValues((prev) => ({ ...prev, [member.id]: e.target.value }))}
                    placeholder="0"
                  />
                  <span className="text-xs text-slate-500">% (${(amounts[member.id] ?? 0).toFixed(2)})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="w-16 rounded-md border border-slate-300 px-2 py-1 text-right text-sm dark:border-slate-700 dark:bg-slate-900"
                    value={rawValues[member.id] ?? '1'}
                    onChange={(e) => setRawValues((prev) => ({ ...prev, [member.id]: e.target.value }))}
                    placeholder="1"
                  />
                  <span className="text-xs text-slate-500">
                    share{Number(rawValues[member.id] ?? 1) === 1 ? '' : 's'} (${(amounts[member.id] ?? 0).toFixed(2)})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mode === 'unequal' && remaining !== 0 && (
        <p className="text-sm text-rose-600 dark:text-rose-400">
          {remaining > 0 ? `$${remaining.toFixed(2)} left to assign` : `$${Math.abs(remaining).toFixed(2)} over the total`}
        </p>
      )}
      {participants.length === 0 && (
        <p className="text-sm text-rose-600 dark:text-rose-400">Select at least one person to split with.</p>
      )}
    </div>
  );
}
