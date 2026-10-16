import type { Service } from './data/services';
import { defaultOption, type RoundMode, type TipBase } from './lib/tip';

export interface Person {
  id: string;
  name: string;
  amount: string;
}

export type SplitMode = 'even' | 'items';

export interface CalcState {
  serviceId: string | null;
  bill: string;
  tax: string;
  base: TipBase;
  pct: number;
  round: RoundMode;
  split: number;
  splitMode: SplitMode;
  people: Person[];
  shared: string;
  qty: number;
  flatAmount: string;
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const blankPeople = (): Person[] => [
  { id: newId(), name: '', amount: '' },
  { id: newId(), name: '', amount: '' },
];

export const initialCalc: CalcState = {
  serviceId: null,
  bill: '',
  tax: '',
  base: 'pre',
  pct: 18,
  round: 'none',
  split: 1,
  splitMode: 'even',
  people: blankPeople(),
  shared: '',
  qty: 1,
  flatAmount: '',
};

/** Poll answers this device has given, keyed by service id. */
export type Polls = Record<string, string>;

/** Load a service's recommended tip into the calculator. */
export function withService(state: CalcState, s: Service): CalcState {
  const def = defaultOption(s);
  if (s.flat) return { ...state, serviceId: s.id, flatAmount: String(def), qty: 1, splitMode: 'even' };
  return { ...state, serviceId: s.id, pct: def };
}

/* ---------- Pro data ---------- */

export interface HistoryEntry {
  id: string;
  at: number;
  serviceId: string | null;
  label: string;
  bill: number;
  tip: number;
  total: number;
  pct: number | null;
  split: number;
}

/** The calculator settings a preset restores. Bill and tax are never saved. */
export type PresetSettings = Pick<CalcState, 'serviceId' | 'pct' | 'base' | 'round' | 'split' | 'splitMode' | 'flatAmount' | 'qty'> & { peopleNames: string[] };

export interface Preset {
  id: string;
  name: string;
  settings: PresetSettings;
}

export function presetFrom(state: CalcState, name: string): Preset {
  return {
    id: newId(),
    name,
    settings: {
      serviceId: state.serviceId,
      pct: state.pct,
      base: state.base,
      round: state.round,
      split: state.split,
      splitMode: state.splitMode,
      flatAmount: state.flatAmount,
      qty: state.qty,
      peopleNames: state.splitMode === 'items' ? state.people.map((p) => p.name) : [],
    },
  };
}

export function applyPreset(state: CalcState, p: Preset): CalcState {
  const { peopleNames, ...rest } = p.settings;
  const people = peopleNames.length ? peopleNames.map((name) => ({ id: newId(), name, amount: '' })) : state.people;
  return { ...state, ...rest, people };
}

export interface HolidayItem {
  id: string;
  who: string;
  templateId?: string;
  amount: string;
  given: boolean;
}

export interface HolidayPlan {
  year: number;
  items: HolidayItem[];
}
