import { useEffect, useState } from 'react';

/** Ticks down to `expiresAt` (ISO string) once per second. Returns remaining seconds (>= 0). */
export function useCountdown(expiresAt: string | null): number {
  const [remaining, setRemaining] = useState(() => secondsUntil(expiresAt));

  useEffect(() => {
    setRemaining(secondsUntil(expiresAt));
    if (!expiresAt) return;
    const interval = setInterval(() => setRemaining(secondsUntil(expiresAt)), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return remaining;
}

function secondsUntil(isoString: string | null): number {
  if (!isoString) return 0;
  return Math.max(0, Math.round((new Date(isoString).getTime() - Date.now()) / 1000));
}

export function formatMmSs(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
