import { formatDistance } from "date-fns/formatDistance";
import { usePollData } from "@/hooks/usePollData.ts";

export const useLatestUpdateTime = () => {
  const { data, isFetching, refetch } = usePollData();

  const lastUpdated = data?.Database?.Last_Update
    ? new Date(data.Database.Last_Update)
    : null;

  return {
    data: lastUpdated
      ? {
          lastUpdated,
          timestamp: lastUpdated.getTime(),
          formatedLastUpdated: formatDistance(lastUpdated, new Date(), {
            addSuffix: true,
          }),
        }
      : undefined,
    isFetching,
    refetch,
  };
};
