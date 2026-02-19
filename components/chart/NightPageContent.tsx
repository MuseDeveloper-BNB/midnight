'use client';

/**
 * $NIGHT page: Latest NIGHT Price + Token Stats + Price Chart.
 * Price/chart from CMC chart API; stats from CMC Pro (if key set) or chart fallback.
 */

import { useEffect, useState } from 'react';
import NightPriceChart from './NightPriceChart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type NightPriceLatest = {
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
  marketCap: number | null;
  lastUpdated: string | null;
};

type NightPriceResponse = {
  points: { time: number; value: number }[];
  latest: NightPriceLatest;
  meta: { interval: string; range: string };
};

type NightStatsResponse = {
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
  chart1D?: { time: number; value: number }[];
  latest?: NightPriceLatest;
};

function formatUsd(n: number | null): string {
  if (n == null) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(4)}`;
}

function formatNumber(n: number | null): string {
  if (n == null) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString();
}

function formatPctChange(n: number | null): string {
  if (n == null) return '—';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function formatDateLong(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

export default function NightPageContent() {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ok';
        stats: NightStatsResponse;
        latest: NightPriceLatest;
        chart1D: { time: number; value: number }[];
      }
  >({ status: 'loading' });

  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch('/api/chart/night-stats', { signal: controller.signal })
      .then((r) => {
        if (!r.ok)
          return r.json().then((b) => {
            throw new Error((b as { error?: string }).error ?? `HTTP ${r.status}`);
          });
        return r.json() as Promise<NightStatsResponse>;
      })
      .then(async (stats) => {
        if (cancelled) return;
        if (stats.chart1D && stats.latest) {
          setState({
            status: 'ok',
            stats,
            latest: stats.latest,
            chart1D: stats.chart1D,
          });
          return;
        }
        const r = await fetch('/api/chart/night-price?range=1D&interval=5m', {
          signal: controller.signal,
        });
        if (!r.ok) throw new Error('Chart fetch failed');
        const priceData = (await r.json()) as NightPriceResponse;
        if (!cancelled)
          setState({
            status: 'ok',
            stats,
            latest: priceData.latest,
            chart1D: priceData.points,
          });
      })
      .catch((e) => {
        if (!cancelled)
          setState({
            status: 'error',
            message:
              e?.name === 'AbortError'
                ? 'Request timed out. Please try again.'
                : e instanceof Error
                  ? e.message
                  : 'Failed to load NIGHT data',
          });
      })
      .finally(() => clearTimeout(timeoutId));
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [retry]);

  const loading = state.status === 'loading';

  if (loading) {
    return (
      <div className="chart-loading" role="status" aria-label="Loading NIGHT data">
        <LoadingSpinner size="md" />
        <p className="chart-loading__text">Loading NIGHT price…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="chart-error" role="alert">
        <p className="chart-error__text">{state.message}</p>
        <p className="chart-error__hint">
          Data from CoinMarketCap. Check connectivity or try again.
        </p>
        <button
          type="button"
          className="chart-error__retry"
          onClick={() => {
            setState({ status: 'loading' });
            setRetry((c) => c + 1);
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, latest, chart1D } = state;
  const open = latest?.open ?? null;
  const close = latest?.close ?? 0;
  const closeUp = open != null && close > open;
  const closeDown = open != null && close < open;

  return (
    <div className="night-page">
      {/* Hero: Price + Changes */}
      <section className="night-hero" aria-label="NIGHT Price">
        <div className="night-hero__price-row">
          <span className="night-hero__price">{formatUsd(latest?.close)}</span>
          {stats && (
            <div className="night-hero__changes">
              {stats.priceChange24h != null && (
                <span
                  className={`night-hero__change ${
                    stats.priceChange24h >= 0 ? 'night-hero__change--up' : 'night-hero__change--down'
                  }`}
                >
                  24h {formatPctChange(stats.priceChange24h)}
                </span>
              )}
              {stats.priceChange7d != null && (
                <span
                  className={`night-hero__change ${
                    stats.priceChange7d >= 0 ? 'night-hero__change--up' : 'night-hero__change--down'
                  }`}
                >
                  7d {formatPctChange(stats.priceChange7d)}
                </span>
              )}
              {stats.priceChange30d != null && (
                <span
                  className={`night-hero__change ${
                    stats.priceChange30d >= 0 ? 'night-hero__change--up' : 'night-hero__change--down'
                  }`}
                >
                  30d {formatPctChange(stats.priceChange30d)}
                </span>
              )}
            </div>
          )}
        </div>
        <p className="night-hero__meta">
          {latest?.lastUpdated && formatDateLong(latest.lastUpdated)}
          {' · '}
          <a
            href="https://coinmarketcap.com/currencies/midnight-network/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CoinMarketCap
          </a>
        </p>
      </section>

      {/* Key metrics: Market Cap, Volume, FDV */}
      <section className="night-metrics">
        <div className="night-metrics__card">
          <span className="night-metrics__label">Market Cap</span>
          <span className="night-metrics__value">{formatUsd(latest?.marketCap)}</span>
        </div>
        <div className="night-metrics__card">
          <span className="night-metrics__label">Volume (24h)</span>
          <span className="night-metrics__value">{formatUsd(latest?.volume)}</span>
        </div>
        <div className="night-metrics__card">
          <span className="night-metrics__label">FDV</span>
          <span className="night-metrics__value">{stats ? formatUsd(stats.fdv) : '—'}</span>
        </div>
      </section>

      {/* Chart */}
      <section className="night-chart-section">
        <h2 className="night-chart-section__title">Price Chart</h2>
        <div className="night-chart-section__chart">
          <NightPriceChart initialChart1D={chart1D} />
        </div>
      </section>

      {/* Details: OHLC + Token Stats */}
      <section className="night-details">
        <div className="night-details__block">
          <h3 className="night-details__title">24h OHLC</h3>
          <dl className="night-details__grid">
            <div className="night-details__item">
              <dt>Open</dt>
              <dd>{formatUsd(latest?.open)}</dd>
            </div>
            <div className="night-details__item night-details__item--high">
              <dt>High</dt>
              <dd>{formatUsd(latest?.high)}</dd>
            </div>
            <div className="night-details__item night-details__item--low">
              <dt>Low</dt>
              <dd>{formatUsd(latest?.low)}</dd>
            </div>
            <div
              className={`night-details__item ${
                closeUp ? 'night-details__item--up' : closeDown ? 'night-details__item--down' : ''
              }`}
            >
              <dt>Close</dt>
              <dd>{formatUsd(latest?.close)}</dd>
            </div>
          </dl>
        </div>

        {stats && (
          <div className="night-details__block">
            <h3 className="night-details__title">Token Supply</h3>
            <dl className="night-details__grid">
              <div className="night-details__item">
                <dt>Circulating</dt>
                <dd>{formatNumber(stats.circulatingSupply)}</dd>
              </div>
              <div className="night-details__item">
                <dt>Total</dt>
                <dd>{formatNumber(stats.totalSupply)}</dd>
              </div>
              <div className="night-details__item">
                <dt>Max</dt>
                <dd>{formatNumber(stats.maxSupply)}</dd>
              </div>
              {stats.holders != null && (
                <div className="night-details__item">
                  <dt>Holders</dt>
                  <dd>{formatNumber(stats.holders)}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}
