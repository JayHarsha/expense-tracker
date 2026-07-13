import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { updateProfile } from '../api/users';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../lib/apiClient';

const AVATAR_SIZE = 128;

/** Resize the chosen image to a small square JPEG data URL so it stays a few KB. */
function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      // Center-crop to a square, then scale down.
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image'));
    };
    img.src = url;
  });
}

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null); // null = unchanged, '' = remove
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const displayedAvatar = pendingAvatar === null ? user.avatar : pendingAvatar || null;
  const dirty = name.trim() !== user.name || pendingAvatar !== null;

  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setError(null);
    try {
      setPendingAvatar(await fileToAvatarDataUrl(file));
      setSaved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that image');
    }
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const updated = await updateProfile({
        ...(name.trim() !== user.name ? { name: name.trim() } : {}),
        ...(pendingAvatar !== null ? { avatar: pendingAvatar } : {}),
      });
      updateUser(updated);
      setPendingAvatar(null);
      setSaved(true);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save your profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-100">
          ← Back
        </Link>
        <h1 className="text-xl font-bold">Your profile</h1>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Avatar id={user.id} name={name || user.name} avatar={displayedAvatar} size={96} />
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="font-medium text-brand-700 hover:underline dark:text-brand-400"
          >
            Change picture
          </button>
          {displayedAvatar && (
            <button
              type="button"
              onClick={() => {
                setPendingAvatar('');
                setSaved(false);
              }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            required
            maxLength={100}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            value={user.email}
            disabled
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
          />
          <p className="mt-1 text-xs text-slate-400">Email can't be changed — it's how your account is identified.</p>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {saved && !dirty && <p className="text-sm text-brand-700 dark:text-brand-400">Profile saved.</p>}

        <button
          type="submit"
          disabled={saving || !dirty || !name.trim()}
          className="w-full rounded-md bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
