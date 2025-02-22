import { formatDistance } from "date-fns/formatDistance";
import { useQuery } from "@tanstack/react-query";

export const getLastUpdatedTime = async () => {
  const { lastUpdated } = await fetch("/lastUpdated.json").then((res) =>
    res.json(),
  );

  const parsedLastUpdated = new Date(lastUpdated);

  return {
    lastUpdated: parsedLastUpdated,
    formatedLastUpdated: formatDistance(parsedLastUpdated, new Date(), {
      addSuffix: true,
    }),
  };
};

export const useLatestUpdateTime = () => {
  // return the last updated time
  return useQuery({
    queryKey: ["getLatestUpdate"],
    queryFn: getLastUpdatedTime,
  });
};
