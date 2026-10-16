// Brand fonts from the design review: Bricolage Grotesque (display), Inter (UI), JetBrains Mono (money).
// All three are SIL Open Font License 1.1; the license files ship inside each @expo-google-fonts package.
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';

export const FONT_FILES = {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
};

export type FontKind = 'body' | 'display' | 'mono';

/** Pick the loaded font file for a family and weight. Custom fonts carry their weight in the file, not in fontWeight. */
export function font(kind: FontKind, weight: number = 400): string {
  if (kind === 'display') return weight >= 800 ? 'BricolageGrotesque_800ExtraBold' : 'BricolageGrotesque_700Bold';
  if (kind === 'mono') return weight >= 700 ? 'JetBrainsMono_700Bold' : 'JetBrainsMono_500Medium';
  if (weight >= 700) return 'Inter_700Bold';
  if (weight >= 600) return 'Inter_600SemiBold';
  if (weight >= 500) return 'Inter_500Medium';
  return 'Inter_400Regular';
}

export function weightOf(w: unknown): number {
  if (w === 'bold') return 700;
  if (w === 'normal' || w == null) return 400;
  const n = Number(w);
  return Number.isFinite(n) ? n : 400;
}
