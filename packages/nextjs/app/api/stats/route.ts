import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET() {
  const POSTGRES_URL = process.env.POSTGRES_URL;
  if (!POSTGRES_URL) {
    return NextResponse.json({ error: "POSTGRES_URL not set" }, { status: 500 });
  }

  const client = new Client({ connectionString: POSTGRES_URL });
  try {
    await client.connect();

    const {
      rows: [{ count: collectiblesCount }],
    } = await client.query("SELECT COUNT(*)::int AS count FROM collectibles");
    const {
      rows: [{ count: collectorsCount }],
    } = await client.query("SELECT COUNT(*)::int AS count FROM collectors");
    const {
      rows: [{ count: uniqueAddressesCount }],
    } = await client.query("SELECT COUNT(DISTINCT address)::int AS count FROM collectors");

    return NextResponse.json({
      collectiblesCount,
      collectorsCount,
      uniqueAddressesCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
