import { FC } from "react";

import { Survey } from "@/assets/poll.ts";
import { usePollData } from "@/hooks/usePollData.ts";
import { getSortingValueOfParty } from "@/hooks/useSortedParliament.ts";

export const InstituteTable: FC<{ surveys?: { [id: string]: Survey } }> = ({
  surveys,
}) => {
  const { data: pollData } = usePollData();

  if (!surveys) return null;

  const listedSurveyIds = Object.keys(surveys)
    .toSorted((a, b) => Number(b) - Number(a))
    .slice(0, 10);

  const newSurvey = surveys[listedSurveyIds[0]];
  const columns = Object.keys(newSurvey.Results)
    .map(([key]) => ({
      key,
      label: pollData?.Parties[key].Shortcut,
    }))
    .sort(
      (a, b) =>
        getSortingValueOfParty(b.label ?? "") -
        getSortingValueOfParty(a.label ?? ""),
    );

  const allColumns = [{ key: "name", label: "Institut" }, ...columns];

  const items = listedSurveyIds
    .map((id) => surveys[id])
    .map((survey) => ({
      key: survey.Tasker_ID,
      name: pollData?.Institutes[survey.Institute_ID].Name,
      ...survey.Results,
    }));

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
              key={item.key}
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
