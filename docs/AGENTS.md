# Docs

Rules for writing files under `docs/`. They add to the root `AGENTS.md`, which still applies.

## Event docs

`docs/event/` summarises the original sponsor and MLH material in `reference/`. Change it only with the user's approval.

- `tracks.md` has one section per sponsor track and `challenges.md` one per MLH challenge, each under a heading, with no summary tables.
- A section that draws on material in `reference/` names that file on its "Source" line.
- To add new material, store the original in `reference/tracks/<sponsor>/` or `reference/mlh/`, then summarise it into the matching section. Keep the original's facts, quantities and deadlines; plan decisions belong in `product.md`, not here.

## Product docs

Agents keep these current without being asked.

- `product.md` says what the product is, who it is for and what sets it apart. Its Decisions section records every decision the user makes or confirms, including ones reported from teammates: who it serves, data sources, methods or models, the stack, how parts connect and the demo scope. Each is one line with the decision, reason and date, and a changed decision is updated in place. Never record a suggestion the user has not accepted. Track and challenge priorities live in the root `AGENTS.md`, not here.
- `status.md` lists each feature as built, mocked, planned or cut, with the tracks it serves. A built feature records how it was verified: the flow, the result, the date and the commit. A mocked feature says what is faked. A cut feature keeps its line with the reason. A change to code or demo data means re-checking the claims it affects.
- `pitch/notes.md` holds internal pitch notes. `pitch/judges/` holds only what judges will see, one file per track named after the sponsor, such as `judges/jetbrains.md`.

## Track groups

`track-groups.md` records which sponsor tracks one project can enter together and which MLH challenges fit any project. Idea files can link to its groups instead of repeating the reasoning. It is analysis, not a decision; update it when `event/tracks.md` or `event/challenges.md` changes.

## Ideas

`ideas/` holds candidate product ideas from brainstorming, one file per idea, named in kebab case after the idea (`ad-channel-mispricing.md`). An idea is not a decision. Anyone may add or edit one without approval.

- Record an idea when the user or a teammate raises it while brainstorming. An idea an agent proposes is recorded only if the user asks, and its Origin says so.
- When an idea is compared with another, give the other its own file and link to it rather than describing it inline.
- When the user chooses an idea, set its status to chosen and record the decision in `product.md`. When an idea is dropped or merged into another, set its status and reason; never delete the file, because the reasons stay useful.
- Judge track fit against the judging notes in `event/tracks.md`, not the track title alone.

Each idea file uses these sections, in this order:

1. Title, then a status line: `Status: proposed`, `chosen`, `dropped` or `merged into <file>`, with the date and, for dropped or merged, the reason.
2. Idea: what it does and for whom, in a short paragraph.
3. Origin: who proposed it and what prompted it.
4. Tracks it could serve: each track with strong, moderate or weak, and why.
5. Challenges it could use: each MLH challenge whose technology fits a part of the idea, and which part.
6. Open problems: unverified assumptions, data availability, and risks.
7. Scope: what a 24-hour demo would show, end to end.
8. Alternatives: links to the idea files it was compared with, and how it differs.
