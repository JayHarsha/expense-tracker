import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCategories } from '../api/categories';
import { useExpenses } from '../api/expenses';
import { useGroupDetail } from '../api/groups';
import { ExpenseListItem } from '../components/ExpenseListItem';
import { useAuth } from '../context/AuthContext';
import type { Expense } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function groupByMonth(expenses: Expense[]): [string, Expense[]][] {
  const map = new Map<string, Expense[]>();
  for (const e of expenses) {
    const key = e.date.slice(0, 7); // "YYYY-MM"
    const group = map.get(key);
    if (group) {
      group.push(e);
    } else {
      map.set(key, [e]);
    }
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

export function TransactionsPage() {
  const { id } = useParams();
  const groupId = Number(id);
  const { user } = useAuth();

  const { data: group } = useGroupDetail(groupId);
  const { data: categories } = useCategories(groupId);
  const { data: expenses } = useExpenses(groupId);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [memberId, setMemberId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!expenses) return [];
    const term = search.trim().toLowerCase();
    return expenses.filter((e) => {
      if (term) {
        const haystack = `${e.description ?? ''} ${e.categoryName ?? ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (categoryId !== null && e.categoryId !== categoryId) return false;
      if (fromDate && e.date < fromDate) return false;
      if (toDate && e.date > toDate) return false;
      if (memberId !== null) {
        const involved = e.paidByUserId === memberId || e.splits.some((s) => s.userId === memberId);
        if (!involved) return false;
      }
      return true;
    });
  }, [expenses, search, categoryId, fromDate, toDate, memberId]);

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  const monthGroups = useMemo(() => groupByMonth(filtered), [filtered]);

  if (!group || !user) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link to={`/groups/${groupId}`} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-100">
          ← Back
        </Link>
        <h1 className="text-xl font-bold">Transactions</h1>
      </div>

      <input
        placeholder="Search transactions"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryId(null)}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg ${
            categoryId === null ? 'border-brand-600' : 'border-transparent bg-slate-100 dark:bg-slate-800'
          }`}
          title="All categories"
        >
          📋
        </button>
        {categories?.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg ${
              categoryId === c.id ? 'border-brand-600' : 'border-transparent'
            }`}
            style={{ backgroundColor: categoryId === c.id ? undefined : (c.color ?? '#94a3b8') + '33' }}
            title={c.name}
          >
            {c.icon ?? '📄'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Member</label>
          <select
            value={memberId ?? ''}
            onChange={(e) => setMemberId(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">Any member</option>
            {group.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3 dark:bg-slate-800">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {filtered.length} expense{filtered.length === 1 ? '' : 's'}
        </span>
        <span className="font-semibold text-amber-600 dark:text-amber-400">${total.toFixed(2)}</span>
      </div>

      <div className="space-y-6">
        {monthGroups.length === 0 && <p className="text-sm text-slate-500">No transactions match these filters.</p>}
        {monthGroups.map(([yearMonth, items]) => {
          const monthTotal = items.reduce((sum, e) => sum + e.amount, 0);
          return (
            <div key={yearMonth} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{monthLabel(yearMonth)}</h2>
                <span className="font-semibold text-amber-600 dark:text-amber-400">${monthTotal.toFixed(2)}</span>
              </div>
              {items.map((e) => (
                <ExpenseListItem key={e.id} expense={e} currentUserId={user.id} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
