import { useMemo } from "react";
import * as d3 from "d3";
import Color from "color";
import { useDimensions } from "@/hooks/useDimensions.ts";
import { Card } from "@heroui/react";

type DataItem = {
  name: string;
  value?: number;
  color: string;
};

type DonutChartProps = {
  data: DataItem[];
  showMajorityMarker: boolean;
};

const MARGIN = 30;
const TOTAL_PARLIAMENT_SEATS = 630;

export const DonutChart = ({ data, showMajorityMarker }: DonutChartProps) => {
  // Sort by alphabetical to maximise consistency between dataset
  const sortedData = useMemo(
    () => data.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    [data],
  );

  const { ref, dimensions } = useDimensions();

  const utilizedPercentageInParliament = sortedData.reduce((sum, poll) => {
    return sum + (poll.value ?? 0);
  }, 0);

  const radius = Math.min(dimensions.width, dimensions.height) / 2 - MARGIN;
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
    const label = `${grp.data.name} (${Math.round(100 * (grp.value / utilizedPercentageInParliament))}%)`;
    const subLabel = `${Math.round(TOTAL_PARLIAMENT_SEATS * (grp.value / utilizedPercentageInParliament))} seats`;
    const color = Color(grp.data.color).isDark()
      ? Color("white")
      : Color("black");

    return (
      <g key={i}>
        <path d={slicePath ?? undefined} fill={grp.data.color} />
        <text
          dominantBaseline="middle"
          fill={color.hexa().toString()}
          fontSize={14}
          textAnchor="middle"
          x={centroidX}
          y={centroidY}
        >
          {label}
        </text>
        <text
          dominantBaseline="middle"
          fill={color.hexa().toString()}
          fontSize={12}
          fontStyle="italic"
          textAnchor="middle"
          x={centroidX}
          y={centroidY + 14}
        >
          {subLabel}
        </text>
      </g>
    );
  });

  return (
    <Card ref={ref} className="min-h-96 w-full md:w-[50vw]">
      <svg height={dimensions.height} width={dimensions.width}>
        <g
          transform={`translate(${dimensions.width / 2}, ${dimensions.height / 2})`}
        >
          <g>{shapes}</g>
          <circle fill={"#ccc"} fillOpacity={0.5} r={innerRadius / 2} />
          <text dominantBaseline="middle" fontSize={32} textAnchor="middle">
            {TOTAL_PARLIAMENT_SEATS}
          </text>
          <text
            dominantBaseline="middle"
            fontSize={18}
            textAnchor="middle"
            y={20}
          >
            seats
          </text>
          {showMajorityMarker ? (
            <g>
              <line
                x1="0"
                y1={-radius}
                x2="0"
                y2={-innerRadius}
                stroke="red"
                strokeDasharray={"4 4"}
                strokeWidth="2"
              />
              <text
                dominantBaseline="middle"
                fontSize={12}
                textAnchor="middle"
                fill="red"
                y={-radius - 10}
              >
                50% + 1 mark
              </text>
            </g>
          ) : null}
        </g>
      </svg>
    </Card>
  );
};
