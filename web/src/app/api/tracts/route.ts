import { readFile } from "node:fs/promises";
import path from "node:path";

// The shapes never change between runs, so the response is built once.
export const dynamic = "force-static";

export async function GET() {
  const file = path.join(process.cwd(), "..", "data", "analysis", "nyc_tracts.geojson");
  return new Response(await readFile(file), {
    headers: { "Content-Type": "application/geo+json" },
  });
}
