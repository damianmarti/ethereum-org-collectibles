import { NextResponse } from "next/server";
import { Client } from "pg";
import { verifyMessage } from "viem";
import scaffoldConfig from "~~/scaffold.config";

function parseCollectibleUrl(url: string) {
  let source = "unknown";
  if (url.startsWith("https://www.gitpoap.io/")) source = "GitPOAP";
  else if (url.startsWith("https://app.galxe.com/")) source = "Galxe";
  else if (url.startsWith("https://collections.poap.xyz/") || url.startsWith("https://poap.gallery/")) source = "POAP";
  const id = url.substring(url.lastIndexOf("/") + 1);
  return { source, id };
}

async function fetchCollectibleData(source: string, id: string) {
  let poapEventId = null;
  if (source === "GitPOAP") {
    // Fetch GitPOAP event list and find the poapEventId
    const gitpoapEventsUrl = "https://public-api.gitpoap.io/v1/gitpoaps/events";
    const res = await fetch(gitpoapEventsUrl);
    if (!res.ok) throw new Error("Failed to fetch GitPOAP events");
    const eventsResponse = await res.json();
    const event = eventsResponse.gitPoapEvents.find((e: any) => String(e.gitPoapEventId) === String(id));
    if (!event || !event.poapEventId) {
      throw new Error("Could not find poapEventId for this GitPOAP");
    }
    poapEventId = event.poapEventId;
  }
  if (source === "POAP") {
    poapEventId = id;
  }

  if (source === "POAP" || source === "GitPOAP") {
    const POAP_API_KEY = process.env.POAP_API_KEY;
    const url = `https://api.poap.tech/events/id/${poapEventId}`;
    const res = await fetch(url, { headers: { "x-api-key": POAP_API_KEY || "" } });
    if (!res.ok) throw new Error("Failed to fetch POAP event");
    const data = await res.json();
    return { data, poapEventId };
  }

  if (source === "Galxe") {
    const GALXE_GRAPHQL_URL = "https://graphigo.prd.galaxy.eco/query";
    const query = `query campaign($id: ID!) { campaign(id: $id) { id numberID name type status description startTime endTime seoImage rewardType bannerUrl thumbnail } }`;
    const res = await fetch(GALXE_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { id } }),
    });
    if (!res.ok) throw new Error("Failed to fetch Galxe campaign");
    const data = await res.json();
    return { data: data.data.campaign };
  }

  return null;
}

function parseTimestamp(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(isNaN(Number(dateStr)) ? dateStr : Number(dateStr) * 1000);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function POST(req: Request) {
  try {
    const { year, url, category, address, signature } = await req.json();
    if (!year || !url || !category || !address || !signature) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const adminAddresses = scaffoldConfig.admins.map(a => a.toLowerCase());
    if (!adminAddresses.includes(address.toLowerCase())) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    const message = `Add collectible: year=${year}, url=${url}, category=${category}`;
    const valid = await verifyMessage({ address, message, signature });
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    const { source, id } = parseCollectibleUrl(url);
    if (source === "unknown") {
      return NextResponse.json({ error: "Unknown collectible source" }, { status: 400 });
    }

    const fetchResult = await fetchCollectibleData(source, id);
    if (!fetchResult || !fetchResult.data) {
      return NextResponse.json({ error: "Could not fetch collectible data" }, { status: 400 });
    }
    const data = fetchResult.data;
    const poapEventId = fetchResult.poapEventId || null;
    // Prepare DB fields
    let fancy_id = null,
      image = null,
      start_time = null,
      end_time = null;
    const name = data.name || null;
    const description = data.description || null;
    if (source === "Galxe") {
      image = data.thumbnail || null;
      start_time = data.startTime ? parseTimestamp(data.startTime) : null;
      end_time = data.endTime ? parseTimestamp(data.endTime) : null;
    } else if (source === "POAP" || source === "GitPOAP") {
      fancy_id = data.fancy_id || null;
      image = data.image_url || null;
      start_time = data.start_date ? parseTimestamp(data.start_date) : null;
      end_time = data.end_date ? parseTimestamp(data.end_date) : null;
    }
    // Insert into DB
    const POSTGRES_URL = process.env.POSTGRES_URL;
    if (!POSTGRES_URL) {
      return NextResponse.json({ error: "POSTGRES_URL not set" }, { status: 500 });
    }
    const client = new Client({ connectionString: POSTGRES_URL });
    await client.connect();
    // Check for duplicate collectible
    const duplicateCheck = await client.query("SELECT 1 FROM collectibles WHERE source = $1 AND id = $2", [source, id]);
    if ((duplicateCheck.rowCount ?? 0) > 0) {
      await client.end();
      return NextResponse.json({ error: "A collectible with this source and id already exists." }, { status: 409 });
    }
    const insertRes = await client.query(
      `INSERT INTO collectibles (year, link, category, source, id, poap_event_id, fancy_id, name, image, description, start_time, end_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [year, url, category, source, id, poapEventId, fancy_id, name, image, description, start_time, end_time],
    );
    await client.end();
    return NextResponse.json(insertRes.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
