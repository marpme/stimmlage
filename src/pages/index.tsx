import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useSetOfCoalition } from "@/hooks/useSetOfCoalition.ts";
import { useSortedParliament } from "@/hooks/useSortedParliament.ts";
import { useParliamentStore } from "@/model/useParliamentConfiguration";

import { DonutChart } from "@/views/parliamentView/DonutChart.tsx";
import { CoalitionsTable } from "@/views/CoalitionTable/table.tsx";
import { useFivePercentBarrier } from "@/hooks/useFivePercentBarrier.ts";
import { usePollData } from "@/hooks/usePollData.ts";

export default function IndexPage() {
  const { data: pollData } = usePollData();
  const { parliamentId, directCandidates } = useParliamentStore();
  const setOfCoalition = useSetOfCoalition(
    parliamentId,
    directCandidates,
    pollData,
  );

  const sortedParliament = useSortedParliament(setOfCoalition);
  const useSortedAndLimitedParliament = useFivePercentBarrier(sortedParliament);

  return (
    <DefaultLayout>
      <section className="flex flex-col justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center m-auto justify-center">
          <span className={title()}>Create&nbsp;</span>
          <span className={title({ color: "violet" })}>parliaments&nbsp;</span>
          <span className={title()}>with ease and precision.</span>
          <div className={subtitle({ class: "mt-4" })}>
            Our platform empowers you to build a unique and interactive
            parliament with the given parties available in the table and much
            more information.
          </div>
        </div>

        {/*<Card>
          <CardBody>
            <Violin data={groupedHistogram} />
          </CardBody>
        </Card>*/}

        <span className={title({ color: "cyan" })}>Parliaments Builder</span>
        <div className={"flex md:flex-row flex-col gap-4 w-full"}>
          <CoalitionsTable data={sortedParliament} />

          <DonutChart data={useSortedAndLimitedParliament} />
        </div>
      </section>
    </DefaultLayout>
  );
}
