import type { Service } from '../data/services';
import { PEW_PICK } from '../data/surveys';

export type RoundMode = 'none' | 'tip' | 'total';
export type TipBase = 'pre' | 'post';

export const money = (n: number) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;

/** Parse a typed amount; anything that is not a positive number counts as 0. */
export function parseAmount(s: string) {
  const v = parseFloat((s || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export interface PctInput {
  bill: number;
  tax: number;
  base: TipBase;
  pct: number;
  round: RoundMode;
  split: number;
}

export function computePct(i: PctInput) {
  const tax = Math.min(i.tax, i.bill);
  const baseAmt = i.base === 'pre' ? i.bill - tax : i.bill;
  let tip = (baseAmt * i.pct) / 100;
  if (i.round === 'tip') tip = Math.round(tip);
  let total = i.bill + tip;
  if (i.round === 'total') {
    const t = Math.ceil(total - 1e-9);
    tip += t - total;
    total = t;
  }
  const split = Math.max(1, i.split);
  const each = Math.ceil((total / split) * 100 - 1e-9) / 100;
  const effectivePct = baseAmt > 0 ? (tip / baseAmt) * 100 : 0;
  return { baseAmt, tip, total, each, effectivePct, groupPays: each * split };
}

export function computeFlat(amount: number, qty: number, round: RoundMode, split: number) {
  let tip = amount * qty;
  if (round !== 'none') tip = Math.ceil(tip - 1e-9);
  const each = Math.ceil((tip / Math.max(1, split)) * 100 - 1e-9) / 100;
  return { tip, each };
}

export interface ItemizedInput {
  bill: number;
  tax: number;
  base: TipBase;
  pct: number;
  round: RoundMode;
  people: { name: string; amount: number }[];
  shared: number;
}

export interface ItemizedShare {
  name: string;
  food: number;
  tax: number;
  tip: number;
  total: number;
}

/**
 * Split a check by what each person ordered.
 * Shared items, and any part of the pre-tax subtotal nobody claimed, are split evenly.
 * Tax and tip are divided in proportion to each person's food.
 */
export function computeItemized(i: ItemizedInput) {
  const n = Math.max(1, i.people.length);
  const tax = Math.min(i.tax, i.bill || Infinity);
  const claimed = i.people.reduce((a, p) => a + p.amount, 0) + i.shared;
  const subtotal = i.bill > 0 ? i.bill - tax : claimed;
  const unassigned = Math.max(0, subtotal - claimed);
  const over = Math.max(0, claimed - subtotal);
  const evenPart = (i.shared + unassigned) / n;
  const foods = i.people.map((p) => p.amount + evenPart);
  const foodSum = foods.reduce((a, b) => a + b, 0);
  const billUsed = i.bill > 0 ? i.bill : claimed + tax;
  const whole = computePct({ bill: billUsed, tax, base: i.base, pct: i.pct, round: i.round, split: 1 });
  const shares: ItemizedShare[] = i.people.map((p, k) => {
    const w = foodSum > 0 ? foods[k] / foodSum : 1 / n;
    const t = tax * w;
    const tip = whole.tip * w;
    const total = Math.ceil((foods[k] + t + tip) * 100 - 1e-9) / 100;
    return { name: p.name, food: foods[k], tax: t, tip, total };
  });
  const collected = shares.reduce((a, s) => a + s.total, 0);
  return { shares, unassigned, over, tip: whole.tip, total: whole.total, collected };
}

/** Short norm text such as "15–20% of the bill" or "$2–$5 per night". */
export function normLabel(s: Service) {
  if (s.verdict === 'not') return 'No tip';
  if (s.verdict === 'included') return 'Tip on the bill';
  if (s.flat) {
    const [lo, hi] = s.flat;
    return `${lo === hi ? `$${lo}` : `$${lo}–$${hi}`} ${s.unit}`;
  }
  if (s.pct && s.pct[1] > 0) {
    const [lo, hi] = s.pct;
    return `${lo === hi ? `${lo}%` : `${lo}–${hi}%`} of the bill`;
  }
  if (s.id === 'caddie') return 'Flat amount per bag';
  return 'Round up if you like';
}

/** Whether the service has a range the calculator can use. */
export const canCalculate = (s: Service) => !!s.flat || !!(s.pct && s.pct[1] > 0);

/** The tip options to show as buttons for a service: its low, default, and high, padded to three. */
export function tipOptions(s: Service): number[] {
  const uniq = (a: number[]) => [...new Set(a)].sort((x, y) => x - y);
  if (s.flat) {
    const [lo, hi] = s.flat;
    return uniq([lo, Math.round((lo + hi) / 2), hi]);
  }
  const [lo, hi, def] = s.pct ?? [0, 0, 0];
  let a = uniq([lo, def, hi]);
  if (a.length < 3 && hi > lo) a = uniq([...a, Math.round((lo + hi) / 2)]);
  return a;
}

export function optionLabel(s: Service, v: number) {
  if (v === 0) return 'Skip';
  if (s.id === 'restaurant' && PEW_PICK[v]) return `${PEW_PICK[v]}% pick this`;
  const [lo, hi, def] = (s.flat ?? s.pct)!;
  if (v === def) return 'Typical';
  if (v === hi) return 'Great service';
  if (v === lo) return 'Basic';
  return '';
}

export const defaultOption = (s: Service) => (s.flat ?? s.pct ?? [0, 0, 0])[2];
