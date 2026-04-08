import { useTranslation } from "react-i18next";
import { usePollData } from "@/hooks/usePollData.ts";
import { useDatasourceStats, InstituteStats } from "@/hooks/useDatasourceStats.ts";
import DefaultLayout from "@/layouts/default";

// ── formatters ───────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("de-DE");
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtMonth(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("de-DE", { month: "short", year: "2-digit" });
}

// ── layout primitives ─────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-accent shrink-0">
          {label}
        </h2>
        <div className="flex-1 h-px bg-rule" />
      </div>
      {children}
    </div>
  );
}

// ── year histogram ────────────────────────────────────────────────────────────

function YearHistogram({
  data,
}: {
  data: { year: number; count: number; avgPersons: number }[];
}) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const H = 120; // chart area height in px, excludes label row
  return (
    <div role="img" aria-label="Surveys per year">
      {/* Bar area */}
      <div className="flex items-end gap-1.5" style={{ height: H }}>
        {data.map((d) => {
          const barH = Math.max(2, Math.round((d.count / maxCount) * H));
          return (
            <div
              key={d.year}
              className="flex-1 relative group"
              style={{ height: barH }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-ink text-paper text-xs rounded px-2 py-1 whitespace-nowrap">
                  <span className="font-semibold">{d.year}</span>
                  <br />
                  {fmt(d.count)} Umfragen
                  <br />
                  Ø {fmt(d.avgPersons)} Befragte
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-ink" />
              </div>
              <div
                className="w-full h-full rounded-sm transition-opacity hover:opacity-100"
                style={{ backgroundColor: "var(--color-accent)", opacity: 0.7 }}
              />
            </div>
          );
        })}
      </div>
      {/* Year labels */}
      <div className="flex gap-1.5 mt-1">
        {data.map((d) => (
          <div key={d.year} className="flex-1 text-center">
            <span className="text-[9px] text-ink-tertiary tabular-nums">{d.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── coverage gap calendar ─────────────────────────────────────────────────────

// Maps a 0–1 intensity to an OKLCH color.
// Uses sqrt curve so low counts separate visually from zero,
// and the full range from near-white → deep vivid blue is maximised.
function heatColor(t: number): string {
  const curved = Math.sqrt(t); // pulls low values upward, spreads the middle
  const l = 94 - curved * 62;   // 94% (near-white) → 32% (very deep)
  const c = 0.01 + curved * 0.27; // 0.01 (barely tinted) → 0.28 (max vivid)
  return `oklch(${l.toFixed(1)}% ${c.toFixed(3)} 252)`;
}

function CoverageCalendar({
  gaps,
  monthCounts,
  firstYear,
  lastYear,
}: {
  gaps: { year: number; month: number }[];
  monthCounts: Map<string, number>;
  firstYear: number;
  lastYear: number;
}) {
  const gapSet = new Set(gaps.map((g) => `${g.year}-${g.month}`));
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();

  const maxCount = Math.max(1, ...Array.from(monthCounts.values()));

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-max">
        {/* Month header */}
        <div className="flex gap-1 pl-10">
          {months.map((m) => (
            <div key={m} className="w-4 text-center text-[9px] text-ink-tertiary">
              {monthLabels[m]}
            </div>
          ))}
        </div>

        {years.map((year) => (
          <div key={year} className="flex items-center gap-1">
            <span className="w-9 text-right text-[9px] text-ink-tertiary tabular-nums pr-1">
              {year}
            </span>
            {months.map((month) => {
              const key = `${year}-${month}`;
              const isGap = gapSet.has(key);
              const isFuture = year > nowYear || (year === nowYear && month > nowMonth);
              const count = monthCounts.get(key) ?? 0;
              const intensity = maxCount > 0 ? count / maxCount : 0;

              let bg: string;
              let title: string;
              if (isFuture) {
                bg = `oklch(90% 0.003 252)`;
                title = fmtMonth(year, month);
              } else if (isGap) {
                bg = `oklch(78% 0.14 60)`; // amber
                title = `Keine Bundestag-Umfrage: ${fmtMonth(year, month)}`;
              } else {
                bg = heatColor(intensity);
                title = `${fmtMonth(year, month)}: ${count} Umfrage${count !== 1 ? "n" : ""}`;
              }

              return (
                <div
                  key={month}
                  title={title}
                  className="w-4 h-4 rounded-[2px] cursor-default"
                  style={{ backgroundColor: bg }}
                />
              );
            })}
          </div>
        ))}

        {/* Legend: gradient swatch + gap */}
        <div className="flex items-center gap-4 mt-3 pl-10">
          <div className="flex items-center gap-1.5">
            <div className="flex rounded-[2px] overflow-hidden" style={{ width: 48, height: 12 }}>
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  style={{ flex: 1, backgroundColor: heatColor(i / 7) }}
                />
              ))}
            </div>
            <span className="text-[9px] text-ink-tertiary">wenig → viel</span>
          </div>
          <span className="flex items-center gap-1.5 text-[9px] text-ink-tertiary">
            <span
              className="w-3 h-3 rounded-[2px] inline-block"
              style={{ backgroundColor: "oklch(78% 0.14 60)" }}
            /> Lücke
          </span>
        </div>
      </div>
    </div>
  );
}

// ── inline bar (for table cells) ──────────────────────────────────────────────

function InlineBar({ pct, stale }: { pct: number; stale?: boolean }) {
  return (
    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-rule)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          backgroundColor: stale ? "var(--color-ink-tertiary)" : "var(--color-accent)",
          opacity: stale ? 0.4 : 0.6,
        }}
      />
    </div>
  );
}

// ── staleness badge ───────────────────────────────────────────────────────────

function StaleBadge({ days }: { days: number }) {
  if (days <= 30)
    return (
      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
        Aktuell
      </span>
    );
  if (days <= 90)
    return (
      <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
        {days}d
      </span>
    );
  return (
    <span className="text-[10px] font-medium text-ink-tertiary bg-surface border border-rule rounded px-1.5 py-0.5">
      {days}d
    </span>
  );
}

// ── institute table ───────────────────────────────────────────────────────────

function InstituteTable({
  institutes,
  maxSurveys,
}: {
  institutes: InstituteStats[];
  maxSurveys: number;
}) {
  return (
    <div className="border border-rule rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-rule">
            <th className="text-left px-4 py-2.5 text-ink-tertiary font-medium">Institut</th>
            <th className="text-left px-4 py-2.5 text-ink-tertiary font-medium hidden sm:table-cell">
              Anteil
            </th>
            <th className="text-right px-4 py-2.5 text-ink-tertiary font-medium">Umfragen</th>
            <th className="text-right px-4 py-2.5 text-ink-tertiary font-medium hidden md:table-cell">
              Ø Stichprobe
            </th>
            <th className="text-right px-4 py-2.5 text-ink-tertiary font-medium hidden lg:table-cell">
              Parlamente
            </th>
            <th className="text-right px-4 py-2.5 text-ink-tertiary font-medium">Letzte</th>
          </tr>
        </thead>
        <tbody>
          {institutes.map((inst, i) => {
            const pct = (inst.surveyCount / maxSurveys) * 100;
            return (
              <tr
                key={inst.id}
                className={`border-b border-rule/40 last:border-0 ${i % 2 === 1 ? "bg-surface" : ""}`}
              >
                <td className="px-4 py-2.5 text-ink font-medium">{inst.name}</td>
                <td className="px-4 py-2.5 hidden sm:table-cell">
                  <InlineBar pct={pct} stale={inst.daysSinceLastSurvey > 90} />
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink-secondary">
                  {fmt(inst.surveyCount)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink-tertiary hidden md:table-cell">
                  {fmt(inst.avgPersons)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink-tertiary hidden lg:table-cell">
                  {inst.parliaments.size}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <StaleBadge days={inst.daysSinceLastSurvey} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function DatasourcePage() {
  const { t } = useTranslation();
  const { data: pollData } = usePollData();
  const stats = useDatasourceStats(pollData);

  if (!stats) {
    return (
      <DefaultLayout>
        <section className="py-10 md:py-14 max-w-3xl">
          <p className="text-sm text-ink-tertiary animate-pulse">{t("datasource.loading")}</p>
        </section>
      </DefaultLayout>
    );
  }

  const firstYear = stats.dateRange.first.getFullYear();
  const lastYear = stats.dateRange.last.getFullYear();
  const maxInstSurveys = stats.institutes[0]?.surveyCount ?? 1;

  return (
    <DefaultLayout>
      <section className="py-10 md:py-14 max-w-3xl">

        {/* ── Header ── */}
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-ink mb-3">{t("datasource.title")}</h1>
          <p className="text-sm text-ink-secondary leading-relaxed max-w-2xl mb-5">
            {t("datasource.intro")}
          </p>
          {/* Dataset identity strip */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-tertiary border-t border-rule pt-4">
            <span>
              <a
                href="https://dawum.de/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-accent transition-colors"
              >
                {stats.publisher}
              </a>
            </span>
            <span>{stats.author}</span>
            <a
              href={stats.licenseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              {stats.license}
            </a>
            <span>Stand: {fmtDate(stats.lastUpdate)}</span>
            <span className={stats.surveysLast30Days > 0 ? "text-emerald-700 font-medium" : "text-amber-700"}>
              {stats.surveysLast30Days > 0
                ? `${stats.surveysLast30Days} Umfragen in den letzten 30 Tagen`
                : "Keine aktuellen Umfragen"}
            </span>
          </div>
        </div>

        {/* ── 1. Scope — what this dataset covers ── */}
        <Section label={t("datasource.sectionScope")}>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-0 border border-rule rounded-lg overflow-hidden">
            {[
              { value: fmt(stats.totalSurveys), label: "Umfragen" },
              { value: fmt(stats.totalPersonsSurveyed), label: "Befragte gesamt" },
              { value: `${Math.round(stats.spanDays / 365)} J.`, label: `${fmtDate(stats.dateRange.first)} –` },
              { value: stats.totalInstitutes, label: "Institute" },
              { value: stats.totalParliaments, label: "Parlamente" },
              { value: stats.totalParties, label: "Parteien" },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className={`px-4 py-4 flex flex-col gap-0.5 ${i > 0 ? "border-l border-rule" : ""} ${i >= 3 ? "border-t border-rule sm:border-t-0" : ""}`}
              >
                <span className="text-xl font-semibold text-ink tabular-nums">{value}</span>
                <span className="text-[10px] text-ink-tertiary leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 2. Survey volume over time ── */}
        <Section label={t("datasource.sectionByYear")}>
          <p className="text-xs text-ink-tertiary mb-5 max-w-lg">
            Anzahl der veröffentlichten Umfragen pro Jahr. Hover für Stichprobengröße.
          </p>
          <YearHistogram data={stats.byYear} />
          <div className="mt-4 border-t border-rule pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-0">
            {stats.byYear.map((y) => (
              <div
                key={y.year}
                className="flex items-baseline justify-between text-xs py-1.5 border-b border-rule/30 last:border-0"
              >
                <span className="text-ink font-medium tabular-nums">{y.year}</span>
                <span className="tabular-nums text-ink-secondary">{fmt(y.count)}</span>
                <span className="tabular-nums text-ink-tertiary">Ø {fmt(y.avgPersons)}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 3. Sample size distribution ── */}
        <Section label={t("datasource.sectionSampleSize")}>
          <p className="text-xs text-ink-tertiary mb-5 max-w-lg">
            Wie groß sind die Stichproben der einzelnen Umfragen? Wichtig für die Einschätzung der statistischen Signifikanz.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Minimum", value: fmt(stats.minPersons), sub: "kleinste Stichprobe" },
              { label: "Median", value: fmt(stats.medianPersonsPerSurvey), sub: "typische Stichprobe" },
              { label: "Durchschnitt", value: fmt(stats.avgPersonsPerSurvey), sub: "arithmetisches Mittel" },
              { label: "Maximum", value: fmt(stats.maxPersons), sub: "größte Stichprobe" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="border-l-2 pl-3 py-1" style={{ borderColor: "var(--color-accent-muted)" }}>
                <div className="text-lg font-semibold text-ink tabular-nums">{value}</div>
                <div className="text-xs text-ink font-medium">{label}</div>
                <div className="text-[10px] text-ink-tertiary">{sub}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-tertiary leading-relaxed max-w-xl">
            Der Unterschied zwischen Median ({fmt(stats.medianPersonsPerSurvey)}) und Durchschnitt ({fmt(stats.avgPersonsPerSurvey)}) deutet
            auf {stats.avgPersonsPerSurvey > stats.medianPersonsPerSurvey ? "einige wenige sehr große Erhebungen" : "eine gleichmäßige Verteilung"} hin.
            Als Faustregel gilt: ab ~1.000 Befragten liegt der statistische Fehler unter ±3 Prozentpunkten (95 % Konfidenz).
          </p>
        </Section>

        {/* ── 4. Coverage continuity ── */}
        <Section label={t("datasource.sectionCoverage")}>
          <p className="text-xs text-ink-tertiary mb-5 max-w-xl">
            Für den Bundestag: Umfrageintensität pro Monat — dunklere Felder bedeuten mehr
            veröffentlichte Erhebungen. Lücken ({stats.coverageGaps.length > 0 ? stats.coverageGaps.length : "keine"}{" "}
            {stats.coverageGaps.length === 1 ? "Monat" : "Monate"}) sind amber markiert.
          </p>
          <CoverageCalendar
            gaps={stats.coverageGaps}
            monthCounts={stats.bundestagMonthCounts}
            firstYear={firstYear}
            lastYear={lastYear}
          />
        </Section>

        {/* ── 5. Institute concentration ── */}
        <Section label={t("datasource.sectionInstitutes")}>
          <p className="text-xs text-ink-tertiary mb-5 max-w-xl">
            {stats.topInstituteShare}% aller Umfragen stammen vom führenden Institut,{" "}
            {stats.top3InstituteShare}% von den Top 3. Eine hohe Konzentration kann die
            Durchschnittswerte stärker durch ein einzelnes Institut beeinflussen.
            Die Spalte „Letzte" zeigt, wie aktuell das Institut ist.
          </p>
          <InstituteTable institutes={stats.institutes} maxSurveys={maxInstSurveys} />
        </Section>

        {/* ── 6. Parliament coverage ── */}
        <Section label={t("datasource.sectionParliaments")}>
          <p className="text-xs text-ink-tertiary mb-5 max-w-xl">
            Umfragedichte und Aktualität je Parlament. Parlamente mit weniger als 2 aktiven Instituten
            haben eingeschränkte Vergleichbarkeit der Durchschnittswerte.
          </p>
          <div className="border border-rule rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-rule">
                  <th className="text-left px-4 py-2.5 text-ink-tertiary font-medium">Parlament</th>
                  <th className="text-right px-4 py-2.5 text-ink-tertiary font-medium">Umfragen</th>
                  <th className="text-right px-4 py-2.5 text-ink-tertiary font-medium hidden sm:table-cell">
                    Institute
                  </th>
                  <th className="text-right px-4 py-2.5 text-ink-tertiary font-medium hidden md:table-cell">
                    90-Tage
                  </th>
                  <th className="text-right px-4 py-2.5 text-ink-tertiary font-medium">Letzte</th>
                </tr>
              </thead>
              <tbody>
                {stats.parliaments.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-rule/40 last:border-0 ${i % 2 === 1 ? "bg-surface" : ""}`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="text-ink font-medium">{p.shortcut}</span>
                      {p.institutes.size < 2 && (
                        <span className="ml-2 text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 py-0.5">
                          1 Institut
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-secondary">
                      {fmt(p.surveyCount)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-tertiary hidden sm:table-cell">
                      {p.institutes.size}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-tertiary hidden md:table-cell">
                      {p.surveysLast90Days > 0 ? fmt(p.surveysLast90Days) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <StaleBadge days={p.daysSinceLastSurvey} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── 7. Survey methods ── */}
        <Section label={t("datasource.sectionMethods")}>
          <p className="text-xs text-ink-tertiary mb-5 max-w-xl">
            Die Erhebungsmethode beeinflusst, welche Bevölkerungsgruppen erfasst werden.
            Telefonische und Online-Befragungen können systematisch unterschiedliche Ergebnisse liefern.
          </p>
          <div className="flex flex-col gap-2">
            {stats.methods.map((m) => {
              const pct = Math.round((m.count / stats.totalSurveys) * 100);
              return (
                <div key={m.name} className="flex items-center gap-4 text-xs">
                  <span className="w-36 shrink-0 text-ink">{m.name}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-rule)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: "var(--color-accent)", opacity: 0.6 }}
                    />
                  </div>
                  <span className="w-10 text-right tabular-nums text-ink-secondary">{pct}%</span>
                  <span className="w-16 text-right tabular-nums text-ink-tertiary">{fmt(m.count)}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] text-ink-tertiary">
            {stats.totalMethods} Methoden über {fmt(stats.totalSurveys)} Umfragen ·{" "}
            {stats.totalTaskers} Auftraggeber (Medien & Organisationen)
          </p>
        </Section>

        {/* Footer */}
        <p className="text-[10px] text-ink-tertiary border-t border-rule pt-6 leading-relaxed">
          {t("datasource.footerNote")}
        </p>
      </section>
    </DefaultLayout>
  );
}
