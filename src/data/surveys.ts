// Published survey figures. Copied verbatim from the sources listed in DataScreen.

export type PewKey = 'restaurant' | 'fastcasual' | 'delivery' | 'coffee' | 'bar' | 'rideshare' | 'haircut';
export type BankrateKey = 'restaurant' | 'haircut' | 'delivery' | 'housekeeping' | 'coffee' | 'takeout';

/** Pew Research Center, Aug 7-27, 2023, n=11,945. Always / Often / Sometimes / Rarely / Never, among people who use the service. */
export const PEW: Record<PewKey, [number, number, number, number, number]> = {
  restaurant: [81, 11, 6, 1, 1],
  fastcasual: [7, 5, 17, 25, 45],
  delivery: [59, 17, 14, 5, 4],
  coffee: [12, 12, 27, 23, 25],
  bar: [53, 18, 16, 7, 7],
  rideshare: [43, 18, 21, 9, 10],
  haircut: [65, 13, 12, 5, 5],
};

export const PEW_LABEL: Record<PewKey, string> = {
  restaurant: 'a sit-down restaurant',
  fastcasual: 'a fast casual restaurant',
  delivery: 'food delivery',
  coffee: 'a coffee shop',
  bar: 'a bar',
  rideshare: 'taxi or rideshare',
  haircut: 'a haircut',
};

export const FREQ = ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'];

/** Pew: tip left for average food and service at a sit-down restaurant. */
export const PEW_AMOUNT: [string, number][] = [
  ['No tip', 2],
  ['Less than 15%', 18],
  ['15%', 37],
  ['18%', 12],
  ['20%', 22],
  ['More than 20%', 2],
  ['Other amount', 7],
];

/** Share who pick each restaurant tip percent (Pew), shown under the tip buttons. */
export const PEW_PICK: Record<number, number> = { 15: 37, 18: 12, 20: 22 };

/** Bankrate tipping survey, April 23-25, 2025, n=2,445. Share who always tip. */
export const BANKRATE: Record<BankrateKey, number> = {
  restaurant: 70,
  haircut: 54,
  delivery: 52,
  housekeeping: 25,
  coffee: 18,
  takeout: 12,
};
