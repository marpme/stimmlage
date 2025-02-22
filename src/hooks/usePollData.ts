import { Convert, Poll } from "@/assets/poll.ts";
import { useQuery } from "@tanstack/react-query";

export const getPollData = () => {
  const { promise, resolve } = Promise.withResolvers<Poll>();

  setTimeout(async () => {
    const { default: pollData } = await import("../assets/poll.json");
    return resolve(Convert.toPoll(JSON.stringify(pollData)));
  }, Math.random() * 1000);

  return promise;
};

export const usePollData = () => {
  // return the last updated time
  return useQuery({
    queryKey: ["getPollData"],
    queryFn: getPollData,
  });
};
