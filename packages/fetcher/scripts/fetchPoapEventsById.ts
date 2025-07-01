import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const POAP_API_KEY = process.env.POAP_API_KEY;
if (!POAP_API_KEY) {
  console.error("POAP_API_KEY not found in .env file.");
  process.exit(1);
}

const collectiblesPath = path.join(__dirname, "..", "data", "collectibles.json");
const outputPath = path.join(__dirname, "..", "data", "poap_events_by_id.json");

async function main() {
  let collectibles;
  try {
    collectibles = JSON.parse(fs.readFileSync(collectiblesPath, "utf-8"));
  } catch (err) {
    console.error("Failed to read or parse collectibles.json:", err);
    process.exit(1);
  }

  const poapItems = collectibles.filter((item: any) => item.source === "POAP");
  const eventsById: Record<string, any> = {};

  for (const item of poapItems) {
    const url = `https://api.poap.tech/events/id/${item.id}`;
    try {
      const response = await axios.get(url, {
        headers: {
          "x-api-key": POAP_API_KEY,
        },
      });
      eventsById[item.id] = response.data;
      console.log(`Fetched event info for id: ${item.id}`);
    } catch (err) {
      let errorMsg = "";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data
          ? JSON.stringify(err.response.data)
          : err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      } else {
        errorMsg = String(err);
      }
      console.error(`Failed to fetch event info for id ${item.id}:`, errorMsg);
    }
  }

  try {
    fs.writeFileSync(outputPath, JSON.stringify(eventsById, null, 2), "utf-8");
    console.log(`All POAP event data saved to ${outputPath}`);
  } catch (err) {
    console.error("Failed to write output file:", err);
  }
}

main();
