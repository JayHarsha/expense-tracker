import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../lib/apiClient';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signup(name, email, password);
      navigate('/verify-email', { state: { email: res.email, otpExpiresAt: res.otpExpiresAt } });
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create your account'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-brand-700 dark:text-brand-400">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
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
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
          <p className="mt-1 text-xs text-slate-400">At least 8 characters</p>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <div className="mt-4">
        <GoogleSignInButton />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-700 dark:text-brand-400">
          Log in
        </Link>
      </p>
    </div>
  );
}
