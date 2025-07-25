import { NextResponse } from "next/server";
import { fetchCollectors } from "~~/services/collectors";

export async function POST(request: Request, { params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;

  if (!process.env.POSTGRES_URL || !process.env.POAP_API_KEY) {
    return NextResponse.json({ error: "POSTGRES_URL or POAP_API_KEY not set" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const summary = await fetchCollectors(year);
  return NextResponse.json(summary);
}
