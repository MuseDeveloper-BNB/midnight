'use client';

/**
 * $NIGHT price chart from CoinMarketCap.
 * Dynamic interval and range. TradingView Lightweight Charts.
 */

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';

const RANGE_OPTIONS = [
  { value: '1D', label: '1D', interval: '5m' },
  { value: '7D', label: '7D', interval: '1h' },
  { value: '30D', label: '30D', interval: '4h' },
  { value: '90D', label: '90D', interval: '1d' },
  { value: '1Y', label: '1Y', interval: '1d' },
  { value: 'ALL', label: 'ALL', interval: '1d' },
] as const;

type Props = {
  initialChart1D?: { time: number; value: number }[];
};

export default function NightPriceChart({ initialChart1D }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  type SeriesSetData = (data: { time: number; value: number }[]) => void;
  const seriesRef = useRef<{ setData: SeriesSetData } | null>(null);
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]['value']>('1D');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndUpdate = async (
    rangeVal: (typeof RANGE_OPTIONS)[number]['value'],
    interval: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/chart/night-price?range=${rangeVal}&interval=${interval}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const { points } = (await res.json()) as { points: { time: number; value: number }[] };
      if (seriesRef.current && points.length > 0) {
        seriesRef.current.setData(points);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.06)' },
        horzLines: { color: 'rgba(255,255,255,0.06)' },
      },
      rightPriceScale: {
        visible: true,
        borderColor: '#2a2a3a',
        scaleMargins: { top: 0.1, bottom: 0.1 },
        textColor: '#d1d5db',
        ticksVisible: true,
        borderVisible: true,
      },
      timeScale: {
        borderColor: '#2a2a3a',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: '#0000fe',
          width: 1,
          style: 2,
          labelBackgroundColor: '#0000fe',
        },
        horzLine: {
          color: '#0000fe',
          width: 1,
          style: 2,
          labelBackgroundColor: '#0000fe',
        },
      },
      handleScroll: { vertTouchDrag: true, horzTouchDrag: true },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#0000fe',
      topColor: 'rgba(0, 0, 254, 0.4)',
      bottomColor: 'rgba(0, 0, 254, 0.05)',
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (v: number) => `$${v.toFixed(4)}`,
        minMove: 0.001,
      },
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries as unknown as { setData: SeriesSetData };

    if (initialChart1D && initialChart1D.length > 0) {
      areaSeries.setData(initialChart1D as Parameters<typeof areaSeries.setData>[0]);
      setLoading(false);
    } else {
      const opt = RANGE_OPTIONS.find((r) => r.value === '1D')!;
      fetchAndUpdate('1D', opt.interval);
    }

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [initialChart1D]);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (range === '1D' && initialChart1D && initialChart1D.length > 0) {
      seriesRef.current.setData(initialChart1D);
      setLoading(false);
      return;
    }
    const opt = RANGE_OPTIONS.find((r) => r.value === range);
    if (opt) fetchAndUpdate(range, opt.interval);
  }, [range, initialChart1D]);

  return (
    <div className="night-price-chart">
      <div className="night-price-chart__range-tabs">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`night-price-chart__tab ${range === opt.value ? 'night-price-chart__tab--active' : ''}`}
            onClick={() => setRange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {loading && (
        <div className="night-price-chart__loading" aria-hidden>
          Loading…
        </div>
      )}
      {error && (
        <div className="night-price-chart__error" role="alert">
          {error}
        </div>
      )}
      <div
        ref={containerRef}
        className="night-price-chart__lwc"
        style={{
          width: '100%',
          aspectRatio: '16/9',
          minHeight: 200,
          opacity: loading ? 0.6 : 1,
        }}
      />
    </div>
  );
}
