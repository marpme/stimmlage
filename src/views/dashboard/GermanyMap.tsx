import { useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { useNavigate } from "react-router-dom";

import { Poll } from "@/assets/poll.ts";
import { useSetOfCoalition } from "@/hooks/useSetOfCoalition.ts";
import { useDimensions } from "@/hooks/useDimensions.ts";
import germanyGeoJson from "@/assets/germany-states.geo.json";

const PARLIAMENT_ID_BY_STATE: Record<string, string> = {
  "Baden-Württemberg": "1",
  Bayern: "2",
  Berlin: "3",
  Brandenburg: "4",
  Bremen: "5",
  Hamburg: "6",
  Hessen: "7",
  "Mecklenburg-Vorpommern": "8",
  Niedersachsen: "9",
  "Nordrhein-Westfalen": "10",
  "Rheinland-Pfalz": "11",
  Saarland: "12",
  Sachsen: "13",
  "Sachsen-Anhalt": "14",
  "Schleswig-Holstein": "15",
  Thüringen: "16",
};

type PartyBar = { name: string; value: number; color: string };

export type StateDetail = {
  parliamentId: string;
  stateName: string;
  leader: PartyBar | null;
  parties: PartyBar[];
};

// ─── Per-state hook component ──────────────────────────────────────────────
// Each state needs its own component so React hooks aren't called conditionally.

type StatePathProps = {
  feature: GeoJSON.Feature;
  pathGenerator: d3.GeoPath;
  parliamentId: string;
  pollData: Poll;
  isActive: boolean;
  onEnter: (detail: StateDetail) => void;
  onLeave: () => void;
  onClick: (detail: StateDetail) => void;
};

const StatePath = ({
  feature,
  pathGenerator,
  parliamentId,
  pollData,
  isActive,
  onEnter,
  onLeave,
  onClick,
}: StatePathProps) => {
  const parties = useSetOfCoalition(parliamentId, pollData);

  const { leader, top5 } = useMemo(() => {
    const sorted = [...parties]
      .filter((p) => !p.name.includes("Sonstige"))
      .sort((a, b) => b.value - a.value);
    return { leader: sorted[0] ?? null, top5: sorted.slice(0, 5) };
  }, [parties]);

  const d = pathGenerator(feature) ?? "";
  const stateName = feature.properties?.name as string;

  const detail: StateDetail = {
    parliamentId,
    stateName,
    leader: leader ?? null,
    parties: top5,
  };

  const fill = leader?.color ?? "var(--color-rule)";

  return (
    <path
      d={d}
      fill={fill}
      fillOpacity={isActive ? 0.9 : 0.55}
      stroke="var(--color-paper)"
      strokeWidth={isActive ? 1.5 : 0.6}
      style={{
        cursor: "pointer",
        transition: "fill-opacity 0.15s ease, stroke-width 0.15s ease",
      }}
      onMouseEnter={() => onEnter(detail)}
      onMouseLeave={onLeave}
      onClick={() => onClick(detail)}
    />
  );
};

// ─── AllStates renders all 16 state paths ─────────────────────────────────

type AllStatesProps = {
  features: GeoJSON.Feature[];
  pathGenerator: d3.GeoPath;
  pollData: Poll;
  activeId: string | null;
  onEnter: (detail: StateDetail) => void;
  onLeave: () => void;
  onClick: (detail: StateDetail) => void;
};

const AllStates = ({
  features,
  pathGenerator,
  pollData,
  activeId,
  onEnter,
  onLeave,
  onClick,
}: AllStatesProps) => (
  <>
    {features.map((feature) => {
      const name = feature.properties?.name as string;
      const parliamentId = PARLIAMENT_ID_BY_STATE[name];
      if (!parliamentId) return null;
      return (
        <StatePath
          key={name}
          feature={feature}
          pathGenerator={pathGenerator}
          parliamentId={parliamentId}
          pollData={pollData}
          isActive={activeId === parliamentId}
          onEnter={onEnter}
          onLeave={onLeave}
          onClick={onClick}
        />
      );
    })}
  </>
);

// ─── Legend ───────────────────────────────────────────────────────────────

type LegendEntry = { name: string; color: string };

const ColorLegend = ({ entries }: { entries: LegendEntry[] }) => (
  <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-3 border-t border-rule">
    {entries.map((e) => (
      <div key={e.name} className="flex items-center gap-1.5">
        <span
          className="inline-block w-2 h-2 rounded-sm flex-shrink-0"
          style={{ background: e.color, opacity: 0.85 }}
        />
        <span className="text-[10px] text-ink-tertiary leading-none tracking-wide">
          {e.name}
        </span>
      </div>
    ))}
  </div>
);

// A hidden component that collects all leader party names+colors for the legend.
// Renders nothing visible, calls hooks per parliament.
type LeaderCollectorProps = {
  parliamentId: string;
  pollData: Poll;
  onLeader: (name: string, color: string) => void;
};

const LeaderCollector = ({
  parliamentId,
  pollData,
  onLeader,
}: LeaderCollectorProps) => {
  const parties = useSetOfCoalition(parliamentId, pollData);

  const leader = useMemo(() => {
    return (
      [...parties]
        .filter((p) => !p.name.includes("Sonstige"))
        .sort((a, b) => b.value - a.value)[0] ?? null
    );
  }, [parties]);

  // Use a ref-like pattern — call during render is fine for collecting
  if (leader) {
    onLeader(leader.name, leader.color);
  }

  return null;
};

// ─── Detail Panel ─────────────────────────────────────────────────────────

const EmptyPanel = () => (
  <div className="flex flex-col items-start justify-start gap-3 pt-2">
    <div className="text-xs font-semibold tracking-widest uppercase text-ink-tertiary">
      Umfrageergebnis
    </div>
    <p className="text-sm text-ink-tertiary leading-relaxed">
      Bundesland auswählen
    </p>
    <p className="text-xs text-ink-tertiary leading-relaxed opacity-60">
      Bewege die Maus über ein Bundesland, um die aktuellen Umfragewerte zu
      sehen.
    </p>
  </div>
);

type DetailPanelProps = {
  detail: StateDetail | null;
  pollData: Poll;
  onNavigate: (id: string) => void;
};

const DetailPanel = ({ detail, pollData, onNavigate }: DetailPanelProps) => {
  if (!detail || detail.parties.length === 0) return <EmptyPanel />;

  const parliament = pollData.Parliaments[detail.parliamentId];
  const maxVal = detail.parties[0]?.value ?? 50;

  return (
    <div
      className="flex flex-col gap-0 animate-fade-up"
      style={{ animationDuration: "160ms" }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-accent mb-1">
          Landtag
        </div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-ink leading-snug">
            {parliament?.Name ?? detail.stateName}
          </h3>
          {detail.leader && (
            <span
              className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums"
              style={{
                background: `${detail.leader.color}1a`,
                color: detail.leader.color,
              }}
            >
              {detail.leader.name}
            </span>
          )}
        </div>

        {detail.leader && (
          <div className="flex items-baseline gap-1.5 mt-2">
            <span
              className="text-3xl font-bold tabular-nums leading-none"
              style={{ color: detail.leader.color }}
            >
              {detail.leader.value.toFixed(1)}
            </span>
            <span className="text-sm text-ink-tertiary">%</span>
          </div>
        )}
      </div>

      {/* Party bars */}
      <div className="flex flex-col gap-2.5 mb-5">
        {detail.parties.map((p, i) => (
          <div key={p.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: p.color }}
                />
                <span
                  className="text-[11px]"
                  style={{
                    color:
                      i === 0
                        ? "var(--color-ink)"
                        : "var(--color-ink-secondary)",
                    fontWeight: i === 0 ? 600 : 400,
                  }}
                >
                  {p.name}
                </span>
              </div>
              <span className="text-[11px] tabular-nums text-ink-secondary">
                {p.value.toFixed(1)}%
              </span>
            </div>
            <div
              className="h-0.5 rounded-full overflow-hidden"
              style={{ background: "var(--color-rule)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (p.value / (maxVal * 1.1)) * 100)}%`,
                  background: p.color,
                  opacity: 1 - i * 0.12,
                  transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => onNavigate(detail.parliamentId)}
        className="flex items-center justify-between w-full px-3 py-2 rounded border border-rule text-xs text-ink-tertiary hover:border-accent/40 hover:text-accent hover:bg-accent/[0.03] transition-all group"
      >
        <span>Vollständige Analyse</span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          className="transition-transform duration-150 group-hover:translate-x-0.5"
        >
          <path
            d="M2 6H10M7 3L10 6L7 9"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

// ─── Main GermanyMap ───────────────────────────────────────────────────────

type GermanyMapProps = { pollData: Poll };

export const GermanyMap = ({ pollData }: GermanyMapProps) => {
  const { ref, dimensions } = useDimensions();
  const navigate = useNavigate();

  const [hovered, setHovered] = useState<StateDetail | null>(null);
  const [pinned, setPinned] = useState<StateDetail | null>(null);

  // Collect legend entries during render (called synchronously, safe)
  const legendMap = useMemo(() => new Map<string, string>(), []);
  const collectLeader = useCallback(
    (name: string, color: string) => {
      if (!legendMap.has(name)) legendMap.set(name, color);
    },
    [legendMap],
  );

  const geojson = germanyGeoJson as unknown as GeoJSON.FeatureCollection;

  const pathGenerator = useMemo(() => {
    if (!dimensions.width) return null;
    // In the two-column layout, map gets ~60% of the container, capped at 380px
    const mapW = Math.min(dimensions.width * 0.58, 380);
    const mapH = mapW * 1.18;
    const projection = d3.geoMercator().fitSize([mapW, mapH], geojson);
    return d3.geoPath().projection(projection);
  }, [dimensions.width, geojson]);

  const mapWidth = Math.min((dimensions.width || 0) * 0.58, 380);
  const svgHeight = mapWidth ? Math.round(mapWidth * 1.18) : 450;

  const handleEnter = useCallback(
    (detail: StateDetail) => setHovered(detail),
    [],
  );
  const handleLeave = useCallback(() => setHovered(null), []);
  const handleClick = useCallback((detail: StateDetail) => {
    setPinned((prev) =>
      prev?.parliamentId === detail.parliamentId ? null : detail,
    );
  }, []);
  const handleNavigate = useCallback(
    (id: string) => navigate(`/parliament/${id}`),
    [navigate],
  );

  const displayDetail = hovered ?? pinned;
  const activeId = hovered?.parliamentId ?? pinned?.parliamentId ?? null;

  // Legend: build from legendMap (populated synchronously by LeaderCollector renders)
  const legendEntries = Array.from(legendMap.entries()).map(
    ([name, color]) => ({
      name,
      color,
    }),
  );

  return (
    <div ref={ref} className="w-full">
      {dimensions.width > 0 && pathGenerator ? (
        <div className="flex flex-col gap-4">
          {/* Two-column: map + detail panel */}
          <div className="flex gap-6 items-start">
            {/* Map */}
            <div className="flex-shrink-0">
              <svg
                width={mapWidth}
                height={svgHeight}
                style={{ display: "block", overflow: "visible" }}
                aria-label="Karte der deutschen Bundesländer"
              >
                <AllStates
                  features={geojson.features}
                  pathGenerator={pathGenerator}
                  pollData={pollData}
                  activeId={activeId}
                  onEnter={handleEnter}
                  onLeave={handleLeave}
                  onClick={handleClick}
                />
              </svg>
            </div>

            {/* Detail panel */}
            <div className="flex-1 min-w-0 self-stretch">
              <div
                className="h-full border border-rule rounded-lg p-4"
                style={{ minHeight: Math.min(svgHeight, 380) }}
              >
                <DetailPanel
                  detail={displayDetail}
                  pollData={pollData}
                  onNavigate={handleNavigate}
                />
              </div>
            </div>
          </div>

          {/* Legend — hidden LeaderCollectors + rendered legend */}
          <div>
            {/* Invisible collectors to populate legendMap */}
            {Object.values(PARLIAMENT_ID_BY_STATE).map((id) => (
              <LeaderCollector
                key={id}
                parliamentId={id}
                pollData={pollData}
                onLeader={collectLeader}
              />
            ))}
            <ColorLegend entries={legendEntries} />
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-xs text-ink-tertiary">
          Karte wird geladen…
        </div>
      )}
    </div>
  );
};
