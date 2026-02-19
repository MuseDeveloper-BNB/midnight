'use client';

/**
 * Interactive NIGHT / US Butter ratio chart.
 * Hover to see details for each data point.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

export type ChartDatum = {
  date: string;
  butterUsdPerLb: number;
  nightUsd: number;
  ratio: number;
};

const W_DESKTOP = 1600;
const H_DESKTOP = 900;
const W_MOBILE = 1000;
const H_MOBILE = 700;

const PAD_DESKTOP = { left: 120, right: 60, top: 80, bottom: 120 };
const PAD_MOBILE = { left: 40, right: 20, top: 32, bottom: 44 };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRatio(r: number): string {
  return r.toFixed(2);
}

function formatUsd(n: number): string {
  return `$${n.toFixed(4)}`;
}

type TooltipData = {
  x: number;
  y: number;
  datum: ChartDatum;
} | null;

type NightButterChartProps = {
  data: ChartDatum[];
  butterThrough?: string;
  nightThrough?: string;
};

export default function NightButterChart({
  data,
  butterThrough,
  nightThrough,
}: NightButterChartProps) {
  const isMobile = useIsMobile();
  const [tooltip, setTooltip] = useState<TooltipData>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const W = isMobile ? W_MOBILE : W_DESKTOP;
  const H = isMobile ? H_MOBILE : H_DESKTOP;
  const PAD = isMobile ? PAD_MOBILE : PAD_DESKTOP;
  const G = { w: W - PAD.left - PAD.right, h: H - PAD.top - PAD.bottom };

  // Calculate scales - use safe defaults when data is empty (memoized for hook deps)
  const safeData = useMemo(
    () => (Array.isArray(data) && data.length > 0 ? data : []),
    [data]
  );
  const minR = safeData.length > 0 ? Math.min(...safeData.map((d) => d.ratio)) : 0;
  const maxR = safeData.length > 0 ? Math.max(...safeData.map((d) => d.ratio)) : 1;
  const range = maxR - minR || 1;
  const padY = range * 0.15;
  const yMin = Math.max(0, minR - padY);
  const yMax = maxR + padY;

  const yScale = useCallback(
    (v: number) => PAD.top + G.h - ((v - yMin) / (yMax - yMin)) * G.h,
    [yMin, yMax, PAD.top, G.h]
  );
  const xScale = useCallback(
    (i: number) => PAD.left + (safeData.length > 1 ? (i / (safeData.length - 1)) * G.w : G.w / 2),
    [safeData.length, PAD.left, G.w]
  );

  // Build smooth curve path
  const buildPath = useCallback((): string => {
    if (safeData.length === 0) return '';
    if (safeData.length === 1) {
      const x = xScale(0);
      const y = yScale(safeData[0].ratio);
      return `M ${x},${y}`;
    }
    
    const pts = safeData.map((d, i) => ({ x: xScale(i), y: yScale(d.ratio) }));
    let path = `M ${pts[0].x},${pts[0].y}`;
    
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
    }
    return path;
  }, [safeData, xScale, yScale]);

  // Build area path (for gradient fill)
  const buildAreaPath = useCallback((): string => {
    if (safeData.length < 2) return '';
    const linePath = buildPath();
    const lastX = xScale(safeData.length - 1);
    const firstX = xScale(0);
    const bottomY = PAD.top + G.h;
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [safeData.length, buildPath, xScale, PAD.top, G.h]);

  // Early return AFTER all hooks
  if (safeData.length === 0) return null;

  const pathD = buildPath();
  const areaD = buildAreaPath();

  // Y-axis ticks
  const yTicks = 6;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    const t = i / (yTicks - 1);
    return yMin + (yMax - yMin) * (1 - t);
  });

  // X-axis labels (show every nth label to avoid crowding)
  const xLabelStep = Math.max(1, Math.ceil(safeData.length / 8));

  const handleMouseEnter = (i: number, e: React.MouseEvent<SVGCircleElement>) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    setActiveIndex(i);
    setTooltip({
      x: xScale(i),
      y: yScale(safeData[i].ratio),
      datum: safeData[i],
    });
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
    setTooltip(null);
  };

  const tooltipLeftPct = tooltip ? (tooltip.x / W) * 100 : 50;
  const tooltipTopPct = tooltip ? (tooltip.y / H) * 100 : 50;
  const clampedLeft = tooltip && isMobile ? Math.max(15, Math.min(85, tooltipLeftPct)) : tooltipLeftPct;
  const clampedTop = tooltip && isMobile ? Math.max(12, Math.min(88, tooltipTopPct)) : tooltipTopPct;

  return (
    <figure className="night-butter-chart" aria-label="$NIGHT per pound of US Butter over time">
      <div
        className="night-butter-chart__container"
        data-mobile={isMobile ? 'true' : undefined}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="night-butter-chart__svg"
          role="img"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {yTickValues.map((v, i) => (
            <line
              key={`grid-${i}`}
              x1={PAD.left}
              y1={yScale(v)}
              x2={W - PAD.right}
              y2={yScale(v)}
              className="night-butter-chart__grid"
            />
          ))}

          {/* Y-axis labels */}
          {yTickValues.map((v, i) => (
            <text
              key={`y-${i}`}
              x={PAD.left - 16}
              y={yScale(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="night-butter-chart__axis-label"
            >
              {formatRatio(v)}
            </text>
          ))}

          {/* X-axis labels - last label uses textAnchor end to avoid overflow */}
          {safeData.map((d, i) => {
            const isLast = i === safeData.length - 1;
            const isFirst = i === 0;
            const showByStep = i % xLabelStep === 0;
            const prevShownIndex =
              isLast && i > 0 ? Math.floor((i - 1) / xLabelStep) * xLabelStep : -1;
            const minGap = 70;
            const tooCloseToPrev =
              isLast && prevShownIndex >= 0 && xScale(i) - xScale(prevShownIndex) < minGap;
            const showLabel = (showByStep || isLast) && !tooCloseToPrev;
            if (!showLabel) return null;
            const xPos = isLast ? W - PAD.right : xScale(i);
            return (
              <text
                key={`x-${d.date}`}
                x={xPos}
                y={H - PAD.bottom / 3}
                textAnchor={isLast ? 'end' : isFirst ? 'start' : 'middle'}
                className="night-butter-chart__axis-label"
              >
                {formatShortDate(d.date)}
              </text>
            );
          })}

          {/* Area fill */}
          {areaD && (
            <path
              d={areaD}
              fill="url(#chartGradient)"
              className="night-butter-chart__area"
            />
          )}

          {/* Main line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="night-butter-chart__line"
            filter={activeIndex !== null ? 'url(#glow)' : undefined}
          />

          {/* Vertical hover line */}
          {tooltip && (
            <line
              x1={tooltip.x}
              y1={PAD.top}
              x2={tooltip.x}
              y2={PAD.top + G.h}
              stroke="var(--color-accent)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.5"
              className="night-butter-chart__hover-line"
            />
          )}

          {/* Data points */}
          {safeData.map((d, i) => (
            <g key={d.date}>
              {/* Larger invisible hit area */}
              <circle
                cx={xScale(i)}
                cy={yScale(d.ratio)}
                r="16"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => handleMouseEnter(i, e)}
                onMouseLeave={handleMouseLeave}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMouseEnter(i, e as unknown as React.MouseEvent<SVGCircleElement>);
                }}
                onTouchEnd={() => setTimeout(handleMouseLeave, 400)}
              />
              {/* Visible dot */}
              <circle
                cx={xScale(i)}
                cy={yScale(d.ratio)}
                r={activeIndex === i ? 14 : 10}
                fill={activeIndex === i ? 'var(--color-accent)' : 'var(--color-bg-paper)'}
                stroke="var(--color-accent)"
                strokeWidth={activeIndex === i ? 5 : 4}
                className="night-butter-chart__dot"
                style={{
                  transition: 'r 0.15s ease, fill 0.15s ease, stroke-width 0.15s ease',
                  pointerEvents: 'none',
                }}
              />
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="night-butter-chart__tooltip"
            style={{
              left: `${clampedLeft}%`,
              top: `${clampedTop}%`,
            }}
          >
            <div className="night-butter-chart__tooltip-date">
              {formatFullDate(tooltip.datum.date)}
            </div>
            <div className="night-butter-chart__tooltip-row">
              <span className="night-butter-chart__tooltip-label">$NIGHT/lb:</span>
              <span className="night-butter-chart__tooltip-value night-butter-chart__tooltip-value--highlight">
                {formatRatio(tooltip.datum.ratio)}
              </span>
            </div>
            <div className="night-butter-chart__tooltip-row">
              <span className="night-butter-chart__tooltip-label">NIGHT:</span>
              <span className="night-butter-chart__tooltip-value">
                {formatUsd(tooltip.datum.nightUsd)}
              </span>
            </div>
            <div className="night-butter-chart__tooltip-row">
              <span className="night-butter-chart__tooltip-label">Butter:</span>
              <span className="night-butter-chart__tooltip-value">
                {formatUsd(tooltip.datum.butterUsdPerLb)}/lb
              </span>
            </div>
          </div>
        )}
      </div>

      <figcaption className="night-butter-chart__caption">
        $NIGHT per pound of US Butter (CME Grade AA)
        {butterThrough && nightThrough && (
          <span className="night-butter-chart__caption-dates">
            {' '}— Data through {formatFullDate(nightThrough)}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
