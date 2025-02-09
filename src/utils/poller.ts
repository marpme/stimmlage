import pollJSON from "../assets/poll.json";
import { Convert } from "../assets/poll.ts";

export * from "../assets/poll.ts";
export const pollData = Convert.toPoll(JSON.stringify(pollJSON));
