import { Platform, useColorScheme } from 'react-native';
import type { Verdict } from './data/services';

const light = {
  bg: '#EEF2EE', surface: '#FFFFFF', sunk: '#E3E9E4', line: '#CDD6CF',
  ink: '#10291F', muted: '#4D6157', accent: '#1F6B4A', accentInk: '#FFFFFF', brass: '#C08A1E',
  yes: '#1F6B4A', yesBg: '#DCEFE4', maybe: '#8A5A00', maybeBg: '#F6EBCF',
  no: '#7A3B3B', noBg: '#F2E0DE', info: '#2F5574', infoBg: '#DFE9F2', scrim: 'rgba(5,15,10,0.45)',
};

const dark: typeof light = {
  bg: '#0D1712', surface: '#15231C', sunk: '#1C2D25', line: '#2C4237',
  ink: '#E4EEE7', muted: '#9DB2A6', accent: '#5FC495', accentInk: '#06150E', brass: '#E0AE4A',
  yes: '#7AD4A6', yesBg: '#173B2A', maybe: '#E8C26E', maybeBg: '#3A2F14',
  no: '#E6A4A0', noBg: '#3C2020', info: '#9CC3E6', infoBg: '#1B2E40', scrim: 'rgba(0,0,0,0.6)',
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

export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
