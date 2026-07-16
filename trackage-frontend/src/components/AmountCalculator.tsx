import { useEffect, useState } from 'react';
import { evalExpression } from '../lib/evalExpression';

const KEYS = ['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+'];

/**
 * On-screen calculator keypad for the amount field. Supports +, −, ×, ÷ and
 * parentheses, evaluates live, and pushes the running numeric result up via
 * `onChange` (empty string when cleared) so the split editor stays in sync.
 * Physical-keyboard input is supported too. The parent handles click-outside /
 * Escape to dismiss.
 */
export function AmountCalculator({
  initial,
  onChange,
  onClose,
}: {
  initial: string;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const [expr, setExpr] = useState(initial);
  const result = evalExpression(expr);

  useEffect(() => {
    if (expr.trim() === '') onChange('');
    else if (result !== null) onChange(String(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr, result]);

  const press = (key: string) => {
    if (key === 'C') setExpr('');
    else setExpr((e) => e + (key === '÷' ? '÷' : key === '×' ? '×' : key === '−' ? '−' : key));
  };
  const backspace = () => setExpr((e) => e.slice(0, -1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { key } = e;
      if (/[0-9.()]/.test(key)) setExpr((v) => v + key);
      else if (key === '+' || key === '-') setExpr((v) => v + (key === '-' ? '−' : '+'));
      else if (key === '*') setExpr((v) => v + '×');
      else if (key === '/') setExpr((v) => v + '÷');
      else if (key === 'Backspace') setExpr((v) => v.slice(0, -1));
      else if (key === 'Enter') onClose();
      else return;
      e.preventDefault(); // keep Enter/operators from bubbling to the form
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="rounded-lg border border-slate-300 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 rounded-md bg-slate-100 px-3 py-2 text-right dark:bg-slate-800">
        <div className="min-h-5 truncate text-sm text-slate-500 dark:text-slate-400">{expr || ' '}</div>
        <div className="text-xl font-semibold">{result !== null ? result.toFixed(2) : '—'}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className={`rounded-md py-3 text-base font-medium transition ${
              key === 'C'
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                : '+−×÷()'.includes(key)
                  ? 'bg-slate-100 text-brand-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-brand-400'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800'
            }`}
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={() => press('0')}
          className="rounded-md bg-slate-100 py-3 text-base font-medium hover:bg-slate-200 dark:bg-slate-800"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => press('.')}
          className="rounded-md bg-slate-100 py-3 text-base font-medium hover:bg-slate-200 dark:bg-slate-800"
        >
          .
        </button>
        <button
          type="button"
          onClick={backspace}
          className="rounded-md bg-slate-100 py-3 text-base font-medium hover:bg-slate-200 dark:bg-slate-800"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-brand-600 py-3 text-base font-medium text-white hover:bg-brand-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}
