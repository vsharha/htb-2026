# Glassbox: a coding agent that shows its evidence

Status: proposed, 7 November 2026.

## Idea

A Python debugging agent built to InstaLily's agent contract. It runs the failing tests and compares runtime traces of passing and failing tests to find the line most likely at fault. It then makes a fix of at most 30 lines and re-runs the tests to prove it.

It explains differently depending on who it is talking to:

- a beginner gets a timeline of values and a guiding question
- a senior engineer gets a short diff
- a third persona, "the scientist who codes", gets a hypothesis, an experiment and the result

One Python core serves three front ends. The first is the headless `agent` command for InstaLily. The second is an Agent Client Protocol (ACP) server for JetBrains Air. The third is the same server inside Zed, an open-source editor, which would be InstaLily's editor.

## Origin

Raised by an AI agent in a brainstorm on 7 November 2026, at macmac's request. That agent's angle was win probability. It argued that InstaLily's strict contract screens out most teams, and that InstaLily's prize includes a fast-track interview. A judge agent ranked it sixth (see [idea-ranking.md](../idea-ranking.md)).

## Tracks it could serve

- InstaLily: strong, but only if it clears the minimum bar. It must fix every one of a set of simple bugs on an unseen project, or the team is not ranked.
- JetBrains: moderate. A real working agent fits their top criterion, implementation, and building with agents fits "agentic development process".
- G-Research: weak. "Invisible runtime state" is a stretch next to the brief's real-world examples.
- Wordsmith, HRT, Bank of Scotland and Viridien: none. InstaLily's sandbox blocks browsing.

## Challenges it could use

- Entire: it judges how the team works with agents.
- Gemini API: borderline, because InstaLily's Gemini models come through an OpenAI-compatible gateway.

## Open problems

- The trace idea as first pitched was "find the first line where values differ from what's expected". That doesn't work, because only the final test assert says what a value should be. Comparing passing and failing traces, or spectrum-based fault localisation, fixes it.
- What clears the minimum bar is a reliable loop of running tests, patching and re-running, not tracing.
- JetBrains' slide lists OpenAI, Koog or a custom model. Whether a Gemini-backed agent is acceptable is unconfirmed. Air itself accepts any ACP agent, and an official Python ACP SDK exists (`agent-client-protocol`).
- It reaches only two tracks, against the goal of covering the most tracks with one project.
- Debuggers look alike at a table, so the demo is weak.

## Scope

Send the same bug in three personas' voices and show three different answers. Fix a bug live inside JetBrains Air. End on a scoreboard from our own set of bugs, showing it clears the minimum bar.

## Alternatives

- [Flat Truth](flat-truth.md): three strong tracks against one, and a far more relatable demo.
