import DefaultLayout from "@/layouts/default";
import { usePollData } from "@/hooks/usePollData.ts";
import { ParliamentCard } from "@/views/dashboard/ParliamentCard.tsx";
import { title } from "@/components/primitives";

const BUNDESTAG_ID = "0";
const LANDTAG_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
const EU_ID = "17";

type GroupProps = {
  heading: string;
  ids: string[];
  pollData: NonNullable<ReturnType<typeof usePollData>["data"]>;
};

const ParliamentGroup = ({ heading, ids, pollData }: GroupProps) => (
  <div>
    <h2 className="text-lg font-semibold text-default-700 mb-3">{heading}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {ids
        .filter((id) => pollData.Parliaments[id])
        .map((id) => (
          <ParliamentCard key={id} parliamentId={id} pollData={pollData} />
        ))}
    </div>
  </div>
);

export default function DashboardPage() {
  const { data: pollData } = usePollData();

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-8 py-8 md:py-10">
        <div>
          <h1 className={title()}>Election&nbsp;
            <span className={title({ color: "violet" })}>Overview</span>
          </h1>
          <p className="text-default-500 text-sm mt-2">
            Latest poll standings across all German parliaments. Click a card for details.
          </p>
        </div>

        {pollData ? (
          <>
            <ParliamentGroup
              heading="Bundestag"
              ids={[BUNDESTAG_ID]}
              pollData={pollData}
            />
            <ParliamentGroup
              heading="Landtage"
              ids={LANDTAG_IDS}
              pollData={pollData}
            />
            <ParliamentGroup
              heading="Europaparlament"
              ids={[EU_ID]}
              pollData={pollData}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-default-400 text-sm">
            Loading poll data…
          </div>
        )}
      </section>
    </DefaultLayout>
  );
}
