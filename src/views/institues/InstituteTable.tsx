import { FC } from "react";

import { Survey } from "@/assets/poll.ts";
import { usePollData } from "@/hooks/usePollData.ts";
import { getSortingValueOfParty } from "@/hooks/useSortedParliament.ts";

export const InstituteTable: FC<{ surveys?: { [id: string]: Survey }; parliamentId?: string }> = ({
  surveys,
  parliamentId,
}) => {
  const { data: pollData } = usePollData();

  if (!surveys) return null;

  const listedSurveyIds = Object.keys(surveys)
    .filter((id) => !parliamentId || surveys[id].Parliament_ID === parliamentId)
    .toSorted((a, b) => (surveys[b].Date > surveys[a].Date ? 1 : surveys[b].Date < surveys[a].Date ? -1 : 0))
    .slice(0, 10);

  // Union of all party IDs across all listed surveys so no party is missing
  const allPartyIds = Array.from(
    new Set(listedSurveyIds.flatMap((id) => Object.keys(surveys[id].Results)))
  );

  // Normalize CDU / CSU → CDU/CSU: collapse both into a single column key
  const CDU_CSU_KEY = "__CDU_CSU__";
  const isCduCsu = (shortcut: string) => shortcut === "CDU" || shortcut === "CSU" || shortcut === "CDU/CSU";

  const columns = allPartyIds
    .map((key) => ({
      key,
      label: pollData?.Parties[key]?.Shortcut ?? "",
    }))
    .filter((col) => col.label)
    .reduce<{ key: string; label: string }[]>((acc, col) => {
      if (isCduCsu(col.label)) {
        if (!acc.find((c) => c.key === CDU_CSU_KEY)) {
          acc.push({ key: CDU_CSU_KEY, label: "CDU/CSU" });
        }
      } else {
        acc.push(col);
      }
      return acc;
    }, [])
    .sort(
      (a, b) =>
        getSortingValueOfParty(b.label) -
        getSortingValueOfParty(a.label),
    );

  const allColumns = [{ key: "name", label: "Institut" }, { key: "date", label: "Datum" }, ...columns];

  // Build the set of party IDs that map to CDU/CSU for summation
  const cduCsuIds = allPartyIds.filter((key) =>
    isCduCsu(pollData?.Parties[key]?.Shortcut ?? "")
  );

  const items = listedSurveyIds
    .map((id) => surveys[id])
    .map((survey) => {
      const row: Record<string, unknown> = {
        key: survey.Tasker_ID + survey.Date,
        name: pollData?.Institutes[survey.Institute_ID]?.Name,
        date: new Date(survey.Date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }),
      };
      // Sum CDU + CSU values into the combined key
      const cduCsuTotal = cduCsuIds.reduce(
        (sum, id) => sum + (survey.Results[id] ?? 0),
        0,
      );
      if (cduCsuIds.length > 0) row[CDU_CSU_KEY] = cduCsuTotal || undefined;
      // Copy all other party results directly
      for (const [key, value] of Object.entries(survey.Results)) {
        const shortcut = pollData?.Parties[key]?.Shortcut ?? "";
        if (!isCduCsu(shortcut)) row[key] = value;
      }
      return row;
    });

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-rule">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule bg-paper">
            {allColumns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-ink-tertiary whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.key as string}
              className={`border-b border-rule last:border-0 ${i % 2 === 1 ? "bg-rule/20" : ""}`}
            >
              {allColumns.map((col) => {
                const val = (item as Record<string, unknown>)[col.key];
                return (
                  <td
                    key={col.key}
                    className="px-3 py-2 text-ink-secondary tabular-nums whitespace-nowrap"
                  >
                    {typeof val === "number"
                      ? `${val.toFixed(1)}%`
                      : String(val ?? "—")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
