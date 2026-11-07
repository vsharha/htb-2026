# Unclaimed: the money you never claimed

Status: proposed, 7 November 2026.

## Idea

A person describes their circumstances: where they live, who is in the household, their income, whether they rent, their age and any children. A browser agent then checks the entitlement rules that apply in Scotland and works out what they can claim. That covers council tax reduction from their own council's scheme, the Scottish Child Payment and the Best Start grants, the Scottish Welfare Fund, the Warm Home Discount, the water charges reduction scheme, and social tariffs for broadband and phone.

It returns two things. First, a total of what is going unclaimed, split into weekly and yearly. Second, the claim itself: the agent fills each application form with the details it already has, attaches the documents each one asks for, and stops before submitting so the person reviews the lot. It is for households on low or fixed incomes who do not know what exists, or who gave up on the forms.

## Origin

Raised by an AI agent on 7 November 2026, in a brainstorm at macmac's request. It came after the user ruled out career prizes and asked for ideas that fit the sponsor tracks better than the first ten. Its web facts are unchecked.

## Existing products

Not checked on the web yet.

- Benefit calculators are common: Turn2us, EntitledTo and Policy in Practice all estimate entitlements. The difference has to be the agentic end-to-end claim, not the estimate. That needs to be visible in the demo.

## Tracks it could serve

- Bank of Scotland: strong. This is the most direct fit of any idea so far. The brief is about everyday trade-offs between cost, time, convenience and sustainability, and this is money a household is already entitled to, with no trade-off except the effort of claiming. "Better" is defined by the household: more money, or the same money for less work.
- Wordsmith: strong. It is legal and administrative work, which Wordsmith prefers, and the workflow is longer than a read-only report: read circumstances, test them against a dozen rule sets, pick the schemes that apply, gather evidence, fill several unrelated forms with different fields, and stop before submit. Tokens, model and time should be shown, since Wordsmith also judges those.
- G-Research: strong. The hidden thing is money sitting unclaimed, found by cross-checking a household against eligibility rules that are scattered across councils and agencies, and it enables a claim worth hundreds or thousands a year. It answers the brief's three questions without needing a scrape of a site that may block us.
- HRT: weak. There is no market data and no real-time signal. At most, the entitlement rules could be modelled as a decision tree over a synthetic population, which is not what the track asks for.

## Challenges it could use

- Gemini API: reading council schemes and application forms, and driving the browser agent.
- Auth0: keeping a household's details and saved claims between sessions.
- Vultr: hosting the backend and the demo, separate from the browser runner.

## Open problems

Nobody has checked these on the web yet.

- The total unclaimed is reported in the billions of pounds a year, but the figure, its source and its date are unverified. Do not cite a number until it is checked.
- The rules are genuinely complex and differ by council: 32 councils run 32 council tax reduction schemes, and some schemes change yearly. A wrong answer here is harmful in a way a wrong rent estimate is not, so the product should show which rule produced each figure and link to the source.
- Existing benefit calculators already estimate entitlements, so the demo must make the end-to-end claim visible (see Existing products).
- Submitting a real benefit claim during a demo is not acceptable. The agent must stop before submit, and any live run must use a fictional persona or a teammate's consent.
- Forms are mixed: some online, some PDF, some posted. The agent can only fill what is online, so the demo should pick schemes with real web forms.
- Means-tested schemes need income and savings evidence that a stranger does not have. The demo needs a persona whose documents we can fabricate convincingly.
- Scottish and reserved benefits overlap: some schemes are devolved, some are DWP. Getting the boundary wrong would produce confident nonsense.

## Scope

Type one persona: a renter in Edinburgh, one child, part-time work. Live browser panes open the council's scheme, mygov.scot and two supplier social tariff pages. The result reads: "You can claim £4,120 a year across 5 schemes. 3 forms filled, 2 need a document you don't have yet." End on a filled form, one click from submit, and the rule that grants it.

## Alternatives

- [Flat Truth](flat-truth.md): the same three tracks, but its demo peak depends on finding a listing that maps to a landlord with a published decision. This one is deterministic.
- [Small Print Tax](small-print-tax.md): also money the household is losing, but by reading contracts rather than entitlement rules.
- [Room Radar](room-radar.md): also a form-filling agent that stops before submit, but for a much smaller problem.
