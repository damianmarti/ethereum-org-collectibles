import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET(_request: Request, { params }: { params: { address: string } }) {
  const { address } = await params;

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  const POSTGRES_URL = process.env.POSTGRES_URL;
  if (!POSTGRES_URL) {
    return NextResponse.json({ error: "POSTGRES_URL not set" }, { status: 500 });
  }

  const client = new Client({ connectionString: POSTGRES_URL });
  try {
    await client.connect();
    // Find all collectibles owned by this address
    const { rows } = await client.query(
      `SELECT c.*
       FROM collectibles c
       INNER JOIN collectors col ON c.id = col.id AND c.source = col.source
       WHERE col.address = $1`,
      [address],
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
