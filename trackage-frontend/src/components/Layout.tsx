import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-bold text-brand-700 dark:text-brand-400">
              Trackage
            </Link>
            <Link
              to="/"
              className="text-sm text-slate-500 underline hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Home
            </Link>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <Link to="/profile" aria-label="Your profile" className="rounded-full transition hover:ring-2 hover:ring-brand-600">
                <Avatar id={user.id} name={user.name} avatar={user.avatar} size={32} />
              </Link>
              <button
                onClick={logout}
                className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
