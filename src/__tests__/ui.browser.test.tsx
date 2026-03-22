import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CoalitionsTable } from "@/views/CoalitionTable/table";
import { LandtagRow } from "@/views/dashboard/LandtagRow";
import { FeaturedCard } from "@/views/dashboard/FeaturedCard";
import type { Poll } from "@/assets/poll";
import type { PartyEntry } from "@/types/PartyEntry";

const DAY = 24 * 60 * 60 * 1000;

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * DAY);
}

function makeSurvey(
  id: string,
  parliamentId: string,
  date: Date,
  instituteId: string,
  results: Record<string, number>,
) {
  return [
    id,
    {
      Date: date,
      Survey_Period: { Date_Start: date, Date_End: date },
      Surveyed_Persons: "1000",
      Parliament_ID: parliamentId,
      Institute_ID: instituteId,
      Tasker_ID: "t1",
      Method_ID: "m1",
      Results: results,
    },
  ] as const;
}

function buildMinimalPoll(surveys: ReturnType<typeof makeSurvey>[]) {
  return {
    Database: {
      License: { Name: "CC", Shortcut: "CC", Link: "" },
      Publisher: "",
      Author: "",
      Last_Update: new Date(),
    },
    Parliaments: {
      "1": { Shortcut: "BT", Name: "Bundestag", Election: "2025" },
      "2": { Shortcut: "LT", Name: "Landtag", Election: "2024" },
    },
    Institutes: {
      i1: { Name: "Infratest" },
      i2: { Name: "Forschungsgruppe" },
    },
    Taskers: {},
    Methods: {},
    Parties: {
      p1: { Shortcut: "SPD", Name: "Sozialdemokraten" },
      p2: { Shortcut: "CDU/CSU", Name: "Union" },
      p3: { Shortcut: "AfD", Name: "AfD" },
      p4: { Shortcut: "Grüne", Name: "Bündnis 90/Die Grünen" },
      p5: { Shortcut: "FDP", Name: "Freie Demokraten" },
      p6: { Shortcut: "Linke", Name: "Die Linke" },
      p7: { Shortcut: "Sonstige", Name: "Sonstige" },
    },
    Surveys: Object.fromEntries(surveys),
  } as unknown as Poll;
}

function buildCoalitionData(): PartyEntry[] {
  return [
    { name: "SPD", value: 25.5, color: "#E3000F", date: new Date() },
    { name: "CDU/CSU", value: 30.0, color: "#000000", date: new Date() },
    { name: "AfD", value: 18.5, color: "#009EE0", date: new Date() },
    { name: "Grüne", value: 12.0, color: "#46962B", date: new Date() },
    { name: "FDP", value: 5.5, color: "#FFED00", date: new Date() },
    { name: "Linke", value: 4.0, color: "#BE3075", date: new Date() },
    { name: "Sonstige", value: 4.5, color: "#CCCCCC", date: new Date() },
  ];
}

function buildPollForDashboard() {
  const surveys = [
    makeSurvey("s1", "1", daysFromNow(-5), "i1", {
      p1: 25,
      p2: 30,
      p3: 18,
      p4: 12,
      p5: 6,
      p6: 4,
      p7: 5,
    }),
    makeSurvey("s2", "1", daysFromNow(-3), "i2", {
      p1: 26,
      p2: 29,
      p3: 19,
      p4: 11,
      p5: 5,
      p6: 4,
      p7: 6,
    }),
  ];
  return buildMinimalPoll(surveys);
}

// ---------------------------------------------------------------------------
// CoalitionsTable
// ---------------------------------------------------------------------------

describe("CoalitionsTable", () => {
  it("renders party rows sorted by value descending", () => {
    const data = buildCoalitionData();
    render(<CoalitionsTable data={data} />);

    const rows = screen.getAllByRole("row");
    const names = rows.slice(1).map((r) => r.textContent?.trim());

    expect(names[0]).toContain("CDU/CSU");
    expect(names[1]).toContain("SPD");
    expect(names[2]).toContain("AfD");
  });

  it("displays the 5% hurdle line", () => {
    const data = buildCoalitionData();
    const { container } = render(<CoalitionsTable data={data} />);
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBeGreaterThan(0);
  });

  it("shows Sonstige at the bottom regardless of value", () => {
    const data = buildCoalitionData();
    render(<CoalitionsTable data={data} />);

    const rows = screen.getAllByRole("row");
    const lastRow = rows[rows.length - 1];
    expect(lastRow.textContent).toContain("Sonstige");
  });

  it("applies reduced opacity CSS class to parties below 5%", () => {
    const data = buildCoalitionData();
    render(<CoalitionsTable data={data} />);
    const fadedRows = document.querySelectorAll(".opacity-35");
    expect(fadedRows.length).toBeGreaterThan(0);
  });

  it("renders empty table body when data is empty", () => {
    const { container } = render(<CoalitionsTable data={[]} />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// LandtagRow
// ---------------------------------------------------------------------------

describe("LandtagRow", () => {
  it("renders parliament name", () => {
    const poll = buildPollForDashboard();
    render(
      <MemoryRouter>
        <LandtagRow parliamentId="1" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    const names = screen.getAllByText("Bundestag");
    expect(names.length).toBeGreaterThanOrEqual(1);
  });

  it("renders top-3 color dots", () => {
    const poll = buildPollForDashboard();
    const { container } = render(
      <MemoryRouter>
        <LandtagRow parliamentId="1" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots.length).toBeGreaterThanOrEqual(3);
  });

  it("renders bar segments for top-3 parties", () => {
    const poll = buildPollForDashboard();
    const { container } = render(
      <MemoryRouter>
        <LandtagRow parliamentId="1" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    const bars = container.querySelectorAll(".rounded-full");
    expect(bars.length).toBeGreaterThanOrEqual(3);
  });

  it("shows leader percentage", () => {
    const poll = buildPollForDashboard();
    render(
      <MemoryRouter>
        <LandtagRow parliamentId="1" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    const pct = document.querySelector(".tabular-nums");
    expect(pct?.textContent).toMatch(/\d+\.\d+%/);
  });

  it("returns null when parliament not found", () => {
    const poll = buildPollForDashboard();
    const { container } = render(
      <MemoryRouter>
        <LandtagRow parliamentId="nonexistent" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("links to the correct parliament route", () => {
    const poll = buildPollForDashboard();
    const { container } = render(
      <MemoryRouter>
        <LandtagRow parliamentId="1" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/parliament/1");
  });
});

// ---------------------------------------------------------------------------
// FeaturedCard
// ---------------------------------------------------------------------------

describe("FeaturedCard", () => {
  it("renders parliament name", () => {
    const poll = buildPollForDashboard();
    render(
      <MemoryRouter>
        <FeaturedCard parliamentId="1" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    const names = screen.getAllByText("Bundestag");
    expect(names.length).toBeGreaterThanOrEqual(1);
  });

  it("renders top-4 party rows", () => {
    const poll = buildPollForDashboard();
    render(
      <MemoryRouter>
        <FeaturedCard parliamentId="1" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    const rows = document.querySelectorAll("table tbody tr");
    expect(rows.length).toBeGreaterThanOrEqual(4);
  });

  it("renders sparkline SVG", () => {
    const poll = buildPollForDashboard();
    const { container } = render(
      <MemoryRouter>
        <FeaturedCard parliamentId="1" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it("links to the correct parliament route", () => {
    const poll = buildPollForDashboard();
    const { container } = render(
      <MemoryRouter>
        <FeaturedCard parliamentId="1" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/parliament/1");
  });

  it("returns null when parliament not found", () => {
    const poll = buildPollForDashboard();
    const { container } = render(
      <MemoryRouter>
        <FeaturedCard parliamentId="nonexistent" pollData={poll} index={0} />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });
});
