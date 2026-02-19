import { NextRequest, NextResponse } from 'next/server';

const CMC_CHART_URL = 'https://api.coinmarketcap.com/data-api/v3.3/cryptocurrency/detail/chart';

const NIGHT_ID = '39064';
const USD_CONVERT_ID = '2781';

const VALID_INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;
const VALID_RANGES = ['1D', '7D', '30D', '90D', '1Y', 'ALL'] as const;

export const dynamic = 'force-dynamic';

export type CmcChartPoint = {
  s: string;
  v: [number, number, number];
  c: Record<string, unknown>;
};

export type NightPriceLatest = {
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
  marketCap: number | null;
  lastUpdated: string | null;
};

export type NightPriceChartResponse = {
  points: { time: number; value: number }[];
  latest: NightPriceLatest;
  meta: { interval: string; range: string };
};

/**
 * GET /api/chart/night-price?interval=5m&range=1D
 * Proxies CoinMarketCap chart API. Params:
 * - interval: 1m | 5m | 15m | 1h | 4h | 1d (default: 5m)
 * - range: 1D | 7D | 30D | 90D | 1Y | ALL (default: 1D)
 * - id: optional, default 39064 (NIGHT)
 * - convertId: optional, default 2781 (USD)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const interval = (searchParams.get('interval') ?? '5m') as (typeof VALID_INTERVALS)[number];
    const range = (searchParams.get('range') ?? '1D') as (typeof VALID_RANGES)[number];
    const id = searchParams.get('id') ?? NIGHT_ID;
    const convertId = searchParams.get('convertId') ?? USD_CONVERT_ID;

    if (!VALID_INTERVALS.includes(interval)) {
      return NextResponse.json(
        { error: `Invalid interval. Use: ${VALID_INTERVALS.join(', ')}` },
        { status: 400 }
      );
    }
    if (!VALID_RANGES.includes(range)) {
      return NextResponse.json(
        { error: `Invalid range. Use: ${VALID_RANGES.join(', ')}` },
        { status: 400 }
      );
    }

    const url = new URL(CMC_CHART_URL);
    url.searchParams.set('id', id);
    url.searchParams.set('interval', interval);
    url.searchParams.set('convertId', convertId);
    url.searchParams.set('range', range);

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`CMC chart API failed: ${res.status}`);
    }

    const json = (await res.json()) as { data?: { points?: CmcChartPoint[] } };
    const points = json.data?.points ?? [];

    const chartData = points.map((p) => ({
      time: Number(p.s),
      value: p.v[0],
    }));

    // Latest = derived from chart (same source as CoinMarketCap chart)
    const prices = chartData.map((d) => d.value);
    const lastPoint = points[points.length - 1];
    const latest: NightPriceLatest = chartData.length > 0
      ? {
          open: chartData[0]!.value,
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: chartData[chartData.length - 1]!.value,
          volume: lastPoint ? lastPoint.v[1] : null,
          marketCap: lastPoint ? lastPoint.v[2] : null,
          lastUpdated: lastPoint
            ? new Date(Number(lastPoint.s) * 1000).toISOString()
            : null,
        }
      : {
          open: null,
          high: null,
          low: null,
          close: 0,
          volume: null,
          marketCap: null,
          lastUpdated: null,
        };

    return NextResponse.json(
      {
        points: chartData,
        latest,
        meta: { interval, range },
      } satisfies NightPriceChartResponse,
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Night price chart fetch failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
