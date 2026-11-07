# HackTheBurgh 2026

## Hackathon rules

- Event: HackTheBurgh 2026 at the Nucleus Building, Edinburgh. Hacking starts Saturday 7 November at 12:00. Projects must be submitted by Sunday 8 November at 12:00, and demos and judging start at 12:30. Teams have up to 4 members. The full schedule, including sponsor workshops, is in `docs/event/schedule.md`.
- Terms used in this repository: "track" means a sponsor track (`docs/event/tracks.md`); "challenge" means an MLH technology challenge (`docs/event/challenges.md`). The sponsors' own table calls its tracks "challenges", so map that wording to "track" here.
- We build one codebase and submit the same project to several sponsor tracks. There is no limit on how many tracks it can win.
- MLH challenges are separate prizes for using specific technologies. They stack with sponsor tracks.
- All participants must follow the MLH Code of Conduct.

## Choosing tracks and challenges

- The user decides which tracks and challenges we enter. An agent may suggest one but never decides, and changes the priority lists below only with the user's approval.
- Sponsor tracks take priority over MLH challenges.
- Tracks decide what we build. When proposing a feature, name the tracks it strengthens. Prefer features that serve the priority tracks, and ones that serve several tracks at once.
- Challenges decide how we build, not what. An agent never adds a challenge's technology to the project on its own. It may suggest a challenge where its technology fits a feature the tracks already call for, but never at the cost of a priority track. When a feature also qualifies for a challenge, say so.

Priority tracks, most important first: TODO, not decided yet.

Priority challenges, most important first: TODO, not decided yet.

## Reference

- `docs/event/tracks.md`: each sponsor track's prizes, brief and judging notes.
- `docs/event/challenges.md`: each MLH challenge's technology, prize, what qualifies, and sign-up.
- `docs/event/schedule.md`: the event schedule.
- `docs/product.md`, `docs/status.md`, `docs/pitch/` and `docs/ideas/`: the product plan, what is built, pitch material, and candidate ideas. See "Product docs" below.

Read the relevant file before work aimed at a specific track or challenge.

`reference/` holds the original source files these docs are summarised from: sponsor material in `reference/tracks/`, one folder per sponsor, and MLH material in `reference/mlh/`. Read a file there only when the user asks, for example to update `docs/event/tracks.md` from new material. Otherwise use the summaries in `docs/event/`.

## Project

Stack, commands and layout: TODO once chosen.

## Product docs

Agents keep these current without being asked.

- Product direction is brainstormed and recorded with the user before features are built.
- `docs/product.md` says what the product is, who it is for and what sets it apart. Its Decisions section records every decision the user makes or confirms, including ones reported from teammates. Each is one line with the decision, reason and date, and a changed decision is updated in place. Never record a suggestion the user has not accepted.
- `docs/status.md` lists each feature as built, mocked, planned or cut, with the tracks it serves. A built feature records how it was verified: the flow, the result, the date and the commit. A cut feature keeps its line with the reason. A change to code or demo data means re-checking the claims it affects.
- `docs/pitch/notes.md` holds internal pitch notes. `docs/pitch/judges/` holds only what judges will see, one file per track.

### Ideas

`docs/ideas/` holds candidate product ideas from brainstorming, one file per idea, named in kebab case after the idea (`ad-channel-mispricing.md`). An idea is not a decision. Anyone may add or edit one without approval.

- Record an idea when the user or a teammate raises it while brainstorming. An idea an agent proposes is recorded only if the user asks, and its Origin says so.
- When an idea is compared with another, give the other its own file and link to it rather than describing it inline.
- When the user chooses an idea, set its status to chosen and record the decision in `docs/product.md`. When an idea is dropped or merged into another, set its status and reason; never delete the file, because the reasons stay useful.
- Judge track fit against the judging notes in `docs/event/tracks.md`, not the track title alone.

Each idea file uses these sections, in this order:

1. Title, then a status line: `Status: proposed`, `chosen`, `dropped` or `merged into <file>`, with the date and, for dropped or merged, the reason.
2. Idea: what it does and for whom, in a short paragraph.
3. Origin: who proposed it and what prompted it.
4. Tracks it could serve: each track with strong, moderate or weak, and why.
5. Challenges it could use: each MLH challenge whose technology fits a part of the idea, and which part.
6. Open problems: unverified assumptions, data availability, and risks.
7. Scope: what a 24-hour demo would show, end to end.
8. Alternatives: links to the idea files it was compared with, and how it differs.

## Agent skills and tools

- Skills live in `.agents/skills/`, one folder each. `.claude/skills` is a symlink to `../.agents/skills`, so Claude Code and Codex read the same files. Edit skills only at the real path.
- Load the `frontend-design` skill before UI work. It is vendored from Anthropic's `claude-plugins-official` marketplace, under the Apache 2.0 licence in its folder.
- Both agents get the same Playwright MCP server, configured in `.mcp.json` for Claude Code and `.codex/config.toml` for Codex. It runs with `--isolated`, so each session gets its own in-memory browser profile and several agents on one machine don't share one.

## Frontend work

- Check a frontend change on the running dev server with Playwright or a browser before reporting it done: look at the page, use the changed flow, and read the console for errors.
- Before starting a dev server, check whether one is already running, by its process or by probing its port, and reuse it. A change to config, dependencies or env means stopping it and starting a fresh one. Never leave several instances running.

## Shared files that need approval

Several teammates, each with their own coding agent, push to one shared `main` branch. Some files affect everyone, so an agent changes them only with the user's approval: `AGENTS.md`, `CLAUDE.md`, `docs/event/`, `reference/`, `.agents/skills/`, `.mcp.json`, `.codex/config.toml`, `.gitignore`, and root package, workspace, lint, format and type-check config once they exist. Lockfiles are the exception, because they change whenever someone adds a dependency. Major version upgrades also need approval, and any version pin is recorded with its reason.

## Committing

- Start every task with `git pull --rebase --autostash`, so you work on teammates' latest pushes.
- Commit after each working change, without asking, under the user's Git identity. Commits carry no agent attribution.
- Messages are a single short subject line describing what was done, such as "Add pledge form validation", matching earlier commits.
- Before each commit, run the repository's checks once they exist (listed under Project) and fix any failure.
- Stage only the files you changed, by path. Never use `git add -A` or `git add .`, because other teammates' uncommitted files may be in the same tree.

## Pushing

- Push once per task, when handing the finished task back, without asking. Run `git pull --rebase --autostash` first so history stays linear with no merge commits, then `git push`.
- If the pull brought changes to lockfiles or package manifests, run the package manager's install before pushing.
- Push a commit that changes a lockfile or package manifest straight away, because these files conflict easily between teammates.
- If the push is rejected because the remote moved, pull and push again. If the pull stops on a conflict, resolve it as described below, or stop and ask.
- Run `git status` before describing the repository's state, because teammates push to the same branch and earlier output goes stale.

## Protecting shared work

- No force pushes, and no rewriting pushed commits with `--amend`, `rebase` or `reset`.
- Resolve pull conflicts by keeping the intent of both sides. Never take one side wholesale (`--ours` or `--theirs`) on files you didn't write. If the right resolution is unclear, stop and ask.
- `git reset --hard`, `git checkout -- <path>`, `git restore`, `git clean` and `git stash drop` need the user's approval.
- Resolve a lockfile conflict by re-running the package manager's lock or install and committing the result, never by deleting the lockfile.
- Keep build output, screenshots and downloaded data over a few MB out of Git. Commit data only when the demo needs it offline. Source files in `reference/` are the exception, except very large ones such as videos, which are kept as a link.
- Never bypass checks: no `--no-verify`, no disabled lint rules, no deleting failing code.

## Secrets and code quality

- Never print or disclose secret values; check only whether a key exists. Never open `.env` files; only `.env.example` may be read. `.gitignore` excludes `.env*` except `.env.example`.
- Avoid type, lint and framework suppression directives. An unavoidable one comes with an explanation.
- Comments describe the code as it stands, and appear only for non-obvious rationale, constraints or gotchas.
