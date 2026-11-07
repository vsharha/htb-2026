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

Read `docs/event/tracks.md` or `docs/event/challenges.md` before work aimed at a specific track or challenge.

`reference/` holds the original sponsor and MLH files that `docs/event/` summarises. Read a file there only when the user asks, for example to update `docs/event/tracks.md` from new material. Otherwise use the summaries in `docs/event/`.

## Project

The idea is locked in: the ad channel mispricing finder, chosen by the user on 7 November 2026. It finds advertising channels that are underpriced for the attention and audience they deliver. Read `docs/ideas/ad-channel-mispricing.md` before feature work on it. The track and challenge priorities above are still undecided.

Python tools are managed with uv, and Node.js tools with pnpm. Do not use pip, poetry, npm or yarn.

The web app is a Next.js 16 project in `web/`. Read `web/AGENTS.md` before working on it; it holds the web app's commands, checks, libraries and frontend rules.

The data-gathering scripts are a Python project in `tools/`. Gather data through a script there, not by hand, in `web/`, or with a one-off command, so anyone can re-run it. Read `tools/AGENTS.md` before working on them or on the data they write to `data/`.

## Questions and disagreement

- For questions about this project, inspect the relevant files and conventions before answering. Ground recommendations in repository evidence, not generic advice.
- When a request is missing a decision that the code and sensible defaults don't settle, ask before starting work that depends on it. If a question tool is available, ask with it rather than in prose. Ask across several turns if one round is not enough.
- Disagreement is welcome. If a requested change is worse than the current version, say so before applying it. If overruled, apply it without re-arguing, but still report anything new, such as a separate problem or the concern coming true.

## Docs

How to write anything under `docs/` is in `docs/AGENTS.md`. Read it before creating or editing a file there. Brainstorm product direction with the user before building features.

Never record an idea in `docs/ideas/` unasked, whoever raised it. Once an idea has been explored, ask the user whether to record it, and record it only if they agree.

Keep the other product docs current without being asked:

- Record each decision the user makes or confirms in `docs/product.md`.
- Update `docs/status.md` when a feature is built, mocked or cut, and when a change affects what it claims.

## Shared files that need approval

Several teammates, each with their own coding agent, push to one shared `main` branch. Some files affect everyone, so an agent changes them only with the user's approval: `AGENTS.md` and `CLAUDE.md` at any level, `docs/event/`, `reference/`, `.agents/skills/`, `.mcp.json`, `.codex/config.toml`, `.gitignore`, and root package, workspace, lint, format and type-check config once they exist. Lockfiles are the exception, because they change whenever someone adds a dependency. Major version upgrades also need approval, and any version pin is recorded with its reason.

## Changes you didn't make

A teammate may run several agent sessions in parallel in one checkout, so a change this session didn't make is not necessarily another teammate's.

- Call an uncommitted change you didn't make "from another session", unless something shows who made it. Teammates work in their own clones, so their uncommitted work never appears in yours.
- Attribute a commit by its author. A commit authored under the user's Git identity is the user's own, made from another of their sessions. Call a change a teammate's only when a different person authored it.

## Suggesting a fresh thread

- Suggest starting a new agent thread, once and in one line at the end of a reply, when the next request builds on nothing found or decided in this one, or when most of the context is exploration or abandoned approaches that the next step doesn't need.
- Don't suggest it when the next step depends on what this thread established. Re-deriving that context costs more than a long history.
- When suggesting it, give a brief of two or three lines to paste into the new thread: the goal, the relevant files, and the decisions already made.

## Running Git

- The agent shell has no terminal, so a Git command that falls back to reading stdin waits until it times out. Always give `git shortlog` a revision, as in `git shortlog -sne HEAD`, and add `</dev/null` to any other command that might wait for input.

## Committing

- Start every task with `git pull --rebase --autostash`, so you work on teammates' latest pushes.
- Commit after each working change, without asking, under the user's Git identity. Commits carry no agent attribution.
- Messages are a single short subject line describing what was done, such as "Add pledge form validation", matching earlier commits.
- Before each commit, run the checks for the parts you changed, listed in `web/AGENTS.md` and `tools/AGENTS.md`, and fix any failure.
- Stage only the files you changed, by path. Never use `git add -A` or `git add .`, because the user's other sessions may have uncommitted files in the same tree.

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

- Never print or disclose secret values; check only whether a key exists. Never open `.env` files; only `.env.example` may be read.
- Avoid type, lint and framework suppression directives. An unavoidable one comes with an explanation.
- Comments describe the code as it stands, and appear only for non-obvious rationale, constraints or gotchas.
