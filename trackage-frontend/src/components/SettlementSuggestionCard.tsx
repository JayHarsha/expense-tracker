import type { SettlementSuggestion } from '../types';

export function SettlementSuggestionCard({
  suggestion,
  onRecord,
  recording,
}: {
  suggestion: SettlementSuggestion;
  onRecord: () => void;
  recording: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800 dark:bg-brand-900/20">
      <p className="text-sm">
        <span className="font-semibold">{suggestion.fromUserName}</span> pays{' '}
        <span className="font-semibold">{suggestion.toUserName}</span>{' '}
        <span className="font-semibold">${suggestion.amount.toFixed(2)}</span>
      </p>
      <button
        onClick={onRecord}
        disabled={recording}
        className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {recording ? 'Recording…' : 'Mark settled'}
      </button>
    </div>
  );
}
