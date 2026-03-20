import { FC, Fragment, useState } from "react";
import { useTranslation } from "react-i18next";

import { Survey } from "@/assets/poll.ts";
import { usePollData } from "@/hooks/usePollData.ts";
import { getSortingValueOfParty } from "@/hooks/useSortedParliament.ts";
import { InstituteSparkPanel } from "@/views/institues/InstituteSparkPanel.tsx";

export const InstituteTable: FC<{
  surveys?: { [id: string]: Survey };
  parliamentId?: string;
}> = ({ surveys, parliamentId }) => {
  const { t } = useTranslation();
  const { data: pollData } = usePollData();
  const [expandedInstitutes, setExpandedInstitutes] = useState<Set<string>>(
    new Set(),
  );

  if (!surveys) return null;

  const toggleExpand = (id: string) =>
    setExpandedInstitutes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const seenInstitutes = new Set<string>();
  const listedSurveyIds = Object.keys(surveys)
    .filter((id) => !parliamentId || surveys[id].Parliament_ID === parliamentId)
    .toSorted((a, b) =>
      surveys[b].Date > surveys[a].Date
        ? 1
        : surveys[b].Date < surveys[a].Date
          ? -1
          : 0,
    )
    .filter((id) => {
      const iid = surveys[id].Institute_ID;
      if (seenInstitutes.has(iid)) return false;
      seenInstitutes.add(iid);
      return true;
    })
    .slice(0, 10);

  // Union of all party IDs across all listed surveys so no party is missing
  const allPartyIds = Array.from(
    new Set(listedSurveyIds.flatMap((id) => Object.keys(surveys[id].Results))),
  );

  // Normalize CDU / CSU → CDU/CSU: collapse both into a single column key
  const CDU_CSU_KEY = "__CDU_CSU__";
  const isCduCsu = (shortcut: string) =>
    shortcut === "CDU" || shortcut === "CSU" || shortcut === "CDU/CSU";

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
        getSortingValueOfParty(b.label) - getSortingValueOfParty(a.label),
    );

  const allColumns = [
    { key: "name", label: t("institute.institute") },
    { key: "date", label: t("institute.date") },
    ...columns,
  ];

  // Build the set of party IDs that map to CDU/CSU for summation
  const cduCsuIds = allPartyIds.filter((key) =>
    isCduCsu(pollData?.Parties[key]?.Shortcut ?? ""),
  );

  const items = listedSurveyIds
    .map((id) => surveys[id])
    .map((survey) => {
      const row: Record<string, unknown> = {
        key: survey.Tasker_ID + survey.Date,
        instituteId: survey.Institute_ID,
        name: pollData?.Institutes[survey.Institute_ID]?.Name,
        date: new Date(survey.Date).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
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
          {items.map((item, i) => {
            const iid = item.instituteId as string;
            const isExpanded = expandedInstitutes.has(iid);
            return (
              <Fragment key={item.key as string}>
                <tr
                  className={`border-b border-rule cursor-pointer hover:bg-rule/30 transition-colors ${i % 2 === 1 ? "bg-rule/20" : ""}`}
                  onClick={() => toggleExpand(iid)}
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? t("institute.hideHistory")
                      : t("institute.showHistory")
                  }
                >
                  {allColumns.map((col) => {
                    const val = (item as Record<string, unknown>)[col.key];
                    return (
                      <td
                        key={col.key}
                        className="px-3 py-2 text-ink-secondary tabular-nums whitespace-nowrap"
                      >
                        {col.key === "name" ? (
                          <span className="flex items-center gap-1.5">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              className={`flex-shrink-0 text-ink-tertiary transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                              fill="currentColor"
                            >
                              <path d="M3 2l4 3-4 3V2z" />
                            </svg>
                            {String(val ?? "—")}
                          </span>
                        ) : typeof val === "number" ? (
                          `${val.toFixed(1)}%`
                        ) : (
                          String(val ?? "—")
                        )}
                      </td>
                    );
                  })}
                </tr>
                {isExpanded && (
                  <tr className={i % 2 === 1 ? "bg-rule/10" : "bg-rule/5"}>
                    <td colSpan={allColumns.length} className="p-0">
                      <InstituteSparkPanel
                        instituteId={iid}
                        parliamentId={parliamentId ?? ""}
                        surveys={surveys}
                        pollData={pollData}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
