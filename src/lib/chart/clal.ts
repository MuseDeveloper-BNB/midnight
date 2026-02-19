/**
 * CLAL.it – US Butter (Grade AA) weekly survey.
 * Fetches https://www.clal.it/en/?section=burro_usa and parses
 * Survey Date + US $ per lb. Updates ~weekly (Fridays).
 */

const CLAL_URL = 'https://www.clal.it/en/?section=burro_usa';

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

export type ClalRow = {
  date: string; // YYYY-MM-DD
  butterUsdPerLb: number;
};

/** Fallback when parse returns no rows (e.g. CLAL HTML change). */
const CLAL_FALLBACK: ClalRow[] = [
  { date: '2025-11-21', butterUsdPerLb: 1.4775 },
  { date: '2025-11-28', butterUsdPerLb: 1.45 },
  { date: '2025-12-05', butterUsdPerLb: 1.4775 },
  { date: '2025-12-12', butterUsdPerLb: 1.48 },
  { date: '2025-12-19', butterUsdPerLb: 1.415 },
  { date: '2025-12-26', butterUsdPerLb: 1.4025 },
  { date: '2026-01-02', butterUsdPerLb: 1.375 },
  { date: '2026-01-09', butterUsdPerLb: 1.3 },
  { date: '2026-01-16', butterUsdPerLb: 1.355 },
  { date: '2026-01-23', butterUsdPerLb: 1.575 },
];

function parseEurDecimal(val: string): number {
  const normalized = val.replace(',', '.');
  return parseFloat(normalized) || 0;
}

function toYyyyMmDd(day: number, monthKey: string, year: number): string {
  const m = MONTHS[monthKey];
  if (m == null) return '';
  const d = new Date(year, m, day);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

/** Match Friday&nbsp;23 Jan 2026 or Friday 23 Jan 2026 (CLAL table). */
const DATE_RE = /Friday(?:\s|&nbsp;)*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi;
/** First value cell (US $ per lb): <td class="value0red" ...>1,5750</td>. Exclude % column. */
const PRICE_RE = /class="value[\w]*"[^>]*>(\d{1,2},\d{2,4})</gi;
const PRICE_FALLBACK_RE = /(\d{1,2},\d{2,4})(?![%\d])/g;

/**
 * Parse CLAL HTML table: Survey Date (Friday DD Mon YYYY) and US $ per lb.
 * Supports both HTML <td> and pipe‑delimited table output.
 */
export function parseClalTable(html: string): ClalRow[] {
  const rows: ClalRow[] = [];
  const rowChunks = html.split(/<\s*\/\s*tr\s*>/gi);
  for (const chunk of rowChunks) {
    DATE_RE.lastIndex = 0;
    const dateMatch = DATE_RE.exec(chunk);
    if (!dateMatch) continue;
    const day = parseInt(dateMatch[1]!, 10);
    const month = dateMatch[2]!;
    const year = parseInt(dateMatch[3]!, 10);
    const date = toYyyyMmDd(day, month, year);
    if (!date) continue;
    PRICE_RE.lastIndex = 0;
    let priceMatch = PRICE_RE.exec(chunk);
    if (!priceMatch) {
      PRICE_FALLBACK_RE.lastIndex = 0;
      priceMatch = PRICE_FALLBACK_RE.exec(chunk);
    }
    if (!priceMatch) continue;
    const butterUsdPerLb = parseEurDecimal(priceMatch[1]!);
    if (butterUsdPerLb <= 0 || butterUsdPerLb > 10) continue;
    rows.push({ date, butterUsdPerLb });
  }
  if (rows.length > 0) {
    const byDate = new Map<string, ClalRow>();
    for (const r of rows) {
      if (!byDate.has(r.date)) byDate.set(r.date, r);
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
  const fallback: ClalRow[] = [];
  const fallbackRe = /Friday\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})[^|]*\|(\d{1,2},\d{2,4})\|/gi;
  let m: RegExpExecArray | null;
  while ((m = fallbackRe.exec(html)) !== null) {
    const day = parseInt(m[1]!, 10);
    const month = m[2]!;
    const year = parseInt(m[3]!, 10);
    const date = toYyyyMmDd(day, month, year);
    if (!date) continue;
    const butterUsdPerLb = parseEurDecimal(m[4]!);
    if (butterUsdPerLb <= 0) continue;
    fallback.push({ date, butterUsdPerLb });
  }
  const byDate = new Map<string, ClalRow>();
  for (const r of fallback) {
    if (!byDate.has(r.date)) byDate.set(r.date, r);
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetch CLAL Butter US page and return parsed weekly survey rows.
 */
export async function fetchClalButterUsdPerLb(): Promise<ClalRow[]> {
  const res = await fetch(CLAL_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MidnightNews/1.0; chart)' },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) throw new Error(`CLAL fetch failed: ${res.status}`);
  const html = await res.text();
  const rows = parseClalTable(html);
  if (rows.length === 0) return [...CLAL_FALLBACK];
  return rows;
}
