import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoalitionsTable } from "@/views/CoalitionTable/table";
import type { PartyEntry } from "@/types/PartyEntry";

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

describe("CoalitionsTable", () => {
  it("renders party rows sorted by value descending", () => {
    render(<CoalitionsTable data={buildCoalitionData()} />);
    const rows = screen.getAllByRole("row");
    const names = rows.slice(1).map((r) => r.textContent?.trim());
    expect(names[0]).toContain("CDU/CSU");
    expect(names[1]).toContain("SPD");
    expect(names[2]).toContain("AfD");
  });

  it("displays the 5% hurdle line", () => {
    const { container } = render(<CoalitionsTable data={buildCoalitionData()} />);
    expect(container.querySelectorAll("line").length).toBeGreaterThan(0);
  });

  it("shows Sonstige at the bottom regardless of value", () => {
    render(<CoalitionsTable data={buildCoalitionData()} />);
    const rows = screen.getAllByRole("row");
    expect(rows[rows.length - 1].textContent).toContain("Sonstige");
  });

  it("applies reduced opacity CSS class to parties below 5%", () => {
    render(<CoalitionsTable data={buildCoalitionData()} />);
    expect(document.querySelectorAll(".opacity-35").length).toBeGreaterThan(0);
  });

  it("renders empty table body when data is empty", () => {
    const { container } = render(<CoalitionsTable data={[]} />);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(0);
  });
});
