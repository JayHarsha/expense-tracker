import { Link } from 'react-router-dom';
import { formatExpenseDate } from '../lib/formatExpenseDate';
import type { Expense } from '../types';
import { Avatar } from './Avatar';

export function ExpenseListItem({ expense, currentUserId }: { expense: Expense; currentUserId: number }) {
  const yourSplit = expense.splits.find((s) => s.userId === currentUserId)?.amount ?? 0;
  const youPaid = expense.paidByUserId === currentUserId;
  const net = youPaid ? expense.amount - yourSplit : -yourSplit;
  const others = expense.splits.filter((s) => s.userId !== expense.paidByUserId);

  return (
    <Link
      to={`/groups/${expense.groupId}/expenses/${expense.id}/edit`}
      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand-400 dark:border-slate-800"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: expense.categoryColor ?? '#94a3b8' }}
        >
          {expense.categoryIcon ?? '📄'}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{expense.description || expense.categoryName || 'Expense'}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {formatExpenseDate(expense.date, expense.createdAt)}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">{expense.paidByName}</span> paid for{' '}
            {others.length} {others.length === 1 ? 'person' : 'people'}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {others.length > 0 && (
          <div className="hidden -space-x-2 sm:flex">
            {others.slice(0, 3).map((s) => (
              <Avatar key={s.userId} id={s.userId} name={s.userName} size={24} />
            ))}
          </div>
        )}
        <div className="text-right">
          <p className="font-semibold text-amber-600 dark:text-amber-400">${expense.amount.toFixed(2)}</p>
          {net !== 0 && (
            <p className={`text-xs font-medium ${net > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {net > 0 ? '+' : ''}
              {net.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
