import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useSetOfCoalition } from "@/hooks/useSetOfCoalition.ts";
import { useSortedParliament } from "@/hooks/useSortedParliament.ts";
import { useParliamentStore } from "@/model/useParliamentConfiguration";

import { DonutChart } from "@/views/parliamentView/DonutChart.tsx";
import { CoalitionsTable } from "@/views/CoalitionTable/table.tsx";
import {
  qualifiesAsParty,
  useFivePercentBarrier,
} from "@/hooks/useFivePercentBarrier.ts";
import { usePollData } from "@/hooks/usePollData.ts";
import { useEffect } from "react";
import { PartyValues } from "@/utils/Party.ts";
import { InstituteTable } from "@/views/institues/InstituteTable.tsx";
import { ElectionTimeline } from "@/views/timeline/ElectionTimeline.tsx";
import { Tabs, Tab } from "@heroui/react";

export default function IndexPage() {
  const { data: pollData } = usePollData();
  const { parliamentId, addDirectCandidate } = useParliamentStore();

  const setOfCoalition = useSetOfCoalition(parliamentId, pollData);

  useEffect(() => {
    setOfCoalition.forEach((party) => {
      if (qualifiesAsParty(party)) {
        addDirectCandidate(party.name as PartyValues);
      }
    });
  }, [setOfCoalition]);

  const sortedParliament = useSortedParliament(setOfCoalition);

  const useSortedAndLimitedParliament = useSortedParliament(
    useFivePercentBarrier(sortedParliament),
  );

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
        <Tabs aria-label="Election views" variant="underlined" size="lg">
          <Tab key="parliament" title="Parliament Builder">
            <div className="flex flex-col gap-4">
              <span className={title({ color: "cyan" })}>Parliaments Builder</span>
              <div className={"flex md:flex-row flex-col gap-4 w-full"}>
                <CoalitionsTable data={sortedParliament} />
                <DonutChart
                  data={useSortedAndLimitedParliament}
                  showMajorityMarker={false}
                />
              </div>
              <InstituteTable surveys={pollData?.Surveys} />
            </div>
          </Tab>
          <Tab key="timeline" title="Timeline">
            <div className="flex flex-col gap-4">
              <span className={title({ color: "cyan" })}>Election Poll Timeline</span>
              <p className="text-default-500 text-sm">
                Historical polling trends per party, with election dates marked as reference lines.
              </p>
              <ElectionTimeline />
            </div>
          </Tab>
        </Tabs>
      </section>
    </DefaultLayout>
  );
}
