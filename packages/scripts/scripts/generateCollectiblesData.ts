import * as fs from "fs";
import * as path from "path";

const collectiblesPath = path.join(__dirname, "..", "data", "collectibles.json");
const poapEventsByIdPath = path.join(
  __dirname,
  "..",
  "data",
  "poap_events_by_id.json"
);
const galxeCampaignsByIdPath = path.join(
  __dirname,
  "..",
  "data",
  "galxe_campaigns_by_id.json"
);
const gitPoapsPath = path.join(__dirname, "..", "data", "git_poaps.json");
const gitPoapsPoapEventsByIdPath = path.join(
  __dirname,
  "..",
  "data",
  "git_poaps_poap_events_by_id.json"
);
const outputPath = path.join(__dirname, "..", "data", "collectibles_data.json");

function main() {
  const collectibles = JSON.parse(fs.readFileSync(collectiblesPath, "utf-8"));
  const poapEventsById = JSON.parse(
    fs.readFileSync(poapEventsByIdPath, "utf-8")
  );
  const galxeCampaignsById = JSON.parse(
    fs.readFileSync(galxeCampaignsByIdPath, "utf-8")
  );
  const gitPoaps = JSON.parse(fs.readFileSync(gitPoapsPath, "utf-8"));
  const gitPoapsPoapEventsById = JSON.parse(
    fs.readFileSync(gitPoapsPoapEventsByIdPath, "utf-8")
  );

  const gitPoapIdToEventId: Record<string, string> = {};
  for (const entry of gitPoaps) {
    if (entry.id && entry.poap_event_id) {
      gitPoapIdToEventId[entry.id] = entry.poap_event_id;
    }
  }

  const result = collectibles.map((item: any) => {
    let data = null;
    let poap_event_id: string | undefined = undefined;
    if (item.source === "POAP") {
      data = poapEventsById[item.id] || null;
    } else if (item.source === "Galxe") {
      data = galxeCampaignsById[item.id]?.data?.campaign || null;
    } else if (item.source === "GitPOAP") {
      poap_event_id = gitPoapIdToEventId[item.id];
      if (poap_event_id) {
        data = gitPoapsPoapEventsById[poap_event_id] || null;
      }
    }
    const base = { ...item, data };
    if (item.source === "GitPOAP" && poap_event_id) {
      base.poap_event_id = poap_event_id;
    }
    return base;
  });

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`Saved collectibles data to ${outputPath}`);
}

main();
