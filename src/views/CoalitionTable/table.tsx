import { FC, useMemo } from "react";
import * as d3 from "d3";

import { PartyEntry } from "@/types/PartyEntry.ts";
import { PartyTrendStat } from "@/hooks/usePartyTrendStats.ts";
import { useDimensions } from "@/hooks/useDimensions.ts";
import { useTheme } from "@/hooks/use-theme.ts";

const FIVE_PCT = 5;

type Props = {
  data: Array<PartyEntry>;
  trendStats?: PartyTrendStat[];
};

function formatDelta(value: number | null): { text: string; positive: boolean; neutral: boolean } {
  if (value === null || value === 0) return { text: value === 0 ? "0.0" : "—", positive: false, neutral: true };
  return {
    text: `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(1)}`,
    positive: value > 0,
    neutral: false,
  };
}

export const CoalitionsTable: FC<Props> = ({ data, trendStats = [] }) => {
  const { isLight } = useTheme();
  const { ref, dimensions } = useDimensions();

  const barMaxWidth = dimensions.width * 0.5;

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
    const max = d3.max(sortedData, (d) => d.value) ?? 0;
    return d3.scaleLinear().domain([0, max + 8]).range([0, barMaxWidth]);
  }, [sortedData, barMaxWidth]);

  const hurdleX = xScale(FIVE_PCT);
  const labelFill = isLight ? "var(--color-ink)" : "var(--color-ink)";

  const statsByName = useMemo(() => {
    const m = new Map<string, PartyTrendStat>();
    for (const s of trendStats) m.set(s.name, s);
    return m;
  }, [trendStats]);

  return (
    <div
      ref={ref}
      className="w-full md:w-[50vw] rounded-lg border border-rule overflow-hidden"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule bg-rule/20">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest uppercase text-ink-tertiary w-28">
              Partei
            </th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest uppercase text-ink-tertiary">
              Umfrage
              <span className="ml-2 font-normal tracking-normal opacity-40">· 5%-Hürde</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => {
            const belowHurdle = item.value < FIVE_PCT && item.name !== "Sonstige";
            const stat = statsByName.get(item.name);
            const d30 = formatDelta(stat?.delta30 ?? null);
            const d90 = formatDelta(stat?.delta90 ?? null);
            const spread = stat?.spread ?? null;
            const barW = xScale(item.value);

            return (
              <tr
                key={item.name}
                className="border-b border-rule last:border-0"
              >
                {/* Party name */}
                <td className={`px-4 py-3 align-top pt-3.5 ${belowHurdle ? "opacity-35" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-px"
                      style={{ background: item.color }}
                    />
                    <span className="font-medium text-ink text-xs leading-tight">{item.name}</span>
                  </div>
                </td>

                {/* Bar + stat line beneath */}
                <td className="px-4 py-3">
                  {dimensions.width > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {/* Bar row */}
                      <svg
                        width={barMaxWidth}
                        height={20}
                        style={{ overflow: "visible", display: "block" }}
                      >
                        {/* Main bar */}
                        <rect
                          x={0} y={4}
                          width={barW} height={12}
                          rx={2}
                          fill={item.color}
                          fillOpacity={belowHurdle ? 0.25 : 0.72}
                        />
                        {/* 5% hurdle line */}
                        <line
                          x1={hurdleX} y1={0}
                          x2={hurdleX} y2={20}
                          stroke="var(--color-ink-secondary)"
                          strokeOpacity={0.22}
                          strokeWidth={1}
                          strokeDasharray="3 2"
                        />
                        {/* Value label */}
                        <text
                          x={barW + 6} y={14}
                          fill={labelFill}
                          fillOpacity={belowHurdle ? 0.35 : 0.9}
                          fontSize={11}
                          fontWeight="600"
                        >
                          {item.value.toFixed(1)}%
                        </text>
                      </svg>

                      {/* Stat line: 30d · 90d · spread */}
                      {!belowHurdle && (stat?.delta30 !== undefined || stat?.delta90 !== undefined || spread !== null) && (
                        <div className="flex items-center gap-2.5 text-[10px] tabular-nums leading-none">
                          {/* 30d */}
                          <span className="text-ink-tertiary">30d</span>
                          <span
                            className="font-semibold"
                            style={{ color: d30.neutral ? "var(--color-ink-tertiary)" : d30.positive ? "var(--color-accent)" : "var(--color-ink-secondary)" }}
                          >
                            {d30.text}
                          </span>

                          <span className="text-rule select-none">·</span>

                          {/* 90d */}
                          <span className="text-ink-tertiary">90d</span>
                          <span
                            className="font-semibold"
                            style={{ color: d90.neutral ? "var(--color-ink-tertiary)" : d90.positive ? "var(--color-accent)" : "var(--color-ink-secondary)" }}
                          >
                            {d90.text}
                          </span>

                          {spread !== null && (
                            <>
                              <span className="text-rule select-none">·</span>
                              <span className="text-ink-tertiary">Spanne</span>
                              <span className="text-ink-secondary font-medium">±{(spread / 2).toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
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
