# Product

## What it is

The ad channel mispricing finder tells a startup where to advertise to reach its customers for less than the channels its competitors crowd into. A startup fills in a short form about its product, customer, budget and markets. It gets back a ranked list of specific placements, such as a particular airport's jet bridges, a students' union's media pack or a niche newsletter. Each comes with a real price and contact, a cost comparison against Meta, a way to measure results, and a drafted enquiry to the seller.

It is for startups that want customers beyond Meta and Google but have no media agency and a limited budget.

Three things set it apart from AI media planners and ad marketplaces:

- It discovers placements for each startup instead of choosing from a fixed catalogue, and it leaves out channels the startup's competitors already buy.
- It ranks placements by cost per thousand attentive seconds weighted by audience value, not by cost per thousand impressions. The source behind the idea shows the ranking flips: Berlin Brandenburg's jet bridges are about 9% dearer than Meta per impression but 2.78 times cheaper per attentive second, assuming four seconds of attention.
- It checks every placement against a real rate card or contact, and marks it unverified when it can't find one.

## Decisions

Every decision the user makes or confirms, including ones reported from teammates: who the product serves, data sources, methods or models, the stack, how parts connect, and the demo scope. Track and challenge priorities are recorded in `AGENTS.md`, not here. One line each: the decision, the reason, and the date. A changed decision is updated in place, so this section always describes the current plan.

- Product idea: the ad channel mispricing finder, which finds advertising channels that are underpriced for the attention and audience they deliver; details in `ideas/ad-channel-mispricing.md`. The user chose it over the other brainstormed ideas. 2026-11-07.
- Web app: Next.js 16 (App Router, TypeScript, Tailwind CSS 4, ESLint) managed with pnpm, in the `web/` folder rather than the repo root. The repo root stays for docs and agent config, and a second service such as a Python API can sit beside `web/` later. 2026-11-07.
- Frontend UI: shadcn/ui components styled with Tailwind CSS v4. 2026-11-07.
- LLM calls and AI agents: Vercel AI SDK. 2026-11-07.
- Recommend specific placements, such as Hamburg Airport's jet bridges, not mediums such as "airports". Per impression, airports as a medium are no cheaper than Meta (BER's jet bridges cost £14.24 per thousand against Meta's £13.02), so any underpricing is in individual placements, and a placement is something a startup can actually buy. 2026-11-07.
- The pipeline has six steps: crowded-channel check, candidates, gap filter, verification by per-medium agents, pricing, then report and outreach. Details in `plan/architecture-sketch.md`. 2026-11-07.
- Per-medium expert agents, such as an airport agent or a student union agent, verify candidates rather than propose them. Each medium is sold differently, and without a check the model invents plausible channels that don't exist or have no price. 2026-11-07.
- Placements are ranked by cost per thousand attentive seconds, weighted by audience value, against a Meta baseline, shown beside cost per thousand impressions. Attention seconds and the Meta price are sliders with the breakeven point marked, because no attention data exists for most placements. 2026-11-07.
- A channel counts as crowded if competitors advertise there, found through ad transparency libraries such as Meta's Ad Library and Google's Ads Transparency Center, or if we have already recommended it to another client in the same category. Recommending what similar startups use would send every client to the channels where competition has already raised prices. 2026-11-07.
- The onboarding form asks for industry, a one-sentence description, a one-sentence target customer, what a customer pays, monthly advertising budget, and markets. It does not ask B2B or B2C, which the target customer covers. Budget filters out placements with minimum spends, and what a customer pays stands in for lifetime value in the audience weighting because it is easier to answer. 2026-11-07.
- Every recommendation comes with a way to measure it, such as a QR code, promo code or landing page, because marketers avoid channels they can't measure. 2026-11-07.
- Data for one group of channels is gathered ahead of time with scripts in `tools/`, and the live agents add to it. A recorded run of the full pipeline is kept as a fallback for the demo, because live browser agents fail on cookie banners, PDFs and slow sites. 2026-11-07.
