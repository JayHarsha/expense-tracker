import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../lib/apiClient';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const message = extractErrorMessage(err, 'Invalid email or password');
      setError(message);
      setNeedsVerification(message.toLowerCase().includes('verify'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-brand-700 dark:text-brand-400">Log in to Trackage</h1>
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
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        {error && (
          <p className="text-sm text-rose-600">
            {error}
            {needsVerification && (
              <>
                {' '}
                <Link
                  to="/verify-email"
                  state={{ email }}
                  className="font-medium text-brand-700 underline dark:text-brand-400"
                >
                  Verify now
                </Link>
              </>
            )}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <div className="mt-4">
        <GoogleSignInButton />
      </div>
      <div className="mt-4 flex justify-between text-sm text-slate-500">
        <Link to="/forgot-password" className="font-medium text-brand-700 dark:text-brand-400">
          Forgot password?
        </Link>
        <span>
          No account?{' '}
          <Link to="/signup" className="font-medium text-brand-700 dark:text-brand-400">
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
}
