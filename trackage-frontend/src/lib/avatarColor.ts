const PALETTE = [
  '#27ab83', '#4d96ff', '#ff8a5c', '#c780fa', '#ff6b6b', '#00c2cb', '#ffb84d', '#6bcb77',
];

export function colorForId(id: number | string): string {
  const key = String(id);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
}
