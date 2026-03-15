import { Link } from "react-router-dom";

import { Poll } from "@/assets/poll.ts";
import { useSetOfCoalition } from "@/hooks/useSetOfCoalition.ts";

type Props = { parliamentId: string; pollData: Poll; index: number };

export const LandtagRow = ({ parliamentId, pollData, index }: Props) => {
  const parties = useSetOfCoalition(parliamentId, pollData);
  const parliament = pollData.Parliaments[parliamentId];
  if (!parliament) return null;

  const sorted = [...parties]
    .filter((p) => !p.name.includes("Sonstige"))
    .sort((a, b) => b.value - a.value);
  const leader = sorted[0];
  const top3 = sorted.slice(0, 3);
  const maxVal = sorted[0]?.value ?? 50;

  return (
    <Link
      to={`/parliament/${parliamentId}`}
      className="flex items-center gap-4 px-4 py-3 border-b border-rule last:border-0 hover:bg-rule/20 transition-colors animate-fade-up group"
      style={{ animationDelay: `${120 + index * 30}ms` }}
    >
      {/* Parliament name + leader */}
      <div className="w-44 flex-shrink-0 min-w-0">
        <div className="text-sm font-medium text-ink group-hover:text-accent transition-colors truncate leading-tight">
          {parliament.Name}
        </div>
        {leader && (
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: leader.color }}
            />
            <span className="text-[11px] text-ink-tertiary truncate">{leader.name}</span>
          </div>
        )}
      </div>

      {/* Top-3 color dot cluster */}
      <div className="flex items-center flex-shrink-0">
        {top3.map((p, pi) => (
          <span
            key={p.name}
            className="w-3 h-3 rounded-full border-2 border-paper flex-shrink-0"
            style={{ background: p.color, marginLeft: pi > 0 ? "-4px" : "0" }}
            title={p.name}
          />
        ))}
      </div>

      {/* Bar race — top 3 stacked as thin segments */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        {top3.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-rule overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${Math.min(100, (p.value / (maxVal * 1.3)) * 100)}%`,
                  background: p.color,
                  transitionTimingFunction: "var(--ease-out-expo)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Leader % */}
      <div className="flex-shrink-0 text-right">
        <span className="text-sm font-semibold tabular-nums text-ink-secondary">
          {leader?.value.toFixed(1)}%
        </span>
      </div>

      {/* Chevron */}
      <svg
        className="w-4 h-4 text-ink-tertiary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M6 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
};
