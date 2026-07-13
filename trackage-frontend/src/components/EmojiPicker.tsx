import { CURATED_CATEGORY_EMOJIS } from '../lib/categoryIcons';

export function EmojiPicker({ value, onChange }: { value: string; onChange: (emoji: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {CURATED_CATEGORY_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={`flex h-9 w-9 items-center justify-center rounded-md text-lg transition ${
            value === emoji
              ? 'bg-brand-600'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
          }`}
          aria-label={`Choose ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
