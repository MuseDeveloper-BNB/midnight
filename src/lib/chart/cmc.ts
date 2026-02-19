/**
 * CoinMarketCap Data API v3.1 – historical (no API key).
 * https://api.coinmarketcap.com/data-api/v3.1/cryptocurrency/historical
 * id=39064 (NIGHT), convertId=2781 (USD), interval=1d.
 * API returns oldest-first; last row = latest day with O/H/L/C/Vol/MC.
 * Fetches all data from NIGHT launch (Dec 9, 2025) to now.
 */

const CMC_HISTORICAL =
  'https://api.coinmarketcap.com/data-api/v3.1/cryptocurrency/historical';
const NIGHT_ID = '39064';
const USD_CONVERT_ID = '2781';
/** NIGHT launched Dec 9, 2025 */
const NIGHT_LAUNCH_TIMESTAMP = 1733702400; // 2025-12-09T00:00:00Z

export type CmcLatest = {
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
  marketCap: number | null;
  lastUpdated: string | null;
};

export type CmcHistoricalDay = { date: string; close: number };

type CmcQuote = {
  timeOpen?: string;
  timeClose?: string;
  quote?: {
    name?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    marketCap?: number;
    timestamp?: string;
  };
};

function dateToUnixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Fetch historical OHLCV from NIGHT launch to now.
 * Returns quotes oldest-first; last = most recent day.
 */
async function fetchCmcHistoricalRaw(): Promise<CmcQuote[]> {
  const now = new Date();
  const timeEnd = dateToUnixSeconds(now) + 86400; // +1 day buffer

  const url = new URL(CMC_HISTORICAL);
  url.searchParams.set('id', NIGHT_ID);
  url.searchParams.set('convertId', USD_CONVERT_ID);
  url.searchParams.set('timeStart', String(NIGHT_LAUNCH_TIMESTAMP));
  url.searchParams.set('timeEnd', String(timeEnd));
  url.searchParams.set('interval', '1d');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'MidnightNews/1.0 (chart)' },
    next: { revalidate: 60 * 60 }, // revalidate hourly
  });
  if (!res.ok) throw new Error(`CMC historical failed: ${res.status}`);
  const json = (await res.json()) as {
    data?: { quotes?: CmcQuote[] };
    status?: { error_message?: string };
  };
  const quotes = json.data?.quotes ?? [];
  if (quotes.length === 0 && json.status?.error_message) {
    throw new Error(`CMC: ${json.status.error_message}`);
  }
  return quotes;
}

/**
 * Fetch all NIGHT historical data.
 * Latest = last row (newest day): Open, High, Low, Close, Volume, Market Cap.
 * Historical = all rows for chart.
 */
export async function fetchCmcNightData(
  _historicalStart: string,
  _historicalEnd: string
): Promise<{ latest: CmcLatest; historical: CmcHistoricalDay[] }> {
  const quotes = await fetchCmcHistoricalRaw();
  if (quotes.length === 0) throw new Error('CMC historical: no quotes');

  const withClose = quotes
    .map((q) => {
      const usd = q.quote;
      const close = usd?.close ?? 0;
      const ts = q.timeClose ?? q.quote?.timestamp ?? '';
      const date = ts.slice(0, 10);
      return { date, close, q };
    })
    .filter((x) => x.date && x.close > 0);

  if (withClose.length === 0) throw new Error('CMC historical: no valid daily close');

  // Last row = newest day (API returns oldest-first)
  const last = withClose[withClose.length - 1]!;
  const latest: CmcLatest = {
    open: last.q.quote?.open ?? null,
    high: last.q.quote?.high ?? null,
    low: last.q.quote?.low ?? null,
    close: last.close,
    volume: last.q.quote?.volume ?? null,
    marketCap: last.q.quote?.marketCap ?? null,
    lastUpdated: last.q.quote?.timestamp ?? last.q.timeClose ?? new Date().toISOString(),
  };

  // All rows for chart
  const historical: CmcHistoricalDay[] = withClose.map(({ date, close }) => ({
    date,
    close,
  }));

  return { latest, historical };
}
