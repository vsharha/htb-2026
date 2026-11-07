# Audience heatmap

Status: chosen, 7 November 2026.

## Idea

A startup fills in the same short form as the [ad channel mispricing finder](ad-channel-mispricing.md): industry, the startup in one sentence, the target customer in one sentence, what a customer pays, monthly advertising budget, and markets. It gets back a heatmap of a city showing where its target customers live, work and pass through, where competitors already advertise to them, and the gap between the two. The run ends with specific placements to buy in the strongest gap areas. The demo city is New York.

It is for startups that want customers beyond Meta and Google but have no media agency and a limited budget.

## Origin

Raised by Viktor on 7 November 2026 as a pivot from the ad channel mispricing finder. That idea needed prices for advertising placements, which are mostly unpublished, while public data about where people live, work and travel is plentiful. The competition and gap layers, the competitor-campaign agent and the closing list of placements were suggested by an agent in the same conversation, and the user accepted them.

## How it works

Decided on 7 November 2026; the decisions are in [product.md](../product.md).

1. Input: the onboarding form above. The target customer sentence becomes filters on census and trip data, such as age, income, industry and household type.
2. Audience fit layer: each area of the city is scored by how many target customers live there, work there or pass through it.
3. Competition layer: a browser agent finds the startup's competitors, then searches press, trade sites and social media for their outdoor campaigns in the city, such as "<competitor> subway ad" or "<competitor> billboard NYC", and places each find on the map. Where it finds nothing, competitors' stores and offices stand in.
4. Gap layer: areas with high audience fit and low competition. This is the default view; the other two layers are toggles that explain it.
5. Placements: specific placements a startup can buy inside the strongest gap areas, such as LinkNYC kiosks and bus shelters, each with an estimated cost per audience member and a way to measure it (a QR code, promo code or landing page). Budget filters out placements with minimum spends.

An hourly view of the audience fit layer, using subway and taxi data by hour, is an open option, not a decision.

## Evidence and data

None of these sources has been opened or checked. They come from memory on 7 November 2026, so access, coverage, formats and terms are unconfirmed.

Who lives where:

- US Census Bureau American Community Survey: income, age, education and household type per census tract (an area of about 4,000 people), through a free API.

Who works where:

- US Census Bureau LODES (job counts by home and work location): jobs per census block by earnings band and industry. It shows daytime audiences, such as finance workers in Midtown.

Who passes through:

- MTA subway ridership by station and hour, on the New York open data portal.
- Taxi and ride-hail trip records from the city's Taxi and Limousine Commission: pickups and drop-offs by taxi zone, with fares and tips that could serve as a rough income signal.
- Citi Bike trip data.
- Pedestrian counts from the city's Department of Transportation.

Where ads can be bought:

- Locations of LinkNYC kiosks and bus shelters, both of which carry advertising, on the New York open data portal.
- Billboard locations, possibly in the Department of Buildings' sign permits.

Competitors:

- Competitors' outdoor campaigns: no public list exists, so the agent in step 3 gathers them from press, trade sites and social media.
- Competitors' stores and offices: OpenStreetMap or a places API.

## Existing products

No search has been run yet. From memory: foot-traffic and audience-mapping products such as Placer.ai already map where audiences go, and AdQuick offers audience modelling for outdoor advertising. The audience heatmap differs by mapping one startup's customer from a one-sentence description, adding a layer of competitors' actual outdoor campaigns, and ending with placements to buy. Without the competition layer it would be close to products that already exist.

## Tracks it could serve

- G-Research: strong. The hidden things are where a startup's customers are and where competitors haven't reached them. They are found by combining public datasets with an agent's search for campaigns, and they tell the startup where to advertise, which covers the brief's three questions.
- HRT: moderate. Stronger with the hourly view, which would forecast when an area holds the most target customers and turn that into a buying decision.
- Wordsmith: moderate. The competitor-campaign agent is a multi-step browser workflow: find competitors, search several kinds of site, read the results and place each campaign. The rest of the product is data processing, not browser work.
- Bank of Scotland: weak. It serves startups, not consumers' cost of living.
- Metaview overall prize: a city heatmap is a strong visual demo.

## Challenges it could use

- Gemini API: the competitor-campaign agent and turning the target customer sentence into data filters.
- Tiger Data: hourly ridership and trip data are time series, which fits the hourly view if it is built.
- Vultr: hosting the data processing or the demo.

## Open problems

- Every dataset in Evidence and data is unchecked: access, size, licence and whether it covers what is claimed.
- The competitor-campaign agent may find few campaigns for small competitors, leaving the competition layer mostly made of stores and offices, which show where competitors are, not where they advertise.
- Turning a one-sentence target customer into census and trip filters is untested, and some customers, such as "developers at Series A startups", have no direct census field.
- Prices for LinkNYC kiosks and bus shelters are probably unpublished, so cost per audience member would be an estimate. How to estimate it is undecided.
- Judges in Edinburgh may ask why New York. The answer is that New York publishes the most data and the method works elsewhere, which the pitch should say up front.
- The mispricing claim of the earlier idea, and the Revolut evidence behind it, no longer support the product directly. The pitch needs its own evidence that competitors leave gaps in a city.

## Scope

New York only, with its data gathered ahead of time by scripts in `tools/`. Demo one startup end to end: the form, the gap map with the audience fit and competition layers as toggles, the competitor campaigns the agent found, and the placements to buy in the top gap areas. A recorded run of the competitor agent is kept as a fallback in case the live agent fails.

## Alternatives

- [Ad channel mispricing finder](ad-channel-mispricing.md): the idea this replaces. It ranked specific placements, last narrowed to airports, by cost per attentive second weighted by audience value, but most placement prices are unpublished. It shares the onboarding form and the aim of reaching customers competitors miss.
