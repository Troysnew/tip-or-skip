import { useColorScheme } from 'react-native';
import type { Verdict } from './data/services';

// Modern Mint tokens (design/modern-mint/tokens/modern-mint.json, release 1.0).
// Mint is a surface in light mode and a foreground in dark mode; teal carries light-mode links and small text.
const light = {
  bg: '#F6F8F6', surface: '#FFFFFF', sunk: '#E9EEEB', line: '#DAE2DD', border: '#7E8E86',
  ink: '#182322', muted: '#53625D',
  accent: '#12745F', accentInk: '#FFFFFF',
  selected: '#182322', onSelected: '#ACF4CE',
  result: '#ACF4CE', onResult: '#182322',
  suggestedBg: '#FFF0BF', suggestedText: '#6D4C00',
  warn: '#A32C33',
  tile: '#182322', // app-bar symbol tile
  yes: '#182322', yesBg: '#ACF4CE',
  maybe: '#543C00', maybeBg: '#FFE4A0',
  no: '#293E47', noBg: '#DFE6E9',
  info: '#244A78', infoBg: '#DDEBFF',
  scrim: 'rgba(16,26,24,0.5)',
};

const dark: typeof light = {
  bg: '#101A18', surface: '#1B2B27', sunk: '#253A33', line: '#3B5248', border: '#708E80',
  ink: '#F4F8F5', muted: '#B5C8BE',
  accent: '#ACF4CE', accentInk: '#182322',
  selected: '#ACF4CE', onSelected: '#182322',
  result: '#ACF4CE', onResult: '#182322',
  suggestedBg: '#493B15', suggestedText: '#FFE4A0',
  warn: '#FFC2C4',
  tile: '#253A33',
  yes: '#182322', yesBg: '#ACF4CE',
  maybe: '#543C00', maybeBg: '#FFE4A0',
  no: '#293E47', noBg: '#DFE6E9',
  info: '#244A78', infoBg: '#DDEBFF',
  scrim: 'rgba(0,0,0,0.6)',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export function verdictColors(c: Colors, v: Verdict) {
  switch (v) {
    case 'expected': return { fg: c.yes, bg: c.yesBg };
    case 'optional': return { fg: c.maybe, bg: c.maybeBg };
    case 'not': return { fg: c.no, bg: c.noBg };
    case 'included': return { fg: c.info, bg: c.infoBg };
  }
}

/** fontFamily role names read by components/Text. TextInput needs a real file name: use font() from fonts.ts. */
export const mono = 'mono';
export const display = 'display';

/** Modern Mint layout values. */
export const space = { screen: 20, controlRadius: 12, cardRadius: 20, target: 48 };
