import { writeFileSync } from "node:fs";
import { lastUpdated } from "../src/assets/lastUpdated.ts";
import * as path from "node:path";

const DAWUM_UPDATE_API = "https://api.dawum.de/last_update.txt";
const DAWUM_DB_API = "https://api.dawum.de/";
const dirname = path.dirname(new URL(import.meta.url).pathname);

export async function fetchLastUpdated(): Promise<Date> {
  const response = await fetch(DAWUM_UPDATE_API);
  const data = await response.text();
  return new Date(data);
}

export async function fetchDatabase(): Promise<any> {
  const response = await fetch(DAWUM_DB_API);
  return await response.json();
}

export async function updateDatabase(): Promise<void> {
  const lastUpdatedLocal = lastUpdated;
  const lastUpdatedRemote = await fetchLastUpdated();

  if (lastUpdatedRemote > lastUpdatedLocal) {
    const data = await fetchDatabase();
    writeFileSync(
      path.resolve(dirname, "../src/assets/poll.json"),
      JSON.stringify(data),
    );
    // write the similar file to update the lastUpdated.ts
    writeFileSync(
      path.resolve(dirname, "../src/assets/lastUpdated.ts"),
      `export const lastUpdated: Date = new Date("${lastUpdatedRemote.toISOString()}");`,
    );
  }
}

await updateDatabase();
