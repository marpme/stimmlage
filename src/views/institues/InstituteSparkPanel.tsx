import { FC, useRef, useState, useEffect } from "react";

import { Poll, Survey } from "@/assets/poll.ts";
import { useInstituteTimeline } from "@/hooks/useInstituteTimeline.ts";
import { SparklineChart } from "@/views/dashboard/SparklineChart.tsx";

type Props = {
  instituteId: string;
  parliamentId: string;
  surveys: { [id: string]: Survey };
  pollData: Poll | undefined;
};

export const InstituteSparkPanel: FC<Props> = ({
  instituteId,
  parliamentId,
  surveys,
  pollData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    setWidth(containerRef.current.clientWidth);
    return () => observer.disconnect();
  }, []);

  const series = useInstituteTimeline(
    instituteId,
    parliamentId,
    surveys,
    pollData,
  );

  if (series.length === 0) return null;

  const latestByParty = new Map<string, number>();
  for (const s of series) {
    if (s.smooth.length > 0) {
      latestByParty.set(s.party, s.smooth[s.smooth.length - 1].value);
    }
  }

  return (
    <div ref={containerRef} className="w-full px-3 py-3">
      <SparklineChart series={series} width={width} height={80} />
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {series.map((s) => (
          <div key={s.party} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-xs text-ink-secondary">
              {s.party}
              {latestByParty.has(s.party) && (
                <span className="ml-1 tabular-nums text-ink-tertiary">
                  {latestByParty.get(s.party)!.toFixed(1)}%
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
