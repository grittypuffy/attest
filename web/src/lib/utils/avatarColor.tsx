const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F97316",
  "#06B6D4",
  "#A855F7",
  "#EC4899",
  "#F59E0B",
];

export function getAvatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}
