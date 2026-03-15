import * as Tabs from "@radix-ui/react-tabs";

import { title, subtitle } from "@/components/primitives";
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

export default function IndexPage() {
  const { data: pollData } = usePollData();
  const { parliamentId } = useParliamentStore();

  const setOfCoalition = useSetOfCoalition(parliamentId, pollData);

  const sortedParliament = useSortedParliament(setOfCoalition);
  const sortedAndLimited = useSortedParliament(useFivePercentBarrier(sortedParliament));

  return (
    <DefaultLayout>
      <section className="flex flex-col justify-center gap-6 py-8 md:py-10">
        <div className="max-w-lg">
          <h1>
            <span className={title()}>Build&nbsp;</span>
            <span className={title({ color: "accent" })}>parliaments&nbsp;</span>
            <span className={title()}>with live polling data.</span>
          </h1>
          <p className={subtitle({ class: "mt-3" })}>
            Interactive parliament seat distribution based on current German poll averages.
            Select parties, explore coalitions, and trace historical trends.
          </p>
        </div>

        <Tabs.Root defaultValue="parliament">
          <Tabs.List className="flex gap-0 border-b border-rule mb-6" aria-label="Election views">
            {[
              { value: "parliament", label: "Parliament Builder" },
              { value: "timeline", label: "Timeline" },
            ].map(({ value, label }) => (
              <Tabs.Trigger
                key={value}
                value={value}
                className="px-4 py-2 text-sm font-medium text-ink-tertiary border-b-2 border-transparent -mb-px transition-colors hover:text-ink data-[state=active]:text-accent data-[state=active]:border-accent outline-none"
              >
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="parliament" className="flex flex-col gap-4">
            <h2 className={title({ size: "sm" })}>Parliament Builder</h2>
            <div className="flex md:flex-row flex-col gap-4 w-full">
              <CoalitionsTable data={sortedParliament} />
              <DonutChart data={sortedAndLimited} showMajorityMarker={false} />
            </div>
            <InstituteTable surveys={pollData?.Surveys} />
          </Tabs.Content>

          <Tabs.Content value="timeline" className="flex flex-col gap-4">
            <h2 className={title({ size: "sm" })}>Election Poll Timeline</h2>
            <p className="text-ink-tertiary text-sm">
              Historical polling trends per party, with election dates marked as reference lines.
            </p>
            <ElectionTimeline />
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </DefaultLayout>
  );
}
