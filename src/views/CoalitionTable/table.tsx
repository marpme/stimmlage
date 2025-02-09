import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/react";
import { FC, useMemo, useState } from "react";
import * as d3 from "d3";

import { PartyEntry } from "@/types/PartyEntry.ts";

const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "color",
    label: "COLOR",
  },
  {
    key: "value",
    label: "Vote Poll",
  },
];

export const CoalitionsTable: FC<{
  data: Array<PartyEntry>;
}> = ({ data }) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set(["2"]));
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
      .range([0, 300]);
  }, [sortedData]);

  const items = sortedData.map((item) => ({
    ...item,
    value: (
      <svg height={"32px"} width={"300px"}>
        <g key={item.name}>
          <rect
            fill={item.color}
            fillOpacity={0.7}
            height={"32"}
            opacity={0.7}
            rx={1}
            stroke={"#000000"}
            strokeWidth={1}
            width={xScale(item.value)}
            x={xScale(0)}
            y={0}
          />
          <text
            alignmentBaseline="baseline"
            fill="#fff"
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
  }));

  return (
    <Table
      aria-label="Controlled table example with dynamic content"
      disabledBehavior="selection"
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      onSelectionChange={(keys) => setSelectedKeys(new Set(String(keys)))}
    >
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
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
  );
};
