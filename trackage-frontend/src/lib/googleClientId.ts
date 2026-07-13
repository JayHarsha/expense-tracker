// The OAuth client ID is public by design (it ships in every page Google serves),
// so hardcoding it here is fine. VITE_GOOGLE_CLIENT_ID can override it in dev.
// Empty string hides the "Sign in with Google" button entirely.
export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
