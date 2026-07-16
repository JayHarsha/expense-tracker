/**
 * Formats an expense for the list/detail views using the *transaction* date the
 * user picked (`date`, "YYYY-MM-DD") together with the *added* time-of-day
 * (`createdAt`, ISO instant).
 *
 * - Today's transactions show "Today at HH:MM".
 * - Any other day shows the transaction date, e.g. "14 Jul 2026 at HH:MM" —
 *   never a relative "2 days ago", so a back-dated expense reads by its real date.
 */
export function formatExpenseDate(date: string, createdAt?: string | null): string {
  const txn = parseLocalDate(date);
  if (!txn) return date;

  const timePart = createdAt ? timeOfDay(createdAt) : null;

  const now = new Date();
  const isToday =
    txn.getFullYear() === now.getFullYear() &&
    txn.getMonth() === now.getMonth() &&
    txn.getDate() === now.getDate();

  const datePart = isToday
    ? 'Today'
    : txn.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

  return timePart ? `${datePart} at ${timePart}` : datePart;
}

/** Parses "YYYY-MM-DD" as a local date (avoids the UTC shift of `new Date(str)`). */
function parseLocalDate(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
