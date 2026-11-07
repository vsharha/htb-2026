# Off-peak venue and space hire finder

Status: idea only. Not accepted, not in `product.md` Decisions. Brainstormed 7 November 2026.

## Idea

Venues, coworking spaces and event spaces often charge flat prices and leave slots empty. An agent finds the best-value off-peak slots for a startup's event or launch, ranks them by price against capacity, location and fit, and drafts or sends booking enquiries.

It is the same pattern as [ad-channel-mispricing.md](ad-channel-mispricing.md): sellers price by habit rather than demand, and an agent finds the gap.

## Tracks it could serve

- Wordsmith: strong. Finding venues, reading availability and pricing pages, and filling enquiry forms is a long browser workflow.
- G-Research: moderate. The hidden thing is unused capacity and the price gap between peak and off-peak.
- Bank of Scotland: weak to moderate, if framed as cost-saving for small organisations.

## Challenges it could use

- Gemini API: reading messy venue pages and rate cards.
- Tiger Data: availability and price history over time.

## Open problems

- Availability and prices are often behind enquiry forms and not public.
- "Good value" needs a benchmark: price per head, per hour and by day of week, compared with similar venues nearby.
- Edinburgh-only data may be too thin; check how many venues publish prices online.
- The seller-side flip is possible: tell venues what they could charge off-peak.

## Possible shared engine

Ad channels, sponsorship slots and venue hire could share one mispricing engine with a plug-in per market. Open question: whether that spreads a 24-hour build too thin.
