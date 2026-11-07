# Cheap Hours: the hidden half-hourly price of electricity

Status: proposed, 7 November 2026.

## Idea

Electricity has a real price every half hour, set by the wholesale market, and a carbon cost that changes too. Households on a flat tariff never see either. The app forecasts Octopus Agile prices and grid carbon intensity for the next few days. It tells you when to run the washing machine, charge an EV or heat the house, and whether a time-of-use tariff beats your fixed one. An optional browser agent reads your current supplier's terms and compares tariffs.

## Origin

Raised independently by two AI agents in a brainstorm on 7 November 2026, at macmac's request, as "Switch or Stay" and "Cheap Hours". It was not debated on its own, but its data was checked under [Overpaid](overpaid.md). Ranked ninth in [idea-ranking.md](../idea-ranking.md).

## Tracks it could serve

- HRT: strong. It combines live market data with alternative data (weather, carbon, generation mix), a forecast and an automated decision, which is close to HRT's slide.
- Bank of Scotland: strong. Cost, convenience and sustainability are the trade-offs, for example "shift laundry 3 hours, save 41p and 0.6 kg of CO2".
- G-Research: moderate. The hidden price, shown as a heatmap of half-hours.
- Wordsmith: weak. The tariff comparison is a thin browser workflow with little legal content.

## Challenges it could use

- Tiger Data: half-hourly price and carbon time series.
- Gemini API: explaining recommendations.

## Open problems

These come from agents' web checks on 7 November 2026.

- Confirmed with live calls: the Octopus API (Agile rates for South Scotland since October 2024, and postcode to region) and the carbon intensity API (regional, with 48-hour forecasts) are open and need no key.
- Octopus publishes the next day's prices at about 4pm, so a forecast only adds value beyond that. Community forecasters already exist, so the value is in the decisions, not the model.
- Energy apps are common at hackathons.
- Supplier sites block bots, which hurts the tariff comparison.

## Scope

A live forecast curve plotted against Agile prices. Then: "Your dishwasher cost 31p tonight; at 3am it would have cost 4p." End on a weekly schedule showing yearly savings in pounds and CO2.

## Alternatives

- [Overpaid](overpaid.md): uses this as its energy part, inside a wider bill-checking product.
- [Fine Print](fine-print.md): a stronger HRT fit, in a less crowded space.
