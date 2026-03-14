import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Button } from "@heroui/button";

import { useDimensions } from "@/hooks/useDimensions.ts";
import { usePollData } from "@/hooks/usePollData.ts";
import { useParliamentStore } from "@/model/useParliamentConfiguration.ts";
import {
  useTimelineSurveys,
  TimelinePartyData,
  TimelineBucket,
} from "@/hooks/useTimelineSurveys.ts";
import { electionDates } from "@/assets/electionDates.ts";
import { useTheme } from "@/hooks/use-theme.ts";

const MARGIN = { top: 20, right: 20, bottom: 40, left: 44 };
const MINI_HEIGHT = 60;
const MINI_MARGIN = { top: 8, bottom: 20 };

/** Semantic color tokens that adapt to light/dark theme */
const themeColors = (isLight: boolean) => ({
  axis: isLight ? "#555" : "#aaa",
  grid: isLight ? "#e5e5e5" : "#333",
  election: isLight ? "#444" : "#bbb",
  crosshair: isLight ? "#999" : "#555",
  tooltipStroke: isLight ? "#fff" : "#000",
  miniAxis: isLight ? "#999" : "#666",
  brush: isLight ? "#6366f1" : "#818cf8",
});

type TooltipState = {
  x: number;
  y: number;
  date: Date;
  values: { party: string; color: string; value: number }[];
} | null;

/** Binary search: find index of the date closest to `target` in a sorted array. */
function bisectClosest(dates: Date[], target: Date): number {
  const t = target.getTime();
  let lo = 0;
  let hi = dates.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (dates[mid].getTime() < t) lo = mid + 1;
    else hi = mid;
  }
  if (
    lo > 0 &&
    Math.abs(dates[lo - 1].getTime() - t) < Math.abs(dates[lo].getTime() - t)
  ) {
    return lo - 1;
  }
  return lo;
}

// ─── Main chart ───────────────────────────────────────────────────────────────

type ChartProps = {
  width: number;
  height: number;
  series: TimelinePartyData[];
  parliamentId: string;
  zoomDomain: [Date, Date] | null;
};

const TimelineChart = ({
  width,
  height,
  series,
  parliamentId,
  zoomDomain,
}: ChartProps) => {
  const { isLight } = useTheme();
  const axesRef = useRef<SVGGElement>(null);
  const [hoveredParty, setHoveredParty] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const elections = electionDates[parliamentId] ?? [];

  const fullDateExtent = useMemo(
    () =>
      d3.extent(series.flatMap((s) => s.smooth.map((d) => d.date))) as [
        Date,
        Date,
      ],
    [series],
  );

  const allValues = useMemo(
    () => series.flatMap((s) => s.smooth.map((d) => d.value)),
    [series],
  );

  // When zoomed, filter values to the visible window so y-axis rescales nicely
  const visibleValues = useMemo(() => {
    if (!zoomDomain) return allValues;
    const [lo, hi] = zoomDomain.map((d) => d.getTime());
    return series.flatMap((s) =>
      s.smooth
        .filter((d) => d.date.getTime() >= lo && d.date.getTime() <= hi)
        .map((d) => d.value),
    );
  }, [series, zoomDomain, allValues]);

  const xScale = useMemo(() => {
    const domain = zoomDomain ?? fullDateExtent;
    if (!domain[0]) return d3.scaleTime().range([0, boundsWidth]);
    return d3.scaleTime().domain(domain).range([0, boundsWidth]);
  }, [zoomDomain, fullDateExtent, boundsWidth]);

  const yScale = useMemo(() => {
    const maxVal = Math.max(50, d3.max(visibleValues) ?? 50);
    return d3.scaleLinear().domain([0, maxVal]).range([boundsHeight, 0]).nice();
  }, [visibleValues, boundsHeight]);

  useEffect(() => {
    if (!axesRef.current) return;
    const svg = d3.select(axesRef.current);
    svg.selectAll("*").remove();
    const colors = themeColors(isLight);

    svg
      .append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .call((g) => g.select(".domain").attr("stroke", colors.axis))
      .call((g) => g.selectAll(".tick line").attr("stroke", colors.axis))
      .call((g) => g.selectAll(".tick text").attr("fill", colors.axis));

    svg
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(6)
          .tickFormat((v) => `${v}%`),
      )
      .call((g) => g.select(".domain").attr("stroke", colors.axis))
      .call((g) => g.selectAll(".tick line").attr("stroke", colors.axis))
      .call((g) => g.selectAll(".tick text").attr("fill", colors.axis));

    svg
      .append("g")
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
          .attr("stroke", colors.grid)
          .attr("stroke-dasharray", "3,3"),
      );
  }, [xScale, yScale, boundsWidth, boundsHeight, isLight]);

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

  const areaGenerator = useMemo(
    () =>
      d3
        .area<TimelineBucket>()
        .x((d) => xScale(d.date))
        .y0((d) => yScale(d.min))
        .y1((d) => yScale(d.max))
        .curve(d3.curveMonotoneX),
    [xScale, yScale],
  );

  const pathStrings = useMemo(
    () => new Map(series.map((s) => [s.party, lineGenerator(s.smooth) ?? ""])),
    [series, lineGenerator],
  );

  const bandStrings = useMemo(
    () => new Map(series.map((s) => [s.party, areaGenerator(s.band) ?? ""])),
    [series, areaGenerator],
  );

  const referenceDates = useMemo(() => series[0]?.sortedDates ?? [], [series]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (referenceDates.length === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseDate = xScale.invert(e.clientX - rect.left);

      // Only consider dates within the current zoom window
      const [domainLo, domainHi] = xScale.domain() as [Date, Date];
      const visibleDates = referenceDates.filter(
        (d) => d >= domainLo && d <= domainHi,
      );
      if (visibleDates.length === 0) return;

      const idx = bisectClosest(visibleDates, mouseDate);
      const closestDate = visibleDates[idx];
      const t = closestDate.getTime();

      const values = series
        .map((s) => {
          const v = s.valueByDate.get(t);
          return v !== undefined
            ? { party: s.party, color: s.color, value: v }
            : null;
        })
        .filter(Boolean) as { party: string; color: string; value: number }[];

      values.sort((a, b) => b.value - a.value);
      setHoveredParty(values[0]?.party ?? null);
      setTooltip({
        x: xScale(closestDate) + MARGIN.left,
        y: MARGIN.top + boundsHeight / 4,
        date: closestDate,
        values,
      });
    },
    [xScale, referenceDates, series, boundsHeight],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredParty(null);
    setTooltip(null);
  }, []);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg width={width} height={height}>
        {/* clip path so lines don't overflow outside the chart bounds */}
        <defs>
          <clipPath id="chart-clip">
            <rect x={0} y={0} width={boundsWidth} height={boundsHeight} />
          </clipPath>
        </defs>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          <g ref={axesRef} />

          {elections.map((election) => {
            const ex = xScale(election.date);
            if (ex < 0 || ex > boundsWidth) return null;
            const electionColor = themeColors(isLight).election;
            return (
              <g key={election.name}>
                <line
                  x1={ex}
                  x2={ex}
                  y1={0}
                  y2={boundsHeight}
                  stroke={electionColor}
                  strokeDasharray="5,4"
                  strokeWidth={1.5}
                />
                <text
                  x={ex + 4}
                  y={10}
                  fill={electionColor}
                  fontSize={10}
                  fontWeight="600"
                >
                  {election.name}
                </text>
              </g>
            );
          })}

          <g clipPath="url(#chart-clip)">
            {series.map((s) => {
              const isActive =
                hoveredParty === null || hoveredParty === s.party;
              return (
                <path
                  key={`band-${s.party}`}
                  d={bandStrings.get(s.party)}
                  fill={s.color}
                  stroke="none"
                  opacity={isActive ? 0.12 : 0.03}
                  style={{ transition: "opacity 0.1s" }}
                />
              );
            })}
            {series.map((s) => {
              const isActive =
                hoveredParty === null || hoveredParty === s.party;
              return (
                <path
                  key={s.party}
                  d={pathStrings.get(s.party)}
                  fill="none"
                  stroke={s.color}
                  opacity={isActive ? 1 : 0.15}
                  strokeWidth={isActive && hoveredParty === s.party ? 2.5 : 1.5}
                  style={{ transition: "opacity 0.1s, stroke-width 0.1s" }}
                />
              );
            })}
          </g>

          {tooltip && (
            <g>
              <line
                x1={tooltip.x - MARGIN.left}
                x2={tooltip.x - MARGIN.left}
                y1={0}
                y2={boundsHeight}
                stroke={themeColors(isLight).crosshair}
                strokeWidth={1}
                strokeDasharray="3,3"
                pointerEvents="none"
              />
              {tooltip.values.map((v) => (
                <circle
                  key={v.party}
                  cx={tooltip.x - MARGIN.left}
                  cy={yScale(v.value)}
                  r={4}
                  fill={v.color}
                  stroke={themeColors(isLight).tooltipStroke}
                  strokeWidth={1.5}
                  pointerEvents="none"
                />
              ))}
            </g>
          )}

          <rect
            fill="transparent"
            height={boundsHeight}
            width={boundsWidth}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          />
        </g>
      </svg>

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

// ─── Minimap with brush ───────────────────────────────────────────────────────

type MinimapProps = {
  width: number;
  series: TimelinePartyData[];
  zoomDomain: [Date, Date] | null;
  onBrush: (domain: [Date, Date] | null) => void;
};

const Minimap = ({ width, series, zoomDomain, onBrush }: MinimapProps) => {
  const { isLight } = useTheme();
  const brushRef = useRef<SVGGElement>(null);
  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = MINI_HEIGHT - MINI_MARGIN.top - MINI_MARGIN.bottom;

  const allDates = useMemo(
    () => series.flatMap((s) => s.smooth.map((d) => d.date)),
    [series],
  );
  const allValues = useMemo(
    () => series.flatMap((s) => s.smooth.map((d) => d.value)),
    [series],
  );

  const xScale = useMemo(() => {
    if (allDates.length === 0) return d3.scaleTime().range([0, boundsWidth]);
    return d3
      .scaleTime()
      .domain(d3.extent(allDates) as [Date, Date])
      .range([0, boundsWidth]);
  }, [allDates, boundsWidth]);

  const yScale = useMemo(() => {
    const maxVal = Math.max(50, d3.max(allValues) ?? 50);
    return d3.scaleLinear().domain([0, maxVal]).range([boundsHeight, 0]);
  }, [allValues, boundsHeight]);

  const lineGen = useMemo(
    () =>
      d3
        .line<{ date: Date; value: number }>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX),
    [xScale, yScale],
  );

  const miniPaths = useMemo(
    () => new Map(series.map((s) => [s.party, lineGen(s.smooth) ?? ""])),
    [series, lineGen],
  );

  // Mount & update the D3 brush
  useEffect(() => {
    if (!brushRef.current || boundsWidth <= 0) return;

    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [boundsWidth, boundsHeight],
      ])
      .on("end", (event: d3.D3BrushEvent<unknown>) => {
        if (!event.selection) {
          onBrush(null);
          return;
        }
        const [x0, x1] = event.selection as [number, number];
        onBrush([xScale.invert(x0), xScale.invert(x1)]);
      });

    const g = d3.select(brushRef.current);
    g.call(brush);

    // Reflect external zoom state back onto the brush (e.g. reset)
    if (zoomDomain) {
      brush.move(g, [xScale(zoomDomain[0]), xScale(zoomDomain[1])]);
    } else {
      brush.clear(g);
    }

    // Style the brush handles and selection
    const brushColor = themeColors(isLight).brush;
    g.select(".selection")
      .attr("fill", brushColor)
      .attr("fill-opacity", 0.15)
      .attr("stroke", brushColor)
      .attr("stroke-width", 1);
  }, [boundsWidth, boundsHeight, xScale, zoomDomain, onBrush, isLight]);

  return (
    <svg width={width} height={MINI_HEIGHT}>
      <g transform={`translate(${MARGIN.left},${MINI_MARGIN.top})`}>
        {/* Faint x-axis */}
        <g transform={`translate(0,${boundsHeight})`}>
          {xScale.ticks(6).map((tick) => {
            const miniAxisColor = themeColors(isLight).miniAxis;
            return (
              <g
                key={tick.toString()}
                transform={`translate(${xScale(tick)},0)`}
              >
                <line y2={4} stroke={miniAxisColor} />
                <text
                  y={14}
                  textAnchor="middle"
                  fontSize={9}
                  fill={miniAxisColor}
                >
                  {d3.timeFormat("%Y")(tick)}
                </text>
              </g>
            );
          })}
        </g>

        {/* Mini lines */}
        {series.map((s) => (
          <path
            key={s.party}
            d={miniPaths.get(s.party)}
            fill="none"
            stroke={s.color}
            strokeWidth={1}
            opacity={0.6}
          />
        ))}

        {/* Brush layer */}
        <g ref={brushRef} />
      </g>
    </svg>
  );
};

// ─── Outer shell ─────────────────────────────────────────────────────────────

type ElectionTimelineProps = {
  parliamentId?: string;
};

export const ElectionTimeline = ({
  parliamentId: parliamentIdProp,
}: ElectionTimelineProps = {}) => {
  const { ref, dimensions } = useDimensions();
  const { data: pollData } = usePollData();
  const { parliamentId: storeParliamentId } = useParliamentStore();
  const parliamentId = parliamentIdProp ?? storeParliamentId;
  const series = useTimelineSurveys(parliamentId, pollData);
  const [zoomDomain, setZoomDomain] = useState<[Date, Date] | null>(null);

  // Reset zoom when parliament changes
  useEffect(() => {
    setZoomDomain(null);
  }, [parliamentId]);

  const handleBrush = useCallback((domain: [Date, Date] | null) => {
    // Ignore tiny accidental selections (< 3 days)
    if (
      domain &&
      domain[1].getTime() - domain[0].getTime() < 3 * 24 * 60 * 60 * 1000
    )
      return;
    setZoomDomain(domain);
  }, []);

  const isZoomed = zoomDomain !== null;

  return (
    <div ref={ref} className="w-full">
      {dimensions.width > 0 && series.length > 0 ? (
        <div className="flex flex-col gap-3">
          {isZoomed && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-default-500">
                {zoomDomain![0].toLocaleDateString("de-DE", {
                  month: "short",
                  year: "numeric",
                })}
                {" – "}
                {zoomDomain![1].toLocaleDateString("de-DE", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <Button
                size="sm"
                variant="bordered"
                onPress={() => setZoomDomain(null)}
              >
                Reset zoom
              </Button>
            </div>
          )}
          <TimelineChart
            height={480}
            parliamentId={parliamentId}
            series={series}
            width={dimensions.width}
            zoomDomain={zoomDomain}
          />
          <Minimap
            series={series}
            width={dimensions.width}
            zoomDomain={zoomDomain}
            onBrush={handleBrush}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-default-400 text-sm">
          {series.length === 0
            ? "No timeline data available for this parliament."
            : "Loading…"}
        </div>
      )}
    </div>
  );
};
