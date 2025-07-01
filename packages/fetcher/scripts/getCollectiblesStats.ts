import * as dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env file.");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  // 1. Total number of collectibles
  const { rows: [{ count: collectiblesCount }] } = await client.query(
    "SELECT COUNT(*)::int AS count FROM collectibles"
  );

  // 2. Total number of collector records
  const { rows: [{ count: collectorsCount }] } = await client.query(
    "SELECT COUNT(*)::int AS count FROM collectors"
  );

  // 3. Total number of unique collector addresses
  const { rows: [{ count: uniqueAddressesCount }] } = await client.query(
    "SELECT COUNT(DISTINCT address)::int AS count FROM collectors"
  );

  console.log("Collectibles stats:");
  console.log(`- Total collectibles: ${collectiblesCount}`);
  console.log(`- Total collector records: ${collectorsCount}`);
  console.log(`- Unique collector addresses: ${uniqueAddressesCount}`);

  await client.end();
}

main().catch(err => {
  console.error("Error running stats script:", err);
  process.exit(1);
});