import { Convert } from "@/assets/poll.ts";
import { useQuery } from "@tanstack/react-query";

const API_URL = "https://api.dawum.de/";

export const usePollData = () => {
  const { refetch, ...rest } = useQuery({
    queryKey: ["getPollData"],
    queryFn: async () => {
      const text = await fetch(API_URL).then((res) => res.text());
      return Convert.toPoll(text);
    },
    staleTime: 5 * 60 * 1000, // treat data as fresh for 5 minutes
  });

  return { refetch, ...rest };
};
