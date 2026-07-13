import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../lib/apiClient';
import { GOOGLE_CLIENT_ID } from '../lib/googleClientId';

interface GoogleAccountsId {
  initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
  renderButton: (parent: HTMLElement, options: { theme: string; size: string; width?: number }) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

/**
 * Renders the official "Sign in with Google" button (Google Identity Services).
 * Hidden entirely when no client ID is configured, and resilient to the GIS
 * script still loading when the page mounts.
 */
export function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;
    let attempts = 0;

    const tryRender = () => {
      if (cancelled) return;
      const gsi = window.google?.accounts?.id;
      if (!gsi || !containerRef.current) {
        // GIS script loads async; retry briefly until it's available.
        if (attempts++ < 50) setTimeout(tryRender, 100);
        return;
      }
      gsi.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            await loginWithGoogle(credential);
            navigate('/');
          } catch (err) {
            setError(extractErrorMessage(err, 'Google sign-in failed'));
          }
        },
      });
      containerRef.current.replaceChildren();
      gsi.renderButton(containerRef.current, { theme: 'outline', size: 'large', width: 320 });
    };

    tryRender();
    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, navigate]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400">or</span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>
      <div ref={containerRef} className="flex justify-center" />
      {error && <p className="text-center text-sm text-rose-600">{error}</p>}
    </div>
  );
}
