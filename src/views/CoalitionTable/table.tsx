import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Card,
} from "@heroui/react";
import { FC, useMemo } from "react";
import * as d3 from "d3";

import { PartyEntry } from "@/types/PartyEntry.ts";
import Color from "color";
import { useLastElectionResults } from "@/assets/lastElectionResult.ts";
import { useTheme } from "@/hooks/use-theme.ts";
import { useDimensions } from "@/hooks/useDimensions.ts";
import { useParliamentStore } from "@/model/useParliamentConfiguration.ts";
import { PartyValues } from "@/utils/Party.ts";

const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "value",
    label: "Vote Poll",
  },
];

export const CoalitionsTable: FC<{
  data: Array<PartyEntry>;
}> = ({ data }) => {
  const { isLight } = useTheme();
  const { ref, dimensions } = useDimensions();
  const { addDirectCandidate, removeDirectCandidate, directCandidates } =
    useParliamentStore();

  const maxWidth = dimensions.width * 0.6;

  const lastElectionResults = useLastElectionResults();
  const sortedData = useMemo(
    () =>
      data.sort((a, b) => {
        if (a.name === "Sonstige") {
          return 1;
        }

        if (b.name === "Sonstige") {
          return -1;
        }

        return a.value < b.value ? 1 : -1;
      }),
    [data],
  );

  const xScale = useMemo(() => {
    const [min = 0, max = 0] = d3.extent(sortedData.map((d) => d.value));

    return d3
      .scaleLinear()
      .domain([min, max + 20])
      .range([0, maxWidth]);
  }, [sortedData, dimensions]);

  const items = useMemo(
    () =>
      sortedData.map((item) => {
        const lastElectionResult = lastElectionResults.find(
          (entry) => entry.name === item.name,
        );

        if (!lastElectionResult) {
          return {
            ...item,
            value: (
              <svg height={"32px"} width={`${maxWidth}px`}>
                <g key={item.name}>
                  <rect
                    fill={Color(item.color).darken(0.3).hex()}
                    fillOpacity={0.7}
                    height={"32"}
                    rx={2}
                    stroke={Color(item.color).darken(0.5).hex()}
                    strokeOpacity={0.4}
                    strokeWidth={1}
                    width={xScale(item.value)}
                    x={xScale(0)}
                    y={0}
                  />
                  <text
                    alignmentBaseline="baseline"
                    fill={isLight ? "#111" : "#f0f0f0"}
                    fontSize={13}
                    fontWeight="600"
                    height="32"
                    textAnchor="start"
                    x={xScale(item.value) + 10}
                    y="21"
                  >
                    {Math.round(item.value * 10) / 10}%
                  </text>
                </g>
              </svg>
            ),
          };
        }

        return {
          ...item,
          value: (
            <svg height={52} width={`${maxWidth}px`}>
              <g key={item.name}>
                {/* Current poll bar */}
                <rect
                  fill={Color(item.color).darken(0.3).hex()}
                  fillOpacity={0.7}
                  height={28}
                  rx={2}
                  stroke={Color(item.color).darken(0.5).hex()}
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  width={xScale(item.value)}
                  x={xScale(0)}
                  y={0}
                />
                {/* Last election comparison bar */}
                <rect
                  fill={Color(lastElectionResult.color).hex()}
                  fillOpacity={0.3}
                  height={16}
                  rx={2}
                  stroke={Color(lastElectionResult.color).darken(0.5).hex()}
                  strokeOpacity={0.3}
                  strokeWidth={1}
                  width={xScale(lastElectionResult.value)}
                  x={xScale(0)}
                  y={32}
                />
                <text
                  alignmentBaseline="baseline"
                  fill={isLight ? "#111" : "#f0f0f0"}
                  fontSize={13}
                  fontWeight="600"
                  height="28"
                  textAnchor="start"
                  x={xScale(item.value) + 10}
                  y="21"
                >
                  {Math.round(item.value * 10) / 10}%
                </text>
              </g>
            </svg>
          ),
        };
      }),
    [isLight, sortedData, xScale, maxWidth, lastElectionResults],
  );

  return (
    <Card ref={ref} className="min-h-96 w-full md:w-[50vw]">
      <Table
        selectedKeys={new Set(directCandidates.keys().map((d) => d))}
        selectionMode="multiple"
        onSelectionChange={(keys) => {
          const newSelectedKeys = new Set(keys as Set<string>);

          // Remove direct candidates that are no longer selected
          directCandidates.forEach((key) => {
            if (!newSelectedKeys.has(key)) {
              removeDirectCandidate(key as any);
            }
          });

          // Add new direct candidates
          newSelectedKeys.forEach((key) => {
            if (!directCandidates.has(key as PartyValues)) {
              addDirectCandidate(key as any);
            }
          });
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.name}>
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
