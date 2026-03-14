import { useMemo } from "react";
import * as d3 from "d3";

import { TimelinePartyData } from "@/hooks/useTimelineSurveys.ts";

type SparklineChartProps = {
  series: TimelinePartyData[];
  width: number;
  height: number;
};

export const SparklineChart = ({ series, width, height }: SparklineChartProps) => {
  const allDates = useMemo(
    () => series.flatMap((s) => s.smooth.map((d) => d.date)),
    [series],
  );
  const allValues = useMemo(
    () => series.flatMap((s) => s.smooth.map((d) => d.value)),
    [series],
  );

  const xScale = useMemo(() => {
    if (allDates.length === 0) return d3.scaleTime().range([0, width]);
    return d3.scaleTime().domain(d3.extent(allDates) as [Date, Date]).range([0, width]);
  }, [allDates, width]);

  const yScale = useMemo(() => {
    const [minV, maxV] = d3.extent(allValues) as [number, number];
    return d3.scaleLinear().domain([minV ?? 0, maxV ?? 50]).range([height, 0]);
  }, [allValues, height]);

  const lineGen = useMemo(
    () =>
      d3
        .line<{ date: Date; value: number }>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX),
    [xScale, yScale],
  );

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {series.map((s) => (
        <path
          key={s.party}
          d={lineGen(s.smooth) ?? ""}
          fill="none"
          stroke={s.color}
          strokeWidth={1.5}
          opacity={0.85}
        />
      ))}
    </svg>
  );
};
