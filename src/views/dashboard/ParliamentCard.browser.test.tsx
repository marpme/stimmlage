import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ParliamentCard } from "@/views/dashboard/ParliamentCard";
import type { Poll } from "@/assets/poll";

const DAY = 24 * 60 * 60 * 1000;

function buildPoll(): Poll {
  const date = (n: number) => new Date(Date.now() + n * DAY);
  return {
    Database: {
      License: { Name: "CC", Shortcut: "CC", Link: "" },
      Publisher: "",
      Author: "",
      Last_Update: new Date(),
    },
    Parliaments: {
      "1": { Shortcut: "BT", Name: "Bundestag", Election: "2025" },
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
    Surveys: {
      s1: {
        Date: date(-5),
        Survey_Period: { Date_Start: date(-5), Date_End: date(-5) },
        Surveyed_Persons: "1000",
        Parliament_ID: "1",
        Institute_ID: "i1",
        Tasker_ID: "t1",
        Method_ID: "m1",
        Results: { p1: 25, p2: 30, p3: 18, p4: 12, p5: 6, p6: 4, p7: 5 },
      },
      s2: {
        Date: date(-3),
        Survey_Period: { Date_Start: date(-3), Date_End: date(-3) },
        Surveyed_Persons: "1000",
        Parliament_ID: "1",
        Institute_ID: "i2",
        Tasker_ID: "t1",
        Method_ID: "m1",
        Results: { p1: 26, p2: 29, p3: 19, p4: 11, p5: 5, p6: 4, p7: 6 },
      },
    },
  } as unknown as Poll;
}

describe("ParliamentCard", () => {
  it("renders parliament name as a link", () => {
    render(
      <MemoryRouter>
        <ParliamentCard parliamentId="1" pollData={buildPoll()} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("Bundestag").length).toBeGreaterThanOrEqual(1);
  });

  it("links to the correct parliament route", () => {
    const { container } = render(
      <MemoryRouter>
        <ParliamentCard parliamentId="1" pollData={buildPoll()} />
      </MemoryRouter>,
    );
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/parliament/1");
  });

  it("renders top-3 party bars", () => {
    const { container } = render(
      <MemoryRouter>
        <ParliamentCard parliamentId="1" pollData={buildPoll()} />
      </MemoryRouter>,
    );
    expect(container.querySelectorAll(".rounded-full").length).toBeGreaterThanOrEqual(3);
  });

  it("displays the leader party name and percentage", () => {
    render(
      <MemoryRouter>
        <ParliamentCard parliamentId="1" pollData={buildPoll()} />
      </MemoryRouter>,
    );
    expect(document.body.textContent).toMatch(/CDU\/CSU\s*·/);
  });

  it("renders a sparkline SVG", () => {
    const { container } = render(
      <MemoryRouter>
        <ParliamentCard parliamentId="1" pollData={buildPoll()} />
      </MemoryRouter>,
    );
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(1);
  });

  it("returns null when parliament not found", () => {
    const { container } = render(
      <MemoryRouter>
        <ParliamentCard parliamentId="nonexistent" pollData={buildPoll()} />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });
});
