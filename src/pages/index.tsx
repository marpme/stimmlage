import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useGroupedHistogram } from "@/hooks/useGroupedHistorgram.ts";
import { useSetOfCoalition } from "@/hooks/useSetOfCoalition.ts";
import { useSortedParliament } from "@/hooks/useSortedParliament.ts";
import { useParliamentStore } from "@/model/useParliamentConfiguration";

import { Violin } from "@/views/history/Violin.tsx";
import { DonutChart } from "@/views/parliamentView/DonutChart.tsx";
import { Card, CardBody } from "@heroui/react";
import { CoalitionsTable } from "@/views/CoalitionTable/table.tsx";
import { useFivePercentBarrier } from "@/hooks/useFivePercentBarrier.ts";
import { usePollData } from "@/hooks/usePollData.ts";

export default function IndexPage() {
  const { data: pollData } = usePollData();
  const { parliamentId, directCandidates } = useParliamentStore();
  const groupedHistogram = useGroupedHistogram(parliamentId, pollData);
  const setOfCoalition = useSetOfCoalition(
    parliamentId,
    directCandidates,
    pollData,
  );

  const sortedParliament = useSortedParliament(setOfCoalition);
  const useSortedAndLimitedParliament = useFivePercentBarrier(sortedParliament);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Make&nbsp;</span>
          <span className={title({ color: "violet" })}>beautiful&nbsp;</span>
          <br />
          <span className={title()}>
            websites regardless of your design experience.
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            Beautiful, fast and modern React UI library.
          </div>
        </div>

        <CoalitionsTable data={sortedParliament} />

        <Card>
          <CardBody>
            <Violin data={groupedHistogram} />
          </CardBody>
        </Card>

        <DonutChart data={useSortedAndLimitedParliament} />
      </section>
    </DefaultLayout>
  );
}
