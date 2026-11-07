import { DefaultChatTransport, readUIMessageStream } from "ai";

import type { AgentEvent, AgentMessage, Brief } from "@/lib/contract";

const transport = new DefaultChatTransport<AgentMessage>({
  api: "/api/competitors",
  prepareSendMessagesRequest: ({ body }) => ({ body: body ?? {} }),
});

/** Keeps the run interface while the AI SDK handles streaming and decoding. */
export async function* runCompetitorAgent(brief: Brief, signal?: AbortSignal): AsyncGenerator<AgentEvent> {
  try {
    const stream = await transport.sendMessages({
      trigger: "submit-message",
      chatId: crypto.randomUUID(),
      messageId: undefined,
      messages: [],
      body: { ...brief },
      abortSignal: signal,
    });
    let received = 0;
    let done = false;
    for await (const message of readUIMessageStream<AgentMessage>({ stream, terminateOnError: true })) {
      for (const part of message.parts.slice(received)) {
        if (part.type === "data-agent") {
          yield part.data;
          if (part.data.type === "done") done = true;
        }
      }
      received = message.parts.length;
    }
    if (!done) throw new Error("Competitor search disconnected before it finished. Coverage is incomplete.");
  } catch (error) {
    if (signal?.aborted) return;
    yield { type: "error", message: error instanceof Error ? error.message : "Competitor search failed. Coverage is unknown." };
    yield { type: "done" };
  }
}
