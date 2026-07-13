import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../lib/apiClient';
import { formatMmSs, useCountdown } from '../lib/useCountdown';

export function VerifyEmailPage() {
  const { verifySignup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialState = location.state as { email?: string; otpExpiresAt?: string } | null;
  const [email, setEmail] = useState(initialState?.email ?? '');
  const [code, setCode] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(initialState?.otpExpiresAt ?? null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const remainingSeconds = useCountdown(otpExpiresAt);
  const expired = otpExpiresAt !== null && remainingSeconds === 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await verifySignup(email, code);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not verify that code'));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const res = await authApi.resendVerification(email);
      setOtpExpiresAt(res.otpExpiresAt);
      setInfo('A new code has been sent.');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not resend the code'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-2 text-2xl font-bold text-brand-700 dark:text-brand-400">Verify your email</h1>
      <p className="mb-6 text-sm text-slate-500">
        Enter the 6-digit code we sent to your email to activate your account.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Verification code</label>
          <input
            required
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-lg tracking-[0.5em] dark:border-slate-700 dark:bg-slate-900"
          />
          {otpExpiresAt && (
            <p className={`mt-1 text-xs ${expired ? 'text-rose-600' : 'text-slate-400'}`}>
              {expired ? 'Code expired — send a new one below.' : `Code expires in ${formatMmSs(remainingSeconds)}`}
            </p>
          )}
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {info && <p className="text-sm text-brand-700 dark:text-brand-400">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Verify'}
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={resending || !email}
          className={`w-full rounded-md py-2 text-sm font-medium disabled:opacity-50 ${
            expired
              ? 'border border-brand-600 text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100'
          }`}
        >
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/login" className="font-medium text-brand-700 dark:text-brand-400">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
