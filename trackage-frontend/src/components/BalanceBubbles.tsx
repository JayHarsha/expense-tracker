import { useMemo, useState } from 'react';
import type { Balance } from '../types';

const FOCUS_MIN = 100;
const FOCUS_MAX = 240;
const SECONDARY_MIN = 60;
const SECONDARY_MAX = 130;
const ZERO_EPSILON = 0.005;

function sizeFor(amount: number, maxAmount: number, min: number, max: number) {
  if (maxAmount <= 0) return min;
  const ratio = Math.sqrt(Math.min(amount / maxAmount, 1));
  return Math.round(min + (max - min) * ratio);
}

function Bubble({ balance, size, big }: { balance: Balance; size: number; big?: boolean }) {
  const isZero = Math.abs(balance.balance) < ZERO_EPSILON;
  const isDebtor = balance.balance < 0;
  const bg = isZero ? 'bg-slate-400 dark:bg-slate-600' : isDebtor ? 'bg-amber-500' : 'bg-amber-800';

  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center rounded-full text-center text-white ${bg}`}
      style={{ width: size, height: size }}
    >
      <span className={big ? 'text-sm opacity-90' : 'text-xs opacity-90'}>{balance.userName}</span>
      <span className={big ? 'text-2xl font-bold' : 'text-sm font-semibold'}>
        ${Math.abs(balance.balance).toFixed(2)}
      </span>
      {big && !isZero && (
        <span className="text-xs opacity-80">{isDebtor ? 'should pay' : 'should receive'}</span>
      )}
      {big && isZero && <span className="text-xs opacity-80">settled up</span>}
    </div>
  );
}

export function BalanceBubbles({ balances }: { balances: Balance[] }) {
  const [page, setPage] = useState(0);
  const maxAbs = useMemo(() => Math.max(1, ...balances.map((b) => Math.abs(b.balance))), [balances]);

  if (balances.length === 0) return null;

  return (
    <div>
      <div
        className="flex snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          const idx = Math.round(el.scrollLeft / el.clientWidth);
          if (idx !== page) setPage(idx);
        }}
      >
        {balances.map((focused) => {
          const others = balances.filter((b) => b.userId !== focused.userId);
          return (
            <div
              key={focused.userId}
              className="flex w-full shrink-0 snap-center flex-col items-center gap-4 px-6 py-4"
            >
              <Bubble balance={focused} size={sizeFor(Math.abs(focused.balance), maxAbs, FOCUS_MIN, FOCUS_MAX)} big />
              {others.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {others.map((o) => (
                    <Bubble key={o.userId} balance={o} size={sizeFor(Math.abs(o.balance), maxAbs, SECONDARY_MIN, SECONDARY_MAX)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {balances.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {balances.map((b, i) => (
            <span
              key={b.userId}
              className={`h-1.5 w-1.5 rounded-full ${i === page ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
