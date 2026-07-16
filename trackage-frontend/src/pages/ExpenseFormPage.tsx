import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '../api/categories';
import { useCreateExpense, useDeleteExpense, useExpense, useUpdateExpense } from '../api/expenses';
import { useGroupDetail } from '../api/groups';
import { AmountCalculator } from '../components/AmountCalculator';
import { CategoryPicker } from '../components/CategoryPicker';
import { SplitEditor } from '../components/SplitEditor';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../lib/apiClient';
import type { ExpenseSplitInput } from '../types';

export function ExpenseFormPage() {
  const { id, expenseId } = useParams();
  const groupId = Number(id);
  const isEditing = expenseId !== undefined;
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: group } = useGroupDetail(groupId);
  const { data: categories } = useCategories(groupId);
  const { data: existing } = useExpense(isEditing ? Number(expenseId) : undefined);
  const createExpense = useCreateExpense(groupId);
  const updateExpense = useUpdateExpense(groupId);
  const deleteExpense = useDeleteExpense(groupId);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [paidByUserId, setPaidByUserId] = useState<number | null>(user?.id ?? null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [splits, setSplits] = useState<ExpenseSplitInput[]>([]);
  const [splitsValid, setSplitsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialSplits, setInitialSplits] = useState<ExpenseSplitInput[] | undefined>(undefined);
  const [showCalc, setShowCalc] = useState(false);
  const calcWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCalc) return;
    const onPointerDown = (e: PointerEvent) => {
      if (calcWrapRef.current && !calcWrapRef.current.contains(e.target as Node)) setShowCalc(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCalc(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [showCalc]);

  const prefilled = useRef(false);
  useEffect(() => {
    if (existing && !prefilled.current) {
      prefilled.current = true;
      setAmount(String(existing.amount));
      setDescription(existing.description ?? '');
      setCategoryId(existing.categoryId);
      setPaidByUserId(existing.paidByUserId);
      setDate(existing.date);
      setInitialSplits(existing.splits.map((s) => ({ userId: s.userId, amount: s.amount })));
    }
  }, [existing]);

  const totalAmount = Number(amount) || 0;

  if (!group || !user || (isEditing && !existing)) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!categoryId || !paidByUserId || totalAmount <= 0 || !splitsValid) {
      setError('Fill in all fields and make sure the split adds up to the total.');
      return;
    }
    try {
      const payload = { groupId, paidByUserId, amount: totalAmount, description, categoryId, date, splits };
      if (isEditing) {
        await updateExpense.mutateAsync({ id: Number(expenseId), ...payload });
      } else {
        await createExpense.mutateAsync(payload);
      }
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save expense'));
    }
  };

  const onDelete = async () => {
    if (!isEditing || !confirm('Delete this expense?')) return;
    await deleteExpense.mutateAsync(Number(expenseId));
    navigate(`/groups/${groupId}`);
  };

  const saving = createExpense.isPending || updateExpense.isPending;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{isEditing ? 'Edit expense' : 'Add expense'}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dinner, cab, groceries…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div ref={calcWrapRef} className="relative">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Amount</label>
              <button
                type="button"
                onClick={() => setShowCalc(true)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-left dark:border-slate-700 dark:bg-slate-900"
              >
                {amount ? Number(amount).toFixed(2) : <span className="text-slate-400">0.00</span>}
              </button>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>
          {showCalc && (
            <div className="absolute left-0 right-0 z-20 mt-2">
              <AmountCalculator initial={amount} onChange={setAmount} onClose={() => setShowCalc(false)} />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <CategoryPicker groupId={groupId} categories={categories ?? []} value={categoryId} onChange={setCategoryId} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Paid by</label>
          <select
            value={paidByUserId ?? ''}
            onChange={(e) => setPaidByUserId(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {group.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id === user.id ? `${m.name} (you)` : m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Split</label>
          <SplitEditor
            members={group.members}
            totalAmount={totalAmount}
            initialSplits={initialSplits}
            onChange={(s, valid) => {
              setSplits(s);
              setSplitsValid(valid);
            }}
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save expense'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleteExpense.isPending}
            className="w-full rounded-md border border-rose-300 px-3 py-2 font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-800 dark:hover:bg-rose-950"
          >
            Delete expense
          </button>
        )}
      </form>
    </div>
  );
}
