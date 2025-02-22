import { Convert } from "@/assets/poll.ts";
import { useQuery } from "@tanstack/react-query";

export const getPollData = async () => {
  const pollData = await fetch(`/poll.json`).then((res) => res.text());

  return Convert.toPoll(pollData);
};

export const usePollData = () => {
  return useQuery({
    queryKey: ["getPollData"],
    queryFn: getPollData,
  });
};
