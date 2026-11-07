# Ad channel mispricing finder

Status: proposed, 7 November 2026.

## Idea

A startup describes its product and audience. An agent finds advertising channels where the price is low compared with the attention they deliver, such as airport screens, rail stations, student unions, niche newsletters and podcasts. It ranks them by effective cost per relevant impression and drafts or sends outreach to the vendors.

## Origin

Brainstormed on 7 November 2026. Revolut recently started advertising in airports, which the team believes is very cheap. Airports may not realise the mispricing and could raise prices. The tool would find cases like this for any startup marketing a product.

## Tracks it could serve

- Wordsmith: strong. Finding vendors, reading rate cards, filling quote forms and sending enquiries is a long browser workflow.
- G-Research: strong. The hidden thing is an underpriced channel; the project shows how it was found and what to do about it.
- HRT: moderate, if framed as predicting a fair price. Weaker than the prediction-market idea.
- Bank of Scotland: weak.

## Challenges it could use

- Gemini API: reasoning over messy rate cards.
- ElevenLabs: voice outreach calls.
- Tiger Data: ad price history.

## Open problems

- The Revolut premise is unverified. Check that airport ads are cheap, and that it was a deliberate choice, before pitching it.
- "Cheap" needs a benchmark: price against audience size, dwell time and audience fit, for example cost per thousand relevant views.
- Ad prices are mostly negotiated and not public. In 24 hours the dataset is likely small and partly hand-built, plus some live scraping of public rate cards, passenger statistics and newsletter subscriber counts.
- The edge decays once many startups use it.
- Does the demo agent contact vendors, or stop at the ranked list?

## Scope

One vertical, such as UK out-of-home or newsletters and podcasts, instead of all channels. Demo one startup end to end: product description, ranked channels, then a sent enquiry.

## Alternatives

- [Prediction-market mispricing](prediction-market-mispricing.md): a better fit for HRT and G-Research and easier to backtest, but finance-flavoured with no Bank of Scotland fit. This idea fits Wordsmith strongly, but its data is weaker; the prediction-market idea's Wordsmith fit hasn't been assessed.
