import { useTranslation } from "react-i18next";

import { PartyTrendStat } from "@/hooks/usePartyTrendStats.ts";

type Props = {
  stats: PartyTrendStat[];
};

type DeltaProps = { value: number | null };

const Delta = ({ value }: DeltaProps) => {
  if (value === null) return <span className="text-ink-tertiary">—</span>;
  if (value === 0)
    return <span className="text-ink-tertiary tabular-nums">0.0</span>;

  const abs = Math.abs(value).toFixed(1);
  const isPositive = value > 0;

  return (
    <span
      className="tabular-nums font-medium"
      style={{
        color: isPositive
          ? "var(--color-accent)"
          : "var(--color-ink-secondary)",
      }}
    >
      {isPositive ? "+" : "−"}
      {abs}
    </span>
  );
};

export const PartyStatsTable = ({ stats }: Props) => {
  const { t } = useTranslation();

  if (stats.length === 0) return null;

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-accent flex-shrink-0">
          {t("partyStats.title")}
        </h2>
        <div className="flex-1 h-px bg-rule" />
      </div>

      <div className="border border-rule rounded-lg overflow-hidden">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-rule bg-rule/20">
              <th className="text-left px-4 py-2 text-[10px] font-semibold tracking-widest uppercase text-ink-tertiary font-sans">
                {t("partyStats.party")}
              </th>
              <th className="text-right px-4 py-2 text-[10px] font-semibold tracking-widest uppercase text-ink-tertiary font-sans w-20">
                {t("partyStats.current")}
              </th>
              <th className="text-right px-4 py-2 text-[10px] font-semibold tracking-widest uppercase text-ink-tertiary font-sans w-20">
                {t("partyStats.trend30d")}
              </th>
              <th className="text-right px-4 py-2 text-[10px] font-semibold tracking-widest uppercase text-ink-tertiary font-sans w-20">
                {t("partyStats.trend90d")}
              </th>
              <th className="text-right px-4 py-2 text-[10px] font-semibold tracking-widest uppercase text-ink-tertiary font-sans w-24">
                {t("partyStats.spread")}
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, i) => (
              <tr
                key={stat.name}
                className={`border-b border-rule last:border-0 ${i % 2 === 1 ? "bg-rule/10" : ""}`}
              >
                {/* Party name + color dot */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: stat.color }}
                    />
                    <span className="text-ink font-medium truncate">
                      {stat.name}
                    </span>
                  </div>
                </td>

                {/* Current % — primary metric, full weight */}
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-ink w-20">
                  {stat.current.toFixed(1)}%
                </td>

                {/* 30d delta */}
                <td className="px-4 py-2.5 text-right w-20">
                  <Delta value={stat.delta30} />
                </td>

                {/* 90d delta */}
                <td className="px-4 py-2.5 text-right w-20">
                  <Delta value={stat.delta90} />
                </td>

                {/* Spread (max − min across institutes) */}
                <td className="px-4 py-2.5 text-right tabular-nums text-ink-secondary w-24">
                  {stat.spread !== null ? (
                    <span>
                      <span className="text-ink-tertiary text-[10px] mr-0.5">
                        ±
                      </span>
                      {(stat.spread / 2).toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-ink-tertiary">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <p className="text-[10px] text-ink-tertiary mt-2 leading-relaxed">
        {t("partyStats.legend")}{" "}
        <span style={{ color: "var(--color-accent)" }}>+</span>{" "}
        {t("partyStats.gain")} · <span className="text-ink-secondary">−</span>{" "}
        {t("partyStats.loss")}.
      </p>
    </div>
  );
};
