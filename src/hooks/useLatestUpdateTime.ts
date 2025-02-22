import { formatDistance } from "date-fns/formatDistance";
import { useQuery } from "@tanstack/react-query";

export const getLastUpdatedTime = async () => {
  const { lastUpdated } = await import("../assets/lastUpdated");
  return formatDistance(lastUpdated, new Date(), {
    addSuffix: true,
  });
};

export const useLatestUpdateTime = () => {
  // return the last updated time
  return useQuery({
    queryKey: ["getLatestUpdate"],
    queryFn: getLastUpdatedTime,
  });
};
