import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET(_request: Request, { params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  if (!year) {
    return NextResponse.json({ error: "Year is required" }, { status: 400 });
  }
  const POSTGRES_URL = process.env.POSTGRES_URL;
  if (!POSTGRES_URL) {
    return NextResponse.json({ error: "POSTGRES_URL not set" }, { status: 500 });
  }
  const client = new Client({ connectionString: POSTGRES_URL });
  try {
    await client.connect();
    const { rows } = await client.query(
      `SELECT c.*
       FROM collectibles c
       WHERE c.year = $1`,
      [year],
    );
    await client.end();
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
