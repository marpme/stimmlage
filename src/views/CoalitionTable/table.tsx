import { FC, useMemo } from "react";
import * as d3 from "d3";
import Color from "color";

import { PartyEntry } from "@/types/PartyEntry.ts";
import { useLastElectionResults } from "@/assets/lastElectionResult.ts";
import { useTheme } from "@/hooks/use-theme.ts";
import { useDimensions } from "@/hooks/useDimensions.ts";

const FIVE_PCT = 5;

export const CoalitionsTable: FC<{ data: Array<PartyEntry> }> = ({ data }) => {
  const { isLight } = useTheme();
  const { ref, dimensions } = useDimensions();

  const maxWidth = dimensions.width * 0.6;
  const lastElectionResults = useLastElectionResults();

  const sortedData = useMemo(
    () =>
      [...data].sort((a, b) => {
        if (a.name === "Sonstige") return 1;
        if (b.name === "Sonstige") return -1;
        return a.value < b.value ? 1 : -1;
      }),
    [data],
  );

  const xScale = useMemo(() => {
    const [, max = 0] = d3.extent(sortedData.map((d) => d.value));
    return d3
      .scaleLinear()
      .domain([0, max + 20])
      .range([0, maxWidth]);
  }, [sortedData, dimensions]);

  const labelFill = isLight ? "#111" : "#f0f0f0";
  const hurdleX = xScale(FIVE_PCT);

  return (
    <div
      ref={ref}
      className="min-h-96 w-full md:w-[50vw] rounded-lg border border-rule overflow-hidden"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule bg-paper">
            <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-ink-tertiary">
              Partei
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-ink-tertiary">
              <span>Umfrage</span>
              <span className="ml-2 font-normal text-[10px] tracking-normal opacity-50">· 5%-Hürde</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, i) => {
            const belowHurdle = item.value < FIVE_PCT && item.name !== "Sonstige";
            const lastElectionResult = lastElectionResults.find(
              (e) => e.name === item.name,
            );
            const rowHeight = lastElectionResult ? 52 : 32;

            return (
              <tr
                key={item.name}
                className={`border-b border-rule last:border-0 ${i % 2 === 1 ? "bg-rule/20" : ""}`}
              >
                {/* Party name */}
                <td className={`px-3 py-2 ${belowHurdle ? "opacity-40" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="font-medium text-ink">{item.name}</span>
                  </div>
                </td>

                {/* Bar chart with 5% hurdle marker */}
                <td className="px-3 py-2">
                  {dimensions.width > 0 && (
                    <svg width={maxWidth} height={rowHeight} style={{ overflow: "visible" }}>
                      {/* Current poll bar */}
                      <rect
                        fill={Color(item.color).darken(0.3).hex()}
                        fillOpacity={belowHurdle ? 0.3 : 0.7}
                        height={28}
                        rx={2}
                        stroke={Color(item.color).darken(0.5).hex()}
                        strokeOpacity={belowHurdle ? 0.15 : 0.4}
                        strokeWidth={1}
                        width={xScale(item.value)}
                        x={0}
                        y={0}
                      />
                      <text
                        alignmentBaseline="baseline"
                        fill={labelFill}
                        fillOpacity={belowHurdle ? 0.35 : 1}
                        fontSize={13}
                        fontWeight="600"
                        textAnchor="start"
                        x={xScale(item.value) + 8}
                        y={21}
                      >
                        {Math.round(item.value * 10) / 10}%
                      </text>
                      {/* Last election comparison bar */}
                      {lastElectionResult && (
                        <rect
                          fill={Color(lastElectionResult.color).hex()}
                          fillOpacity={belowHurdle ? 0.12 : 0.3}
                          height={14}
                          rx={2}
                          stroke={Color(lastElectionResult.color).darken(0.5).hex()}
                          strokeOpacity={belowHurdle ? 0.1 : 0.3}
                          strokeWidth={1}
                          width={xScale(lastElectionResult.value)}
                          x={0}
                          y={34}
                        />
                      )}
                      {/* 5% hurdle marker */}
                      <line
                        x1={hurdleX} y1={-2}
                        x2={hurdleX} y2={rowHeight + 2}
                        stroke="var(--color-ink-secondary)"
                        strokeOpacity="0.25"
                        strokeWidth="1"
                        strokeDasharray="3 2"
                      />
                    </svg>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
