# Delay compensation: file the claim you are owed

Status: proposed, 7 November 2026.

## Idea

A person enters a journey they have taken, or forwards the ticket email. An agent works out whether the train or flight was late enough to qualify, which scheme applies, and how much is owed. For rail that means the operator's Delay Repay threshold, which varies by operator. For flights it means UK261, where the distance and delay decide the band.

It then files the claim: it finds the right operator's form, fills it with the booking reference and journey details, attaches the ticket, and stops before submit. It also watches upcoming journeys and warns when a claim has just become possible, because most people never check.

## Origin

Raised by an AI agent on 7 November 2026, in a brainstorm at macmac's request, after the user ruled out career prizes and asked for ideas that fit the sponsor tracks better than the first ten. Its web facts are unchecked.

## Tracks it could serve

- Bank of Scotland: strong. It is money recovered from an everyday cost, with the only trade-off being the time it takes to claim. The brief's cost-and-time framing fits directly.
- G-Research: strong. The hidden thing is that a delay already incurred has become a claim worth money. It is found by matching real running data against each operator's threshold, and it enables a payout nobody bothers to collect.
- Wordsmith: moderate. It is rules-based administrative work across several operator sites and forms, which is close to legal work, but the number of sites is smaller than the rent or benefits ideas, so the workflow is less complex.
- HRT: moderate. Live train running data plus weather and incidents can predict which journeys will qualify, and the claim is an automated decision. It is not market data, and the scale is small.

## Challenges it could use

- Gemini API: reading operator rules and filling forms.
- Tiger Data: delay and running-history time series.
- Auth0: saving journeys and claim status.

## Open problems

Nobody has checked these on the web yet.

- The market is crowded. AirHelp and similar firms already take flight claims on commission, and most train operators have their own Delay Repay portal. The difference has to be the agent that does it end to end and proactively, not the entitlement calculation.
- Filing a claim needs a real booking reference and a real ticket. The demo must use a journey one of us actually took, with consent, or a fabricated one that is clearly labelled.
- Submitting false claims is fraud. The agent must stop before submit and never generate a claim for a journey that did not happen.
- Operator portals may block automated browsers, and several require an account.
- Rail thresholds and schemes differ by operator and change. UK261 has exemptions, such as extraordinary circumstances, that a simple rule check will get wrong.
- Whether the live running data is open in 24 hours is unverified; National Rail's feeds need a key.

## Scope

Enter a real delayed journey, such as Edinburgh to London. Live panes open the operator's Delay Repay page and its rules. The result reads: "68 minutes late, qualifies, £54.20 owed." The form is filled and one click from submit. Then a second pane shows an upcoming journey flagged as "claim window opens if this is 15 minutes late". End on the total recovered across a month of commutes.

## Alternatives

- [Unclaimed](unclaimed-money.md): the same "money you are owed" story, but for benefits and social tariffs, with a larger and more varied workflow.
- [Small Print Tax](small-print-tax.md): also recovers household money, but from contracts rather than delays.
- [Fine Print](fine-print.md): a better HRT fit and stronger data, but no Bank of Scotland angle.
