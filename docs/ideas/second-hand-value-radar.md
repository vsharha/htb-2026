# Second-hand value radar: listings priced below their sold price

Status: proposed, 7 November 2026.

## Idea

A person gives a category and a budget, such as "a road bike under £500" or "a desk in Edinburgh". An agent watches second-hand marketplaces and estimates what each item actually sells for, from sold and completed listings rather than from what sellers are asking. It flags the listings priced below that, says by how much, and explains what it can see about condition from the photos and description. It then messages the seller, asks the questions that matter, and negotiates.

The output is a ranked list of live listings with a "hidden value" figure, plus an opened conversation with the best one. It is for people buying used goods who do not want to spend hours working out what a fair price is.

## Origin

Raised by an AI agent on 7 November 2026, in a brainstorm at macmac's request, after the user ruled out career prizes and asked for ideas that fit the sponsor tracks better than the first ten. The market was checked on 7 November 2026; the other facts are unchecked.

## Existing products

- Photo-to-sold-price is a crowded micro-SaaS category. **Underpriced AI** (claims 6,000+ resellers), **FlipTip AI**, **TRUSS** (enterprise pricing API), **Circulaire**, **NestLedger**, **PriceSnap**, **Flipit** and **finna** all estimate an item's value from real sold listings. ([Underpriced AI](https://underpricedai.com/), [TRUSS](https://truss.fashion/))
- Older incumbents do the same for narrower categories: **Terapeak** (eBay's own sold-data tool), **WorthPoint**, **PriceCharting** and **Keepa**.
- Hackathons: **KLARITY** won at TAMU Datathon 2021 with "a market price to correctly judge the value of second hand goods", which is this idea's valuation half almost word for word. A **Tech@NYU Buildathon** project goes further, from a photo to a value to AI voice calls that negotiate with buyers, and **Bloom** is another resale-value scanner. ([KLARITY](https://tamudatathon2021.devpost.com/project-gallery), [Tech@NYU](https://sw26.devpost.com/project-gallery), [Bloom](https://devpost.com/software/bloom-yhvz34))

What is left is the monitoring and negotiation loop, not the valuation. That is also the part that needs marketplace accounts and breaks the platforms' terms, so it is the hardest to demo and the easiest to block. The idea would compete on execution in a niche that already has many paid products, with no answer to why a judge should prefer it to a phone app that does the same scan.

## Tracks it could serve

- Wordsmith: strong. Finding candidates, reading listings and photos, comparing them with sold history, messaging sellers and negotiating is a long, branching browser workflow with a human in the loop. It is not a single scrape, which is what Wordsmith marks down.
- G-Research: strong. The hidden thing is which listings are underpriced and by how much. It is found by comparing asking prices with what items actually sold for, and it lets a buyer save money and keep goods in use. "Invisible value" is close to the brief's own examples.
- HRT: moderate. There is real market data, meaning listings and sold prices, plus alternative inputs such as photos and text, feeding a fair-value model that is tested against completed sales. The track asks for massive scale and real-time streams, and this is neither, so it is not a strong fit.
- Bank of Scotland: moderate. Buying used saves money and avoids waste, so it covers cost and sustainability at once, but it is a smaller part of a household's budget than rent, energy or benefits.

## Challenges it could use

- Gemini API: reading listing text and photos, and estimating condition and fair value.
- Tiger Data: price and sold-history time series per category.
- Vultr: hosting the model and the demo.
- Auth0: saving a buyer's watchlist and conversations.

## Open problems

These are unchecked, apart from the market check above.

- Access is the main risk. eBay, Facebook Marketplace and Gumtree all defend against automation, and Facebook requires a login. eBay's public sold-listings data has been restricted over time. If sold prices cannot be read reliably, the fair-value half of the product does not exist.
- Messaging sellers from a hacked-together agent is likely against the platforms' terms and may look like spam. The demo may have to stop at a drafted message.
- Condition is the whole game and photos under-report it. A model that ignores condition will flag damaged items as bargains.
- The HRT fit is real but modest, so this idea is competing for a prize it is unlikely to win.
- The demo depends on a good listing existing at the moment of judging, which is the same fragility as [Flat Truth](flat-truth.md).

## Scope

Pick one category, such as road bikes in Edinburgh. Live panes open the marketplaces and a sold-history page. The result shows five live listings with asking price, estimated sold price and the gap, then opens a conversation with the best one and drafts the questions to ask. End on "asking £380, sold price £610" and the saved amount.

## Alternatives

- [Flat Truth](flat-truth.md): a hidden-fact product with a more reliable data source and a more relatable demo.
- [Fine Print](fine-print.md): real market data and a tested prediction, so a better HRT fit, but no Bank of Scotland angle.
- [Shelf Truth](shelf-truth.md): also about prices that mislead, but for groceries, and it depends on supermarket sites that block bots.
