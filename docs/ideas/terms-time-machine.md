# Terms Time Machine: how your terms changed, and how hard it is to leave

Status: proposed, 7 November 2026.

## Idea

Pick a gym, streaming service or app you use. The agent pulls every archived version of its terms of service from the Wayback Machine and shows clause by clause how they changed on a timeline, such as "arbitration added 2019, AI-training rights 2024". It then tries the cancel flow live and scores how hard leaving is made: screens, guilt-trip messages and hidden links. It finishes by weighing the cost of staying against the hassle of leaving, and drafts a cancellation letter. It is for anyone stuck in subscriptions.

## Origin

Raised by an AI agent whose angle was the most impressive demo, in a brainstorm on 7 November 2026, at macmac's request. It was not carried into the debate round, so its facts are unchecked. Ranked seventh in [idea-ranking.md](../idea-ranking.md), from the first-round assessment only.

## Tracks it could serve

- G-Research: strong. Hidden changes to terms people agreed to become a timeline worth screenshotting.
- Wordsmith: strong. It reads legal documents across versions and runs a multi-step agent through cancel flows.
- Bank of Scotland: moderate. Money lost to subscriptions people meant to cancel.
- HRT: weak.

## Challenges it could use

- Gemini API: comparing versions of the terms and driving the cancel flows.

## Open problems

- The Wayback Machine's archive index (CDX API) and the ToS;DR API exist, but nobody has checked them for this use.
- The live cancel flows need test accounts.
- The archive may be missing versions of the terms.
- The UK's new subscription rules haven't been checked, including when they start, so they shouldn't be cited yet.
- The HRT fit is thin.

## Scope

Pick a service. A timeline animates through its archived terms, with marks where users lost rights. The agent walks through the real cancel flow and counts the screens. End on a league table of the services that are hardest to cancel.

## Alternatives

- [Flat Truth](flat-truth.md): stronger on Bank of Scotland, and its data was fact-checked.
- [Small Print Tax](small-print-tax.md): also reads contracts, but for hidden cost rather than lost rights.
