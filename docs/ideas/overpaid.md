# Overpaid: household overpayments and the law behind each one

Status: proposed, 7 November 2026.

## Idea

A household uploads its bills. The app finds each recurring charge where it pays more than it should, names the rule that backs a complaint, and drafts a letter citing it. For broadband and mobile, that's Ofcom's rule that price rises in new contracts must be stated in pounds and pence. For insurance, it's the FCA's 2022 ban on charging renewing customers more than new ones. For rent, it's illegal fees under the Rent (Scotland) Act 1984. For energy, it uses Octopus Agile half-hourly prices and grid carbon intensity to say when to run appliances, and whether Agile beats a fixed tariff.

## Origin

Raised by an AI agent as "Loyalty Tax" in a brainstorm on 7 November 2026, at macmac's request. The agent was extending the team's mispricing ideas to the household side. In the debate round its advocate merged it with the renting idea that became [Flat Truth](flat-truth.md). A judge agent ranked it fifth and found it weaker than Flat Truth on every track they share (see [idea-ranking.md](../idea-ranking.md)).

## Evidence and data

- Confirmed in agents' web checks on 7 November 2026: the Octopus and carbon intensity APIs are open and need no key.

## Tracks it could serve

- Bank of Scotland: strong. It covers cost, time, convenience and sustainability.
- Wordsmith: moderate. It reads contract terms and cites rules, but the browser part is thin.
- G-Research: moderate. The hidden thing is the loyalty penalty.
- HRT: weak to moderate. It forecasts energy prices, but Octopus already publishes the next day's prices at about 4pm.

## Challenges it could use

- Tiger Data: energy price time series.
- Gemini API: reading bills and contract terms.
- Auth0: user accounts.

## Open problems

These come from agents' web checks on 7 November 2026.

- The overpayments are small. Ofcom puts the broadband loyalty penalty at about £108 a year, and the energy gap is small under the price cap. A headline like "£1,240 a year" would overclaim.
- Comparison sites block bots and ban scraping. Getting round that is a bad look for a legal sponsor.
- Uploading bank statements raises privacy and parsing problems, so a demo would need fake data.
- Bill-saving apps are common at hackathons.

## Scope

Upload sample bills, see a waterfall chart of overpayments, then read the drafted letters, each citing its rule.

## Alternatives

- [Flat Truth](flat-truth.md): one sharp story where this has five thin rows.
- [Small Print Tax](small-print-tax.md) and [Cheap Hours](cheap-hours.md): narrower versions of parts of this idea.
