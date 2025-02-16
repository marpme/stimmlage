import { formatDistance } from "date-fns/formatDistance";
import { lastUpdated } from "../assets/lastUpdated";

export const useLatestUpdateTime = () => {
  // return the last updated time
  return formatDistance(lastUpdated, new Date(), {
    addSuffix: true,
  });
};
