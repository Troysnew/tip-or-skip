// Holiday tipping suggestions. Amounts follow the Emily Post Institute's Holiday Tipping Guide
// (https://emilypost.com/advice/holiday-tipping-guide), checked against the page on Oct 18, 2026.
// Teacher is common guidance and still needs a source.

/** How the guide's suggestion turns into amounts the app can recommend. */
export type HolidayRec =
  /** A dollar range, e.g. "$10-30". `each` when it is per person (crews, staff). */
  | { kind: 'range'; lo: number; hi: number; each?: boolean }
  /** Relative to what you pay them, e.g. "up to one week's pay". `upTo` is a multiple of `unit`. */
  | { kind: 'pay'; unit: string; ask: string; upTo: number; orGift?: boolean }
  /** A gift, not cash. `max` when the guide or a rule caps its value. */
  | { kind: 'gift'; max?: number; around?: number };

export interface HolidayTemplate {
  id: string;
  who: string;
  guide: string;
  rec: HolidayRec;
  source: string;
}

const EPI = 'Emily Post Institute';
const COMMON = 'Common US guidance';
export const HOLIDAY_SOURCE_URL = 'https://emilypost.com/advice/holiday-tipping-guide';

export const HOLIDAY_TEMPLATES: HolidayTemplate[] = [
  // Home and family
  { id: 'cleaner', who: 'House cleaner', guide: "Up to one week's pay, and/or a small gift.", rec: { kind: 'pay', unit: 'week', ask: 'What do you pay them for a week?', upTo: 1 }, source: EPI },
  { id: 'sitter', who: 'Babysitter (regular)', guide: "Up to one evening's pay, plus a small gift from your kids.", rec: { kind: 'pay', unit: 'evening', ask: 'What do you pay for an evening?', upTo: 1 }, source: EPI },
  { id: 'nanny', who: 'Nanny or au pair', guide: "Up to one week's pay, plus a gift from your kids.", rec: { kind: 'pay', unit: 'week', ask: 'What do you pay them for a week?', upTo: 1 }, source: EPI },
  { id: 'livein', who: 'Live-in help (nanny, cook, housekeeper)', guide: "One week to one month of pay as a cash tip, plus a gift.", rec: { kind: 'pay', unit: 'week', ask: 'What do you pay them for a week?', upTo: 4 }, source: EPI },
  { id: 'daycare', who: 'Daycare staff', guide: '$25 to $70 for each staff member who works with your child, or a gift, plus a small gift from your child.', rec: { kind: 'range', lo: 25, hi: 70, each: true }, source: EPI },
  { id: 'teacher', who: 'Teacher', guide: 'A card or small gift. Check school gift limits.', rec: { kind: 'gift' }, source: COMMON },
  { id: 'caregiver', who: 'Personal caregiver', guide: "One week to one month of pay, or a gift.", rec: { kind: 'pay', unit: 'week', ask: 'What do you pay them for a week?', upTo: 4, orGift: true }, source: EPI },
  { id: 'nurse', who: 'Private nurse', guide: 'A thoughtful gift.', rec: { kind: 'gift' }, source: EPI },
  { id: 'homehealth', who: 'Home health aide', guide: "A thoughtful gift, if the agency allows it. Check the agency's policy first.", rec: { kind: 'gift' }, source: EPI },
  { id: 'nursinghome', who: 'Nursing home staff', guide: 'A gift the staff can share, like flowers or food.', rec: { kind: 'gift' }, source: EPI },
  // Personal care and pets
  { id: 'barber', who: 'Barber', guide: 'Up to the cost of one haircut, or a gift.', rec: { kind: 'pay', unit: 'haircut', ask: 'What does a haircut cost?', upTo: 1, orGift: true }, source: EPI },
  { id: 'stylist', who: 'Salon staff', guide: 'Up to the cost of one visit, split among the staff who work with you.', rec: { kind: 'pay', unit: 'visit', ask: 'What does a visit cost?', upTo: 1 }, source: EPI },
  { id: 'trainer', who: 'Personal trainer', guide: 'Up to the cost of one session, or a gift.', rec: { kind: 'pay', unit: 'session', ask: 'What does a session cost?', upTo: 1, orGift: true }, source: EPI },
  { id: 'massage', who: 'Massage therapist', guide: 'Up to the cost of one session, or a gift.', rec: { kind: 'pay', unit: 'session', ask: 'What does a session cost?', upTo: 1, orGift: true }, source: EPI },
  { id: 'dogwalker', who: 'Dog walker', guide: "Up to one week's pay, or a gift.", rec: { kind: 'pay', unit: 'week', ask: 'What do you pay them for a week?', upTo: 1, orGift: true }, source: EPI },
  { id: 'groomer', who: 'Pet groomer', guide: 'Up to the cost of one session, or a gift.', rec: { kind: 'pay', unit: 'session', ask: 'What does a grooming cost?', upTo: 1, orGift: true }, source: EPI },
  // Around the house
  { id: 'mail', who: 'Mail carrier (USPS)', guide: 'A small gift worth $20 or less. USPS rules allow no cash, checks, or gift cards.', rec: { kind: 'gift', max: 20 }, source: EPI },
  { id: 'package', who: 'Package delivery driver', guide: 'A small gift around $20, only if you get regular deliveries. Most companies discourage cash.', rec: { kind: 'gift', around: 20 }, source: EPI },
  { id: 'trash', who: 'Trash and recycling crew', guide: '$10 to $30 each. For a city service, check local rules first.', rec: { kind: 'range', lo: 10, hi: 30, each: true }, source: EPI },
  { id: 'newspaper', who: 'Newspaper delivery', guide: '$10 to $30, or a small gift.', rec: { kind: 'range', lo: 10, hi: 30 }, source: EPI },
  { id: 'lawn', who: 'Yard or garden worker', guide: '$20 to $50 each.', rec: { kind: 'range', lo: 20, hi: 50, each: true }, source: EPI },
  { id: 'pool', who: 'Pool cleaner', guide: 'Up to the cost of one cleaning, split among the crew.', rec: { kind: 'pay', unit: 'cleaning', ask: 'What does a cleaning cost?', upTo: 1 }, source: EPI },
  { id: 'handyman', who: 'Handyman', guide: '$15 to $40.', rec: { kind: 'range', lo: 15, hi: 40 }, source: EPI },
  // Apartment and building
  { id: 'doorman', who: 'Doorman', guide: '$15 to $80. With several doormen, $15 or more each. Or a gift.', rec: { kind: 'range', lo: 15, hi: 80 }, source: EPI },
  { id: 'super', who: 'Building superintendent', guide: '$20 to $80, or a gift.', rec: { kind: 'range', lo: 20, hi: 80 }, source: EPI },
  { id: 'elevator', who: 'Elevator operator', guide: '$15 to $40 each.', rec: { kind: 'range', lo: 15, hi: 40, each: true }, source: EPI },
  { id: 'garage', who: 'Garage attendant', guide: '$10 to $30, or a small gift.', rec: { kind: 'range', lo: 10, hi: 30 }, source: EPI },
];

const round5 = (v: number) => Math.round(v / 5) * 5;

/**
 * Amounts to offer as one-tap buttons, and the one to prefill when the person is added.
 * `base` is what the person usually pays them (for pay-based suggestions).
 */
export function holidaySuggestions(rec: HolidayRec, base = 0): { amounts: { label: string; value: number }[]; prefill: number | null } {
  if (rec.kind === 'range') {
    const mid = round5((rec.lo + rec.hi) / 2);
    const amounts = [rec.lo, mid, rec.hi].filter((v, i, a) => a.indexOf(v) === i).map((v) => ({ label: `$${v}`, value: v }));
    return { amounts, prefill: mid };
  }
  if (rec.kind === 'gift') {
    if (rec.max) return { amounts: [10, 15, rec.max].filter((v) => v <= rec.max!).map((v) => ({ label: `$${v} gift`, value: v })), prefill: rec.max };
    if (rec.around) return { amounts: [{ label: `$${rec.around} gift`, value: rec.around }], prefill: rec.around };
    return { amounts: [], prefill: null };
  }
  // Pay-based: "up to" the amount, so offer half and the full amount (and a month for week-to-month).
  if (!(base > 0)) return { amounts: [], prefill: null };
  const full = Math.round(base * Math.min(rec.upTo, 1));
  const amounts = [
    { label: `Half: $${Math.round(full / 2)}`, value: Math.round(full / 2) },
    { label: `${rec.upTo > 1 ? '1 week' : `1 ${rec.unit}`}: $${full}`, value: full },
  ];
  if (rec.upTo > 1) amounts.push({ label: `1 month: $${Math.round(base * rec.upTo)}`, value: Math.round(base * rec.upTo) });
  return { amounts, prefill: full };
}
