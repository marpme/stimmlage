import { formatDistance } from "date-fns/formatDistance";
import { useQuery } from "@tanstack/react-query";

export const getLastUpdatedTime = async () => {
  const timestamp = new Date().getTime();
  const { lastUpdated } = await fetch(`/lastUpdated.json?t=${timestamp}`).then(
    (res) => res.json(),
  );

  const parsedLastUpdated = new Date(lastUpdated);

  return {
    lastUpdated: parsedLastUpdated,
    timestamp: parsedLastUpdated.getTime(),
    formatedLastUpdated: formatDistance(parsedLastUpdated, new Date(), {
      addSuffix: true,
    }),
  };
};

export const useLatestUpdateTime = () =>
  useQuery({
    queryKey: ["getLatestUpdate"],
    queryFn: getLastUpdatedTime,
  });
