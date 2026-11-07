# Ad channel mispricing finder

Status: proposed, 7 November 2026.

## Idea

A startup describes its product and audience. An agent finds advertising channels where the price is low compared with the attention and audience value they deliver, such as airport jet bridges, rail stations, student unions, niche newsletters and podcasts. It ranks them by effective cost per attentive second, weighted by how valuable the audience is, and drafts or sends outreach to the vendors.

The metric matters. The source below shows that airport ads are not cheap per impression, so a ranking by cost per thousand impressions would miss the gap. The gap appears only when price is measured per second of attention and per type of customer reached.

## Origin

Raised by the user on 7 November 2026, prompted by Revolut's airport advertising. The user first took it to mean airports charge too little and should raise prices. The newsletter below, found later that day, gives a different reading and is the source for the rest of this file.

Source: "The Jet Bridge Arbitrage", Mispriced #007, by Alexander Branford, 4 November 2026. It models Revolut's airport spend and quotes Nik Storonsky on David Senra's podcast (25 October 2026) and Antoine Le Nel, Revolut's Chief Growth and Marketing Officer, on 20VC (18 October 2024). The author has no access to Revolut's books; every modelled figure is indicative and rests on his stated assumptions.

What the source says:

- Storonsky calls airport ads an "arbitrage to performance marketing". Once Revolut became a bank, trust became the product. Physical spaces also produce impressions, which he says cost much less than digital ones.
- On raw impressions, airports lose. The model puts Berlin Brandenburg (BER) jet-bridge inventory at £14.24 per thousand impressions against Meta's UK median of £13.02, about 9% dearer.
- Per thousand attentive seconds, airports win: £3.56 against Meta's £9.89, 2.78 times cheaper. This assumes four seconds of attention on a jet bridge against about 1.3 seconds for a median Meta ad.
- Breakeven is 1.44 seconds of jet-bridge attention. Below that Meta is cheaper; at six seconds the airport is 4.17 times cheaper.
- Audience quality is the second gap. Frequent flyers are disproportionately high-income, spend abroad and pay for premium plans. Full Fact reads a 2014 survey as 15% of adults taking about 70% of flights. A CAA Heathrow survey (2019) puts the mean personal income of business passengers at about £93,000. Le Nel: "you're not here to get the cheapest users, you're here to get the best users."
- Revolut ties sign-ups to the channel with card vending machines next to the jet-bridge ads. It has said seven machines handed out more than 300,000 cards in a year.
- Scale: Storonsky says close to half of Europe's airports. Public reports say roughly 14 to 18 airports and over 300 jet bridges.

## Tracks it could serve

- Wordsmith: strong. Finding vendors, reading rate cards, filling quote forms and sending enquiries is a long browser workflow. Judged on workflow complexity, so a long end-to-end flow helps.
- G-Research: strong. The hidden thing is now concrete: a channel's price per attentive second and the value of the audience it reaches, neither of which its rate card shows. The project shows how it is found and what to do with it, which matches the track's three questions.
- HRT: moderate, if framed as predicting a fair price from attention and audience data. Weaker than the prediction-market idea.
- Bank of Scotland: weak.

## Challenges it could use

- Gemini API: reading messy rate cards and reasoning over attention and audience data.
- ElevenLabs: voice outreach calls.
- Tiger Data: ad price history.

## Open problems

- The premise is now sourced but not proven. The only evidence is one newsletter's model. The jet-bridge attention figure of four seconds is an assumption, since the author says no eye-tracking study exists for jet bridges. He anchored it to Heathrow out-of-home research. The result holds only above 1.44 seconds.
- "Airports don't realise the mispricing and should hike prices" is not supported. Airports price per impression and the buyer prices per attention and customer value. The source doesn't show airports are underpriced, only that the channel is good value for a buyer who values attention. The seller-side pitch should be dropped or reworded.
- Cheap impressions are not cheap customers. Ranking by cost per attentive second still needs an audience-value term, which needs the startup's own customer value and a way to estimate who passes through a channel.
- Data availability: most airports don't publish prices. BER does, which makes it a usable worked example. Attention and audience benchmarks exist from Lumen Research, JCDecaux with Lumen and Tobii, and CAA passenger surveys, but access in 24 hours is unchecked.
- Revolut's scale is reported inconsistently (see above).
- The edge decays once many startups use it.
- Does the demo agent contact vendors, or stop at the ranked list?

## Scope

One vertical, such as UK and European out-of-home or newsletters and podcasts, instead of all channels. Demo one startup end to end: product description, ranked channels, then a sent enquiry.

A natural first channel is a reproduction of the BER jet-bridge calculation from the source: rate card, production and installation, currency conversion and negotiated discount, down to cost per thousand attentive seconds against Meta. Showing the impression-versus-attention flip is the demo's strongest moment.

## Alternatives

- [Prediction-market mispricing](prediction-market-mispricing.md): a better fit for HRT and G-Research and easier to backtest, but finance-flavoured with no Bank of Scotland fit. This idea fits Wordsmith strongly, but its data is weaker; the prediction-market idea's Wordsmith fit hasn't been assessed.
- [Off-peak venue hire](off-peak-venue-hire.md): the same pattern of sellers pricing by habit, in venues and event space. It could share one mispricing engine with this idea.
