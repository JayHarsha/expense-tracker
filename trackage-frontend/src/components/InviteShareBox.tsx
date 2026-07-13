import { useState } from 'react';

export function InviteShareBox({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Invite code</p>
        <p className="font-mono text-lg tracking-widest">{inviteCode}</p>
      </div>
      <button
        onClick={copy}
        className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
