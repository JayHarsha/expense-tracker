import { colorForId, initialsFor } from '../lib/avatarColor';

export function Avatar({ id, name, size = 36 }: { id: number; name: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ backgroundColor: colorForId(id), width: size, height: size, fontSize: size * 0.4 }}
      title={name}
    >
      {initialsFor(name)}
    </div>
  );
}
