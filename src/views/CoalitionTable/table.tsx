import { FC, useMemo } from "react";
import * as d3 from "d3";
import Color from "color";

import { PartyEntry } from "@/types/PartyEntry.ts";
import { useLastElectionResults } from "@/assets/lastElectionResult.ts";
import { useTheme } from "@/hooks/use-theme.ts";
import { useDimensions } from "@/hooks/useDimensions.ts";
import { useParliamentStore } from "@/model/useParliamentConfiguration.ts";
import { PartyValues } from "@/utils/Party.ts";

export const CoalitionsTable: FC<{ data: Array<PartyEntry> }> = ({ data }) => {
  const { isLight } = useTheme();
  const { ref, dimensions } = useDimensions();
  const { addDirectCandidate, removeDirectCandidate, directCandidates } =
    useParliamentStore();

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
    const [min = 0, max = 0] = d3.extent(sortedData.map((d) => d.value));
    return d3
      .scaleLinear()
      .domain([min, max + 20])
      .range([0, maxWidth]);
  }, [sortedData, dimensions]);

  const toggleRow = (name: string) => {
    if (directCandidates.has(name as PartyValues)) {
      removeDirectCandidate(name as PartyValues);
    } else {
      addDirectCandidate(name as PartyValues);
    }
  };

  const labelFill = isLight ? "#111" : "#f0f0f0";

  return (
    <div
      ref={ref}
      className="min-h-96 w-full md:w-[50vw] rounded-lg border border-rule overflow-hidden"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule bg-paper">
            <th className="w-8 px-3 py-2" />
            <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-ink-tertiary">
              Partei
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-ink-tertiary">
              Umfrage
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, i) => {
            const isSelected = directCandidates.has(item.name as PartyValues);
            const lastElectionResult = lastElectionResults.find(
              (e) => e.name === item.name,
            );

            return (
              <tr
                key={item.name}
                onClick={() => toggleRow(item.name)}
                className={`border-b border-rule last:border-0 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-accent-subtle"
                    : i % 2 === 1
                      ? "bg-rule/20"
                      : ""
                } hover:bg-accent-subtle`}
              >
                {/* Checkbox */}
                <td className="px-3 py-2">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "bg-accent border-accent" : "border-rule"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-2.5 h-2.5 text-paper"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5l2.5 2.5L8 3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </td>

                {/* Party name with color swatch */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="font-medium text-ink">{item.name}</span>
                  </div>
                </td>

                {/* Bar chart */}
                <td className="px-3 py-2">
                  {dimensions.width > 0 && (
                    <svg width={maxWidth} height={lastElectionResult ? 52 : 32}>
                      {/* Current poll bar */}
                      <rect
                        fill={Color(item.color).darken(0.3).hex()}
                        fillOpacity={0.7}
                        height={28}
                        rx={2}
                        stroke={Color(item.color).darken(0.5).hex()}
                        strokeOpacity={0.4}
                        strokeWidth={1}
                        width={xScale(item.value)}
                        x={0}
                        y={0}
                      />
                      <text
                        alignmentBaseline="baseline"
                        fill={labelFill}
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
                          fillOpacity={0.3}
                          height={14}
                          rx={2}
                          stroke={Color(lastElectionResult.color)
                            .darken(0.5)
                            .hex()}
                          strokeOpacity={0.3}
                          strokeWidth={1}
                          width={xScale(lastElectionResult.value)}
                          x={0}
                          y={34}
                        />
                      )}
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
