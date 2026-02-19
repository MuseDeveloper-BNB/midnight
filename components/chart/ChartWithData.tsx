'use client';

import { useEffect, useState } from 'react';
import { type ChartDatum } from '@/components/chart/NightButterChart';
import ButterChart from '@/components/chart/ButterChartMobile';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type LatestNight = {
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
  marketCap: number | null;
  lastUpdated: string | null;
};

type ChartDataResponse = {
  chartData: ChartDatum[];
  latestNight: LatestNight;
  meta: { butterThrough: string; nightThrough: string; lastUpdated: string };
};

function formatUsd(n: number | null): string {
  if (n == null) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(4)}`;
}

function formatDateLong(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = d.getUTCDate();
  const month = d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = d.getUTCFullYear();
  return `${day}. ${month} ${year}.`;
}

type ChartWithDataProps = {
  showLatest?: boolean;
  showChart?: boolean;
};

export default function ChartWithData({
  showLatest = true,
  showChart = true,
}: ChartWithDataProps = {}) {
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'error'; message: string } | { status: 'ok'; data: ChartDataResponse }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/chart/data')
      .then((r) => {
        if (!r.ok) return r.json().then((b) => { throw new Error((b as { error?: string }).error ?? `HTTP ${r.status}`); });
        return r.json() as Promise<ChartDataResponse>;
      })
      .then((data) => {
        if (!cancelled) setState({ status: 'ok', data });
      })
      .catch((e) => {
        if (!cancelled) setState({ status: 'error', message: e instanceof Error ? e.message : 'Failed to load chart data' });
      });
    return () => { cancelled = true; };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="chart-loading" role="status" aria-label="Loading chart">
        <LoadingSpinner size="md" />
        <p className="chart-loading__text">Loading chart data…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="chart-error" role="alert">
        <p className="chart-error__text">{state.message}</p>
        <p className="chart-error__hint">
          Data updates daily. Retry later or check connectivity.
        </p>
      </div>
    );
  }

  const { chartData, latestNight, meta } = state.data;
  const safeChartData = Array.isArray(chartData) ? chartData : [];

  const open = latestNight?.open ?? null;
  const close = latestNight?.close ?? null;
  const closeUp = open != null && close != null && close > open;
  const closeDown = open != null && close != null && close < open;

  return (
    <div className="chart-with-data">
      {showLatest && (
        <div className="chart-latest-night" aria-label="Latest NIGHT Price">
          <h3 className="chart-latest-night__title">Latest NIGHT Price</h3>
          {latestNight?.lastUpdated && (
            <span className="chart-latest-night__date">{formatDateLong(latestNight.lastUpdated)}</span>
          )}
          <dl className="chart-latest-night__grid">
            <div className="chart-latest-night__item">
              <dt>Open</dt>
              <dd>{formatUsd(latestNight?.open)}</dd>
            </div>
            <div className="chart-latest-night__item chart-latest-night__item--high">
              <dt>High</dt>
              <dd>{formatUsd(latestNight?.high)}</dd>
            </div>
            <div className="chart-latest-night__item chart-latest-night__item--low">
              <dt>Low</dt>
              <dd>{formatUsd(latestNight?.low)}</dd>
            </div>
            <div
              className={`chart-latest-night__item ${
                closeUp ? 'chart-latest-night__item--up' : closeDown ? 'chart-latest-night__item--down' : ''
              }`}
            >
              <dt>Close</dt>
              <dd>{formatUsd(latestNight?.close)}</dd>
            </div>
            <div className="chart-latest-night__item">
              <dt>Volume</dt>
              <dd>{formatUsd(latestNight?.volume)}</dd>
            </div>
            <div className="chart-latest-night__item">
              <dt>Market Cap</dt>
              <dd>{formatUsd(latestNight?.marketCap)}</dd>
            </div>
          </dl>
        </div>
      )}
      {showChart && safeChartData.length > 0 && (
        <div className="chart-wrapper">
          <ButterChart
            data={safeChartData}
            butterThrough={meta?.butterThrough}
            nightThrough={meta?.nightThrough}
          />
        </div>
      )}
    </div>
  );
}
