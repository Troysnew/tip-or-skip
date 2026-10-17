/**
 * Settle up: links and messages for paying and requesting money in common pay apps.
 *
 * Link formats:
 * - PayPal.Me: paypal.me/<name>/<amount> requests that amount. Documented by PayPal
 *   ("Just add the amount you want to request to the end of your link").
 * - Cash App: cash.app/$<cashtag>/<amount>. Cash App documents pre-filled payment links
 *   (Feb 2026) but not this exact format; confirmed by testing on a phone.
 * - Venmo: venmo.com/<username>?txn=pay&amount=<amount>&note=<note>. Not documented by Venmo;
 *   confirmed by testing on a phone.
 * All are https links, so they open the app when it is installed and the website otherwise.
 */

export interface PayHandles {
  venmo: string;
  cashtag: string;
  paypal: string;
}

export const emptyHandles: PayHandles = { venmo: '', cashtag: '', paypal: '' };

export type PayApp = 'venmo' | 'cashapp' | 'paypal';

/** Where the free Pay button sends people. Each opens the app if installed, the site if not. */
export const PAY_APPS: { id: PayApp; name: string; url: string }[] = [
  { id: 'venmo', name: 'Venmo', url: 'https://venmo.com/' },
  { id: 'cashapp', name: 'Cash App', url: 'https://cash.app/' },
  { id: 'paypal', name: 'PayPal', url: 'https://www.paypal.com/myaccount/transfer/homepage' },
];

/** Accepts "@name", "$name", "name", or a pasted profile link, and returns the bare name. */
export function cleanHandle(app: keyof PayHandles, raw: string): string {
  let s = (raw || '').trim();
  s = s.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  s = s.replace(/^(venmo\.com\/(u\/)?|account\.venmo\.com\/u\/|cash\.app\/|paypal\.me\/|paypal\.com\/paypalme\/)/i, '');
  s = s.split(/[/?#\s]/)[0];
  s = s.replace(/^[@$]+/, '');
  // Usernames are letters, digits, dashes and underscores.
  s = s.replace(/[^A-Za-z0-9_-]/g, '');
  return s;
}

export const hasHandles = (h: PayHandles) => !!(h.venmo || h.cashtag || h.paypal);

const amt = (v: number) => (Math.ceil(v * 100 - 1e-9) / 100).toFixed(2);
const usd = (v: number) => `$${amt(v)}`;

export function requestLinks(h: PayHandles, amount: number, note: string) {
  const a = amt(amount);
  const links: { app: string; url: string }[] = [];
  if (h.venmo) links.push({ app: 'Venmo', url: `https://venmo.com/${encodeURIComponent(h.venmo)}?txn=pay&amount=${a}&note=${encodeURIComponent(note)}` });
  if (h.cashtag) links.push({ app: 'Cash App', url: `https://cash.app/$${encodeURIComponent(h.cashtag)}/${a}` });
  if (h.paypal) links.push({ app: 'PayPal', url: `https://paypal.me/${encodeURIComponent(h.paypal)}/${a}` });
  return links;
}

export interface RequestInput {
  /** Who owes. Empty when the message goes to everyone (even split). */
  name?: string;
  amount: number;
  /** What it was for, e.g. "Restaurant". */
  label?: string;
  /** Optional breakdown for a split by item. */
  parts?: { food: number; tax: number; tip: number };
}

/** The text sent through the share sheet: the amount, a short breakdown, and pay links. */
export function requestMessage(h: PayHandles, r: RequestInput): string {
  const what = (r.label || '').trim().toLowerCase();
  const forWhat = what && what !== 'tip' ? ` for ${what}` : '';
  const hi = r.name?.trim() ? `Hi ${r.name.trim()}! ` : '';
  const lines = [`${hi}Your share${forWhat} is ${usd(r.amount)}.`];
  if (r.parts) lines.push(`(${usd(r.parts.food)} food + ${usd(r.parts.tax)} tax + ${usd(r.parts.tip)} tip)`);
  const note = `Your share${forWhat}`.trim();
  const links = requestLinks(h, r.amount, note);
  if (links.length) {
    lines.push('', 'Pay me here:');
    for (const l of links) lines.push(`${l.app}: ${l.url}`);
  }
  lines.push('', 'Split with Tip or Skip');
  return lines.join('\n');
}
