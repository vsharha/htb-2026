# Shelf Truth: shrinkflation and fake "was" prices

Status: proposed, 7 November 2026.

## Idea

A browser agent shops one basket across Tesco, Sainsbury's, Asda and Aldi, recording each product's price, pack size and "was" price over time. It spots shrinkflation, where the pack shrinks and the price stays the same. It flags "was" prices that may break UK rules on misleading pricing. It predicts each product's promotion cycle, such as "wait 9 days, 70% chance of a Clubcard drop", and drafts a Trading Standards complaint with the evidence. It is for shoppers watching their grocery bill.

## Origin

Raised by an AI agent whose angle was covering the most tracks, in a brainstorm on 7 November 2026, at macmac's request. It was not carried into the debate round, so its facts are unchecked. Ranked tenth in [idea-ranking.md](../idea-ranking.md), from the first-round assessment only.

## Tracks it could serve

- Wordsmith: strong. It navigates several retailers, matches products across them and drafts a legal complaint.
- G-Research: strong. A shrinking pack is a textbook invisible change.
- Bank of Scotland: strong. Buy now or wait, and which shop, weighed against the trip.
- HRT: moderate. Price time series and a promotion-cycle forecast.

## Challenges it could use

- Tiger Data: price and pack-size history.
- Gemini API: matching products and drafting complaints.

## Open problems

- Supermarket sites are bot-protected (Akamai on Tesco), so the live demo could fail. This is the biggest risk of any idea.
- Twenty hours can't build our own price history, so we would depend on others' data: ONS grocery price research, Open Food Facts for pack sizes, and trolley.co.uk.
- Matching the same product across retailers is error-prone.
- The pricing rules cited, CMA guidance and the Digital Markets, Competition and Consumers Act 2024, haven't been checked for this use.

## Scope

Pick a product. Its price-per-100g chart steps up while the shelf price stays flat. A "was" price is flagged, and the demo ends on a drafted complaint.

## Alternatives

- [Flat Truth](flat-truth.md): the same strong tracks, using public government data rather than bot-protected shop sites.
