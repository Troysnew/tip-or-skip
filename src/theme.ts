import { useColorScheme } from 'react-native';
import type { Verdict } from './data/services';

// Palette from the design team's brand review (Oct 16, 2026).
// brass = decorative only (borders, chart bars). brassText = brass for text, which passes 4.5:1.
// "Skip it" uses calm slate so it does not read as a warning.
const light = {
  bg: '#EEF2EE', surface: '#FFFFFF', sunk: '#E3E9E4', line: '#CDD6CF',
  ink: '#10291F', muted: '#50645A', accent: '#1F6B4A', accentInk: '#FFFFFF',
  brass: '#C08A1E', brassText: '#855C0C',
  yes: '#1F6B4A', yesBg: '#DCEFE4', maybe: '#8A5A00', maybeBg: '#F6EBCF',
  no: '#4F5963', noBg: '#E6EAEE', info: '#2F5574', infoBg: '#DFE9F2', scrim: 'rgba(5,15,10,0.45)',
  warn: '#8A3A2E',
  border: '#708477', // interactive control outlines, 3:1 against surfaces
};

const dark: typeof light = {
  bg: '#0D1712', surface: '#15251C', sunk: '#1C2D25', line: '#2C4237',
  ink: '#E4EEE7', muted: '#ADBFB3', accent: '#5FC495', accentInk: '#0D1712',
  brass: '#E0AE4A', brassText: '#E0AE4A',
  yes: '#7AD4A6', yesBg: '#173B2A', maybe: '#E8C26E', maybeBg: '#3A2F14',
  no: '#BBC5CE', noBg: '#253039', info: '#9CC3E6', infoBg: '#1B2E40', scrim: 'rgba(0,0,0,0.6)',
  warn: '#F0A898',
  border: '#668272',
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

/** fontFamily sentinels read by components/Text. TextInput needs a real file name: use font() from fonts.ts. */
export const mono = 'mono';
export const display = 'display';
