# Web app

The web app is a Next.js 16 project (App Router, TypeScript, Tailwind CSS 4, ESLint), managed with pnpm. Run commands from `web/`:

- `pnpm dev`: dev server on http://localhost:3000
- `pnpm lint` and `pnpm typecheck`: run before each commit
- `pnpm build`: also run before committing a change to config, dependencies, routing, data fetching or server code. Skip it for changes confined to component markup and styling.

Copy `.env.example` to `.env.local` and fill it in before running the app. It lists the AI Gateway key that Jev's audience scoring needs; without it, scoring falls back to keyword matching.

## Next.js version

Next.js 16 has breaking changes from earlier versions in APIs, conventions and file structure, so code written from memory of Next.js 15 or older may not work. Before writing routing, data-fetching, caching or config code, read the relevant guide in `node_modules/next/dist/docs/`, which matches the installed version. Breaking changes from 15 are listed in `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`.

`agentRules: false` in `next.config.ts` stops `next dev` from writing its own block of agent instructions into this file.

## UI

UI components come from shadcn/ui (`base-nova` style, on Base UI). Add one with `pnpm dlx shadcn@latest add <component>` from `web/`; it lands in `src/components/ui/`.

Load the `frontend-design` skill before UI work. It is vendored from Anthropic's `claude-plugins-official` marketplace, under the Apache 2.0 licence in its folder, `.agents/skills/frontend-design/` at the repository root.

## LLM calls

LLM calls and AI agents go through the Vercel AI SDK (`ai` plus a provider package), not a provider's own SDK.

## Checking frontend work

- Check a change to behaviour, data flow or layout on the running dev server with Playwright or a browser before reporting it done: look at the page, use the changed flow, and read the console for errors.
- Skip the browser check for a cosmetic change confined to one component, such as a colour, text, spacing or icon. Say in the reply that it wasn't checked in the browser.
- Before starting a dev server, check whether one is already running, by its process or by probing its port, and reuse it. A change to config, dependencies or env means stopping it and starting a fresh one. Never leave several instances running.
