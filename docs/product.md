# Product

## What it is

The audience heatmap shows a startup where in a city its target customers live, work and pass through, and where its competitors aren't already advertising to them. A startup fills in a short form about its product, customer, budget and markets. It gets back a map of the city with three layers: audience fit, competition, and the gap between them, with the gap shown by default. The run ends with specific placements to buy inside the strongest gap areas, such as LinkNYC kiosks and bus shelters, each with an estimated cost per audience member and a way to measure results. The demo city is New York.

It is for startups that want customers beyond Meta and Google but have no media agency and a limited budget.

Three things set it apart from audience-mapping products and outdoor ad marketplaces:

- It maps one startup's target customer, described in a sentence, rather than a fixed set of audience segments.
- It shows where competitors already advertise, found by a browser agent that searches for their outdoor campaigns, and points to the areas they leave alone.
- It ends with placements a startup can buy in those areas, not just a map.

## Decisions

Every decision the user makes or confirms, including ones reported from teammates: who the product serves, data sources, methods or models, the stack, how parts connect, and the demo scope. Track and challenge priorities are recorded in `AGENTS.md`, not here. One line each: the decision, the reason, and the date. A changed decision is updated in place, so this section always describes the current plan.

- Product idea: the audience heatmap, which maps where a startup's target customers live, work and pass through in a city and where competitors leave them unreached; details in `ideas/audience-heatmap.md`. It replaces the ad channel mispricing finder (`ideas/ad-channel-mispricing.md`), keeping its onboarding form, because public data about people and places is far richer than published prices for advertising placements. 2026-11-07.
- Web app: Next.js 16 (App Router, TypeScript, Tailwind CSS 4, ESLint) managed with pnpm, in the `web/` folder rather than the repo root. The repo root stays for docs and agent config, and a second service such as a Python API can sit beside `web/` later. 2026-11-07.
- Frontend UI: shadcn/ui components styled with Tailwind CSS v4. 2026-11-07.
- LLM calls and AI agents: Vercel AI SDK in the web app, and Pydantic AI in the Python scripts in `tools/`, including the competitor-campaign agent. Results are computed ahead of time in Python, so the agents that produce them run there. 2026-11-07.
- The onboarding form asks for industry, a one-sentence description, a one-sentence target customer, what a customer pays, monthly advertising budget, and markets. It does not ask B2B or B2C, which the target customer covers. Budget filters out placements with minimum spends, and what a customer pays stands in for lifetime value in the audience weighting because it is easier to answer. 2026-11-07.
- Demo city: New York, because it publishes the most detailed public data on residents, workers, trips and advertising locations. The method is meant to work in any city with similar data. 2026-11-07.
- The output is one map with three layers: audience fit (where the target customers live, work and pass through), competition (where competitors already advertise), and the gap (high audience fit with low competition). The gap layer is the default view and the other two are toggles that explain it. Two separate heatmaps would leave the viewer to find the gap themselves. 2026-11-07.
- The competition layer comes from a browser agent that searches press, trade sites and social media for competitors' outdoor campaigns in the city, such as "<competitor> subway ad". Where it finds nothing, competitors' stores and offices stand in. No public source lists where a company's outdoor ads run, and this is the only source that measures actual campaigns. 2026-11-07.
- Each run ends with specific placements to buy inside the strongest gap areas, such as LinkNYC kiosks and bus shelters, each with an estimated cost per audience member. A map alone is something audience-mapping products already offer, and a placement is something a startup can act on. 2026-11-07.
- Every recommendation comes with a way to measure it, such as a QR code, promo code or landing page, because marketers avoid channels they can't measure. 2026-11-07.
- Superseded on 2026-11-07 by the pivot to the audience heatmap, which leaves out airports: Demo scope: confirm the Revolut airport mispricing with real data, by checking the source's figures (cost per thousand impressions and per thousand attentive seconds against Meta, and the breakeven attention) against published prices, audience counts and attention studies. The source's model rests on assumptions, so the aim is to test them. 2026-11-07.
- Results are computed ahead of time for a few prepared startups and the web app reads them; a form typed in at the demo can't be run live. Judging is a demo the team drives, so prepared startups are enough, and they avoid running Python behind the web app. 2026-11-07.
- The Python scripts are one library module per data source, each with a `load()` that returns its data and downloads it first only if nothing is cached, plus one analysis entry point that imports them, combines them for a startup and writes the result. Caching makes reruns fast and lets the demo work offline. 2026-11-07.
- New York data is gathered ahead of time with scripts in `tools/`. A recorded run of the full pipeline is kept as a fallback for the demo, because live browser agents fail on cookie banners, PDFs and slow sites. 2026-11-07.
