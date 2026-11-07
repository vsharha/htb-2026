# Product

## What it is

TODO: what the product is, who it is for, and what sets it apart. Written once the team has chosen a direction.

## Decisions

Every decision the user makes or confirms, including ones reported from teammates: who the product serves, data sources, methods or models, the stack, how parts connect, and the demo scope. Track and challenge priorities are recorded in `AGENTS.md`, not here. One line each: the decision, the reason, and the date. A changed decision is updated in place, so this section always describes the current plan.

- Web app: Next.js 16 (App Router, TypeScript, Tailwind CSS 4, ESLint) managed with pnpm, in the `web/` folder rather than the repo root. The repo root stays for docs and agent config, and a second service such as a Python API can sit beside `web/` later. 2026-11-07.
- Frontend UI: shadcn/ui components styled with Tailwind CSS v4. 2026-11-07.
