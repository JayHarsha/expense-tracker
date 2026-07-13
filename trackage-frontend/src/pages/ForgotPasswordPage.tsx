import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import { extractErrorMessage } from '../lib/apiClient';
import { formatMmSs, useCountdown } from '../lib/useCountdown';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const remainingSeconds = useCountdown(otpExpiresAt);
  const expired = otpExpiresAt !== null && remainingSeconds === 0;

  const onRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setOtpExpiresAt(res.otpExpiresAt);
      setStep('reset');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not send a reset code'));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const res = await authApi.forgotPassword(email);
      setOtpExpiresAt(res.otpExpiresAt);
      setInfo('A new code has been sent.');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not resend the code'));
    } finally {
      setResending(false);
    }
  };

  const onReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      navigate('/login');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not reset your password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-2 text-2xl font-bold text-brand-700 dark:text-brand-400">Reset your password</h1>

      {step === 'request' ? (
        <form onSubmit={onRequest} className="space-y-4">
          <p className="text-sm text-slate-500">Enter your account email and we'll send you a reset code.</p>
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
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send reset code'}
          </button>
        </form>
      ) : (
        <form onSubmit={onReset} className="space-y-4">
          <p className="text-sm text-slate-500">Enter the code we sent to {email} and choose a new password.</p>
          <div>
            <label className="mb-1 block text-sm font-medium">Code</label>
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
          <div>
            <label className="mb-1 block text-sm font-medium">New password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {info && <p className="text-sm text-brand-700 dark:text-brand-400">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className={`w-full rounded-md py-2 text-sm font-medium disabled:opacity-50 ${
              expired
                ? 'border border-brand-600 text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/login" className="font-medium text-brand-700 dark:text-brand-400">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
