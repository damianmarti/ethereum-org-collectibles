import * as dotenv from "dotenv";
import { Client } from "pg";
import axios from "axios";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const POAP_API_KEY = process.env.POAP_API_KEY;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env file.");
  process.exit(1);
}
if (!POAP_API_KEY) {
  console.error("POAP_API_KEY not found in .env file.");
  process.exit(1);
}

const year = process.argv[2];
if (!year) {
  console.error("Usage: ts-node fetchCollectorsByYear.ts <year>");
  process.exit(1);
}

const GALXE_GRAPHQL_URL = "https://graphigo.prd.galaxy.eco/query";

async function fetchPoapCollectors(
  eventId: string
): Promise<{ address: string; tokenId: string }[]> {
  let offset = 0;
  const limit = 100;
  let total = 0;
  let allTokens: { address: string; tokenId: string }[] = [];
  do {
    const url = `https://api.poap.tech/event/${eventId}/poaps?limit=${limit}&offset=${offset}`;
    const response = await axios.get(url, {
      headers: { "X-API-KEY": POAP_API_KEY },
    });
    const data = response.data;
    total = data.total;
    console.log(`Fetched ${data.tokens.length} tokens for event ${eventId}`);
    console.log(`Total: ${total}`);
    const tokens = data.tokens || [];
    allTokens = allTokens.concat(
      tokens.map((t: any) => ({
        address: t.owner?.id,
        tokenId: t.id,
      }))
    );
    offset += limit;
    console.log(`Fetched ${allTokens.length} tokens for event ${eventId}`);
  } while (allTokens.length < total);
  return allTokens;
}

async function fetchGalxeCollectors(
  campaignId: string
): Promise<{ address: string; tokenId: string }[]> {
  let after = "-1";
  const limit = 100;
  let totalCount = 0;
  let allParticipants: { address: string; tokenId: string }[] = [];
  do {
    const response = await axios.post(
      GALXE_GRAPHQL_URL,
      {
        query: `query campaign($id: ID!, $pfirst: Int!, $pafter: String!) {\n  campaign(id: $id) {\n    participants {\n      participants(first: $pfirst, after: $pafter) {\n        list {\n          address {\n            address\n            id\n          }\n        }\n        totalCount\n      }\n    }\n  }\n}`,
        variables: { id: campaignId, pfirst: limit, pafter: after },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = response.data.data.campaign.participants.participants;
    totalCount = data.totalCount;
    const list = data.list || [];
    allParticipants = allParticipants.concat(
      list.map((p: any) => ({
        address: p.address?.address,
        tokenId: p.address?.id,
      }))
    );
    after = list.length > 0 ? list[list.length - 1].address.id : null;
  } while (allParticipants.length < totalCount && after);
  return allParticipants;
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  const { rows: collectibles } = await client.query(
    "SELECT * FROM collectibles WHERE year = $1",
    [year]
  );
  for (const collectible of collectibles) {
    let collectors: { address: string; tokenId: string }[] = [];
    try {
      if (collectible.source === "POAP") {
        collectors = await fetchPoapCollectors(collectible.id);
      } else if (collectible.source === "GitPOAP") {
        if (!collectible.poap_event_id) continue;
        collectors = await fetchPoapCollectors(collectible.poap_event_id);
      } else if (collectible.source === "Galxe") {
        collectors = await fetchGalxeCollectors(collectible.id);
      }
      let insertCount = 0;
      let existingCount = 0;
      for (const c of collectors) {
        const res = await client.query(
          "SELECT 1 FROM collectors WHERE source = $1 AND id = $2 AND address = $3",
          [collectible.source, collectible.id, c.address]
        );
        if ((res.rowCount ?? 0) > 0) {
          existingCount++;
          continue;
        }
        await client.query(
          "INSERT INTO collectors (source, id, address, tokenId) VALUES ($1, $2, $3, $4)",
          [collectible.source, collectible.id, c.address, c.tokenId]
        );
        insertCount++;
      }
      console.log(
        `Inserted ${insertCount} collectors for ${collectible.source} ${collectible.id}, ${existingCount} already existed.`
      );
    } catch (err) {
      console.error(
        `Error processing ${collectible.source} ${collectible.id}:`,
        err
      );
    }
  }
  await client.end();
  console.log("Done.");
}

main();
