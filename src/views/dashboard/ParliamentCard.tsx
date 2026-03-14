import { Link } from "react-router-dom";

import { Poll } from "@/assets/poll.ts";
import { useSetOfCoalition } from "@/hooks/useSetOfCoalition.ts";
import { useTimelineSurveys } from "@/hooks/useTimelineSurveys.ts";
import { SparklineChart } from "./SparklineChart.tsx";

type ParliamentCardProps = {
  parliamentId: string;
  pollData: Poll;
};

export const ParliamentCard = ({
  parliamentId,
  pollData,
}: ParliamentCardProps) => {
  const parties = useSetOfCoalition(parliamentId, pollData);
  const series = useTimelineSurveys(parliamentId, pollData);

  const parliament = pollData.Parliaments[parliamentId];
  if (!parliament) return null;

  const sorted = [...parties]
    .filter((p) => !p.name.includes("Sonstige"))
    .sort((a, b) => b.value - a.value);

  const leader = sorted[0];
  const top3 = sorted.slice(0, 3);

  // Only show the top 4 parties in the sparkline to keep it readable
  const sparkSeries = series
    .filter((s) => top3.some((p) => p.name === s.party))
    .slice(0, 4);

  return (
    <Link
      to={`/parliament/${parliamentId}`}
      className="block rounded-lg border border-rule bg-paper hover:border-accent/30 transition-colors p-4 group relative overflow-hidden"
      style={
        leader
          ? { borderTopColor: leader.color, borderTopWidth: "2px" }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="font-semibold text-sm text-ink group-hover:text-accent transition-colors leading-tight">
            {parliament.Name}
          </div>
          {leader && (
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: leader.color }}
              />
              <span className="text-xs text-ink-tertiary">
                {leader.name} · {leader.value.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <SparklineChart series={sparkSeries} width={80} height={36} />
      </div>

      {/* Top-3 party bars */}
      <div className="flex flex-col gap-1.5">
        {top3.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="text-xs text-ink-tertiary w-14 truncate">
              {p.name}
            </span>
            <div className="flex-1 h-1 rounded-full bg-rule overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (p.value / 50) * 100)}%`,
                  background: p.color,
                }}
              />
            </div>
            <span className="text-xs text-ink-secondary w-8 text-right tabular-nums">
              {p.value.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
};
