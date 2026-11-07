# Docs

Rules for writing files under `docs/`.

## Writing

- Do not coin abbreviations, acronyms or capitalised names for project concepts. Use the term already in the codebase, or a plain description, because invented shorthand cannot be searched for later.
- Define a term the reader cannot look up in half a sentence at first use. This matters most for names the document coins itself, since they exist nowhere else.
- Describe what code does and under what conditions. Do not assert importance with a metaphor in place of the mechanism.
- Lead with the answer, so a reader who stops after the first sentence still has it.
- One idea per paragraph, carried by its first sentence.
- Headings name their content, such as "Why the request times out", not "Analysis".
- Short, active sentences. Split anything past roughly thirty words unless splitting reads worse.
- Never drop a fact, quantity or qualifier to read more simply. Plain wording is the goal; less precision is not. This protects facts about the subject, not superseded statements about it.

## Correcting existing docs

- Before correcting a document, search all of it for statements the change makes false. If the search finds any beyond the passage being edited, list them with line numbers in the reply. Fixing only the passage you happened to read is the usual failure.
- Replace each false statement in place. Delete what is now wrong rather than writing around it.
- What changed, and why the old text was wrong, goes in the reply, not the document.
- The result must read as if written today from scratch. A reader who has never seen the previous version cannot tell which parts changed.
- The exceptions are the history these rules ask for: a changed decision in `product.md` is updated in place with its new date, and a dropped or merged idea keeps its file with the reason.

## Event docs

`docs/event/` summarises the original sponsor and MLH material in `reference/`.

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

`ideas/` holds candidate product ideas from brainstorming, one file per idea, named in kebab case after the idea (`ad-channel-mispricing.md`). An idea is not a decision. Idea files are not among the shared files that need approval in the root `AGENTS.md`.

- Record an idea only after it has been explored and the user agrees to record it. This holds whether the user, a teammate or an agent raised it. An idea counts as explored once its track fit, open problems and demo scope have been discussed, which is what its file needs. At that point, ask the user whether to record it.
- Origin says who raised the idea, including when an agent did.
- When an idea is compared with another, link to the other's file rather than describing it inline. If the other has no file yet, describe it briefly and offer to record it once it has been explored.
- When the user chooses an idea, set its status to chosen and record the decision in `product.md`. When an idea is dropped or merged into another, set its status and reason; never delete the file, because the reasons stay useful.
- Judge track fit against the judging notes in `event/tracks.md`, not the track title alone.

Each idea file uses these sections, in this order. Sections marked optional appear only once there is something to put in them.

1. Title, then a status line: `Status: proposed`, `chosen`, `dropped` or `merged into <file>`, with the date and, for dropped or merged, the reason.
2. Idea: what it does and for whom, in a short paragraph.
3. Origin: who proposed it and what prompted it. Source material goes in Evidence and data.
4. How it works (optional): the inputs, the steps the product takes, what it outputs, and any calculation or model it relies on. This is the product design; what the demo shows goes in Scope.
5. Evidence and data (optional): sources that support the premise, with their dates and how reliable they are, and the data the product needs, with whether access has been checked.
6. Existing products (optional): outside products and research that already cover part of the idea, how this idea differs, the date of the search, and what the search did not cover.
7. Tracks it could serve: each track with strong, moderate or weak, and why.
8. Challenges it could use: each MLH challenge whose technology fits a part of the idea, and which part.
9. Open problems: unverified assumptions, unchecked data access, and risks. Facts already found go in Evidence and data or Existing products, not here.
10. Scope: what a 24-hour demo would show, end to end.
11. Alternatives: links to the idea files it was compared with, and how it differs. Outside products go in Existing products.
