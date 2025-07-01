import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env file.");
  process.exit(1);
}

const dataPath = path.join(__dirname, "..", "data", "collectibles_data.json");

function parseTimestamp(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  // Try to parse as ISO or fallback to number (seconds)
  const d = new Date(isNaN(Number(dateStr)) ? dateStr : Number(dateStr) * 1000);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  for (const item of data) {
    let fancy_id: string | null = null,
      name: string | null = null,
      image: string | null = null,
      description: string | null = null,
      start_time: string | null = null,
      end_time: string | null = null;
    if (item.source === "Galxe" && item.data) {
      fancy_id = item.data.fancy_id || null;
      name = item.data.name || null;
      image = item.data.thumbnail || null;
      description = item.data.description || null;
      start_time = item.data.startTime
        ? parseTimestamp(item.data.startTime)
        : null;
      end_time = item.data.endTime ? parseTimestamp(item.data.endTime) : null;
    } else if (item.source === "POAP" && item.data) {
      fancy_id = item.data.fancy_id || null;
      name = item.data.name || null;
      image = item.data.image_url || null;
      description = item.data.description || null;
      start_time = item.data.start_date
        ? parseTimestamp(item.data.start_date)
        : null;
      end_time = item.data.end_date ? parseTimestamp(item.data.end_date) : null;
    } else if (item.source === "GitPOAP" && item.data) {
      fancy_id = item.data.fancy_id || null;
      name = item.data.name || null;
      image = item.data.image_url || null;
      description = item.data.description || null;
      start_time = item.data.start_date
        ? parseTimestamp(item.data.start_date)
        : null;
      end_time = item.data.end_date ? parseTimestamp(item.data.end_date) : null;
    }

    // Check for duplicate
    const res = await client.query(
      "SELECT 1 FROM collectibles WHERE source = $1 AND id = $2",
      [item.source, item.id]
    );
    if ((res.rowCount ?? 0) > 0) {
      console.log(`Duplicate found: source=${item.source}, id=${item.id}`);
      continue;
    }

    await client.query(
      `INSERT INTO collectibles (year, link, category, source, id, poap_event_id, fancy_id, name, image, description, start_time, end_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        item.year,
        item.link,
        item.category,
        item.source,
        item.id,
        item.poap_event_id || null,
        fancy_id,
        name,
        image,
        description,
        start_time,
        end_time,
      ]
    );
  }
  await client.end();
  console.log("All collectibles inserted in the database.");
}

main();
