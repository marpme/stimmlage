import { Link } from "react-router-dom";

import { Poll } from "@/assets/poll.ts";
import { useSetOfCoalition } from "@/hooks/useSetOfCoalition.ts";
import { useTimelineSurveys } from "@/hooks/useTimelineSurveys.ts";
import { SparklineChart } from "./SparklineChart.tsx";

type Props = { parliamentId: string; pollData: Poll; index: number };

export const FeaturedCard = ({ parliamentId, pollData, index }: Props) => {
  const parties = useSetOfCoalition(parliamentId, pollData);
  const series = useTimelineSurveys(parliamentId, pollData);
  const parliament = pollData.Parliaments[parliamentId];
  if (!parliament) return null;

  const sorted = [...parties]
    .filter((p) => !p.name.includes("Sonstige"))
    .sort((a, b) => b.value - a.value);
  const leader = sorted[0];
  const top4 = sorted.slice(0, 4);
  const sparkSeries = series
    .filter((s) => top4.some((p) => p.name === s.party))
    .slice(0, 4);

  return (
    <Link
      to={`/parliament/${parliamentId}`}
      className="group flex gap-4 p-5 rounded-lg border border-rule bg-paper hover:border-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm animate-fade-up"
      style={{
        animationDelay: `${index * 50}ms`,
        borderLeftColor: leader?.color,
        borderLeftWidth: "3px",
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base text-ink group-hover:text-accent transition-colors leading-tight mb-1">
          {parliament.Name}
        </div>
        {leader && (
          <div className="flex items-center gap-1.5 mb-4">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: leader.color }}
            />
            <span className="text-xs text-ink-tertiary">
              {leader.name} · {leader.value.toFixed(1)}%
            </span>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {top4.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="text-xs text-ink-tertiary w-16 truncate">
                {p.name}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-rule overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${Math.min(100, (p.value / 50) * 100)}%`,
                    background: p.color,
                    transitionTimingFunction: "var(--ease-out-expo)",
                  }}
                />
              </div>
              <span className="text-xs text-ink-secondary w-10 text-right tabular-nums">
                {p.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 self-center">
        <SparklineChart series={sparkSeries} width={100} height={48} />
      </div>
    </Link>
  );
};
