import { NextResponse } from "next/server";
import { fetchCollectors } from "~~/services/collectors";

export async function GET(request: Request) {
  const currentYear = new Date().getFullYear().toString();

  if (!process.env.POSTGRES_URL || !process.env.POAP_API_KEY) {
    return NextResponse.json({ error: "POSTGRES_URL or POAP_API_KEY not set" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const summary = await fetchCollectors(currentYear);
  return NextResponse.json(summary);
}
