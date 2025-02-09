import { useMemo } from "react";
import * as d3 from "d3";
import Color from "color";

type DataItem = {
  name: string;
  value?: number;
  color: string;
};

type DonutChartProps = {
  width?: number;
  height?: number;
  data: DataItem[];
};

const MARGIN = 30;
const TOTAL_PARLIAMENT_SEATS = 635;

export const DonutChart = ({
  width = 640,
  height = 640,
  data,
}: DonutChartProps) => {
  // Sort by alphabetical to maximise consistency between dataset
  const sortedData = useMemo(
    () => data.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    [data],
  );

  const utilizedPercentageInParliament = sortedData.reduce((sum, poll) => {
    return sum + (poll.value ?? 0);
  }, 0);

  const radius = Math.min(width, height) / 2 - MARGIN;
  const innerRadius = radius / 2;

  const pie = useMemo(() => {
    const pieGenerator = d3
      .pie<unknown, DataItem>()
      .startAngle(-2)
      .endAngle(2)
      .value((d) => d.value || 0)
      .sort(null); // Do not apply any sorting, respect the order of the provided dataset

    return pieGenerator(sortedData);
  }, [sortedData]);

  const arcGenerator = d3.arc();

  const shapes = pie.map((grp, i) => {
    // First arc is for the donut
    const sliceInfo = {
      innerRadius,
      outerRadius: radius,
      startAngle: grp.startAngle,
      endAngle: grp.endAngle,
    };
    const [centroidX, centroidY] = arcGenerator.centroid(sliceInfo);
    const slicePath = arcGenerator(sliceInfo);
    const label = `${grp.data.name} (${Math.round(grp.value)}%)`;
    const subLabel = `${Math.round(TOTAL_PARLIAMENT_SEATS * (grp.value / utilizedPercentageInParliament))} seats`;
    const color = Color(grp.data.color).isDark()
      ? Color("white")
      : Color("black");

    return (
      <g key={i}>
        <path d={slicePath ?? undefined} fill={grp.data.color} />
        <text
          x={centroidX}
          y={centroidY}
          fill={color.hexa().toString()}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
        >
          {label}
        </text>
        <text
          x={centroidX}
          y={centroidY + 14}
          fill={color.hexa().toString()}
          textAnchor="middle"
          dominantBaseline="middle"
          fontStyle="italic"
          fontSize={12}
        >
          {subLabel}
        </text>
      </g>
    );
  });

  return (
    <svg width={width} height={height} style={{ display: "inline-block" }}>
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        <g>{shapes}</g>
        <circle fill={"#ccc"} fillOpacity={0.5} r={innerRadius / 2} />
        <text textAnchor="middle" dominantBaseline="middle" fontSize={32}>
          {TOTAL_PARLIAMENT_SEATS}
        </text>
        <text
          y={20}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={18}
        >
          seats
        </text>
      </g>
    </svg>
  );
};
