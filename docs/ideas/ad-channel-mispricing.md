# Ad channel mispricing finder

Status: chosen, 7 November 2026.

## Idea

Mispricings like Revolut's airport ads hide in plain sight. Many startups compete for the same few ad channels, which keeps those prices high, while other places where the same audience pays attention go unconsidered. The product is discovery, not ranking a fixed list of known channels.

A startup describes its product and audience. An agent asks where that audience's attention sits that nobody in the category is buying, such as airport jet bridges, rail stations, student unions, niche newsletters and podcasts. It finds a real price and contact for each candidate, compares it with the crowded channels by effective cost per attentive second weighted by how valuable the audience is, and drafts or sends outreach to the vendors.

The metric matters. The source in Evidence and data shows that airport ads are not cheap per impression, so a ranking by cost per thousand impressions would miss the gap. The gap appears only when price is measured per second of attention and per type of customer reached. Cost per thousand attentive seconds is Lumen Research's existing metric, not ours; the audience-value weighting and the use of the metric to find channels for one startup are the parts this idea adds.

## Origin

One of Daniel's three ideas, raised on 7 November 2026 and prompted by Revolut's airport advertising. It was first taken to mean airports charge too little and should raise prices. A newsletter found later that day, described in Evidence and data, gives a different reading, and the rest of this file follows it.

## How it works

A candidate design, proposed by an agent on 7 November 2026 and not yet decided:

1. Input: the startup's product, target customer and roughly what a customer is worth to it. The audience weighting needs the last of these.
2. Candidates: an LLM proposes places where that audience's attention sits, within one vertical, such as UK and European out-of-home, or newsletters and podcasts.
3. Gap filter: each candidate must name a reason its gap survives, or it is rejected with the reason shown (see below).
4. Verification: a browser agent looks for a real rate card, media kit or contact for each survivor. A candidate without one is marked unverified.
5. Pricing: each verified channel shows cost per thousand impressions beside cost per thousand attentive seconds weighted by audience value, both against a Meta baseline. The attention seconds are assumptions, so they appear as sliders with the breakeven point marked.
6. Outreach: the agent drafts the enquiry or fills the vendor's quote form.

The gap filter is adapted from "What Is A Mispricing?", Mispriced #006, 26 October 2026 (an investing article; the mapping to ads is ours, not the author's). The author names four reasons a gap survives, shown here with the channel version:

- Information: rate cards and attention data are scattered or unpublished.
- Constraints: minimum spends, agency-only buying, or inventory too small for big buyers.
- Behaviour: marketers anchor to Meta and Google because they are measurable.
- Transformation: the buyer changes the channel's worth, for example a QR code or promo code that makes it measurable.

A candidate with no reason is probably fairly priced and gets rejected, with the reason shown. Rejecting quickly is the point: the author says most candidates turn out fairly priced. The cause could also be tagged to guess how long a gap lasts, since an information gap closes as more people use the tool (our inference).

## Evidence and data

Source: "The Jet Bridge Arbitrage", Mispriced #007, by Alexander Branford, 4 November 2026. It models Revolut's airport spend and quotes Nik Storonsky on David Senra's podcast (25 October 2026) and Antoine Le Nel, Revolut's Chief Growth and Marketing Officer, on 20VC (18 October 2024). The author has no access to Revolut's books; every modelled figure is indicative and rests on his stated assumptions.

What the source says:

- Storonsky calls airport ads an "arbitrage to performance marketing". Once Revolut became a bank, trust became the product. Physical spaces also produce impressions, which he says cost much less than digital ones.
- On raw impressions, airports lose. The model puts Berlin Brandenburg (BER) jet-bridge inventory at £14.24 per thousand impressions against Meta's UK median of £13.02, about 9% dearer.
- Per thousand attentive seconds, airports win: £3.56 against Meta's £9.89, 2.78 times cheaper. This assumes four seconds of attention on a jet bridge against about 1.3 seconds for a median Meta ad.
- Breakeven is 1.44 seconds of jet-bridge attention. Below that Meta is cheaper; at six seconds the airport is 4.17 times cheaper.
- Audience quality is the second gap. Frequent flyers are disproportionately high-income, spend abroad and pay for premium plans. Full Fact reads a 2014 survey as 15% of adults taking about 70% of flights. A CAA Heathrow survey (2019) puts the mean personal income of business passengers at about £93,000. Le Nel: "you're not here to get the cheapest users, you're here to get the best users."
- Revolut ties sign-ups to the channel with card vending machines next to the jet-bridge ads. It has said seven machines handed out more than 300,000 cards in a year.
- Scale: Storonsky says close to half of Europe's airports. Public reports say roughly 14 to 18 airports and over 300 jet bridges.

Data the product needs:

- Prices: BER publishes its rate card, which makes it a usable worked example. Most airports don't publish prices.
- Attention and audience benchmarks exist from Lumen Research, JCDecaux with Lumen and Tobii, and CAA passenger surveys. Access within 24 hours is unchecked.

Other sources found in a web search on 7 November 2026:

- A WARC article built on Lumen and TVision data showed channel rankings change sharply when cost is measured per attentive second.
- AdExchanger reports that ad prices often don't track attention, and that early buyers are already taking high-attention inventory before prices rise. That supports the gap and the crowding risk in Open problems.

## Existing products

A web search on 7 November 2026 found products covering each step separately, but none that combines them. None looks for channels nobody in the category buys, checks each against a real rate card, ranks by attention weighted by audience value, and contacts the vendor. Most sources are vendors' own sites, and no product was tried. Judges may know AdQuick and Stroby, so the pitch should say how this differs from them.

- AI media planners, such as Basis, Akkio, ad:personam, The Media Ant's Ant10 and The Trade Desk's planner, turn a brief into a channel mix and budget split. They choose among channels they already know and can buy, and don't check rate cards.
- AI ad agents, such as Uplane, Smartly.io and Adside.ai, move budget between Meta, Google, LinkedIn, Reddit and X. They work only inside the crowded channels.
- Self-serve out-of-home marketplaces sell only the inventory media owners list with them, priced per impression or per day. AdQuick reports 3 million+ digital screens and 1,700+ media owners, and offers lookalike audience modelling. Others are CAASie, Blip (2.1 out of 5 from 6 reviews on G2), adyoutiser (Vienna and Bratislava, from €2 a day), Azerion (self-serve for small businesses in Europe, launched June 2026) and Bidooh (UK, last covered 2018).
- Newsletter sponsorship marketplaces: Paved (a reported 30% commission, at least 5,000 subscribers), Passionfroot (booking tools for sellers), and the AI matchers Stroby, Lessie and Adsloty. Stroby pairs brands with newsletters by audience, niche and budget, the closest match to the discovery step, but only for newsletters and with no independent coverage found.
- Attention measurement firms Lumen, TVision and Adelaide sell measurement to large advertisers and agencies, not channel discovery to startups.
- Not covered by the search: Displayce, Hivestack, Podscribe, and UK out-of-home agencies that use AI.

## Tracks it could serve

- Wordsmith: strong. Finding vendors, reading rate cards, filling quote forms and sending enquiries is a long browser workflow. Judged on workflow complexity, so a long end-to-end flow helps; the verification step (find the real rate card, contact the vendor) adds depth.
- G-Research: strong. The hidden thing is the channel itself, plus its price per attentive second and the value of the audience it reaches, neither of which its rate card shows. The project shows how it is found and what to do with it, which matches the track's three questions.
- HRT: moderate, if framed as predicting a fair price from attention and audience data. Weaker than the prediction-market idea.
- Bank of Scotland: weak.

## Challenges it could use

- Gemini API: reading messy rate cards and reasoning over attention and audience data.
- ElevenLabs: voice outreach calls.
- Tiger Data: ad price history.

## Open problems

- The premise is sourced but not proven. The only evidence is one newsletter's model. The jet-bridge attention figure of four seconds is an assumption, since the author says no eye-tracking study exists for jet bridges. He anchored it to Heathrow out-of-home research. The result holds only above 1.44 seconds.
- "Airports don't realise the mispricing and should hike prices" is not supported. Airports price per impression and the buyer prices per attention and customer value. The source doesn't show airports are underpriced, only that the channel is good value for a buyer who values attention. The seller-side pitch should be dropped or reworded.
- Cheap impressions are not cheap customers. Ranking by cost per attentive second still needs an audience-value term, which needs the startup's own customer value and a way to estimate who passes through a channel.
- Data availability: most airports don't publish prices, and access to the attention and audience benchmarks in 24 hours is unchecked.
- Revolut's scale is reported inconsistently (see Evidence and data).
- Verification: an agent proposing non-obvious channels will invent plausible ones that don't exist or have no price. Each candidate needs a step that finds a real rate card or a real contact, or the product is only an idea generator.
- Crowding: if many startups use the tool they all find the same hidden channel, and it stops being hidden. The tool needs a way to spread demand, or the edge decays and that is accepted.
- Does the demo agent contact vendors, or stop at the ranked list?

## Scope

One vertical, such as UK and European out-of-home or newsletters and podcasts, instead of all channels. Demo one startup end to end: product description, ranked channels, then a sent enquiry.

A natural first channel is a reproduction of the BER jet-bridge calculation from the source: rate card, production and installation, currency conversion and negotiated discount, down to cost per thousand attentive seconds against Meta. Showing the impression-versus-attention flip is the demo's strongest moment.

## Alternatives

- [Prediction-market mispricing](prediction-market-mispricing.md): a better fit for HRT and G-Research and easier to backtest, but finance-flavoured with no Bank of Scotland fit. This idea fits Wordsmith strongly, but its data is weaker; the prediction-market idea's Wordsmith fit hasn't been assessed.
- [Off-peak venue hire](off-peak-venue-hire.md): the same pattern of sellers pricing by habit, in venues and event space. It could share one mispricing engine with this idea.

Source article: [The Jet Bridge Arbitrage, Mispriced #007](https://mispriced1.beehiiv.com/p/the-jet-bridge-arbitrage-mispriced-007)

Existing products found on 7 November 2026: [AdQuick](https://www.adquick.com/blog/introducing-self-service-programmatic-dooh/), [AdQuick lookalike modelling](https://www.adexchanger.com/omnichannel-2/adquick-launches-look-alike-modeling-for-outdoor-advertising/), [Stroby](https://stroby.vercel.app/blog/newsletter-cpm-benchmarks-2026), [Paved](https://www.emailtooltester.com/en/blog/paved-newsletter-sponsorship-marketplace/), [Lumen attentive seconds](https://manual.eskimi.com/books/3rd-party-tracking/page/the-attention-funnel-explained), [WARC on the cost of attention](https://srh.agency/assets/documents/The-true-cost-of-advertising-attention-_-WARC.pdf), [AdExchanger on attention-based inventory](https://adexchanger.com/programmatic/early-adopters-are-snapping-up-attention-based-inventory-before-everyone-else-drives-up-the-costs), [AI media planners](https://basis.com/insights/benefits-of-ai-powered-media-planning-tools-for-agencies), [AI ad agents](https://kite.ai/blog/best-ai-marketing-agents-for-startups), [Azerion](https://www.exchangewire.com/blog/2026/06/16/azerions-new-self-service-platform-brings-omnichannel-advertising-to-smbs/).
