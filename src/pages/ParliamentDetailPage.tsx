import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";

import DefaultLayout from "@/layouts/default";
import { useSetOfCoalition } from "@/hooks/useSetOfCoalition.ts";
import { useSortedParliament } from "@/hooks/useSortedParliament.ts";
import { useParliamentStore } from "@/model/useParliamentConfiguration";
import { DonutChart } from "@/views/parliamentView/DonutChart.tsx";
import { CoalitionsTable } from "@/views/CoalitionTable/table.tsx";
import { useFivePercentBarrier } from "@/hooks/useFivePercentBarrier.ts";
import { usePollData } from "@/hooks/usePollData.ts";
import { InstituteTable } from "@/views/institues/InstituteTable.tsx";
import { ElectionTimeline } from "@/views/timeline/ElectionTimeline.tsx";
import { usePartyTrendStats } from "@/hooks/usePartyTrendStats.ts";

export default function ParliamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: pollData } = usePollData();
  const { setParliamentId } = useParliamentStore();

  useEffect(() => {
    if (!id) return;
    setParliamentId(id);
  }, [id]);

  if (pollData && id && !pollData.Parliaments[id]) {
    return <Navigate to="/" replace />;
  }

  const parliamentName = pollData?.Parliaments[id ?? ""]?.Name ?? "";
  const setOfCoalition = useSetOfCoalition(id ?? "0", pollData);

  const sortedParliament = useSortedParliament(setOfCoalition);
  const sortedAndLimited = useSortedParliament(useFivePercentBarrier(sortedParliament));
  const trendStats = usePartyTrendStats(id ?? "0", pollData);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-8 py-8 md:py-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink animate-fade-up">{parliamentName}</h1>

        <div className="flex flex-col gap-3 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-accent">Poll Timeline</h2>
            <div className="flex-1 h-px bg-rule" />
          </div>
          <p className="text-ink-tertiary text-sm">
            Historical polling trends per party. Drag the overview strip below to zoom in.
          </p>
          <ElectionTimeline parliamentId={id} showProjection={true} />
        </div>

        <div className="flex flex-col gap-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-accent flex-shrink-0">Aktuelle Umfragewerte</h2>
            <div className="flex-1 h-px bg-rule" />
          </div>
          <div className="flex md:flex-row flex-col gap-4 w-full">
            <CoalitionsTable data={sortedParliament} trendStats={trendStats} />
            <DonutChart data={sortedAndLimited} showMajorityMarker={false} />
          </div>
        </div>

        <div className="flex flex-col gap-4 animate-fade-up" style={{ animationDelay: "180ms" }}>
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-accent flex-shrink-0">Umfragen nach Institut</h2>
            <div className="flex-1 h-px bg-rule" />
          </div>
          <InstituteTable surveys={pollData?.Surveys} parliamentId={id} />
        </div>
      </section>
    </DefaultLayout>
  );
}
