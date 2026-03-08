import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { useDimensions } from "@/hooks/useDimensions.ts";
import { usePollData } from "@/hooks/usePollData.ts";
import { useParliamentStore } from "@/model/useParliamentConfiguration.ts";
import { useTimelineSurveys, TimelinePartyData } from "@/hooks/useTimelineSurveys.ts";
import { electionDates } from "@/assets/electionDates.ts";
import { useTheme } from "@/hooks/use-theme.ts";

const MARGIN = { top: 20, right: 20, bottom: 40, left: 40 };

type TooltipState = {
  x: number;
  y: number;
  date: Date;
  values: { party: string; color: string; value: number }[];
} | null;

// ─── Inner chart (receives concrete dimensions) ──────────────────────────────

type ChartProps = {
  width: number;
  height: number;
  series: TimelinePartyData[];
  parliamentId: string;
};

const TimelineChart = ({ width, height, series, parliamentId }: ChartProps) => {
  const { isLight } = useTheme();
  const axesRef = useRef<SVGGElement>(null);
  const [hoveredParty, setHoveredParty] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const elections = electionDates[parliamentId] ?? [];

  // Flatten all dates and values for scale domains
  const allDates = useMemo(
    () => series.flatMap((s) => s.raw.map((d) => d.date)),
    [series],
  );
  const allValues = useMemo(
    () => series.flatMap((s) => s.raw.map((d) => d.value)),
    [series],
  );

  const xScale = useMemo(() => {
    if (allDates.length === 0) return d3.scaleTime().range([0, boundsWidth]);
    return d3
      .scaleTime()
      .domain(d3.extent(allDates) as [Date, Date])
      .range([0, boundsWidth])
      .nice();
  }, [allDates, boundsWidth]);

  const yScale = useMemo(() => {
    const maxVal = Math.max(50, d3.max(allValues) ?? 50);
    return d3.scaleLinear().domain([0, maxVal]).range([boundsHeight, 0]).nice();
  }, [allValues, boundsHeight]);

  // Draw axes via D3
  useEffect(() => {
    if (!axesRef.current) return;
    const svg = d3.select(axesRef.current);
    svg.selectAll("*").remove();

    const tickColor = isLight ? "#555" : "#aaa";

    svg
      .append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .call((g) => g.select(".domain").attr("stroke", tickColor))
      .call((g) => g.selectAll(".tick line").attr("stroke", tickColor))
      .call((g) => g.selectAll(".tick text").attr("fill", tickColor));

    svg
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(6)
          .tickFormat((v) => `${v}%`),
      )
      .call((g) => g.select(".domain").attr("stroke", tickColor))
      .call((g) => g.selectAll(".tick line").attr("stroke", tickColor))
      .call((g) => g.selectAll(".tick text").attr("fill", tickColor));

    // Subtle horizontal grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(6)
          .tickSize(-boundsWidth)
          .tickFormat(() => ""),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", isLight ? "#e0e0e0" : "#333")
          .attr("stroke-dasharray", "3,3"),
      );
  }, [xScale, yScale, boundsWidth, boundsHeight, isLight]);

  // Line generator — monotone curve smooths the zigzag while preserving data shape
  const lineGenerator = useMemo(
    () =>
      d3
        .line<{ date: Date; value: number }>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX)
        .defined((d) => d.value != null),
    [xScale, yScale],
  );

  // Mouse move: find nearest survey date across all data
  const allPoints = useMemo(
    () =>
      series.flatMap((s) =>
        s.raw.map((d) => ({ ...d, party: s.party, color: s.color })),
      ),
    [series],
  );

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseDate = xScale.invert(mouseX);

    // Find the closest date in any series
    const closest = allPoints.reduce((prev, cur) =>
      Math.abs(cur.date.getTime() - mouseDate.getTime()) <
      Math.abs(prev.date.getTime() - mouseDate.getTime())
        ? cur
        : prev,
    );

    const closestDate = closest.date;
    const snapshot = series
      .map((s) => {
        const pt = s.raw.find(
          (d) => d.date.getTime() === closestDate.getTime(),
        );
        return pt ? { party: s.party, color: s.color, value: pt.value } : null;
      })
      .filter(Boolean) as { party: string; color: string; value: number }[];

    const tooltipX = xScale(closestDate) + MARGIN.left;
    const nearestParty = allPoints.find(
      (p) => p.date.getTime() === closestDate.getTime(),
    )?.party ?? null;

    setHoveredParty(nearestParty);
    setTooltip({
      x: tooltipX,
      y: MARGIN.top + boundsHeight / 4,
      date: closestDate,
      values: snapshot.sort((a, b) => b.value - a.value),
    });
  };

  const handleMouseLeave = () => {
    setHoveredParty(null);
    setTooltip(null);
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <svg width={width} height={height}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Grid + axes (rendered by D3 into this group) */}
          <g ref={axesRef} />

          {/* Election date markers */}
          {elections.map((election) => {
            const ex = xScale(election.date);
            if (ex < 0 || ex > boundsWidth) return null;
            return (
              <g key={election.name}>
                <line
                  x1={ex}
                  x2={ex}
                  y1={0}
                  y2={boundsHeight}
                  stroke={isLight ? "#444" : "#bbb"}
                  strokeDasharray="5,4"
                  strokeWidth={1.5}
                />
                <text
                  x={ex + 4}
                  y={10}
                  fill={isLight ? "#444" : "#bbb"}
                  fontSize={10}
                  fontWeight="600"
                >
                  {election.name}
                </text>
              </g>
            );
          })}

          {/* Scatter dots — raw survey points, faint so the smooth line dominates */}
          {series.map((s) => {
            const isActive = hoveredParty === null || hoveredParty === s.party;
            return s.raw.map((d, i) => (
              <circle
                key={`${s.party}-${i}`}
                cx={xScale(d.date)}
                cy={yScale(d.value)}
                fill={s.color}
                opacity={isActive ? 0.2 : 0.04}
                r={2}
                style={{ transition: "opacity 0.15s" }}
              />
            ));
          })}

          {/* Smooth trend lines — rolling average, rendered on top of dots */}
          {series.map((s) => {
            const isActive = hoveredParty === null || hoveredParty === s.party;
            return (
              <path
                key={s.party}
                d={lineGenerator(s.smooth) ?? ""}
                fill="none"
                opacity={isActive ? 1 : 0.12}
                stroke={s.color}
                strokeWidth={isActive && hoveredParty === s.party ? 2.5 : 1.5}
                style={{ transition: "opacity 0.15s, stroke-width 0.15s" }}
              />
            );
          })}

          {/* Invisible overlay for mouse events */}
          <rect
            fill="transparent"
            height={boundsHeight}
            width={boundsWidth}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          />
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 rounded-lg border border-default-200 bg-background/90 px-3 py-2 shadow-md text-xs"
          style={{ left: tooltip.x + 8, top: tooltip.y }}
        >
          <div className="font-semibold mb-1 text-default-700">
            {tooltip.date.toLocaleDateString("de-DE", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          {tooltip.values.map((v) => (
            <div key={v.party} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: v.color }}
              />
              <span className="text-default-600">{v.party}</span>
              <span className="ml-auto font-medium pl-3">
                {v.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Outer shell (handles data + responsive sizing) ───────────────────────────

export const ElectionTimeline = () => {
  const { ref, dimensions } = useDimensions();
  const { data: pollData } = usePollData();
  const { parliamentId } = useParliamentStore();
  const series = useTimelineSurveys(parliamentId, pollData);

  return (
    <div ref={ref} className="w-full">
      {dimensions.width > 0 && series.length > 0 ? (
        <TimelineChart
          height={480}
          parliamentId={parliamentId}
          series={series}
          width={dimensions.width}
        />
      ) : (
        <div className="flex items-center justify-center h-48 text-default-400 text-sm">
          {series.length === 0 ? "No timeline data available for this parliament." : "Loading…"}
        </div>
      )}
    </div>
  );
};
