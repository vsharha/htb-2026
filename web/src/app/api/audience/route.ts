// Streams audience scoring one batch of traits at a time, so the browser can
// draw the map after the first batch and refine it as the rest arrive. A CPU
// model answers each batch in tens of seconds, and the whole call can take
// minutes, so a single response would leave the page blank.

import type { Brief } from "@/lib/contract";
import { scoreBatches } from "@/lib/server/audience";

export async function POST(request: Request) {
  const brief = (await request.json()) as Brief;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        for await (const fit of scoreBatches(brief, request.signal)) {
          send({ type: "fit", fit });
        }
      } catch (error) {
        send({ type: "error", message: error instanceof Error ? error.message : String(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" },
  });
}
