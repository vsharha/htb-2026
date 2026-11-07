# Audience heatmap

Status: chosen, 7 November 2026.

## Idea

A startup fills in the same short form as the [ad channel mispricing finder](ad-channel-mispricing.md): industry, the startup in one sentence, the target customer in one sentence, what a customer pays, monthly advertising budget, and markets. It gets back a heatmap of a city showing where its target customers live, work and pass through, where competitors already advertise to them, and the gap between the two. The run ends with specific placements to buy in the strongest gap areas. The demo city is New York.

It is for startups that want customers beyond Meta and Google but have no media agency and a limited budget.

## Origin

Raised by Viktor on 7 November 2026 as a pivot from the ad channel mispricing finder. That idea needed prices for advertising placements, which are mostly unpublished, while public data about where people live, work and travel is plentiful. The competition and gap layers, the competitor-campaign agent and the closing list of placements were suggested by an agent in the same conversation, and the user accepted them.

## How it works

Decided on 7 November 2026; the decisions are in [product.md](../product.md).

1. Input: the onboarding form above. The target customer sentence becomes weights on census and trip data, such as age, income, industry and household type. Jev, a decision model, scores how strongly the sentence implies each attribute.
2. Audience fit layer: each area of the city is scored by how many target customers live there, work there or pass through it.
3. Competition layer: a browser agent finds the startup's competitors, then searches press, trade sites and social media for their outdoor campaigns in the city, such as "<competitor> subway ad" or "<competitor> billboard NYC", and places each find on the map. Where it finds nothing, competitors' stores and offices stand in.
4. Gap layer: areas with high audience fit and low competition. This is the default view; the other two layers are toggles that explain it.
5. Placements: specific placements a startup can buy inside the strongest gap areas, such as LinkNYC kiosks and bus shelters, each with an estimated cost per audience member and a way to measure it (a QR code, promo code or landing page). Budget filters out placements with minimum spends.

An hourly view of the audience fit layer, using subway and taxi data by hour, is an open option, not a decision.

## Evidence and data

Checked on 7 November 2026 by querying each source's API or download index. "Checked" means we fetched the column list, a sample row and the row count or file list. "Fetched" means a source module in `tools/src/tools/sources/` downloads it and writes the processed output named. The New York open data portals (data.cityofnewyork.us and data.ny.gov) list no licence on these datasets.

Who lives where:

- US Census Bureau American Community Survey, 5-year estimates for 2024 (fetched): the `census` source writes `data/census/nyc_tracts.csv`, one row for each of New York City's 2,327 census tracts (an area of about 4,000 people). Columns: population, median age, median household income, per capita income, and the shares aged 20 to 34, with a bachelor's degree or higher (of those aged 25 and over), with household income of $150,000 or more, and enrolled in college. Median household income is missing for 128 tracts and is capped at $250,001 by the Census Bureau. The API needs a key, read from `CENSUS_API_KEY` in `tools/.env`.
- Census Bureau 2024 cartographic boundary file for New York State's tracts (fetched): the `tracts` source writes `data/tracts/nyc_tracts.geojson`, 2,324 tract shapes clipped to the shoreline. Three tracts in the Census table have no shape in this file.

Who works where:

- US Census Bureau [LODES](https://lehd.ces.census.gov/data/lodes/LODES8/ny/) (job counts by home and work location), version 8: files for New York State run to 2024. Workplace files count jobs per census block by earnings band and industry, and origin-destination files link home and work blocks. They show daytime audiences, such as finance workers in Midtown. Fetched: the `lodes` source sums the 2024 workplace file for all job types to tracts and writes `data/lodes/nyc_tract_jobs.csv`, 2,305 tracts and 4.84 million jobs. Columns: jobs, and the shares of jobs held by workers aged 29 or younger, paying more than $3,333 a month, and in each of eight sectors (information, finance and insurance, professional services, education, health care, retail, arts and recreation, and accommodation and food). A degree share is also kept, but LODES reports education only for workers aged 30 and over, so it is the share of those workers.

Who passes through:

- [MTA Subway Hourly Ridership: Beginning 2025](https://data.ny.gov/d/5wq4-mkjj) (checked): 47.4 million rows, updated 4 November 2026. Each row is one station complex, one hour and one fare class, with ridership, transfers, latitude and longitude. The fare class category, such as full fare or student, gives a rough audience signal. Earlier years are in separate datasets (2017 to 2019, and 2020 to 2024). Fetched: the `subway` source averages the four weeks from Monday 5 October to Sunday 1 November 2026, one day per query because longer queries time out, and writes `data/subway/stations.csv` (428 station complexes with weekly riders and the share on each fare class) and `data/subway/hourly.csv` (average riders per station, weekday and hour). The "Students" fare class covers school students' fare cards and "Fair Fare" is the city's discount for low-income riders.
- [Pickups and Drop-offs by Taxi Zone and Industry](https://data.cityofnewyork.us/d/c5iv-bn4s) (checked): monthly counts per taxi zone for yellow taxis, green taxis and high-volume ride-hail companies, with data to September 2026. [Taxi zone shapes](https://data.cityofnewyork.us/d/8meu-9t5y) are a separate dataset.
- TLC [trip record files](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page) (file list checked): monthly Parquet files to September 2026 for yellow taxis and high-volume ride-hail. Fares and tips per trip could serve as a rough income signal; the columns were not checked.
- [Citi Bike trip data](https://s3.amazonaws.com/tripdata/index.html) (file list checked): monthly files to October 2026, under Citi Bike's [data sharing policy](https://www.citibikenyc.com/data-sharing-policy), which was not read.
- [Bi-Annual Pedestrian Counts](https://data.cityofnewyork.us/d/cqsj-cfgu) (checked): only 114 locations, mostly retail corridors and bridges, counted in May and September or October for morning, midday and evening, from 2007 to May 2026. Too sparse for a citywide layer; useful to check the other layers at those points.

Where ads can be bought:

- [LinkNYC Kiosk Locations](https://data.cityofnewyork.us/d/s4kf-3yrf) (checked): 2,255 sites with address, coordinates and census tract. By kiosk type: 2,032 live Link1.0 kiosks, 151 live Link5G kiosks marked "Ad", 57 live Link5G kiosks marked "NonAd", and a few removed or payphones. Only the Link5G types say whether they carry ads; whether Link1.0 kiosks do is unchecked. Fetched with the bus shelters by the `placements` source, which keeps live kiosks only.
- [Bus Stop Shelters](https://data.cityofnewyork.us/d/t4f2-8md7) (checked): 3,312 shelters with coordinates and neighbourhood, updated 1 October 2026. The data has no field saying whether a shelter carries advertising. The `placements` source writes kiosks and shelters to `data/placements/nyc_placements.csv` (5,556 rows), with carries_ads set to yes, no or unknown.
- Joined per tract (fetched): `tools.analyze` writes `data/analysis/nyc_tracts.csv`, one row per tract with its Census columns, its LODES job columns, the subway station complexes within 1,300 feet (about a five-minute walk) and their weekly riders, and its counts of LinkNYC kiosks, kiosks marked as carrying ads, and bus shelters. The tract shapes, with only geoid and borough, go in `data/analysis/nyc_tracts.geojson` so the browser loads them once. 1,373 tracts have a station nearby and 125 contain a kiosk marked as carrying ads. The 21 columns that audience fit can weight also appear scaled from 0 to 1 as their percentile rank across the city. A tract missing a value gets 0.5. The 81 tracts with no residents get 0 on resident columns, and the 19 with no jobs get 0 on job columns; both keep their subway score. The same run writes `data/analysis/columns.json`, listing those 21 columns with a description of each and whether it measures where people live, work or pass through. It also writes `data/analysis/nyc_placements.csv`, the 5,556 kiosks and shelters each with its tract. Startup-specific scoring and the competitor campaigns are added in the web app, not in these files.
- [DOB Sign Application Filings](https://data.cityofnewyork.us/d/nyis-y4yr) (checked): 15,288 filings, but only from April 2013 to October 2017. It covers all signs, not only advertising, and gives an address and tax lot rather than coordinates. Not usable as a current billboard map.

Competitors:

- Competitors' outdoor campaigns: no public list exists, so the agent in step 3 gathers them from press, trade sites and social media.
- Competitors' stores and offices: OpenStreetMap or a places API. Not checked.

## Existing products

No search has been run yet. From memory: foot-traffic and audience-mapping products such as Placer.ai already map where audiences go, and AdQuick offers audience modelling for outdoor advertising. The audience heatmap differs by mapping one startup's customer from a one-sentence description, adding a layer of competitors' actual outdoor campaigns, and ending with placements to buy. Without the competition layer it would be close to products that already exist.

## Tracks it could serve

- G-Research: strong. The hidden things are where a startup's customers are and where competitors haven't reached them. They are found by combining public datasets with an agent's search for campaigns, and they tell the startup where to advertise, which covers the brief's three questions.
- HRT: moderate. Stronger with the hourly view, which would forecast when an area holds the most target customers and turn that into a buying decision.
- Wordsmith: moderate. The competitor-campaign agent is a multi-step browser workflow: find competitors, search several kinds of site, read the results and place each campaign. The rest of the product is data processing, not browser work.
- Bank of Scotland: weak. It serves startups, not consumers' cost of living.
- Metaview overall prize: a city heatmap is a strong visual demo.

## Challenges it could use

- Gemini API: the competitor-campaign agent, if it runs on a Gemini model.
- Tiger Data: hourly ridership and trip data are time series, which fits the hourly view if it is built.
- Vultr: hosting the data processing or the demo.

## Open problems

- Licences: the New York open data portals list none on the datasets checked, and Citi Bike's data sharing policy has not been read.
- Billboards have no current public map. The only sign dataset stops in 2017, so the placements step relies on LinkNYC kiosks and bus shelters, and on shelters only if we can find which ones carry advertising.
- The competitor-campaign agent may find few campaigns for small competitors, leaving the competition layer mostly made of stores and offices, which show where competitors are, not where they advertise.
- Turning a one-sentence target customer into weights on the tract columns with Jev is untested, and some customers, such as "developers at Series A startups", have no direct census field.
- Prices for LinkNYC kiosks and bus shelters are probably unpublished, so cost per audience member would be an estimate. How to estimate it is undecided.
- Judges in Edinburgh may ask why New York. The answer is that New York publishes the most data and the method works elsewhere, which the pitch should say up front.
- The mispricing claim of the earlier idea, and the Revolut evidence behind it, no longer support the product directly. The pitch needs its own evidence that competitors leave gaps in a city.

## Scope

New York only, with its data gathered ahead of time by scripts in `tools/`. Demo one startup end to end: the form, the gap map with the audience fit and competition layers as toggles, the competitor campaigns the agent found, and the placements to buy in the top gap areas. A recorded run of the competitor agent is kept as a fallback in case the live agent fails.

## Alternatives

- [Ad channel mispricing finder](ad-channel-mispricing.md): the idea this replaces. It ranked specific placements, last narrowed to airports, by cost per attentive second weighted by audience value, but most placement prices are unpublished. It shares the onboarding form and the aim of reaching customers competitors miss.
