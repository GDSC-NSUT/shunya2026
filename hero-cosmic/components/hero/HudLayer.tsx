'use client';

import React, { useEffect, useRef, useCallback } from 'react';

// ─── Grid configuration ────────────────────────────────────────────
const COL_SPLITS = [0.28, 0.38, 0.34]; // 3 columns
const ROW_SPLITS = [0.45, 0.55];        // 2 rows

function cumulative(splits: number[]): number[] {
  const result = [0];
  let sum = 0;
  for (const s of splits) {
    sum += s;
    result.push(sum);
  }
  return result;
}

const COL_POS = cumulative(COL_SPLITS);
const ROW_POS = cumulative(ROW_SPLITS);

const NUM_COLS = COL_SPLITS.length;
const NUM_ROWS = ROW_SPLITS.length;

const LINE_COLOR = '#EAEAEA';
const LINE_OPACITY = 0.85;
const NODE_SIZE = 4;
const LABEL_COLOR = 'rgba(234,234,234,0.75)';
const LABEL_SIZE = 11;
const SCAN_COLOR = '#00D4FF';

function randomLabel(): string {
  const integer = Math.floor(Math.random() * 4);
  const frac = Math.random().toFixed(7).slice(2);
  return `${integer}.${frac}`;
}

interface CellInfo {
  col: number;
  row: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * HudLayer — full-hero SVG with grid, nodes, flickering labels, and scan-pulse.
 *
 * Performance contract:
 * - Label flicker: 500ms interval, only 2 random labels per tick (was all 6 at 120ms)
 * - Scan-pulse: unchanged timeout chain, direct style writes
 * - SVG uses contain:layout paint style (NOT strict — strict forces expensive stacking context)
 * - No will-change on the SVG itself
 * - ZERO React state updates after mount
 */
export default function HudLayer({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const labelRefs = useRef<SVGTextElement[]>([]);
  const scanLineRefs = useRef<SVGLineElement[]>([]);
  const flickerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScanCell = useRef(-1);

  const getCells = useCallback((): CellInfo[] => {
    const cells: CellInfo[] = [];
    for (let r = 0; r < NUM_ROWS; r++) {
      for (let c = 0; c < NUM_COLS; c++) {
        cells.push({
          col: c, row: r,
          x1: COL_POS[c], y1: ROW_POS[r],
          x2: COL_POS[c + 1], y2: ROW_POS[r + 1],
        });
      }
    }
    return cells;
  }, []);

  const cells = getCells();

  // ─── Label initialization + flicker ────────────────────────────
  useEffect(() => {
    // Initialize labels on mount
    for (const label of labelRefs.current) {
      if (label) label.textContent = randomLabel();
    }

    if (reducedMotion) return;

    const total = labelRefs.current.length;

    // Perf fix: only update 2 random labels per tick at 500ms (was ALL labels at 120ms)
    flickerInterval.current = setInterval(() => {
      if (total === 0) return;
      const idx1 = Math.floor(Math.random() * total);
      let idx2 = Math.floor(Math.random() * total);
      if (idx2 === idx1) idx2 = (idx1 + 1) % total;
      const l1 = labelRefs.current[idx1];
      const l2 = labelRefs.current[idx2];
      if (l1) l1.textContent = randomLabel();
      if (l2) l2.textContent = randomLabel();
    }, 500);

    return () => {
      if (flickerInterval.current) clearInterval(flickerInterval.current);
    };
  }, [reducedMotion]);

  // ─── Scan-pulse controller ─────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;

    function fireScanPulse() {
      const lines = scanLineRefs.current;
      if (!lines.length) return;

      let idx: number;
      do {
        idx = Math.floor(Math.random() * lines.length);
      } while (idx === lastScanCell.current && lines.length > 1);
      lastScanCell.current = idx;

      const line = lines[idx];
      if (!line) return;

      const length = line.getTotalLength();

      line.style.transition = 'none';
      line.style.strokeDasharray = `${length}`;
      line.style.strokeDashoffset = `${length}`;
      line.style.opacity = '0.9';
      line.style.stroke = SCAN_COLOR;

      void line.clientLeft;

      line.style.transition = 'stroke-dashoffset 180ms ease-out';
      line.style.strokeDashoffset = '0';

      scanTimeout.current = setTimeout(() => {
        line.style.transition = 'opacity 220ms ease-in, stroke-dasharray 220ms ease-in';
        line.style.strokeDasharray = '4 6';
        line.style.opacity = '0.3';

        scanTimeout.current = setTimeout(() => {
          line.style.transition = 'opacity 100ms ease-in';
          line.style.opacity = '0';

          scanTimeout.current = setTimeout(() => {
            fireScanPulse();
          }, 600 + Math.random() * 300);
        }, 220);
      }, 180);
    }

    scanTimeout.current = setTimeout(fireScanPulse, 500);

    return () => {
      if (scanTimeout.current) clearTimeout(scanTimeout.current);
    };
  }, [reducedMotion]);

  // ─── Render ────────────────────────────────────────────────────
  const VB_W = 1000;
  const VB_H = 1000;
  const MARGIN = 40;
  const innerW = VB_W - MARGIN * 2;
  const innerH = VB_H - MARGIN * 2;

  const colX = COL_POS.map(f => MARGIN + f * innerW);
  const rowY = ROW_POS.map(f => MARGIN + f * innerH);

  return (
    <svg
      ref={svgRef}
      className="hud-layer"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      // Perf fix: contain:layout paint style instead of strict
      // strict creates an isolated stacking context that forces recomposite on every SVG paint
      style={{ contain: 'layout paint style' }}
    >
      {/* Vertical grid lines */}
      {colX.map((x, i) => (
        <line
          key={`v-${i}`}
          x1={x} y1={rowY[0]}
          x2={x} y2={rowY[rowY.length - 1]}
          stroke={LINE_COLOR}
          strokeOpacity={LINE_OPACITY}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Horizontal grid lines */}
      {rowY.map((y, i) => (
        <line
          key={`h-${i}`}
          x1={colX[0]} y1={y}
          x2={colX[colX.length - 1]} y2={y}
          stroke={LINE_COLOR}
          strokeOpacity={LINE_OPACITY}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Intersection nodes */}
      {colX.map((x, ci) =>
        rowY.map((y, ri) => (
          <rect
            key={`node-${ci}-${ri}`}
            x={x - NODE_SIZE / 2}
            y={y - NODE_SIZE / 2}
            width={NODE_SIZE}
            height={NODE_SIZE}
            fill={LINE_COLOR}
            fillOpacity={LINE_OPACITY}
          />
        ))
      )}

      {/* Per-cell labels (bottom-left corner) */}
      {cells.map((cell, i) => (
        <text
          key={`label-${i}`}
          ref={(el) => { if (el) labelRefs.current[i] = el; }}
          x={colX[cell.col] + 8}
          y={rowY[cell.row + 1] - 10}
          fill={LABEL_COLOR}
          fontSize={LABEL_SIZE}
          fontFamily="var(--font-corpta)"
          style={{ fontVariantNumeric: 'tabular-nums' }}
          suppressHydrationWarning
        >
          {'0.0000000'}
        </text>
      ))}

      {/* Per-cell scan-pulse diagonals */}
      {cells.map((cell, i) => (
        <line
          key={`scan-${i}`}
          ref={(el) => { if (el) scanLineRefs.current[i] = el; }}
          x1={colX[cell.col]}
          y1={rowY[cell.row + 1]}
          x2={colX[cell.col + 1]}
          y2={rowY[cell.row]}
          stroke={SCAN_COLOR}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          style={{ opacity: 0 }}
        />
      ))}
    </svg>
  );
}
