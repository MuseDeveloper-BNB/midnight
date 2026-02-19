import { NextResponse } from 'next/server';

const CMC_CHART_URL = 'https://api.coinmarketcap.com/data-api/v3.3/cryptocurrency/detail/chart';
const CMC_PRO_QUOTES_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

const NIGHT_ID = '39064';
const NIGHT_SLUG = 'midnight-network';
const USD_CONVERT_ID = '2781';
/** NIGHT total/max supply from tokenomics (10B) */
const NIGHT_TOTAL_SUPPLY = 10_000_000_000;

export const dynamic = 'force-dynamic';

export type NightStatsResponse = {
  price: number;
  marketCap: number | null;
  volume24h: number | null;
  fdv: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  priceChange24h: number | null;
  priceChange7d: number | null;
  priceChange30d: number | null;
  holders: number | null;
  contracts: string[] | null;
  lastUpdated: string | null;
  source: 'cmc_pro' | 'cmc_chart';
  /** Chart points for 1D (only when source=cmc_chart) */
  chart1D?: { time: number; value: number }[];
  /** Latest OHLC from chart (only when source=cmc_chart) */
  latest?: {
    open: number | null;
    high: number | null;
    low: number | null;
    close: number;
    volume: number | null;
    marketCap: number | null;
    lastUpdated: string | null;
  };
};

/**
 * GET /api/chart/night-stats
 * Returns NIGHT token stats: Market Cap, Volume, FDV, supply, etc.
 * Uses CMC Pro API when COINMARKETCAP_API_KEY is set; otherwise falls back to CMC chart API.
 * Holders and Contracts come from blockchain explorers (not CMC) - currently null.
 */
export async function GET() {
  try {
    const apiKey = process.env.COINMARKETCAP_API_KEY;

    if (apiKey) {
      const stats = await fetchFromCmcPro(apiKey);
      if (stats) return NextResponse.json(stats, { headers: cacheHeaders() });
    }

    return NextResponse.json(await fetchFromCmcChart(), {
      headers: cacheHeaders(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Night stats fetch failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

function cacheHeaders() {
  return {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  };
}

async function fetchFromCmcPro(apiKey: string): Promise<NightStatsResponse | null> {
  const url = new URL(CMC_PRO_QUOTES_URL);
  url.searchParams.set('slug', NIGHT_SLUG);
  url.searchParams.set('convert', 'USD');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-CMC_PRO_API_KEY': apiKey,
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;

  const json = (await res.json()) as {
    data?: Record<
      string,
      {
        quote?: {
          USD?: {
            price?: number;
            volume_24h?: number;
            market_cap?: number;
            fully_diluted_valuation?: number;
            percent_change_24h?: number | null;
            percent_change_7d?: number | null;
            percent_change_30d?: number | null;
            last_updated?: string;
          };
        };
        circulating_supply?: number;
        total_supply?: number | null;
        max_supply?: number | null;
      }
    >;
  };

  const data = json.data ? Object.values(json.data)[0] : undefined;
  if (!data?.quote?.USD) return null;

  const usd = data.quote.USD;
  const price = usd.price ?? 0;
  const totalOrMax = data.total_supply ?? data.max_supply ?? NIGHT_TOTAL_SUPPLY;
  const fdv =
    usd.fully_diluted_valuation ??
    (price > 0 && totalOrMax ? price * totalOrMax : null);

  return {
    price,
    marketCap: usd.market_cap ?? null,
    volume24h: usd.volume_24h ?? null,
    fdv,
    circulatingSupply: data.circulating_supply ?? null,
    totalSupply: data.total_supply ?? null,
    maxSupply: data.max_supply ?? null,
    priceChange24h: usd.percent_change_24h ?? null,
    priceChange7d: usd.percent_change_7d ?? null,
    priceChange30d: usd.percent_change_30d ?? null,
    holders: null,
    contracts: null,
    lastUpdated: usd.last_updated ?? null,
    source: 'cmc_pro',
    chart1D: undefined,
    latest: undefined,
  };
}

type ChartPoint = { s: string; v: [number, number, number] };

async function fetchChartRange(
  range: '1D' | '7D' | '30D'
): Promise<{
  first: number;
  last: number;
  lastPoint?: ChartPoint;
  points?: ChartPoint[];
} | null> {
  const url = new URL(CMC_CHART_URL);
  url.searchParams.set('id', NIGHT_ID);
  url.searchParams.set('interval', range === '1D' ? '5m' : '1d');
  url.searchParams.set('convertId', USD_CONVERT_ID);
  url.searchParams.set('range', range);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as { data?: { points?: ChartPoint[] } };
  const points = json.data?.points ?? [];
  if (points.length < 2) return null;
  const first = points[0]!.v[0];
  const lastPt = points[points.length - 1]!;
  const last = lastPt.v[0];
  return {
    first,
    last,
    lastPoint: lastPt,
    points: range === '1D' ? points : undefined,
  };
}

function pctChange(first: number, last: number): number | null {
  if (first <= 0) return null;
  return ((last - first) / first) * 100;
}

async function fetchFromCmcChart(): Promise<NightStatsResponse> {
  const [chart1D, chart7D, chart30D] = await Promise.all([
    fetchChartRange('1D'),
    fetchChartRange('7D'),
    fetchChartRange('30D'),
  ]);

  const price = chart1D?.last ?? 0;
  const priceChange24h = chart1D ? pctChange(chart1D.first, chart1D.last) : null;
  const priceChange7d = chart7D ? pctChange(chart7D.first, chart7D.last) : null;
  const priceChange30d = chart30D ? pctChange(chart30D.first, chart30D.last) : null;

  const lastPoint = chart1D?.lastPoint;
  const points = chart1D?.points ?? [];

  if (!lastPoint) {
    return {
      price,
      marketCap: null,
      volume24h: null,
      fdv: price * NIGHT_TOTAL_SUPPLY,
      circulatingSupply: null,
      totalSupply: NIGHT_TOTAL_SUPPLY,
      maxSupply: NIGHT_TOTAL_SUPPLY,
      priceChange24h,
      priceChange7d,
      priceChange30d,
      holders: null,
      contracts: null,
      lastUpdated: null,
      source: 'cmc_chart',
      chart1D: points.length > 0 ? points.map((p) => ({ time: Number(p.s), value: p.v[0] })) : undefined,
      latest: undefined,
    };
  }

  const lastPrice = lastPoint.v[0];
  const volume = lastPoint.v[1];
  const marketCap = lastPoint.v[2];
  const fdv = lastPrice * NIGHT_TOTAL_SUPPLY;
  const prices = points.map((p) => p.v[0]);

  return {
    price: lastPrice,
    marketCap,
    volume24h: volume,
    fdv,
    circulatingSupply: marketCap != null && lastPrice > 0 ? marketCap / lastPrice : null,
    totalSupply: NIGHT_TOTAL_SUPPLY,
    maxSupply: NIGHT_TOTAL_SUPPLY,
    priceChange24h,
    priceChange7d,
    priceChange30d,
    holders: null,
    contracts: null,
    lastUpdated: new Date(Number(lastPoint.s) * 1000).toISOString(),
    source: 'cmc_chart',
    chart1D: points.map((p) => ({ time: Number(p.s), value: p.v[0] })),
    latest: {
      open: points[0]?.v[0] ?? null,
      high: prices.length > 0 ? Math.max(...prices) : null,
      low: prices.length > 0 ? Math.min(...prices) : null,
      close: lastPrice,
      volume,
      marketCap,
      lastUpdated: new Date(Number(lastPoint.s) * 1000).toISOString(),
    },
  };
}
