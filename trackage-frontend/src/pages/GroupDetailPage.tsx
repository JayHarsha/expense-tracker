import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBalances, useSettlementSuggestions } from '../api/balances';
import { useDeleteExpense, useExpenses, useRecordSettlement } from '../api/expenses';
import { useAddPlaceholderMember, useGroupDetail, useLeaveGroup } from '../api/groups';
import { Avatar } from '../components/Avatar';
import { BalanceBubbles } from '../components/BalanceBubbles';
import { ExpenseListItem } from '../components/ExpenseListItem';
import { GroupSpendingSummary } from '../components/GroupSpendingSummary';
import { InviteShareBox } from '../components/InviteShareBox';
import { SettlementSuggestionCard } from '../components/SettlementSuggestionCard';
import { useAuth } from '../context/AuthContext';

const RECENT_COUNT = 4;

export function GroupDetailPage() {
  const { id } = useParams();
  const groupId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [lastSettlement, setLastSettlement] = useState<
    { expenseId: number; fromName: string; toName: string; amount: number } | null
  >(null);

  const { data: group, isLoading: groupLoading } = useGroupDetail(groupId);
  const { data: expenses, isLoading: expensesLoading } = useExpenses(groupId);
  const { data: balances } = useBalances(groupId);
  const { data: suggestions } = useSettlementSuggestions(groupId);
  const recordSettlement = useRecordSettlement(groupId);
  const deleteExpense = useDeleteExpense(groupId);
  const leaveGroup = useLeaveGroup();
  const addPlaceholderMember = useAddPlaceholderMember(groupId);

  if (groupLoading || !group || !user) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  const onRecordSettlement = async (
    fromUserId: number,
    toUserId: number,
    fromName: string,
    toName: string,
    amount: number,
  ) => {
    if (!confirm(`Mark ${fromName} as having paid ${toName} $${amount.toFixed(2)}?`)) return;
    const key = `${fromUserId}-${toUserId}`;
    setRecordingKey(key);
    try {
      const expense = await recordSettlement.mutateAsync({ groupId, payerId: fromUserId, receiverId: toUserId, amount });
      setLastSettlement({ expenseId: expense.id, fromName, toName, amount });
    } finally {
      setRecordingKey(null);
    }
  };

  const onUndoSettlement = async () => {
    if (!lastSettlement) return;
    await deleteExpense.mutateAsync(lastSettlement.expenseId);
    setLastSettlement(null);
  };

  const onLeave = async () => {
    if (!confirm('Leave this group? You can only leave once your balance is settled.')) return;
    await leaveGroup.mutateAsync(groupId);
    navigate('/');
  };

  const onAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    await addPlaceholderMember.mutateAsync(newMemberName.trim());
    setNewMemberName('');
  };

  const recentExpenses = expenses?.slice(0, RECENT_COUNT) ?? [];
  const totalCount = expenses?.length ?? 0;
  const totalSpent = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Avatar id={user.id} name={user.name} size={32} />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg dark:border-slate-700"
            aria-label="Group menu"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-2 text-sm font-semibold">Members</p>
              <div className="mb-3 space-y-2">
                {group.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Avatar id={m.id} name={m.name} size={24} />
                    <span className="text-sm">{m.name}</span>
                    {m.isPlaceholder && (
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        offline
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={onAddMember} className="mb-3 flex gap-2">
                <input
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Add a friend by name"
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <button
                  type="submit"
                  disabled={addPlaceholderMember.isPending || !newMemberName.trim()}
                  className="shrink-0 rounded-md bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  Add
                </button>
              </form>
              <p className="mb-3 text-xs text-slate-400">
                Friends added by name don't need to sign up — invite them with the code below if they'd like their own login.
              </p>

              <InviteShareBox inviteCode={group.inviteCode} />
              <button onClick={onLeave} className="mt-3 text-sm text-rose-600 hover:underline">
                Leave group
              </button>
            </div>
          )}
        </div>
      </div>

      <BalanceBubbles balances={balances ?? []} />

      <GroupSpendingSummary groupId={groupId} />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{group.name}</h1>
        <Link
          to={`/groups/${groupId}/expenses/new`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xl text-white hover:bg-brand-700"
          aria-label="Add expense"
        >
          +
        </Link>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold text-slate-500 dark:text-slate-400">Transactions</h2>
        {expensesLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {!expensesLoading && recentExpenses.length === 0 && (
          <p className="text-sm text-slate-500">No expenses yet. Add the first one!</p>
        )}
        {recentExpenses.map((expense) => (
          <ExpenseListItem key={expense.id} expense={expense} currentUserId={user.id} />
        ))}
        {totalCount > RECENT_COUNT && (
          <Link
            to={`/groups/${groupId}/transactions`}
            className="block rounded-lg border border-slate-200 py-2 text-center text-sm font-medium text-brand-700 hover:bg-slate-50 dark:border-slate-800 dark:text-brand-400 dark:hover:bg-slate-800"
          >
            Show all
          </Link>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold text-slate-500 dark:text-slate-400">Debts</h2>
        {lastSettlement && (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Marked <span className="font-medium">{lastSettlement.fromName}</span> →{' '}
              <span className="font-medium">{lastSettlement.toName}</span> (${lastSettlement.amount.toFixed(2)}) as
              settled.
            </p>
            <button
              onClick={onUndoSettlement}
              disabled={deleteExpense.isPending}
              className="shrink-0 text-sm font-medium text-rose-600 hover:underline disabled:opacity-50"
            >
              {deleteExpense.isPending ? 'Undoing…' : 'Undo'}
            </button>
          </div>
        )}
        {suggestions?.length === 0 && <p className="text-sm text-slate-500">Everyone is settled up!</p>}
        {suggestions?.map((s) => (
          <SettlementSuggestionCard
            key={`${s.fromUserId}-${s.toUserId}`}
            suggestion={s}
            recording={recordingKey === `${s.fromUserId}-${s.toUserId}`}
            onRecord={() => onRecordSettlement(s.fromUserId, s.toUserId, s.fromUserName, s.toUserName, s.amount)}
          />
        ))}
      </div>

      <Link
        to={`/groups/${groupId}/transactions`}
        className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
      >
        <span className="text-sm text-slate-600 dark:text-slate-300">
          Total spent · {totalCount} expense{totalCount === 1 ? '' : 's'}
        </span>
        <span className="font-semibold text-amber-600 dark:text-amber-400">${totalSpent.toFixed(2)}</span>
      </Link>
    </div>
  );
}
