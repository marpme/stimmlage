import { Convert } from "@/assets/poll.ts";
import { useQuery } from "@tanstack/react-query";
import { useLatestUpdateTime } from "@/hooks/useLatestUpdateTime.ts";

export const getPollData = (lastUpdated?: number) => async () => {
  if (typeof lastUpdated !== "number") {
    throw new Error("lastUpdated is required");
  }

  const pollData = await fetch(`/poll.json?t=${lastUpdated}`).then((res) =>
    res.text(),
  );

  return Convert.toPoll(pollData);
};

export const usePollData = () => {
  const {
    data: lastUpdatedData,
    isSuccess,
    refetch: refetchUpdatedTime,
  } = useLatestUpdateTime();

  const { refetch, ...rest } = useQuery({
    queryKey: ["getPollData", lastUpdatedData?.timestamp ?? "0"],
    queryFn: getPollData(lastUpdatedData?.timestamp),
    enabled: isSuccess,
  });

  return {
    refetch: async () => {
      await refetchUpdatedTime();
      await refetch();
    },
    ...rest,
  };
};
