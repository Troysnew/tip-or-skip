// Modern Mint typography: one Inter family, supplied as static files in assets/fonts (SIL OFL, see OFL.txt).
//   Display  Inter ExtraBold 800  titles
//   Logo     Inter Black 900      wordmark
//   Body     Inter Regular 400    reading text
//   Medium   Inter SemiBold 600   labels and emphasis
//   Amount   Inter SemiBold 600   money, with tabular figures turned on in components/Text
export const FONT_FILES = {
  'Inter-Body': require('../assets/fonts/Inter-body.ttf'),
  'Inter-Medium': require('../assets/fonts/Inter-medium.ttf'),
  'Inter-Display': require('../assets/fonts/Inter-display.ttf'),
  'Inter-Logo': require('../assets/fonts/Inter-logo.ttf'),
  'Inter-Amount': require('../assets/fonts/Inter-amount.ttf'),
};

export type FontKind = 'body' | 'display' | 'mono' | 'logo';

/** Pick the static font file for a role and weight. Each file carries its own weight, so fontWeight is never synthesized. */
export function font(kind: FontKind, weight: number = 400): string {
  if (kind === 'logo') return 'Inter-Logo';
  if (kind === 'display') return 'Inter-Display';
  if (kind === 'mono') return 'Inter-Amount';
  return weight >= 500 ? 'Inter-Medium' : 'Inter-Body';
}

export function weightOf(w: unknown): number {
  if (w === 'bold') return 700;
  if (w === 'normal' || w == null) return 400;
  const n = Number(w);
  return Number.isFinite(n) ? n : 400;
}
