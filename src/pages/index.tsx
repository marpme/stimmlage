import * as Tabs from "@radix-ui/react-tabs";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
            <span className={title()}>{t("home.heroTitle")}</span>
            <span className={title({ color: "accent" })}>{t("home.heroTitleAccent")}</span>
            <span className={title()}>{t("home.heroTitleSuffix")}</span>
          </h1>
          <p className={subtitle({ class: "mt-3" })}>
            {t("home.heroSubtitle")}
          </p>
        </div>

        <Tabs.Root defaultValue="parliament">
          <Tabs.List className="flex gap-0 border-b border-rule mb-6" aria-label={t("home.tabsAriaLabel")}>
            {[
              { value: "parliament", label: t("home.tabParliament") },
              { value: "timeline", label: t("home.tabTimeline") },
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
            <h2 className={title({ size: "sm" })}>{t("home.parliamentBuilderTitle")}</h2>
            <div className="flex md:flex-row flex-col gap-4 w-full">
              <CoalitionsTable data={sortedParliament} />
              <DonutChart data={sortedAndLimited} showMajorityMarker={false} />
            </div>
            <InstituteTable surveys={pollData?.Surveys} />
          </Tabs.Content>

          <Tabs.Content value="timeline" className="flex flex-col gap-4">
            <h2 className={title({ size: "sm" })}>{t("home.timelineTitle")}</h2>
            <p className="text-ink-tertiary text-sm">
              {t("home.timelineDescription")}
            </p>
            <ElectionTimeline />
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </DefaultLayout>
  );
}
