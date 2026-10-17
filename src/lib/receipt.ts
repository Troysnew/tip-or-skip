/**
 * Turns the text lines an on-device reader (ML Kit / Apple Vision) finds on a receipt photo
 * into line items and totals.
 *
 * The reader returns lines with axis-aligned boxes, in no reliable order, and it often reads
 * an item name and its price as two separate lines. So this:
 *   1. works out how tilted the photo is,
 *   2. rebuilds the printed rows from line positions,
 *   3. reads the price at the end of each row and sorts rows into items, subtotal, tax,
 *      service charge and total.
 * Nothing here is trusted blindly: the review screen shows the result and flags a mismatch
 * between the items and the printed subtotal.
 */

export interface OcrLine {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * The line's four corners, clockwise from the top-left of the text, as ML Kit reports them.
   * They carry the line's angle, which plain boxes lose on a tilted photo.
   */
  corners?: [number, number][];
}

export interface ReceiptItem {
  name: string;
  qty: number;
  /** Line total for this item, including priced add-ons. Negative for a discount. */
  price: number;
}

export interface ParsedReceipt {
  items: ReceiptItem[];
  /** Sum of discount lines, as a positive number. Already included in items as negative lines. */
  discount: number;
  subtotal: number | null;
  tax: number | null;
  /** Gratuity or service charge already printed on the bill. */
  serviceCharge: number | null;
  total: number | null;
  /** Sum of item prices, discounts included. */
  itemsSum: number;
  /** Whether the items add up to the bill (null when there is nothing to compare to). */
  matches: boolean | null;
  /** Item prices already include tax: they add up to the total rather than the subtotal. */
  taxIncluded: boolean;
}

interface Row {
  lines: OcrLine[];
  y: number;
  left: number;
  text: string;
  name: string;
  amount: number | null;
}

type Kind = 'subtotal' | 'tax' | 'service' | 'total' | 'payment' | 'discount' | 'tipguide' | 'noise' | 'item';

const round2 = (v: number) => Math.round(v * 100) / 100;
const median = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((p, q) => p - q);
  return s[Math.floor(s.length / 2)];
};

/* ---------------------------------------------------------------- amounts */

// A price at the end of a row: optional sign, $, thousands, and 2 decimals, maybe a
// trailing tax flag such as "T", "N", "SR" or "ZR", or a trailing minus for a discount.
const AMOUNT_AT_END =
  /(\(?-?\s?(?:\$\s?|S(?=\d)|RM\s?)?-?\d{1,3}(?:[,\s]\d{3})*\s?[.,]\s?\d{2}\)?-?)\s*(?:[A-Z]{1,2}|\*)?\s*$/;

/** Fixes the usual reader slips in a price: O for 0, S for $, comma decimals, stray spaces. */
function readAmount(raw: string): number | null {
  let s = raw.trim();
  const negative = /^\(.*\)$/.test(s) || s.includes('-');
  s = s.replace(/^RM/i, '').replace(/[()$\-\s]/g, '').replace(/^S/, '');
  s = s.replace(/[Oo]/g, '0');
  // "1,234.56" keeps the dot; "12,50" means 12.50.
  if (/^\d+,\d{2}$/.test(s)) s = s.replace(',', '.');
  s = s.replace(/,/g, '');
  if (!/^\d+\.\d{2}$/.test(s)) return null;
  const v = parseFloat(s);
  return negative ? -v : v;
}

function splitAmount(text: string): { name: string; amount: number | null } {
  const fixed = text
    .replace(/(\d)\s*[oO]\s*$/, '$10')
    .replace(/[oO](\d)$/, '0$1')
    // "$O.15": a letter O for the leading zero.
    .replace(/[oO](?=[.,]\d{2}\s*(?:[A-Z]{1,2}|\*)?\s*$)/, '0');
  const m = fixed.match(AMOUNT_AT_END);
  if (!m || m.index === undefined) return { name: text.trim(), amount: null };
  const amount = readAmount(m[1]);
  if (amount === null) return { name: text.trim(), amount: null };
  const before = fixed.slice(0, m.index);
  // Part of a date or time ("10/26.50", "13:50.00") rather than a price.
  if (/\d[/:]$/.test(before)) return { name: text.trim(), amount: null };
  return { name: before.replace(/(?:\b(?:RM|USD|US\$))?[\s.:$*_=-]+$/i, '').trim(), amount };
}

/* ---------------------------------------------------------------- rows */

const isPriceOnly = (t: string) => {
  const { name, amount } = splitAmount(t);
  return amount !== null && !/[a-z]{2}/i.test(name);
};

type Pt = { x: number; y: number };
interface Geo {
  l: OcrLine;
  c: Pt; // centre
  d: Pt; // reading direction (unit vector)
  len: number;
  h: number;
}

const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y;
const norm = (a: Pt): Pt => {
  const m = Math.hypot(a.x, a.y) || 1;
  return { x: a.x / m, y: a.y / m };
};

/**
 * Without corner points, finds the single tilt that best lines prices up with text to their
 * left (dy per dx). Used only when the reader gives plain boxes.
 */
function globalSlope(lines: OcrLine[], unit: number): number {
  const prices = lines.filter((l) => isPriceOnly(l.text));
  const texts = lines.filter((l) => /[a-z]{2}/i.test(l.text));
  if (!prices.length || !texts.length) return 0;
  let best = 0;
  let bestCost = Infinity;
  for (let deg = -10; deg <= 10.001; deg += 0.25) {
    const t = Math.tan((deg * Math.PI) / 180);
    let cost = Math.abs(deg) * 1e-3;
    for (const p of prices) {
      const py = p.y + p.h / 2 - t * (p.x + p.w / 2);
      let m = unit;
      for (const l of texts) {
        if (l.x + l.w / 2 >= p.x) continue;
        m = Math.min(m, Math.abs(l.y + l.h / 2 - t * (l.x + l.w / 2) - py));
      }
      cost += m;
    }
    if (cost < bestCost) {
      bestCost = cost;
      best = t;
    }
  }
  return best;
}

function geometry(lines: OcrLine[]): Geo[] {
  const withCorners = lines.every((l) => l.corners && l.corners.length === 4);
  if (withCorners) {
    return lines.map((l) => {
      const [tl, tr, br, bl] = l.corners!.map(([x, y]) => ({ x, y }));
      const along = { x: tr.x - tl.x + br.x - bl.x, y: tr.y - tl.y + br.y - bl.y };
      const d = norm(along);
      const n = { x: -d.y, y: d.x };
      const h = Math.abs(dot({ x: bl.x - tl.x + br.x - tr.x, y: bl.y - tl.y + br.y - tr.y }, n)) / 2;
      const c = { x: (tl.x + tr.x + br.x + bl.x) / 4, y: (tl.y + tr.y + br.y + bl.y) / 4 };
      return { l, c, d, len: Math.hypot(along.x, along.y) / 2, h: Math.max(1, h) };
    });
  }
  const short = lines.filter((l) => l.w < 6 * l.h);
  const unit0 = median((short.length ? short : lines).map((l) => l.h));
  const t = globalSlope(lines, unit0);
  const d = norm({ x: 1, y: t });
  return lines.map((l) => ({
    l,
    c: { x: l.x + l.w / 2, y: l.y + l.h / 2 },
    d,
    len: l.w,
    h: Math.max(1, l.h - Math.abs(t) * l.w),
  }));
}

/**
 * Rebuilds printed rows. Each line is joined to the line on its left that sits on the same
 * baseline, judged by the reading direction of the nearby long lines, so tilted photos and
 * photos taken at an angle both work.
 */
export function buildRows(input: OcrLine[]): { rows: Row[]; unit: number } {
  const lines = input.filter((l) => l.text && l.text.trim());
  if (!lines.length) return { rows: [], unit: 0 };
  const g = geometry(lines);
  const unit = median(g.map((x) => x.h));

  // Local direction: length-weighted average over the nearest lines, so one short,
  // badly-angled box ("Tax") doesn't throw off its row.
  const local = g.map((a) => {
    const near = [...g].sort((p, q) => Math.hypot(p.c.x - a.c.x, p.c.y - a.c.y) - Math.hypot(q.c.x - a.c.x, q.c.y - a.c.y)).slice(0, 8);
    return norm(near.reduce((acc, p) => ({ x: acc.x + p.d.x * p.len, y: acc.y + p.d.y * p.len }), { x: 0, y: 0 }));
  });

  const parent = g.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < g.length; i++) {
    let best = -1;
    let bestPerp = Infinity;
    for (let j = 0; j < g.length; j++) {
      if (i === j) continue;
      const d = norm({ x: local[i].x + local[j].x, y: local[i].y + local[j].y });
      const v = sub(g[i].c, g[j].c);
      if (dot(v, d) <= 0) continue; // j must be to the left of i
      const perp = Math.abs(dot(v, { x: -d.y, y: d.x }));
      if (perp < 0.5 * Math.min(g[i].h, g[j].h) + 0.1 * unit && perp < bestPerp) {
        bestPerp = perp;
        best = j;
      }
    }
    if (best >= 0) parent[find(i)] = find(best);
  }

  const dirAll = norm(g.reduce((acc, p) => ({ x: acc.x + p.d.x * p.len, y: acc.y + p.d.y * p.len }), { x: 0, y: 0 }));
  const nAll = { x: -dirAll.y, y: dirAll.x };
  const groups = new Map<number, Geo[]>();
  g.forEach((x, i) => {
    const r = find(i);
    groups.set(r, [...(groups.get(r) ?? []), x]);
  });
  const rows: Row[] = [...groups.values()].map((members) => {
    members.sort((p, q) => dot(p.c, dirAll) - dot(q.c, dirAll));
    const text = members.map((m) => m.l.text.trim()).join(' ');
    const first = members[0];
    const { name, amount } = splitAmount(text);
    return {
      lines: members.map((m) => m.l),
      y: median(members.map((m) => dot(m.c, nAll))),
      left: dot(first.c, dirAll) - first.len / 2,
      text,
      name,
      amount,
    };
  });
  rows.sort((p, q) => p.y - q.y);
  return { rows, unit };
}

/* ---------------------------------------------------------------- classify */

function kindOf(name: string, amount: number | null): Kind {
  // Common misreads: "Totai", "Tota1", "Sub-totai", "lnclusive".
  const n = name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/tota[il1|]/g, 'total')
    .replace(/\bln(c|cl)/g, 'in$1');
  if (/\d{1,2}\s?%\s*[=:-]|suggested|tip guide|gratuity guide|for your convenience/.test(n)) return 'tipguide';
  if (/sub\s?-?\s?tot|\bsub[\s-]?\S{1,3}tal\b|subtl|sub ttl|s\/total/.test(n)) return 'subtotal';
  // Restaurants often label the subtotal by what it covers: "FOOD 64.90", "BEVERAGE".
  if (amount !== null && /^[^a-z]*(food|food total|food & bev(erage)?|food and bev(erage)?|beverages?|merchandise|sales|net sales|items? total)[^a-z]*$/.test(n))
    return 'subtotal';
  if (/total/.test(n) && /excl|before tax|pre-?tax|w\/o tax/.test(n)) return 'subtotal';
  if (/gratuity|grat\b|service ch|service fee|svc|serv\.? ?chg|srv chg|s\/?charge/.test(n)) return 'service';
  if (/total|amount due|amt due|balance due|\bdue\b|\bttl\b/.test(n) && !/tax\s*$|qty|items?\b|disc|saving/.test(n))
    return 'total';
  if (/\btax\b|\bgst\b|\bsst\b|\bvat\b|\bhst\b|\bpst\b|sales tax/.test(n)) return 'tax';
  // Payment lines start with the payment word ("VISA 63.17", "Change 3.10"). Matching anywhere
  // would drop real items such as "TRADING CARD" or "CASHEW CHICKEN".
  if (/^[^a-z]*(cash|change|visa|mastercard|master card|amex|american express|discover|debit|credit|card|tender(ed)?|paid|payment|purchase|approv|auth|rounding|round adj|chg due|tip)\b/.test(n))
    return 'payment';
  if (/disc|coupon|promo|\bcomp\b|% off|voucher|happy hour/.test(n) || (amount !== null && amount < 0)) return 'discount';
  if (/\b(server|table|guests?|check|order|cashier|invoice|receipt|tel|phone|fax|www|thank|welcome|date|time|bill no|pax|covers?|closed|opened?)\b|\S@\S+\.[a-z]/.test(n))
    return 'noise';
  return 'item';
}

/* ---------------------------------------------------------------- items */

function cleanName(raw: string): { name: string; qty: number } {
  let s = raw.replace(/\s+/g, ' ').trim();
  let qty = 1;
  // Long product codes at the start.
  s = s.replace(/^\d{5,}\s+/, '');
  // A quantity of 1 often reads as "l", "I" or "|": "l SALAD", "I LEMONADE".
  s = s.replace(/^[lI|]\s+(?=[A-Za-z])/, '1 ');
  // "2 Burger", "2x Burger", "2 @ Burger"
  // The reader sometimes drops the space: "3Mac & Cheese". Units like "12oz Steak" stay names.
  let m = s.match(/^(\d{1,2})\s?[xX@*]?\s+(?=\D)/) ?? s.match(/^([1-9])(?=[A-Za-z])(?!oz|pc|lb|in\b|pk|ct\b)/i);
  if (m) {
    qty = parseInt(m[1], 10);
    s = s.slice(m[0].length);
  }
  // "Burger x2" / "Burger (2)"
  m = s.match(/\s(?:x|X)\s?(\d{1,2})$|\s\((\d{1,2})\)$/);
  if (m) {
    qty = parseInt(m[1] ?? m[2], 10);
    s = s.slice(0, m.index);
  }
  // "Burger 2 6.50" or "Burger 2 x 6.50": quantity and unit price left before the line total.
  m = s.match(/\s(\d{1,2})\s?[xX@*]?\s?\$?\d+[.,]\d{2}$/);
  if (m) {
    qty = parseInt(m[1], 10);
    s = s.slice(0, m.index);
  }
  // "Burger 6.50" where 6.50 is the unit price
  s = s.replace(/\s\$?\d+[.,]\d{2}$/, '');
  s = s.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9)]+$/g, '').trim();
  return { name: s, qty: qty || 1 };
}

const AT_LINE = /^(\d{1,2})\s?[@xX*]\s?\$?\d+[.,]\d{2}$/;

export function parseReceipt(input: OcrLine[]): ParsedReceipt {
  const { rows, unit } = buildRows(input);
  const kinds = rows.map((r) => kindOf(r.amount === null ? r.text : r.name, r.amount));

  const firstOf = (ks: Kind[]) => rows.findIndex((r, k) => r.amount !== null && ks.includes(kinds[k]));
  // Items stop at the first subtotal, tax, service charge or total that carries an amount.
  const stop = firstOf(['subtotal', 'total', 'tax', 'service']);
  const subRow = firstOf(['subtotal']);

  const collect = (endAt: number, fees: boolean) => {
    let end = endAt < 0 ? rows.length : endAt;
    // Where item names usually start, to tell indented add-ons from items.
    const priced = rows.slice(0, end).filter((r, k) => r.amount !== null && kinds[k] === 'item');
    const itemLeft = median(priced.map((r) => r.left));
    const items: ReceiptItem[] = [];
    let discount = 0;
    for (let k = 0; k < end; k++) {
      const r = rows[k];
      if (r.amount === null) continue;
      const kind = kinds[k];
      if (kind === 'discount') {
        const v = -Math.abs(r.amount);
        discount += -v;
        const label = cleanName(r.name).name;
        // A coupon printed right under its item ("ECPN-PICK N'" under "PICK N' PACK") comes off
        // that item instead of showing as a separate line.
        const last = items[items.length - 1];
        if (last && last.price > 0 && couponFor(label, last.name)) {
          last.price = round2(last.price + v);
          continue;
        }
        items.push({ name: label || 'Discount', qty: 1, price: v });
        continue;
      }
      // Fees printed above the subtotal ("CHICAGO BAG TAX 0.05") are part of it.
      if (kind !== 'item' && !(fees && (kind === 'tax' || kind === 'service'))) continue;
      // An unlabeled or oddly labeled subtotal: the amount equals everything above it and the
      // next priced row is tax, a service charge or the total.
      const running = items.reduce((a, i) => a + i.price, 0);
      if (items.length >= 2 && Math.abs(r.amount - running) <= 0.02) {
        const next = rows.slice(k + 1).findIndex((x) => x.amount !== null);
        const nk = next < 0 ? -1 : k + 1 + next;
        if (nk >= 0 && ['tax', 'service', 'total', 'subtotal'].includes(kinds[nk])) {
          kinds[k] = 'subtotal';
          end = k;
          break;
        }
      }

      let { name, qty } = cleanName(r.name);
      const prevRow = rows[k - 1];
      const prevUnpriced = prevRow && prevRow.amount === null && kinds[k - 1] === 'item' ? prevRow : null;

      // "Burger" on one row, "2 @ 12.99   25.98" on the next.
      const at = r.name.replace(/\s+/g, ' ').trim().match(AT_LINE);
      if (at && prevUnpriced) {
        items.push({ name: cleanName(prevUnpriced.text).name, qty: parseInt(at[1], 10), price: r.amount });
        continue;
      }
      // A price with no name: the name wrapped onto the row above.
      if (!/[a-z]{2}/i.test(name) && prevUnpriced) {
        const c = cleanName(prevUnpriced.text);
        items.push({ name: c.name, qty: c.qty, price: r.amount });
        continue;
      }
      if (!/[a-z]/i.test(name)) continue;

      // Priced add-ons: "+ Bacon 2.00", "Add bacon 2.00", or indented under the item.
      const addOn = /^\s*[+>]|^add\b|^extra\b|^sub\b/i.test(r.name) || (items.length > 0 && r.left > itemLeft + 1.5 * unit);
      if (addOn && items.length && items[items.length - 1].price > 0) {
        const last = items[items.length - 1];
        last.price = round2(last.price + r.amount);
        continue;
      }
      items.push({ name, qty, price: r.amount });
    }
    return { items, discount, end };
  };

  // Usually items end at the first tax or total line. But some stores print fees labeled as
  // tax among the items and include them in the subtotal; then the items run to the subtotal.
  let picked = collect(stop, false);
  if (subRow > stop && stop >= 0) {
    const subAmt = rows[subRow].amount!;
    const sum = (x: { items: ReceiptItem[] }) => x.items.reduce((a, i) => a + i.price, 0);
    const withFees = collect(subRow, true);
    if (Math.abs(sum(withFees) - subAmt) <= 0.02 && Math.abs(sum(picked) - subAmt) > 0.02) picked = withFees;
  }
  const { items, discount, end } = picked;

  const after = rows.map((r, k) => ({ r, kind: kinds[k] })).slice(end).filter((x) => x.r.amount !== null);
  const first = (kind: Kind) => after.find((x) => x.kind === kind)?.r.amount ?? null;
  // The first total after the items. Later "Total" rows are usually payment copies or tip lines.
  let tax = sumOf(after.filter((x) => x.kind === 'tax').map((x) => x.r.amount!), 'tax');
  let subtotal = first('subtotal');
  const serviceCharge = first('service');
  let total = first('total');
  if (total !== null && subtotal !== null && total < subtotal) {
    const bigger = after.find((x) => x.kind === 'total' && x.r.amount! >= subtotal!);
    total = bigger ? bigger.r.amount : total;
  }
  // Some printers put the total's amount on a row of its own ("63.17" with no label, or a
  // label the reader missed). Accept it when it equals subtotal + tax + service charge.
  if (total === null && subtotal !== null) {
    const expected = round2(subtotal + (tax ?? 0) + (serviceCharge ?? 0));
    const bare = after.find((x) => Math.abs(x.r.amount! - expected) <= 0.02 && !/[a-z]{2}/i.test(x.r.name));
    if (bare) total = bare.r.amount;
  }
  // With both a printed subtotal and total, tax is whatever sits between them (less any
  // service charge). This covers unlabeled lines ("HT", "PPF"), several tax lines, and a
  // misread like "$1.52" read as "51.52".
  if (subtotal !== null && total !== null) {
    const gap = round2(total - subtotal - (serviceCharge ?? 0));
    if (gap >= 0 && (tax === null || Math.abs(tax - gap) > 0.05)) tax = gap > 0 ? gap : null;
  }
  let itemsSum = round2(items.reduce((a, i) => a + i.price, 0));
  // "$7.95" read as "57.95": if dropping a leading 5 from one price makes the items match the
  // subtotal, that was the dollar sign.
  if (subtotal !== null && Math.abs(itemsSum - subtotal) > 0.02) {
    for (const it of items) {
      const t = it.price.toFixed(2);
      if (!/^5\d+\.\d\d$/.test(t)) continue;
      const alt = parseFloat(t.slice(1));
      if (Math.abs(itemsSum - it.price + alt - subtotal) <= 0.02) {
        it.price = alt;
        itemsSum = round2(items.reduce((a, i) => a + i.price, 0));
        break;
      }
    }
  }
  if (subtotal === null && total !== null) subtotal = round2(total - (tax ?? 0) - (serviceCharge ?? 0));
  const near = (v: number | null) => v !== null && Math.abs(itemsSum - v) <= 0.02;
  const taxIncluded = !near(subtotal) && !!tax && near(total === null ? null : total - (serviceCharge ?? 0));
  const matches = !items.length || (subtotal === null && total === null) ? null : near(subtotal) || taxIncluded;
  return { items, discount: round2(discount), subtotal, tax, serviceCharge, total, itemsSum, matches, taxIncluded };
}

/** "ECPN-PICK N'" or "CPN WF ORG" names the item it discounts. */
function couponFor(coupon: string, item: string): boolean {
  const words = (t: string) => t.toUpperCase().replace(/^[A-Z]*C(?:OU)?PO?N\b[-\s:]*/, '').replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const c = words(coupon);
  const it = words(item);
  if (!c.length || !/c(ou)?po?n|coupon|disc/i.test(coupon)) return false;
  // Every coupon word starts the matching word of the item: PICK N -> PICK N PACK.
  return c.length <= it.length && c.every((w, k) => it[k].startsWith(w));
}

/** Several tax rows (state + city) add up; a repeated identical row is counted once. */
function sumOf(values: number[], _what: string): number | null {
  if (!values.length) return null;
  const unique = values.filter((v, i) => values.indexOf(v) === i);
  return round2(unique.reduce((a, b) => a + b, 0));
}

/* ---------------------------------------------------------------- split */

export interface ScanItem {
  id: string;
  name: string;
  price: string;
  /** Ids of the people who share this item. Empty means everyone. */
  who: string[];
}

export interface ScanPerson {
  id: string;
  name: string;
}

export interface ScanTotals {
  /** The receipt's printed total. When present it is the bill, so a missed line can't shrink it. */
  total?: string;
  tax: string;
  serviceCharge: string;
  taxIncluded: boolean;
}

const num = (s: string) => {
  const v = parseFloat((s || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(v) ? v : 0;
};

/**
 * Turns reviewed receipt items into the calculator's split by item.
 *
 * - An item shared by some people is divided evenly between them; an item for everyone
 *   goes to the shared pot, which the calculator divides evenly.
 * - When prices already include tax, every amount is scaled down to its pre-tax share so tax
 *   isn't counted twice.
 * - A service charge already on the bill is spread over each person's food in proportion,
 *   the same way tax is.
 */
export function toSplit(items: ScanItem[], people: ScanPerson[], totals: ScanTotals) {
  const tax = Math.max(0, num(totals.tax));
  const service = Math.max(0, num(totals.serviceCharge));
  const food = items.reduce((a, i) => a + num(i.price), 0);
  const preTaxFood = totals.taxIncluded ? Math.max(0, food - tax) : food;
  const factor = food > 0 ? (preTaxFood + service) / food : 1;

  const amounts = new Map(people.map((p) => [p.id, 0]));
  let shared = 0;
  for (const it of items) {
    const v = num(it.price) * factor;
    const who = it.who.filter((id) => amounts.has(id));
    if (!who.length) shared += v;
    else for (const id of who) amounts.set(id, amounts.get(id)! + v / who.length);
  }
  const fix = (v: number) => (Math.abs(v) < 0.005 ? '' : round2(v).toFixed(2));
  return {
    // The printed total wins. Anything not assigned to a person (a line the reader missed or
    // the person deleted) is then split evenly by the calculator, and it says so.
    bill: (num(totals.total ?? '') > 0 ? num(totals.total!) : round2(preTaxFood + service + tax)).toFixed(2),
    tax: tax ? tax.toFixed(2) : '',
    shared: fix(shared),
    people: people.map((p) => ({ id: p.id, name: p.name, amount: fix(amounts.get(p.id)!) })),
    /** A gratuity is already on the bill, so the tip should start at "No tip". */
    tipIncluded: service > 0,
  };
}
