import { useMemo } from "react";
import * as d3 from "d3";
import { useDimensions } from "@/hooks/useDimensions.ts";
import { buildCoalitions } from "./coalitions.ts";

type DataItem = {
  name: string;
  value?: number;
  color: string;
};

type DonutChartProps = {
  data: DataItem[];
  showMajorityMarker: boolean;
};

const MAJORITY = 0.5; // >50% needed
const TWO_THIRDS = 2 / 3;
const MARGIN = 24;
const MIN_LABEL_ANGLE = 0.28; // ~16°, minimum slice angle to show a label


export const DonutChart = ({ data }: DonutChartProps) => {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
    [data],
  );

  const { ref, dimensions } = useDimensions();

  const total = sortedData.reduce((sum, d) => sum + (d.value ?? 0), 0);

  const size = dimensions.width ? Math.min(dimensions.width, 320) : 280;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - MARGIN;
  const innerRadius = outerRadius * 0.58;

  const pie = useMemo(() => {
    return d3
      .pie<DataItem>()
      .value((d) => d.value ?? 0)
      .padAngle(0.018)
      .sort(null)(sortedData);
  }, [sortedData]);

  const arc = useMemo(
    () => d3.arc<d3.PieArcDatum<DataItem>>().innerRadius(innerRadius).outerRadius(outerRadius),
    [innerRadius, outerRadius],
  );

  const labelArc = useMemo(
    () => d3.arc<d3.PieArcDatum<DataItem>>().innerRadius(outerRadius * 0.75).outerRadius(outerRadius * 0.75),
    [outerRadius],
  );

  const coalitions = useMemo(() => buildCoalitions(sortedData, total), [sortedData, total]);

  const pct = (value: number) => Math.round(100 * (value / total));

  return (
    <div
      ref={ref}
      className="w-full md:w-[50vw] rounded-lg border border-rule overflow-hidden bg-paper"
    >
      {dimensions.width > 0 && (
        <div className="flex flex-col items-center gap-0 py-6 px-4">

          {/* Donut SVG */}
          <svg width={size} height={size} style={{ overflow: "visible" }}>
            <g transform={`translate(${cx},${cy})`}>
              {pie.map((d, i) => (
                <path
                  key={i}
                  d={arc(d) ?? undefined}
                  fill={d.data.color}
                  fillOpacity={0.88}
                  style={{
                    animation: `arc-in 500ms var(--ease-out-expo) ${i * 40}ms both`,
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                />
              ))}
              {pie.map((d, i) => {
                const angle = d.endAngle - d.startAngle;
                if (angle < MIN_LABEL_ANGLE) return null;
                const [lx, ly] = labelArc.centroid(d);
                return (
                  <text
                    key={`label-${i}`}
                    x={lx} y={ly}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={10} fontWeight="600" fill="white"
                    style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                  >
                    {pct(d.data.value ?? 0)}%
                  </text>
                );
              })}
              <circle r={innerRadius - 4} fill="var(--color-paper)" />
              <text textAnchor="middle" dominantBaseline="middle" y={-6} fontSize={22} fontWeight="700" fill="var(--color-ink)">
                {pct(sortedData[0]?.value ?? 0)}%
              </text>
              <text textAnchor="middle" dominantBaseline="middle" y={14} fontSize={10} fill="var(--color-ink-tertiary)" letterSpacing="0.06em">
                {sortedData.reduce((top, d) => (d.value ?? 0) > (top.value ?? 0) ? d : top, sortedData[0])?.name ?? ""}
              </text>
            </g>
          </svg>

          {/* Party legend */}
          <div className="w-full mt-4 border-t border-rule pt-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {[...pie]
                .sort((a, b) => (b.data.value ?? 0) - (a.data.value ?? 0))
                .map((d, i) => (
                  <div key={i} className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: d.data.color, opacity: 0.88 }} />
                    <span className="text-xs text-ink truncate flex-1">{d.data.name}</span>
                    <span className="text-xs text-ink-tertiary tabular-nums ml-auto">{pct(d.data.value ?? 0)}%</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Coalition legend */}
          {coalitions.length > 0 && (
            <div className="w-full mt-5 border-t border-rule pt-4 animate-fade-up" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold tracking-widest uppercase text-accent">Coalitions</span>
                <div className="flex-1 h-px bg-rule" />
              </div>
              <div className="flex flex-col">
                {[1, 2, 3].map((tier) => {
                  const tierItems = coalitions.filter((c) => c.size === tier);
                  if (tierItems.length === 0) return null;
                  const tierLabel = tier === 1 ? "Single party" : tier === 2 ? "Two-party" : "Three-party";
                  const majorityMarkerPct = (MAJORITY / TWO_THIRDS) * 100;
                  return (
                    <div key={tier} className="mt-3 first:mt-0">
                      {/* Tier separator */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium tracking-widest uppercase text-ink-tertiary flex-shrink-0">
                          {tierLabel}
                        </span>
                        <div className="flex-1 h-px bg-rule" />
                      </div>
                      {/* Entries */}
                      <div className="flex flex-col gap-2.5">
                        {tierItems.map((c, i) => {
                          const hasMajority = c.share >= MAJORITY;
                          const hasSupermajority = c.share >= TWO_THIRDS;
                          const barPct = Math.min(100, (c.share / TWO_THIRDS) * 100);
                          const barColor = !c.viable
                            ? "var(--color-ink-tertiary)"
                            : hasMajority ? "var(--color-accent)" : "var(--color-ink-tertiary)";
                          const barOpacity = !c.viable ? 0.2 : hasSupermajority ? 0.85 : hasMajority ? 0.65 : 0.3;
                          return (
                            <div key={i} className={`flex flex-col gap-1 ${!c.viable ? "opacity-40" : ""}`}>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {c.parties.map((p, pi) => (
                                    <span key={p.name} className="flex items-center gap-0.5">
                                      {pi > 0 && <span className="text-ink-tertiary" style={{ fontSize: 9 }}>+</span>}
                                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                                    </span>
                                  ))}
                                </div>
                                <span className="text-[11px] text-ink-secondary flex-1 min-w-0 truncate">
                                  {c.parties.map((p) => p.name).join(" + ")}
                                </span>
                                {!c.viable && (
                                  <span className="text-[9px] text-ink-tertiary border border-rule rounded px-1 flex-shrink-0 tracking-wide uppercase">
                                    unlikely
                                  </span>
                                )}
                                <span className={`text-[11px] tabular-nums flex-shrink-0 ${c.viable && hasMajority ? "text-accent font-semibold" : "text-ink-tertiary"}`}>
                                  {(c.share * 100).toFixed(1)}%
                                </span>
                              </div>
                              <svg width="100%" height="6" style={{ display: "block", overflow: "visible" }}>
                                <rect x="0" y="1" width="100%" height="4" rx="2" fill="var(--color-rule)" />
                                <rect x="0" y="1" width={`${barPct}%`} height="4" rx="2" fill={barColor} fillOpacity={barOpacity} />
                                <line x1={`${majorityMarkerPct}%`} y1="-1" x2={`${majorityMarkerPct}%`} y2="7" stroke="var(--color-ink-secondary)" strokeOpacity="0.35" strokeWidth="1" />
                                <line x1="100%" y1="-1" x2="100%" y2="7" stroke="var(--color-ink-secondary)" strokeOpacity="0.35" strokeWidth="1" />
                              </svg>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Scale legend */}
              <div className="relative mt-1" style={{ height: 14 }}>
                <span
                  className="absolute text-[10px] text-ink-tertiary -translate-x-1/2"
                  style={{ left: `${(MAJORITY / TWO_THIRDS) * 100}%` }}
                >
                  50%
                </span>
                <span className="absolute text-[10px] text-ink-tertiary -translate-x-full" style={{ left: "100%" }}>
                  ²⁄₃
                </span>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
