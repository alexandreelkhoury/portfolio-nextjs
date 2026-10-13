/** The margin figure's resting box on wide screens, in viewport pixels (mirrors --fr and --gutter). */
export function marginRect(W: number, vh: number) {
  const fr = Math.min(440, Math.max(300, W * 0.26));
  const gutter = Math.min(56, Math.max(16, W * 0.04));
  const w = fr - 24;
  return { x: W - gutter - w, y: vh * 0.5 - 0.54 * (w + 46), w };
}
