import { useState } from 'react';
import { useCreateCategory } from '../api/categories';
import { DEFAULT_CATEGORY_EMOJI } from '../lib/categoryIcons';
import type { Category } from '../types';
import { EmojiPicker } from './EmojiPicker';

export function CategoryPicker({
  groupId,
  categories,
  value,
  onChange,
}: {
  groupId: number;
  categories: Category[];
  value: number | null;
  onChange: (categoryId: number) => void;
}) {
  const createCategory = useCreateCategory(groupId);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState(DEFAULT_CATEGORY_EMOJI);

  const submitNewCategory = async () => {
    if (!newName.trim()) return;
    const category = await createCategory.mutateAsync({ groupId, name: newName.trim(), icon: newIcon });
    onChange(category.id);
    setAdding(false);
    setNewName('');
    setNewIcon(DEFAULT_CATEGORY_EMOJI);
  };

  if (adding) {
    return (
      <div className="space-y-3 rounded-md border border-slate-300 p-3 dark:border-slate-700">
        <input
          autoFocus
          placeholder="Category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
        <EmojiPicker value={newIcon} onChange={setNewIcon} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submitNewCategory}
            disabled={createCategory.isPending || !newName.trim()}
            className="flex-1 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Add category
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="rounded-md px-3 py-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <select
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="" disabled>
          Select a category
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon ?? DEFAULT_CATEGORY_EMOJI} {c.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="shrink-0 rounded-md border border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        + New
      </button>
    </div>
  );
}
