import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const GALXE_GRAPHQL_URL = "https://graphigo.prd.galaxy.eco/query";
const collectiblesPath = path.join(__dirname, "..", "data", "collectibles.json");
const outputPath = path.join(__dirname, "..", "data", "galxe_campaigns_by_id.json");

const query = `
query campaign($id: ID!) {
  campaign(id: $id) {
    id
    numberID
    name
    type
    status
    description
    startTime
    endTime
    seoImage
    rewardType
    bannerUrl
    thumbnail
  }
}
`;

async function main() {
  let collectibles;
  try {
    collectibles = JSON.parse(fs.readFileSync(collectiblesPath, "utf-8"));
  } catch (err) {
    console.error("Failed to read or parse collectibles.json:", err);
    process.exit(1);
  }

  const galxeItems = collectibles.filter(
    (item: any) => item.source === "Galxe"
  );
  const campaignsById: Record<string, any> = {};

  for (const item of galxeItems) {
    const campaignId = item.id;
    try {
      const response = await axios.post(
        GALXE_GRAPHQL_URL,
        {
          query,
          variables: { id: campaignId },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      campaignsById[campaignId] = response.data;
      console.log(`Fetched campaign data for id: ${campaignId}`);
    } catch (err) {
      let errorMsg = "";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data
          ? JSON.stringify(err.response.data)
          : err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      } else {
        errorMsg = String(err);
      }
      console.error(
        `Failed to fetch campaign data for id ${campaignId}:`,
        errorMsg
      );
    }
  }

  try {
    fs.writeFileSync(
      outputPath,
      JSON.stringify(campaignsById, null, 2),
      "utf-8"
    );
    console.log(`All Galxe campaign data saved to ${outputPath}`);
  } catch (err) {
    console.error("Failed to write output file:", err);
  }
}

main();
