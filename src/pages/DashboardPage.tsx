import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import DefaultLayout from "@/layouts/default";
import { usePollData } from "@/hooks/usePollData.ts";
import { FeaturedCard } from "@/views/dashboard/FeaturedCard.tsx";
import { LandtagRow } from "@/views/dashboard/LandtagRow.tsx";
import { ParliamentCard } from "@/views/dashboard/ParliamentCard.tsx";
import { GermanyMap } from "@/views/dashboard/GermanyMap.tsx";
import { title } from "@/components/primitives";

const FEATURED_IDS = ["0", "17"];
const LANDTAG_IDS = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"];
const STORAGE_KEY = "gelection-landtag-view";

type ViewMode = "list" | "tile" | "map";

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="2" width="12" height="1.5" rx="0.75" fill="currentColor" />
    <rect x="1" y="6.25" width="12" height="1.5" rx="0.75" fill="currentColor" />
    <rect x="1" y="10.5" width="12" height="1.5" rx="0.75" fill="currentColor" />
  </svg>
);

const TileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="7.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="1" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
  </svg>
);

const MapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 3l3.5 1.5L7 2l3.5 1.5L13 2v9l-2.5 1L7 10.5 4.5 12 1 10.5V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
    <line x1="4.5" y1="4.5" x2="4.5" y2="12" stroke="currentColor" strokeWidth="1.2" />
    <line x1="7" y1="2" x2="7" y2="10.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data: pollData } = usePollData();
  const [view, setView] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "list" || stored === "tile" || stored === "map") return stored;
      return "list";
    } catch { return "list"; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, view); } catch {}
  }, [view]);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-10 py-8 md:py-10">
        <div className="animate-fade-up">
          <h1 className={title()}>
            {t("dashboard.title")}<span className={title({ color: "accent" })}>{t("dashboard.titleAccent")}</span>
          </h1>
          <p className="text-ink-tertiary text-sm mt-2">
            {t("dashboard.subtitle")}
          </p>
        </div>

        {pollData ? (
          <>
            {/* Featured: Bundestag + EU */}
            <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold tracking-widest uppercase text-accent">{t("dashboard.featuredSection")}</span>
                <div className="flex-1 h-px bg-rule" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FEATURED_IDS.filter(id => pollData.Parliaments[id]).map((id, i) => (
                  <FeaturedCard key={id} parliamentId={id} pollData={pollData} index={i} />
                ))}
              </div>
            </div>

            {/* Landtage */}
            <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold tracking-widest uppercase text-accent">{t("dashboard.landtageSection")}</span>
                <div className="flex-1 h-px bg-rule" />
                {/* View toggle */}
                <div className="flex items-center border border-rule rounded overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => setView("list")}
                    className={`flex items-center justify-center w-7 h-7 transition-colors ${
                      view === "list" ? "bg-accent text-paper" : "text-ink-tertiary hover:text-ink hover:bg-rule/40"
                    }`}
                    aria-label={t("dashboard.listViewAriaLabel")}
                    aria-pressed={view === "list"}
                  >
                    <ListIcon />
                  </button>
                  <button
                    onClick={() => setView("tile")}
                    className={`flex items-center justify-center w-7 h-7 transition-colors ${
                      view === "tile" ? "bg-accent text-paper" : "text-ink-tertiary hover:text-ink hover:bg-rule/40"
                    }`}
                    aria-label={t("dashboard.tileViewAriaLabel")}
                    aria-pressed={view === "tile"}
                  >
                    <TileIcon />
                  </button>
                  <button
                    onClick={() => setView("map")}
                    className={`flex items-center justify-center w-7 h-7 transition-colors ${
                      view === "map" ? "bg-accent text-paper" : "text-ink-tertiary hover:text-ink hover:bg-rule/40"
                    }`}
                    aria-label={t("dashboard.mapViewAriaLabel")}
                    aria-pressed={view === "map"}
                  >
                    <MapIcon />
                  </button>
                </div>
              </div>

              {view === "list" && (
                <div className="border border-rule rounded-lg overflow-hidden">
                  {LANDTAG_IDS.filter(id => pollData.Parliaments[id]).map((id, i) => (
                    <LandtagRow key={id} parliamentId={id} pollData={pollData} index={i} />
                  ))}
                </div>
              )}
              {view === "tile" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {LANDTAG_IDS.filter(id => pollData.Parliaments[id]).map((id, i) => (
                    <div key={id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                      <ParliamentCard parliamentId={id} pollData={pollData} />
                    </div>
                  ))}
                </div>
              )}
              {view === "map" && (
                <GermanyMap pollData={pollData} />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-ink-tertiary text-sm">
            {t("dashboard.loadingData")}
          </div>
        )}
      </section>
    </DefaultLayout>
  );
}
