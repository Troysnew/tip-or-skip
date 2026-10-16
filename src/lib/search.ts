import type { Service } from '../data/services';

export const normText = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

function grams(s: string) {
  const p = `  ${s} `;
  const g = new Set<string>();
  for (let i = 0; i < p.length - 2; i++) g.add(p.slice(i, i + 3));
  return g;
}

function similarity(a: string, b: string) {
  const A = grams(a);
  const B = grams(b);
  let n = 0;
  A.forEach((x) => B.has(x) && n++);
  return (2 * n) / (A.size + B.size);
}

/** 0-100 match score of a normalized query against a service's name and aliases. */
export function score(s: Service, q: string) {
  let best = 0;
  for (const t of [s.name, ...s.aliases].map(normText)) {
    if (t === q) best = Math.max(best, 100);
    else if (t.startsWith(q)) best = Math.max(best, 85);
    else if (t.includes(q)) best = Math.max(best, 70);
    else if (q.split(' ').every((w) => w.length > 1 && t.includes(w))) best = Math.max(best, 60);
    best = Math.max(best, similarity(t, q) * 60);
  }
  return best;
}

export const MATCH_THRESHOLD = 34;

export function search(list: Service[], query: string, limit?: number) {
  const q = normText(query);
  if (!q) return [...list].sort((a, b) => a.name.localeCompare(b.name));
  const hits = list
    .map((s) => ({ s, sc: score(s, q) }))
    .filter((x) => x.sc >= MATCH_THRESHOLD)
    .sort((a, b) => b.sc - a.sc)
    .map((x) => x.s);
  return limit ? hits.slice(0, limit) : hits;
}

export function closest(list: Service[], query: string, n = 3) {
  const q = normText(query);
  return list
    .map((s) => ({ s, sc: score(s, q) }))
    .sort((a, b) => b.sc - a.sc)
    .slice(0, n)
    .map((x) => x.s);
}
