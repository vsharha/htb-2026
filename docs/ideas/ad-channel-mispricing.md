# Ad channel mispricing finder

Status: chosen, 7 November 2026.

## Idea

Mispricings like Revolut's airport ads hide in plain sight. Many startups compete for the same few ad channels, which keeps those prices high, while other places where the same audience pays attention go unconsidered. The product is discovery, not ranking a fixed list of known channels.

A startup describes its product and audience. An agent asks where that audience's attention sits that nobody in the category is buying. The first group of channels is UK and EU airports; rail stations, students' unions, newsletters and podcasts can follow. For each candidate placement the agent finds a published or estimated price and a contact. It compares the placement with the crowded channels by effective cost per attentive second, weighted by how valuable the audience is, and drafts or sends outreach to the vendors.

The metric matters. The source in Evidence and data shows that airport ads are not cheap per impression, so a ranking by cost per thousand impressions would miss the gap. The gap appears only when price is measured per second of attention and per type of customer reached. Cost per thousand attentive seconds is Lumen Research's existing metric, not ours; the audience-value weighting and the use of the metric to find channels for one startup are the parts this idea adds.

## Origin

One of Daniel's three ideas, raised on 7 November 2026 and prompted by Revolut's airport advertising. It was first taken to mean airports charge too little and should raise prices. A newsletter found later that day, described in Evidence and data, gives a different reading, and the rest of this file follows it.

## How it works

Decided on 7 November 2026; the decisions are in [product.md](../product.md) and the step-by-step design in [the architecture sketch](../plan/architecture-sketch.md). The product recommends specific placements, such as Hamburg Airport's jet bridges, not mediums such as "airports", because per impression airports as a medium are no cheaper than Meta.

1. Input: a short form with industry, the startup in one sentence, the target customer in one sentence, what a customer pays, monthly advertising budget, and markets. The audience weighting uses what a customer pays; the budget filters out placements with minimum spends.
2. Crowded channels: an agent finds the startup's competitors and searches the web and press for their airport advertising, since Meta's Ad Library and Google's Ads Transparency Center cover only online ads. Placements already recommended to other clients in the same category also count as crowded.
3. Candidates: an orchestrator agent proposes specific airport placements where the target customer's attention sits, such as jet bridges, baggage reclaim, security trays, lounges and Wi-Fi login pages. It leaves out crowded placements and anything over budget. Airports are ranked by how well their passengers match the target customer, judged from the mix of routes and airlines, so a fintech for business travellers and a travel app for students get different airports.
4. Gap filter: each candidate must name a reason its gap survives, or it is rejected with the reason shown (see below).
5. Verification: the orchestrator sends each survivor to the airport agent, which knows how airports sell advertising. Further agents, such as a student union agent, can be added for other media. The agent finds a rate card, media kit or contact. Where the price is "on request", the placement gets an estimated price, labelled as one: Hamburg Airport's published jet-bridge rate per passenger, scaled by the airport's passengers and route mix.
6. Pricing: each placement shows cost per thousand impressions beside cost per thousand attentive seconds weighted by audience value, both against a Meta baseline. Impressions come from published passenger counts, and the audience weight from the airport's route and airline mix. The attention seconds are assumptions, so they appear as sliders with the breakeven point marked.
7. Report and outreach: the orchestrator ranks the placements, adds a way to measure each one (a QR code, promo code or landing page), and drafts the enquiry or fills the vendor's quote form. For a placement with an estimated price, the enquiry is how a real quote is obtained.

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

Data the product needs, by market. Checked on 7 November 2026. "Opened" means we read the file; "from search" means only the search result was read, so access and terms are unconfirmed.

Airports:

- Price: the source's claim that BER publishes a jet-bridge rate card is not supported. The BER 2027 media kit (opened, 103 pages, [web page](https://werbung.berlin-airport.de/en/advertising/specials0/fluggastbruecken.html)) lists 27 jet bridges with a 2-year minimum booking and "media: on request". It does publish prices for other formats.
- Price: Hamburg Airport publishes one ([jet bridge sheet](https://hamburg-airport.de/resource/blob/83948/7d01824222a4048df7df072d35636f8c/jet-bridges-data.pdf), opened): €33,000 a month net for 16 jet bridges (32 double-sided XXL spaces), plus VAT, production and installation. The sheet is dated September 2024 with a term to 31 March 2025, so the price is probably out of date.
- Audience: the same Hamburg sheet gives 13.6 million passengers in 2024, average age 42, 47.2% with a household income over €4,000 net, and an average stay of 116 minutes.
- Audience: CAA UK airport data, [2025 annual tables](https://www.caa.co.uk/data-and-analysis/uk-aviation-market/airports/uk-airport-data/uk-airport-data-2025/annual-2025/) (CSV and PDF; the CAA asks to be credited). Table 09 gives passengers per UK airport for 2025 and 2024. It has volumes only, no income.
- Audience: EU passenger counts per airport are published by Eurostat (from memory, not checked).
- Audience mix: flight data shows each airport's routes and airlines, which indicate its passengers' type (business against leisure, full-service against low-cost). Possible sources, none checked: OpenSky Network, built from ADS-B aircraft position broadcasts, has an arrivals and departures endpoint per airport and is free for research and non-commercial use. Flightradar24's terms prohibit scraping, and its official API is a paid subscription with tiers not checked. Commercial schedule data with seat counts comes from providers such as OAG and Cirium. ADS-B data usually lacks the gate; airport departure boards list it.
- Rough price estimates: [AdQuick's jet bridge guide](https://adquick.com/answers/airport-jet-bridge-advertising) (from search) gives $3,500 to $7,000 a month per bridge at Bogotá. Not comparable with Hamburg or BER.

Rail stations:

- Price: none found.
- Audience: ORR [estimates of station usage](https://dataportal.orr.gov.uk/station-usage) (from search): entries, exits and interchanges by station in Table 1410, and a time series from 1997 in Table 1415, in ODS format. The latest release covers April 2024 to March 2025; the next is due in November 2026.

Student unions:

- Price and audience: UK students' unions publish media packs with prices and audience sizes (from search): [Manchester Met 2026-27](https://www.theunionmmu.org/resources/media-pack-2026-27/download_attachment), [Reading 2025-26](https://issuu.com/rusudocs/docs/media_pack_2025-26), [Bucks 2025-26](https://www.bucksstudentsunion.org/pageassets/advertise/Bucks-Students-Union-media-pack-2025-26.pdf), [Cardiff](https://www.cardiffstudents.com/pageassets/about-cusu/advertising/Media-Pack-2023-2024(1).pdf), [Leeds](https://issuu.com/leedsuniunion/docs/general_media_pack), [Strathclyde](https://www.strathunion.com/pageassets/union/advertise/Strath_Union_Media_Pack_Native_2022_23.pdf) and [Derby](https://www.derbyunion.co.uk/pageassets/marketing/media-pack-2023.pdf). Examples: Leeds lists 32,000 students and a £2,000 newspaper wrap-around. Several packs are old, and VAT treatment varies. There is no single list.

Newsletters:

- Price and audience (all from search): the [Paved marketplace](https://www.paved.com/publishers/marketplace) and its [note on where prices show](https://help.paved.com/article/102-where-is-the-price-for-a-sponsorship-with-a-particular-newsletter), a [2026 directory of newsletters that accept sponsors](https://www.lilachbullock.com/newsletters-that-accept-sponsors-directory-2026/) and a [platform comparison](https://dupple.com/learn/best-newsletter-advertising-platforms). Sources report Paved with 3,000+ newsletters and primary sponsorships at $15 to $30 per thousand; direct placements run from about $50 to several thousand dollars a send. These are vendor and blog figures. Swapstack's status is unclear.

Podcasts:

- Price: [AdvertiseCast monthly rates](https://rainnews.com/advertisecast-podcast-ad-rates-february-2024/) (from search), averages from actual sales across 1,500+ shows, with history to 2020. Also [UK podcast CPMs for 2026](https://playpodcasts.com/blog/price-per-ear-british-podcast-advertising-cpm-2026) and [CPM by genre and size](https://www.millionpodcasts.com/blog/podcast-advertising-cost-cpm-rates-by-genre-size/); the second describes its ranges as directional estimates.
- Audience: [Rephonic](https://rephonic.com/blog/podcast-ad-rates/amp/) estimates listeners per episode (vendor estimates, free trial). Listen Notes' free tier is unconfirmed.

Meta baseline (all markets):

- The source's UK median of £13.02 was not reproduced. Vendor blogs give a UK average of about $10.85 (roughly £8.55), or £6 to £12 for link ads and £8 to £16 for lead-gen or video ([Photonpay](https://www.photonpay.com/uk/blog/article/facebook-advertising-costs), [Influee](https://influee.co/gb/blog/good-cpm-facebook-ads)). They disagree, so the baseline should be an adjustable range.

Attention (all markets):

- No public jet-bridge attention data was found. Lumen Research and JCDecaux with Lumen and Tobii figures are only quoted in articles, so attention stays a slider.

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
- Cheap impressions are not cheap customers. Ranking by cost per attentive second still needs an audience-value term. The form's "what a customer pays" gives the startup's side. Who passes through an airport is estimated from its route and airline mix, but how to turn that mix into a weight is untested, and which flight data source to use is undecided.
- Volume per jet bridge needs flights per gate. Gate data comes only from departure boards, and whether any can be scraped is unchecked.
- Data availability: jet-bridge prices are mostly "on request", so most prices shown will be estimates scaled from Hamburg's one published sheet, which is dated September 2024. Whether price per passenger carries across airports is untested. Most sources in Evidence and data were read only as search results, so access, scraping terms and licences are unchecked.
- Revolut's scale is reported inconsistently (see Evidence and data).
- Verification: an agent proposing non-obvious placements will invent plausible ones that don't exist or have no price. The airport agent checks that each candidate placement exists and has a rate card or contact. Most prices are unpublished, so many placements will carry an estimated price rather than a published one.
- Crowding: if many startups in one category use the tool, they all find the same placements. Out-of-home inventory is fixed (Hamburg has 16 jet bridges), so the first buyer can lock it up for the term, and sellers raise rate cards when terms end. The tool counts its own past recommendations in a category as crowded, so later clients see different placements. Whether that spreads demand enough is untested, and gaps from unpublished prices close anyway once the tool publishes them.
- Does the demo agent contact vendors, or stop at the ranked list?

## Scope

UK and EU airports only, with their data gathered ahead of time by scripts in `tools/`. Other channel groups are the roadmap: each needs one more agent for its medium. A recorded run is kept as a fallback in case the live agents fail.

The demo runs two startups with different target customers side by side, such as a fintech for business travellers and a travel app for students. Each goes end to end: product description, ranked airport placements, then a sent enquiry. The two rankings differ, which shows the product chooses placements per startup.

The worked example reproduces the source's jet-bridge calculation down to cost per thousand attentive seconds against Meta. BER's price is on request, so Hamburg's published price and audience figures (see Evidence and data) are the usable example. Showing the impression-versus-attention flip is the demo's strongest moment.

## Alternatives

- [Prediction-market mispricing](prediction-market-mispricing.md): a better fit for HRT and G-Research and easier to backtest, but finance-flavoured with no Bank of Scotland fit. This idea fits Wordsmith strongly, but its data is weaker; the prediction-market idea's Wordsmith fit hasn't been assessed.
- [Off-peak venue hire](off-peak-venue-hire.md): the same pattern of sellers pricing by habit, in venues and event space. It could share one mispricing engine with this idea.

Source article: [The Jet Bridge Arbitrage, Mispriced #007](https://mispriced1.beehiiv.com/p/the-jet-bridge-arbitrage-mispriced-007)

Existing products found on 7 November 2026: [AdQuick](https://www.adquick.com/blog/introducing-self-service-programmatic-dooh/), [AdQuick lookalike modelling](https://www.adexchanger.com/omnichannel-2/adquick-launches-look-alike-modeling-for-outdoor-advertising/), [Stroby](https://stroby.vercel.app/blog/newsletter-cpm-benchmarks-2026), [Paved](https://www.emailtooltester.com/en/blog/paved-newsletter-sponsorship-marketplace/), [Lumen attentive seconds](https://manual.eskimi.com/books/3rd-party-tracking/page/the-attention-funnel-explained), [WARC on the cost of attention](https://srh.agency/assets/documents/The-true-cost-of-advertising-attention-_-WARC.pdf), [AdExchanger on attention-based inventory](https://adexchanger.com/programmatic/early-adopters-are-snapping-up-attention-based-inventory-before-everyone-else-drives-up-the-costs), [AI media planners](https://basis.com/insights/benefits-of-ai-powered-media-planning-tools-for-agencies), [AI ad agents](https://kite.ai/blog/best-ai-marketing-agents-for-startups), [Azerion](https://www.exchangewire.com/blog/2026/06/16/azerions-new-self-service-platform-brings-omnichannel-advertising-to-smbs/).
