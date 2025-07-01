import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const POAP_API_KEY = process.env.POAP_API_KEY;
if (!POAP_API_KEY) {
  console.error('POAP_API_KEY not found in .env file.');
  process.exit(1);
}

const jsonPath = path.join(__dirname, "..", 'data', 'git_poaps.json');
const outputPath = path.join(__dirname, "..", 'data', 'git_poaps_poap_events_by_id.json');

async function main() {
  let poaps;
  try {
    poaps = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to read or parse git_poaps.json:', err);
    process.exit(1);
  }

  const eventsById: Record<string, any> = {};

  for (const entry of poaps) {
    const url = `https://api.poap.tech/events/id/${entry.poap_event_id}`;
    try {
      const response = await axios.get(url, {
        headers: {
          'X-API-KEY': POAP_API_KEY,
        },
      });
      eventsById[entry.poap_event_id] = response.data;
      console.log(`Fetched event info for event_id: ${entry.poap_event_id}`);
    } catch (err) {
      let errorMsg = '';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      } else {
        errorMsg = String(err);
      }
      console.error(`Failed to fetch event info for event_id ${entry.poap_event_id}:`, errorMsg);
    }
  }

  try {
    fs.writeFileSync(outputPath, JSON.stringify(eventsById, null, 2), 'utf-8');
    console.log(`All event data saved to ${outputPath}`);
  } catch (err) {
    console.error('Failed to write output file:', err);
  }
}

main();