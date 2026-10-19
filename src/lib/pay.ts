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

/**
 * Where the free Pay button sends people. The app's own link schemes are tried first so the app
 * opens directly; the website is the fallback when none of them can be opened (app not installed).
 * Schemes: PayPal publishes paypal://; cashme:// and squarecash:// (Cash App) and venmo:// are the
 * commonly used ones but are not documented by those companies.
 */
export const PAY_APPS: { id: PayApp; name: string; schemes: string[]; url: string }[] = [
  { id: 'venmo', name: 'Venmo', schemes: ['venmo://'], url: 'https://venmo.com/' },
  { id: 'cashapp', name: 'Cash App', schemes: ['cashme://', 'squarecash://'], url: 'https://cash.app/' },
  { id: 'paypal', name: 'PayPal', schemes: ['paypal://'], url: 'https://www.paypal.com/myaccount/transfer/homepage' },
];

/**
 * Opens a pay app: each scheme in turn, then the website. `open` is Linking.openURL, which
 * rejects when nothing on the phone can open the link. Returns which one opened.
 */
export async function openPayApp(app: { schemes: string[]; url: string }, open: (url: string) => Promise<unknown>): Promise<'app' | 'web' | 'none'> {
  for (const s of app.schemes) {
    try {
      await open(s);
      return 'app';
    } catch {
      // Not installed, or this scheme isn't the right one: try the next.
    }
  }
  try {
    await open(app.url);
    return 'web';
  } catch {
    return 'none';
  }
}

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

/** Which saved apps go into a request. Remembered between requests; new apps start switched on. */
export type RequestApps = Record<keyof PayHandles, boolean>;
export const allRequestApps: RequestApps = { venmo: true, cashtag: true, paypal: true };

export const HANDLE_APPS: { key: keyof PayHandles; name: string }[] = [
  { key: 'venmo', name: 'Venmo' },
  { key: 'cashtag', name: 'Cash App' },
  { key: 'paypal', name: 'PayPal' },
];

/** The saved handles with any switched-off apps left out. */
export function pickHandles(h: PayHandles, apps: RequestApps): PayHandles {
  return {
    venmo: apps.venmo !== false ? h.venmo : '',
    cashtag: apps.cashtag !== false ? h.cashtag : '',
    paypal: apps.paypal !== false ? h.paypal : '',
  };
}

/** Up to the next whole dollar ($20.24 becomes $21). Whole-dollar amounts stay as they are. */
export const roundUpDollar = (v: number) => Math.ceil(Math.round(v * 100) / 100 - 1e-9);

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
  /** The exact share, when `amount` was rounded up or typed in. */
  exact?: number;
}

/** The text sent through the share sheet: the amount, a short breakdown, and pay links. */
export function requestMessage(h: PayHandles, r: RequestInput): string {
  const what = (r.label || '').trim().toLowerCase();
  const forWhat = what && what !== 'tip' ? ` for ${what}` : '';
  const hi = r.name?.trim() ? `Hi ${r.name.trim()}! ` : '';
  const lines = [`${hi}Your share${forWhat} is ${usd(r.amount)}.`];
  // The breakdown only adds up to the exact share, so it is left out when the amount was changed.
  const exact = r.exact === undefined || Math.abs(r.exact - r.amount) < 0.005;
  if (r.parts && exact) lines.push(`(${usd(r.parts.food)} food + ${usd(r.parts.tax)} tax + ${usd(r.parts.tip)} tip)`);
  const note = `Your share${forWhat}`.trim();
  const links = requestLinks(h, r.amount, note);
  if (links.length) {
    lines.push('', 'Pay me here:');
    for (const l of links) lines.push(`${l.app}: ${l.url}`);
  }
  lines.push('', 'Split with Tip or Skip');
  return lines.join('\n');
}
