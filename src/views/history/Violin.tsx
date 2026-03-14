import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

import { getPartyColor } from "../../utils/getPartyColor.ts";

import { VerticalViolinShape } from "./VerticalViolinShape.tsx";

import { useTheme } from "@/hooks/use-theme.ts";

const MARGIN = { top: 30, right: 30, bottom: 30, left: 30 };

type ViolinProps = {
  width?: number;
  height?: number;
  data: { name: string; value: number }[];
};

export const Violin = ({ width = 640, height = 640, data }: ViolinProps) => {
  const { isLight } = useTheme();
  // Layout. The div size is set by the given props.
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Compute everything derived from the dataset:
  const { min, max, groups } = useMemo(() => {
    const [min, max] = d3.extent(data.map((d) => d.value)) as [number, number];
    const dataGrouped = Object.groupBy(data, (item) => item.name);

    const groups = Object.entries(dataGrouped)
      .map(([key, groupData]) => ({
        key,
        max: d3.extent(groupData!.map((d) => d.value))[1],
      }))
      .sort((a, b) => d3.descending(a.max, b.max))
      .map((d) => d.key);

    return { min, max, groups };
  }, [data]);

  // Compute scales
  const yScale = d3
    .scaleLinear()
    .domain([min, max])
    .range([boundsHeight, 0])
    .nice();

  const xScale = d3
    .scaleBand()
    .range([0, boundsWidth])
    .domain(groups)
    .padding(0.25);

  // Render the X and Y axis using d3.js, not react
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);

    svgElement.selectAll("*").remove();
    const xAxisGenerator = d3.axisBottom(xScale);

    svgElement
      .append("g")
      .attr("transform", "translate(0," + boundsHeight + ")")
      .call(xAxisGenerator);

    const yAxisGenerator = d3.axisLeft(yScale);

    svgElement.append("g").call(yAxisGenerator);
  }, [xScale, yScale, boundsHeight]);

  // Build the shapes
  const allShapes = groups.map((group, i) => {
    const partyColor = getPartyColor(isLight, group);
    const groupData = data.filter((d) => d.name === group).map((d) => d.value);

    return (
      <g key={i} transform={`translate(${xScale(group)},0)`}>
        <VerticalViolinShape
          binNumber={20}
          color={partyColor}
          data={groupData}
          width={xScale.bandwidth()}
          yScale={yScale}
        />
      </g>
    );
  });

  return (
    <div className="flex flex-col">
      <svg height={height} className="inline-block" width={width}>
        {/* first group is for the violin and box shapes */}

        <g
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
          width={boundsWidth}
        >
          {allShapes}
        </g>
        {/* Second is for the axes */}
        <g
          ref={axesRef}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
          width={boundsWidth}
        />
      </svg>
    </div>
  );
};
