import * as dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env file.");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  // Get all collectibles
  const { rows: collectibles } = await client.query("SELECT id, source FROM collectibles");
  let updated = 0;
  for (const collectible of collectibles) {
    const { rows: [{ count }] } = await client.query(
      "SELECT COUNT(*)::int AS count FROM collectors WHERE source = $1 AND id = $2",
      [collectible.source, collectible.id]
    );
    await client.query(
      "UPDATE collectibles SET collectorsCount = $1 WHERE source = $2 AND id = $3",
      [count, collectible.source, collectible.id]
    );
    updated++;
  }
  await client.end();
  console.log(`Updated collectorsCount for ${updated} collectibles.`);
}

main().catch(err => {
  console.error("Error updating collectorsCount:", err);
  process.exit(1);
});