import { colorForId, initialsFor } from '../lib/avatarColor';

export function Avatar({
  id,
  name,
  avatar,
  size = 36,
}: {
  id: number;
  name: string;
  avatar?: string | null;
  size?: number;
}) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        title={name}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
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
