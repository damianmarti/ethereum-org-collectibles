import { NextResponse } from "next/server";
import { Client } from "pg";

const GALXE_GRAPHQL_URL = "https://graphigo.prd.galaxy.eco/query";

async function fetchPoapCollectors(eventId: string, POAP_API_KEY: string) {
  let offset = 0;
  const limit = 100;
  let total = 0;
  let allTokens: { address: string; tokenId: string }[] = [];
  do {
    const url = `https://api.poap.tech/event/${eventId}/poaps?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: { "X-API-KEY": POAP_API_KEY },
    });
    if (!response.ok) throw new Error("Failed to fetch POAP collectors");
    const data = await response.json();
    total = data.total;
    const tokens = data.tokens || [];
    allTokens = allTokens.concat(
      tokens.map((t: any) => ({
        address: t.owner?.id,
        tokenId: t.id,
      })),
    );
    offset += limit;
  } while (allTokens.length < total);
  return allTokens;
}

async function fetchGalxeCollectors(campaignId: string) {
  let after = "-1";
  const limit = 100;
  let totalCount = 0;
  let allParticipants: { address: string; tokenId: string }[] = [];
  do {
    const response = await fetch(GALXE_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query campaign($id: ID!, $pfirst: Int!, $pafter: String!) {\n  campaign(id: $id) {\n    participants {\n      participants(first: $pfirst, after: $pafter) {\n        list {\n          address {\n            address\n            id\n          }\n        }\n        totalCount\n      }\n    }\n  }\n}`,
        variables: { id: campaignId, pfirst: limit, pafter: after },
      }),
    });
    if (!response.ok) throw new Error("Failed to fetch Galxe collectors");
    const data = await response.json();
    const participants = data.data.campaign.participants.participants;
    totalCount = participants.totalCount;
    const list = participants.list || [];
    allParticipants = allParticipants.concat(
      list.map((p: any) => ({
        address: p.address?.address,
        tokenId: p.address?.id,
      })),
    );
    after = list.length > 0 ? list[list.length - 1].address.id : null;
  } while (allParticipants.length < totalCount && after);
  return allParticipants;
}

export async function POST(request: Request, { params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const POSTGRES_URL = process.env.POSTGRES_URL;
  const POAP_API_KEY = process.env.POAP_API_KEY;
  if (!POSTGRES_URL || !POAP_API_KEY) {
    return NextResponse.json({ error: "POSTGRES_URL or POAP_API_KEY not set" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  const client = new Client({ connectionString: POSTGRES_URL });
  await client.connect();
  const { rows: collectibles } = await client.query("SELECT * FROM collectibles WHERE year = $1", [year]);
  const summary: any[] = [];
  for (const collectible of collectibles) {
    let collectors: { address: string; tokenId: string }[] = [];
    let insertCount = 0;
    let existingCount = 0;
    try {
      if (collectible.source === "POAP") {
        collectors = await fetchPoapCollectors(collectible.id, POAP_API_KEY);
      } else if (collectible.source === "GitPOAP") {
        if (!collectible.poap_event_id) continue;
        collectors = await fetchPoapCollectors(collectible.poap_event_id, POAP_API_KEY);
      } else if (collectible.source === "Galxe") {
        collectors = await fetchGalxeCollectors(collectible.id);
      }
      for (const c of collectors) {
        const res = await client.query("SELECT 1 FROM collectors WHERE source = $1 AND id = $2 AND address = $3", [
          collectible.source,
          collectible.id,
          c.address,
        ]);
        if ((res.rowCount ?? 0) > 0) {
          existingCount++;
          continue;
        }
        await client.query("INSERT INTO collectors (source, id, address, tokenId) VALUES ($1, $2, $3, $4)", [
          collectible.source,
          collectible.id,
          c.address,
          c.tokenId,
        ]);
        insertCount++;
      }
    } catch (err) {
      summary.push({
        collectible: { source: collectible.source, id: collectible.id },
        error: (err as Error).message,
      });
      continue;
    } finally {
      if (insertCount > 0) {
        const {
          rows: [{ count }],
        } = await client.query("SELECT COUNT(*)::int AS count FROM collectors WHERE source = $1 AND id = $2", [
          collectible.source,
          collectible.id,
        ]);
        await client.query("UPDATE collectibles SET collectors_count = $1 WHERE source = $2 AND id = $3", [
          count,
          collectible.source,
          collectible.id,
        ]);
      }
    }
    summary.push({
      collectible: { source: collectible.source, id: collectible.id },
      inserted: insertCount,
      existing: existingCount,
    });
  }
  await client.end();
  return NextResponse.json(summary);
}
