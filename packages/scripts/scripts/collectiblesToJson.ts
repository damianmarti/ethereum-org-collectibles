import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const csvPath = path.join(__dirname, "..", "data", "collectibles.csv");
const outputPath = path.join(__dirname, "..", "data", "collectibles.json");

const categories = [
  "Github",
  "Translation",
  "Community",
  "Design",
  "Events / Calls",
];

function main() {
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const records = parse(csvContent, {
    skip_empty_lines: true,
  });

  // Remove header row and any extra header/footer rows
  const dataRows = records.filter(
    (row: string[], idx: number) => idx > 0 && row.length >= 6
  );

  let currentYear = "";
  const result: {
    year: string;
    link: string;
    category: string;
    source: string;
    id: string;
  }[] = [];

  for (const row of dataRows) {
    // The first column is year, may be empty
    if (row[0]) currentYear = row[0];
    for (let i = 1; i <= 5; i++) {
      let link = row[i]?.trim();
      if (link) {
        // Extract only the URL (find the first http/https link in the string)
        const urlMatch = link.match(/https?:\/\/\S+/);
        if (urlMatch) {
          link = urlMatch[0];
          result.push({
            year: currentYear,
            link,
            category: categories[i - 1].replace(" / ", "/"),
            source: link.startsWith("https://www.gitpoap.io/")
              ? "GitPOAP"
              : link.startsWith("https://app.galxe.com/")
              ? "Galxe"
              : link.startsWith("https://collections.poap.xyz/") ||
                link.startsWith("https://poap.gallery/")
              ? "POAP"
              : "unknown",
            id: link.substring(link.lastIndexOf("/") + 1),
          });
        }
      }
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`Saved ${result.length} collectibles to ${outputPath}`);
}

main();
