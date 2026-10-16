import type { Service } from './data/services';
import { defaultOption, type RoundMode, type TipBase } from './lib/tip';

export interface CalcState {
  serviceId: string | null;
  bill: string;
  tax: string;
  base: TipBase;
  pct: number;
  round: RoundMode;
  split: number;
  qty: number;
  flatAmount: string;
}

export const initialCalc: CalcState = {
  serviceId: null,
  bill: '',
  tax: '',
  base: 'pre',
  pct: 18,
  round: 'none',
  split: 1,
  qty: 1,
  flatAmount: '',
};

/** Poll answers this device has given, keyed by service id. */
export type Polls = Record<string, string>;

/** Load a service's recommended tip into the calculator. */
export function withService(state: CalcState, s: Service): CalcState {
  const def = defaultOption(s);
  if (s.flat) return { ...state, serviceId: s.id, flatAmount: String(def), qty: 1 };
  return { ...state, serviceId: s.id, pct: def };
}
