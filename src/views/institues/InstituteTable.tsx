import { Survey } from "@/assets/poll.ts";
import { FC } from "react";
import {
  Card,
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { usePollData } from "@/hooks/usePollData.ts";
import { getSortingValueOfParty } from "@/hooks/useSortedParliament.ts";

const fixedColumns = [
  {
    key: "name",
    label: "Name",
  },
];

export const InstituteTable: FC<{ surveys?: { [id: string]: Survey } }> = ({
  surveys,
}) => {
  const { data: pollData } = usePollData();

  if (!surveys) {
    return null;
  }

  const listedSurveyIds = Object.keys(surveys)
    .toSorted((a, b) => Number(b) - Number(a))
    .slice(0, 10);

  const newSurvey = surveys[listedSurveyIds[0]];
  const columns = Object.keys(newSurvey.Results)
    .map(([key]) => ({
      key: key,
      label: pollData?.Parties[key].Shortcut,
    }))
    .sort(
      (a, b) =>
        getSortingValueOfParty(b.label ?? "") -
        getSortingValueOfParty(a.label ?? ""),
    );

  const items = listedSurveyIds
    .map((id) => surveys[id])
    .map((survey) => ({
      key: survey.Tasker_ID,
      Institute_ID: survey.Institute_ID,
      name: pollData?.Institutes[survey.Institute_ID].Name,
      ...survey.Results,
    }));

  return (
    <Card className="min-h-96 w-full">
      <Table selectionMode="none">
        <TableHeader columns={[...fixedColumns, ...columns]}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.key}>
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
