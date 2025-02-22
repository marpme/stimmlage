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
import { FC, useMemo, useState } from "react";
import * as d3 from "d3";

import { PartyEntry } from "@/types/PartyEntry.ts";
import Color from "color";
import { useLastElectionResults } from "@/assets/lastElectionResult.ts";
import { useTheme } from "@/hooks/use-theme.ts";
import { useDimensions } from "@/hooks/useDimensions.ts";
import { useFivePercentBarrier } from "@/hooks/useFivePercentBarrier.ts";

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
  const maxWidth = dimensions.width * 0.6;

  const limitedParliamentParties = useFivePercentBarrier(data);

  const [selectedKeys, setSelectedKeys] = useState(
    new Set(limitedParliamentParties.map((party) => party.name)),
  );

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

  const items = sortedData.map((item) => {
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
                fillOpacity={0.5}
                height={"32"}
                rx={1}
                stroke={Color(item.color).darken(0.5).hex()}
                strokeOpacity={0.5}
                strokeWidth={1}
                width={xScale(item.value)}
                x={xScale(0)}
                y={0}
              />
              <text
                alignmentBaseline="baseline"
                fill={isLight ? "#000" : "#fff"}
                fontSize={16}
                height="32"
                textAnchor="start"
                x={xScale(item.value) + 10}
                y="20"
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
        <svg height={64} width={`${maxWidth}px`}>
          <g key={item.name}>
            <rect
              fill={Color(item.color).darken(0.3).hex()}
              fillOpacity={0.8}
              height={"32"}
              rx={1}
              stroke={Color(item.color).darken(0.5).hex()}
              strokeOpacity={0.8}
              strokeWidth={1}
              width={xScale(item.value)}
              x={xScale(0)}
              y={0}
            />
            <rect
              fill={Color(lastElectionResult.color).hex()}
              fillOpacity={0.4}
              height={"32"}
              rx={1}
              stroke={Color(lastElectionResult.color).darken(0.5).hex()}
              strokeOpacity={0.4}
              strokeWidth={1}
              width={xScale(lastElectionResult.value)}
              x={xScale(0)}
              y={20}
            />
            <text
              alignmentBaseline="baseline"
              fill={isLight ? "#000" : "#fff"}
              fontSize={16}
              height="32"
              textAnchor="start"
              x={xScale(item.value) + 10}
              y="20"
            >
              {Math.round(item.value * 10) / 10}%
            </text>
          </g>
        </svg>
      ),
    };
  });

  return (
    <Card ref={ref} className="min-h-96 w-full md:w-[50vw]">
      <Table
        selectedKeys={[...selectedKeys]}
        selectionMode="multiple"
        onSelectionChange={(keys) => {
          console.log(keys);
          setSelectedKeys(new Set(keys));
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
