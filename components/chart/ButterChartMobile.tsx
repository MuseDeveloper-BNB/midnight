'use client';

/**
 * Mobile-only chart: TradingView Lightweight Charts.
 * Full TradingView UX: crosshair, price scale, time scale, pan, zoom.
 */

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import type { ChartDatum } from '@/components/chart/NightButterChart';

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatUsd(n: number): string {
  return `$${n.toFixed(4)}`;
}

type ButterChartMobileProps = {
  data: ChartDatum[];
  butterThrough?: string;
  nightThrough?: string;
};

export default function ButterChartMobile({
  data,
  butterThrough,
  nightThrough,
}: ButterChartMobileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [crosshairData, setCrosshairData] = useState<ChartDatum | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

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
        borderColor: '#2a2a3a',
        scaleMargins: { top: 0.1, bottom: 0.1 },
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
      priceFormat: { type: 'custom', formatter: (v: number) => v.toFixed(2) },
    });

    const lwcData = data.map((d) => ({
      time: d.date as `${number}-${number}-${number}`,
      value: d.ratio,
    }));
    areaSeries.setData(lwcData);

    // Show last 4 points initially
    const visibleBars = 4;
    chart.timeScale().setVisibleLogicalRange({
      from: (data.length - visibleBars) as number,
      to: data.length as number,
    });

    // Custom tooltip on crosshair move (NIGHT, Butter – like desktop)
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData.size) {
        setCrosshairData(null);
        return;
      }
      let timeStr: string;
      if (typeof param.time === 'string') {
        timeStr = param.time;
      } else if (typeof param.time === 'object' && 'year' in param.time) {
        const t = param.time as { year: number; month: number; day: number };
        timeStr = `${t.year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}`;
      } else {
        timeStr = String(param.time);
      }
      const idx = data.findIndex((d) => d.date === timeStr);
      if (idx >= 0) setCrosshairData(data[idx]!);
      else setCrosshairData(null);
    });

    chartRef.current = chart;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  const caption =
    butterThrough && nightThrough
      ? `Butter through ${butterThrough}; NIGHT through ${nightThrough}`
      : null;

  return (
    <div className="butter-chart-mobile" data-mobile-chart>
      <div className="butter-chart-mobile__lwc-wrap">
        <div
          ref={containerRef}
          className="butter-chart-mobile__lwc"
          style={{ width: '100%', aspectRatio: '16/9', minHeight: 200 }}
        />
        {crosshairData && (
          <div
            ref={tooltipRef}
            className="butter-chart-mobile__tooltip night-butter-chart__tooltip"
          >
            <div className="night-butter-chart__tooltip-date">
              {formatFullDate(crosshairData.date)}
            </div>
            <div className="night-butter-chart__tooltip-row">
              <span className="night-butter-chart__tooltip-label">$NIGHT/lb:</span>
              <span className="night-butter-chart__tooltip-value night-butter-chart__tooltip-value--highlight">
                {crosshairData.ratio.toFixed(2)}
              </span>
            </div>
            <div className="night-butter-chart__tooltip-row">
              <span className="night-butter-chart__tooltip-label">NIGHT:</span>
              <span className="night-butter-chart__tooltip-value">
                {formatUsd(crosshairData.nightUsd)}
              </span>
            </div>
            <div className="night-butter-chart__tooltip-row">
              <span className="night-butter-chart__tooltip-label">Butter:</span>
              <span className="night-butter-chart__tooltip-value">
                {formatUsd(crosshairData.butterUsdPerLb)}/lb
              </span>
            </div>
          </div>
        )}
      </div>
      {caption && (
        <p className="butter-chart-mobile__caption">{caption}</p>
      )}
    </div>
  );
}
