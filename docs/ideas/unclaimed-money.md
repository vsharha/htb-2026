# Unclaimed: the money you never claimed

Status: proposed, 7 November 2026.

## Idea

A person describes their circumstances: where they live, who is in the household, their income, whether they rent, their age and any children. A browser agent then checks the entitlement rules that apply across the UK and works out what they can claim. That covers council tax reduction from their own council's scheme in England, Scotland or Wales, rate relief in Northern Ireland, the devolved Scottish benefits such as the Scottish Child Payment and the Best Start grants, the Scottish Welfare Fund, the Warm Home Discount, water charges reduction, and social tariffs for broadband and phone.

It returns two things. First, a total of what is going unclaimed, split into weekly and yearly. Second, the claim itself: the agent fills each application form with the details it already has, attaches the documents each one asks for, and stops before submitting so the person reviews the lot. It is for households on low or fixed incomes who do not know what exists, or who gave up on the forms.

## Origin

Raised by an AI agent on 7 November 2026, in a brainstorm at macmac's request. It came after the user ruled out career prizes and asked for ideas that fit the sponsor tracks better than the first ten. The market was checked on 7 November 2026; the other facts are unchecked.

## Existing products

- **Inbest** (Edinburgh, founded 2016) is the closest company. It sells a white-label benefits calculator as an API and an embeddable widget, and it runs inside the **Lloyds, Halifax and Bank of Scotland** apps. In May 2025 the Money and Pensions Service contracted it to power the government's MoneyHelper benefits checker. Its case-management system is a tool for welfare and debt advisers, not an agent that files claims. ([Inbest](https://inbest.ai/), [PublicTechnology](https://www.publictechnology.net/2025/05/13/society-and-welfare/dwp-body-to-deploy-white-label-commercial-tool-for-government-online-benefits-calculator/))
- **Turn2us**, **EntitledTo**, **Policy in Practice**, **MoneyHelper**, gov.scot and Citizens Advice all give the discovery step away free. The estimate is a commodity.
- **IncomeMax** is a UK social enterprise that does the claiming step with people: advisers complete forms, make advocacy calls and challenge decisions, and it is partnered with EDF Energy. The same job, delivered as human labour. ([IncomeMax](https://www.incomemax.org.uk/))
- Hackathon versions of the discovery step exist: **Benefits-Finder** (DevFest Columbia 2026), **MyAutoBenefits**, **MamaPal**, and the COVID-19 California Benefits Finder. ([Benefits-Finder](https://devfest-2026.devpost.com/project-gallery?page=2))

What is not a product: one agent that takes a household's details, tests them against several unrelated schemes, and completes each application form itself. No UK company found doing that. The nearest precedent is **DoNotPay** in the US, which promised an AI that filled forms and disputed charges; the FTC fined it $193,000 in 2024, finalised in February 2025, for claiming untested capabilities and barred it from presenting itself as a lawyer substitute. ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/02/ftc-finalizes-order-donotpay-prohibits-deceptive-ai-lawyer-claims-imposes-monetary-relief-requires))

So the idea is not new at either end, but the middle is unbuilt. The pitch has to be "the calculator exists, the claim does not get filed", and the demo has to show forms being completed, because that is the only part a Bank of Scotland judge cannot already find in the sponsor's own app.

## Data sources

The rules come from four tiers, each with a different reliability and access method.

- **National law and guidance.** GOV.UK's Content and Search APIs return published pages as JSON without a key, and legislation.gov.uk has an API for the statutes and regulations behind them. Social Security Scotland and mygov.scot publish the devolved benefits, and nidirect publishes the Northern Ireland equivalents.
- **Local schemes.** About 350 councils run their own council tax reduction scheme: 296 billing authorities in England, 32 in Scotland and 22 in Wales. Each publishes a scheme document and its own application form. Local welfare assistance schemes are separate again and vary by council. Northern Ireland has no council tax; help with rates is Rate Relief and Rate Rebate, run by Land & Property Services and applied for through nidirect.
- **Supplier schemes.** Ofcom publishes the list of broadband and phone social tariffs with prices and coverage. Water companies publish their own reduction schemes, and the Warm Home Discount is administered through energy suppliers.
- **Eligibility engines.** EntitledTo, Inbest and Policy in Practice sell APIs that already encode Universal Credit and the legacy means-tested benefits, including the earnings taper, childcare and housing elements. Inbest is the awkward one, because it is the product already inside the Bank of Scotland app.

How the data is used:

- A rules store holds one entry per scheme: jurisdiction, eligibility conditions, award formula, evidence needed, application URL, source URL and effective date. Every entry carries a quotation from the source, so the product can show why a figure is owed.
- An ingestion job fetches the official pages and has a model extract them into that schema. A deterministic evaluator computes eligibility and amounts. The model never does arithmetic and never invents a threshold.
- A re-fetch job diffs the pages and flags changes, because rates change each April and council schemes change annually.
- A postcode router picks the nation, then the council, then the schemes. The four nations do not share a system: Scotland has devolved benefits that England and Wales do not, and Northern Ireland uses rates relief.
- The claim layer is one adapter per portal, because the fields, login and evidence upload differ. Identity is the wall: most portals need a Government Gateway, MyScotGov or council account, and the claimant signs a declaration. The agent can fill and stop; it cannot create a verified account or sign.

The honest scope: the rules layer can cover all four nations, but the form layer cannot cover 350 councils in a weekend. The buildable version is all-UK rules with depth in Scotland, where the sponsor and the devolved benefits are, and a small number of real form adapters.

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

These are unchecked, apart from the market check above.

- The total unclaimed is reported in the billions of pounds a year, but the figure, its source and its date are unverified. Do not cite a number until it is checked.
- The rules are genuinely complex and differ by council: about 350 councils run their own council tax reduction scheme, and the schemes change yearly. A wrong answer here is harmful in a way a wrong rent estimate is not, so the product should show which rule produced each figure and link to the source.
- Universal Credit is a means test with an earnings taper, childcare and housing elements. Rebuilding it is not a 24-hour job, and an LLM doing the arithmetic will be wrong. Use an eligibility engine, or hand-code a small set of schemes for the demo.
- Differentiation is the main risk. See Existing products: the Bank of Scotland app already contains Inbest's calculator, so the demo must show the forms being filled, not the estimate.
- Identity is the wall. Most portals need a Government Gateway, MyScotGov or council account, and the claimant signs a declaration. The agent can prepare and fill, but it cannot create a verified account or sign, so it must stop before submit.
- Income, health and disability data is special category data under UK GDPR. The product needs explicit consent, encryption and a retention limit, and the demo must use a synthetic persona.
- Submitting a real benefit claim during a demo is not acceptable. The agent must stop before submit, and any live run must use a fictional persona or a teammate's consent.
- Forms are mixed: some online, some PDF, some posted. The agent can only fill what is online, so the demo should pick schemes with real web forms.
- Means-tested schemes need income and savings evidence that a stranger does not have. The demo needs a persona whose documents we can fabricate convincingly.
- Devolved and reserved benefits overlap, and the four nations differ: some schemes are Scottish, some are DWP, and Northern Ireland uses rates relief. Getting the boundary wrong would produce confident nonsense.

## Scope

The rules cover all four nations, but the demo files in Scotland, where the sponsor and the devolved benefits are. Type one persona: a renter in Edinburgh, one child, part-time work. Live browser panes open the council's scheme, mygov.scot, a Social Security Scotland benefit and two supplier social tariff pages. The result reads: "You can claim £4,120 a year across 5 schemes. 3 forms filled, 2 need a document you don't have yet." End on a filled form, one click from submit, and the rule that grants it.

## Alternatives

- [Flat Truth](flat-truth.md): the same three tracks, and this one has a deterministic demo, but Flat Truth is not already in a sponsor's app. See Existing products.
- [Small Print Tax](small-print-tax.md): also money the household is losing, but by reading contracts rather than entitlement rules.
- [Room Radar](room-radar.md): also a form-filling agent that stops before submit, but for a much smaller problem.
