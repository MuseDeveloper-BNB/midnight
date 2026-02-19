import { NextResponse } from 'next/server';
import { fetchClalButterUsdPerLb } from '@/lib/chart/clal';
import { fetchCmcNightData } from '@/lib/chart/cmc';

export const dynamic = 'force-dynamic';

export type ChartDatum = {
  date: string;
  butterUsdPerLb: number;
  nightUsd: number;
  ratio: number;
};

export type LatestNight = {
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
  marketCap: number | null;
  lastUpdated: string | null;
};

export type ChartDataResponse = {
  chartData: ChartDatum[];
  latestNight: LatestNight;
  meta: {
    butterThrough: string;
    nightThrough: string;
    lastUpdated: string;
  };
};

/** CLAL provides wholesale $/lb; we use retail = wholesale × 2.5 for the index. */
const RETAIL_MULTIPLIER = 2.5;

/**
 * Chart = first 10 NIGHT rows. For each, use butter from nearest CLAL date <= NIGHT date.
 * CLAL butter is wholesale; we multiply by 2.5 for retail price.
 * Formula: (wholesale * 2.5) / nightUsd = $NIGHT per pound of butter (retail).
 */
function mergeChartData(
  clal: { date: string; butterUsdPerLb: number }[],
  historical: { date: string; close: number }[]
): ChartDatum[] {
  const butterByDate = new Map(clal.map((c) => [c.date, c.butterUsdPerLb]));
  const clalDates = [...butterByDate.keys()].sort();
  const out: ChartDatum[] = [];
  for (const { date, close } of historical) {
    const prev = clalDates.filter((d) => d <= date).pop();
    const wholesale = prev ? butterByDate.get(prev)! : 0;
    if (wholesale <= 0 || close <= 0) continue;
    const butterUsdPerLb = wholesale * RETAIL_MULTIPLIER;
    const ratio = butterUsdPerLb / close;
    out.push({
      date,
      butterUsdPerLb,
      nightUsd: close,
      ratio,
    });
  }
  return out;
}

export async function GET() {
  try {
    const [clal, { latest, historical }] = await Promise.all([
      fetchClalButterUsdPerLb(),
      fetchCmcNightData('', ''),
    ]);
    if (clal.length === 0) {
      return NextResponse.json(
        { error: 'CLAL: no butter data' },
        { status: 502 }
      );
    }

    const chartData = mergeChartData(clal, historical);
    const lastDate = clal[clal.length - 1]!.date;

    if (chartData.length === 0) {
      return NextResponse.json(
        { error: 'No chart data: need CLAL butter and NIGHT historical overlap' },
        { status: 502 }
      );
    }

    const res: ChartDataResponse = {
      chartData,
      latestNight: {
        open: latest.open,
        high: latest.high,
        low: latest.low,
        close: latest.close,
        volume: latest.volume,
        marketCap: latest.marketCap,
        lastUpdated: latest.lastUpdated,
      },
      meta: {
        butterThrough: lastDate,
        nightThrough: (latest.lastUpdated ?? new Date().toISOString()).slice(0, 10),
        lastUpdated: new Date().toISOString(),
      },
    };

    return NextResponse.json(res, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Chart data fetch failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
